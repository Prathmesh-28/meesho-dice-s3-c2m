import { CATEGORIES, ECONOMICS, EXPERIMENT, GATE, HEALTH, SEED, TRIGGERS } from '../config.js';
import { Card, Chip } from '../components/ui.jsx';
import { num, pct } from '../lib/format.js';

const feeds = [
  ['Catalogue', 'seller ID, product type, live SKU, landed buyer price', 'Daily price comparison and catalogue gate'],
  ['Orders', 'delivered orders, NMV, RTO, quality return reason', 'Comparable-set median, demand brief, experiment and quality checks'],
  ['Operations', 'dispatch time, promised SLA, in-stock status', 'Daily health score and automated remedies'],
  ['Exposure', 'impressions by category, SKU and pin-code', 'Starter allocation, grant and 20% category cap'],
];

const rollout = [
  ['Days 0–30', 'Run the price gate on existing sellers, recruit Tiruppur and Panipat factories, and randomise the badge test. Hold out half of C2M-ready sellers.'],
  ['Day 30 gate', `Fund only when NMV per live SKU lift is at least ${pct(EXPERIMENT.fundLift)}, the interval is above zero, and at least ${pct(EXPERIMENT.retentionFloor)} retain their price gap at D14.`],
  ['Days 31–60', `If the gate passes, onboard ${HEALTH.cohortSize} manufacturers. Send weekly demand briefs and run daily health rules. Measure fulfilment and return rates by category.`],
  ['Days 61–90', 'Offer Factory Node operations and batch prepayment to graduates; expand clusters only if incremental NMV and seller economics remain positive.'],
];

export default function Method({ market, pti, summary }) {
  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <div className="eyebrow">Implementation and evidence</div>
          <h2>How Meesho would run it</h2>
          <p className="lede">A decision model over catalogue, orders, operations and exposure data. This build uses generated data so the full workflow can be demonstrated without Meesho access.</p>
        </div>
        <Chip tone="brand">Synthetic prototype</Chip>
      </div>

      <div className="grid cols-3">
        <Card title="What runs now" sub="Computed in the browser">
          <p>{num(market.sellers.length)} sellers and {num(market.sellers.reduce((n, s) => n + s.skus.length, 0))} generated SKUs across {CATEGORIES.length} categories. {pti.counts.ready} sellers pass the live price gate. A separate {HEALTH.cohortSize}-seller pilot runs daily health rules and has {summary.auto} automatic actions.</p>
        </Card>
        <Card title="What needs validation" sub="Before a production pilot">
          <p>Product comparability, category return rates, logistics charges, settlement terms, price response, and the actual capacity and cost of Factory Nodes all need Meesho data or supplier quotes.</p>
        </Card>
        <Card title="What is assumed" sub="Editable in src/config.js">
          <p>Seed {SEED}; ₹{GATE.minGmvCr} cr GMV screen; {pct(GATE.deltaThreshold)} SKU price gap; {pct(GATE.skuShare)} catalogue share; {pct(ECONOMICS.prepaymentShare)} batch prepayment; {num(TRIGGERS.grantImpressions)} impression grant. These are proposal thresholds, not observed platform facts.</p>
        </Card>
      </div>

      <Card title="Minimum data contract" sub="The tables and fields needed to replace generated inputs">
        <div className="table-wrap" style={{ maxHeight: 'none' }}>
          <table>
            <thead><tr><th>Feed</th><th>Fields needed</th><th>Used for</th></tr></thead>
            <tbody>{feeds.map(([feed, fields, purpose]) => <tr key={feed}><td className="strong">{feed}</td><td>{fields}</td><td className="ink2">{purpose}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>

      <div className="grid cols-2">
        <Card title="Daily job" sub="One batch run plus event-driven actions">
          <ol className="story">
            <li><div><div className="t">Build comparable price sets</div><div className="d">Group truly comparable products and compute an order-weighted landed-price median. Exclude a seller's own orders when it dominates the set.</div></div></li>
            <li><div><div className="t">Score the whole catalogue</div><div className="d">Count the share of live SKUs at least {pct(GATE.deltaThreshold)} below that median. Only sellers above the GMV screen and {pct(GATE.skuShare)} clearing share enter the badge test.</div></div></li>
            <li><div><div className="t">Read five health signals</div><div className="d">Combine price retention, order pace, quality returns, dispatch SLA and stock. Run the rulebook daily and log every action with its reason.</div></div></li>
            <li><div><div className="t">Review the experiment</div><div className="d">Compare badged and holdout sellers on NMV per live SKU after 28 days, with a seller-level uncertainty interval and a D14 price-retention check.</div></div></li>
          </ol>
        </Card>
        <Card title="90-day pilot sequence" sub="Capital follows measured demand">
          <div className="table-wrap" style={{ maxHeight: 'none' }}>
            <table><tbody>{rollout.map(([when, action]) => <tr key={when}><td className="strong" style={{ whiteSpace: 'nowrap' }}>{when}</td><td>{action}</td></tr>)}</tbody></table>
          </div>
          <div className="note-box mt">The prototype does not connect to Meesho systems, send WhatsApp messages, create purchase orders or release payments. Those screens show the proposed process and its rules.</div>
        </Card>
      </div>
    </div>
  );
}
