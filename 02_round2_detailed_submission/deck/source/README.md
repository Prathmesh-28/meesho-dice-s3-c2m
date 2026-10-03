# Deck generator

The current deck, `../meesho_dice_round2.pptx`, is the 15-page **Factory Direct** deck: a cover, 11 content pages and 3 appendices. Its tabs follow the 15-page IIM Mumbai DICE winner, with a User Personas & Flow page added and a week-by-week 90-day plan as the closer: Primary Research, Manufacturer Segmentation, User Personas & Flow, Awareness & Strategy, Benchmarking & Comparison, Best Practices, Manufacturer Journey, Cluster Criteria, Unit Economics, Financial Analysis, 90-Day Plan & Risks. It is built from these files:

| File | What it does |
|---|---|
| `model.mjs` | The master model. It holds the source list `[S#]`, the assumption register `[A#]` and every calculation: sizing, the manufacturer's unit economics, Meesho's 5-year case, sensitivity, break-even, AHP, cohort scoring and RICE. `node model.mjs` prints the checks and writes `outputs.json`. |
| `proto.mjs` | Runs the prototype's own model (`../../prototype/src`) and exports its results (price-screen verdicts, Day-30 lift, Health Score counts, and the manufacturer app's screen values), so the deck and the live app agree. |
| `build_fd.mjs` | Lays out the 15 pages and reads every number from `model.mjs` and `proto.mjs`. No number is typed onto a slide by hand. Source tags (`[S#]`, `[A#]`) stay in its text for tracing but are not drawn on the slides; each slide names its sources in its footer, and the build fails if a footer misses one. |
| `assets/phone/` | The eight manufacturer-app phone screens on slide 13 and their marker positions, captured from the live prototype by `../rough_work/_tools/capture_phone.mjs`. |
| `data/` | The live meesho.com teardown of 2 Oct 2026 (279 listings, raw and summary). Add `primary_research.json` here when the buyer survey and interview notes come in (format below). |

```bash
cd source
npm install                                    # pptxgenjs + sharp (package.json)
node model.mjs                                 # print model checks, refresh outputs.json
node build_fd.mjs ../rough_work/_build/generator_deck.pptx   # build a copy to check or apply
```

The main deck has hand edits made in PowerPoint (icons, logos) that the generator does not reproduce, so `build_fd.mjs` refuses to overwrite it unless given `--force`. Apply generator changes with `../rough_work/_tools/apply_to_main.py`; the steps are in `../rough_work/README.md`.

`build.mjs` is the generator for the earlier 11-page deck (v03). It is kept for history and imports the prototype's model from `../../prototype/src`.

## Adding the buyer survey and interview notes

Until `data/primary_research.json` exists, page 2 shows a marked `[FILL: …]` panel for the buyer survey, and Appendix B shows `[FILL: …]` for the sample. Create the file, then rebuild:

```json
{
  "survey": {
    "n": 0,
    "dates": "…",
    "quotas": "metro …, other city …, town or village …",
    "ladder": [["₹10 off", 0.0], ["₹20 off", 0.0], ["₹40 off", 0.0]],
    "takeaway": "…"
  },
  "interviews": [
    { "who": "Owner, knitwear unit, ~₹20 cr (Tiruppur)", "quote": "…", "problem": "…", "area": "Operations", "implication": "…" }
  ]
}
```

Replace every `0` and `…` with the real results (shares as decimals, e.g. 0.42 for 42%). Use the real counts and keep each quote verbatim and under 25 words. Up to two interview rows replace the published-interview rows on page 2.

## PDF and fonts

Export the final PDF from PowerPoint (File → Export → PDF) so Calibri is embedded. The PDF in this folder was rendered with LibreOffice for layout checks. Template artwork in `assets/` comes from the official DICE S3 submission template; `iitb_logo*.png` is the IIT Bombay logo from Wikimedia.

## Version history

Before the current deck changes, save it: `./snapshot.sh "what is about to change"`. It copies the pptx and pdf into `../old/` as the next version (`vNN_date_time`) and logs it in `../old/VERSIONS.md`. `build_fd.mjs --force` runs it automatically before overwriting the main deck. Run it yourself before editing the deck by hand in PowerPoint or applying changes with `apply_to_main.py`.
