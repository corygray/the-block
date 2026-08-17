import { vehicles } from "./data/vehicles";

// Placeholder while the real UI is being wired up component by component — this just
// proves the data pipeline (JSON -> typed Vehicle[] -> component) compiles and runs
// end-to-end. See PROGRESS.md for exactly where this was left off, and BUILD_LOG.md for
// the full history of why things are built the way they are.
function App() {
  return (
    <main style={{ padding: 24 }}>
      <h1>The Block</h1>
      <p>{vehicles.length} vehicles loaded. UI wiring in progress — see PROGRESS.md.</p>
    </main>
  );
}

export default App;
