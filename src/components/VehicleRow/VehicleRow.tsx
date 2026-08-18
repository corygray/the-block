import type { Vehicle } from "../../types/vehicle";
import { conditionTier, formatKm, formatMoney, reserveMeta, titleMeta } from "../../lib/format";
import { Pill } from "../Pill/Pill";
import { PhotoThumb } from "../PhotoThumb/PhotoThumb";
import { VehicleDetail } from "../VehicleDetail/VehicleDetail";
import styles from "./VehicleRow.module.css";

interface Props {
  vehicle: Vehicle;
  isExpanded: boolean;
  onToggle: (vehicleId: string) => void;
  timingLabel: string;
  onPlaceBid: (vehicleId: string, amount: number) => void;
}

export function VehicleRow({ vehicle, isExpanded, onToggle, timingLabel, onPlaceBid }: Props) {
  const detailId = `vehicle-detail-${vehicle.id}`;

  return (
    <div className={`${styles.lotItem} ${isExpanded ? styles.expanded : ""}`}>
      <button
        type="button"
        className={styles.lotRow}
        aria-expanded={isExpanded}
        aria-controls={detailId}
        onClick={() => onToggle(vehicle.id)}
      >
        <div className={styles.photoArea}>
          <PhotoThumb vehicle={vehicle} width={96} height={68} />
        </div>
        <div className={styles.titleArea}>
          <div className={styles.title}>
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </div>
          <div className={`${styles.subLine} mono`}>
            Lot {vehicle.lot} · VIN {vehicle.vin.slice(0, 8)}… · {vehicle.city}, {vehicle.province}
          </div>
          <div className={styles.badges}>
            <Pill {...titleMeta(vehicle.title_status)} />
            <Pill {...conditionTier(vehicle.condition_grade)} />
          </div>
        </div>
        <div className={`${styles.specs} ${styles.specsVehicle}`}>
          <span>{formatKm(vehicle.odometer_km)}</span>
          <span>
            {vehicle.transmission} · {vehicle.drivetrain}
          </span>
          <span>{vehicle.fuel_type}</span>
        </div>
        <div className={`${styles.specs} ${styles.specsListing}`}>
          <span>{vehicle.selling_dealership}</span>
          <span>
            <Pill {...reserveMeta(vehicle)} />
          </span>
        </div>
        <div className={styles.bidCol}>
          <div className={`${styles.bidAmount} mono`}>
            {formatMoney(vehicle.current_bid ?? vehicle.starting_bid)}
          </div>
          <div className={styles.bidMeta}>
            {vehicle.current_bid != null ? `${vehicle.bid_count} bids` : "Starting bid"}
          </div>
          <div className={`${styles.bidMeta} ${styles.timing}`}>{timingLabel}</div>
        </div>
        <span className={styles.toggle}>
          <span className={styles.toggleLabel}>{isExpanded ? "Hide" : "Details"}</span>
          <span className={styles.chevronBadge}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </span>
      </button>
      <div id={detailId} className={`${styles.accordion} ${isExpanded ? styles.open : ""}`}>
        <div>
          <div className={styles.inner}>
            {isExpanded && (
              <VehicleDetail vehicle={vehicle} timingLabel={timingLabel} onPlaceBid={onPlaceBid} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
