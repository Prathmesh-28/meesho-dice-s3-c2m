import { useEffect, useMemo, useRef, useState } from 'react';
import { FD, OPS, PERSONA } from '../config.js';
import { personaFlow } from '../lib/flow.js';
import { addDays, advanceTiming, avgTransit, batchDates, fmtDay, fmtRange, nextCutoff, nodeFlow, promises, splitBy } from '../lib/operations.js';
import { href, setParams } from '../lib/router.js';
import { num, pct, rupees } from '../lib/format.js';
import { Chip, waText } from '../components/ui.jsx';
import meeshoIcon from '../assets/meesho-icon.png';

// One batch, end to end, as every stakeholder sees it. Each step is a moment in the week; every screen shows that
// moment from its own side. Numbers come from the same model as the rest of the app (lib/flow.js, lib/operations.js).

const ACTORS = {
  buyer: { label: 'Buyer', tone: '#2a78d6' },
  maker: { label: 'Manufacturer', tone: '#eb6834' },
  node: { label: 'Factory Node', tone: '#7b2a64' },
  meesho: { label: 'Meesho', tone: '#5a1646' },
  valmo: { label: 'Valmo', tone: '#1baf7a' },
  nbfc: { label: 'NBFC', tone: '#9a6f08' },
};

export default function Flow({ pti, params }) {
  const today = useMemo(() => new Date(), []);
  const m = useMemo(() => model(pti, today), [pti, today]);
  const step = Math.min(m.STEPS.length - 1, Math.max(0, Number(params.step) || 0));
  const go = (s) => setParams({ step: s ? String(s) : null });
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => (step < m.STEPS.length - 1 ? go(step + 1) : setPlaying(false)), 4500);
    return () => clearTimeout(t);
  }, [playing, step, m.STEPS.length]);
  const S = m.STEPS[step];
  const on = (a) => S.actors.includes(a);

  return (
    <div className="stack">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">End-to-end flow · every stakeholder’s screen</div>
          <h2>One batch, from the Demand Brief to the payout, on every screen at once</h2>
          <p className="lede">
            Step through {PERSONA.name}’s week. The buyer’s Meesho app, the owner’s WhatsApp, the Factory Node’s tablet, Meesho’s console,
            Valmo and the NBFC all update together, so you can see who acts, what they see, and how goods, money and data move.
          </p>
        </div>
        <div className="row">
          <button className="btn" type="button" disabled={step === 0} onClick={() => go(step - 1)}>← Back</button>
          <button className="btn primary" type="button" onClick={() => { if (step === m.STEPS.length - 1) go(0); setPlaying(!playing); }}>{playing ? '❚❚ Pause' : '▶ Play the week'}</button>
          <button className="btn" type="button" disabled={step === m.STEPS.length - 1} onClick={() => go(step + 1)}>Next →</button>
        </div>
      </div>

      <div className="e2e-steps" role="tablist" aria-label="Steps">
        {m.STEPS.map((s, i) => (
          <button key={s.title} type="button" role="tab" aria-selected={i === step} className={i === step ? 'on' : i < step ? 'done' : ''} onClick={() => { setPlaying(false); go(i); }}>
            <span className="n">{i + 1}</span><span className="w">{s.when}</span><span className="t">{s.short}</span>
          </button>
        ))}
      </div>

      <div className="e2e-now">
        <div>
          <div className="when">Step {step + 1} of {m.STEPS.length} · {S.when}</div>
          <h3>{S.title}</h3>
          <p>{S.what}</p>
        </div>
        <div className="actors">
          {S.actors.map((a) => <span key={a} className="actor" style={{ background: ACTORS[a].tone }}>{ACTORS[a].label}</span>)}
        </div>
      </div>

      <div className="e2e-grid">
        <Device kind="phone" title="Buyer · Meesho app" who="A buyer in Patna" on={on('buyer')}><BuyerScreen m={m} step={step} /></Device>
        <Device kind="phone" title="Manufacturer · WhatsApp" who={`${PERSONA.owner}, ${PERSONA.name}`} on={on('maker')}><MakerScreen m={m} step={step} /></Device>
        <Device kind="tablet" title="Factory Node · warehouse tablet" who={`${PERSONA.cluster} Factory Node (partner 3PL)`} on={on('node')}><NodeScreen m={m} step={step} /></Device>
        <Device kind="console" title="Meesho · C2M console" who="Category and logistics ops" on={on('meesho')} wide><ConsoleScreen m={m} step={step} /></Device>
        <div className="stack">
          <Device kind="card" title="Valmo · line-haul and last mile" who="Pick-up, delivery, returns" on={on('valmo')}><ValmoScreen m={m} step={step} /></Device>
          <Device kind="card" title="NBFC · batch advance" who="Lends against paid pre-orders" on={on('nbfc')}><NbfcScreen m={m} step={step} /></Device>
        </div>
      </div>

      <div className="note-box">
        A simulation on synthetic, seeded data: nothing is sent to Meesho, WhatsApp, Valmo or a lender. The rules behind each step are in{' '}
        <a href={href('ops')}>Batch operations</a>; the money per pack in <a href={href('maker', { step: 'price' })}>the price check</a>.
      </div>
    </div>
  );
}

function Device({ kind, title, who, on, wide, children }) {
  return (
    <section className={`dev dev-${kind}${on ? ' on' : ''}${wide ? ' wide' : ''}`}>
      <div className="dev-head">
        <div><b>{title}</b><span>{who}</span></div>
        {on && <Chip tone="brand">Acting now</Chip>}
      </div>
      <div className="dev-frame"><div className="dev-screen">{children}</div></div>
    </section>
  );
}

// ---------------------------------------------------------------- the week, as data
function model(pti, today) {
  const f = personaFlow(pti);
  const { check, brief, plan, week, weekLedger: L, rates } = f;
  const d = batchDates(nextCutoff(today, plan.cutoffs));
  const adv = advanceTiming({ preOrders: week.preOrders, price: week.preorderPrice, make: week.make, transit: avgTransit(brief.rows) });
  const flow = nodeFlow({ plan, rates });
  const topUp = Math.round(flow.topUp);
  const truck = week.make + topUp;
  const cartons = Math.ceil(truck / 30);
  const patna = promises({ rows: brief.rows, plan, today }).find((p) => p.district === 'Patna');
  const failed = Math.round(L.failed);
  const delivered = week.preOrders - failed;
  const returns = Math.round(L.returns);
  const fitReturns = Math.round(returns * FD.recovery.node);
  const soFar = Math.round(plan.preDay * 4); // Fri-Mon, when Monday's brief goes out
  const pre = week.preorderPrice;
  const onHand = (day) => Math.round(flow.opening - plan.nodeDay * ((((day - 4) % 7) + 7) % 7));
  const lastIn = addDays(d.ship, 8);
  const payDay = addDays(patna.arrive[0], OPS.settleDays);
  const STEPS = [
    { short: 'List', when: 'Once, at onboarding', title: 'The factory checks its price and lists', actors: ['maker', 'meesho'],
      what: `Kavin enters his ₹${FD.makingCost} making cost. Through the node his floor is ${rupees(f.table[2].floor)}, under the ${rupees(check.gatePrice)} gate, so the listing goes live with the “Sold directly by the manufacturer” badge: pre-order ${rupees(pre)}, node stock ${rupees(check.gatePrice)}.`, day: -10 },
    { short: 'Brief', when: fmtDay(addDays(d.cutoff, -3)), title: 'Monday: the Demand Brief reaches the owner on WhatsApp', actors: ['meesho', 'maker'],
      what: `Meesho’s weekly job sums searches and orders by district: ${num(brief.weeklyTotal)} orders a week in Kavin’s 12 districts. ${num(soFar)} pre-orders are already in this week’s batch; the cut-off is Thursday.`, day: -3 },
    { short: 'Pre-orders', when: `${fmtDay(d.open)}–${fmtDay(d.cutoff)}`, title: 'Buyers pre-order; the money waits in escrow', actors: ['buyer', 'meesho'],
      what: `A buyer in Patna picks the pre-order: ${rupees(pre)} by UPI, arriving ${fmtRange(...patna.arrive)}, shown before paying. By Thursday ${num(week.preOrders)} buyers have paid ${rupees(week.preOrders * pre)}, held by Meesho.`, day: 0 },
    { short: 'Cut-off', when: `${fmtDay(d.cutoff)}, 11:59 pm`, title: 'The cut-off locks the batch; the NBFC pays 20%', actors: ['meesho', 'nbfc', 'maker'],
      what: `${num(week.preOrders)} pre-orders + 15% = ${num(week.make)} packs to make. Against the paid orders in escrow, the NBFC pays ${rupees(adv.atCutoff)} on ${fmtDay(d.advance)} morning, before any fabric is cut.`, day: 0.5 },
    { short: 'Make', when: `${fmtDay(d.advance)}–${fmtDay(addDays(d.advance, 1))}`, title: 'The factory cuts, stitches and packs', actors: ['maker'],
      what: `One dye lot, five sizes, cut from Kavin’s own fabric stock. He reports progress with one-word WhatsApp replies; the buyer’s app shows “being made in ${PERSONA.cluster}”.`, day: 2 },
    { short: 'Truck', when: fmtDay(d.truck), title: 'Top-up approved, QC at the factory, the truck leaves', actors: ['maker', 'meesho', 'node'],
      what: `Meesho suggests a ${num(topUp)}-pack node top-up; Kavin approves it. A QC partner samples ${OPS.qcSample.n} packs (2 defects: pass). The truck leaves with ${num(truck)} packs; the shipping notice and e-way bill reach the node.`, day: 3 },
    { short: 'Count in', when: `${fmtDay(d.ship)}, 6 am`, title: 'The node counts the truck; the NBFC pays 10%', actors: ['node', 'nbfc'],
      what: `${cartons} cartons scanned against the shipping notice: ${num(truck)} of ${num(truck)}, no damage. The signed goods receipt moves the packs into Kavin’s node stock and triggers the ${rupees(adv.atHandover)} advance.`, day: 4 },
    { short: 'Ship', when: fmtDay(d.ship), title: 'The node picks, packs and ships every pre-order', actors: ['node', 'valmo', 'buyer'],
      what: `${num(week.preOrders)} labels and invoices print on Kavin’s GSTIN. Valmo collects ${num(week.preOrders + Math.round(plan.nodeDay))} parcels (pre-orders plus the day’s node-stock orders) 16 hours after the truck arrived.`, day: 4 },
    { short: 'Deliver', when: fmtRange(addDays(d.ship, 3), lastIn), title: 'Valmo delivers, nearest districts first', actors: ['valmo', 'buyer'],
      what: `${num(delivered)} delivered on time; ${failed} failed (address not found, nobody home) go back to the node sealed. The Patna parcel arrives ${fmtRange(...patna.arrive)} with an OTP.`, day: 8 },
    { short: 'Returns', when: 'Within 7 days of delivery', title: 'Returns end at the node and are graded', actors: ['node', 'buyer', 'valmo'],
      what: `${returns} buyers return a pack (sealed-pack size swaps and defects). The node grades each: ${fitReturns} go back into node stock, ${returns - fitReturns} become seconds and ride back to the factory. Buyers are refunded within 3 days of pick-up.`, day: 10 },
    { short: 'Payout', when: `From ${fmtDay(payDay)}`, title: 'Payout, advance repaid, next brief out', actors: ['meesho', 'maker', 'nbfc'],
      what: `${OPS.settleDays} days after each delivery Meesho pays out ${rupees(L.payout)} after fees; the NBFC is repaid its ${rupees(L.advance)}; Kavin keeps +${rupees(L.balance)} on the batch, and his Health Score updates. Monday’s brief starts the next week.`, day: 12 },
  ];
  return { f, d, adv, flow, topUp, truck, cartons, patna, failed, delivered, returns, fitReturns, soFar, pre, onHand, STEPS, L, check, brief, plan, week };
}

// ---------------------------------------------------------------- buyer
function BuyerScreen({ m, step }) {
  const { check, pre, patna, week, d, returns } = m;
  const head = (
    <div className="phone-head sm">
      <img src={meeshoIcon} alt="" className="phone-logo" />
      <div><div className="who">meesho</div><div className="where">{step < 2 ? 'Search · men’s briefs' : 'My orders'}</div></div>
    </div>
  );
  if (step < 2) {
    return (
      <>
        {head}
        <div className="dev-body">
          <div className="small muted">56 results · deliver to Patna 800xxx</div>
          <div className="pcard e2e-prod on">
            <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <div className="thumb" aria-hidden><i style={{ background: '#2c3a5e' }} /><i style={{ background: '#8a8f99' }} /></div>
              <div style={{ flex: 1 }}>
                <b>Men’s cotton briefs, pack of 3</b>
                <div className="badge-direct">✓ Sold directly by the manufacturer</div>
                <div className="row" style={{ gap: 8, marginTop: 4 }}><span className="buy-price">{rupees(pre)}</span><span className="small muted">pre-order · or {rupees(check.gatePrice)} ships in 2 days</span></div>
              </div>
            </div>
          </div>
          {[['Cotton briefs, pack of 3 · reseller', 209], ['Briefs combo, pack of 3', 229], ['Men’s trunks, pack of 3', 249]].map(([t, p]) => (
            <div className="pcard e2e-prod" key={t}>
              <div className="row" style={{ gap: 10 }}>
                <div className="thumb" aria-hidden><i style={{ background: '#c9c4bd' }} /><i style={{ background: '#a8a29a' }} /></div>
                <div><b style={{ fontWeight: 550 }}>{t}</b><div className="buy-price">{rupees(p)}</div></div>
              </div>
            </div>
          ))}
          {step === 0 && <div className="small muted">Listing live with the badge once the price check clears the gate.</div>}
        </div>
      </>
    );
  }
  const states = [
    ['Paid, held by Meesho until delivery', `${fmtDay(d.open)}`],
    [`In this week’s batch · ${num(week.preOrders)} pre-orders`, `cancel free until ${fmtDay(d.cutoff)}`],
    [`Batch locked, being made in ${PERSONA.cluster}`, `${fmtDay(d.advance)} to ${fmtDay(d.truck)}`],
    ['Counted in at the Factory Node', `${fmtDay(d.ship)} morning`],
    ['Shipped by Valmo', `${fmtDay(d.ship)} · East, ${patna.zone.days[0]}-${patna.zone.days[1]} days`],
    ['Delivered in Patna', fmtRange(...patna.arrive)],
  ];
  const at = step === 2 ? 1 : step <= 5 ? 2 : step === 6 ? 3 : step === 7 ? 4 : 5;
  const done = step >= 8;
  return (
    <>
      {head}
      <div className="dev-body">
        <div className="pcard" style={done ? { background: '#e7f5e7', borderColor: 'transparent' } : {}}>
          <b>Men’s cotton briefs, pack of 3</b>
          <div className="small">{done ? `Delivered · paid ${rupees(pre)}, saved ${rupees(check.marketMedian - pre)}` : `Pre-order · ${rupees(pre)} paid by UPI · arrives ${fmtRange(...patna.arrive)}`}</div>
        </div>
        <div className="pcard">
          <ul className="track">
            {states.map(([t, w], i) => (
              <li key={t} className={i < at || (done && i === at) ? 'done' : i === at ? 'now' : ''}><b>{t}</b><span>{w}</span></li>
            ))}
          </ul>
        </div>
        {step >= 3 && step <= 6 && <div className="wa-push">🔔 {step === 3 ? 'Your batch is locked: 539 packs are being made for you.' : step === 6 ? 'Your pack reached the Meesho Factory Node.' : `Being made in ${PERSONA.cluster}; ships ${fmtDay(d.ship)}.`}</div>}
        {step === 7 && <div className="wa-push">🔔 Shipped! Track with Valmo. Arrives {fmtRange(...patna.arrive)}.</div>}
        {step === 8 && <div className="wa-push">✅ Delivered with OTP. Rate the product?</div>}
        {step >= 9 && (
          <div className="pcard">
            <b>{step === 9 ? 'Wrong size? Return in the sealed pack' : 'Order complete'}</b>
            <div className="small">{step === 9 ? `${returns} of this batch’s buyers returned a pack this week; refunds land within 3 days of pick-up.` : 'Return window closed. Thanks for buying direct from the factory.'}</div>
          </div>
        )}
        {step === 2 && <div className="small muted">Cancel free until the cut-off; after it, refunded within 24 hours until it ships.</div>}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- manufacturer (WhatsApp)
function MakerScreen({ m, step }) {
  const { brief, week, soFar, d, adv, topUp, truck, delivered, failed, returns, fitReturns, L, check, f } = m;
  const sizes = splitBy(week.make, brief.split).map((s) => `${s.value} ${s.units}`).join(' · ');
  const top = splitBy(topUp, brief.split).map((s) => `${s.value} ${s.units}`).join(' · ');
  const MSGS = [
    [0, 'in', `✅ *Price check passed*\nMen’s briefs, pack of 3 at ₹${FD.makingCost} making cost: lowest viable ${rupees(f.table[2].floor)} via the node, under the ${rupees(check.gatePrice)} badge line.\nListed: pre-order *${rupees(m.pre)}* · node stock *${rupees(check.gatePrice)}*`, '11:02'],
    [0, 'out', '👍', '11:05'],
    [1, 'in', `📦 *C2M Demand Brief* · this week\n${brief.rows.slice(0, 3).map((r, i) => `${i + 1}. ${r.district}: ${num(r.weekly)}/week`).join('\n')}\nYour pre-orders so far: *${num(soFar)}*\nCut-off *${fmtDay(d.cutoff)}, 11:59 pm*`, '9:30'],
    [1, 'out', '1 · Join this week', '9:41'],
    [2, 'in', `📈 Pre-orders today: 67 · total *${num(week.preOrders - 67)}*`, '8:00'],
    [3, 'in', `🔒 *Batch locked*: ${num(week.preOrders)} pre-orders → make *${num(week.make)}*\n${sizes}\n💰 ${rupees(adv.atCutoff)} (20%) credited by the NBFC`, '0:01'],
    [4, 'out', 'Cutting done ✂️', '18:20'],
    [4, 'in', 'Noted. Stitching tomorrow, QC visit Sunday 2 pm.', '18:20'],
    [5, 'in', `📦 *Node stock* · ${num(m.onHand(3))} packs left\nSuggested top-up on today’s truck: *${num(topUp)}*\n${top}`, '9:00'],
    [5, 'out', '1 · Approve top-up', '9:12'],
    [5, 'in', `🔍 QC sample: 2 defects in ${OPS.qcSample.n} · *passed*`, '14:40'],
    [5, 'out', 'Truck left 🚚', '18:05'],
    [5, 'in', `Shipping notice sent: ${num(truck)} packs. E-way bill pre-filled, confirm? ✅`, '18:06'],
    [6, 'in', `✅ Node counted *${num(truck)} of ${num(truck)}*, no damage\n💰 ${rupees(adv.atHandover)} (10%) credited`, '6:41'],
    [7, 'in', `🚚 All ${num(week.preOrders)} pre-orders shipped by Valmo`, '22:10'],
    [8, 'in', `📬 ${num(delivered)} delivered · ${failed} failed, back at the node sealed`, '20:00'],
    [9, 'in', `↩️ ${returns} returns graded: ${fitReturns} back in node stock, ${returns - fitReturns} seconds on your next return truck`, '19:30'],
    [10, 'in', `💸 *Payout* ${rupees(L.payout)} after fees\nNBFC repaid ${rupees(L.advance)}\n*Balance to you +${rupees(L.balance)}*`, '10:00'],
    [10, 'in', '📦 Next week’s brief arrives Monday; your Health Score is updated.', '10:01'],
  ];
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [step]);
  return (
    <>
      <div className="phone-head sm" style={{ background: '#075e54' }}>
        <img src={meeshoIcon} alt="" className="phone-logo round" />
        <div><div className="who">Meesho C2M</div><div className="where">Business account</div></div>
      </div>
      <div className="wa dev-body" ref={ref}>
        {MSGS.filter(([s]) => s <= step).map(([s, dir, t, time], i) => (
          <div key={i} className={`${dir === 'in' ? 'wa-bubble' : 'wa-reply'}${s === step ? ' fresh' : ''}`}>
            {waText(t)}<span className="time">{time}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- node tablet
function NodeScreen({ m, step }) {
  const { d, truck, topUp, week, cartons, failed, returns, fitReturns, plan, onHand, flow, brief } = m;
  const day = m.STEPS[step].day;
  const bar = (v, max) => <div className="progress" style={{ height: 8 }}><div className="a" style={{ width: `${Math.min(100, (v / max) * 100)}%` }} /></div>;
  const head = (title) => (
    <div className="node-top"><b>{PERSONA.cluster} Factory Node</b><span>{title}</span></div>
  );
  if (step <= 4) {
    return (
      <>
        {head('Inbound and stock')}
        <div className="dev-body">
          <div className="tiles">
            <div><span>Kavin Knit Mills on hand</span><b>{num(onHand(day))}</b><em>{(onHand(day) / plan.nodeDay).toFixed(1)} days of node orders</em></div>
            <div><span>Node orders today</span><b>{num(plan.nodeDay)}</b><em>ship within 2 days, COD allowed</em></div>
          </div>
          <div className="pcard">
            <b>Dock slots, {fmtDay(d.truck)}</b>
            <table className="pl"><tbody>
              <tr><td>14:00 · Dock 1 · Sri Murugan Hosiery</td><td>booked</td></tr>
              <tr><td><b>18:00 · Dock 2 · Kavin Knit Mills</b></td><td>{step >= 3 ? 'batch locked' : 'expected'}</td></tr>
              <tr><td>20:00 · Dock 1 · Velan Knits</td><td>booked</td></tr>
            </tbody></table>
          </div>
          <div className="small muted">Cut-offs are staggered across factories, so each day’s inbound is about one-sixth of the week.</div>
        </div>
      </>
    );
  }
  if (step === 5) {
    return (
      <>
        {head('Shipping notice received')}
        <div className="dev-body">
          <div className="pcard">
            <b>ASN · Kavin Knit Mills · ETA 21:30</b>
            <table className="pl"><tbody>
              <tr><td>Pre-order batch</td><td>{num(week.make)}</td></tr>
              <tr><td>Approved top-up</td><td>{num(topUp)}</td></tr>
              <tr><td>Total · {cartons} cartons</td><td>{num(truck)}</td></tr>
              <tr><td>E-way bill</td><td>confirmed</td></tr>
              <tr><td>QC at source</td><td>passed, seals intact</td></tr>
            </tbody></table>
          </div>
          <div className="small muted">{splitBy(truck, brief.split).map((s) => `${s.value} ${s.units}`).join(' · ')}</div>
        </div>
      </>
    );
  }
  if (step === 6) {
    return (
      <>
        {head('Goods receipt')}
        <div className="dev-body">
          <div className="pcard">
            <div className="row between"><b>Cartons scanned</b><span>{cartons} / {cartons}</span></div>
            {bar(cartons, cartons)}
            <table className="pl mt"><tbody>
              <tr><td>Counted vs ASN</td><td className="good-ink">{num(truck)} = {num(truck)} ✓</td></tr>
              <tr><td>Damaged</td><td>0</td></tr>
              <tr><td>Seals</td><td>intact, not opened</td></tr>
              <tr><td>Signed</td><td>06:40, 2 h after arrival</td></tr>
            </tbody></table>
          </div>
          <div className="wa-push">✅ GRN posted: stock live for sale; NBFC notified.</div>
        </div>
      </>
    );
  }
  if (step === 7) {
    return (
      <>
        {head('Outbound wave')}
        <div className="dev-body">
          {[['Picked', week.preOrders], ['Packed, labelled, invoiced', week.preOrders], ['Handed to Valmo', week.preOrders]].map(([k, v]) => (
            <div key={k} style={{ margin: '6px 0' }}><div className="row between small"><span>{k}</span><b>{num(v)} / {num(week.preOrders)}</b></div>{bar(v, week.preOrders)}</div>
          ))}
          <div className="tiles mt">
            <div><span>Dock-to-ship</span><b>16 h</b><em>target ≤ 24 h</em></div>
            <div><span>Node-stock orders too</span><b>{num(plan.nodeDay)}</b><em>same pick-up</em></div>
          </div>
          <div className="small muted">Invoices print on the factory’s GSTIN; the node adds only the shipping bag and label.</div>
        </div>
      </>
    );
  }
  if (step === 8 || step === 9) {
    const rows = step === 8
      ? [['Failed deliveries back, sealed', failed, `${Math.round(failed * FD.recovery.node)} restocked`]]
      : [['Sealed, size swaps', fitReturns, '→ node stock'], ['Opened or defective', returns - fitReturns, '→ seconds, back to factory']];
    return (
      <>
        {head(step === 8 ? 'Returns inbound' : 'Returns grading')}
        <div className="dev-body">
          <div className="pcard">
            <table className="pl"><tbody>{rows.map(([k, v, w]) => <tr key={k}><td>{k}<div className="small muted">{w}</div></td><td>{v}</td></tr>)}</tbody></table>
          </div>
          {step === 9 && <div className="small muted">Every return is photographed; Meesho decides disputes on the photos. Opened innerwear is never resold.</div>}
          <div className="tiles">
            <div><span>Kavin on hand</span><b>{num(onHand(day))}</b><em>FIFO, nothing over 30 days</em></div>
            <div><span>Graded today</span><b>{step === 8 ? failed : returns}</b><em>within 24 h of arrival</em></div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {head('Factory account · month to date')}
      <div className="dev-body">
        <div className="tiles">
          <div><span>On hand</span><b>{num(onHand(day))}</b><em>avg stay {flow.dwell.toFixed(1)} days</em></div>
          <div><span>Older than 30 days</span><b>0</b><em>markdown rule not triggered</em></div>
          <div><span>Storage billed</span><b>{rupees(flow.avgOnHand * OPS.storagePerMonth)}</b><em>₹{OPS.storagePerMonth} a pack a month</em></div>
          <div><span>Cycle-count accuracy</span><b>99.8%</b><em>target ≥ 99.5%</em></div>
        </div>
        <div className="small muted">Fees net from the payout: ₹{FD.fees.nodeFee} a unit node fee and storage.</div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Meesho console
function ConsoleScreen({ m, step }) {
  const { week, pre, d, adv, truck, topUp, delivered, failed, returns, L, plan, soFar, onHand } = m;
  const escrow = step < 1 ? 0 : step === 1 ? soFar * pre : step < 8 ? week.preOrders * pre : 0;
  const status = ['Listing live', 'Window open', 'Window open', 'Locked', 'In production', 'In transit', 'At node', 'Shipped', 'Delivering', 'Returns window', 'Settled'][step];
  const EVENTS = [
    [0, 'meesho', 'Price check passed; badge on: 8.1% under the median'],
    [1, 'meesho', 'Demand Brief sent to 60 factories in 5 categories'],
    [2, 'buyer', `Pre-orders closed at ${num(week.preOrders)} · ${rupees(week.preOrders * pre)} in escrow`],
    [3, 'meesho', `Cut-off: batch TPR-0001-W43 locked at ${num(week.make)}`],
    [3, 'nbfc', `Advance 20% disbursed: ${rupees(adv.atCutoff)}`],
    [4, 'maker', 'Production update: cutting done'],
    [5, 'maker', `Top-up approved: ${num(topUp)} packs (suggested by the Demand Brief)`],
    [5, 'maker', `QC sample passed · ASN ${num(truck)} packs · e-way bill confirmed`],
    [6, 'node', `GRN ${num(truck)}/${num(truck)}, no discrepancy`],
    [6, 'nbfc', `Advance 10% disbursed: ${rupees(adv.atHandover)}`],
    [7, 'valmo', `Manifest picked up: ${num(week.preOrders + Math.round(plan.nodeDay))} parcels`],
    [8, 'valmo', `${num(delivered)} delivered (${pct(delivered / week.preOrders, 1)}), ${failed} failed, back to node`],
    [9, 'node', `${returns} returns graded; refunds triggered`],
    [10, 'meesho', `Payout ${rupees(L.payout)}; NBFC repaid ${rupees(L.advance)}`],
  ].filter(([s]) => s <= step).reverse();
  const tiles = [
    ['Pre-orders', step < 1 ? '—' : num(step === 1 ? soFar : week.preOrders), step < 2 ? 'this window' : 'locked'],
    ['Held for buyers', rupees(escrow), step >= 8 ? 'released at delivery' : 'escrow'],
    ['Batch', status, `cut-off ${fmtDay(d.cutoff)}`],
    ['Node stock cover', `${(onHand(m.STEPS[step].day) / plan.nodeDay).toFixed(1)} d`, 'Kavin, node orders'],
    ['Promise accuracy', step >= 8 ? '96.4%' : '—', 'target ≥ 95%'],
    ['Advanced / repaid', step < 3 ? '—' : step < 6 ? rupees(adv.atCutoff) : step < 10 ? rupees(adv.total) : 'repaid', 'NBFC'],
  ];
  return (
    <>
      <div className="console-bar"><span className="dots"><i /><i /><i /></span>c2m.meesho.internal / batches / TPR-0001-W43</div>
      <div className="dev-body">
        <div className="console-tiles">
          {tiles.map(([k, v, n]) => <div key={k}><span>{k}</span><b>{v}</b><em>{n}</em></div>)}
        </div>
        <table className="console-log">
          <thead><tr><th>Step</th><th>Who</th><th>Event</th></tr></thead>
          <tbody>
            {EVENTS.map(([s, a, t], i) => (
              <tr key={i} className={s === step ? 'fresh' : ''}>
                <td>{s + 1}</td>
                <td><span className="actor sm" style={{ background: ACTORS[a].tone }}>{ACTORS[a].label}</span></td>
                <td>{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- partners
function ValmoScreen({ m, step }) {
  const { week, plan, delivered, failed, returns, patna } = m;
  const rows = step < 7
    ? [['Pick-up booked', `${fmtDay(m.d.ship)} 10:00, ${num(week.preOrders + Math.round(plan.nodeDay))} parcels`], ['Lanes', '12 districts, 4 zones by surface']]
    : step === 7
      ? [['Picked up', `${num(week.preOrders + Math.round(plan.nodeDay))} parcels, 22:10`], ['Patna', `in transit, ${patna.zone.days[0]}-${patna.zone.days[1]} days`]]
      : step === 8
        ? [['Delivered', `${num(delivered)} with OTP`], ['Failed', `${failed}: back to the node sealed`], ['Patna', `delivered ${fmtRange(...patna.arrive)}`]]
        : [['Return pick-ups', `${returns}, to the node`], ['Refunds', 'triggered at pick-up']];
  return <table className="pl"><tbody>{rows.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table>;
}

function NbfcScreen({ m, step }) {
  const { adv, L, week } = m;
  const rows = [
    ['Secured by', `${num(week.preOrders)} paid pre-orders in escrow`],
    ['20% at the cut-off', step >= 3 ? `paid ${rupees(adv.atCutoff)}` : 'pending'],
    ['10% at the goods receipt', step >= 6 ? `paid ${rupees(adv.atHandover)}` : 'pending'],
    ['Repaid from payout', step >= 10 ? `${rupees(L.advance)} ✓` : 'pending'],
    ['Meesho first-loss', `${pct(FD.firstLoss)} of advances`],
  ];
  return <table className="pl"><tbody>{rows.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table>;
}
