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

## 2026-08-17 — Finished wiring up the app

Picked up from `PROGRESS.md` and built out the rest of the component tree, then wired
everything together in `App.tsx`. The app is now functionally real, not a placeholder —
browsing, search, filtering, sorting, the accordion, and bidding all work end-to-end.

- **`VehicleDetail`**: the accordion's expanded content (photo gallery, badges, VIN/dealer
  line, spec grid, condition report, damage notes, `BidPanel`). Kept the mobile-first DOM
  order decision from the mockup exactly: the bid panel is the *first* element returned in
  this component's JSX, detail-main second — opposite of how they read on desktop.
  Desktop restores the familiar left/right layout via CSS `order`, scoped to
  `@media (min-width: 861px)` only, so mobile's natural (un-reordered) stacking is what
  puts price first — matching what a keyboard/screen-reader user reaches first too, not
  just what's visually on top. Ported the reasoning as a comment directly in
  `VehicleDetail.module.css` so it doesn't get "simplified away" by mistake later.
- **`VehicleRow`**: the collapsible row + accordion wrapper. Ported the *fixed* mobile
  `grid-template-areas` (every one of the row's six children now has an explicit area —
  the original mockup version only assigned two of them and silently overlapped content,
  see the entry from earlier in this file) rather than the original broken version.
- **Cross-component CSS bug caught before it shipped**: `VehicleRow`'s hover state needs
  to restyle `Pill`'s neutral variant (so the "No Reserve" badge doesn't go invisible on
  hover, same issue as the mockup). First instinct was `:global(.neutral)` in
  `VehicleRow.module.css` — but CSS Modules hash class names per file, so `.neutral` from
  `Pill.module.css` compiles to something like `_neutral_a1b2c`, not the literal string
  `neutral`; a `:global()` escape doesn't make it reachable from a different module's
  stylesheet. Fixed by adding a plain `data-tone` attribute to `Pill`'s rendered element
  (not module-scoped, since attributes aren't touched by CSS Modules) and targeting
  `[data-tone="neutral"]` instead — works across module boundaries by design.
- **`Header`**, **`Footer`**, **`Container`**: mostly a direct port of the mockup's CSS.
  Pulled the `.container` max-width/centering pattern out into its own small shared
  component (`Container`) rather than repeating the same CSS Module rule in Header,
  Footer, and the main body layout — one definition, three places it's used.
  Header's search input is now a real controlled input (`value`/`onChange` wired to
  `App`-level `filters.search`) instead of the mockup's inert placeholder.
- **`FilterSidebar` — now functional, not decorative.** The mockup's Make/Body Style
  dropdowns only ever had 2-3 hardcoded sample options; the real one derives the full list
  from the actual dataset (`Array.from(new Set(vehicles.map(v => v.make)))`, sorted) so it
  can never drift out of sync with what's actually browsable. **Title Status defaults to
  all three checked** (Clean/Rebuilt/Salvage, i.e. show everything) — the mockup had only
  "Clean" pre-checked, but that was just a static visual choice for a screenshot, never a
  considered default; a first-time buyer should see the full inventory unless they
  narrow it themselves.
- **`ListingToolbar` — Sort is now real.** Four options (Ending Soonest, Price Low→High,
  Price High→Low, Newest Year) actually reorder the list via `compareVehicles` in the new
  `src/lib/sort.ts`.
- **`src/lib/filters.ts`**: `matchesFilters(vehicle, filters)` — search matches make,
  model, trim, VIN, and lot number (exactly what the search placeholder promises:
  "Search make, model, VIN, lot #"), plus make/body-style/price-range/title-status
  filtering. `effectivePrice()` (current bid if there is one, else starting bid) is
  shared between here and `sort.ts` rather than duplicated in both.
- **`App.tsx`** now owns all the lifted state: `vehicles` (mutable, for bids), `filters`,
  `sortBy`, `expandedId`. `expandedId` is keyed on the vehicle's `id`, not its array
  index or display position — filtering/sorting reorders the visible list on every
  keystroke, and an index-based key would silently point at the wrong vehicle the moment
  that happens. `visibleVehicles` (filtered + sorted) is derived with `useMemo`.
  `getScheduleOffsetMs` (the auction-timing normalization) is computed once from the
  original imported dataset, not recomputed on every render.
- **Lint**: `oxlint` flagged a real `react-hooks/exhaustive-deps` issue in `BidPanel` — an
  effect that reads `vehicle` but only listed two of its fields in the dependency array.
  Functionally harmless today (the object only ever changes as a whole, via a bid
  update), but exactly the kind of implicit assumption that turns into a real bug once
  the component's logic changes and nobody remembers the dependency array was relying on
  it. Fixed by depending on `vehicle` itself. Added `oxlint` to `technologies.md`.
- **Verification, properly this time**: installed Playwright locally (not part of the
  app's own dependencies — a throwaway verification tool) and drove the running dev
  server headlessly rather than just checking for an HTTP 200. Script: load the page,
  click a row, confirm the accordion's bid form appears, place a bid, confirm the
  "Bid placed at $X" confirmation renders, resize to a mobile viewport, and check
  `console --errors` the whole way through. Zero console errors.
  - **A screenshot briefly looked broken and wasn't** — a non-full-page screenshot taken
    right after expanding a row showed the row's expanded *styling* (border, "Hide" label)
    but none of the actual accordion content below it. Before treating that as a bug,
    scrolled the element into view and took a full-page screenshot instead: the content
    was there all along, just pushed below the original viewport's fold once the
    accordion opened. Worth remembering: a cropped screenshot after a layout-changing
    interaction is a common false alarm, not a rendering bug — confirm with a full-page
    or scrolled shot before chasing something that isn't broken. User also confirmed
    visually in a real browser that it matches the prototype exactly.
- Dev server was left running (at the user's request, to view it themselves) rather than
  shut down immediately this time — noted here since that's a deviation from the usual
  standing rule, not an oversight.

## 2026-08-17 — Back to design: rethinking the collapsed row (v2 concepts)

- User pushed back on the shipped-and-working row layout: crowded, disorganized, and not
  actually prioritized for who's using it. Explicit brief — design from the standpoint of
  **a dealer buying inventory**, not a casual browser. That reframes what "at a glance"
  should even contain: a dealer needs enough to decide *whether to click in*, not the full
  picture. Price and auction timing specifically need to be more prominent than they were.
- Re-derived the "at a glance" priority list from that persona rather than just tweaking
  existing spacing:
  - **Keep, prominent**: price (current bid / starting bid), auction timing/urgency, year/
    make/model/trim, condition grade, title status, odometer, location, reserve status.
  - **Keep, de-emphasized to a quick flag**: damage — a dealer needs to know *something's*
    noted, not the count-as-detail; a small "⚠ N noted" flag instead of nothing.
  - **Drop from collapsed view entirely, move to expanded-only**: full VIN string and the
    selling dealership name. Neither one is something a dealer decides on at a glance — VIN
    is a record-keeping detail for after they've decided to look closer, and dealership
    name is closer to paperwork than a buying signal. This was the single biggest source of
    clutter in the shipped row (VIN + lot + dealer name + reserve pill were all competing
    with price/timing for attention).
  - Also introduced a real **urgency tier system** instead of one flat amber-text
    treatment: `urgent` (≤1h left) gets an explicit filled "Ending Soon" badge on top of
    the color change, `soon` (≤6h) and `normal` get progressively less emphasis, and
    `upcoming` (not started yet) switches to neutral grey — amber is now reserved
    specifically for "this is live and counting down," never reused for "scheduled."
- Built 3 structurally distinct directions (not re-skins of the same DOM) as a new
  interactive mockup, `design/inventory-row-concepts-v2.html` once a winner's picked:
  - **1 — Price-Anchored Row**: same dense single-line list shape as the shipped version,
    but price + countdown are pulled into one unmistakable boxed stat block instead of
    small text in a corner; vitals collapse to one compact icon line (mileage, location,
    drivetrain, damage flag).
  - **2 — Dealer Card Grid**: trades density for scannability — a grid of cards where
    every card leads with a full-width price/timer band before the photo. Expanding a
    card inserts a full-grid-width detail band right after it in source order (still no
    overlay/modal, consistent with the earlier decision to reject that pattern).
  - **3 — Two-Zone Row + Auction Panel**: row splits into an identity/vitals zone and a
    bordered "Auction Panel" mini-widget that's a literal visual preview of the expanded
    bid box — same shape, same border — so expanding feels like that exact panel growing
    into the real bid form, not a different element appearing.
  - All three share the same 12-vehicle sample set as v1's mockup for direct comparability,
    and reuse the already-vetted color tokens (no new blue, amber's meaning now tightened
    per above).
- **Two real accessibility bugs caught before publishing, not after**:
  - All three designs' expanded states set a fixed light background (`#E1E4E7`, matching
    the shipped app) but the first draft never re-pinned the text tokens alongside it —
    exactly the dark-mode "light text on now-light background" bug fixed multiple times
    in the v1 mockup. Fixed by re-declaring `--ink`/`--slate`/`--slate-soft`/etc. on each
    design's expanded-state wrapper, same pattern as before.
  - The new "Ending Soon" badge used `var(--amber)` as a *fill* under white text — but that
    token is tuned for "amber as text on the page background," and its dark-mode value is
    deliberately brighter for that job. As a fill, it only hit ~2.25:1 with white text in
    dark mode. Same class of mistake as the Sign-In-button green from the real build; fixed
    the same way, with a fixed, contrast-checked value (`#96600A`, ~5.6:1 with white)
    instead of the theme-flipping token.
- One non-accessibility bug also caught: the hero-photo markup used a `.replace()` string
  hack to swap in a `detail-photo` class, which actually produced two `class` attributes on
  one element — HTML parsing silently drops the second, so the class never applied. Fixed
  by giving `photoPh()` a proper optional class parameter instead of string-patching its
  own output.
- Published as a **new** Claude Artifact (separate URL from the v1 mockup), not redeployed
  in place — this is explicitly a fresh round of concepts to pick from, not an iteration on
  a decided design.
- Not committed to git per explicit instruction — design exploration only until a direction
  is chosen; the winner gets saved into the repo as `design/inventory-row-concepts-v2.html`
  once picked, alongside (not replacing) the original v1 mockup.

## 2026-08-18 — Picked the Card Grid, swapped its detail view to a modal

- User picked **Concept 2 (Dealer Card Grid)**, but wants the detail view to open as a
  popover modal instead of the inline expand-in-grid behavior, and asked directly whether
  a modal was a good choice here — explicitly wanted real WCAG-compliant accessibility,
  not just a visual popover.
- **Answered the question, not just the request**: yes, for a card grid specifically —
  quick-view modals over a grid are a well-established pattern (Amazon/Etsy-style "quick
  look"), unlike over the dense table-row layouts from the very first design round, which
  is part of why those directions avoided a modal in the first place (the user rejected a
  slide-over drawer for the row-based Option A back on day one, specifically for losing
  list context behind an overlay). That tradeoff is still real for any true modal — it's
  just a more expected, more standard one for a card grid than it would be for a table row.
- Trimmed the mockup down to just the winning direction (same pattern as the very first
  round, where B/C were dropped once Option A was picked) — removed Concepts 1 and 3, the
  design switcher, and the `expanded` per-card state entirely, since a shared modal no
  longer needs the grid itself to re-render on open/close.
- **Built on the native `<dialog>` element rather than a hand-rolled overlay `<div>`**,
  specifically because it does most of the accessibility work for free:
  - `showModal()` traps focus inside the dialog automatically, closes on Escape
    automatically, and renders on the browser's top layer above everything else.
  - The element carries an implicit ARIA `dialog` role — no manual `role="dialog"` needed.
  - What's still on us, and what got built: an accessible name (`aria-labelledby`
    pointing at the vehicle title), focus moving into the dialog in a sensible order,
    focus returning to whichever card opened it when it closes, and click-outside-to-close.
  - **Focus order detail**: gave the dialog `tabindex="-1"` and focus it directly
    (`modal.focus()`) rather than letting focus land on the first focusable child (the
    close button). That way a screen reader announces the dialog's accessible name — the
    vehicle's year/make/model/trim — immediately, before the user has tabbed into any
    control, rather than hearing "Close, button" first with no context yet for what it's
    closing.
  - **Focus return is not automatic** — native `<dialog>` does not return focus to the
    triggering element on close by itself; without handling it, focus drops to `<body>`,
    which is disorienting for keyboard and screen reader users (they lose their place in
    the grid). Stored the triggering button and refocus it in the dialog's `close` event.
  - **Click-outside-to-close used a bounding-box check, not `event.target === dialog`** —
    the more common version of this technique. Since this dialog has zero padding of its
    own (the header and body fill it edge to edge), every click inside the visible card
    lands on a child element, never the dialog element itself, so target-equality would
    never detect an "inside" click correctly. Checked the click coordinates against the
    dialog's own bounding rect instead, which works regardless of internal padding.
- Modal styling deliberately does **not** reuse the "pin the tokens to fixed light values"
  technique from the accordion's expanded state. That technique existed to make an
  accordion row look the same regardless of theme while sitting inside an otherwise
  theme-flipping page; a modal doesn't need that — it can just use the normal theme
  tokens (`var(--surface)`, `var(--ink)`, etc.), which are already validated as correct,
  self-consistent pairs *within* each theme. Simpler, and there's no new contrast risk
  introduced by using them as intended.
- Redeployed to the same v2 artifact URL (iteration on the picked direction, not a new
  round) — not yet saved into the repo or committed, still exploration until the modal
  itself is confirmed to feel right.

## 2026-08-18 — Modal background: the established off-white, with a proactive fix

- User asked for the modal to use the same off-white (`#E1E4E7`) already established as
  the "active row" background earlier in this project, and explicitly flagged that the
  text on it needs to stay legible — a dark font.
- The user naming that requirement directly (rather than it needing to be caught after
  the fact) is exactly the recurring bug pattern from this whole project: a fixed light
  background sitting inside an otherwise theme-flipping page needs its text/UI tokens
  re-pinned to light-mode values right alongside it, or dark mode ends up with light text
  on a now-permanently-light surface. Applied the same token-pin block already used
  verbatim for the accordion's expanded card elsewhere in this project (`--ink: #10202E`,
  `--slate`/`--slate-soft: #000000`, etc.) directly to `dialog.vehicle-modal` — since
  every element inside the modal is its DOM descendant, the whole modal (header, bid box,
  spec grid, badges, damage list) inherits the pinned values automatically from one
  declaration, not a fix repeated field-by-field.
- Reused pure black for `--slate`/`--slate-soft` (not a softer grey) specifically because
  that's already the established, previously-requested "maximum legibility on this exact
  background" choice from earlier in the project — consistency over reinventing a new
  value.
- Redeployed to the same v2 artifact URL.

## 2026-08-18 — Swapped the modal's two columns, twice (mobile order changed too)

- User, first pass: swap the two-column layout — content (photo + specs + condition +
  damage) on the left and larger, bid box on the right and smaller. Currently the reverse.
- Didn't just swap the markup to match. `.bid-box` was deliberately first in the DOM (same
  reasoning as the row-based accordion's mobile-first order from earlier in this file):
  when `.detail-body` collapses to one column on a narrow modal, DOM order becomes reading/
  visual order, and price should be the first thing encountered there. Swapping the markup
  directly would have undone that principle without being asked to.
  - Fixed with the same `order`-based technique already used in the real app: `.bid-box`
    stayed first in the DOM (mobile still price-first, and so does a screen reader/keyboard
    user), but a `min-width: 701px` media query gave the newly-classed `.detail-main`
    `order: 1` and `.bid-box` `order: 2` — grid auto-placement fills columns by order value,
    so on desktop content lands in the wider `1.5fr` column and bid box in the narrower
    `1fr` one, a purely visual swap that left DOM/reading order untouched.
- User, second pass: **explicitly wants the bid section last on mobile too** — a deliberate
  override of the price-first principle for this specific context. Reasonable: unlike the
  row-based accordion (a dealer rapidly triaging *many* collapsed rows, where price-first
  matters for fast scanning), this modal is opened deliberately for *one* vehicle someone
  already chose to look closer at — review-then-bid is a legitimate, different call for a
  focused single-vehicle view.
- Simplified rather than special-cased: since mobile and desktop now want the *same* order
  (content, then bid), swapped the actual markup — `.detail-main` first, `.bid-box`
  second — and removed the `order` media query entirely, since it's now redundant with
  natural DOM order at every width instead of fighting it.
- Redeployed to the same v2 artifact URL.

## 2026-08-18 — Modal breakpoint moved, and a real bug in "Place Bid" caught by the user

- User: break the modal's two-column detail layout at 900px instead of 700px (stack at
  899px and below). One-line change: `@media (max-width: 700px)` to `(max-width: 899px)`.
  The base `.detail-body` rule already provides the two-column layout by default, so no
  matching `min-width` query was needed — only the stacking override's threshold moved.
- User then flagged: "Place Bid" renders as a blue button with dark blue text — barely
  readable. This was a genuine bug, not a preference, and it's the same root-cause
  pattern that's recurred throughout this project: `.btn-primary` sets
  `background: var(--ink); color: var(--paper)`, and the modal's earlier token pin
  (re-declaring `--ink`/`--slate`/etc. to fixed light-mode values) re-declared `--ink` but
  never `--paper`. So inside the modal, `--ink` was pinned dark navy (correct), but
  `--paper` fell through to the ambient theme — meaning in dark mode it resolved to
  `#0B1420`, also very dark. Dark navy button background plus near-black text is exactly
  "blue button, dark blue text," as reported.
- User's requested fix (green background, white text) happens to sidestep the bug
  entirely rather than just patching it: switched the button from `.btn-primary` to the
  existing `.btn-cta` class, which uses fixed literal colors (`#1B7A4D` / `#fff`), not
  theme tokens — already contrast-checked in an earlier round, and immune to this
  category of bug by construction since there's no token to forget pinning.
- Confirmed `.btn-primary` is now only used outside the modal (header's "Register to
  Bid"), where it's correctly sitting on the ambient, un-pinned page and both `--ink`
  and `--paper` flip together as the matched pair they're designed to be — no bug there.
- Redeployed to the same v2 artifact URL.

## 2026-08-18 — Modal header padding fully zeroed, and the gallery/thumbnails came back

- User: the gap under the modal title still wasn't tight enough after the earlier
  reduction — turned out there was no actual `margin` on `.modal-header`, the space was
  entirely `padding-bottom` (10px at that point). Zeroed it out completely
  (`padding: 18px 22px 0`) rather than trimming further, since "remove all" was explicit.
- User missed the hero-photo-plus-clickable-thumbnails interaction that existed in the
  real app's `PhotoGallery` component and asked for it back in this mockup's modal —
  it had never been ported over here, the modal was still using the plain static
  placeholder from the row-based designs.
- Added `galleryHtml(v, activeIndex)`: a hero placeholder (labeled "Photo N of X" so the
  interaction reads clearly even though, like every image in this mockup, it's a
  placeholder swatch rather than a real fetched photo — same reasoning as `PhotoThumb`/
  `PhotoGallery` in the real app for not loading external `placehold.co` URLs here) plus a
  row of numbered thumbnail buttons below it.
- **Re-renders only the gallery on thumbnail click, not the whole modal body.** The
  obvious approach — re-run `modalBody.innerHTML = detailHtml(v)` on every click — would
  reset scroll position and destroy the spec grid/bid form's DOM nodes for no reason, and
  would yank keyboard focus away from the thumbnail the user just clicked (the same class
  of focus-loss problem already solved once for the modal's own open/close). Instead,
  `wireThumbs()` only swaps `.gallery`'s `outerHTML` and re-wires just that piece, leaving
  the rest of the modal — and where the user's focus and scroll position are — untouched.
- Redeployed to the same v2 artifact URL.

## 2026-08-18 — v2 design finalized, saved into the repo

- User confirmed the design is done and asked to prep it for development tomorrow.
- Saved the final mockup into the repo as `design/card-grid-modal-v2.html` (new file,
  alongside — not replacing — `design/inventory-listing-mockup.html`, the v1 mockup). Named
  it for what it actually ended up being (a card grid + modal), not the "row concepts" name
  used earlier in this log while the direction was still undecided.
- Rewrote `design/README.md` to describe both rounds: what each mockup is, the path each
  one took, and links to both. v1's summary is unchanged; v2's covers the three explored
  directions, why the Card Grid won, why a modal was the right call *here* specifically
  (unlike the row-based v1 layout, which explicitly rejected one), and the native `<dialog>`
  accessibility approach.
- This round was **not committed to git until now** per the explicit "don't commit code,
  let's go back to designs" instruction from earlier — design-only exploration the whole
  way through. See `PROGRESS.md` for the concrete punch list of what porting this into the
  real app actually involves.

## 2026-08-18 — Caught: the filter sidebar and sort toolbar had quietly gone missing

- User caught something before it shipped: the whole v2 exploration (three new layout
  concepts, then picking the Card Grid, then the modal work) had been iterating on the
  grid/card/modal in isolation, and the filter sidebar + sort toolbar from v1 had never
  been carried over into any of the new markup. The mockup had silently narrowed down to
  just `<div class="grid container" id="grid"></div>` with no filtering or sorting UI at
  all — not a deliberate removal, just scope that dropped out unnoticed while the layout
  exploration focused entirely on the list item shape.
- Confirmed the intent was never to cut filtering/sorting — re-added both, copied directly
  from the vetted v1 mockup (`design/inventory-listing-mockup.html`) rather than
  rebuilding from scratch, so the existing accessibility work (label/id associations, the
  `role="group"`/`aria-labelledby` pattern for Price Range, the number-input overflow fix)
  came over intact instead of being re-derived and potentially re-broken:
  - `.filters` sidebar (Make, Body Style, Price Range, Title Status checkboxes) restored
    as a sticky 240px left column via `.body .container`'s two-column grid, collapsing to
    a stacked single column under 860px — same breakpoint and technique as v1.
  - `.listing-toolbar` (result count + Sort control) restored above the grid, same
    `toolbar-info`/`sort-control` split as v1.
  - Wired the result count to be computed rather than static text
    (`document.getElementById("grid-count").textContent`) so it can't drift out of sync
    with the actual vehicle count the way a hardcoded string would.
  - Added a line to the mockup's own review banner (`.brief`) noting explicitly that
    filtering/sorting are unchanged from v1 — the exploration was always about the list
    item, not about removing them — so this doesn't need re-discovering again later.
- Redeployed to the same v2 artifact URL, then re-copied the corrected file into
  `design/card-grid-modal-v2.html` (the previous copy predated this fix and was stale).
- Lesson: when a design round narrows its mockup down to "just the piece being iterated
  on" for focus, cross-check the trimmed-down version against the previous round's full
  page before calling it finalized — it's easy for scope to quietly narrow along with the
  visual focus.

## 2026-08-19 — Ported the v2 design (card grid + modal) into the real app

Replaced the dense-row accordion with the finalized card grid + accessible modal, matching
`design/card-grid-modal-v2.html` exactly rather than reinterpreting it.

- **`src/lib/auction.ts`**: added `urgencyTier(timing)` — `urgent` (≤1h left and live),
  `soon` (≤6h), `normal` (live, more time), `upcoming` (not live at all, including the
  `ended` status, which can't happen at load time but is handled the same defensive way).
  Pure function over the existing `AuctionTiming` type, no new state.
- **`VehicleCard`** (new) replaces `VehicleRow`'s collapsed view: full-width price/timer
  statband first, then photo, title/trim, title-status + condition badges, a vitals line
  (odometer, city/province, drivetrain, and a damage flag only if `damage_notes.length >
  0`), and a footer with the reserve pill + bid count. VIN and dealer name are dropped
  entirely here — expanded/modal-only now, per the dealer-workflow reprioritization from
  the design round. The "Ending Soon" badge uses the fixed `#96600A`, not `var(--amber)` —
  same dark-mode fill-contrast bug already caught once in the mockup, avoided here by
  copying the mockup's CSS value directly instead of reaching for the token.
- **`VehicleDetailModal`** (new) replaces `VehicleRow`'s inline accordion + the old
  `VehicleDetail` component, built on native `<dialog>`: `showModal()`/`close()` for the
  free focus trap and Escape-to-close, `tabIndex={-1}` + `.focus()` on open so the title is
  announced before any control, a single `close` event listener that both clears
  `openVehicleId` and returns focus to the triggering card (covers Escape, backdrop, and
  the close button in one place), and a bounding-box click check for backdrop-to-close
  (the dialog has no padding of its own, so `event.target === dialog` would never fire).
  Reuses the existing `PhotoGallery` and `BidPanel` components unchanged in structure —
  **the token-pin block on `.modal` includes `--paper` this time**, even though nothing in
  the current markup reads it directly, specifically because that's the exact token that
  got missed once already in the design-mockup round and caused a near-invisible button.
- **`BidPanel`**: three small adjustments to match the modal design exactly rather than the
  old accordion's version — submit button switched from `variant="primary"` to
  `variant="cta"` (green, fixed-contrast, sidesteps the `--paper` bug class entirely since
  `.btn-cta` uses literal colors, not theme tokens); `.panel`'s background changed from
  `var(--surface)` to `var(--surface-alt)` so it visually separates from the modal's own
  `--surface` background (in the old accordion, panel and background were intentionally
  the same shade — a bordered-card-on-matching-surface look — but the modal mockup
  deliberately used two different tones); `.input`'s background changed from
  `var(--surface-alt)` to `var(--surface)` to keep standing out against the now-changed
  panel background, matching the mockup's own bid-box input styling.
- **`PhotoThumb`**: widened `width`/`height` props from `number` to `number | string` (the
  card needs `width="100%"`), and dropped its own `border-radius` — it's now only ever used
  inside `VehicleCard`'s photo slot, which already clips corners via the card's own
  `border-radius` + `overflow: hidden`, so a rounded corner on the thumb itself would be
  redundant (and mismatched — the mockup's card photo is flush, `border-radius: 0`).
- **`src/index.css`**: added `--shadow-lg` (light and dark values) — the modal's elevation
  needs a stronger shadow than the existing `--shadow` token, which was tuned for cards.
- **`App.tsx`**: replaced the `VehicleRow` list + `expandedId` accordion state with a
  `.grid` of `VehicleCard`s and a single shared `VehicleDetailModal` instance (matching the
  mockup's "one dialog, not one per card" structure). New state: `openVehicleId` (still
  keyed by id, not index, same reasoning as before) and a `lastTriggerRef` that captures
  `event.currentTarget` at click time — same technique the mockup used for `lastTrigger`,
  necessary because native `<dialog>` doesn't return focus to whatever opened it on its
  own.
- **Deleted `VehicleRow` and `VehicleDetail`** entirely (component + CSS module each) —
  fully superseded, not left around unused. `VehicleDetail.module.css`'s `order`-based
  desktop/mobile swap died with it; the modal doesn't need an equivalent, since its content
  order (detail first, bid box second) is already correct at every width by construction.
- **Verification**: `npx tsc -b` and `npm run lint` (oxlint) both clean. Playwright script
  (in the scratchpad, not a project dependency) drove the real running dev server: opened a
  card's modal, confirmed the announced title, cycled a gallery thumbnail, placed a bid and
  read back the confirmation message, closed the modal three separate ways (Escape,
  backdrop click, close button) and confirmed focus returned to the exact card that opened
  it each time, resized to a mobile viewport and confirmed the filter sidebar and sort
  toolbar are still there — zero console errors throughout. Screenshots confirmed the
  rendered grid, modal, and mobile modal all match `design/card-grid-modal-v2.html`
  visually, not just functionally.
- Dev server was stopped immediately after verification, per the standing rule.

## 2026-08-19 — Modal: split VIN and location onto separate lines

- User: on the vehicle detail view, break the dealership/city/province line onto its own
  line, separate from VIN.
- `VehicleDetailModal`'s combined `VIN {vin} · {dealer} · {city}, {province}` line split
  into two separate `.subLine` elements — VIN keeps the `mono` treatment (it's the one
  actual "paperwork" figure on that line), the dealership/location line doesn't need it
  (it's prose, not digits). Added `.subLine + .subLine { margin-top: 2px }` so the two
  lines read as a tight, related pair rather than full paragraph spacing apart.
- Verified with a Playwright screenshot against the live dev server; `tsc -b`/`oxlint`
  stayed clean.

## 2026-08-19 — README rewritten from OPENLANE's brief into a real submission README

- User wants to make sure the project is actually submission-ready, not just
  feature-complete — checked the repo against `README.md`'s own "How We Evaluate" table
  and the explicit ask ("We should be able to clone your repo and have it running locally
  by following your README").
- Found the real gap: `README.md` had never been touched in this fork — git history
  confirmed every commit that ever touched it predates the fork itself. It was still
  word-for-word OPENLANE's challenge brief, with no run instructions, no notable
  decisions, nothing fork-specific. `SUBMISSION.md` was also still the blank template.
- Rewrote `README.md` using `SUBMISSION.md`'s exact section structure (How to Run, Time
  Spent, Assumptions and Scope, Stack, What I Built, Notable Decisions, Testing, What I'd
  Do With More Time) — per `SUBMISSION.md`'s own instruction ("use this as a starting
  point for your repo's README"), filled in from the real project history in this file
  and `technologies.md` rather than generic boilerplate. Kept the original hero image.
- **Time Spent asked directly of the user** rather than estimated — this is a field only
  they can answer honestly for the walkthrough conversation, not something derivable from
  session logs spanning multiple calendar days with unknown gaps between them.
- Deleted `SUBMISSION.md` once its content was merged into `README.md` — leaving the
  blank template sitting in the repo next to a filled-in README would read as unfinished
  to a reviewer, not as "kept for reference."

## 2026-08-19 — README polish: line wrapping, a real "How to Run," doc pointers

Three follow-up rounds on the freshly-rewritten README, each from the user actually
reading it in their IDE rather than taking my draft at face value.

- **Fixed hard-wrapped paragraphs.** The first draft wrapped prose at ~80 characters with
  real newlines, which renders fine on GitHub (Markdown collapses single newlines inside a
  paragraph) but looks broken in a plain-text/IDE view where those newlines are real line
  breaks — cramped, uneven-length lines instead of clean paragraphs. Reflowed every
  paragraph and bullet in `README.md` to one continuous line each, letting the editor's own
  soft-wrap handle display instead. The user had already applied this fix by hand to one
  paragraph (Time Spent) before flagging it — matched that pattern across the whole file
  rather than inventing a different one.
- **"How to Run" got a real skeptical read**: the user asked directly whether
  `npm install && npm run dev` was genuinely sufficient for someone who's never touched the
  repo. It wasn't quite — checked `node_modules/vite/package.json`'s own `engines` field
  and found a real constraint (`^20.19.0 || >=22.12.0`), which an older LTS like Node 18
  would fail against. Added that as an explicit prerequisite, the actual `git clone` command
  for this fork (confirmed against `git remote -v` rather than assumed), a note that Vite
  will pick a different port than 5173 if that one's taken, an explicit "nothing to seed or
  connect to" callout, a note that `scripts/generate_vehicles.mjs` is historical (how the
  dataset was originally generated) and not part of running the app, and a one-line note
  that the `<dialog>`-based modal needs a current browser (true today, worth being upfront
  about anyway since it's core to the demo).
- **Surfaced `BUILD_LOG.md` and `technologies.md` more prominently**: both were already
  linked inline (in "Stack" and "Notable Decisions"), but the user wanted them called out
  more directly. Added a short "Two docs worth reading alongside this one" callout right
  after the intro, before any other section — the two links stay in their original inline
  spots too, this is additive, not a replacement.
- Also caught and fixed a stale reference while reviewing: `technologies.md`'s
  "Application State (Bids)" section still pointed at "the README/SUBMISSION doc," left
  over from before `SUBMISSION.md` was deleted. Updated to point at README's actual
  section name.
- Added a new `technologies.md` section on the native `<dialog>` element (what
  `showModal()` provides for free — focus trap, Escape-to-close, top-layer rendering,
  implicit dialog role — versus what still had to be hand-built: accessible name, focus
  order into the dialog, focus return on close, click-outside-to-close). This was the
  biggest new browser mechanism introduced by the v2 port and hadn't been documented in
  `technologies.md` yet, unlike everything else in the stack.

## 2026-08-19 — OpenLane brand-match exploration (later discarded)

- User: "blue on blue is hard to read," lighten the colors, match openlane.com's actual
  gradients/off-whites/blues.
- **Fetched OpenLane's real theme stylesheet directly** rather than approximating brand
  colors from memory — earlier in the project (day one) that had been tried and failed
  (no public brand guide, Brandfetch 403). Pulled `https://www.openlane.com`, found their
  enqueued theme CSS (`wp-content/themes/openlane2024/style.css`), and read their actual
  `:root` token block: a labeled Primary/Secondary/Neutrals system (`--openlane-blue:
  #0061FF`, `--openlane-onward-blue: #0A1B5F`, a `blue-25`–`blue-300` tint scale, and true
  neutral greys) plus their real gradient stop pairs (`linear-gradient(..., #0061FF,
  #0A1B5F)`), pulled straight from their CSS, not guessed.
- Verified every candidate pairing's WCAG contrast by script before using it (same
  discipline as every round before this) — including catching that OpenLane's own
  `medium-silver` secondary-text token actually fails AA against the new blue-tinted
  backgrounds, so alternate values were computed and verified instead of reused as-is.
- Built two options: **Brand Blue** (their tokens applied directly — onward-blue text,
  blue-tinted off-white surfaces, their brand blue as the accent, Poppins) and **Gradient
  Hero** (same off-white base, plus their actual gradient reserved for the header, card
  statband, and modal header only — not the ambient background, matching how OpenLane's
  own site concentrates gradient in hero moments rather than spreading it everywhere).
- **Building Gradient Hero surfaced a real bug before it shipped**: the amber
  auction-urgency color and the slate secondary text both fail contrast badly against the
  blue gradient (as low as ~1.0:1) — exactly the "blue on blue" problem this round existed
  to fix, just reintroduced in a new spot. Fixed by overriding the statband's countdown
  text to white and flipping the "Ending Soon" badge to a white chip with amber text, so
  the amber meaning survived without amber-on-blue anywhere.
- User picked Brand Blue, then flagged it still had too much blue — the page background
  itself (`--paper`) was a pale blue tint. Changed `--paper` to OpenLane's literal
  `--openlane-core-white` (`#FFFFFF`), matching their actual page background, and let
  cards separate from the page via border + shadow alone instead of a color difference.
- **User then reversed course entirely**: "get rid of all of these changes to the
  designs. Let's start back before we made color changes. I need to be more specific."
  Nothing in this round had touched `design/` or `src/` — it lived entirely in scratchpad
  mockups and their Claude Artifacts — so reverting meant confirming `git status` was
  clean, which it was. No repo changes were ever made or undone.
- Kept here as a record of what was tried and explicitly rejected, and why: the direction
  itself (OpenLane's real blue) wasn't the fix the user actually wanted once they saw it
  applied — see the next entry for what they asked for instead.

## 2026-08-19 — Graphite Neutral: fixing the real "blue on blue, too dark" complaint

- User, more specifically this time: get rid of the OpenLane-blue exploration entirely,
  and show two designs that are neither "blue cards on a blue background" nor "too dark" —
  about the **shipped v2 palette**, not the discarded blue exploration.
- **Real diagnosis, not just a tone tweak**: checked the shipped tokens' actual hex values
  rather than assuming "blue" meant a deliberate accent color. `--ink: #10202E` has more
  blue (46) than red (16) or green (32) in it — same story for `--paper`, `--slate`, and
  the modal's pinned surface (`#E1E4E7`). None of these were ever a "blue" design choice;
  they were meant to read as neutral dark navy/off-white, but the underlying hex values
  had a real blue cast baked in the whole time. Separately, `--ink` was used as a *solid
  fill* on the primary button, the wordmark chip, and the footer — three individually
  reasonable choices that stacked into a page that read as heavy/dark overall.
- Verified a full true-neutral-grey palette (R=G=B, zero hue) by script before building
  anything, light and dark mode both — every pairing clears WCAG AA, most clear AAA.
- Built two structurally-identical, color-only options (same card grid + modal from v2,
  no layout changes) so the choice was purely about color/weight, not re-litigating the
  structure:
  - **Graphite Neutral**: true neutral grey tokens, same button/chip/footer *structure*
    as shipped but bordered/outlined instead of solid-filled wherever `--ink` was
    previously a fill — directly targets the "too dark" complaint without touching the
    "blue" complaint's fix (the neutral tokens) or removing visual hierarchy.
  - **Soft & Light**: goes further — one accent color for the entire app (the existing
    bid-CTA green) instead of a separate "primary" hue, cards drop their border entirely
    and separate from the page via shadow only, literal white page background.
- User picked **Graphite Neutral**. Ported directly into `src/`, not just saved as a
  mockup, since it's a color-token change layered on the already-shipped v2 structure —
  much smaller in scope than the original card-grid-plus-modal port:
  - `src/index.css`: full light/dark token block replaced with the verified neutral
    values.
  - `Button.module.css`'s `.primary`: solid `background: var(--ink)` → bordered
    (`background: var(--surface); border-color: var(--ink)`) — still inverts correctly
    in both themes since it's the same `--ink`/`--surface` pairing, just as a border
    instead of a fill.
  - `Footer.module.css`: solid `--ink` background → `--surface-alt` with a top border,
    matching the "no more large dark fills" rule applied to the button.
  - `Header.module.css`'s wordmark chip: solid fill → 1.5px outline, same rule again;
    also caught and fixed a hardcoded `#10202e` on the pinned-white search input's text
    color that the earlier grep-for-hardcoded-navy pass in the v2 port had missed.
  - `PhotoThumb.module.css` and `VehicleDetailModal.module.css`: hardcoded
    `rgb(16 32 46 / ...)` shadow/backdrop tints and the modal's pinned blue-grey surface
    (`#E1E4E7` → `#E8E6E3`) updated to the neutral equivalents; `--paper` stayed in the
    modal's pin block (already added during the v2 port after being missed once).
  - Confirmed with a repo-wide grep that no hardcoded navy hex values were left anywhere
    in `src/` before calling it done.
- **Verification**: `npx tsc -b` and `npm run lint` clean; a Playwright pass against the
  real running dev server confirmed the grid, modal, bidding, and footer all render the
  new palette correctly with zero console errors. (A few card photos rendered as dark
  placeholder boxes in the screenshots — that's the sandboxed test browser's own
  broken-image handling since it can't reach `placehold.co` externally, an already-known
  quirk of this specific test environment from earlier verification rounds, not a bug
  introduced here.)
- Saved into the repo as `design/card-grid-modal-v3-graphite.html` (the OpenLane
  exploration was discarded and never saved, so this is v3, not v4, in the repo's own
  sequence) and `design/README.md` updated to describe it.

## 2026-08-19 — Modal contrast, bid box presence, and a live/soon status dot

Three follow-up rounds of polish on the now-picked Graphite Neutral direction.

- **Modal didn't contrast enough against the page.** User: the modal reads as too close
  to white, wanted it to stand out more. The pinned modal surface was only 0.16 luminance
  units darker than the ambient page background — barely perceptible once dimmed by the
  backdrop. Darkened it from `#E8E6E3` to `#D9D5CD` (0.29 luminance gap now, effectively
  doubled) while keeping `--surface-alt` (the bid box, close button) lighter than the new
  darker `--surface` — the bid box now reads as a raised panel against a visibly darker
  modal, rather than everything sitting at the same brightness.
- **Bid box was plain.** Added a shadow (`var(--shadow)`, previously flat/same-plane as
  everything else), a 4px green left-accent border matching the "Place Bid" button color,
  and bumped the current-bid figure from 27px to 30px with tighter letter-spacing — this
  is the one panel in the modal a buyer actually acts on, so it earns more visual weight
  than a bordered box.
- **Live/starting-soon status dot.** User wanted the card's auction timing to stand out
  more, plus a colored dot: green for live, yellow for starting soon. Asked a clarifying
  question rather than guessing at the unfinished part of the request (what color, if any,
  for auctions starting further out) — landed on: green = live, yellow = starts within 6h
  (mirrors the existing live-auction "soon" threshold, for consistency), no dot at all for
  anything further out, so a lot starting in 3 days doesn't compete for attention with one
  starting in 20 minutes.
  - New `auctionStatusDot(timing)` in `src/lib/auction.ts` — a small, separate concept
    from `urgencyTier`, which governs the amber countdown-text intensity, not live/upcoming
    status. Dots are purely reinforcing (`aria-hidden`): the timing text next to them
    ("Ends in"/"Starts in") already carries the actual information, matching the
    established "never signal state by color alone" rule from earlier in this project.
  - **New dedicated `--live-dot`/`--soon-dot` tokens, not reused from `--good`/`--amber`.**
    Those two are tuned for text sitting on a tinted background of the same hue (how the
    pill badges use them) — a small solid dot filled directly on a neutral card surface is
    a different contrast problem and needed its own values, verified separately (light:
    `#127A45` live / `#B8960C` soon; dark: `#34D399` / `#FDE047`).
  - **Real physical tradeoff hit while picking the "soon" yellow**: a true bright yellow
    that also clears 3:1 against a white/light-grey card is not really achievable — high
    luminance and strong contrast-against-white pull in opposite directions, which is
    exactly why the existing `--amber` token already sits as dark as it does. Picked
    `#B8960C` (a golden yellow distinctly less orange/brown than `--amber`), landing just
    under the 3:1 non-text-UI-component guideline (~2.5–2.8:1 depending on surface) rather
    than pretending a fully-compliant "true yellow" was available — noted here rather than
    silently accepted, and mitigated by the dot always being redundant with adjacent text.
  - Verified the compiled stylesheet directly (`document.styleSheets`) to confirm both
    dot classes resolve to the correct CSS custom properties, since no auction in a fresh
    session is ever live yet — the existing schedule-offset system re-anchors the
    *earliest* auction to 45 minutes from page load, so "live" doesn't become visually
    reachable in a browser until real wall-clock time passes. Not something today's
    change touched or needed to fix.
- Also bumped the card's timing text from the inherited 15px body size to 16.5px — it's
  the second most important figure on the card after price and read too quietly before.
- Verification: `npx tsc -b` and `npm run lint` both clean throughout.

## 2026-08-19 — Cut the "starting soon" dot, kept live-only

- Asked directly whether yellow was actually the right call for "starting soon," rather
  than just implementing the requested color: the real problem wasn't just contrast, it
  was that a yellow close enough to `--amber` risked the dot's two meanings ("act now" vs.
  "notice this later") blurring into each other — undermining the dot's whole point.
  Recommended a hue outside the green/amber/red family instead (violet/plum).
- User's call: simpler than either option — drop the "starting soon" state entirely, dot
  is live-only. `auctionStatusDot` now returns `"live" | null`, `StatusDot` type
  simplified to match, `.dotSoon` and `--soon-dot` (light + dark + the modal's pin) removed
  everywhere rather than left dead. Confirmed with a repo-wide grep that no trace of
  `soon-dot`/`dotSoon`/`startingSoon` remained anywhere in `src/`.
- Verification: `npx tsc -b` and `npm run lint` clean; screenshot confirmed upcoming
  auctions show plain timing text with no dot, live auctions still wired for the green one
  (can't visually confirm live in this session — see the previous entry for why).

## 2026-08-19 — Modal layout: gallery as a full-width row, not part of the two-column split

- User: pull the photo gallery out of the two-column split and make it a full-width row
  above the details/bid-box columns, instead of living inside the details column.
- `VehicleDetailModal.tsx`: moved `<PhotoGallery>` out of `.detailMain` to sit directly in
  `.body`, as a sibling of `.detailBody` rather than its first child. No new CSS needed for
  spacing — `PhotoGallery`'s own `.gallery { margin-bottom: 16px }` already handled it,
  since the component carries its own bottom margin regardless of where it's mounted.
- This actually simplified the mobile story rather than complicating it: the gallery is no
  longer part of `.detailBody`'s grid at all, so it's unconditionally full-width and first
  at every viewport size, with no breakpoint-specific handling needed. The existing
  "detailMain first, bid panel second, no `order` override" reasoning for the two-column
  section underneath is untouched.
- Verification: `npx tsc -b`/`npm run lint` clean; Playwright confirmed gallery thumbnail
  switching and the bid flow both still work after the restructure; screenshots at desktop
  and mobile widths both look correct — full-width gallery, then details/bid-box split
  underneath on desktop, all three stacked in the same order on mobile.
- **Note on `design/card-grid-modal-v3-graphite.html`**: not hand-synced with this change,
  or the last several rounds of refinement (modal contrast, bid box shadow/accent, the
  status dot). The mockup's job — help pick a direction — is done; `src/` is the real,
  tested source of truth now, and keeping a static HTML file byte-for-byte in sync with
  every subsequent micro-iteration in the live app isn't a good use of time this close to
  sending this out for review. The mockup still accurately represents the Graphite Neutral
  *direction*, just not every refinement made after it was picked.

## 2026-08-19 — Gallery height, and the bid box's "floating" problem

- User: make the gallery's active photo taller (it now spans the full modal width since
  the last change, and 220px — tuned for the old, narrower two-column layout — looked
  short and letterboxed at that width). Bumped `PhotoGallery`'s `.hero` from 220px to
  340px. `PhotoGallery` is only ever mounted inside this modal, so the change is safely
  scoped without needing a prop.
- User, separately: the bid box "looks weird floating over to the right of the content" —
  suggested dropping the green left-accent border and anchoring it to the bottom of the
  modal.
- **Real cause, not just a style tweak**: `.detailBody` used `align-items: start`, so the
  bid box only ever took its own natural height. Once the gallery moved out of
  `.detailMain` (previous round) and the spec grid/condition report/damage notes became
  the *only* thing in that column, `detailMain` got noticeably taller than the compact
  bid box, leaving it visually orphaned at the top of the right column with a large gap
  of nothing underneath.
- Fixed properly rather than just removing the border: `.detailBody` changed to
  `align-items: stretch`, so the bid box now fills the same height as `detailMain`.
  `BidPanel`'s `.panel` became a flex column, and `.form` picked up `margin-top: auto` —
  so the actual interactive part (the bid input + Place Bid button) anchors to the
  *bottom* of the now-taller box, exactly matching what the user asked for, instead of
  leaving a dead gap between the meta row and the form. Removed the green left-accent
  border per the request — the anchored-to-bottom layout gives the panel enough presence
  on its own now.
- Mobile is unaffected by the stretch: `.detailBody` collapses to a single column there,
  so gallery/details/bid-box each land in their own row and just take their natural
  height — `align-items: stretch` only has a visible effect when there are two items
  sharing one grid row, which only happens at the two-column desktop width.
- Verification: `npx tsc -b`/`npm run lint` clean; screenshots at desktop (bid box now
  spans the full column height, form anchored at the bottom, no stray border) and mobile
  (bid box stays naturally compact, no stretch artifacts) both confirmed correct.

## 2026-08-19 — Full-screen photo lightbox: a genuine nested modal

- User: add a control on the hero photo to expand it full-screen, and explicitly flagged
  the real risk — "we're kind of nesting modals into modals here" — asking for
  accessibility to be treated seriously, not bolted on after.
- **Built on a second native `<dialog>`, nested as a DOM descendant of the vehicle
  modal's own `<dialog>`**, betting on the platform to handle the hard parts rather than
  hand-rolling them:
  - The browser's top-layer stacking renders the lightbox above the vehicle modal with no
    manual `z-index` needed, regardless of DOM nesting depth.
  - Calling `showModal()` on the lightbox makes everything NOT contained within it inert —
    including the vehicle modal's own thumbnails, spec grid, and bid form, even though
    they're the lightbox's own ancestor's content, not siblings. Verified directly: while
    the lightbox is open, clicking a thumbnail behind it does nothing at all.
  - Escape closes only the topmost dialog (the lightbox), leaving the vehicle modal open —
    also native, no custom key handling needed.
  - All three of the above were confirmed by test, not assumed from reading the spec.
- **What still had to be built by hand, same categories as every dialog in this app**: an
  accessible name (`aria-label` directly on the dialog — no visible heading to point
  `aria-labelledby` at in a pure image viewer), focusing the dialog itself first on open
  so the name is announced before the close button, and returning focus specifically to
  the *expand button* (not wherever focus was before the vehicle modal opened) when the
  lightbox closes.
- **Two problems specific to nesting, not present in any single-level dialog in this app
  so far**:
  1. The vehicle modal's own click-outside-to-close handler listens on its `<dialog>`
     element. Because the lightbox is a DOM *descendant* of that same element, a click
     anywhere in the lightbox bubbles up through it — without `event.stopPropagation()`
     in the lightbox's own click handler, clicking anywhere in the lightbox (including
     just to dismiss it) would also fire the vehicle modal's handler and close the whole
     thing underneath it. Verified this specific failure mode by test before confirming
     the fix.
  2. The vehicle modal's existing bounding-box click-outside technique doesn't transfer:
     that technique exists because the vehicle modal is *smaller than the viewport*, so
     there's real "outside" space to click. The lightbox IS the viewport (100vw/100vh) —
     every click is inside its bounding rect by definition, so a bounding-box check would
     never fire. Used `event.target === dialog` instead, which is correct here
     specifically *because* this dialog centers a smaller image inside a much larger
     element (unlike the vehicle modal, which has no padding of its own) — a click landing
     directly on the dialog element, not the image or the close button, unambiguously
     means the empty space around the photo was clicked.
  - Only shown when there's an actual loaded photo (`!activeFailed`) — expanding a
    text-fallback placeholder to full screen has nothing to show.
- Verification: `npx tsc -b`/`npm run lint` clean. Scripted Playwright pass covering the
  nesting-specific behavior, not just "does it open": two dialogs open at once, a
  thumbnail click behind the lightbox is blocked (inert), Escape closes only the lightbox
  (vehicle modal dialog count back to 1), focus lands back on the expand button, clicking
  empty lightbox space closes only the lightbox (not the vehicle modal underneath — the
  specific bug `stopPropagation` exists to prevent), clicking the image itself does not
  close it, and the close button works with correct focus return. Zero console errors
  throughout. Screenshots confirm the expand control and the full-screen lightbox both
  render correctly.

## 2026-08-19 — Buy It Now button, laid out like popular auction sites

- User: add an actual button for the Buy It Now option, laid out the way popular auction
  sites present it. Previously `buy_now_price` was only shown as inert text in a meta
  row — no way to act on it at all.
- **Layout matches the standard convention** (eBay and similar): bid form first, then an
  "or" divider (two horizontal rules flanking the word), then Buy It Now as a full-width
  button below it — presented as two alternative paths to the same vehicle, not stacked
  as if both applied simultaneously.
- **New `secondary` variant on the shared `Button` component**: same fixed green as the
  existing `.cta` (`#1B7A4D`) since both buttons lead to the same outcome — acquiring the
  vehicle — but outlined instead of filled, so Buy It Now doesn't compete with Place Bid
  for being "the" primary action. Fixed, not `var(--good)`, for the same cross-theme
  reason `.cta` already uses a fixed color.
- **Reuses the existing bid mechanism** rather than a separate purchase flow — clicking
  Buy It Now calls the same `onPlaceBid(vehicleId, amount)` callback with
  `buy_now_price`, and shows a distinct "Bought now for $X" confirmation instead of "Bid
  placed at $X." This matches the prototype's existing, documented scope decision for
  bidding (in-memory, no separate checkout) rather than introducing a new one — a full
  "mark as sold, auction ends immediately" state machine wasn't asked for and isn't
  needed to demonstrate the interaction.
- Restructured `BidPanel`'s layout to keep the "anchor the interactive part to the bottom
  of the stretched panel" behavior from the last round working correctly: the bid form,
  message, divider, and Buy It Now button are now grouped in one `.actions` wrapper that
  carries the `margin-top: auto` (previously on `.form` alone, which would have left the
  new divider/button floating below the anchored form instead of anchored with it).
- Verification: `npx tsc -b`/`npm run lint` clean. Playwright confirmed the button renders
  with the correct price, clicking it updates the current bid to the buy-now price,
  increments the bid count, and shows the correct confirmation message — zero console
  errors. Screenshots confirmed the layout at both desktop and mobile widths.

## 2026-08-19 — Undid the stretched bid box; natural height, normalized spacing

- User: the bid box looks weird — reads like it has a set height — and asked for it to
  grow naturally with its content, plus normalized spacing between its elements.
- **Direct reversal of a decision from two rounds ago.** `.detailBody`'s
  `align-items: stretch` (added specifically to make the bid box match detailMain's
  height) went back to `align-items: start`, and `BidPanel`'s `.actions` group lost the
  `margin-top: auto` that anchored it to the bottom of that stretched space. In hindsight
  that whole approach *was* an artificial set height — it just came from a sibling
  column's height instead of a literal CSS `height` value, which is exactly what it
  looked like once more content (Buy It Now) got added into the anchored group.
- **Normalized spacing with `gap` instead of scattered margins.** Every one-off spacing
  value (`.metaRow`'s `margin: 10px 0`, `.msg`'s `margin-top: 8px`, `.divider`'s
  `margin: 14px 0`) is gone. `.panel` is now a `gap: 16px` flex column across its three
  logical groups (price, meta row, actions), and `.actions` is its own `gap: 10px` flex
  column across the form/message/divider/buy-now-button. The current-bid label and figure
  got pulled into a new `.priceBlock` wrapper with its own tight `gap: 2px` — without it,
  giving the outer panel one uniform gap would have pushed the label away from its own
  value by the same amount as every unrelated section, breaking that pairing.
- Verification: `npx tsc -b`/`npm run lint` clean. Screenshots of both a Buy-It-Now
  vehicle and a bid-only vehicle confirm the box now takes its own compact, natural
  height in both cases, with even, consistent spacing throughout.

## 2026-08-19 — Live auctions on load, and a real data-integrity bug fixed

- User: wanted a few live auctions visible immediately (to actually see the live status
  dot without waiting), and separately noticed some auctions showing "Starts in 29m" next
  to existing bids — asked to double-check the data.
- **Checked the raw dataset directly rather than guessing at the cause.** Confirmed
  `current_bid`/`bid_count` in `data/vehicles.json` are generated completely independently
  of `auction_start` — vehicles scheduled at the very end of the 6.5-day spread have bid
  activity too, same as ones at the very start. This isn't something our offset math
  broke; the raw data was never temporally consistent to begin with, so no single vehicle
  is uniquely "wrong" — the *display* logic needed to derive correct state from computed
  timing, not trust the raw fields directly.
- **Fixed the offset anchor** (`getScheduleOffsetMs`) to place "now" 22 hours *after* the
  earliest auction's original start instead of 45 minutes *before* it. Every vehicle whose
  original start falls within that same 22-hour window is live at load, spread across the
  full urgency range (about to end, ending soon, just started) rather than clustered in
  one tier — about 13% of the 200-vehicle catalog (26 vehicles) live on load, verified by
  script, without waiting on real wall-clock time or pushing anything into "ended."
- **New `withEffectiveBidState(vehicle, timing)`** in `lib/auction.ts`: if a vehicle's
  computed status is "upcoming," its bid fields are overridden to `current_bid: null,
  bid_count: 0` for display — an auction that hasn't started has no bids yet, regardless
  of what the static dataset happens to say. Applied once in `App.tsx`, before
  filtering/sorting/rendering (`effectiveVehicles`), so price filtering, price sorting,
  the card, and the bid panel all see already-correct data without each needing their own
  timing-awareness — `effectivePrice` (used by both filter and sort) already falls back to
  `starting_bid` correctly once `current_bid` is genuinely `null`, no changes needed to
  `filters.ts`/`sort.ts` at all.
- **Caught a follow-on inconsistency before shipping**: fixing the display alone wasn't
  enough — the bid form was still fully functional on upcoming auctions, meaning a user
  could place a "bid" on a listing the UI had just finished insisting had none. Closed that
  gap too: `VehicleDetailModal` now derives `canBid = timing?.status === "live"` and passes
  it to `BidPanel`, which renders neither the bid form nor Buy It Now when `false` —
  instead a plain "Bidding opens when the auction starts" message. Not scope creep so much
  as the fix being incomplete without it: "no bids exist yet" and "you can still place one"
  can't both be true at once.
- Verification: `npx tsc -b`/`npm run lint` clean. Scripted check confirmed live-count
  (26/200), zero upcoming cards showing nonzero bid counts, Place Bid present with no
  "Bidding opens" message on a live vehicle, and the reverse (no Place Bid, "Bidding opens"
  shown, "0 bids") on an upcoming one. Screenshots confirm the green live dot rendering
  correctly on multiple cards in the grid, and the upcoming modal's fully consistent
  "Starting Bid / 0 bids / Bidding opens when the auction starts" state.

## 2026-08-19 — Mobile header order, and a "LIVE:" label on the status dot

User's last two requests before wrapping up for engineering review.

- **Mobile header**: the search bar was right-aligned and a fixed-ish width even on
  narrow screens; asked for it full-width/left-aligned with Sign In/Register moved above
  it, mobile only. Used `order` in an 860px media query (the same breakpoint the rest of
  the app already uses for mobile) on `.search`/`.actions` rather than changing the actual
  DOM order — desktop's existing order (search snug against the actions group via
  `margin-left: auto`) needed to stay exactly as-is, and the two breakpoints wanted
  genuinely different orders, not just a mobile-only visual tweak layered on top of one
  shared order. `.search` also drops its `max-width`/`margin-left` and goes
  `width: 100%` on mobile. Verified desktop renders unchanged and mobile shows
  actions-then-search as requested.
- **"LIVE:" label**: the live status dot was `aria-hidden`, purely decorative, redundant
  with the countdown text next to it. Added real, non-hidden "LIVE:" text in front of the
  dot — colored to match `--live-dot` (green) rather than the amber countdown text right
  after it, so the two distinct meanings (status vs. urgency-to-end) read as two distinct
  colors instead of one. This is also a genuine accessibility improvement, not just a
  visual one: a screen reader now hears "LIVE: Ends in 2h" explicitly, where before
  "live-ness" was only ever implied by amber color/the (hidden) dot, never actually said.
- Verification: `npx tsc -b`/`npm run lint` clean. Screenshots confirmed the mobile
  header order and full-width search, desktop unchanged, and "● LIVE: Ends in 2h"
  rendering correctly across multiple live cards in the grid.
- **Follow-up, same round**: user caught that "LIVE:" and "Ends in 2h" weren't on a
  shared baseline. Root cause was the label starting at a smaller 12px "meta label" size
  while the countdown text next to it is 16.5px — normalized `.liveLabel` to the same
  16.5px, and added `line-height: 1` to it and all four `.time*` classes so a differing
  inherited line-height (1.5 from `body`) couldn't reintroduce the same kind of vertical
  drift at matching font sizes. Verified with a screenshot: dot, "LIVE:", and the
  countdown text now sit on one visual line.

## 2026-08-19 — Header wrapping: cascading rows instead of a fixed mobile stack

- User: on mobile/small tablet, Sign In and Register should fit inline with the nav menu
  when there's room — then, mid-turn, refined it further: if there's not room next to the
  menu, they should sit inline with the search bar instead, with the search bar shrinking
  to make space, rather than jumping straight to a fully stacked layout.
- **Replaced hardcoded mobile widths with flex-basis/grow/shrink so the wrapping cascades
  on its own**, instead of hand-coding three separate states for three breakpoints:
  `.actions` gets `flex: 0 0 auto` (never grows or shrinks, always just its own content
  width) and `.search` gets `flex: 1 1 160px` (grows to fill whatever's left on its row,
  can shrink down to 160px, no more forced `width: 100%`). Combined with the existing
  `order`, this alone produces all three outcomes the request asked for as one rule, not
  three: actions joins the nav's row when there's room; failing that, it wraps and search
  joins *it* on that new row, shrinking to fit; failing that too, search ends up alone on
  its own row where `flex-grow: 1` naturally fills the width — which is also exactly the
  "full width" behavior from the original mobile-header request, so nothing about that
  case needed to be preserved separately.
- Verified by screenshotting the actual breakpoint boundaries rather than guessing: at
  375-390px (narrow phone) actions and search each get their own full-width row; at
  480-700px actions and a visibly narrower search share one row; at 860px (right at the
  mobile/desktop boundary) actions tucks in next to the nav menu itself, with only search
  wrapping below it. All three matched the request exactly.
