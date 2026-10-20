import { useMemo, useState } from 'react';
import { EXPERIMENT, FD, OPS, PERSONA, TEARDOWN } from '../config.js';
import { personaFlow } from '../lib/flow.js';
import {
  KPIS, addDays, advanceTiming, avgTransit, batchDates, batchWeeks, cadenceLabel, categoryCheck, daysBetween, fmtDate,
  fmtDay, fmtRange, nextCutoff, nodeCapacity, nodeFlow, promises, returnPolicies, sizing, splitBy,
} from '../lib/operations.js';
import { href, setParams } from '../lib/router.js';
import { crore, num, pct, rupees } from '../lib/format.js';
import { Card, Chip, Seg, Stat, waText } from '../components/ui.jsx';

const TABS = [
  { id: 'week', label: '1 · The week' },
  { id: 'stock', label: '2 · Node stock' },
  { id: 'exceptions', label: '3 · When it goes wrong' },
  { id: 'paperwork', label: '4 · Paperwork & roles' },
  { id: 'scale', label: '5 · At scale' },
];
const r1 = (x) => `₹${x.toFixed(1)}`;
const weekday = (d) => d.toLocaleDateString('en-IN', { weekday: 'long' });

export default function Operations({ pti, params }) {
  const tab = TABS.some((t) => t.id === params.tab) ? params.tab : 'week';
  const goTab = (id) => setParams({ tab: id === 'week' ? null : id });
  const f = useMemo(() => personaFlow(pti), [pti]);
  const today = useMemo(() => new Date(), []);
  const { check, table, brief, rates, plan, week } = f;
  const dates = batchDates(nextCutoff(today, plan.cutoffs));
  const adv = advanceTiming({ preOrders: week.preOrders, price: week.preorderPrice, make: week.make, transit: avgTransit(brief.rows) });
  const flow = nodeFlow({ plan, rates });
  const topUp = Math.round(flow.topUp);
  const truckPacks = week.make + topUp;
  const prom = promises({ rows: brief.rows, plan, today });
  const patna = prom.find((p) => p.district === 'Patna') ?? prom[0];
  const policies = useMemo(() => returnPolicies(), []);
  const opened = policies.find((p) => p.id === 'opened');
  const capBase = useMemo(() => nodeCapacity(), []);
  const y4 = capBase.exits.at(-1);
  const ctx = { f, today, dates, adv, flow, topUp, truckPacks, prom, policies, capBase };

  const QA = [
    ['When does the factory cut fabric?', 'week',
      `${fmtDay(dates.advance)} morning, after ${weekday(dates.cutoff)}’s 11:59 pm cut-off locks the week’s ${num(week.preOrders)} pre-orders. The 20% advance (${rupees(adv.atCutoff)}) lands that morning, so the fabric is paid for before it is cut.`],
    [`How long until a buyer in ${patna.district} gets the parcel?`, 'week',
      `The node ships every ${weekday(dates.ship)}, ${plan.wait.min}-${plan.wait.max} days after the order (${plan.wait.avg.toFixed(0)} on average). ${patna.district} is ${patna.zone.days[0]}-${patna.zone.days[1]} days by road from Tiruppur: ${patna.windowDoor[0]}-${patna.windowDoor[1]} days door to door, shown before payment.`],
    ['Who owns, insures and sells the leftover stock at the node?', 'stock',
      `The factory owns it; the node partner insures it in custody, Valmo in transit. It sells as “ships in ${OPS.nodeShipDays} days” at ${rupees(check.gatePrice)}, cash on delivery allowed: this week’s ${num(flow.fromBatchFit)} packs fit to sell go in about ${Math.round(flow.coverDays)} days.`],
    ['What happens to prepaid buyers if a batch fails QC?', 'exceptions',
      `QC samples ${OPS.qcSample.n} packs at the factory before the truck. A failed lot gets ${OPS.reworkHours} hours of rework, and buyers see the new date and ₹${OPS.lateCredit} back. If it fails again, all ${num(week.preOrders)} are refunded from escrow within 24 hours.`],
    ['Isn’t topping up the node “control of inventory”?', 'stock',
      `No. Meesho suggests the top-up (${num(topUp)} packs this week); the factory approves it with one tap, owns the stock and can recall it on any truck. Press Note 2 allows marketplace warehousing; it bars owning or controlling stock.`],
    ['How does a 1,000-pack batch fill in 3 days?', 'week',
      `It doesn’t. At a ${pct(plan.share)} share Kavin gets ${num(plan.preDay)} pre-orders a day, so 1,000 takes ${plan.fill1000.toFixed(0)} days; 3 days would need ${pct(plan.shareFor(1000, 3))} of demand. Batches are weekly: ${num(week.preOrders)} + 15% = ${num(week.make)}. The deck’s 1,000 is his week at a ${pct(plan.shareFor(1000, 7), 1)} share.`],
    ['Can you resell returned innerwear?', 'exceptions',
      `Only sealed packs, so briefs are listed with sealed-pack returns. If opened returns couldn’t be resold, the prepaid batch would still clear the badge (${rupees(opened.cols[3].floor)}); the node route would not (${rupees(opened.cols[2].floor)} against the ${rupees(check.gatePrice)} gate).`],
    [`Can one node handle ${num(Math.round(y4.perNode / 1000) * 1000)} orders a day?`, 'scale',
      `Not on one ₹${FD.nodeCost} cr site. The Year-4 exit is ${num(y4.perDay)} orders a day, ${num(y4.perNode)} per cluster: about ${Math.ceil(y4.perNode / OPS.siteCapacity)} partner sites each. ${capBase.sites.at(-1)} sites by Year 5 add ${crore(capBase.extraCost)} of set-up; NPV is still ${crore(capBase.withSites.npv)}.`],
  ];

  return (
    <div className="stack">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">Module 6 · Batch operations</div>
          <h2>From pre-order to payout: the week, the stock, the paperwork, and who pays when it goes wrong</h2>
          <p className="lede">
            Everything between “buyer pays” and “factory gets paid”, for {PERSONA.name}’s weekly batch: when fabric is cut, when each
            district gets its parcel, what a batch leaves at the node and who sells it, and the rule for every exception. These are
            operating rules we propose beyond the deck’s costed case; every ₹ per pack still comes from the same model.
          </p>
        </div>
      </div>

      <Card title="Eight questions a logistics reviewer asks, answered with this week’s numbers" sub="Each answer is computed live; open the tab to see the working.">
        <div className="qa-grid">
          {QA.map(([q, t, a], i) => (
            <div className="qa" key={q}>
              <div className="qa-n">{i + 1}</div>
              <b>{q}</b>
              <p>{a}</p>
              <button type="button" className="btn ghost" onClick={() => goTab(t)}>{TABS.find((x) => x.id === t).label.split(' · ')[1]} →</button>
            </div>
          ))}
        </div>
      </Card>

      <div className="row between ops-tabs">
        <Seg label="Section" value={tab} onChange={goTab} options={TABS.map((t) => ({ value: t.id, label: t.label }))} />
        <Chip tone="brand">Proposed rules · assumptions in config.js (OPS)</Chip>
      </div>

      {tab === 'week' && <WeekTab {...ctx} />}
      {tab === 'stock' && <StockTab {...ctx} />}
      {tab === 'exceptions' && <ExceptionsTab {...ctx} />}
      {tab === 'paperwork' && <PaperworkTab {...ctx} />}
      {tab === 'scale' && <ScaleTab {...ctx} pti={pti} />}
    </div>
  );
}

// ---------------------------------------------------------------- 1 · the week
function WeekTab({ f, today, dates, adv, prom }) {
  const { plan, week, brief } = f;
  const [share, setShare] = useState(plan.share);
  const [accept, setAccept] = useState(plan.acceptance);
  const calc = sizing({ dailyDemand: plan.dailyDemand, share, acceptance: accept });
  const zones = [...new Map(prom.map((p) => [p.zone.id, p.zone])).values()].sort((a, b) => a.days[0] - b.days[0]);
  const lo = Math.min(...zones.map((z) => z.days[0]));
  const hi = Math.max(...zones.map((z) => z.days[1]));
  const lead = plan.lead;
  const from = -6, to = lead + hi + OPS.settleDays;
  const n = to - from + 1;
  const days = Array.from({ length: n }, (_, i) => addDays(dates.cutoff, from + i));
  const todayAt = daysBetween(dates.cutoff, today) - from;
  const rows = [
    { label: 'Pre-orders for this batch', sub: `${num(plan.preDay)} a day, open all week`, tone: 'pre', segs: [[-6, 7, `${num(week.preOrders)} pre-orders`]] },
    { label: 'Cut-off, 11:59 pm', sub: `batch locked at ${num(week.make)}`, tone: 'lock', segs: [[0, 1, 'Lock']] },
    { label: 'NBFC advance', sub: `20% ${rupees(adv.atCutoff)} · 10% ${rupees(adv.atHandover)}`, tone: 'cash', segs: [[1, 1, '20%'], [lead, 1, '10%']] },
    { label: 'Make at the factory', sub: `cut, stitch, pack · QC sample of ${OPS.qcSample.n}`, tone: 'make', segs: [[1, OPS.makeDays, 'Cut · stitch · pack, QC']] },
    { label: 'Truck to the node', sub: 'challan, e-way bill, shipping notice', tone: 'move', segs: [[OPS.makeDays, 1, 'Truck']] },
    { label: 'Node counts and ships', sub: `goods receipt within ${OPS.grnHours} hours`, tone: 'node', segs: [[lead, 1, 'Ship']] },
    ...zones.map((z) => ({
      label: `Delivered · ${z.label}`, sub: prom.filter((p) => p.zone.id === z.id).map((p) => p.district).slice(0, 3).join(', '),
      tone: 'deliver', segs: [[lead + z.days[0], z.days[1] - z.days[0] + 1, `${z.days[0]}-${z.days[1]} days`]],
    })),
    { label: 'Balance paid', sub: `${OPS.settleDays} days after each delivery`, tone: 'cash', segs: [[lead + lo + OPS.settleDays, hi - lo + 1, 'Payouts']] },
    { label: 'Next batch’s pre-orders', sub: `next cut-off ${fmtDay(addDays(dates.cutoff, 7))}`, tone: 'pre next', segs: [[1, 7, 'Next batch']] },
  ];
  const sizes = splitBy(week.make, brief.split);
  const colours = {};
  brief.rows.forEach((r) => { const c = r.variants[1]?.split(': ')[1]; if (c) colours[c] = (colours[c] ?? 0) + r.weekly; });
  const topColour = Object.entries(colours).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'one colour';
  const maxSize = Math.max(...sizes.map((s) => s.units));

  return (
    <>
      <div className="stats">
        <Stat label="Pre-orders a day" value={num(plan.preDay)} note={`${pct(plan.share)} of ${num(plan.dailyDemand)} orders a day in 12 districts, half prepaid`} />
        <Stat hero label="This week’s batch" value={num(week.make)} note={`${num(week.preOrders)} pre-orders + 15% · minimum run ${OPS.minRun} ✓`} />
        <Stat label="Cut-off" value={fmtDay(dates.cutoff)} note={`11:59 pm · ${cadenceLabel(plan)}`} />
        <Stat label="Node ships" value={fmtDay(dates.ship)} note={`${plan.wait.min}-${plan.wait.max} days after the order, ${plan.wait.avg.toFixed(0)} on average`} />
        <Stat label="Cash back" value={`~${Math.round(adv.cashDays)} days`} note="from cutting fabric, weighted by rupee (distributor: 50)" />
      </div>

      <Card title="The batch, day by day" sub={`${PERSONA.name}: this week’s batch, from the first pre-order to the last payout. Today is marked.`}>
        <div className="gantt-wrap">
          <div className="gantt" style={{ '--n': n }}>
            <div className="g-row g-head">
              <div className="g-l" />
              <div className="g-track">
                {days.map((d, i) => (
                  <span key={i} className={`g-day${i === todayAt ? ' today' : ''}`} style={{ left: `${(i / n) * 100}%`, width: `${100 / n}%` }}>
                    {d.toLocaleDateString('en-IN', { weekday: 'narrow' })}<br />{d.getDate()}
                  </span>
                ))}
              </div>
            </div>
            {rows.map((r) => (
              <div className="g-row" key={r.label}>
                <div className="g-l"><b>{r.label}</b><span>{r.sub}</span></div>
                <div className="g-track">
                  {todayAt >= 0 && todayAt < n && <span className="g-now" style={{ left: `${((todayAt + 0.5) / n) * 100}%` }} />}
                  {r.segs.map(([s, len, text]) => (
                    <span key={s} className={`g-bar ${r.tone}`} title={text} style={{ left: `${((s - from) / n) * 100}%`, width: `${(len / n) * 100}%` }}>{text}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="small muted mt">
          Pre-orders stay open all week. Orders placed after a cut-off join the next batch, so the earliest buyer of a batch waits {plan.wait.max} days
          for the node to ship and the last waits {plan.wait.min}. Transit is surface, from the Tiruppur node (assumption, to confirm with Valmo lane data).
        </p>
      </Card>

      <div className="grid cols-2">
        <Card title="How big a batch, and how often" sub="Sized from demand, not from a target. Drag to test.">
          <div className="slider">
            <div className="row between"><b>Kavin’s share of these districts’ demand</b><span className="ink2">{pct(share, 1)}</span></div>
            <input type="range" min={0.02} max={0.25} step={0.002} value={share} aria-label="Share of demand" onChange={(e) => setShare(Number(e.target.value))} />
          </div>
          <div className="slider">
            <div className="row between"><b>Buyers who prepay a pre-order</b><span className="ink2">{pct(accept)}</span></div>
            <input type="range" min={0.2} max={0.8} step={0.05} value={accept} aria-label="Pre-order acceptance" onChange={(e) => setAccept(Number(e.target.value))} />
          </div>
          <div className="kv">
            <div>Orders a day for the factory</div><div><b>{num(calc.perDay)}</b> ({pct(share, 1)} of {num(calc.dailyDemand)})</div>
            <div>Pre-orders a day</div><div><b>{num(calc.preDay)}</b>; node-stock orders {num(calc.nodeDay)}</div>
            <div>Cut-offs</div><div><b>{cadenceLabel(calc)}</b></div>
            <div>Pre-orders per batch</div><div><b>{num(calc.preOrders)}</b></div>
            <div>Make</div>
            <div>
              <b>{num(calc.make)}</b>{' '}
              {calc.clearsMinRun ? <Chip tone="good">above the {OPS.minRun} minimum</Chip> : <Chip tone="warning">+{num(calc.toNode)} for node stock to reach {OPS.minRun}</Chip>}
              {!calc.toNodeFits && <div className="small" style={{ color: 'var(--critical)' }}>More than a week of node orders: pool with a second factory or accept a smaller run.</div>}
            </div>
            <div>Node ships after the order</div><div><b>{calc.wait.min}-{calc.wait.max} days</b>, {calc.wait.avg.toFixed(1)} on average</div>
            <div>1,000 pre-orders take</div><div><b>{calc.fill1000.toFixed(1)} days</b></div>
          </div>
          <div className="note-box mt">
            1,000 in 3 days needs <b>{pct(calc.shareFor(1000, 3), 1)}</b> of these districts’ demand: more than the {pct(EXPERIMENT.impressionCap)} of a
            category’s impressions that all badged factories share. 1,000 a week needs <b>{pct(calc.shareFor(1000, 7), 1)}</b>, about twice a new
            factory’s share. The deck’s 1,000-pack batch is that later week; Kavin starts at {num(week.make)}.
          </div>
          <button className="btn mt" type="button" onClick={() => { setShare(plan.share); setAccept(plan.acceptance); }}>Reset to Kavin’s week</button>
        </Card>

        <div className="stack">
          <Card title="The advance arrives before the fabric is cut" sub={`This week: ${num(week.preOrders)} pre-orders × ${rupees(week.preorderPrice)} = ${rupees(adv.value)}`}>
            <div className="table-wrap" style={{ maxHeight: 'none' }}><table>
              <thead><tr><th /><th className="num">Deck: 30% at handover</th><th className="num">Proposed: 20% + 10%</th></tr></thead>
              <tbody>
                <tr><td>{fmtDay(dates.advance)} · cut-off locks the batch</td><td className="num">—</td><td className="num good-ink">+{rupees(adv.atCutoff)}</td></tr>
                <tr><td>{fmtDate(dates.advance)}–{fmtDate(dates.truck)} · fabric, wages, packing ({num(week.make)} × ₹{FD.makingCost})</td><td className="num">−{rupees(adv.cost)}</td><td className="num">−{rupees(adv.cost)}</td></tr>
                <tr><td>{fmtDay(dates.ship)} · node counts the truck</td><td className="num good-ink">+{rupees(adv.total)}</td><td className="num good-ink">+{rupees(adv.atHandover)}</td></tr>
                <tr className="total"><td><b>Kavin’s own money in the batch at its peak</b></td><td className="num"><b>{rupees(adv.deckPeak)}</b></td><td className="num"><b>{rupees(adv.proposedPeak)}</b></td></tr>
              </tbody>
            </table></div>
            <p className="small ink2 mt">
              The NBFC lends against paid pre-orders held in escrow, so it can pay at the cut-off. If a batch fails, buyers are refunded from
              escrow and the factory repays the advance from later payouts; Meesho’s {pct(FD.firstLoss)} first-loss covers a default.
            </p>
          </Card>
          <Card title="One dye lot, five sizes" sub={`This week’s ${num(week.make)} packs by size, from the brief’s mix`}>
            {sizes.map((s) => (
              <div key={s.value} className="row" style={{ gap: 8, fontSize: 12.5, margin: '4px 0' }}>
                <span style={{ width: 40 }}>{s.value}</span>
                <div className="progress" style={{ flex: 1, height: 8 }}><div className="a" style={{ width: `${(s.units / maxSize) * 100}%` }} /></div>
                <span style={{ width: 44, textAlign: 'right', fontWeight: 600 }}>{num(s.units)}</span>
              </div>
            ))}
            <p className="small ink2 mt">
              Sizes are cut from the same fabric lot, so {num(week.make)} packs are one run, not five. Colours need their own dye lots: first
              batches use one colour mix ({topColour.toLowerCase()}, the brief’s most-asked) and add a second once a week passes 1,000.
            </p>
          </Card>
        </div>
      </div>

      <Card title="What each district is promised" sub={`For an order placed today (${fmtDay(today)}); the buyer sees this date before paying`}>
        <div className="table-wrap" style={{ maxHeight: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>District</th><th>Zone from Tiruppur</th><th className="num">Transit</th><th className="num">Node ships</th>
                <th className="num">Pre-order arrives</th><th className="num">Door to door, any day of the window</th>
                <th className="num">Node stock arrives</th><th className="num">Kavin’s pre-orders a week</th>
              </tr>
            </thead>
            <tbody>
              {prom.map((p) => (
                <tr key={p.district} className={p.district === 'Patna' ? 'hl' : ''}>
                  <td><b>{p.district}</b> <span className="muted">{p.state}</span></td>
                  <td>{p.zone.label}</td>
                  <td className="num">{p.zone.days[0]}-{p.zone.days[1]} days</td>
                  <td className="num">{fmtDay(p.ship)}</td>
                  <td className="num"><b>{fmtRange(...p.arrive)}</b></td>
                  <td className="num">{p.windowDoor[0]}-{p.windowDoor[1]} days</td>
                  <td className="num">{fmtRange(...p.nodeArrive)}</td>
                  <td className="num">{num(p.weeklyPre)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted mt">
          Year 1 serves every district from the cluster node, so the North-East waits longest. Year 2 adds forward stock of the top SKUs at a
          North or East node: node-stock buyers there get 1-2 days, and the weekly batch reaches them by one truck instead of parcel by parcel.
        </p>
      </Card>
    </>
  );
}

// ---------------------------------------------------------------- 2 · node stock
function StockTab({ f, dates, flow, topUp, truckPacks }) {
  const { check, table, brief, plan, week } = f;
  const [reply, setReply] = useState(null);
  const sizes = splitBy(topUp, brief.split);
  const sent = addDays(dates.truck, -1).toLocaleDateString('en-IN', { weekday: 'short' });
  const nodeFloor = table[2].floor;
  const withStorage = nodeFloor + flow.storagePerPack / (1 - FD.margin);
  const msg = [
    `📦 *Node stock* · ${num(flow.safety)} packs left, about ${OPS.safetyDays} days`,
    `Suggested top-up on ${fmtDay(dates.truck)}’s truck: *${num(topUp)} packs*`,
    sizes.map((s) => `${s.value} ${s.units}`).join(' · '),
    'You own this stock and can recall it on any truck.',
  ].join('\n');
  const answers = [
    `✅ ${num(topUp)} packs added to ${fmtDay(dates.truck)}’s truck: ${num(truckPacks)} packs, ${rupees(truckPacks * FD.makingCost)} at making cost. Meesho pre-fills the challan and e-way bill; you confirm them at loading.`,
    'Reply with the number of packs, for example 200. Nothing moves until you reply.',
    `Skipped. Node stock may run out around ${fmtDay(addDays(dates.ship, Math.floor((flow.safety + flow.fromBatchFit) / plan.nodeDay)))}; buyers then see only the pre-order.`,
  ];
  return (
    <>
      <div className="grid cols-main-side">
        <Card title="What a week leaves at the node, and who sells it" sub={`Kavin’s week at a ${pct(plan.share)} share, in packs`}>
          <div className="leftover">
            <div className="big">{num(flow.leftover)}</div>
            <div>
              <b>packs, {pct(flow.leftoverShare)} of the {num(week.make)} made, end up at the node</b>
              <div className="small ink2">{num(flow.weekBuffer)} buffer · {num(flow.failed)} failed deliveries · {num(flow.returns)} returns. {num(flow.fromBatchFit)} are fit to sell.</div>
            </div>
          </div>
          <p className="mt">
            They are not leftovers but stock. They list as <b>“ships in {OPS.nodeShipDays} days” at {rupees(check.gatePrice)}</b>, the gate price, cash on
            delivery allowed, for the half of Kavin’s buyers who won’t prepay or wait. Those buyers take {num(plan.nodeDay)} a day, so this week’s
            {' '}{num(flow.fromBatchFit)} sell in about {Math.round(flow.coverDays)} days. The node route clears the badge on its own ({rupees(nodeFloor)} floor).
          </p>
          <table className="mt">
            <thead><tr><th>Into node stock, one week</th><th className="num">Packs</th></tr></thead>
            <tbody>
              {flow.inflow.map((x) => <tr key={x.k}><td>{x.k}</td><td className="num">{num(x.v)}</td></tr>)}
              <tr className="hl"><td><b>Top-up from Kavin’s own stock, approved on WhatsApp</b></td><td className="num"><b>{num(topUp)}</b></td></tr>
              <tr className="total"><td><b>Node-stock orders shipped ({num(plan.nodeDay)} a day)</b></td><td className="num"><b>{num(flow.nodeOrders)}</b></td></tr>
            </tbody>
          </table>
          <p className="small muted mt">
            The first truck carries an opening stock of {num(flow.opening)} packs (a week of node orders plus {OPS.safetyDays} days’ safety). Before
            each truck the node is down to its safety stock ({num(flow.safety)}). This week’s truck: {num(week.make)} batch + {num(topUp)} top-up = {num(truckPacks)} packs.
          </p>
        </Card>

        <Card title="Meesho suggests, the factory approves" sub="The top-up, as the owner sees it on WhatsApp">
          <div className="wa wa-card">
            <div className="wa-bubble">{waText(msg)}<span className="time">{sent} 6:10 PM</span></div>
            {reply === null ? (
              <div className="wa-quick">
                {['1 · Approve top-up', '2 · Change quantity', '3 · Skip this week'].map((q, i) => <button key={q} type="button" onClick={() => setReply(i)}>{q}</button>)}
              </div>
            ) : (
              <>
                <div className="wa-reply">{reply + 1}</div>
                <div className="wa-bubble">{answers[reply]}<span className="time">{sent} 6:11 PM</span></div>
                <button className="btn" type="button" onClick={() => setReply(null)}>Reset</button>
              </>
            )}
          </div>
          <p className="small ink2 mt">
            Press Note 2 lets a marketplace offer sellers warehousing and fulfilment; it bars owning or controlling their stock. So the factory
            owns every pack, approves every top-up, sets its price within the badge rules, and can recall stock on the next truck.
          </p>
        </Card>
      </div>

      <div className="grid cols-3">
        <Card title="Who owns and insures it">
          <ul className="rule-list">
            <li>✓ <b>The factory owns every pack.</b> Title never passes to Meesho or the node partner.</li>
            <li>✓ <b>At the node:</b> the node partner’s goods-in-custody insurance. <b>On the road:</b> the transporter’s cover to the node, Valmo’s to the buyer.</li>
            <li>✓ <b>Every truck is counted within {OPS.grnHours} hours.</b> The signed goods receipt decides who is liable for what.</li>
            <li>✓ <b>Shrinkage:</b> losses above {OPS.shrinkTolerance * 100}% a quarter are paid by the node partner at making cost (₹{FD.makingCost}).</li>
          </ul>
        </Card>
        <Card title="Storage and ageing">
          <ul className="rule-list">
            <li>✓ <b>₹{OPS.storagePerMonth} a pack a month</b> (assumption: about ₹600 for a pallet of 600), billed to the factory through its payout.</li>
            <li>✓ At a {flow.dwell.toFixed(1)}-day average stay that is <b>{(flow.storagePerPack * 100).toFixed(0)} paise a pack</b>: the node floor moves from {r1(nodeFloor)} to {r1(withStorage)}, still under the {r1(check.gatePrice)} gate.</li>
            <li>✓ <b>First in, first out.</b> At {OPS.ageing.markdownDay} days a pack is marked down to the pre-order price ({rupees(week.preorderPrice)}, above its {rupees(table[2].cost)} cost); at {OPS.ageing.returnDay} days it goes back to the factory on the truck’s return leg, for its B2B trade. Nothing is destroyed.</li>
          </ul>
        </Card>
        <Card title="Who packs what">
          <ul className="rule-list">
            <li>✓ <b>The factory</b> sends retail-ready packs: sealed polybag, barcode, size and the Legal Metrology label, inside the ₹{FD.makingCost} making cost, as for its B2B retail packs.</li>
            <li>✓ <b>The node</b> adds only the shipping bag and label (₹6 of the ₹{FD.fees.nodeFee} node fee) and prints the tax invoice on the factory’s GSTIN.</li>
            <li>✓ <b>QC sampling moves to the factory</b>, before packs are sealed: opening sealed innerwear at the node would break the hygiene seal. The node checks counts and damage only.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- 3 · exceptions
function ExceptionsTab({ f, dates, adv, policies }) {
  const { check, week } = f;
  const [pick, setPick] = useState('qc');
  const [policy, setPolicy] = useState('opened');
  const credit = week.preOrders * OPS.lateCredit;
  const EXC = [
    { id: 'late', t: 'The truck misses its evening', who: 'Factory', steps: [
      [`${fmtDay(dates.truck)}, 9 pm`, `The node flags the missing truck; Meesho tells all ${num(week.preOrders)} buyers their new date at once.`],
      [fmtDay(dates.ship), 'The truck arrives; the node counts it and ships the same day.'],
      ['At delivery', `₹${OPS.lateCredit} back on every order: ${rupees(credit)} from the factory’s payout.`],
      [`${OPS.lateRefundDays}+ days late`, 'Every buyer is offered a one-tap full refund from escrow.'],
    ], buyer: `A new date at once, ₹${OPS.lateCredit} back, a full refund if it slips more than ${OPS.lateRefundDays} days.`, factory: 'Two late batches in four weeks pause pre-orders; node stock keeps selling.' },
    { id: 'qc', t: 'The lot fails QC at the factory', who: 'Factory', steps: [
      [fmtDay(dates.truck), `A QC partner samples ${OPS.qcSample.n} of the ${num(week.make)} packs (AQL 2.5): ${OPS.qcSample.accept + 1} or more defects fail the lot, and the truck waits.`],
      [`+${OPS.reworkHours} hours`, 'The factory checks every pack and fixes or replaces faulty ones; a new sample is drawn.'],
      ['It passes', `Ships 2 days late: buyers get the new date and ₹${OPS.lateCredit} back (${rupees(credit)}).`],
      ['It fails again', `The batch is cancelled: ${num(week.preOrders)} buyers get ${rupees(adv.value)} back from escrow within 24 hours.`],
    ], buyer: 'Never pays for a failed batch: the money stays in escrow until delivery.', factory: `Repays the ${rupees(adv.atCutoff)} advance from later payouts; the SKU is on QC hold, badge suspended, until a new lot passes. Meesho’s ${pct(FD.firstLoss)} first-loss sits behind the NBFC.` },
    { id: 'short', t: 'The node counts fewer packs than sent', who: 'Factory, or the transporter', steps: [
      [`Within ${OPS.grnHours} hours`, `The node counts the truck against the shipping notice and signs a discrepancy note with photos at the dock (say ${num(week.make - 4)} of ${num(week.make)}).`],
      ['Same day', 'Every pre-order still ships: the short packs come out of the factory’s node stock.'],
      ['Damaged on the road', 'Claimed on the transporter’s goods-in-transit cover.'],
    ], buyer: 'No change.', factory: 'Its node stock is that much lower; the signed note is the record.' },
    { id: 'nodeloss', t: 'Stock is lost or damaged at the node', who: 'Node partner', steps: [
      ['Every day', 'Cycle counts by factory and SKU against the warehouse system.'],
      ['Each quarter', `Losses above ${OPS.shrinkTolerance * 100}% of throughput are paid by the node partner at making cost (₹${FD.makingCost} a pack).`],
      ['Fire, flood or theft', 'The node partner’s goods-in-custody insurance pays the factory.'],
    ], buyer: 'Ships from other stock: no change.', factory: 'Paid for lost packs, with nothing to chase.' },
    { id: 'transit', t: 'A parcel is lost or late on the road', who: 'Valmo', steps: [
      ['Promise date passes', 'Valmo traces it; the buyer is told the new date.'],
      ['+2 days', 'Reshipped from node stock or refunded, as the buyer chooses.'],
      ['The lane missed its SLA', `Valmo pays the ₹${OPS.lateCredit} credit, not the factory.`],
    ], buyer: 'A replacement or a refund within 2 days.', factory: 'No cost: a lost pack is paid on Valmo’s transit cover.' },
    { id: 'cancel', t: 'A buyer cancels', who: 'No one', steps: [
      [`Until ${fmtDay(dates.cutoff)}, 11:59 pm`, 'Free: refunded to UPI at once; the money never left escrow.'],
      ['After the cut-off, before shipping', `Refunded within 24 hours; the pack joins node stock and sells at ${rupees(check.gatePrice)}.`],
      ['After shipping', 'Treated as a return or a refused delivery.'],
    ], buyer: 'A full refund.', factory: 'Nothing lost: the 15% buffer and node-stock orders absorb it.' },
    { id: 'cod', t: 'Cash on delivery is refused at the door', who: 'No one', steps: [
      ['At the door', 'Node-stock orders allow cash on delivery; a refused parcel goes back sealed.'],
      ['At the node', 'Counted back into the factory’s node stock and resold.'],
    ], buyer: 'Nothing to pay.', factory: `₹${FD.rtoFee} fee for a failed delivery, as costed; the pack resells.` },
    { id: 'afterpay', t: 'A return arrives after the payout', who: 'Factory', steps: [
      [`Day ${OPS.settleDays} after delivery`, 'The return window closes and the payout runs the same day, so normal returns are settled first.'],
      ['A later claim', 'Netted from the next week’s payout.'],
      ['The factory stopped shipping', `${pct(OPS.payoutHold)} of its last payout is held for 30 days.`],
    ], buyer: 'Refunded within 3 days of pick-up.', factory: 'No reserve on a factory that ships every week.' },
  ];
  const e = EXC.find((x) => x.id === pick);
  const p = policies.find((x) => x.id === policy);
  const deck = policies.find((x) => x.id === 'deck');
  const opened = policies.find((x) => x.id === 'opened');
  const extra = opened.cols[2].cost - deck.cols[2].cost;
  return (
    <>
      <div className="grid cols-side-main">
        <Card title="Pick what goes wrong" sub="Each has a rule, an owner and a cost">
          <div className="ex-list">
            {EXC.map((x) => (
              <button key={x.id} type="button" className={x.id === pick ? 'on' : ''} onClick={() => setPick(x.id)}>
                <b>{x.t}</b><span>Pays: {x.who}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card title={e.t} sub={`Who pays: ${e.who}`}>
          <ul className="events wide">
            {e.steps.map(([when, what]) => (
              <li key={when}><div className="d">{when}</div><div className="l" style={{ fontWeight: 500 }}>{what}</div></li>
            ))}
          </ul>
          <div className="grid cols-2 mt">
            <div className="note-box"><b>The buyer:</b> {e.buyer}</div>
            <div className="note-box"><b>The factory:</b> {e.factory}</div>
          </div>
        </Card>
      </div>

      <Card title="Innerwear returns: which rule keeps the badge?" sub={`Briefs at ₹${FD.makingCost} making cost and a 9% margin, against the ${r1(check.gatePrice)} gate`}
        actions={<Seg label="Return rule" value={policy} onChange={setPolicy} options={policies.map((x) => ({ value: x.id, label: x.label }))} />}>
        <div className="table-wrap" style={{ maxHeight: 'none' }}><table>
          <thead><tr><th>Route</th><th className="num">Returned</th><th className="num">Cost per pack kept</th><th className="num">Lowest viable price</th><th className="num">Badge</th></tr></thead>
          <tbody>
            {p.cols.slice(1).map((c) => (
              <tr key={c.key}>
                <td><b>{c.label}</b></td>
                <td className="num">{pct(p.ret)}</td>
                <td className="num">{r1(c.cost)}</td>
                <td className="num"><b>{r1(c.floor)}</b></td>
                <td className="num">{c.passes ? <Chip tone="good">Qualifies</Chip> : <Chip tone="critical">Not yet</Chip>}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <p className="small ink2 mt">{p.note}.</p>
        <div className="note-box mt">
          <b>Rule:</b> list briefs with sealed-pack returns only (size swaps and defects). Meesho already lets sellers mark innerwear “Non
          Returnable”. If opened returns had to be taken back and sold as seconds, each pack would cost about {r1(extra)} more and the node route
          would miss the gate ({r1(opened.cols[2].floor)}); the prepaid batch clears it under every rule.
        </div>
      </Card>
    </>
  );
}

// ---------------------------------------------------------------- 4 · paperwork & roles
function PaperworkTab({ dates, truckPacks }) {
  const truckValue = truckPacks * FD.makingCost;
  const DOCS = [
    ['Node added as a place of business (GST)', 'Once, before the first truck', 'Factory, on its own GSTIN; Meesho’s onboarding team helps file it', 'The Tiruppur node is in the factory’s own state, so one GSTIN covers both'],
    ['Delivery challan', 'Every truck', 'Factory, pre-filled by Meesho from the batch', 'A stock transfer, not a sale: the factory still owns the goods'],
    ['E-way bill', 'Every truck', 'Factory (part A), transporter (part B)', `This week: ${num(truckPacks)} packs, ${rupees(truckValue)} at making cost. The limit is ₹50,000 between states; guides differ on Tamil Nadu’s limit within the state (₹50,000 to ₹1 lakh), so one is generated for every truck`],
    ['Shipping notice (ASN)', `When the truck leaves, ${fmtDay(dates.truck)}`, 'Factory: one WhatsApp reply; Meesho builds it from the batch', 'Counts by size; the goods receipt is checked against it'],
    ['Goods receipt (GRN)', `Within ${OPS.grnHours} hours of the truck`, 'Node partner', 'A discrepancy note with photos is signed at the dock'],
    ['Tax invoice for each order', 'At dispatch', 'Meesho’s system, on the factory’s GSTIN; printed at the node', 'The factory is the seller on every invoice'],
    ['Legal Metrology label on each pack', 'At packing, before the truck', 'Factory', 'Maker’s name and address, product name, net quantity (3 pieces), MRP with taxes, month and year of manufacture, size, customer care'],
    ['Shipping label and Valmo manifest', 'At dispatch', 'Meesho’s system, printed at the node', 'One label per pre-order'],
    ['TCS and TDS statements', 'Monthly', 'Meesho, as the e-commerce operator', 'As for every Meesho seller today'],
  ];
  const RACI = [
    ['Batch late to the node', 'Factory', `Factory: ₹${OPS.lateCredit} an order`, `New date, ₹${OPS.lateCredit} back`],
    ['Lot fails QC at the factory', `Factory, ${OPS.reworkHours}-hour rework`, 'Factory', 'New date, or a full refund'],
    ['Truck short or damaged', 'Node partner signs the note', 'Factory if short; transporter if damaged', 'No change'],
    ['Stock lost or damaged at the node', 'Node partner', `Node partner, beyond ${OPS.shrinkTolerance * 100}% a quarter`, 'No change'],
    ['Parcel lost or late', 'Valmo', 'Valmo', 'Reship or refund within 2 days'],
    ['Return dispute', 'Meesho decides on the node’s photos', 'The party at fault', 'Refund once the pack passes grading'],
    ['Advance not repaid', 'NBFC recovers from payouts', `Factory; Meesho’s ${pct(FD.firstLoss)} first-loss behind it`, '—'],
    ['Buyer cancels', 'Meesho refunds from escrow', 'No one', 'Full refund'],
  ];
  const STATES = [
    ['Paid, held until delivery', 'Order system: a new “pre-order” state, with escrow', 'Date for their district; cancel button'],
    ['In this week’s batch', 'Order system', 'The batch count; free cancel until the cut-off'],
    ['Batch locked', `Cut-off job, ${weekday(dates.cutoff)} 11:59 pm`, '“Your pack is being made in Tiruppur”'],
    ['Being made', 'Factory’s WhatsApp replies: cut, packed, QC passed', 'Progress in the app'],
    ['Counted in at the node', 'Node warehouse system (goods receipt)', '“At the Factory Node”'],
    ['Shipped', 'Invoice, label and Valmo manifest', 'Tracking link'],
    ['Delivered', 'Valmo', 'Rating; sealed-pack returns for 7 days'],
    ['Settled', `Payout job, ${OPS.settleDays} days after delivery`, '—'],
  ];
  return (
    <>
      <Card title="Paperwork for every truck and every parcel" sub="Who makes each document, and when. To confirm with a tax adviser before the pilot.">
        <div className="table-wrap" style={{ maxHeight: 'none' }}>
          <table>
            <thead><tr><th>Document</th><th>When</th><th>Who makes it</th><th>Note</th></tr></thead>
            <tbody>{DOCS.map(([d, w, who, n]) => <tr key={d}><td className="strong">{d}</td><td>{w}</td><td>{who}</td><td className="ink2">{n}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
      <div className="grid cols-2">
        <Card title="Who fixes it, who pays" sub="Across the factory, the node partner, Valmo, Meesho and the NBFC">
          <div className="table-wrap" style={{ maxHeight: 'none' }}>
            <table>
              <thead><tr><th>What goes wrong</th><th>Fixes it</th><th>Pays</th><th>Buyer gets</th></tr></thead>
              <tbody>{RACI.map(([w, fx, pay, b]) => <tr key={w}><td className="strong">{w}</td><td>{fx}</td><td>{pay}</td><td className="ink2">{b}</td></tr>)}</tbody>
            </table>
          </div>
        </Card>
        <Card title="One pre-order, state by state" sub="What records each step, and what the buyer sees">
          <div className="table-wrap" style={{ maxHeight: 'none' }}>
            <table>
              <thead><tr><th>State</th><th>Recorded by</th><th>Buyer sees</th></tr></thead>
              <tbody>{STATES.map(([s, r, b]) => <tr key={s}><td className="strong">{s}</td><td>{r}</td><td className="ink2">{b}</td></tr>)}</tbody>
            </table>
          </div>
        </Card>
      </div>
      <Card title="Systems this needs" sub="Most exist at Meesho today; the new parts are the pre-order state, the cut-off job and the WhatsApp templates">
        <div className="grid cols-3">
          <ul className="rule-list">
            <li>✓ <b>Order system:</b> a “pre-order, awaiting batch” state, escrow on prepaid orders, the weekly cut-off job.</li>
            <li>✓ <b>Demand Brief job:</b> weekly, by district and size; it also sizes the suggested node top-up.</li>
            <li>✓ <b>NBFC rails:</b> pays out on the cut-off and goods-receipt events; repaid from payouts.</li>
          </ul>
          <ul className="rule-list">
            <li>✓ <b>WhatsApp Business:</b> pre-approved templates (brief, batch locked, top-up, truck left); owners opt in at onboarding; paid per message from the Demand Brief budget.</li>
            <li>✓ <b>Factory side:</b> no software. WhatsApp replies create the shipping notice and approve top-ups.</li>
            <li>✓ <b>Documents:</b> invoice, label, challan and e-way bill, pre-filled by Meesho.</li>
          </ul>
          <ul className="rule-list">
            <li>✓ <b>Node warehouse system</b> (the partner’s): goods receipt, bins by factory and SKU, cycle counts, the returns grading queue.</li>
            <li>✓ <b>Valmo:</b> manifest, tracking and lane SLAs from the node.</li>
            <li>✓ <b>Buyer support:</b> Meesho’s support desk sees the batch status and answers “where is my order?”; the factory never takes buyer calls.</li>
          </ul>
        </div>
      </Card>
    </>
  );
}

// ---------------------------------------------------------------- 5 · at scale
function ScaleTab({ f, pti }) {
  const { plan } = f;
  const [siteCap, setSiteCap] = useState(OPS.siteCapacity);
  const cap = useMemo(() => nodeCapacity(siteCap), [siteCap]);
  const cats = useMemo(() => categoryCheck(pti.medians), [pti]);
  const weeks = useMemo(() => batchWeeks(plan), [plan]);
  const y4 = cap.exits.at(-1);
  const tick = (ok) => (ok ? <span className="good-ink">✓</span> : <span style={{ color: 'var(--critical)' }}>✕</span>);
  return (
    <>
      <Card title={`Can one node handle ${num(Math.round(y4.perNode / 1000) * 1000)} orders a day?`} sub="A node is a cluster’s capacity, not one building. Drag a partner site’s capacity to test.">
        <div className="slider">
          <div className="row between"><b>Orders a day one partner site ships, two shifts</b><span className="ink2">{num(siteCap)}</span></div>
          <input type="range" min={5000} max={40000} step={1000} value={siteCap} aria-label="Site capacity" onChange={(e) => setSiteCap(Number(e.target.value))} />
        </div>
        <div className="stats">
          <Stat label="Year-4 exit, C2M orders a day" value={num(y4.perDay)} note={`${num(y4.perNode)} for each of ${y4.nodes} cluster nodes (deck)`} />
          <Stat hero label="Partner sites at the Year-4 exit" value={num(y4.sites)} note={`about ${Math.ceil(y4.perNode / siteCap)} per cluster at ${num(siteCap)} a day each`} />
          <Stat label="Extra set-up by Year 5" value={crore(cap.extraCost)} note={`${cap.extraSites} sites beyond the plan’s 12, at ₹${FD.nodeCost} cr each`} />
          <Stat label="NPV with those sites" value={crore(cap.withSites.npv)} note={`base case ${crore(cap.base.npv)}`} />
        </div>
        <div className="table-wrap" style={{ maxHeight: 'none' }}>
          <table>
            <thead><tr><th>Five-year case</th>{cap.perDay.map((_, i) => <th key={i} className="num">Year {i + 1}</th>)}</tr></thead>
            <tbody>
              <tr><td>C2M orders a day (year average)</td>{cap.perDay.map((d, i) => <td key={i} className="num">{num(d)}</td>)}</tr>
              <tr><td>Cluster nodes in the plan</td>{FD.nodes.map((n, i) => <td key={i} className="num">{n}</td>)}</tr>
              <tr><td>Orders a day per node</td>{cap.perNode.map((d, i) => <td key={i} className="num">{num(d)}</td>)}</tr>
              <tr className="total"><td>Partner sites needed</td>{cap.sites.map((s, i) => <td key={i} className="num">{s}</td>)}</tr>
            </tbody>
          </table>
        </div>
        <div className="grid cols-3 mt">
          <div className="note-box"><b>Who pays for the space:</b> the node partner earns ₹{FD.fees.nodeFee} a pack. At {num(y4.perNode)} a day that is {crore(cap.feePoolCr)} of fees a year per cluster, enough for the space and people; Meesho’s ₹{FD.nodeCost} cr pays for set-up at each site.</div>
          <div className="note-box"><b>Inbound:</b> about {num(cap.factoriesPerCluster)} factories a cluster, one truck a week each. Cut-offs are staggered over six days, so about {num(cap.trucksPerDay)} trucks a day, each with a booked dock slot.</div>
          <div className="note-box"><b>Peaks:</b> a third shift covers festive weeks at about 1.5× the average. Before Diwali, each factory books its weekly C2M run in the Demand Brief, so B2B peak orders don’t crowd it out.</div>
        </div>
      </Card>

      <Card title="Does it work beyond briefs?" sub={`Each category at Kavin’s cost ratio (₹${FD.makingCost} making cost on ₹${TEARDOWN.briefs3.median} = ${pct(FD.makingCost / TEARDOWN.briefs3.median)}), with its own returns and failed deliveries`}>
        <div className="table-wrap" style={{ maxHeight: 'none' }}>
          <table>
            <thead><tr><th>Category</th><th>Product</th><th className="num">Buyers pay</th><th className="num">Making cost</th><th className="num">Returns</th><th className="num">Failed deliveries</th><th className="num">Ships itself</th><th className="num">Factory Node</th><th className="num">Prepaid batch</th><th>First waves?</th></tr></thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.c.id}>
                  <td className="strong">{c.c.short}</td>
                  <td>{c.t.name} <span className="muted">{c.teardown ? '(teardown)' : '(synthetic)'}</span></td>
                  <td className="num">{rupees(c.market)}</td>
                  <td className="num">{rupees(c.cogs)}</td>
                  <td className="num">{pct(c.c.returnRate)}</td>
                  <td className="num">{pct(c.c.rtoRate)}</td>
                  <td className="num">{rupees(c.self.floor)} {tick(c.self.passes)}</td>
                  <td className="num">{rupees(c.node.floor)} {tick(c.node.passes)}</td>
                  <td className="num">{rupees(c.batch.floor)} {tick(c.batch.passes)}</td>
                  <td>{c.verdict === 'Not yet' ? <Chip tone="critical">Not yet</Chip> : <Chip tone="good">{c.verdict}</Chip>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted mt">
          The same ₹{FD.fees.nodeFwd} forward and ₹{FD.fees.nodeFee} node fees are used for every category, which understates freight for bulky steel,
          plastics and bags; every factory runs its own price check before onboarding. Footwear fails every route on returns and failed
          deliveries, so it waits until size fixes bring returns down.
        </p>
      </Card>

      <Card title="Logistics KPIs, tracked every batch" sub="Target, owner, and the rule when it is missed">
        <div className="table-wrap" style={{ maxHeight: 'none' }}>
          <table>
            <thead><tr><th>KPI</th><th>Measures</th><th>Target</th><th>Owner</th><th>When missed</th></tr></thead>
            <tbody>{KPIS.map(([k, d, t, o, m]) => <tr key={k}><td className="strong">{k}</td><td className="ink2">{d}</td><td>{t}</td><td>{o}</td><td className="ink2">{m}</td></tr>)}</tbody>
          </table>
        </div>
        <h4 className="mt" style={{ fontSize: 13.5 }}>Kavin’s last eight batches (synthetic; one late truck, one failed QC sample and one short count are planted to show the rules)</h4>
        <div className="table-wrap mt" style={{ maxHeight: 'none' }}>
          <table>
            <thead><tr><th>Week</th><th className="num">Pre-orders</th><th className="num">Made</th><th className="num">QC defects in {OPS.qcSample.n}</th><th className="num">In full</th><th className="num">On time</th><th className="num">Dock-to-ship</th><th className="num">By promise</th><th className="num">Credits paid</th><th>What happened</th></tr></thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.week} className={w.note ? 'hl' : ''}>
                  <td>W{w.week}</td>
                  <td className="num">{num(w.pre)}</td>
                  <td className="num">{num(w.make)}</td>
                  <td className="num">{w.defects} {tick(w.defects <= OPS.qcSample.accept)}</td>
                  <td className="num">{pct(w.inFull, 1)}</td>
                  <td className="num">{w.delayDays ? `+${w.delayDays} day${w.delayDays > 1 ? 's' : ''}` : '✓'}</td>
                  <td className="num">{w.dockToShip.toFixed(0)} h</td>
                  <td className="num">{pct(w.byPromise, 1)}</td>
                  <td className="num">{w.credits ? rupees(w.credits) : '—'}</td>
                  <td className="ink2">{w.note || 'On plan'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row mt"><a className="btn" href={href('health', { seller: PERSONA.id })}>Kavin’s Seller Health Score →</a></div>
      </Card>
    </>
  );
}
