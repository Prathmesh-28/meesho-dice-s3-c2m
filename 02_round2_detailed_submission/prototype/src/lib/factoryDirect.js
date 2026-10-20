// Factory Direct economics, ported from the deck's master model (deck/source/model.mjs) so the app and the deck
// show the same numbers. model.test.js checks the headline outputs against the deck.
//
// Two layers:
//   1. Per pack: what a pack costs a factory by route (reseller, direct, Factory Node, prepaid batch), the lowest
//      price that still earns its margin, and the cash of one batch from pre-order to payout.
//   2. Meesho's five-year case: benefit (incremental orders + fewer failed deliveries) against programme cost.

import { FD, SPONSOR, TEARDOWN } from '../config.js';

export { FD, SPONSOR, TEARDOWN };
const S = { ...SPONSOR, gmvPerOrder: (SPONSOR.gmvQ1 * 1e7) / SPONSOR.ordersQ1, nmvGmv: SPONSOR.nmvQ1 / SPONSOR.gmvQ1, contribPerOrder: (SPONSOR.cmCr * 1e7) / SPONSOR.ordersQ1 };
export { S as SPONSOR_DERIVED };

// ---------------------------------------------------------------- per pack
const HOSIERY = { rto: 0.14, ret: 0.08 };
export const prepaidRto = (rates) => rates.rto - (1 - S.prepaid) * FD.codFailGap;

// Cost per pack kept, by route. mode: 'self' ships each order, 'node' drops stock at a Factory Node.
// stock: 'build' makes to stock, 'batch' makes confirmed pre-orders + 15%. prepaid lowers failed deliveries.
// retRecovery: value recovered on customer returns, when it differs from failed deliveries (opened innerwear).
export function packCost({ cogs, mode = 'self', stock = 'build', prepaid = false, rates = HOSIERY, margin = FD.margin, retRecovery }) {
  const rRto = prepaid ? prepaidRto(rates) : rates.rto;
  const disp = 100, rto = disp * rRto, delivered = disp - rto, ret = delivered * rates.ret, kept = delivered - ret;
  const rec = FD.recovery[mode === 'node' ? 'node' : 'self'];
  const u = FD.unsold[stock === 'build' ? 'stock' : 'batch'];
  const days = stock === 'build' ? FD.capital.stockDays : FD.capital.batchDays;
  const L = FD.fees;
  const make = disp * cogs;
  const unsold = ((disp * u) / (1 - u)) * cogs * (1 - FD.unsold.salvage);
  const recovered = rto * cogs * rec + ret * cogs * (retRecovery ?? rec);
  const logistics = mode === 'node' ? delivered * L.nodeFwd + disp * L.nodeFee : delivered * L.selfFwd + disp * L.selfPack;
  const reverse = ret * FD.returnFee + rto * FD.rtoFee;
  const capital = (make * FD.capital.rate * days) / 365;
  const total = make + unsold - recovered + logistics + reverse + capital;
  const k = (x) => x / kept;
  return {
    goods: k(make - recovered), unsold: k(unsold), logistics: k(logistics), returns: k(reverse), capital: k(capital),
    cost: k(total), floor: k(total) / (1 - margin), rto: rRto, returnRate: rates.ret, kept,
  };
}

export const ROUTES = [
  { key: 'reseller', label: 'Reseller today', sub: 'buys via a wholesaler, ships, stocks', opts: { mode: 'self' }, markup: true },
  { key: 'self', label: 'Factory ships itself', sub: 'no wholesaler mark-up', opts: { mode: 'self' } },
  { key: 'node', label: 'Factory Node', sub: 'bulk drop; node packs, ships, grades returns', opts: { mode: 'node' } },
  { key: 'batch', label: 'Prepaid batch', sub: 'make confirmed pre-orders + 15%', opts: { mode: 'node', stock: 'batch', prepaid: true } },
];

// Every route for one making cost, against one market price.
export function routes({ cogs = FD.makingCost, market, rates = HOSIERY, margin = FD.margin, retRecovery }) {
  const exFactory = cogs / (1 - margin);
  const gate = market * (1 - FD.gate);
  return ROUTES.map((r) => {
    const c = packCost({ cogs: r.markup ? exFactory * (1 + FD.wholesalerMarkup) : cogs, rates, margin, retRecovery, ...r.opts });
    return { ...r, ...c, gap: 1 - c.floor / market, passes: c.floor <= gate };
  });
}

// One prepaid batch, pre-order to payout. Paid on kept orders; fees: forward on delivered, node fee on confirmed,
// a return fee per return. The NBFC advance is repaid from the payout.
export function batchCash({ confirmed, price, rates = HOSIERY }) {
  const make = Math.round(confirmed * (1 + FD.buffer));
  const failed = confirmed * prepaidRto(rates), delivered = confirmed - failed, returns = delivered * rates.ret, kept = delivered - returns;
  const value = confirmed * price, advance = value * FD.advance, revenue = kept * price;
  const fees = { forward: delivered * FD.fees.nodeFwd, node: confirmed * FD.fees.nodeFee, returns: returns * FD.returnFee };
  const feeTotal = fees.forward + fees.node + fees.returns, payout = revenue - feeTotal;
  return { confirmed, make, failed, delivered, returns, kept, price, value, advance, revenue, fees, feeTotal, payout, balance: payout - advance };
}

// The deck's worked example: the briefs 3-pack at the ₹209 demand-weighted median.
export function deckCase() {
  const market = TEARDOWN.briefs3.median;
  const cols = routes({ market });
  const gate = market * (1 - FD.gate);
  const preorderPrice = gate - FD.preorderDiscount;
  const batch = batchCash({ confirmed: 1000, price: preorderPrice });
  return {
    market, gate, cols, preorderPrice, batch,
    buyerSaves: market - preorderPrice,
    factoryMargin: preorderPrice - cols[3].cost,
    exFactoryMargin: FD.makingCost / (1 - FD.margin) - FD.makingCost,
  };
}

// ---------------------------------------------------------------- Meesho's five-year case
const sum = (xs) => xs.reduce((s, x) => s + x, 0);
const npvAt = (r, flows) => sum(flows.map((f, i) => f / (1 + r) ** (i + 1)));
function irr(flows) {
  let lo = -0.9, hi = 10;
  for (let k = 0; k < 300; k++) { const m = (lo + hi) / 2; if (npvAt(m, flows) > 0) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

// over: incremental, gap, costFail, preorder, yieldScale, costScale, rate, nodes (node sites by year).
export function financials(over = {}) {
  const P = { incremental: FD.incremental, contrib: S.contribPerOrder, gap: FD.codFailGap, costFail: FD.failCost,
    preorder: FD.prepaidShare, yieldScale: 1, costScale: 1, rate: FD.rates[0], ...over };
  const yrs = [0, 1, 2, 3, 4];
  const c2mGmvPerOrder = S.gmvPerOrder * (1 - FD.priceCut);
  const drop = P.preorder * (1 - S.prepaid) * P.gap;
  const nmvPerOrder = c2mGmvPerOrder * (S.nmvGmv + drop);
  const nmv = yrs.map((i) => FD.sellers[i] * FD.yieldCr[i] * P.yieldScale);
  const orders = nmv.map((v) => (v * 1e7) / nmvPerOrder);
  const benIncr = orders.map((o) => (o * P.incremental * P.contrib) / 1e7);
  const benRto = orders.map((o) => (o * drop * P.costFail) / 1e7);
  const benefit = yrs.map((i) => benIncr[i] + benRto[i]);
  // Meesho tops up the pre-order discount only where the batch saving does not cover it (zero in the base case).
  const dc = deckCase();
  const batchSaving = dc.cols[2].floor - dc.cols[3].floor;
  const preorderMeeshoShare = FD.preorderDiscount - Math.min(FD.preorderDiscount, batchSaving);
  const lines = {
    people: FD.fte.map((f) => f * FD.fteCost),
    onboarding: yrs.map((i) => (FD.clusters[i] - (i ? FD.clusters[i - 1] : 0)) * FD.clusterCost),
    briefs: FD.briefCost,
    nodes: yrs.map((i) => ((P.nodes ?? FD.nodes)[i] - (i ? (P.nodes ?? FD.nodes)[i - 1] : 0)) * FD.nodeCost),
    returnsPool: yrs.map((i) => (i === 0 ? FD.returnsPool.y1 : nmv[i] * FD.returnsPool.share)),
    grants: FD.grants.newSellers.map((n) => (((n * FD.grants.perSeller) / 1000) * FD.grants.cpm) / 1e7),
    firstLoss: nmv.map((v) => v * P.preorder * FD.advance * FD.firstLoss),
    preorderTopUp: orders.map((o) => (o * P.preorder * preorderMeeshoShare) / 1e7),
  };
  const cost = yrs.map((i) => sum(Object.values(lines).map((l) => l[i])) * P.costScale);
  const net = yrs.map((i) => benefit[i] - cost[i]);
  const pv = net.map((n, i) => n / (1 + P.rate) ** (i + 1));
  let cum = 0, payback = null;
  net.forEach((n, i) => { cum += n; if (payback === null && cum >= 0) payback = i + 1; });
  return {
    P, nmv, orders, benIncr, benRto, benefit, lines, cost, net, pv,
    npv: sum(pv), irr: irr(net), payback, cashY1: cost[0] - lines.people[0],
    valuePerOrder: P.incremental * P.contrib + drop * P.costFail, failDrop: drop, nmvPerOrder,
  };
}

// Money released at the 90-day gates: ₹0 to Day 30; Days 31-90 fund 2 clusters' onboarding, half the Demand Brief
// build, 1 Factory Node and a ₹1 cr returns-pool seed; the rest of Year-1 cash follows the Day-90 gate.
export function gateReleases() {
  const d90 = 2 * FD.clusterCost + FD.briefCost[0] / 2 + FD.nodeCost + 1;
  const y1 = financials().cashY1;
  return { d30: 0, d90, rest: y1 - d90, y1 };
}

// The share of planned seller yield at which NPV reaches zero.
export function breakEvenYield(over = {}) {
  let lo = 0, hi = 5;
  if (financials({ ...over, yieldScale: 0 }).npv > 0) return 0;
  for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; if (financials({ ...over, yieldScale: m }).npv > 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
}

export const SCENARIOS = {
  bear: { label: 'Bear', over: { incremental: 0.20, gap: 0.08, yieldScale: 0.75 } },
  base: { label: 'Base', over: {} },
  bull: { label: 'Bull', over: { incremental: 0.55, gap: 0.20, yieldScale: 1.10 } },
};
