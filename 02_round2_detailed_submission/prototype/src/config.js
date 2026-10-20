// Single source of truth for every number the prototype uses.
//
// Everything here is an ILLUSTRATIVE ASSUMPTION for a prototype running on
// synthetic data. Swap in platform-teardown numbers before quoting any of them
// in the deck. Nothing else in the codebase hard-codes a business number.

export const TEAM = {
  entry: 'Meesho DICE Challenge S3 · Business Track',
  team: 'Team 23B0747 · IIT Bombay',
  members: 'Prathmesh Walimbe · Krishna Kanta Mondal',
};

export const SEED = 20260926;

// The nine categories that passed the Round 1 segment scorecard.
// `ref` is the reference landed price (₹) the generator centres synthetic SKUs on;
// the medians the app actually uses are recomputed from the generated orders.
export const CATEGORIES = [
  {
    id: 'hosiery', name: 'Hosiery, innerwear & socks', short: 'Hosiery',
    clusters: ['Tiruppur', 'Ludhiana'], returnRate: 0.08, qualityNorm: 0.03, rtoRate: 0.14, ordersPerSkuDay: 1.6,
    variantAxes: { Size: ['S', 'M', 'L', 'XL', 'XXL'], Colour: ['Dark mix', 'Light mix', 'Black', 'Navy'] },
    types: [
      { id: 'briefs3', name: "Men's cotton briefs, pack of 3", ref: 249 },
      { id: 'socks5', name: 'Ankle socks, pack of 5', ref: 199 },
      { id: 'vests2', name: 'Cotton vests, pack of 2', ref: 269 },
      { id: 'leggings', name: "Women's cotton leggings", ref: 229 },
    ],
  },
  {
    id: 'hometex', name: 'Home textiles: sheets & towels', short: 'Home textiles',
    clusters: ['Panipat', 'Solapur'], returnRate: 0.05, qualityNorm: 0.02, rtoRate: 0.13, ordersPerSkuDay: 1.2,
    variantAxes: { Size: ['Single', 'Double', 'King'], Colour: ['Floral', 'Geometric', 'Solid', 'Kids print'] },
    types: [
      { id: 'bedsheet', name: 'Double bedsheet + 2 pillow covers', ref: 379 },
      { id: 'bathtowel', name: 'Cotton bath towel', ref: 229 },
      { id: 'handtowel4', name: 'Hand towels, pack of 4', ref: 199 },
      { id: 'chaddar', name: 'Solapur chaddar, single', ref: 259 },
    ],
  },
  {
    id: 'dressmat', name: 'Unstitched saree & dress material', short: 'Saree & dress material',
    clusters: ['Erode', 'Bhiwandi'], returnRate: 0.12, qualityNorm: 0.04, rtoRate: 0.18, ordersPerSkuDay: 1.0,
    variantAxes: { Fabric: ['Cotton', 'Cotton blend', 'Synthetic'], Colour: ['Pastel', 'Bright', 'Dark', 'Printed'] },
    types: [
      { id: 'dm3', name: 'Cotton dress material, 3-piece', ref: 449 },
      { id: 'sareesyn', name: 'Printed synthetic saree', ref: 389 },
      { id: 'sareecot', name: 'Cotton saree with blouse piece', ref: 549 },
    ],
  },
  {
    id: 'plastics', name: 'Moulded plastic housewares', short: 'Plastic housewares',
    clusters: ['Rajkot', 'Daman'], returnRate: 0.04, qualityNorm: 0.02, rtoRate: 0.12, ordersPerSkuDay: 1.4,
    variantAxes: { Size: ['Small', 'Medium', 'Large'], Colour: ['Transparent', 'Blue', 'Red', 'Green'] },
    types: [
      { id: 'cont6', name: 'Kitchen containers, set of 6', ref: 259 },
      { id: 'bucket', name: 'Bucket with mug, 20 L', ref: 219 },
      { id: 'rack', name: 'Kitchen storage rack, 3-tier', ref: 329 },
    ],
  },
  {
    id: 'jewellery', name: 'Imitation jewellery', short: 'Imitation jewellery',
    clusters: ['Rajkot', 'Coimbatore'], returnRate: 0.10, qualityNorm: 0.03, rtoRate: 0.17, ordersPerSkuDay: 1.3,
    variantAxes: { Finish: ['Gold-tone', 'Oxidised', 'Kundan', 'Pearl'], Occasion: ['Daily wear', 'Festive', 'Bridal'] },
    types: [
      { id: 'necklace', name: 'Necklace set with earrings', ref: 229 },
      { id: 'earrings3', name: 'Earrings, pack of 3', ref: 149 },
      { id: 'bangles', name: 'Bangle set', ref: 179 },
    ],
  },
  {
    id: 'steel', name: 'Steel kitchenware & utensils', short: 'Steel kitchenware',
    clusters: ['Jagadhri', 'Wazirpur'], returnRate: 0.04, qualityNorm: 0.015, rtoRate: 0.12, ordersPerSkuDay: 0.9,
    variantAxes: { Size: ['Small', 'Medium', 'Large'], Finish: ['Mirror', 'Matt', 'Hammered'] },
    types: [
      { id: 'patila3', name: 'Steel patila, set of 3', ref: 449 },
      { id: 'tumbler6', name: 'Steel tumblers, set of 6', ref: 279 },
      { id: 'kadai', name: 'Steel kadai with lid', ref: 399 },
    ],
  },
  {
    id: 'footwear', name: 'Basic footwear (PU / EVA)', short: 'Basic footwear',
    clusters: ['Agra', 'Bahadurgarh'], returnRate: 0.16, qualityNorm: 0.05, rtoRate: 0.19, ordersPerSkuDay: 1.1,
    variantAxes: { Size: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'], Colour: ['Black', 'Brown', 'Navy', 'Grey'] },
    types: [
      { id: 'eva', name: 'EVA flip-flops', ref: 199 },
      { id: 'pusandal', name: 'PU sandals', ref: 299 },
      { id: 'school', name: "Kids' school shoes", ref: 349 },
    ],
  },
  {
    id: 'brass', name: 'Brass décor & lighting', short: 'Brass décor',
    clusters: ['Moradabad'], returnRate: 0.07, qualityNorm: 0.025, rtoRate: 0.15, ordersPerSkuDay: 0.7,
    variantAxes: { Size: ['Small', 'Medium', 'Large'], Finish: ['Antique', 'Polished', 'Enamel'] },
    types: [
      { id: 'diya2', name: 'Brass diya, pair', ref: 299 },
      { id: 'urli', name: 'Decorative urli bowl', ref: 549 },
      { id: 'hanging', name: 'Brass wall hanging', ref: 399 },
    ],
  },
  {
    id: 'bags', name: 'Bags & school bags', short: 'Bags',
    clusters: ['Nangloi', 'Kolkata'], returnRate: 0.09, qualityNorm: 0.03, rtoRate: 0.15, ordersPerSkuDay: 1.0,
    variantAxes: { Capacity: ['15 L', '25 L', '35 L'], Colour: ['Black', 'Navy', 'Grey', 'Printed'] },
    types: [
      { id: 'schoolbag', name: 'School backpack', ref: 399 },
      { id: 'tote', name: 'Canvas tote bag', ref: 249 },
      { id: 'laptopbag', name: 'Laptop backpack', ref: 499 },
    ],
  },
];

// Price Truth Index gate (Round 1, slide 3).
export const GATE = {
  minGmvCr: 5,            // only sellers above ₹5 cr annual GMV are screened
  deltaThreshold: 0.08,   // a SKU "clears" when it is ≥ 8% below its comparable-set median
  skuShare: 0.6,          // a catalogue passes when ≥ 60% of live SKUs clear
  minOrdersForMedian: 10, // a SKU needs ≥ 10 delivered orders to count towards the median
};

// Day-30 decision rule (Round 1, slide 3).
export const EXPERIMENT = {
  preDays: 14,
  days: 28,
  fundLift: 0.12,         // badged NMV per live SKU must beat control by ≥ 12%
  retentionFloor: 0.7,    // ≥ 70% of badged sellers must still clear the gate at D14
  tightenedDelta: 0.1,    // the "tighten" branch re-runs at a 10% gap
  impressionCap: 0.2,     // badged listings capped at 20% of category impressions
  bootstrapIterations: 400,
  scenarios: {
    base: { label: 'Base case', trueLift: 0.21, decayShare: 0 },
    weak: { label: 'Weak lift', trueLift: 0.06, decayShare: 0 },
    decay: { label: 'Price decay', trueLift: 0.16, decayShare: 0.6 },
  },
};

// C2M Seller Health Score (0–100) and the automated rulebook.
export const HEALTH = {
  weights: { price: 0.3, velocity: 0.25, quality: 0.2, sla: 0.15, stock: 0.1 },
  cohortSize: 60,          // Round 1 plan: 60 Cohort-A manufacturers catalogued by day 60
  rampDays: 10,            // expected orders ramp time constant (days)
  p25: 0.6, p75: 1.4,      // cohort band around the median expected curve
  graduateScore: 80, graduateDays: 30,
  escalateScore: 40, escalateDays: 7,
  categoryManagerCapacity: 40, // escalations one category manager can review per month
};

export const TRIGGERS = {
  velocityCheckDays: [7, 14], velocityFloor: 0.6,
  grantImpressions: 25000, grantDays: 7, maxGrants: 2,
  driftDelta: 0.08, driftDays: 7,
  removeDelta: 0.04, removeDays: 3,
  reentryDays: 7,
  sizeFixMultiple: 1.2, // size-led returns above norm → size-chart fix (deck slide 7)
  qualityMultiple: 1.5, qualityMinDeliveries: 30, reinstateMultiple: 1.2, reinstateDays: 7,
  slaFloor: 0.9,
  stockFloor: 0.7, stockDays: 3,
  remedyCooldown: 7,
};

// Factory Direct: the deck's assumption register (deck/source/model.mjs, A8-A32) and Meesho's reported numbers.
// lib/factoryDirect.js turns these into cost per pack, batch cash and the five-year case.
export const FD = {
  makingCost: 80,          // A22 ₹ a 3-pack, cost-advantaged unit (to confirm in interviews)
  margin: 0.09,            // A23 target margin on price, B2B norm
  wholesalerMarkup: 0.15,  // A24 what a reseller pays above ex-factory
  returnFee: 150,          // A26 ₹ per customer return charged to the seller
  rtoFee: 0,               // A27 ₹ per failed delivery charged to the seller
  fees: { selfFwd: 55, selfPack: 10, nodeFwd: 42, nodeFee: 20 }, // A28 ₹ a unit; node fee = pack 6 + handle 9 + freight 5
  recovery: { self: 0.85, node: 0.9 },                            // A29 value recovered on returned and failed units
  capital: { rate: 0.18, stockDays: 45, batchDays: 10 },          // A30
  unsold: { stock: 0.10, batch: 0.02, salvage: 0.5 },             // A31
  preorderDiscount: 10,    // A32 ₹ off for 7-8 day delivery
  gate: 0.08,              // a SKU qualifies at 8% below the demand-weighted median
  buffer: 0.15,            // make confirmed orders + 15%
  advance: 0.30,           // A20 share of pre-order value advanced by the NBFC at handover
  firstLoss: 0.01,         // A20 Meesho's first-loss on advances
  prepaidShare: 0.5,       // A10 share of C2M orders placed as prepaid pre-orders
  codFailGap: 0.15,        // A11 failed-delivery gap, COD vs prepaid
  failCost: 60,            // A12 ₹ Meesho loses on a failed delivery
  incremental: 0.40,       // A8 share of C2M orders that are new to Meesho
  priceCut: 0.10,          // A9 C2M GMV per order vs Meesho average
  sellers: [200, 700, 1050, 1300, 1450],   // A3 average active sellers, Years 1-5
  yieldCr: [0.70, 1.00, 1.20, 1.425, 1.425], // A4 ₹ cr NMV per seller
  fte: [12, 20, 24, 26, 26], fteCost: 0.30,  // A14, A13
  clusters: [5, 8, 10, 12, 12], clusterCost: 1.0, // A15
  briefCost: [6, 3, 3, 3, 3],                // A16
  nodes: [6, 8, 10, 12, 12], nodeCost: 1.3,  // A17
  returnsPool: { y1: 3, share: 0.001 },      // A18
  grants: { cpm: 75, perSeller: 50000, newSellers: [450, 450, 250, 250, 100] }, // A19
  rates: [0.12, 0.15],                       // A21 discount rate; stress
};

// Meesho's own numbers (Q1 FY27 shareholders' letter): ₹531 cr contribution on 725 mn placed orders.
export const SPONSOR = { ordersQ1: 725e6, gmvQ1: 19054, nmvQ1: 11614, cmCr: 531, prepaid: 0.37, buyersMn: 274, fy26Nmv: 41560 };

// What buyers actually paid on meesho.com (team teardown, 2 Oct 2026, 56 listings per query, reviews as demand
// weights). The price check uses these real medians for these products; other products use the synthetic market.
export const TEARDOWN = {
  briefs3: { q: "Men's cotton briefs, pack of 3", median: 209, listingMedian: 322.5, n: 56 },
  socks5: { q: 'Ankle socks, pack of 5', median: 128, listingMedian: 133, n: 56 },
  bedsheet: { q: 'Double bedsheet + 2 pillow covers', median: 325, listingMedian: 404, n: 56 },
  bathtowel: { q: 'Cotton bath towel', median: 227, listingMedian: 234, n: 56 },
  tumbler6: { q: 'Steel tumblers, set of 6', median: 262, listingMedian: 415, n: 55 },
};

// Unit economics for the manufacturer price check.
export const ECONOMICS = {
  targetMarginB2B: 0.09,     // typical B2B margin the manufacturer compares against
  b2bPaymentDays: 50,        // 45–60 day distributor terms (Round 1 cohort A profile)
  settlementDays: 7,         // platform settlement after delivery
  deliveryDays: 5,
  costOfCapital: 0.18,       // annual, MSME working capital
  prepaymentShare: 0.3,      // share of confirmed pre-order value released at node handover
  preorderDiscount: 10,      // ₹ off for buyers who accept "ships in 7-8 days" (A32)
  newSellerShare: 0.06,      // share of brief demand a new badged seller can expect
  batchBuffer: 0.15,         // make confirmed pre-orders + 15% of suggested batch
};

// Batch operations (lib/operations.js): how a pre-order becomes a parcel, what is left at the node, and who pays
// when something goes wrong. These are operating rules proposed beyond the deck's costed case, and assumptions to
// confirm with factories, Valmo and the node partner. None of them changes the deck's cost per pack.
export const OPS = {
  share: 0.06,             // a new badged factory's share of its brief districts' demand (= ECONOMICS.newSellerShare)
  minRun: 500,             // pieces: "500 pieces is our preferred minimum" (factory owner, deck slide 2)
  cutoffs: { 1: [4], 2: [1, 4] }, // weekday of each pre-order cut-off, 11:59 pm (Thu; or Mon and Thu)
  makeDays: 3,             // cut, stitch, pack and QC-sample at the factory after the cut-off
  shipLagDays: 1,          // the truck arrives the evening before; the node counts it and ships next morning
  advanceAtCutoff: 0.2,    // NBFC: 20% of confirmed value when the batch locks, before fabric is cut...
  advanceAtHandover: 0.1,  // ...and 10% when the node counts the truck (A20's 30% in two parts)
  settleDays: 7,           // payout 7 days after each delivery, after the 7-day return window
  nodeShipDays: 2,         // node stock ships within 2 days
  safetyDays: 2,           // node keeps 2 days of node-stock orders as safety stock
  storagePerMonth: 1,      // ₹ a pack a month at the node (about ₹600 for a pallet of 600 packs)
  ageing: { markdownDay: 30, returnDay: 45 }, // unsold node stock: marked down at 30 days, back to the factory at 45
  lateCredit: 10,          // ₹ back on each order of a late batch, paid by whoever caused the delay
  lateRefundDays: 3,       // more than 3 days late: one-tap full refund
  qcSample: { lot: [501, 1200], n: 80, accept: 5 }, // AQL 2.5, general level II, for lots of 501-1,200
  reworkHours: 48,
  grnHours: 4,             // the node counts every truck within 4 hours
  shrinkTolerance: 0.005,  // node stock losses above 0.5% a quarter are the node partner's, at making cost
  payoutHold: 0.05,        // share of a factory's last payout held 30 days when it stops shipping
  ewayLimit: { interstate: 50000, tnIntrastate: 100000 }, // ₹; sources differ on Tamil Nadu (₹50,000-1 lakh)
  siteCapacity: 10000,     // orders a day one partner node site ships on two shifts; a third shift covers peaks
  exits: [                 // the deck's exit run-rates (slide 9)
    { label: 'Pilot · Day 90', sellers: 60, nodes: 1 },
    { label: 'Year 1 exit', sellers: 450, nodes: 6 },
    { label: 'Year 4 exit', sellers: 1400, nodes: 12 },
  ],
  // Surface transit from a Tiruppur node, days (to confirm with Valmo lane data).
  zones: [
    { id: 'A', label: 'Tamil Nadu', days: [1, 2], states: ['Tamil Nadu'] },
    { id: 'B', label: 'South', days: [2, 3], states: ['Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'] },
    { id: 'C', label: 'West & Central', days: [3, 4], states: ['Maharashtra', 'Madhya Pradesh', 'Chhattisgarh', 'Gujarat', 'Odisha'] },
    { id: 'D', label: 'North', days: [4, 6], states: ['Uttar Pradesh', 'Rajasthan', 'Delhi', 'Haryana', 'Punjab', 'Uttarakhand'] },
    { id: 'E', label: 'East', days: [5, 6], states: ['Bihar', 'Jharkhand', 'West Bengal'] },
    { id: 'F', label: 'North-East', days: [6, 8], states: ['Assam'] },
  ],
  // Return rules for innerwear, against the deck's costed case (8% returned; 85-90% of value recovered by route).
  // recovery: value recovered on a return when it differs from the route's own (null = the route's).
  returnPolicies: [
    { id: 'deck', label: 'As costed', ret: 0.08, recovery: null, note: 'Open returns, resold after grading: the deck’s case' },
    { id: 'opened', label: 'Opened, not resold', ret: 0.08, recovery: 0.1, note: 'Open returns, but opened innerwear goes to seconds at 10% of value' },
    { id: 'sealed', label: 'Sealed packs only', ret: 0.04, recovery: null, note: 'Size swaps in a sealed pack only; assumed to halve returns' },
    { id: 'none', label: 'Non-returnable', ret: 0.02, recovery: 0.5, note: 'Wrong item or defect claims only, as innerwear listings on Meesho allow' },
  ],
};

// Demand Brief geography: district, state, 3-digit pin prefix, relative weight.
export const DISTRICTS = [
  ['Lucknow', 'Uttar Pradesh', '226', 1.0], ['Kanpur', 'Uttar Pradesh', '208', 0.8],
  ['Varanasi', 'Uttar Pradesh', '221', 0.7], ['Gorakhpur', 'Uttar Pradesh', '273', 0.75],
  ['Prayagraj', 'Uttar Pradesh', '211', 0.7], ['Bareilly', 'Uttar Pradesh', '243', 0.55],
  ['Meerut', 'Uttar Pradesh', '250', 0.55], ['Aligarh', 'Uttar Pradesh', '202', 0.45],
  ['Patna', 'Bihar', '800', 0.95], ['Gaya', 'Bihar', '823', 0.5], ['Muzaffarpur', 'Bihar', '842', 0.6],
  ['Ranchi', 'Jharkhand', '834', 0.6], ['Dhanbad', 'Jharkhand', '826', 0.45],
  ['Indore', 'Madhya Pradesh', '452', 0.7], ['Jabalpur', 'Madhya Pradesh', '482', 0.5],
  ['Jaipur', 'Rajasthan', '302', 0.8], ['Jodhpur', 'Rajasthan', '342', 0.5], ['Kota', 'Rajasthan', '324', 0.4],
  ['Nagpur', 'Maharashtra', '440', 0.6], ['Nashik', 'Maharashtra', '422', 0.5], ['Aurangabad', 'Maharashtra', '431', 0.5],
  ['Raipur', 'Chhattisgarh', '492', 0.55], ['Bilaspur', 'Chhattisgarh', '495', 0.35],
  ['Bhubaneswar', 'Odisha', '751', 0.55], ['Cuttack', 'Odisha', '753', 0.4],
  ['Guwahati', 'Assam', '781', 0.6], ['Siliguri', 'West Bengal', '734', 0.45],
  ['Madurai', 'Tamil Nadu', '625', 0.5], ['Salem', 'Tamil Nadu', '636', 0.4], ['Tiruchirappalli', 'Tamil Nadu', '620', 0.4],
  ['Vijayawada', 'Andhra Pradesh', '520', 0.5], ['Warangal', 'Telangana', '506', 0.4],
  ['Hubballi', 'Karnataka', '580', 0.35], ['Kolhapur', 'Maharashtra', '416', 0.35],
  ['Dehradun', 'Uttarakhand', '248', 0.4], ['Amritsar', 'Punjab', '143', 0.45],
];

// The single manufacturer the demo follows end to end (fictional).
export const PERSONA = {
  id: 'TPR-0001',
  name: 'Kavin Knit Mills',
  owner: 'K. Senthil',
  cluster: 'Tiruppur',
  category: 'hosiery',
  type: 'briefs3',
  cohort: 'A',
  unitCost: 80,       // the deck's A22 making cost of a 3-pack
  preOrders: 1000,    // the deck's worked batch: 1,000 prepaid pre-orders (makes 1,150)
  offlineTurnoverCr: 18,
  day: 46,
};
