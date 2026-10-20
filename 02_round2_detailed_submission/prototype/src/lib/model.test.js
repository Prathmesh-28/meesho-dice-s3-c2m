import { describe, expect, it } from 'vitest';
import { ECONOMICS, GATE, PERSONA } from '../config.js';
import { generateMarket } from './generate.js';
import { runPTI } from './pti.js';
import { runExperiment } from './experiment.js';
import { generateCohort, cohortSummary } from './health.js';
import { priceCheck, unitEconomics } from './economics.js';
import { demandBrief, batchPlan } from './demand.js';
import { deckCase, financials, breakEvenYield, gateReleases, SCENARIOS } from './factoryDirect.js';
import { personaFlow } from './flow.js';

const market = generateMarket();
const pti = runPTI(market, GATE);

describe('end-to-end C2M decision model', () => {
  it('screens a real catalogue rather than a single cheap SKU', () => {
    expect(market.sellers.length).toBeGreaterThan(200);
    expect(market.sellers.reduce((n, s) => n + s.skus.length, 0)).toBeGreaterThan(4000);
    expect(pti.counts.ready).toBeGreaterThan(0);
    expect(pti.counts.lossleader).toBeGreaterThan(0);
    for (const seller of pti.screened.filter((s) => s.verdict === 'ready')) {
      expect(seller.share).toBeGreaterThanOrEqual(GATE.skuShare);
      expect(seller.gmvCr).toBeGreaterThanOrEqual(GATE.minGmvCr);
    }
  });

  it('reaches all three experiment decisions under the stated scenarios', () => {
    expect(runExperiment(pti, GATE, 'base').decision.code).toBe('fund');
    expect(runExperiment(pti, GATE, 'weak').decision.code).toBe('tighten');
    expect(runExperiment(pti, GATE, 'decay').decision.code).toBe('stop');
  });

  it('keeps the manufacturer pre-order price above the chosen margin floor', () => {
    const check = priceCheck({
      unitCost: PERSONA.unitCost, category: PERSONA.category, typeId: PERSONA.type,
      mode: 'node', margin: ECONOMICS.targetMarginB2B, medians: pti.medians,
    });
    const brief = demandBrief({ typeId: PERSONA.type, marketMedian: check.marketMedian });
    const batch = batchPlan({ brief, listingPrice: check.suggested, minViablePrice: check.floor });
    const economics = unitEconomics({
      price: batch.preorderPrice, unitCost: PERSONA.unitCost, category: PERSONA.category, mode: 'node',
    });
    expect(check.qualifies).toBe(true);
    expect(batch.make).toBe(batch.preOrders + batch.buffer);
    expect(batch.buffer / batch.preOrders).toBeCloseTo(ECONOMICS.batchBuffer, 2);
    expect(batch.discount).toBeLessThanOrEqual(ECONOMICS.preorderDiscount);
    expect(economics.margin).toBeGreaterThanOrEqual(ECONOMICS.targetMarginB2B);
  });

  it('fires automated health actions and reserves human review for escalations', () => {
    const cohort = generateCohort();
    const summary = cohortSummary(cohort);
    const persona = cohort.find((seller) => seller.id === PERSONA.id);
    expect(cohort).toHaveLength(60);
    expect(persona.events.some((event) => event.rule === 'grant')).toBe(true);
    expect(summary.auto).toBeGreaterThan(summary.manual);
    expect(summary.stageCounts.graduate).toBeGreaterThan(0);
  });

  it('matches the deck: cost per pack, the batch, and the five-year case', () => {
    const d = deckCase();
    expect(d.cols.map((c) => Math.round(c.floor))).toEqual([220, 194, 191, 180]);
    expect(d.cols.map((c) => c.passes)).toEqual([false, false, true, true]);
    expect(d.preorderPrice).toBeCloseTo(182.28, 1);
    expect(Math.round(d.batch.advance)).toBe(54684);
    expect(Math.round(d.batch.balance)).toBe(33840);
    const f = financials();
    expect(f.npv).toBeCloseTo(74.9, 1);
    expect(f.payback).toBe(3);
    expect(f.cashY1).toBeCloseTo(22.2, 1);
    expect(breakEvenYield()).toBeCloseTo(0.45, 2);
    expect(Math.round(financials(SCENARIOS.bear.over).npv)).toBe(-10);
    expect(Math.round(financials(SCENARIOS.bull.over).npv)).toBe(140);
  });

  it('shows the node clearing the badge at the deck making cost', () => {
    const run = (mode) => priceCheck({ unitCost: PERSONA.unitCost, category: PERSONA.category, typeId: PERSONA.type, mode, margin: ECONOMICS.targetMarginB2B, medians: pti.medians });
    expect(run('self').qualifies).toBe(false);
    expect(run('node').qualifies).toBe(true);
    expect(run('batch').qualifies).toBe(true);
    expect(run('node').marketMedian).toBe(209);
  });

  it('runs the deck’s worked batch for Kavin Knit Mills, and the deck’s gate money', () => {
    const { batch, ledger } = personaFlow(pti);
    expect(batch.preOrders).toBe(1000);
    expect(batch.make).toBe(1150);
    expect(batch.preorderPrice).toBeCloseTo(182.28, 1);
    expect(Math.round(ledger.advance)).toBe(54684);
    expect(Math.round(ledger.failed)).toBe(46);
    expect(Math.round(ledger.returns)).toBe(76);
    expect(Math.round(ledger.balance)).toBe(33840);
    const g = gateReleases();
    expect(g.d90).toBeCloseTo(7.3, 1);
    expect(g.rest).toBeCloseTo(14.9, 1);
  });
});

describe('batch operations: the answers a logistics reviewer asks for', async () => {
  const O = await import('./operations.js');
  const { FD, OPS } = await import('../config.js');
  const { batchCash: cash } = await import('./factoryDirect.js');
  const flow = personaFlow(pti);
  const daily = flow.brief.weeklyTotal / 7;

  it('sizes the batch from demand: weekly at a 6% share, the deck’s 1,000 at 12.8%', () => {
    const p = flow.plan;
    expect(Math.round(daily)).toBe(2233);
    expect(p.preDay).toBeCloseTo(67, 0);
    expect(p.cutoffs).toBe(1);
    expect([p.preOrders, p.make]).toEqual([469, 539]);
    expect(p.clearsMinRun).toBe(true);
    expect(p.wait).toEqual({ min: 4, max: 10, avg: 7 });
    expect(p.fill1000).toBeCloseTo(14.9, 1);
    expect(p.shareFor(1000, 3)).toBeCloseTo(0.299, 3);
    const deckWeek = O.sizing({ dailyDemand: daily, share: p.shareFor(1000, 7) });
    expect([deckWeek.preOrders, deckWeek.make]).toEqual([1000, 1150]);
    const twice = O.sizing({ dailyDemand: daily, share: 0.15 });
    expect(twice.cutoffs).toBe(2);
    expect(twice.wait.max).toBe(7);
    const lowPrepay = O.sizing({ dailyDemand: daily, acceptance: 0.3 });
    expect(lowPrepay.make).toBe(OPS.minRun);
    expect(lowPrepay.toNodeFits).toBe(true);
  });

  it('dates every step from the Thursday cut-off and promises each district a date', () => {
    const tue = new Date(2026, 9, 20);
    const d = O.batchDates(O.nextCutoff(tue, 1));
    expect(d.cutoff.getDate()).toBe(22);
    expect(d.advance.getDate()).toBe(23);
    expect(d.truck.getDate()).toBe(25);
    expect(d.ship.getDate()).toBe(26);
    const patna = O.promises({ rows: flow.brief.rows, plan: flow.plan, today: tue }).find((r) => r.district === 'Patna');
    expect(patna.zone.label).toBe('East');
    expect(patna.door).toEqual([11, 12]);
    expect(patna.windowDoor).toEqual([9, 16]);
  });

  it('advances 20% at the cut-off and 10% at handover, the deck’s 30% in two parts', () => {
    const adv = O.advanceTiming({ preOrders: flow.week.preOrders, price: flow.week.preorderPrice, make: flow.week.make, transit: O.avgTransit(flow.brief.rows) });
    expect(adv.total).toBeCloseTo(flow.weekLedger.advance, 6);
    expect(Math.round(adv.atCutoff)).toBe(17098);
    expect(Math.round(adv.proposedPeak)).toBe(26022);
    expect(Math.round(adv.cashDays)).toBe(11);
    expect(cash({ confirmed: 1000, price: flow.batch.preorderPrice }).advance).toBeCloseTo(54684, 0);
  });

  it('turns what a batch leaves at the node into node stock and a top-up the factory approves', () => {
    const n = O.nodeFlow({ plan: flow.plan, rates: flow.rates });
    expect(Math.round(n.leftover)).toBe(127);
    expect(n.leftoverShare).toBeCloseTo(0.236, 3);
    expect(Math.round(n.topUp)).toBe(259);
    expect(n.back + n.topUp).toBeCloseTo(n.nodeOrders, 6);
    const withStorage = flow.table[2].floor + n.storagePerPack / (1 - FD.margin);
    expect(withStorage).toBeLessThan(flow.check.gatePrice);
  });

  it('shows which innerwear return rule keeps each route under the gate', () => {
    const pol = Object.fromEntries(O.returnPolicies().map((p) => [p.id, p.cols]));
    expect(pol.deck.map((c) => Math.round(c.floor))).toEqual([220, 194, 191, 180]);
    expect(pol.opened.map((c) => c.passes)).toEqual([false, false, false, true]);
    expect(pol.sealed.slice(1).every((c) => c.passes)).toBe(true);
  });

  it('sizes node sites for Year-4 volume and keeps NPV positive with the extra set-up', () => {
    const cap = O.nodeCapacity();
    expect(Math.round(cap.exits.at(-1).perDay / 1000)).toBe(352);
    expect(Math.round(cap.exits.at(-1).perNode / 100) * 100).toBe(29300);
    expect(cap.sites.at(-1)).toBe(37);
    expect(cap.withSites.npv).toBeGreaterThan(0);
    expect(cap.base.npv).toBeCloseTo(74.9, 1);
    expect(O.nodeCapacity(30000).extraSites).toBe(1);
  });

  it('checks every category at the same cost ratio, and plants exceptions in the batch history', () => {
    const cats = Object.fromEntries(O.categoryCheck(pti.medians).map((c) => [c.c.id, c]));
    expect(cats.hosiery.verdict).toBe('Node and batches');
    expect(cats.hosiery.self.passes).toBe(false);
    expect(cats.footwear.verdict).toBe('Not yet');
    const weeks = O.batchWeeks(flow.plan);
    expect(weeks.every((w) => w.make >= OPS.minRun)).toBe(true);
    expect(weeks.filter((w) => w.credits > 0)).toHaveLength(2);
  });
});
