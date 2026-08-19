import { useEffect, useState, type FormEvent } from "react";
import type { Vehicle } from "../../types/vehicle";
import { formatMoney, nextMinBid } from "../../lib/format";
import { Button } from "../Button/Button";
import styles from "./BidPanel.module.css";

interface Props {
  vehicle: Vehicle;
  timingLabel: string;
  canBid: boolean;
  onPlaceBid: (vehicleId: string, amount: number) => void;
}

export function BidPanel({ vehicle, timingLabel, canBid, onPlaceBid }: Props) {
  const min = nextMinBid(vehicle);
  const [amount, setAmount] = useState(min);
  const [message, setMessage] = useState<{ text: string; tone: "err" | "ok" } | null>(null);

  // Keep the suggested next bid in step with the vehicle's current bid — after a
  // successful bid raises current_bid, the next suggested amount should raise with it.
  // `vehicle` only ever changes identity when a bid updates it, so depending on the
  // whole object (rather than just the two fields nextMinBid reads) is both correct and
  // what the exhaustive-deps rule expects.
  useEffect(() => {
    setAmount(nextMinBid(vehicle));
  }, [vehicle]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!amount || amount < min) {
      setMessage({ text: `Enter at least ${formatMoney(min)}.`, tone: "err" });
      return;
    }
    onPlaceBid(vehicle.id, amount);
    setMessage({ text: `Bid placed at ${formatMoney(amount)}.`, tone: "ok" });
  }

  // Buy It Now reuses the same in-memory bid mechanism (a fixed-price "final bid") rather
  // than a separate purchase/checkout flow — matching the prototype's existing scope
  // decision for bidding in general (see technologies.md).
  function handleBuyNow() {
    if (vehicle.buy_now_price == null) return;
    onPlaceBid(vehicle.id, vehicle.buy_now_price);
    setMessage({ text: `Bought now for ${formatMoney(vehicle.buy_now_price)}.`, tone: "ok" });
  }

  return (
    <div className={styles.panel}>
      <div className={styles.priceBlock}>
        <div className={styles.currentLabel}>
          {vehicle.current_bid != null ? "Current Bid" : "Starting Bid"}
        </div>
        <div className={`${styles.current} mono`}>
          {formatMoney(vehicle.current_bid ?? vehicle.starting_bid)}
        </div>
      </div>
      <div className={styles.metaRow}>
        <span>{vehicle.bid_count} bids</span>
        <span>{timingLabel}</span>
      </div>
      {canBid ? (
        <div className={styles.actions}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="number"
              className={styles.input}
              min={min}
              step={500}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              aria-label="Bid amount in dollars"
            />
            <Button type="submit" variant="cta">
              Place Bid
            </Button>
          </form>
          <div className={`${styles.msg} ${message ? styles[message.tone] : ""}`} role="status" aria-live="polite">
            {message?.text}
          </div>
          {vehicle.buy_now_price != null && (
            <>
              <div className={styles.divider}>
                <span>or</span>
              </div>
              <Button type="button" variant="secondary" className={styles.buyNow} onClick={handleBuyNow}>
                Buy It Now — {formatMoney(vehicle.buy_now_price)}
              </Button>
            </>
          )}
        </div>
      ) : (
        // Not live yet — no bid form, no Buy It Now. Showing either while the underlying
        // bid data is being displayed as "no bids yet" (see withEffectiveBidState) would
        // let someone place a bid the UI just finished insisting doesn't exist yet.
        <div className={styles.notLive}>Bidding opens when the auction starts.</div>
      )}
    </div>
  );
}
