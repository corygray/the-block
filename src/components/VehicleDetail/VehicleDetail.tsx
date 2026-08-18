import type { Vehicle } from "../../types/vehicle";
import { conditionTier, formatKm, reserveMeta, titleMeta } from "../../lib/format";
import { Pill } from "../Pill/Pill";
import { PhotoGallery } from "../PhotoGallery/PhotoGallery";
import { BidPanel } from "../BidPanel/BidPanel";
import styles from "./VehicleDetail.module.css";

interface Props {
  vehicle: Vehicle;
  timingLabel: string;
  onPlaceBid: (vehicleId: string, amount: number) => void;
}

// Rendered inside the accordion when a lot is expanded. The bid panel is deliberately
// the FIRST element in this component's returned JSX, with detail-main second — the
// opposite of how they read visually on desktop. See VehicleDetail.module.css for why:
// short version, it makes mobile's natural (un-reordered) stacking put price first
// without creating a visual/reading-order mismatch for keyboard and screen reader users.
export function VehicleDetail({ vehicle, timingLabel, onPlaceBid }: Props) {
  return (
    <div className={styles.detailBody}>
      <div className={styles.bidPanel}>
        <BidPanel vehicle={vehicle} timingLabel={timingLabel} onPlaceBid={onPlaceBid} />
      </div>
      <div className={styles.detailMain}>
        <PhotoGallery vehicle={vehicle} />
        <div className={styles.badges}>
          <Pill {...titleMeta(vehicle.title_status)} />
          <Pill {...conditionTier(vehicle.condition_grade)} />
          <Pill {...reserveMeta(vehicle)} />
        </div>
        <div className={`${styles.subLine} mono`}>
          VIN {vehicle.vin} · {vehicle.selling_dealership} · {vehicle.city}, {vehicle.province}
        </div>
        <dl className={styles.specGrid}>
          <div>
            <dt>Odometer</dt>
            <dd>{formatKm(vehicle.odometer_km)}</dd>
          </div>
          <div>
            <dt>Fuel Type</dt>
            <dd>{vehicle.fuel_type}</dd>
          </div>
          <div>
            <dt>Transmission</dt>
            <dd>{vehicle.transmission}</dd>
          </div>
          <div>
            <dt>Drivetrain</dt>
            <dd>{vehicle.drivetrain}</dd>
          </div>
          <div>
            <dt>Body Style</dt>
            <dd>{vehicle.body_style}</dd>
          </div>
          <div>
            <dt>Condition Grade</dt>
            <dd>{vehicle.condition_grade.toFixed(1)} / 5.0</dd>
          </div>
        </dl>
        <div className={styles.blockTitle}>Condition Report</div>
        <p className={styles.conditionText}>{vehicle.condition_report}</p>
        <div className={styles.blockTitle}>Damage Notes</div>
        {vehicle.damage_notes.length > 0 ? (
          <ul className={styles.damageList}>
            {vehicle.damage_notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.conditionText}>No damage reported.</p>
        )}
      </div>
    </div>
  );
}
