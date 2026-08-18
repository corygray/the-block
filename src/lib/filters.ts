import type { TitleStatus, Vehicle } from "../types/vehicle";
import { effectivePrice } from "./format";

export const ALL_MAKES = "All Makes";
export const ALL_BODY_STYLES = "All Types";

export interface Filters {
  search: string;
  make: string;
  bodyStyle: string;
  minPrice: number | null;
  maxPrice: number | null;
  titleStatuses: Set<TitleStatus>;
}

// All three checked by default — show the full inventory. The design mockup had only
// "Clean" pre-checked, but that was just a static visual, never a considered default; a
// buyer browsing for the first time should see everything unless they narrow it down.
export function defaultFilters(): Filters {
  return {
    search: "",
    make: ALL_MAKES,
    bodyStyle: ALL_BODY_STYLES,
    minPrice: null,
    maxPrice: null,
    titleStatuses: new Set(["clean", "rebuilt", "salvage"]),
  };
}

export function matchesFilters(vehicle: Vehicle, filters: Filters): boolean {
  if (!filters.titleStatuses.has(vehicle.title_status)) return false;
  if (filters.make !== ALL_MAKES && vehicle.make !== filters.make) return false;
  if (filters.bodyStyle !== ALL_BODY_STYLES && vehicle.body_style !== filters.bodyStyle) return false;

  const price = effectivePrice(vehicle);
  if (filters.minPrice != null && price < filters.minPrice) return false;
  if (filters.maxPrice != null && price > filters.maxPrice) return false;

  const query = filters.search.trim().toLowerCase();
  if (query) {
    // Matches the search placeholder's own promise: "Search make, model, VIN, lot #".
    const haystack = `${vehicle.make} ${vehicle.model} ${vehicle.trim} ${vehicle.vin} ${vehicle.lot}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  return true;
}
