import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { EXPERIMENT } from '../config.js';
import { runExperiment } from '../lib/experiment.js';
import { categoryById } from '../lib/generate.js';
import { setParams } from '../lib/router.js';
import { pct, signedPct } from '../lib/format.js';
import { C, Card, Chip, Legend, Seg, Stat, TooltipBox, axisProps } from '../components/ui.jsx';

const ICON = { fund: '✓', tighten: '!', stop: '✕' };

export default function Experiment({ pti, gate, params }) {
  const scenario = EXPERIMENT.scenarios[params.scenario] ? params.scenario : 'base';
  const run = useMemo(() => runExperiment(pti, gate, scenario), [pti, gate, scenario]);
  const cfg = EXPERIMENT;

  const rules = [
    { code: 'fund', text: `Badged NMV per live SKU beats holdout by ≥ ${cfg.fundLift * 100}% (interval above zero) → fund clusters and nodes` },
    { code: 'tighten', text: `Lift positive but under ${cfg.fundLift * 100}% → tighten gate to ${cfg.tightenedDelta * 100}% and re-run 28 days` },
    { code: 'stop', text: `No lift, or under ${cfg.retentionFloor * 100}% of badged sellers still clear the gate at D14 → stop` },
  ];

  const design = [
    ['Unit of analysis', 'Seller catalogue, not SKU'],
    ['Population', `C2M-ready sellers from the Price Truth Index (${run.treatment.length + run.control.length})`],
    ['Assignment', 'Randomised within category; best-balanced of 400 draws selected'],
    ['Treatment', `C2M badge + ranking treatment (${run.treatment.length} sellers)`],
    ['Control', `Matched holdout, no badge (${run.control.length} sellers)`],
    ['Primary metric', 'NMV per live SKU, difference-in-differences vs 14-day pre-period'],
    ['Secondary', 'Gate retention at D14 and D28'],
    ['Guardrails', `Category NMV must not fall; badged listings ≤ ${cfg.impressionCap * 100}% of category impressions`],
    ['Duration', `${cfg.days} days, weekly re-score`],
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">Module 2 · The Day-30 decision</div>
          <h2>Did the badge move buyers, and did the price edge hold?</h2>
          <p className="lede">
            C2M-ready sellers are split into a badged group and a matched holdout. After {cfg.days} days the rule reads
            three numbers and says fund, tighten or stop, before any capex is committed. The data is simulated, so
            switch the scenario to see each branch fire.
          </p>
        </div>
        <Seg
          label="Scenario"
          value={scenario}
          onChange={(v) => setParams({ scenario: v === 'base' ? null : v })}
          options={Object.entries(cfg.scenarios).map(([value, s]) => ({ value, label: s.label }))}
        />
      </div>

      <div className={`decision ${run.decision.code}`}>
        <div className="big-ic" aria-hidden>{ICON[run.decision.code]}</div>
        <div style={{ flex: 1 }}>
          <div className="eyebrow">Day-30 decision · {cfg.scenarios[scenario].label}</div>
          <h3>{run.decision.title}</h3>
          <p>{run.decision.detail}</p>
          <ul className="rule-list">
            {rules.map((r) => (
              <li key={r.code} className={r.code === run.decision.code ? 'hit' : ''}>
                {r.code === run.decision.code ? '▶ ' : '· '}{r.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="stats mt">
        <Stat hero label="NMV per live SKU vs holdout" value={signedPct(run.lift)} note={`95% interval ${signedPct(run.ci[0])} to ${signedPct(run.ci[1])}`} />
        <Stat hero label="Badged sellers still clearing at D14" value={pct(run.retention14)} note={`floor ${pct(cfg.retentionFloor)}`} />
        <Stat label="Badged share of impressions" value={pct(run.maxImpressionShare)} note={run.capped.length ? `cap binding in ${run.capped.map((c) => categoryById[c.category].short).join(', ')}` : `highest category · cap ${pct(cfg.impressionCap)}`} />
        <Stat label="Category NMV vs pre-period" value={signedPct(run.categoryNmvChange)} note="guardrail: must not fall" />
        <Stat label="Sellers in the test" value={`${run.treatment.length} + ${run.control.length}`} note="badged + holdout" />
      </div>

      <div className="grid cols-main-side">
        <Card title="NMV per live SKU, indexed to the pre-period" sub="Mean across sellers; 100 = the 14 days before the badge went on">
          <Legend items={[{ label: 'Badged', color: C.s1, kind: 'line' }, { label: 'Holdout', color: C.s2, kind: 'line' }]} />
          <div className="chart" style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={run.daily} margin={{ top: 10, right: 16, bottom: 18, left: 0 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="day" type="number" domain={[-cfg.preDays, cfg.days - 1]} ticks={[-14, -7, 0, 7, 14, 21, 27]} {...axisProps} tickFormatter={(d) => (d === 0 ? 'D0' : d > 0 ? `D${d}` : `${d}`)} label={{ value: 'Days from badge on', position: 'insideBottom', offset: -10, fill: C.muted, fontSize: 11 }} />
                <YAxis {...axisProps} domain={[70, 140]} ticks={[70, 80, 90, 100, 110, 120, 130, 140]} width={36} />
                <ReferenceLine x={0} stroke={C.plum} label={{ value: 'Badge on', position: 'insideTopLeft', fill: C.plum, fontSize: 11 }} />
                <ReferenceLine y={100} stroke={C.axis} />
                <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                  <TooltipBox title={`Day ${label}`} rows={payload.map((p) => [p.dataKey === 'treatment' ? 'Badged' : 'Holdout', p.value.toFixed(1)])} />
                ) : null} />
                <Line dataKey="treatment" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line dataKey="control" stroke={C.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Gate retention" sub="Share of badged sellers whose catalogue still passes the gate">
          <div className="chart" style={{ height: 322 }}>
            <ResponsiveContainer>
              <LineChart data={run.retention.map((r) => ({ ...r, pctv: r.share * 100 }))} margin={{ top: 10, right: 16, bottom: 18, left: 0 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="day" type="number" domain={[0, cfg.days]} ticks={[0, 7, 14, 21, 28]} {...axisProps} tickFormatter={(d) => `D${d}`} />
                <YAxis {...axisProps} domain={[0, 100]} ticks={[0, 25, 50, 70, 100]} tickFormatter={(v) => `${v}%`} width={40} />
                <ReferenceLine y={cfg.retentionFloor * 100} stroke={C.critical} label={{ value: `Floor ${cfg.retentionFloor * 100}%`, position: 'insideBottomRight', fill: C.critical, fontSize: 11 }} />
                <ReferenceLine x={14} stroke={C.axis} label={{ value: 'D14 check', position: 'insideTopRight', fill: C.muted, fontSize: 11 }} />
                <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                  <TooltipBox title={`Day ${label}`} rows={[['Still clearing', `${payload[0].value.toFixed(0)}%`]]} />
                ) : null} />
                <Line dataKey="pctv" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid cols-2 mt">
        <Card title="Balance check" sub="Badged and holdout groups before the badge. |SMD| under 0.1 counts as balanced.">
          <div className="table-wrap" style={{ maxHeight: 'none' }}>
            <table>
              <thead><tr><th>Covariate</th><th className="num">Badged</th><th className="num">Holdout</th><th className="num">SMD</th><th /></tr></thead>
              <tbody>
                {run.balanceRows.map((r) => (
                  <tr key={r.label}>
                    <td>{r.label}</td>
                    <td className="num">{r.treatment.toFixed(r.digits)}</td>
                    <td className="num">{r.control.toFixed(r.digits)}</td>
                    <td className="num">{r.smd.toFixed(2)}</td>
                    <td>{Math.abs(r.smd) < 0.1 ? <Chip tone="good">Balanced</Chip> : <Chip tone="warning">Check</Chip>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Experiment design" sub="The Round 1 idea translated into a measurable pilot">
          <div className="kv">
            {design.flatMap(([k, v]) => [<div key={`${k}k`}>{k}</div>, <div key={`${k}v`}>{v}</div>])}
          </div>
        </Card>
      </div>
    </div>
  );
}
