import { useMemo, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { FD } from '../config.js';
import { SCENARIOS, breakEvenYield, deckCase, financials } from '../lib/factoryDirect.js';
import { crore, num, pct, rupees } from '../lib/format.js';
import { C, Card, Legend, Seg, Stat, TooltipBox, axisProps } from '../components/ui.jsx';

// Each driver is a multiplier or a share the deck's sensitivity tests; the base values come from config.js (FD).
const DRIVERS = [
  { key: 'yieldScale', label: 'Seller yield', base: 1, min: 0.3, max: 1.5, step: 0.05, show: (v) => `${pct(v)} of plan (₹${FD.yieldCr[3]} cr NMV a seller by Year 4)` },
  { key: 'incremental', label: 'Orders new to Meesho', base: FD.incremental, min: 0, max: 0.8, step: 0.05, show: (v) => `${pct(v)} of C2M orders` },
  { key: 'preorder', label: 'Prepaid pre-order share', base: FD.prepaidShare, min: 0.1, max: 0.9, step: 0.05, show: (v) => `${pct(v)} of C2M orders` },
  { key: 'gap', label: 'Failed-delivery gap, COD vs prepaid', base: FD.codFailGap, min: 0, max: 0.25, step: 0.01, show: (v) => `${(v * 100).toFixed(0)} pts` },
  { key: 'costScale', label: 'Programme cost', base: 1, min: 0.7, max: 1.6, step: 0.05, show: (v) => `${pct(v)} of plan` },
];
const BASE = Object.fromEntries(DRIVERS.map((d) => [d.key, d.base]));

export default function Business() {
  const [over, setOver] = useState(BASE);
  const f = useMemo(() => financials(over), [over]);
  const base = useMemo(() => financials(), []);
  const be = useMemo(() => breakEvenYield({ ...over, yieldScale: undefined }), [over]);
  const dc = useMemo(() => deckCase(), []);
  const scenario = Object.entries(SCENARIOS).find(([, s]) => DRIVERS.every((d) => Math.abs((s.over[d.key] ?? d.base) - over[d.key]) < 1e-9))?.[0] ?? 'custom';

  let cum = 0;
  const rows = f.benefit.map((b, i) => {
    cum += f.net[i];
    return { year: `Year ${i + 1}`, benefit: +b.toFixed(1), cost: +f.cost[i].toFixed(1), cumulative: +cum.toFixed(1) };
  });
  const set = (key, v) => setOver((o) => ({ ...o, [key]: v }));

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">Module 7 · Finance analysis</div>
          <h2>Does Factory Direct pay for itself?</h2>
          <p className="lede">
            Meesho earns on orders, not on price: {pct(FD.incremental)} of C2M orders are new to Meesho at ₹7.3 of contribution
            each, and prepaid pre-orders fail less often than cash on delivery. Move any driver and the five-year case,
            the payback and the break-even update live. Same model and inputs as the deck.
          </p>
        </div>
        <Seg label="Scenario" value={scenario} onChange={(k) => setOver({ ...BASE, ...SCENARIOS[k].over })}
          options={Object.entries(SCENARIOS).map(([k, s]) => ({ value: k, label: s.label }))} />
      </div>

      <div className="stats">
        <Stat hero label="NPV at 12%, five years" value={crore(f.npv)} note={scenario === 'base' ? 'the deck’s base case' : `base case ${crore(base.npv)}`} />
        <Stat label="IRR" value={pct(f.irr)} note="on the programme’s own cash flows" />
        <Stat label="Payback" value={f.payback ? `Year ${f.payback}` : 'beyond Year 5'} note="cumulative net cash turns positive" />
        <Stat label="Year-1 cash, capped" value={crore(f.cashY1)} note="released only at the Day-30 and Day-90 gates" />
        <Stat label="Break-even seller yield" value={pct(be)} note="of plan, with the other drivers as set" />
        <Stat label="Value to Meesho per C2M order" value={`₹${f.valuePerOrder.toFixed(1)}`} note={`incremental contribution + ${(f.failDrop * 100).toFixed(1)} pts fewer failed deliveries`} />
      </div>

      <div className="grid cols-side-main">
        <Card title="Drivers" sub="Drag to stress the case">
          {DRIVERS.map((d) => (
            <div className="slider" key={d.key}>
              <div className="row between"><b>{d.label}</b><span className="ink2">{d.show(over[d.key])}</span></div>
              <input type="range" min={d.min} max={d.max} step={d.step} value={over[d.key]} aria-label={d.label}
                onChange={(e) => set(d.key, Number(e.target.value))} />
            </div>
          ))}
          <button className="btn" type="button" onClick={() => setOver(BASE)}>Reset to the deck’s base case</button>
          <div className="note-box mt">
            Bear ({crore(financials(SCENARIOS.bear.over).npv)}): 20% incremental, 8-pt gap, 75% yield. Bull ({crore(financials(SCENARIOS.bull.over).npv)}):
            55% incremental, 20-pt gap, 110% yield. Zero new orders still returns {crore(financials({ ...over, incremental: 0 }).npv)}: fewer failed
            deliveries alone almost repay the programme.
          </div>
        </Card>

        <Card title="Benefit vs programme cost (₹ cr a year)" sub="Bars: benefit and cost each year · line: cumulative net cash">
          <Legend items={[{ label: 'Benefit to Meesho', color: C.s3 }, { label: 'Programme cost', color: C.critical }, { label: 'Cumulative net', color: C.plum, kind: 'line' }]} />
          <div className="chart" style={{ height: 260 }}>
            <ResponsiveContainer>
              <ComposedChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="year" {...axisProps} />
                <YAxis {...axisProps} width={40} />
                <Tooltip content={({ active, payload, label }) => (active && payload?.length ? (
                  <TooltipBox title={label} rows={payload.map((p) => [p.name, `₹${p.value} cr`])} />) : null)} />
                <ReferenceLine y={0} stroke={C.axis} />
                <Bar dataKey="benefit" name="Benefit" fill={C.s3} isAnimationActive={false} radius={[3, 3, 0, 0]} />
                <Bar dataKey="cost" name="Cost" fill={C.critical} isAnimationActive={false} radius={[3, 3, 0, 0]} />
                <Line dataKey="cumulative" name="Cumulative net" stroke={C.plum} strokeWidth={2.5} dot isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="table-wrap mt" style={{ maxHeight: 'none' }}>
            <table>
              <thead><tr><th>₹ cr</th>{rows.map((r) => <th key={r.year} className="num">{r.year}</th>)}</tr></thead>
              <tbody>
                <tr><td>Average active factories</td>{FD.sellers.map((n, i) => <td key={i} className="num">{num(n)}</td>)}</tr>
                <tr><td>C2M NMV</td>{f.nmv.map((v, i) => <td key={i} className="num">{num(v)}</td>)}</tr>
                <tr><td>Incremental orders × ₹7.3</td>{f.benIncr.map((v, i) => <td key={i} className="num">{v.toFixed(1)}</td>)}</tr>
                <tr><td>Fewer failed deliveries × ₹{FD.failCost}</td>{f.benRto.map((v, i) => <td key={i} className="num">{v.toFixed(1)}</td>)}</tr>
                <tr><td>Programme cost</td>{f.cost.map((v, i) => <td key={i} className="num">−{v.toFixed(1)}</td>)}</tr>
                <tr className="total"><td>Net cash</td>{f.net.map((v, i) => <td key={i} className="num">{v.toFixed(1)}</td>)}</tr>
                <tr><td>Present value at 12%</td>{f.pv.map((v, i) => <td key={i} className="num">{v.toFixed(1)}</td>)}</tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid cols-3 mt">
        <Card title="The buyer" sub="per pack, men’s cotton briefs (3)">
          <p>Pays <b>{rupees(dc.preorderPrice)}</b> on a prepaid pre-order instead of the <b>{rupees(dc.market)}</b> buyers pay today: ₹{dc.buyerSaves.toFixed(1)} less.</p>
        </Card>
        <Card title="The factory" sub="per pack, against selling ex-factory">
          <p>Earns <b>₹{dc.factoryMargin.toFixed(1)}</b> a pack against ₹{dc.exFactoryMargin.toFixed(1)} selling to a distributor ({(dc.factoryMargin / dc.exFactoryMargin).toFixed(1)}×), and gets 30% of the batch before delivery: 20% at the cut-off, 10% at handover.</p>
        </Card>
        <Card title="Meesho" sub="per C2M order">
          <p>Earns <b>₹{f.valuePerOrder.toFixed(1)}</b> an order without a subsidy: no order discounts, impression grants instead of cash, and nodes funded only after the Day-30 gate.</p>
        </Card>
      </div>
    </div>
  );
}
