# Meesho DICE Challenge S3: Business Track

**Problem:** Building Meesho's Consumer-to-Manufacturer (C2M) Base
**Team:** Prathmesh Walimbe, Krishna Kanta Mondal (IIT Bombay, 23B0747)

## Folder layout

| Folder | Contents |
|---|---|
| `00_brief/` | Case brief and the official submission template |
| `01_round1_idea_submission/` | Round 1 three-slide entry (submitted) |
| `02_round2_detailed_submission/deck/` | Round 2 detailed deck (Factory Direct, 14 pages) and its generator |
| `02_round2_detailed_submission/prototype/` | Working prototype (C2M Control Tower) |
| `02_round2_detailed_submission/research/` | All Round 2 research: problem explained, solution, 50-lever solution space, approach deep dive, fact library with sources (start at its README) |

## Timeline

- Round 1, Idea Submission: 02 Sep to 15 Sep 2026 (done)
- **Round 2, Detailed Submission: 23 Sep to 04 Oct 2026, 11:59 PM IST**
- Grand Finale, Bangalore: date to be announced

## Round 2 deck

[`02_round2_detailed_submission/deck/meesho_dice_round2.pdf`](02_round2_detailed_submission/deck/meesho_dice_round2.pdf) (editable: `meesho_dice_round2.pptx`): **Factory Direct**, a cover, 10 content pages and 3 appendices. The tabs follow the IIM Mumbai DICE winner: Primary Research, Manufacturer Segmentation, Awareness & Strategy, Benchmarking & Comparison, Best Practices, Manufacturer Journey, Cluster Criteria, Unit Economics, Financial Analysis, and Roadmap & Risks. Every number comes from one master model, `deck/source/model.mjs`; `deck/source/build_fd.mjs` lays out the pages. Earlier versions live in [`deck/old/`](02_round2_detailed_submission/deck/old/VERSIONS.md); the current deck is always saved there before it changes.

## Round 2 prototype

**Live:** https://meesho-dice-c2m-iitb.vercel.app/ (mirror: https://prathmesh-28.github.io/c2m-control-tower/; source: https://github.com/Prathmesh-28/c2m-control-tower). Both redeploy on every push to `main`.

Open [`02_round2_detailed_submission/prototype/dist-single/index.html`](02_round2_detailed_submission/prototype/dist-single/index.html) for the offline demo. To run or edit the app, see the [prototype README](02_round2_detailed_submission/prototype/README.md). All prototype figures are generated sample data and must be labelled as such in the submission.
