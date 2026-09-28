// Round 2 deck generator: Meesho DICE S3 Business Track, C2M.
// Every prototype number is computed from the prototype's own model so the deck and the app never disagree.
import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');

const HERE = path.dirname(new URL(import.meta.url).pathname);
const A = (f) => path.join(HERE, 'assets', f);
const I = (n, c = 'w') => A(`icons/${n}_${c}.png`);
const OUT = process.argv[2] ?? path.join(HERE, 'out', 'meesho_dice_round2.pptx');

// Never overwrite the current deck without first saving it to ../old (see snapshot.sh).
const DECK_MAIN = path.resolve(HERE, '../meesho_dice_round2.pptx');
if (path.resolve(OUT) === DECK_MAIN && require('fs').existsSync(DECK_MAIN)) {
  require('child_process').execFileSync('bash', [path.join(HERE, 'snapshot.sh'), 'rebuilt with build.mjs'], { stdio: 'inherit' });
}

// ---------- live numbers from the prototype model ----------
const P = path.resolve(HERE, '../../prototype/src');
const { GATE, PERSONA, ECONOMICS, HEALTH } = await import(`${P}/config.js`);
const { generateMarket, categoryById } = await import(`${P}/lib/generate.js`);
const { runPTI } = await import(`${P}/lib/pti.js`);
const { runExperiment } = await import(`${P}/lib/experiment.js`);
const { generateCohort, cohortSummary } = await import(`${P}/lib/health.js`);
const { priceCheck, cashCycle } = await import(`${P}/lib/economics.js`);
const { demandBrief, batchPlan } = await import(`${P}/lib/demand.js`);

const market = generateMarket();
const pti = runPTI(market, GATE);
const exp = Object.fromEntries(['base', 'weak', 'decay'].map((k) => [k, runExperiment(pti, GATE, k)]));
const cohort = generateCohort();
const hs = cohortSummary(cohort);
const persona = cohort.find((s) => s.persona);
const node = priceCheck({ unitCost: PERSONA.unitCost, category: PERSONA.category, typeId: PERSONA.type, mode: 'node', margin: ECONOMICS.targetMarginB2B, medians: pti.medians });
const self = priceCheck({ unitCost: PERSONA.unitCost, category: PERSONA.category, typeId: PERSONA.type, mode: 'self', margin: ECONOMICS.targetMarginB2B, medians: pti.medians });
const brief = demandBrief({ typeId: PERSONA.type, marketMedian: node.marketMedian });
const batch = batchPlan({ brief, listingPrice: node.suggested, minViablePrice: node.floor });
const cash = cashCycle();
const skuCount = market.sellers.reduce((n, s) => n + s.skus.length, 0);
const grant = persona.events.find((e) => e.rule === 'grant');

const n0 = (x) => Math.round(x).toLocaleString('en-IN');
const p0 = (x) => `${Math.round(x * 100)}%`;
const p1 = (x) => `${(x * 100).toFixed(1)}%`;
const sp1 = (x) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(1)}%`;
const cr = (x) => `₹${x >= 100 ? n0(x) : x.toFixed(x >= 10 ? 0 : 1)} cr`;

// ---------- sizing economics (Round 1 anchors, stated formulas) ----------
const FY26_NMV = 41560;
const Y4_NMV = 1995;
const PER_SELLER = Y4_NMV / 1400;
const LADDER = [
  { label: 'Pilot · Day 90', clusters: '2', nodes: '1', sellers: 60 },
  { label: 'Scale · Q2+', clusters: '5', nodes: '6', sellers: 450 },
  { label: 'Target · Year 4', clusters: '12', nodes: '12', sellers: 1400 },
].map((r) => {
  const nmv = r.sellers * PER_SELLER;
  return { ...r, nmv, share: nmv / FY26_NMV, save8: nmv * 0.08 / 0.92, save12: nmv * 0.12 / 0.88, cm: nmv * 0.04 };
});
const retMath = (r, R) => (r * R) / (1 - r);

// ---------- palette and type ----------
const C = {
  plum: '560547', plum2: '6E1251', plum3: '8A245E', tint: 'F2E4EE', tint2: 'E0CEDA', ink: '2B1226', muted: '7A6470',
  cream: 'FFF3D8', orange: 'FF9D00', white: 'FFFFFF', grey: 'F7F3F6',
  green: '1E8E5A', greenT: 'E2F2E9', amber: 'D68200', amberT: 'FCEFD6', red: 'C0392B', redT: 'F8E0DC',
};
const F = { body: 'Calibri', head: 'Arial' };
const TABS = ['SEGMENTATION', 'MARKET SIZING', 'PRICE SCREEN', 'ONBOARDING', 'SCALE-UP', 'METRICS & KPIs', 'ROADMAP', 'RISKS & GUARDRAILS', 'OPERATING MODEL', 'PROTOTYPE'];

const pres = new pptxgen();
pres.defineLayout({ name: 'DICE20', width: 20, height: 11.25 });
pres.layout = 'DICE20';
pres.author = 'Team 23B0747 · IIT Bombay';
pres.title = "Building Meesho's C2M Base · DICE S3 Round 2";
const SH = pres.shapes;

// ---------- primitives ----------
function txt(s, text, x, y, w, h, o = {}) {
  s.addText(text, {
    x, y, w, h, isTextBox: true, fit: 'none', margin: o.margin ?? 0,
    fontFace: o.face ?? F.body, fontSize: o.size ?? 12, color: o.color ?? C.ink, bold: !!o.bold, italic: !!o.italic,
    align: o.align ?? 'left', valign: o.valign ?? 'top', rotate: o.rotate, charSpacing: o.cs,
    lineSpacingMultiple: o.lsm ?? 1.0, paraSpaceAfter: o.psa ?? 0,
  });
}
const R = (text, o = {}) => ({ text, options: { ...o } });
const BR = (text, o = {}) => ({ text, options: { ...o, breakLine: true } });

function box(s, x, y, w, h, fill, line = null, round = 0) {
  s.addShape(round ? SH.ROUNDED_RECTANGLE : SH.RECTANGLE, {
    x, y, w, h, fill: { color: fill }, line: { color: line ?? fill, width: line ? 0.75 : 0 },
    ...(round ? { rectRadius: round } : {}),
  });
}

function panel(s, x, y, w, h, title, o = {}) {
  const hh = o.hh ?? 0.36;
  box(s, x, y, w, h, o.fill ?? C.white, C.tint2);
  box(s, x, y, w, hh, o.head ?? C.plum);
  if (o.icon) s.addImage({ path: I(o.icon, 'w'), x: x + 0.12, y: y + 0.07, w: hh - 0.14, h: hh - 0.14 });
  const tx = x + (o.icon ? hh + 0.06 : 0.14);
  txt(s, title, tx, y, w - (tx - x) - 0.14, hh, { face: F.head, bold: true, size: o.hs ?? 12.5, color: C.white, valign: 'middle' });
  if (o.tag) txt(s, o.tag, x + w - 4.2, y, 4.06, hh, { size: 10.5, italic: true, color: 'F3D6E6', align: 'right', valign: 'middle' });
  return { x: x + 0.14, y: y + hh + 0.1, w: w - 0.28, h: h - hh - 0.18 };
}

function kpi(s, x, y, w, h, value, label, o = {}) {
  box(s, x, y, w, h, o.fill ?? C.tint, null);
  txt(s, value, x + 0.12, y + 0.06, w - 0.24, h * 0.52, { face: F.head, bold: true, size: o.vs ?? 22, color: o.vc ?? C.plum, valign: 'middle' });
  txt(s, label, x + 0.12, y + h * 0.55, w - 0.24, h * 0.42, { size: o.ls ?? 11, color: C.ink, valign: 'top' });
}

function chip(s, x, y, w, h, text, fill, color = C.white, size = 10.5) {
  box(s, x, y, w, h, fill, null, 0.06);
  txt(s, text, x, y, w, h, { size, bold: true, color, align: 'center', valign: 'middle', face: F.head });
}

function iconDot(s, name, x, y, d, fill = C.plum, variant = 'w') {
  s.addShape(SH.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 } });
  const pad = d * 0.24;
  s.addImage({ path: I(name, variant), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad });
}

function arrow(s, x1, y1, x2, y2, color = C.plum3, dash = 'dash', width = 1.25) {
  const flipH = x2 < x1, flipV = y2 < y1;
  s.addShape(SH.LINE, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001),
    flipH, flipV, line: { color, width, dashType: dash, endArrowType: 'triangle' },
  });
}
function line(s, x1, y1, x2, y2, color = C.tint2, width = 1) {
  s.addShape(SH.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001), flipH: x2 < x1, flipV: y2 < y1, line: { color, width } });
}

const imgDims = {};
async function dims(f) { if (!imgDims[f]) { const m = await sharp(A(f)).metadata(); imgDims[f] = [m.width, m.height]; } return imgDims[f]; }
async function fit(s, f, x, y, w, h, align = 'center', valign = 'top') {
  const [pw, ph] = await dims(f);
  let iw = w, ih = (w * ph) / pw;
  if (ih > h) { ih = h; iw = (h * pw) / ph; }
  const ix = align === 'left' ? x : align === 'right' ? x + w - iw : x + (w - iw) / 2;
  const iy = valign === 'middle' ? y + (h - ih) / 2 : valign === 'bottom' ? y + h - ih : y;
  box(s, ix - 0.01, iy - 0.01, iw + 0.02, ih + 0.02, C.white, C.tint2); // hairline frame
  s.addImage({ path: A(f), x: ix, y: iy, w: iw, h: ih });
  return { x: ix, y: iy, w: iw, h: ih };
}

// table: rows = array of arrays of cells; a cell is a string or {t, fill, color, bold, align, size}
function table(s, rows, x, y, w, colW, o = {}) {
  const head = o.head ?? true;
  const data = rows.map((r, ri) => r.map((c) => {
    const cell = typeof c === 'object' && c !== null ? c : { t: String(c) };
    const isHead = head && ri === 0;
    return {
      text: cell.t,
      options: {
        fill: { color: cell.fill ?? (isHead ? (o.headFill ?? C.plum3) : (o.zebra && ri % 2 === 0 ? C.grey : C.white)) },
        color: cell.color ?? (isHead ? C.white : C.ink),
        bold: cell.bold ?? isHead,
        align: cell.align ?? (o.align ?? 'left'),
        valign: 'middle',
        fontSize: cell.size ?? (isHead ? (o.hsize ?? o.size ?? 11) : (o.size ?? 11)),
        fontFace: isHead ? F.head : F.body,
        margin: [2, 5, 2, 5],
      },
    };
  }));
  s.addTable(data, {
    x, y, w, colW, rowH: o.rowH ?? 0.28, autoPage: false,
    border: { type: 'solid', pt: 0.5, color: C.tint2 },
  });
}
const mark = (m) => ({
  y: { t: '✓', fill: C.greenT, color: C.green, bold: true, align: 'center' },
  a: { t: '–', fill: C.amberT, color: C.amber, bold: true, align: 'center' },
  x: { t: '✕', fill: C.redT, color: C.red, bold: true, align: 'center' },
  n: { t: '', align: 'center' },
}[m]);
const sev = (v) => ({
  HIGH: { t: 'HIGH', fill: C.redT, color: C.red, bold: true, align: 'center' },
  MED: { t: 'MED', fill: C.amberT, color: C.amber, bold: true, align: 'center' },
  LOW: { t: 'LOW', fill: C.greenT, color: C.green, bold: true, align: 'center' },
  YES: { t: 'YES', color: C.green, bold: true, align: 'center' },
  PART: { t: 'PART', color: C.amber, bold: true, align: 'center' },
}[v]);

// ---------- slide frame ----------
const BODY = { x: 0.82, y: 1.56, w: 18.93, bottom: 9.9 };
function frame(idx, rail, question, band, source, notes) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  box(s, 0, 0, 20, 0.95, C.cream);
  s.addImage({ path: A('dice_logo.png'), x: 0.3, y: 0.1, w: 1.51, h: 0.75 });
  s.addImage({ path: A('header_stripes.png'), x: 20 - 1.806, y: 0, w: 1.806, h: 0.95 });
  const tabW = (16.0 - (TABS.length - 1) * 0.06) / TABS.length;
  TABS.forEach((t, i) => {
    const x = 2.0 + i * (tabW + 0.06), on = i === idx;
    box(s, x, 0.2, tabW, 0.55, on ? C.plum : C.white, on ? C.plum : C.tint2, 0.08);
    txt(s, `${i + 1} · ${t}`, x + 0.04, 0.2, tabW - 0.08, 0.55, { face: F.head, bold: true, size: 9.5, color: on ? C.white : C.plum2, align: 'center', valign: 'middle' });
  });
  box(s, 0.25, 1.08, 0.42, 8.84, C.plum2);
  txt(s, rail, 0.46 - 4.42, 1.08 + 4.42 - 0.21, 8.84, 0.42, { face: F.head, bold: true, size: 12, color: C.white, align: 'center', valign: 'middle', rotate: 270, cs: 3 });
  txt(s, question, 0.82, 1.06, 18.93, 0.42, { face: F.head, bold: true, size: 17, color: C.plum, valign: 'middle' });
  if (source) txt(s, source, 0.82, 9.95, 18.93, 0.28, { size: 10, italic: true, color: C.muted, valign: 'middle' });
  box(s, 0.25, 10.28, 19.5, 0.66, C.plum);
  box(s, 0.45, 10.49, 0.24, 0.24, C.orange);
  txt(s, band, 0.88, 10.28, 18.72, 0.66, { face: F.head, bold: true, size: 14, color: C.white, valign: 'middle' });
  s.addImage({ path: A('footer_stripe.png'), x: 0, y: 11.03, w: 20, h: 0.22 });
  if (notes) s.addNotes(notes);
  return s;
}

// =====================================================================
// COVER
// =====================================================================
{
  const s = pres.addSlide();
  s.addImage({ path: A('cover_banner.png'), x: 0, y: 0, w: 20, h: 11.25, sizing: { type: 'cover', w: 20, h: 11.25 } });
  s.addShape(SH.RECTANGLE, { x: 2.3, y: 6.05, w: 15.4, h: 4.75, fill: { color: 'FFF8F2', transparency: 8 }, line: { color: 'FFFFFF', width: 0 } });
  txt(s, 'BUSINESS TRACK  ·  DETAILED SUBMISSION ROUND  ·  8–10 SLIDE DECK + WORKING PROTOTYPE', 2.3, 6.3, 15.4, 0.4, { face: F.head, bold: true, size: 13, color: 'C2185B', align: 'center', cs: 1 });
  txt(s, "Building Meesho's Consumer-to-Manufacturer (C2M) Base", 2.3, 6.8, 15.4, 0.8, { face: F.head, bold: true, size: 34, color: C.plum, align: 'center', valign: 'middle' });
  txt(s, 'Screen on price, not scale. Pay for early conviction in impressions, not rupees. Make nothing until it is sold.', 2.3, 7.65, 15.4, 0.5, { size: 17, italic: true, color: C.ink, align: 'center' });
  box(s, 9.25, 8.35, 1.5, 0.07, C.orange);
  txt(s, 'Team 23B0747  ·  Indian Institute of Technology Bombay', 3.0, 8.6, 11.0, 0.45, { face: F.head, bold: true, size: 16, color: C.ink, align: 'center' });
  txt(s, 'Prathmesh Walimbe  ·  Krishna Kanta Mondal', 3.0, 9.08, 11.0, 0.4, { size: 15, color: C.muted, align: 'center' });
  txt(s, [R('Live prototype  ', { bold: true, color: C.plum }), R('meesho-dice-c2m-iitb.vercel.app', { color: C.plum3, underline: { style: 'sng' }, hyperlink: { url: 'https://meesho-dice-c2m-iitb.vercel.app/' } })], 3.0, 9.6, 11.0, 0.4, { size: 14, align: 'center' });
  s.addImage({ path: A('qr_live.png'), x: 15.05, y: 8.5, w: 1.75, h: 1.75 });
  txt(s, 'Scan to open', 15.05, 10.27, 1.75, 0.3, { size: 10.5, color: C.muted, align: 'center' });
  s.addNotes('Cover. Team 23B0747, IIT Bombay. The deck answers the four questions in the brief across nine sections; the live prototype runs every rule on synthetic data.');
}

// =====================================================================
// 1 · SEGMENT
// =====================================================================
{
  const s = frame(0, 'WHO, AND WHY NOT',
    'Q1 · Manufacturer segmentation · Which cohorts do we go after first, and what stops each of them?',
    'Start with Cohort A in Tiruppur and Panipat: its barriers are operational, and operational barriers are the only ones Meesho can remove with infrastructure instead of subsidy.',
    'Sources: Meesho FY26 results and Q4 FY26 earnings call (6 May 2026); Flipkart newsroom (8 Jul 2026); Udyam Registration Portal; The Federal, Deccan Herald (Tiruppur, 2025–26); team interviews (n = 24). Cohort shares of the 11,645 addressable base.',
    'Cohorts come from 24 manufacturer interviews (8 per cohort). Barrier severity is scored from the objection set. Contribution margin shown is the Q4 FY26 exit rate that management called the new baseline; Q3 was 2.3% because of a one-time logistics disruption.');
  const k = [
    ['₹41,560 cr', 'FY26 NMV, +39% YoY'], ['₹265', 'FY26 AOV, down 3% YoY'], ['4.0%', 'Contribution margin, Q4 FY26 exit (2.3% in Q3)'],
    ['9.6 lakh', 'Transacting sellers, +87% YoY'], ['0%', 'Commission, now matched: Flipkart fashion at every price (8 Jul 2026)'], ['264 mn', 'Annual transacting users, +33%'],
  ];
  const kw = (BODY.w - 5 * 0.14) / 6;
  k.forEach(([v, l], i) => kpi(s, BODY.x + i * (kw + 0.14), 1.56, kw, 0.82, v, l, { vs: 20, ls: 10.5 }));

  // cohort cards
  const cards = [
    { k: 'A', t: 'Offline-only, B2B bulk', share: '72%', firms: '≈ 8,400 firms', icon: 'FaIndustry',
      rows: [['Profile', 'Made to order, distributor-fed, zero returns, 45–60 day terms'], ['Barrier', 'No unit-level ops; build-to-stock is a balance-sheet change'], ['Motivation', 'Idle capacity; export shock (US tariff 50%, Aug–Dec 2025)'], ['Lever', 'Factory Node + demand-confirmed batches'], ['Reach', 'Cluster associations (e.g., Tiruppur Exporters’ Association), 40–60 factories a drive']] },
    { k: 'B', t: 'Online, active elsewhere', share: '19%', firms: '≈ 2,200 firms', icon: 'FaGlobe',
      rows: [['Profile', 'On Amazon, Flipkart or own D2C; GST and catalogue done'], ['Barrier', '₹800+ basket catalogue loses money at a ₹265 AOV'], ['Motivation', '264 mn buyers and a Tier-2+ base it cannot reach elsewhere'], ['Lever', 'Price check + value-tier catalogue, not a discount'], ['Reach', 'Price-check link via seller agencies and associations; no cold sales calls']] },
    { k: 'C', t: 'Churned from Meesho', share: '9%', firms: '≈ 1,050 firms', icon: 'FaUserClock',
      rows: [['Profile', 'Listed, exited inside two quarters; catalogue dormant'], ['Barrier', 'Weak first 30 orders, then an RTO or returns shock'], ['Motivation', 'Sunk catalogue cost; KYC and price history already exist'], ['Lever', 'Returns firewall + health-score re-entry'], ['Reach', 'Meesho’s own dormant-seller list; one WhatsApp re-invite, KYC already on file']] },
  ];
  const cy = 2.5, ch = 4.22, cw = 3.72;
  cards.forEach((c, i) => {
    const x = BODY.x + i * (cw + 0.14);
    const b = panel(s, x, cy, cw, ch, `COHORT ${c.k} · ${c.t}`, { icon: c.icon, hs: 11.5 });
    txt(s, c.share, b.x, b.y - 0.04, 1.4, 0.5, { face: F.head, bold: true, size: 26, color: C.plum });
    txt(s, [BR('of 11,645', { color: C.muted, size: 10.5 }), R(c.firms, { bold: true, size: 11.5 })], b.x + 1.45, b.y + 0.04, b.w - 1.45, 0.55);
    let yy = b.y + 0.52;
    c.rows.forEach(([h, v]) => {
      const lever = h === 'Lever';
      if (lever) box(s, b.x - 0.04, yy - 0.03, b.w + 0.08, 0.6, C.cream);
      txt(s, h.toUpperCase(), b.x, yy, b.w, 0.2, { face: F.head, bold: true, size: 9.5, color: lever ? C.amber : C.plum3, cs: 1 });
      txt(s, v, b.x, yy + 0.19, b.w, 0.4, { size: 11, bold: lever, color: C.ink });
      yy += 0.61;
    });
  });

  // barrier matrix
  const mx = BODY.x + 3 * (cw + 0.14);
  const mw = BODY.x + BODY.w - mx;
  const mb = panel(s, mx, cy, mw, ch, 'BARRIER SEVERITY × COHORT', { tag: 'from the 24-interview objection set' });
  table(s, [
    ['Barrier', 'A', 'B', 'C', 'Meesho can fix'],
    ['Unit-level fulfilment', sev('HIGH'), sev('LOW'), sev('MED'), sev('YES')],
    ['Inventory risk, build-to-stock', sev('HIGH'), sev('MED'), sev('HIGH'), sev('YES')],
    ['Returns and RTO exposure', sev('HIGH'), sev('MED'), sev('HIGH'), sev('YES')],
    ['Unproven demand', sev('HIGH'), sev('MED'), sev('HIGH'), sev('YES')],
    ['Cash cycle, settlement lag', sev('MED'), sev('LOW'), sev('MED'), sev('PART')],
    ['Channel conflict, brand dilution', sev('HIGH'), sev('HIGH'), sev('LOW'), sev('PART')],
  ], mb.x, mb.y, mb.w, [mb.w - 3.55, 0.75, 0.75, 0.75, 1.3], { rowH: 0.36, size: 11.5 });
  txt(s, [R('Four of six barriers are HIGH for Cohort A and all four are fixable with infrastructure. ', { bold: true }), R('Brand dilution at a ₹265 AOV is not fixable, which is why Cohort B gets a separate value-tier catalogue rather than a discount.')],
    mb.x, mb.y + 2.72, mb.w, 0.75, { size: 11.5, color: C.ink });

  // bottom row
  const by = 6.86, bh = 3.0;
  const w1 = 7.3, w2 = 6.0, w3 = BODY.w - w1 - w2 - 0.28;
  const e = panel(s, BODY.x, by, w1, bh, 'FIELD EVIDENCE · TIRUPPUR, THE PILOT CLUSTER', { icon: 'FaMagnifyingGlassChart' });
  const ev = [['3,200', 'knitwear manufacturers'], ['₹74,747 cr', 'FY26 output; ₹44,747 cr exported, ≈₹30,000 cr domestic'], ['−60 to −70%', 'US orders under the 50% tariff, Aug–Dec 2025'], ['750–1,000', 'units shut; tariff now 18%, plus an India–EU trade deal']];
  ev.forEach(([v, l], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = e.x + col * (e.w / 2), y = e.y + row * 0.95;
    txt(s, v, x, y, e.w / 2 - 0.1, 0.45, { face: F.head, bold: true, size: 20, color: C.plum });
    txt(s, l, x, y + 0.45, e.w / 2 - 0.15, 0.5, { size: 11, color: C.ink });
  });
  txt(s, [R('So what: ', { bold: true, color: C.plum }), R('the export shock proved the motivation, and the rollback is closing the window. Pilot now, and sell C2M as a permanent hedge, not a rescue.')], e.x, e.y + 1.93, e.w, 0.55, { size: 11.5 });

  const r = panel(s, BODY.x + w1 + 0.14, by, w2, bh, 'RESEARCH DESIGN · METHODS, COVERAGE', { icon: 'FaFlask' });
  table(s, [
    ['Method', 'n', 'Output'],
    ['Manufacturer interviews, 3 cohorts', '8 each', 'Objection set, barrier grid'],
    ['Cluster walk-throughs', '2', 'Cost Ownership Index'],
    ['Platform teardown: fees, feed, panel', '4 cats', 'Landed-price medians'],
    ['Filings, earnings calls, Udyam, cluster studies', '15+', 'FY26 baseline, addressable base'],
    ['Global C2M teardowns', '7 · 5 mkts', 'Copy / avoid library'],
    ['Round 2 fact-check: results, earnings call, Reuters, trade press', '20+', 'Corrected margin, precedents'],
    [`Prototype simulation (synthetic, seeded)`, `${market.sellers.length} · ${n0(skuCount)} SKUs`, 'Rules tested end to end'],
  ], r.x, r.y, r.w, [2.75, 1.15, r.w - 3.9], { rowH: 0.28, size: 10.5 });

  const nn = panel(s, BODY.x + w1 + w2 + 0.28, by, w3, bh, 'DELIBERATELY NOT NOW', { head: C.plum3, icon: 'FaScaleUnbalanced' });
  txt(s, [
    BR('Fashion-led ethnic wear, Surat', { bold: true, color: C.red }),
    BR('India’s largest textile cluster (₹1 lakh cr+) ranks last on our cluster AHP (3.28): traders job out weaving, dyeing and stitching, and it sits in the worst return band.', { size: 11 }),
    BR(' ', { size: 6 }),
    BR('Electronics accessories, import-assembly', { bold: true, color: C.red }),
    R('No cost ownership, so any price gap has to be funded, and a funded gap is a subsidy with a different name.', { size: 11 }),
  ], nn.x, nn.y, nn.w, nn.h, { size: 11.5 });
}

// =====================================================================
// 2 · SIZE
// =====================================================================
{
  const s = frame(1, 'HOW BIG, HOW CHEAP',
    'Q2 · Market sizing and opportunity · How big is the base, and what does closing the price gap do for buyers and NMV?',
    `11,645 manufacturers in 12 clusters can carry a real price gap. Capturing 12% by Year 4 adds ${cr(Y4_NMV)} of NMV priced at least 8% below today’s market: ${cr(LADDER[2].save8)} to ${cr(LADDER[2].save12)} a year back to buyers.`,
    'Sources: Udyam Registration Portal (team pull; 7.83 cr incl. Udyam Assist, PIB Feb 2026); Meesho FY26 results; Flipkart, Amazon, Business Standard, Outlook Business (2025–26); Round 1 cluster AHP and teardown. Run-rate NMV assumes the Round 1 Year-4 yield of ₹1.43 cr per seller.',
    'Funnel and AHP are Round 1 research. Price impact uses a stated formula: savings = NMV × g / (1 − g), with g between the 8% gate floor and 12%, the low end of the 12–18% integration cost edge from the Round 1 teardown.');

  // funnel
  const fx = BODY.x, fw = 6.1, fy = 1.56, fh = 8.3;
  const f = panel(s, fx, fy, fw, fh, 'ADDRESSABLE BASE · BOTTOM-UP', { icon: 'FaIndustry' });
  const steps = [
    ['4.72 cr', 'Udyam-registered MSMEs, 98.9% micro', ''],
    ['5.28 lakh', 'above micro (small + medium)', '1.1%'],
    ['1.85 lakh', 'in manufacturing', '35%'],
    ['55,451', 'making Meesho’s categories', '30%'],
    ['19,408', 'own ≥ 3 of 4 cost levers (COI)', '35%'],
    ['11,645', 'inside the 12 screened clusters', '60%'],
    ['1,400', 'active C2M sellers by Year 4', '12%'],
  ];
  const stepH = 0.86, gap = 0.12;
  steps.forEach(([v, l, pctv], i) => {
    const wv = f.w - i * 0.26, x = f.x + (f.w - wv) / 2, y = f.y + i * (stepH + gap);
    const last = i === steps.length - 1;
    const fill = last ? C.orange : ['560547', '63104F', '6E1251', '7A1A58', '8A245E', '9A3A70', 'FF9D00'][i];
    box(s, x, y, wv, stepH, fill, null, 0.05);
    txt(s, v, x + 0.12, y, 1.55, stepH, { face: F.head, bold: true, size: 17, color: last ? C.plum : C.white, valign: 'middle' });
    txt(s, l, x + 1.7, y, wv - 2.35, stepH, { size: 11.5, color: last ? C.plum : C.white, valign: 'middle', bold: last });
    if (pctv) txt(s, pctv, x + wv - 0.7, y, 0.6, stepH, { face: F.head, bold: true, size: 11, color: last ? C.plum : 'F7C9E0', align: 'right', valign: 'middle' });
  });
  txt(s, 'Right-hand figure = conversion from the row above. COI = Cost Ownership Index: raw material, production, scale, automation.', f.x, f.y + 7 * (stepH + gap) + 0.02, f.w, 0.45, { size: 10.5, italic: true, color: C.muted });

  // ladder table
  const lx = fx + fw + 0.14, lw = 6.9;
  const l = panel(s, lx, 1.56, lw, 4.55, 'OPPORTUNITY LADDER · PRICE AND NMV IMPACT', { icon: 'FaRocket' });
  const L = LADDER;
  table(s, [
    ['', ...L.map((r) => r.label)],
    ['Clusters · Factory Nodes', ...L.map((r) => `${r.clusters} · ${r.nodes}`)],
    ['Active C2M sellers', ...L.map((r) => n0(r.sellers))],
    ['Run-rate NMV', ...L.map((r) => ({ t: cr(r.nmv), bold: true }))],
    ['Share of FY26 NMV', ...L.map((r) => p1(r.share))],
    [{ t: 'Buyer savings / yr, gap 8–12%', bold: true, color: C.plum }, ...L.map((r) => ({ t: `${cr(r.save8).replace(' cr', '')}–${cr(r.save12)}`, bold: true, color: C.plum, fill: C.tint }))],
    ['Contribution at 4.0% CM', ...L.map((r) => cr(r.cm))],
  ], l.x, l.y, l.w, [2.35, (l.w - 2.35) / 3, (l.w - 2.35) / 3, (l.w - 2.35) / 3], { rowH: 0.44, size: 11.5, align: 'left' });
  txt(s, [R('Buyer savings = NMV × g ÷ (1 − g)', { bold: true, color: C.plum }), R('  ·  g from the 8% gate floor to 12%, the low end of the 12–18% cost edge integration buys. Contribution uses the 4.0% Q4 FY26 exit rate.')],
    l.x, l.y + 3.2, l.w, 0.72, { size: 11 });

  const hl = [[p1(L[2].share), 'of FY26 NMV becomes structurally cheaper'], [`${cr(L[2].save8).replace(' cr', '')}–${n0(L[2].save12)}`, '₹ cr a year returned to buyers'], [cr(L[2].cm), 'contribution a year at today’s margin']];
  const hw = (lw - 0.28) / 3;
  hl.forEach(([v, t], i) => kpi(s, lx + i * (hw + 0.14), 6.25, hw, 1.2, v, t, { vs: 22, ls: 10.5, fill: C.cream }));

  // why now timeline
  const wy = 7.6, wh = 2.26;
  const wn = panel(s, lx, wy, lw, wh, 'WHY NOW · THE RATE-CARD MOAT IS GONE', { icon: 'FaBolt', head: C.plum3 });
  const tl = [['Apr 2025', 'Amazon: no referral fee < ₹300'], ['Nov 2025', 'Flipkart: 0% < ₹1,000; Shopsy 0%'], ['Nov 2025', 'Amazon: 0% referral < ₹1,000'], ['Mar 2026', 'Amazon expands zero fees'], ['8 Jul 2026', 'Flipkart: 0% on all fashion, any price']];
  const tw = wn.w / tl.length;
  line(s, wn.x + 0.1, wn.y + 0.34, wn.x + wn.w - 0.1, wn.y + 0.34, C.plum3, 1.5);
  tl.forEach(([d, t], i) => {
    const x = wn.x + i * tw;
    s.addShape(SH.OVAL, { x: x + tw / 2 - 0.09, y: wn.y + 0.25, w: 0.18, h: 0.18, fill: { color: i === tl.length - 1 ? C.red : C.plum3 }, line: { color: C.white, width: 1.5 } });
    txt(s, d, x, wn.y, tw, 0.22, { face: F.head, bold: true, size: 10, color: C.plum, align: 'center' });
    txt(s, t, x + 0.04, wn.y + 0.5, tw - 0.08, 0.62, { size: 10.5, align: 'center', color: C.ink });
  });
  txt(s, [R('Fees converge to zero. ', { bold: true, color: C.red }), R('The only price advantage a competitor’s rate card cannot copy is a cost-structure advantage.')], wn.x, wn.y + 1.2, wn.w, 0.45, { size: 11.5 });

  // AHP
  const ax = lx + lw + 0.14, aw = BODY.x + BODY.w - ax;
  const a = panel(s, ax, 1.56, aw, 5.0, 'WHERE TO PILOT · CLUSTER AHP', { icon: 'FaMapLocationDot' });
  table(s, [
    ['Cluster', 'Cost', 'Dem', 'Ret', 'Node', 'Inst', 'Score'],
    [{ t: 'Tiruppur', bold: true }, '5', '5', '4', '4', '5', { t: '4.68', bold: true, fill: C.greenT, color: C.green, align: 'center' }],
    [{ t: 'Panipat', bold: true }, '5', '4', '5', '4', '4', { t: '4.52', bold: true, fill: C.greenT, color: C.green, align: 'center' }],
    ['Ludhiana', '4', '3', '4', '4', '4', { t: '3.74', align: 'center' }],
    ['Rajkot', '4', '3', '5', '3', '3', { t: '3.70', align: 'center' }],
    ['Surat', '2', '5', '2', '5', '3', { t: '3.28', bold: true, fill: C.redT, color: C.red, align: 'center' }],
  ], a.x, a.y, a.w, [1.35, ...Array(5).fill((a.w - 2.2) / 5), 0.85], { rowH: 0.46, size: 11.5, align: 'center' });
  txt(s, [BR('Criteria: cost ownership, demand on Meesho, returns band, node feasibility, institutional partner (association).', { size: 10.5, color: C.muted, italic: true }), BR(' ', { size: 5 }),
    R('Surat passes a scale screen and fails the price screen. ', { bold: true, color: C.plum }), R('Pilot where cost ownership, low returns and an association to recruit through coincide: Tiruppur (hosiery) and Panipat (home textiles).')],
    a.x, a.y + 2.95, a.w, 1.6, { size: 11.5 });

  // 10x: the flywheel that makes the gap compound
  const m = panel(s, ax, 6.7, aw, 3.16, '10X · THE C2M FLYWHEEL', { icon: 'FaRocket', head: C.plum3 });
  const nodes = ['Factories price 8%+ below market', 'Badge + briefs bring orders', 'Batches fill idle capacity', 'Volume lowers unit cost', 'Market median falls for everyone'];
  const cx = m.x + m.w / 2, cy = m.y + 1.12, rx = 1.95, ry = 0.88, nw = 1.62, nh = 0.5;
  const pts = nodes.map((_, i) => {
    const a = (-90 + i * 72) * Math.PI / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
  // Arrows run edge to edge, so every arrowhead stays visible outside the boxes.
  const fhw = nw / 2 + 0.06, fhh = nh / 2 + 0.06;
  const exitT = (dx, dy) => Math.min(dx ? fhw / Math.abs(dx) : Infinity, dy ? fhh / Math.abs(dy) : Infinity);
  pts.forEach(([x1, y1], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length];
    const dx = x2 - x1, dy = y2 - y1, t = exitT(dx, dy);
    arrow(s, x1 + dx * t, y1 + dy * t, x2 - dx * t, y2 - dy * t, C.plum3, 'solid', 1.5);
  });
  pts.forEach(([x, y], i) => {
    box(s, x - nw / 2, y - nh / 2, nw, nh, i === 0 ? C.orange : C.tint, null, 0.06);
    txt(s, nodes[i], x - nw / 2 + 0.05, y - nh / 2, nw - 0.1, nh, { size: 10, bold: true, color: C.plum, align: 'center', valign: 'middle' });
  });
  txt(s, 'COMPOUNDS', cx - 0.7, cy - 0.14, 1.4, 0.28, { face: F.head, bold: true, size: 10, color: C.muted, align: 'center', valign: 'middle', cs: 2 });
  txt(s, [R('Every lap lowers the median resellers are measured against. ', { bold: true, color: C.plum }), R('The price edge compounds instead of being paid for.')], m.x, m.y + 2.22, m.w, 0.5, { size: 10.5 });
}

// =====================================================================
// 3 · QUALIFY
// =====================================================================
await (async () => {
  const s = frame(2, 'WHERE PRICE IS REAL',
    'Q3 · Which manufacturers and categories carry a genuine, defensible price advantage, and which do not despite scale?',
    `Screen on price, not size: badge a catalogue only when ≥ 60% of its live SKUs sit ≥ 8% below the comparable-set median. In the prototype, ${pti.top10NotReady} of the 10 largest sellers fail that test.`,
    'Sources: Round 1 segment scorecard and platform teardown; seller-guide return fees (Shiprocket, Robnu, 2026). Prototype figures come from synthetic, seeded data (fictional sellers) and demonstrate the method, not Meesho’s actual distribution.',
    'The category screen uses four cost tests. The Price Truth Index then tests each seller on delivered-order prices. The return-cost range brackets the team estimate (₹90) and published seller-guide rates (about ₹150 for a parcel up to 500 g); confirm against a supplier panel.');

  // category scorecard
  const cx = BODY.x, cw = 7.25;
  const c = panel(s, cx, 1.56, cw, 5.55, 'CATEGORY SCREEN · 12 SCREENED, 9 IN SCOPE', { icon: 'FaMagnifyingGlassChart' });
  const cat = [
    ['Unstitched saree & dress material', 'Erode, Bhiwandi', 'yyyy'], ['Home textiles: sheets, towels', 'Panipat, Solapur', 'yyya'],
    ['Hosiery, innerwear, socks', 'Tiruppur, Ludhiana', 'yayy'], ['Moulded plastic housewares', 'Rajkot, Daman', 'yyya'],
    ['Imitation jewellery', 'Rajkot, Coimbatore', 'yyay'], ['Steel kitchenware, utensils', 'Jagadhri, Wazirpur', 'yaya'],
    ['Basic footwear, PU/EVA', 'Agra, Bahadurgarh', 'yyay'], ['Brass décor & lighting', 'Moradabad', 'yxya'],
    ['Bags, school bags', 'Nangloi, Kolkata', 'ayay'], ['Ethnic wear', 'Surat (largest)', 'xyxy'],
    ['Fitted western, jeans', 'Gandhi Nagar, Bengaluru', 'ayxy'], ['Electronics accessories', 'import-assembly', 'xyay'],
  ];
  table(s, [
    ['Category', 'Cluster', 'Floor', 'Idle', 'Ret.', 'Frt.'],
    ...cat.map(([n, cl, m], i) => [{ t: n, bold: i < 9, color: i < 9 ? C.ink : C.red }, { t: cl, color: C.muted }, ...m.split('').map(mark)]),
  ], c.x, c.y, c.w, [2.85, 1.95, 0.55, 0.55, 0.55, 0.52], { rowH: 0.34, size: 10.5 });
  txt(s, 'Floor = cost floor below the market median · Idle = spare capacity · Ret. = low return band · Frt. = freight per rupee of value. Rows 10–12 fail two tests: not now.', c.x, c.y + 4.48, c.w, 0.5, { size: 10, italic: true, color: C.muted });

  // return math
  const rm = panel(s, cx, 7.24, cw, 2.62, 'WHY CATEGORY BEATS SCALE · THE RETURN MATH', { icon: 'FaRotateLeft', head: C.plum3 });
  const rowsR = [['30% returns (fitted ethnic)', retMath(0.3, 90), retMath(0.3, 150)], ['5% returns (home textiles)', retMath(0.05, 90), retMath(0.05, 150)]];
  table(s, [
    ['Return cost per unit kept', 'at ₹90 / return', 'at ₹150 / return'],
    ...rowsR.map(([l, a, b]) => [l, `₹${a.toFixed(0)} · ${p1(a / 265)} of AOV`, `₹${b.toFixed(0)} · ${p1(b / 265)} of AOV`]),
    [{ t: 'Gap between the two categories', bold: true, color: C.plum }, { t: `${((rowsR[0][1] - rowsR[1][1]) / 265 * 100).toFixed(0)} pp of AOV`, bold: true, color: C.red }, { t: `${((rowsR[0][2] - rowsR[1][2]) / 265 * 100).toFixed(0)} pp of AOV`, bold: true, color: C.red }],
  ], rm.x, rm.y, rm.w, [2.8, (rm.w - 2.8) / 2, (rm.w - 2.8) / 2], { rowH: 0.34, size: 11 });
  txt(s, 'Returns × fee ÷ units kept. A wrong category swallows the whole 12–18% cost edge before a buyer sees it. ₹90 is our estimate; ₹150 is the seller-guide rate for ≤ 500 g.', rm.x, rm.y + 1.45, rm.w, 0.55, { size: 10.5, color: C.muted, italic: true });

  // PTI method ribbon
  const px = cx + cw + 0.14, pw = 5.35;
  const p = panel(s, px, 1.56, pw, 5.55, 'PRICE TRUTH INDEX · THE SCREEN', { icon: 'FaCalculator' });
  const stepsP = [
    ['Comparable-set median', 'Order-weighted landed price on delivered orders, per product type. SKUs need ≥ 10 orders.'],
    ['SKU price gap', 'gap = (median − seller landed price) ÷ median'],
    ['Dominant-seller fix', 'A seller with > 30% of a set’s orders is scored against the median without its own orders.'],
    ['Catalogue gate', '≥ 8% gap on ≥ 60% of live SKUs, sellers above ₹5 cr GMV. One loss-leader cannot buy the badge.'],
    ['Badge + re-rank, with a holdout', 'Matched control, read at Day 30 (see Roadmap).'],
  ];
  stepsP.forEach(([h, d], i) => {
    const y = p.y + i * 0.8;
    iconDot(s, ['FaMapLocationDot', 'FaCalculator', 'FaScaleUnbalanced', 'FaShieldHalved', 'FaFlask'][i], p.x, y + 0.04, 0.5);
    txt(s, h, p.x + 0.62, y, p.w - 0.62, 0.28, { face: F.head, bold: true, size: 11.5, color: C.plum });
    txt(s, d, p.x + 0.62, y + 0.28, p.w - 0.62, 0.6, { size: 11, color: C.ink });
    if (i < stepsP.length - 1) arrow(s, p.x + 0.25, y + 0.56, p.x + 0.25, y + 0.78, C.plum3, 'dash', 1);
  });
  box(s, p.x, p.y + 4.08, p.w, 0.9, C.cream, null, 0.05);
  txt(s, [BR('Worked example', { bold: true, color: C.amber, face: F.head, size: 10.5 }), R('SKU landed at ₹212 vs a ₹245 median → gap 13.5% ✓. Catalogue: 18 of 24 live SKUs clear = 75% ≥ 60% → badge. A seller with 3 SKUs at −30% and 21 at market clears 13% → no badge.', { size: 10.5 })], p.x + 0.1, p.y + 4.12, p.w - 0.2, 0.84);

  // verdicts
  const v = panel(s, px, 7.24, pw, 2.62, 'FOUR VERDICTS, FOUR ACTIONS', { icon: 'FaCircleCheck', head: C.plum3 });
  table(s, [
    ['Verdict', 'Action'],
    [{ t: `C2M-ready (${pti.counts.ready})`, color: C.green, bold: true }, 'Badge + re-rank + Demand Brief'],
    [{ t: `Scale without price (${pti.counts.noprice})`, color: C.red, bold: true }, 'No badge; offer a value-tier catalogue'],
    [{ t: `Loss-leader pattern (${pti.counts.lossleader})`, color: C.red, bold: true }, 'No badge; the catalogue gate holds'],
    [{ t: `Near miss (${pti.counts.nearmiss})`, color: C.amber, bold: true }, 'Factory Node cost help; re-score in 28 days'],
  ], v.x, v.y, v.w, [2.35, v.w - 2.35], { rowH: 0.36, size: 11 });

  // prototype scatter
  const sx = px + pw + 0.14, sw = BODY.x + BODY.w - sx;
  const sc = panel(s, sx, 1.56, sw, 8.3, 'BIGGER IS NOT CHEAPER · FROM THE WORKING PROTOTYPE', { icon: 'FaGaugeHigh' });
  const im = await fit(s, 'shot_pti_scatter.png', sc.x, sc.y, sc.w, 4.3);
  const st = [[`${pti.counts.screened}`, 'sellers above ₹5 cr screened'], [`${pti.counts.ready} · ${p0(pti.counts.ready / pti.counts.screened)}`, 'pass the gate'], [`${pti.counts.noprice} · ${p0(pti.counts.noprice / pti.counts.screened)}`, 'scale without price'], [`r = ${pti.correlation.toFixed(2)}`, 'size vs price gap']];
  const stw = (sc.w - 0.3) / 4;
  st.forEach(([vv, ll], i) => kpi(s, sc.x + i * (stw + 0.1), im.y + im.h + 0.15, stw, 0.95, vv, ll, { vs: 17, ls: 10.5 }));
  const big = pti.screened.slice().sort((a, b) => b.gmvCr - a.gmvCr).slice(0, 6);
  const VL = { ready: ['C2M-ready', C.green], noprice: ['Scale without price', C.red], lossleader: ['Loss-leader', C.red], nearmiss: ['Near miss', C.amber] };
  txt(s, 'The six largest sellers screened (prototype, fictional names)', sc.x, im.y + im.h + 1.16, sc.w, 0.26, { face: F.head, bold: true, size: 11, color: C.plum });
  table(s, [
    ['Seller', 'GMV', 'Median gap', 'Verdict'],
    ...big.map((b) => [`${b.name} · ${b.location}`, cr(b.gmvCr), { t: p1(b.medianGap), align: 'right' }, { t: VL[b.verdict][0], color: VL[b.verdict][1], bold: true }]),
  ], sc.x, im.y + im.h + 1.44, sc.w, [2.55, 0.8, 0.95, sc.w - 4.3], { rowH: 0.26, size: 10.5 });
  txt(s, `${pti.top10NotReady} of the 10 largest fail: they are traders, and scale never became price.`, sc.x, im.y + im.h + 3.3, sc.w, 0.28, { size: 10.5, italic: true, color: C.muted });
})();

// =====================================================================
// 4 · ONBOARD
// =====================================================================
await (async () => {
  const s = frame(3, 'GETTING THEM ON',
    'Q4 · Onboarding model · Support stack, risk-sharing and assisted operations for reluctant manufacturers',
    'Keep the B2B risk model: price-check before listing, show demand by pin-code, make only what is pre-ordered, and hand over in bulk to a Factory Node that runs unit operations.',
    `Sources: prototype manufacturer app (illustrative seller Kavin Knit Mills, fictional; ₹${PERSONA.unitCost} making cost; assumptions in src/config.js); Reuters via FashionNetwork (Feb 2026); KrASIA (Pinduoduo, 2019 data); Tech Buzz China (Temu, 2025).`,
    'The ribbon follows one Cohort A manufacturer through the prototype. Node rates, prepayment share and the pre-order discount are proposal assumptions. Shein Brazil is shown as an anti-precedent: it failed because it squeezed factory prices without changing their operating model.');

  // ribbon
  const r = panel(s, BODY.x, 1.56, BODY.w, 2.3, 'THE MADE-TO-MEESHO FLOW · ONE MANUFACTURER, END TO END', { icon: 'FaIndustry', tag: 'numbers from the working prototype' });
  const steps = [
    ['FaCalculator', '1 · Price check', `Lowest price at 9% margin ₹${Math.round(node.floor)} vs ₹${Math.round(node.marketMedian)} median: ${p1(node.gap)} below, qualifies before listing`],
    ['FaMapLocationDot', '2 · Demand Brief', `12 districts, ${n0(brief.weeklyTotal)} orders a week, price band and size mix; first batch ${n0(brief.suggested)} units`],
    ['FaClipboardCheck', '3 · Batch window', `Buyers pre-order (ships in 7 days); ${n0(batch.preOrders)} confirmed, make ${n0(batch.make)} (+15% buffer)`],
    ['FaWarehouse', '4 · Bulk handover', `One drop at the cluster Factory Node; ${p0(ECONOMICS.prepaymentShare)} of confirmed value, ₹${n0(batch.prepayment)}, paid at handover`],
    ['FaTruckFast', '5 · Node runs unit ops', 'Pick, pack, ship each order; returns terminate at the node, not the factory'],
    ['FaIndianRupeeSign', '6 · Settlement', `Balance ${ECONOMICS.settlementDays} days after delivery: cash in ~${Math.round(cash.batchDays)} days vs ${cash.b2bDays} on distributor terms`],
  ];
  const sw = r.w / steps.length;
  steps.forEach(([ic, h, d], i) => {
    const x = r.x + i * sw;
    iconDot(s, ic, x + sw / 2 - 0.36, r.y + 0.02, 0.72, i === 3 ? C.orange : C.plum);
    if (i < steps.length - 1) arrow(s, x + sw / 2 + 0.45, r.y + 0.38, x + sw * 1.5 - 0.45, r.y + 0.38, C.plum3, 'dash', 1.5);
    txt(s, h, x + 0.06, r.y + 0.82, sw - 0.12, 0.3, { face: F.head, bold: true, size: 12, color: C.plum, align: 'center' });
    txt(s, d, x + 0.1, r.y + 1.13, sw - 0.2, 0.55, { size: 11, align: 'center', color: C.ink });
  });

  // coverage matrix
  const mw = 7.55, my = 4.0;
  const m = panel(s, BODY.x, my, mw, 3.3, 'EVERY BARRIER HAS A LEVER · COVERAGE', { icon: 'FaShieldHalved' });
  table(s, [
    ['Barrier', 'Price check', 'Demand Brief', 'Batch window', 'Factory Node', 'Returns firewall', 'Prepay'],
    ['Unit-level fulfilment', mark('n'), mark('n'), mark('n'), mark('y'), mark('n'), mark('n')],
    ['Inventory risk', mark('n'), mark('a'), mark('y'), mark('n'), mark('n'), mark('a')],
    ['Returns and RTO', mark('a'), mark('n'), mark('n'), mark('y'), mark('y'), mark('n')],
    ['Unproven demand', mark('n'), mark('y'), mark('y'), mark('n'), mark('n'), mark('n')],
    ['Cash cycle', mark('n'), mark('n'), mark('n'), mark('a'), mark('n'), mark('y')],
    ['Channel conflict', mark('y'), mark('a'), mark('n'), mark('n'), mark('n'), mark('n')],
  ], m.x, m.y, m.w, [1.95, ...Array(6).fill((m.w - 1.95) / 6)], { rowH: 0.36, size: 10.5, hsize: 10 });
  txt(s, '✓ removes · – reduces. The price check prices returns in; the node cuts reverse cost; the firewall caps the rest.', m.x, m.y + 2.6, m.w, 0.3, { size: 10.5, italic: true, color: C.muted });

  // support stack by cohort
  const kx = BODY.x + mw + 0.14, kw = 5.45;
  const k = panel(s, kx, my, kw, 3.3, 'SUPPORT STACK BY COHORT', { icon: 'FaUserTie' });
  const stack = [
    ['A', 'Offline B2B', 'Cluster co-op onboarding (40–60 at a time) · price check · briefs · batch window · Factory Node · 30% prepayment'],
    ['B', 'Online elsewhere', 'Price check → separate value-tier SKUs (not a discount) · briefs · may self-ship'],
    ['C', 'Churned', 'Returns firewall (capped exposure) · health-score re-entry · catalogue and KYC reused'],
  ];
  stack.forEach(([c, t, d], i) => {
    const y = k.y + i * 0.92;
    box(s, k.x, y, 0.55, 0.8, C.plum, null, 0.06);
    txt(s, c, k.x, y, 0.55, 0.8, { face: F.head, bold: true, size: 20, color: C.white, align: 'center', valign: 'middle' });
    txt(s, t, k.x + 0.68, y, k.w - 0.68, 0.26, { face: F.head, bold: true, size: 11.5, color: C.plum });
    txt(s, d, k.x + 0.68, y + 0.26, k.w - 0.68, 0.6, { size: 11 });
  });

  // precedents
  const qx = kx + kw + 0.14, qw = BODY.x + BODY.w - qx;
  const q = panel(s, qx, my, qw, 3.3, 'PRECEDENT · WHAT WE COPY, WHAT WE AVOID', { icon: 'FaGlobe' });
  table(s, [
    ['Platform', 'Mechanic', 'Result'],
    [{ t: 'Copy · Pinduoduo', bold: true, color: C.green }, 'Anonymised demand data to factories (New Brand Initiative)', '900+ factories, 2,200+ custom SKUs, 115 mn orders by end-2019'],
    [{ t: 'Copy · Temu', bold: true, color: C.green }, 'Semi-managed: bulk to local warehouses, platform runs storefront', 'Targeted 60–80% of US GMV in 2025'],
    [{ t: 'Avoid · Shein Brazil', bold: true, color: C.red }, 'Demanded ~30% price cuts and faster delivery from factories', '336 signed vs 2,000 target; 1 still producing (Reuters, Feb 2026)'],
  ], q.x, q.y, q.w, [1.35, (q.w - 1.35) * 0.5, (q.w - 1.35) * 0.5], { rowH: 0.5, size: 10.5, hsize: 10.5 });
  txt(s, [R('Lesson: ', { bold: true, color: C.plum }), R('fix the operating model and measure the gap that already exists. Never ask a factory for a price cut.')], q.x, q.y + 2.28, q.w, 0.45, { size: 11 });

  // bottom: economics + risk-sharing
  const ey = 7.44, eh = 2.42, ew = 10.45;
  const e = panel(s, BODY.x, ey, ew, eh, 'ASSISTED OPERATIONS · WHAT THE FACTORY NODE BUYS (₹98 COST, 9% MARGIN)', { icon: 'FaWarehouse', head: C.plum3 });
  table(s, [
    ['', 'Lowest viable price', 'Below market median', 'Return cost / unit kept', `Margin at ₹${node.suggested}`, 'C2M badge'],
    [{ t: 'Ship each order yourself', bold: true }, `₹${Math.round(self.floor)}`, p1(self.gap), `₹${self.atSuggested.returnCostPerKept.toFixed(0)}`, p1(self.atSuggested.margin), { t: self.qualifies ? '✓ yes' : '✕ no', color: self.qualifies ? C.green : C.red, bold: true }],
    [{ t: 'Factory Node', bold: true, color: C.plum }, { t: `₹${Math.round(node.floor)}`, bold: true }, { t: p1(node.gap), bold: true }, { t: `₹${node.atSuggested.returnCostPerKept.toFixed(0)}`, bold: true }, { t: p1(node.atSuggested.margin), bold: true }, { t: node.qualifies ? '✓ yes' : '✕ no', color: node.qualifies ? C.green : C.red, bold: true }],
  ], e.x, e.y, e.w, [2.3, ...Array(5).fill((e.w - 2.3) / 5)], { rowH: 0.4, size: 11, align: 'center', hsize: 10.5 });
  txt(s, `Working capital: ${p1(cash.b2bCost)} of revenue on 50-day distributor terms vs ${p1(cash.batchCost)} on a prepaid batch (18% cost of capital). Node rates are proposal assumptions (src/config.js).`, e.x, e.y + 1.5, e.w, 0.45, { size: 10.5, italic: true, color: C.muted });

  const rs = panel(s, BODY.x + ew + 0.14, ey, BODY.w - ew - 0.14, eh, 'RISK-SHARING · WHO CARRIES WHAT', { icon: 'FaShieldHalved', head: C.plum3 });
  table(s, [
    ['Risk', 'B2B today', 'Made-to-Meesho'],
    ['Unsold stock', 'None: made to order', { t: 'Only the 15% buffer on confirmed orders', bold: true }],
    ['Returns handling', 'None', { t: 'Node absorbs it; firewall pool caps the loss', bold: true }],
    ['Waiting for cash', '45–60 days', { t: `30% at handover; rest ~${ECONOMICS.settlementDays} days after delivery`, bold: true }],
    ['Demand', 'Distributor orders', { t: 'Pre-orders plus the pin-code brief', bold: true }],
  ], rs.x, rs.y, rs.w, [1.75, 1.7, rs.w - 3.45], { rowH: 0.35, size: 10.5 });
})();

// =====================================================================
// 5 · SCALE
// =====================================================================
await (async () => {
  const s = frame(4, 'KEEPING THEM',
    'Q5 · Sustainable scale-up · Early order conviction and retention, without subsidy or handholding',
    `Pay for early conviction in impressions, not rupees, and let rules fix what the Health Score flags: ${hs.auto} automated actions to ${hs.manual} escalations, ~${n0(Math.round(hs.sellersPerManager / 10) * 10)} sellers per category manager.`,
    'Sources: Meesho Q4 FY26 earnings call transcript (6 May 2026); prototype Seller Health module (synthetic 60-seller pilot, fixed seed). The category-manager capacity of 40 escalation reviews a month is an assumption.',
    'Meesho already gates visibility on quality. That protects buyers, but a new manufacturer cannot prove quality without first orders. The fix is targeted impressions in the pin-codes where the Demand Brief shows demand, capped at 20% of category impressions, never cash.');

  // quote
  const qw = 6.1;
  const q = panel(s, BODY.x, 1.56, qw, 2.95, 'THE COLD-START GAP, IN MEESHO’S OWN WORDS', { icon: 'FaUserTie' });
  txt(s, '“If their quality is not that great, they do not get visibility for orders. And products that have very good quality continue to scale on the platform.”', q.x, q.y, q.w, 1.05, { size: 14, italic: true, color: C.plum, bold: true });
  txt(s, '— Vidit Aatrey, CEO, Q4 FY26 earnings call, 6 May 2026', q.x, q.y + 1.08, q.w, 0.3, { size: 10.5, color: C.muted });
  txt(s, [R('Implication: ', { bold: true, color: C.plum }), R('a new factory needs orders to prove quality and quality to earn orders. That loop, not price, is why new sellers take a small share of orders in their first 30 days.')], q.x, q.y + 1.45, q.w, 0.9, { size: 11.5 });

  const g = panel(s, BODY.x, 4.65, qw, 2.0, 'IMPRESSIONS, NOT RUPEES · THE GRANT', { icon: 'FaBolt', head: C.plum3 });
  const gk = [['12', 'Demand Brief pin-codes get starter impressions'], ['+25K', 'impressions for 7 days if orders < 60% at D7/D14'], ['max 2', 'grants per seller'], ['≤ 20%', 'of category impressions, hard cap']];
  const gw = (g.w - 0.3) / 4;
  gk.forEach(([v, l], i) => kpi(s, g.x + i * (gw + 0.1), g.y, gw, 1.4, v, l, { vs: 18, ls: 10, fill: i % 2 ? C.cream : C.tint }));

  // journey grid
  const jx = BODY.x + qw + 0.14, jw = BODY.w - qw - 0.14;
  const j = panel(s, jx, 1.56, jw, 5.09, 'CONVICTION, THEN RETENTION · WHAT FIRES, WHEN, AND WHAT WE WATCH', { icon: 'FaRobot' });
  table(s, [
    ['Stage', 'When', 'What Meesho does, automatically', 'Trigger', 'Seller sees', 'KPI'],
    [{ t: 'Qualify', bold: true, color: C.plum }, 'Day 0', 'Badge on; re-rank inside the category', 'Passed the price gate', 'C2M badge', 'Gap at onboarding'],
    [{ t: 'Allocate', bold: true, color: C.plum }, 'D0–D14', 'Starter impressions in the 12 Demand Brief pin-codes', 'Onboarding', 'First orders where demand is', 'Orders vs cohort curve'],
    [{ t: 'Allocate', bold: true, color: C.plum }, 'D7, D14', '+25K impressions for 7 days (max 2 grants)', 'Orders < 60% of cohort median', 'WhatsApp: grant applied', 'Recovery by D21'],
    [{ t: 'Diagnose', bold: true, color: C.plum }, 'Daily', 'Health Score from five signals (see Metrics)', 'Every day', 'Weekly score card', 'Score 0–100'],
    [{ t: 'Remedy', bold: true, color: C.plum }, 'On trigger', 'Price nudge · QC hold · node offer · restock nudge', '8 rule thresholds', 'One specific fix', 'Time to recover'],
    [{ t: 'Graduate', bold: true, color: C.green }, 'D30+', 'Batch prepayment unlocked', 'Score ≥ 80 for 30 days', 'Cheaper working capital', 'Graduation rate'],
    [{ t: 'Retain', bold: true, color: C.green }, 'D60+', 'Weekly brief refresh; prepaid batches each cycle; Meesho Mall path', 'Graduated, gap held', 'Steady demand, fast cash', 'Active at D90'],
    [{ t: 'Human', bold: true, color: C.red }, 'Exception', 'Category manager reviews', 'Score < 40 for 7 days after a fix', 'A call', '≤ 5 per 100 / month'],
  ], j.x, j.y, j.w, [1.0, 0.95, 3.35, 2.45, 2.05, j.w - 9.8], { rowH: 0.45, size: 11, hsize: 11 });

  // persona story + chart
  const px = BODY.x, pw = 8.1, py = 6.79, ph = 3.07;
  const p = panel(s, px, py, pw, ph, `ONE SELLER · ${persona.name.toUpperCase()} (FICTIONAL), TIRUPPUR`, { icon: 'FaGaugeHigh', head: C.plum3 });
  await fit(s, 'shot_health_detail.png', p.x, p.y, 3.55, p.h, 'left');
  txt(s, [
    BR('Day 0', { bold: true, color: C.plum }), BR('Badge on; first batch handed over at the node', { size: 11 }),
    BR(`Day ${grant.day}`, { bold: true, color: C.plum }), BR(`${grant.reason}: a grant fires, no one calls`, { size: 11 }),
    BR(`Day ${grant.day + 1}+`, { bold: true, color: C.plum }), BR('Orders recover into the cohort band; score ≥ 80', { size: 11 }),
    BR(`Day ${persona.graduatedDay}`, { bold: true, color: C.green }), R('Graduated: batch prepayment unlocked', { size: 11 }),
  ], p.x + 3.7, p.y, p.w - 3.7, p.h, { size: 11.5 });

  // scalability math
  const mx = px + pw + 0.14, mw = 5.3;
  const m = panel(s, mx, py, mw, ph, 'SCALES TO HUNDREDS WITHOUT HEADCOUNT', { icon: 'FaRobot', head: C.plum3 });
  kpi(s, m.x, m.y, m.w / 2 - 0.06, 1.1, `${hs.auto} : ${hs.manual}`, 'automated vs human actions', { vs: 24 });
  kpi(s, m.x + m.w / 2 + 0.06, m.y, m.w / 2 - 0.06, 1.1, `~${n0(Math.round(hs.sellersPerManager / 10) * 10)}`, 'sellers per category manager', { vs: 24, fill: C.cream });
  txt(s, [R('Sellers per manager = capacity ÷ escalation rate', { bold: true, color: C.plum }), R(` = 40 ÷ (${hs.manual} ÷ ${Math.round(hs.sellerMonths)} seller-months) ≈ ${n0(Math.round(hs.sellersPerManager / 10) * 10)}. The ${hs.manual} escalations are the only human touches in the pilot.`)],
    m.x, m.y + 1.17, m.w, 0.45, { size: 10.5 });
  table(s, [
    ['At 1,400 sellers', 'People', 'What they do'],
    ['Account managers (1 per ~20)', { t: '~70', bold: true, color: C.red }, 'Chase every seller, every week'],
    [{ t: 'Rules + exceptions', bold: true, color: C.plum }, { t: '~2', bold: true, color: C.green }, 'Review only failed fixes'],
  ], m.x, m.y + 1.64, m.w, [2.2, 0.75, m.w - 2.95], { rowH: 0.26, size: 10 });

  // rejected
  const rx = mx + mw + 0.14, rw = BODY.x + BODY.w - rx;
  const rj = panel(s, rx, py, rw, ph, 'EXPLICITLY REJECTED', { icon: 'FaTriangleExclamation', head: C.plum3 });
  table(s, [
    ['Option', 'Why not'],
    ['Order subsidy or paid boosts', 'Buys volume, not conviction; stops the day funding stops'],
    ['Account managers per seller', 'Works at 20 sellers, breaks at 200, cannot reach 1,400'],
    ['Onboarding by turnover', 'The brief’s own diagnosis: scale is not price'],
    ['Weakening the quality gate', 'Protects nobody; grants target traffic, not ranking rules'],
  ], rj.x, rj.y, rj.w, [2.05, rj.w - 2.05], { rowH: 0.48, size: 10.5 });
})();

// =====================================================================
// 6 · MEASURE
// =====================================================================
await (async () => {
  const s = frame(5, 'WHAT WE WATCH',
    'Q6 · Metrics and KPIs · What Meesho tracks across onboarding, activation and retention, and when it steps in',
    'Measure the funnel from qualified to graduated, score every seller daily, and act at fixed thresholds; a person steps in only after an automatic fix has failed.',
    'Targets are proposed pilot thresholds, to be recalibrated on the first cohort. Health Score weights and rule thresholds are the ones running in the prototype (src/config.js).',
    'The KPI tree ladders every seller-level metric up to one north star: NMV from sellers whose catalogue still clears the price gate. Guardrails protect the category and existing resellers.');

  // KPI tree
  const t = panel(s, BODY.x, 1.56, 11.2, 5.35, 'KPI TREE · ONBOARDING → ACTIVATION → RETENTION', { icon: 'FaMagnifyingGlassChart' });
  const ns = { x: t.x + 2.3, y: t.y, w: t.w - 4.6, h: 0.72 };
  box(s, ns.x, ns.y, ns.w, ns.h, C.plum, null, 0.06);
  txt(s, [BR('NORTH STAR · PRICE-COMPETITIVE C2M NMV', { bold: true, size: 12.5, face: F.head }), R('NMV from sellers whose catalogue still clears the ≥ 8% gate', { size: 11 })], ns.x, ns.y, ns.w, ns.h, { color: C.white, align: 'center', valign: 'middle' });
  const cols = [
    ['ONBOARDING', 'FaClipboardCheck', [['Qualified → listed', '≥ 50% in 30 days · weekly · Category'], ['Days to first live listing', '≤ 7 · weekly · Supplier product'], ['First batch committed', '≤ 14 days · weekly · Category']]],
    ['ACTIVATION', 'FaBolt', [['Orders at D7 / D14', '≥ 60% of cohort median · daily · DS'], ['First-30-day orders', '≥ cohort p50 for 70% · weekly · Growth'], ['Days to 10th order', '≤ 10 · weekly · Growth']]],
    ['RETENTION', 'FaFlagCheckered', [['Active at D90', '≥ 75% · monthly · Category'], ['Gate retention D14 / D30', '≥ 70% still clear · weekly · Pricing'], ['Graduated by D60', '≥ 40% · monthly · Finance']]],
  ];
  const cw = (t.w - 0.3) / 3;
  cols.forEach(([h, ic, rows], i) => {
    const x = t.x + i * (cw + 0.15), y = t.y + 1.15;
    line(s, ns.x + ns.w / 2, ns.y + ns.h, x + cw / 2, y, C.plum3, 1.25);
    box(s, x, y, cw, 0.5, C.plum3, null, 0.05);
    s.addImage({ path: I(ic, 'w'), x: x + 0.12, y: y + 0.1, w: 0.3, h: 0.3 });
    txt(s, h, x + 0.5, y, cw - 0.6, 0.5, { face: F.head, bold: true, size: 12, color: C.white, valign: 'middle' });
    rows.forEach(([m, target], j) => {
      const yy = y + 0.6 + j * 0.7;
      box(s, x, yy, cw, 0.62, C.tint, null, 0.04);
      txt(s, m, x + 0.12, yy + 0.03, cw - 0.24, 0.3, { bold: true, size: 11.5 });
      txt(s, target, x + 0.12, yy + 0.31, cw - 0.24, 0.28, { size: 11, color: C.plum3 });
    });
  });
  const gy = t.y + 3.9;
  box(s, t.x, gy, t.w, 0.82, C.cream, null, 0.05);
  txt(s, [BR('GUARDRAILS (programme level)', { bold: true, face: F.head, size: 11, color: C.amber }), R('Category NMV ≥ pre-period · badged ≤ 20% of category impressions · quality returns ≤ 1.5× norm · escalations ≤ 5 per 100 sellers a month', { size: 11 })], t.x + 0.15, gy + 0.06, t.w - 0.3, 0.72);

  // health score
  const hx = BODY.x + 11.34, hw = BODY.w - 11.34;
  const h = panel(s, hx, 1.56, hw, 5.35, 'C2M SELLER HEALTH SCORE · 0–100, DAILY', { icon: 'FaGaugeHigh' });
  const W = [['Price gap held', 0.3, 'today’s gap ÷ gap at onboarding', '560547'], ['Order pace', 0.25, '14-day orders ÷ cohort median (0.3 → 0, 1.0 → 100)', '6E1251'], ['Quality returns', 0.2, '≤ 1× category norm = 100, 2× = 0', '8A245E'], ['On-time dispatch', 0.15, '7-day SLA: 80% → 0, 97% → 100', 'A8527F'], ['In-stock', 0.1, 'live SKUs in stock: 50% → 0, 95% → 100', 'C58AA9']];
  let xx = h.x;
  W.forEach(([n, w, , col]) => {
    const ww = h.w * w;
    box(s, xx, h.y, ww - 0.03, 0.62, col);
    txt(s, `${Math.round(w * 100)}%`, xx, h.y, ww - 0.03, 0.62, { face: F.head, bold: true, size: 14, color: C.white, align: 'center', valign: 'middle' });
    xx += ww;
  });
  W.forEach(([n, w, d, col], i) => {
    const y = h.y + 0.78 + i * 0.52;
    box(s, h.x, y + 0.08, 0.2, 0.2, col);
    txt(s, [R(`${n}  `, { bold: true }), R(d, { color: C.muted })], h.x + 0.3, y, h.w - 0.3, 0.48, { size: 11 });
  });
  const by = h.y + 3.5;
  [['≥ 80 for 30 days', 'Graduate: prepayment unlocked', C.greenT, C.green], ['< 40 for 7 days after a fix', 'Escalate to a category manager', C.redT, C.red]].forEach(([a, b, f, c], i) => {
    const x = h.x + i * (h.w / 2 + 0.05);
    box(s, x, by, h.w / 2 - 0.05, 0.95, f, null, 0.05);
    txt(s, [BR(a, { bold: true, color: c, size: 12.5 }), R(b, { size: 11 })], x + 0.12, by + 0.08, h.w / 2 - 0.3, 0.8);
  });

  // rulebook
  const rb = panel(s, BODY.x, 7.05, 12.4, 2.81, 'WHEN TO INTERVENE · THE RULEBOOK (9 AUTOMATIC, 1 HUMAN)', { icon: 'FaRobot', head: C.plum3 });
  const rules = [
    ['Orders < 60% of cohort median at D7 / D14', 'Impression grant (+25K, 7 days, max 2)'], ['Price gap < 8% for 7 days', 'Price-drift nudge with market median'],
    ['Price gap < 4% for 3 days', 'Badge removed; re-entry after 7 days ≥ 8%'], ['Quality returns > 1.5× norm (≥ 30 deliveries)', 'Badge suspended + QC checklist'],
    ['On-time dispatch < 90% over 7 days', 'Offer Factory Node operations'], ['In-stock < 70% for 3 days', 'Restock nudge sized by the Demand Brief'],
    ['Score ≥ 80 for 30 days', 'Graduate: batch prepayment'], ['Score < 40 for 7 days after a fix', { t: 'Human: category manager', color: C.red, bold: true }],
  ];
  const half = Math.ceil(rules.length / 2);
  [rules.slice(0, half), rules.slice(half)].forEach((chunk, i) => {
    table(s, [['Signal and threshold', 'Action'], ...chunk], rb.x + i * (rb.w / 2 + 0.05), rb.y, rb.w / 2 - 0.05, [3.3, rb.w / 2 - 3.35], { rowH: 0.43, size: 10.5 });
  });

  const st = panel(s, BODY.x + 12.54, 7.05, BODY.w - 12.54, 2.81, `LIVE IN THE PROTOTYPE · ${cohort.length} PILOT SELLERS TODAY`, { icon: 'FaGaugeHigh', head: C.plum3 });
  const stages = [['Allocate', hs.stageCounts.allocate, 'B886A6'], ['Diagnose', hs.stageCounts.diagnose, C.plum3], ['Remedy', hs.stageCounts.remedy, C.amber], ['Graduate', hs.stageCounts.graduate, C.green]];
  let sx0 = st.x;
  stages.forEach(([l, nn, col]) => {
    const w = (st.w * nn) / cohort.length;
    box(s, sx0, st.y + 0.3, w - 0.03, 0.55, col);
    txt(s, String(nn), sx0, st.y + 0.3, w - 0.03, 0.55, { face: F.head, bold: true, size: 14, color: C.white, align: 'center', valign: 'middle' });
    txt(s, l, sx0, st.y, w, 0.26, { size: 10.5, bold: true, color: C.ink, align: 'center' });
    sx0 += w;
  });
  txt(s, [R(`Average score ${Math.round(hs.avgScore)} · `, { bold: true, color: C.plum }), R(`${hs.auto} automated actions and ${hs.manual} escalations so far. Remedy (amber) means an automatic fix is running; ${hs.escalated} of those sellers are with a person.`)], st.x, st.y + 1.0, st.w, 0.95, { size: 11 });
  const cad = [['Daily', 'rules run, grants fire'], ['Weekly', 'KPI review: Category, Growth'], ['Monthly', 'recalibrate weights and thresholds']];
  const cdw = (st.w - 0.2) / 3;
  cad.forEach(([h, d], i) => {
    const x = st.x + i * (cdw + 0.1);
    box(s, x, st.y + 1.5, cdw, 0.68, i === 2 ? C.cream : C.tint, null, 0.05);
    txt(s, [BR(h, { bold: true, color: C.plum, size: 11 }), R(d, { size: 10 })], x + 0.08, st.y + 1.5, cdw - 0.16, 0.68, { valign: 'middle' });
  });
})();

// =====================================================================
// 7 · ROADMAP
// =====================================================================
await (async () => {
  const se = (exp.base.ci[1] - exp.base.ci[0]) / (2 * 1.96);
  const mde = (1.96 + 0.84) * se;
  const nTest = exp.base.treatment.length + exp.base.control.length;
  const s = frame(6, 'WHEN AND HOW MUCH',
    'Q7 · 30-60-90 roadmap · What happens first, in what order, which numbers release the money, and what it costs',
    'Spend nothing until the price gap is proven: ₹0 capex to Day 30, ₹12 cr by Day 90 only if the gate says fund, and ₹22 cr in Year 1 for NPV +₹156 cr.',
    'Sources: Round 1 RICE scoring, costing and NPV model (12% discount rate) and cluster AHP; prototype Day-30 readout (synthetic, 400-draw bootstrap). MSME-TEAM: Ministry of MSME / ONDC, ₹277 cr over three years (Inc42); eligibility to be confirmed.',
    `Sequence follows the Round 1 RICE ranking: diagnostic and free first, capital last. Power: ${nTest} sellers over 28 days give a standard error of about ${(se * 100).toFixed(1)} points on the lift, so the minimum detectable lift at 80% power is about ${(mde * 100).toFixed(1)}%, well under the 12% bar. Waves open only when the previous wave's Day-90 numbers hold.`);

  // Gantt
  const gw = 12.85;
  const g = panel(s, BODY.x, 1.56, gw, 4.0, '30-60-90 PILOT, THEN SCALE · WORKSTREAMS, OWNERS, GATES', { icon: 'FaFlagCheckered' });
  const labelW = 3.75, ownerW = 1.45;
  const tx0 = g.x + labelW + ownerW, tw = g.w - labelW - ownerW;
  const pw = tw / 4;
  ['Days 0–30', 'Days 31–60', 'Days 61–90', 'Quarter 2+'].forEach((p, i) => {
    box(s, tx0 + i * pw + 0.02, g.y, pw - 0.04, 0.34, i === 0 ? C.plum : C.plum3, null, 0.04);
    txt(s, p, tx0 + i * pw, g.y, pw, 0.34, { face: F.head, bold: true, size: 11, color: C.white, align: 'center', valign: 'middle' });
  });
  txt(s, 'Workstream', g.x, g.y, labelW, 0.34, { face: F.head, bold: true, size: 11, color: C.plum, valign: 'middle' });
  txt(s, 'Owner', g.x + labelW, g.y, ownerW, 0.34, { face: F.head, bold: true, size: 11, color: C.plum, valign: 'middle' });
  const ws = [
    ['Price Truth Index + badge test with holdout', 'Pricing, Growth', 0, 1, C.plum],
    ['Health Score + rulebook live', 'Data science', 0, 4, C.plum3],
    ['Cluster co-ops: Tiruppur, Panipat', 'Category', 1, 2, C.plum3],
    ['Demand Briefs, 5 categories', 'Data science', 1, 4, C.plum3],
    ['Batch window + 30% prepayment', 'Product, Finance', 2, 3, C.orange],
    ['Factory Node, Tiruppur (partner)', 'Valmo', 2, 3, C.orange],
    ['Wave 2: 5 clusters, 6 nodes, 450 sellers', 'Category, Valmo', 3, 4, C.orange],
  ];
  ws.forEach(([n, o, a, b, col], i) => {
    const y = g.y + 0.42 + i * 0.37;
    if (i % 2 === 0) box(s, g.x, y - 0.02, g.w, 0.35, C.grey);
    txt(s, n, g.x + 0.05, y, labelW - 0.1, 0.31, { size: 11, valign: 'middle' });
    txt(s, o, g.x + labelW, y, ownerW, 0.31, { size: 10.5, color: C.muted, valign: 'middle' });
    box(s, tx0 + a * pw + 0.08, y + 0.05, (b - a) * pw - 0.16, 0.21, col, null, 0.05);
  });
  [['Day-30 gate', 1], ['Day-60 gate', 2], ['Day-90 gate', 3]].forEach(([l, k]) => {
    const x = tx0 + k * pw;
    line(s, x, g.y + 0.36, x, g.y + 2.98, C.red, 1.25);
    s.addShape(SH.DIAMOND, { x: x - 0.12, y: g.y + 2.9, w: 0.24, h: 0.24, fill: { color: C.red }, line: { color: C.white, width: 1 } });
    txt(s, l, x - 0.9, g.y + 3.16, 1.8, 0.26, { face: F.head, bold: true, size: 10.5, color: C.red, align: 'center' });
  });

  // cluster waves
  const wx = BODY.x + gw + 0.14, wwid = BODY.w - gw - 0.14;
  const wv = panel(s, wx, 1.56, wwid, 4.0, 'WHERE, IN WHAT ORDER · CLUSTER WAVES', { icon: 'FaMapLocationDot' });
  table(s, [
    ['Wave', 'When', 'Clusters and categories', 'Sellers'],
    [{ t: 'Wave 1 · pilot', bold: true, color: C.plum }, 'D0–90', 'Tiruppur (hosiery), Panipat (home textiles)', { t: '60', bold: true, align: 'right' }],
    [{ t: 'Wave 2 · scale', bold: true, color: C.plum }, 'Q2–Q4', '+ Ludhiana (hosiery), Rajkot (plastics, jewellery), Erode (dress material)', { t: '450', bold: true, align: 'right' }],
    [{ t: 'Wave 3 · national', bold: true, color: C.plum }, 'Y2–Y4', '+ 7 more screened clusters, all 9 categories', { t: '1,400', bold: true, align: 'right' }],
  ], wv.x, wv.y, wv.w, [1.3, 0.72, wv.w - 2.72, 0.7], { rowH: 0.55, size: 10.5 });
  txt(s, [R('Order follows the cluster AHP ', { bold: true, color: C.plum }), BR('(cost ownership, demand, returns band, node feasibility, an association to recruit through). Surat stays out.'), BR(' ', { size: 5 }), R('Each wave opens only when the previous wave’s Day-90 numbers hold.', { bold: true })],
    wv.x, wv.y + 2.3, wv.w, 1.1, { size: 10.5 });

  // gates
  const ry = 5.7, rh = 4.16;
  const gt = panel(s, BODY.x, ry, 7.3, rh, 'WHAT RELEASES THE MONEY · GATES', { icon: 'FaShieldHalved' });
  table(s, [
    ['Gate', 'Pass when', 'If not'],
    [{ t: 'Day 30', bold: true, color: C.plum }, 'NMV per live SKU ≥ 12% over holdout (interval > 0) and ≥ 70% of badged sellers still clear at D14', 'Lift < 12%: tighten to a 10% gap and re-run. Decay: stop'],
    [{ t: 'Day 60', bold: true, color: C.plum }, '2 associations signed · 60 factories catalogued · briefs live in 5 categories', 'Hold node spend'],
    [{ t: 'Day 90', bold: true, color: C.plum }, '3 of 4: batches in SLA · returns end at the node · retention ≥ 70% · category NMV ≥ baseline', 'Fix before Wave 2'],
  ], gt.x, gt.y, gt.w, [0.8, 4.0, gt.w - 4.8], { rowH: 0.56, size: 10.5 });
  box(s, gt.x, gt.y + 2.42, gt.w, 0.62, C.cream, null, 0.05);
  txt(s, [R('Statistical power: ', { bold: true, color: C.amber }), R(`${nTest} sellers × 28 days → standard error ≈ ${(se * 100).toFixed(1)} pts; minimum detectable lift ≈ ${(mde * 100).toFixed(1)}% at 80% power, well under the 12% bar.`)], gt.x + 0.1, gt.y + 2.42, gt.w - 0.2, 0.62, { size: 10.5, valign: 'middle' });
  box(s, gt.x, gt.y + 3.1, gt.w, 0.52, C.tint, null, 0.05);
  txt(s, [R('Prototype check: ', { bold: true, color: C.plum }), R(`base ${sp1(exp.base.lift)} → fund · weak ${sp1(exp.weak.lift)} → tighten · decay ${p0(exp.decay.retention14)} retained → stop.`)], gt.x + 0.1, gt.y + 3.1, gt.w - 0.2, 0.52, { size: 10.5, valign: 'middle' });

  // RICE
  const rx = BODY.x + 7.44, rwid = 7.25;
  const rc = panel(s, rx, ry, rwid, rh, 'PRIORITISATION · RICE ACROSS ACQUISITION AND SCALE-UP', { icon: 'FaMagnifyingGlassChart', head: C.plum3 });
  const rice = [
    ['Price gate + C2M badge', 'Acq', 1.0, 2, 0.9, 2, '₹0'],
    ['Health Score + triggers', 'Scale', 1.0, 2, 0.85, 3, '₹0'],
    ['Cluster co-op onboarding', 'Acq', 0.9, 2, 0.85, 3, '₹5 cr'],
    ['Pin-code Demand Brief', 'Scale', 1.0, 2, 0.75, 4, '₹6 cr'],
    ['Demand-confirmed batches', 'Scale', 0.85, 3, 0.7, 5, 'in brief'],
    ['Factory Node (assisted ops)', 'Acq', 1.0, 3, 0.8, 8, '₹8 cr'],
    ['Batch prepayment', 'Scale', 0.75, 2, 0.7, 4, 'float'],
    ['Returns firewall pool', 'Acq', 0.7, 3, 0.65, 6, '₹3 cr'],
  ];
  table(s, [
    ['#', 'Lever', 'Stage', 'R', 'I', 'C', 'E', 'Score', 'Yr-1'],
    ...rice.map(([l, st, r, i, c, e, cost], k) => [{ t: String(k + 1), align: 'center' }, { t: l, bold: k < 2 }, st, p0(r), String(i), p0(c), String(e), { t: (r * i * c / e).toFixed(3), bold: true, color: k < 2 ? C.green : C.ink, align: 'right' }, cost]),
  ], rc.x, rc.y, rc.w, [0.3, 2.2, 0.55, 0.55, 0.3, 0.5, 0.3, 0.62, rc.w - 5.32], { rowH: 0.3, size: 10 });
  txt(s, [R('RICE = Reach × Impact × Confidence ÷ Effort', { bold: true, color: C.plum }), R(' (Round 1). Reach = share of the 11,645 base; Impact 1–3; Effort in engineering + ops weeks, 8 = physical infrastructure. Diagnostic and free first, capital last.')],
    rc.x, rc.y + 2.8, rc.w, 0.75, { size: 10.5 });

  // money
  const mx2 = rx + rwid + 0.14, mwid = BODY.x + BODY.w - mx2;
  const mo = panel(s, mx2, ry, mwid, rh, 'MONEY · ₹ CR', { icon: 'FaIndianRupeeSign' });
  s.addChart(pres.charts.BAR, [{ name: 'Spend', labels: ['D0–30', 'D31–60', 'D61–90', 'Q2+'], values: [0, 4, 8, 10] }], {
    x: mo.x, y: mo.y, w: mo.w, h: 1.65, barDir: 'col', chartColors: [C.plum3], showValue: true, dataLabelPosition: 'outEnd',
    dataLabelFontSize: 11, dataLabelColor: C.ink, dataLabelFontBold: true, catAxisLabelColor: C.muted, catAxisLabelFontSize: 10,
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false, barGapWidthPct: 50,
    valAxisMinVal: 0, valAxisMaxVal: 13,
  });
  const hw2 = (mo.w - 0.1) / 2;
  kpi(s, mo.x, mo.y + 1.72, hw2, 0.85, '+₹156 cr', 'NPV at 12% (Round 1)', { vs: 16, ls: 10, fill: C.greenT, vc: C.green });
  kpi(s, mo.x + hw2 + 0.1, mo.y + 1.72, hw2, 0.85, 'Year 3', 'breakeven', { vs: 16, ls: 10 });
  txt(s, [R('₹0 capex ', { bold: true, color: C.green }), BR('until the gap is proven; ₹22 cr in Year 1.'), R('No new team: ', { bold: true, color: C.plum }), BR('existing owners run each stream.'), R('MSME-TEAM ', { bold: true, color: C.plum }), R('(₹277 cr scheme) could co-fund onboarding.')],
    mo.x, mo.y + 2.66, mo.w, 0.95, { size: 10 });
})();

// =====================================================================
// 8 · RISKS & GUARDRAILS
// =====================================================================
await (async () => {
  const s = frame(7, 'WHAT BREAKS, WHAT’S NEXT',
    'Q8 · Risks and guardrails · What could go wrong, which rules keep it compliant, and where C2M takes Meesho next',
    'Every risk has a tripwire in the rulebook and a compliance answer built in; the long game is graduated factories becoming Meesho Mall value brands.',
    'Sources: DPIIT Press Note 2 (2018) via Khaitan & Co, Lexology; Consumer Protection (E-Commerce) Amendment Rules 2026 via LexOrbis (notified 9 Sep 2026, in force 1 Jan 2027); Meesho Q4 FY26 call; Reuters via FashionNetwork; Flipkart newsroom; KrASIA.',
    'Likelihood and impact are team judgement. Compliance rows are a design response, not legal advice; Meesho legal should confirm each. Risk 8 is the Shein Brazil failure mode: the programme never asks a factory for a price cut.');

  const rw = 11.1;
  const r = panel(s, BODY.x, 1.56, rw, 5.95, 'RISK REGISTER · LIKELIHOOD, IMPACT, EARLY SIGNAL, GUARDRAIL', { icon: 'FaTriangleExclamation' });
  const LI = { H: { fill: C.redT, color: C.red }, M: { fill: C.amberT, color: C.amber }, L: { fill: C.greenT, color: C.green } };
  const li = (v) => ({ t: v, bold: true, align: 'center', ...LI[v] });
  const risks = [
    ['1', 'The price gap was a promotion', 'H', 'H', 'Gate retention < 70% at D14', 'Day-30 stop rule; badge off at < 4% gap', 'Pricing'],
    ['2', 'Loss-leader SKUs game the badge', 'M', 'M', '2–3 SKUs 20%+ below, rest at market', 'Catalogue gate: ≥ 60% of live SKUs', 'Pricing'],
    ['3', 'Quality falls with price', 'M', 'H', 'Quality returns > 1.5× norm', 'Suspend + QC; reinstate at ≤ 1.2× for 7 days', 'Category'],
    ['4', 'Re-rank starves existing resellers', 'L', 'M', 'Category NMV vs pre-period', 'Badged ≤ 20% of category impressions', 'Growth'],
    ['5', 'Capex before demand', 'L', 'H', 'Batch fill rate, node utilisation', 'No node before the Day-30 and Day-60 gates; partner warehouses first', 'Valmo'],
    ['6', 'Export recovery pulls factories back', 'H', 'M', 'Tariff 50% → 18%; India–EU deal', 'Batches fill idle capacity around export runs; C2M as hedge', 'Category'],
    ['7', 'Rate-card war escalates', 'H', 'L', 'Flipkart 0% on all fashion (Jul 2026)', 'Compete on cost structure (node, briefs), not fees', 'Strategy'],
    ['8', 'Shein-style squeeze drives factories away', 'L', 'H', 'Attrition after price asks', 'Never ask for a price cut; the gate measures the gap that exists', 'Leadership'],
  ];
  table(s, [['#', 'Risk', 'L', 'I', 'Early signal', 'Guardrail', 'Owner'], ...risks.map((x) => [{ t: x[0], bold: true, align: 'center', color: C.white, fill: C.plum3 }, { t: x[1], bold: true }, li(x[2]), li(x[3]), x[4], x[5], { t: x[6], color: C.muted }])],
    r.x, r.y, r.w, [0.36, 2.55, 0.42, 0.42, 2.45, 3.72, r.w - 9.92], { rowH: 0.5, size: 10.5 });
  txt(s, [R('L = likelihood, I = impact. Why risk 8 matters: ', { bold: true, color: C.red }), R('Shein pledged $150 mn for 2,000 Brazilian factories and asked for ~30% price cuts; 336 signed and 1 is still producing. Our screen only rewards a gap that already exists.')], r.x, r.y + 4.72, r.w, 0.6, { size: 10.5 });

  const av = panel(s, BODY.x, 7.65, rw, 2.21, 'ASSUMPTIONS WE STILL HAVE TO VERIFY · BEFORE ANY CAPEX', { icon: 'FaFlask', head: C.plum3 });
  table(s, [
    ['Assumption', 'Value used', 'How we verify', 'By'],
    ['Seller fee per customer return', '₹90 (team estimate) to ₹150 (seller guides)', 'Pull from three live supplier panels', 'Day 7'],
    ['Factory Node handling and forward cost', '₹9 + ₹42 per unit (proposal)', 'Partner-warehouse quotes, Tiruppur', 'Day 45'],
    ['Pre-order uptake at ₹20 off, 7-day delivery', '55–70% of the suggested batch', 'A/B test in brief pin-codes', 'Day 60'],
    ['Order lift while a grant is active', '1.35× (simulation)', 'Holdout on the grant rule', 'Day 30'],
  ], av.x, av.y, av.w, [3.3, 3.25, av.w - 7.35, 0.8], { rowH: 0.3, size: 10.5 });

  const mx = BODY.x + rw + 0.14, mw = BODY.w - rw - 0.14;
  const cp = panel(s, mx, 1.56, mw, 4.65, 'COMPLIANCE BY DESIGN · MARKETPLACE, CONSUMER, DATA, TAX', { icon: 'FaShieldHalved', head: C.plum3 });
  table(s, [
    ['Rule', 'What it requires', 'Our design'],
    [{ t: 'FDI Press Note 2 (2018)', bold: true }, 'Marketplace may not own or control seller inventory', 'Seller keeps title at the node; Valmo sells warehousing at arm’s length'],
    [{ t: 'FDI Press Note 2 (2018)', bold: true }, 'Fair, non-discriminatory services; no exclusivity', 'Badge and grants are published rules any seller can meet; batches fit around B2B work'],
    [{ t: 'E-Commerce Rules, 2026 amendment', bold: true }, 'From 1 Jan 2027: ranking parameters by importance; sponsored listings labelled', 'Publish the price-gap badge as a ranking parameter; grants are organic, never sold'],
    [{ t: 'Dark-pattern guidelines (2023)', bold: true }, 'No false urgency or hidden terms; yearly self-audit', '“Ships in 7 days, ₹20 off” shown before the buyer pays'],
    [{ t: 'DPDP Act (2023)', bold: true }, 'Protect personal data', 'Demand Briefs use district-level aggregates only'],
    [{ t: 'GST', bold: true }, 'Stock held at a third-party site', 'Node added as the seller’s additional place of business'],
    [{ t: 'Prepayment', bold: true }, 'Advances must not become inventory purchase or control', 'Advance via an NBFC partner against confirmed buyer orders'],
  ], cp.x, cp.y, cp.w, [1.75, 2.5, cp.w - 4.25], { rowH: 0.42, size: 10 });
  txt(s, 'Design responses, not legal advice: Meesho legal confirms each row before the pilot starts.', cp.x, cp.y + 3.62, cp.w, 0.3, { size: 10, italic: true, color: C.muted });

  const lz = panel(s, mx, 6.35, mw, 3.51, 'THE 10X PATH · FROM PILOT TO SUPPLY ENGINE', { icon: 'FaRocket' });
  const rungs = [
    ['Year 1', '2 clusters · 60 → 450 sellers', 'Prove the gap at ₹0 capex; gate the money'],
    ['Year 2', '5 clusters · 6 nodes', 'Briefs and batches become the default onboarding path'],
    ['Year 4', `12 clusters · 1,400 sellers · ${cr(Y4_NMV)}`, `${p1(LADDER[2].share)} of FY26 NMV structurally cheaper`],
    ['Year 5+', 'Factory brands on Meesho Mall', '“Value brands … for a billion people” (Aatrey): graduates brand their own lines'],
  ];
  const rh2 = (lz.h - 0.06) / rungs.length;
  rungs.forEach(([y, a, b], i) => {
    const yy = lz.y + (rungs.length - 1 - i) * rh2;
    const indent = i * 0.3;
    box(s, lz.x + indent, yy, lz.w - indent, rh2 - 0.08, i === 3 ? C.orange : [C.tint, 'EBD3E2', 'DDB8CE'][i], null, 0.05);
    txt(s, y, lz.x + indent + 0.1, yy, 0.85, rh2 - 0.08, { face: F.head, bold: true, size: 11, color: C.plum, valign: 'middle' });
    txt(s, [BR(a, { bold: true, size: 10.5 }), R(b, { size: 10 })], lz.x + indent + 0.98, yy, lz.w - indent - 1.06, rh2 - 0.08, { valign: 'middle' });
  });
})();

// =====================================================================
// 9 · OPERATING MODEL
// =====================================================================
await (async () => {
  // Stress Kavin's price gap one factor at a time, with the prototype's own economics model.
  const cat = categoryById[PERSONA.category];
  const run = (over = {}) => priceCheck({ unitCost: over.cost ?? PERSONA.unitCost, category: PERSONA.category, typeId: PERSONA.type, mode: 'node', margin: over.margin ?? ECONOMICS.targetMarginB2B, medians: over.medians ?? pti.medians }).gap;
  const withSet = (obj, key, val, fn) => { const old = obj[key]; obj[key] = val; try { return fn(); } finally { obj[key] = old; } };
  const med = pti.medians.get(PERSONA.type);
  const medLow = new Map(pti.medians);
  medLow.set(PERSONA.type, { ...med, median: med.median * 0.95, excluding: new Map() });
  const sens = [
    ['Return fee ₹70 → ₹150', withSet(ECONOMICS.modes.node, 'reversePerReturn', 150, () => run())],
    ['Returns 8% → 12%', withSet(cat, 'returnRate', 0.12, () => run())],
    ['RTO 14% → 20%', withSet(cat, 'rtoRate', 0.2, () => run())],
    ['Forward freight ₹42 → ₹55', withSet(ECONOMICS.modes.node, 'forward', 55, () => run())],
    ['Making cost +10%', run({ cost: PERSONA.unitCost * 1.1 })],
    ['Margin 9% → 12%', run({ margin: 0.12 })],
    ['Market median −5%', run({ medians: medLow })],
  ].map(([l, gp]) => ({ l, g: gp })).sort((a, b) => b.g - a.g);
  const base = node.gap;
  const pass = sens.filter((x) => x.g >= GATE.deltaThreshold).length;

  const s = frame(8, 'HOW MEESHO RUNS IT',
    'Q9 · Operating model · How Meesho builds, staffs and defends it, and how robust the unit economics are',
    `Five engines on tables Meesho already has, a pilot team of 8.5, and a stack rivals cannot copy with a rate card; Kavin still clears the 8% gate in ${pass} of ${sens.length} stress tests.`,
    'Sources: Meesho Q4 FY26 earnings call (Valmo share, ads, Meesho Mall); Flipkart and Amazon seller-fee announcements (2025–26); Tech Buzz China (Temu); prototype economics model for the stress test. Team sizes are proposals; competitor marks are team assessment from public information.',
    'Stress test: each bar changes one assumption and recomputes the lowest viable price for the illustrative Tiruppur seller with the prototype economics model. The base case is the Factory Node price check.');

  // architecture
  const aw = 11.55;
  const a = panel(s, BODY.x, 1.56, aw, 4.3, 'SYSTEM ARCHITECTURE · EXISTING DATA → FIVE ENGINES → FOUR SURFACES', { icon: 'FaRobot' });
  const gap = 0.5, colW = (a.w - 2 * gap) / 3;
  const cols = [
    ['DATA MEESHO ALREADY HOLDS', C.plum3, [['Catalogue', 'live SKUs, product type, landed price'], ['Orders', 'delivered, NMV, RTO, return reason'], ['Operations', 'dispatch time, in-stock'], ['Exposure', 'impressions by pin-code']]],
    ['NEW ENGINES · BATCH + RULES', C.plum, [['Price Truth Index', 'weekly · gate and badge'], ['Demand Brief', 'weekly · district demand'], ['Health Score', 'daily · five signals'], ['Rulebook', 'event-driven · nine rules'], ['Experiment readout', 'Day 30 · fund, tighten, stop']]],
    ['SURFACES', C.orange, [['Search ranking + badge', 'capped at 20% of impressions'], ['Supplier panel + WhatsApp', 'brief, batch, one-tap commit'], ['Valmo Factory Node', 'bulk in, unit orders out'], ['Category-manager queue', 'exceptions only']]],
  ];
  const availH = a.h - 0.55;
  cols.forEach(([h, col, items], ci) => {
    const x = a.x + ci * (colW + gap);
    box(s, x, a.y, colW, 0.34, col, null, 0.04);
    txt(s, h, x, a.y, colW, 0.34, { face: F.head, bold: true, size: 10.5, color: ci === 2 ? C.plum : C.white, align: 'center', valign: 'middle' });
    const n = items.length, ih = (availH - 0.45 - (n - 1) * 0.08) / n;
    items.forEach(([t1, t2], k) => {
      const y = a.y + 0.44 + k * (ih + 0.08);
      box(s, x, y, colW, ih, ci === 1 ? C.tint : C.grey, C.tint2, 0.05);
      txt(s, [BR(t1, { bold: true, size: 11, color: C.plum }), R(t2, { size: 10, color: C.ink })], x + 0.1, y, colW - 0.2, ih, { valign: 'middle' });
    });
    if (ci < 2) s.addShape(SH.RIGHT_ARROW, { x: x + colW + 0.07, y: a.y + 0.44 + (availH - 0.45) / 2 - 0.3, w: gap - 0.14, h: 0.6, fill: { color: C.plum3 }, line: { color: C.plum3, width: 0 } });
  });
  txt(s, [R('New build: ', { bold: true, color: C.plum }), R('four scheduled jobs and one rules engine on tables Meesho already has. No new data integration; the prototype runs all five.')], a.x, a.y + a.h - 0.5, a.w, 0.45, { size: 10.5 });

  // team
  const tm = panel(s, BODY.x + aw + 0.14, 1.56, BODY.w - aw - 0.14, 4.3, 'TEAM AND OWNERSHIP · PROPOSED', { icon: 'FaUserTie' });
  table(s, [
    ['Workstream', 'Owner', 'Pilot', 'Wave 2'],
    ['Price Truth Index, badge, experiment', 'Pricing + data science', '2', '2'],
    ['Demand Brief, Health Score, rulebook', 'Data science', '2', '3'],
    ['Supplier panel + WhatsApp flows', 'Supplier product', '1', '2'],
    ['Cluster partnerships', 'Category (1 per cluster)', '2', '5'],
    ['Factory Node operations', 'Valmo + partner warehouse', '1', '3'],
    ['Prepayment via lending partner', 'Finance', '0.5', '1'],
    [{ t: 'Total people', bold: true }, '', { t: '8.5', bold: true }, { t: '16', bold: true }],
  ], tm.x, tm.y, tm.w, [2.75, 2.2, 0.85, tm.w - 5.8], { rowH: 0.36, size: 10.5 });
  txt(s, [R('People scale with clusters, not sellers: ', { bold: true, color: C.plum }), R(`escalations run at ~${n0(Math.round(hs.sellersPerManager / 10) * 10)} sellers per category manager, so 1,400 sellers need about two reviewers, not an account team.`)],
    tm.x, tm.y + 3.0, tm.w, 0.7, { size: 10.5 });

  // competitive response
  const ry = 6.0, rh = 3.86, cw1 = 7.25, cw2 = 6.45;
  const cp2 = panel(s, BODY.x, ry, cw1, rh, 'WHY RIVALS CANNOT COPY IT QUICKLY', { icon: 'FaGlobe', head: C.plum3 });
  table(s, [
    ['', 'Value demand ₹200–300', 'Tier-2+ reach', 'Zero fees', 'Bulk inbound store', 'Demand data to factories', 'Pre-order batches'],
    [{ t: 'Meesho + C2M', bold: true, color: C.plum }, mark('y'), mark('y'), mark('y'), mark('y'), mark('y'), mark('y')],
    [{ t: 'Flipkart / Shopsy', bold: true }, mark('a'), mark('y'), mark('y'), mark('y'), mark('a'), mark('x')],
    [{ t: 'Amazon', bold: true }, mark('a'), mark('a'), mark('a'), mark('y'), mark('a'), mark('x')],
    [{ t: 'IndiaMART (B2B)', bold: true }, mark('x'), mark('a'), mark('x'), mark('x'), mark('x'), mark('a')],
    [{ t: 'Offline distributor', bold: true }, mark('a'), mark('y'), mark('x'), mark('y'), mark('x'), mark('y')],
  ], cp2.x, cp2.y, cp2.w, [1.55, ...Array(6).fill((cp2.w - 1.55) / 6)], { rowH: 0.36, size: 10.5, hsize: 9.5 });
  txt(s, [R('Each rival covers one or two columns. ', { bold: true, color: C.plum }), R('Only the full stack joins value demand to factory capacity. A rate card can be copied in a quarter; this takes years. ✓ yes · – partly · ✕ no.')],
    cp2.x, cp2.y + 2.55, cp2.w, 0.7, { size: 10.5 });

  // stress test (tornado)
  const tp = panel(s, BODY.x + cw1 + 0.14, ry, cw2, rh, `STRESS TEST · ${PERSONA.name.toUpperCase()} PRICE GAP`, { icon: 'FaScaleUnbalanced', head: C.plum3 });
  const lblW = 2.0, bx0 = tp.x + lblW, bw = tp.w - lblW - 0.15;
  const xmax = 0.16, X = (v) => bx0 + (Math.max(0, v) / xmax) * bw;
  [0, 0.04, 0.08, 0.12, 0.16].forEach((v) => txt(s, `${Math.round(v * 100)}%`, X(v) - 0.25, tp.y, 0.5, 0.22, { size: 9.5, color: C.muted, align: 'center' }));
  const rowH2 = 0.33, top = tp.y + 0.28;
  sens.forEach((x, i) => {
    const y = top + i * rowH2;
    txt(s, x.l, tp.x, y, lblW - 0.08, rowH2, { size: 10.5, valign: 'middle' });
    const x1 = X(Math.min(x.g, base)), x2 = X(Math.max(x.g, base));
    const ok = x.g >= GATE.deltaThreshold;
    box(s, x1, y + 0.07, Math.max(0.03, x2 - x1), rowH2 - 0.14, ok ? C.plum3 : C.red);
    txt(s, p1(x.g), Math.max(bx0, x1 - 0.62), y, 0.58, rowH2, { size: 10, bold: true, color: ok ? C.ink : C.red, align: 'right', valign: 'middle' });
  });
  const yEnd = top + sens.length * rowH2;
  line(s, X(base), top - 0.04, X(base), yEnd + 0.02, C.ink, 1);
  line(s, X(GATE.deltaThreshold), top - 0.04, X(GATE.deltaThreshold), yEnd + 0.02, C.red, 1.5);
  txt(s, `base ${p1(base)}`, X(base) - 0.6, yEnd + 0.03, 1.2, 0.22, { size: 10, bold: true, align: 'center' });
  txt(s, 'gate 8%', X(GATE.deltaThreshold) - 0.5, yEnd + 0.03, 1.0, 0.22, { size: 10, bold: true, color: C.red, align: 'center' });
  txt(s, [R(`Clears the gate in ${pass} of ${sens.length} single-factor stresses. `, { bold: true, color: C.plum }), R('Freight is the thin spot, so partner-node quotes (Day 45) come before any node capex.')], tp.x, yEnd + 0.32, tp.w, 0.55, { size: 10.5 });

  // built on
  const bx = BODY.x + cw1 + cw2 + 0.28, bwid = BODY.w - cw1 - cw2 - 0.28;
  const bo = panel(s, bx, ry, bwid, rh, 'BUILT ON WHAT MEESHO RUNS', { icon: 'FaCircleCheck', head: C.plum3 });
  [['FaTruckFast', 'Valmo', 'handles 50–55% of deliveries; a node is one more lane'], ['FaGlobe', '264 mn buyers', 'the demand signal behind every brief'], ['FaBolt', 'Ads engine', 'impression inventory for grants; ad catalog +40% YoY'], ['FaIndianRupeeSign', '0% commission', 'no fee change needed to make C2M pay'], ['FaStore', 'Meesho Mall', 'the graduation path for factory brands']].forEach(([ic, h, d], i) => {
    const y = bo.y + i * 0.64;
    iconDot(s, ic, bo.x, y + 0.04, 0.44);
    txt(s, [BR(h, { bold: true, color: C.plum, size: 11 }), R(d, { size: 10 })], bo.x + 0.54, y, bo.w - 0.54, 0.6, { valign: 'middle' });
  });
})();

// =====================================================================
// 10 · PROTOTYPE
// =====================================================================
await (async () => {
  const s = frame(9, 'PROOF, LIVE',
    'Q10 · Working prototype · Does it actually run? Every rule on this deck, live',
    'The prototype runs the whole loop on synthetic data (screen, experiment, daily score, manufacturer app), and every rule in it would run unchanged on Meesho’s delivered-order and listing tables.',
    `Built for this submission: React + Recharts, static site. ${market.sellers.length} synthetic sellers and ${n0(skuCount)} SKUs across 9 categories, a ${cohort.length}-seller pilot, fixed seed, fictional names. Four model tests run before every deploy. All assumptions live in one config file.`,
    'Walkthrough order for a live demo: Overview → Price Truth Index (drag the gate) → Day-30 readout (switch scenarios) → Seller Health (Kavin Knit Mills) → Manufacturer app (price check to WhatsApp commit).');

  const gw = 15.35;
  const cellW = (gw - 0.14) / 2, cellH = 4.08;
  const shots = [
    ['1 · PRICE TRUTH INDEX', 'shot_pti_scatter.png', `${pti.counts.screened} screened · ${pti.counts.ready} pass · ${pti.top10NotReady} of the 10 largest fail`],
    ['2 · DAY-30 READOUT', 'shot_day30.png', `Base ${sp1(exp.base.lift)} (CI ${sp1(exp.base.ci[0])} to ${sp1(exp.base.ci[1])}) → fund · weak ${sp1(exp.weak.lift)} → tighten · decay ${p0(exp.decay.retention14)} retained → stop`],
    ['3 · SELLER HEALTH', 'shot_health_detail.png', `${cohort.length} sellers scored daily · ${hs.auto} automated : ${hs.manual} human · Kavin graduates on D${persona.graduatedDay}`],
    ['4 · MANUFACTURER APP', null, `Price check ₹${Math.round(node.floor)} vs ₹${Math.round(node.marketMedian)} → brief → batch of ${n0(batch.make)} → one-tap WhatsApp commit`],
  ];
  for (let i = 0; i < shots.length; i++) {
    const [title, file, cap] = shots[i];
    const x = BODY.x + (i % 2) * (cellW + 0.14), y = 1.56 + Math.floor(i / 2) * (cellH + 0.14);
    const p = panel(s, x, y, cellW, cellH, title, { icon: ['FaCalculator', 'FaFlask', 'FaGaugeHigh', 'FaWhatsapp'][i] });
    const capH = 0.5;
    if (file) await fit(s, file, p.x, p.y, p.w, p.h - capH - 0.05);
    else {
      const third = (p.w - 0.2) / 3;
      await fit(s, 'shot_phone_price.png', p.x, p.y, third, p.h - capH - 0.05);
      await fit(s, 'shot_phone_brief.png', p.x + third + 0.1, p.y, third, p.h - capH - 0.05);
      await fit(s, 'shot_phone_whatsapp.png', p.x + 2 * (third + 0.1), p.y, third, p.h - capH - 0.05);
    }
    box(s, p.x, p.y + p.h - capH + 0.05, p.w, capH, C.tint, null, 0.04);
    txt(s, cap, p.x + 0.1, p.y + p.h - capH + 0.05, p.w - 0.2, capH, { size: 11, bold: true, color: C.plum, valign: 'middle' });
  }

  const rx = BODY.x + gw + 0.14, rw = BODY.w - gw - 0.14;
  const q = panel(s, rx, 1.56, rw, 4.08, 'OPEN IT', { icon: 'FaLink' });
  s.addImage({ path: A('qr_live.png'), x: q.x + (q.w - 2.2) / 2, y: q.y + 0.02, w: 2.2, h: 2.2 });
  txt(s, [BR('meesho-dice-c2m-iitb.vercel.app', { bold: true, color: C.plum3, hyperlink: { url: 'https://meesho-dice-c2m-iitb.vercel.app/' } }), BR('Mirror:', { size: 10.5, color: C.muted, bold: true }), BR('prathmesh-28.github.io/c2m-control-tower', { size: 10.5, color: C.muted }), R('Offline: one HTML file, no internet needed', { size: 10.5, color: C.muted })], q.x, q.y + 2.3, q.w, 1.25, { size: 12, align: 'center' });

  const d = panel(s, rx, 5.78, rw, 4.08, 'HOW MEESHO WOULD RUN IT', { icon: 'FaWarehouse', head: C.plum3 });
  table(s, [
    ['Feed', 'Used for'],
    ['Catalogue: SKU, product type, landed price', 'Median, gate, badge'],
    ['Orders: delivered, NMV, RTO, return reason', 'Brief, experiment, quality'],
    ['Operations: dispatch time, stock', 'Health Score, remedies'],
    ['Exposure: impressions by pin-code', 'Grants, 20% cap'],
  ], d.x, d.y, d.w, [2.05, d.w - 2.05], { rowH: 0.52, size: 10.5 });
  txt(s, 'One daily batch job plus event-driven rules. No new data integration.', d.x, d.y + 2.75, d.w, 0.6, { size: 11, bold: true, color: C.plum });
})();

await pres.writeFile({ fileName: OUT });
console.log('wrote', OUT);
console.log(JSON.stringify({ pti: pti.counts, top10: pti.top10NotReady, r: pti.correlation.toFixed(2), base: [exp.base.lift, exp.base.ci], weak: exp.weak.lift, decay: exp.decay.retention14, hs: { auto: hs.auto, manual: hs.manual, sm: hs.sellerMonths, per: hs.sellersPerManager }, node: node.floor, self: self.floor, skus: skuCount }));
