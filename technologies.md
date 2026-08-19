# Technologies

A plain-English reference for the tech stack used in this project — updated as new tools
get added.

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

## oxlint

**What it is:** A linter — a tool that reads your code without running it and flags
patterns that are likely bugs (not just style nitpicks). It came bundled with the Vite
scaffold as the default (`npm run lint`).

**Why we kept it:** It's a Rust-based, much faster alternative to the more common
ESLint, and includes React-specific rules out of the box — e.g. the
`react-hooks/exhaustive-deps` rule, which checks that a `useEffect`'s dependency array
actually lists everything the effect reads. It caught a real one in `BidPanel`: an effect
that reads `vehicle` but only listed two of its fields as dependencies — technically fine
in this app today (the object only ever changes as a whole, via a bid update), but the
kind of thing that quietly turns into a real bug later if the component's logic changes
and nobody remembers the effect was relying on an assumption the dependency array didn't
actually enforce.

## Playwright

**What it is:** A tool that drives a real (headless) browser programmatically — it can
load a page, click things, type into fields, and take screenshots, all from a script.

**Why we used it:** Not part of the app itself — it's a verification tool, installed
separately (in a scratch folder, not as a project dependency) purely to check that the
app actually works. Checking that the dev server returns HTTP 200 only proves the page
*loads*; it says nothing about whether clicking a row actually expands it, or whether
placing a bid actually updates the screen. Playwright let us script exactly that: load the
page, click a vehicle row, confirm the bid form appears, place a bid, confirm the
confirmation message shows up, resize to a phone-sized viewport, and check the browser
console for errors the whole time. This is the kind of check that catches the difference
between "the code compiles" and "the feature actually works."

**A lesson from using it:** a screenshot taken right after expanding a row looked broken —
it showed the row's "expanded" styling but none of the detail content underneath. Before
assuming that meant a bug, we scrolled to the element and took a full-page screenshot
instead, which showed the content was there all along — it had just been pushed below the
visible browser window by the newly-expanded accordion. A cropped screenshot right after
a layout change is a common false alarm, not proof of a real bug.

---

*This file will grow as we add routing, styling, or other libraries during the build.*
