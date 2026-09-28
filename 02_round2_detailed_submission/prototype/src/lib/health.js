// C2M Seller Health Score and the automated rulebook.
//
// A 60-seller pilot cohort (Tiruppur hosiery, Panipat home textiles) is simulated
// day by day. Each day: compute the five components, score 0–100, evaluate the
// rules, fire actions. Actions change what happens next (an impression grant
// lifts orders, a Factory Node fixes dispatch), so the loop is causal, not a
// replay. The only human step is escalation.

import { HEALTH, TRIGGERS, PERSONA, SEED } from '../config.js';
import { makeRng } from './rng.js';
import { clamp, mean, sum } from './format.js';
import { categoryById, CLUSTER_CODE } from './generate.js';

export const STAGES = [
  { id: 'qualify', label: 'Qualify', note: 'Passed the price gate' },
  { id: 'allocate', label: 'Allocate', note: 'Days 0–14, starter impressions' },
  { id: 'diagnose', label: 'Diagnose', note: 'Healthy, monitored daily' },
  { id: 'remedy', label: 'Remedy', note: 'An automated fix is running' },
  { id: 'graduate', label: 'Graduate', note: 'Batch prepayment unlocked' },
];

export const RULES = [
  { id: 'grant', stage: 'Allocate', when: `Orders below ${TRIGGERS.velocityFloor * 100}% of cohort median at D7 or D14`, action: `Impression grant: +${(TRIGGERS.grantImpressions / 1000).toFixed(0)}K impressions in Demand Brief pin-codes for ${TRIGGERS.grantDays} days (max ${TRIGGERS.maxGrants})`, auto: true },
  { id: 'drift', stage: 'Remedy', when: `Price gap under ${TRIGGERS.driftDelta * 100}% for ${TRIGGERS.driftDays} days`, action: 'Price-drift nudge with the market median', auto: true },
  { id: 'removed', stage: 'Remedy', when: `Price gap under ${TRIGGERS.removeDelta * 100}% for ${TRIGGERS.removeDays} days`, action: 'C2M badge removed', auto: true },
  { id: 'reentry', stage: 'Remedy', when: `Gap back above ${TRIGGERS.driftDelta * 100}% for ${TRIGGERS.reentryDays} days`, action: 'Badge restored (re-entry)', auto: true },
  { id: 'suspend', stage: 'Remedy', when: `Quality returns above ${TRIGGERS.qualityMultiple}× category norm (≥ ${TRIGGERS.qualityMinDeliveries} deliveries)`, action: 'Badge suspended + QC checklist', auto: true },
  { id: 'reinstate', stage: 'Remedy', when: `Quality returns back under ${TRIGGERS.reinstateMultiple}× norm for ${TRIGGERS.reinstateDays} days`, action: 'Badge reinstated', auto: true },
  { id: 'node', stage: 'Remedy', when: `On-time dispatch under ${TRIGGERS.slaFloor * 100}% over 7 days`, action: 'Offer assisted operations at the Factory Node', auto: true },
  { id: 'restock', stage: 'Remedy', when: `In-stock under ${TRIGGERS.stockFloor * 100}% for ${TRIGGERS.stockDays} days`, action: 'Restock nudge with batch size from the Demand Brief', auto: true },
  { id: 'graduate', stage: 'Graduate', when: `Score ≥ ${HEALTH.graduateScore} for ${HEALTH.graduateDays} days`, action: 'Graduate: batch prepayment unlocked', auto: true },
  { id: 'escalate', stage: 'Remedy', when: `Score under ${HEALTH.escalateScore} for ${HEALTH.escalateDays} days after an automated fix`, action: 'Escalate to category manager', auto: false },
];

const MIX = [['strong', 18], ['slow', 11], ['drift', 7], ['quality', 6], ['ops', 9], ['stockout', 5], ['failing', 3]];
const NAMES = {
  hosiery: ['Knit Mills', 'Knitwear', 'Hosiery', 'Garments', 'Knit Fab'],
  hometex: ['Handloom', 'Furnishings', 'Weaves', 'Home Textiles', 'Towel Mills'],
};
const PREFIX = [
  'Arul', 'Velan', 'Kumaran', 'Sakthi', 'Senthil', 'Murugan', 'Thangam', 'Selvam', 'Priya', 'Anbu', 'Ilango',
  'Kaveri', 'Vetri', 'Malar', 'Chola', 'Ganga', 'Yamuna', 'Hari', 'Shyam', 'Bansal', 'Garg', 'Mittal', 'Jindal',
  'Aggarwal', 'Goyal', 'Singla', 'Kohli', 'Saini', 'Rana', 'Dhiman', 'Malik', 'Nanda', 'Sethi', 'Tyagi',
];

export function generateCohort(seed = SEED) {
  const rng = makeRng(seed + 101);
  const plan = rng.shuffle(MIX.flatMap(([a, n]) => Array(n).fill(a)));
  const used = new Set([PERSONA.name]);
  const counters = { Tiruppur: 1, Panipat: 100 };
  const sellers = [
    {
      id: PERSONA.id, name: PERSONA.name, cluster: PERSONA.cluster, category: PERSONA.category,
      archetype: 'slow', day: PERSONA.day, persona: true,
    },
  ];
  plan.forEach((archetype, i) => {
    const cluster = i % 2 === 0 ? 'Tiruppur' : 'Panipat';
    const category = cluster === 'Tiruppur' ? 'hosiery' : 'hometex';
    let name;
    do name = `${rng.pick(PREFIX)} ${rng.pick(NAMES[category])}`; while (used.has(name));
    used.add(name);
    counters[cluster] += 1;
    sellers.push({
      id: `${CLUSTER_CODE[cluster]}-${String(counters[cluster]).padStart(4, '0')}`,
      name, cluster, category, archetype,
      day: rng.int(6, 60),
    });
  });
  return sellers.map((s, i) => simulateSeller(s, makeRng(seed + 1000 + i)));
}

function componentScores(m, d0) {
  return {
    price: clamp(m.delta / d0, 0, 1) * 100,
    velocity: clamp((m.velocity - 0.3) / 0.7, 0, 1) * 100,
    quality: clamp(2 - m.qualityMultiple, 0, 1) * 100,
    sla: clamp((m.sla7 - 0.8) / 0.17, 0, 1) * 100,
    stock: clamp((m.stock - 0.5) / 0.45, 0, 1) * 100,
  };
}

export function healthScore(components) {
  return sum(Object.entries(HEALTH.weights).map(([k, w]) => w * components[k]));
}

export function simulateSeller(seller, rng) {
  const cat = categoryById[seller.category];
  const T = TRIGGERS;
  const a = seller.archetype;
  const persona = !!seller.persona;

  const skuCount = persona ? 14 : rng.int(8, 30);
  const Dm = skuCount * cat.ordersPerSkuDay * (persona ? 1 : rng.uniform(0.8, 1.2));
  const d0 = persona ? 0.15 : rng.uniform(0.1, 0.16);

  const p = {
    v: { strong: rng.uniform(1.0, 1.25), slow: persona ? 0.42 : rng.uniform(0.35, 0.5), failing: rng.uniform(0.25, 0.35) }[a] ?? rng.uniform(0.9, 1.15),
    vFixed: a === 'failing' ? 0.4 : persona ? 1.02 : rng.uniform(0.9, 1.1),
    sla: { ops: rng.uniform(0.8, 0.87), failing: rng.uniform(0.82, 0.86) }[a] ?? rng.uniform(0.95, 0.99),
    q: a === 'failing' ? 1.6 : rng.uniform(0.5, 0.9),
    stock: a === 'failing' ? rng.uniform(0.6, 0.68) : rng.uniform(0.9, 1.0),
    driftStart: a === 'drift' ? rng.int(8, 14) : a === 'failing' ? 5 : Infinity,
    driftRate: a === 'failing' ? 0.005 : rng.uniform(0.005, 0.008),
    respondsToNudge: rng.chance(0.5),
    qualityStart: a === 'quality' ? rng.int(10, 15) : Infinity,
    qualityBad: rng.uniform(2.0, 2.6),
    acceptsNode: a === 'failing' ? true : rng.chance(0.85),
    stockoutStart: a === 'stockout' ? rng.int(12, 18) : Infinity,
  };

  const st = {
    badge: 'active', v: p.v, vTarget: null, vRampFrom: null, delta: d0, drifting: false,
    grants: 0, grantUntil: -1, nudged: false, restoreFrom: null,
    qMult: p.q, qcFixDay: null, sla: p.sla, nodeOffered: null, nodeJoinDay: null,
    stock: p.stock, restockDay: null, lastRestock: -99,
    belowDrift: 0, belowRemove: 0, aboveReentry: 0, qualityOk: 0, stockLow: 0,
    above80: 0, below40: 0, lastRemedy: -99, remedies: 0, graduated: null, escalated: null,
  };

  const events = [{ day: 0, rule: 'onboard', label: 'Badge on · starter impressions in 12 Demand Brief pin-codes', reason: 'Passed the Price Truth Index gate', auto: true, tone: 'neutral' }];
  if (persona) {
    events.push({ day: 0, rule: 'batch', label: 'First demand-confirmed batch handed over at the Tiruppur Factory Node', reason: 'Made against confirmed pre-orders plus a 15% buffer', auto: true, tone: 'neutral' });
  }
  const fire = (day, rule, label, reason, tone, auto = true) => {
    events.push({ day, rule, label, reason, tone, auto });
    if (!['graduate', 'reinstate', 'reentry'].includes(rule)) {
      if (auto) st.remedies += 1;
      // Impression grants belong to the Allocate stage, not Remedy.
      if (rule !== 'grant') st.lastRemedy = day;
    }
  };

  const hist = [];
  const expected = (t) => Dm * (1 - Math.exp(-t / HEALTH.rampDays));
  let cumOrders = 0;
  let cumExpected = 0;

  for (let t = 1; t <= seller.day; t++) {
    // --- dynamics: archetype behaviour plus the effect of earlier actions ---
    if (st.vTarget != null) {
      const k = clamp((t - st.vRampFrom) / 4, 0, 1);
      st.v = p.v + (st.vTarget - p.v) * k;
    }
    if (t >= p.driftStart && st.restoreFrom == null) st.delta -= p.driftRate;
    if (st.restoreFrom != null) st.delta = Math.min(d0 - 0.01, st.delta + 0.03);
    st.delta = Math.max(st.delta, -0.02);
    if (t === p.qualityStart) st.qMult = p.qualityBad;
    if (st.qcFixDay != null && t === st.qcFixDay) st.qMult = rng.uniform(0.7, 1.0);
    if (st.nodeJoinDay != null && t >= st.nodeJoinDay) st.sla = rng.uniform(0.96, 0.99);
    if (t === p.stockoutStart) st.stock = rng.uniform(0.45, 0.6);
    if (st.restockDay != null && t === st.restockDay) st.stock = rng.uniform(0.9, 0.97);

    const badgeF = st.badge === 'active' ? 1 : 0.75;
    const grantF = t <= st.grantUntil ? 1.35 : 1;
    const priceF = clamp(1 - 2 * Math.max(0, d0 - st.delta), 0.6, 1);
    const stockNow = clamp(st.stock + rng.normal(0, 0.02), 0, 1);
    const orders = expected(t) * st.v * stockNow * badgeF * grantF * priceF * Math.exp(rng.normal(0, 0.22));
    cumOrders += orders;
    cumExpected += expected(t);
    const slaToday = clamp(st.sla + rng.normal(0, 0.015), 0, 1);
    const qToday = st.qMult * Math.exp(rng.normal(0, 0.1));

    const prev = hist.slice(-13);
    const window = [...prev.map((h) => h.orders), orders];
    const expWindow = [...prev.map((h) => h.expected), expected(t)];
    const velocity = sum(window) / sum(expWindow);
    const sla7 = mean([...hist.slice(-6).map((h) => h.slaToday), slaToday]);
    const qualityMultiple = mean([...prev.map((h) => h.qToday), qToday]);
    const deliveries14 = sum(window) * (1 - cat.rtoRate);

    const metrics = { velocity, sla7, qualityMultiple, stock: stockNow, delta: st.delta };
    const comps = componentScores(metrics, d0);
    const score = healthScore(comps);

    // --- rules ---
    if (T.velocityCheckDays.includes(t) && velocity < T.velocityFloor && st.grants < T.maxGrants && st.badge === 'active') {
      st.grants += 1;
      st.grantUntil = t + T.grantDays;
      if (st.vTarget == null && (a === 'slow' || a === 'failing')) {
        st.vTarget = p.vFixed;
        st.vRampFrom = t;
      }
      fire(t, 'grant', `Impression grant #${st.grants}: +${(T.grantImpressions / 1000).toFixed(0)}K impressions for ${T.grantDays} days`, `Orders at D${t} were ${Math.round(velocity * 100)}% of the cohort median (floor ${T.velocityFloor * 100}%)`, 'warning');
    }

    st.belowDrift = st.delta < T.driftDelta ? st.belowDrift + 1 : 0;
    if (st.belowDrift === T.driftDays && !st.nudged) {
      st.nudged = true;
      if (p.respondsToNudge && a !== 'failing') st.restoreFrom = t + 1;
      fire(t, 'drift', 'Price-drift nudge sent with the market median', `Price gap under ${T.driftDelta * 100}% for ${T.driftDays} days (now ${(st.delta * 100).toFixed(1)}%)`, 'warning');
    }
    st.belowRemove = st.delta < T.removeDelta ? st.belowRemove + 1 : 0;
    if (st.belowRemove === T.removeDays && st.badge === 'active') {
      st.badge = 'removed';
      fire(t, 'removed', 'C2M badge removed', `Price gap under ${T.removeDelta * 100}% for ${T.removeDays} days (now ${(st.delta * 100).toFixed(1)}%)`, 'critical');
    }
    if (st.badge === 'removed') {
      st.aboveReentry = st.delta >= T.driftDelta ? st.aboveReentry + 1 : 0;
      if (st.aboveReentry === T.reentryDays) {
        st.badge = 'active';
        fire(t, 'reentry', 'Badge restored', `Price gap back above ${T.driftDelta * 100}% for ${T.reentryDays} days`, 'good');
      }
    }

    if (st.badge === 'active' && qualityMultiple > T.qualityMultiple && deliveries14 >= T.qualityMinDeliveries) {
      st.badge = 'suspended';
      if (a !== 'failing') st.qcFixDay = t + 5;
      fire(t, 'suspend', 'Badge suspended + QC checklist sent', `Quality returns ${qualityMultiple.toFixed(1)}× the category norm over 14 days`, 'critical');
    }
    if (st.badge === 'suspended') {
      st.qualityOk = qualityMultiple <= T.reinstateMultiple ? st.qualityOk + 1 : 0;
      if (st.qualityOk === T.reinstateDays) {
        st.badge = 'active';
        fire(t, 'reinstate', 'Badge reinstated', `Quality returns back to ${qualityMultiple.toFixed(1)}× norm for ${T.reinstateDays} days`, 'good');
      }
    }

    if (t >= 7 && sla7 < T.slaFloor && st.nodeOffered == null) {
      st.nodeOffered = t;
      if (p.acceptsNode) st.nodeJoinDay = t + 4;
      fire(t, 'node', 'Assisted operations offered at the Factory Node', `On-time dispatch ${Math.round(sla7 * 100)}% over 7 days (floor ${T.slaFloor * 100}%)`, 'warning');
    }
    if (st.nodeJoinDay === t) {
      events.push({ day: t, rule: 'nodejoin', label: 'Moved to Factory Node: node now picks, packs and takes returns', reason: 'Accepted the assisted-operations offer', tone: 'good', auto: true });
    }

    st.stockLow = stockNow < T.stockFloor ? st.stockLow + 1 : 0;
    if (st.stockLow === T.stockDays && t - st.lastRestock > T.remedyCooldown) {
      st.lastRestock = t;
      if (a !== 'failing') st.restockDay = t + 4;
      fire(t, 'restock', 'Restock nudge with batch size from the Demand Brief', `In-stock ${Math.round(stockNow * 100)}% for ${T.stockDays} days`, 'warning');
    }

    st.above80 = score >= HEALTH.graduateScore ? st.above80 + 1 : 0;
    if (st.above80 >= HEALTH.graduateDays && st.graduated == null && st.badge === 'active') {
      st.graduated = t;
      fire(t, 'graduate', 'Graduated: batch prepayment unlocked', `Score ≥ ${HEALTH.graduateScore} for ${HEALTH.graduateDays} days`, 'good');
    }
    st.below40 = score < HEALTH.escalateScore ? st.below40 + 1 : 0;
    if (st.below40 >= HEALTH.escalateDays && st.remedies >= 1 && st.escalated == null) {
      st.escalated = t;
      fire(t, 'escalate', 'Escalated to category manager', `Score under ${HEALTH.escalateScore} for ${HEALTH.escalateDays} days after ${st.remedies} automated fix${st.remedies > 1 ? 'es' : ''}`, 'critical', false);
    }

    hist.push({
      day: t, orders, expected: expected(t), cumOrders, cumExpected,
      band: [cumExpected * HEALTH.p25, cumExpected * HEALTH.p75],
      slaToday, qToday, ...metrics, comps, score, badge: st.badge,
    });
  }

  const today = hist.at(-1);
  let stage;
  if (st.graduated != null) stage = 'graduate';
  else if (st.escalated != null || st.badge !== 'active' || st.lastRemedy >= seller.day - TRIGGERS.remedyCooldown) stage = 'remedy';
  else if (seller.day <= 14) stage = 'allocate';
  else stage = 'diagnose';

  return {
    ...seller,
    categoryName: cat.short,
    skuCount,
    d0,
    history: hist,
    events,
    score: today.score,
    comps: today.comps,
    metrics: today,
    badge: st.badge,
    stage,
    escalated: st.escalated != null,
    graduatedDay: st.graduated,
    latest: events.at(-1),
  };
}

export function cohortSummary(cohort) {
  const events = cohort.flatMap((s) => s.events.filter((e) => e.rule !== 'onboard').map((e) => ({ ...e, seller: s })));
  const auto = events.filter((e) => e.auto).length;
  const manual = events.filter((e) => !e.auto).length;
  const sellerMonths = sum(cohort.map((s) => s.day)) / 30;
  const manualPerSellerMonth = manual / sellerMonths;
  const stageCounts = Object.fromEntries(STAGES.map((st) => [st.id, cohort.filter((s) => s.stage === st.id).length]));
  stageCounts.qualify = cohort.length;
  return {
    // Newest first: sort by how many days ago each event fired.
    events: events.sort((a, b) => a.seller.day - a.day - (b.seller.day - b.day)),
    auto,
    manual,
    sellerMonths,
    sellersPerManager: manual ? HEALTH.categoryManagerCapacity / manualPerSellerMonth : Infinity,
    avgScore: mean(cohort.map((s) => s.score)),
    stageCounts,
    escalated: cohort.filter((s) => s.escalated).length,
  };
}
