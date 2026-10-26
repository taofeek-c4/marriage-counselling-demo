// App state, test-account storage and booking slots.
// Prototype only: everything is saved in this browser's localStorage.

export const AGES = ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'];
export const GENDERS = ['Woman', 'Man', 'Non-binary', 'Prefer to self-describe', 'Prefer not to say'];
export const STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA', 'Outside Australia'];
export const LENGTHS = ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10–20 years', '20+ years'];
export const DURATIONS = ['A few weeks', 'A few months', 'About a year', 'Longer than a year'];
export const STATUS = {
  couple: ['Married', 'Engaged', 'De facto / living together', 'Dating', 'Separated, exploring reconciliation', 'Something else'],
  individual: ['Single', 'Dating', 'In a relationship', 'Married (attending alone)', 'Separated or divorced', 'Widowed'],
};
export const CONCERNS = {
  couple: ['Communication', 'Recurring conflict', 'Trust', 'Infidelity', 'Intimacy', 'Finances', 'Parenting', 'In-laws & family', 'Life transitions', 'Pre-marriage', 'Considering separation', 'Co-parenting after separation'],
  individual: ['Dating & meeting someone', 'Breakup or divorce', 'Loneliness', 'Self-esteem', 'Boundaries', 'Recurring relationship patterns', 'Grief & loss', 'Deciding whether to stay', 'Family relationships', 'Anxiety in relationships'],
};
export const FORMATS = { video: 'Video', phone: 'Phone', inperson: 'In person', chat: 'Text chat' };
export const SAFE = { yes: 'Yes', sometimes: 'Not always', no: 'No', skip: 'Preferred not to say' };
export const URGENCY = { asap: 'As soon as possible', '2w': 'Within 2 weeks', flex: 'Flexible' };
export const AWARE = { yes: 'Decided together', told: 'Aware, unsure', no: 'Not yet' };

// The practice has a single consultant. Placeholder details — replace with the client's.
export const COUNSELLOR = {
  name: 'Sarah Whitfield', first: 'Sarah', initials: 'SW',
  role: 'Couples & relationship counsellor',
  bio: 'Sarah has spent fifteen years helping couples and individuals untangle the patterns that keep them stuck — and find their way back to each other, or forward on their own.',
  specialties: ['Communication', 'Trust & infidelity', 'Pre-marriage', 'Parenting', 'Separation', 'Individual sessions'],
  formats: 'Video, phone, text chat or in person',
  hours: 'Mon–Fri 9am–7pm · Sat mornings',
};

export function blankForm() {
  return {
    type: '', status: '', anonymous: false,
    you: { name: '', preferred: '', alias: '', email: '', phone: '', age: '', gender: '', state: '' },
    partner: { name: '', alias: '', age: '', gender: '', email: '', aware: '' },
    rel: { length: '', living: '', children: '', previous: '', concerns: [], story: '', goals: '' },
    safety: { feelSafe: '', contact: [] },
    prefs: { format: '', days: [], times: [], urgency: '' },
    consent: { read: false, limits: false, notEmergency: false, share: false, sig: '', partnerMode: '', partnerRead: false, partnerSig: '' },
  };
}

export const state = {
  route: 'home', param: null, menuOpen: false,
  // intake
  step: 0, form: blankForm(), errors: {},
  // user account
  welcomeId: null, rebook: false, picker: { day: null, slot: null },
  // partner consent page
  pc: { read: false, sig: '' }, pcErr: {}, pcDone: false,
  // consultant
  filter: 'all', openId: null, offering: false,
};

/* ---------- persistence ---------- */
const KEY = 'ycm_prototype_v2';
function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch { return []; }
}
export const db = { accounts: load() };
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db.accounts)); } catch { /* storage blocked: keep in memory */ }
}
export function clearAll() {
  db.accounts = [];
  try { localStorage.removeItem(KEY); localStorage.removeItem('ycm_intakes_v1'); } catch { /* ignore */ }
}
export function newRef() {
  let ref;
  do { ref = 'YCM-' + Math.floor(1000 + Math.random() * 9000); } while (db.accounts.some(r => r.ref === ref));
  return ref;
}

/* ---------- record helpers ---------- */
export const byId = id => db.accounts.find(r => r.id === id);
export const isCouple = (f = state.form) => f.type === 'couple';
export const selfName = f => f.anonymous ? (f.you.alias || 'You') : (f.you.name || 'You');
export const partnerName = f => f.anonymous ? (f.partner.alias || 'Your partner') : (f.partner.name || 'Your partner');
export const recName = r => isCouple(r) ? `${selfName(r)} & ${partnerName(r)}` : selfName(r);
export const callName = r => r.anonymous ? r.you.alias : (r.you.preferred || r.you.name.split(' ')[0]);
export const consentDone = r => !isCouple(r) || (r.consent.partnerMode === 'now' && !!r.consent.partnerSig);
export const flagged = r => !!r.safety.feelSafe && r.safety.feelSafe !== 'yes';

export function addMessage(r, from, text) {
  r.messages.push({ from, text, at: Date.now() });
  if (from === 'client') r.unreadC = (r.unreadC || 0) + 1;
  if (from === 'consultant') r.unreadU = (r.unreadU || 0) + 1;
}

/* ---------- booking slots ---------- */
const TIMES = [[9, 0], [11, 0], [14, 0], [17, 30], [19, 0]];

// Next n working days from tomorrow (Mon–Sat), as ISO strings at local midnight.
export function slotDays(n = 7) {
  const out = [], d = new Date();
  d.setHours(0, 0, 0, 0);
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) out.push(d.toISOString());
  }
  return out;
}
export function slotsFor(dayIso) {
  const day = new Date(dayIso), sat = day.getDay() === 6;
  return TIMES.filter(([h]) => !sat || h < 12).map(([h, m]) => {
    const s = new Date(day); s.setHours(h, m, 0, 0); return s.toISOString();
  });
}
export const slotOwner = iso => db.accounts.find(r => r.booking && r.booking.slot === iso);
export const freeSlots = (dayIso, self) => slotsFor(dayIso).filter(s => { const o = slotOwner(s); return !o || o === self; });
