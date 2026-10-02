# The Factory Direct deck: storyline, model, new research, audit

The 14-page Round 2 deck (`deck/meesho_dice_round2.pptx`), built on 2 Oct 2026 in the csuite-case-deck format and rebuilt the same day to follow the page flow and density of the 15-page DICE winner (IIM Mumbai, self-pickup). Earlier versions are archived in `deck/old/`: v03 is the 11-page deck, and v04 is the first 14-page version.

## Structure

The page flow copies the IIM Mumbai winner tab for tab, with "Customer" read as "Manufacturer" and "Location" as "Cluster". Our closer replaces their thank-you page. Every content page has an action headline with a number, dense panels, and a decision band (decision, owner, KPI).

| Page | Tab | What the page carries |
|---|---|---|
| 1 | Cover | Governing thought: screen on price, not size; make only what is sold; 1,400 factories, ₹1,995 cr NMV 8–12% below market, NPV ₹75 cr on ₹22.2 cr Year-1 cash |
| 2 | Primary Research | Objective; as-is vs to-be chain; problem size (≈ ₹1,049 cr a year of wholesaler mark-up); 5 challenges; three data sets (ICRIER n = 2,365, teardown n = 279, buyer survey); 24 interviews (barrier grid); stakeholders' voice |
| 3 | Manufacturer Segmentation | 12-category screen; TAM → SAM → SOM; 4 manufacturer personas with cohort scores; least likely to adopt; recommendation |
| 4 | Awareness & Strategy | 6-frame storyboard of one factory owner, with the lever at each step; rationale; ATL/TTL/BTL channels; cluster camps; 4P of the offer; bottlenecks |
| 5 | Benchmarking & Comparison | 3 operating models as process ribbons (who does what, result); symbol comparison; costs per model |
| 6 | Best Practices | 5 platforms × 5 dimensions; what we copy; pitfalls; RICE; benefits analysis |
| 7 | Manufacturer Journey | 7-stage journey grid (action, touchpoint, feeling, pain point, intervention, KPI); incentives and nudges; Health Score; rulebook; prototype screens |
| 8 | Cluster Criteria | Selection criteria; AHP matrix (CR 0.016); cluster scoring; live teardown chart; price gate two ways (listing vs demand-weighted median) with prototype verdicts |
| 9 | Unit Economics | Scenario column table per 3-pack (per 100 shipped); one 1,000-pack batch stage by stage; where the ₹45 per pack goes; assumptions strip |
| 10 | Financial Analysis | 5-year table with discount factors and PV; NPV box; opportunity ladder; benefit vs cost chart; tornado; break-even and scenarios; Round 1 reconciliation |
| 11 | Roadmap & Risks | Phase × workstream grid with gates; KPI targets by phase; risk register; the ask |
| 12–14 | Appendices A–C | Prototype walkthrough · sources, method, assumption register · detailed benchmarks, compliance, model workings |

## What the model says (deck/source/model.mjs)

- **Meesho's value per C2M order** = 40% incremental × ₹7.3 contribution (Q1 FY27: ₹531 cr ÷ 725 mn placed orders) + ₹2.8 saved on failed deliveries. The second term: 50% of C2M orders are prepaid pre-orders, so 31.5 pts of orders move from cash on delivery to prepaid; at a 15-pt COD-vs-prepaid failure gap, that is 4.7 pts fewer failed deliveries × ₹60 each.
- **Five-year case (₹ cr):** benefit 5.2 / 26.0 / 46.8 / 68.7 / 76.7; programme cost 25.8 / 16.5 / 18.0 / 20.1 / 16.0. NPV ₹74.9 cr at 12% (t = 1..5, no terminal value), ₹66.1 cr at 15%, IRR 105%, payback in Year 3.
- **Robustness:** NPV = 0 at 45% of planned seller yield (49% of planned benefit). NPV stays positive with zero incremental orders (₹0.8 cr) or with no failed-delivery saving (₹9 cr). Bear −₹10 cr, base ₹75 cr, bull ₹140 cr.
- **Why lower than Round 1's ₹156 cr:** Round 1 counted contribution on every C2M order. If every order were incremental, this model gives ₹186 cr.
- **Manufacturer, men's briefs 3-pack, ₹80 making cost, against the ₹209 demand-weighted median:**

  | Route | Lowest viable price | Against the ₹209 median | Gate |
  |---|---|---|---|
  | Reseller today | ₹220 | 5.4% above | fails |
  | Factory lists direct | ₹194 | 7.2% below | fails |
  | + Factory Node | ₹191 | 8.5% below | passes |
  | + Prepaid pre-order batch | ₹180 | 13.8% below | passes |

  The levers raise the highest making cost that still clears the gate from ₹78.7 to ₹90.7. That is what widens the pool of qualifying factories.
- **Problem size:** about ₹1,049 cr a year of wholesaler mark-up sits inside Meesho's nine C2M categories (₹41,560 cr FY26 NMV × 40% × 6.3%).

Corrections against earlier work:

- **Return fee:** ₹150 per return (seller guides ₹140–170), not ₹90.
- **Failed-delivery fee:** sellers pay no fee on a failed delivery (Meesho's policy), so the ₹40 RTO fee in the prototype is not used.
- **Market price:** the demand-weighted median replaces the synthetic ₹245.

## New research used (details in 10_facts_and_sources.md)

- Meesho Q1 FY27 letter: H2 bets with a hard budget cap, graduating to H1 on adoption and retention; this becomes the ask on page 11.
- Live meesho.com teardown, 279 listings: volume concentrates at the low end of the price range.
- Tiruppur owner quotes (Apparel Resources, Jun 2026) and a Panipat chamber quote (The Tribune, Aug 2026).
- Taobao C2M (Xinhua 2020; Alibaba results 2022), Temu semi-managed (Tech Buzz China 2024), Shein's 100–200 item batches (AFP 2024).
- MSME limits (2025) and RBI capacity utilisation (74.3%).

## Audit (csuite-case-deck checklist)

- `audit_numbers.py`:
  - AHP: reciprocal, CR 0.016.
  - NPV: ₹75 cr under the t = 1 convention; IRR 104.7%; break-even at 49% of planned benefit.
  - Cohort ranking: A > C > B either way.
  - RICE: the order matches the dependency order.
- The PV row shown on page 10 sums to the NPV shown (the build stops if it does not).
- Year-4 NMV appears twice by design: ₹1,853 cr in the 5-year case (average 1,300 sellers) and ₹1,995 cr exit run-rate on page 4 (1,400 sellers). Both are labelled.
- File structure: the pptx validator passed. Words per page: 500–635 including tabs and footers, in line with the winner deck's density.

## Open items before submission (4 Oct, 11:59 PM IST)

1. **Buyer survey** (kit: `13_survey_and_interview_kit.md`).
   - Put the results in `deck/source/data/primary_research.json` and rebuild.
   - Until then, page 2 and Appendix B carry `[FILL]` markers. Do not submit with them.
   - Once the price-ladder results are in, re-set A10 (prepaid pre-order share) and A32 (pre-order discount).
2. **Team interview quotes**: up to two rows replace the published quotes on page 2.
3. **Photos**:
   - Member photos: two placeholder circles on the cover.
   - Optional field photos for page 2.
   - A folder `03_winner_style_rebuild/assets/tiruppur_factory.jpg` exists from a separate effort; check its source before using it.
4. **Making cost** of ₹80 for a briefs 3-pack (A22): confirm with one or two Tiruppur owners.
5. **Prototype gaps**:
   - The prototype still uses the synthetic ₹245 median and a ₹90 return fee.
   - The deck labels prototype figures as synthetic; align the prototype's config if time allows.
6. **Final PDF**: export from PowerPoint, to embed Calibri.
7. **Page count**: confirm with the organisers whether the appendices count against the 6–10 slide limit.
