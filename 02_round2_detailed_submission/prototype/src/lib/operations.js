// Batch operations: how a pre-order becomes a parcel, day by day; what a batch leaves at the Factory Node and who
// sells it; and who pays when something goes wrong. These are operating rules proposed beyond the deck's costed
// case (inputs in config.js, OPS). Every ₹ per pack still comes from lib/factoryDirect.js, so nothing here moves
// the deck's numbers.

import { CATEGORIES, FD, OPS, TEARDOWN } from '../config.js';
import { financials, prepaidRto, routes } from './factoryDirect.js';
import { marketPrice, ratesFor } from './economics.js';
import { makeRng, hashSeed } from './rng.js';

// ---------------------------------------------------------------- dates
export function addDays(date, n) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}
export const daysBetween = (a, b) => Math.round((addDays(b, 0) - addDays(a, 0)) / 86400000);
export const fmtDay = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
export const fmtRange = (a, b) => (daysBetween(a, b) === 0 ? fmtDate(a) : `${fmtDate(a)}–${fmtDate(b)}`);

export const zoneFor = (state) => OPS.zones.find((z) => z.states.includes(state)) ?? OPS.zones[3];

// ---------------------------------------------------------------- batch size and cadence
// A batch is the pre-orders since the last cut-off plus 15%, and never less than the factory's minimum run: the
// extra packs go to node stock. Cut-offs are weekly (Thursday), or Monday and Thursday once even the shorter
// 3-day window clears the minimum run on its own. Every batch ships `lead` days after its cut-off, so no buyer
// waits more than a week for the cut-off.
export function sizing({ dailyDemand, share = OPS.share, acceptance = FD.prepaidShare, minRun = OPS.minRun }) {
  const perDay = dailyDemand * share;
  const preDay = perDay * acceptance;
  const nodeDay = perDay - preDay;
  const cutoffs = Math.round(preDay * 3 * (1 + FD.buffer)) >= minRun ? 2 : 1;
  const windows = cutoffs === 2 ? [3, 4] : [7];
  const windowDays = 7 / cutoffs;
  const preOrders = Math.round(preDay * windowDays);
  const buffer = Math.round(preOrders * FD.buffer);
  const fresh = preOrders + buffer;
  const make = Math.max(minRun, fresh);
  const lead = OPS.makeDays + OPS.shipLagDays;
  const span = windows.reduce((s, w) => s + w, 0);
  return {
    dailyDemand, share, acceptance, minRun, perDay, preDay, nodeDay,
    cutoffs, windows, windowDays, preOrders, buffer, make, clearsMinRun: fresh >= minRun,
    // Packs made only to reach the minimum run; they go to node stock, so they must fit in a week of node orders.
    toNode: make - fresh, toNodeFits: make - fresh <= nodeDay * windowDays,
    lead,
    // Days from paying to the node shipping: the cut-off day waits `lead`, the day after the last cut-off the most.
    wait: { min: lead, max: Math.max(...windows) - 1 + lead, avg: lead + windows.reduce((s, w) => s + (w * (w - 1)) / 2, 0) / span },
    fill1000: 1000 / preDay,
    // Share of the brief districts' demand needed to collect n pre-orders in `days`.
    shareFor: (n, days) => n / days / acceptance / dailyDemand,
  };
}

export const cadenceLabel = (plan) => (plan.cutoffs === 2 ? 'Twice a week (Mon, Thu)' : 'Weekly (Thu)');

// The next cut-off (11:59 pm that day) on or after `today`.
export function nextCutoff(today, cutoffs = 1) {
  const weekdays = OPS.cutoffs[cutoffs] ?? OPS.cutoffs[1];
  return addDays(today, Math.min(...weekdays.map((w) => (w - today.getDay() + 7) % 7)));
}

// Every date that follows from one cut-off.
export function batchDates(cutoff) {
  const lead = OPS.makeDays + OPS.shipLagDays;
  const ship = addDays(cutoff, lead);
  return {
    cutoff,
    open: addDays(cutoff, -6),
    advance: addDays(cutoff, 1),
    makeStart: addDays(cutoff, 1),
    truck: addDays(cutoff, OPS.makeDays),
    ship,
    deliver: (zone) => [addDays(ship, zone.days[0]), addDays(ship, zone.days[1])],
    settle: (zone) => [addDays(ship, zone.days[0] + OPS.settleDays), addDays(ship, zone.days[1] + OPS.settleDays)],
  };
}

// What each brief district is promised for an order placed `today`, and Kavin's pre-orders from it each week.
export function promises({ rows, plan, today = new Date() }) {
  const d = batchDates(nextCutoff(today, plan.cutoffs || 1));
  const nodeShip = addDays(today, OPS.nodeShipDays);
  return rows.map((r) => {
    const zone = zoneFor(r.state);
    const arrive = d.deliver(zone);
    return {
      ...r, zone, ship: d.ship, arrive,
      door: arrive.map((a) => daysBetween(today, a)),
      // Door to door for an order placed on any day of the window.
      windowDoor: [plan.wait.min + zone.days[0], plan.wait.max + zone.days[1]],
      nodeArrive: [addDays(nodeShip, zone.days[0]), addDays(nodeShip, zone.days[1])],
      weeklyPre: r.weekly * plan.share * plan.acceptance,
    };
  });
}

// Demand-weighted transit, the middle of each zone's range.
export const avgTransit = (rows) => {
  const w = rows.reduce((s, r) => s + r.weekly, 0);
  return rows.reduce((s, r) => s + r.weekly * ((zoneFor(r.state).days[0] + zoneFor(r.state).days[1]) / 2), 0) / w;
};

// ---------------------------------------------------------------- money: the advance in two parts
export function advanceTiming({ preOrders, price, make, cogs = FD.makingCost, transit }) {
  const value = preOrders * price;
  const cost = make * cogs;
  const atCutoff = value * OPS.advanceAtCutoff;
  const atHandover = value * OPS.advanceAtHandover;
  const lead = OPS.makeDays + OPS.shipLagDays;
  // Days from cutting fabric (the morning after the cut-off) to cash, weighted by rupee: 20% that morning,
  // 10% at the node's count, the rest 7 days after delivery.
  const handoverDays = lead - 1;
  const cashDays = OPS.advanceAtHandover * handoverDays + (1 - OPS.advanceAtCutoff - OPS.advanceAtHandover) * (handoverDays + transit + OPS.settleDays);
  return { value, cost, atCutoff, atHandover, total: atCutoff + atHandover, deckPeak: cost, proposedPeak: cost - atCutoff, cashDays };
}

// ---------------------------------------------------------------- node stock
// One week at the node: what the pre-orders leave behind, what node-stock orders take, and the top-up the factory
// approves from its own stock. Fit-to-sell share = the cost model's 90% value recovery at the node.
export function nodeFlow({ plan, rates }) {
  const fit = FD.recovery.node;
  const weekPre = plan.preDay * 7;
  const weekBuffer = weekPre * FD.buffer;
  const failed = weekPre * prepaidRto(rates);
  const returns = (weekPre - failed) * rates.ret;
  const nodeOrders = plan.nodeDay * 7;
  const nodeBack = nodeOrders * (rates.rto + (1 - rates.rto) * rates.ret);
  const inflow = [
    { k: 'Pre-order buffer left over (15%)', v: weekBuffer },
    { k: 'Failed pre-order deliveries, back sealed', v: failed * fit },
    { k: 'Pre-order returns graded fit to sell', v: returns * fit },
    { k: 'Node-order failed deliveries and returns, fit to sell', v: nodeBack * fit },
  ];
  if (plan.toNode) inflow.push({ k: `Packs made to reach the ${plan.minRun}-piece minimum run`, v: plan.toNode * plan.cutoffs });
  const back = inflow.reduce((s, x) => s + x.v, 0);
  const topUp = Math.max(0, nodeOrders - back);
  const safety = plan.nodeDay * OPS.safetyDays;
  const avgOnHand = nodeOrders / 2 + safety;
  const dwell = avgOnHand / plan.nodeDay;
  const leftover = weekBuffer + failed + returns;
  const fromBatchFit = weekBuffer + (failed + returns) * fit;
  return {
    weekPre, weekBuffer, failed, returns, nodeOrders, nodeBack, inflow, back, topUp, safety,
    opening: nodeOrders + safety, avgOnHand, dwell,
    storagePerPack: (OPS.storagePerMonth * dwell) / 30,
    leftover, leftoverShare: leftover / (weekPre + weekBuffer), fromBatchFit, coverDays: fromBatchFit / plan.nodeDay,
  };
}

// Split a quantity in the brief's size mix.
export function splitBy(total, split) {
  const all = split.reduce((s, x) => s + x.units, 0);
  let left = Math.round(total);
  return split.map((s, i) => {
    const units = i === split.length - 1 ? left : Math.round((total * s.units) / all);
    left -= units;
    return { value: s.value, units };
  });
}

// ---------------------------------------------------------------- innerwear returns
// The route floors under each return rule, against the gate (8% under the ₹209 median).
export function returnPolicies({ cogs = FD.makingCost, market = TEARDOWN.briefs3.median, rto = ratesFor('hosiery').rto } = {}) {
  return OPS.returnPolicies.map((p) => ({ ...p, cols: routes({ cogs, market, rates: { rto, ret: p.ret }, retRecovery: p.recovery ?? undefined }) }));
}

// ---------------------------------------------------------------- beyond briefs
// Every category at Kavin's cost ratio (₹80 on ₹209), the teardown product where the team priced one.
export function categoryCheck(medians) {
  const ratio = FD.makingCost / TEARDOWN.briefs3.median;
  return CATEGORIES.map((c) => {
    const t = c.types.find((x) => TEARDOWN[x.id]) ?? c.types[0];
    const m = marketPrice(t.id, medians);
    const cogs = Math.round(m.median * ratio);
    const [, self, node, batch] = routes({ cogs, market: m.median, rates: ratesFor(c.id) });
    const verdict = node.passes ? 'Node and batches' : batch.passes ? 'Batches only' : 'Not yet';
    return { c, t, market: m.median, teardown: Boolean(TEARDOWN[t.id]), cogs, self, node, batch, verdict };
  });
}

// ---------------------------------------------------------------- node capacity at scale
// Sites needed if one partner site ships `siteCapacity` orders a day, and what the extra set-up does to NPV.
export function nodeCapacity(siteCapacity = OPS.siteCapacity) {
  const base = financials();
  const perDay = base.orders.map((o) => o / 365);
  const sites = [];
  FD.nodes.forEach((n, i) => sites.push(Math.max(n, Math.ceil(perDay[i] / siteCapacity), i ? sites[i - 1] : 0)));
  const withSites = financials({ nodes: sites });
  const exits = OPS.exits.map((e) => {
    const d = (e.sellers * FD.yieldCr[3] * 1e7) / base.nmvPerOrder / 365;
    return { ...e, perDay: d, perNode: d / e.nodes, sites: Math.ceil(d / siteCapacity) };
  });
  const y4 = exits.at(-1);
  return {
    siteCapacity, perDay, sites, base, withSites,
    perNode: perDay.map((d, i) => d / FD.nodes[i]),
    extraSites: sites.at(-1) - FD.nodes.at(-1),
    extraCost: (sites.at(-1) - FD.nodes.at(-1)) * FD.nodeCost,
    exits,
    feePoolCr: (y4.perNode * FD.fees.nodeFee * 365) / 1e7, // ₹ cr a year of node fees at one Year-4 cluster node
    factoriesPerCluster: y4.sellers / y4.nodes,
    trucksPerDay: y4.sellers / y4.nodes / 6, // one weekly truck each, cut-offs staggered over six days
  };
}

// ---------------------------------------------------------------- KPIs
export const KPIS = [
  ['Promise accuracy', 'orders delivered by the date shown before payment', '≥ 95%', 'Meesho logistics', `₹${OPS.lateCredit} back per late order; lane review with Valmo`],
  ['Batch on time, in full', 'truck at the node on the planned evening, ≥ 99.5% of the ASN count', '≥ 98% of batches', 'Factory', '2 misses in 4 weeks pause pre-orders; node stock keeps selling'],
  ['QC first-time pass', `lots passing the ${OPS.qcSample.n}-pack sample at the factory`, '≥ 95%', 'Factory', `${OPS.reworkHours}-hour rework and re-sample; a second fail cancels and refunds`],
  ['Dock-to-ship', 'truck counted to every pre-order shipped', '≤ 24 hours', 'Node partner', 'SLA penalty in the node contract'],
  ['First-attempt delivery', 'prepaid parcels delivered on the first attempt', '≥ 90%', 'Valmo', 'Lane and rider review'],
  ['Return-to-refund', 'pick-up to refund in the buyer’s account', '≤ 3 days', 'Meesho', 'Escalated to support'],
  ['Node stock accuracy', 'cycle count against the system, per factory and SKU', '≥ 99.5%', 'Node partner', `Losses above ${OPS.shrinkTolerance * 100}% a quarter paid at making cost`],
  ['Node stock age', `packs older than ${OPS.ageing.markdownDay} days`, '≤ 5%', 'Factory', `Markdown at ${OPS.ageing.markdownDay} days; back to the factory at ${OPS.ageing.returnDay}`],
  ['Cost per order by zone', 'forward shipping + node fee per kept order', `₹${FD.fees.nodeFwd + FD.fees.nodeFee} plan (₹${FD.fees.nodeFwd} + ₹${FD.fees.nodeFee})`, 'Meesho logistics', 'Re-price the zone or move stock closer'],
];

// Eight weekly batches for one factory, seeded. One late truck, one failed QC sample and one short count are
// planted so the rules can be seen working; everything else is drawn.
export function batchWeeks(plan, weeks = 8) {
  const rng = makeRng(hashSeed('ops-weeks', String(plan.preOrders)));
  const LATE = 2, QC = 5, SHORT = 6;
  return Array.from({ length: weeks }, (_, i) => {
    const pre = Math.round(plan.preOrders * (0.94 + 0.015 * i) * rng.uniform(0.96, 1.04));
    const make = Math.max(plan.minRun, pre + Math.round(pre * FD.buffer));
    const defects = i === QC ? 7 : rng.int(0, 3);
    const counted = i === SHORT ? make - 4 : make;
    const delayDays = i === LATE ? 1 : i === QC ? 2 : 0;
    return {
      week: i + 1, pre, make, defects, counted, inFull: counted / make, delayDays,
      byPromise: delayDays ? rng.uniform(0.55, 0.7) : rng.uniform(0.95, 0.985),
      dockToShip: rng.uniform(11, 21),
      firstAttempt: rng.uniform(0.9, 0.95),
      credits: delayDays ? pre * OPS.lateCredit : 0,
      note: i === LATE ? 'Truck a day late: ₹10 back on every order' : i === QC ? `${defects} defects in ${OPS.qcSample.n}: reworked, re-sampled, shipped 2 days late` : i === SHORT ? 'Node counted 4 short: discrepancy note, shipped from node stock' : '',
    };
  });
}
