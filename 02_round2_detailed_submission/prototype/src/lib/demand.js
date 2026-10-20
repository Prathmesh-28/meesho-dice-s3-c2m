// Cluster Demand Brief and the demand-confirmed batch built from it.
//
// Demand per district is synthetic but stable: the same (district, product)
// pair always returns the same numbers. On the platform this is a weekly
// query over search and order logs, anonymised to district level.

import { DISTRICTS, ECONOMICS } from '../config.js';
import { makeRng, hashSeed } from './rng.js';
import { categoryById, typeById } from './generate.js';

const round50 = (x) => Math.max(50, Math.round(x / 50) * 50);
const priceEnd9 = (x) => Math.max(9, Math.round((x + 1) / 10) * 10 - 1);

// Middle values of an axis (sizes M/L, "Medium") sell most: a bell-shaped prior.
function bellWeights(n) {
  const mid = (n - 1) / 2;
  return Array.from({ length: n }, (_, i) => Math.exp(-((i - mid) ** 2) / Math.max(1, n / 2)));
}

function weightedPick(rng, values, weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rng.next() * total;
  for (let i = 0; i < values.length; i++) {
    r -= weights[i];
    if (r <= 0) return values[i];
  }
  return values.at(-1);
}

export function demandBrief({ typeId, marketMedian, topN = 12 }) {
  const type = typeById[typeId];
  const cat = categoryById[type.category];
  const base = 900 * cat.ordersPerSkuDay;

  const rows = DISTRICTS.map(([district, state, pin, weight]) => {
    const rng = makeRng(hashSeed(district, typeId));
    const weekly = Math.round(base * weight * rng.lognormal(1, 0.35));
    const lo = priceEnd9(marketMedian * rng.uniform(0.84, 0.88));
    const hi = priceEnd9(marketMedian * rng.uniform(0.93, 0.97));
    const variants = Object.entries(cat.variantAxes).map(
      ([axis, values]) => `${axis}: ${weightedPick(rng, values, bellWeights(values.length))}`,
    );
    return { district, state, pin, weekly, priceBand: [lo, hi], variants, growth: rng.normal(0.04, 0.06) };
  })
    .sort((a, b) => b.weekly - a.weekly)
    .slice(0, topN);

  const weeklyTotal = rows.reduce((s, r) => s + r.weekly, 0);
  const forecast14 = weeklyTotal * 2;
  const suggested = round50(forecast14 * ECONOMICS.newSellerShare);

  // Split the batch across the first variant axis: the bell prior, nudged by
  // which value tops each district's demand.
  const [axis, values] = Object.entries(cat.variantAxes)[0];
  const prior = bellWeights(values.length);
  const tally = Object.fromEntries(values.map((v, i) => [v, prior[i] * 10]));
  for (const r of rows) {
    const v = r.variants[0].split(': ')[1];
    tally[v] += r.weekly / weeklyTotal;
  }
  const tallyTotal = Object.values(tally).reduce((s, x) => s + x, 0);
  let assigned = 0;
  const split = values.map((v, i) => {
    const units = i === values.length - 1 ? suggested - assigned : Math.round((suggested * tally[v]) / tallyTotal / 10) * 10;
    assigned += units;
    return { value: v, units };
  });

  return { type, cat, rows, weeklyTotal, forecast14, suggested, axis, split };
}

export function batchPlan({ brief, listingPrice, minViablePrice = 0, seed = 1, preOrders: fixed }) {
  const rng = makeRng(hashSeed('batch', brief.type.id, String(seed)));
  const drawn = Math.round(brief.suggested * rng.uniform(0.55, 0.7));
  const preOrders = fixed ?? drawn;
  const buffer = Math.round(preOrders * ECONOMICS.batchBuffer);
  const make = preOrders + buffer;
  const discount = Math.min(ECONOMICS.preorderDiscount, Math.max(0, Math.floor(listingPrice - minViablePrice)));
  const preorderPrice = listingPrice - discount;
  const confirmedValue = preOrders * preorderPrice;
  return {
    preOrders,
    buffer,
    make,
    preorderPrice,
    discount,
    confirmedValue,
    prepayment: confirmedValue * ECONOMICS.prepaymentShare,
  };
}

const n = (x) => Math.round(x).toLocaleString('en-IN');
const rs = (x) => `₹${n(x)}`;

// Dates come from lib/operations.js (batchDates): cut-off, truck and ship day for this week's batch.
export function whatsappBrief({ seller, brief, batch, dates, fmt, week = 43 }) {
  const top = brief.rows.slice(0, 3);
  const band = (r) => `₹${r.priceBand[0]}–${r.priceBand[1]}`;
  return [
    `📦 *C2M Demand Brief* · Week ${week}`,
    `Hello ${seller} 🙏`,
    `Top demand this week for *${brief.type.name}*:`,
    ...top.map((r, i) => `${i + 1}. ${r.district} (${r.pin}xxx): ${n(r.weekly)} orders/week · sells at ${band(r)}`),
    `Your pre-orders this week: *${n(batch.preOrders)}* · cut-off *${fmt(dates.cutoff)}, 11:59 pm*`,
    `Make *${n(batch.make)}* (pre-orders + 15%) · truck to the node on *${fmt(dates.truck)}*`,
  ];
}

export function whatsappConfirm({ batch, cluster, dates, fmt, advance }) {
  return `✅ Batch locked: ${n(batch.make)} units. Cut fabric ${fmt(dates.advance)}; truck to the ${cluster} Factory Node on ${fmt(dates.truck)}. ${rs(advance.atCutoff)} (20%) arrives ${fmt(dates.advance)} morning, ${rs(advance.atHandover)} when the node counts the truck.`;
}

// Meesho suggests the node top-up; the factory approves it. Meesho never moves seller stock on its own.
export function whatsappTopUp({ stock, days, topUp, sizes, dates, fmt }) {
  return [
    `📦 *Node stock* · ${n(stock)} packs left, about ${days} days`,
    `Suggested top-up on ${fmt(dates.truck)}’s truck: *${n(topUp)} packs*`,
    sizes.map((s) => `${s.value} ${s.units}`).join(' · '),
    'You own this stock and can recall it on any truck.',
  ];
}

export const TOPUP_REPLIES = ['1 · Approve top-up', '2 · Change quantity', '3 · Skip this week'];

export const QUICK_REPLIES = ['1 · Commit batch', '2 · Review sizes', '3 · Request callback'];
