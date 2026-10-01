# Deck audit against winning case-competition decks

Audited 1 Oct 2026: the current Round 2 deck (`deck/meesho_dice_round2.pptx`, cover + 10 slides) against what winning decks contain.

**Benchmark used.** Public winning decks (Meesho DICE 2.0 submission on Scribd, Flipkart WiRED 2018 on SlideShare) could not be opened beyond titles and thumbnails, so the standard comes from (a) guides by judges and winners: [Casebasix](https://www.casebasix.com/pages/consulting-case-competitions), [180 Degrees Consulting DTU handbook](https://pdfcoffee.com/case-competition-handbook-180-dc-dtu-pdf-free.html), [SlideTeam](https://www.slideteam.net/blog/top-20-case-competition-samples-with-templates-and-examples), [Hacking the Case Interview](https://www.hackingthecaseinterview.com/pages/case-competitions); and (b) the case-deck-density method distilled from IIM/IIT finalist decks for DICE, WiRED, LIME and Interrobang.

**What winning decks consistently do:** answer first (recommendation, 2–3 reasons and impact on page 1, often SCQA); action titles, so reading only the titles tells the whole argument; a problem-first section (issue tree, root causes with evidence); visible primary research (n, method, quotes, personas, survey charts); defended numbers (assumptions stated, workings in an appendix); a business case for the sponsor (unit economics, NPV, payback, sensitivity); implementation with owners, costs and timelines; a probability × impact risk matrix; one message per slide; and an appendix for Q&A.

**Severity:** 🔴 fix before submitting · 🟠 important · 🟡 polish.

---

## What the deck already does at winning-deck level (keep)

Navigation bar and a decision sentence on every slide · sources on every slide · frameworks that end in a decision (cluster AHP → Tiruppur and Panipat; RICE → sequence) · a randomised Day-30 test with fund / tighten / stop rules · gated spend (₹0 until proven) · named owners and team size · likelihood × impact matrix with guardrails · compliance by design · a live, working prototype (rare in Business Track entries).

---

## A. Storyline and structure

| # | Gap | Why judges care | Fix | Sev |
|---|---|---|---|---|
| A1 | **No answer-first page.** Page 1 is the cover; slide 1 opens on KPIs and cohorts. Nowhere does one page state the recommendation, why, and the impact. | A judge who reads only page 1 should know the whole answer. | Turn the cover into the answer: solution name, one-line recommendation, the loop, three numbers (₹173–272 cr to buyers, ₹0 until proven, ~910 sellers per manager). No extra page needed. | 🔴 |
| A2 | **No named solution, no single system picture.** Price screen, Demand Brief, batches, node, grants and Health Score appear on different slides; they are only shown together on slide 9. | Judges remember one named idea, not nine levers. | Name it (e.g., *Factory Direct*) and show the five-step loop on the cover or slide 1; every later slide tags which step it covers. | 🔴 |
| A3 | **Titles are questions; the answers sit in the bottom bands.** Reading the titles gives ten questions and no answers. | "If someone reads only your slide titles, they should understand your entire argument." | Make each title the answer (today's bottom band, shortened); keep the question as a small label. | 🔴 |
| A4 | **No problem-first section.** There is no issue tree of *why C2M penetration is low* (don't come → causes; don't stay → causes) with evidence. | Round 1 scored "problem-first mindset"; Round 2 scores depth. | Add a compact issue tree to slide 1, backed by the ICRIER exit reasons (43% knowledge, 43% returns, 42% charges, 39% skills, 35% profitability) and the CEO's visibility quote. | 🟠 |
| A5 | **11 pages vs a 6–10 slide limit.** | Some contests disqualify or penalise over-length entries. | Confirm with organisers whether the cover counts. If it does, merge Operating Model into Roadmap and Risks, or drop the standalone Prototype slide. | 🔴 |
| A6 | **No appendix and no references page.** Sizing workings, NPV derivation, interview sample, threshold calibration and full source list are absent. | Judges who dig into an appendix and find exact backup score highest; teams lose on undefended numbers in Q&A. | Ask whether an appendix counts. If not, keep a separate backup PDF for the finale Q&A; cross-reference "Appendix A" from the main slides. | 🟠 |

## B. Research quality (methods, sources, coverage)

| # | Gap | Fix | Sev |
|---|---|---|---|
| B1 | **Primary research is claimed but invisible.** "24 interviews" appears only as a count; there are no manufacturer quotes, personas or findings. The only quote is Meesho's CEO. | Add a voice-of-manufacturer strip: 3–4 short quotes (one per cohort) and one persona card per cohort (name, cluster, size, fear, motivation). | 🔴 |
| B2 | **No buyer-side research.** Pre-order uptake ("ships in 7 days, ₹20 off") is the biggest unknown, and the deck never asks buyers. | A quick buyer survey (n ≥ 30) on waiting for a lower price and trust in "factory direct"; at minimum a buyer persona and journey. | 🟠 |
| B3 | **Outdated Meesho figures.** Uses FY26 (264 mn users, 9.6 lakh sellers) though Q1 FY27 is out: 274 mn users (+29%), 1.04 mn sellers (+81%), NMV ₹11,614 cr in the quarter (+34%). | Update the KPI strip and sources. | 🟠 |
| B4 | **Strong external evidence unused:** ICRIER 2025 (2,365 manufacturing MSMEs; one-fifth of non-integrated firms tried e-commerce and quit). | Add to Segmentation (Cohort C) and to the issue tree (A4). | 🟠 |
| B5 | **All precedents are foreign** (Pinduoduo, Temu, Shein). | Add one or two Indian analogues: MSME-TEAM/ONDC onboarding, marketplace-backed seller loans, DealShare's group-buying lesson. | 🟡 |
| B6 | **Round 1 inputs shown without backing:** the funnel conversion rates (35%, 30%, 35%, 60%, 12%), cohort shares (72/19/9), AHP scores, ₹22 cr and NPV +₹156 cr. | One appendix page with the derivation of each; a footnote on the slide pointing to it. | 🟠 |

## C. Depth of analysis

| # | Gap | Fix | Sev |
|---|---|---|---|
| C1 | **The sizing rests on an undefended yield: ₹1.43 cr of NMV per C2M seller per year.** The average Meesho seller does about ₹4.3 lakh a year (₹41,560 cr ÷ 9.6 lakh), so this is **~33× the average**, about 148 orders a day per seller at a ₹265 AOV. A Meesho judge will challenge this first. | Justify it (e.g., top-decile manufacturer sellers on Meesho, or Kavin's 15,630 weekly district demand × share) and show a range: conservative / base / aggressive yield and the resulting NMV and savings. | 🔴 |
| C2 | **Time-base mismatch.** "4.8% of FY26 NMV" compares Year-4 C2M NMV with today's Meesho. If Meesho keeps growing ~30% a year, ₹1,995 cr is ~1.7% of Year-4 NMV. | Say "equal to 4.8% of FY26 NMV" or show share of projected Year-4 NMV. | 🟠 |
| C3 | **No TAM / SAM / SOM framing and no top-down cross-check.** Only a bottom-up count of firms. | Label the funnel TAM → SAM → SOM; add a top-down check (Meesho NMV in the 9 categories × share currently sold by resellers that C2M could replace). | 🟠 |
| C4 | **Incremental vs cannibalised NMV not separated.** Much of C2M NMV will shift from existing sellers; only part is new demand from lower prices. | Split NMV into "shifted" and "new" with a stated elasticity assumption; base contribution on the incremental part. | 🟠 |
| C5 | **Meesho's own business case is not defined.** With 0% commission, how does Meesho earn from C2M (ads, logistics fees, value-added services)? Who pays the node fee? How is ₹22 cr recovered? What exactly is in the NPV (incremental contribution? over how many years?). Contribution uses Meesho's average 4.0%, though node orders and grants change it. | One unit-economics row per C2M order for Meesho (revenue lines − node, grant and returns-pool costs) and a 5-year cash-flow line with the NPV box (appendix). | 🔴 |
| C6 | **No sensitivity on the business case.** The stress test covers the manufacturer's price gap only. | Best / base / worst NPV and breakeven for yield, pass-through and node cost. | 🟠 |
| C7 | **No acquisition funnel or cost per seller.** No "factories contacted → signed → listed → active" conversion, no cost per active C2M seller. | Add the funnel with target conversions and CAC (e.g., ₹5 cr co-op budget ÷ active sellers). | 🟠 |
| C8 | **Thresholds not justified:** 8% gap, 60% of SKUs, ₹5 cr floor, 20% impression cap, 25K-impression grant, 60%-of-cohort trigger, Health Score weights. | One line of rationale each (e.g., 8% = below the 12–18% integration cost edge so the badge leaves headroom), plus "recalibrated on the pilot". | 🟠 |
| C9 | **No current-state baselines.** KPIs have targets but no "today" values (C2M share of NMV now, new sellers' first-30-day order share). | Give an estimate or define how each baseline is measured in week 1 of the pilot. | 🟠 |

## D. Definitions a Meesho insider will probe

| # | Not clearly defined | Fix | Sev |
|---|---|---|---|
| D1 | **"Comparable set" and quality parity.** "Per product type" is too coarse; a cheaper but worse product would pass the price gate. | Define matching (catalogue taxonomy + attributes + image similarity) and a quality-parity check (ratings and return rate no worse than the set). | 🔴 |
| D2 | **What counts as a manufacturer, and how it is verified.** The Cost Ownership Index is named but not measured. | Verification: Udyam manufacturing code, GST purchase mix (raw material vs finished goods), factory photos or a visit. | 🟠 |
| D3 | **Two entry paths are blurred.** Slide 3 describes only existing sellers above ₹5 cr GMV (and does not say whether that is Meesho GMV or total turnover); the quote-based check for offline factories (72% of the base) is not shown on the screen slide. | Show both paths side by side: existing sellers (catalogue screen) and offline factories (quote screen). | 🟠 |
| D4 | **"Landed price"** (includes delivery fee? coupons? COD fee?). | Define once in a footnote. | 🟡 |
| D5 | **Who funds the ₹20 pre-order discount** (the factory, from avoided stock risk, capped at its floor) and what the buyer sees. | State it on the onboarding slide; show the buyer-side "ships in 7 days" card. | 🟠 |
| D6 | **Returns firewall** (₹3 cr pool): eligibility, cap per seller, what node grading covers. | One line of mechanics. | 🟡 |
| D7 | **Factory Node specifics:** operator (Valmo vs partner), fee per unit, capacity, factories per node, utilisation break-even, title and insurance. | A small spec box on onboarding or operating model. | 🟠 |
| D8 | **Exit and offboarding.** What happens to a factory that keeps failing (score < 40 after escalation), and to its stock at the node? | Add exit criteria and a wind-down rule. | 🟠 |
| D9 | **Graduation levels.** Only "prepaid batches" is defined. | A ladder (e.g., Test → Prove → Scale → Strategic) with what each unlocks. | 🟡 |
| D10 | **Experiment spillover.** Badged and control sellers compete in the same categories, so re-ranking can shift sales between them and overstate lift. | Note the category-NMV guardrail as the check, or randomise by category/region. | 🟡 |

## E. Innovation and 10x thinking

| # | Gap | Fix | Sev |
|---|---|---|---|
| E1 | **The 10x case is described but not quantified.** | One number: e.g., C2M at X% of NMV in the 9 categories by Year 5 → ₹Y cr of buyer savings a year; plus the data flywheel (every batch improves the Demand Brief). | 🟠 |
| E2 | **What is new vs what Meesho already does is not signposted.** | Tag levers as new / extends an existing Meesho asset (Valmo, ads engine, quality-gated visibility). | 🟡 |
| E3 | **Moving-benchmark risk missing.** As C2M lowers market prices, the 8% gate gets harder to pass. | Add to Risks with the fix (benchmark against resellers only once C2M share is large). | 🟠 |

## F. Feasibility and risks

| # | Gap | Fix | Sev |
|---|---|---|---|
| F1 | **Risks not covered:** knock-offs / IP infringement by factories (brand dupes); RTO and cancellations rising with 7-day pre-order delivery (especially COD); Demand Brief data used to sell on rival platforms; backlash from existing resellers; node capacity crunch in the festive peak. | Add the top three to the risk register with a guardrail each. | 🟠 |
| F2 | **Partners not concrete:** lending partner type, 3PL for the node, specific associations. | Name the partner type and selection criteria for each. | 🟡 |
| F3 | **Internal ownership:** who owns the C2M P&L inside Meesho; category teams judged on NMV may resist the 20% cap. | One line in the team table. | 🟡 |

## G. Presentation and design

| # | Gap | Fix | Sev |
|---|---|---|---|
| G1 | **Too dense:** 540–710 words per content slide vs the ~500-word ceiling winning decks keep; about 85% of each slide is tables. | Cut ~30%: one message per slide; move workings to the appendix. | 🟠 |
| G2 | **Text too small for the canvas.** The official template is 20 in wide, so 9.5–11.5 pt text reads like ~6–8 pt on a standard slide. | Body text ≥ 13–14 pt on this canvas, which forces the cuts in G1. | 🟠 |
| G3 | **Few charts:** one native chart; most numbers are in tables. | Turn 3–4 key tables into charts (funnel, opportunity ladder, Day-30 lift, Health Score). | 🟡 |
| G4 | **Prototype slide screenshots are small.** | One large hero screenshot plus the QR code; the rest in the appendix or video. | 🟡 |
| G5 | **Terms vary** ("C2M-ready", "badge", "gate"; "node", "Factory Node"). | A glossary line and consistent naming. | 🟡 |

---

## Priority order (by 4 Oct)

1. **A5** confirm the page rule → decide what to merge.
2. **A1–A3** answer-first cover, named solution and loop, action titles (cheap, high impact).
3. **C1, C5** defend the per-seller yield and define Meesho's business case (biggest Q&A risks).
4. **D1, B1** comparable-set and quality definition; manufacturer quotes and personas.
5. **B3, B4, E3, A4** quick evidence and risk updates (Q1 FY27, ICRIER, moving benchmark, issue tree).
6. **G1, G2** density and font size, done alongside the edits above.
7. Everything else into an appendix or backup PDF for the finale Q&A.

## Note on the public repo

`github.com/Prathmesh-28/meesho-dice-s3-c2m` already appears in web search results for "DICE Challenge Meesho business track". Other teams can find the full strategy before 4 Oct. Making it private until after judging is a two-click change.
