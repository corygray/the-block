import { useEffect, useRef, type MouseEvent } from "react";
import type { Vehicle } from "../../types/vehicle";
import type { AuctionTiming } from "../../lib/auction";
import { formatAuctionTiming, urgencyTier } from "../../lib/auction";
import { conditionTier, formatKm, reserveMeta, titleMeta } from "../../lib/format";
import { Pill } from "../Pill/Pill";
import { PhotoGallery } from "../PhotoGallery/PhotoGallery";
import { BidPanel } from "../BidPanel/BidPanel";
import styles from "./VehicleDetailModal.module.css";

interface Props {
  vehicle: Vehicle | null;
  timing: AuctionTiming | null;
  onClose: () => void;
  onPlaceBid: (vehicleId: string, amount: number) => void;
}

// Built on the native <dialog> element rather than a hand-rolled overlay <div>, since it
// does most of the accessibility work for free: showModal() traps focus inside, closes on
// Escape, renders on the browser's top layer, and carries an implicit role="dialog" — none
// of that is hand-rolled here. What IS still on us: an accessible name (aria-labelledby),
// focusing the dialog itself first (tabIndex={-1} + .focus()) so its name is announced
// before any control inside it, returning focus to whichever card opened it when it
// closes, and a click-outside-to-close affordance.
export function VehicleDetailModal({ vehicle, timing, onClose, onPlaceBid }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (vehicle) {
      dialog.showModal();
      dialog.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [vehicle]);

  // A single listener for every way the dialog can close (Escape, backdrop, close
  // button) — native <dialog> doesn't return focus to whatever opened it on its own, so
  // this is the one place that has to do it, regardless of which of those caused it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  // Bounding-box check rather than `event.target === dialog` — this dialog has no
  // padding of its own (header/body fill it edge to edge), so every click inside the
  // visible card lands on a child element, never the dialog element itself.
  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) dialog.close();
  }

  const tier = timing ? urgencyTier(timing) : null;
  const timingLabel = timing ? formatAuctionTiming(timing) : "";

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      aria-labelledby="modal-title"
      tabIndex={-1}
      onClick={handleBackdropClick}
    >
      {vehicle && tier && (
        <>
          <div className={styles.header}>
            <h2 id="modal-title">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </h2>
            <button
              type="button"
              className={styles.close}
              aria-label="Close vehicle details"
              onClick={() => dialogRef.current?.close()}
            >
              ✕
            </button>
          </div>
          <div className={styles.body}>
            <div className={styles.detailBody}>
              <div className={styles.detailMain}>
                <PhotoGallery vehicle={vehicle} />
                <div className={styles.badges}>
                  <Pill {...titleMeta(vehicle.title_status)} />
                  <Pill {...conditionTier(vehicle.condition_grade)} />
                  <Pill {...reserveMeta(vehicle)} />
                </div>
                <div className={`${styles.subLine} mono`}>VIN {vehicle.vin}</div>
                <div className={styles.subLine}>
                  {vehicle.selling_dealership} · {vehicle.city}, {vehicle.province}
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
              <BidPanel vehicle={vehicle} timingLabel={timingLabel} onPlaceBid={onPlaceBid} />
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
