// Manufacturer unit economics and the pre-onboarding price check.
//
// Everything is per 100 dispatched orders so returns and RTO are counted the
// way the Round 1 return math counts them: reverse cost ÷ units the buyer kept.

import { ECONOMICS, GATE } from '../config.js';
import { categoryById } from './generate.js';

function flows(category, mode) {
  const cat = categoryById[category];
  const m = ECONOMICS.modes[mode];
  const dispatched = 100;
  const rto = dispatched * cat.rtoRate;
  const delivered = dispatched - rto;
  const returned = delivered * cat.returnRate;
  const kept = delivered - returned;
  return { cat, m, dispatched, rto, delivered, returned, kept };
}

// Everything except revenue, for a given making cost.
function fixedCosts(f, unitCost) {
  const production = f.dispatched * unitCost;
  const recovered = (f.rto + f.returned) * unitCost * ECONOMICS.resaleRecovery;
  const logistics = f.dispatched * (f.m.packing + f.m.forward + f.m.handling + f.m.bulkFreight);
  const reverse = f.returned * f.m.reversePerReturn + f.rto * ECONOMICS.rtoReverseCost;
  return { production, recovered, logistics, reverse, total: production - recovered + logistics + reverse };
}

export function unitEconomics({ price, unitCost, category, mode }) {
  const f = flows(category, mode);
  const c = fixedCosts(f, unitCost);
  const revenue = f.kept * price;
  const profit = revenue - c.total;
  const perKept = (x) => x / f.kept;
  return {
    price,
    kept: f.kept,
    returnRate: f.cat.returnRate,
    rtoRate: f.cat.rtoRate,
    margin: revenue ? profit / revenue : 0,
    lines: [
      { label: 'Selling price', value: price },
      { label: 'Making cost (net of resold returns)', value: -perKept(c.production - c.recovered) },
      { label: 'Packing, shipping and handling', value: -perKept(c.logistics) },
      { label: 'Returns and RTO', value: -perKept(c.reverse) },
      { label: 'Profit per unit kept', value: perKept(profit), total: true },
    ],
    // Round 1 slide 1: returns × reverse cost ÷ units delivered and kept.
    returnCostPerKept: (f.returned * f.m.reversePerReturn) / f.kept,
  };
}

// Lowest selling price that still earns `margin`.
export function breakEvenPrice({ unitCost, category, mode, margin }) {
  const f = flows(category, mode);
  return fixedCosts(f, unitCost).total / (f.kept * (1 - margin));
}

export function priceCheck({ unitCost, category, typeId, mode, margin, medians, gate = GATE }) {
  const floor = breakEvenPrice({ unitCost, category, mode, margin });
  const marketMedian = medians.get(typeId)?.median ?? 0;
  const gap = marketMedian ? (marketMedian - floor) / marketMedian : 0;
  // Suggested listing: 10% under market, never below the manufacturer's floor.
  const suggested = Math.max(Math.ceil(floor), Math.round(marketMedian * (1 - (gate.deltaThreshold + 0.02))));
  return {
    floor,
    marketMedian,
    gap,
    qualifies: gap >= gate.deltaThreshold,
    suggested,
    suggestedGap: marketMedian ? (marketMedian - suggested) / marketMedian : 0,
    atSuggested: unitEconomics({ price: suggested, unitCost, category, mode }),
  };
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
