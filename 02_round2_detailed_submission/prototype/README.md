# C2M Control Tower

Working React prototype of **Factory Direct** for the Meesho DICE Challenge S3 Business Track. It follows a fictional Tiruppur manufacturer from a price check to a demand brief, a weekly prepaid batch and its cash, the buyer's pre-order, the batch's physical operations (dates, node stock, exceptions, paperwork, capacity), daily seller health monitoring, and Meesho's five-year case. The price check, batch cash and business case use the same model and inputs as the deck (`src/lib/factoryDirect.js`, inputs in `src/config.js`); a test fails if they drift apart.

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
5. **Manufacturer app:** at the default ₹80 making cost, *Ship myself* shows **Not yet** (7.2% below the ₹209 buyers pay) and *Factory Node* shows **Qualifies** (8.5%); the route table compares all four routes. Then view the demand brief and commit this week's batch, sized from demand: 67 pre-orders a day at a 6% share, so a Thursday cut-off gives 469 pre-orders + 15% = 539 packs (above the 500-piece minimum run), made Friday to Sunday and shipped Monday, with 20% advanced at the cut-off and 10% at handover. Toggle *Deck batch* for the deck's worked batch (1,000 → 1,150, ₹54,684 advanced, +₹33,840), which is the same week at a 12.8% share. On WhatsApp, commit with one tap and approve the node top-up.
6. **Buyer pre-order:** pick a district; the buyer sees two factory offers with dates for that district (pre-order at ₹182, or node stock at ₹192 with cash on delivery), tracks the order through the batch, and can cancel.
7. **Batch operations:** eight questions a logistics reviewer asks, answered live, and five tabs: the week day by day (batch sizing, the advance, delivery promises by district), node stock (what a batch leaves behind, who sells it, the top-up the factory approves, storage and ageing), when it goes wrong (eight exceptions with owner and cost; innerwear return rules), paperwork and roles (GST, e-way bill, invoices, labels; who fixes and pays; order states; systems), and at scale (node sites at Year-4 volume and the NPV effect, nine categories, logistics KPIs and eight synthetic weekly batches).
8. **Finance analysis:** NPV, IRR, payback and break-even; drag the five drivers or switch Bear, Base and Bull.
9. **Scale-up & road map:** the five-step scale-up engine with its KPIs, the cluster kit, and the Day-30 / 60 / 90 gates with the money each releases (₹7.3 cr, then ₹14.9 cr; Year-1 cap ₹22.2 cr).

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
| `08_manufacturer_batch_committed.png` | This week's batch, sized from demand, with its dated timeline and cash |
| `09_whatsapp_brief.png` | WhatsApp demand brief, one-tap commit and the node top-up the owner approves |
| `10_buyer_preorder.png` | A Patna buyer's pre-order, tracked through the batch |
| `11_batch_operations_week.png` | The eight reviewer questions, the batch day by day, sizing, the advance and promises by district |
| `12_batch_operations_node_stock.png` | What a batch leaves at the node, who sells it, the approved top-up, storage and ageing |
| `13_batch_operations_exceptions.png` | Exceptions with owner and cost, and the innerwear return rules |
| `14_batch_operations_at_scale.png` | Node sites at Year-4 volume, nine categories, KPIs and eight weekly batches |
| `15_business_case.png` | Finance analysis: five-year case, drivers, benefit vs cost |
| `16_scale_up_road_map.png` | Scale-up engine, cluster kit and the 90-day gates |

To recapture after changing the model, rebuild with `npm run build:single` and screenshot each `#/` route.
