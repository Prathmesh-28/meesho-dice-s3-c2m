# The prototype: what is required, and what we built

## What the competition asks for

| Source | Mentions a prototype? |
|---|---|
| Stage timeline (Unstop) | Yes, one line: "enhance, detail out their solutions in 8-10 slide deck and present a working prototype." No format, tool, length or upload method. |
| Business Track case brief | No. Asks for a 6–10 slide deck with seven sections. |
| Round 2 scoring criteria | No prototype criterion (research, depth, innovation, 10x, feasibility, presentation). |
| Official template | 5 blank branded slides, no instructions. |

**Reading (inference, not stated):** DICE 3.0 also has a Tech Track, so the "working prototype" line is probably shared wording. It is on the stage page, so treat it as required.

**What "working" should mean for a Business Track team:** the core mechanism running, not production software. In rising order of strength: clickable mockups → spreadsheet model → small web app on sample data. We built the third.

**How to submit it whatever the format turns out to be:** one deck slide with screenshots, the live link and a QR code; a 2–3 minute walkthrough video; the offline single-file HTML as backup.

## What we built: the C2M Control Tower

A React web app running every rule in the strategy on synthetic, seeded data (fictional sellers).

- **Live:** https://meesho-dice-c2m-iitb.vercel.app/ (mirror: https://prathmesh-28.github.io/c2m-control-tower/)
- **Source:** https://github.com/Prathmesh-28/c2m-control-tower (public; every push to `main` runs 4 model tests, then deploys to both sites)
- **Offline:** `prototype/dist-single/index.html`, one file, no internet needed
- **All assumptions:** `prototype/src/config.js`

| Module | What it shows (synthetic data) |
|---|---|
| Overview | The loop, one manufacturer's story (Kavin Knit Mills, Tiruppur, fictional), where each brief question is answered |
| 1 · Price Truth Index | 261 sellers, 4,415 SKUs, 9 categories. 180 above ₹5 cr screened; 62 pass; 84 "scale without price"; 18 loss-leader catalogues; 16 near misses; 7 of the 10 largest fail; size vs price gap r = −0.18. Gate is adjustable; C2M-ready list exports as CSV. |
| 2 · Day-30 readout | Badge vs matched holdout (balanced by re-randomisation). Base +18.2% (CI +15.1% to +21.5%) → fund; weak +4.7% → tighten; price decay (40% still clearing at D14) → stop. |
| 3 · Seller Health | 60-seller pilot scored daily; 90 automatic actions vs 3 human escalations; ≈910 sellers per category manager. Kavin: grant fires at D7 (orders at 41% of cohort median), graduates on D37. |
| 4 · Manufacturer app | Phone flow: price check (₹98 cost → ₹213 floor vs ₹245 median, 13.3% below), Demand Brief (12 districts, 15,630 orders/week), batch (1,052 pre-orders → make 1,210; ₹67,223 prepaid), WhatsApp brief with one-tap commit |
| How Meesho runs it | Data needed, daily job, assumptions, 90-day pilot |

**Model checks:** `npm test` verifies the gate holds, all three Day-30 decisions fire, the pre-order price stays above the margin floor, and automatic actions outnumber escalations.

**Before quoting any figure in the deck:** label it as prototype output on synthetic data; replace assumptions in `config.js` with sourced figures where possible.
