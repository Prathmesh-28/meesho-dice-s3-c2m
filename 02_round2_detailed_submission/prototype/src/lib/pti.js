// Price Truth Index: does a seller's scale actually show up as a lower shelf price?
//
// 1. Landed-price median per comparable set (same product type), weighted by
//    delivered orders, from SKUs with enough orders to be trusted.
// 2. Per-SKU gap = (median − seller landed price) ÷ median.
// 3. Catalogue gate: a seller passes when ≥ skuShare of live SKUs clear the gap
//    threshold. One loss-leader SKU cannot buy the badge.

import { CATEGORIES } from '../config.js';
import { median, mean, pct } from './format.js';

export const VERDICTS = {
  ready: { label: 'C2M-ready', tone: 'good' },
  nearmiss: { label: 'Near miss', tone: 'warning' },
  lossleader: { label: 'Loss-leader pattern', tone: 'serious' },
  noprice: { label: 'Scale without price', tone: 'critical' },
  unscreened: { label: 'Below GMV floor', tone: 'neutral' },
};

function weightedMedian(points) {
  const sorted = points.slice().sort((a, b) => a.price - b.price);
  const total = sorted.reduce((s, p) => s + p.w, 0);
  let cum = 0;
  for (const p of sorted) {
    cum += p.w;
    if (cum >= total / 2) return p.price;
  }
  return sorted.at(-1)?.price ?? 0;
}

// A seller holding more than this share of a comparable set's orders is scored
// against the median without its own orders, so it cannot set its own benchmark.
const DOMINANT_SHARE = 0.3;

export function comparableMedians(sellers, gate) {
  const groups = new Map();
  for (const s of sellers) {
    for (const k of s.skus) {
      if (!k.live || k.orders30 < gate.minOrdersForMedian) continue;
      if (!groups.has(k.type)) groups.set(k.type, []);
      groups.get(k.type).push({ price: k.landed, w: k.orders30, seller: s.id });
    }
  }
  const medians = new Map();
  for (const [type, pts] of groups) {
    const orders = pts.reduce((s, p) => s + p.w, 0);
    const bySeller = new Map();
    for (const p of pts) bySeller.set(p.seller, (bySeller.get(p.seller) ?? 0) + p.w);
    const excluding = new Map();
    for (const [id, w] of bySeller) {
      if (w / orders > DOMINANT_SHARE) excluding.set(id, weightedMedian(pts.filter((p) => p.seller !== id)));
    }
    medians.set(type, { median: weightedMedian(pts), skus: pts.length, orders, excluding });
  }
  return medians;
}

function medianFor(medians, type, sellerId, fallback) {
  const m = medians.get(type);
  if (!m) return fallback;
  return m.excluding?.get(sellerId) ?? m.median;
}

export function scoreSeller(seller, medians, gate, gapShift = 0) {
  const live = seller.skus.filter((k) => k.live);
  const rows = live.map((k) => {
    const m = medianFor(medians, k.type, seller.id, k.landed);
    const gap = (m - k.landed) / m + gapShift;
    return { ...k, median: m, gap, clears: gap >= gate.deltaThreshold };
  });
  const clearing = rows.filter((r) => r.clears).length;
  const share = rows.length ? clearing / rows.length : 0;
  const medianGap = median(rows.map((r) => r.gap));
  const deep = rows.filter((r) => r.gap >= 0.2).length;
  const screened = seller.gmvCr >= gate.minGmvCr;

  let verdict;
  if (!screened) verdict = 'unscreened';
  else if (share >= gate.skuShare) verdict = 'ready';
  else if (deep >= 1 && medianGap < gate.deltaThreshold / 2) verdict = 'lossleader';
  else if (share >= gate.skuShare - 0.2 || medianGap >= gate.deltaThreshold * 0.6) verdict = 'nearmiss';
  else verdict = 'noprice';

  return {
    ...seller,
    rows,
    liveSkus: rows.length,
    clearing,
    share,
    medianGap,
    deep,
    screened,
    verdict,
    nmv30: rows.reduce((s, r) => s + r.landed * r.orders30, 0),
    orders30: rows.reduce((s, r) => s + r.orders30, 0),
    medianPrice: median(rows.map((r) => r.landed)),
  };
}

export function explain(s, gate) {
  const t = pct(gate.deltaThreshold);
  const line = `${s.clearing} of ${s.liveSkus} live SKUs (${pct(s.share)}) are at least ${t} below their comparable-set median`;
  switch (s.verdict) {
    case 'ready':
      return `${line}. Passes the ${pct(gate.skuShare)} catalogue test.`;
    case 'lossleader':
      return `${s.deep} SKU${s.deep > 1 ? 's sit' : ' sits'} 20%+ below market, but the median SKU gap is only ${pct(s.medianGap, 1)}. ${line}. One loss-leader cannot buy the badge.`;
    case 'nearmiss':
      return `${line}; median gap ${pct(s.medianGap, 1)}. Real cost edge, not yet wide enough. A candidate for Factory Node cost help.`;
    case 'noprice':
      return `₹${s.gmvCr.toFixed(1)} cr GMV, yet the median SKU is ${s.medianGap >= 0 ? `only ${pct(s.medianGap, 1)} below` : `${pct(-s.medianGap, 1)} above`} market. Scale did not become price.`;
    default:
      return `Below the ₹${gate.minGmvCr} cr GMV floor, so not screened. Its prices still count towards the market median.`;
  }
}

function pearson(xs, ys) {
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

export function runPTI(market, gate) {
  const medians = comparableMedians(market.sellers, gate);
  const scored = market.sellers.map((s) => scoreSeller(s, medians, gate));
  const screened = scored.filter((s) => s.screened);
  const count = (v) => screened.filter((s) => s.verdict === v).length;

  const byCategory = CATEGORIES.map((c) => {
    const inCat = screened.filter((s) => s.category === c.id);
    const ready = inCat.filter((s) => s.verdict === 'ready').length;
    return {
      id: c.id,
      name: c.short,
      screened: inCat.length,
      ready,
      readyShare: inCat.length ? ready / inCat.length : 0,
      noprice: inCat.filter((s) => s.verdict === 'noprice').length,
    };
  });

  // Among the 10 largest screened sellers, how many carry no real price gap?
  const top10 = screened.slice().sort((a, b) => b.gmvCr - a.gmvCr).slice(0, 10);

  return {
    medians,
    scored,
    screened,
    counts: {
      screened: screened.length,
      ready: count('ready'),
      nearmiss: count('nearmiss'),
      lossleader: count('lossleader'),
      noprice: count('noprice'),
      unscreened: scored.length - screened.length,
    },
    correlation: pearson(screened.map((s) => Math.log(s.gmvCr)), screened.map((s) => s.medianGap)),
    top10NotReady: top10.filter((s) => s.verdict !== 'ready').length,
    byCategory,
  };
}
