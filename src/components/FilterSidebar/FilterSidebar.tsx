import { useMemo } from "react";
import type { TitleStatus, Vehicle } from "../../types/vehicle";
import { ALL_BODY_STYLES, ALL_MAKES, type Filters } from "../../lib/filters";
import styles from "./FilterSidebar.module.css";

interface Props {
  vehicles: Vehicle[];
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const TITLE_STATUS_OPTIONS: { value: TitleStatus; label: string }[] = [
  { value: "clean", label: "Clean" },
  { value: "rebuilt", label: "Rebuilt" },
  { value: "salvage", label: "Salvage" },
];

export function FilterSidebar({ vehicles, filters, onChange }: Props) {
  // Derived from the real dataset rather than hardcoded, so the dropdown always matches
  // what's actually browsable instead of drifting out of sync with the data.
  const makes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.make))).sort(),
    [vehicles],
  );
  const bodyStyles = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.body_style))).sort(),
    [vehicles],
  );

  function toggleTitleStatus(status: TitleStatus) {
    const next = new Set(filters.titleStatuses);
    if (next.has(status)) {
      next.delete(status);
    } else {
      next.add(status);
    }
    onChange({ ...filters, titleStatuses: next });
  }

  return (
    <aside className={styles.filters}>
      <div>
        <h3>Filter Inventory</h3>
        <div className={styles.field}>
          <label htmlFor="filter-make">Make</label>
          <select
            id="filter-make"
            value={filters.make}
            onChange={(event) => onChange({ ...filters, make: event.target.value })}
          >
            <option>{ALL_MAKES}</option>
            {makes.map((make) => (
              <option key={make}>{make}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="filter-body">Body Style</label>
          <select
            id="filter-body"
            value={filters.bodyStyle}
            onChange={(event) => onChange({ ...filters, bodyStyle: event.target.value })}
          >
            <option>{ALL_BODY_STYLES}</option>
            {bodyStyles.map((style) => (
              <option key={style}>{style}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel} id="price-range-label">
            Price Range
          </span>
          <div className={styles.range} role="group" aria-labelledby="price-range-label">
            <input
              type="number"
              placeholder="Min"
              aria-label="Minimum price"
              value={filters.minPrice ?? ""}
              onChange={(event) =>
                onChange({
                  ...filters,
                  minPrice: event.target.value === "" ? null : Number(event.target.value),
                })
              }
            />
            <span aria-hidden="true">–</span>
            <input
              type="number"
              placeholder="Max"
              aria-label="Maximum price"
              value={filters.maxPrice ?? ""}
              onChange={(event) =>
                onChange({
                  ...filters,
                  maxPrice: event.target.value === "" ? null : Number(event.target.value),
                })
              }
            />
          </div>
        </div>
      </div>
      <div>
        <h3>Title Status</h3>
        {TITLE_STATUS_OPTIONS.map(({ value, label }) => (
          <label className={styles.check} key={value}>
            <input
              type="checkbox"
              checked={filters.titleStatuses.has(value)}
              onChange={() => toggleTitleStatus(value)}
            />
            {label}
          </label>
        ))}
      </div>
    </aside>
  );
}
