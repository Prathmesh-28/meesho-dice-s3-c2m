import { useEffect, useState } from 'react';

// Hash routing, so every screen has a link the deck can point to and the
// single-file build works when opened straight from disk.

export function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  return { path: path || 'overview', params: Object.fromEntries(new URLSearchParams(qs ?? '')) };
}

export function href(path, params) {
  const qs = params ? new URLSearchParams(params).toString() : '';
  return `#/${path}${qs ? `?${qs}` : ''}`;
}

export function go(path, params) {
  window.location.hash = href(path, params);
}

// Update query params without adding a history entry or scrolling.
export function setParams(params) {
  const { path, params: current } = parseHash();
  const next = { ...current, ...params };
  for (const k of Object.keys(next)) if (next[k] == null || next[k] === '') delete next[k];
  window.history.replaceState(null, '', href(path, next));
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
