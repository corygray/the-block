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
// lots start close together, which are days apart) while re-anchoring the earliest one to
// just under an hour from whenever the app loads.
export function getScheduleOffsetMs(vehicles: Vehicle[]): number {
  const earliest = Math.min(...vehicles.map(parseAuctionStart));
  return Date.now() - earliest + 45 * 60 * 1000;
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
