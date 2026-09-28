// Synthetic marketplace: sellers and live SKUs across the nine screened categories.
//
// Each seller gets a hidden archetype that decides how its prices sit against the
// market. The Price Truth Index never reads the archetype; it only sees landed
// prices and order counts, the same two things Meesho already stores. Tests use
// the archetype to check the index recovers the truth.

import { CATEGORIES, SEED } from '../config.js';
import { makeRng } from './rng.js';
import { clamp } from './format.js';

const PREFIX = [
  'Shree', 'Sri', 'Maruti', 'Laxmi', 'Om', 'Sai', 'Vishal', 'Royal', 'Supreme', 'Star', 'Bharat', 'Jai',
  'Amba', 'Anand', 'Krishna', 'Mahalaxmi', 'Balaji', 'Ganga', 'Surya', 'Navkar', 'Shiv', 'Kaveri', 'Arihant',
  'Mangal', 'Neel', 'Venkatesh', 'Annapurna', 'Ruchi', 'Siddhi', 'Tulsi', 'Kiran', 'Heera', 'Moti', 'Deep',
  'Gopal', 'Sagar', 'Vijay', 'Ashok', 'Prem', 'Nandi', 'Ekta', 'Shakti', 'Sona', 'Vardhman', 'Harsh', 'Kamal',
];
const MAKER_SUFFIX = {
  hosiery: ['Knit Mills', 'Hosiery', 'Knitwear', 'Garments'],
  hometex: ['Furnishings', 'Handloom', 'Home Textiles', 'Weaves'],
  dressmat: ['Textiles', 'Sarees', 'Fabrics', 'Silk House'],
  plastics: ['Plast', 'Polymers', 'Plastoware', 'Moulders'],
  jewellery: ['Jewels', 'Ornaments', 'Creations', 'Art Jewellery'],
  steel: ['Steel Udyog', 'Metal Works', 'Utensils', 'Steelware'],
  footwear: ['Footwear', 'Shoe Co.', 'Polymers', 'Chappals'],
  brass: ['Brass Crafts', 'Art Metal', 'Handicrafts', 'Metalware'],
  bags: ['Bag House', 'Luggage', 'Bags', 'Travel Gear'],
};
const TRADER_SUFFIX = ['Enterprises', 'Trading Co.', 'Traders', 'Distributors', 'Marketing', 'Retail'];
const TRADE_HUBS = ['Delhi', 'Surat', 'Mumbai', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Indore', 'Hyderabad'];

export const CLUSTER_CODE = {
  Tiruppur: 'TPR', Ludhiana: 'LDH', Panipat: 'PNP', Solapur: 'SLP', Erode: 'ERD', Bhiwandi: 'BHW',
  Rajkot: 'RJK', Daman: 'DMN', Coimbatore: 'CBE', Jagadhri: 'JGD', Wazirpur: 'WZP', Agra: 'AGR',
  Bahadurgarh: 'BHG', Moradabad: 'MBD', Nangloi: 'NGL', Kolkata: 'KOL', Delhi: 'DEL', Surat: 'SRT',
  Mumbai: 'MUM', Jaipur: 'JAI', Ahmedabad: 'AMD', Indore: 'IDR', Hyderabad: 'HYD',
};

// How each archetype prices against the market. `mu` is the centre of its SKU
// price gaps (positive = cheaper than market), `sd` the spread across SKUs.
const ARCHETYPES = {
  manufacturer: { gmv: [14, 0.55, 5.2, 60], mu: [0.1, 0.17], sd: 0.035, maker: true },
  thin: { gmv: [9, 0.4, 5.1, 30], mu: [0.045, 0.075], sd: 0.04, maker: true },
  trader: { gmv: [18, 0.6, 5.5, 80], mu: [-0.05, 0.03], sd: 0.035, maker: false },
  lossleader: { gmv: [10, 0.5, 5.1, 40], mu: [-0.02, 0.02], sd: 0.03, maker: false },
  promo: { gmv: [9, 0.45, 5.1, 35], mu: [0.1, 0.14], sd: 0.03, maker: true },
  small: { gmv: null, mu: [-0.06, 0.04], sd: 0.045, maker: true },
};
const BASE_MIX = { manufacturer: 6, thin: 2, trader: 9, lossleader: 2, promo: 1, small: 9 };

function uniqueName(rng, used, suffixes) {
  for (let i = 0; i < 50; i++) {
    const name = `${rng.pick(PREFIX)} ${rng.pick(suffixes)}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  const name = `${rng.pick(PREFIX)} ${rng.pick(PREFIX)} ${rng.pick(suffixes)}`;
  used.add(name);
  return name;
}

export function generateMarket(seed = SEED) {
  const rng = makeRng(seed);
  const used = new Set();
  const idCounter = {};
  const sellers = [];

  for (const cat of CATEGORIES) {
    // Categories differ in how many real manufacturers they hold.
    const shift = rng.int(-2, 2);
    const mix = { ...BASE_MIX, manufacturer: BASE_MIX.manufacturer + shift, trader: BASE_MIX.trader - shift };
    const plan = rng.shuffle(Object.entries(mix).flatMap(([a, n]) => Array(n).fill(a)));

    for (const archetype of plan) {
      const spec = ARCHETYPES[archetype];
      const isTraderName = !spec.maker && rng.chance(0.65);
      const location = spec.maker ? rng.pick(cat.clusters) : rng.pick(TRADE_HUBS);
      const code = CLUSTER_CODE[location] ?? 'IND';
      idCounter[code] = (idCounter[code] ?? 100) + 1;

      const gmvCr = spec.gmv
        ? clamp(rng.lognormal(spec.gmv[0], spec.gmv[1]), spec.gmv[2], spec.gmv[3])
        : rng.uniform(0.4, 4.8);
      const skuCount = spec.gmv
        ? clamp(Math.round(8 + 3 * Math.sqrt(gmvCr) + rng.normal(0, 3)), 6, 48)
        : rng.int(4, 15);
      const mu = rng.uniform(...spec.mu);
      const types = rng.shuffle(cat.types).slice(0, rng.int(1, Math.min(3, cat.types.length)));

      const seller = {
        id: `${code}-${String(idCounter[code]).padStart(4, '0')}`,
        name: uniqueName(rng, used, isTraderName ? TRADER_SUFFIX : MAKER_SUFFIX[cat.id]),
        category: cat.id,
        location,
        inCluster: cat.clusters.includes(location),
        archetype,
        gmvCr,
        rtoRate: cat.rtoRate * rng.uniform(0.8, 1.25),
        // Natural drift in the catalogue price gap by day 14 (promotions end).
        drift14: archetype === 'promo' ? -rng.uniform(0.06, 0.1) : rng.normal(0, 0.008),
        skus: [],
      };

      const deepCount = archetype === 'lossleader' ? rng.int(2, 3) : 0;
      // C2M penetration is low: manufacturer listings are newer, carry fewer
      // ratings and rank lower, so they sell about half as much per SKU.
      const volume = spec.maker ? 0.5 : 1;
      for (let i = 0; i < skuCount; i++) {
        const type = rng.pick(types);
        const gap = i < deepCount ? rng.uniform(0.22, 0.34) : rng.normal(mu, spec.sd);
        const orders30 = Math.max(2, Math.round(
          clamp(rng.lognormal(12 + gmvCr * 2.5, 0.7), 2, 1500) * volume * (i < deepCount ? 3 : 1),
        ));
        seller.skus.push({
          id: `${seller.id}-${String(i + 1).padStart(2, '0')}`,
          type: type.id,
          typeName: type.name,
          landed: Math.round(type.ref * (1 - gap)),
          orders30,
          live: rng.chance(0.94),
        });
      }
      sellers.push(seller);
    }
  }
  return { sellers };
}

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const typeById = Object.fromEntries(
  CATEGORIES.flatMap((c) => c.types.map((t) => [t.id, { ...t, category: c.id }])),
);
