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
  qualityMultiple: 1.5, qualityMinDeliveries: 30, reinstateMultiple: 1.2, reinstateDays: 7,
  slaFloor: 0.9,
  stockFloor: 0.7, stockDays: 3,
  remedyCooldown: 7,
};

// Unit economics for the manufacturer price check.
export const ECONOMICS = {
  targetMarginB2B: 0.09,     // typical B2B margin the manufacturer compares against
  b2bPaymentDays: 50,        // 45–60 day distributor terms (Round 1 cohort A profile)
  settlementDays: 7,         // platform settlement after delivery
  deliveryDays: 5,
  costOfCapital: 0.18,       // annual, MSME working capital
  resaleRecovery: 0.85,      // share of returned / RTO stock that can be resold
  rtoReverseCost: 40,
  prepaymentShare: 0.3,      // share of confirmed pre-order value released at node handover
  preorderDiscount: 20,      // ₹ off for buyers who accept "ships in 7 days"
  newSellerShare: 0.06,      // share of brief demand a new badged seller can expect
  batchBuffer: 0.15,         // make confirmed pre-orders + 15% of suggested batch
  modes: {
    self: { label: 'Ship each order yourself', packing: 10, forward: 55, handling: 0, bulkFreight: 0, reversePerReturn: 90 },
    node: { label: 'Factory Node (bulk handover)', packing: 6, forward: 42, handling: 9, bulkFreight: 5, reversePerReturn: 70 },
  },
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
  unitCost: 98,
  offlineTurnoverCr: 18,
  day: 46,
};
