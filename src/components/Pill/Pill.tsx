import type { Badge } from "../../lib/format";
import styles from "./Pill.module.css";

export function Pill({ label, tone }: Badge) {
  return <span className={`${styles.pill} ${styles[tone]}`}>{label}</span>;
}
