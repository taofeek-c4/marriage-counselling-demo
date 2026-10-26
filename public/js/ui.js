// Shared UI helpers: escaping, icons, logo, formatting, form controls, toast.
import { state, isCouple } from './store.js';

export const $ = (s, r = document) => r.querySelector(s);
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const getP = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
export const setP = (o, p, v) => { const ks = p.split('.'), last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; };
export const initials = n => (n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

const I = {
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  swap: '<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
  alert: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4M12 17v.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
  file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  heart: '<path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20z"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
};
export const icon = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

// Hand-drawn stand-in for the client's tree mark. Replace with their real SVG logo.
export const mark = () => `<svg class="mark" viewBox="0 0 100 132" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.2" aria-hidden="true">
  <path stroke="#7a8a4c" d="M40 130V96c0-9-7-12-13-16-8-6-9-19 1-23 9-3 15 6 10 12-4 4-10 1-8-4"/>
  <path stroke="#1a9592" d="M50 130V66c0-9 8-12 10-20 3-11-5-20-15-18-10 2-11 15-3 17 6 1 8-7 3-8"/>
  <path stroke="#1a9592" d="M50 84c0-8 12-10 16-19 4-9-1-16 5-25 6-10 20-8 21 2 1 9-9 13-13 7-3-4 1-9 5-7"/>
  <path stroke="#5aa6bf" d="M60 130V92c0-8 10-10 16-16 7-8 5-19-5-20-8-1-10 9-4 11 4 1 7-3 4-6"/>
</svg>`;
export const logo = (href = '#/') => `<a class="brand" href="${href}" aria-label="Your Counselling Matters — home"><span class="wordmark"><b>YOUR</b><span>COUNSELLING</span><i>MATTERS</i></span>${mark()}</a>`;

// Brand stripes (from the helmet artwork) as parallel diagonal bands.
export const stripes = (cls, start = 46, slope = 1.1) => `<svg class="${cls}" viewBox="0 0 100 108" preserveAspectRatio="none" aria-hidden="true">${
  ['--mint', '--sun', '--tangerine', '--clay'].map((c, i) => {
    const a = start + i * 11, x = y => ((108 - y) / slope).toFixed(1);
    return `<polygon fill="var(${c})" points="0,${a} 0,${a + 7} ${x(a + 7)},108 ${x(a)},108"/>`;
  }).join('')}</svg>`;

/* ---------- formatting ---------- */
export const fmtDay = iso => new Date(iso).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtTime = iso => new Date(iso).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).replace(/\s/g, '').toLowerCase();
export const fmtSlot = iso => `${fmtDay(iso)} · ${fmtTime(iso)}`;
export const fmtDate = t => new Date(t).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
export function ago(t) {
  const m = Math.round((Date.now() - t) / 6e4);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/* ---------- shared components ---------- */
export function avatar(r, size = '') {
  if (r.anonymous) return `<span class="av anon ${size}">${icon('eyeOff', size === 'sm' ? 14 : 18)}</span>`;
  const txt = isCouple(r) ? initials(r.you.name)[0] + initials(r.partner.name)[0] : initials(r.you.name);
  return `<span class="av ${size}" style="background:${isCouple(r) ? 'var(--teal)' : 'var(--olive)'}">${txt}</span>`;
}
export const apptDate = iso => {
  const d = new Date(iso);
  return `<div class="appt-date"><small>${d.toLocaleDateString('en-AU', { month: 'short' })}</small><b>${d.getDate()}</b></div>`;
};
export const kv = rows => `<div class="kv">${rows.filter(x => x[1]).map(([a, b]) => `<div><small>${a}</small><span>${esc(b)}</span></div>`).join('')}</div>`;
export const emptyState = (title, text, actions = '') => `<div class="empty-state">${mark()}<h2>${title}</h2><p>${text}</p>${actions ? `<div class="empty-actions">${actions}</div>` : ''}</div>`;

/* ---------- form controls (bound to state.form via data-bind) ---------- */
const err = p => state.errors[p] ? `<div class="err">${esc(state.errors[p])}</div>` : '';
const reqMark = req => req ? ' <em>*</em>' : ' <span class="opt">optional</span>';

export function inp(p, label, { type = 'text', ph = '', hint = '', req = false, auto = '' } = {}) {
  const mode = type === 'email' ? 'email' : type === 'tel' ? 'tel' : '';
  return `<label class="field ${state.errors[p] ? 'has-err' : ''}"><span class="lbl">${label}${reqMark(req)}</span>
    <input type="${type}" data-bind="${p}" value="${esc(getP(state.form, p))}" placeholder="${esc(ph)}" ${auto ? `autocomplete="${auto}"` : ''} ${mode ? `inputmode="${mode}"` : ''}>
    ${hint ? `<span class="hint">${hint}</span>` : ''}${err(p)}</label>`;
}
export function sel(p, label, options, { req = false } = {}) {
  const v = getP(state.form, p);
  return `<label class="field ${state.errors[p] ? 'has-err' : ''}"><span class="lbl">${label}${reqMark(req)}</span>
    <select data-bind="${p}"><option value="">Select…</option>${options.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>${err(p)}</label>`;
}
export function area(p, label, { ph = '', rows = 4 } = {}) {
  return `<label class="field"><span class="lbl">${label}${reqMark(false)}</span><textarea data-bind="${p}" rows="${rows}" placeholder="${esc(ph)}">${esc(getP(state.form, p))}</textarea></label>`;
}
export function cards(p, options, { cols = 2, big = false } = {}) {
  const v = getP(state.form, p);
  return `<div class="choices cols-${cols} ${big ? 'big' : ''}" role="radiogroup">${options.map(o => {
    const on = v === o.v;
    return `<button type="button" class="choice ${on ? 'on' : ''}" role="radio" aria-checked="${on}" data-action="pick" data-path="${p}" data-value="${esc(o.v)}">
      ${o.ic ? `<span class="choice-ic">${icon(o.ic, big ? 24 : 20)}</span>` : ''}<span><b>${o.t}</b>${o.d ? `<small>${o.d}</small>` : ''}</span>
      <span class="tick">${icon('check', 13)}</span></button>`;
  }).join('')}</div>${err(p)}`;
}
export function chips(p, options) {
  const v = getP(state.form, p);
  return `<div class="chips">${options.map(o => {
    const on = v.includes(o);
    return `<button type="button" class="chip ${on ? 'on' : ''}" aria-pressed="${on}" data-action="toggle" data-path="${p}" data-value="${esc(o)}">${on ? icon('check', 14) : ''}${esc(o)}</button>`;
  }).join('')}</div>${err(p)}`;
}
export function check(p, html, { root = '', checked = getP(state.form, p), error = state.errors[p] } = {}) {
  return `<div class="check-wrap ${error ? 'has-err' : ''}"><label class="check"><input type="checkbox" data-bind="${p}" ${root ? `data-root="${root}"` : ''} ${checked ? 'checked' : ''}><span class="cbox">${icon('check', 14)}</span><span>${html}</span></label>${error ? `<div class="err">${esc(error)}</div>` : ''}</div>`;
}
export const group = (label, inner, hint = '') => `<fieldset class="group"><legend>${label}${hint ? ` <span class="opt">${hint}</span>` : ''}</legend>${inner}</fieldset>`;
export const opts = arr => arr.map(t => ({ v: t, t }));
export const mapOpts = obj => Object.entries(obj).map(([v, t]) => ({ v, t }));

let toastT;
export function toast(msg) {
  const t = $('#toast');
  t.innerHTML = icon('check', 16) + esc(msg);
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2800);
}
