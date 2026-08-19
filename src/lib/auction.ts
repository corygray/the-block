import type { Vehicle } from "../types/vehicle";

// The dataset has no auction-end timestamp, only `auction_start` — timed auctions need a
// duration to know when they close. 24h is a documented assumption, not derived from the
// data; called out in SUBMISSION.md as well.
const AUCTION_DURATION_MS = 24 * 60 * 60 * 1000;

// `auction_start` strings have no timezone offset (e.g. "2026-04-05T19:00:00"), so
// `new Date(...)` parses them as local time in every evergreen browser — which is what we
// want, no separate parsing needed.
function parseAuctionStart(vehicle: Vehicle): number {
  return new Date(vehicle.auction_start).getTime();
}

// The dataset's timestamps were generated once, months before "today," so read literally
// every auction would already be over. The README calls this out directly: normalize
// against "now" rather than trusting the raw values. This shifts every auction_start by
// the same fixed offset — preserving the relative spacing the generator authored (which
// lots start close together, which are days apart).
//
// The offset anchors "now" 22 hours AFTER the earliest auction's original start, not
// before it — so the earliest lot is already live with about 2 hours left (an early
// version anchored before everything, which meant nothing was ever live until 45+
// minutes of real wall-clock time had passed). Every vehicle whose original start falls
// within that same 22-hour window ends up live too, spread across the full urgency
// range (about to end, ending soon, just started) rather than clustered at one tier —
// roughly the first ~15% of the dataset by schedule position, comfortably enough to see
// the live indicator without the majority of the catalog suddenly reading as live.
const EARLIEST_STARTED_AGO_MS = 22 * 60 * 60 * 1000;

export function getScheduleOffsetMs(vehicles: Vehicle[]): number {
  const earliest = Math.min(...vehicles.map(parseAuctionStart));
  return Date.now() - earliest - EARLIEST_STARTED_AGO_MS;
}

export type AuctionStatus = "upcoming" | "live" | "ended";

export interface AuctionTiming {
  status: AuctionStatus;
  // Milliseconds until the auction starts (upcoming) or ends (live); 0 once ended.
  msUntil: number;
}

export function getAuctionTiming(
  vehicle: Vehicle,
  offsetMs: number,
  now: number = Date.now(),
): AuctionTiming {
  const start = parseAuctionStart(vehicle) + offsetMs;
  const end = start + AUCTION_DURATION_MS;

  if (now < start) return { status: "upcoming", msUntil: start - now };
  if (now < end) return { status: "live", msUntil: end - now };
  return { status: "ended", msUntil: 0 };
}

// "Ends in 4h", "Starts in 1d 2h" — same phrasing as the mockup, now driven by a real
// computed duration instead of hand-authored flavor text.
export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

export function formatAuctionTiming(timing: AuctionTiming): string {
  if (timing.status === "ended") return "Ended";
  const duration = formatDuration(timing.msUntil);
  return timing.status === "live" ? `Ends in ${duration}` : `Starts in ${duration}`;
}

// The dataset's `current_bid`/`bid_count` were generated independently of `auction_start`
// — checked directly against data/vehicles.json, and vehicles scheduled at the very end
// of the 6.5-day spread already have bid activity, same as ones at the very start. So an
// auction our own computed timing marks "upcoming" can still carry bid data in the raw
// file, which reads as a real inconsistency once rendered ("Starts in 29m" next to
// "12 bids"). This derives what a vehicle should actually display given its live computed
// status, without mutating the underlying dataset — an auction that hasn't started yet
// has no bids yet, full stop.
export function withEffectiveBidState(vehicle: Vehicle, timing: AuctionTiming): Vehicle {
  if (timing.status !== "upcoming") return vehicle;
  if (vehicle.current_bid == null && vehicle.bid_count === 0) return vehicle;
  return { ...vehicle, current_bid: null, bid_count: 0 };
}

export type UrgencyTier = "urgent" | "soon" | "normal" | "upcoming";

// Amber is reserved strictly for "live and counting down" — a scheduled-but-not-started
// auction isn't urgent, so it (and an ended one, which can't happen at load time but is
// handled the same way defensively) gets the neutral "upcoming" tier instead of an amber
// one. "Ending Soon" gets an explicit filled badge on top of the color change, layered on
// by the caller, not signaled by color alone.
export function urgencyTier(timing: AuctionTiming): UrgencyTier {
  if (timing.status !== "live") return "upcoming";
  const hoursUntil = timing.msUntil / (60 * 60 * 1000);
  if (hoursUntil <= 1) return "urgent";
  if (hoursUntil <= 6) return "soon";
  return "normal";
}

export type StatusDot = "live" | null;

// A compact, glanceable signal for "this is happening right now," separate from the
// amber urgency-to-end text. Deliberately just live-or-not: an earlier version also
// marked auctions starting soon, but that reused a yellow close enough to the existing
// --amber (urgency) hue to risk blurring two different meanings — "act now" vs. "notice
// this later" — right where the dot's whole job is to make that distinction faster to
// scan. Always paired with the timing text next to it, never the only signal for the
// state (see formatAuctionTiming).
export function auctionStatusDot(timing: AuctionTiming): StatusDot {
  return timing.status === "live" ? "live" : null;
}

// Ending-soonest-first: live auctions sort by time-until-end (ascending); upcoming ones
// come after every live one (they aren't "ending soon" if they haven't started) and sort
// among themselves by time-until-start; ended auctions sort last of all.
export function compareByEndingSoonest(
  a: Vehicle,
  b: Vehicle,
  offsetMs: number,
  now: number = Date.now(),
): number {
  const rank: Record<AuctionStatus, number> = { live: 0, upcoming: 1, ended: 2 };
  const timingA = getAuctionTiming(a, offsetMs, now);
  const timingB = getAuctionTiming(b, offsetMs, now);
  if (timingA.status !== timingB.status) return rank[timingA.status] - rank[timingB.status];
  return timingA.msUntil - timingB.msUntil;
}
