# Deck generator

The current deck, `../meesho_dice_round2.pptx`, is the 14-page **Factory Direct** deck: a cover, 10 content pages and 3 appendices. Its tabs follow the 15-page IIM Mumbai DICE winner: Primary Research, Manufacturer Segmentation, Awareness & Strategy, Benchmarking & Comparison, Best Practices, Manufacturer Journey, Cluster Criteria, Unit Economics, Financial Analysis, and Roadmap & Risks, which takes the place of their thank-you page. It is built from these files:

| File | What it does |
|---|---|
| `model.mjs` | The master model. It holds the source list `[S#]`, the assumption register `[A#]` and every calculation: sizing, the manufacturer's unit economics, Meesho's 5-year case, sensitivity, break-even, AHP, cohort scoring and RICE. `node model.mjs` prints the checks and writes `outputs.json`. |
| `proto.mjs` | Runs the prototype's own model (`../../prototype/src`) and exports its results (price-screen verdicts, Day-30 lift, Health Score counts), so the deck and the live app agree. |
| `build_fd.mjs` | Lays out the 14 pages and reads every number from `model.mjs` and `proto.mjs`. No number is typed onto a slide by hand. |
| `data/` | The live meesho.com teardown of 2 Oct 2026 (279 listings, raw and summary). Add `primary_research.json` here when the buyer survey and interview notes come in (format below). |

```bash
cd source
npm install                                    # pptxgenjs + sharp (package.json)
node model.mjs                                 # print model checks, refresh outputs.json
node build_fd.mjs ../meesho_dice_round2.pptx   # rebuild the deck (archives the old one first)
```

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

Before the current deck changes, save it: `./snapshot.sh "what is about to change"`. It copies the pptx and pdf into `../old/` as the next version (`vNN_date_time`) and logs it in `../old/VERSIONS.md`. Rebuilding into `../meesho_dice_round2.pptx` with either generator runs this automatically. If you edit the deck by hand in PowerPoint, run the script first.
