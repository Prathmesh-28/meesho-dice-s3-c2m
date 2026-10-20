# C2M Control Tower

Working React prototype of **Factory Direct** for the Meesho DICE Challenge S3 Business Track. It follows a fictional Tiruppur manufacturer from a price check to a demand brief, a prepaid batch and its cash, the buyer's pre-order, daily seller health monitoring, and Meesho's five-year case. The price check, batch cash and business case use the same model and inputs as the deck (`src/lib/factoryDirect.js`, inputs in `src/config.js`); a test fails if they drift apart.

**Live:** https://meesho-dice-c2m-iitb.vercel.app/
(mirror: https://prathmesh-28.github.io/c2m-control-tower/)

## Deploy

Every push to `main` updates both sites. Each one runs the model tests first, so a failing
model never goes live:

- **Vercel** (`vercel.json`): the Vercel project `meesho-dice-c2m-iitb` is connected to this
  GitHub repo and builds on every push.
- **GitHub Pages** (`.github/workflows/deploy.yml`): the Actions workflow builds and publishes.

To update the live sites, commit and push. There is no backend: the whole model runs in the
browser, so there is nothing else to host.

The page carries a `noindex` tag so search engines skip it until judging is over. Remove the
`robots` meta tag in `index.html` to allow indexing.

## Run

From this folder:

```bash
npm ci
npm run dev
```

Open the local address printed by Vite. For a production build, run `npm run build`. For an offline, single HTML demo, run `npm run build:single` and open `dist-single/index.html`. Run the model checks with `npm test`.

## Demo path

1. **Overview:** follow Kavin Knit Mills, the fictional example seller.
2. **Price Truth Index:** change the catalogue gate; inspect large sellers, price gaps, and a SKU breakdown. Export the resulting acquisition list as CSV.
3. **Day-30 readout:** switch Base, Weak lift, and Price decay to see the fund, tighten, and stop decisions.
4. **Seller Health:** inspect daily scores and the action log for Kavin Knit Mills and the 60-seller pilot.
5. **Manufacturer app:** at the default ₹80 making cost, *Ship myself* shows **Not yet** (7.2% below the ₹209 buyers pay) and *Factory Node* shows **Qualifies** (8.5%); the route table compares all four routes. Then view the demand brief, commit the deck's worked batch (1,000 pre-orders → 1,150 made, ₹54,684 advanced at handover, +₹33,840 to the factory on Day 15), see where returns go (they end at the node, graded), and the WhatsApp-style message.
6. **Buyer pre-order:** the buyer's product page with the "Sold directly by the manufacturer" badge; pre-order at ₹182 against ₹209 and watch it join the factory's batch.
7. **Finance analysis:** NPV, IRR, payback and break-even; drag the five drivers or switch Bear, Base and Bull.
8. **Scale-up & road map:** the five-step scale-up engine with its KPIs, the cluster kit, and the Day-30 / 60 / 90 gates with the money each releases (₹7.3 cr, then ₹14.9 cr; Year-1 cap ₹22.2 cr).

All sellers, prices, demand, orders, and outcomes are **synthetic, fixed-seed demonstration data**. The model is self-contained in the browser and does not connect to Meesho or WhatsApp. The displayed batch commitment, callback request, and payment are simulations; no external action occurs. Change proposal assumptions in `src/config.js`.

## Deck screenshots

Full-page captures at 2× resolution are in `screenshots/`, numbered in demo order:

| File | Shows |
|---|---|
| `01_overview.png` | The Factory Direct loop with live numbers, Kavin Knit Mills' story, and where each brief question is answered |
| `02_price_truth_index.png` | Scale vs price-gap scatter, category bars, seller table and SKU drill-down |
| `03_day30_readout_fund.png` | Base case: +18% lift, balanced groups, "fund" decision |
| `04_day30_readout_stop.png` | Price-decay case: gate retention falls below 70%, "stop" decision |
| `05_seller_health.png` | 60-seller pilot, Kavin's score and rule log, the rulebook |
| `06_manufacturer_price_check.png` | Price check before listing and the four-route table |
| `07_manufacturer_demand_brief.png` | Top 12 districts and the suggested batch |
| `08_manufacturer_batch_committed.png` | Committed batch and its cash, advance to balance |
| `09_whatsapp_brief.png` | WhatsApp demand brief with one-tap commit |
| `10_buyer_preorder.png` | The buyer's pre-order page and the batch it joins |
| `11_business_case.png` | Finance analysis: five-year case, drivers, benefit vs cost |
| `12_scale_up_road_map.png` | Scale-up engine, cluster kit and the 90-day gates |

To recapture after changing the model, rebuild with `npm run build:single` and screenshot each `#/` route.
