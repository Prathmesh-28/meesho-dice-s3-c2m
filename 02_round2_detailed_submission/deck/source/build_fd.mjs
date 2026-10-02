// Factory Direct deck: Meesho DICE S3 Business Track, Round 2 (cover + 10 content pages + 3 appendices).
// Page flow mirrors the 15-page IIM Mumbai DICE winner: research → segmentation → awareness & strategy → benchmarking &
// comparison → best practices → journey → location (cluster) criteria → unit economics → financial analysis → closer.
// Every number comes from model.mjs (market, factory and Meesho economics) or proto.mjs (live prototype results).
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { OUT as M, A, S } from './model.mjs';
import { PROTO } from './proto.mjs';

const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');
const HERE = path.dirname(new URL(import.meta.url).pathname);
const AS = (f) => path.join(HERE, 'assets', f);
const IC = (n, c = 'w') => AS(`icons/${n}_${c}.png`);
const OUTFILE = process.argv[2] ?? path.join(HERE, 'out', 'factory_direct.pptx');

// Never overwrite the current deck without first saving it to ../old (see snapshot.sh).
const DECK_MAIN = path.resolve(HERE, '../meesho_dice_round2.pptx');
if (path.resolve(OUTFILE) === DECK_MAIN && fs.existsSync(DECK_MAIN)) {
  require('child_process').execFileSync('bash', [path.join(HERE, 'snapshot.sh'), 'rebuilt with build_fd.mjs (added User Personas & Flow page and week-by-week 90-day plan)'], { stdio: 'inherit' });
}

// Optional primary research (buyer survey + team interviews). Absent → visible [FILL] markers.
const PR_FILE = path.join(HERE, 'data', 'primary_research.json');
const PR = fs.existsSync(PR_FILE) ? JSON.parse(fs.readFileSync(PR_FILE, 'utf8')) : null;

// ------------------------------------------------------------------ design system
const C = {
  plum: '5A0A46', plum2: '7B2A66', saffron: 'F7A21B', coral: 'E8434F', fill: 'FBF3F8', fill2: 'FFF5E6', line: 'D8C2D0',
  text: '1F1F1F', muted: '6B6B6B', white: 'FFFFFF', green: '2E9E5B', amber: 'E39B2B', red: 'D64545', pink: 'FDE7E8', zebra: 'F6EAF2',
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
const U = M.unit, FN = M.fin, SP = M.SP, Y4 = M.ladder[2], BX = U.batch;
const prepaidC2M = A.A10.value + (1 - A.A10.value) * SP.prepaid;
const r10 = (x) => Math.round(x / 10) * 10;

// ------------------------------------------------------------------ primitives
function T(s, text, o = {}) {
  s.addText(text, { fontFace: F.body, fontSize: 8, color: C.text, margin: 0, isTextBox: true, valign: 'top', ...o });
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
  const r = R(fr), hb = 0.25;
  box(s, r.x, r.y, r.w, hb, o.hc ?? C.plum, { round: true, r: 0.05 });
  T(s, title, { x: r.x + 0.07, y: r.y, w: r.w - 0.14, h: hb, fontSize: 9.5, bold: true, color: C.white, valign: 'middle' });
  box(s, r.x, r.y + hb + 0.02, r.w, r.h - hb - 0.02, o.fill ?? C.fill, { line: C.line });
  return { x: r.x + 0.07, y: r.y + hb + 0.07, w: r.w - 0.14, h: r.h - hb - 0.12 };
}
function bigNum(s, x, y, d, value, o = {}) {
  s.addShape(SH.OVAL, { x, y, w: d, h: d, fill: { color: o.fill ?? C.white }, line: { color: o.ring ?? C.coral, width: 2 } });
  T(s, value, { x: x - 0.1, y, w: d + 0.2, h: d, fontSize: o.size ?? 18, bold: true, color: o.color ?? C.plum, align: 'center', valign: 'middle', fontFace: F.head });
}
function icon(s, name, x, y, d, c = 'w') { s.addImage({ path: IC(name, c), x, y, w: d, h: d }); }
function avatar(s, name, x, y, d, fill = C.plum) {
  s.addShape(SH.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: C.white, width: 1 } });
  icon(s, name, x + d * 0.22, y + d * 0.22, d * 0.56);
}
function chip(s, x, y, w, h, text, fill, o = {}) {
  box(s, x, y, w, h, fill, { round: true, r: 0.05, line: o.line });
  T(s, text, { x: x + 0.03, y, w: w - 0.06, h, fontSize: o.size ?? 8, bold: o.bold ?? true, color: o.color ?? C.white, align: o.align ?? 'center', valign: 'middle' });
}
// Bulleted list: items are strings or [bold lead, rest]
function list(s, items, x, y, w, h, o = {}) {
  const runs = [];
  items.forEach((it, i) => {
    const [lead, rest] = Array.isArray(it) ? it : [null, it];
    runs.push(run(`${o.glyph ?? '✓'} `, { color: o.gc ?? C.green, bold: true }));
    if (lead) runs.push(run(`${lead} `, { bold: true, color: o.lc ?? C.plum }));
    runs.push(run(rest, { color: C.text, breakLine: i < items.length - 1 }));
  });
  T(s, runs, { x, y, w, h, fontSize: o.fs ?? 8, valign: o.valign ?? 'top', paraSpaceAfter: o.psa ?? 2 });
}
// Process ribbon: icon circles joined by dashed arrows, label under each
function ribbon(s, x, y, w, steps, o = {}) {
  const n = steps.length, d = o.d ?? 0.34, gap = (w - n * d) / (n - 1);
  steps.forEach(([ic, label, col], k) => {
    const cx = x + k * (d + gap);
    avatar(s, ic, cx, y, d, col ?? (o.col ?? C.plum));
    T(s, label, { x: cx + d / 2 - (d + gap) / 2 + 0.02, y: y + d + 0.02, w: d + gap - 0.04, h: o.lh ?? 0.26, fontSize: o.fs ?? 7.5, bold: true, align: 'center', color: C.text });
    if (k < n - 1) s.addShape(SH.LINE, { x: cx + d + 0.03, y: y + d / 2, w: gap - 0.06, h: 0, line: { color: o.lc ?? C.coral, width: 1.25, dashType: 'dash', endArrowType: 'triangle' } });
  });
}
// Table with house style. rows: arrays of strings or {t, b, c, f, a, i, fs, cs}
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
        fill: { color: isHead ? (o.hc ?? C.plum) : (cell.f ?? (zebra ? C.zebra : C.white)) },
        align: cell.a ?? (j === 0 ? 'left' : (o.align ?? 'center')), valign: 'middle', fontSize: cell.fs ?? (isHead ? (o.hfs ?? o.fs ?? 8) : (o.fs ?? 8)),
        italic: cell.i, colspan: cell.cs, rowspan: cell.rs,
      },
    };
  }));
  s.addTable(data, { x: o.x, y: o.y, w: o.w, colW: o.colW, rowH: o.rowH, fontFace: F.body, margin: o.margin ?? 0.03, border: { type: 'solid', pt: 0.5, color: C.line }, autoPage: false });
}
const SYM = { y: ['✓', C.green], a: ['–', C.amber], x: ['✕', C.red] };
const symCell = (k) => ({ t: SYM[k][0], b: true, c: C.white, f: SYM[k][1], fs: 10 });

// ------------------------------------------------------------------ page chrome
const TABS = ['Primary\nResearch', 'Manufacturer\nSegmentation', 'User Personas\n& Flow', 'Awareness\n& Strategy', 'Benchmarking\n& Comparison', 'Best\nPractices', 'Manufacturer\nJourney', 'Cluster\nCriteria', 'Unit\nEconomics', 'Financial\nAnalysis', '90-Day Plan\n& Risks'];
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
      T(s, t, { x: x0 + k * (tw + gap), y: 0.08, w: tw, h: 0.42, fontSize: 7.5, bold: true, color: on ? C.white : C.plum, align: 'center', valign: 'middle', fontFace: F.head });
    });
  }
  s.addImage({ path: AS('meesho_icon.png'), x: 11.93, y: 0.09, w: 0.38, h: 0.38 });
  s.addImage({ path: AS('iitb_logo_white.png'), x: 12.48, y: 0.06, w: 0.45, h: 0.44 });
}
function page(i, { headline, rail, band, foot, label }) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  header(s, i, label);
  T(s, headline, { x: 0.25, y: 0.58, w: 12.83, h: 0.55, fontFace: F.head, fontSize: 16, bold: true, color: C.plum, valign: 'middle', lineSpacingMultiple: 0.9 });
  box(s, 0.25, BODY.y, 0.27, BODY.h, C.plum);
  T(s, rail, { x: 0.25, y: BODY.y, w: 0.27, h: BODY.h, fontSize: 10.5, bold: true, color: C.white, align: 'center', valign: 'middle', vert: 'vert270', fontFace: F.head });
  if (band) {
    box(s, 0.25, 6.78, 12.83, 0.4, C.plum, { round: true, r: 0.06 });
    T(s, band, { x: 0.4, y: 6.78, w: 12.55, h: 0.4, fontSize: 10, bold: true, color: C.white, valign: 'middle' });
  }
  T(s, foot, { x: 0.25, y: 7.22, w: 12.2, h: 0.22, fontSize: 7.5, color: C.muted, valign: 'middle' });
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
    headline: 'Buyers follow price and 35% of MSMEs want online sales, but returns, stock risk and know-how keep factories offline',
    rail: 'PRIMARY RESEARCH',
    band: 'Decision: build Factory Direct around the operational barriers (returns, stock risk, unit shipping, cash), not discounts. Owner: Category + Product.',
    foot: 'Sources: S2 Q4 FY26 call · S3 FY26 results · S4 ICRIER 2025 · S9 The Tribune · S10 team teardown, 2 Oct 2026 · S21 Apparel Resources · S22 Round 1 interviews   |   Assumptions: A6, A22–A24   |   Survey kit and method: Appendix B',
  });
  // P1 objective, as-is vs to-be, size of prize
  let b = panel(s, [0, 0, 0.40, 0.38], 'Objective: a factory base that sells cheaper, and stays');
  T(s, [run('Bring cost-advantaged factories onto Meesho through ', { color: C.text }), run('Factory Direct', { bold: true, color: C.coral }), run(', and keep them.', { color: C.text })], { x: b.x, y: b.y, w: b.w, h: 0.18, fontSize: 8.5, bold: true });
  const chain = (y, label, steps, outs, col) => {
    T(s, label, { x: b.x, y, w: 0.46, h: 0.22, fontSize: 8.5, bold: true, color: col, valign: 'middle' });
    const gap = 0.14, sw = (b.w - 0.46 - gap * 3) / 4;
    steps.forEach((t, k) => {
      const x = b.x + 0.46 + k * (sw + gap);
      chip(s, x, y, sw, 0.22, t, k === 3 ? C.saffron : col, { size: 8, color: k === 3 ? C.plum : C.white });
      if (k < 3) T(s, '›', { x: x + sw, y: y - 0.03, w: gap, h: 0.26, fontSize: 14, bold: true, color: col, align: 'center', valign: 'middle' });
    });
    const ow = (b.w - 0.46 - 0.1) / 3;
    outs.forEach((t, k) => {
      const x = b.x + 0.46 + k * (ow + 0.05);
      box(s, x, y + 0.25, ow, 0.27, C.white, { line: col, round: true, r: 0.03 });
      T(s, t, { x: x + 0.03, y: y + 0.25, w: ow - 0.06, h: 0.27, fontSize: 7, align: 'center', valign: 'middle' });
    });
  };
  chain(b.y + 0.2, 'As-is', ['Factory', `Wholesaler +${pc(A.A24.value)}`, 'Reseller', 'Buyer'], ['Mark-ups stack before the buyer', `Reseller’s lowest viable price ${rs(U.cols[0].floor)}: ${pc(-U.cols[0].gap, 1)} above market`, 'Stock and returns sit with resellers'], C.plum2);
  chain(b.y + 0.76, 'To-be', ['Factory', 'Pre-order', 'Factory Node', 'Buyer'], ['No intermediary mark-up', `Factory’s lowest viable price ${rs(U.cols[3].floor)}: ${pc(U.cols[3].gap, 1)} below`, 'Made only to confirmed orders'], C.coral);
  const cy0 = b.y + 1.31, ch0 = b.y + b.h - cy0;
  box(s, b.x, cy0, b.w, ch0, C.white, { line: C.coral, round: true, r: 0.04 });
  T(s, [run(`≈ ${cr(M.problemSize)}`, { fontSize: 15, breakLine: true }), run('a year', { fontSize: 8 })], { x: b.x + 0.05, y: cy0, w: 1.45, h: ch0, bold: true, color: C.coral, valign: 'middle', fontFace: F.head });
  T(s, [
    run('of wholesaler mark-up sits inside Meesho’s nine C2M categories', { bold: true, color: C.plum, breakLine: true }),
    run(`= ${cr(SP.fy26Nmv)} FY26 NMV [S3] × ${pc(A.A6.value)} in C2M categories [A6] × ${pc((U.resellerCogs - M.c2m.exFactory) / U.mkt, 1)} mark-up share of price [A24]`, { color: C.text }),
  ], { x: b.x + 1.5, y: cy0 + 0.02, w: b.w - 1.56, h: ch0 - 0.04, fontSize: 7.5, valign: 'middle' });

  // P2 challenges (5 boxes x 2 ticks)
  b = panel(s, [0, 0.38, 0.40, 0.26], 'Challenges to solve (page where we solve each)', { hc: C.coral });
  const chs = [['Price discovery · p9', 'Scale ≠ price', 'List prices overstate demand'], ['Unit operations · p6', 'Pick, pack, ship per order', 'Returns handled by the factory'], ['Inventory & cash · p10', 'Build-to-stock risk', '45–60 day distributor terms'],
    ['Demand & visibility · p8', 'No reviews at the start', 'District demand unknown'], ['Retention · p8, p12', 'Gap decays after the badge', 'Quality slips with price']];
  const cw3 = (b.w - 0.12) / 3, chh = (b.h - 0.06) / 2;
  chs.forEach(([h, a, c], k) => {
    const x = b.x + (k % 3) * (cw3 + 0.06), y = b.y + Math.floor(k / 3) * (chh + 0.06);
    box(s, x, y, cw3, chh, C.white, { line: C.coral, round: true, r: 0.03 });
    T(s, h, { x: x + 0.04, y: y + 0.02, w: cw3 - 0.08, h: 0.16, fontSize: 8, bold: true, color: C.coral });
    list(s, [a, c], x + 0.04, y + 0.18, cw3 - 0.08, chh - 0.2, { fs: 7.5, psa: 0 });
  });
  const lx = b.x + 2 * (cw3 + 0.06), ly = b.y + chh + 0.06;
  box(s, lx, ly, cw3, chh, C.plum, { round: true, r: 0.03 });
  T(s, '5 barriers → 6 levers, each owned by a Meesho team (pages 5–10)', { x: lx + 0.05, y: ly, w: cw3 - 0.1, h: chh, fontSize: 8, bold: true, color: C.white, valign: 'middle', align: 'center' });

  // P3 survey trio
  b = panel(s, [0.40, 0, 0.60, 0.38], 'Three data sets: why factories quit, what buyers pay, what buyers would trade');
  const cw = (b.w - 0.2) / 3;
  [b.x + cw + 0.05, b.x + 2 * cw + 0.15].forEach((x) => s.addShape(SH.LINE, { x, y: b.y, w: 0, h: b.h, line: { color: C.line, width: 0.75, dashType: 'dash' } }));
  bigNum(s, b.x, b.y, 0.44, '2,365', { size: 8.5 });
  T(s, [run('ICRIER MSME survey [S4]', { bold: true, color: C.plum, breakLine: true }), run('Why firms that tried e-commerce quit (% of quitters)', { color: C.muted })], { x: b.x + 0.5, y: b.y, w: cw - 0.5, h: 0.44, fontSize: 7.5, valign: 'middle' });
  const icr = [['Lacked knowledge', 43], ['Product returns', 43], ['Platform charges', 42], ['High competition', 40], ['Tech / inventory skills', 39], ['Not profitable', 35], ['Not enough staff', 33], ['Stock capacity', 30]];
  const ops = ['Product returns', 'Tech / inventory skills', 'Not enough staff', 'Stock capacity', 'Lacked knowledge'];
  const rowI = (b.h - 0.48 - 0.27) / icr.length;
  icr.forEach(([l, v], k) => {
    const y = b.y + 0.47 + k * rowI;
    T(s, l, { x: b.x, y, w: 1.08, h: rowI, fontSize: 7, valign: 'middle' });
    box(s, b.x + 1.1, y + rowI * 0.15, (cw - 1.42) * v / 45, rowI * 0.7, ops.includes(l) ? C.coral : C.plum2);
    T(s, `${v}%`, { x: b.x + 1.12 + (cw - 1.42) * v / 45, y, w: 0.3, h: rowI, fontSize: 7, bold: true, valign: 'middle' });
  });
  T(s, [run('Coral = operational: ', { color: C.coral, bold: true }), run('a node and batches remove them. 1 in 5 that joined quit; 35% still want to join.', {})], { x: b.x, y: b.y + b.h - 0.27, w: cw, h: 0.27, fontSize: 7, valign: 'middle' });
  const tx = b.x + cw + 0.1;
  bigNum(s, tx, b.y, 0.44, String(M.tdAll), { size: 11 });
  T(s, [run('Team teardown, meesho.com [S10]', { bold: true, color: C.plum, breakLine: true }), run('Live listings, 5 product types, 2 Oct 2026', { color: C.muted })], { x: tx + 0.5, y: b.y, w: cw - 0.5, h: 0.44, fontSize: 7.5, valign: 'middle' });
  T(s, [run('■ ', { color: C.plum2 }), run('listings  ', {}), run('■ ', { color: C.coral }), run('reviews (demand) · briefs, n = 56', {})], { x: tx, y: b.y + 0.46, w: cw, h: 0.14, fontSize: 7, color: C.muted });
  const bb = M.briefsBands, bandY = b.y + 0.76, bandH = b.h - 0.76 - 0.46, bw0 = (cw - 0.1) / bb.length;
  bb.forEach((x, k) => {
    const bx = tx + 0.05 + k * bw0, base0 = bandY + bandH;
    const h1 = bandH * 0.86 * x.listingShare / 0.45, h2 = bandH * 0.86 * x.reviewShare / 0.45;
    box(s, bx + 0.03, base0 - h1, bw0 / 2 - 0.04, Math.max(h1, 0.01), C.plum2);
    box(s, bx + bw0 / 2, base0 - h2, bw0 / 2 - 0.04, Math.max(h2, 0.01), C.coral);
    T(s, pc(x.reviewShare), { x: bx + bw0 / 2 - 0.1, y: base0 - h2 - 0.15, w: bw0 / 2 + 0.14, h: 0.14, fontSize: 7, bold: true, color: C.coral, align: 'center' });
    T(s, x.label.replace('₹', '').replace('< ', '<'), { x: bx - 0.04, y: base0 + 0.01, w: bw0 + 0.08, h: 0.15, fontSize: 7, align: 'center' });
  });
  T(s, `Under ₹200: ${pc(bb[0].listingShare)} of listings, ${pc(bb[0].reviewShare)} of reviews. Buyers pay 3–37% below listing medians.`, { x: tx, y: b.y + b.h - 0.27, w: cw, h: 0.27, fontSize: 7, bold: true, color: C.coral, valign: 'middle' });
  const ux = b.x + 2 * (cw + 0.1);
  if (PR && PR.survey) {
    const sv = PR.survey;
    bigNum(s, ux, b.y, 0.5, String(sv.n), { size: 12 });
    T(s, [run('Team buyer survey', { bold: true, color: C.plum, breakLine: true }), run(`Meesho buyers, last 3 months, ${sv.dates}`, { color: C.muted })], { x: ux + 0.55, y: b.y, w: cw - 0.55, h: 0.5, fontSize: 7.5, valign: 'middle' });
    sv.ladder.forEach(([l, v], k) => {
      const y = b.y + 0.62 + k * 0.32;
      T(s, l, { x: ux, y, w: 0.8, h: 0.26, fontSize: 7.5, valign: 'middle' });
      box(s, ux + 0.82, y + 0.05, (cw - 1.25) * v, 0.16, C.coral);
      T(s, pc(v), { x: ux + 0.84 + (cw - 1.25) * v, y, w: 0.4, h: 0.26, fontSize: 7.5, bold: true, valign: 'middle' });
    });
    T(s, sv.takeaway, { x: ux, y: b.y + b.h - 0.31, w: cw, h: 0.31, fontSize: 7.5, bold: true, color: C.coral, valign: 'middle' });
  } else {
    bigNum(s, ux, b.y, 0.44, 'n', { size: 11 });
    T(s, [run('Team buyer survey', { bold: true, color: C.plum, breakLine: true }), run('Meesho buyers, last 3 months (kit: research/13)', { color: C.muted })], { x: ux + 0.5, y: b.y, w: cw - 0.5, h: 0.44, fontSize: 7.5, valign: 'middle' });
    box(s, ux, b.y + 0.5, cw, b.h - 0.8, C.white, { line: C.coral, dash: 'dash' });
    T(s, '[FILL: Q6–Q8 price ladder: % choosing 7–8 day delivery at ₹10 / ₹20 / ₹40 off · Q9 % paying in advance · Q10 trust in “Sold directly by the manufacturer” · base n on each chart]', { x: ux + 0.08, y: b.y + 0.54, w: cw - 0.16, h: b.h - 0.88, fontSize: 7.5, italic: true, color: C.muted, valign: 'middle' });
    T(s, '[FILL: takeaway: the majority answer and its implication]', { x: ux, y: b.y + b.h - 0.27, w: cw, h: 0.27, fontSize: 7, italic: true, color: C.coral, valign: 'middle' });
  }

  // P4 manufacturer interviews (focused-group style)
  b = panel(s, [0.40, 0.38, 0.60, 0.26], 'Manufacturer interviews: what blocks them, by cohort (Round 1, 8 per cohort)', { hc: C.coral });
  bigNum(s, b.x, b.y + 0.02, 0.6, '24', { size: 17 });
  T(s, 'owner interviews, cohorts A, B, C', { x: b.x - 0.05, y: b.y + 0.66, w: 0.72, h: b.h - 0.66, fontSize: 7, color: C.muted, align: 'center' });
  const bars = [['Fulfilment', 'H', 'L', 'M', 'y'], ['Inventory risk', 'H', 'M', 'H', 'y'], ['Returns, RTO', 'H', 'M', 'H', 'y'], ['Unproven demand', 'H', 'M', 'H', 'y'], ['Cash cycle', 'M', 'L', 'M', 'a'], ['Channel conflict', 'H', 'H', 'L', 'a']];
  const lvl = { H: ['HIGH', C.coral], M: ['MED', C.amber], L: ['LOW', '9AA5A0'] };
  table(s, [['Barrier (severity)', ...bars.map((r) => r[0])], ...['A', 'B', 'C'].map((k, ci) => [{ t: `Cohort ${k}`, b: true, c: C.plum }, ...bars.map((r) => ({ t: lvl[r[ci + 1]][0], b: true, c: C.white, f: lvl[r[ci + 1]][1], fs: 7 }))]),
    [{ t: 'Meesho can fix', b: true, c: C.plum }, ...bars.map((r) => ({ t: r[4] === 'y' ? 'YES' : 'PARTLY', b: true, c: r[4] === 'y' ? C.green : C.amber }))]],
  { x: b.x + 0.75, y: b.y, w: b.w - 0.75, colW: [0.95, ...Array(6).fill((b.w - 1.7) / 6)], rowH: [0.2, ...Array(4).fill((b.h - 0.22) / 4)], fs: 7.5, hfs: 7.5, zebra: false, margin: 0.02 });

  // P5 stakeholders' voice
  b = panel(s, [0, 0.64, 1, 0.36], `Stakeholders’ voice: published owner and leader interviews${PR && PR.interviews ? ' + team interviews' : ''} (verbatim, ≤ 25 words)`);
  const rowsV = (PR && PR.interviews ? PR.interviews : []).slice(0, 2).map((r) => ['FaIndustry', r.who, `“${r.quote}”`, r.problem, r.area, r.implication]);
  const base = [
    ['FaIndustry', 'VM Navamani, MD, Cossmo Tex (Tiruppur) [S21]', '“Currently, domestic business is about 20%, and we are planning to increase it to 35–40% … because export markets are mostly volatile.”', 'Export orders swing with tariffs', 'Demand', 'Pitch C2M as a permanent domestic hedge, not a rescue'],
    ['FaIndustry', 'Ashwin Kumar, Managing Partner, NASA Impex (Tiruppur) [S21]', '“Orders of around 100 pieces tend to double costs … so 500 pieces is our preferred minimum.”', 'Small runs cost twice as much per piece', 'Operations', 'Demand Brief pools district demand into batches of 500+'],
    ['FaUserTie', 'Vinod Dhamija, Chairman, HCCI Panipat chapter [S9]', '“Panipat’s exports had shrunk by 50 per cent, while the domestic market had also been disturbed very badly.”', 'Idle looms, weak domestic orders', 'Demand, cash', 'Panipat is pilot cluster 2; 30% paid at handover'],
    ['FaUserTie', 'Vidit Aatrey, CEO, Meesho (Q4 FY26 call) [S2]', '“If their quality is not that great, they do not get visibility for orders.”', 'New sellers start with no orders', 'Visibility', 'Impression grants for new factories, not order subsidies'],
  ];
  const vrows = [...rowsV, ...base].slice(0, 4);
  const rhV = (b.h - 0.22) / vrows.length;
  vrows.forEach((r, k) => avatar(s, r[0], b.x + 0.05, b.y + 0.22 + k * rhV + (rhV - 0.3) / 2, 0.3, k % 2 ? C.coral : C.plum));
  table(s, [['Stakeholder', 'Opinion (verbatim)', 'Problem', 'Problem area', 'Suggestion for Meesho'], ...vrows.map((r) => [{ t: r[1], b: true, c: C.plum, a: 'left' }, { t: r[2], i: true, a: 'left' }, { t: r[3], a: 'left' }, r[4], { t: r[5], a: 'left', b: true }])],
    { x: b.x + 0.42, y: b.y, w: b.w - 0.42, colW: [2.3, 4.55, 1.8, 0.85, b.w - 0.42 - 9.5], rowH: [0.22, ...vrows.map(() => rhV)], fs: 8, hfs: 8 });
  if (!(PR && PR.interviews)) s.addNotes('Stakeholders’ voice uses published interviews. Add 1–2 rows from the team’s own Round 1 interviews (data/primary_research.json → interviews[]) when the notes arrive.');
}

// ================================================================== 3 · MANUFACTURER SEGMENTATION
{
  const coh = M.cohorts, cats = M.categories;
  const s = page(1, {
    headline: `${IN(M.SAM)} manufacturers can carry a real price gap; offline B2B factories (${IN(coh[0].firms)}) in hosiery and home textiles go first`,
    rail: 'SEGMENTATION',
    band: 'Decision: target Cohort A in hosiery and home textiles first, re-invite Cohort C in parallel, offer Cohort B value-tier only. Owner: Category · KPI: 60 factories catalogued by Day 60.',
    foot: 'Sources: S5 MSME limits · S7 Udyam · S9 · S20 category mix · S22 Round 1 (12-category screen, 24 interviews, cohort split)   |   Rubrics: Appendix C   |   ✓ = 5, – = 3, ✕ = 1   |   Personas are composites, not real firms',
  });
  // P1 segment evaluation
  let b = panel(s, [0, 0, 0.42, 0.72], 'Segment evaluation: 12 category segments × 4 cost metrics (weighted)');
  table(s, [['Segment (category)', 'Cluster', `Floor ${pc(M.catW[0])}`, `Idle ${pc(M.catW[1])}`, `Returns ${pc(M.catW[2])}`, `Freight ${pc(M.catW[3])}`, 'Score'], ...cats.map((x, i) => {
    const out = i >= 9;
    return [{ t: x.name, b: !out, c: out ? C.muted : C.plum }, { t: x.cluster, c: out ? C.muted : C.text, fs: 7.5 }, ...x.marks.split('').map((m) => ({ t: SYM[m][0], b: true, c: SYM[m][1], fs: 10 })), { t: x.score.toFixed(1), b: true, c: out ? C.red : C.plum, f: out ? 'FBE3E4' : (i < 2 ? 'FDECC8' : undefined) }];
  })], { x: b.x, y: b.y, w: b.w, colW: [1.42, 1.15, 0.5, 0.48, 0.55, 0.55, b.w - 4.65], rowH: [0.3, ...cats.map(() => 0.235)], fs: 8, hfs: 7.5, margin: 0.025 });
  T(s, [run('Rows 10–12 fail two tests: not now. ', { bold: true, color: C.red }), run('Floor ✓ = factory cost ≥ 12% under the demand-weighted median; Returns ✓ = low return band; Freight ✓ = light for its value.', {})],
    { x: b.x, y: b.y + b.h - 0.28, w: b.w, h: 0.28, fontSize: 7.5, valign: 'middle' });
  // P2 market sizing strip
  b = panel(s, [0, 0.72, 0.42, 0.28], 'Market sizing: TAM → SAM → SOM (firms)', { hc: C.coral });
  const fun = M.funnel, fw = (b.w - 0.06 * (fun.length - 1)) / fun.length;
  fun.forEach(([label, v, src], k) => {
    const x = b.x + k * (fw + 0.06), col = k === 3 || k === 5 ? C.coral : k === 6 ? C.saffron : C.plum2;
    box(s, x, b.y, fw, 0.44, col, { round: true, r: 0.04 });
    T(s, big(v), { x, y: b.y, w: fw, h: 0.3, fontSize: v >= 1e5 ? 8.5 : 10, bold: true, color: k === 6 ? C.plum : C.white, align: 'center', valign: 'middle', fontFace: F.head });
    T(s, label.replace(' (TAM)', '').replace(' (SAM)', '').replace(' (SOM)', ''), { x: x - 0.02, y: b.y + 0.47, w: fw + 0.04, h: 0.36, fontSize: 6.5, align: 'center', color: C.text });
    if (k) chip(s, x - 0.17, b.y + 0.3, 0.28, 0.14, pc(v / fun[k - 1][1], v / fun[k - 1][1] < 0.02 ? 1 : 0), C.white, { size: 6.5, color: C.coral, line: C.coral });
  });
  T(s, [run('TAM ', { bold: true, color: C.coral }), run('55,451 make Meesho’s categories · ', {}), run('SAM ', { bold: true, color: C.coral }), run(`${IN(M.SAM)} own ≥ 3 of 4 cost levers in the 12 clusters · `, {}), run('SOM ', { bold: true, color: C.coral }), run(`${IN(M.SOM)} active by Year 4 (12%) = ${cr(Y4.nmv)} run-rate NMV`, {})],
    { x: b.x, y: b.y + 0.84, w: b.w, h: b.h - 0.84, fontSize: 7.5, valign: 'middle' });

  // P3 personas
  b = panel(s, [0.42, 0, 0.32, 1], 'Target manufacturer personas (cohort score out of 5)');
  const cs = Object.fromEntries(coh.map((x) => [x.k, x]));
  const personas = [
    ['FaIndustry', 'Export-hit knitwear owner', 'Cohort A · Tiruppur', `₹10–50 cr turnover · Cohort A = ${pc(cs.A.share)} of SAM ≈ ${IN(cs.A.firms)} firms`, cs.A.score, C.coral,
      [['Barrier', 'No unit-level ops; making to stock is a balance-sheet change'], ['Motivation', 'Idle lines after the US tariff; wants a domestic hedge'], ['Needs', 'Confirmed orders · no packing team · cash before 45–60 days'], ['Reach', 'Association camps, 40–60 units each']]],
    ['FaWarehouse', 'Domestic home-textile maker', 'Cohort A · Panipat', 'Small and medium units, bulky low-return SKUs', cs.A.score, C.coral,
      [['Barrier', 'Bulky SKUs; no way to handle online returns'], ['Motivation', 'Exports −50%, domestic −35% this year: idle looms [S9]'], ['Needs', 'Steady domestic orders · bulk freight · price check first'], ['Reach', 'HCCI Panipat chapter; Udyam lists']]],
    ['FaRotateLeft', 'Churned Meesho manufacturer', 'Cohort C · Ludhiana, Surat', `Cohort C = ${pc(cs.C.share)} of SAM ≈ ${IN(cs.C.firms)} firms`, cs.C.score, C.plum2,
      [['Barrier', 'Weak first 30 orders, then a returns or RTO shock'], ['Motivation', 'Catalogue and KYC already done: sunk effort to reuse'], ['Needs', 'Returns capped at the node · early orders · penalty-free re-entry'], ['Reach', 'Dormant-seller list; one WhatsApp re-invite']]],
    ['FaStore', 'Online-elsewhere D2C maker', 'Cohort B · metros', `Cohort B = ${pc(cs.B.share)} of SAM ≈ ${IN(cs.B.firms)} firms`, cs.B.score, C.muted,
      [['Barrier', '₹800+ basket catalogue loses money at a ₹265 order value'], ['Motivation', `${SP.atu} mn buyers and Tier-2+ reach it lacks elsewhere`], ['Needs', 'Value-tier SKUs, not discounts · no brand dilution'], ['Reach', 'Seller agencies; price-check link']]],
  ];
  const ph = (b.h - 0.18) / 4;
  personas.forEach(([ic, title, tag, fact, score, col, lines], k) => {
    const y = b.y + k * (ph + 0.06);
    box(s, b.x, y, b.w, ph, C.white, { line: col, round: true, r: 0.04, lw: 1 });
    avatar(s, ic, b.x + 0.06, y + 0.06, 0.46, col);
    T(s, [run(title, { bold: true, color: C.plum, fontSize: 9, breakLine: true }), run(tag, { bold: true, color: col === C.muted ? C.plum2 : col, fontSize: 7.5, breakLine: true }), run(fact, { color: C.muted, fontSize: 7 })], { x: b.x + 0.58, y: y + 0.04, w: b.w - 1.22, h: 0.52, valign: 'middle' });
    chip(s, b.x + b.w - 0.6, y + 0.08, 0.54, 0.38, score.toFixed(2), col, { size: 11 });
    T(s, lines.map(([h, t], i2) => [run(`${h}: `, { bold: true, color: h === 'Barrier' ? C.red : h === 'Motivation' ? C.green : C.coral }), run(t, { breakLine: i2 < lines.length - 1 })]).flat(), { x: b.x + 0.06, y: y + 0.58, w: b.w - 0.12, h: ph - 0.6, fontSize: 7.5, valign: 'top', paraSpaceAfter: 1 });
  });

  // P4 least likely
  b = panel(s, [0.74, 0, 0.26, 0.60], 'Least likely to adopt', { hc: C.coral });
  const ll = [['Surat ethnic-wear traders', ['Job out weaving and stitching: no cost ownership', 'Worst return band; cluster AHP last (3.28)']], ['Import-assemblers', ['Electronics accessories: cost set by imports', 'Any price gap must be funded: a subsidy']],
    ['Fitted western-wear makers', ['Size returns swallow the cost edge', `₹${A.A26.value} fee on every return [S11]`]], ['Premium D2C lines (Cohort B)', ['Brand dilution at a ₹265 order value', 'The one barrier Meesho cannot fix']]];
  const lh = (b.h - 0.15) / 4;
  ll.forEach(([h, pts], k) => {
    const y = b.y + k * (lh + 0.05);
    chip(s, b.x, y, b.w, 0.2, h, C.coral, { size: 8 });
    list(s, pts, b.x + 0.03, y + 0.22, b.w - 0.06, lh - 0.22, { fs: 7.5, glyph: '✕', gc: C.red, psa: 0 });
  });
  // P5 recommendation
  b = panel(s, [0.74, 0.60, 0.26, 0.40], 'Recommendation to Meesho');
  list(s, [['Focus', 'on Cohort A in hosiery (Tiruppur) and home textiles (Panipat): top cost edge, low returns.'], ['Re-invite', 'Cohort C in parallel: KYC and catalogues already on file.'], ['Offer', 'Cohort B a separate value-tier range, never a discount on brand lines.'],
    ['Screen', `every seller on price, not turnover: ${PROTO.top10NotReady} of the 10 largest prototype sellers fail.`]], b.x, b.y, b.w, b.h, { fs: 8, psa: 3 });
}

// ================================================================== 4 · USER PERSONAS & FLOW
{
  const s = page(2, {
    headline: 'Six users, one flow: buyers prepay, factories make, nodes ship, an NBFC funds and Meesho runs the rules',
    rail: 'USERS & FLOW',
    band: 'Decision: sign the three partner roles before the first batch (two associations, one Tiruppur node, one NBFC); first prepaid batches in Week 10. Owner: Category + Valmo + Finance · KPI: all signed by Day 60.',
    foot: `Sources: S1 (${SP.freq} orders per buyer a year; ${pc(SP.prepaid)} of shipped orders prepaid), S9, S12 (₹24 SMB fulfilment), S18 MSME-TEAM, S26 seller loans; prototype (~${IN(r10(PROTO.hs.perManager))} sellers per manager)   |   Flow numbers: one ${IN(BX.confirmed)}-pack batch (page 10)   |   Personas are composites, not real people or firms`,
  });
  // P1 swimlane flow
  let b = panel(s, [0, 0, 1, 0.52], `End-to-end flow for one ${IN(BX.confirmed)}-pack prepaid batch: who does what, and when (D = day of the pre-order window)`);
  const lanes = [['FaUserTie', 'Association', C.plum2], ['FaIndustry', 'Factory', C.coral], ['FaGaugeHigh', 'Meesho rules + data', C.plum], ['FaStore', 'Buyer', C.saffron], ['FaWarehouse', 'Node + Valmo', C.plum2], ['FaIndianRupeeSign', 'NBFC', C.green]];
  const steps = [['1 · Recruit', 'D−10'], ['2 · Qualify', 'D−7'], ['3 · Brief', 'D−5'], ['4 · Commit', 'D−5'], ['5 · Pre-order', 'D0–3'], ['6 · Make', 'D0–4'], ['7 · Handover', 'D5'], ['8 · Ship', 'D6–12'], ['9 · Settle', 'D13–19'], ['10 · Score', 'daily']];
  const LW = 1.32, HH = 0.3, cwS = (b.w - LW) / steps.length, lh = (b.h - HH) / lanes.length;
  steps.forEach(([n, d], k) => T(s, [run(n, { bold: true, color: C.plum, breakLine: true }), run(d, { color: C.muted })], { x: b.x + LW + k * cwS, y: b.y, w: cwS, h: HH, fontSize: 7.5, align: 'center', valign: 'middle' }));
  lanes.forEach(([ic, name, col], i) => {
    const y = b.y + HH + i * lh;
    box(s, b.x, y + 0.015, b.w, lh - 0.03, i % 2 ? C.white : 'F8EEF4', { line: C.line, round: true, r: 0.03 });
    avatar(s, ic, b.x + 0.04, y + (lh - 0.27) / 2, 0.27, col);
    T(s, name, { x: b.x + 0.35, y, w: LW - 0.37, h: lh, fontSize: 8, bold: true, color: C.plum, valign: 'middle' });
  });
  const cell = (k, i) => ({ x: b.x + LW + k * cwS + 0.13, y: b.y + HH + i * lh + 0.045, w: cwS - 0.26, h: lh - 0.09 });
  const flowBoxes = [
    [0, 0, 'Camp for 40–60 units'], [1, 2, `Price check: ${rs(U.cols[3].floor)} vs ${rs(U.gate)} gate`], [2, 2, 'Demand Brief: districts, sizes'], [3, 1, `Commits a ${IN(BX.confirmed)}-pack batch`],
    [4, 3, `Prepays ${rs(BX.price)}, waits 7–8 days`], [5, 1, `Makes ${IN(BX.make)} (+15%)`], [6, 4, 'One truck in; QC sample'], [6, 5, `Advances ${rs(BX.advance)} (30%)`],
    [7, 4, 'Packs, ships; grades returns'], [8, 2, `Pays ${rs(BX.payout)} net of fees`], [8, 5, 'Repaid from the payout'], [8, 1, `Keeps +${rs(BX.balance)}`],
    [9, 2, 'Health Score; grants if slow'], [9, 0, 'Peers referred to camps'],
  ];
  const pathF = [[0, 0], [1, 2], [2, 2], [3, 1], [4, 3], [5, 1], [6, 4], [7, 4], [8, 2], [9, 2]];
  for (let j = 0; j < pathF.length - 1; j++) {
    const a = cell(...pathF[j]), c = cell(...pathF[j + 1]);
    const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = c.x, y2 = c.y + c.h / 2;
    s.addShape(SH.LINE, { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.max(Math.abs(y2 - y1), 0.001), flipV: y2 < y1, line: { color: C.coral, width: 1.25, dashType: 'dash', endArrowType: 'triangle' } });
  }
  flowBoxes.forEach(([k, i, t]) => {
    const c = cell(k, i);
    box(s, c.x, c.y, c.w, c.h, C.white, { line: lanes[i][2], round: true, r: 0.04, lw: 1.25 });
    T(s, t, { x: c.x + 0.03, y: c.y, w: c.w - 0.06, h: c.h, fontSize: 7, align: 'center', valign: 'middle', bold: i === 3 || i === 5 });
  });
  // P2 six user personas
  b = panel(s, [0, 0.52, 1, 0.48], 'Six user personas (resellers are affected, not users: the badge is capped at 20% of category impressions)', { hc: C.coral });
  const P6 = [
    ['FaStore', 'Value-seeking buyer', `Tier-2+ shopper · ~${Math.round(SP.freq)} orders a year [S1]`, C.saffron, 'lowest price, reliable delivery, easy returns', `${pc(1 - SP.prepaid)} still pay cash on delivery [S1]; unsure about prepaying for a 7–8 day wait`, `prepays ${rs(BX.price)} for a 3-pack instead of ${rs(U.mkt)}`, `${rs(U.split.buyer, 1)} off a pack; a “Sold directly by the manufacturer” badge`, `Prepaid share ≥ ${pc(prepaidC2M, 1)}`, 'Meesho app; UPI pre-order at checkout'],
    ['FaIndustry', 'Factory owner', '4 personas on page 3 (cohorts A, A, C, B)', C.coral, 'orders before cutting fabric; no packing team', 'build-to-stock risk; 45–60 day distributor terms', 'price check, commits batches, drops stock in bulk', `${rs(U.split.factory, 1)} a pack vs ${rs(U.b2bMarginPerPack, 1)} ex-factory; cash in ~11 days`, 'First batch ≤ 14 days', 'Supplier app, WhatsApp, voice agent'],
    ['FaGaugeHigh', 'Category manager', `Meesho · ~${IN(r10(PROTO.hs.perManager))} C2M sellers each`, C.plum, 'category NMV protected; few manual cases', 'cannot chase hundreds of sellers by phone', 'acts only when a score stays below 40 after an automatic fix', 'control tower: price screen, Health Score queue, Day-30 readout', '≤ 5 escalations per 100 a month', 'Control-tower dashboard (prototype)'],
    ['FaWarehouse', 'Node operator', 'Partner 3PL in the cluster; Valmo delivers onward', C.plum2, 'steady daily volume; clean order data', 'idle space between seasons', 'takes bulk drops; picks, packs, ships; grades returns', `₹${A.A28.value.nodeFee} a unit (pack ₹6, handle ₹9, freight ₹5); ${cr(A.A17.value.perNode)} set-up support`, '95% shipped within 48 h', 'Order feed from Meesho; Valmo pickups'],
    ['FaIndianRupeeSign', 'NBFC partner', 'Lender to marketplace sellers [S26]', C.green, 'short, low-risk loans', 'cannot see small factories’ order flow', `advances ${pc(A.A20.value.advance)} of confirmed pre-order value at handover`, `repaid from the payout ~7 days after delivery; buyers already prepaid; Meesho covers the first ${pc(A.A20.value.firstLoss)} of losses`, 'Advance within 24 h; losses ≤ 1%', 'Confirmed-order data shared by Meesho'],
    ['FaUserTie', 'Cluster association', 'Tiruppur and Panipat industry bodies', C.plum2, 'orders for members hit by export swings', 'Panipat exports −50%, domestic −35% [S9]', 'hosts camps of 40–60 units; vouches for members', 'domestic demand for members; MSME-TEAM co-funding, ₹277 cr scheme [S18]', '≥ 50% of camp units listed', 'Camps, member WhatsApp groups'],
  ];
  const pcw = (b.w - 0.08 * 5) / 6;
  P6.forEach(([ic, title, sub, col, wants, pain, does, gets, kpi, uses], k) => {
    const x = b.x + k * (pcw + 0.08);
    box(s, x, b.y, pcw, b.h, C.white, { line: col, round: true, r: 0.04, lw: 1 });
    avatar(s, ic, x + 0.05, b.y + 0.05, 0.38, col);
    T(s, [run(title, { bold: true, color: C.plum, fontSize: 9, breakLine: true }), run(sub, { color: C.muted, fontSize: 7 })], { x: x + 0.47, y: b.y + 0.03, w: pcw - 0.5, h: 0.44, valign: 'middle' });
    T(s, [['Wants', wants, C.plum], ['Pain', pain, C.red], ['Does', does, C.coral], ['Gets', gets, C.green], ['Uses', uses, C.plum2]].map(([h, t, hc], i2) => [run(`${h}: `, { bold: true, color: hc }), run(t, { breakLine: i2 < 4 })]).flat(),
      { x: x + 0.06, y: b.y + 0.5, w: pcw - 0.12, h: b.h - 0.8, fontSize: 7.5, valign: 'top', paraSpaceAfter: 2 });
    chip(s, x + 0.05, b.y + b.h - 0.27, pcw - 0.1, 0.23, `KPI: ${kpi}`, C.fill2, { size: 7.5, color: C.plum, line: C.saffron });
  });
}

// ================================================================== 4 · AWARENESS & STRATEGY
{
  const s = page(3, {
    headline: `Big idea: Factory Direct lets a factory sell to ${SP.atu} mn buyers without an e-commerce team, reached through cluster camps`,
    rail: 'AWARENESS & STRATEGY',
    band: 'Decision: launch Factory Direct camps with the Tiruppur and Panipat associations. Owner: Category + Growth · KPI: 40–60 units a camp, ≥ 50% of qualified factories listed within 30 days.',
    foot: 'Sources: S1 (274 mn buyers; 1.04 mn sellers; Gen-AI voice agents), S8 Tiruppur, S9 Panipat, S18 MSME-TEAM, S21   |   Story is an illustrative composite (Murugan is not a real person); its numbers come from the model (Appendix B)   |   Assumptions: A10, A20, A22, A32',
  });
  // P1 storyboard
  let b = panel(s, [0, 0, 1, 0.37], 'Behaviour change, one factory owner (illustrative): from export shock to repeat batches');
  const frames = [
    ['FaTriangleExclamation', 'Day −30', 'Murugan’s US order is cut under the 50% tariff; a third of his knitting lines sit idle [S8].', C.red, 'Trigger: export shock'],
    ['FaUserTie', 'Day −10', 'At a Tiruppur association meet, Meesho’s cluster team runs a Factory Direct camp for 50 units.', C.plum, 'Lever: cluster camp'],
    ['FaWhatsapp', 'Day −7', `He sends his making cost on WhatsApp: lowest viable price ${rs(U.cols[3].floor)} vs the ${rs(U.gate)} gate. He qualifies.`, C.green, 'Lever: price check'],
    ['FaMapLocationDot', 'Day −5', 'A Demand Brief shows which districts buy men’s briefs; he commits a 1,000-pack prepaid batch.', C.plum, 'Lever: Demand Brief + pre-order'],
    ['FaWarehouse', 'Day 5', `One truck to the Tiruppur node: ${rs(BX.advance)} lands at handover; the node ships every order.`, C.coral, 'Lever: node + 30% advance'],
    ['FaRocket', 'Day 13–19', `Paid ${rs(BX.balance)} more for kept orders, net of fees; he refers two neighbouring units.`, C.green, 'Outcome: repeat + referral'],
  ];
  const fwf = (b.w - 0.16 * 5) / 6;
  frames.forEach(([ic, d, t, col, lever], k) => {
    const x = b.x + k * (fwf + 0.16);
    avatar(s, ic, x + 0.02, b.y + 0.02, 0.52, col);
    chip(s, x + 0.6, b.y + 0.12, 0.62, 0.22, d, col, { size: 8 });
    T(s, String(k + 1), { x: x + fwf - 0.3, y: b.y + 0.04, w: 0.3, h: 0.3, fontSize: 16, bold: true, color: C.line, align: 'right', fontFace: F.head });
    T(s, t, { x, y: b.y + 0.6, w: fwf, h: b.h - 0.92, fontSize: 8.5, valign: 'top' });
    chip(s, x, b.y + b.h - 0.26, fwf, 0.24, lever, C.fill2, { size: 8, color: C.plum, line: C.saffron });
    if (k < 5) T(s, '➜', { x: x + fwf, y: b.y + 0.12, w: 0.16, h: 0.3, fontSize: 12, bold: true, color: C.saffron, align: 'center', valign: 'middle' });
  });
  // P2 rationale
  b = panel(s, [0, 0.37, 0.19, 0.35], 'Rationale: why factories switch', { hc: C.coral });
  list(s, ['No pick-pack-ship team needed', `Make only confirmed orders (+15%)`, `${pc(A.A20.value.advance)} cash at handover, rest in ~11 days`, `${rs(U.split.factory, 1)} a pack vs ${rs(U.b2bMarginPerPack, 1)} ex-factory`, 'Domestic hedge against export swings', `0% commission; ₹${A.A27.value} RTO fee`], b.x, b.y, b.w, b.h, { fs: 8.5, psa: 5 });
  // P3 channels ATL / TTL / BTL
  b = panel(s, [0.19, 0.37, 0.55, 0.35], 'Channels to reach factories: ATL · TTL · BTL (segment each one targets)');
  const chn = [
    ['ATL reach', [['Regional business news + YouTube explainers', 'in Tamil and Hindi (A)'], ['Supplier-app banner', `to ${SP.ats} mn existing sellers (C) [S1]`]]],
    ['TTL reach', [['WhatsApp + Gen-AI voice agents', 'in local languages, already live at Meesho (A, C) [S1]'], ['Price-check link', 'shared by seller agencies (B)']]],
    ['BTL reach', [['Association camps', 'Tiruppur and Panipat bodies, 40–60 units each (A)'], ['MSME-TEAM / ONDC workshops', '₹277 cr scheme to co-fund camps [S18]'], ['Dormant-seller re-invite', 'one WhatsApp, KYC on file (C)']]],
  ];
  const ccw = (b.w - 0.16) / 3;
  chn.forEach(([h, items], k) => {
    const x = b.x + k * (ccw + 0.08);
    chip(s, x, b.y, ccw, 0.24, h, C.saffron, { size: 9, color: C.plum });
    list(s, items, x, b.y + 0.3, ccw, b.h - 0.3, { fs: 8.5, glyph: '•', gc: C.coral, psa: 5 });
  });
  // P4 camps why/what/how
  b = panel(s, [0.74, 0.37, 0.26, 0.35], 'Cluster camps: why · what · how', { hc: C.coral });
  T(s, [run('Why? ', { bold: true, color: C.coral }), run('Factories sit together: ~3,200 knitwear units in Tiruppur [S8]; ~₹60,000 cr turnover in Panipat [S9].', { breakLine: true }),
    run('What? ', { bold: true, color: C.coral }), run('Live price check, Demand Brief demo, node visit, GST and KYC desk.', { breakLine: true }),
    run('How? ', { bold: true, color: C.coral }), run('The association hosts; 40–60 units a camp; a factory can list the same day.', { breakLine: true }), run('Measure: ', { bold: true, color: C.coral }), run('units attended → price checks → listed → first batch, per camp.', {})], { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 8.5, paraSpaceAfter: 5, valign: 'top' });
  // P5 4P
  b = panel(s, [0, 0.72, 0.74, 0.28], 'The offer: product · promotion · place · price');
  const fourP = [
    ['Product', 'Factory Direct stack: price check, Demand Brief, pre-order window, Factory Node, 30% advance, returns firewall. One supplier app, six levers.'],
    ['Promotion', 'Camp + WhatsApp campaign “Your factory, India’s buyers”; buyers see “Sold directly by the manufacturer” and the price gap.'],
    ['Place', 'Tiruppur and Panipat first, 12 clusters by Year 4, one partner node each; supplier app, WhatsApp and voice agent.'],
    ['Price', `0% commission · node fee ₹${A.A28.value.nodeFee}/unit · ₹${A.A27.value} RTO fee · ₹${A.A32.value} pre-order discount, funded by the ₹${IN(U.batchSaving, 0)} batch saving`],
  ];
  const pw = (b.w - 0.24) / 4;
  fourP.forEach(([h, t], k) => {
    const x = b.x + k * (pw + 0.08);
    chip(s, x, b.y, pw, 0.24, h, C.plum, { size: 9 });
    T(s, t, { x: x + 0.03, y: b.y + 0.28, w: pw - 0.06, h: b.h - 0.28, fontSize: 8.5, valign: 'top' });
  });
  // P6 bottlenecks
  b = panel(s, [0.74, 0.72, 0.26, 0.28], 'Bottlenecks and solutions', { hc: C.coral });
  T(s, [run('Distrust after returns shocks → ', { bold: true, color: C.plum }), run('returns end at the node; a pool caps losses.', { breakLine: true }), run('Export orders return (tariff now 18%) → ', { bold: true, color: C.plum }), run('batches fill idle lines between export runs.', { breakLine: true }), run('Fear of a price squeeze → ', { bold: true, color: C.plum }), run('the gate rewards a gap that exists; Meesho never asks for cuts.', {})],
    { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 8.5, paraSpaceAfter: 5, valign: 'top' });
}

// ================================================================== 5 · BENCHMARKING & COMPARISON
{
  const cols = U.cols;
  const s = page(4, {
    headline: 'Of three ways to bring factories online, only Factory Direct removes unit operations, stock risk and returns within FDI rules',
    rail: 'MODEL COMPARISON',
    band: 'Decision: build Factory Direct (seller-owned stock at partner nodes plus prepaid batches); Meesho never takes title to stock. Owner: Valmo + Legal · KPI: zero inventory-control findings.',
    foot: 'Sources: S1, S2 (Valmo 50–55% of deliveries), S16 Temu semi-managed, S17 Shein Brazil, S19 Press Note 2 (marketplace may not own or control seller inventory), S23–S25   |   Costs per pack from the unit-economics table (page 10, Appendix C)',
  });
  const models = [
    ['1', 'Open marketplace', '(factory self-ships)', 'The factory lists, then packs, ships and takes back every return itself.', [['FaIndustry', 'Factory'], ['FaClipboardCheck', 'Packs each order'], ['FaTruckFast', 'Courier'], ['FaStore', 'Buyer']], 'Meesho today · Amazon · Flipkart', C.plum2,
      [['Factory does:', 'list, pack, ship, take back returns'], ['Platform does:', 'storefront, payments, courier'], ['Result:', `lowest viable price ${rs(cols[1].floor)}, ${pc(cols[1].gap, 1)} below: fails the 8% gate`]]],
    ['2', 'Fully managed', '(platform buys and holds stock)', 'The factory sells stock to the platform, which prices, stores and ships it.', [['FaIndustry', 'Factory'], ['FaIndianRupeeSign', 'Platform buys'], ['FaWarehouse', 'Platform warehouse'], ['FaStore', 'Buyer']], 'Temu (fully managed) · Shein', C.red,
      [['Factory does:', 'make to the platform’s purchase order'], ['Platform does:', 'buy, price, store, ship, handle returns'], ['Result:', 'not allowed: an FDI marketplace may not own seller stock [S19]']]],
    ['3', 'Factory Direct', '(seller-owned stock at a node)', 'The factory makes confirmed pre-orders and drops them in bulk; a partner node ships and takes returns.', [['FaIndustry', 'Factory'], ['FaUserClock', 'Pre-order batch'], ['FaWarehouse', 'Factory Node'], ['FaStore', 'Buyer']], 'Temu semi-managed · Pinduoduo · Taobao C2M', C.green,
      [['Factory does:', 'make confirmed batches, keep title'], ['Node and Meesho do:', 'pick, pack, ship, returns; demand data, gate'], ['Result:', `lowest viable price ${rs(cols[3].floor)}, ${pc(cols[3].gap, 1)} below: clears the gate`]]],
  ];
  models.forEach(([n, h, sub, d, steps, who, col, det], k) => {
    const b = panel(s, [k / 3, 0, 1 / 3, 0.40], `${n} · ${h} ${sub}`, { hc: k === 2 ? C.coral : C.plum, fill: k === 2 ? 'FFF0F1' : C.fill });
    T(s, d, { x: b.x, y: b.y, w: b.w, h: 0.3, fontSize: 8, italic: true, align: 'center' });
    ribbon(s, b.x + 0.1, b.y + 0.32, b.w - 0.2, steps, { d: 0.4, fs: 7.5, col: k === 2 ? C.coral : C.plum });
    list(s, det, b.x, b.y + 1.0, b.w, b.h - 1.44, { fs: 7.5, glyph: '›', gc: C.coral, psa: 1 });
    box(s, b.x, b.y + b.h - 0.32, b.w, 0.32, C.fill2, { line: C.saffron, round: true, r: 0.04 });
    T(s, [run('Who runs it: ', { bold: true, color: C.coral }), run(who, { bold: true, color: C.plum })], { x: b.x + 0.05, y: b.y + b.h - 0.32, w: b.w - 0.1, h: 0.32, fontSize: 8.5, align: 'center', valign: 'middle' });
  });
  let b = panel(s, [0, 0.40, 0.68, 0.60], 'Comparison of C2M operating models (✓ removes the barrier · – partly · ✕ no)');
  const rowsM = [
    ['1 · Open marketplace', 'No capex; the factory keeps control', `Needs a packing and returns team; builds stock blind; ${rs(cols[1].logistics, 0)} logistics per pack`, 'xxxyy'],
    ['2 · Fully managed', 'The factory only makes; the platform runs everything', 'Platform owns inventory: barred for FDI marketplaces (Press Note 2); price-squeeze risk', 'yyyxx'],
    ['3 · Factory Direct', 'Node runs unit ops; batches only for confirmed orders; seller keeps title', `Needs node partners (${cr(A.A17.value.perNode)} each) and a 7–8 day pre-order wait`, 'yyyya'],
  ];
  table(s, [['Strategy considered', 'Advantages', 'Disadvantages', 'Unit ops', 'Stock risk', 'Returns', 'FDI-legal', 'Low capex'], ...rowsM.map((r, i) => [{ t: r[0], b: true, c: i === 2 ? C.coral : C.plum, f: i === 2 ? C.pink : undefined }, { t: r[1], a: 'left', f: i === 2 ? C.pink : undefined }, { t: r[2], a: 'left', f: i === 2 ? C.pink : undefined }, ...r[3].split('').map(symCell)])],
    { x: b.x, y: b.y, w: b.w, colW: [1.25, 1.95, 2.3, 0.55, 0.55, 0.55, 0.55, b.w - 7.7], rowH: [0.26, 0.56, 0.56, 0.56], fs: 8, hfs: 8 });
  T(s, [run('What a tick means: ', { bold: true, color: C.plum }), run('the model takes that barrier off the factory entirely (unit ops, stock risk, returns), is allowed for an FDI-funded marketplace, or needs under ₹2 cr of Meesho capex per cluster.', {})],
    { x: b.x, y: b.y + 1.98, w: b.w, h: 0.3, fontSize: 7.5, italic: true, color: C.muted });
  const lessons = [['Temu', `moved US sellers to semi-managed: 20% of US GMV by Q3 2024 [S16]`], ['Shein Brazil', '336 of 2,000 factories signed; 1 still producing after price-cut asks [S17]'], ['Meesho Valmo', 'started as a capped H2 bet; now 50–55% of deliveries [S1, S2]']];
  const lw = (b.w - 0.16) / 3;
  lessons.forEach(([h, t], k) => {
    const x = b.x + k * (lw + 0.08);
    box(s, x, b.y + 2.34, lw, b.h - 2.34, C.white, { line: C.saffron, round: true, r: 0.04 });
    T(s, [run(`${h}: `, { bold: true, color: C.coral }), run(t, {})], { x: x + 0.05, y: b.y + 2.34, w: lw - 0.1, h: b.h - 2.34, fontSize: 8, valign: 'middle' });
  });
  b = panel(s, [0.68, 0.40, 0.32, 0.60], 'Costs considered per model (₹ per 3-pack kept)', { hc: C.coral });
  table(s, [['Cost line', 'Self-ship', 'Factory Direct'],
    ['Logistics (forward + pack / node)', cols[1].logistics.toFixed(1), cols[3].logistics.toFixed(1)], ['Unsold stock', cols[1].unsold.toFixed(1), cols[3].unsold.toFixed(1)], ['Working capital', cols[1].capital.toFixed(1), cols[3].capital.toFixed(1)],
    ['Returns (₹150 each)', cols[1].returns.toFixed(1), cols[3].returns.toFixed(1)], [{ t: 'Lowest viable price', b: true }, { t: rs(cols[1].floor), b: true, c: C.red }, { t: rs(cols[3].floor), b: true, c: C.green }]],
  { x: b.x, y: b.y, w: b.w, colW: [1.85, 0.95, b.w - 2.8], rowH: [0.22, 0.24, 0.24, 0.24, 0.24, 0.26], fs: 8 });
  list(s, [['Fully managed:', 'not costed; an FDI marketplace may not own seller stock [S19].'], ['Meesho’s cost:', `${cr(A.A17.value.perNode)} set-up per partner node; ${A.A17.value.nodes[4]} nodes by Year 4 (page 11).`], ['Node fee:', `₹${A.A28.value.nodeFee} a unit (pack ₹6, handle ₹9, bulk freight ₹5) vs ₹24 for SMB fulfilment [S12].`]],
    b.x, b.y + 1.52, b.w, b.h - 1.52, { fs: 7.5, glyph: '›', gc: C.coral, psa: 3 });
}

// ================================================================== 6 · BEST PRACTICES
{
  const rc = M.rice;
  const s = page(5, {
    headline: 'Pinduoduo, Taobao, Temu and Shein built C2M on demand data and small batches; RICE puts the ₹0 price gate first',
    rail: 'BEST PRACTICES',
    band: 'Decision: build in RICE order (price gate → Health Score → co-ops → Demand Brief → batches → node → prepayment → firewall); never ask a factory for a price cut. Owner: Strategy.',
    foot: 'Sources: S15 KrASIA, S16 Tech Buzz China, S17 Reuters, S23 Xinhua, S24 Alibaba results, S25 AFP · benefits from the master model (pages 10–11)   |   RICE: reach = sellers touched in Year 2; effort = person-months; full benchmark table: Appendix C',
  });
  let b = panel(s, [0, 0, 0.58, 0.68], 'Best practices: five platforms × five dimensions');
  const co = ['Pinduoduo NBI · China', 'Taobao C2M · China', 'Temu semi-managed', 'Shein on-demand', 'Shein Brazil (avoid)'];
  const dims = [
    ['Strategy used', ['Anonymised demand data to factories', 'Factory-direct value app (Taobao Deals)', 'Merchant stock in local warehouses; platform storefront', 'Test every product in a small first batch', 'Local factories asked for ~30% price cuts']],
    ['Scale (dated)', ['900+ factories, 2,200+ custom SKUs, 115 mn+ orders, end-2019 [S15]', 'Target 10 bn new orders in 3 yrs, 2020 [S23]; 280 mn buyers, 2021 [S24]', '20% of US GMV, Q3 2024; +80,000 merchants planned [S16]', '100–200 item first runs (2024) [S25]', '336 of 2,000 signed; 1 producing, Feb 2026 [S17]']],
    ['Data and tech', ['Search and order data, anonymised', 'Consumer insight for product R&D', 'Platform pricing and traffic', 'Real-time sell-through decides restocks', 'Demands without demand data']],
    ['Risk-sharing', ['Factory keeps its brand; co-developed SKUs', 'Alibaba finance arms lend to factories', 'Merchant holds stock and returns risk', 'Shein absorbs the test-batch risk', 'Factory bears all cost of the cuts']],
    ['Meesho copies', ['Demand Brief', 'NBFC batch prepayment', 'Seller-owned node stock', 'Confirmed-order batches', 'Never ask for price cuts']],
  ];
  table(s, [['Parameter', ...co], ...dims.map(([d, cells], i) => [{ t: d, b: true, c: C.white, f: C.plum2 }, ...cells.map((t, j) => ({ t, a: 'left', b: i === 4 || i === 1, c: i === 4 ? (j === 4 ? C.red : C.green) : (i === 1 ? C.plum : C.text), f: j === 4 ? C.pink : undefined }))])],
    { x: b.x, y: b.y, w: b.w, colW: [0.9, ...Array(5).fill((b.w - 0.9) / 5)], rowH: [0.26, 0.5, 0.74, 0.5, 0.5, 0.36], fs: 7.5, hfs: 7.5 });
  T(s, [run('Pattern: ', { bold: true, color: C.coral }), run('every winner gave factories demand data or finance before asking for anything; the one failure asked for price cuts and gave nothing.', { bold: true, color: C.plum })], { x: b.x, y: b.y + 2.92, w: b.w, h: b.h - 2.92, fontSize: 8, valign: 'middle' });

  b = panel(s, [0.58, 0, 0.42, 0.24], 'Inspiration: what we copy, in order', { hc: C.coral });
  const cp = [['Measure', 'the gap'], ['Share', 'demand'], ['Batch', 'on orders'], ['Stock', 'near buyers']];
  const chw = (b.w - 0.06) / 4;
  cp.forEach(([h, t], k) => {
    s.addShape(SH.CHEVRON, { x: b.x + k * chw, y: b.y, w: chw + 0.04, h: b.h - 0.22, fill: { color: [C.plum, C.plum2, C.coral, C.saffron][k] }, line: { color: C.white, width: 1 } });
    T(s, [run(h, { bold: true, breakLine: true }), run(t, {})], { x: b.x + k * chw + 0.15, y: b.y, w: chw - 0.17, h: b.h - 0.22, fontSize: 8, color: k === 3 ? C.plum : C.white, align: 'center', valign: 'middle' });
  });
  T(s, 'Pinduoduo/Taobao → Pinduoduo → Shein → Temu', { x: b.x, y: b.y + b.h - 0.2, w: b.w, h: 0.2, fontSize: 7.5, italic: true, color: C.muted, align: 'center' });

  b = panel(s, [0.58, 0.24, 0.42, 0.26], 'Potential pitfalls and our guardrail');
  const pf = [['Price squeeze (Shein Brazil):', 'the gate measures a gap that exists; no price asks'], ['Platform-owned stock (Temu full-managed):', 'seller keeps title; the node is an arm’s-length 3PL'], ['Order subsidies:', 'impressions, never rupees per order'], ['Capex before demand:', 'no node before the Day-30 gate']];
  list(s, pf, b.x, b.y, b.w, b.h, { fs: 8, glyph: '✕', gc: C.red, lc: C.text, psa: 2 });

  b = panel(s, [0.58, 0.50, 0.42, 0.50], 'R.I.C.E. prioritisation: score = reach × impact × confidence ÷ effort', { hc: C.coral });
  table(s, [['Lever', 'Reach', 'Impact', 'Conf.', 'Effort', 'Score', 'Yr-1'], ...rc.map((x, i) => [{ t: `${i + 1} · ${x.name}`, b: true, c: C.plum }, IN(x.R), '★'.repeat(x.I) + '☆'.repeat(3 - x.I), pc(x.C), `${x.E} p-m`, { t: IN(x.score), b: true, c: i < 2 ? C.coral : C.plum }, x.y1 ? cr(x.y1) : '₹0'])],
    { x: b.x, y: b.y, w: b.w, colW: [1.92, 0.45, 0.5, 0.45, 0.5, 0.45, b.w - 4.27], rowH: [0.21, ...rc.map(() => 0.2)], fs: 7.5, hfs: 7.5, margin: 0.02 });
  T(s, [run('Sequence: ', { bold: true, color: C.coral }), run('diagnostic and free first, capital last. RICE order already respects dependencies: batches need the brief, prepayment needs batches, the firewall needs the node.', {})],
    { x: b.x, y: b.y + 1.86, w: b.w, h: b.h - 1.86, fontSize: 7.5, valign: 'middle' });

  b = panel(s, [0, 0.68, 0.58, 0.32], 'Benefits analysis of Factory Direct (master model)', { hc: C.coral });
  const ben = [[`−${pc(U.cols[3].gap, 1)}`, `buyer price vs the ${rs(U.mkt)} market (briefs)`], [`${(U.split.factory / U.b2bMarginPerPack).toFixed(1)}×`, `factory margin a pack: ${rs(U.split.factory, 1)} vs ${rs(U.b2bMarginPerPack, 1)} ex-factory`], ['~11 days', 'cash cycle vs 45–60 days on distributor terms'],
    [`−${(M.c2m.failDrop * 100).toFixed(1)} pts`, 'failed deliveries per C2M order (prepaid pre-orders)'], [rs(A.A8.value * SP.contribPerOrder + M.c2m.rtoSavingPerOrder, 1), 'Meesho value per C2M order (page 11)'], [pc(A.A31.value.batch), `unsold stock vs ${pc(A.A31.value.stock)} building to stock`]];
  const bw = (b.w - 0.25) / 6;
  ben.forEach(([n, t], k) => {
    const x = b.x + k * (bw + 0.05);
    box(s, x, b.y, bw, b.h, C.white, { line: C.coral, round: true, r: 0.04 });
    T(s, n, { x, y: b.y + 0.04, w: bw, h: 0.42, fontSize: 14, bold: true, color: k % 2 ? C.plum : C.coral, align: 'center', valign: 'middle', fontFace: F.head });
    T(s, t, { x: x + 0.04, y: b.y + 0.5, w: bw - 0.08, h: b.h - 0.52, fontSize: 8, align: 'center' });
  });
}

// ================================================================== 7 · MANUFACTURER JOURNEY
{
  const grantCost = A.A19.value.perSeller / 1000 * A.A19.value.cpm;
  const s = page(6, {
    headline: 'Seven stages, each with a trigger, a non-cash nudge and a KPI, turn first batches into repeat factories without subsidy',
    rail: 'JOURNEY & SCALE-UP',
    band: 'Decision: switch on grants, the Health Score and the rulebook with the first 60 sellers; cap grants at 20% of category impressions. Owner: Growth + Data Science · KPI: active at D90 ≥ 75%.',
    foot: `Sources: S1 (seller tools: demand intelligence, faster visibility for new sellers, Gen-AI voice agents), S2   |   Assumptions: A19 (₹${A.A19.value.cpm} per 1,000 impressions); a category manager reviews 40 escalations a month   |   Prototype: synthetic ${PROTO.hs.cohort}-seller pilot, fixed seed`,
  });
  let b = panel(s, [0, 0, 0.69, 0.62], 'Manufacturer journey: actions, touchpoints, emotions, pain points, interventions, KPIs');
  const feel = { Sceptical: C.red, Hopeful: C.amber, Anxious: C.red, Worried: C.red, Informed: C.amber, Confident: C.green, Loyal: C.green };
  const jr = [
    ['Discover', 'D−30', 'Hears of it at an association camp', 'Camp, WhatsApp', 'Sceptical', '“Platforms mean returns”', 'Live price check at the camp', 'Camp → price check ≥ 60%'],
    ['Qualify', 'D−7', 'Enters making cost', 'Supplier app', 'Hopeful', 'Unsure of the real market price', 'Gap vs the demand-weighted median', 'Qualified → listed ≥ 50% in 30 days'],
    ['First batch', 'D0–5', 'Commits a prepaid batch', 'Demand Brief, node', 'Anxious', 'Fear of unsold stock', 'Make orders + 15%; 30% advance', 'First batch ≤ 14 days'],
    ['Activate', 'D0–14', 'Watches first orders', 'Score card', 'Worried', 'No reviews, slow orders', 'Starter impressions; +25K grant if < 60%', '≥ 60% of cohort orders at D7, D14'],
    ['Diagnose', 'Daily', 'Reads the weekly score', 'Health Score', 'Informed', 'Unclear what to fix', 'One rule-based fix at a time', 'Days to recover'],
    ['Graduate', 'D30+', 'Scales batches', 'Prepayment', 'Confident', 'Working capital', 'Prepayment at score ≥ 80 for 30 days', '≥ 40% graduated by D60'],
    ['Retain', 'D60+', 'Repeats; refers peers', 'Weekly brief, Mall', 'Loyal', 'Export orders return', 'Weekly brief; Meesho Mall path', 'Active at D90 ≥ 75%'],
  ];
  table(s, [['Stage', 'When', 'Manufacturer action', 'Touchpoint', 'Feels', 'Pain point', 'Meesho intervention (automatic)', 'KPI target'], ...jr.map((r) => [{ t: r[0], b: true, c: C.plum }, r[1], { t: r[2], a: 'left' }, r[3], { t: r[4], b: true, c: C.white, f: feel[r[4]] }, { t: r[5], a: 'left', i: true }, { t: r[6], a: 'left' }, { t: r[7], a: 'left', b: true }])],
    { x: b.x, y: b.y, w: b.w, colW: [0.72, 0.45, 1.3, 0.95, 0.62, 1.25, 1.75, b.w - 7.04], rowH: [0.24, ...jr.map(() => (b.h - 0.26) / jr.length)], fs: 7.5, hfs: 7.5, margin: 0.025 });

  b = panel(s, [0.69, 0, 0.31, 0.62], 'Incentives (non-cash) and nudges, stage by stage', { hc: C.coral });
  const inc = [['Discover', 'Free price check', 'Peer stories at the camp'], ['Qualify', 'C2M badge + re-rank', 'Your gap vs the market'], ['First batch', '30% cash at handover', 'Batch size from the brief'], ['Activate', '+25K impressions × 7 days (max 2)', 'WhatsApp: grant applied'],
    ['Diagnose', 'Fix suggestions', 'One fix, not ten'], ['Graduate', 'Prepaid batches unlocked', 'Graduation progress bar'], ['Retain', 'Meesho Mall path', 'Top-factory list at camps']];
  table(s, [['Stage', 'Incentive', 'Nudge'], ...inc.map((r) => [{ t: r[0], b: true, c: C.plum }, { t: r[1], a: 'left' }, { t: r[2], a: 'left' }])],
    { x: b.x, y: b.y, w: b.w, colW: [0.72, 1.55, b.w - 2.27], rowH: [0.24, ...inc.map(() => (b.h - 0.26) / inc.length)], fs: 7.5, hfs: 7.5, margin: 0.025 });

  b = panel(s, [0, 0.62, 0.25, 0.38], 'Seller Health Score: 0–100, daily');
  const hsW = [['30%', 'Price gap held'], ['25%', 'Order pace vs cohort'], ['20%', 'Quality returns'], ['15%', 'On-time dispatch'], ['10%', 'In-stock']];
  const hrh = (b.h - 0.34) / hsW.length;
  hsW.forEach(([w, t], k) => {
    chip(s, b.x, b.y + k * hrh + 0.02, 0.42, hrh - 0.04, w, k === 0 ? C.coral : C.plum, { size: 8 });
    T(s, t, { x: b.x + 0.48, y: b.y + k * hrh, w: b.w - 0.48, h: hrh, fontSize: 8, valign: 'middle' });
  });
  T(s, [run('≥ 80 for 30 days → graduate · ', { bold: true, color: C.green }), run('< 40 after a fix → a person', { bold: true, color: C.red })], { x: b.x, y: b.y + b.h - 0.32, w: b.w, h: 0.32, fontSize: 7.5, valign: 'middle' });

  b = panel(s, [0.25, 0.62, 0.24, 0.38], 'Rulebook: 9 automatic actions, 1 human', { hc: C.coral });
  const rb = [['Orders < 60% at D7/D14', 'Grant'], ['Gap < 8% for 7 days', 'Price nudge'], ['Gap < 4% for 3 days', 'Badge off'], ['Returns > 1.5× norm', 'QC hold'], ['On-time < 90% (7 days)', 'Node offer'], ['In-stock < 70%', 'Restock nudge'], ['Score ≥ 80 × 30 days', 'Prepayment'], ['Score < 40 after a fix', 'A person']];
  table(s, [['Signal', 'Action'], ...rb.map(([t, a], k) => [t, { t: a, b: true, c: k === 7 ? C.red : C.plum }])], { x: b.x, y: b.y, w: b.w, colW: [b.w * 0.62, b.w * 0.38], rowH: [0.2, ...rb.map(() => (b.h - 0.22) / rb.length)], fs: 7.5, hfs: 7.5, margin: 0.02 });

  b = panel(s, [0.49, 0.62, 0.20, 0.38], 'Grants scale; people don’t');
  bigNum(s, b.x, b.y, 0.56, `${PROTO.hs.auto}:${PROTO.hs.manual}`, { size: 10.5 });
  T(s, `automated vs human actions in the ${PROTO.hs.cohort}-seller simulated pilot`, { x: b.x + 0.6, y: b.y, w: b.w - 0.6, h: 0.56, fontSize: 7.5, valign: 'middle' });
  T(s, [run(`~${IN(r10(PROTO.hs.perManager))} sellers per category manager; `, { bold: true, color: C.coral }), run(`1,400 sellers need ~2 reviewers, not ~70 account managers. Grant cost: ${rs(grantCost)} per seller at most, `, {}), run(`${Math.round(10 * r10(M.c2m.ordersPerDay) * 30 / grantCost)}× cheaper than ₹10 an order for 30 days.`, { bold: true, color: C.plum })],
    { x: b.x, y: b.y + 0.6, w: b.w, h: b.h - 0.6, fontSize: 7.5, valign: 'top' });

  b = panel(s, [0.69, 0.62, 0.31, 0.38], 'Channels: WhatsApp, voice agent, supplier app (prototype)', { hc: C.coral });
  const phones = [['shot_phone_price.png', 'Price check'], ['shot_phone_brief.png', 'Demand Brief'], ['shot_phone_whatsapp.png', 'WhatsApp nudge']];
  const phH = b.h - 0.18, phW = phH * 780 / 1570, gp = (b.w - 3 * phW) / 2;
  phones.forEach(([f, l], k) => {
    const x = b.x + k * (phW + gp);
    s.addImage({ path: AS(f), x, y: b.y, w: phW, h: phH });
    T(s, l, { x: x - 0.1, y: b.y + phH, w: phW + 0.2, h: 0.18, fontSize: 7, bold: true, align: 'center', color: C.plum });
  });
}

// ================================================================== 8 · CLUSTER CRITERIA
{
  const ahp = M.ahp, td = M.td, ga = M.gateApproach;
  const s = page(7, {
    headline: `Tiruppur and Panipat top the cluster AHP (CR ${ahp.CR.toFixed(3)}); factories qualify only with 60% of SKUs 8% below market`,
    rail: 'CLUSTER CRITERIA',
    band: 'Decision: pilot in Tiruppur and Panipat; run the price gate on demand-weighted medians in weeks 1–3 at ₹0 capex. Owner: Category + Pricing · KPI: badge lift ≥ 12% vs holdout by Day 30.',
    foot: 'Sources: S2, S8, S9, S10 team teardown (meesho.com, 2 Oct 2026; 56 listings per query; reviews as demand weights), S11, S20, S22 (cluster scores)   |   AHP workings: Appendix C   |   Verdicts: prototype, synthetic sellers',
  });
  let b = panel(s, [0, 0, 0.44, 0.30], 'Selection criteria and reasoning');
  const crit = [['Cost ownership', 'Own raw material, production, scale, automation → a real price edge', 'Round 1 cost-lever index'], ['Demand on Meesho', 'The category already sells at volume on Meesho', 'Teardown [S10]; category mix [S20]'], ['Returns band', 'Low returns protect the cost edge', 'Return math; seller guides [S11]'],
    ['Node feasibility', 'A partner warehouse and a Valmo lane nearby', 'Valmo network [S2]'], ['Institutional partner', 'An association that recruits 40–60 units a drive', 'Tiruppur, Panipat bodies [S8, S9]']];
  table(s, [['Criterion', 'Reasoning', 'Data source'], ...crit.map((r) => [{ t: r[0], b: true, c: C.plum }, { t: r[1], a: 'left' }, { t: r[2], a: 'left', fs: 7 }])], { x: b.x, y: b.y, w: b.w, colW: [1.2, 2.55, b.w - 3.75], rowH: [0.2, ...crit.map(() => (b.h - 0.22) / 5)], fs: 7.5, hfs: 7.5, margin: 0.025 });

  b = panel(s, [0, 0.30, 0.44, 0.36], `AHP pairwise matrix (CR ${ahp.CR.toFixed(3)} < 0.10: consistent)`, { hc: C.coral });
  const ab = ['C1', 'C2', 'C3', 'C4', 'C5'];
  const frc = (v) => (v >= 1 ? String(Math.round(v)) : `1/${Math.round(1 / v)}`);
  const rank = ahp.w.map((w0) => ahp.w.filter((x) => x > w0).length + 1);
  table(s, [['Criteria', '', ...ab, 'Geo. mean', 'Weight', 'Rank'], ...ahp.M.map((r, i) => [{ t: ahp.crit[i], b: true, c: C.plum }, { t: ab[i], b: true }, ...r.map(frc), ahp.gm[i].toFixed(2), { t: ahp.w[i].toFixed(3), b: true, c: C.coral }, { t: String(rank[i]), b: true }])],
    { x: b.x, y: b.y, w: b.w, colW: [1.35, 0.32, ...Array(5).fill(0.36), 0.62, 0.55, b.w - 4.64], rowH: [0.22, ...Array(5).fill((b.h - 0.24) / 5)], fs: 7.5, hfs: 7.5 });

  b = panel(s, [0, 0.66, 0.44, 0.34], 'Cluster scoring → choice');
  const cl = ahp.clusters;
  table(s, [['Criteria', 'Weight', ...cl.map((x) => x.name)], ...ahp.crit.map((c, i) => [{ t: c, b: true, c: C.plum }, ahp.w[i].toFixed(3), ...cl.map((x) => String(x.s[i]))]),
    [{ t: 'Score · rank', b: true }, '', ...cl.map((x, i) => ({ t: `${x.score.toFixed(2)} · #${i + 1}`, b: true, c: i < 2 ? C.white : C.plum, f: i < 2 ? C.coral : undefined }))]],
  { x: b.x, y: b.y, w: b.w, colW: [1.3, 0.55, ...Array(5).fill((b.w - 1.85) / 5)], rowH: [0.2, ...Array(6).fill((b.h - 0.22 - 0.2) / 6)], fs: 7.5, hfs: 7.5, margin: 0.02 });
  T(s, `Robust: Surat overtakes Panipat only if the demand weight rises from ${ahp.w[1].toFixed(2)} to ${ahp.flipDemand.toFixed(2)}; equal weights keep the order.`, { x: b.x, y: b.y + b.h - 0.2, w: b.w, h: 0.2, fontSize: 7, italic: true, color: C.muted, valign: 'middle' });

  b = panel(s, [0.44, 0, 0.56, 0.52], `Live teardown: what buyers really pay (${M.tdAll} listings, index 100 = demand-weighted median)`);
  const names = { 'men cotton briefs pack of 3': 'Men’s briefs, 3-pack', 'cotton ankle socks pack of 5': 'Ankle socks, 5-pack', 'cotton double bedsheet with 2 pillow covers': 'Bedsheet + 2 covers', 'cotton bath towel': 'Bath towel', 'stainless steel glass set of 6': 'Steel glasses, set of 6' };
  const order = td.slice().sort((p, q) => q.overstate - p.overstate);
  const ax0 = b.x + 1.62, axW = b.w - 1.62 - 0.95, lo = 60, hi = 230, X = (v) => ax0 + (v - lo) / (hi - lo) * axW;
  const rowT = (b.h - 0.5) / order.length;
  [80, 100, 140, 180, 220].forEach((v) => {
    s.addShape(SH.LINE, { x: X(v), y: b.y + 0.18, w: 0, h: rowT * order.length, line: { color: v === 100 ? C.plum : 'DCCFD7', width: v === 100 ? 1 : 0.5, dashType: v === 100 ? 'solid' : 'dash' } });
    T(s, String(v), { x: X(v) - 0.2, y: b.y + 0.18 + rowT * order.length, w: 0.4, h: 0.14, fontSize: 7, color: C.muted, align: 'center' });
  });
  T(s, 'Listing median above what buyers pay', { x: b.x + b.w - 0.92, y: b.y - 0.02, w: 0.92, h: 0.22, fontSize: 6.5, bold: true, color: C.muted, align: 'center' });
  order.forEach((t, k) => {
    const y = b.y + 0.18 + k * rowT, cyy = y + rowT / 2;
    T(s, [run(names[t.q], { bold: true, color: C.plum, breakLine: true }), run(`n = ${t.n} · buyers pay ${rs(t.dw)}`, { color: C.muted, fontSize: 7 })], { x: b.x, y, w: 1.6, h: rowT, fontSize: 8, valign: 'middle' });
    const p25 = t.p25 / t.dw * 100, p75 = t.p75 / t.dw * 100, med = t.median / t.dw * 100;
    box(s, X(p25), cyy - 0.07, X(Math.min(p75, hi)) - X(p25), 0.14, 'E7D7E1', { round: true, r: 0.03 });
    s.addShape(SH.LINE, { x: X(92), y: cyy - 0.13, w: 0, h: 0.26, line: { color: C.coral, width: 2 } });
    s.addShape(SH.OVAL, { x: X(100) - 0.06, y: cyy - 0.06, w: 0.12, h: 0.12, fill: { color: C.plum }, line: { color: C.white, width: 0.75 } });
    s.addShape(SH.DIAMOND, { x: X(Math.min(med, hi)) - 0.07, y: cyy - 0.07, w: 0.14, h: 0.14, fill: { color: C.saffron }, line: { color: C.plum, width: 0.5 } });
    T(s, rs(t.median), { x: X(Math.min(med, hi)) + 0.08, y: cyy - 0.2, w: 0.45, h: 0.14, fontSize: 7, bold: true, color: C.plum });
    T(s, `+${pc(t.overstate)}`, { x: b.x + b.w - 0.9, y, w: 0.88, h: rowT, fontSize: 12, bold: true, color: t.overstate > 0.2 ? C.coral : C.muted, align: 'center', valign: 'middle', fontFace: F.head });
  });
  T(s, [run('● ', { color: C.plum }), run('demand-weighted median   ', {}), run('◆ ', { color: C.saffron }), run('listing median   ', {}), run('| ', { color: C.coral, bold: true }), run('8% gate   ', {}), run('▬ ', { color: 'C9B3C1' }), run('middle 50% of listings', {})],
    { x: b.x, y: b.y + b.h - 0.16, w: b.w, h: 0.16, fontSize: 7, color: C.muted });

  b = panel(s, [0.44, 0.52, 0.56, 0.48], 'Price gate: assumptions → calculation → result (men’s briefs, 3-pack)', { hc: C.coral });
  const aw = b.w * 0.3;
  box(s, b.x, b.y, aw, b.h, C.white, { line: C.saffron, round: true, r: 0.04 });
  T(s, [run('Assumptions', { bold: true, color: C.coral, breakLine: true }), run(`Listing median ${rs(ga.listMedian, 1)} [S10]`, { breakLine: true }), run(`Demand-weighted median ${rs(ga.dwMedian)} [S10]`, { breakLine: true }), run('Gate: SKU ≥ 8% below median', { breakLine: true }), run('Badge: ≥ 60% of live SKUs clear', { breakLine: true }), run('Sellers above ₹5 cr GMV', { breakLine: true }), run('Seller with > 30% of a set’s orders scored without its own orders', { breakLine: true }), run('SKU needs ≥ 10 delivered orders to count', { breakLine: true }), run('Re-scored weekly; badge off below a 4% gap', {})],
    { x: b.x + 0.06, y: b.y + 0.04, w: aw - 0.12, h: b.h - 0.08, fontSize: 7.5, paraSpaceAfter: 2, valign: 'top' });
  const apw = (b.w - aw - 0.16) / 2;
  [['Approach 1: listing median', ga.listMedian, ga.listGate, ga.listClear, 'Too loose: the badge would sit on 4 in 10 listings, including resellers.', C.red], ['Approach 2: demand-weighted median', ga.dwMedian, ga.dwGate, ga.dwClear, 'Only real cost edges clear: the badge means something.', C.green]].forEach(([h, med, gte, clear, verdict, col], k) => {
    const x = b.x + aw + 0.08 + k * (apw + 0.08);
    box(s, x, b.y, apw, b.h * 0.44, C.white, { line: col, round: true, r: 0.04 });
    T(s, [run(h, { bold: true, color: col, breakLine: true }), run(`gate = ${rs(med, med % 1 ? 1 : 0)} × 0.92 = ${rs(gte, 1)}`, { breakLine: true }), run(`${clear} of ${ga.n} listings clear (${pc(clear / ga.n)})`, { bold: true, color: C.plum, breakLine: true }), run(verdict, { italic: true })],
      { x: x + 0.06, y: b.y + 0.03, w: apw - 0.12, h: b.h * 0.44 - 0.06, fontSize: 7.5, valign: 'top', paraSpaceAfter: 1 });
  });
  const vy = b.y + b.h * 0.44 + 0.06, vx = b.x + aw + 0.08, vw = b.w - aw - 0.08;
  T(s, [run('Result: ', { bold: true, color: C.coral }), run(`factory floor ${rs(U.cols[3].floor)} → ${pc(U.cols[3].gap, 1)} below ✓ · reseller ${rs(U.cols[0].floor)} → ${U.cols[0].gap < 0 ? '−' : ''}${pc(Math.abs(U.cols[0].gap), 1)} ✕`, {})], { x: vx, y: vy, w: vw, h: 0.18, fontSize: 7.5, valign: 'middle' });
  table(s, [[`Prototype verdict (${PROTO.counts.screened} sellers > ₹5 cr)`, 'Sellers', 'Action'],
    [{ t: 'C2M-ready', b: true, c: C.green }, String(PROTO.counts.ready), { t: 'Badge + re-rank + Demand Brief', a: 'left' }], [{ t: 'Scale without price', b: true, c: C.red }, String(PROTO.counts.noprice), { t: 'No badge; value-tier SKUs', a: 'left' }],
    [{ t: 'Loss-leader pattern', b: true, c: C.red }, String(PROTO.counts.lossleader), { t: 'No badge: catalogue gate holds', a: 'left' }], [{ t: 'Near miss', b: true, c: C.amber }, String(PROTO.counts.nearmiss), { t: 'Node offer; re-score in 28 days', a: 'left' }]],
  { x: vx, y: vy + 0.2, w: vw, colW: [1.75, 0.55, vw - 2.3], rowH: [0.18, ...Array(4).fill((b.y + b.h - vy - 0.4) / 4)], fs: 7.5, hfs: 7.5, margin: 0.02 });
}

// ================================================================== 9 · UNIT ECONOMICS
{
  const cols = U.cols, sp = U.split;
  const s = page(8, {
    headline: `A prepaid 3-pack costs ${rs(cols[3].cost)} vs a reseller’s ${rs(cols[0].cost, 1)}; of the ${rs(sp.pool)} freed, buyers get ${rs(sp.buyer, 1)} and the factory ${rs(sp.factory, 1)}`,
    rail: 'UNIT ECONOMICS',
    band: `Decision: price pre-orders at the gate less ₹${A.A32.value} (${rs(U.preorderPrice)}), funded by the factory’s ₹${IN(U.batchSaving, 0)} batch saving. Owner: Pricing + Category · KPI: factory margin ≥ ${rs(Math.floor(sp.factory))} a pack.`,
    foot: 'Sources: S10 (₹209 demand-weighted median), S11 (₹150 return fee, ₹0 RTO fee), S12, S13   |   Assumptions: A10, A11, A20, A22–A32 (making cost ₹80 to confirm in interviews)   |   Workings: Appendix C',
  });
  let b = panel(s, [0, 0, 0.60, 0.72], 'Unit economics per 3-pack kept, one change per column (Tiruppur men’s briefs)');
  const per100 = (x) => { const rto = 100 * x.rto, del = 100 - rto, ret = del * A.A25.value.ret; return [rto, del, ret, del - ret]; };
  const vol = cols.map(per100);
  table(s, [
    ['', ...cols.map((x) => x.head)],
    [{ t: 'Scenario', i: true, c: C.muted }, ...cols.map((x) => ({ t: `${x.label}: ${x.sub}`, i: true, fs: 7, c: x.label === 'Proposed' ? C.coral : C.muted, b: x.label === 'Proposed' }))],
    ['Per 100 shipped: failed deliveries', ...vol.map((v) => v[0].toFixed(1))], ['Delivered', ...vol.map((v) => v[1].toFixed(1))], ['Returned by buyers (8%)', ...vol.map((v) => v[2].toFixed(1))], [{ t: 'Kept (paid for)', b: true }, ...vol.map((v) => ({ t: v[3].toFixed(1), b: true }))],
    ['Goods, net of resold returns (₹)', ...cols.map((x) => x.goods.toFixed(1))], ['Unsold stock written down', ...cols.map((x) => x.unsold.toFixed(1))], ['Logistics: forward + pack / node fee', ...cols.map((x) => x.logistics.toFixed(1))],
    ['Customer-return fees (₹150 each)', ...cols.map((x) => x.returns.toFixed(1))], ['Working capital (18% a year)', ...cols.map((x) => x.capital.toFixed(1))],
    [{ t: 'Cost per pack kept', b: true }, ...cols.map((x) => ({ t: x.cost.toFixed(1), b: true, c: C.plum }))],
    [{ t: 'Lowest viable price (9% margin)', b: true }, ...cols.map((x) => ({ t: rs(x.floor), b: true, fs: 10, c: C.plum }))],
    [{ t: `Gap vs ${rs(U.mkt)} demand-weighted median`, b: true }, ...cols.map((x) => ({ t: `${x.gap >= 0 ? '' : '−'}${pc(Math.abs(x.gap), 1)}`, b: true, c: x.gap >= 0.08 ? C.green : C.red }))],
    [{ t: `Clears the 8% gate (≤ ${rs(U.gate)})?`, b: true }, ...cols.map((x) => ({ t: x.passes ? '✓ yes' : '✕ no', b: true, c: C.white, f: x.passes ? C.green : C.red }))],
  ], { x: b.x, y: b.y, w: b.w, colW: [2.45, ...Array(4).fill((b.w - 2.45) / 4)], rowH: [0.28, 0.3, 0.19, 0.19, 0.19, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.22, 0.26, 0.21, 0.21], fs: 8, hfs: 8, margin: 0.025 });
  T(s, [run('Highest making cost that clears the gate: ', { bold: true, color: C.coral }), run(`${rs(U.ceilings.direct, 1)} → ${rs(U.ceilings.node, 1)} → ${rs(U.ceilings.batch, 1)} (+${pc(U.ceilings.batch / U.ceilings.direct - 1)}): the levers widen the pool of factories that qualify.`, {})],
    { x: b.x, y: b.y + b.h - 0.24, w: b.w, h: 0.24, fontSize: 7.5, valign: 'middle' });

  b = panel(s, [0.60, 0, 0.40, 0.42], `One prepaid batch of ${IN(BX.confirmed)} packs at ${rs(BX.price)}, stage by stage`, { hc: C.coral });
  const st = [
    ['1 · Pre-order window', `${IN(BX.confirmed)} confirmed; make ${IN(BX.make)} (+15%)`, `${rs(BX.value)} order value`],
    ['2 · Handover at node', `${pc(A.A20.value.advance)} advanced by the NBFC`, `+${rs(BX.advance)}`],
    ['3 · Delivery', `${IN(BX.failed, 0)} failed (${pc(U.rtoPrepaid, 1)}) · ${IN(BX.returns, 0)} returned`, `${IN(BX.kept, 0)} kept`],
    ['4 · Revenue on kept orders', `${IN(BX.kept, 0)} × ${rs(BX.price, 1)}`, rs(BX.revenue)],
    ['5 · Fees', `forward ${rs(BX.fees.forward)} · node ${rs(BX.fees.node)} · returns ${rs(BX.fees.returns)}`, `−${rs(BX.feeTotal)}`],
    ['6 · Payout, 7 days after delivery', 'net of fees; repays the advance', rs(BX.payout)],
    [{ t: '7 · Balance to the factory', b: true }, 'payout − advance', { t: `+${rs(BX.balance)}`, b: true, c: C.green }],
  ];
  table(s, [['Stage', 'What happens', '₹'], ...st.map((r) => [typeof r[0] === 'string' ? { t: r[0], b: true, c: C.plum } : r[0], { t: r[1], a: 'left' }, typeof r[2] === 'string' ? { t: r[2], b: true } : r[2]])],
    { x: b.x, y: b.y, w: b.w, colW: [1.42, 2.35, b.w - 3.77], rowH: [0.2, ...st.map(() => (b.h - 0.22) / st.length)], fs: 7.5, hfs: 7.5, margin: 0.025 });

  b = panel(s, [0.60, 0.42, 0.40, 0.30], `Where the ${rs(sp.pool)} per pack goes (pre-order vs a reseller at ${rs(U.mkt)})`);
  T(s, `${rs(sp.pool)} = ${rs(sp.costSaving, 1)} lower cost (no wholesaler, node, batches) + ${rs(sp.resellerMargin, 1)} reseller margin`, { x: b.x, y: b.y, w: b.w, h: 0.2, fontSize: 7.5, bold: true, color: C.plum });
  const bw0 = b.w, bf = sp.buyer / sp.pool;
  box(s, b.x, b.y + 0.26, bw0 * bf, 0.36, C.coral);
  box(s, b.x + bw0 * bf, b.y + 0.26, bw0 * (1 - bf), 0.36, C.plum);
  T(s, `Buyer ${rs(sp.buyer, 1)} · ${pc(bf)}`, { x: b.x, y: b.y + 0.26, w: bw0 * bf, h: 0.36, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle' });
  T(s, `Factory ${rs(sp.factory, 1)} · ${pc(1 - bf)}`, { x: b.x + bw0 * bf, y: b.y + 0.26, w: bw0 * (1 - bf), h: 0.36, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle' });
  list(s, [['Buyer:', `pays ${rs(U.preorderPrice)} instead of ${rs(U.mkt)}.`], ['Factory:', `earns ${rs(sp.factory, 1)} a pack vs ${rs(U.b2bMarginPerPack, 1)} selling ex-factory (${(sp.factory / U.b2bMarginPerPack).toFixed(1)}×).`], ['Meesho:', `earns per order, not per rupee: ${rs(A.A8.value * SP.contribPerOrder + M.c2m.rtoSavingPerOrder, 1)} per C2M order (page 11).`]],
    b.x, b.y + 0.68, b.w, b.h - 0.68, { fs: 7.5, glyph: '›', gc: C.coral, psa: 1 });

  b = panel(s, [0, 0.72, 1, 0.28], 'Assumptions (every input carries an [A#] in Appendix B)', { hc: C.coral });
  const asm = [
    ['FaIndustry', 'Factory', [`Making cost ₹${A.A22.value} a pack [A22]`, `Margin ${pc(A.A23.value)} on price [A23]`, `Capital ${pc(A.A30.value.rate)} a year [A30]`]],
    ['FaMagnifyingGlassChart', 'Market', [`Demand-weighted median ${rs(U.mkt)} [S10]`, `Gate −8% = ${rs(U.gate)}`, `Pre-order ₹${A.A32.value} off [A32]`]],
    ['FaTruckFast', 'Logistics', [`Forward ₹${A.A28.value.selfFwd} self / ₹${A.A28.value.nodeFwd} node`, `Packing ₹${A.A28.value.selfPack} · node fee ₹${A.A28.value.nodeFee} [A28]`, `Wholesaler +${pc(A.A24.value)} [A24]`]],
    ['FaRotateLeft', 'Returns', [`Failed ${pc(A.A25.value.rto)} (${pc(U.rtoPrepaid, 1)} prepaid)`, `Returned ${pc(A.A25.value.ret)} of delivered [A25]`, `₹${A.A26.value} return fee · ₹${A.A27.value} RTO fee`]],
    ['FaWarehouse', 'Stock', [`Unsold ${pc(A.A31.value.stock)} vs ${pc(A.A31.value.batch)} [A31]`, `Salvage ${pc(A.A31.value.salvage)} · recovery ${pc(A.A29.value.self)}/${pc(A.A29.value.node)}`, `${A.A30.value.stockDays} vs ${A.A30.value.batchDays} inventory days [A30]`]],
  ];
  const aw2 = (b.w - 0.24) / 5;
  asm.forEach(([ic, h, items], k) => {
    const x = b.x + k * (aw2 + 0.06);
    box(s, x, b.y, aw2, b.h, C.white, { line: C.line, round: true, r: 0.04 });
    avatar(s, ic, x + 0.05, b.y + 0.05, 0.34, k % 2 ? C.coral : C.plum);
    T(s, h, { x: x + 0.44, y: b.y + 0.05, w: aw2 - 0.48, h: 0.34, fontSize: 9, bold: true, color: C.plum, valign: 'middle' });
    T(s, items.map((t, i) => run(t, { breakLine: i < items.length - 1 })), { x: x + 0.07, y: b.y + 0.42, w: aw2 - 0.12, h: b.h - 0.44, fontSize: 7.5, valign: 'top', paraSpaceAfter: 1 });
  });
}

// ================================================================== 10 · FINANCIAL ANALYSIS
{
  const f = FN, yrs = [0, 1, 2, 3, 4], L = f.lines;
  const s = page(9, {
    headline: `${cr(f.npv, 0)} NPV at 12% and payback in Year ${f.payback}; NPV stays positive down to ${pc(M.be.yieldScale)} of planned seller yield`,
    rail: 'FINANCIAL ANALYSIS',
    band: `Decision: approve ${cr(f.cashY1)} of Year-1 cash as a capped H2 bet, released at the Day-30 and Day-90 gates. Owner: Finance · KPI: Year-1 C2M NMV ≥ ${cr(f.nmv[0], 0)}.`,
    foot: 'Sources: S1 (₹531 cr contribution on 725 mn placed orders; prepaid 37%; NMV ₹11,614 cr on GMV ₹19,054 cr), S3, S11, S13   |   NPV: t = 1..5, year-end, no terminal value; year NMV uses average active sellers, the ladder shows exit run-rates   |   Register: Appendix B',
  });
  let b = panel(s, [0, 0, 0.53, 0.66], 'Five-year case (₹ cr, nominal; NPV = sum of the PV row)');
  const d1 = (x) => x.toFixed(1);
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
    ['People [A13, A14]', ...L.people.map(d1)], ['Cluster onboarding [A15]', ...L.onboarding.map(d1)], ['Demand Brief [A16]', ...L.briefs.map(d1)], ['Factory Nodes [A17]', ...L.nodes.map(d1)],
    ['Returns pool, grants, first-loss [A18–A20]', ...yrs.map((i) => d1(L.returnsPool[i] + L.grants[i] + L.firstLoss[i] + L.preorderTopUp[i]))],
    [{ t: 'Programme cost', b: true, c: C.red }, ...f.cost.map((x) => ({ t: d1(x), b: true, c: C.red }))],
    [{ t: 'Net cash flow', b: true }, ...f.net.map((x) => ({ t: nm(x), b: true, c: x < 0 ? C.red : C.plum }))],
    [{ t: 'Discount factor at 12%', i: true }, ...yrs.map((i) => ({ t: (1 / 1.12 ** (i + 1)).toFixed(3), i: true }))],
    [{ t: 'PV at 12%', b: true }, ...pvShown.map((x) => ({ t: nm(x), b: true, c: x < 0 ? C.red : C.plum }))],
  ];
  table(s, rows, { x: b.x, y: b.y, w: b.w * 0.75, colW: [2.0, ...yrs.map(() => (b.w * 0.75 - 2.0) / 5)], rowH: [0.2, ...rows.slice(1).map(() => 0.2)], fs: 7.5, hfs: 7.5, margin: 0.025 });
  const nx = b.x + b.w * 0.75 + 0.08, nw = b.w * 0.25 - 0.08;
  box(s, nx, b.y, nw, b.h, C.plum, { round: true, r: 0.05 });
  const kv = [['NPV at 12%', cr(f.npv), C.saffron, 17], ['NPV at 15%', cr(f.npvStress), C.white, 12], ['IRR', pc(f.irr), C.white, 12], ['Payback', `Year ${f.payback}`, C.white, 12], ['Discounted payback', `Year ${f.dpayback}`, C.white, 11], ['Year-1 cash (+ people)', `${cr(f.cashY1)} (+${cr(L.people[0])})`, C.white, 9]];
  kv.forEach(([k, v, col, fs], i) => {
    const y = b.y + 0.05 + i * ((b.h - 0.1) / kv.length);
    T(s, k, { x: nx + 0.07, y, w: nw - 0.14, h: 0.16, fontSize: 7.5, color: 'E9D5E3' });
    T(s, v, { x: nx + 0.07, y: y + 0.15, w: nw - 0.14, h: (b.h - 0.1) / kv.length - 0.18, fontSize: fs, bold: true, color: col, valign: 'middle', fontFace: F.head });
  });

  b = panel(s, [0.53, 0, 0.47, 0.32], 'Opportunity: what each phase is worth (exit run-rates)', { hc: C.coral });
  const Ld = M.ladder;
  table(s, [['', ...Ld.map((x) => x.stage)],
    ['Clusters · nodes · active sellers', ...Ld.map((x) => `${x.clusters} · ${x.nodes} · ${IN(x.sellers)}`)],
    [{ t: `Run-rate NMV (× ${rs(M.yieldCr, 3)} cr per seller)`, b: true }, ...Ld.map((x) => ({ t: cr(x.nmv), b: true, c: C.plum }))],
    ['Share of FY26 NMV', ...Ld.map((x) => pc(x.shareFy26, 1))],
    ['C2M orders a day (share of Meesho’s)', ...Ld.map((x) => `${IN(r10(x.ordersPerDay / 100) * 100)} (${pc(x.shareOfOrders, 1)})`)],
    [{ t: 'Buyer savings a year (8–12% gap)', b: true }, ...Ld.map((x) => ({ t: `${cr(x.save[0])}–${cr(x.save[1])}`, b: true, c: C.coral }))],
    ['Meesho value a year', ...Ld.map((x) => cr(x.meesho))],
  ], { x: b.x, y: b.y, w: b.w, colW: [2.15, ...Array(3).fill((b.w - 2.15) / 3)], rowH: [0.2, ...Array(6).fill((b.h - 0.22) / 6)], fs: 7.5, hfs: 7.5, margin: 0.025 });

  b = panel(s, [0.53, 0.32, 0.235, 0.34], 'Benefit vs programme cost (₹ cr, nominal)');
  s.addChart(pres.charts.LINE, [
    { name: 'Benefit', labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'], values: f.benefit.map((x) => +x.toFixed(1)) },
    { name: 'Cost', labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'], values: f.cost.map((x) => +x.toFixed(1)) },
  ], { x: b.x - 0.04, y: b.y - 0.04, w: b.w + 0.08, h: b.h + 0.06, chartColors: [C.green, C.red], lineSize: 2, lineDataSymbol: 'circle', lineDataSymbolSize: 5, showValue: true, dataLabelFontSize: 6.5, dataLabelPosition: 't',
    catAxisLabelFontSize: 7, valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: true, legendPos: 't', legendFontSize: 7 });

  b = panel(s, [0.765, 0.32, 0.235, 0.34], `Sensitivity: NPV at −20% / +20%`, { hc: C.coral });
  const tor = M.tornado, mx = Math.max(...tor.map((t) => Math.max(Math.abs(t.lo - f.npv), Math.abs(t.hi - f.npv))));
  const short = (l) => l.replace(' (₹1.425 cr NMV / seller)', '').replace(' (40% × ₹7.3)', '').replace(' (15 pts × ₹60)', '').replace(' (50%)', '');
  const tx0 = b.x + 1.05, tw = b.w - 1.1, mid = tx0 + tw / 2, rh = (b.h - 0.22) / tor.length;
  s.addShape(SH.LINE, { x: mid, y: b.y, w: 0, h: rh * tor.length, line: { color: C.plum, width: 1 } });
  tor.forEach((t, k) => {
    const y = b.y + k * rh;
    T(s, short(t.label), { x: b.x, y, w: 1.03, h: rh, fontSize: 7, valign: 'middle', bold: k === 0, color: k === 0 ? C.coral : C.text });
    const lo2 = Math.min(t.lo, t.hi), hi2 = Math.max(t.lo, t.hi);
    const xl = mid - (f.npv - lo2) / mx * (tw / 2 - 0.22), xr = mid + (hi2 - f.npv) / mx * (tw / 2 - 0.22);
    box(s, xl, y + rh * 0.22, mid - xl, rh * 0.56, C.red);
    box(s, mid, y + rh * 0.22, xr - mid, rh * 0.56, C.green);
    T(s, IN(lo2, 0), { x: xl - 0.24, y, w: 0.23, h: rh, fontSize: 6.5, bold: true, align: 'right', valign: 'middle' });
    T(s, IN(hi2, 0), { x: xr + 0.02, y, w: 0.23, h: rh, fontSize: 6.5, bold: true, valign: 'middle' });
  });
  T(s, `Base ${cr(f.npv, 0)}; left = worse`, { x: b.x, y: b.y + b.h - 0.2, w: b.w, h: 0.2, fontSize: 7, italic: true, color: C.muted, align: 'center' });

  b = panel(s, [0, 0.66, 0.53, 0.34], 'Break-even and scenarios', { hc: C.coral });
  T(s, [run(`NPV = 0 at ${pc(M.be.yieldScale)} of planned seller yield (${pc(M.be.benefitShare)} of planned benefit). `, { bold: true, color: C.coral }), run(`Positive even with zero incremental orders (${cr(M.be.zeroIncr, 0)}) or no failed-delivery saving (${cr(M.be.noRto, 0)}): each lever alone almost repays the programme.`, {})],
    { x: b.x, y: b.y, w: b.w, h: 0.42, fontSize: 8, valign: 'middle' });
  const sc = [['Bear', M.scen.bear, C.red], ['Base', M.scen.base, C.plum], ['Bull', M.scen.bull, C.green]];
  const scw = (b.w - 0.16) / 3;
  sc.forEach(([n, v, col], k) => {
    const x = b.x + k * (scw + 0.08);
    box(s, x, b.y + 0.46, scw, b.h - 0.46, C.white, { line: col, round: true, r: 0.04 });
    T(s, [run(`${n}  `, { bold: true, color: col }), run(cr(v.npv, 0), { bold: true, color: col, fontSize: 13 })], { x: x + 0.05, y: b.y + 0.48, w: scw - 0.1, h: 0.3, fontSize: 9, valign: 'middle', align: 'center' });
    T(s, v.note, { x: x + 0.05, y: b.y + 0.78, w: scw - 0.1, h: b.h - 0.8, fontSize: 7.5, color: C.muted, align: 'center', valign: 'top' });
  });

  b = panel(s, [0.53, 0.66, 0.47, 0.34], 'What changed since Round 1, and how money is released');
  T(s, [run('Round 1: ₹156 cr NPV counted contribution on every C2M order. ', { bold: true, color: C.plum }), run(`Round 2 counts only the ${pc(A.A8.value)} that are incremental, plus fewer failed deliveries (${cr(f.npv, 0)}); if every order were incremental: ${cr(M.allIncremental, 0)}. Value per C2M order = ${pc(A.A8.value)} × ${rs(SP.contribPerOrder, 1)} + ${rs(M.c2m.rtoSavingPerOrder, 1)} = ${rs(A.A8.value * SP.contribPerOrder + M.c2m.rtoSavingPerOrder, 1)}.`, {})],
    { x: b.x, y: b.y, w: b.w, h: 0.56, fontSize: 7.5, valign: 'top' });
  const mr = [['Day 0–30', '₹0: badge test on existing order data'], ['Day 31–90', `${cr(M.gates.d90)}: 2 clusters, Brief build, 1 node, pool seed`], ['Q2–Q4', `${cr(M.gates.rest)}: 3 clusters, 5 nodes, Brief run`]];
  mr.forEach(([p, t], k) => {
    const y = b.y + 0.6 + k * ((b.h - 0.6) / 3);
    chip(s, b.x, y + 0.02, 0.8, (b.h - 0.6) / 3 - 0.05, p, [C.green, C.amber, C.coral][k], { size: 7.5 });
    T(s, t, { x: b.x + 0.87, y, w: b.w - 0.87, h: (b.h - 0.6) / 3, fontSize: 7.5, valign: 'middle' });
  });
}

// ================================================================== 12 · 90-DAY PLAN & RISKS
{
  const s = page(10, {
    headline: `Prove the gap by Day 30, sign partners by Day 60, ship prepaid batches by Day 90, on ${cr(M.gates.d90)}`,
    rail: '90-DAY PLAN',
    band: `Ask: approve the ₹0 Day-30 test now and ${cr(M.gates.d90)} for Days 31–90, released only if the Day-30 gate passes; Year 1 is capped at ${cr(FN.cashY1)}.`,
    foot: 'Sources: S1 (H2 bets: hard budget cap, graduation on adoption and retention), S19 (Press Note 2; E-Commerce Amendment Rules 2026 in force 1 Jan 2027), S26   |   Day 1 = Mon 2 Nov 2026 · Day 30 = 1 Dec · Day 60 = 31 Dec · Day 90 = 30 Jan 2027   |   Compliance: Appendix C',
  });
  let b = panel(s, [0, 0, 0.67, 0.64], 'Week-by-week plan for the first 90 days (bars = active weeks · ◆ = milestone · coral lines = gates), then scale');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const D1 = Date.UTC(2026, 10, 2);
  const wkLabel = (w) => { const d = new Date(D1 + (w - 1) * 7 * 86400000); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`; };
  const LW = 2.2, SC = 0.8, wkW = (b.w - LW - 2 * SC) / 13, gx = b.x + LW, HH = 0.3;
  const groups = [
    ['Price screen', 'Pricing + DS', C.coral, [
      ['Medians + scores; badge live', [[1, 1]], [1], 'Wave 2 categories', 'Default check'],
      ['4-week badge test vs holdout', [[1, 4]], [], '', ''],
      ['Weekly re-score; badge-off rule', [[5, 13]], [], '', ''],
    ]],
    ['Supply', 'Category', C.plum, [
      ['Sign Tiruppur + Panipat bodies', [[3, 6]], [6], '5 clusters', '12 clusters'],
      ['Camps; catalogue 60 factories', [[5, 9]], [9], '450 factories', '1,400 factories'],
    ]],
    ['Demand', 'DS + Product', C.plum2, [
      ['Demand Brief build, 5 categories', [[3, 8]], [8], 'All 9 categories', 'Weekly refresh'],
      ['Pre-order window in buyer app', [[7, 10]], [10], '', ''],
      ['First prepaid batches', [[10, 13]], [11], 'In every brief', ''],
    ]],
    ['Operations', 'Valmo', C.saffron, [
      ['Warehouse quotes, Tiruppur', [[2, 4]], [], '', ''],
      ['Node set-up after Day-30 gate', [[5, 9]], [], '6 nodes', '12 nodes'],
      ['Node live; returns end at node', [[10, 13]], [10], '', ''],
    ]],
    ['Enablers', 'Finance · Growth · Legal', C.green, [
      ['Finance: NBFC → 30% advances', [[4, 9], [10, 13]], [9], 'Returns pool', 'H1 budget'],
      ['Growth: Health Score → grants', [[2, 4], [6, 13]], [6], '', '2 reviewers'],
      ['Legal: PN2, GST → badge declared', [[2, 8]], [8], '', ''],
    ]],
  ];
  const nRows = groups.reduce((t, g) => t + g[3].length, 0);
  const gateH = 0.6, rh = (b.h - HH - gateH - 0.24) / nRows;
  T(s, 'Workstream · activity', { x: b.x, y: b.y, w: LW, h: HH, fontSize: 7.5, bold: true, color: C.plum, valign: 'middle' });
  for (let w = 1; w <= 13; w++) {
    const x = gx + (w - 1) * wkW;
    box(s, x + 0.01, b.y, wkW - 0.02, HH, w <= 4 ? 'F3DCE6' : w <= 9 ? 'FDECC8' : 'DDEFE4', { round: true, r: 0.03 });
    T(s, [run(`W${w}`, { bold: true, color: C.plum, breakLine: true }), run(wkLabel(w), { color: C.muted, fontSize: 6.5 })], { x, y: b.y, w: wkW, h: HH, fontSize: 7, align: 'center', valign: 'middle' });
  }
  [['Q2–Q4', 0], ['Years 2–4', 1]].forEach(([t, k]) => chip(s, gx + 13 * wkW + k * SC + 0.02, b.y, SC - 0.04, HH, t, C.plum, { size: 7.5 }));
  let r = 0;
  groups.forEach(([gname, owner, col, acts]) => {
    const y0 = b.y + HH + r * rh;
    box(s, b.x, y0 + 0.01, 0.66, acts.length * rh - 0.02, col, { round: true, r: 0.03 });
    T(s, [run(gname, { bold: true, breakLine: true }), run(owner, { fontSize: 6.5 })], { x: b.x + 0.02, y: y0, w: 0.62, h: acts.length * rh, fontSize: 7, color: col === C.saffron ? C.plum : C.white, align: 'center', valign: 'middle' });
    acts.forEach(([label, bars, ms, q, yy]) => {
      const y = b.y + HH + r * rh;
      if (r % 2 === 0) box(s, b.x + 0.7, y, b.w - 0.7, rh, 'F8EEF4');
      T(s, label, { x: b.x + 0.72, y, w: LW - 0.74, h: rh, fontSize: 7, valign: 'middle' });
      bars.forEach(([a, z]) => box(s, gx + (a - 1) * wkW + 0.02, y + rh * 0.2, (z - a + 1) * wkW - 0.04, rh * 0.6, col, { round: true, r: 0.03 }));
      ms.forEach((w) => s.addShape(SH.DIAMOND, { x: gx + (w - 0.5) * wkW - 0.06, y: y + rh / 2 - 0.06, w: 0.12, h: 0.12, fill: { color: C.white }, line: { color: C.plum, width: 1 } }));
      [q, yy].forEach((t, k) => { if (t) T(s, t, { x: gx + 13 * wkW + k * SC + 0.03, y, w: SC - 0.05, h: rh, fontSize: 6.5, color: C.plum, align: 'center', valign: 'middle' }); });
      r += 1;
    });
  });
  const gTop = b.y + HH, gBot = b.y + HH + nRows * rh;
  [[30, 'Day 30'], [60, 'Day 60'], [90, 'Day 90']].forEach(([d, l]) => {
    const x = gx + (d - 1) / 7 * wkW;
    s.addShape(SH.LINE, { x, y: gTop, w: 0, h: gBot - gTop + 0.03, line: { color: C.coral, width: 1.75 } });
    chip(s, x - 0.27, gBot + 0.03, 0.54, 0.15, l, C.coral, { size: 7 });
  });
  const gates = [
    ['Day 30 gate', 'Fund if badge lift ≥ 12% (interval > 0) and ≥ 70% still clear at D14; else tighten to a 10% gap, or stop', C.coral],
    ['Day 60 gate', '2 associations signed · 60 factories catalogued · briefs live in 5 categories · NBFC signed', C.amber],
    ['Day 90 gate', '3 of 4: batches shipped in SLA · returns end at the node · retention ≥ 70% · category NMV ≥ base', C.green],
    ['Money released', `₹0 to Day 30 → ${cr(M.gates.d90)} for Days 31–90 → ${cr(M.gates.rest)} in Q2–Q4 (Year 1 cap ${cr(FN.cashY1)})`, C.plum],
  ];
  const gw = (b.w - 0.18) / 4, gy = b.y + b.h - gateH;
  gates.forEach(([h, t, col], k) => {
    const x = b.x + k * (gw + 0.06);
    box(s, x, gy, gw, gateH, C.white, { line: col, round: true, r: 0.04, lw: 1.25 });
    T(s, [run(`${h}  `, { bold: true, color: col === C.amber ? C.plum : col, breakLine: true }), run(t, {})], { x: x + 0.05, y: gy + 0.02, w: gw - 0.1, h: gateH - 0.04, fontSize: 7, valign: 'middle' });
  });

  // KPI targets grouped by funnel stage
  b = panel(s, [0, 0.64, 0.67, 0.36], 'Metrics & KPIs: onboarding → activation → retention, with guardrails (north star: C2M NMV still clearing the gate)', { hc: C.coral });
  const L = M.ladder;
  const kp = [
    ['Scale', 'Active C2M sellers', 'Shortlist', '60 catalogued', `${IN(L[0].sellers)} live`, IN(L[1].sellers), 'Category · weekly'],
    ['Onboarding', 'Qualified → listed within 30 days', '—', '≥ 50%', '≥ 50%', '≥ 50%', 'Category · weekly'],
    ['Onboarding', 'Days to first prepaid batch', '—', '—', '≤ 14', '≤ 14', 'Category · weekly'],
    ['Activation', 'Orders at D7 / D14 vs cohort median', '—', '—', '≥ 60%', '≥ 60%', 'DS · daily'],
    ['Activation', 'Prepaid share of C2M orders', '—', '—', `≥ ${pc(SP.prepaid)}`, `≥ ${pc(prepaidC2M, 1)}`, 'Finance · weekly'],
    ['Retention', 'Sellers still clearing the 8% gate', '≥ 70%', '≥ 70%', '≥ 70%', '≥ 75%', 'Pricing · weekly'],
    ['Retention', 'Factories active at Day 90', '—', '—', '≥ 70%', '≥ 75%', 'Category · monthly'],
    ['Guardrail', 'Badge share of category impressions; category NMV', '≤ 20%; ≥ base', '≤ 20%; ≥ base', '≤ 20%; ≥ base', '≤ 20%; ≥ base', 'Growth · weekly'],
    ['North star', 'Run-rate C2M NMV clearing the gate', '—', '—', cr(L[0].nmv), cr(L[1].nmv), 'Finance · monthly'],
  ];
  const stc = { Scale: C.plum, Onboarding: C.plum2, Activation: C.coral, Retention: C.green, Guardrail: C.amber, 'North star': C.plum };
  table(s, [['Stage', 'KPI', 'Day 30', 'Day 60', 'Day 90', 'Year-1 exit', 'Owner · cadence'], ...kp.map((r2) => [{ t: r2[0], b: true, c: C.white, f: stc[r2[0]] }, { t: r2[1], a: 'left' }, r2[2], r2[3], r2[4], { t: r2[5], b: true, c: C.plum }, { t: r2[6], fs: 7 }])],
    { x: b.x, y: b.y, w: b.w, colW: [0.78, 2.55, 0.85, 0.95, 0.85, 0.85, b.w - 6.83], rowH: [0.18, ...kp.map(() => (b.h - 0.2) / kp.length)], fs: 7.5, hfs: 7.5, margin: 0.02 });

  b = panel(s, [0.67, 0, 0.33, 0.58], 'Top risks, sorted by likelihood × impact', { hc: C.coral });
  const rk = [['The gap was a promotion', 'H', 'H', 'Day-30 stop rule; badge off below 4%', 'Pricing'], ['Export recovery pulls factories back', 'H', 'M', 'Batches fill idle capacity between export runs', 'Category'],
    ['Quality falls with price', 'M', 'H', 'Suspend at > 1.5× return norm; QC hold', 'Category'], ['Sellers game the badge with a few cheap SKUs', 'M', 'M', '≥ 60% of live SKUs must clear; dominant-seller rule', 'Pricing'],
    ['Node or advances read as inventory control', 'L', 'H', 'Seller keeps title; NBFC lends; 3PL fees at arm’s length', 'Legal'], ['Re-rank starves resellers', 'L', 'M', '≤ 20% of category impressions; category NMV guardrail', 'Growth']];
  table(s, [['Risk', 'L', 'I', 'Guardrail', 'Owner'], ...rk.map((r2) => [{ t: r2[0], b: true, c: C.plum }, { t: r2[1], b: true, c: r2[1] === 'H' ? C.red : r2[1] === 'M' ? C.amber : C.green }, { t: r2[2], b: true, c: r2[2] === 'H' ? C.red : C.amber }, { t: r2[3], a: 'left' }, { t: r2[4], fs: 7 }])],
    { x: b.x, y: b.y, w: b.w, colW: [1.25, 0.24, 0.24, b.w - 2.33, 0.6], rowH: [0.2, ...rk.map(() => (b.h - 0.22) / rk.length)], fs: 7.5, hfs: 7.5, margin: 0.025 });

  b = panel(s, [0.67, 0.58, 0.33, 0.42], 'The ask');
  T(s, [
    run('Budget  ', { bold: true, color: C.coral }), run(`₹0 to Day 30; ${cr(M.gates.d90)} for Days 31–90; ${cr(FN.cashY1)} cash in Year 1 (+${cr(FN.lines.people[0])} people), capped as an H2 bet`, { breakLine: true }),
    run('Decisions  ', { bold: true, color: C.coral }), run('(1) run the badge test with a holdout from Week 1; (2) name owners in Pricing, Category, Valmo, Finance, Legal; (3) sign the associations, a Tiruppur node and an NBFC by Day 60; (4) declare the price-gap badge as a ranking parameter before 1 Jan 2027', { breakLine: true }),
    run('Go / no-go  ', { bold: true, color: C.coral }), run('badged NMV per live SKU ≥ 12% above holdout, ≥ 70% still clearing at D14', {}),
  ], { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 8, valign: 'top', paraSpaceAfter: 4 });
}

// ================================================================== 12 · APPENDIX A: PRODUCT WALKTHROUGH
{
  const s = page(-1, {
    label: 'Appendix A · Product walkthrough',
    headline: 'The working prototype runs every rule in this deck end to end, on synthetic data that mirrors Meesho’s order tables',
    rail: 'APPENDIX A',
    foot: `Prototype: React + Recharts static site; ${PROTO.sellers} synthetic sellers, ${IN(PROTO.skus)} SKUs, 9 categories; fixed seed; fictional names; four model tests run before every deploy   |   Supports pages 4, 5, 8, 9, 12`,
  });
  const b = R([0, 0, 1, 1]);
  const fit = (f, pw, ph, x, y, w, h) => { const r = Math.min(w / pw, h / ph); s.addImage({ path: AS(f), x: x + (w - pw * r) / 2, y: y + (h - ph * r) / 2, w: pw * r, h: ph * r }); };
  const cells = [
    [[['shot_pti_scatter.png', 1566, 1092]], '1 · Price Truth Index', `Size vs price gap for every seller above ₹5 cr: r = ${nm(PROTO.r, 2)}; ${PROTO.top10NotReady} of the 10 largest fail`, 'p9'],
    [[['shot_day30.png', 2544, 1454]], '2 · Day-30 readout', `Badged vs holdout: +${pc(PROTO.exp.base.lift, 1)} (interval +${pc(PROTO.exp.base.ci[0], 1)} to +${pc(PROTO.exp.base.ci[1], 1)}) → fund`, 'p12'],
    [[['shot_pti_gate.png', 2544, 444], ['shot_health_stages.png', 2544, 498]], '3 · Gate controls + Seller Health stages', `Gate sliders re-score every seller; ${PROTO.hs.cohort} pilot sellers by stage`, 'p8, p9'],
    [[['shot_health_detail.png', 1506, 1176]], '4 · One seller’s Health Score', 'Five signals, the rule that fired, the next action', 'p8'],
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
    ['shot_phone_price.png', '5 · Manufacturer app: price check', 'Lowest viable price vs market median, before listing', 'p5, p10'],
    ['shot_phone_brief.png', '6 · Demand Brief + batch', 'District demand → batch size → one-tap commit', 'p4, p8'],
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
    foot: 'Master model: deck/source/model.mjs → outputs.json (every slide number is read from it) · prototype results: proto.mjs · teardown data: deck/source/data · survey kit: research/13   |   Supports pages 2–12',
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
    run('Sizing: ', { bold: true, color: C.plum }), run('NMV = sellers × ₹1.425 cr; savings = NMV × g ÷ (1 − g) → p3, p11', { breakLine: true }),
    run('Unit cost: ', { bold: true, color: C.plum }), run('(make + unsold − resold + logistics + returns + capital) ÷ kept → p10', { breakLine: true }),
    run('Benefit: ', { bold: true, color: C.plum }), run('orders × (incremental × ₹7.3 + Δfailed × ₹60) → p11', { breakLine: true }),
    run('Δfailed: ', { bold: true, color: C.plum }), run('pre-order share × (1 − 37%) × 15 pts = 4.7 pts → p11', { breakLine: true }),
    run('AHP: ', { bold: true, color: C.plum }), run('geometric means, CR = (λ − 5) ÷ 4 ÷ 1.12 → p9, Appendix C', { breakLine: true }),
    run('RICE: ', { bold: true, color: C.plum }), run('reach × impact × confidence ÷ effort → p7', {}),
  ], { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 7.5, valign: 'top', paraSpaceAfter: 2 });
}

// ================================================================== 14 · APPENDIX C: BENCHMARKS, COMPLIANCE, MODEL DETAIL
{
  const s = page(-1, {
    label: 'Appendix C · Benchmarks, compliance, model detail',
    headline: 'Detailed benchmarking, compliance by design and the model workings behind pages 3, 9 and 10',
    rail: 'APPENDIX C',
    foot: 'Sources: S15–S19, S22–S25   |   Compliance rows are design responses, not legal advice: Meesho legal confirms each before the pilot   |   Supports pages 3, 6, 7, 9, 10, 12',
  });
  let b = panel(s, [0, 0, 0.58, 0.52], 'Detailed benchmarking: KPI × company (dated, sourced) and how Meesho uses it');
  table(s, [['', 'Pinduoduo NBI', 'Taobao C2M', 'Temu semi-managed', 'Shein', 'Shein Brazil'],
    ['Year of data', 'End-2019', '2020; Dec 2021', 'Q3 2024', 'Mar 2024', 'Apr 2023 – Feb 2026'],
    ['Factories / merchants', '900+ in C2M production', '1,000 “super factories” targeted', '+80,000 planned for 2025', 'Network (not disclosed)', '336 signed of 2,000; 1 producing'],
    ['Demand data to factories', '✓ anonymised', '✓ consumer insight', '– platform prices', '✓ real-time', '✕'],
    ['Who holds stock', 'Factory', 'Factory', 'Merchant, local warehouse', 'Shein', 'Factory'],
    ['Batching', 'Custom runs', 'C2M runs', '—', '100–200 item first runs', 'Large runs, fast'],
    ['Price lever', 'Demand scale', 'Finance + insight', 'Platform-set', 'Small batches', '~30% price-cut asks'],
    ['How Meesho uses it', 'Demand Brief', 'NBFC prepayment', 'Seller-owned node', 'Pre-order batches', 'Never ask for cuts'],
  ], { x: b.x, y: b.y, w: b.w, colW: [1.45, ...Array(5).fill((b.w - 1.45) / 5)], rowH: 0.3, fs: 8 });

  b = panel(s, [0.58, 0, 0.42, 0.52], 'Compliance by design', { hc: C.coral });
  table(s, [['Rule', 'Requires', 'Our design'],
    ['Press Note 2 (2018)', 'Marketplace may not own or control seller inventory', 'Seller keeps title at the node; Valmo sells warehousing at arm’s length'],
    ['Press Note 2 (2018)', 'Fair, non-discriminatory services; no exclusivity', 'Badge and grants are published rules any seller can meet'],
    ['E-Commerce Rules, 2026 amendment (from 1 Jan 2027)', 'Ranking parameters by importance; sponsored labelled', 'Publish the price-gap badge as a ranking parameter; grants are organic, never sold'],
    ['Dark-pattern guidelines (2023)', 'No false urgency or hidden terms', '“Ships in 7–8 days, ₹10 off” shown before payment'],
    ['DPDP Act (2023)', 'Protect personal data', 'Demand Briefs use district aggregates only'],
    ['GST', 'Stock at a third-party site', 'Node registered as the seller’s additional place of business'],
  ], { x: b.x, y: b.y, w: b.w, colW: [1.35, 1.55, b.w - 2.9], rowH: [0.2, ...Array(6).fill((b.h - 0.22) / 6)], fs: 7.5 });

  b = panel(s, [0, 0.52, 0.34, 0.48], 'Cohort scoring behind the personas (page 3)');
  table(s, [['Cohort', ...M.cohortCrit.map(([n, w]) => `${n.replace('Barriers Meesho can fix', 'Fixable').replace('Speed to first order', 'Speed')} ${pc(w)}`), 'Score'],
    ...M.cohorts.map((x, i) => [{ t: `${x.k} · ${{ A: 'Offline B2B', C: 'Churned', B: 'Online elsewhere' }[x.k]}`, b: true, c: C.plum }, ...x.s.map(String), { t: x.score.toFixed(2), b: true, c: i === 0 ? C.white : C.plum, f: i === 0 ? C.coral : undefined }])],
  { x: b.x, y: b.y, w: b.w, colW: [1.25, 0.5, 0.45, 0.5, 0.45, 0.45, b.w - 3.6], rowH: [0.36, 0.24, 0.24, 0.24], fs: 8, hfs: 7.5 });
  T(s, [run('Rubric (5 =): ', { bold: true, color: C.plum }), run('price edge: sells ex-factory B2B · pool: > 50% of SAM · fixable: all HIGH barriers fixable · speed: KYC + catalogue on Meesho · new supply: new to Meesho. ', {}), run(`Equal weights give the same order (${M.cohorts.map((x) => x.equal.toFixed(1)).join(' / ')}).`, { italic: true })],
    { x: b.x, y: b.y + 1.16, w: b.w, h: b.h - 1.16, fontSize: 7.5, valign: 'top' });

  b = panel(s, [0.34, 0.52, 0.33, 0.48], `AHP workings (CR ${M.ahp.CR.toFixed(3)})`);
  T(s, [run('Method: ', { bold: true, color: C.plum }), run('reciprocal 1–9 matrix → geometric mean of each row → weight = mean ÷ sum of means. ', { breakLine: true }),
    run('Consistency: ', { bold: true, color: C.plum }), run(`λmax = ${M.ahp.lam.toFixed(3)}; CI = (λmax − 5) ÷ 4 = ${((M.ahp.lam - 5) / 4).toFixed(3)}; CR = CI ÷ 1.12 = ${M.ahp.CR.toFixed(3)} < 0.10.`, { breakLine: true }),
    run('Check: ', { bold: true, color: C.plum }), run(`weights ${M.ahp.w.map((x) => x.toFixed(3)).join(' / ')} reproduce Round 1’s cluster scores (Tiruppur 4.68, Panipat 4.52).`, { breakLine: true }),
    run('Robustness: ', { bold: true, color: C.plum }), run(`Surat overtakes Panipat only above a ${M.ahp.flipDemand.toFixed(2)} demand weight.`, {})],
  { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 7.5, valign: 'top', paraSpaceAfter: 3 });

  b = panel(s, [0.67, 0.52, 0.33, 0.48], 'Unit-economics workings (per 100 shipped)', { hc: C.coral });
  const c3 = U.cols[3];
  T(s, [
    run('Kept units ', { bold: true, color: C.plum }), run(`= 100 × (1 − RTO) × (1 − returns) = ${(100 * (1 - A.A25.value.rto) * (1 - A.A25.value.ret)).toFixed(1)} (prepaid: ${(100 * (1 - U.rtoPrepaid) * (1 - A.A25.value.ret)).toFixed(1)})`, { breakLine: true }),
    run('Unsold ', { bold: true, color: C.plum }), run('= extra units made × cost × (1 − 50% salvage); 10% build-to-stock vs 2% batch', { breakLine: true }),
    run('Logistics ', { bold: true, color: C.plum }), run('= delivered × forward fee + shipped × packing (₹10) or node fee (₹20)', { breakLine: true }),
    run('Capital ', { bold: true, color: C.plum }), run('= make cost × 18% × days ÷ 365 (45 vs 10 days)', { breakLine: true }),
    run('Floor ', { bold: true, color: C.plum }), run(`= cost per kept ÷ (1 − 9%) → proposed ${rs(c3.cost, 1)} ÷ 0.91 = ${rs(c3.floor, 1)}`, { breakLine: true }),
    run('Reconciliation checks ', { bold: true, color: C.coral }), run(`NPV ${cr(FN.npv)} = Σ PV row (page 11) ✓ · Year-4 NMV ${cr(FN.nmv[3], 0)} (average 1,300 sellers) vs ${cr(Y4.nmv)} exit run-rate (1,400) ✓ · batch payout ${rs(BX.payout)} = revenue − fees ✓ · RICE order = dependency order ✓`, {}),
  ], { x: b.x, y: b.y, w: b.w, h: b.h, fontSize: 7.5, valign: 'top', paraSpaceAfter: 2 });
}

fs.mkdirSync(path.dirname(OUTFILE), { recursive: true });
await pres.writeFile({ fileName: OUTFILE });
console.log('Wrote', OUTFILE, pres.slides.length, 'slides');
