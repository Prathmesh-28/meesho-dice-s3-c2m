# Rough work, slide by slide

One folder per slide of the Round 2 deck (`../meesho_dice_round2.pptx`). Each folder has:

- `notes.md`: what the slide answers, what changed, what is still open
- `render.png` and `text.txt`: the latest render of that slide and its text (made by `_tools/refresh_slides.sh`, not committed)
- any drafts, sketches or screenshots for that slide

| # | Folder | # | Folder |
|---|---|---|---|
| 1 | `01_cover` | 9 | `09_cluster_criteria` |
| 2 | `02_primary_research` | 10 | `10_unit_economics` |
| 3 | `03_manufacturer_segmentation` | 11 | `11_financial_analysis` |
| 4 | `04_user_personas_flow` | 12 | `12_90_day_plan_risks` |
| 5 | `05_awareness_strategy` | 13 | `13_product_walkthrough` |
| 6 | `06_benchmarking_comparison` | 14 | `14_appendix_b_sources` |
| 7 | `07_best_practices` | 15 | `15_appendix_c_benchmarks` |
| 8 | `08_manufacturer_journey` | | |

## How the deck is made now

Since 3 Oct 2026 the main deck carries hand edits made in PowerPoint (panel icons, company logos, VS badges, stat cards). The generator (`../source/build_fd.mjs`) does not reproduce them, so it no longer writes the main deck directly; it refuses to unless given `--force`. Changes go in like this:

1. Edit `../source/build_fd.mjs` (or `model.mjs` / `proto.mjs`).
2. Build to the scratch folder: `cd ../source && node build_fd.mjs ../rough_work/_build/generator_deck.pptx`. The build fails if a slide's footer does not name every source its body cites.
3. Save the current deck: `bash ../source/snapshot.sh "what is about to change"`.
4. Apply to the hand-edited deck: `python3 _tools/apply_to_main.py ../meesho_dice_round2.pptx _build/generator_deck.pptx _build/main_applied.pptx --replace 13`, check it, then copy it over `../meesho_dice_round2.pptx`. The script removes citations and page pointers from slide bodies, sets each footer from the generator, and swaps in the slides listed after `--replace`.
5. Refresh the renders: `bash _tools/refresh_slides.sh`. It prints one line per slide and flags any citation or page pointer left in a body.
6. Export the PDF (LibreOffice is fine for checking; use PowerPoint for the final file).

## Citations

Slide bodies carry no `[S#]` / `[A#]` tags or page pointers. Each slide's sources are named only in its footer, and the full list is in Appendix B. The generator keeps the tags in its source text so every number can still be traced, and strips them when it draws the slide.

## Tools

| File | What it does |
|---|---|
| `_tools/capture_phone.mjs` | Captures all eight manufacturer-app phone screens from the live prototype (or the offline build) into `../source/assets/phone/`, with marker positions in `phone_screens.json`. Run `npm install` in `_tools` once; it uses the installed Google Chrome. |
| `_tools/apply_to_main.py` | Applies generator changes to the hand-edited deck (needs `lxml`). |
| `_tools/refresh_slides.sh` | Renders a deck into the slide folders and checks the bodies for citations. |
| `_build/` | Scratch builds (not committed). |
