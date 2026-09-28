# Round 2 gap review

Checked on 27 Sep 2026 against the case brief, the Round 1 deck, the prototype, and public sources. The deadline is **04 Oct 2026, 11:59 PM IST**.

## 1. Fix before submitting

### 1.1 There is no Round 2 deck yet
**Update, 27 Sep:** a full 10-page draft now exists at `deck/meesho_dice_round2.pptx` (with a PDF). It covers all seven sections, adds a price-impact ladder and a KPI tree, and applies fixes 1.2–1.5 below. The ₹90 return fee is still shown as a range until it is sourced.

Original finding: `02_round2_detailed_submission/deck/` was empty. The deck is what gets scored; the prototype supports it. The brief asks for 8–10 slides covering seven sections:

| Section the brief requires | Where the material is today |
|---|---|
| Manufacturer segmentation (offline / online elsewhere / churned) | Round 1 slide 1 |
| Market sizing, including the **price** and NMV impact of closing the gap | Round 1 funnel has NMV (₹1,995 cr); buyer price impact is missing |
| Onboarding model | Prototype module 4 |
| Sustainable scale-up model | Prototype module 3 |
| Metrics and KPIs across onboarding, activation and retention | Health Score only; no funnel KPI tree |
| 30-60-90 roadmap | Round 1 slide 2, prototype "How Meesho runs it" |
| Risks and guardrails | Scattered across Round 1 slides 3 and the experiment screen |

### 1.2 Shein Brazil is a failed precedent, not a proven one
Round 1 cites "Shein Brazil: $150 mn, 2,000 local factories" as proof, and highlights it in the precedent table. Reuters (Feb 2026) found Shein had signed 336 factories by end-2023, and only one was confirmed still producing for it. Factories left because Shein demanded price cuts of about 30% (a skirt from R$50 to R$38) and faster delivery than they could manage. Shein now calls progress "slower and more challenging".

**Use it as an anti-precedent.** It is evidence for your thesis: squeezing factory prices without fixing their operating model makes them walk away. It also defends the price gate: it measures a price gap that already exists and never demands a cut.

### 1.3 The contribution margin tile is a single quarter
Round 1 shows "2.3% contribution margin, % of NMV" among FY26 figures. 2.3% was **Q3 FY26**, hit by a one-time logistics disruption. Q4 FY26 was 4.0%, and management said on the 6 May 2026 call that "the baseline from contribution margin perspective is the 4% Q4 exit rate". Meesho's leaders will spot this.

### 1.4 The ₹90 return cost has no source
The Round 1 return math and the prototype (`src/config.js`) use ₹90 per customer return, and the prototype also charges ₹40 per RTO.

- Third-party seller guides put a customer return at about ₹140–170 including tax for a parcel of 500g or less. One guide says ₹30–80. Meesho's own pricing pages block automated reads.
- Several sources, apparently quoting Meesho's supplier page, say Meesho charges **no reverse fee on RTOs**.

Pull the real figures from a supplier panel (any seller you interviewed in Round 1) and cite them. At ₹150 per return the category gap widens from 13 pp to about 21 pp: a 30%-return category costs ₹64 per unit kept (24% of a ₹265 AOV), against ₹8 (3%) at 5% returns. That makes your category-selection argument stronger, not weaker.

### 1.5 The zero-commission threat has grown since Round 1
Round 1 says Meesho's 0% commission is "matched by Amazon & Flipkart under ₹1,000". Since then:
- Flipkart removed the price cap for fashion on 8 Jul 2026: zero commission at every price point for about 90,000 fashion sellers. Shopsy is fully commission-free.
- Amazon India removed referral fees under ₹1,000 (Nov 2025) and expanded zero referral fees again in Mar 2026.

This strengthens "cost structure is the only moat a rate card cannot copy". Update the slide.

## 2. Evidence that strengthens the story

- **Meesho's own words on the cold-start problem.** Vidit Aatrey, Q4 FY26 call: when a new seller's quality "is not that great, they do not get visibility for orders. And products that have very good quality continue to scale." Quality-gated visibility protects buyers but starves a new manufacturer of the first orders it needs to prove quality. Starter impressions and impression grants fix exactly this without weakening the gate.
- **Tiruppur motivation is real, but the window is closing.** About 3,200 knitwear makers; FY26 production ₹74,747 cr, of which ₹44,747 cr exports and about ₹30,000 cr domestic. The 50% US tariff (Aug–Dec 2025) cut US orders 60–70% and closed 750–1,000 units. The tariff is now 18%, and the India–EU deal is reviving exports. Pitch C2M as permanent protection against the next export shock, and pilot now while the pain is fresh.
- **A 10x path through Meesho Mall.** Management is scaling Meesho Mall for "value brands or value packs" for "a billion people". Graduated C2M manufacturers can become Meesho Mall factory brands. Pinduoduo's New Brand Initiative did this: by end-2019, 900+ factories in C2M production, 2,200+ custom products, 115 mn+ orders (verified).
- **Valmo fits the Factory Node, with a caution.** Valmo handles 50–55% of deliveries, and Valmo Transportation became a subsidiary in Jan 2026. Management deliberately scaled back insourcing to protect margin, so present nodes as asset-light (partner warehouses; Meesho already uses about 3,000 small businesses for sorting), not new capex.
- **The seller pool is widening.** Non-GST sellers can now sell online; Aatrey called the pool "tens of millions" of businesses.
- **Temu's shift supports the node idea.** Temu moved from fully managed to semi-managed in 2025: merchants bulk-ship to local warehouses and Temu runs the storefront. That is close to the Factory Node.
- **Possible co-funding.** The MSME-TEAM scheme (₹277 cr, 5 lakh micro and small enterprises, catalogue and onboarding support) funds onboarding to the ONDC network. Check whether Meesho's ONDC participation qualifies; it could offset the ₹5 cr cluster co-op cost.

## 3. Claims to verify or drop

| Round 1 claim | Status |
|---|---|
| FY26 NMV ₹41,560 cr, +39% | Verified |
| 264 mn annual transacting users | Verified (+33%) |
| AOV ₹265, down 3% | Verified (from ₹274) |
| Sellers ≈5.1 lakh → 9.61 lakh | Consistent: 9.6 lakh transacting sellers, +87% |
| 2.3% contribution margin | **Wrong period**; use 4.0% Q4 exit (1.3) |
| Shein Brazil as proven | **Failed**; reframe (1.2) |
| Temu: 200k merchants in <2 yrs; 4 mn parcels/day from 60 nodes; 50% of new sellers sell within 20 days | Not verified. Cite a source or drop |
| Pinduoduo: 900+ factories, 2,200 SKUs, 115 mn orders | Verified (end-2019) |
| 4.72 cr Udyam MSMEs, 98.9% micro | Label the source. Udyam totals 7.83 cr including Udyam Assist (Feb 2026); a judge may quote that. The 98.9% micro, ~4.9 lakh small and 37,042 medium figures check out |

## 4. Prototype gaps against the brief

1. **Cohorts B and C have no flow.** The prototype follows one Cohort A manufacturer. Add a slide or screen for the Cohort B value-tier price check, and Cohort C re-entry (health-score re-entry plus the returns firewall).
2. **No KPI tree.** The brief asks for metrics across onboarding (qualified → listed, time to first listing), activation (share with enough orders in 30 days, time to 10th order) and retention (D60/D90 active, price-gap retention, graduation rate).
3. **The return and RTO costs in `src/config.js`** should match whatever figure you source in 1.4.

## Sources

- Meesho FY26 results: [Deccan Herald](https://www.deccanherald.com/business/companies/meeshos-annual-transacting-users-grew-33-to-264-million-in-fy26-4122686), [Apparel Resources](https://in.apparelresources.com/business-news/retail/meesho-records-revenue-growth-lower-losses-q4-fy-26/), [MediaNama](https://www.medianama.com/2026/05/223-meesho-posts-rs-166-crore-loss-q4-fy26-revenue-jumps-47/)
- Q4 FY26 earnings call transcript, 6 May 2026: [Meesho investor relations (PDF)](https://static-assets.meesho.com/investor-relations/1778588935634/AnnouncementunderRegulation30LODR-EarningsCallTranscript.pdf)
- Contribution margin, sellers, Valmo: [Inc42](https://inc42.com/buzz/meesho-q4-loss-narrows-88-to-%E2%82%B9166-cr/), [Exencial Research](https://exencialrp.substack.com/p/meesho), [Business Standard broker note](https://bsmedia.business-standard.com/_media/bs/data/market-reports/equity-brokertips/2026-05/17781299470.36140600.pdf)
- Shein Brazil: [FashionNetwork / Reuters](https://us.fashionnetwork.com/news/Shein-tried-to-turn-brazil-into-a-production-hub-local-factories-walked-away,1804653.html), [Shein 2023 announcement](https://www.sheingroup.com/corporate-news/company-updates/shein-to-bring-local-manufacturing-to-brazil-enabling-2000-local-manufacturers-thatwill-create-approximately-100000-jobs-in-the-next-three-years/)
- Zero commission: [Flipkart announcement](https://stories.flipkart.com/announcement/flipkart-expands-zero-commission-across-fashion-empowering-sellers-and-accelerating-the-growth-of-india-s-fashion-ecosystem), [Outlook Business](https://www.outlookbusiness.com/corporate/flipkart-scraps-seller-commission-across-all-fashion-price-points), [Business Standard (Amazon)](https://www.business-standard.com/companies/news/amazon-removes-referral-fee-below-rs-1000-as-flipkart-zero-commission-125112900114_1.html)
- Return and RTO fees: [Shiprocket](https://www.shiprocket.in/blog/meesho-shipping-charges/), [Robnu](https://robnu.com/guides/rto-in-meesho), [Meesho supplier shipping page](https://supplier.meesho.com/shipping)
- Tiruppur: [The Federal](https://thefederal.com/category/states/south/tamil-nadu/tiruppur-textile-revival-india-us-zero-tariff-229897), [Deccan Herald](https://www.deccanherald.com/india/tamil-nadu/prioritise-resolution-of-us-tariff-rs-15000-crore-export-orders-from-tiruppur-wiped-out-cm-m-k-stalin-tells-pm-modi-3835076), [Asian Age](https://www.asianage.com/opinion/columnists/dev-360-how-tiruppur-is-coping-under-shadow-of-tariffs-patralekha-chatterjee-1990392)
- Pinduoduo New Brand Initiative: [KrASIA](https://kr-asia.com/pinduoduo-is-partnering-with-chinese-manufacturers-to-build-sharp-domestic-brands)
- Temu semi-managed shift: [Tech Buzz China](https://techbuzzchina.substack.com/p/temu-watch-10-logistics-in-times), [China Digital Retail Report](https://chinadigitalretailreport.substack.com/p/report-temu-watch-15-forward-warehouse)
- Udyam: [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2246892&reg=3&lang=1)
- MSME-TEAM: [Inc42](https://inc42.com/buzz/govt-launches-inr-277-cr-team-initiative-to-add-5-lakh-msmes-to-ondc/)
- Valmo subsidiary: [Business Standard](https://www.business-standard.com/markets/capital-market-news/meesho-incorporates-wos-named-valmo-transportation-126012901647_1.html)
