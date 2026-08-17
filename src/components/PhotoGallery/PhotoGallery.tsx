import { useState } from "react";
import type { Vehicle } from "../../types/vehicle";
import styles from "./PhotoGallery.module.css";

interface Props {
  vehicle: Vehicle;
}

// Hero photo + a clickable thumbnail strip below it. Selection is local component state —
// it only matters while this vehicle's accordion is open, so there's no reason to lift it
// any higher.
export function PhotoGallery({ vehicle }: Props) {
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const label = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  if (vehicle.images.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={styles.hero}>
          <span className={styles.heroFallback}>{label}</span>
        </div>
      </div>
    );
  }

  const activeIndex = Math.min(selected, vehicle.images.length - 1);

  return (
    <div className={styles.gallery}>
      <div className={styles.hero}>
        {failed[activeIndex] ? (
          <span className={styles.heroFallback}>{label}</span>
        ) : (
          <img
            className={styles.heroImg}
            src={vehicle.images[activeIndex]}
            alt={`${label} photo ${activeIndex + 1} of ${vehicle.images.length}`}
            onError={() => setFailed((prev) => ({ ...prev, [activeIndex]: true }))}
          />
        )}
      </div>
      {vehicle.images.length > 1 && (
        <div className={styles.thumbs}>
          {vehicle.images.map((src, index) => (
            <button
              key={src}
              type="button"
              className={`${styles.thumbButton} ${index === activeIndex ? styles.active : ""}`}
              aria-label={`View photo ${index + 1} of ${vehicle.images.length}`}
              aria-pressed={index === activeIndex}
              onClick={() => setSelected(index)}
            >
              {failed[index] ? null : (
                <img
                  src={src}
                  alt=""
                  onError={() => setFailed((prev) => ({ ...prev, [index]: true }))}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
