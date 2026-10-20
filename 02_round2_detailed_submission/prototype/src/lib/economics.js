// Manufacturer unit economics and the pre-onboarding price check, on the Factory Direct cost model
// (lib/factoryDirect.js, the same numbers as the deck). Costs are per pack the buyer keeps: returns and failed
// deliveries are paid for by the packs that stay sold.

import { ECONOMICS, GATE } from '../config.js';
import { categoryById } from './generate.js';
import { TEARDOWN, packCost, routes } from './factoryDirect.js';

// How orders ship. 'batch' is the Factory Node plus prepaid pre-orders made to order (+15%).
export const MODES = {
  self: { label: 'Ship myself', opts: { mode: 'self' } },
  node: { label: 'Factory Node', opts: { mode: 'node' } },
  batch: { label: 'Prepaid batch', opts: { mode: 'node', stock: 'batch', prepaid: true } },
};

export const ratesFor = (category) => ({ rto: categoryById[category].rtoRate, ret: categoryById[category].returnRate });

// What buyers pay today: the meesho.com teardown median where the team priced that product, else the synthetic market.
export function marketPrice(typeId, medians) {
  const t = TEARDOWN[typeId];
  if (t) return { median: t.median, source: 'meesho.com teardown, 2 Oct 2026', listingMedian: t.listingMedian };
  return { median: medians.get(typeId)?.median ?? 0, source: 'synthetic market median' };
}

export function unitEconomics({ price, unitCost, category, mode = 'node' }) {
  const c = packCost({ cogs: unitCost, rates: ratesFor(category), ...MODES[mode].opts });
  const profit = price - c.cost;
  return {
    price,
    cost: c.cost,
    returnRate: c.returnRate,
    rtoRate: c.rto,
    margin: price ? profit / price : 0,
    lines: [
      { label: 'Selling price', value: price },
      { label: 'Making cost (net of resold returns)', value: -c.goods },
      { label: 'Unsold stock written down', value: -c.unsold },
      { label: mode === 'self' ? 'Packing and shipping' : 'Node fee and shipping', value: -c.logistics },
      { label: 'Customer returns (₹150 each)', value: -c.returns },
      { label: 'Working capital', value: -c.capital },
      { label: 'Profit per pack kept', value: profit, total: true },
    ],
    returnCostPerKept: c.returns,
  };
}

// Lowest selling price that still earns `margin`.
export function breakEvenPrice({ unitCost, category, mode, margin }) {
  return packCost({ cogs: unitCost, rates: ratesFor(category), margin, ...MODES[mode].opts }).floor;
}

export function priceCheck({ unitCost, category, typeId, mode, margin, medians, gate = GATE }) {
  const market = marketPrice(typeId, medians);
  const floor = breakEvenPrice({ unitCost, category, mode, margin });
  const marketMedian = market.median;
  const gap = marketMedian ? (marketMedian - floor) / marketMedian : 0;
  const gatePrice = marketMedian * (1 - gate.deltaThreshold);
  // List at the gate price, 8% under what buyers pay today, never below the factory's own floor.
  const suggested = Math.max(Math.ceil(floor), Math.floor(gatePrice));
  return {
    floor,
    marketMedian,
    marketSource: market.source,
    gap,
    gatePrice,
    qualifies: gap >= gate.deltaThreshold,
    suggested,
    suggestedGap: marketMedian ? (marketMedian - suggested) / marketMedian : 0,
    atSuggested: unitEconomics({ price: suggested, unitCost, category, mode }),
  };
}

// All four routes side by side for one product: reseller today, factory ships itself, Factory Node, prepaid batch.
export function routeTable({ unitCost, category, typeId, margin, medians }) {
  const market = marketPrice(typeId, medians).median;
  return routes({ cogs: unitCost, market, rates: ratesFor(category), margin });
}

// Days until cash comes back, and what that float costs as a share of revenue.
export function cashCycle() {
  const e = ECONOMICS;
  const handover = 3;
  const batchDays = e.prepaymentShare * handover + (1 - e.prepaymentShare) * (handover + e.deliveryDays + e.settlementDays);
  const cost = (days) => (e.costOfCapital * days) / 365;
  return {
    b2bDays: e.b2bPaymentDays,
    batchDays,
    b2bCost: cost(e.b2bPaymentDays),
    batchCost: cost(batchDays),
  };
}
