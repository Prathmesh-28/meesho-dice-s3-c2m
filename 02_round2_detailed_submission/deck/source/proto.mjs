// Live results from the working prototype (synthetic, seeded data), so deck and app never disagree.
import path from 'path';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const P = path.resolve(HERE, '../../prototype/src');
const { GATE } = await import(`${P}/config.js`);
const { generateMarket } = await import(`${P}/lib/generate.js`);
const { runPTI } = await import(`${P}/lib/pti.js`);
const { runExperiment } = await import(`${P}/lib/experiment.js`);
const { generateCohort, cohortSummary } = await import(`${P}/lib/health.js`);

const market = generateMarket();
const pti = runPTI(market, GATE);
const exp = Object.fromEntries(['base', 'weak', 'decay'].map((k) => [k, runExperiment(pti, GATE, k)]));
const cohort = generateCohort();
const hs = cohortSummary(cohort);
const persona = cohort.find((s) => s.persona);
const grant = persona.events.find((e) => e.rule === 'grant');

export const PROTO = {
  sellers: market.sellers.length,
  skus: market.sellers.reduce((n, s) => n + s.skus.length, 0),
  counts: pti.counts, top10NotReady: pti.top10NotReady, r: pti.correlation,
  exp: { base: { lift: exp.base.lift, ci: exp.base.ci }, weak: { lift: exp.weak.lift }, decay: { retention14: exp.decay.retention14 } },
  hs: { auto: hs.auto, manual: hs.manual, sellerMonths: hs.sellerMonths, perManager: hs.sellersPerManager, cohort: cohort.length, avgScore: hs.avgScore, stageCounts: hs.stageCounts },
  persona: { name: persona.name, grantDay: grant?.day, grantReason: grant?.reason, graduatedDay: persona.graduatedDay },
};
if (process.argv[1] && process.argv[1].endsWith('proto.mjs')) console.log(JSON.stringify(PROTO, null, 1));
