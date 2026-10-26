// Entry point: hash router, rendering and all user actions.
import { state, db, save, clearAll, byId, blankForm, newRef, addMessage, isCouple, selfName, partnerName, COUNSELLOR } from './store.js';
import { $, getP, setP, fmtSlot, toast } from './ui.js';
import { protoBar, siteHeader, footer, home } from './views/site.js';
import { activeSteps, validate, register } from './views/intake.js';
import { accounts, account, partnerConsent } from './views/account.js';
import { consultant } from './views/consultant.js';

/* ---------- routing ---------- */
const ROUTES = ['home', 'register', 'accounts', 'account', 'consent', 'consultant'];

export function go(path) {
  const h = '#/' + path;
  if (location.hash === h || (!path && !location.hash)) route(); else location.hash = h;
}

function route() {
  const [name, param = null] = location.hash.replace(/^#\/?/, '').split('/');
  const next = ROUTES.includes(name) ? name : 'home';
  if (next !== state.route || param !== state.param) {
    state.menuOpen = false;
    state.rebook = false;
    state.offering = false;
    state.picker = { day: null, slot: null };
    if (next !== 'consultant') state.openId = null;
    if (next === 'consent') { state.pc = { read: false, sig: '' }; state.pcErr = {}; state.pcDone = false; }
  }
  state.route = next;
  state.param = param;
  if (next === 'account') { const r = byId(param); if (r?.unreadU) { r.unreadU = 0; save(); } }
  render();
  window.scrollTo(0, 0);
}

function render() {
  const { route: r } = state;
  const drawerScroll = $('.drawer-b')?.scrollTop;
  let body;
  if (r === 'consultant') body = consultant();
  else if (r === 'accounts') body = accounts();
  else if (r === 'account') body = account(byId(state.param));
  else if (r === 'consent') body = partnerConsent(byId(state.param));
  else body = siteHeader() + `<main>${r === 'register' ? register() : home()}</main>` + footer();

  $('#app').innerHTML = protoBar() + body;
  document.body.classList.toggle('lock', (r === 'consultant' && !!state.openId) || state.menuOpen);
  document.body.classList.toggle('has-sticky-nav', r === 'register');
  if (drawerScroll != null && $('.drawer-b')) $('.drawer-b').scrollTop = drawerScroll;
  document.querySelectorAll('[data-thread]').forEach(t => { t.scrollTop = t.scrollHeight; });
}

const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
const resetPicker = () => { state.picker = { day: null, slot: null }; };

function submitIntake() {
  const id = 'u' + Date.now().toString(36);
  const rec = { ...structuredClone(state.form), id, ref: newRef(), createdAt: Date.now(), stage: 'new', booking: null, messages: [], unreadC: 0, unreadU: 0 };
  if (isCouple(rec) && rec.consent.partnerMode === 'later') {
    rec.messages.push({ from: 'system', text: rec.anonymous ? 'Private consent link created for your partner' : `Consent form emailed to ${rec.partner.email}`, at: Date.now() });
  }
  db.accounts.push(rec);
  save();
  state.form = blankForm();
  state.step = 0;
  state.errors = {};
  state.welcomeId = id;
  go('account/' + id);
}

/* ---------- click actions (data-action="…") ---------- */
const ACTIONS = {
  // site
  menu() { state.menuOpen = !state.menuOpen; render(); },
  scroll(t) {
    const jump = () => document.getElementById(t.dataset.target)?.scrollIntoView({ behavior: 'smooth' });
    state.menuOpen = false;
    if (state.route !== 'home') { go(''); setTimeout(jump, 80); } else { render(); jump(); }
  },
  jump(t) {
    if (t.dataset.target === 'top') return toTop();
    document.getElementById(t.dataset.target)?.scrollIntoView({ behavior: 'smooth' });
  },
  exit() { location.replace('https://www.google.com.au'); },
  copy(t) {
    navigator.clipboard?.writeText(t.dataset.text).then(() => toast('Copied to clipboard'), () => toast('Copy failed — select and copy manually'));
  },

  // intake form
  pick(t) {
    const p = t.dataset.path, v = t.dataset.value;
    if (p === 'type' && state.form.type !== v) state.form.status = '';
    setP(state.form, p, v);
    delete state.errors[p];
    render();
  },
  toggle(t) {
    const p = t.dataset.path, v = t.dataset.value, arr = getP(state.form, p), i = arr.indexOf(v);
    if (i >= 0) arr.splice(i, 1); else arr.push(v);
    // "In-app messages only" excludes the other contact methods
    if (p === 'safety.contact' && i < 0) {
      if (v === 'In-app messages only') arr.splice(0, arr.length, v);
      else { const j = arr.indexOf('In-app messages only'); if (j >= 0) arr.splice(j, 1); }
    }
    delete state.errors[p];
    render();
  },
  anon() { state.form.anonymous = !state.form.anonymous; state.errors = {}; render(); },
  next() {
    const s = activeSteps()[state.step];
    const e = validate(s.id);
    if (Object.keys(e).length) {
      state.errors = e;
      render();
      document.querySelector('.has-err, .err')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    state.errors = {};
    if (s.id === 'review') return submitIntake();
    state.step++;
    render();
    toTop();
  },
  back() { state.step = Math.max(0, state.step - 1); state.errors = {}; render(); toTop(); },
  goto(t) { state.step = +t.dataset.step; state.errors = {}; render(); toTop(); },

  // user account
  dismissWelcome() { state.welcomeId = null; render(); },
  pickDay(t) { state.picker.day = t.dataset.day; state.picker.slot = null; render(); },
  pickSlot(t) { state.picker.slot = t.dataset.slot; render(); },
  requestSlot(t) {
    const r = byId(t.dataset.id), s = state.picker.slot;
    if (!s) return;
    const change = !!r.booking;
    r.booking = { slot: s, status: 'requested' };
    addMessage(r, 'system', `${change ? 'New time requested' : 'Session requested'}: ${fmtSlot(s)}`);
    state.rebook = false;
    state.welcomeId = null;
    resetPicker();
    save(); render(); toast(`Requested ${fmtSlot(s)}`);
  },
  rebook() { state.rebook = true; resetPicker(); render(); },
  rebookCancel() { state.rebook = false; render(); },
  cancelBooking(t) {
    const r = byId(t.dataset.id);
    if (!confirm('Cancel this session?')) return;
    addMessage(r, 'system', `Session cancelled: ${fmtSlot(r.booking.slot)}`);
    r.booking = null;
    save(); render(); toast('Session cancelled');
  },
  resend(t) { toast(`Consent form re-sent to ${byId(t.dataset.id).partner.email}`); },
  partnerSign(t) {
    const r = byId(t.dataset.id), pc = state.pc;
    state.pcErr = {};
    if (!pc.read) state.pcErr.read = true;
    if (!pc.sig.trim()) state.pcErr.sig = true;
    if (Object.keys(state.pcErr).length) { render(); return; }
    Object.assign(r.consent, { partnerMode: 'now', partnerRead: true, partnerSig: pc.sig.trim(), partnerSignedAt: Date.now(), viaLink: true });
    addMessage(r, 'system', `${partnerName(r)} signed the consent form`);
    state.pcDone = true;
    save(); render(); toTop();
  },
  clearAll() {
    if (!confirm('Delete all test user accounts, bookings and messages from this browser?')) return;
    clearAll();
    state.openId = null;
    state.filter = 'all';
    render(); toast('All test data deleted');
  },

  // consultant
  filter(t) {
    state.filter = t.dataset.f;
    render();
    document.getElementById('queue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  open(t) {
    const r = byId(t.dataset.id);
    state.openId = r.id;
    state.offering = false;
    resetPicker();
    if (r.unreadC) { r.unreadC = 0; save(); }
    render();
  },
  close() { state.openId = null; state.offering = false; render(); },
  offer() {
    state.offering = !state.offering;
    resetPicker();
    render();
    const d = $('.drawer-b');
    if (d && state.offering) d.scrollTop = 0;
  },
  offerSlot(t) {
    const r = byId(t.dataset.id), s = state.picker.slot;
    if (!s) return;
    r.booking = { slot: s, status: 'confirmed' };
    addMessage(r, 'system', `${COUNSELLOR.first} booked your session: ${fmtSlot(s)}`);
    r.unreadU = (r.unreadU || 0) + 1;
    state.offering = false;
    save(); render(); toast(`Booked ${fmtSlot(s)}`);
  },
  confirmBooking(t) {
    const r = byId(t.dataset.id);
    r.booking.status = 'confirmed';
    addMessage(r, 'system', `${COUNSELLOR.first} confirmed your session: ${fmtSlot(r.booking.slot)}`);
    r.unreadU = (r.unreadU || 0) + 1;
    save(); render(); toast('Session confirmed');
  },
  reviewed(t) { byId(t.dataset.id).stage = 'reviewed'; save(); render(); toast('Marked as reviewed'); },
  remind(t) {
    const r = byId(t.dataset.id);
    toast(r.anonymous ? `Reminder sent to ${selfName(r)} to reshare the link` : `Consent reminder emailed to ${r.partner.email}`);
  },
};

/* ---------- message forms (data-submit="…") ---------- */
const SUBMITS = {
  sendClient(r, text) { addMessage(r, 'client', text); },
  sendConsultant(r, text) { addMessage(r, 'consultant', text); toast('Message sent securely'); },
};

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-action]');
  if (!t || !ACTIONS[t.dataset.action]) return;
  e.preventDefault();
  ACTIONS[t.dataset.action](t);
});

document.addEventListener('submit', e => {
  const f = e.target, fn = SUBMITS[f.dataset.submit];
  if (!fn) return;
  e.preventDefault();
  const text = f.msg.value.trim();
  if (!text) return;
  fn(byId(f.dataset.id), text);
  save();
  render();
});

// Keep form fields in sync with state without re-rendering (so focus isn't lost)
function bind(e) {
  const el = e.target, p = el.dataset?.bind;
  if (!p) return;
  const root = el.dataset.root ? state[el.dataset.root] : state.form;
  setP(root, p, el.type === 'checkbox' ? el.checked : el.value);
  const errs = el.dataset.root ? state.pcErr : state.errors;
  if (errs[p]) {
    delete errs[p];
    const w = el.closest('.field, .check-wrap');
    w?.classList.remove('has-err');
    w?.querySelector('.err')?.remove();
  }
}
document.addEventListener('input', bind);
document.addEventListener('change', bind);

// Composer: grow with content
document.addEventListener('input', e => {
  if (e.target.matches('.composer textarea')) { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (state.openId) ACTIONS.close();
  else if (state.menuOpen) ACTIONS.menu();
});

window.addEventListener('hashchange', route);
route();

// Hero headline: "Reclaim you." ↔ "Reclaim us."
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    const el = $('#rot');
    if (!el) return;
    el.classList.add('out');
    setTimeout(() => { el.textContent = el.textContent === 'you' ? 'us' : 'you'; el.classList.remove('out'); }, 350);
  }, 2800);
}
