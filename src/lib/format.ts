import type { TitleStatus, Vehicle } from "../types/vehicle";

export type Tone = "good" | "warn" | "bad" | "neutral";

export interface Badge {
  label: string;
  tone: Tone;
}

export function formatMoney(amount: number | null): string {
  return amount == null ? "—" : `$${amount.toLocaleString("en-CA")}`;
}

// What a vehicle is "worth right now" for filtering/sorting purposes — the current bid
// if there is one, otherwise the starting bid.
export function effectivePrice(vehicle: Vehicle): number {
  return vehicle.current_bid ?? vehicle.starting_bid;
}

export function formatKm(km: number): string {
  return `${km.toLocaleString("en-CA")} km`;
}

export function conditionTier(grade: number): Badge {
  if (grade >= 4.0) return { label: "Excellent", tone: "good" };
  if (grade >= 3.0) return { label: "Good", tone: "good" };
  if (grade >= 2.0) return { label: "Fair", tone: "warn" };
  return { label: "Poor", tone: "bad" };
}

const titleStatusLabel: Record<TitleStatus, string> = {
  clean: "Clean Title",
  rebuilt: "Rebuilt Title",
  salvage: "Salvage Title",
};
const titleStatusTone: Record<TitleStatus, Tone> = {
  clean: "good",
  rebuilt: "warn",
  salvage: "bad",
};

export function titleMeta(status: TitleStatus): Badge {
  return { label: titleStatusLabel[status], tone: titleStatusTone[status] };
}

export function reserveMeta(vehicle: Vehicle): Badge {
  if (vehicle.reserve_price == null) return { label: "No Reserve", tone: "neutral" };
  if (vehicle.current_bid != null && vehicle.current_bid >= vehicle.reserve_price) {
    return { label: "Reserve Met", tone: "good" };
  }
  return { label: "Reserve Not Met", tone: "neutral" };
}

// Minimum a buyer can bid next — $500 above the current bid, or the starting bid if
// nobody has bid yet. Matches roundToNearest500 in scripts/generate_vehicles.mjs.
export function nextMinBid(vehicle: Vehicle): number {
  return (vehicle.current_bid ?? vehicle.starting_bid) + 500;
}
