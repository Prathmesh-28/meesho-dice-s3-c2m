import { describe, expect, it } from 'vitest';
import { ECONOMICS, GATE, PERSONA } from '../config.js';
import { generateMarket } from './generate.js';
import { runPTI } from './pti.js';
import { runExperiment } from './experiment.js';
import { generateCohort, cohortSummary } from './health.js';
import { priceCheck, unitEconomics } from './economics.js';
import { demandBrief, batchPlan } from './demand.js';

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
});
