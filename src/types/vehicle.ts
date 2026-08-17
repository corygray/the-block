// Matches the shape of data/vehicles.json exactly (see scripts/generate_vehicles.mjs for
// how it was generated). Union types below reflect every value the generator actually
// produces, not a guess at what's "reasonable."

export type BodyStyle = "sedan" | "SUV" | "truck" | "coupe" | "hatchback";
export type Transmission = "automatic" | "manual" | "CVT" | "single-speed";
export type Drivetrain = "AWD" | "RWD" | "FWD" | "4WD";
export type FuelType = "gasoline" | "hybrid" | "electric" | "diesel";
export type TitleStatus = "clean" | "salvage" | "rebuilt";

export interface Vehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  body_style: BodyStyle;
  exterior_color: string;
  interior_color: string;
  engine: string;
  transmission: Transmission;
  drivetrain: Drivetrain;
  odometer_km: number;
  fuel_type: FuelType;
  condition_grade: number;
  condition_report: string;
  damage_notes: string[];
  title_status: TitleStatus;
  province: string;
  city: string;
  // Synthetic scheduling data, not tied to today's date — see README.md's note on
  // normalizing these against "now" rather than treating them as literal timestamps.
  auction_start: string;
  starting_bid: number;
  reserve_price: number | null;
  buy_now_price: number | null;
  images: string[];
  selling_dealership: string;
  lot: string;
  current_bid: number | null;
  bid_count: number;
}
