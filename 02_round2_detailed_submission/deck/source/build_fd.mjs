// Factory Direct deck: Meesho DICE S3 Business Track, Round 2 (cover + 10 content pages + 3 appendices).
// Format: csuite-case-deck (action headlines, one exhibit and one decision per page, [S#]/[A#] tags).
// Every number comes from model.mjs; nothing is typed onto a slide by hand.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { OUT as M, A, S } from './model.mjs';

const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');
const HERE = path.dirname(new URL(import.meta.url).pathname);
const AS = (f) => path.join(HERE, 'assets', f);
const IC = (n, c = 'w') => AS(`icons/${n}_${c}.png`);
const OUTFILE = process.argv[2] ?? path.join(HERE, 'out', 'factory_direct.pptx');

// Never overwrite the current deck without first saving it to ../old (see snapshot.sh).
const DECK_MAIN = path.resolve(HERE, '../meesho_dice_round2.pptx');
if (path.resolve(OUTFILE) === DECK_MAIN && fs.existsSync(DECK_MAIN)) {
  require('child_process').execFileSync('bash', [path.join(HERE, 'snapshot.sh'), 'rebuilt with build_fd.mjs'], { stdio: 'inherit' });
}

// Optional primary research (buyer survey + team interviews). Absent → visible [FILL] markers.
const PR_FILE = path.join(HERE, 'data', 'primary_research.json');
const PR = fs.existsSync(PR_FILE) ? JSON.parse(fs.readFileSync(PR_FILE, 'utf8')) : null;

// ------------------------------------------------------------------ design system
const C = {
  plum: '5A0A46', plum2: '7B2A66', saffron: 'F7A21B', coral: 'E8434F', fill: 'FBF3F8', fill2: 'FFF5E6', line: 'D8C2D0',
  text: '1F1F1F', muted: '6B6B6B', white: 'FFFFFF', green: '2E9E5B', amber: 'E39B2B', red: 'D64545', grey: 'EEE8EC', dark: '3A0730',
};
const F = { head: 'Arial', body: 'Calibri' };
const BODY = { x: 0.60, y: 1.15, w: 12.48, h: 5.55 };
const G = 0.10;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Team 23B0747, IIT Bombay';
pres.title = 'Factory Direct: building Meesho’s C2M base';
const SH = pres.shapes;

// ------------------------------------------------------------------ formatting
const IN = (x, d = 0) => Number(x).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
const cr = (x, d) => `${x < 0 ? '−' : ''}₹${IN(Math.abs(x), d ?? (Math.abs(x) >= 100 ? 0 : 1))} cr`;
const nm = (x, d = 1) => (x < 0 ? `−${Math.abs(x).toFixed(d)}` : x.toFixed(d));
const pc = (x, d = 0) => `${(x * 100).toFixed(d)}%`;
const rs = (x, d = 0) => `₹${IN(x, d)}`;
const big = (n) => (n >= 1e7 ? `${(n / 1e7).toFixed(2)} cr` : n >= 1e5 ? `${(n / 1e5).toFixed(2)} lakh` : IN(n));
const U = M.unit, FN = M.fin, SP = M.SP, Y4 = M.ladder[2];

// ------------------------------------------------------------------ primitives
function T(s, text, o = {}) {
  s.addText(text, { fontFace: F.body, fontSize: 9.5, color: C.text, margin: 0, isTextBox: true, valign: 'top', ...o });
}
const run = (text, o = {}) => ({ text, options: o });
function box(s, x, y, w, h, fill, o = {}) {
  s.addShape(o.round ? SH.ROUNDED_RECTANGLE : SH.RECTANGLE, {
    x, y, w, h, fill: { color: fill }, line: { color: o.line ?? fill, width: o.lw ?? 0.75, dashType: o.dash }, rectRadius: o.round ? (o.r ?? 0.06) : undefined,
  });
}
function R([fx, fy, fw, fh]) {
  let x = BODY.x + fx * BODY.w, y = BODY.y + fy * BODY.h, w = fw * BODY.w, h = fh * BODY.h;
  if (fx > 0.001) { x += G / 2; w -= G / 2; }
  if (fx + fw < 0.999) w -= G / 2;
  if (fy > 0.001) { y += G / 2; h -= G / 2; }
  if (fy + fh < 0.999) h -= G / 2;
  return { x, y, w, h };
}
// Panel: coloured header bar + tinted body. Returns the inner content box.
function panel(s, fr, title, o = {}) {
  const r = R(fr), hb = 0.27;
  box(s, r.x, r.y, r.w, hb, o.hc ?? C.plum, { round: true, r: 0.05 });
  T(s, title, { x: r.x + 0.08, y: r.y, w: r.w - 0.16, h: hb, fontSize: 10.5, bold: true, color: C.white, valign: 'middle' });
  box(s, r.x, r.y + hb + 0.03, r.w, r.h - hb - 0.03, o.fill ?? C.fill, { line: C.line });
  return { x: r.x + 0.08, y: r.y + hb + 0.09, w: r.w - 0.16, h: r.h - hb - 0.15 };
}
function bigNum(s, x, y, d, value, o = {}) {
  s.addShape(SH.OVAL, { x, y, w: d, h: d, fill: { color: o.fill ?? C.white }, line: { color: o.ring ?? C.coral, width: 2.25 } });
  T(s, value, { x: x - 0.1, y, w: d + 0.2, h: d, fontSize: o.size ?? 20, bold: true, color: o.color ?? C.plum, align: 'center', valign: 'middle', fontFace: F.head });
}
function sym(s, x, y, kind, d = 0.19) {
  const k = { y: ['✓', C.green], a: ['–', C.amber], x: ['✕', C.red] }[kind];
  s.addShape(SH.OVAL, { x, y, w: d, h: d, fill: { color: k[1] }, line: { color: k[1] } });
  T(s, k[0], { x, y: y - 0.005, w: d, h: d, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Arial' });
}
function icon(s, name, x, y, d, c = 'w') { s.addImage({ path: IC(name, c), x, y, w: d, h: d }); }
function chip(s, x, y, w, h, text, fill, o = {}) {
  box(s, x, y, w, h, fill, { round: true, r: 0.05, line: o.line });
  T(s, text, { x: x + 0.04, y, w: w - 0.08, h, fontSize: o.size ?? 9, bold: o.bold ?? true, color: o.color ?? C.white, align: o.align ?? 'center', valign: 'middle' });
}
// Table with house style. rows: array of arrays of strings or {t, o}
function table(s, rows, o) {
  const head = o.head ?? true;
  const data = rows.map((r, i) => r.map((c, j) => {
    const cell = typeof c === 'object' && c !== null && !Array.isArray(c) ? c : { t: c };
    const isHead = head && i === 0;
    const zebra = !isHead && (o.zebra ?? true) && i % 2 === 0;
    return {
      text: cell.t ?? '',
      options: {
        bold: isHead || cell.b, color: isHead ? C.white : (cell.c ?? C.text),
        fill: { color: isHead ? (o.hc ?? C.plum) : (cell.f ?? (zebra ? 'F6EAF2' : C.white)) },
        align: cell.a ?? (j === 0 ? 'left' : (o.align ?? 'center')), valign: 'middle', fontSize: cell.fs ?? (isHead ? (o.hfs ?? o.fs ?? 9) : (o.fs ?? 9)),
        italic: cell.i, colspan: cell.cs, rowspan: cell.rs,
      },
    };
  }));
  s.addTable(data, {
    x: o.x, y: o.y, w: o.w, colW: o.colW, rowH: o.rowH, fontFace: F.body, margin: o.margin ?? 0.035,
    border: { type: 'solid', pt: 0.5, color: C.line }, autoPage: false,
  });
}

// ------------------------------------------------------------------ page chrome
const TABS = ['Primary\nResearch', 'Manufacturer\nSegments', 'Market\nSizing', 'Price\nTruth', 'Factory\nDirect', 'Global\nBenchmarks', 'Sustainable\nScale-up', 'Metrics\n& KPIs', 'Business\nCase', 'Roadmap\n& Risks'];
function header(s, active, label) {
  box(s, 0, 0, 13.333, 0.56, C.plum);
  s.addImage({ path: AS('dice_logo.png'), x: 0.2, y: 0.06, w: 0.9, h: 0.448 });
  if (label) {
    chip(s, 4.4, 0.08, 4.5, 0.40, label, C.coral, { size: 14 });
  } else {
    const x0 = 1.2, x1 = 11.8, gap = 0.05, n = TABS.length, tw = (x1 - x0 - gap * (n - 1)) / n;
    TABS.forEach((t, k) => {
      const on = k === active;
      box(s, x0 + k * (tw + gap), 0.08, tw, 0.42, on ? C.coral : C.saffron, { round: true, r: 0.06, line: on ? C.white : C.saffron, lw: on ? 1.25 : 0.75 });
      T(s, t, { x: x0 + k * (tw + gap), y: 0.08, w: tw, h: 0.42, fontSize: 8.5, bold: true, color: on ? C.white : C.plum, align: 'center', valign: 'middle', fontFace: F.head });
    });
  }
  s.addImage({ path: AS('meesho_icon.png'), x: 11.93, y: 0.09, w: 0.38, h: 0.38 });
  s.addImage({ path: AS('iitb_logo_white.png'), x: 12.48, y: 0.06, w: 0.45, h: 0.44 });
}
function page(i, { headline, rail, band, foot, label }) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  header(s, i, label);
  T(s, headline, { x: 0.25, y: 0.58, w: 12.83, h: 0.55, fontFace: F.head, fontSize: 17, bold: true, color: C.plum, valign: 'middle', lineSpacingMultiple: 0.88 });
  box(s, 0.25, BODY.y, 0.27, BODY.h, C.plum);
  T(s, rail, { x: 0.25, y: BODY.y, w: 0.27, h: BODY.h, fontSize: 11, bold: true, color: C.white, align: 'center', valign: 'middle', vert: 'vert270', fontFace: F.head });
  if (band) {
    box(s, 0.25, 6.78, 12.83, 0.4, C.plum, { round: true, r: 0.06 });
    T(s, band, { x: 0.4, y: 6.78, w: 12.55, h: 0.4, fontSize: 10.5, bold: true, color: C.white, valign: 'middle' });
  }
  T(s, foot, { x: 0.25, y: 7.22, w: 12.2, h: 0.22, fontSize: 8, color: C.muted, valign: 'middle' });
  T(s, String(pres.slides.length), { x: 12.6, y: 7.22, w: 0.48, h: 0.22, fontSize: 9, bold: true, color: C.plum, align: 'right', valign: 'middle' });
  return s;
}

// ================================================================== 1 · COVER
{
  const s = pres.addSlide();
  s.background = { color: C.plum };
  s.addImage({ path: AS('meesho_icon.png'), x: 0.35, y: 0.3, w: 0.62, h: 0.62 });
  s.addImage({ path: AS('iitb_logo_white.png'), x: 12.3, y: 0.22, w: 0.78, h: 0.76 });
  s.addShape(SH.OVAL, { x: 0.55, y: 1.15, w: 5.6, h: 5.6, fill: { color: C.saffron }, line: { color: C.saffron } });
  s.addImage({ path: AS('cover_banner.png'), x: 0.7, y: 1.3, w: 5.3, h: 5.3, rounding: true, sizing: { type: 'cover', w: 5.3, h: 5.3 } });
  T(s, 'BUSINESS TRACK  ·  DETAILED SUBMISSION  ·  ROUND 2', { x: 6.6, y: 0.45, w: 5.6, h: 0.3, fontSize: 11, bold: true, color: C.saffron, align: 'center', charSpacing: 1 });
  s.addShape(SH.LINE, { x: 6.9, y: 0.95, w: 5.2, h: 0, line: { color: C.white, width: 1.25 } });
  T(s, 'Building Meesho’s Consumer-to-Manufacturer (C2M) Base', { x: 6.6, y: 1.05, w: 6.4, h: 1.15, fontFace: F.head, fontSize: 26, bold: true, color: C.saffron, align: 'center', valign: 'middle' });
  chip(s, 8.15, 2.3, 3.3, 0.46, 'FACTORY DIRECT', C.coral, { size: 18 });
  T(s, [
    run('Screen manufacturers on price, not size, and let them make only what is already sold. ', { color: C.white }),
    run(`${IN(M.SOM)} factories by Year 4 put ${cr(Y4.nmv)} of NMV ${pc(A.A7.value[0])}–${pc(A.A7.value[1])} below market, `, { color: C.saffron, bold: true }),
    run(`for a five-year NPV of ${cr(FN.npv, 0)} on ${cr(FN.cashY1)} of capped Year-1 cash.`, { color: C.saffron, bold: true }),
  ], { x: 6.75, y: 2.9, w: 6.1, h: 1.0, fontSize: 13, align: 'center', valign: 'middle', italic: true });
  s.addShape(SH.LINE, { x: 7.0, y: 4.0, w: 5.6, h: 0, line: { color: C.white, width: 1.25 } });
  chip(s, 7.55, 4.18, 4.5, 0.42, 'Team 23B0747', C.coral, { size: 15 });
  [['Prathmesh Walimbe', 8.05], ['Krishna Kanta Mondal', 10.45]].forEach(([n, x]) => {
    s.addShape(SH.OVAL, { x, y: 4.72, w: 1.1, h: 1.1, fill: { color: C.saffron }, line: { color: C.white, width: 1.5, dashType: 'dash' } });
    T(s, 'Add photo', { x, y: 4.72, w: 1.1, h: 1.1, fontSize: 9, italic: true, color: C.plum, align: 'center', valign: 'middle' });
    T(s, n, { x: x - 0.6, y: 5.86, w: 2.3, h: 0.3, fontSize: 12, bold: true, color: C.white, align: 'center' });
  });
  chip(s, 7.55, 6.26, 4.5, 0.42, 'Indian Institute of Technology Bombay', C.saffron, { size: 13, color: C.plum });
  s.addImage({ path: AS('qr_live.png'), x: 12.2, y: 6.05, w: 0.8, h: 0.8 });
  T(s, 'Live prototype: meesho-dice-c2m-iitb.vercel.app', { x: 6.6, y: 6.86, w: 6.4, h: 0.3, fontSize: 10, color: C.white, align: 'center' });
  s.addNotes('Cover. Governing thought: screen on price, not size; make only what is sold; 1,400 factories by Year 4; ₹1,995 cr NMV 8–12% below market; NPV from model.mjs.');
}

// ================================================================== 2 · PRIMARY RESEARCH
{
  const s = page(0, {
    headline: `Demand follows price on Meesho and 35% of MSMEs want online sales, but returns and know-how push out those who try`,
    rail: 'EVIDENCE',
    band: 'Decision: design Factory Direct around returns, stock risk and know-how (pages 6, 8); price the pre-order discount from the buyer survey. Owner: Category + Product.',
    foot: 'Sources: S2 Meesho Q4 FY26 call · S3 FY26 results · S4 ICRIER 2025 · S6 RBI · S8 Tiruppur · S9 Panipat · S10 team teardown · S21 Apparel Resources   |   Assumptions: A6, A22–A24   |   Workings and method: Appendix B',
  });
  // P1 problem, objective, size
  let b = panel(s, [0, 0, 0.40, 0.46], 'Problem, objective and size of the prize');
  T(s, [run('Objective  ', { bold: true, color: C.coral }), run('a base of factories that sell direct at a real price edge, and stay.', { bold: true, color: C.plum })], { x: b.x, y: b.y, w: b.w, h: 0.2, fontSize: 10 });
  const flow = (y, label, steps, outcome, col) => {
    T(s, label, { x: b.x, y, w: 0.5, h: 0.34, fontSize: 9, bold: true, color: col, valign: 'middle' });
    const gap = 0.16, sw = (b.w - 0.5 - gap * (steps.length - 1)) / steps.length;
    steps.forEach((t, k) => {
      const x = b.x + 0.5 + k * (sw + gap), last = k === steps.length - 1;
      chip(s, x, y + 0.02, sw, 0.3, t, last ? C.saffron : col, { size: 8.5, color: last ? C.plum : C.white });
      if (!last) T(s, '›', { x: x + sw, y, w: gap, h: 0.34, fontSize: 16, bold: true, color: col, align: 'center', valign: 'middle' });
    });
    T(s, outcome, { x: b.x + 0.5, y: y + 0.36, w: b.w - 0.5, h: 0.2, fontSize: 8.5, color: col, bold: true, valign: 'middle' });
  };
  flow(b.y + 0.27, 'As-is', ['Factory', `Wholesaler +${pc(A.A24.value)}`, 'Reseller', 'Buyer'], `Reseller’s lowest viable price ${rs(U.cols[0].floor)}: ${pc(-U.cols[0].gap, 1)} above the ${rs(U.mkt)} market`, C.plum2);
  flow(b.y + 0.86, 'To-be', ['Factory', 'Factory Node', 'Pre-order', 'Buyer'], `Factory’s lowest viable price ${rs(U.cols[3].floor)}: ${pc(U.cols[3].gap, 1)} below market, made to order`, C.coral);
  const cy0 = b.y + 1.48, ch0 = b.y + b.h - cy0;
  box(s, b.x, cy0, b.w, ch0, C.white, { line: C.coral, round: true, r: 0.04 });
  T(s, [run(`≈ ${cr(M.problemSize)}`, { fontSize: 18, breakLine: true }), run('a year', { fontSize: 10 })], { x: b.x + 0.06, y: cy0, w: 1.75, h: ch0, bold: true, color: C.coral, valign: 'middle', fontFace: F.head });
  T(s, [
    run('of wholesaler mark-up sits inside Meesho’s nine C2M categories', { bold: true, color: C.plum, breakLine: true }),
    run(`= ${cr(SP.fy26Nmv)} FY26 NMV [S3] × ${pc(A.A6.value)} in C2M categories [A6] × ${pc((U.resellerCogs - M.c2m.exFactory) / U.mkt, 1)} mark-up share of a ${rs(U.mkt)} pack [A24]`, { color: C.text }),
  ], { x: b.x + 1.85, y: cy0 + 0.02, w: b.w - 1.92, h: ch0 - 0.04, fontSize: 8.5, valign: 'middle' });

  // P2 challenges
  b = panel(s, [0, 0.46, 0.40, 0.18], 'Challenges to solve, and where the deck answers them', { hc: C.coral });
  const ch = [['Find the real price edge', 'p5'], ['Take shipping and returns off factories', 'p6'], ['Remove build-to-stock risk', 'p6'],
    ['Cut the 45–60 day cash cycle', 'p6'], ['Fix the cold start without subsidy', 'p8'], ['Stop the price gap decaying', 'p9']];
  ch.forEach(([t, p], k) => {
    const cx = b.x + (k % 2) * (b.w / 2), cyy = b.y + Math.floor(k / 2) * (b.h / 3);
    T(s, [run('✓ ', { color: C.green, bold: true }), run(t, { color: C.text }), run(`  ${p}`, { color: C.coral, bold: true })], { x: cx, y: cyy, w: b.w / 2 - 0.05, h: b.h / 3, fontSize: 9, valign: 'middle' });
  });

  // P3 survey trio
  b = panel(s, [0.40, 0, 0.60, 0.64], 'Three data sets: why factories quit, what buyers pay, what buyers would trade');
  const cw = (b.w - 0.2) / 3;
  const sep = (x) => s.addShape(SH.LINE, { x, y: b.y, w: 0, h: b.h, line: { color: C.line, width: 0.75, dashType: 'dash' } });
  sep(b.x + cw + 0.05); sep(b.x + 2 * cw + 0.15);
  // (a) ICRIER
  bigNum(s, b.x, b.y, 0.62, '2,365', { size: 11 });
  T(s, [run('ICRIER MSME survey [S4]', { bold: true, color: C.plum, breakLine: true }), run('Why firms that joined e-commerce quit (% of quitters)', { color: C.muted })], { x: b.x + 0.66, y: b.y, w: cw - 0.66, h: 0.62, fontSize: 8.5, valign: 'middle' });
  const icr = [['Lacked knowledge', 43], ['Product returns', 43], ['Platform charges', 42], ['High competition', 40], ['Tech / inventory skills', 39], ['Not profitable', 35], ['Not enough staff', 33], ['Stock capacity', 30]];
  const ops = ['Product returns', 'Tech / inventory skills', 'Not enough staff', 'Stock capacity', 'Lacked knowledge'];
  icr.forEach(([l, v], k) => {
    const y = b.y + 0.74 + k * 0.245;
    T(s, l, { x: b.x, y, w: 1.25, h: 0.22, fontSize: 8.5, color: C.text, valign: 'middle' });
    box(s, b.x + 1.27, y + 0.035, (cw - 1.65) * v / 45, 0.15, ops.includes(l) ? C.coral : C.plum2);
    T(s, `${v}%`, { x: b.x + 1.3 + (cw - 1.65) * v / 45, y, w: 0.35, h: 0.22, fontSize: 8.5, bold: true, color: C.text, valign: 'middle' });
  });
  T(s, [run('Coral = operational: ', { color: C.coral, bold: true }), run('barriers a node and batches remove. 1 in 5 firms that joined quit; 35% still want to join.', { color: C.text })], { x: b.x, y: b.y + b.h - 0.46, w: cw, h: 0.46, fontSize: 8.5, valign: 'middle' });
  // (b) teardown
  const tx = b.x + cw + 0.1;
  bigNum(s, tx, b.y, 0.62, String(M.tdAll), { size: 13 });
  T(s, [run('Team teardown, meesho.com [S10]', { bold: true, color: C.plum, breakLine: true }), run('Live listings, 5 product types, 2 Oct 2026', { color: C.muted })], { x: tx + 0.66, y: b.y, w: cw - 0.66, h: 0.62, fontSize: 8.5, valign: 'middle' });
  const bb = M.briefsBands;
  T(s, [run('■ ', { color: C.plum2 }), run('share of listings   ', {}), run('■ ', { color: C.coral }), run('share of reviews (demand proxy)', {})], { x: tx, y: b.y + 0.68, w: cw, h: 0.18, fontSize: 7.5, color: C.muted });
  T(s, 'Men’s briefs, 3-pack, n = 56, by price band (₹)', { x: tx, y: b.y + 0.86, w: cw, h: 0.18, fontSize: 7.5, color: C.muted, italic: true });
  const bandY = b.y + 1.08, bandH = b.h - 1.6, bw0 = (cw - 0.1) / bb.length;
  bb.forEach((x, k) => {
    const bx = tx + 0.05 + k * bw0;
    const h1 = bandH * 0.8 * x.listingShare / 0.45, h2 = bandH * 0.8 * x.reviewShare / 0.45, base0 = bandY + bandH * 0.86;
    box(s, bx + 0.04, base0 - h1, bw0 / 2 - 0.05, Math.max(h1, 0.01), C.plum2);
    box(s, bx + bw0 / 2, base0 - h2, bw0 / 2 - 0.05, Math.max(h2, 0.01), C.coral);
    T(s, pc(x.reviewShare), { x: bx + bw0 / 2 - 0.1, y: base0 - h2 - 0.17, w: bw0 / 2 + 0.14, h: 0.16, fontSize: 7.5, bold: true, color: C.coral, align: 'center' });
    T(s, x.label.replace('₹', '').replace('< ', '<'), { x: bx - 0.04, y: base0 + 0.02, w: bw0 + 0.08, h: 0.18, fontSize: 7, color: C.text, align: 'center' });
  });
  T(s, `Listings under ₹200 are ${pc(bb[0].listingShare)} of the shelf but ${pc(bb[0].reviewShare)} of reviews: volume follows price.`, { x: tx, y: b.y + b.h - 0.46, w: cw, h: 0.46, fontSize: 8.5, bold: true, color: C.coral, valign: 'middle' });
  // (c) buyer survey
  const ux = b.x + 2 * (cw + 0.1);
  if (PR && PR.survey) {
    const sv = PR.survey;
    bigNum(s, ux, b.y, 0.62, String(sv.n), { size: 14 });
    T(s, [run('Team buyer survey', { bold: true, color: C.plum, breakLine: true }), run(`Meesho buyers, last 3 months, ${sv.dates}`, { color: C.muted })], { x: ux + 0.66, y: b.y, w: cw - 0.66, h: 0.62, fontSize: 8.5, valign: 'middle' });
    sv.ladder.forEach(([l, v], k) => {
      const y = b.y + 0.76 + k * 0.36;
      T(s, l, { x: ux, y, w: 0.95, h: 0.3, fontSize: 8.5, valign: 'middle' });
      box(s, ux + 1.0, y + 0.06, (cw - 1.45) * v, 0.18, C.coral);
      T(s, pc(v), { x: ux + 1.02 + (cw - 1.45) * v, y, w: 0.4, h: 0.3, fontSize: 8.5, bold: true, valign: 'middle' });
    });
    T(s, sv.takeaway, { x: ux, y: b.y + b.h - 0.46, w: cw, h: 0.46, fontSize: 8.5, bold: true, color: C.coral, valign: 'middle' });
  } else {
    bigNum(s, ux, b.y, 0.62, 'n', { size: 14 });
    T(s, [run('Team buyer survey', { bold: true, color: C.plum, breakLine: true }), run('Meesho buyers, last 3 months (kit: research/13)', { color: C.muted })], { x: ux + 0.66, y: b.y, w: cw - 0.66, h: 0.62, fontSize: 8.5, valign: 'middle' });
    box(s, ux, b.y + 0.72, cw, b.h - 1.24, C.white, { line: C.coral, dash: 'dash' });
    T(s, '[FILL: Q6–Q8 price ladder: % choosing 7–8 day delivery at ₹10 / ₹20 / ₹40 off · Q9 % paying in advance · Q10 trust in “Sold directly by the manufacturer” · base n on each chart]', { x: ux + 0.1, y: b.y + 0.78, w: cw - 0.2, h: b.h - 1.36, fontSize: 8.5, italic: true, color: C.muted, valign: 'middle' });
    T(s, '[FILL: takeaway: the majority answer and its implication]', { x: ux, y: b.y + b.h - 0.46, w: cw, h: 0.46, fontSize: 8.5, italic: true, color: C.coral, valign: 'middle' });
  }

  // P5 stakeholder voice
  b = panel(s, [0, 0.64, 1, 0.36], `Stakeholder voice: published owner and leader interviews${PR && PR.interviews ? ' + team interviews' : ''} (verbatim, ≤ 25 words)`);
  const rowsV = (PR && PR.interviews ? PR.interviews : []).slice(0, 2).map((r) => [r.who, `“${r.quote}”`, r.problem, r.area, r.implication]);
  const base = [
    ['VM Navamani, MD, Cossmo Tex (Tiruppur) [S21]', '“Currently, domestic business is about 20%, and we are planning to increase it to 35–40% … because export markets are mostly volatile.”', 'Export orders swing with tariffs', 'Demand', 'Pitch C2M as a permanent domestic hedge, not a rescue'],
    ['Ashwin Kumar, Managing Partner, NASA Impex (Tiruppur) [S21]', '“Orders of around 100 pieces tend to double costs … so 500 pieces is our preferred minimum.”', 'Small runs cost twice as much per piece', 'Operations', 'Demand Brief pools district demand into batches of 500+'],
    ['Vinod Dhamija, Chairman, HCCI Panipat chapter [S9]', '“Panipat’s exports had shrunk by 50 per cent, while the domestic market had also been disturbed very badly.”', 'Idle looms, weak orders', 'Demand, cash', 'Panipat is pilot cluster 2; 30% paid at handover'],
    ['Vidit Aatrey, CEO, Meesho (Q4 FY26 call) [S2]', '“If their quality is not that great, they do not get visibility for orders.”', 'New sellers start with no orders', 'Visibility', 'Impression grants for new factories, not order subsidies'],
  ];
  const vrows = [...rowsV, ...base].slice(0, 4);
  table(s, [['Stakeholder', 'Verbatim', 'Problem', 'Area', 'Implication for Factory Direct'], ...vrows.map((r) => [{ t: r[0], b: true, c: C.plum, a: 'left' }, { t: r[1], i: true, a: 'left' }, { t: r[2], a: 'left' }, r[3], { t: r[4], a: 'left', b: true }])],
    { x: b.x, y: b.y, w: b.w, colW: [2.35, 4.6, 1.85, 0.85, b.w - 9.65], rowH: [0.22, ...vrows.map(() => (b.h - 0.24) / vrows.length)], fs: 8.5, hfs: 9 });
  if (!(PR && PR.interviews)) s.addNotes('Stakeholder voice uses published interviews. Add 1–2 rows from the team’s own Round 1 interviews (data/primary_research.json → interviews[]) when the notes arrive.');
}

// ================================================================== 3 · MANUFACTURER SEGMENTS
{
  const coh = M.cohorts, ahp = M.ahp;
  const s = page(1, {
    headline: `Start with offline B2B factories (${IN(coh[0].firms)} firms, score ${coh[0].score.toFixed(2)} of 5) in hosiery and home textiles, piloting in Tiruppur and Panipat`,
    rail: 'FOCUS',
    band: 'Decision: onboard Cohort A in Tiruppur and Panipat first; re-activate Cohort C in parallel; Cohort B only with value-tier SKUs. Owner: Category · KPI: 60 factories catalogued by Day 60.',
    foot: 'Sources: S2, S20, S22 (24 interviews, 8 per cohort; cluster scores)   |   Weights and rubric: Appendix B · AHP matrix: Appendix C   |   ✓ = 5, – = 3, ✕ = 1',
  });
  let b = panel(s, [0, 0, 0.37, 0.54], 'Cohort scoring: 3 cohorts × 5 criteria (1–5, higher = better)');
  table(s, [['Cohort', 'Firms', ...M.cohortCrit.map(([n, w]) => `${n.replace('Barriers Meesho can fix', 'Fixable barriers').replace('Speed to first order', 'Speed')} ${pc(w)}`), 'Score'],
    ...coh.map((x, i) => [{ t: `${x.k} · ${{ A: 'Offline B2B', C: 'Churned', B: 'Online elsewhere' }[x.k]}`, b: true, c: C.plum }, IN(x.firms), ...x.s.map(String), { t: x.score.toFixed(2), b: true, c: i === 0 ? C.white : C.plum, f: i === 0 ? C.coral : undefined }])],
    { x: b.x, y: b.y, w: b.w, colW: [1.25, 0.42, 0.45, 0.42, 0.5, 0.42, 0.42, b.w - 3.88], rowH: [0.42, 0.28, 0.28, 0.28], fs: 9, hfs: 8 });
  const roles = [['A', 'Beachhead: owns cost, sells ex-factory, needs ops', C.coral], ['C', 'Re-activate now: KYC on file, left after a returns shock', C.plum2], ['B', 'Value-tier SKUs only: ₹800+ baskets lose money at ₹265 AOV', C.muted]];
  roles.forEach(([k, t, col], i) => {
    chip(s, b.x, b.y + 1.38 + i * 0.28, 0.32, 0.24, k, col, { size: 9 });
    T(s, t, { x: b.x + 0.38, y: b.y + 1.38 + i * 0.28, w: b.w - 0.4, h: 0.24, fontSize: 9, valign: 'middle' });
  });
  T(s, `Ranking holds with equal weights (${coh.map((x) => x.equal.toFixed(1)).join(' / ')}). Firms = share of the ${IN(M.SAM)} SAM [S22].`, { x: b.x, y: b.y + b.h - 0.2, w: b.w, h: 0.2, fontSize: 8, italic: true, color: C.muted });

  b = panel(s, [0, 0.54, 0.37, 0.46], 'Barrier severity × cohort (24 interviews, Round 1)', { hc: C.coral });
  const bars = [['Unit-level fulfilment', 'H', 'L', 'M', 'y'], ['Inventory risk, build-to-stock', 'H', 'M', 'H', 'y'], ['Returns and RTO exposure', 'H', 'M', 'H', 'y'], ['Unproven demand', 'H', 'M', 'H', 'y'], ['Cash cycle, settlement lag', 'M', 'L', 'M', 'a'], ['Channel conflict, brand dilution', 'H', 'H', 'L', 'a']];
  const lvl = { H: ['HIGH', C.coral], M: ['MED', C.amber], L: ['LOW', '9AA5A0'] };
  table(s, [['Barrier', 'A', 'B', 'C', 'Meesho can fix'], ...bars.map((r) => [r[0], ...r.slice(1, 4).map((v) => ({ t: lvl[v][0], b: true, c: C.white, f: lvl[v][1], fs: 8 })), { t: r[4] === 'y' ? 'YES' : 'PARTLY', b: true, c: r[4] === 'y' ? C.green : C.amber }])],
    { x: b.x, y: b.y, w: b.w, colW: [1.9, 0.5, 0.5, 0.5, b.w - 3.4], rowH: 0.24, fs: 9, zebra: false });
  T(s, 'Four of six barriers are HIGH for Cohort A and all four are operational: Meesho can remove them with infrastructure, not money.', { x: b.x, y: b.y + 1.72, w: b.w, h: b.h - 1.72, fontSize: 9, bold: true, color: C.plum, valign: 'middle' });

  b = panel(s, [0.37, 0, 0.33, 1], `Category screen: 12 screened, 9 in scope`);
  const cats = M.categories;
  table(s, [['Category', 'Cluster', 'Floor', 'Idle', 'Ret.', 'Frt.', 'Score'], ...cats.map((x, i) => {
    const out = i >= 9;
    return [{ t: x.name, b: !out, c: out ? C.muted : C.plum }, { t: x.cluster, c: out ? C.muted : C.text, fs: 8 }, ...x.marks.split('').map((m) => ({ t: { y: '✓', a: '–', x: '✕' }[m], b: true, c: { y: C.green, a: C.amber, x: C.red }[m], fs: 10 })), { t: x.score.toFixed(1), b: true, c: out ? C.red : C.plum, f: out ? 'FBE3E4' : undefined }];
  })], { x: b.x, y: b.y, w: b.w, colW: [1.2, 0.92, 0.33, 0.33, 0.33, 0.33, b.w - 3.44], rowH: [0.24, ...cats.map(() => 0.29)], fs: 8.5, hfs: 8, margin: 0.02 });
  const cy = b.y + b.h - 0.8;
  T(s, [
    run('Weights: ', { bold: true, color: C.plum }), run(`cost floor ${pc(M.catW[0])} · idle capacity ${pc(M.catW[1])} · low returns ${pc(M.catW[2])} · freight per ₹ ${pc(M.catW[3])}. `, {}),
    run('Rows 10–12 fail two tests: not now. ', { bold: true, color: C.red }),
    run('Floor ✓ = factory cost ≥ 12% under the demand-weighted median.', {}),
  ], { x: b.x, y: cy, w: b.w, h: b.y + b.h - cy, fontSize: 8.5, valign: 'top' });

  b = panel(s, [0.70, 0, 0.30, 0.62], `Where to pilot: cluster AHP (CR ${ahp.CR.toFixed(3)})`);
  T(s, ahp.crit.map((c, i) => run(`${c} ${ahp.w[i].toFixed(2)}${i < 4 ? '  ·  ' : ''}`, { color: i % 2 ? C.plum2 : C.plum, bold: true })), { x: b.x, y: b.y, w: b.w, h: 0.36, fontSize: 8.5 });
  table(s, [['Cluster', 'Cost', 'Dem.', 'Ret.', 'Node', 'Inst.', 'Score'], ...ahp.clusters.map((x, i) => [{ t: `${x.name}`, b: true, c: i < 2 ? C.coral : C.plum }, ...x.s.map(String), { t: x.score.toFixed(2), b: true, c: i < 2 ? C.white : C.plum, f: i < 2 ? C.coral : undefined }])],
    { x: b.x, y: b.y + 0.4, w: b.w, colW: [0.86, 0.42, 0.42, 0.42, 0.42, 0.42, b.w - 2.96], rowH: 0.25, fs: 9 });
  T(s, [run('Robust: ', { bold: true, color: C.coral }), run(`Surat overtakes Panipat only if the weight on demand rises from ${ahp.w[1].toFixed(2)} to ${ahp.flipDemand.toFixed(2)}; with equal weights the order holds (${ahp.clusters.map((x) => `${x.name} ${x.equal.toFixed(1)}`).join(', ')}). Surat is India’s largest textile cluster and still ranks last: scale is the wrong screen.`, {})],
    { x: b.x, y: b.y + 1.98, w: b.w, h: b.h - 1.98, fontSize: 8.5, valign: 'top' });

  b = panel(s, [0.70, 0.62, 0.30, 0.38], 'Not now, and the evidence', { hc: C.coral });
  T(s, [
    run('Surat ethnic wear: ', { bold: true, color: C.red }), run('traders job out weaving and stitching; worst return band (AHP 3.28).', { breakLine: true }),
    run('Electronics accessories: ', { bold: true, color: C.red }), run('import-assembly, no cost ownership: any gap is a subsidy.', { breakLine: true }),
    run('Fitted western wear: ', { bold: true, color: C.red }), run('size returns swallow the cost edge.', { breakLine: true }),
    run('Cohort B premium lines: ', { bold: true, color: C.red }), run('brand dilution is the one barrier Meesho cannot fix.', {}),
  ], { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 8.5, paraSpaceAfter: 3, valign: 'top' });
}

// ================================================================== 4 · MARKET SIZING
{
  const L = M.ladder;
  const s = page(2, {
    headline: `${IN(M.SAM)} manufacturers can carry a real price gap; ${IN(M.SOM)} by Year 4 put ${cr(Y4.nmv)} of NMV ${pc(A.A7.value[0])}–${pc(A.A7.value[1])} below market`,
    rail: 'SIZING',
    band: `Decision: plan for ${IN(M.SOM)} C2M sellers and ${cr(Y4.nmv)} run-rate NMV by Year 4 (${pc(Y4.shareFy26, 1)} of FY26 NMV). Owner: Category · KPI: NMV still clearing the 8% gate.`,
    foot: 'Sources: S3, S5, S6, S7 (Udyam 4.72 cr, team pull Jun 2026; PIB reports 7.83 cr incl. Udyam Assist), S14, S20, S22   |   Assumptions: A1, A2, A5–A9   |   Workings: Appendix B',
  });
  let b = panel(s, [0, 0, 0.38, 1], 'Addressable base, bottom-up (firms)');
  const fun = M.funnel;
  const fy0 = b.y, fh = (b.h - 1.2) / fun.length;
  fun.forEach(([label, v, src], k) => {
    const y = fy0 + k * fh, col = k === 3 || k === 5 ? C.coral : k === 6 ? C.saffron : C.plum2, bw = 1.55 - k * 0.08;
    box(s, b.x + (1.55 - bw) / 2, y, bw, fh - 0.08, col, { round: true, r: 0.04 });
    T(s, big(v), { x: b.x + (1.55 - bw) / 2, y, w: bw, h: fh - 0.08, fontSize: 13, bold: true, color: k === 6 ? C.plum : C.white, align: 'center', valign: 'middle', fontFace: F.head });
    T(s, [run(label, { bold: true, color: k === 3 || k === 5 ? C.coral : C.plum }), run(`  [${src}]`, { color: C.muted, fontSize: 7.5 })], { x: b.x + 1.65, y, w: b.w - 1.65 - 0.58, h: fh - 0.08, fontSize: 9, valign: 'middle' });
    if (k) chip(s, b.x + b.w - 0.52, y + (fh - 0.08) / 2 - 0.12, 0.52, 0.24, pc(v / fun[k - 1][1], v / fun[k - 1][1] < 0.02 ? 1 : 0), C.white, { size: 8.5, color: C.coral, line: C.coral });
  });
  const sy = fy0 + fun.length * fh + 0.02;
  T(s, 'SAM by cohort', { x: b.x, y: sy, w: b.w, h: 0.2, fontSize: 9, bold: true, color: C.plum });
  M.cohorts.slice().sort((p, q) => q.firms - p.firms).forEach((x, k) => {
    const wv = (b.w - 0.1) * x.share;
    const x0 = b.x + M.cohorts.slice().sort((p, q) => q.firms - p.firms).slice(0, k).reduce((sm, y) => sm + (b.w - 0.1) * y.share, 0);
    box(s, x0, sy + 0.22, wv - 0.02, 0.32, [C.coral, C.plum2, C.saffron][k]);
    T(s, `${x.k} ${IN(x.firms)}`, { x: x0, y: sy + 0.22, w: wv - 0.02, h: 0.32, fontSize: 8.5, bold: true, color: k === 2 ? C.plum : C.white, align: 'center', valign: 'middle' });
  });
  T(s, 'Right-hand figure = conversion from the row above. Cost levers (COI): raw material, production, scale, automation. Small/medium = above ₹2.5 cr investment or ₹10 cr turnover [S5].', { x: b.x, y: sy + 0.6, w: b.w, h: b.y + b.h - sy - 0.6, fontSize: 8, italic: true, color: C.muted });

  b = panel(s, [0.38, 0, 0.62, 0.52], 'Opportunity ladder: what each phase is worth');
  table(s, [['', ...L.map((x) => x.stage)],
    ['Clusters · Factory Nodes', ...L.map((x) => `${x.clusters} · ${x.nodes}`)],
    ['Active C2M sellers', ...L.map((x) => IN(x.sellers))],
    [{ t: `Run-rate NMV (× ${rs(M.yieldCr, 3).replace('₹', '₹')} cr per seller) [A1]`, b: true }, ...L.map((x) => ({ t: cr(x.nmv), b: true, c: C.plum }))],
    ['Share of FY26 NMV (₹41,560 cr) [S3]', ...L.map((x) => pc(x.shareFy26, 1))],
    [{ t: 'Buyer savings a year at an 8–12% gap', b: true }, ...L.map((x) => ({ t: `${cr(x.save[0])}–${cr(x.save[1])}`, b: true, c: C.coral }))],
    ['Meesho value a year: incremental orders + fewer failed deliveries', ...L.map((x) => cr(x.meesho))],
  ], { x: b.x, y: b.y, w: b.w, colW: [3.2, (b.w - 3.2) / 3, (b.w - 3.2) / 3, (b.w - 3.2) / 3], rowH: [0.25, 0.27, 0.27, 0.3, 0.27, 0.3, 0.3], fs: 9.5 });
  T(s, [run('Buyer savings = NMV × g ÷ (1 − g). ', { bold: true, color: C.plum }), run(`Meesho value = placed orders × (${pc(A.A8.value)} incremental × ${rs(SP.contribPerOrder, 1)} contribution + ${rs(M.c2m.rtoSavingPerOrder, 1)} saved on failed deliveries); orders = NMV ÷ ${rs(M.c2m.nmvPerOrder)} NMV per C2M order (page 10).`, {})],
    { x: b.x, y: b.y + 2.02, w: b.w, h: b.h - 2.02, fontSize: 8.5, valign: 'middle' });

  b = panel(s, [0.38, 0.52, 0.31, 0.48], 'Three sanity checks', { hc: C.coral });
  const chk = [
    [pc(Y4.nmv / M.eligibleNmv, 1), `Top-down: ${cr(Y4.nmv)} is ${pc(Y4.nmv / M.eligibleNmv, 1)} of the ${cr(M.eligibleNmv)} NMV in the nine C2M categories (${pc(A.A6.value)} of FY26 NMV [A6]), the same as the 12% seller capture.`],
    [`~${IN(Math.round(M.c2m.ordersPerDay / 10) * 10)}/day`, `Per seller: ${rs(M.yieldCr, 3)} cr a year ≈ ${IN(Math.round(M.c2m.ordersPerDay / 10) * 10)} orders placed a day, ≈ ${pc(M.c2m.shareOfOutput, 1)} of a ₹25 cr factory’s output, against ~25% idle capacity [S6].`],
    ['33×', `Average Meesho seller: ₹4.3 lakh NMV a year (₹41,560 cr ÷ 9.6 lakh). Only factories can reach ${rs(M.yieldCr, 3)} cr, which is why yield is the top sensitivity on page 10.`],
  ];
  chk.forEach(([n, t], k) => {
    const y = b.y + k * (b.h / 3);
    T(s, n, { x: b.x, y, w: 0.95, h: b.h / 3 - 0.05, fontSize: 15, bold: true, color: C.coral, valign: 'middle', fontFace: F.head });
    T(s, t, { x: b.x + 0.98, y, w: b.w - 0.98, h: b.h / 3 - 0.05, fontSize: 8.5, valign: 'middle' });
  });

  b = panel(s, [0.69, 0.52, 0.31, 0.48], 'Why now: fees converge, factories need orders');
  const tl = [['Apr 2025', 'Amazon: no referral fee under ₹300 [S14]'], ['Aug–Dec 2025', 'US tariff 50%: Tiruppur US orders −60 to −70% [S8]'], ['Nov 2025', 'Amazon and Flipkart: 0% under ₹1,000 [S14]'],
    ['8 Jul 2026', 'Flipkart: 0% on all fashion, any price [S14]'], ['Aug 2026', 'Panipat exports −50% [S9]'], ['Q1 FY27', 'Meesho: H2 bets run on a hard budget cap [S1]']];
  tl.forEach(([d, t], k) => {
    const y = b.y + k * ((b.h - 0.42) / tl.length);
    s.addShape(SH.OVAL, { x: b.x, y: y + 0.06, w: 0.12, h: 0.12, fill: { color: k % 2 ? C.coral : C.plum }, line: { color: C.white } });
    T(s, [run(`${d}  `, { bold: true, color: C.plum }), run(t, {})], { x: b.x + 0.18, y, w: b.w - 0.18, h: (b.h - 0.42) / tl.length, fontSize: 8.5, valign: 'middle' });
  });
  T(s, 'Rate cards are copied in a quarter. A cost-structure edge is not.', { x: b.x, y: b.y + b.h - 0.38, w: b.w, h: 0.38, fontSize: 9, bold: true, color: C.coral, valign: 'middle' });
}

// ================================================================== 5 · PRICE TRUTH
{
  const td = M.td;
  const s = page(3, {
    headline: `The price buyers actually pay sits ${pc(Math.min(...td.map((t) => 1 - t.dw / t.median)))}–${pc(Math.max(...td.map((t) => 1 - t.dw / t.median)))} below the listing median, so the gate screens on demand-weighted prices`,
    rail: 'SCREEN',
    band: `Decision: launch the Price Truth Index on delivered-order medians in 9 categories in weeks 1–3, at ₹0 capex. Owner: Pricing + Data Science · KPI: badge lift ≥ 12% vs holdout by Day 30.`,
    foot: `Sources: S10 team teardown (meesho.com search, 2 Oct 2026; 56 listings per query; reviews used as the demand weight) · S22   |   Prototype panel: synthetic, seeded data (fictional sellers)   |   Method: Appendix B`,
  });
  let b = panel(s, [0, 0, 0.60, 0.58], `Live teardown: ${M.tdAll} listings, 5 product types, index 100 = demand-weighted median`);
  const names = { 'men cotton briefs pack of 3': 'Men’s briefs, pack of 3', 'cotton ankle socks pack of 5': 'Ankle socks, pack of 5', 'cotton double bedsheet with 2 pillow covers': 'Bedsheet + 2 pillow covers', 'cotton bath towel': 'Cotton bath towel', 'stainless steel glass set of 6': 'Steel glasses, set of 6' };
  const order = td.slice().sort((p, q) => q.overstate - p.overstate);
  const ax0 = b.x + 1.95, axW = b.w - 1.95 - 1.25, lo = 60, hi = 230, X = (v) => ax0 + (v - lo) / (hi - lo) * axW;
  const rowH = (b.h - 0.62) / order.length;
  [80, 100, 140, 180, 220].forEach((v) => {
    s.addShape(SH.LINE, { x: X(v), y: b.y + 0.22, w: 0, h: rowH * order.length, line: { color: v === 100 ? C.plum : 'DCCFD7', width: v === 100 ? 1 : 0.5, dashType: v === 100 ? 'solid' : 'dash' } });
    T(s, String(v), { x: X(v) - 0.2, y: b.y + 0.24 + rowH * order.length, w: 0.4, h: 0.16, fontSize: 7.5, color: C.muted, align: 'center' });
  });
  T(s, 'Product (listings)', { x: b.x, y: b.y, w: 1.9, h: 0.2, fontSize: 8, bold: true, color: C.muted });
  T(s, 'Listing median above what buyers pay', { x: b.x + b.w - 1.22, y: b.y - 0.02, w: 1.22, h: 0.26, fontSize: 7.5, bold: true, color: C.muted, align: 'center' });
  order.forEach((t, k) => {
    const y = b.y + 0.24 + k * rowH, cyy = y + rowH / 2;
    T(s, [run(names[t.q], { bold: true, color: C.plum, breakLine: true }), run(`n = ${t.n} · ${rs(t.dw)} demand-weighted`, { color: C.muted, fontSize: 7.5 })], { x: b.x, y, w: 1.92, h: rowH, fontSize: 8.5, valign: 'middle' });
    const p25 = t.p25 / t.dw * 100, p75 = t.p75 / t.dw * 100, med = t.median / t.dw * 100;
    box(s, X(p25), cyy - 0.09, X(Math.min(p75, hi)) - X(p25), 0.18, 'E7D7E1', { round: true, r: 0.03 });
    s.addShape(SH.LINE, { x: X(92), y: cyy - 0.17, w: 0, h: 0.34, line: { color: C.coral, width: 2 } });
    s.addShape(SH.OVAL, { x: X(100) - 0.08, y: cyy - 0.08, w: 0.16, h: 0.16, fill: { color: C.plum }, line: { color: C.white, width: 0.75 } });
    s.addShape(SH.DIAMOND, { x: X(Math.min(med, hi)) - 0.09, y: cyy - 0.09, w: 0.18, h: 0.18, fill: { color: C.saffron }, line: { color: C.plum, width: 0.5 } });
    T(s, rs(t.median), { x: X(Math.min(med, hi)) + 0.1, y: cyy - 0.26, w: 0.5, h: 0.17, fontSize: 7.5, bold: true, color: C.plum });
    T(s, `+${pc(t.overstate)}`, { x: b.x + b.w - 1.15, y, w: 1.1, h: rowH, fontSize: 14, bold: true, color: t.overstate > 0.2 ? C.coral : C.muted, align: 'center', valign: 'middle', fontFace: F.head });
  });
  T(s, [run('● ', { color: C.plum }), run('demand-weighted median (reviews as weights)   ', {}), run('◆ ', { color: C.saffron }), run('listing median   ', {}), run('| ', { color: C.coral, bold: true }), run('8% gate   ', {}), run('▬ ', { color: 'C9B3C1' }), run('middle 50% of listings (P25–P75)', {})],
    { x: b.x, y: b.y + b.h - 0.2, w: b.w, h: 0.2, fontSize: 8, color: C.muted });

  b = panel(s, [0, 0.58, 0.31, 0.42], `Volume follows price: briefs (ρ = ${td[0].rho.toFixed(2)})`, { hc: C.coral });
  const bb = M.briefsBands;
  s.addChart(pres.charts.BAR, [
    { name: 'Share of listings', labels: bb.map((x) => x.label), values: bb.map((x) => Math.round(x.listingShare * 100)) },
    { name: 'Share of reviews', labels: bb.map((x) => x.label), values: bb.map((x) => Math.round(x.reviewShare * 100)) },
  ], {
    x: b.x - 0.05, y: b.y - 0.02, w: b.w + 0.1, h: b.h - 0.25, barDir: 'col', barGrouping: 'clustered', chartColors: [C.plum2, C.coral], showValue: true, dataLabelFontSize: 7, dataLabelColor: C.text, dataLabelPosition: 'outEnd',
    catAxisLabelFontSize: 7.5, catAxisLabelColor: C.text, valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: true, legendPos: 't', legendFontSize: 7.5, barGapWidthPct: 40, valAxisMaxVal: 50,
  });
  T(s, `Listings under ₹200: ${pc(bb[0].listingShare)} of the shelf, ${pc(bb[0].reviewShare)} of reviews (n = 56).`, { x: b.x, y: b.y + b.h - 0.22, w: b.w, h: 0.22, fontSize: 8.5, bold: true, color: C.coral });

  b = panel(s, [0.31, 0.58, 0.29, 0.42], 'Worked example, real prices (briefs 3-pack)');
  const wx = [
    ['Comparable-set median (demand-weighted)', rs(U.mkt), C.plum],
    ['Gate: 8% below', rs(U.gate), C.coral],
    [`Factory Direct floor (₹${U.c} making cost)`, `${rs(U.cols[3].floor)} → ${pc(U.cols[3].gap, 1)} ✓`, C.green],
    ['Reseller floor (buys via wholesaler)', `${rs(U.cols[0].floor)} → ${pc(U.cols[0].gap, 1)} ✕`, C.red],
    ['Catalogue: 18 of 24 live SKUs clear', '75% ≥ 60% → badge', C.green],
    ['3 SKUs at −30%, 21 at market', '13% < 60% → no badge', C.red],
  ];
  wx.forEach(([l, v, col], k) => {
    const y = b.y + k * (b.h / wx.length);
    T(s, l, { x: b.x, y, w: b.w * 0.56, h: b.h / wx.length, fontSize: 8.5, valign: 'middle' });
    T(s, v, { x: b.x + b.w * 0.56, y, w: b.w * 0.44, h: b.h / wx.length, fontSize: 9, bold: true, color: col, valign: 'middle', align: 'right' });
  });

  b = panel(s, [0.60, 0, 0.40, 0.50], 'Price Truth Index: the method');
  const steps = [
    ['Comparable set', 'Product type × pack size, e.g. men’s briefs, 3-pack'],
    ['Demand-weighted median', `Weighted by delivered orders (reviews in our teardown); a list-price median overstates by up to ${pc(Math.max(...td.map((t) => t.overstate)))}`],
    ['SKU gap', 'gap = (median − seller price) ÷ median'],
    ['Catalogue gate', '≥ 8% gap on ≥ 60% of live SKUs; sellers above ₹5 cr GMV; one loss-leader cannot buy the badge'],
    ['Dominant-seller fix', 'A seller with > 30% of a set’s orders is scored against the median without its own orders'],
    ['Badge + re-rank, with a holdout', 'Matched control; read at Day 30 (page 9); badge off if the gap falls below 4%'],
  ];
  steps.forEach(([h, t], k) => {
    const y = b.y + k * (b.h / steps.length);
    chip(s, b.x, y + 0.04, 0.26, 0.26, String(k + 1), k === 1 ? C.coral : C.plum, { size: 9 });
    T(s, [run(`${h}  `, { bold: true, color: k === 1 ? C.coral : C.plum }), run(t, {})], { x: b.x + 0.32, y, w: b.w - 0.32, h: b.h / steps.length, fontSize: 8.5, valign: 'middle' });
  });

  b = panel(s, [0.60, 0.50, 0.40, 0.50], 'Four verdicts, four actions (prototype, 180 synthetic sellers)', { hc: C.coral });
  table(s, [['Verdict', 'Sellers', 'Action'],
    [{ t: 'C2M-ready', b: true, c: C.green }, '62', { t: 'Badge + re-rank + Demand Brief', a: 'left' }],
    [{ t: 'Scale without price', b: true, c: C.red }, '84', { t: 'No badge; offer value-tier SKUs', a: 'left' }],
    [{ t: 'Loss-leader pattern', b: true, c: C.red }, '18', { t: 'No badge: the catalogue gate holds', a: 'left' }],
    [{ t: 'Near miss', b: true, c: C.amber }, '16', { t: 'Factory Node offer; re-score in 28 days', a: 'left' }],
  ], { x: b.x, y: b.y, w: b.w, colW: [1.45, 0.62, b.w - 2.07], rowH: 0.25, fs: 9 });
  [['180', 'sellers above ₹5 cr screened'], ['34%', 'pass the gate'], ['7 of 10', 'largest sellers fail']].forEach(([n, t], k) => {
    const x = b.x + k * (b.w / 3);
    T(s, n, { x, y: b.y + 1.34, w: b.w / 3 - 0.05, h: 0.36, fontSize: 17, bold: true, color: k === 2 ? C.coral : C.plum, align: 'center', valign: 'middle', fontFace: F.head });
    T(s, t, { x, y: b.y + 1.7, w: b.w / 3 - 0.05, h: 0.2, fontSize: 8, color: C.muted, align: 'center' });
  });
  T(s, [run('Size and price gap are unrelated (r = −0.18): ', { bold: true, color: C.coral }), run('the largest sellers are traders whose scale never became price. The same rules run unchanged on Meesho’s order tables.', {})],
    { x: b.x, y: b.y + 1.94, w: b.w, h: b.h - 1.94, fontSize: 8.5, valign: 'middle' });
}

// ================================================================== 6 · FACTORY DIRECT
{
  const cols = U.cols;
  const s = page(4, {
    headline: `Factory Direct takes unit operations and stock risk off the factory, cutting its lowest viable price from ${rs(cols[1].floor)} to ${rs(cols[3].floor)}`,
    rail: 'OPERATING MODEL',
    band: `Decision: open one partner-run Factory Node in Tiruppur after the Day-30 gate (${cr(A.A17.value.perNode)} set-up). Owner: Valmo + Category · KPI: 95% of batch orders shipped within 48 h of handover.`,
    foot: 'Sources: S11 (₹150 return fee, ₹0 RTO fee), S12, S13, S16, S19 (Press Note 2), S21, S26   |   Assumptions: A10, A11, A20, A22–A32 (making cost ₹80 to confirm in interviews)   |   Workings: Appendix C',
  });
  let b = panel(s, [0, 0, 1, 0.29], 'The Factory Direct flow: one manufacturer, end to end (the factory keeps title to its stock throughout)');
  const fl = [
    ['FaScaleUnbalanced', 'Price check', `Before listing: floor ${rs(cols[3].floor)} vs gate ${rs(U.gate)}: qualifies`],
    ['FaMapLocationDot', 'Demand Brief', 'District demand, price band, size mix; batches of 500+ units'],
    ['FaUserClock', 'Pre-order window', `Buyers prepay; ₹${A.A32.value} off for 7–8 day delivery; make orders + 15%`],
    ['FaWarehouse', 'Bulk handover', `One drop at the Factory Node; ${pc(A.A20.value.advance)} of value advanced via an NBFC`],
    ['FaTruckFast', 'Node runs unit ops', 'Pick, pack, ship; returns end at the node, graded and restocked'],
    ['FaIndianRupeeSign', 'Settlement', 'Balance 7 days after delivery: cash in ~11 days vs 45–60'],
  ];
  const fw = (b.w - 0.1 * 5) / 6;
  fl.forEach(([ic, h, t], k) => {
    const x = b.x + k * (fw + 0.1);
    box(s, x, b.y, fw, b.h, C.white, { line: k % 2 ? C.coral : C.plum, round: true, r: 0.05 });
    s.addShape(SH.OVAL, { x: x + 0.06, y: b.y + 0.06, w: 0.42, h: 0.42, fill: { color: k % 2 ? C.coral : C.plum }, line: { color: C.white } });
    icon(s, ic, x + 0.15, b.y + 0.15, 0.24);
    T(s, `${k + 1} · ${h}`, { x: x + 0.52, y: b.y + 0.06, w: fw - 0.56, h: 0.42, fontSize: 10, bold: true, color: k % 2 ? C.coral : C.plum, valign: 'middle' });
    T(s, t, { x: x + 0.08, y: b.y + 0.52, w: fw - 0.14, h: b.h - 0.56, fontSize: 8.5, valign: 'top' });
    if (k < 5) T(s, '›', { x: x + fw - 0.02, y: b.y + 0.05, w: 0.14, h: 0.42, fontSize: 18, bold: true, color: C.saffron, align: 'center', valign: 'middle' });
  });

  b = panel(s, [0, 0.29, 0.58, 0.71], 'Unit economics per 3-pack kept, one change per column (₹, Tiruppur briefs)');
  const rowsU = [
    ['Goods, net of resold returns', 'goods'], ['Unsold stock written down', 'unsold'], ['Logistics: forward + packing / node fee', 'logistics'],
    ['Customer-return fees (₹150 each)', 'returns'], ['Working capital (18% a year)', 'capital'],
  ];
  table(s, [
    ['', ...cols.map((x) => x.head)],
    [{ t: 'Scenario (one change per column)', fs: 8, i: true, c: C.muted }, ...cols.map((x) => ({ t: `${x.label}: ${x.sub}`, i: true, fs: 7.5, c: x.label === 'Proposed' ? C.coral : C.muted, b: x.label === 'Proposed' }))],
    ...rowsU.map(([l, k]) => [l, ...cols.map((x) => x[k].toFixed(1))]),
    [{ t: 'Cost per pack kept', b: true }, ...cols.map((x) => ({ t: x.cost.toFixed(1), b: true, c: C.plum }))],
    [{ t: 'Lowest viable price (9% margin)', b: true }, ...cols.map((x) => ({ t: rs(x.floor), b: true, fs: 11, c: C.plum }))],
    [{ t: `Gap vs ${rs(U.mkt)} demand-weighted median`, b: true }, ...cols.map((x) => ({ t: `${x.gap >= 0 ? '' : '−'}${pc(Math.abs(x.gap), 1)}`, b: true, c: x.gap >= 0.08 ? C.green : C.red }))],
    [{ t: `Clears the 8% gate (≤ ${rs(U.gate)})?`, b: true }, ...cols.map((x) => ({ t: x.passes ? '✓ yes' : '✕ no', b: true, c: C.white, f: x.passes ? C.green : C.red }))],
  ], { x: b.x, y: b.y, w: b.w, colW: [2.45, (b.w - 2.45) / 4, (b.w - 2.45) / 4, (b.w - 2.45) / 4, (b.w - 2.45) / 4], rowH: [0.34, 0.36, 0.25, 0.25, 0.25, 0.25, 0.25, 0.27, 0.31, 0.27, 0.27], fs: 9, hfs: 9 });
  const ty = b.y + 3.12;
  T(s, [
    run('Per 100 shipped: ', { bold: true, color: C.plum }), run(`${pc(A.A25.value.rto)} fail delivery (${pc(U.rtoPrepaid, 1)} when prepaid), ${pc(A.A25.value.ret)} of delivered returned; sellers pay no RTO fee. `, {}),
    run('Highest making cost that clears the gate: ', { bold: true, color: C.coral }), run(`${rs(U.ceilings.direct, 1)} → ${rs(U.ceilings.node, 1)} → ${rs(U.ceilings.batch, 1)} (+${pc(U.ceilings.batch / U.ceilings.direct - 1)}): the levers widen the pool of qualifying factories.`, {}),
  ], { x: b.x, y: ty, w: b.w, h: b.y + b.h - ty, fontSize: 8.5, valign: 'top' });

  b = panel(s, [0.58, 0.29, 0.42, 0.37], 'Why this operating model (✓ removes the barrier · – partly · ✕ no)', { hc: C.coral });
  const crit = ['Unit ops', 'Stock risk', 'Returns', 'FDI-legal', 'Low capex'];
  const models = [['Open marketplace: factory self-ships', 'xxxyy'], ['Fully managed: platform buys and holds stock', 'yyyxx'], ['Factory Direct: seller-owned stock at a partner node', 'yyyya']];
  const cw0 = 1.95, cwi = (b.w - cw0) / crit.length;
  crit.forEach((c, i) => T(s, c, { x: b.x + cw0 + i * cwi, y: b.y, w: cwi, h: 0.3, fontSize: 8.5, bold: true, color: C.plum, align: 'center', valign: 'middle' }));
  models.forEach(([m, marks], r) => {
    const y = b.y + 0.3 + r * 0.31;
    if (r === 2) box(s, b.x - 0.04, y - 0.02, b.w + 0.08, 0.31, 'FDE7E8', { round: true, r: 0.04 });
    T(s, m, { x: b.x, y, w: cw0 - 0.05, h: 0.3, fontSize: 8.5, bold: r === 2, color: r === 2 ? C.coral : C.text, valign: 'middle' });
    marks.split('').forEach((k, i) => sym(s, b.x + cw0 + i * cwi + cwi / 2 - 0.1, y + 0.05, k, 0.2));
  });
  T(s, 'Fully managed fails Press Note 2: an FDI marketplace may not own or control seller inventory [S19]. Temu itself moved US sellers to semi-managed (20% of US GMV, Q3 2024) [S16].', { x: b.x, y: b.y + 1.26, w: b.w, h: b.h - 1.26, fontSize: 8, italic: true, color: C.muted, valign: 'middle' });

  b = panel(s, [0.58, 0.66, 0.42, 0.34], 'The factory’s view: B2B today vs Factory Direct');
  table(s, [['', 'B2B to a distributor', 'Factory Direct'],
    ['Margin per pack', rs(U.b2bMarginPerPack, 1), { t: `${rs(U.directMarginPerPack, 1)} on a pre-order at ${rs(U.gate - A.A32.value)}`, b: true, c: C.green }],
    ['Unsold stock', 'None: made to order', { t: 'Only the 15% buffer', b: true }],
    ['Returns', 'None', { t: 'End at the node; pool caps losses', b: true }],
    ['Cash', '45–60 day terms', { t: '30% at handover, rest ~7 days', b: true }],
  ], { x: b.x, y: b.y, w: b.w, colW: [1.25, 1.5, b.w - 2.75], rowH: [0.22, 0.27, 0.24, 0.24, 0.24], fs: 8.5 });
}

// ================================================================== 7 · GLOBAL BENCHMARKS
{
  const s = page(5, {
    headline: 'Factory-direct works when platforms supply demand data and logistics; Shein Brazil squeezed price and kept 1 of 336 factories',
    rail: 'PRECEDENT',
    band: 'Decision: copy demand data, batching and seller-owned nodes, in that order; never ask a factory for a price cut. Owner: Strategy · KPI: factory retention ≥ 75% at Day 90.',
    foot: 'Sources: S1, S2, S15 KrASIA, S16 Tech Buzz China, S17 Reuters, S18 Inc42, S23 Xinhua, S24 Alibaba results, S25 AFP   |   RICE inputs: Appendix B · detailed KPI table: Appendix C',
  });
  let b = panel(s, [0, 0, 0.64, 0.60], 'Six cases: what each proves, with one dated number');
  const cards = [
    ['Pinduoduo', 'China · New Brand Initiative', 'C2M', 'Anonymised demand data handed to factories', '900+ factories, 2,200+ custom products, 115 mn+ orders by end-2019 [S15]', 'Copy: Demand Brief', C.coral],
    ['Taobao C2M', 'China · Taobao Deals / Taote, 2020', 'C2M', 'Consumer insight, product R&D and finance for factories', 'Target 10 bn new orders in 3 yrs [S23]; 280 mn annual buyers, Dec 2021 [S24]', 'Copy: batch prepayment', C.plum],
    ['Temu', 'Global · semi-managed', 'Logistics', 'Merchant keeps stock in a local warehouse; platform runs the storefront', 'Semi-managed = 20% of US GMV, Q3 2024; +80,000 merchants planned for 2025 [S16]', 'Copy: seller-owned node stock', C.plum],
    ['Shein', 'China · on-demand', 'Batching', 'Tests each new product in a small first batch, then restocks only what sells', '“Small initial batches of 100 to 200 items” (Shein to AFP, Mar 2024) [S25]', 'Copy: confirmed-order batches', C.plum],
    ['Shein Brazil', 'Brazil · local factories', 'AVOID', 'Asked factories for ~30% price cuts and faster delivery', '~$150 mn pledged for 2,000 factories; 336 signed; 1 producing by Feb 2026 [S17]', 'Avoid: price squeezes', C.red],
    ['Meesho + ONDC', 'India · H2 bets, MSME-TEAM', 'India', 'Valmo and Content Commerce began as capped H2 bets and are now core [S1]', 'Valmo: 50–55% of deliveries [S2]; MSME-TEAM: ₹277 cr to onboard 5 lakh MSMEs [S18]', 'Copy: H2 cap; co-fund camps', C.coral],
  ];
  const cwc = (b.w - 0.2) / 3, chh = (b.h - 0.1) / 2;
  cards.forEach(([n, sub, tag, mech, num, cp, col], k) => {
    const x = b.x + (k % 3) * (cwc + 0.1), y = b.y + Math.floor(k / 3) * (chh + 0.1);
    box(s, x, y, cwc, chh, C.white, { line: col, round: true, r: 0.05, lw: 1 });
    box(s, x + 0.06, y + 0.06, 1.25, 0.3, col, { round: true, r: 0.05 });
    T(s, n, { x: x + 0.06, y: y + 0.06, w: 1.25, h: 0.3, fontSize: 10, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: F.head });
    T(s, sub, { x: x + 1.36, y: y + 0.04, w: cwc - 1.4, h: 0.34, fontSize: 7.5, color: C.muted, valign: 'middle' });
    T(s, mech, { x: x + 0.08, y: y + 0.41, w: cwc - 0.16, h: 0.34, fontSize: 8.5, color: C.text, valign: 'top', italic: n === 'Shein' });
    T(s, num, { x: x + 0.08, y: y + 0.76, w: cwc - 0.16, h: chh - 0.76 - 0.32, fontSize: 8.5, bold: true, color: col === C.red ? C.red : C.plum, valign: 'top' });
    chip(s, x + 0.08, y + chh - 0.3, cwc - 0.16, 0.24, cp, col === C.red ? C.red : C.saffron, { size: 8.5, color: col === C.red ? C.white : C.plum });
  });

  b = panel(s, [0.64, 0, 0.36, 0.27], 'What we copy, in order', { hc: C.coral });
  const cp = [['Measure', 'the gap'], ['Share', 'demand'], ['Batch', 'on orders'], ['Stock', 'near buyers']];
  const chw = (b.w - 0.06) / 4;
  cp.forEach(([h, t], k) => {
    s.addShape(SH.CHEVRON, { x: b.x + k * chw, y: b.y + 0.05, w: chw + 0.04, h: b.h - 0.32, fill: { color: [C.plum, C.plum2, C.coral, C.saffron][k] }, line: { color: C.white, width: 1 } });
    T(s, [run(h, { bold: true, breakLine: true }), run(t, {})], { x: b.x + k * chw + 0.16, y: b.y + 0.05, w: chw - 0.18, h: b.h - 0.32, fontSize: 8.5, color: k === 3 ? C.plum : C.white, align: 'center', valign: 'middle' });
  });
  T(s, 'Pinduoduo/Taobao → Pinduoduo → Shein → Temu', { x: b.x, y: b.y + b.h - 0.24, w: b.w, h: 0.22, fontSize: 8, italic: true, color: C.muted, align: 'center' });

  b = panel(s, [0.64, 0.27, 0.36, 0.33], 'Pitfalls and our guardrail');
  const pf = [['Price squeeze (Shein Brazil)', 'The gate measures a gap that exists; no price asks'], ['Platform-owned stock (Temu full-managed)', 'Seller keeps title; node is an arm’s-length 3PL'], ['Order subsidies (group-buy era)', 'Impressions, never rupees per order'], ['Capex before demand', 'No node before the Day-30 gate']];
  pf.forEach(([p, g], k) => {
    const y = b.y + k * (b.h / pf.length);
    T(s, [run('✕ ', { color: C.red, bold: true }), run(p, { bold: true, color: C.text, breakLine: true }), run('✓ ', { color: C.green, bold: true }), run(g, { color: C.plum })], { x: b.x, y, w: b.w, h: b.h / pf.length, fontSize: 8.5, valign: 'middle' });
  });

  b = panel(s, [0, 0.60, 1, 0.40], 'RICE: 8 levers → build sequence (Reach = sellers touched in Year 2; Effort = person-months)');
  const rc = M.rice;
  table(s, [['#', 'Lever', 'Stage', 'Reach', 'Impact (0.25–3)', 'Confidence', 'Effort', 'RICE score', 'Year-1 cash', 'Needs first'],
    ...rc.map((x, i) => [String(i + 1), { t: x.name, b: true, c: C.plum, a: 'left' }, x.stage, IN(x.R), String(x.I), pc(x.C), String(x.E), { t: IN(x.score), b: true, c: i < 2 ? C.coral : C.plum }, x.y1 ? cr(x.y1) : '₹0',
      { t: { 'Prepaid pre-order batches': 'Demand Brief', 'Batch prepayment (NBFC)': 'Batches', 'Factory Node (partner 3PL)': 'Day-30 gate', 'Returns firewall pool': 'Factory Node', 'District Demand Brief': 'Co-ops', 'Cluster co-op onboarding': 'Price gate' }[x.name] ?? '—', fs: 8.5 }])],
    { x: b.x, y: b.y, w: b.w * 0.8, colW: [0.3, 2.3, 0.8, 0.7, 1.05, 0.9, 0.6, 0.85, 0.85, b.w * 0.8 - 8.35], rowH: [0.22, ...rc.map(() => 0.183)], fs: 8.5 });
  const rx = b.x + b.w * 0.8 + 0.1, rw = b.w * 0.2 - 0.1;
  T(s, [run('Sequence: ', { bold: true, color: C.coral, breakLine: true }), run('diagnostic and free first, capital last. RICE order already respects every dependency: batches need the brief, prepayment needs batches, the firewall needs the node.', { breakLine: true }), run(`Cheap first: the top two cost ₹0 and touch all ${IN(rc[0].R)} sellers.`, { bold: true, color: C.plum })],
    { x: rx, y: b.y, w: rw, h: b.h, fontSize: 8.5, valign: 'middle' });
}

// ================================================================== 8 · SUSTAINABLE SCALE-UP
{
  const grantCost = A.A19.value.perSeller / 1000 * A.A19.value.cpm;
  const subsidy = 10 * Math.round(M.c2m.ordersPerDay / 10) * 10 * 30;
  const s = page(6, {
    headline: `Impressions, not rupees: a ${rs(grantCost)} visibility grant fixes the cold start, and rules handle 90 of 93 interventions without people`,
    rail: 'SCALE-UP',
    band: 'Decision: switch on grants and the rulebook with the first 60 sellers; cap grants at 20% of category impressions. Owner: Growth + Data Science · KPI: ≥ 70% at cohort pace by Day 21.',
    foot: 'Sources: S1 (seller-success: “help new sellers gain visibility faster”), S2 Meesho Q4 FY26 call   |   Assumptions: A19 (₹75 per 1,000 impressions), category-manager capacity 40 reviews a month   |   Prototype: synthetic 60-seller pilot, fixed seed',
  });
  let b = panel(s, [0, 0, 0.63, 0.64], 'The manufacturer journey: what fires, when, and what we watch');
  const jr = [
    ['Qualify', 'Day 0', 'Badge on; re-rank inside the category', 'Passed the price gate', 'C2M badge', 'Gap ≥ 8% at onboarding'],
    ['Allocate', 'D0–D14', 'Starter impressions in Demand Brief districts', 'Onboarding', 'First orders where demand is', 'Orders vs cohort curve'],
    ['Rescue', 'D7, D14', '+25K impressions for 7 days (max 2 grants)', 'Orders < 60% of cohort median', 'WhatsApp: grant applied', 'Back in band by D21'],
    ['Diagnose', 'Daily', 'Health Score from five signals (page 9)', 'Every day', 'Weekly score card', 'Score 0–100'],
    ['Remedy', 'On trigger', 'Price nudge · QC hold · node offer · restock', '8 rule thresholds', 'One specific fix', 'Days to recover'],
    ['Graduate', 'D30+', 'Batch prepayment unlocked', 'Score ≥ 80 for 30 days', 'Cheaper working capital', '≥ 40% by D60'],
    ['Retain', 'D60+', 'Weekly brief; prepaid batches; Mall path', 'Graduated, gap held', 'Steady demand, fast cash', 'Active at D90 ≥ 75%'],
    ['Escalate', 'Exception', 'Category manager reviews the case', 'Score < 40 for 7 days after a fix', 'A call', '≤ 5 per 100 a month'],
  ];
  table(s, [['Stage', 'When', 'What Meesho does, automatically', 'Trigger', 'Seller sees', 'KPI target'], ...jr.map((r, i) => [{ t: r[0], b: true, c: i === 2 ? C.coral : C.plum }, r[1], { t: r[2], a: 'left' }, { t: r[3], a: 'left' }, { t: r[4], a: 'left' }, { t: r[5], b: true, a: 'left' }])],
    { x: b.x, y: b.y, w: b.w, colW: [0.72, 0.62, 2.25, 1.6, 1.2, b.w - 6.39], rowH: [0.24, ...jr.map(() => (b.h - 0.26) / jr.length)], fs: 8.5 });

  b = panel(s, [0.63, 0, 0.37, 0.28], 'The cold-start loop, in Meesho’s words', { hc: C.coral });
  T(s, [run('“If their quality is not that great, they do not get visibility for orders. And products that have very good quality continue to scale on the platform.”', { italic: true, color: C.plum, breakLine: true }), run('Vidit Aatrey, CEO, Q4 FY26 call [S2]', { fontSize: 8, color: C.muted })], { x: b.x, y: b.y, w: b.w, h: b.h * 0.62, fontSize: 9, valign: 'top' });
  T(s, 'A new factory needs orders to prove quality and quality to earn orders. Grants break that loop with traffic, not cash.', { x: b.x, y: b.y + b.h * 0.62, w: b.w, h: b.h * 0.38, fontSize: 8.5, bold: true, color: C.text, valign: 'middle' });

  b = panel(s, [0.63, 0.28, 0.37, 0.36], 'Grant economics: traffic, not cash');
  const ge = [['+25K', 'impressions for 7 days when orders < 60% of the cohort median at D7 or D14'], ['max 2', 'grants per seller; ≤ 20% of category impressions, hard cap'], [rs(grantCost), `per seller at most (${IN(A.A19.value.perSeller)} impressions × ₹${A.A19.value.cpm} per 1,000) [A19]`], [`${Math.round(subsidy / grantCost)}×`, `cheaper than a ₹10-per-order subsidy for 30 days (${rs(subsidy)} at ~${IN(Math.round(M.c2m.ordersPerDay / 10) * 10)} orders a day)`]];
  ge.forEach(([n, t], k) => {
    const y = b.y + k * (b.h / ge.length);
    T(s, n, { x: b.x, y, w: 0.85, h: b.h / ge.length, fontSize: 13, bold: true, color: k === 3 ? C.coral : C.plum, valign: 'middle', fontFace: F.head });
    T(s, t, { x: b.x + 0.88, y, w: b.w - 0.88, h: b.h / ge.length, fontSize: 8.5, valign: 'middle' });
  });

  b = panel(s, [0, 0.64, 0.38, 0.36], 'One seller’s first 37 days (prototype, fictional Kavin Knit Mills)', { hc: C.coral });
  const ev = [['Day 0', 'Badge on; first batch handed over at the node'], ['Day 7', 'Orders at 41% of the cohort median (floor 60%): a grant fires, nobody calls'], ['Day 8+', 'Orders recover into the cohort band; score climbs past 80'], ['Day 37', 'Graduates: batch prepayment unlocked']];
  ev.forEach(([d, t], k) => {
    const y = b.y + k * (b.h / ev.length);
    chip(s, b.x, y + 0.04, 0.62, b.h / ev.length - 0.08, d, k === 1 ? C.coral : C.plum, { size: 8.5 });
    T(s, t, { x: b.x + 0.7, y, w: b.w - 0.7, h: b.h / ev.length, fontSize: 8.5, valign: 'middle' });
  });

  b = panel(s, [0.38, 0.64, 0.25, 0.36], 'Scales without headcount');
  bigNum(s, b.x, b.y + 0.02, 0.7, '90:3', { size: 13 });
  T(s, 'automated vs human actions in the simulated 60-seller pilot', { x: b.x + 0.76, y: b.y, w: b.w - 0.76, h: 0.74, fontSize: 8.5, valign: 'middle' });
  T(s, [run('~910 sellers per category manager ', { bold: true, color: C.coral }), run('= 40 reviews a month ÷ (3 escalations ÷ 68 seller-months). ', {}), run('1,400 sellers need ~2 reviewers, not ~70 account managers at 1 per 20.', { bold: true, color: C.plum })],
    { x: b.x, y: b.y + 0.8, w: b.w, h: b.h - 0.8, fontSize: 8.5, valign: 'middle' });

  b = panel(s, [0.63, 0.64, 0.37, 0.36], 'Explicitly rejected', { hc: C.coral });
  const rj = [['Order subsidy or paid boosts', 'buys volume, not conviction; stops when funding stops'], ['Account manager per seller', 'works at 20 sellers, breaks at 200'], ['Onboarding by turnover', 'the brief’s own diagnosis: scale is not price'], ['Weakening the quality gate', 'grants target traffic, never ranking rules']];
  rj.forEach(([h, t], k) => {
    const y = b.y + k * (b.h / rj.length);
    T(s, [run('✕ ', { color: C.red, bold: true }), run(`${h}: `, { bold: true, color: C.plum }), run(t, {})], { x: b.x, y, w: b.w, h: b.h / rj.length, fontSize: 8.5, valign: 'middle' });
  });
}

// ================================================================== 9 · METRICS & KPIs
{
  const s = page(7, {
    headline: 'Nine funnel KPIs and a daily Health Score tell Meesho by Day 30 whether to fund, tighten or stop C2M',
    rail: 'MEASUREMENT',
    band: 'Decision: instrument the north star and the Health Score before the first badge goes live. Owner: Data Science · KPI: Day-30 readout on Day 31 with a fund, tighten or stop call.',
    foot: 'Sources: S1 (H2 graduation on adoption and retention), S22   |   Targets are proposed pilot thresholds, recalibrated on the first cohort; Health Score weights and thresholds run in the prototype (src/config.js)   |   Power calculation: Appendix B',
  });
  let b = panel(s, [0, 0, 0.55, 0.64], 'KPI tree: onboarding → activation → retention, with guardrails');
  box(s, b.x, b.y, b.w, 0.5, C.plum, { round: true, r: 0.05 });
  T(s, [run('NORTH STAR · Price-competitive C2M NMV', { bold: true, color: C.saffron, breakLine: true }), run(`NMV from sellers whose catalogue still clears the 8% gate · target ${cr(M.ladder[1].nmv)} run-rate at Year-1 exit, ${cr(Y4.nmv)} by Year 4`, { color: C.white })],
    { x: b.x + 0.1, y: b.y, w: b.w - 0.2, h: 0.5, fontSize: 9, align: 'center', valign: 'middle' });
  const kt = [
    ['ONBOARDING', C.plum2, [['Qualified → listed', '≥ 50% in 30 days'], ['Days to first live listing', '≤ 7'], ['First batch committed', '≤ 14 days']]],
    ['ACTIVATION', C.coral, [['Orders at D7 / D14', '≥ 60% of cohort median'], ['First-30-day orders', '≥ cohort p50 for 70%'], ['Days to 10th order', '≤ 10']]],
    ['RETENTION', C.plum, [['Active at D90', '≥ 75%'], ['Still clear the gate at D14 / D30', '≥ 70%'], ['Graduated by D60', '≥ 40%']]],
  ];
  const kw = (b.w - 0.2) / 3;
  kt.forEach(([h, col, items], k) => {
    const x = b.x + k * (kw + 0.1), y = b.y + 0.6;
    chip(s, x, y, kw, 0.26, h, col, { size: 9 });
    items.forEach(([l, t], j) => {
      box(s, x, y + 0.32 + j * 0.5, kw, 0.45, C.white, { line: col, round: true, r: 0.04 });
      T(s, [run(l, { color: C.text, breakLine: true }), run(t, { bold: true, color: col })], { x: x + 0.06, y: y + 0.32 + j * 0.5, w: kw - 0.12, h: 0.45, fontSize: 8.5, valign: 'middle' });
    });
  });
  const gy = b.y + 0.6 + 0.32 + 3 * 0.5 + 0.05;
  box(s, b.x, gy, b.w, b.y + b.h - gy, C.fill2, { line: C.saffron, round: true, r: 0.04 });
  T(s, [run('Guardrails and P&L links: ', { bold: true, color: C.plum }), run(`category NMV ≥ pre-period · badged ≤ 20% of category impressions · quality returns ≤ 1.5× norm · escalations ≤ 5 per 100 sellers a month · prepaid share of C2M orders ≥ ${pc(A.A10.value + (1 - A.A10.value) * SP.prepaid, 1)} · failed deliveries ${(M.c2m.failDrop * 100).toFixed(1)} pts below the category`, {})],
    { x: b.x + 0.08, y: gy, w: b.w - 0.16, h: b.y + b.h - gy, fontSize: 8.5, valign: 'middle' });

  b = panel(s, [0.55, 0, 0.45, 0.36], 'C2M Seller Health Score: 0–100, daily');
  const hs = [['30%', 'Price gap held', 'today’s gap ÷ gap at onboarding'], ['25%', 'Order pace', '14-day orders ÷ cohort median (0.3 → 0, 1.0 → 100)'], ['20%', 'Quality returns', '≤ 1× category norm = 100, 2× = 0'], ['15%', 'On-time dispatch', '7-day SLA: 80% → 0, 97% → 100'], ['10%', 'In-stock', 'live SKUs in stock: 50% → 0, 95% → 100']];
  hs.forEach(([w, h, t], k) => {
    const y = b.y + k * ((b.h - 0.3) / hs.length);
    chip(s, b.x, y + 0.03, 0.5, (b.h - 0.3) / hs.length - 0.06, w, k === 0 ? C.coral : C.plum, { size: 9 });
    T(s, [run(`${h}  `, { bold: true, color: C.plum }), run(t, {})], { x: b.x + 0.56, y, w: b.w - 0.56, h: (b.h - 0.3) / hs.length, fontSize: 8.5, valign: 'middle' });
  });
  T(s, [run('≥ 80 for 30 days → graduate · ', { bold: true, color: C.green }), run('< 40 for 7 days after a fix → a person', { bold: true, color: C.red })], { x: b.x, y: b.y + b.h - 0.26, w: b.w, h: 0.26, fontSize: 8.5, valign: 'middle' });

  b = panel(s, [0.55, 0.36, 0.45, 0.28], 'Rulebook: 9 automatic actions, 1 human', { hc: C.coral });
  const rb = [['Orders < 60% of cohort median at D7 / D14', 'Impression grant'], ['Gap < 8% for 7 days', 'Price-drift nudge'], ['Gap < 4% for 3 days', 'Badge off; back after 7 days ≥ 8%'], ['Quality returns > 1.5× norm', 'Badge suspended + QC'],
    ['On-time dispatch < 90% over 7 days', 'Offer Factory Node'], ['In-stock < 70% for 3 days', 'Restock nudge from the brief'], ['Score ≥ 80 for 30 days', 'Graduate: prepayment'], ['Score < 40 after a fix', 'Category manager']];
  rb.forEach(([t, a], k) => {
    const x = b.x + (k % 2) * (b.w / 2), y = b.y + Math.floor(k / 2) * (b.h / 4);
    T(s, [run(t, { color: C.text, breakLine: true }), run(`→ ${a}`, { bold: true, color: k === 7 ? C.red : C.plum })], { x, y, w: b.w / 2 - 0.05, h: b.h / 4, fontSize: 8, valign: 'middle' });
  });

  b = panel(s, [0, 0.64, 0.55, 0.36], 'Day-30 readout: fund, tighten or stop', { hc: C.coral });
  table(s, [['Design', 'Rule'],
    [`${M.exp.sellers} badged sellers vs a matched holdout, ${M.exp.days} days`, `Standard error ≈ ${(M.exp.se * 100).toFixed(1)} pts → detectable lift ≈ ${(M.exp.mde * 100).toFixed(1)}% at 80% power`],
    [{ t: 'Fund', b: true, c: C.green }, 'NMV per live SKU ≥ 12% above holdout (interval > 0) and ≥ 70% still clear at D14'],
    [{ t: 'Tighten', b: true, c: C.amber }, 'Lift < 12%: raise the gate to a 10% gap and re-run'],
    [{ t: 'Stop', b: true, c: C.red }, 'Gap decays: badge off, no node money released'],
  ], { x: b.x, y: b.y, w: b.w * 0.66, colW: [1.7, b.w * 0.66 - 1.7], rowH: [0.22, 0.38, 0.32, 0.26, 0.26], fs: 8.5 });
  s.addImage({ path: AS('shot_day30_chart.png'), x: b.x + b.w * 0.67, y: b.y, w: b.w * 0.33, h: b.w * 0.33 * 822 / 1566 });
  T(s, 'Prototype: base +18.2% → fund · weak +4.7% → tighten · decay → stop', { x: b.x + b.w * 0.67, y: b.y + b.w * 0.33 * 822 / 1566 + 0.02, w: b.w * 0.33, h: 0.4, fontSize: 7.5, italic: true, color: C.muted });

  b = panel(s, [0.55, 0.64, 0.45, 0.36], 'Cadence and owners');
  table(s, [['When', 'What', 'Owner'],
    ['Daily', 'Rules run, grants fire, scores update', 'Data Science'],
    ['Weekly', 'KPI review; gate re-score of every badged seller', 'Category, Growth'],
    ['Monthly', 'Recalibrate weights and thresholds', 'Pricing + DS'],
    ['Quarterly', 'H2 review: adoption and retention decide graduation to H1 [S1]', 'Finance'],
  ], { x: b.x, y: b.y, w: b.w, colW: [0.8, b.w - 2.1, 1.3], rowH: [0.22, 0.3, 0.3, 0.3, 0.38], fs: 8.5 });
}

// ================================================================== 10 · BUSINESS CASE
{
  const f = FN, yrs = [0, 1, 2, 3, 4];
  const s = page(8, {
    headline: `${cr(f.npv, 0)} NPV at 12% and payback in Year ${f.payback}; NPV stays positive down to ${pc(M.be.yieldScale)} of planned seller yield`,
    rail: 'FINANCIAL CASE',
    band: `Decision: approve ${cr(f.cashY1)} cash for Year 1 as a capped H2 bet, released at the Day-30 and Day-90 gates. Owner: Finance · KPI: Year-1 C2M NMV ≥ ${cr(f.nmv[0], 0)}.`,
    foot: `Sources: S1 (₹531 cr contribution on 725 mn placed orders; prepaid 37%; NMV ₹11,614 cr on GMV ₹19,054 cr), S11, S13   |   NPV: t = 1..5, year-end, no terminal value · Year NMV uses average active sellers; page 4 shows exit run-rates (Year 4: ₹${IN(FN.nmv[3], 0)} cr vs ₹${IN(Y4.nmv, 0)} cr)`,
  });
  let b = panel(s, [0, 0, 0.56, 0.68], 'Five-year case (₹ cr, nominal; NPV = sum of the PV row)');
  const L = f.lines, d1 = (x) => x.toFixed(1);
  const pvShown = f.net.map((x, i) => Math.round(Math.round(x * 10) / 10 / 1.12 ** (i + 1) * 10) / 10);
  if (Math.abs(pvShown.reduce((p, q) => p + q, 0) - Math.round(f.npv * 10) / 10) > 0.001) throw new Error(`PV row ${pvShown} does not sum to NPV ${f.npv}`);
  const rows = [
    ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    ['Average active sellers [A3]', ...A.A3.value.map((x) => IN(x))],
    ['C2M NMV, year average [A4]', ...f.nmv.map((x) => IN(x, 0))],
    ['Placed orders (mn)', ...f.orders.map((x) => (x / 1e6).toFixed(0))],
    [{ t: `Incremental orders × ${rs(SP.contribPerOrder, 1)} [A8]`, c: C.green }, ...f.benIncr.map(d1)],
    [{ t: `Fewer failed deliveries × ₹${A.A12.value} [A11]`, c: C.green }, ...f.benRto.map(d1)],
    [{ t: 'Benefit to Meesho', b: true, c: C.green }, ...f.benefit.map((x) => ({ t: d1(x), b: true, c: C.green }))],
    ['People [A13, A14]', ...L.people.map(d1)],
    ['Cluster onboarding [A15]', ...L.onboarding.map(d1)],
    ['Demand Brief [A16]', ...L.briefs.map(d1)],
    ['Factory Nodes [A17]', ...L.nodes.map(d1)],
    ['Returns pool, grants, first-loss [A18–A20]', ...yrs.map((i) => d1(L.returnsPool[i] + L.grants[i] + L.firstLoss[i] + L.preorderTopUp[i]))],
    [{ t: 'Programme cost', b: true, c: C.red }, ...f.cost.map((x) => ({ t: d1(x), b: true, c: C.red }))],
    [{ t: 'Net cash flow', b: true }, ...f.net.map((x) => ({ t: nm(x), b: true, c: x < 0 ? C.red : C.plum }))],
    [{ t: 'PV at 12%', b: true }, ...pvShown.map((x) => ({ t: nm(x), b: true, c: x < 0 ? C.red : C.plum }))],
  ];
  table(s, rows, { x: b.x, y: b.y, w: b.w * 0.74, colW: [2.15, ...yrs.map(() => (b.w * 0.74 - 2.15) / 5)], rowH: [0.21, ...rows.slice(1).map(() => 0.212)], fs: 8.5 });
  const nx = b.x + b.w * 0.74 + 0.1, nw = b.w * 0.26 - 0.1;
  box(s, nx, b.y, nw, b.h, C.plum, { round: true, r: 0.05 });
  const kv = [['NPV at 12%', cr(f.npv), C.saffron, 20], ['NPV at 15%', cr(f.npvStress), C.white, 14], ['IRR', pc(f.irr), C.white, 14], ['Payback', `Year ${f.payback}`, C.white, 14], ['Discounted payback', `Year ${f.dpayback}`, C.white, 12], ['Year-1 cash (+ people)', `${cr(f.cashY1)} (+${cr(L.people[0])})`, C.white, 11]];
  kv.forEach(([k, v, col, fs], i) => {
    const y = b.y + 0.06 + i * ((b.h - 0.1) / kv.length);
    T(s, k, { x: nx + 0.08, y, w: nw - 0.16, h: 0.18, fontSize: 8, color: 'E9D5E3' });
    T(s, v, { x: nx + 0.08, y: y + 0.17, w: nw - 0.16, h: (b.h - 0.1) / kv.length - 0.2, fontSize: fs, bold: true, color: col, valign: 'middle', fontFace: F.head });
  });

  b = panel(s, [0.56, 0, 0.44, 0.38], `Sensitivity: NPV with each driver at −20% / +20% (base ${cr(f.npv, 0)})`, { hc: C.coral });
  const tor = M.tornado, mx = Math.max(...tor.map((t) => Math.max(Math.abs(t.lo - f.npv), Math.abs(t.hi - f.npv))));
  const tx0 = b.x + 2.15, tw = b.w - 2.2, mid = tx0 + tw / 2, rh = (b.h - 0.3) / tor.length;
  s.addShape(SH.LINE, { x: mid, y: b.y, w: 0, h: rh * tor.length, line: { color: C.plum, width: 1 } });
  tor.forEach((t, k) => {
    const y = b.y + k * rh;
    T(s, t.label, { x: b.x, y, w: 2.1, h: rh, fontSize: 8.5, valign: 'middle', bold: k === 0, color: k === 0 ? C.coral : C.text });
    const lo = Math.min(t.lo, t.hi), hi = Math.max(t.lo, t.hi);
    const xl = mid - (f.npv - lo) / mx * (tw / 2 - 0.35), xr = mid + (hi - f.npv) / mx * (tw / 2 - 0.35);
    box(s, xl, y + rh * 0.2, mid - xl, rh * 0.6, C.red);
    box(s, mid, y + rh * 0.2, xr - mid, rh * 0.6, C.green);
    T(s, IN(lo, 0), { x: xl - 0.4, y, w: 0.38, h: rh, fontSize: 8, bold: true, align: 'right', valign: 'middle' });
    T(s, IN(hi, 0), { x: xr + 0.03, y, w: 0.38, h: rh, fontSize: 8, bold: true, valign: 'middle' });
  });
  T(s, 'Bars show NPV (₹ cr) when one driver moves 20% against or in favour of the plan; programme cost is plotted so that left = worse.', { x: b.x, y: b.y + b.h - 0.28, w: b.w, h: 0.28, fontSize: 7.5, italic: true, color: C.muted, valign: 'middle' });

  b = panel(s, [0.56, 0.38, 0.44, 0.30], 'Break-even and scenarios');
  T(s, [run(`NPV = 0 at ${pc(M.be.yieldScale)} of planned seller yield (${pc(M.be.benefitShare)} of planned benefit). `, { bold: true, color: C.coral }), run(`Still positive with zero incremental orders (${cr(M.be.zeroIncr, 0)}) or with no failed-delivery saving (${cr(M.be.noRto, 0)}): each lever alone almost repays the programme.`, {})],
    { x: b.x, y: b.y, w: b.w, h: 0.44, fontSize: 8.5, valign: 'middle' });
  const sc = [['Bear', M.scen.bear, C.red], ['Base', M.scen.base, C.plum], ['Bull', M.scen.bull, C.green]];
  const scw = (b.w - 0.2) / 3;
  sc.forEach(([n, v, col], k) => {
    const x = b.x + k * (scw + 0.1);
    box(s, x, b.y + 0.48, scw, b.h - 0.48, C.white, { line: col, round: true, r: 0.04 });
    T(s, [run(`${n}  `, { bold: true, color: col }), run(cr(v.npv, 0), { bold: true, color: col, fontSize: 13 })], { x: x + 0.05, y: b.y + 0.48, w: scw - 0.1, h: 0.3, fontSize: 9, valign: 'middle', align: 'center' });
    T(s, v.note, { x: x + 0.05, y: b.y + 0.76, w: scw - 0.1, h: b.h - 0.8, fontSize: 7.5, color: C.muted, align: 'center', valign: 'top' });
  });

  b = panel(s, [0, 0.68, 0.56, 0.32], 'From Meesho’s per-order economics (Q1 FY27) to a C2M order');
  const pe = [
    [rs(SP.gmvPerOrder), 'GMV per placed order', `C2M: ${rs(M.c2m.gmvPerOrder)} (−${pc(A.A9.value)}) [A9]`],
    [pc(SP.nmvGmv), 'NMV ÷ GMV', `C2M: ${pc(M.c2m.nmvGmv, 1)} (+${(M.c2m.failDrop * 100).toFixed(1)} pts fewer failures)`],
    [pc(SP.prepaid), 'Prepaid share of shipped orders', `C2M: ${pc(A.A10.value + (1 - A.A10.value) * SP.prepaid, 1)} with ${pc(A.A10.value)} pre-orders [A10]`],
    [rs(SP.contribPerOrder, 1), 'Contribution per placed order', `Value per C2M order: ${pc(A.A8.value)} × ${rs(SP.contribPerOrder, 1)} + ${rs(M.c2m.rtoSavingPerOrder, 1)} = ${rs(A.A8.value * SP.contribPerOrder + M.c2m.rtoSavingPerOrder, 1)}`],
  ];
  const pw = b.w / pe.length;
  pe.forEach(([n, l, t], k) => {
    const x = b.x + k * pw;
    T(s, n, { x, y: b.y, w: pw - 0.08, h: 0.42, fontSize: 18, bold: true, color: C.plum, fontFace: F.head, valign: 'middle' });
    T(s, l, { x, y: b.y + 0.42, w: pw - 0.08, h: 0.22, fontSize: 8.5, bold: true, color: C.text });
    T(s, t, { x, y: b.y + 0.66, w: pw - 0.1, h: b.h - 0.66, fontSize: 8.5, color: C.coral, bold: true });
  });

  b = panel(s, [0.56, 0.68, 0.44, 0.32], 'What changed since Round 1, and how money is released', { hc: C.coral });
  T(s, [run(`Round 1: ₹156 cr NPV counted contribution on every C2M order. `, { bold: true, color: C.plum }), run(`Round 2 counts only the ${pc(A.A8.value)} that are incremental, plus fewer failed deliveries (${cr(f.npv, 0)}); if every order were incremental: ${cr(M.allIncremental, 0)}.`, {})],
    { x: b.x, y: b.y, w: b.w, h: 0.52, fontSize: 8.5, valign: 'top' });
  const mr = [['Day 0–30', '₹0: badge test on existing data'], ['Day 31–90', `${cr(M.gates.d90)}: 2 clusters, Brief build, 1 node, pool seed`], ['Q2–Q4', `${cr(M.gates.rest)}: 3 clusters, 5 nodes, Brief run`]];
  mr.forEach(([p, t], k) => {
    const y = b.y + 0.56 + k * ((b.h - 0.56) / 3);
    chip(s, b.x, y + 0.02, 0.85, (b.h - 0.56) / 3 - 0.05, p, [C.green, C.amber, C.coral][k], { size: 8 });
    T(s, t, { x: b.x + 0.92, y, w: b.w - 0.92, h: (b.h - 0.56) / 3, fontSize: 8.5, valign: 'middle' });
  });
}
// ================================================================== 11 · ROADMAP & RISKS
{
  const s = page(9, {
    headline: `Three gated phases take C2M from a ₹0 price test to ${IN(M.SOM)} factories; Year 1 needs ${cr(FN.cashY1)} of capped cash`,
    rail: 'EXECUTION',
    band: `Ask: approve the ₹0 Day-30 test now and a capped H2 budget of ${cr(FN.cashY1)} for Year 1, released only when the Day-30 and Day-90 gates pass.`,
    foot: 'Sources: S1 (H2: hard budget cap, graduation on adoption and retention), S19 (Press Note 2; E-Commerce Amendment Rules 2026 in force 1 Jan 2027), S26   |   Compliance by design: Appendix C   |   Dates assume Day 0 = Mon 2 Nov 2026',
  });
  let b = panel(s, [0, 0, 0.66, 0.60], 'Phase × workstream: a concrete action in every cell');
  const ph = ['Days 0–30 · prove the gap', 'Days 31–90 · pilot', 'Q2–Q4 · Wave 2', 'Years 2–4 · scale'];
  const ws = [
    ['Price screen', 'Pricing', ['Medians in 9 categories; badge + holdout', 'Weekly re-score; badge-off rule live', 'Gate in all Wave 2 categories', 'Gate is the default listing check']],
    ['Supply', 'Category', ['Shortlist C2M-ready sellers', 'Tiruppur + Panipat co-ops: 60 factories', '+ Ludhiana, Rajkot, Erode: 450', '12 clusters: 1,400 factories']],
    ['Demand', 'Data Science', ['Brief prototype on order data', 'Briefs live in 5 categories', 'Pre-order window in all briefs', 'Briefs refresh weekly, all 9']],
    ['Operations', 'Valmo', ['Partner-warehouse quotes, Tiruppur', '1 Factory Node (after Day 30)', '6 nodes, returns end at nodes', '12 nodes, one per cluster']],
    ['Money', 'Finance', ['₹0 capex', 'NBFC partner; 30% advances', 'Returns pool; first-loss 1%', 'Graduate to H1 budget']],
    ['Scale-up rules', 'Growth', ['Health Score baseline', 'Grants + rulebook live', '≤ 2 reviewers per 1,000 sellers', 'Meesho Mall path for graduates']],
  ];
  table(s, [['Workstream', 'Owner', ...ph], ...ws.map(([w, o, cells]) => [{ t: w, b: true, c: C.plum }, { t: o, fs: 8 }, ...cells.map((c) => ({ t: c, a: 'left' }))]),
    [{ t: 'Gate', b: true, c: C.white, f: C.coral }, { t: '', f: C.coral }, { t: 'Day 30: lift ≥ 12%, ≥ 70% still clear', b: true, c: C.white, f: C.coral }, { t: 'Day 90: 3 of 4: SLA, returns at node, retention ≥ 70%, category NMV ≥ base', b: true, c: C.white, f: C.coral }, { t: 'Each wave opens only if the last held its Day-90 numbers', b: true, c: C.white, f: C.coral }, { t: 'H2 → H1 on adoption and retention [S1]', b: true, c: C.white, f: C.coral }]],
    { x: b.x, y: b.y, w: b.w, colW: [1.05, 0.85, (b.w - 1.9) / 4, (b.w - 1.9) / 4, (b.w - 1.9) / 4, (b.w - 1.9) / 4], rowH: [0.25, ...ws.map(() => 0.35), 0.46], fs: 8.5 });

  b = panel(s, [0, 0.60, 0.66, 0.40], 'KPI targets by phase (same denominators throughout)', { hc: C.coral });
  const L = M.ladder;
  table(s, [['KPI', 'Day 30', 'Day 90', 'Year-1 exit', 'Year-4 exit'],
    ['Active C2M sellers', 'Shortlist', IN(L[0].sellers), IN(L[1].sellers), IN(L[2].sellers)],
    ['Run-rate C2M NMV', '—', cr(L[0].nmv), cr(L[1].nmv), cr(L[2].nmv)],
    ['C2M NMV still clearing the gate', '≥ 70%', '≥ 70%', '≥ 75%', '≥ 80%'],
    ['Prepaid share of C2M orders', '—', `≥ ${pc(SP.prepaid)}`, `≥ ${pc(A.A10.value + (1 - A.A10.value) * SP.prepaid, 1)}`, `≥ ${pc(A.A10.value + (1 - A.A10.value) * SP.prepaid, 1)}`],
    ['Factory retention at Day 90', '—', '≥ 70%', '≥ 75%', '≥ 75%'],
    ['Cumulative programme cash', '₹0', cr(M.gates.d90), cr(FN.cashY1), cr(FN.cost.slice(0, 4).reduce((p, q) => p + q, 0) - FN.lines.people.slice(0, 4).reduce((p, q) => p + q, 0))],
  ], { x: b.x, y: b.y, w: b.w, colW: [2.6, (b.w - 2.6) / 4, (b.w - 2.6) / 4, (b.w - 2.6) / 4, (b.w - 2.6) / 4], rowH: [0.22, ...Array(6).fill((b.h - 0.24) / 6)], fs: 8.5 });

  b = panel(s, [0.66, 0, 0.34, 0.56], 'Top risks, sorted by likelihood × impact', { hc: C.coral });
  const rk = [['The gap was a promotion', 'H', 'H', 'Day-30 stop rule; badge off below 4%', 'Pricing'], ['Export recovery pulls factories back', 'H', 'M', 'Batches fill idle capacity between export runs', 'Category'],
    ['Quality falls with price', 'M', 'H', 'Suspend at > 1.5× return norm; QC hold', 'Category'], ['Node or advances read as inventory control', 'L', 'H', 'Seller keeps title; NBFC lends; 3PL fees at arm’s length', 'Legal'], ['Re-rank starves resellers', 'L', 'M', '≤ 20% of category impressions; category NMV guardrail', 'Growth']];
  table(s, [['Risk', 'L', 'I', 'Guardrail', 'Owner'], ...rk.map((r) => [{ t: r[0], b: true, c: C.plum }, { t: r[1], b: true, c: r[1] === 'H' ? C.red : r[1] === 'M' ? C.amber : C.green }, { t: r[2], b: true, c: r[2] === 'H' ? C.red : C.amber }, { t: r[3], a: 'left' }, { t: r[4], fs: 8 }])],
    { x: b.x, y: b.y, w: b.w, colW: [1.25, 0.25, 0.25, b.w - 2.4, 0.65], rowH: [0.22, ...rk.map(() => (b.h - 0.24) / rk.length)], fs: 8.5 });

  b = panel(s, [0.66, 0.56, 0.34, 0.44], 'The ask');
  T(s, [
    run('Budget  ', { bold: true, color: C.coral }), run(`${cr(FN.cashY1)} cash in Year 1 (+${cr(FN.lines.people[0])} people), capped as an H2 bet; ₹0 until Day 30`, { breakLine: true }),
    run('Decisions  ', { bold: true, color: C.coral }), run('(1) run the Day 0–30 badge test with a holdout; (2) name owners in Pricing, Category, Valmo, Finance; (3) sign a Tiruppur partner warehouse and an NBFC; (4) publish the price-gap badge as a ranking parameter before 1 Jan 2027', { breakLine: true }),
    run('Dates  ', { bold: true, color: C.coral }), run('Day 0: 2 Nov 2026 · Day 30: 2 Dec 2026 · Day 90: 31 Jan 2027', { breakLine: true }),
    run('Go / no-go  ', { bold: true, color: C.coral }), run('badged NMV per live SKU ≥ 12% above holdout, ≥ 70% still clearing at D14', {}),
  ], { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 9, valign: 'top', paraSpaceAfter: 4 });
}

// ================================================================== 12 · APPENDIX A: PRODUCT WALKTHROUGH
{
  const s = page(-1, {
    label: 'Appendix A · Product walkthrough',
    headline: 'The working prototype runs every rule in this deck end to end, on synthetic data that mirrors Meesho’s order tables',
    rail: 'APPENDIX A',
    foot: 'Prototype: React + Recharts static site; 261 synthetic sellers, 4,415 SKUs, 9 categories; fixed seed; fictional names; four model tests run before every deploy   |   Supports pages 5, 6, 8, 9',
  });
  const b = R([0, 0, 1, 1]);
  const fit = (f, pw, ph, x, y, w, h) => { const r = Math.min(w / pw, h / ph); s.addImage({ path: AS(f), x: x + (w - pw * r) / 2, y: y + (h - ph * r) / 2, w: pw * r, h: ph * r }); };
  const cells = [
    [[['shot_pti_scatter.png', 1566, 1092]], '1 · Price Truth Index', 'Size vs price gap for every seller above ₹5 cr: r = −0.18; 7 of the 10 largest fail', 'p5'],
    [[['shot_day30.png', 2544, 1454]], '2 · Day-30 readout', 'Badged vs holdout NMV per live SKU with a bootstrap interval → fund / tighten / stop', 'p9'],
    [[['shot_pti_gate.png', 2544, 444], ['shot_health_stages.png', 2544, 498]], '3 · Gate controls + Seller Health stages', 'Gate sliders re-score every seller; 60 pilot sellers by stage', 'p5, p8'],
    [[['shot_health_detail.png', 1506, 1176]], '4 · One seller’s Health Score', 'Five signals, the rule that fired, the next action', 'p8, p9'],
  ];
  const lw = b.w * 0.6, gw = (lw - 0.1) / 2, gh = (b.h - 0.75) / 2;
  cells.forEach(([imgs, h, t, p], k) => {
    const x = b.x + (k % 2) * (gw + 0.1), y = b.y + Math.floor(k / 2) * (gh + 0.12);
    box(s, x, y, gw, gh, C.fill, { line: C.line, round: true, r: 0.04 });
    const ih = (gh - 0.62 - 0.06 * (imgs.length - 1)) / imgs.length;
    imgs.forEach(([f, pw, ph], j2) => fit(f, pw, ph, x + 0.06, y + 0.06 + j2 * (ih + 0.06), gw - 0.12, ih));
    T(s, [run(h, { bold: true, color: C.plum }), run(`   supports ${p}`, { color: C.coral, bold: true, fontSize: 8 }), run('', { breakLine: true }), run(t, { color: C.text })], { x: x + 0.08, y: y + gh - 0.54, w: gw - 0.16, h: 0.5, fontSize: 9, valign: 'middle' });
  });
  const phones = [
    ['shot_phone_price.png', '5 · Manufacturer app: price check', 'Lowest viable price vs market median, before listing', 'p6'],
    ['shot_phone_brief.png', '6 · Demand Brief + batch', 'District demand → batch size → one-tap commit', 'p6'],
    ['shot_phone_whatsapp.png', '7 · WhatsApp nudges', 'Grant applied, batch confirmed, payout dates', 'p8'],
  ];
  const px = b.x + lw + 0.15, pw2 = (b.w - lw - 0.15 - 0.2) / 3;
  phones.forEach(([f, h, t, p], k) => {
    const x = px + k * (pw2 + 0.1), ph = pw2 * 1570 / 780;
    box(s, x, b.y, pw2, ph + 0.95, C.fill, { line: C.line, round: true, r: 0.04 });
    s.addImage({ path: AS(f), x: x + 0.05, y: b.y + 0.05, w: pw2 - 0.1, h: (pw2 - 0.1) * 1570 / 780 });
    T(s, [run(h, { bold: true, color: C.plum, breakLine: true }), run(t, { color: C.text, breakLine: true }), run(`supports ${p}`, { color: C.coral, bold: true, fontSize: 8 })], { x: x + 0.06, y: b.y + ph + 0.05, w: pw2 - 0.12, h: 0.86, fontSize: 8.5, valign: 'top' });
  });
  const ly = b.y + b.h - 0.6;
  box(s, b.x, ly, lw, 0.6, C.plum, { round: true, r: 0.05 });
  s.addImage({ path: AS('qr_live.png'), x: b.x + 0.06, y: ly + 0.05, w: 0.5, h: 0.5 });
  T(s, [run('Open it live: ', { bold: true, color: C.saffron }), run('meesho-dice-c2m-iitb.vercel.app', { bold: true, color: C.white, breakLine: true }), run('Mirror: prathmesh-28.github.io/c2m-control-tower · Offline: one HTML file in prototype/dist-single', { color: 'E9D5E3' })],
    { x: b.x + 0.65, y: ly, w: lw - 0.7, h: 0.6, fontSize: 9.5, valign: 'middle' });
}

// ================================================================== 13 · APPENDIX B: SOURCES, METHOD, ASSUMPTIONS
{
  const s = page(-1, {
    label: 'Appendix B · Sources, method, assumptions',
    headline: 'Every figure in the deck traces to a numbered source [S#] or a registered assumption [A#] in one master model',
    rail: 'APPENDIX B',
    foot: 'Master model: deck/source/model.mjs → outputs.json (every slide number is read from it) · Teardown data: deck/source/data · Survey kit: research/13   |   Supports pages 2–11',
  });
  let b = panel(s, [0, 0, 0.30, 1], 'Sources [S#] (publisher · title · date)');
  const sl = Object.entries(S);
  T(s, sl.map(([k, [pub, title, date]], i) => run(`${k}  ${pub}: ${title} (${date})`, { breakLine: i < sl.length - 1, color: C.text })), { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 7.5, valign: 'top', paraSpaceAfter: 1.5 });

  b = panel(s, [0.30, 0, 0.70, 0.68], 'Assumption register [A#] (value · source · confidence H/M/L)');
  const al = Object.entries(A);
  const v = (k) => A[k].value;
  const show = {
    A1: `₹${v('A1')} cr`, A2: pc(v('A2')), A3: `${IN(v('A3')[0])} → ${IN(v('A3')[4])}`, A4: `${v('A4')[0].toFixed(2)} → ${v('A4')[4]}`, A5: `₹${v('A5')} cr`, A6: pc(v('A6')), A7: v('A7').map((x) => pc(x)).join('–'),
    A8: pc(v('A8')), A9: pc(v('A9')), A10: pc(v('A10')), A11: `${v('A11') * 100} pts`, A12: `₹${v('A12')}`, A13: `₹${v('A13')} cr`, A14: `${v('A14')[0]} → ${v('A14')[4]}`,
    A15: `${v('A15').clusters[0]} → ${v('A15').clusters[4]}; ₹${v('A15').perCluster} cr each`, A16: `₹${v('A16')[0]} cr, then ₹${v('A16')[1]} cr`, A17: `${v('A17').nodes[0]} → ${v('A17').nodes[4]}; ₹${v('A17').perNode} cr; ${v('A17').life} yrs`,
    A18: `₹${v('A18').y1} cr; then ${pc(v('A18').share, 1)} of NMV`, A19: `₹${v('A19').cpm} CPM; ${IN(v('A19').perSeller)} impr.`, A20: `${pc(v('A20').advance)}; ${pc(v('A20').firstLoss)}`, A21: v('A21').map((x) => pc(x)).join('; '),
    A22: `₹${v('A22')}`, A23: pc(v('A23')), A24: pc(v('A24')), A25: `RTO ${pc(v('A25').rto)}; returns ${pc(v('A25').ret)}`, A26: `₹${v('A26')}`, A27: `₹${v('A27')}`,
    A28: `₹${v('A28').selfFwd}/${v('A28').nodeFwd} fwd; ₹${v('A28').selfPack}/${v('A28').nodeFee}`, A29: `${pc(v('A29').self)} / ${pc(v('A29').node)}`, A30: `${pc(v('A30').rate)}; ${v('A30').stockDays} vs ${v('A30').batchDays} days`,
    A31: `${pc(v('A31').stock)} vs ${pc(v('A31').batch)}; salvage ${pc(v('A31').salvage)}`, A32: `₹${v('A32')}`,
  };
  const SHORT = {
    A1: 'Mature NMV per C2M seller', A2: 'Year-4 capture of SAM', A3: 'Average active sellers, Y1–Y5', A4: 'NMV per seller, Y1–Y5 (₹ cr)', A5: 'Typical target factory turnover',
    A6: 'Meesho NMV in C2M categories', A7: 'Price gap passed to buyers', A8: 'Incremental share of C2M orders', A9: 'C2M GMV per order vs average', A10: 'Prepaid pre-order share',
    A11: 'Failed-delivery gap, COD vs prepaid', A12: 'Meesho cost per failed delivery', A13: 'Loaded cost per FTE-year', A14: 'Programme FTE, Y1–Y5', A15: 'Clusters (year-end); onboarding cost',
    A16: 'Demand Brief cost, Y1–Y5', A17: 'Nodes (year-end); set-up; life', A18: 'Returns firewall pool', A19: 'Grant valuation; impressions', A20: 'NBFC advance; Meesho first-loss',
    A21: 'Discount rate; stress rate', A22: 'Making cost, briefs 3-pack', A23: 'Target margin on price', A24: 'Wholesaler mark-up', A25: 'Hosiery: failed deliveries; returns',
    A26: 'Return fee to seller', A27: 'Failed-delivery fee to seller', A28: 'Logistics fees, self / node', A29: 'Value recovered, self / node', A30: 'Capital cost; inventory days',
    A31: 'Unsold share; salvage value', A32: 'Pre-order discount (7–8 days)',
  };
  const half = Math.ceil(al.length / 2);
  [al.slice(0, half), al.slice(half)].forEach((part, c) => {
    const tw2 = b.w / 2 - 0.04;
    table(s, [['ID', 'Assumption', 'Value', 'Source', 'C'], ...part.map(([k, x]) => [{ t: k, b: true, c: C.plum }, { t: SHORT[k] ?? x.label, a: 'left' }, { t: show[k] ?? String(x.value) }, { t: x.src.replace(/ \(.*\)/, '').replace('Team estimate', 'Team').replace('Team judgement', 'Team').replace('Pending ', '').replace(', team', '') }, { t: x.conf, b: true, c: x.conf === 'L' ? C.red : x.conf === 'M' ? C.amber : C.green }])],
      { x: b.x + c * (tw2 + 0.08), y: b.y, w: tw2, colW: [0.32, 1.92, 1.25, 0.62, tw2 - 4.11], rowH: [0.2, ...part.map(() => (b.h - 0.22) / half)], fs: 7.5, hfs: 7.5, margin: 0.02 });
  });

  b = panel(s, [0.30, 0.68, 0.35, 0.32], 'Method and sample', { hc: C.coral });
  T(s, [
    run('Teardown [S10]: ', { bold: true, color: C.plum }), run(`meesho.com search, 2 Oct 2026; first 56 listings per query; ${M.tdAll} listings, 5 product types; demand weight = review count; plastics query returned none and was dropped.`, { breakLine: true }),
    run('Interviews [S22]: ', { bold: true, color: C.plum }), run('24 owners (8 per cohort, Round 1) + 3 published owner interviews [S21].', { breakLine: true }),
    run('Buyer survey: ', { bold: true, color: C.plum }), run(PR && PR.survey ? `n = ${PR.survey.n}, ${PR.survey.dates}; quotas ${PR.survey.quotas}` : '[FILL: n, dates, quotas achieved vs target (≥ 150; ≥ 30 per tier); stated intent counted at 50%]', { breakLine: true }),
    run('Power: ', { bold: true, color: C.plum }), run('62 sellers × 28 days, SE ≈ 1.6 pts, MDE ≈ 4.5% at 80% power.', {}),
  ], { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 7.5, valign: 'top', paraSpaceAfter: 2 });

  b = panel(s, [0.65, 0.68, 0.35, 0.32], 'Workings index (formula → page)');
  T(s, [
    run('Sizing: ', { bold: true, color: C.plum }), run('NMV = sellers × ₹1.425 cr; savings = NMV × g ÷ (1 − g) → p4', { breakLine: true }),
    run('Unit cost: ', { bold: true, color: C.plum }), run('(make + unsold − resold + logistics + returns + capital) ÷ kept → p6', { breakLine: true }),
    run('Benefit: ', { bold: true, color: C.plum }), run('orders × (incremental × ₹7.3 + Δfailed × ₹60) → p10', { breakLine: true }),
    run('Δfailed: ', { bold: true, color: C.plum }), run('pre-order share × (1 − 37%) × 15 pts = 4.7 pts → p10', { breakLine: true }),
    run('AHP: ', { bold: true, color: C.plum }), run('geometric means, CR = (λ − 5) ÷ 4 ÷ 1.12 → p3, Appendix C', { breakLine: true }),
    run('RICE: ', { bold: true, color: C.plum }), run('reach × impact × confidence ÷ effort → p7', {}),
  ], { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 7.5, valign: 'top', paraSpaceAfter: 2 });
}

// ================================================================== 14 · APPENDIX C: BENCHMARKS, COMPLIANCE, MODEL DETAIL
{
  const s = page(-1, {
    label: 'Appendix C · Benchmarks, compliance, model detail',
    headline: 'Detailed benchmarks, compliance by design and the decision-model workings behind pages 3, 6 and 7',
    rail: 'APPENDIX C',
    foot: 'Sources: S15–S19, S22–S25   |   Compliance rows are design responses, not legal advice: Meesho legal confirms each before the pilot   |   Supports pages 3, 6, 7, 11',
  });
  let b = panel(s, [0, 0, 0.58, 0.52], 'Benchmark detail: KPI × company (dated, sourced)');
  table(s, [['', 'Pinduoduo NBI', 'Taobao C2M', 'Temu semi-managed', 'Shein', 'Shein Brazil'],
    ['Year of data', 'End-2019', '2020; Dec 2021', 'Q3 2024', 'Mar 2024', 'Apr 2023 – Feb 2026'],
    ['Factories / merchants', '900+ in C2M production', '1,000 “super factories” targeted', '+80,000 planned for 2025', 'Network (not disclosed)', '336 signed of 2,000; 1 producing'],
    ['Demand data to factories', '✓ anonymised', '✓ consumer insight', '– platform prices', '✓ real-time', '✕'],
    ['Who holds stock', 'Factory', 'Factory', 'Merchant, local warehouse', 'Shein', 'Factory'],
    ['Batching', 'Custom runs', 'C2M runs', '—', '100–200 item first runs', 'Large runs, fast'],
    ['Price lever', 'Demand scale', 'Finance + insight', 'Platform-set', 'Small batches', '~30% price-cut asks'],
    ['How Meesho uses it', 'Demand Brief', 'NBFC prepayment', 'Seller-owned node', 'Pre-order batches', 'Never ask for cuts'],
  ], { x: b.x, y: b.y, w: b.w, colW: [1.45, ...Array(5).fill((b.w - 1.45) / 5)], rowH: 0.29, fs: 8 });

  b = panel(s, [0.58, 0, 0.42, 0.52], 'Compliance by design', { hc: C.coral });
  table(s, [['Rule', 'Requires', 'Our design'],
    ['Press Note 2 (2018)', 'Marketplace may not own or control seller inventory', 'Seller keeps title at the node; Valmo sells warehousing at arm’s length'],
    ['Press Note 2 (2018)', 'Fair, non-discriminatory services; no exclusivity', 'Badge and grants are published rules any seller can meet'],
    ['E-Commerce Rules, 2026 amendment (from 1 Jan 2027)', 'Ranking parameters by importance; sponsored labelled', 'Publish the price-gap badge as a ranking parameter; grants are organic, never sold'],
    ['Dark-pattern guidelines (2023)', 'No false urgency or hidden terms', '“Ships in 7–8 days, ₹10 off” shown before payment'],
    ['DPDP Act (2023)', 'Protect personal data', 'Demand Briefs use district aggregates only'],
    ['GST', 'Stock at a third-party site', 'Node registered as the seller’s additional place of business'],
  ], { x: b.x, y: b.y, w: b.w, colW: [1.35, 1.55, b.w - 2.9], rowH: [0.2, ...Array(6).fill((b.h - 0.22) / 6)], fs: 7.5 });

  b = panel(s, [0, 0.52, 0.34, 0.48], `Cluster AHP: pairwise matrix (CR ${M.ahp.CR.toFixed(3)})`);
  const ab = ['C', 'D', 'R', 'N', 'I'];
  const fr = (v) => (v >= 1 ? String(Math.round(v)) : `1/${Math.round(1 / v)}`);
  table(s, [['', ...ab, 'Geo. mean', 'Weight'], ...M.ahp.M.map((r, i) => [{ t: `${ab[i]} · ${M.ahp.crit[i]}`, b: true, c: C.plum, fs: 7.5 }, ...r.map(fr), M.ahp.gm[i].toFixed(2), { t: M.ahp.w[i].toFixed(3), b: true, c: C.coral }])],
    { x: b.x, y: b.y, w: b.w, colW: [1.4, ...Array(5).fill(0.3), 0.6, b.w - 3.5], rowH: 0.25, fs: 8 });
  T(s, `λmax = ${M.ahp.lam.toFixed(3)}; CI = (λmax − 5) ÷ 4; CR = CI ÷ 1.12 = ${M.ahp.CR.toFixed(3)} < 0.10. Weights reproduce Round 1’s cluster scores (Tiruppur 4.68, Panipat 4.52).`, { x: b.x, y: b.y + b.h - 0.62, w: b.w, h: 0.62, fontSize: 8, valign: 'bottom' });

  b = panel(s, [0.34, 0.52, 0.33, 0.48], 'Cohort rubric (what earns a 5)');
  table(s, [['Criterion', 'Weight', '5 =', '1 ='],
    ['Price edge', '30%', 'Sells ex-factory B2B', 'Trader, no cost levers'],
    ['Pool size', '25%', '> 50% of SAM', '< 5% of SAM'],
    ['Fixable barriers', '20%', 'All HIGH barriers fixable', 'None fixable'],
    ['Speed to first order', '15%', 'KYC + catalogue on Meesho', 'No online catalogue'],
    ['New supply', '10%', 'New to Meesho', 'Was on Meesho'],
  ], { x: b.x, y: b.y, w: b.w, colW: [1.15, 0.5, 1.35, b.w - 3.0], rowH: 0.25, fs: 8 });
  T(s, 'Weights set by the team for this decision only; equal weights give the same order (A, C, B).', { x: b.x, y: b.y + b.h - 0.34, w: b.w, h: 0.34, fontSize: 8, italic: true, color: C.muted, valign: 'bottom' });

  b = panel(s, [0.67, 0.52, 0.33, 0.48], 'Unit-economics workings (per 100 shipped)', { hc: C.coral });
  const c3 = U.cols[3];
  T(s, [
    run('Kept units ', { bold: true, color: C.plum }), run(`= 100 × (1 − RTO) × (1 − returns) = ${(100 * (1 - A.A25.value.rto) * (1 - A.A25.value.ret)).toFixed(1)} (prepaid: ${(100 * (1 - U.rtoPrepaid) * (1 - A.A25.value.ret)).toFixed(1)})`, { breakLine: true }),
    run('Unsold ', { bold: true, color: C.plum }), run('= extra units made × cost × (1 − 50% salvage); 10% build-to-stock vs 2% batch', { breakLine: true }),
    run('Logistics ', { bold: true, color: C.plum }), run('= delivered × forward fee + shipped × packing (₹10) or node fee (₹20)', { breakLine: true }),
    run('Capital ', { bold: true, color: C.plum }), run('= make cost × 18% × days ÷ 365 (45 vs 10 days)', { breakLine: true }),
    run('Floor ', { bold: true, color: C.plum }), run(`= cost per kept ÷ (1 − 9%) → proposed ${rs(c3.cost, 1)} ÷ 0.91 = ${rs(c3.floor, 1)}`, { breakLine: true }),
    run('Reconciliation checks ', { bold: true, color: C.coral }), run(`NPV ${cr(FN.npv)} = Σ PV row (page 10) ✓ · Year-4 NMV ${cr(FN.nmv[3], 0)} (average 1,300 sellers) vs ${cr(Y4.nmv)} exit run-rate (1,400) ✓ · benefit = orders × (${pc(A.A8.value)} × ${rs(SP.contribPerOrder, 1)} + ${rs(M.c2m.rtoSavingPerOrder, 1)}) ✓ · RICE order = dependency order ✓`, {}),
  ], { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 8, valign: 'top', paraSpaceAfter: 2 });
}

fs.mkdirSync(path.dirname(OUTFILE), { recursive: true });
await pres.writeFile({ fileName: OUTFILE });
console.log('Wrote', OUTFILE, pres.slides.length, 'slides');
