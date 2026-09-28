import { useMemo } from 'react';
import { ECONOMICS, PERSONA } from '../config.js';
import { priceCheck } from '../lib/economics.js';
import { demandBrief, batchPlan } from '../lib/demand.js';
import { href } from '../lib/router.js';
import { num, pct, rupees, signedPct } from '../lib/format.js';
import { Card } from '../components/ui.jsx';

const LOOP = [
  { k: '1 · QUALIFY', h: 'Is the price edge real?', p: 'Price Truth Index scores every live SKU against its comparable-set median. Badge only when most of the catalogue is genuinely cheaper.', link: ['pti'], cta: 'Price Truth Index' },
  { k: '2 · ALLOCATE', h: 'Impressions, not rupees', p: 'Starter impressions go to the pin-codes in the seller’s Demand Brief. If orders lag at D7 or D14, an impression grant fires on its own.', link: ['health', { stage: 'allocate' }], cta: 'Allocation rules' },
  { k: '3 · DIAGNOSE', h: 'One score, five signals', p: 'Price gap held, order pace against the cohort curve, quality returns, on-time dispatch and stock. Recomputed every day.', link: ['health'], cta: 'Health Score' },
  { k: '4 · REMEDY', h: 'Rules, not account managers', p: 'Price nudges, QC holds, Factory Node offers and restock nudges fire automatically. A person sees a seller only after a fix has failed.', link: ['health', { stage: 'remedy' }], cta: 'The rulebook' },
  { k: '5 · GRADUATE', h: 'Earn working capital', p: '30 days at a score of 80 or more unlocks batch prepayment. The Day-30 readout decides whether the whole programme earns capex.', link: ['experiment'], cta: 'Day-30 readout' },
];

export default function Overview({ pti, summary, baseRun, cohort }) {
  const persona = cohort.find((s) => s.persona);
  const story = useMemo(() => {
    const check = priceCheck({
      unitCost: PERSONA.unitCost, category: PERSONA.category, typeId: PERSONA.type, mode: 'node',
      margin: ECONOMICS.targetMarginB2B, medians: pti.medians,
    });
    const brief = demandBrief({ typeId: PERSONA.type, marketMedian: check.marketMedian });
    const batch = batchPlan({ brief, listingPrice: check.suggested, minViablePrice: check.floor });
    return { check, brief, batch };
  }, [pti]);
  const grant = persona.events.find((e) => e.rule === 'grant');
  const { check, brief, batch } = story;

  const questions = [
    ['Which manufacturers have a genuine price advantage, and which don’t despite scale?', 'Price Truth Index', 'pti', `${pti.counts.ready} of ${pti.counts.screened} large sellers pass; ${pti.top10NotReady} of the 10 largest do not.`],
    ['What stops reluctant manufacturers, and what changes their calculus?', 'Manufacturer app', 'maker', `A price check before listing, a pin-code Demand Brief, and batches made only against confirmed pre-orders.`],
    ['What makes early scale-up sustainable without subsidy or handholding?', 'Seller Health', 'health', `${summary.auto} automated actions against ${summary.manual} human escalations across the 60-seller pilot.`],
    ['What should Meesho measure, and when should it intervene?', 'Health Score + Day-30 rule', 'experiment', `Five-signal daily score, nine rules with thresholds, and a fund / tighten / stop rule at day 30.`],
  ];

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <div className="eyebrow" style={{ color: '#f7c08a' }}>Scale is the wrong screen</div>
          <h2 style={{ marginTop: 8 }}>Find the manufacturers whose scale became price. Then keep them growing without an account manager.</h2>
          <p>
            This is a working prototype of the Round 1 plan. It screens sellers on what buyers actually paid, reads a
            matched Day-30 experiment, scores a 60-seller pilot every day, and shows the manufacturer-side app that turns
            an offline B2B factory into a C2M seller. Every number on this page is computed live from the model.
          </p>
          <div className="row" style={{ marginTop: 16 }}>
            <a className="btn primary" href={href('pti')} style={{ textDecoration: 'none', background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--plum)' }}>Start with the Price Truth Index →</a>
            <a className="btn" href={href('maker')} style={{ textDecoration: 'none', background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}>Open the manufacturer app</a>
          </div>
        </div>
        <div className="kpis">
          <div className="kpi"><div className="v">{pti.counts.ready} / {pti.counts.screened}</div><div className="l">large sellers pass the price gate</div></div>
          <div className="kpi"><div className="v">{pti.top10NotReady} of 10</div><div className="l">largest sellers carry no real price edge</div></div>
          <div className="kpi"><div className="v">{signedPct(baseRun.lift)}</div><div className="l">Day-30 NMV per SKU vs matched holdout</div></div>
          <div className="kpi"><div className="v">{summary.auto} : {summary.manual}</div><div className="l">automated vs human actions, 60-seller pilot</div></div>
        </div>
      </section>

      <Card title="The loop the prototype runs" sub="Round 1 mechanism: five automated steps, no account manager in the loop">
        <div className="loop">
          {LOOP.map((s) => (
            <div className="loop-step" key={s.k}>
              <div className="k">{s.k}</div>
              <h4>{s.h}</h4>
              <p>{s.p}</p>
              <a href={href(...s.link)}>{s.cta} →</a>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid cols-2">
        <Card title={`Follow one manufacturer: ${PERSONA.name}`} sub={`${PERSONA.cluster} · men’s cotton briefs · offline B2B, ₹${PERSONA.offlineTurnoverCr} cr turnover · Cohort A (fictional)`}>
          <ol className="story">
            <li>
              <div><div className="t">Price check before listing</div><div className="d">At a ₹{PERSONA.unitCost} making cost, the lowest price at a 9% margin is {rupees(check.floor)}, which is {pct(check.gap)} under the {rupees(check.marketMedian)} market median. Qualifies before a single listing goes live.</div></div>
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

        <Card title="Where each question in the brief is answered" sub="The four questions the case asks, and the screen that answers each one">
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
