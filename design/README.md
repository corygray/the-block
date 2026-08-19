# Design Process

Three rounds of interactive HTML/CSS/JS mockups, used to work through the buyer
marketplace's layout, color, accessibility, and interaction design before (and alongside)
the React code. All three are self-contained — open any of them directly in a browser, no
build step.

## v1 — `inventory-listing-mockup.html`

Went through three layout directions (dense table, card grid, split console), landed on
the dense table ("Auction Floor"), then iterated through an inline accordion detail/bid
flow, an accessibility pass (contrast, labeling, color-independent state cues), a color
pass (removed a blue accent that leaned on too many similar shades), and mobile-specific
fixes (a broken grid layout, and reordering the accordion so price appears first on
mobile). This is what got built into the real app first.

Live version published during the design process:
https://claude.ai/code/artifact/aef3026a-a1c7-421d-83b5-57bfecdcd5d0

## v2 — `card-grid-modal-v2.html`

After the row-based layout shipped, revisited it from a dealer's "scan fast, decide what's
worth a closer look" workflow — the shipped row felt crowded, and price/auction timing
weren't prominent enough. Explored three new structurally distinct directions (not
re-skins), picked the **Dealer Card Grid** (every card leads with a full-width price/timer
band), then swapped its detail view from an inline expand to an accessible popover modal
built on native `<dialog>` (focus trap, Escape-to-close, and `aria-labelledby` for free;
focus-to-title-first and focus-return-on-close handled explicitly). Also re-derived what
belongs in an "at a glance" view for a dealer: VIN and dealer name dropped to expanded-only,
damage became a quick flag, and a real urgency-tier system replaced one flat amber
treatment. Ends with a working hero-photo + thumbnail-strip gallery inside the modal.

Live version:
https://claude.ai/code/artifact/c32c19ac-a10a-4dd5-bd55-3c21920b9994

## v3 — `card-grid-modal-v3-graphite.html`

After living with v2's shipped palette, it read as "blue on blue" and too dark — the
`--ink`/`--paper`/etc. tokens all carried more blue than red or green in their hex values
(e.g. `--ink: #10202E`), and `--ink` was used as a *solid fill* on the primary button, the
wordmark chip, and the footer, which stacked into a heavy, dark-feeling page even though no
single instance was wrong on its own. Explored two structurally-identical, color-only
directions to fix it — a "Graphite Neutral" pass (true grey tokens, bordered buttons
instead of filled ones) and a lighter "Soft & Light" pass (one accent color for the whole
app, borderless shadow-only cards) — and picked **Graphite Neutral**. Same card grid +
modal structure as v2, only the color system and a few fill-vs-border treatments changed.

Live version:
https://claude.ai/code/artifact/157b6aa0-6079-4af2-a635-5dcd561d6476

## Notes

See [`../BUILD_LOG.md`](../BUILD_LOG.md) for the full, dated decision log for both
rounds — why each change happened, not just what changed.

Both Artifact links are private by default — they won't be viewable by anyone else unless
explicitly shared from claude.ai. The HTML files in this folder are the reliable copies.
