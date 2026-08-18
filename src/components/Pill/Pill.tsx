import type { Badge } from "../../lib/format";
import styles from "./Pill.module.css";

// data-tone (not just the module class) is what lets other components' CSS Modules
// target a specific pill variant — e.g. VehicleRow needs to restyle a neutral pill on
// row hover, but CSS Modules hash class names per-file, so `.neutral` from this file
// isn't reachable from another module's stylesheet. A plain attribute selector is.
export function Pill({ label, tone }: Badge) {
  return (
    <span className={`${styles.pill} ${styles[tone]}`} data-tone={tone}>
      {label}
    </span>
  );
}
