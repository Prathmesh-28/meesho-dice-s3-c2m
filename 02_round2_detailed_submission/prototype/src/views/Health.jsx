import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { HEALTH, PERSONA } from '../config.js';
import { RULES, STAGES } from '../lib/health.js';
import { setParams } from '../lib/router.js';
import { num } from '../lib/format.js';
import { C, Card, Chip, Legend, Meter, Sparkline, Stat, TooltipBox, axisProps, useSort } from '../components/ui.jsx';

const STAGE_TONE = { allocate: 'brand', diagnose: 'good', remedy: 'warning', graduate: 'good' };
const BADGE = { active: ['good', 'Badge active'], suspended: ['critical', 'Badge suspended'], removed: ['critical', 'Badge removed'] };
const COMPONENTS = [
  ['price', 'Price gap held'],
  ['velocity', 'Order pace vs cohort'],
  ['quality', 'Quality returns'],
  ['sla', 'On-time dispatch'],
  ['stock', 'In-stock'],
];
const toneColor = { good: C.good, warning: C.warning, critical: C.critical, neutral: C.muted, serious: C.serious };

function stageLabel(s) {
  if (s.escalated) return ['critical', 'Human review'];
  const st = STAGES.find((x) => x.id === s.stage);
  return [STAGE_TONE[s.stage], st.label];
}

export default function Health({ cohort, summary, params }) {
  const stageFilter = params.stage ?? 'all';
  const [cluster, setCluster] = useState('all');

  const rows = useMemo(
    () => cohort
      .filter((s) => stageFilter === 'all' || stageFilter === 'qualify' || s.stage === stageFilter)
      .filter((s) => cluster === 'all' || s.cluster === cluster)
      .map((s) => ({ ...s, latestDay: s.latest.day })),
    [cohort, stageFilter, cluster],
  );
  const { sorted, header } = useSort(rows, 'score', 'asc');
  const selected = cohort.find((s) => s.id === params.seller) ?? cohort.find((s) => s.id === PERSONA.id);
  const select = (id) => setParams({ seller: id });

  const scoreData = selected.history.map((h) => ({ day: h.day, score: h.score }));
  const orderData = selected.history.map((h) => ({ day: h.day, actual: h.cumOrders, median: h.cumExpected, band: h.band }));
  const markers = selected.events.filter((e) => e.day > 0);
  const [stageTone, stageText] = stageLabel(selected);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">Module 3 · Allocate → Diagnose → Remedy → Graduate</div>
          <h2>C2M Seller Health Score</h2>
          <p className="lede">
            {cohort.length} pilot manufacturers from Tiruppur and Panipat, scored every day from five signals. Nine rules
            act on the score automatically. A person is called only when a fix has already failed.
          </p>
        </div>
      </div>

      <div className="stages" role="tablist" aria-label="Stage filter">
        {STAGES.map((st) => {
          const n = summary.stageCounts[st.id];
          const on = stageFilter === st.id;
          return (
            <button key={st.id} type="button" className={`stage${on ? ' on' : ''}`} onClick={() => setParams({ stage: on ? null : st.id })} aria-pressed={on}>
              <div className="lbl">{st.label}</div>
              <div className="n">{n}</div>
              <div className="note">{st.id === 'qualify' ? 'Passed the price gate' : st.note}</div>
              <div className="bar" style={{ width: `${(n / cohort.length) * 100}%` }} />
            </button>
          );
        })}
      </div>

      <div className="stats">
        <Stat label="Average health score" value={Math.round(summary.avgScore)} note={`graduate at ${HEALTH.graduateScore} for ${HEALTH.graduateDays} days`} />
        <Stat label="Automated actions fired" value={summary.auto} note="grants, nudges, holds, node offers" />
        <Stat label="Human escalations" value={summary.manual} note={`over ${Math.round(summary.sellerMonths)} seller-months`} />
        <Stat hero label="Sellers per category manager" value={summary.sellersPerManager === Infinity ? '1,000+' : `~${num(Math.round(summary.sellersPerManager / 10) * 10)}`} note={`at ${HEALTH.categoryManagerCapacity} escalation reviews a month (assumed)`} />
        <Stat label="Graduated" value={summary.stageCounts.graduate} note="batch prepayment unlocked" />
      </div>

      <div className="grid cols-side-main">
        <Card
          title="Pilot cohort"
          sub={`${rows.length} sellers${stageFilter !== 'all' ? ` · ${STAGES.find((s) => s.id === stageFilter).label}` : ''} · lowest score first`}
          actions={
            <select value={cluster} onChange={(e) => setCluster(e.target.value)} aria-label="Cluster">
              <option value="all">Both clusters</option>
              <option value="Tiruppur">Tiruppur</option>
              <option value="Panipat">Panipat</option>
            </select>
          }
        >
          <div className="table-wrap" style={{ maxHeight: 760 }}>
            <table>
              <thead>
                <tr>
                  {header('name', 'Seller')}
                  {header('day', 'Day', 'num')}
                  {header('score', 'Score', 'num')}
                  <th>Trend</th>
                  {header('stage', 'Stage')}
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => {
                  const [tone, text] = stageLabel(s);
                  return (
                    <tr key={s.id} className={`clickable${selected.id === s.id ? ' selected' : ''}`} onClick={() => select(s.id)}>
                      <td><div className="seller-name">{s.name}{s.persona ? ' ★' : ''}</div><div className="seller-id">{s.id} · {s.cluster}</div></td>
                      <td className="num">D{s.day}</td>
                      <td className="num strong">{Math.round(s.score)}</td>
                      <td><Sparkline values={s.history.map((h) => h.score)} /></td>
                      <td><Chip tone={tone}>{text}</Chip></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="stack">
          <Card
            title={`${selected.name}${selected.persona ? ' ★' : ''}`}
            sub={`${selected.id} · ${selected.cluster} · ${selected.categoryName} · ${selected.skuCount} SKUs · day ${selected.day} since onboarding`}
            actions={<div className="row"><Chip tone={BADGE[selected.badge][0]}>{BADGE[selected.badge][1]}</Chip><Chip tone={stageTone}>{stageText}</Chip></div>}
          >
            <div className="grid" style={{ gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
              <div>
                <div className="muted small">Health score</div>
                <div style={{ fontSize: 48, fontWeight: 650, lineHeight: 1.1 }}>{Math.round(selected.score)}</div>
                <div className="small ink2">of 100</div>
              </div>
              <div>
                {COMPONENTS.map(([k, label]) => {
                  const v = selected.comps[k];
                  return <Meter key={k} label={label} value={v} weight={HEALTH.weights[k]} tone={v < 40 ? 'critical' : v < 70 ? 'warning' : ''} />;
                })}
              </div>
            </div>
          </Card>

          <div className="grid cols-2">
            <Card title="Health score by day" sub="Markers show when a rule fired">
              <div className="chart" style={{ height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={scoreData} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke={C.grid} vertical={false} />
                    <XAxis dataKey="day" type="number" domain={[1, selected.day]} {...axisProps} tickFormatter={(d) => `D${d}`} />
                    <YAxis domain={[0, 100]} ticks={[0, 40, 80, 100]} {...axisProps} width={30} />
                    <ReferenceLine y={HEALTH.graduateScore} stroke={C.good} label={{ value: 'Graduate', position: 'insideBottomRight', fill: C.good, fontSize: 10 }} />
                    <ReferenceLine y={HEALTH.escalateScore} stroke={C.critical} label={{ value: 'Escalate', position: 'insideBottomRight', fill: C.critical, fontSize: 10 }} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const ev = selected.events.filter((e) => e.day === label);
                      return <TooltipBox title={`Day ${label}`} rows={[['Score', payload[0].value.toFixed(0)], ...ev.map((e) => ['Rule', e.label])]} />;
                    }} />
                    <Line dataKey="score" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                    {markers.map((e, i) => {
                      const h = selected.history[e.day - 1];
                      return h ? <ReferenceDot key={i} x={e.day} y={h.score} r={5} fill={toneColor[e.tone] ?? C.muted} stroke="#fff" strokeWidth={2} /> : null;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Cumulative orders vs cohort" sub="Band is the 25th–75th percentile of the pilot cohort curve">
              <Legend items={[{ label: 'This seller', color: C.s1, kind: 'line' }, { label: 'Cohort median', color: C.muted, kind: 'line' }, { label: 'Cohort p25–p75', color: C.s1, kind: 'band' }]} />
              <div className="chart" style={{ height: 196 }}>
                <ResponsiveContainer>
                  <ComposedChart data={orderData} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke={C.grid} vertical={false} />
                    <XAxis dataKey="day" type="number" domain={[1, selected.day]} {...axisProps} tickFormatter={(d) => `D${d}`} />
                    <YAxis {...axisProps} width={42} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : Math.round(v))} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload;
                      return <TooltipBox title={`Day ${label}`} rows={[['This seller', num(p.actual)], ['Cohort median', num(p.median)], ['Cohort band', `${num(p.band[0])}–${num(p.band[1])}`]]} />;
                    }} />
                    <Area dataKey="band" stroke="none" fill={C.s1} fillOpacity={0.1} isAnimationActive={false} />
                    <Line dataKey="median" stroke={C.muted} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line dataKey="actual" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card title="What the rules did" sub="Every action for this seller, oldest first">
            <ul className="events">
              {selected.events.map((e, i) => (
                <li key={i}>
                  <div className="d">D{e.day}</div>
                  <div>
                    <div className="row" style={{ gap: 8 }}>
                      <span className="l">{e.label}</span>
                      {!e.auto && <Chip tone="critical">Human</Chip>}
                    </div>
                    <div className="why">{e.reason}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid cols-main-side mt">
        <Card title="The rulebook" sub="Nine automated rules and one human step. Thresholds live in src/config.js.">
          <div className="table-wrap" style={{ maxHeight: 'none' }}>
            <table>
              <thead><tr><th>Stage</th><th>When</th><th>Action</th><th /></tr></thead>
              <tbody>
                {RULES.map((r) => (
                  <tr key={r.id}>
                    <td>{r.stage}</td>
                    <td className="ink2">{r.when}</td>
                    <td>{r.action}</td>
                    <td>{r.auto ? <Chip tone="brand">Automatic</Chip> : <Chip tone="critical">Human</Chip>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Latest activity across the cohort" sub="Newest first">
          <ul className="events">
            {summary.events.slice(0, 12).map((e, i) => (
              <li key={i} className="clickable" style={{ cursor: 'pointer' }} onClick={() => select(e.seller.id)}>
                <div className="d">{e.seller.day - e.day === 0 ? 'today' : `${e.seller.day - e.day}d ago`}</div>
                <div>
                  <div className="l">{e.label}</div>
                  <div className="who">{e.seller.name} · {e.seller.cluster}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
