// Day-30 readout: badge + re-rank C2M-ready sellers against a matched holdout.
//
// Assignment is randomised within category. Of 400 candidate draws, we use
// the one with the smallest worst covariate imbalance. Lift is a difference-in-differences
// on NMV per live SKU, with a seller-level bootstrap for the interval. The
// simulated "true" effect comes from the chosen scenario, so every branch of the
// decision rule can be demonstrated.

import { EXPERIMENT, SEED } from '../config.js';
import { makeRng } from './rng.js';
import { clamp, mean, quantile } from './format.js';
import { scoreSeller } from './pti.js';

const COVARIATES = [
  (s) => s.medianGap,
  (s) => Math.log(s.gmvCr),
  (s) => s.liveSkus,
  (s) => s.medianPrice,
  (s) => s.rtoRate,
];

// Re-randomisation: split each category half-and-half at random, repeat, and keep
// the draw whose worst covariate imbalance (|standardised mean difference|) is
// smallest. Category mix is balanced by construction.
function assign(ready, rng, draws = 400) {
  const byCat = new Map();
  for (const s of ready) {
    if (!byCat.has(s.category)) byCat.set(s.category, []);
    byCat.get(s.category).push(s);
  }
  let best = null;
  let bestImbalance = Infinity;
  for (let i = 0; i < draws; i++) {
    const arms = new Map();
    for (const members of byCat.values()) {
      let treat = rng.chance(0.5);
      for (const s of rng.shuffle(members)) {
        arms.set(s.id, treat ? 'treatment' : 'control');
        treat = !treat;
      }
    }
    const t = ready.filter((s) => arms.get(s.id) === 'treatment');
    const c = ready.filter((s) => arms.get(s.id) === 'control');
    const imbalance = Math.max(...COVARIATES.map((fn) => Math.abs(smd(t.map(fn), c.map(fn)))));
    if (imbalance < bestImbalance) {
      bestImbalance = imbalance;
      best = arms;
    }
  }
  return best;
}

function smd(a, b) {
  const va = mean(a.map((x) => (x - mean(a)) ** 2));
  const vb = mean(b.map((x) => (x - mean(b)) ** 2));
  const pooled = Math.sqrt((va + vb) / 2);
  return pooled ? (mean(a) - mean(b)) / pooled : 0;
}

function didLift(tSellers, cSellers) {
  const ratio = (arr) => mean(arr.map((s) => s.post)) / mean(arr.map((s) => s.pre));
  return ratio(tSellers) / ratio(cSellers) - 1;
}

export function runExperiment(pti, gate, scenarioId = 'base', seed = SEED) {
  const cfg = EXPERIMENT;
  const scenario = cfg.scenarios[scenarioId];
  const rng = makeRng(seed + Object.keys(cfg.scenarios).indexOf(scenarioId) * 7919);
  const ready = pti.scored.filter((s) => s.verdict === 'ready');
  const arms = assign(ready, makeRng(seed + 17));

  const treatment = ready.filter((s) => arms.get(s.id) === 'treatment');
  const control = ready.filter((s) => arms.get(s.id) === 'control');

  // Which badged sellers stop carrying their gap: promotions end on their own,
  // and in the decay scenario a share of sellers raise prices once badged.
  const harvest = new Set(
    rng.shuffle(treatment).slice(0, Math.round(treatment.length * scenario.decayShare)).map((s) => s.id),
  );
  const gapShiftAt = (s, day) => {
    const ramp = clamp((day - 7) / 7, 0, 1);
    let shift = s.drift14 * clamp(day / 14, 0, 1);
    if (harvest.has(s.id)) shift -= 0.08 * ramp;
    return shift;
  };
  const holdsGap = (s, day) => {
    const lost = harvest.has(s.id) || s.archetype === 'promo';
    return lost ? 1 - 0.8 * clamp((day - 7) / 7, 0, 1) : 1;
  };

  // Guardrail 1: badged listings may take at most `impressionCap` of a category's
  // impressions (impressions ∝ orders; the re-rank lifts badged listings ≈ 1.3×).
  // Where the cap binds, the ranking boost is scaled down, and so is the lift.
  const tIds = new Set(treatment.map((s) => s.id));
  const impressions = {};
  for (const s of pti.scored) {
    const w = s.orders30 * (tIds.has(s.id) ? 1.3 : 1);
    impressions[s.category] ??= { badged: 0, total: 0 };
    impressions[s.category].total += w;
    if (tIds.has(s.id)) impressions[s.category].badged += w;
  }
  const capFactor = {};
  const capped = [];
  for (const [cat, v] of Object.entries(impressions)) {
    const share = v.total ? v.badged / v.total : 0;
    capFactor[cat] = share > cfg.impressionCap ? cfg.impressionCap / share : 1;
    if (share > cfg.impressionCap) capped.push({ category: cat, uncapped: share });
  }
  const maxImpressionShare = Math.min(
    cfg.impressionCap,
    Math.max(...Object.values(impressions).map((v) => (v.total ? v.badged / v.total : 0))),
  );

  const days = [];
  for (let d = -cfg.preDays; d < cfg.days; d++) days.push(d);

  const simulate = (s, isTreat) => {
    const base = s.nmv30 / 30 / Math.max(1, s.liveSkus);
    const series = days.map((d) => {
      const weekend = ((d % 7) + 7) % 7 >= 5 ? 1.08 : 1;
      const effect = isTreat && d >= 0
        ? scenario.trueLift * capFactor[s.category] * clamp((d + 1) / 5, 0, 1) * holdsGap(s, d)
        : 0;
      return base * weekend * (1 + effect) * Math.exp(rng.normal(0, 0.15));
    });
    const pre = mean(series.slice(0, cfg.preDays));
    const post = mean(series.slice(cfg.preDays));
    return { id: s.id, series, pre, post };
  };
  const tSim = treatment.map((s) => simulate(s, true));
  const cSim = control.map((s) => simulate(s, false));

  const lift = didLift(tSim, cSim);
  const boots = [];
  for (let i = 0; i < cfg.bootstrapIterations; i++) {
    const rt = tSim.map(() => tSim[Math.floor(rng.next() * tSim.length)]);
    const rc = cSim.map(() => cSim[Math.floor(rng.next() * cSim.length)]);
    boots.push(didLift(rt, rc));
  }
  const ci = [quantile(boots, 0.025), quantile(boots, 0.975)];

  // Daily index (pre-period mean = 100) for the chart.
  const preMean = (sims) => mean(sims.map((s) => s.pre));
  const tPre = preMean(tSim);
  const cPre = preMean(cSim);
  const daily = days.map((d, i) => ({
    day: d,
    treatment: (mean(tSim.map((s) => s.series[i])) / tPre) * 100,
    control: (mean(cSim.map((s) => s.series[i])) / cPre) * 100,
  }));

  // Gate retention: share of badged sellers still passing the catalogue test.
  const retention = [];
  for (let d = 0; d <= cfg.days; d += 1) {
    const passing = treatment.filter((s) => scoreSeller(s, pti.medians, gate, gapShiftAt(s, d)).share >= gate.skuShare);
    retention.push({ day: d, share: treatment.length ? passing.length / treatment.length : 0 });
  }
  const retention14 = retention.find((r) => r.day === 14)?.share ?? 0;

  // Guardrail 2: category NMV. We assume 60% of the badged gain is taken from
  // other sellers in the same category, so only 40% is net new.
  const totalNmv = pti.scored.reduce((sum, s) => sum + s.nmv30, 0);
  const badgedGain = treatment.reduce((sum, s) => sum + s.nmv30, 0) * lift;
  const categoryNmvChange = (0.4 * badgedGain) / totalNmv;

  // Balance check: treatment and control should look alike before the badge.
  const balanceRows = [
    ['Annual GMV (₹ cr)', (s) => s.gmvCr, 1],
    ['Live SKUs', (s) => s.liveSkus, 0],
    ['Median landed price (₹)', (s) => s.medianPrice, 0],
    ['RTO rate', (s) => s.rtoRate * 100, 1],
    ['Median price gap (%)', (s) => s.medianGap * 100, 1],
  ].map(([label, fn, digits]) => {
    const a = treatment.map(fn);
    const b = control.map(fn);
    return { label, treatment: mean(a), control: mean(b), smd: smd(a, b), digits };
  });

  let decision;
  if (retention14 < cfg.retentionFloor || lift <= 0) {
    decision = {
      code: 'stop',
      title: 'Stop. Do not fund nodes.',
      detail: retention14 < cfg.retentionFloor
        ? `Only ${Math.round(retention14 * 100)}% of badged sellers still clear the gate at D14 (floor ${Math.round(cfg.retentionFloor * 100)}%). The advantage was a promotion, and no infrastructure fixes that.`
        : 'No lift over the holdout. Price rank alone is not moving buyers.',
    };
  } else if (lift >= cfg.fundLift && ci[0] > 0) {
    decision = {
      code: 'fund',
      title: 'Fund clusters and Factory Nodes.',
      detail: `Badged sellers beat the matched holdout by ${(lift * 100).toFixed(1)}% on NMV per live SKU, above the ${Math.round(cfg.fundLift * 100)}% bar, and ${Math.round(retention14 * 100)}% still clear the gate at D14. Move to days 31–90 in full.`,
    };
  } else {
    decision = {
      code: 'tighten',
      title: `Tighten the gate to ${Math.round(cfg.tightenedDelta * 100)}% and re-run for 28 days.`,
      detail: `Lift of ${(lift * 100).toFixed(1)}% is positive but under the ${Math.round(cfg.fundLift * 100)}% bar${ci[0] <= 0 ? ', and the interval still includes zero' : ''}. Commit no capex yet.`,
    };
  }

  return {
    scenario: scenarioId,
    treatment,
    control,
    arms,
    lift,
    ci,
    daily,
    retention,
    retention14,
    maxImpressionShare,
    capped,
    categoryNmvChange,
    balanceRows,
    decision,
  };
}
