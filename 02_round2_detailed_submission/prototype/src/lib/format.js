const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const inr1 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const sum = (arr) => arr.reduce((s, x) => s + x, 0);
export const mean = (arr) => (arr.length ? sum(arr) / arr.length : 0);

export function median(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function quantile(arr, q) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

export const num = (x) => inr.format(Math.round(x));
export const rupees = (x) => `₹${inr.format(Math.round(x))}`;
export const crore = (x) => `₹${inr1.format(x)} cr`;
export const pct = (x, digits = 0) => `${(x * 100).toFixed(digits)}%`;
export const signedPct = (x, digits = 1) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(digits)}%`;

export function compact(x) {
  if (Math.abs(x) >= 1e7) return `${(x / 1e7).toFixed(1)} cr`;
  if (Math.abs(x) >= 1e5) return `${(x / 1e5).toFixed(1)} L`;
  if (Math.abs(x) >= 1e3) return `${(x / 1e3).toFixed(1)}K`;
  return `${Math.round(x)}`;
}

export function toCsv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

export function downloadCsv(filename, rows) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
