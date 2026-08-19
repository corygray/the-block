import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { Vehicle } from "../../types/vehicle";
import styles from "./PhotoGallery.module.css";

interface Props {
  vehicle: Vehicle;
}

// The hero photo can expand into its own full-screen dialog — a modal opened from inside
// the vehicle detail modal. Native <dialog> makes nesting like this tractable: the
// browser's top-layer stacking means the lightbox renders above the vehicle modal with no
// manual z-index, the vehicle modal's own content becomes inert while the lightbox is open
// (nothing behind it is clickable or reachable by Tab), and Escape closes only the
// topmost dialog — all for free. What's still on us: an accessible name, moving focus into
// the lightbox on open, returning focus to the expand button on close, and making sure a
// click that closes the lightbox doesn't bubble up and ALSO trigger the vehicle modal's
// own click-outside-to-close handler (see handleLightboxClick).
export function PhotoGallery({ vehicle }: Props) {
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const label = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  useEffect(() => {
    const dialog = lightboxRef.current;
    if (!dialog) return;
    if (lightboxOpen) {
      dialog.showModal();
      dialog.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [lightboxOpen]);

  useEffect(() => {
    const dialog = lightboxRef.current;
    if (!dialog) return;
    function handleClose() {
      setLightboxOpen(false);
      expandButtonRef.current?.focus();
    }
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  // Unlike the vehicle modal's own click-outside handler, this can't use a bounding-box
  // check — this dialog IS the viewport (100vw/100vh), so there's no "outside" space to
  // click; the whole screen is inside its bounding rect. Instead, target-equality works
  // correctly here specifically because this dialog centers a smaller image inside itself
  // (unlike the vehicle modal, which has no padding of its own): a click landing directly
  // on the dialog element, not on the image or the close button, means the user clicked
  // the empty space around the photo. stopPropagation is the other important part — without
  // it, a click anywhere in this full-screen lightbox would bubble up to the vehicle
  // modal's own dialog element and trigger THAT modal's click-outside-to-close handler,
  // since the lightbox is a DOM descendant of it.
  function handleLightboxClick(event: MouseEvent<HTMLDialogElement>) {
    event.stopPropagation();
    if (event.target === lightboxRef.current) setLightboxOpen(false);
  }

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
  const activeFailed = failed[activeIndex];

  return (
    <div className={styles.gallery}>
      <div className={styles.hero}>
        {activeFailed ? (
          <span className={styles.heroFallback}>{label}</span>
        ) : (
          <>
            <img
              className={styles.heroImg}
              src={vehicle.images[activeIndex]}
              alt={`${label} photo ${activeIndex + 1} of ${vehicle.images.length}`}
              onError={() => setFailed((prev) => ({ ...prev, [activeIndex]: true }))}
            />
            <button
              ref={expandButtonRef}
              type="button"
              className={styles.expandButton}
              aria-label="View full-size photo"
              aria-haspopup="dialog"
              onClick={() => setLightboxOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </button>
          </>
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
      <dialog
        ref={lightboxRef}
        className={styles.lightbox}
        aria-label={`${label}, photo ${activeIndex + 1} of ${vehicle.images.length}, full size`}
        tabIndex={-1}
        onClick={handleLightboxClick}
      >
        {lightboxOpen && !activeFailed && (
          <>
            <button
              type="button"
              className={styles.lightboxClose}
              aria-label="Close full-size photo"
              onClick={() => setLightboxOpen(false)}
            >
              ✕
            </button>
            <img
              className={styles.lightboxImg}
              src={vehicle.images[activeIndex]}
              alt={`${label} photo ${activeIndex + 1} of ${vehicle.images.length}`}
            />
          </>
        )}
      </dialog>
    </div>
  );
}
