# Slide 13 · Appendix A · Product walkthrough

**Answers:** What does the product look like, screen by screen?

**On the slide:** All eight phone screens of the manufacturer app, two per tab (Price check, Demand Brief, Batch, WhatsApp). Coral markers on each screen match the numbered lines under it; each step ends with the barrier it removes. Bottom row: one KPI per step (the pilot target each screen is judged on), a 60-second live demo (at a ₹105 making cost, Ship myself misses the 8% badge and the Factory Node clears it), and the QR with the live link and prototype stats.

## Changed on 4 Oct 2026
- Rebuilt from scratch. It used to show four desktop screenshots and three phones with "supports p…" pointers.
- Screens captured from the live site on 4 Oct 2026 by `_tools/capture_phone.mjs` into `deck/source/assets/phone/` (the PNGs plus `phone_screens.json` with marker positions).
- Bottom row redone (v07 saved first): the control-tower thumbnails and the stats panel gave way to the KPI strip and the demo; the stats moved into the live-link panel. The demo values come from the prototype's price check, and the build fails if ₹105 stops showing the node clearing the gate.
- Numbers in the text come from the prototype's own code (`proto.mjs` → `PROTO.maker`), so they match the screens.

## Open
- The prototype's persona inputs differ from the costed case: ₹98 making cost and a synthetic ₹245 median (Unit Economics uses ₹80 and ₹209), ₹8 vs ₹10 pre-order discount, ₹213 floor vs ₹191 (node) and ₹180 (batch). The footer says so. To remove the gap: port the unit-cost formula from `model.mjs` into `prototype/src/lib/economics.js`, set the inputs in `config.js`, redeploy, then recapture.

## Rough work
- `product_walkthrough.pptx`: this slide on its own, cut from the main deck on 4 Oct 2026 (identical to slide 13).
- `render.png` and `text.txt` here are refreshed by `../_tools/refresh_slides.sh` (not committed).
- Drafts, sketches and screenshots for this slide go in this folder.
