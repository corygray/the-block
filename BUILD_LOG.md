# Build Log

A running log of the decisions made while building this project, and why. Kept so the
reasoning is easy to walk through later (e.g. in the OPENLANE walkthrough interview).

---

## 2026-08-17 — Setup

- **Forked** `kar-dmp/the-block` to `corygray/the-block` and cloned it locally.
  - `origin` remote points at the fork, `upstream` remote points at the original repo, in
    case the challenge repo gets updated.
- **Read the challenge brief** (README.md): build the *buyer side* of a vehicle auction
  platform. Core requirements are browsing/search, a vehicle detail view, and a bid flow
  with visible state updates. Frontend-only is explicitly allowed; no auth needed.
  Timebox is 3-4 hours of focused work.
- **Chose the stack: React + Vite + TypeScript.**
  - Why: it's frontend-only friendly (no backend needed — the dataset is a static JSON
    file), it's the stack OPENLANE's own README suggests as an example, and it's a good
    fit for learning React/TS hands-on since the app is small enough to reason about
    end-to-end.
- **Chose bid persistence: in-memory React state (not `localStorage`, not a mock backend).**
  - Why: satisfies "bid flow with updated visible state" without adding persistence
    complexity that isn't required. Keeps the scope inside the timebox. This is a
    documented, intentional trade-off (bids reset on refresh) rather than an oversight.
- **Started three docs to track the project as we build:**
  - `technologies.md` — plain-English explanations of each technology in the stack, since
    React/Vite/TypeScript are new.
  - `BUILD_LOG.md` (this file) — chronological decision log.
  - Code comments — kept brief, added as we go, aimed at making the walkthrough easy
    (explaining *why*, not restating *what* the code obviously does).

## 2026-08-17 — Dev environment

- **Read `scripts/generate_vehicles.mjs`** to understand exactly how `data/vehicles.json`
  was generated (200 vehicles, deterministic seeded RNG). This pinned down the full field
  list and types for every vehicle: identity (`id`, `vin`, `lot`), spec fields (`year`,
  `make`, `model`, `trim`, `body_style`, `engine`, `transmission`, `drivetrain`,
  `odometer_km`, `fuel_type`, colors), condition fields (`condition_grade`,
  `condition_report`, `damage_notes`, `title_status`), auction/pricing fields
  (`auction_start`, `starting_bid`, `reserve_price` | null, `buy_now_price` | null,
  `current_bid` | null, `bid_count`), and listing fields (`province`, `city`,
  `selling_dealership`, `images`). This will become the `Vehicle` TypeScript type.
- **Scaffolded the app with `npm create vite@latest -- --template react-ts`** into a
  temp sibling folder, then merged the generated files (`src/`, `public/`, `package.json`,
  `vite.config.ts`, `tsconfig*.json`, `.oxlintrc.json`, `index.html`) into the repo root —
  done this way so the scaffolder didn't overwrite `README.md`, `SUBMISSION.md`,
  `WALKTHROUGH.md`, or our existing `.gitignore`.
  - Landed on React 19, Vite 8, TypeScript ~6, and `oxlint` (the template's default linter,
    a faster Rust-based alternative to ESLint) — noted in `technologies.md`.
- **Decision: import `data/vehicles.json` directly as a module** rather than duplicating it
  into `public/` and `fetch`-ing it at runtime. Vite supports importing `.json` files
  directly, giving a single source of truth (no risk of the copy drifting from the
  original) and simpler code (no loading/error state needed just to read local static
  data). Considered copying into `public/data/` to simulate a "real" API fetch, but that
  adds complexity the challenge doesn't ask for.
- **Verified the dev server boots**: `npm install` (27 packages, 0 vulnerabilities),
  `npm run dev` served the default Vite/React starter page with an HTTP 200.

### Next up
- Design the information architecture: screens/routes (inventory list, vehicle detail),
  and decide whether to bring in a router (e.g. React Router) or keep it single-page.
- Define the `Vehicle` TypeScript type from the dataset shape above.
- Strip the Vite/React starter boilerplate (`App.tsx`, `App.css`, demo assets) and start
  building real components.

## 2026-08-17 — Verified dev server manually

- Started `npm run dev` and confirmed HTTP 200 on `http://localhost:5173/` so the user
  could open it in a browser and see the default Vite/React starter page rendering.
- Killed the dev server afterward per standing instruction: never leave the dev server
  running unattended, always shut it down at the end of a session.

## 2026-08-17 — Visual design research

- User wants to design before developing (header/footer placeholders, focus on the
  vehicle listing + detail/bid experience), inspired by OPENLANE's own marketplace and
  other popular auction sites, "function over form" — nothing flashy.
- Researched OPENLANE's public site and IAAI (auction site) for visual/UX patterns since
  exact brand hex codes aren't published anywhere accessible:
  - **OPENLANE**: blue-based primary palette over white/gray neutrals; card-based
    marketplace listings with colored status tags ("Off-lease exclusive," "Buy Now" /
    "SOLD" buttons); bold hierarchical typography; tone is "professional yet
    approachable" and speed/efficiency-focused ("Wholesale made easy").
  - **IAAI** (auction site comparison): card-based listings with photo, year/make/model/
    trim, Buy Now price, transmission, mileage, damage type, condition notes; prominent
    header search; white background, dark text, blue accents for interactive elements.
  - Couldn't get exact brand hex codes (no public brand/style guide found, Brandfetch
    page returned 403). Proceeding with a professional blue/white/neutral-gray palette
    approximated from the research above rather than pixel-exact brand colors — flagged
    to the user so it can be corrected against real OPENLANE brand assets later if they
    have access to them.
- Next: build 3 distinct layout directions as an HTML mockup (header/footer placeholders
  + inventory listing + detail concept) for the user to compare and pick from before any
  React component code gets written.

## 2026-08-17 — Three design concepts, published for review

- Pulled 12 real vehicles straight out of `data/vehicles.json` (varied makes, title
  statuses, bid states, an EV, a buy-now listing) to use as content in the mockups instead
  of placeholder/lorem text.
- Built one interactive HTML comparison artifact with a top switcher so all three
  directions could be reviewed side by side, sharing the same dummy header/footer/colors:
  - **A — Auction Floor**: dense sortable table rows, filters pinned in a left sidebar.
    Closest to professional bidding tools like Copart/IAAI — optimized for scanning a lot
    of inventory fast.
  - **B — Marketplace Grid**: photo-forward card grid with a horizontal filter bar, closer
    to OPENLANE's own card-based marketplace style — more whitespace, browsing-as-shopping
    feel.
  - **C — Split Console**: a persistent vehicle list next to a live detail + bid panel, no
    page navigation required to go from browsing to bidding — inspired by trading-terminal
    style tools, aimed at a buyer bidding on many lots in one sitting.
  - Clicking a row/card (A, B) opens a shared slide-over detail drawer; clicking a list item
    in C swaps an inline detail pane. All three wire up a *working* bid panel (in-memory,
    matching our state decision) so the interaction — not just the visual layout — could be
    evaluated, not just the visuals.
- **Color/type decisions**: since no public OPENLANE hex codes were available (see prior
  research entry), used a professional deep-blue ("harbor") primary over white/cool-grey
  neutrals, with a warm amber reserved specifically for auction urgency (current bid,
  "ends in" labels) — a deliberate cool-chrome/warm-urgency split rather than one accent
  color for everything. Typography uses the system UI font stack for headings/body (no
  custom webfonts — keeps it fast and matches the "function over form" direction) and a
  monospace stack with tabular numbers specifically for VIN/lot/odometer/bid figures, to
  read like auction paperwork.
- Published as a Claude Artifact for the user to open and pick a favorite before any of
  this becomes real React components.

## 2026-08-17 — Picked Option A, reworked the detail interaction to an accordion

- User picked **Option A (Auction Floor)** as the layout direction, but rejected the
  slide-over modal for vehicle detail — didn't like losing the list context behind an
  overlay.
- Reworked the artifact to drop Designs B, C, and the modal/drawer entirely, and rebuilt
  the detail experience as an **inline accordion**: clicking a lot row expands it in place
  (pushes rows below down, no overlay) to reveal full spec/condition/damage detail and a
  working bid panel; clicking the row again, or opening a different lot, collapses it.
  - Implemented as a classic single-open accordion (only one lot expanded at a time) — this
    keeps the list scannable rather than letting many detail panels pile up. If multiple
    lots open at once turns out to be more useful once we see this in the real app, that's
    a cheap change later since it's just gating `expandedIndex` to a `Set` instead of a
    single value.
  - Animated with the CSS `grid-template-rows: 0fr → 1fr` technique rather than measuring
    pixel heights in JS — smoother and avoids a "flash of wrong height" on first open.
    Respects `prefers-reduced-motion` (transition is disabled for users who request it).
  - Bid panel logic (validation, in-memory state update) is unchanged from the previous
    version, just now rendered inside the accordion instead of a drawer — placing a bid
    updates the row's current bid live and keeps that same lot expanded so the user sees
    the result immediately.
- Redeployed to the same artifact URL (in place) rather than publishing a new one, since
  this is an iteration on the same review, not a separate deliverable.

## 2026-08-17 — Made the expanded lot clearly stand out

- User feedback: the open vs. closed rows were too hard to tell apart — the only signal
  was a faint background tint, which was easy to miss (and got undercut by the zebra-stripe
  row shading on even rows, since that rule's CSS specificity was actually winning in some
  cases).
- Replaced the single subtle tint with several stacked, unambiguous cues on the expanded
  row + its accordion panel together:
  - a solid blue left accent bar (`border-left`) running down both the row and its open
    panel, so the pair reads as one connected unit
  - a lifted drop shadow on the expanded item, so it visually pops off the flat list
  - the row's background switches to solid white/surface (overriding zebra striping
    reliably now, since the expanded rule is intentionally ordered after the striping rule
    at equal specificity) instead of blending into the alternating row colors
  - the chevron is now a filled circular badge that inverts to solid blue + white icon when
    open, instead of just rotating and changing color — a clearer on/off toggle affordance
  - the row's title text tints toward the brand blue when expanded, for one more small,
    consistent signal
- Redeployed to the same artifact URL.

## 2026-08-17 — Reworked expanded-state cues to not rely on color alone

- User feedback: the page leaned on several shades of blue to signal state (hover tint,
  expanded tint, accent bar), and that's hard to tell apart for visually impaired users —
  color-only differences are a real accessibility problem (low vision, color blindness),
  not just a taste issue.
- Replaced the blue-tint-based signaling with cues that read by contrast and shape, not
  hue:
  - **Expanded row**: solid 2px dark (ink) border + rounded corners + real drop shadow,
    forming an unmistakable card that pops out of the flat list — works even if someone
    can't distinguish blue from the surrounding grey/white at all.
  - **Hover**: switched from a blue tint to the same neutral grey used for row striping, so
    blue is no longer reused for two different meanings (hover vs. "this one is open").
  - **Toggle affordance**: added a visible text label ("Details" → "Hide") next to the
    chevron, so the open/closed state has a textual signal, not just an icon/color change.
    The chevron itself switched from a blue fill to a neutral dark (ink) fill when open.
  - Toned down incidental blue elsewhere (the review banner background) since the goal was
    fewer competing blues overall, not just fixing the one state indicator.
  - On mobile, the text label hides (space-constrained) and the bordered-card treatment
    plus chevron carry the signal alone.
- Redeployed to the same artifact URL.

## 2026-08-17 — Explicit white background on the expanded card itself

- User felt the bordered-card treatment alone wasn't enough. The row and accordion panel
  inside the expanded card were already set to white (`var(--surface)`), but the outer
  wrapper (`.lot-item.expanded`) had no background of its own — it was only implicitly
  white via its children, with the page background showing through anywhere those
  children didn't fully cover (e.g. at the rounded corners). Set an explicit white
  background directly on the outer card element so the whole expanded item is solidly
  white with no gaps, not just white-by-inheritance.
- Redeployed to the same artifact URL.

## 2026-08-17 — Found the real bug: "white" was a theme token, not literal white

- User reported the expanded background still wasn't white after the previous fix. Root
  cause: every previous attempt set the background to `var(--surface)` — which *is* white
  in light mode, but the page also defines a dark-mode palette where `--surface` resolves
  to a dark navy (`#121D2C`). If the browser/artifact viewer is in dark mode (or the OS is
  set to dark, since the page follows system theme by default), that "white" background
  was rendering as dark navy the whole time — the CSS was internally consistent, it just
  wasn't literal white.
- Fixed by re-declaring the color tokens directly on the expanded card (`.lot-item.expanded`)
  to their light-mode values, so this specific card is pinned to a literal white surface
  with readable dark text regardless of the page's active theme — every descendant (row,
  accordion detail, badges, bid form) inherits the same overridden tokens automatically
  since they're plain CSS custom properties. This is a deliberate exception to the page's
  normal light/dark theming, scoped to just this one "always-white, always-on-top" state.
- Lesson for the real app: when a design calls for "this element is always white/light no
  matter what," don't reach for the theme token that happens to equal white right now —
  either hardcode the literal color or explicitly scope-override the tokens like this, so
  it doesn't silently break under dark mode.
- Redeployed to the same artifact URL.

## 2026-08-17 — Off-white instead of pure white, and fixed a real contrast bug

- User feedback once the white fix landed: pure `#FFFFFF` felt too stark, and some of the
  secondary text inside the expanded card was hard to read against it.
- Changed the expanded card's `--surface` token from `#FFFFFF` to a soft off-white
  (`#F7F9FB`) — still reads as clearly "the highlighted one," less harsh.
- The secondary-text complaint was a genuine contrast bug, not just taste: `--slate-soft`
  (`#8194A6`, used for the small uppercase spec labels, badge text, and meta labels) only
  reaches about **3:1 contrast against white** — below the WCAG AA minimum of 4.5:1 for
  normal-size text. Darkened it to `#5A6E82` (~5.3:1), which clears the bar with margin
  while staying visibly a step lighter than the primary `--slate` text color
  ([[feedback_accessibility_color]]-adjacent: another case where a token that *looked*
  fine wasn't actually accessible until checked against real contrast ratios).
- Redeployed to the same artifact URL.

## 2026-08-17 — Exact background color for the expanded item

- User specified `#E1E4E7` directly for the expanded card's background instead of the
  off-white. Set `--surface` (scoped to `.lot-item.expanded`) to that value — since every
  expanded-card element derives its background from that one token, this was a single-line
  change. Text contrast only improves versus the previous off-white (darker background,
  same dark text), so no follow-up contrast fix needed here.
- Redeployed to the same artifact URL.

## 2026-08-17 — --slate to pure black

- User asked for `--slate` (secondary text — VIN/lot line, spec values like odometer and
  drivetrain) to be pure black (`#000000`) within the expanded card, for maximum
  visibility. One-line token change; `--slate-soft` (the even-lighter label color) is
  unchanged for now.
- Redeployed to the same artifact URL.

## 2026-08-17 — --slate-soft to pure black too

- User asked for `--slate-soft` (uppercase spec labels, badge text, meta labels) to also
  go pure black. Now `--slate` and `--slate-soft` are identical inside the expanded card,
  so the two text weights (primary vs. label) read at the same darkness — the remaining
  visual hierarchy between them comes from size/weight/letter-spacing rather than color.
- Redeployed to the same artifact URL.

## 2026-08-17 — Hover color was competing with the zebra striping

- User feedback: hovering an unexpanded row was confusing against the alternating
  row-stripe shading — both hover and the even-row stripe used the same
  `var(--surface-alt)` grey, so it was hard to tell "this row is hovered" from "this is
  just an even row."
- Changed hover to match the expanded card's own background (`#E1E4E7`) instead of the
  stripe color. This fixes the ambiguity and has a nice side effect: hovering a row now
  previews the exact shade it'll turn into once you click it open.
- Redeployed to the same artifact URL.

## 2026-08-17 — Hover fix only worked on odd rows — a real specificity bug

- User reported the new hover color only applied to every other row. Root cause: the
  even-row zebra-stripe selector (`.lot-item:nth-child(even) .lot-row`) is three
  selectors deep, giving it higher CSS specificity than the plain `.lot-row:hover` (two
  selectors). Specificity beats source order, so on even rows the stripe color kept
  winning over hover regardless of where the hover rule sat in the stylesheet — hover
  only visibly worked on odd rows, which had no competing zebra rule to fight.
- Fixed by bumping the hover selector to `.lot-item .lot-row:hover`, matching the zebra
  rule's specificity so the (later, in source order) hover rule wins the tie on every row.
- Redeployed to the same artifact URL.

## 2026-08-17 — Hover text was still light — same bug class as the white-background issue

- User: hover background looked right on all rows now, but the text inside a hovered row
  was still displaying in a light, hard-to-read color.
- Same root cause as the earlier "white wasn't actually white" bug: `.title`, `.sub`,
  `.specs`, `.bid-amt`, and `.bid-meta` all read their color from the `--ink`/`--slate`/
  `--slate-soft` theme tokens, which are intentionally *light* in dark mode (they're built
  for light text on a dark row background). The hover rule only changed the background,
  not those text tokens, so dark-mode users ended up with light text on a now-light
  background.
- Fixed by pinning `--ink`, `--slate`, and `--slate-soft` to dark values directly on the
  hover rule (mirroring what the expanded card already does), so hover text stays legible
  regardless of the page's active theme.
- **Checked contrast, not just "looks fine":** the user asked that accessibility be
  verified going forward, not assumed. `#10202E` and `#000000` against the `#E1E4E7` hover
  background (relative luminance ≈ 0.79) both land above ~15:1 — comfortably past WCAG
  AA's 4.5:1 floor for normal text and AAA's 7:1. Noted in [[feedback_accessibility_color]]
  as a standing practice for this project going forward, not a one-off check.
- Redeployed to the same artifact URL.

## 2026-08-17 — pill-neutral badge wasn't reacting to row hover

- User: the `pill-neutral` badge (the "No Reserve" / "Reserve Not Met" tag) doesn't change
  at all on row hover, and asked to set its text color to match the row hover background
  color (`#E1E4E7`).
- Flagged before implementing literally: the pill's own background is fixed at
  `var(--surface-alt)` (~`#EEF1F5`), independent of the row. Setting its text to `#E1E4E7`
  against that near-identical light background would land around **1.1:1 contrast** —
  effectively invisible, not just "hard to read." Asked the user how they wanted it
  handled given that conflict with the "always test accessibility" rule from the previous
  entry.
- User chose: keep the hover-reactive intent, but stay legible. Implemented as a dark
  background (`#10202E`) with the original hover accent (`#E1E4E7`) as the text color —
  same idea as "match the hover state," just inverted into a readable pairing, echoing how
  the chevron badge already flips to a solid fill on interaction. Contrast ≈ 13:1.
- Redeployed to the same artifact URL.

## 2026-08-17 — Price Range inputs overflowed the sidebar

- User: the Min/Max number inputs in the sidebar filters break out of the 240px sidebar
  instead of staying on one line.
- Root cause: `<input type="number">` has a browser-default intrinsic width that
  `display: flex` alone doesn't shrink — flex items ignore percentage/flex-basis sizing on
  their main axis unless `min-width: 0` resets their default `min-width: auto`. The two
  inputs were each rendering at their native default width and pushing past the sidebar
  edge regardless of the flex container around them.
- Fixed with `flex: 1 1 0; min-width: 0; width: 100%;` on the inputs so they actually share
  the row's available space, tightened their padding slightly, and removed the native
  spin-button arrows (`::-webkit-inner/outer-spin-button`, `-moz-appearance: textfield`) to
  reclaim a little more width for the digits. Added a narrow-phone fallback (`max-width:
  340px`) that lets the pair wrap to two lines and hides the "–" separator, per the user's
  note that wrapping on mobile is fine.
- Redeployed to the same artifact URL.

## 2026-08-17 — Full accessibility + color pass ("too many blues")

User asked for a dedicated 20-minute design pass: another accessibility sweep, and a
rethink of the color theme since it still felt too blue-heavy overall (not just the
expanded-row fixes from earlier). Read through the whole file to catalog everything, not
just spot-fix the last complaint.

**Removed blue as a UI color entirely.**
- Deleted the `--harbor` / `--harbor-deep` / `--harbor-soft` tokens from both themes (and
  a leftover dead copy of them inside the expanded card's override block that wasn't even
  being used anymore).
- Replaced every usage — primary buttons, nav link hover, focus rings — with `--ink` /
  `--paper` instead of inventing a new accent color.
- **First attempt was wrong, caught before shipping:** initially added a *fixed* `--accent:
  #10202E` (not redefined per theme), same "pin it so it doesn't flip" technique used for
  the expanded card. But that technique only works when the surrounding element (the
  expanded card) is also pinned light. For page-level elements like buttons/links/focus
  rings that sit directly on the ambient (theme-flipping) background, a fixed dark value
  would have ~1:1 contrast against a dark-mode page — nearly invisible, the exact bug this
  whole review is about. Caught it by explicitly checking dark-mode contrast before
  shipping, per the "test for accessibility, always" rule.
  - Fixed properly: `--ink` and `--paper` are already defined as an opposite pair in each
    theme (dark ink / light paper in light mode, and inverted in dark mode). Using them
    directly for text/links/focus rings, and using the *pair* (`background: var(--ink);
    color: var(--paper);`) for the primary button, means every one of these elements
    inverts correctly against its surroundings in both themes automatically — no fixed
    color, no dark-mode special case needed.
  - Link hover also gained an underline (not just a color/weight change) — another
    color-alone reliance the earlier accessibility pass had missed on this element
    specifically.
- Amber remains the only hue-based accent, still reserved for auction urgency signals.

**Real accessibility bugs found and fixed, independent of color:**
- Global `--slate-soft` (light mode) was still `#8194A6` (~3:1 against white) — the
  earlier fix only patched this token inside the expanded card's scoped override, never
  the base value everyone else on the page inherits. Darkened it to `#5A6E82` (~5.3:1),
  fixing the sidebar's "Filter Inventory" / "Title Status" / "Sort" headings.
- Filter `<label>` elements weren't programmatically associated with their `<select>`
  (no `for`/`id`) — a screen reader focusing the dropdown wouldn't announce what it's
  for. Added `id`/`for` pairs for Make and Body Style; Price Range doesn't map to a
  single control, so it became a `role="group"` with `aria-labelledby`, and each
  Min/Max input got its own `aria-label`. Sort has no visible `<label>` at all (just an
  `<h3>` above it, which isn't programmatically tied to anything) — gave it
  `aria-label="Sort by"` directly.
- Header search input had no accessible name — just a placeholder (which isn't a
  reliable substitute for a label) and a decorative magnifying-glass emoji. Added
  `aria-label="Search inventory"` and hid the emoji from assistive tech.
- Decorative icons (chevron, photo-count camera icon) were exposed to screen readers
  with no meaning — added `aria-hidden="true"`. The photo-count badge now carries its
  real meaning via `aria-label="N photos"` on the wrapping element instead, so hiding the
  icon doesn't remove information, just noise.
- The bid amount input had no label at all (`aria-label="Bid amount in dollars"` added).
- The bid form's success/error message updates dynamically via JS but wasn't a live
  region, so a screen reader user placing a bid would never hear the confirmation or
  error. Added `role="status" aria-live="polite"`.

Redeployed to the same artifact URL.

## 2026-08-17 — pill-neutral disappeared on even rows

- User: on even rows, the `pill-neutral` badge's background matches the row's background,
  so the badge doesn't visibly display as a distinct chip.
- Root cause: `pill-neutral` and the even-row zebra stripe both use the exact same token,
  `var(--surface-alt)` — one for the badge fill, one for the row background. On an even
  row they're literally the same color, so the badge's boundary disappears (only its text
  stays visible, floating with no chip shape around it). The other pill variants
  (good/warn/bad) don't have this problem since their tinted backgrounds are hue-distinct
  from any grey row background — only the "colorless" neutral variant shares a hue family
  with the row stripes closely enough to coincidentally collide.
- Fixed with a border rather than picking a new fill color that happens not to collide
  today: `border: 1px solid var(--slate-soft)` makes the badge read as a shape regardless
  of what's behind it (odd row, even row, hover, expanded card), rather than depending on
  a background mismatch that could re-collide later if any of those surface colors change.
  Trimmed the padding by exactly the border width (3px/8px → 2px/7px) so the badge's outer
  footprint still lines up with its borderless siblings when they sit together in the same
  badge row.
- Redeployed to the same artifact URL.

## 2026-08-17 — Auto-sort listings by soonest-ending auction

- User: the listing should load sorted with the soonest-ending auctions first.
- The mockup's `timeLabel` field (e.g. "Ends in 4h", "Starts in 6h") was always just
  display flavor text with no backing numeric data — nothing to actually sort by. Added
  two real fields per vehicle: `live` (already started vs. not yet) and `minutesToEvent`
  (minutes until it ends, if live; minutes until it starts, if not), each set to match
  the existing label text.
- Sort rule: live auctions first, ascending by time-until-end; not-yet-started auctions
  after all of them (they can't be "ending soon" if they haven't started), ascending by
  time-until-start among themselves. Implemented as `orderedVehicles()`, which sorts a
  `{v, i}` pairing (vehicle + its original array index) rather than sorting the `vehicles`
  array in place — `expandedIndex`, the accordion's open/closed state, and the bid panel's
  `data-i` wiring all key off the *original* index, not display position, so re-sorting
  the visual order on every render doesn't disturb which lot is expanded or which vehicle
  a bid updates.
- Noted in a code comment: in the real React app this ordering should come from actual
  `auction_start` timestamps normalized against "now" (exactly what the challenge README
  suggests for handling the dataset's synthetic scheduling data), not a fabricated
  parallel field — `minutesToEvent` is a mockup stand-in for that computation.
- Redeployed to the same artifact URL.

## 2026-08-17 — Separated Sort from Filters

- User's call: filtering (narrows *what's* in the list) and sorting (only reorders
  whatever's already there) are different operations and shouldn't share one control
  cluster. Moved the "Sort by" dropdown out of the sidebar and into the `listing-toolbar`
  above the results, next to the result count.
- Filters sidebar is now purely about filtering (Make, Body Style, Price Range, Title
  Status) — no more mixed-purpose "Filter Inventory + Sort" grouping.
- Restructured the toolbar into two flex groups (`toolbar-info` for the count/province
  text, `sort-control` for the label + select) instead of loose flat spans, so it still
  lays out cleanly with three pieces of content instead of the original two, and wraps
  reasonably on narrow screens.
- Gave the sort select a real visible `<label for>` association instead of the
  `aria-label` it had in the sidebar — now that there's a proper visible label, the
  `aria-label` would've been redundant.
- Redeployed to the same artifact URL.

## 2026-08-17 — Added a `.container` pattern to header/body/footer

- User's usual convention: each full-width section gets an inner "container" div so its
  background/border can stay full-bleed while the actual content is width-capped and
  centered, rather than baking a max-width directly onto the section itself.
- Added a single shared `.container` rule (`max-width: 1920px; width: 100%; margin: 0
  auto;`) and wrapped the contents of `.site-header`, `.body`, and `.site-footer` (after
  the user added footer to the request) each in a `<div class="container">`.
- The layout-specific CSS that used to live directly on those section elements moved down
  one level to the container instead: `.site-header`'s flex row is now
  `.site-header .container`, `.body`'s grid is now `.body .container`, and
  `.site-footer`'s flex row is now `.site-footer .container`. The section elements
  themselves now only carry background/border/spacing — nothing about internal layout.
  Updated the one mobile media-query rule that referenced `.body`'s grid columns to match
  (`.body .container { grid-template-columns: 1fr; }`).
- Left the meta-only review banners (`.statusbar`, `.concept-note`) uncontained, since
  they aren't part of the actual product and weren't part of the request.
- Redeployed to the same artifact URL.

## 2026-08-17 — Header/body spacing: padding on the section, not margin on the container

- User wanted breathing room between the header and body, and asked what the best
  practice was rather than just dictating an approach (their usual habit is `margin-top`
  on the `.container`).
- Recommended `padding-top: 32px` on `.body` instead, and explained why: `.body` currently
  has no background/border of its own, so a top margin on `.container` would collapse
  straight through it and land visually *above* `.body` rather than inside it — invisible
  today, but the moment `.body` gains a background (a very plausible future change), the
  gap would suddenly render in the wrong place relative to that background. Padding on the
  section keeps the spacing unconditionally inside the section regardless of what gets
  added later, and keeps the same division of responsibility just established: section
  owns background/spacing, container owns width.
- Redeployed to the same artifact URL.

## 2026-08-17 — Spacing between the filter sidebar and the inventory listing

- User wanted breathing room between the filters sidebar and the listing — the two-column
  grid (`.body .container`) had `gap: 0`, so the sidebar's `border-right` was the only
  thing separating it from the listing content, sitting flush against it.
- Changed to `column-gap: 32px` (matching the header/body spacing value for consistent
  rhythm) instead of the shorthand `gap`, since this grid only ever has one row — there's
  nothing to `row-gap`. Left the sidebar's `border-right` divider in place; a subtle rule
  followed by generous space is a normal combination, not a conflict.
- Mobile is unaffected: `column-gap` has no effect once the layout collapses to a single
  column, and the existing `border-bottom` on `.filters` in the mobile media query already
  separates the stacked filters from the listing there.
- Redeployed to the same artifact URL.

## 2026-08-17 — Background on the listing toolbar

- User asked to apply `background: var(--surface-alt)` to `.listing-toolbar` (the bar
  holding the lot count and Sort control). One-line addition.
- Redeployed to the same artifact URL.

## 2026-08-17 — Header adjustments: white search bar, green Sign In CTA

- User: make the search bar a white background so it stands out, and change Sign In to
  green so it reads as a CTA.
- **Search bar**: pinned to a fixed `#FFFFFF` rather than `var(--surface-alt)` — in dark
  mode, `--surface-alt` was nearly the same dark tone as the header behind it, so the
  field didn't stand out there at all. Pinned the input's text color to a fixed dark value
  to match, same reasoning as the expanded card fix earlier: a background that doesn't
  flip with the theme needs text that doesn't either.
- **Sign In → green CTA**: confirmed `.btn-ghost` (the class Sign In was using) wasn't used
  anywhere else on the page before restyling it, so no other element was affected. Added a
  new `.btn-cta` class rather than overloading `.btn-ghost`'s name with a completely
  different visual meaning.
  - **Checked contrast before picking the green**, per the standing rule: white text
    against the existing `--good` token's dark-mode value (`#57B78C`, tuned to read as
    *text* on a dark surface, not as a fill) comes out to only ~2.5:1 — well under the
    4.5:1 floor. Used a fixed `#1B7A4D` instead (not tied to the theme), which keeps white
    button text at ~5.3:1 in both light and dark mode, independent of how `--good` happens
    to be tuned.
  - Left `.btn-ghost` itself defined and unused for now rather than deleting it — unlike
    the old `--harbor` tokens (which were tied to a rejected color direction), a ghost
    button is a normal reusable variant likely to be needed again as more of the app gets
    built.
- Redeployed to the same artifact URL.

## 2026-08-17 — Right-aligned the search bar next to Sign In / Register

- User: move the search bar to sit closer to the login/register buttons, right-aligned.
- The search bar previously had `flex: 1 1 260px` (grow enabled), so it stretched to fill
  whatever space was left between the nav links and the action buttons — visually
  floating in the middle of the header rather than sitting next to anything in particular.
  `.header-actions` also had its own `margin-left: auto`, which was fighting for the same
  "claim the leftover space" job.
- Moved `margin-left: auto` from `.header-actions` onto `.header-search` instead, and
  turned off the search bar's flex-grow (`flex: 0 1 320px`, was `1 1 260px`). An auto
  margin on a flex item pushes that item *and everything after it* to the far edge as one
  group — so search + the two buttons now move together as a unit, snug against the right
  edge, while the wordmark and nav stay put on the left.
- Redeployed to the same artifact URL.

## 2026-08-17 — Mobile layout was genuinely broken, not just rough

- User flagged the mobile view looked bad. Went looking rather than guessing — found a
  real CSS bug, not a polish issue: the mobile `.lot-row` rule defined a
  `grid-template-areas` with named regions for `title`, `specs`, and `bid`, but only two
  of the row's six actual children (`.photo-ph`, `.toggle`) ever had a matching
  `grid-area` assigned to them. The title block, both spec groups, and the bid column had
  nowhere they were told to go, so CSS Grid's auto-placement fell back to stacking them
  into leftover cells — overlapping content instead of a clean list. This had been broken
  since the very first mobile pass earlier in the session and was never actually checked
  at a mobile viewport width, only reasoned about.
- Fixed by giving every child an explicit area. Also split what used to be a single
  ambiguous "specs" area into two real ones (`specs1`/`specs2`), since there are two
  separate `.specs` divs (vehicle specs vs. dealer/reserve) that can't both map to one
  named region without colliding — added `.specs-vehicle` / `.specs-listing` classes in
  the row template (previously they were only distinguishable by DOM position) and a
  `.lot-title` class on the previously-unclassed title wrapper div, specifically so mobile
  CSS would have something reliable to target. Each spec group and the bid row now gets
  its own full-width line instead of being squeezed into a narrow desktop-style column.

## 2026-08-17 — Prioritize price at the top of the mobile accordion

- User: the accordion's expanded content should put price near the top on mobile, not
  after a full scroll through spec/condition/damage text.
- Reordered the actual markup in `detailContentHtml()` so the bid panel comes *before*
  detail-main in the DOM (opposite of the old order), then added `order: 1`/`order: 2`
  (scoped to `@media (min-width: 861px)` only) to restore the familiar left/right desktop
  layout regardless of that DOM order.
  - Chose this over the more common shortcut — leaving DOM order alone and just adding
    `order: -1` to the bid panel inside the mobile media query — because `.detail-body`
    is a grid at every width, so visual order and reading/tab order would permanently
    disagree on mobile: sighted users would see price first, but a keyboard or screen
    reader user would still hit the full spec/condition/damage write-up before ever
    reaching it. Putting bid-panel first in the actual markup means mobile's natural,
    un-overridden order already matches what a keyboard/AT user encounters — visual and
    reading order agree exactly where it matters most (mobile, the more linear/scroll-
    driven context). Desktop is the one accepting an `order`-based visual override
    instead, which is a much more common, lower-stakes place for that pattern.
  - **First attempt at the desktop `order` override was itself a bug**: the `order: 1`/
    `order: 2` rules were originally unscoped, so they applied at every width — since
    `.detail-body` stays a grid on mobile too, that would have silently put detail-main
    back in front on mobile and undone the whole fix. Caught by re-reading what I'd just
    written before shipping it, and scoped the rule to `@media (min-width: 861px)`.
- Redeployed to the same artifact URL.

## 2026-08-17 — Committed the design mockup into the repo

- User wants to be able to map the design process for the OPENLANE walkthrough, not just
  keep it in an external, private Claude Artifact link.
- Copied the mockup HTML into a new `design/` folder (`design/inventory-listing-mockup.html`)
  — self-contained, opens directly in a browser, no build step. Added `design/README.md`
  summarizing what it is, the path it took (3 layout directions → accordion → accessibility
  pass → color pass → mobile fixes) and pointing to this file for the full dated reasoning,
  plus the original Artifact link (flagged as private-by-default, so the committed file is
  the reliable copy for anyone else who clones the repo).

## 2026-08-17 — Started wiring up the real React app

Began translating the finalized, accessibility-vetted mockup into actual components.
Paused partway through to save/commit/push — see `PROGRESS.md` for exactly what's built
and what's left, this entry covers the reasoning behind what got done.

- **`src/types/vehicle.ts`**: hand-written `Vehicle` interface matching `data/vehicles.json`
  exactly (cross-checked against `scripts/generate_vehicles.mjs` from the earlier dataset
  research), with real union types (`BodyStyle`, `Transmission`, `Drivetrain`, `FuelType`,
  `TitleStatus`) instead of bare `string`.
- **Importing `data/vehicles.json` directly** (the decision made on day one) needed two
  tsconfig changes to actually work: `resolveJsonModule: true`, and adding `"data"` to
  `include` alongside `"src"` — the dataset lives at the repo root, a sibling of `src/`,
  and TypeScript's `tsc -b` (part of `npm run build`) would otherwise refuse to type-check
  a file outside its configured root. `src/data/vehicles.ts` imports the raw JSON and
  asserts it as `Vehicle[]` — an assertion, not a runtime check, which is fine since we
  control both the generator script and the type definition.
- **`src/index.css`** now holds the real design tokens, ported directly (exact hex values)
  from the vetted mockup — every accessibility fix from the design phase (darkened
  `--slate-soft`, no `--harbor` blue tokens, etc.) carries over automatically rather than
  needing to be re-discovered inside React.
- **Styling approach: CSS Modules**, one `.module.css` per component, colocated with its
  `.tsx` file. No new dependency (Vite supports it natively), keeps styles scoped without
  needing a styling library. Explained in `technologies.md` since this is new to the
  stack. Shared *tokens* (colors) stay in the global, non-module `index.css` so every
  component's module can reference `var(--ink)` etc. — only layout/component-specific CSS
  is module-scoped.
- **Real `<img>` tags instead of the mockup's CSS placeholder divs.** The mockup used
  diagonal-stripe placeholders because the Claude Artifact sandbox's CSP blocks external
  image requests — that constraint doesn't exist in the real app, and the dataset's
  `images` arrays (placehold.co URLs) are explicitly meant to be used as vehicle photos
  per the challenge README. Built `PhotoThumb` (row thumbnail + photo-count badge) and
  `PhotoGallery` (hero image + clickable thumbnail strip, local `useState` for which photo
  is selected) — a small scope increase over the mockup, but it's what "photos" in the
  core requirements actually calls for. Both fall back to a text placeholder via
  `onError` if a photo URL fails to load, instead of showing a broken-image icon.
- **No explicit auction-end timestamp in the dataset** — only `auction_start`. Introduced
  a documented assumption (`src/lib/auction.ts`): auctions run 24h from start. Combined
  with the same "normalize against now" idea from the mockup's `minutesToEvent`, but now
  driven by the *real* `auction_start` field: `getScheduleOffsetMs` finds the earliest
  `auction_start` across the whole dataset and computes one fixed offset that re-anchors
  it to ~45 minutes from whenever the app loads, preserving the relative spacing the
  generator authored (which lots are close together vs. days apart) while fixing the
  "every auction is already over" problem the raw stale timestamps would otherwise cause.
  This assumption will also go in `SUBMISSION.md`.
- **Shared primitives built**: `Button` (primary/ghost/cta variants — cta is the fixed
  contrast-checked green from the mockup), `Pill` (status badges), `BidPanel` (bid form +
  validation + live-region confirmation message, functionally identical to the mockup's
  vanilla-JS version but as a controlled React component).
- **`App.tsx` is a placeholder for now** — deleted the Vite starter boilerplate
  (`App.css`, demo assets) and replaced it with a minimal component that just imports and
  counts the real vehicle data, proving the whole pipeline (JSON → typed `Vehicle[]` →
  component) compiles and runs. This was deliberate before pausing: verified with
  `npx tsc -b` (clean) and a dev-server smoke test (HTTP 200, `App.tsx` transforms
  correctly) so the repo is left in a genuinely working state, not a broken
  half-edited one, at the commit that gets pushed.
- Dev server was started only to smoke-test, then shut down immediately per the standing
  rule — confirmed no vite process left running before moving on.
