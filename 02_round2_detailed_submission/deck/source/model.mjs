// Factory Direct master model. Every number on a slide comes from OUT below.
// Inputs live only in A (assumption register) and S (sources). `node model.mjs` prints the checks and writes outputs.json.
import fs from 'fs';
import path from 'path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const TEARDOWN = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'meesho_teardown_summary.json'), 'utf8'));
const RAW = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'meesho_teardown_2026-10-02.json'), 'utf8'));

// ---------------------------------------------------------------- sources [S#]
export const S = {
  S1: ['Meesho', 'Q1 FY27 Shareholders’ Letter (quarter to 30 Jun 2026)', 'Aug 2026', 'investor.meesho.com'],
  S2: ['Meesho', 'Q4 FY26 earnings call transcript', '6 May 2026', 'investor.meesho.com'],
  S3: ['Deccan Herald; Apparel Resources; Inc42', 'Meesho FY26 results coverage', 'May 2026', 'deccanherald.com; apparelresources.com'],
  S4: ['ICRIER', 'Annual Survey of MSMEs in India 2025 (n = 2,365, Fig. 16)', 'Mar 2025', 'icrier.org'],
  S5: ['Ministry of MSME', 'S.O. 1364(E): revised MSME limits', '21 Mar 2025', 'via taxmann.com'],
  S6: ['RBI', 'OBICUS, Q2 FY26: capacity utilisation 74.3%', 'Oct 2025', 'via business-standard.com'],
  S7: ['Udyam portal (team pull); PIB', 'Udyam registrations', 'Jun 2026; 28 Feb 2026', 'udyamregistration.gov.in; pib.gov.in'],
  S8: ['The Federal; Deccan Herald', 'Tiruppur output, exports, tariff impact', '2025–26', 'thefederal.com; deccanherald.com'],
  S9: ['The Tribune', 'Panipat textile industry hit by weak demand, high costs', '17 Aug 2026', 'tribuneindia.com'],
  S10: ['Team teardown', 'meesho.com search: 279 live listings, 5 product types', '2 Oct 2026', 'deck/source/data'],
  S11: ['Shiprocket; Robnu', 'Meesho seller fee guides (return fee, RTO policy)', '2026', 'shiprocket.in; robnu.com'],
  S12: ['Shiprocket', 'Fulfilment pricing: ₹24 per order, 500–3,000 orders a month', '2026', 'shiprocket.in'],
  S13: ['GoKwik via Base; TrackVid', 'COD vs prepaid RTO benchmarks (industry estimates)', '2026', 'vendor reports'],
  S14: ['Flipkart newsroom; Business Standard', '0% commission moves (Amazon, Flipkart)', 'Nov 2025 – 8 Jul 2026', 'stories.flipkart.com'],
  S15: ['KrASIA', 'Pinduoduo New Brand Initiative (end-2019 figures)', '2020', 'kr-asia.com'],
  S16: ['Tech Buzz China', 'Temu Watch #6: semi-managed share of GMV', '27 Dec 2024', 'techbuzzchina.substack.com'],
  S17: ['Reuters via FashionNetwork', 'Shein tried to turn Brazil into a production hub', 'Feb 2026', 'fashionnetwork.com'],
  S18: ['Inc42', 'MSME-TEAM: ₹277 cr to onboard 5 lakh MSMEs onto ONDC', '2024', 'inc42.com'],
  S19: ['Khaitan & Co; LexOrbis', 'Press Note 2 (2018); E-Commerce Amendment Rules 2026', '2018; Sep 2026', 'khaitanco.com; lexorbis.com'],
  S20: ['Finnovate; Zappchai (DRHP-based)', 'Meesho category mix estimates', '2025', 'finnovate.in'],
  S21: ['Apparel Resources', 'Tirupur rewires its growth playbook (owner interviews)', '25 Jun 2026', 'apparelresources.com'],
  S22: ['Team 23B0747', 'Round 1 research: 24 interviews, cluster AHP, sizing funnel, category screen', 'Sep 2026', 'Round 1 deck'],
  S23: ['Xinhua', 'Taobao C2M: 10 bn new orders for factories in 3 years', '27 Mar 2020', 'xinhuanet.com'],
  S24: ['Alibaba Group', 'December Quarter 2021 Results (Taobao Deals)', '23 Feb 2022', 'alibabagroup.com'],
  S25: ['AFP via Malay Mail', 'Shein statement on 100–200 item first batches', '24 Mar 2024', 'malaymail.com'],
  S26: ['Bank of Baroda', 'E-commerce business loans for marketplace sellers', '2026', 'bankofbaroda.bank.in'],
};

// ---------------------------------------------------------------- assumptions [A#]
const a = (value, unit, label, src, conf, pages) => ({ value, unit, label, src, conf, pages });
export const A = {
  // sizing and ramp
  A1: a(1.425, '₹ cr NMV / seller / yr', 'Mature NMV per C2M seller (Round 1 yield)', 'S22', 'M', '4, 10'),
  A2: a(0.12, 'share of SAM', 'Active C2M sellers by Year 4 (1,400 of 11,645)', 'S22', 'M', '4, 11'),
  A3: a([200, 700, 1050, 1300, 1450], 'avg active sellers', 'Seller ramp, Years 1–5 (year-end 450 / 900 / 1,150 / 1,400 / 1,500)', 'Team plan', 'M', '10'),
  A4: a([0.70, 1.00, 1.20, 1.425, 1.425], '₹ cr / seller', 'Yield ramp to the mature A1', 'Team plan', 'M', '10'),
  A5: a(25, '₹ cr turnover', 'Typical target factory (small enterprise band ₹10–100 cr)', 'S5', 'L', '4'),
  A6: a(0.40, 'share of NMV', 'Meesho NMV inside the nine C2M categories', 'S20', 'L', '2, 4'),
  A7: a([0.08, 0.12], 'price gap', 'Gap passed to buyers: 8% gate floor to 12%', 'S22', 'M', '4'),
  // Meesho economics
  A8: a(0.40, 'share of C2M orders', 'Incremental orders (the rest shift from other Meesho sellers)', 'Team judgement', 'L', '10'),
  A9: a(0.10, 'price cut', 'C2M GMV per order vs Meesho average (mid-point of A7)', 'A7', 'M', '10'),
  A10: a(0.50, 'share of C2M orders', 'Placed as prepaid pre-orders (to calibrate with buyer survey Q6–Q9)', 'Pending survey', 'L', '6, 10'),
  A11: a(0.15, 'pts', 'Failed-delivery gap, COD vs prepaid (industry ~26% vs <8%)', 'S13 (set below the gap)', 'L', '6, 10'),
  A12: a(60, '₹ / failed delivery', 'Meesho’s cost of a failed delivery (sellers pay no RTO fee)', 'S11, S13', 'L', '10'),
  A13: a(0.30, '₹ cr / FTE-yr', 'Loaded cost per programme FTE', 'Team estimate', 'M', '10'),
  A14: a([12, 20, 24, 26, 26], 'FTE (year average)', 'Programme team: 8.5 at pilot, 16 in Wave 2, 1 lead per cluster', 'Team plan', 'M', '10, 11'),
  A15: a({ clusters: [5, 8, 10, 12, 12], perCluster: 1.0 }, 'year-end; ₹ cr', 'Cluster onboarding: association MoU, catalogue camps, GST/KYC drives', 'S22', 'M', '10, 11'),
  A16: a([6, 3, 3, 3, 3], '₹ cr / yr', 'Demand Brief: build in Year 1, then run', 'S22', 'M', '10'),
  A17: a({ nodes: [6, 8, 10, 12, 12], perNode: 1.3, life: 5 }, 'year-end; ₹ cr; years', 'Factory Node set-up support at partner warehouses', 'Team estimate', 'L', '6, 10'),
  A18: a({ y1: 3, share: 0.001 }, '₹ cr; share of NMV', 'Returns firewall pool', 'S22', 'L', '10'),
  A19: a({ cpm: 75, perSeller: 50000, newSellers: [450, 450, 250, 250, 100] }, '₹ / 1,000; impressions', 'Impression grants valued at ad CPM (max 2 × 25K)', 'Team estimate', 'L', '8, 10'),
  A20: a({ advance: 0.30, firstLoss: 0.01 }, 'share', '30% of pre-order value advanced via an NBFC; Meesho first-loss 1%', 'S26, team', 'L', '6, 10'),
  A21: a([0.12, 0.15], 'rate', 'Discount rate (base; stress)', 'S22', 'M', '10'),
  // manufacturer unit economics (hosiery 3-pack, Tiruppur)
  A22: a(80, '₹ / 3-pack', 'Making cost of a cost-advantaged unit (to confirm in interviews)', 'Pending interviews', 'L', '6'),
  A23: a(0.09, 'margin', 'Target margin on price (B2B norm cited in interviews)', 'S22', 'M', '6'),
  A24: a(0.15, 'margin', 'Wholesaler mark-up a reseller pays above the ex-factory price', 'Team estimate', 'L', '2, 6'),
  A25: a({ rto: 0.14, ret: 0.08 }, 'share', 'Hosiery: failed deliveries (of shipped) and returns (of delivered)', 'Team estimate', 'L', '6'),
  A26: a(150, '₹ / return', 'Return fee charged to the seller (guides ₹140–170, ≤500 g)', 'S11', 'M', '6'),
  A27: a(0, '₹ / RTO', 'Seller fee on a failed delivery', 'S11', 'M', '6'),
  A28: a({ selfFwd: 55, selfPack: 10, nodeFwd: 42, nodeFee: 20 }, '₹ / unit', 'Forward fee (delivered) and packing; node fee = pack 6 + handle 9 + bulk freight 5', 'S11, S12', 'L', '6'),
  A29: a({ self: 0.85, node: 0.90 }, 'share of cost', 'Value recovered on returned and failed units', 'Team estimate', 'L', '6'),
  A30: a({ rate: 0.18, stockDays: 45, batchDays: 10 }, 'rate; days', 'Working capital: 18% cost, 45 days build-to-stock vs 10 days batch', 'S4 (16–25%)', 'M', '6'),
  A31: a({ stock: 0.10, batch: 0.02, salvage: 0.50 }, 'share', 'Unsold stock: build-to-stock vs confirmed batch; salvage value', 'Team estimate', 'L', '6'),
  A32: a(10, '₹ / pre-order', 'Pre-order discount for 7–8 day delivery (survey rung Q6)', 'Pending survey', 'L', '6, 8'),
};

// ---------------------------------------------------------------- helpers
const sum = (xs) => xs.reduce((s, x) => s + x, 0);
const npv = (r, flows) => sum(flows.map((f, i) => f / (1 + r) ** (i + 1)));
function irr(flows) {
  let lo = -0.9, hi = 10;
  for (let k = 0; k < 300; k++) { const m = (lo + hi) / 2; if (npv(m, flows) > 0) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;

// ---------------------------------------------------------------- sponsor baseline [S1, S3]
const SP = {
  ordersQ1: 725e6, gmvQ1: 19054, nmvQ1: 11614, cmQ1: 0.046, cmCr: 531, prepaid: 0.37, atu: 274, ats: 1.04, tier2: 0.45, cash: 6521, growth: 0.021, freq: 10.3,
  fy26Nmv: 41560, fy26Aov: 265, fy26Orders: 2.67e9, fy26Sellers: 9.6e5,
};
SP.gmvPerOrder = SP.gmvQ1 * 1e7 / SP.ordersQ1; // ₹262.8
SP.nmvGmv = SP.nmvQ1 / SP.gmvQ1; // 0.610
SP.contribPerOrder = SP.cmCr * 1e7 / SP.ordersQ1; // ₹7.32 per placed order

// ---------------------------------------------------------------- sizing [S7, S22]
const funnel = [
  ['Udyam-registered MSMEs', 47200000, 'S7'],
  ['Above micro (small + medium)', 528000, 'S7'],
  ['In manufacturing', 185000, 'S22'],
  ['Make Meesho’s categories (TAM)', 55451, 'S22'],
  ['Own 3+ of 4 cost levers', 19408, 'S22'],
  ['Inside the 12 screened clusters (SAM)', 11645, 'S22'],
  ['Active C2M sellers by Year 4 (SOM)', 1400, 'A2'],
];
const SAM = 11645, SOM = 1400;
const yieldCr = A.A1.value;
const runRate = (n) => n * yieldCr;
const eligibleNmv = SP.fy26Nmv * A.A6.value;

// C2M order economics
const c2mGmvPerOrder = SP.gmvPerOrder * (1 - A.A9.value); // ₹236.5
const prepaidShift = A.A10.value * (1 - SP.prepaid); // 31.5 pts of C2M orders move from COD to prepaid
const failDrop = prepaidShift * A.A11.value; // 4.7 pts fewer failed deliveries per C2M order
const c2mNmvGmv = SP.nmvGmv + failDrop;
const c2mNmvPerOrder = c2mGmvPerOrder * c2mNmvGmv; // ₹155
const rtoSavingPerOrder = failDrop * A.A12.value; // ₹2.8
const ordersPerDay = yieldCr * 1e7 / c2mNmvPerOrder / 365; // placed orders a day per mature seller
const keptPerDay = yieldCr * 1e7 / c2mGmvPerOrder / 365;
const exFactory = A.A22.value / (1 - A.A23.value); // ex-factory price at the 9% margin on price
const shareOfOutput = keptPerDay * 365 * exFactory / (A.A5.value * 1e7);

// ---------------------------------------------------------------- manufacturer unit economics, per 3-pack kept [A22–A31]
const tdBy = Object.fromEntries(TEARDOWN.map((t) => [t.q, t]));
const briefs = tdBy['men cotton briefs pack of 3'];
const mkt = briefs.review_weighted_median; // ₹209 demand-weighted [S10]
const gate = mkt * (1 - 0.08);
const rtoPrepaid = A.A25.value.rto - (1 - SP.prepaid) * A.A11.value; // 4.55%
function unit({ cogs, mode = 'self', stock = 'build', prepaid = false }) {
  const rRto = prepaid ? rtoPrepaid : A.A25.value.rto;
  const disp = 100, rto = disp * rRto, delivered = disp - rto, ret = delivered * A.A25.value.ret, kept = delivered - ret;
  const rec = A.A29.value[mode === 'node' ? 'node' : 'self'];
  const u = A.A31.value[stock === 'build' ? 'stock' : 'batch'];
  const days = stock === 'build' ? A.A30.value.stockDays : A.A30.value.batchDays;
  const L = A.A28.value;
  const make = disp * cogs;
  const unsold = disp * u / (1 - u) * cogs * (1 - A.A31.value.salvage);
  const recovered = (rto + ret) * cogs * rec;
  const logistics = mode === 'node' ? delivered * L.nodeFwd + disp * L.nodeFee : delivered * L.selfFwd + disp * L.selfPack;
  const reverse = ret * A.A26.value + rto * A.A27.value;
  const capital = make * A.A30.value.rate * days / 365;
  const total = make + unsold - recovered + logistics + reverse + capital;
  const k = (x) => x / kept;
  return { goods: k(make - recovered), unsold: k(unsold), logistics: k(logistics), returns: k(reverse), capital: k(capital), cost: k(total), floor: k(total) / (1 - A.A23.value), rto: rRto };
}
const c = A.A22.value;
const resellerCogs = exFactory * (1 + A.A24.value);
const cols = [
  { key: 'reseller', head: 'Reseller today', sub: 'buys via a wholesaler, ships, stocks', label: 'Existing', ...unit({ cogs: resellerCogs }) },
  { key: 'direct', head: '+ Factory lists direct', sub: 'no wholesaler mark-up', label: 'Step 1', ...unit({ cogs: c }) },
  { key: 'node', head: '+ Factory Node', sub: 'bulk drop; node packs, ships, grades', label: 'Step 2', ...unit({ cogs: c, mode: 'node' }) },
  { key: 'batch', head: '+ Prepaid pre-order batch', sub: 'make confirmed orders + 15%', label: 'Proposed', ...unit({ cogs: c, mode: 'node', stock: 'batch', prepaid: true }) },
];
cols.forEach((x) => { x.gap = 1 - x.floor / mkt; x.passes = x.floor <= gate; x.marginAtGate = 1 - x.cost / gate; });
function ceiling(opts) {
  let lo = 1, hi = 1000;
  for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; if (unit({ ...opts, cogs: m }).floor <= gate) lo = m; else hi = m; }
  return lo;
}
const ceilings = { direct: ceiling({}), node: ceiling({ mode: 'node' }), batch: ceiling({ mode: 'node', stock: 'batch', prepaid: true }) };
const batchSaving = cols[2].floor - cols[3].floor; // ₹ per pack the batch frees up
const b2bMarginPerPack = exFactory - c; // ₹7.9 per pack selling ex-factory
const directMarginPerPack = gate - A.A32.value - cols[3].cost; // pre-order sold at the gate price less the ₹10 pre-order discount
const preorderFactoryShare = Math.min(A.A32.value, batchSaving);
const preorderPrice = gate - A.A32.value; // ₹182: gate price less the ₹10 pre-order discount
// Worked example for page 6: one prepaid batch of 1,000 confirmed packs through the Factory Direct flow
const batch = (() => {
  const confirmed = 1000, make = Math.round(confirmed * 1.15), L = A.A28.value;
  const failed = confirmed * rtoPrepaid, delivered = confirmed - failed, returns = delivered * A.A25.value.ret, kept = delivered - returns;
  const value = confirmed * preorderPrice, advance = value * A.A20.value.advance, revenue = kept * preorderPrice;
  const fees = { forward: delivered * L.nodeFwd, node: confirmed * L.nodeFee, returns: returns * A.A26.value };
  const feeTotal = fees.forward + fees.node + fees.returns, payout = revenue - feeTotal;
  return { confirmed, make, failed, delivered, returns, kept, price: preorderPrice, value, advance, revenue, fees, feeTotal, payout, balance: payout - advance };
})();
// Where the money per pack goes: proposed route (pre-order) vs a reseller selling at the market price
const split = { pool: mkt - cols[3].cost, costSaving: cols[0].cost - cols[3].cost, resellerMargin: mkt - cols[0].cost, buyer: mkt - preorderPrice, factory: preorderPrice - cols[3].cost };
const preorderMeeshoShare = A.A32.value - preorderFactoryShare; // per pre-order, funded from Meesho's RTO saving

// ---------------------------------------------------------------- Meesho 5-year case
function financials(over = {}) {
  const P = {
    incremental: A.A8.value, contrib: SP.contribPerOrder, gap: A.A11.value, costFail: A.A12.value,
    preorder: A.A10.value, yieldScale: 1, costScale: 1, rate: A.A21.value[0], ...over,
  };
  const yrs = [0, 1, 2, 3, 4];
  const shift = P.preorder * (1 - SP.prepaid);
  const drop = shift * P.gap;
  const nmvPerOrder = c2mGmvPerOrder * (SP.nmvGmv + drop);
  const nmv = yrs.map((i) => A.A3.value[i] * A.A4.value[i] * P.yieldScale);
  const orders = nmv.map((v) => v * 1e7 / nmvPerOrder);
  const benIncr = orders.map((o) => o * P.incremental * P.contrib / 1e7);
  const benRto = orders.map((o) => o * drop * P.costFail / 1e7);
  const benefit = yrs.map((i) => benIncr[i] + benRto[i]);
  const people = A.A14.value.map((f) => f * A.A13.value);
  const cl = A.A15.value.clusters;
  const onboarding = yrs.map((i) => (cl[i] - (i ? cl[i - 1] : 0)) * A.A15.value.perCluster);
  const briefsCost = A.A16.value;
  const nd = A.A17.value.nodes;
  const nodes = yrs.map((i) => (nd[i] - (i ? nd[i - 1] : 0)) * A.A17.value.perNode);
  const returnsPool = yrs.map((i) => (i === 0 ? A.A18.value.y1 : nmv[i] * A.A18.value.share));
  const grants = A.A19.value.newSellers.map((n) => n * A.A19.value.perSeller / 1000 * A.A19.value.cpm / 1e7);
  const firstLoss = nmv.map((v) => v * P.preorder * A.A20.value.advance * A.A20.value.firstLoss);
  const preorderTopUp = orders.map((o) => o * P.preorder * preorderMeeshoShare / 1e7);
  const lines = { people, onboarding, briefs: briefsCost, nodes, returnsPool, grants, firstLoss, preorderTopUp };
  const cost = yrs.map((i) => Object.values(lines).reduce((s, l) => s + l[i], 0) * P.costScale);
  const net = yrs.map((i) => benefit[i] - cost[i]);
  const pv = net.map((n, i) => n / (1 + P.rate) ** (i + 1));
  let cum = 0, payback = null, dcum = 0, dpayback = null;
  net.forEach((n, i) => { cum += n; if (payback === null && cum >= 0) payback = i + 1; });
  pv.forEach((v, i) => { dcum += v; if (dpayback === null && dcum >= 0) dpayback = i + 1; });
  return {
    P, nmv, orders, benIncr, benRto, benefit, lines, cost, net, pv, nmvPerOrder,
    npv: sum(pv), npvStress: npv(A.A21.value[1], net), irr: irr(net), payback, dpayback,
    cashY1: cost[0] - people[0],
  };
}
const base = financials();
const drivers = [
  ['Seller yield (₹1.425 cr NMV / seller)', 'yieldScale', 1],
  ['Programme cost', 'costScale', 1],
  ['Incremental orders (40% × ₹7.3)', 'incremental', A.A8.value],
  ['Failed-delivery saving (15 pts × ₹60)', 'costFail', A.A12.value],
  ['Prepaid pre-order share (50%)', 'preorder', A.A10.value],
];
const tornado = drivers.map(([label, key, v]) => {
  const lo = financials({ [key]: v * 0.8 }).npv, hi = financials({ [key]: v * 1.2 }).npv;
  return { label, key, lo, hi, swing: Math.abs(hi - lo) };
}).sort((x, y) => y.swing - x.swing);
function breakeven(key, v0, maxMult = 5) {
  let lo = 0, hi = v0 * maxMult;
  if (financials({ [key]: 0 }).npv > 0) return 0;
  for (let k = 0; k < 100; k++) { const m = (lo + hi) / 2; if (financials({ [key]: m }).npv > 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
}
const be = {
  yieldScale: breakeven('yieldScale', 1),
  incremental: breakeven('incremental', A.A8.value),
  costScale: (() => { let lo = 1, hi = 20; for (let k = 0; k < 100; k++) { const m = (lo + hi) / 2; if (financials({ costScale: m }).npv > 0) lo = m; else hi = m; } return lo; })(),
  noRto: financials({ gap: 0 }).npv,
  zeroIncr: financials({ incremental: 0 }).npv,
  benefitShare: sum(base.cost.map((x, i) => x / 1.12 ** (i + 1))) / sum(base.benefit.map((x, i) => x / 1.12 ** (i + 1))),
};
const scen = {
  bear: { npv: financials({ incremental: 0.20, gap: 0.08, yieldScale: 0.75 }).npv, note: '20% incremental · 8-pt gap · 75% yield' },
  base: { npv: base.npv, note: '40% incremental · 15-pt gap · plan yield' },
  bull: { npv: financials({ incremental: 0.55, gap: 0.20, yieldScale: 1.10 }).npv, note: '55% incremental · 20-pt gap · 110% yield' },
};
const round1 = { npv: 156, note: 'Round 1 counted contribution on all C2M orders' };
const allIncremental = financials({ incremental: 1 }).npv;

// ---------------------------------------------------------------- decision models
// Cluster AHP (Round 1 weights reproduced with a consistent matrix)
const crit = ['Cost ownership', 'Demand on Meesho', 'Returns band', 'Node feasibility', 'Institutional partner'];
const M = [[1, 1, 2, 3, 4], [1, 1, 1, 2, 3], [1 / 2, 1, 1, 1, 2], [1 / 3, 1 / 2, 1, 1, 2], [1 / 4, 1 / 3, 1 / 2, 1 / 2, 1]];
const gm = M.map((r) => r.reduce((p, x) => p * x, 1) ** (1 / 5));
const w = gm.map((g) => g / sum(gm));
const lam = sum(M.map((r, i) => sum(r.map((x, j) => x * w[j])) / w[i])) / 5;
const CR = (lam - 5) / 4 / 1.12;
const clusters = [
  ['Tiruppur', 'Hosiery', [5, 5, 4, 4, 5]], ['Panipat', 'Home textiles', [5, 4, 5, 4, 4]], ['Ludhiana', 'Hosiery, knitwear', [4, 3, 4, 4, 4]],
  ['Rajkot', 'Plastics, jewellery', [4, 3, 5, 3, 3]], ['Surat', 'Ethnic wear', [2, 5, 2, 5, 3]],
].map(([name, cat, s]) => ({ name, cat, s, score: sum(s.map((x, i) => x * w[i])), equal: sum(s) / 5 })).sort((x, y) => y.score - x.score);
// robustness: weight on demand at which Surat would overtake Panipat
function demandWeightFlip() {
  for (let d = w[1]; d < 0.99; d += 0.001) {
    const rest = 1 - d, base0 = 1 - w[1];
    const ww = w.map((x, i) => (i === 1 ? d : x * rest / base0));
    const sc = (s) => sum(s.map((x, i) => x * ww[i]));
    const surat = clusters.find((q) => q.name === 'Surat'), pan = clusters.find((q) => q.name === 'Panipat');
    if (sc(surat.s) > sc(pan.s)) return d;
  }
  return null;
}
const flipDemand = demandWeightFlip();

// Category screen (12 screened, 9 in scope); ✓ = 5, – = 3, ✕ = 1
const catW = [0.40, 0.20, 0.25, 0.15]; // floor, idle capacity, low returns, freight per ₹
const mk = { y: 5, a: 3, x: 1 };
const categories = [
  ['Saree & dress material', 'Erode, Bhiwandi', 'yyyy'], ['Home textiles', 'Panipat, Solapur', 'yyya'], ['Moulded plastics', 'Rajkot, Daman', 'yyya'],
  ['Hosiery & innerwear', 'Tiruppur, Ludhiana', 'yayy'], ['Imitation jewellery', 'Rajkot, Coimbatore', 'yyay'], ['Basic footwear', 'Agra, Bahadurgarh', 'yyay'],
  ['Steel kitchenware', 'Jagadhri, Wazirpur', 'yaya'], ['Brass décor', 'Moradabad', 'yxya'], ['Bags', 'Nangloi, Kolkata', 'ayay'],
  ['Fitted western wear', 'Gandhi Nagar, Bengaluru', 'ayxy'], ['Electronics accessories', 'Import-assembly', 'xyay'], ['Ethnic wear', 'Surat', 'xyxy'],
].map(([name, cluster, m]) => ({ name, cluster, marks: m, score: sum(m.split('').map((k, i) => mk[k] * catW[i])) })).sort((x, y) => y.score - x.score);

// Cohort scoring (rubric in Appendix B)
const cohortCrit = [['Price edge', 0.30], ['Pool size', 0.25], ['Barriers Meesho can fix', 0.20], ['Speed to first order', 0.15], ['New supply', 0.10]];
const cohorts = [
  { k: 'A', name: 'Offline B2B factories', share: 0.72, s: [5, 5, 4, 2, 5] },
  { k: 'C', name: 'Churned from Meesho', share: 0.09, s: [4, 2, 5, 5, 1] },
  { k: 'B', name: 'Selling online elsewhere', share: 0.19, s: [3, 3, 2, 4, 4] },
].map((x) => ({ ...x, firms: Math.round(SAM * x.share / 50) * 50, score: sum(x.s.map((v, i) => v * cohortCrit[i][1])), equal: sum(x.s) / 5 }))
  .sort((x, y) => y.score - x.score);

// RICE: reach = sellers touched in Year 2 (count, of 900 year-end); impact 0.25–3; confidence < 100%; effort = person-months
const rice = [
  ['Price gate + C2M badge', 'Acquire', 900, 2, 0.90, 2, 0],
  ['Health Score + rulebook', 'Scale', 900, 2, 0.85, 3, 0],
  ['Cluster co-op onboarding', 'Acquire', 810, 2, 0.85, 3, 5],
  ['District Demand Brief', 'Scale', 900, 2, 0.75, 4, 6],
  ['Prepaid pre-order batches', 'Scale', 765, 3, 0.70, 5, 0],
  ['Batch prepayment (NBFC)', 'Scale', 675, 2, 0.70, 4, 0.2],
  ['Factory Node (partner 3PL)', 'Acquire', 900, 3, 0.80, 8, 7.8],
  ['Returns firewall pool', 'Acquire', 630, 3, 0.65, 6, 3],
].map(([name, stage, R, I, C, E, y1]) => ({ name, stage, R, I, C, E, y1, score: R * I * C / E })).sort((x, y) => y.score - x.score);

// Day-30 experiment power (62 sellers × 28 days)
const exp = { sellers: 62, days: 28, se: 0.016, mde: 0.016 * 2.8, fund: 0.12 };

// ---------------------------------------------------------------- teardown detail for the price page
const td = TEARDOWN.map((t) => ({
  q: t.q, n: t.n, median: t.median, dw: t.review_weighted_median, p25: t.p25, p75: t.p75, min: t.min, max: t.max,
  rho: t.spearman_reviews_price, top10: t.top10_reviewed_median, reviews: t.total_reviews, overstate: t.median / t.review_weighted_median - 1,
}));
const briefsRaw = RAW.results.find((r) => r.q === 'men cotton briefs pack of 3').items.filter((x) => x.price && x.reviews != null);
const tdAll = RAW.results.reduce((s, r) => s + r.items.length, 0);
// Price gate, two ways (page 8): listing median vs demand-weighted median, briefs 3-pack
const briefsPrices = briefsRaw.map((x) => x.price);
const gateApproach = { n: briefsPrices.length, listMedian: briefs.median, listGate: briefs.median * 0.92, listClear: briefsPrices.filter((p) => p <= briefs.median * 0.92).length,
  dwMedian: mkt, dwGate: gate, dwClear: briefsPrices.filter((p) => p <= gate).length };
const bands = [[0, 200, '< ₹200'], [200, 250, '₹200–249'], [250, 300, '₹250–299'], [300, 400, '₹300–399'], [400, 600, '₹400–599'], [600, 1e9, '₹600+']];
const totRev = sum(briefsRaw.map((x) => x.reviews));
const briefsBands = bands.map(([lo, hi, label]) => {
  const xs = briefsRaw.filter((x) => x.price >= lo && x.price < hi);
  return { label, listings: xs.length, listingShare: xs.length / briefsRaw.length, reviewShare: sum(xs.map((x) => x.reviews)) / totRev };
});
const problemSize = eligibleNmv * (resellerCogs - exFactory) / mkt; // ₹ cr a year of wholesaler mark-up inside C2M categories
const gates = { d30: 0, d90: 2 * A.A15.value.perCluster + A.A16.value[0] / 2 + A.A17.value.perNode + 1 };

export const OUT = {
  SP, funnel, SAM, SOM, yieldCr, eligibleNmv,
  ladder: [
    { stage: 'Pilot · Day 90', clusters: 2, nodes: 1, sellers: 60 },
    { stage: 'Year 1 exit', clusters: 5, nodes: 6, sellers: 450 },
    { stage: 'Year 4 exit', clusters: 12, nodes: 12, sellers: 1400 },
  ].map((r) => {
    const nmv = runRate(r.sellers);
    const orders = nmv * 1e7 / c2mNmvPerOrder;
    return { ...r, nmv, shareFy26: nmv / SP.fy26Nmv, save: A.A7.value.map((g) => nmv * g / (1 - g)), meesho: orders * (A.A8.value * SP.contribPerOrder + rtoSavingPerOrder) / 1e7, ordersPerDay: orders / 365, shareOfOrders: orders / 365 / (SP.ordersQ1 / 91) };
  }),
  c2m: { gmvPerOrder: c2mGmvPerOrder, nmvGmv: c2mNmvGmv, nmvPerOrder: c2mNmvPerOrder, prepaidShift, failDrop, rtoSavingPerOrder, ordersPerDay, keptPerDay, shareOfOutput, exFactory },
  unit: { mkt, gate, cols, ceilings, batchSaving, b2bMarginPerPack, directMarginPerPack, resellerCogs, rtoPrepaid, preorderFactoryShare, preorderMeeshoShare, c, preorderPrice, batch, split },
  fin: base, tornado, be, scen, round1, allIncremental,
  ahp: { crit, M, gm, w, lam, CR, clusters, flipDemand },
  categories, catW, cohorts, cohortCrit, rice, exp,
  td, briefsRaw, tdAll, gateApproach, briefsBands, problemSize, gates: { ...gates, y1: base.cashY1, rest: base.cashY1 - gates.d90 },
};

if (process.argv[1] && process.argv[1].endsWith('model.mjs')) {
  const f = base, r = (x, d = 1) => round(x, d);
  console.log('SPONSOR gmv/order', r(SP.gmvPerOrder), 'nmv/gmv', r(SP.nmvGmv, 3), 'contrib/order', r(SP.contribPerOrder, 2));
  console.log('C2M gmv/order', r(c2mGmvPerOrder), 'prepaid shift', r(prepaidShift * 100) + 'pts', 'fail drop', r(failDrop * 100, 2) + 'pts', 'nmv/gmv', r(c2mNmvGmv, 3), 'nmv/order', r(c2mNmvPerOrder), 'rto saving/order', r(rtoSavingPerOrder, 2));
  console.log('SIZING orders/day', r(ordersPerDay, 0), 'kept/day', r(keptPerDay, 0), 'share of output', r(shareOfOutput * 100, 1) + '%', 'eligible', r(eligibleNmv, 0));
  OUT.ladder.forEach((l) => console.log(' ', l.stage, 'nmv', r(l.nmv), 'share', r(l.shareFy26 * 100, 1) + '%', 'save', l.save.map((x) => r(x)), 'meesho', r(l.meesho)));
  console.log('FIN nmv', f.nmv.map((x) => r(x)), 'orders mn', f.orders.map((x) => r(x / 1e6)));
  console.log(' benefit', f.benefit.map((x) => r(x)), 'incr', f.benIncr.map((x) => r(x)), 'rto', f.benRto.map((x) => r(x)));
  Object.entries(f.lines).forEach(([k, v]) => console.log('  cost', k.padEnd(14), v.map((x) => r(x, 2))));
  console.log(' cost', f.cost.map((x) => r(x)), 'net', f.net.map((x) => r(x)), 'pv', f.pv.map((x) => r(x)), 'sumPV', r(f.pv.reduce((s, x) => s + x, 0)));
  console.log(' NPV12', r(f.npv), 'NPV15', r(f.npvStress), 'IRR', r(f.irr * 100) + '%', 'payback', f.payback, 'disc payback', f.dpayback, 'cash Y1', r(f.cashY1));
  console.log(' scenarios', Object.fromEntries(Object.entries(scen).map(([k, v]) => [k, r(v.npv)])), 'all-incremental', r(allIncremental));
  console.log(' tornado', tornado.map((t) => `${t.label}: ${r(t.lo)}..${r(t.hi)}`).join(' | '));
  console.log(' break-even yield', r(be.yieldScale * 100) + '%', 'incremental', r(be.incremental * 100, 1) + '%', 'cost x', r(be.costScale, 2), 'NPV with no RTO effect', r(be.noRto));
  console.log('UNIT mkt', mkt, 'gate', r(gate), 'reseller cogs', r(resellerCogs), 'exFactory', r(exFactory), 'rto prepaid', r(rtoPrepaid * 100, 2) + '%');
  cols.forEach((x) => console.log(' ', x.head.padEnd(26), 'goods', r(x.goods), 'unsold', r(x.unsold), 'log', r(x.logistics), 'ret', r(x.returns), 'cap', r(x.capital), '| cost', r(x.cost), 'floor', r(x.floor), 'gap', r(x.gap * 100) + '%', x.passes ? 'PASS' : 'fail', 'margin@gate', r(x.marginAtGate * 100) + '%'));
  console.log(' ceilings', Object.fromEntries(Object.entries(ceilings).map(([k, v]) => [k, r(v)])), 'batch saving', r(batchSaving), 'B2B ₹/pack', r(b2bMarginPerPack), 'direct ₹/pack at gate', r(directMarginPerPack), 'preorder split factory/meesho', r(preorderFactoryShare), r(preorderMeeshoShare));
  console.log('AHP w', w.map((x) => r(x, 3)), 'CR', r(CR, 3), clusters.map((x) => `${x.name} ${r(x.score, 2)}`).join(', '), 'Surat>Panipat if demand weight >', flipDemand && r(flipDemand, 2));
  console.log('categories', categories.map((x) => `${x.name} ${r(x.score, 2)}`).join(', '));
  console.log('cohorts', cohorts.map((x) => `${x.k} ${r(x.score, 2)} eq ${r(x.equal, 2)} (${x.firms})`).join(', '));
  console.log('RICE', rice.map((x) => `${x.name} ${r(x.score, 0)}`).join(', '));
  console.log('bands', briefsBands.map((b) => `${b.label} ${b.listings} ${round(b.listingShare*100)}%/${round(b.reviewShare*100)}%`).join(' | '), 'problem size', round(problemSize), 'gates', gates, round(base.cashY1 - gates.d90, 2));
  console.log('teardown', td.map((t) => `${t.q.slice(0, 18)} med ${t.median} dw ${t.dw} over ${r(t.overstate * 100)}%`).join(' | '), 'raw listings', tdAll, 'briefs pts', briefsRaw.length);
  fs.writeFileSync(path.join(HERE, 'outputs.json'), JSON.stringify(OUT, null, 1));
}
