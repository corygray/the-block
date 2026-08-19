import type { Vehicle } from "../../types/vehicle";
import type { AuctionTiming } from "../../lib/auction";
import { auctionStatusDot, formatAuctionTiming, urgencyTier } from "../../lib/auction";
import { conditionTier, formatKm, formatMoney, reserveMeta, titleMeta } from "../../lib/format";
import { Pill } from "../Pill/Pill";
import { PhotoThumb } from "../PhotoThumb/PhotoThumb";
import styles from "./VehicleCard.module.css";

interface Props {
  vehicle: Vehicle;
  timing: AuctionTiming;
  onOpen: (vehicle: Vehicle, trigger: HTMLButtonElement) => void;
}

const TIME_CLASS = {
  urgent: "timeUrgent",
  soon: "timeSoon",
  normal: "timeNormal",
  upcoming: "timeUpcoming",
} as const;

// The "at a glance" card for a dealer deciding whether to click in — price and auction
// timing lead (full-width statband), VIN and dealer name are dropped entirely (expanded/
// modal-only, see BUILD_LOG.md), and damage is a quick flag instead of a full list.
export function VehicleCard({ vehicle, timing, onOpen }: Props) {
  const tier = urgencyTier(timing);
  const statusDot = auctionStatusDot(timing);

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        onClick={(event) => onOpen(vehicle, event.currentTarget)}
      >
        <div className={styles.statband}>
          <div>
            <div className={styles.priceLabel}>
              {vehicle.current_bid != null ? "Current Bid" : "Starting Bid"}
            </div>
            <div className={`${styles.price} mono`}>
              {formatMoney(vehicle.current_bid ?? vehicle.starting_bid)}
            </div>
          </div>
          <div className={styles.time}>
            {tier === "urgent" && <span className={styles.urgentBadge}>⏱ Ending Soon</span>}
            <span className={styles.timeRow}>
              {statusDot === "live" && (
                <>
                  <span className={styles.dotLive} aria-hidden="true" />
                  <span className={styles.liveLabel}>LIVE:</span>
                </>
              )}
              <span className={styles[TIME_CLASS[tier]]}>{formatAuctionTiming(timing)}</span>
            </span>
          </div>
        </div>
        <PhotoThumb vehicle={vehicle} width="100%" height={150} />
        <div className={styles.body}>
          <div className={styles.title}>
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </div>
          <div className={styles.badges}>
            <Pill {...titleMeta(vehicle.title_status)} />
            <Pill {...conditionTier(vehicle.condition_grade)} />
          </div>
          <div className={styles.vitals}>
            <span>{formatKm(vehicle.odometer_km)}</span>
            <span>
              {vehicle.city}, {vehicle.province}
            </span>
            <span>{vehicle.drivetrain}</span>
            {vehicle.damage_notes.length > 0 && (
              <span className={styles.damageFlag}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M12 9v4M12 17h.01M10.3 3.9L2.7 18a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                </svg>
                {vehicle.damage_notes.length} noted
              </span>
            )}
          </div>
          <div className={styles.footer}>
            <Pill {...reserveMeta(vehicle)} />
            <span className={styles.bidCount}>{vehicle.bid_count} bids</span>
          </div>
        </div>
      </button>
    </div>
  );
}
