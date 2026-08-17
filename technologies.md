# Technologies

A plain-English reference for the tech stack used in this project. Written while learning
React, Vite, and TypeScript for the first time — updated as new tools get added.

---

## React

**What it is:** A JavaScript library for building user interfaces out of reusable pieces
called "components." Instead of writing one big HTML page, you build small functions (like
`VehicleCard` or `BidButton`) that each return a chunk of UI, and you combine them.

**Why we chose it:** It's the most common frontend library in the industry, it's what
OPENLANE's own example stack suggests, and its component model maps well onto this app
(a list of vehicle cards, a detail page, a bid form — each is naturally its own component).

**Key ideas you'll see in the code:**
- **Component** — a function that returns UI (JSX).
- **Props** — data passed into a component from its parent (like function arguments).
- **State** (`useState`) — data a component "remembers" and re-renders when it changes.
  This is how bid amounts will update on screen without a page reload.
- **JSX** — HTML-like syntax written inside JavaScript/TypeScript files (`.tsx`).

## Vite

**What it is:** A build tool and local dev server. It takes our React/TypeScript source
code and turns it into something a browser can run, and it reloads the browser instantly
when we save a file (Hot Module Replacement).

**Why we chose it:** It's fast to set up (`npm create vite@latest`), has near-instant
reload during development, and is the option OPENLANE's own README suggests pairing with
React. No backend server needed since this app is frontend-only.

## TypeScript

**What it is:** JavaScript with optional type annotations. You can declare the "shape" of
your data (e.g., a `Vehicle` has a `year: number`, a `make: string`, etc.), and the editor
will warn you if you use it wrong before you even run the code.

**Why we chose it:** The vehicle dataset has a consistent, fairly complex shape (specs,
condition, auction fields, etc.). Typing it once as a `Vehicle` interface means every
component that touches vehicle data gets autocomplete and compile-time error checking
instead of runtime surprises.

## CSS Modules

**What it is:** A `.module.css` file (e.g. `Button.module.css`) whose class names only
apply to the component that imports it — Vite renames every class behind the scenes
(something like `Button_primary__a1b2c`) so two components can both have a `.title` class
without ever colliding.

**Why we chose it:** No extra dependency to install — Vite supports it out of the box, so
it fit "keep the stack simple" without pulling in a styling library like Tailwind or
styled-components. Each component's styles live right next to its `.tsx` file
(`Button/Button.tsx` + `Button/Button.module.css`), which makes it obvious what CSS
belongs to what component and safe to delete both together if a component goes away.

**How it's used here:** Colors, spacing scale, etc. are defined once as CSS custom
properties (`--ink`, `--surface`, `--line`, ...) in the global `src/index.css` — those
aren't module-scoped, they're meant to cascade everywhere. Each component's `.module.css`
then references them (`color: var(--ink)`) rather than hardcoding values, so a component's
*layout* is scoped to itself but its *colors* still come from one shared source of truth.

## Application State (Bids)

**What it is:** Where the app keeps track of "what's true right now" — in this case,
current bid amounts and bid counts per vehicle.

**Why we chose in-memory state:** Bids live in React state (in the browser's memory) rather
than `localStorage` or a backend. This is the simplest option that satisfies the
requirement ("a bid flow with updated visible state") without adding persistence
complexity that isn't needed for a prototype. Trade-off: bids reset on page refresh —
called out as an intentional decision in the README/SUBMISSION doc.

---

*This file will grow as we add routing, styling, or other libraries during the build.*
