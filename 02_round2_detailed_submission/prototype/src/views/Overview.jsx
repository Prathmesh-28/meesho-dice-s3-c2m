import { useMemo } from 'react';
import { PERSONA, SPONSOR } from '../config.js';
import { categoryById } from '../lib/generate.js';
import { personaFlow } from '../lib/flow.js';
import { financials } from '../lib/factoryDirect.js';
import { href } from '../lib/router.js';
import { crore, num, pct, rupees } from '../lib/format.js';
import { Card } from '../components/ui.jsx';

export default function Overview({ pti, summary, cohort }) {
  const persona = cohort.find((s) => s.persona);
  const { check, self, table, brief, batch, ledger } = useMemo(() => personaFlow(pti), [pti]);
  const fin = useMemo(() => financials(), []);
  const LOOP = [
    ['1 · Gather the data', `Searches, carts and delivered orders from ${SPONSOR.buyersMn} mn buyers, summed by district`, `${num(brief.weeklyTotal)} orders a week`, ['maker', { step: 'brief' }]],
    ['2 · Predict demand', 'Demand Brief: districts, sizes and the price band that sells', `${brief.rows[0].district} leads`, ['maker', { step: 'brief' }]],
    ['3 · Share the number', 'The brief and pre-orders reach the owner on WhatsApp; one reply commits', `${num(batch.preOrders)} pre-orders`, ['maker', { step: 'whatsapp' }]],
    ['4 · Factory makes the order', 'Confirmed orders + 15%, never stock built blind', `makes ${num(batch.make)}`, ['maker', { step: 'batch' }]],
    ['5 · Node takes the batch', 'One truck to the cluster node; the seller keeps title; an NBFC advances 30%', `+${rupees(ledger.advance)} on Day 3`, ['maker', { step: 'batch' }]],
    ['6 · Node packs each order', 'Picks, packs, labels and samples for QC at ₹20 a unit', 'no packing team needed', ['maker', { step: 'price' }]],
    ['7 · Valmo delivers', `The buyer prepaid ${rupees(batch.preorderPrice)} against ${rupees(check.marketMedian)}; returns end at the node`, `${pct(ledger.failed / ledger.confirmed, 1)} fail, not ${pct(categoryById[PERSONA.category].rtoRate)}`, ['buyer']],
    ['8 · Settle and learn', 'Balance paid 7 days after delivery; the Health Score updates daily', `+${rupees(ledger.balance)} on Day 15`, ['health', { seller: PERSONA.id }]],
  ];
  const grant = persona.events.find((e) => e.rule === 'grant');

  const questions = [
    ['Which manufacturers have a genuine price advantage, and which don’t despite scale?', 'Price Truth Index', 'pti', `${pti.counts.ready} of ${pti.counts.screened} large sellers pass; ${pti.top10NotReady} of the 10 largest do not.`],
    ['What stops reluctant manufacturers, and what changes their calculus?', 'Manufacturer app', 'maker', `A price check before listing, a pin-code Demand Brief, and batches made only against confirmed pre-orders.`],
    ['What makes early scale-up sustainable without subsidy or handholding?', 'Seller Health', 'health', `${summary.auto} automated actions against ${summary.manual} human escalations across the 60-seller pilot.`],
    ['Will buyers accept a 7-8 day wait for a lower price?', 'Buyer pre-order', 'buyer', `A prepaid pre-order at ${rupees(batch.preorderPrice)} against ${rupees(check.marketMedian)}; every pre-order joins the factory's batch.`],
    ['Is it worth it for Meesho, and how robust is it?', 'Business case', 'business', `NPV ${crore(fin.npv)} at 12%, payback in Year ${fin.payback}; drag any driver to stress it.`],
    ['What should Meesho measure, and when should it intervene?', 'Health Score + Day-30 rule', 'experiment', `Five-signal daily score, nine rules with thresholds, and a fund / tighten / stop rule at day 30.`],
  ];

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <div className="eyebrow" style={{ color: '#f7c08a' }}>Factory Direct · scale is the wrong screen</div>
          <h2 style={{ marginTop: 8 }}>Screen factories on price, not size. Then let them make only what is already sold.</h2>
          <p>
            A working prototype of Factory Direct. It screens every large seller on what buyers actually paid, gives a
            factory a price check, a district Demand Brief and prepaid batches, runs a 60-seller pilot on rules instead of
            account managers, and shows Meesho’s five-year case. Every number on this page is computed live, from the
            same model as the deck.
          </p>
          <div className="row" style={{ marginTop: 16 }}>
            <a className="btn primary" href={href('maker')} style={{ textDecoration: 'none', background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--plum)' }}>Open the manufacturer app →</a>
            <a className="btn" href={href('business')} style={{ textDecoration: 'none', background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}>See the business case</a>
          </div>
        </div>
        <div className="kpis">
          <div className="kpi"><div className="v">{rupees(table[3].floor)}</div><div className="l">prepaid-batch floor, {pct(table[3].gap, 1)} under the {rupees(check.marketMedian)} buyers pay</div></div>
          <div className="kpi"><div className="v">{pti.counts.ready} / {pti.counts.screened}</div><div className="l">large sellers pass the price gate; {pti.top10NotReady} of the 10 largest fail</div></div>
          <div className="kpi"><div className="v">{crore(fin.npv)}</div><div className="l">Meesho NPV at 12%, payback in Year {fin.payback}, no subsidy</div></div>
          <div className="kpi"><div className="v">{summary.auto} : {summary.manual}</div><div className="l">automated vs human actions, 60-seller pilot</div></div>
        </div>
      </section>

      <Card title="The Factory Direct loop, one batch end to end" sub={`${PERSONA.name} (fictional), ${PERSONA.cluster}: data → orders → goods → cash. No step starts until the one before it is confirmed.`}>
        <div className="loop fd">
          {LOOP.map(([k, p, n, link]) => (
            <div className="loop-step" key={k}>
              <div className="k">{k}</div>
              <div className="num-big">{n}</div>
              <p>{p}</p>
              <a href={href(...link)}>Open →</a>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid cols-2">
        <Card title={`Follow one manufacturer: ${PERSONA.name}`} sub={`${PERSONA.cluster} · men’s cotton briefs · offline B2B, ₹${PERSONA.offlineTurnoverCr} cr turnover · Cohort A (fictional)`}>
          <ol className="story">
            <li>
              <div><div className="t">Price check before listing</div><div className="d">At a ₹{PERSONA.unitCost} making cost, through the Factory Node the lowest price at a 9% margin is {rupees(check.floor)}, {pct(check.gap, 1)} under the {rupees(check.marketMedian)} price buyers pay. Shipping every order itself it would be only {pct(self.gap, 1)} under, short of the 8% badge: the node is what qualifies it.</div></div>
              <a href={href('maker', { step: 'price' })}>Open →</a>
            </li>
            <li>
              <div><div className="t">Demand Brief, by pin-code</div><div className="d">{brief.rows.slice(0, 3).map((r) => r.district).join(', ')} lead demand at {num(brief.weeklyTotal)} orders a week across 12 districts. Suggested first batch: {num(brief.suggested)} units.</div></div>
              <a href={href('maker', { step: 'brief' })}>Open →</a>
            </li>
            <li>
              <div><div className="t">Make only what is sold</div><div className="d">{num(batch.preOrders)} pre-orders confirmed, so {num(batch.make)} units are made (+15% buffer), handed over in bulk at the Factory Node, with {rupees(batch.prepayment)} prepaid at handover.</div></div>
              <a href={href('maker', { step: 'batch' })}>Open →</a>
            </li>
            <li>
              <div><div className="t">Slow first week, fixed by rule</div><div className="d">{grant ? `${grant.reason}. An impression grant fired on D${grant.day}, with no one on the phone.` : 'Orders tracked against the cohort curve from day one.'}</div></div>
              <a href={href('health', { seller: PERSONA.id })}>Open →</a>
            </li>
            <li>
              <div><div className="t">Graduated</div><div className="d">{persona.graduatedDay ? `Score held at 80 or above for 30 days; graduated on D${persona.graduatedDay} with batch prepayment unlocked. Today (D${persona.day}) the score is ${Math.round(persona.score)}.` : `Day ${persona.day}, score ${Math.round(persona.score)}.`}</div></div>
              <a href={href('health', { seller: PERSONA.id })}>Open →</a>
            </li>
          </ol>
        </Card>

        <Card title="Where each question in the brief is answered" sub="The questions the case asks, and the screen that answers each one">
          <div className="table-wrap" style={{ maxHeight: 'none' }}>
            <table>
              <thead><tr><th>Question from the brief</th><th>Screen</th><th>What it shows</th></tr></thead>
              <tbody>
                {questions.map(([q, screen, path, what]) => (
                  <tr key={q}>
                    <td style={{ width: '38%' }}>{q}</td>
                    <td><a href={href(path)} className="strong">{screen}</a></td>
                    <td className="ink2">{what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="note-box mt">
            All sellers, prices, orders and demand are synthetic and generated from a fixed seed, so the same stories
            appear on every run. The logic is what the prototype demonstrates: the rules would run unchanged on
            Meesho’s delivered-order and listing tables (see <a href={href('method')}>How Meesho runs it</a>).
          </div>
        </Card>
      </div>
    </div>
  );
}
