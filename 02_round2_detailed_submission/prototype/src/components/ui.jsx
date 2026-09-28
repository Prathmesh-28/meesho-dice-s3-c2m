import { useMemo, useState } from 'react';

// Chart colours, mirrored from styles.css so Recharts (SVG attributes) can use them.
export const C = {
  s1: '#2a78d6',
  s1Wash: '#2a78d6',
  s2: '#eb6834',
  s3: '#1baf7a',
  deemph: '#a3a19a',
  ink: '#0b0b0b',
  ink2: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  surface: '#fcfcfb',
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
  plum: '#5a1646',
};

export const axisProps = {
  stroke: C.axis,
  tick: { fill: C.muted, fontSize: 11 },
  tickLine: false,
};

const ICONS = { good: '✓', warning: '!', serious: '!', critical: '✕', neutral: '•', brand: '•' };

export function Chip({ tone = 'neutral', children, title }) {
  return (
    <span className={`chip ${tone}`} title={title}>
      <span className="ic" aria-hidden>{ICONS[tone]}</span>
      {children}
    </span>
  );
}

export function Stat({ label, value, note, hero }) {
  return (
    <div className={`stat${hero ? ' stat-hero' : ''}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {note && <div className="note">{note}</div>}
    </div>
  );
}

export function Card({ title, sub, actions, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-head">
          <div>
            {title && <h3>{title}</h3>}
            {sub && <div className="sub">{sub}</div>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Seg({ options, value, onChange, label }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)} type="button">
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Meter({ label, value, weight, tone }) {
  return (
    <div className="meter">
      <div>
        {label} <span className="w">×{weight}</span>
      </div>
      <div className="track">
        <div className={`fill ${tone ?? ''}`} style={{ width: `${Math.max(2, value)}%` }} />
      </div>
      <div className="v">{Math.round(value)}</div>
    </div>
  );
}

export function Sparkline({ values, width = 90, height = 24, max = 100, color = C.s1 }) {
  if (!values.length) return null;
  const step = width / Math.max(1, values.length - 1);
  const y = (v) => height - 2 - (v / max) * (height - 4);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = values.at(-1);
  return (
    <svg width={width} height={height} aria-hidden>
      <line x1="0" x2={width} y1={y(80)} y2={y(80)} stroke={C.grid} strokeWidth="1" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(values.length - 1) * step} cy={y(last)} r="2.6" fill={color} stroke="#fff" strokeWidth="1" />
    </svg>
  );
}

export function Legend({ items }) {
  return (
    <div className="legend">
      {items.map((it) => (
        <span className="key" key={it.label}>
          <span className={`sw ${it.kind ?? ''}`} style={{ background: it.color, borderBottomColor: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function TooltipBox({ title, rows }) {
  return (
    <div className="tooltip">
      {title && <div className="t">{title}</div>}
      {rows.map(([k, v]) => (
        <div className="r" key={k}>
          <span>{k}</span>
          <b>{v}</b>
        </div>
      ))}
    </div>
  );
}

// Sortable table state: click a header to sort, click again to flip.
export function useSort(rows, initialKey, initialDir = 'desc') {
  const [key, setKey] = useState(initialKey);
  const [dir, setDir] = useState(initialDir);
  const sorted = useMemo(() => {
    const out = rows.slice();
    out.sort((a, b) => {
      const va = typeof key === 'function' ? key(a) : a[key];
      const vb = typeof key === 'function' ? key(b) : b[key];
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return dir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [rows, key, dir]);
  const header = (k, label, className = '') => (
    <th
      className={`sortable ${className}`}
      onClick={() => {
        if (k === key) setDir(dir === 'asc' ? 'desc' : 'asc');
        else {
          setKey(k);
          setDir('desc');
        }
      }}
      aria-sort={k === key ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label} {k === key ? (dir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );
  return { sorted, header };
}
