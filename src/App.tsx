import { useMemo, useState } from "react";
import { vehicles as initialVehicles } from "./data/vehicles";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { Container } from "./components/Container/Container";
import { FilterSidebar } from "./components/FilterSidebar/FilterSidebar";
import { ListingToolbar } from "./components/ListingToolbar/ListingToolbar";
import { VehicleRow } from "./components/VehicleRow/VehicleRow";
import { defaultFilters, matchesFilters } from "./lib/filters";
import { compareVehicles, type SortOption } from "./lib/sort";
import { formatAuctionTiming, getAuctionTiming, getScheduleOffsetMs } from "./lib/auction";
import styles from "./App.module.css";

function App() {
  // Bids live here, in-memory only (see technologies.md for why) — placing a bid
  // replaces one vehicle in this array immutably, which re-renders everywhere it's used.
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>("ending-soonest");
  // The vehicle's id, not its index in the array — an index would point at the wrong
  // vehicle the moment filtering or sorting reorders the list.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // The dataset's auction schedule is fixed at load time (placing a bid never changes
  // auction_start), so this only needs computing once, from the original imported data.
  const offsetMs = useMemo(() => getScheduleOffsetMs(initialVehicles), []);

  const visibleVehicles = useMemo(
    () =>
      vehicles
        .filter((vehicle) => matchesFilters(vehicle, filters))
        .sort((a, b) => compareVehicles(a, b, sortBy, offsetMs)),
    [vehicles, filters, sortBy, offsetMs],
  );

  function placeBid(vehicleId: string, amount: number) {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === vehicleId
          ? { ...vehicle, current_bid: amount, bid_count: vehicle.bid_count + 1 }
          : vehicle,
      ),
    );
  }

  function toggleExpanded(vehicleId: string) {
    setExpandedId((current) => (current === vehicleId ? null : vehicleId));
  }

  return (
    <>
      <Header
        search={filters.search}
        onSearchChange={(search) => setFilters({ ...filters, search })}
      />
      <div className={styles.body}>
        <Container className={styles.bodyInner}>
          <FilterSidebar vehicles={vehicles} filters={filters} onChange={setFilters} />
          <div>
            <ListingToolbar count={visibleVehicles.length} sortBy={sortBy} onSortChange={setSortBy} />
            <div>
              {visibleVehicles.length === 0 ? (
                <p style={{ padding: 24, color: "var(--slate)" }}>
                  No vehicles match your filters. Try widening your search.
                </p>
              ) : (
                visibleVehicles.map((vehicle) => (
                  <VehicleRow
                    key={vehicle.id}
                    vehicle={vehicle}
                    isExpanded={expandedId === vehicle.id}
                    onToggle={toggleExpanded}
                    timingLabel={formatAuctionTiming(getAuctionTiming(vehicle, offsetMs))}
                    onPlaceBid={placeBid}
                  />
                ))
              )}
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default App;
