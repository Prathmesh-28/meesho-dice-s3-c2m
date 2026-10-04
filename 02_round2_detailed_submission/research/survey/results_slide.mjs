// Turns the real responses to the short manufacturer survey into one results slide in the deck's style:
// who answered, what blocks them, which ideas they value, the warehouse fee they accept, cash / margin / batch size,
// and how likely they are to start. Every chart is a native PowerPoint chart, so it stays editable.
//
// usage: node results_slide.mjs responses.csv [out.pptx] [--date "4 Oct 2026"]
//   responses.csv  Google Forms → Responses → ⋮ → Download responses (.csv), unzipped
//   out.pptx       default: ../../deck/rough_work/survey_results/survey_results.pptx
//
// The slide states n and the dates, and shows counts ("x of y"), not percentages, while fewer than 30 answered.
// It reads the question titles from manufacturer_survey_short.gs, so edit questions there and in the form together.
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { createRequire } from 'module';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const SOURCE = path.resolve(HERE, '../../deck/source');
const pptxgen = createRequire(path.join(SOURCE, 'package.json'))('pptxgenjs');
const AS = (f) => path.join(SOURCE, 'assets', f);

const args = process.argv.slice(2);
const dateAt = args.indexOf('--date');
const DATE = dateAt >= 0 ? args.splice(dateAt, 2)[1] : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const [CSV, OUT = path.resolve(HERE, '../../deck/rough_work/survey_results/survey_results.pptx')] = args;
if (!CSV) { console.error('usage: node results_slide.mjs responses.csv [out.pptx] [--date "4 Oct 2026"]'); process.exit(1); }

// ------------------------------------------------------------------ the questions, as the form has them
const ctx = {};
vm.runInNewContext(`${fs.readFileSync(path.join(HERE, 'manufacturer_survey_short.gs'), 'utf8')}\nglobalThis.Q = SHORT_SURVEY.questions;`, ctx);
const Q = Object.fromEntries(ctx.Q.map((q) => [q.n, q]));

// ------------------------------------------------------------------ read the CSV
function parseCsv(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}
const [head, ...rows] = parseCsv(fs.readFileSync(CSV, 'utf8').replace(/^﻿/, ''));
const col = (title) => {
  const i = head.findIndex((h) => h.trim() === title);
  if (i < 0) throw new Error(`The CSV has no column "${title}". Were the form's question titles edited?`);
  return i;
};
const N = rows.length;
if (!N) throw new Error('The CSV has no responses.');
const answers = (n) => rows.map((r) => (r[col(Q[n].title)] ?? '').trim()).filter(Boolean);

// Counts per option, in the form's order; anything else is "Other".
function tally(n, values, options = Q[n].choices) {
  const counts = Object.fromEntries(options.map((o) => [o, 0]));
  let other = 0;
  values.forEach((v) => { if (v in counts) counts[v] += 1; else other += 1; });
  return { labels: [...options, ...(other ? ['Other'] : [])], values: [...options.map((o) => counts[o]), ...(other ? [other] : [])] };
}
// Checkbox answers arrive joined with ", " (none of the options contains a comma).
const picks = (n) => answers(n).flatMap((v) => {
  const parts = v.split(', ');
  const known = parts.filter((p) => Q[n].choices.includes(p));
  return known.length === parts.length ? known : [...known, 'Other'];
});
const grid = (n) => Q[n].rows.map((rowLabel) => {
  const i = col(`${Q[n].title} [${rowLabel}]`);
  const vals = rows.map((r) => (r[i] ?? '').trim()).filter(Boolean);
  return { row: rowLabel, base: vals.length, ...Object.fromEntries(Q[n].columns.map((c) => [c, vals.filter((v) => v === c).length])) };
});

// ------------------------------------------------------------------ results
const R = {
  segment: tally(5, answers(5)), category: tally(1, answers(1)), turnover: tally(3, answers(3)), capacity: tally(4, answers(4)),
  barriers: tally(6, picks(6)), terms: tally(7, answers(7)), margin: tally(8, answers(8)), batch: tally(9, answers(9)),
  ideas: grid(10), fees: grid(11), intent: [1, 2, 3, 4, 5].map((k) => answers(12).filter((v) => Number(v) === k).length),
};
const SEG_SHORT = ['Never sold online', 'On Meesho now', 'Stopped on Meesho', 'Other marketplaces', 'Other'];
const BARRIER_SHORT = { "We don't know how to start": 'not knowing how to start', 'Returns and damaged goods coming back': 'returns', 'Orders that could not be delivered and came back': 'failed deliveries',
  'Packing and shipping every order ourselves': 'packing and shipping each order', 'Keeping stock ready before orders come': 'keeping stock ready', 'Too few orders in the first months': 'too few early orders',
  'Fees and commission': 'fees and commission', 'Online prices are too low for us': 'low online prices', 'Payment comes too late': 'late payment', 'It would upset our distributors': 'upsetting distributors', Other: 'other reasons' };
const IDEA_SHORT = ['Free price check', 'Weekly demand report', 'Prepaid, confirmed orders', 'Warehouse near you', '30% at handover', 'WhatsApp ordering'];
const IDEA_HEAD = ['a free price check', 'a weekly demand report', 'making only prepaid, confirmed orders', 'a warehouse near them', '30% paid at handover', 'WhatsApp ordering'];
const of = (x, base = N) => (base >= 30 ? `${Math.round((100 * x) / base)}%` : `${x} of ${base}`);
const top = (t) => t.labels.map((l, i) => [l, t.values[i]]).filter(([l]) => l !== 'Other').sort((a, b) => b[1] - a[1])[0];
const [topBarrier, topBarrierN] = top(R.barriers);
const ideaRank = R.ideas.map((r, i) => [i, r['Very useful']]).sort((a, b) => b[1] - a[1]);
const topIdea = ideaRank[0];
const likely = R.intent[3] + R.intent[4];
const respondents = answers(6).length;

// ------------------------------------------------------------------ slide (deck style)
const C = { plum: '5A0A46', plum2: '7B2A66', saffron: 'F7A21B', coral: 'E8434F', fill: 'FBF3F8', line: 'D8C2D0', text: '1F1F1F', muted: '6B6B6B', white: 'FFFFFF', green: '2E9E5B', amber: 'E39B2B', red: 'D64545', grey: 'BFB3BA' };
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Team 23B0747, IIT Bombay';
pres.title = 'Manufacturer survey: results';
const s = pres.addSlide();
s.background = { color: C.white };
const T = (text, o) => s.addText(text, { fontFace: 'Calibri', fontSize: 8, color: C.text, margin: 0, valign: 'top', ...o });
const box = (x, y, w, h, fill, o = {}) => s.addShape(o.round ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: o.line ?? fill, width: 0.75 }, rectRadius: o.round ? 0.05 : undefined });
box(0, 0, 13.333, 0.56, C.plum);
s.addImage({ path: AS('dice_logo.png'), x: 0.2, y: 0.06, w: 0.9, h: 0.448 });
box(4.4, 0.08, 4.5, 0.4, C.coral, { round: true });
T('Primary research · Manufacturer survey', { x: 4.4, y: 0.08, w: 4.5, h: 0.4, fontSize: 14, bold: true, color: C.white, align: 'center', valign: 'middle' });
s.addImage({ path: AS('meesho_icon.png'), x: 11.93, y: 0.09, w: 0.38, h: 0.38 });
s.addImage({ path: AS('iitb_logo_white.png'), x: 12.48, y: 0.06, w: 0.45, h: 0.44 });
const headline = `${N} factories answered: the top blocker is ${BARRIER_SHORT[topBarrier]} (${of(topBarrierN, respondents)}), and ${of(topIdea[1], R.ideas[topIdea[0]].base)} call ${IDEA_HEAD[topIdea[0]]} very useful`;
T(headline, { x: 0.25, y: 0.58, w: 12.83, h: 0.55, fontFace: 'Arial', fontSize: 16, bold: true, color: C.plum, valign: 'middle' });
box(0.25, 1.15, 0.27, 5.55, C.plum);
T('SURVEY RESULTS', { x: 0.25, y: 1.15, w: 0.27, h: 5.55, fontFace: 'Arial', fontSize: 10.5, bold: true, color: C.white, align: 'center', valign: 'middle', vert: 'vert270' });

function panel(x, y, w, h, title, hc = C.plum) {
  box(x, y, w, 0.25, hc, { round: true });
  T(title, { x: x + 0.07, y, w: w - 0.14, h: 0.25, fontSize: 9.5, bold: true, color: C.white, valign: 'middle' });
  box(x, y + 0.27, w, h - 0.27, C.fill, { line: C.line });
  return { x: x + 0.05, y: y + 0.3, w: w - 0.1, h: h - 0.33 };
}
const base = { catAxisLabelFontFace: 'Calibri', dataLabelFontFace: 'Calibri', legendFontFace: 'Calibri', valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, valAxisHidden: true,
  catAxisLabelFontSize: 7, catAxisLabelColor: C.text, dataLabelFontSize: 7, showValue: true, dataLabelFormatCode: '0;;;' };
const X0 = 0.6, W = 12.48, Y0 = 1.15, G = 0.1, H1 = 2.7, H2 = 5.55 - H1 - G, w1 = W * 0.26, w2 = W * 0.4 - 2 * G, w3 = W - w1 - w2 - 2 * G;

// 1 · who answered
let b = panel(X0, Y0, w1, H1, `Who answered (n = ${N})`);
s.addChart(pres.charts.DOUGHNUT, [{ name: 'Group', labels: R.segment.labels.map((l, i) => SEG_SHORT[Q[5].choices.indexOf(l)] ?? SEG_SHORT[4]), values: R.segment.values }],
  { x: b.x, y: b.y, w: b.w, h: b.h - 0.62, holeSize: 55, chartColors: [C.plum, C.green, C.coral, C.saffron, C.grey], showLegend: true, legendPos: 'r', legendFontSize: 7, legendFontFace: 'Calibri',
    showValue: true, showPercent: false, dataLabelColor: C.white, dataLabelFontSize: 8, dataLabelFormatCode: '0;;;' });
const topCat = top(R.category), topTurn = top(R.turnover), idle = R.capacity.values[2] + R.capacity.values[3];
T([{ text: 'Mostly: ', options: { bold: true, color: C.plum } }, { text: `${topCat[0].toLowerCase()} (${of(topCat[1])}); turnover ${topTurn[0].toLowerCase()} (${of(topTurn[1])}). `, options: {} },
  { text: `${of(idle)} have more than 20% of capacity idle.`, options: { bold: true, color: C.coral } }], { x: b.x, y: b.y + b.h - 0.6, w: b.w, h: 0.6, fontSize: 7.5, valign: 'middle' });

// 2 · barriers
b = panel(X0 + w1 + G, Y0, w2, H1, `What makes selling online hard (up to 3 picks; base ${respondents})`, C.coral);
const bar = R.barriers.labels.map((l, i) => [BARRIER_SHORT[l] ?? l, R.barriers.values[i]]).sort((a, c) => c[1] - a[1]);
s.addChart(pres.charts.BAR, [{ name: 'Factories', labels: bar.map(([l]) => l[0].toUpperCase() + l.slice(1)), values: bar.map(([, v]) => v) }],
  { ...base, x: b.x, y: b.y, w: b.w, h: b.h, barDir: 'bar', catAxisOrientation: 'maxMin', chartColors: [C.coral], dataLabelPosition: 'outEnd', barGapWidthPct: 45, showLegend: false });

// 3 · ideas
b = panel(X0 + w1 + w2 + 2 * G, Y0, w3, H1, 'How useful each idea would be (factories)');
const ideaOrder = ideaRank.map(([i]) => i);
s.addChart(pres.charts.BAR, Q[10].columns.map((c) => ({ name: c, labels: ideaOrder.map((i) => IDEA_SHORT[i]), values: ideaOrder.map((i) => R.ideas[i][c]) })),
  { ...base, x: b.x, y: b.y, w: b.w, h: b.h, barDir: 'bar', barGrouping: 'percentStacked', catAxisOrientation: 'maxMin', chartColors: [C.grey, C.saffron, C.green],
    dataLabelPosition: 'ctr', dataLabelColor: C.white, showLegend: true, legendPos: 't', legendFontSize: 7, barGapWidthPct: 40 });

// 4 · warehouse fee
const Y1 = Y0 + H1 + G;
b = panel(X0, Y1, w1, H2, 'Would use the warehouse, by fee per piece', C.coral);
s.addChart(pres.charts.BAR, Q[11].columns.map((c) => ({ name: c, labels: R.fees.map((f) => f.row.replace(' a piece', '')), values: R.fees.map((f) => f[c]) })),
  { ...base, x: b.x, y: b.y, w: b.w, h: b.h - 0.3, barDir: 'col', barGrouping: 'stacked', chartColors: [C.green, C.amber, C.red], dataLabelPosition: 'ctr', dataLabelColor: C.white,
    showLegend: true, legendPos: 't', legendFontSize: 7, barGapWidthPct: 50, catAxisLabelFontSize: 8 });
const at20 = R.fees[1];
T(`At ₹20 (the deck's node fee): ${of(at20.Yes, at20.base)} yes, ${of(at20.Maybe, at20.base)} maybe.`, { x: b.x, y: b.y + b.h - 0.28, w: b.w, h: 0.28, fontSize: 7.5, bold: true, color: C.plum, valign: 'middle' });

// 5 · cash, margin, batch
b = panel(X0 + w1 + G, Y1, w2, H2, 'Cash, margin and batch size today (factories)');
const mini = [['B2B buyers pay after', R.terms, ['On delivery', '< 30 days', '30-45', '45-60', '> 60']], ['B2B profit on price', R.margin, ['< 5%', '5-8%', '8-12%', '12-20%', '> 20%', 'Not said']],
  ['Smallest profitable batch', R.batch, ['< 200', '200-500', '500-1k', '> 1,000']]];
const mw = (b.w - 0.1) / 3;
mini.forEach(([title, t, short], k) => {
  const x = b.x + k * (mw + 0.05);
  T(title, { x, y: b.y, w: mw, h: 0.2, fontSize: 8, bold: true, color: C.plum, align: 'center' });
  s.addChart(pres.charts.BAR, [{ name: title, labels: t.labels.map((l, i) => short[i] ?? l), values: t.values }],
    { ...base, x, y: b.y + 0.2, w: mw, h: b.h - 0.2, barDir: 'col', chartColors: [[C.plum2, C.coral, C.saffron][k]], dataLabelPosition: 'outEnd', showLegend: false, barGapWidthPct: 40, catAxisLabelFontSize: 6.5 });
});

// 6 · intent
b = panel(X0 + w1 + w2 + 2 * G, Y1, w3, H2, 'Likely to start or grow online within 30 days', C.coral);
s.addChart(pres.charts.BAR, [{ name: 'Factories', labels: ['1 Not at all', '2', '3', '4', '5 Very likely'], values: R.intent }],
  { ...base, x: b.x, y: b.y, w: b.w * 0.6, h: b.h, barDir: 'col', chartColors: [C.plum], dataLabelPosition: 'outEnd', showLegend: false, barGapWidthPct: 40 });
const answered12 = R.intent.reduce((t, v) => t + v, 0);
T([{ text: of(likely, answered12), options: { fontSize: 18, bold: true, color: C.coral, breakLine: true } }, { text: 'answered 4 or 5', options: { breakLine: true } },
  { text: 'Stated intent overstates action, so the model counts half of it.', options: { color: C.muted, italic: true } }],
  { x: b.x + b.w * 0.62, y: b.y, w: b.w * 0.38, h: b.h, fontSize: 7.5, valign: 'middle' });

T(`Source: team survey of ${N} manufacturers (Google Form, ${DATE}); every chart counts factories, base n shown. The sample is the factories we reached, not the market. Ideas were described as tests, not offers.`,
  { x: 0.25, y: 7.22, w: 12.2, h: 0.22, fontSize: 7.5, color: C.muted, valign: 'middle' });

fs.mkdirSync(path.dirname(OUT), { recursive: true });
await pres.writeFile({ fileName: OUT });
console.log(`Wrote ${OUT} (n = ${N})`);
console.log(headline);
