import { SORT_OPTIONS, type SortOption } from "../../lib/sort";
import styles from "./ListingToolbar.module.css";

interface Props {
  count: number;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export function ListingToolbar({ count, sortBy, onSortChange }: Props) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.info}>
        <span>
          {count} {count === 1 ? "lot" : "lots"}
        </span>
        <span aria-hidden="true">·</span>
        <span>Showing all provinces</span>
      </div>
      <div className={styles.sortControl}>
        <label htmlFor="sort-select">Sort by</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
