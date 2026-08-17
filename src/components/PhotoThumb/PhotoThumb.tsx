import { useState } from "react";
import type { Vehicle } from "../../types/vehicle";
import styles from "./PhotoThumb.module.css";

interface Props {
  vehicle: Vehicle;
  width: number;
  height: number;
}

// Small row/list thumbnail: first photo + a count badge for the rest. `onError` swaps in
// a text fallback instead of the browser's broken-image icon, since these are external
// placehold.co URLs from the provided dataset — not something we control or host.
export function PhotoThumb({ vehicle, width, height }: Props) {
  const [failed, setFailed] = useState(false);
  const label = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className={styles.thumb} style={{ width, height }}>
      {failed || vehicle.images.length === 0 ? (
        <div className={styles.fallback}>{label}</div>
      ) : (
        <img
          className={styles.img}
          src={vehicle.images[0]}
          alt={`${label} photo 1 of ${vehicle.images.length}`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      <span className={styles.count} aria-label={`${vehicle.images.length} photos`}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M9 3l-1.8 2H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-3.2L15 3H9zm3 15a5 5 0 110-10 5 5 0 010 10z" />
        </svg>
        <span aria-hidden="true">{vehicle.images.length}</span>
      </span>
    </div>
  );
}
