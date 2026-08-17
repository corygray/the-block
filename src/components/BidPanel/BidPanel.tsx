import { useEffect, useState, type FormEvent } from "react";
import type { Vehicle } from "../../types/vehicle";
import { formatMoney, nextMinBid } from "../../lib/format";
import { Button } from "../Button/Button";
import styles from "./BidPanel.module.css";

interface Props {
  vehicle: Vehicle;
  timingLabel: string;
  onPlaceBid: (vehicleId: string, amount: number) => void;
}

export function BidPanel({ vehicle, timingLabel, onPlaceBid }: Props) {
  const min = nextMinBid(vehicle);
  const [amount, setAmount] = useState(min);
  const [message, setMessage] = useState<{ text: string; tone: "err" | "ok" } | null>(null);

  // Keep the suggested next bid in step with the vehicle's current bid — after a
  // successful bid raises current_bid, the next suggested amount should raise with it.
  useEffect(() => {
    setAmount(nextMinBid(vehicle));
  }, [vehicle.current_bid, vehicle.starting_bid]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!amount || amount < min) {
      setMessage({ text: `Enter at least ${formatMoney(min)}.`, tone: "err" });
      return;
    }
    onPlaceBid(vehicle.id, amount);
    setMessage({ text: `Bid placed at ${formatMoney(amount)}.`, tone: "ok" });
  }

  return (
    <div className={styles.panel}>
      <div className={styles.currentLabel}>
        {vehicle.current_bid != null ? "Current Bid" : "Starting Bid"}
      </div>
      <div className={`${styles.current} mono`}>
        {formatMoney(vehicle.current_bid ?? vehicle.starting_bid)}
      </div>
      <div className={styles.metaRow}>
        <span>{vehicle.bid_count} bids</span>
        <span>{timingLabel}</span>
      </div>
      {vehicle.buy_now_price != null && (
        <div className={`${styles.metaRow} ${styles.noTop}`}>
          <span>Buy It Now</span>
          <span className="mono">{formatMoney(vehicle.buy_now_price)}</span>
        </div>
      )}
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
        <Button type="submit" variant="primary">
          Place Bid
        </Button>
      </form>
      <div className={`${styles.msg} ${message ? styles[message.tone] : ""}`} role="status" aria-live="polite">
        {message?.text}
      </div>
    </div>
  );
}
