// Live results from the working prototype (synthetic, seeded data), so deck and app never disagree.
import path from 'path';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const P = path.resolve(HERE, '../../prototype/src');
const { GATE, ECONOMICS, PERSONA } = await import(`${P}/config.js`);
const { generateMarket } = await import(`${P}/lib/generate.js`);
const { runPTI } = await import(`${P}/lib/pti.js`);
const { runExperiment } = await import(`${P}/lib/experiment.js`);
const { generateCohort, cohortSummary } = await import(`${P}/lib/health.js`);
const { priceCheck, cashCycle } = await import(`${P}/lib/economics.js`);
const { demandBrief, batchPlan } = await import(`${P}/lib/demand.js`);

const market = generateMarket();
const pti = runPTI(market, GATE);
const exp = Object.fromEntries(['base', 'weak', 'decay'].map((k) => [k, runExperiment(pti, GATE, k)]));
const cohort = generateCohort();
const hs = cohortSummary(cohort);
const persona = cohort.find((s) => s.persona);
const grant = persona.events.find((e) => e.rule === 'grant');

// The manufacturer app's default screens (persona, Factory Node, B2B margin), exactly as the phone shows them.
const check = priceCheck({ unitCost: PERSONA.unitCost, category: PERSONA.category, typeId: PERSONA.type, mode: 'node', margin: ECONOMICS.targetMarginB2B, medians: pti.medians });
const brief = demandBrief({ typeId: PERSONA.type, marketMedian: check.marketMedian });
const batch = batchPlan({ brief, listingPrice: check.suggested, minViablePrice: check.floor });
const cash = cashCycle();
// Slide 13's "try it" demo: a making cost where shipping yourself misses the 8% badge and the Factory Node clears it.
const demoCost = 80; // the deck's A22 making cost: shipping yourself misses the badge, the Factory Node clears it
const demo = Object.fromEntries(['self', 'node'].map((mode) => {
  const r = priceCheck({ unitCost: demoCost, category: PERSONA.category, typeId: PERSONA.type, mode, margin: ECONOMICS.targetMarginB2B, medians: pti.medians });
  return [mode, { gap: r.gap, qualifies: r.qualifies }];
}));

export const PROTO = {
  sellers: market.sellers.length,
  skus: market.sellers.reduce((n, s) => n + s.skus.length, 0),
  counts: pti.counts, top10NotReady: pti.top10NotReady, r: pti.correlation,
  exp: { base: { lift: exp.base.lift, ci: exp.base.ci }, weak: { lift: exp.weak.lift }, decay: { retention14: exp.decay.retention14 } },
  hs: { auto: hs.auto, manual: hs.manual, sellerMonths: hs.sellerMonths, perManager: hs.sellersPerManager, cohort: cohort.length, avgScore: hs.avgScore, stageCounts: hs.stageCounts },
  persona: { name: persona.name, grantDay: grant?.day, grantReason: grant?.reason, graduatedDay: persona.graduatedDay },
  maker: {
    name: PERSONA.name, cluster: PERSONA.cluster, product: brief.type.name, unitCost: PERSONA.unitCost, margin: ECONOMICS.targetMarginB2B,
    median: check.marketMedian, floor: check.floor, gap: check.gap, qualifies: check.qualifies, listed: check.suggested,
    districts: brief.rows.length, weekly: brief.weeklyTotal, suggested: brief.suggested, newSellerShare: ECONOMICS.newSellerShare,
    preOrders: batch.preOrders, make: batch.make, buffer: ECONOMICS.batchBuffer, discount: batch.discount, prepaid: batch.prepayment,
    advanceShare: ECONOMICS.prepaymentShare, windowDays: batch.windowDaysLeft, settleDays: ECONOMICS.settlementDays,
    b2bDays: cash.b2bDays, batchDays: cash.batchDays, demo: { cost: demoCost, ...demo },
  },
};
if (process.argv[1] && process.argv[1].endsWith('proto.mjs')) console.log(JSON.stringify(PROTO, null, 1));
