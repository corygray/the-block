import type { Vehicle } from "../types/vehicle";
import { effectivePrice } from "./format";
import { compareByEndingSoonest } from "./auction";

export type SortOption = "ending-soonest" | "price-low-high" | "price-high-low" | "newest-year";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "ending-soonest", label: "Ending Soonest" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "newest-year", label: "Newest Year" },
];

export function compareVehicles(
  a: Vehicle,
  b: Vehicle,
  sortBy: SortOption,
  offsetMs: number,
): number {
  switch (sortBy) {
    case "price-low-high":
      return effectivePrice(a) - effectivePrice(b);
    case "price-high-low":
      return effectivePrice(b) - effectivePrice(a);
    case "newest-year":
      return b.year - a.year;
    case "ending-soonest":
      return compareByEndingSoonest(a, b, offsetMs);
  }
}
