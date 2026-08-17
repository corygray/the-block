import raw from "../../data/vehicles.json";
import type { Vehicle } from "../types/vehicle";

// `as Vehicle[]` is an assertion, not a runtime check — TypeScript trusts that the JSON
// matches the Vehicle shape rather than verifying it. Safe here since we control both the
// generator script and the type definition, and they're already known to match.
export const vehicles = raw as Vehicle[];
