// The demo persona's whole Factory Direct flow in one place, so every screen shows the same batch.
//   batch / ledger:         the deck's worked batch (1,000 pre-orders → 1,150 made): Kavin's week at a 12.8% share
//   plan / week / weekLedger: Kavin's actual week at a new factory's 6% share (469 pre-orders → 539 made)
import { ECONOMICS, PERSONA } from '../config.js';
import { priceCheck, ratesFor, routeTable } from './economics.js';
import { demandBrief, batchPlan } from './demand.js';
import { batchCash } from './factoryDirect.js';
import { sizing } from './operations.js';

export function personaFlow(pti) {
  const args = { unitCost: PERSONA.unitCost, category: PERSONA.category, typeId: PERSONA.type, margin: ECONOMICS.targetMarginB2B, medians: pti.medians };
  const check = priceCheck({ ...args, mode: 'node' });
  const self = priceCheck({ ...args, mode: 'self' });
  const table = routeTable(args);
  const brief = demandBrief({ typeId: PERSONA.type, marketMedian: check.marketMedian });
  const rates = ratesFor(PERSONA.category);
  const batch = batchPlan({ brief, listingPrice: check.gatePrice, minViablePrice: table[3].floor, preOrders: PERSONA.preOrders });
  const ledger = batchCash({ confirmed: batch.preOrders, price: batch.preorderPrice, rates });
  const plan = sizing({ dailyDemand: brief.weeklyTotal / 7 });
  const week = { ...batchPlan({ brief, listingPrice: check.gatePrice, minViablePrice: table[3].floor, preOrders: plan.preOrders }), make: plan.make };
  const weekLedger = batchCash({ confirmed: week.preOrders, price: week.preorderPrice, rates });
  return { check, self, table, brief, rates, batch, ledger, plan, week, weekLedger };
}
