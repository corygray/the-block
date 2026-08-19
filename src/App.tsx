import { useMemo, useRef, useState } from "react";
import { vehicles as initialVehicles } from "./data/vehicles";
import type { Vehicle } from "./types/vehicle";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { Container } from "./components/Container/Container";
import { FilterSidebar } from "./components/FilterSidebar/FilterSidebar";
import { ListingToolbar } from "./components/ListingToolbar/ListingToolbar";
import { VehicleCard } from "./components/VehicleCard/VehicleCard";
import { VehicleDetailModal } from "./components/VehicleDetailModal/VehicleDetailModal";
import { defaultFilters, matchesFilters } from "./lib/filters";
import { compareVehicles, type SortOption } from "./lib/sort";
import { getAuctionTiming, getScheduleOffsetMs } from "./lib/auction";
import styles from "./App.module.css";

function App() {
  // Bids live here, in-memory only (see technologies.md for why) — placing a bid
  // replaces one vehicle in this array immutably, which re-renders everywhere it's used.
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>("ending-soonest");
  // The vehicle's id, not its index in the array — an index would point at the wrong
  // vehicle the moment filtering or sorting reorders the list.
  const [openVehicleId, setOpenVehicleId] = useState<string | null>(null);
  // Captured at click time (event.currentTarget), same technique as the design mockup's
  // `lastTrigger` — native <dialog> doesn't return focus to whatever opened it on its own.
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

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

  const openVehicle = vehicles.find((vehicle) => vehicle.id === openVehicleId) ?? null;

  function placeBid(vehicleId: string, amount: number) {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === vehicleId
          ? { ...vehicle, current_bid: amount, bid_count: vehicle.bid_count + 1 }
          : vehicle,
      ),
    );
  }

  function openModal(vehicle: Vehicle, trigger: HTMLButtonElement) {
    lastTriggerRef.current = trigger;
    setOpenVehicleId(vehicle.id);
  }

  // Fires from the dialog's own `close` event, so this runs no matter what closed it
  // (Escape, backdrop click, or the close button).
  function closeModal() {
    setOpenVehicleId(null);
    lastTriggerRef.current?.focus();
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
            {visibleVehicles.length === 0 ? (
              <p style={{ padding: 24, color: "var(--slate)" }}>
                No vehicles match your filters. Try widening your search.
              </p>
            ) : (
              <div className={styles.grid}>
                {visibleVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    timing={getAuctionTiming(vehicle, offsetMs)}
                    onOpen={openModal}
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>
      <Footer />
      <VehicleDetailModal
        vehicle={openVehicle}
        timing={openVehicle ? getAuctionTiming(openVehicle, offsetMs) : null}
        onClose={closeModal}
        onPlaceBid={placeBid}
      />
    </>
  );
}

export default App;
