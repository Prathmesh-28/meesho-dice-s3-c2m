import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ReferenceLine,
  BarChart, Bar, LabelList, Cell,
} from 'recharts';
import { CATEGORIES, GATE } from '../config.js';
import { VERDICTS, explain } from '../lib/pti.js';
import { categoryById, typeById } from '../lib/generate.js';
import { setParams } from '../lib/router.js';
import { crore, downloadCsv, pct, rupees } from '../lib/format.js';
import { C, Card, Chip, Legend, Stat, TooltipBox, axisProps, useSort } from '../components/ui.jsx';

const SERIES = [
  { verdict: 'ready', color: C.s1, shape: 'circle', label: 'C2M-ready' },
  { verdict: 'noprice', color: C.s2, shape: 'circle', label: 'Scale without price' },
  { verdict: 'nearmiss', color: C.s3, shape: 'circle', label: 'Near miss' },
  { verdict: 'lossleader', color: C.ink2, shape: 'triangle', label: 'Loss-leader pattern' },
];

function Slider({ label, value, display, min, max, step, onChange }) {
  return (
    <div className="field" style={{ minWidth: 200, flex: 1 }}>
      <label>{label}: <span className="val">{display}</span></label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function ScatterTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const s = payload[0].payload;
  return (
    <TooltipBox
      title={`${s.name} · ${s.location}`}
      rows={[
        ['Annual GMV', crore(s.gmvCr)],
        ['Median SKU price gap', pct(s.medianGap, 1)],
        ['Live SKUs clearing', `${s.clearing} of ${s.liveSkus}`],
        ['Verdict', VERDICTS[s.verdict].label],
      ]}
    />
  );
}

export default function PriceTruth({ gate, setGate, pti, params }) {
  const category = params.cat ?? 'all';
  const [query, setQuery] = useState('');
  const [verdict, setVerdict] = useState('all');

  const inView = useMemo(
    () => pti.screened.filter((s) => category === 'all' || s.category === category),
    [pti, category],
  );
  const counts = useMemo(() => {
    const c = (v) => inView.filter((s) => s.verdict === v).length;
    return { screened: inView.length, ready: c('ready'), noprice: c('noprice'), lossleader: c('lossleader'), nearmiss: c('nearmiss') };
  }, [inView]);

  const tableRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inView
      .filter((s) => verdict === 'all' || s.verdict === verdict)
      .filter((s) => !q || `${s.name} ${s.id} ${s.location}`.toLowerCase().includes(q))
      .map((s) => ({ ...s, catName: categoryById[s.category].short }));
  }, [inView, query, verdict]);
  const { sorted, header } = useSort(tableRows, 'gmvCr');

  const largest = inView.slice().sort((a, b) => b.gmvCr - a.gmvCr)[0];
  const selected = pti.scored.find((s) => s.id === params.seller) ?? largest;
  const select = (id) => setParams({ seller: id });

  const catBars = pti.byCategory
    .map((c) => ({ ...c, readyPct: Math.round(c.readyShare * 100) }))
    .sort((a, b) => b.readyPct - a.readyPct);

  const skuBars = selected
    ? selected.rows.slice().sort((a, b) => b.gap - a.gap).map((r, i) => ({ i, gap: r.gap * 100, clears: r.clears, name: r.typeName, landed: r.landed, median: r.median }))
    : [];
  const setsForSelected = selected
    ? Object.values(
        selected.rows.reduce((acc, r) => {
          acc[r.type] ??= { type: r.type, name: typeById[r.type].name, median: r.median, prices: [] };
          acc[r.type].prices.push(r.landed);
          return acc;
        }, {}),
      )
    : [];

  const exportReady = () =>
    downloadCsv(
      'c2m_ready_acquisition_list.csv',
      pti.screened
        .filter((s) => s.verdict === 'ready')
        .sort((a, b) => b.share - a.share)
        .map((s) => ({
          seller_id: s.id, seller: s.name, category: categoryById[s.category].short, location: s.location,
          gmv_cr: s.gmvCr.toFixed(1), live_skus: s.liveSkus, skus_clearing: s.clearing,
          share_clearing: s.share.toFixed(2), median_gap: s.medianGap.toFixed(3),
        })),
    );

  const threshold = gate.deltaThreshold * 100;
  const changed = JSON.stringify(gate) !== JSON.stringify(GATE);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">Module 1 · Qualify</div>
          <h2>Price Truth Index</h2>
          <p className="lede">
            Seller scale is a starting signal, not proof. This screens every seller above ₹{gate.minGmvCr} cr GMV on what
            buyers actually paid, product by product, and badges only catalogues where the price edge is real.
          </p>
        </div>
        <button className="btn primary" onClick={exportReady} type="button">Download C2M-ready list (CSV)</button>
      </div>

      <div className="filters">
        <div className="field">
          <label htmlFor="cat">Category</label>
          <select id="cat" value={category} onChange={(e) => setParams({ cat: e.target.value === 'all' ? null : e.target.value, seller: null })}>
            <option value="all">All 9 screened categories</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.short}</option>)}
          </select>
        </div>
        <Slider label="A SKU clears when it is at least" display={`${Math.round(gate.deltaThreshold * 100)}% below median`} min={0.04} max={0.15} step={0.01} value={gate.deltaThreshold} onChange={(v) => setGate({ ...gate, deltaThreshold: v })} />
        <Slider label="A catalogue passes when" display={`${Math.round(gate.skuShare * 100)}% of live SKUs clear`} min={0.4} max={0.8} step={0.05} value={gate.skuShare} onChange={(v) => setGate({ ...gate, skuShare: v })} />
        <Slider label="Screen sellers above" display={`₹${gate.minGmvCr} cr GMV`} min={1} max={15} step={1} value={gate.minGmvCr} onChange={(v) => setGate({ ...gate, minGmvCr: v })} />
        <button className="btn" type="button" disabled={!changed} onClick={() => setGate(GATE)}>Reset to Round 1 gate</button>
      </div>

      <div className="stats">
        <Stat label="Sellers screened" value={counts.screened} note={`above ₹${gate.minGmvCr} cr annual GMV`} />
        <Stat label="C2M-ready" value={counts.ready} note={`${pct(counts.screened ? counts.ready / counts.screened : 0)} of screened · badge + re-rank`} />
        <Stat label="Scale without price" value={counts.noprice} note={`${pct(counts.screened ? counts.noprice / counts.screened : 0)} of screened · large, not cheaper`} />
        <Stat label="Loss-leader pattern caught" value={counts.lossleader} note="a few deep SKUs, rest at market" />
        <Stat label="Near misses" value={counts.nearmiss} note="real edge, too thin: Factory Node candidates" />
        <Stat label="Scale vs price gap" value={`r = ${pti.correlation.toFixed(2)}`} note="log GMV vs median gap, all screened" />
      </div>

      <div className="grid cols-main-side">
        <Card
          title="Bigger is not cheaper"
          sub={`Each dot is a seller above ₹${gate.minGmvCr} cr. Height is the median price gap of its live SKUs against the comparable-set median. Click a dot to inspect it.`}
        >
          <Legend items={SERIES.map((s) => ({ label: `${s.label} (${counts[s.verdict]})`, color: s.color, kind: s.shape === 'triangle' ? 'tri' : '' }))} />
          <div className="chart" style={{ height: 380 }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 28, left: 4 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis type="number" dataKey="gmvCr" scale="log" domain={[Math.max(1, gate.minGmvCr), 100]} ticks={[1, 2, 5, 10, 20, 50, 100].filter((t) => t >= gate.minGmvCr)} allowDataOverflow {...axisProps} tickFormatter={(v) => `₹${v} cr`} label={{ value: 'Annual GMV (log scale)', position: 'insideBottom', offset: -18, fill: C.muted, fontSize: 11 }} />
                <YAxis type="number" dataKey="gapPct" domain={[-10, 25]} ticks={[-10, -5, 0, 5, 10, 15, 20, 25]} allowDataOverflow {...axisProps} tickFormatter={(v) => `${v}%`} width={44} />
                <ZAxis range={[64, 64]} />
                <ReferenceLine y={0} stroke={C.axis} />
                <ReferenceLine y={threshold} stroke={C.plum} strokeWidth={1.5} label={{ value: `Gap threshold ${Math.round(threshold)}%`, position: 'insideTopRight', fill: C.plum, fontSize: 11 }} />
                <Tooltip content={<ScatterTip />} cursor={false} />
                {SERIES.map((s) => (
                  <Scatter
                    key={s.verdict}
                    name={s.label}
                    data={inView.filter((x) => x.verdict === s.verdict).map((x) => ({ ...x, gapPct: x.medianGap * 100 }))}
                    fill={s.color}
                    shape={s.shape}
                    stroke="#fff"
                    strokeWidth={1.5}
                    isAnimationActive={false}
                    onClick={(d) => select(d?.payload?.id ?? d?.id)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
                {selected && selected.screened && (
                  <Scatter data={[{ ...selected, gapPct: selected.medianGap * 100 }]} fill="none" stroke={C.plum} strokeWidth={2.5} shape="circle" isAnimationActive={false} legendType="none" />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="small ink2">
            Correlation between seller size and price gap is {pti.correlation.toFixed(2)}: among large sellers, more GMV
            does not mean a lower shelf price. {pti.top10NotReady} of the 10 largest sellers fail the gate.
          </p>
        </Card>

        <Card title="C2M-ready share by category" sub="Share of screened sellers that pass. Click a bar to filter.">
          <div className="chart" style={{ height: 380 }}>
            <ResponsiveContainer>
              <BarChart data={catBars} layout="vertical" margin={{ top: 0, right: 44, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={C.grid} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={138} {...axisProps} tick={{ fill: C.ink2, fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f2ef' }} content={({ active, payload }) => active && payload?.length ? (
                  <TooltipBox title={payload[0].payload.name} rows={[['C2M-ready', `${payload[0].payload.ready} of ${payload[0].payload.screened}`], ['Scale without price', payload[0].payload.noprice]]} />
                ) : null} />
                <Bar dataKey="readyPct" barSize={16} radius={[0, 4, 4, 0]} isAnimationActive={false} onClick={(d) => setParams({ cat: d?.payload?.id ?? d?.id, seller: null })} style={{ cursor: 'pointer' }}>
                  {catBars.map((c) => <Cell key={c.id} fill={category === 'all' || category === c.id ? C.s1 : '#b7d3f6'} />)}
                  <LabelList dataKey="readyPct" position="right" formatter={(v) => `${v}%`} style={{ fill: C.ink2, fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {category !== 'all' && <button className="btn ghost" type="button" onClick={() => setParams({ cat: null, seller: null })}>← Show all categories</button>}
        </Card>
      </div>

      <div className="grid cols-main-side mt">
        <Card
          title="Screened sellers"
          sub={`${tableRows.length} shown · click a row for its SKU-level breakdown`}
          actions={
            <div className="row">
              <input type="search" placeholder="Search seller, ID, city" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search sellers" />
              <select value={verdict} onChange={(e) => setVerdict(e.target.value)} aria-label="Filter by verdict">
                <option value="all">All verdicts</option>
                {['ready', 'noprice', 'lossleader', 'nearmiss'].map((v) => <option key={v} value={v}>{VERDICTS[v].label}</option>)}
              </select>
            </div>
          }
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {header('name', 'Seller')}
                  {header('catName', 'Category')}
                  {header('gmvCr', 'GMV', 'num')}
                  {header('liveSkus', 'Live SKUs', 'num')}
                  {header('medianGap', 'Median gap', 'num')}
                  {header('share', 'SKUs clearing', 'num')}
                  {header('verdict', 'Verdict')}
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr key={s.id} className={`clickable${selected?.id === s.id ? ' selected' : ''}`} onClick={() => select(s.id)}>
                    <td><div className="seller-name">{s.name}</div><div className="seller-id">{s.id} · {s.location}</div></td>
                    <td>{s.catName}</td>
                    <td className="num">{crore(s.gmvCr)}</td>
                    <td className="num">{s.liveSkus}</td>
                    <td className="num">{pct(s.medianGap, 1)}</td>
                    <td className="num">{pct(s.share)}</td>
                    <td><Chip tone={VERDICTS[s.verdict].tone}>{VERDICTS[s.verdict].label}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {selected && (
          <Card title={selected.name} sub={`${selected.id} · ${selected.location} · ${categoryById[selected.category].short}`} actions={<Chip tone={VERDICTS[selected.verdict].tone}>{VERDICTS[selected.verdict].label}</Chip>}>
            <p className="small">{explain(selected, gate)}</p>
            <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 12, marginBottom: 8 }}>
              <Stat label="GMV" value={crore(selected.gmvCr)} />
              <Stat label="Median gap" value={pct(selected.medianGap, 1)} />
              <Stat label="SKUs clearing" value={`${selected.clearing}/${selected.liveSkus}`} />
            </div>
            <Legend items={[{ label: `Clears ${Math.round(threshold)}%`, color: C.s1 }, { label: 'Does not clear', color: C.deemph }]} />
            <div className="chart" style={{ height: 190 }}>
              <ResponsiveContainer>
                <BarChart data={skuBars} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
                  <CartesianGrid stroke={C.grid} vertical={false} />
                  <XAxis dataKey="i" {...axisProps} tick={false} label={{ value: 'Live SKUs, largest gap first', position: 'insideBottom', offset: 4, fill: C.muted, fontSize: 11 }} height={24} />
                  <YAxis {...axisProps} tickFormatter={(v) => `${v}%`} width={40} />
                  <ReferenceLine y={0} stroke={C.axis} />
                  <ReferenceLine y={threshold} stroke={C.plum} strokeWidth={1.5} />
                  <Tooltip cursor={{ fill: '#f3f2ef' }} content={({ active, payload }) => active && payload?.length ? (
                    <TooltipBox title={payload[0].payload.name} rows={[['Landed price', rupees(payload[0].payload.landed)], ['Comparable median', rupees(payload[0].payload.median)], ['Gap', `${payload[0].payload.gap.toFixed(1)}%`]]} />
                  ) : null} />
                  <Bar dataKey="gap" maxBarSize={24} radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    {skuBars.map((b) => <Cell key={b.i} fill={b.clears ? C.s1 : C.deemph} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="table-wrap mt" style={{ maxHeight: 'none' }}>
              <table>
                <thead><tr><th>Comparable set</th><th className="num">Market median</th><th className="num">Seller median</th><th className="num">SKUs</th></tr></thead>
                <tbody>
                  {setsForSelected.map((s) => {
                    const sorted = s.prices.slice().sort((a, b) => a - b);
                    return (
                      <tr key={s.type}>
                        <td>{s.name}</td>
                        <td className="num">{rupees(s.median)}</td>
                        <td className="num">{rupees(sorted[sorted.length >> 1])}</td>
                        <td className="num">{s.prices.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="small muted mt">
              Medians are weighted by delivered orders over 30 days, from SKUs with at least {gate.minOrdersForMedian} orders.
              A seller holding over 30% of a set’s orders is compared against the median without its own orders.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
