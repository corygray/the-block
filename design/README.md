# Design Process

`inventory-listing-mockup.html` is the interactive HTML/CSS/JS mockup used to work through
the buyer marketplace's layout, color, accessibility, and interaction design before any
React code was written. Open it directly in a browser — it's self-contained, no build step.

It went through three layout directions (dense table, card grid, split console), landed on
the dense table ("Auction Floor"), then iterated through an inline accordion detail/bid
flow, an accessibility pass (contrast, labeling, color-independent state cues), a color
pass (removed a blue accent that leaned on too many similar shades), and mobile-specific
fixes (a broken grid layout, and reordering the accordion so price appears first on
mobile).

See [`../BUILD_LOG.md`](../BUILD_LOG.md) for the full, dated decision log — why each of
those changes happened, not just what changed.

A live version (easier to browse than opening the file) was also published as a Claude
Artifact during the design process:
https://claude.ai/code/artifact/aef3026a-a1c7-421d-83b5-57bfecdcd5d0

Note: that link is private by default — it won't be viewable by anyone else unless it's
explicitly shared from claude.ai. The HTML file in this folder is the reliable copy.
