import { CATEGORIES, ECONOMICS, EXPERIMENT, GATE, HEALTH, SEED, TRIGGERS } from '../config.js';
import { Card, Chip } from '../components/ui.jsx';
import { href } from '../lib/router.js';
import { crore, num, pct } from '../lib/format.js';
import { gateReleases } from '../lib/factoryDirect.js';

const feeds = [
  ['Catalogue', 'seller ID, product type, live SKU, landed buyer price', 'Daily price comparison and catalogue gate'],
  ['Orders', 'delivered orders, NMV, RTO, quality return reason', 'Comparable-set median, demand brief, experiment and quality checks'],
  ['Operations', 'dispatch time, promised SLA, in-stock status', 'Daily health score and automated remedies'],
  ['Exposure', 'impressions by category, SKU and pin-code', 'Starter allocation, grant and 20% category cap'],
  ['Factory Node', 'inbound batches, Valmo pick/pack scans, return grades', 'Dispatch SLA, returns ending at the node, node utilisation'],
];

const ENGINE = [
  ['1 · QUALIFY', 'Price Truth Index', 'delivered orders · live SKU prices', 'badged SKUs ≤ 0.92 × median, weekly', 'pti'],
  ['2 · ALLOCATE', 'Demand Brief', 'search · orders · returns by pin-code', 'sell-through within ±15% of the brief', 'maker'],
  ['3 · MAKE', 'Prepaid batch', 'pre-order checkouts · UPI · NBFC rails', 'repeat batch within 30 days', 'buyer'],
  ['4 · SHIP', 'Factory Node', 'Valmo scans · return grades at node', 'node utilisation ≥ 70%', 'maker'],
  ['5 · KEEP', 'Health Score', '5 signals, recomputed daily', '≤ 5 escalations per 100 · days to recover', 'health'],
];
const KIT = [
  ['Built once, national', ['Price Truth Index', 'Demand Brief', 'Health Score + rulebook', 'WhatsApp + voice agents']],
  ['Added per cluster', ['1 association MoU + camps', '1 partner node (3PL)', 'Local returns grading', 'Valmo lane to the node']],
  ['Added per factory', ['No manual step', 'Self-serve price check', 'WhatsApp brief, 1-tap commit', 'Rules, not a manager']],
];

export default function Method({ market, pti, summary }) {
  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <div className="eyebrow">KPIs, scalability and the road map</div>
          <h2>One weekly loop runs every factory the same way</h2>
          <p className="lede">The Price Truth Index picks who, the Demand Brief says what to make, the node ships it, the Health Score keeps them. Rules and data, not subsidy or people, so cost per seller falls as volume grows.</p>
        </div>
        <Chip tone="brand">Synthetic prototype</Chip>
      </div>

      <Card title="The scale-up engine" sub="Five automated steps: what runs, the data it uses, and the KPI at each. Every order, review and return feeds next week’s medians, briefs and scores.">
        <div className="engine">
          {ENGINE.map(([k, name, data, kpi, path]) => (
            <div className="engine-step" key={k}>
              <div className="k">{k}</div>
              <b>{name}</b>
              <div className="ink2">Data: {data}</div>
              <div className="kpi">KPI: {kpi}</div>
              <a href={href(path)}>Open →</a>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid cols-2">
        <Card title="How it scales: copy the cluster kit, not the people" sub="At 1,400 factories: about 2 reviewers and no stock on Meesho’s books">
          <div className="table-wrap" style={{ maxHeight: 'none' }}>
            <table>
              <thead><tr>{KIT.map(([h]) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{[0, 1, 2, 3].map((i) => <tr key={i}>{KIT.map(([h, items]) => <td key={h}>{items[i]}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </Card>
        <Card title="Why the other ways to scale fail" sub="What each one’s cost grows with">
          <table>
            <tbody>
              <tr><td>Order subsidies</td><td className="ink2">every order; growth stops when the money stops</td><td>✕</td></tr>
              <tr><td>Account managers</td><td className="ink2">headcount: about 70 managers at 1,400 factories</td><td>✕</td></tr>
              <tr><td>Platform buys stock</td><td className="ink2">inventory on books; barred for FDI marketplaces</td><td>✕</td></tr>
              <tr><td>Onboard by turnover</td><td className="ink2">seller size; 7 of the 10 largest fail the price gate</td><td>✕</td></tr>
              <tr><td><b>Factory Direct engine</b></td><td className="ink2">rules and data, capex per cluster</td><td>✓</td></tr>
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="The 90-day road map: three gates, money follows evidence" sub="Day 1 = Mon 2 Nov 2026. Nothing is spent until the Day-30 readout says fund.">
        <div className="gates">
          <div className="gate">
            <div className="when">Days 1-30 · Prove the gap</div>
            <div>Price screen live, badge test against a matched holdout, groundwork with no spend.</div>
            <div className="pass"><b>Day 30 gate · 1 Dec:</b> badge lift ≥ {pct(EXPERIMENT.fundLift)} (interval above zero) and ≥ {pct(EXPERIMENT.retentionFloor)} still clear at D14. Fail: tighten the gap, or stop.</div>
            <div className="money">→ release {crore(gateReleases().d90)}</div>
            <a href={href('experiment')}>Day-30 readout →</a>
          </div>
          <div className="gate">
            <div className="when">Days 31-60 · Sign partners</div>
            <div>Sign the cluster associations, catalogue 60 factories, Demand Brief live, NBFC and rules in place.</div>
            <div className="pass"><b>Day 60 gate · 31 Dec:</b> partners signed in 2 clusters · 60 factories catalogued · briefs live in 5 categories · NBFC signed. Fail: hold node spend.</div>
            <div className="money">→ keep funding</div>
          </div>
          <div className="gate">
            <div className="when">Days 61-90 · Ship batches</div>
            <div>Node live, pre-orders turn into batches, 60 factories live, Day-90 readout.</div>
            <div className="pass"><b>Day 90 gate · 30 Jan:</b> 3 of 4: batches in SLA · returns end at the node · retention ≥ 70% · category NMV ≥ base.</div>
            <div className="money">→ release {crore(gateReleases().rest)} · Year-1 cap {crore(gateReleases().y1)}</div>
            <a href={href('business')}>Finance analysis →</a>
          </div>
        </div>
      </Card>

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
            <li><div><div className="t">Read five health signals</div><div className="d">Combine price retention, order pace, returns, dispatch SLA and stock. Run the rulebook daily and log every action with its reason.</div></div></li>
            <li><div><div className="t">Review the experiment</div><div className="d">Compare badged and holdout sellers on NMV per live SKU after 28 days, with a seller-level uncertainty interval and a D14 price-retention check.</div></div></li>
          </ol>
        </Card>
        <Card title="What the prototype does not do" sub="Simulations, not live actions">
          <div className="note-box">The prototype does not connect to Meesho systems, send WhatsApp messages, create purchase orders or release payments. Those screens show the proposed process and its rules.</div>
        </Card>
      </div>
    </div>
  );
}
