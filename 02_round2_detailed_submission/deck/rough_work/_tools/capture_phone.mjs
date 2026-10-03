// Captures every screen of the manufacturer app (prototype › Manufacturer tab) as a phone image,
// plus where the key elements sit on each image, so the deck can put numbered markers on them.
//
// usage: node capture_phone.mjs [url] [outdir]
//   url     default https://meesho-dice-c2m-iitb.vercel.app (pass file://…/dist-single/index.html to run offline)
//   outdir  default ../../source/assets/phone
// Uses the installed Google Chrome through playwright-core (no browser download).
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const BASE = (process.argv[2] ?? 'https://meesho-dice-c2m-iitb.vercel.app').replace(/\/$/, '');
const OUT = path.resolve(process.argv[3] ?? path.join(HERE, '../../source/assets/phone'));
fs.mkdirSync(OUT, { recursive: true });

// Each screen: the step to open, what to do before the shot, and the elements to mark (in marker order).
const SCREENS = [
  { key: 'price_top', step: null, scroll: 'top', marks: ['.phone-body > div:nth-of-type(1)', '.verdict-box'] },
  { key: 'price_end', step: null, scroll: 'bottom', marks: ['.phone-body > div:nth-of-type(3)', '.phone-body > div:nth-of-type(4)', '.phone-body > .btn.primary'] },
  { key: 'brief_top', step: 'brief', scroll: 'top', marks: ['.phone-body > .pcard:nth-of-type(1)', '.phone-body > .pcard:nth-of-type(2)'] },
  { key: 'brief_end', step: 'brief', scroll: 'bottom', marks: ['.phone-body > .pcard:nth-of-type(3)', '.phone-body > .btn.primary'] },
  { key: 'batch_open', step: 'batch', scroll: 'top', marks: ['.phone-body > .pcard:nth-of-type(1)', '.phone-body > .pcard:nth-of-type(2)', '.phone-body > .btn.primary'] },
  { key: 'batch_done', step: 'batch', scroll: 'bottom', click: '.phone-body > .btn.primary', marks: ['.phone-body > .pcard:nth-of-type(3)'] },
  { key: 'wa_brief', step: 'whatsapp', scroll: 'top', marks: ['.wa > .wa-bubble:nth-of-type(1)', '.wa-quick'] },
  { key: 'wa_reply', step: 'whatsapp', scroll: 'bottom', click: '.wa-quick button:nth-of-type(1)', marks: ['.wa-reply', '.wa > .wa-bubble:last-of-type'] },
];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
const meta = { source: BASE, captured: new Date().toISOString(), screens: {} };

for (const sc of SCREENS) {
  await page.goto(`${BASE}/#/maker${sc.step ? `?step=${sc.step}` : ''}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.phone-screen');
  if (sc.click) await page.click(sc.click);
  await page.waitForTimeout(300);
  // Scroll the page so the sticky phone sits fully in view, then scroll its own body.
  await page.evaluate(() => window.scrollTo(0, 0));
  const scrollInfo = await page.evaluate((where) => {
    const body = document.querySelector('.phone-body, .wa');
    if (!body) return null;
    body.scrollTop = where === 'bottom' ? body.scrollHeight : 0;
    return { scrollTop: body.scrollTop, scrollHeight: body.scrollHeight, clientHeight: body.clientHeight };
  }, sc.scroll);
  await page.waitForTimeout(200);
  const phone = await page.$('.phone');
  const pb = await phone.boundingBox();
  const screen = await (await page.$('.phone-screen')).boundingBox();
  const marks = [];
  for (const sel of sc.marks) {
    const el = await page.$(sel);
    const b = el && await el.boundingBox();
    if (!b) { marks.push(null); continue; }
    // Clip to the visible phone screen, then express as fractions of the phone image.
    const top = Math.max(b.y, screen.y), bottom = Math.min(b.y + b.height, screen.y + screen.height);
    marks.push(bottom - top < 8 ? null : { sel, x: (b.x - pb.x) / pb.width, y: (top - pb.y) / pb.height, w: b.width / pb.width, h: (bottom - top) / pb.height });
  }
  const file = path.join(OUT, `phone_${sc.key}.png`);
  await phone.screenshot({ path: file });
  meta.screens[sc.key] = { file: path.basename(file), w: Math.round(pb.width * 2), h: Math.round(pb.height * 2), scroll: scrollInfo, marks };
  console.log(sc.key, scrollInfo ? `${scrollInfo.scrollTop}/${scrollInfo.scrollHeight - scrollInfo.clientHeight}` : '', marks.map((m) => (m ? `(${m.x.toFixed(2)},${m.y.toFixed(2)})` : 'hidden')).join(' '));
}
fs.writeFileSync(path.join(OUT, 'phone_screens.json'), JSON.stringify(meta, null, 1));
await browser.close();
console.log('Wrote', Object.keys(meta.screens).length, 'screens to', OUT);
