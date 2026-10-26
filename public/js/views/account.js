// User side after the intake: list of test accounts, a user's dashboard, and the partner consent page.
import { state, db, isCouple, selfName, partnerName, recName, callName, consentDone, COUNSELLOR, FORMATS, SAFE, URGENCY, slotDays, slotsFor, slotOwner, freeSlots } from '../store.js';
import { icon, esc, logo, avatar, kv, apptDate, emptyState, ago, fmtDay, fmtTime, fmtSlot, fmtDate } from '../ui.js';
import { consentDoc } from './intake.js';

export const appHeader = (right = '') => `<header class="site-header"><div class="wrap nav">${logo()}<div class="nav-right">${right}</div></div></header>`;
export const consentLink = r => `${location.origin}${location.pathname}#/consent/${r.id}`;

/* ---------- shared with the consultant view ---------- */
export function slotPicker(r) {
  const days = slotDays();
  if (!days.includes(state.picker.day)) state.picker.day = days.find(d => freeSlots(d, r).length) || days[0];
  const day = state.picker.day;
  return `<div class="picker">
    <div class="days" aria-label="Choose a day">${days.map(d => {
      const dt = new Date(d), on = d === day, free = freeSlots(d, r).length;
      return `<button type="button" class="day ${on ? 'on' : ''}" data-action="pickDay" data-day="${d}" aria-pressed="${on}" ${free ? '' : 'disabled'}><small>${dt.toLocaleDateString('en-AU', { weekday: 'short' })}</small><b>${dt.getDate()}</b></button>`;
    }).join('')}</div>
    <div class="times" aria-label="Choose a time">${slotsFor(day).map(s => {
      const o = slotOwner(s), taken = o && o !== r, on = state.picker.slot === s;
      return `<button type="button" class="time ${on ? 'on' : ''}" data-action="pickSlot" data-slot="${s}" aria-pressed="${on}" ${taken ? `disabled aria-label="${fmtTime(s)}, already booked"` : ''}>${fmtTime(s)}</button>`;
    }).join('')}</div>
  </div>`;
}

export function thread(r, viewer) {
  if (!r.messages.length) {
    return `<div class="thread-empty">${viewer === 'client'
      ? `No messages yet. Say hello — ${COUNSELLOR.first} will reply here${r.anonymous ? ' and your identity stays private' : ''}.`
      : 'No messages yet.'}</div>`;
  }
  return `<div class="thread" data-thread>${r.messages.map(m => m.from === 'system'
    ? `<div class="sys">${esc(m.text)} · ${ago(m.at).toLowerCase()}</div>`
    : `<div class="bubble ${m.from === viewer ? 'me' : 'them'}">${esc(m.text)}<small>${m.from === viewer ? 'You' : m.from === 'client' ? esc(selfName(r)) : COUNSELLOR.first} · ${ago(m.at).toLowerCase()}</small></div>`).join('')}</div>`;
}

export const composer = (action, id, ph) => `<form class="composer" data-submit="${action}" data-id="${id}">
  <textarea name="msg" rows="1" placeholder="${esc(ph)}" aria-label="Message"></textarea>
  <button class="btn btn-primary" aria-label="Send message">${icon('send', 18)}</button></form>`;

/* ---------- account list ---------- */
function accRow(r) {
  const b = r.booking;
  return `<a class="acc" href="#/account/${r.id}">${avatar(r)}
    <span class="acc-main"><b>${esc(recName(r))}</b><small>${isCouple(r) ? 'Couple' : 'Individual'}${r.anonymous ? ' · Anonymous' : ''} · ${r.ref} · joined ${ago(r.createdAt).toLowerCase()}</small>
      <span class="badges">${b
        ? `<span class="badge ${b.status === 'confirmed' ? 'sky' : 'warn'}">${icon('cal', 12)} ${b.status === 'confirmed' ? 'Booked' : 'Requested'} ${fmtSlot(b.slot)}</span>`
        : '<span class="badge">No session booked</span>'}
        ${consentDone(r) ? '' : '<span class="badge warn">Partner consent pending</span>'}
        ${r.unreadU ? `<span class="badge teal">${icon('chat', 12)} ${r.unreadU} new</span>` : ''}</span>
    </span>${icon('chevR', 20)}</a>`;
}

export function accounts() {
  const list = [...db.accounts].sort((a, b) => b.createdAt - a.createdAt);
  return appHeader(`<a class="btn btn-ghost btn-sm" href="#/">${icon('arrowL', 15)} Website</a>`) + `<main class="wrap acct">
    <div class="page-head"><div class="eyebrow">Prototype · test accounts</div><h1>User accounts</h1>
      <p>Every intake submitted in this prototype creates a user account. Open one to see exactly what that person sees after signing in — their booking, messages and consent status.</p></div>
    ${list.length ? `<div class="acc-list">${list.map(accRow).join('')}</div>
      <div class="page-foot"><a class="btn btn-primary" href="#/register">${icon('user', 16)} Create another test user</a><button class="btn btn-ghost" data-action="clearAll">Delete all test data</button></div>
      <p class="fine">Test accounts are saved in this browser only.</p>`
    : emptyState('No user accounts yet', 'Complete the intake form on the website to create one. Each intake you submit becomes a separate user you can sign in as here.',
      `<a class="btn btn-primary" href="#/register">Create a test user</a>`)}
  </main>`;
}

/* ---------- user dashboard ---------- */
function welcome(r) {
  return `<div class="welcome" role="status">${icon('check', 22)}
    <div><b>Your intake is in${r.anonymous ? '' : `, ${esc(callName(r))}`}.</b><p>Next, choose a time for your first session with ${COUNSELLOR.first}. She’ll read your intake before you meet.</p></div>
    <button class="icon-btn" data-action="dismissWelcome" aria-label="Dismiss">${icon('x', 16)}</button></div>`;
}

function bookingBox(r) {
  const b = r.booking;
  if (b && !state.rebook) {
    const ok = b.status === 'confirmed';
    return `<section class="box" id="booking">
      <div class="box-h"><h2>${icon('cal', 18)} Your session</h2><span class="badge ${ok ? 'sky' : 'warn'}">${ok ? icon('check', 12) + ' Confirmed' : icon('clock', 12) + ' Awaiting confirmation'}</span></div>
      <div class="appt">${apptDate(b.slot)}<div><b>${fmtDay(b.slot)} · ${fmtTime(b.slot)}</b><small>${FORMATS[r.prefs.format]} with ${COUNSELLOR.name} · 50 min</small></div></div>
      ${ok ? '' : `<p class="box-note">${COUNSELLOR.first} will confirm your time shortly — you’ll see it here and in your messages.</p>`}
      ${consentDone(r) ? '' : `<div class="note warn">${icon('clock', 16)}<span>${esc(partnerName(r))} still needs to sign the consent form before your joint session.</span></div>`}
      <div class="box-actions"><button class="btn btn-ghost btn-sm" data-action="rebook">Change time</button><button class="btn btn-ghost btn-sm" data-action="cancelBooking" data-id="${r.id}">Cancel session</button></div>
    </section>`;
  }
  const s = state.picker.slot;
  return `<section class="box" id="booking">
    <div class="box-h"><h2>${icon('cal', 18)} ${b ? 'Choose a new time' : 'Book your first session'}</h2>${b ? `<button class="link" data-action="rebookCancel">Keep current time</button>` : ''}</div>
    <p class="box-sub">With ${COUNSELLOR.name} · ${FORMATS[r.prefs.format]} · 50 minutes</p>
    ${slotPicker(r)}
    <button class="btn btn-primary btn-block" data-action="requestSlot" data-id="${r.id}" ${s ? '' : 'disabled'}>${s ? `Request ${fmtSlot(s)}` : 'Pick a day and time'}</button>
  </section>`;
}

const messagesBox = r => `<section class="box" id="messages">
  <div class="box-h"><h2>${icon('chat', 18)} Messages</h2><small class="muted">with ${COUNSELLOR.first}</small></div>
  ${thread(r, 'client')}${composer('sendClient', r.id, `Message ${COUNSELLOR.first}…`)}</section>`;

const counsellorBox = () => `<section class="box">
  <div class="box-h"><h2>${icon('user', 18)} Your counsellor</h2></div>
  <div class="c-mini"><span class="av lg">${COUNSELLOR.initials}</span><div><b>${COUNSELLOR.name}</b><small>${COUNSELLOR.role}</small></div></div>
  <p class="box-note">${COUNSELLOR.hours}</p></section>`;

function consentBox(r) {
  const k = r.consent, done = consentDone(r);
  return `<section class="box">
    <div class="box-h"><h2>${icon('file', 18)} Consent</h2>${done ? `<span class="badge sky">${icon('check', 12)} Complete</span>` : '<span class="badge warn">1 of 2 signed</span>'}</div>
    <div class="party">${icon('user', 18)}<div><b>${esc(selfName(r))}</b><small>Signed ${fmtDate(r.createdAt)}</small></div><span class="badge sky">${icon('check', 12)}</span></div>
    <div class="party">${icon('user', 18)}<div><b>${esc(partnerName(r))}</b><small>${done ? `Signed ${fmtDate(k.partnerSignedAt || r.createdAt)}` : r.anonymous ? 'Waiting — share the private link' : `Waiting — emailed to ${esc(r.partner.email)}`}</small></div>${done ? `<span class="badge sky">${icon('check', 12)}</span>` : `<span class="badge warn">${icon('clock', 12)}</span>`}</div>
    ${done ? '' : `<div class="box-actions">
      ${r.anonymous
        ? `<button class="btn btn-ghost btn-sm" data-action="copy" data-text="${consentLink(r)}">${icon('copy', 14)} Copy link</button>`
        : `<button class="btn btn-ghost btn-sm" data-action="resend" data-id="${r.id}">${icon('send', 14)} Resend email</button>`}
      <a class="btn btn-ghost btn-sm" href="#/consent/${r.id}">Open as partner (demo)</a></div>`}
  </section>`;
}

function intakeBox(r) {
  return `<section class="box">
    <div class="box-h"><h2>${icon('inbox', 18)} Your intake</h2><small class="muted">Sent ${fmtDate(r.createdAt)}</small></div>
    ${kv([['For', isCouple(r) ? 'Couple' : 'Individual'], ['Relationship', r.status], ['Format', FORMATS[r.prefs.format]], ['Identity', r.anonymous ? 'Anonymous' : 'Named']])}
    <details class="more"><summary>See everything you shared</summary><dl>
      ${[['Focus', r.rel.concerns.join(', ')], ['In your words', r.rel.story], ['Good outcome', r.rel.goals], ['Feels safe', SAFE[r.safety.feelSafe]],
        ['Safe to contact by', r.safety.contact.join(', ')], ['Days', r.prefs.days.join(', ')], ['Times', r.prefs.times.join(', ')], ['Start', URGENCY[r.prefs.urgency]]]
        .filter(x => x[1]).map(([a, b]) => `<dt>${a}</dt><dd>${esc(b)}</dd>`).join('')}
    </dl></details></section>`;
}

export function account(r) {
  if (!r) {
    return appHeader(`<a class="btn btn-ghost btn-sm" href="#/accounts">All accounts</a>`) + `<main class="wrap acct">
      ${emptyState('Account not found', 'This test account may have been deleted.', '<a class="btn btn-primary" href="#/accounts">See all user accounts</a>')}</main>`;
  }
  return appHeader(`<span class="who">${avatar(r, 'sm')}<span class="who-name">${esc(callName(r))}</span></span>
      <a class="btn btn-ghost btn-sm" href="#/accounts">${icon('swap', 14)} Switch<span class="hide-xs">&nbsp;account</span></a>`) + `<main class="wrap acct">
    ${state.welcomeId === r.id ? welcome(r) : ''}
    <div class="acct-head"><div class="eyebrow">Your account</div><h1>Hi ${esc(callName(r))}</h1>
      <p class="muted">Reference <b>${r.ref}</b>${r.anonymous ? ' · Anonymous mode' : ''}</p></div>
    <div class="acct-grid">
      <div class="acct-col">${bookingBox(r)}${messagesBox(r)}</div>
      <div class="acct-col">${counsellorBox()}${isCouple(r) ? consentBox(r) : ''}${intakeBox(r)}</div>
    </div>
  </main>`;
}

/* ---------- partner consent (opened from the emailed / shared link) ---------- */
export function partnerConsent(r) {
  const head = appHeader('');
  if (!r || !isCouple(r)) {
    return head + `<main class="wrap acct narrow">${emptyState('This link isn’t valid', 'The consent link has expired or doesn’t exist.', '<a class="btn btn-primary" href="#/">Go to the website</a>')}</main>`;
  }
  if (consentDone(r)) {
    return head + `<main class="wrap acct narrow">${emptyState(state.pcDone ? 'Thank you — you’re all set' : 'Already signed',
      `${esc(partnerName(r))} has agreed to the consent form. ${COUNSELLOR.first} will be in touch about your first session together.`,
      `<a class="btn btn-primary" href="#/account/${r.id}">Back to ${esc(selfName(r))}’s account (demo)</a>`)}</main>`;
  }
  const p = r.partner, a = r.anonymous, e = state.pcErr;
  return head + `<main class="wrap acct narrow"><div class="card form-card">
    <div class="eyebrow">Consent request</div>
    <h1 class="step-title" style="margin-top:8px">Hi ${esc(partnerName(r))}</h1>
    <p class="step-sub">${esc(selfName(r))} has asked you to join couples counselling with ${COUNSELLOR.name}. Check the details they entered about you, then read and sign the consent form.</p>
    <div class="dsec"><h4>About you, entered by ${esc(selfName(r))}</h4>${kv([[a ? 'Nickname' : 'Name', partnerName(r)], ['Age range', p.age], ['Gender', p.gender], ['Email', p.email]])}</div>
    <div class="dsec"><h4>What you’ll work on</h4><div class="tags" style="margin:0">${r.rel.concerns.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>
    ${consentDoc(true)}
    <div class="sign-block">
      <div class="check-wrap ${e.read ? 'has-err' : ''}"><label class="check"><input type="checkbox" data-root="pc" data-bind="read" ${state.pc.read ? 'checked' : ''}><span class="cbox">${icon('check', 14)}</span><span>I’ve read the consent form and the details above, and I agree to take part.</span></label>${e.read ? '<div class="err">Required to continue</div>' : ''}</div>
      <label class="field ${e.sig ? 'has-err' : ''}" style="margin-top:20px"><span class="lbl">Type your ${a ? 'nickname' : 'full name'} to sign <em>*</em></span>
        <input data-root="pc" data-bind="sig" value="${esc(state.pc.sig)}" autocomplete="name">${e.sig ? '<div class="err">Type your name to sign</div>' : ''}</label>
      <button class="btn btn-primary btn-block" data-action="partnerSign" data-id="${r.id}">Sign consent form</button>
    </div>
  </div></main>`;
}
