# How we solve the problem, exactly

All figures marked "prototype" come from the working prototype on synthetic data. Market figures come from the Round 1 research.

## The three core ideas

1. **Pick manufacturers by price, not size.** Measure who is actually cheaper using what buyers really paid.
2. **Keep the factory's B2B way of working.** Make nothing until it is sold, hand over in bulk, let someone else handle single orders and returns.
3. **Help new sellers with free visibility, not money.** When orders lag, show their products to more buyers instead of paying discounts or assigning a person.

## The loop

**QUALIFY → ONBOARD → ALLOCATE → DIAGNOSE & FIX → GRADUATE**, followed through one fictional manufacturer, Kavin Knit Mills (men's cotton briefs, Tiruppur).

### Step 0: Where to start

- **Who:** Cohort A, offline B2B factories. Their barriers are operational, and operational barriers are the only ones Meesho can remove with infrastructure instead of money.
- **Categories:** 9 of 12 pass four cost tests (cost floor below market median, spare capacity, low return band, freight per rupee of value).
- **Clusters:** Tiruppur (hosiery, AHP score 4.68) and Panipat (home textiles, 4.52).
- **Not Surat (3.28):** large, but traders job out the work and returns are high. Big but not cheap.

### Step 1: Qualify (Price Truth Index)

- Per product type, the order-weighted median price buyers paid (SKUs with ≥ 10 delivered orders). Per SKU: gap = (median − seller price) ÷ median.
- **Badge rule:** sellers above ₹5 cr GMV with ≥ 60% of live SKUs at least 8% below the median.
- Catches traders (big, not cheap), loss leaders (2–3 deep SKUs, rest at market), and a dominant seller skewing the median (it is compared against the median without its own orders).
- Offline factories have no listings, so the same test runs on their quote. Kavin: ₹98 making cost → lowest viable price ₹213 at 9% margin vs ₹245 market median = **13.3% below**; qualifies before listing.
- Prototype: 62 of 180 large sellers pass; 7 of the 10 largest fail.

### Step 2: Onboard (removing each fear)

| Fear | Fix | Kavin |
|---|---|---|
| "Is it worth it?" | Price check with returns, RTO and logistics priced in | Qualifies at ₹213 |
| "Will there be demand?" | Demand Brief: weekly orders by district, price band, size mix | 12 districts, 15,630 orders/week |
| "Must I stock up blind?" | Pre-order batch: buyers accept "ships in 7 days, ₹20 off"; make confirmed orders + 15% buffer | 1,052 pre-orders → makes 1,210 |
| "I can't pack single orders or handle returns" | Factory Node: one bulk drop; node picks, packs, ships, takes returns | One delivery |
| "I'll wait months for cash" | 30% of confirmed value at handover; rest 7 days after delivery | ₹67,223 upfront; cash in ~11 days, not 50 |

The node also lowers cost: 13.3% below market vs 10.8% if he ships himself.

### Step 3: Allocate (first 30 days, no subsidy)

The cause, per Meesho's CEO (Q4 FY26 call): products without a quality record "do not get visibility for orders". A new factory needs orders to prove quality and quality to get orders.

- Starter impressions in the 12 Demand Brief districts.
- If orders are below 60% of the cohort median at D7 or D14: **+25,000 impressions for 7 days**, automatically, at most twice.
- Cap: C2M sellers never exceed **20% of a category's impressions**.
- Kavin: orders at 41% of cohort median on D7 → grant fired automatically; orders recovered.

### Step 4: Diagnose and fix (rules, not account managers)

Health Score 0–100, daily: price gap held 30%, order pace 25%, quality returns 20%, on-time dispatch 15%, in-stock 10%.

Rules: gap < 8% for 7 days → price nudge · gap < 4% for 3 days → badge off · quality returns > 1.5× norm → suspension + QC checklist · dispatch < 90% → Factory Node offer · in-stock < 70% → restock nudge · score < 40 for 7 days after a fix → a person.

Prototype: 90 automatic actions vs 3 escalations across 60 sellers → ~910 sellers per category manager (vs ~70 account managers for 1,400 sellers).

### Step 5: Graduate and compound

- Score ≥ 80 for 30 days → prepaid batches as standard. Kavin graduated on D37.
- Long term: graduates launch value brands on Meesho Mall.
- Flywheel: cheaper factories get orders → orders fill idle capacity → volume lowers cost → market median falls → bar rises for resellers.

## How we avoid wasting money

| When | What | Gate |
|---|---|---|
| Days 0–30 (₹0 capex) | Price test with a control group: half of qualifying sellers badged, half not | Day 30: lift ≥ 12% and ≥ 70% still clear at D14 → fund; positive but < 12% → tighten to 10% and re-run; decay → stop |
| Days 31–60 | Sign Tiruppur and Panipat associations, 60 factories, briefs in 5 categories | Day 60 |
| Days 61–90 | Batch window + prepayment, first partner-warehouse node | Day 90: 3 of 4 operating metrics hold |

₹22 cr in Year 1; Round 1 model: NPV +₹156 cr, breakeven Year 3.

## What it deliberately avoids

Discounts and order subsidies (buy volume, not commitment) · an account manager per seller (breaks at 200) · choosing by size (the brief's warning) · squeezing factories on price (Shein Brazil: 336 signed, 1 left).

## Proven vs assumed

- **Proven by the prototype:** the logic runs end to end.
- **Assumed, to verify before spending:** return fee per customer return (₹90–150), Factory Node costs, pre-order uptake, order lift from extra visibility.
