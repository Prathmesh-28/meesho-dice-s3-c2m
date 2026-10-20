// The demo persona's whole Factory Direct flow in one place, so every screen shows the same batch.
import { ECONOMICS, PERSONA } from '../config.js';
import { priceCheck, ratesFor, routeTable } from './economics.js';
import { demandBrief, batchPlan } from './demand.js';
import { batchCash } from './factoryDirect.js';

export function personaFlow(pti) {
  const args = { unitCost: PERSONA.unitCost, category: PERSONA.category, typeId: PERSONA.type, margin: ECONOMICS.targetMarginB2B, medians: pti.medians };
  const check = priceCheck({ ...args, mode: 'node' });
  const self = priceCheck({ ...args, mode: 'self' });
  const table = routeTable(args);
  const brief = demandBrief({ typeId: PERSONA.type, marketMedian: check.marketMedian });
  const batch = batchPlan({ brief, listingPrice: check.gatePrice, minViablePrice: table[3].floor, preOrders: PERSONA.preOrders });
  const ledger = batchCash({ confirmed: batch.preOrders, price: batch.preorderPrice, rates: ratesFor(PERSONA.category) });
  return { check, self, table, brief, batch, ledger };
}
