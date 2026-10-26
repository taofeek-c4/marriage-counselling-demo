// Consultant dashboard. Starts empty and fills only from intakes submitted in this browser.
import { state, db, byId, isCouple, selfName, partnerName, recName, consentDone, flagged, COUNSELLOR, FORMATS, SAFE, AWARE, URGENCY } from '../store.js';
import { icon, esc, logo, avatar, kv, apptDate, emptyState, ago, fmtDay, fmtTime, fmtSlot, fmtDate } from '../ui.js';
import { slotPicker, thread, composer } from './account.js';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

function badgesFor(r, full = false) {
  const b = [];
  if (flagged(r)) b.push(`<span class="badge danger">${icon('alert', 12)} Safety</span>`);
  b.push(isCouple(r) ? '<span class="badge teal">Couple</span>' : '<span class="badge olive">Individual</span>');
  if (r.anonymous) b.push('<span class="badge dark">Anonymous</span>');
  if (isCouple(r)) b.push(consentDone(r) ? `<span class="badge sky">${icon('check', 12)} Both consented</span>` : `<span class="badge warn">${icon('clock', 12)} Partner consent</span>`);
  if (r.booking) b.push(r.booking.status === 'requested' ? `<span class="badge warn">${icon('cal', 12)} Booking request</span>` : `<span class="badge sky">${icon('cal', 12)} ${fmtDay(r.booking.slot)}</span>`);
  if (r.unreadC) b.push(`<span class="badge teal">${icon('chat', 12)} ${r.unreadC} new</span>`);
  if (full) b.push(r.stage === 'new' ? '<span class="badge teal">New</span>' : '<span class="badge">Reviewed</span>');
  return b.join('');
}

const FILTERS = {
  all: ['All', () => true],
  new: ['New', r => r.stage === 'new'],
  requests: ['Booking requests', r => r.booking?.status === 'requested'],
  couple: ['Couples', r => isCouple(r)],
  individual: ['Individuals', r => !isCouple(r)],
  flag: ['Safety flags', flagged],
};

export function consultant() {
  const all = [...db.accounts].sort((a, b) => b.createdAt - a.createdAt);
  const nNew = all.filter(r => r.stage === 'new').length;
  const requests = all.filter(FILTERS.requests[1]);
  const pending = all.filter(r => !consentDone(r));
  const flags = all.filter(flagged);
  const sessions = all.filter(r => r.booking).sort((a, b) => a.booking.slot.localeCompare(b.booking.slot));
  const list = all.filter(FILTERS[state.filter][1]);
  const dateLabel = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });

  const body = all.length ? `
    <div class="stats">
      <button class="stat" style="--c:var(--teal)" data-action="filter" data-f="new"><small>${icon('inbox', 15)} New intakes</small><b>${nNew}</b><span>Awaiting review</span></button>
      <button class="stat" style="--c:var(--tangerine)" data-action="filter" data-f="requests"><small>${icon('cal', 15)} Booking requests</small><b>${requests.length}</b><span>Need confirming</span></button>
      <button class="stat" style="--c:var(--sky)" data-action="jump" data-target="consents"><small>${icon('clock', 15)} Partner consent</small><b>${pending.length}</b><span>Couples waiting</span></button>
      <button class="stat" style="--c:var(--danger)" data-action="filter" data-f="flag"><small>${icon('alert', 15)} Safety flags</small><b>${flags.length}</b><span>Contact privately</span></button>
    </div>
    <div class="dash-grid">
      <section class="panel" id="queue">
        <div class="panel-h"><h2>Clients</h2>
          <div class="tabs" role="tablist">${Object.entries(FILTERS).map(([k, [l]]) => `<button role="tab" aria-selected="${state.filter === k}" class="${state.filter === k ? 'on' : ''}" data-action="filter" data-f="${k}">${l}</button>`).join('')}</div></div>
        ${list.length ? list.map(r => `<button class="irow ${r.stage === 'new' ? 'new' : ''}" data-action="open" data-id="${r.id}">
            ${avatar(r)}
            <span class="irow-main"><b>${esc(recName(r))}</b><small>${esc(r.status)} · ${esc(r.rel.concerns.slice(0, 3).join(', '))}</small><span class="badges">${badgesFor(r)}</span></span>
            <span class="irow-time">${ago(r.createdAt)}</span></button>`).join('')
          : '<div class="empty">No clients in this view.</div>'}
      </section>
      <div class="dash-side">
        <section class="panel" id="sessions"><div class="panel-h"><h2>Upcoming sessions</h2><small>${sessions.length}</small></div>
          ${sessions.length ? sessions.map(r => `<button class="sess" data-action="open" data-id="${r.id}">
              <time>${fmtDay(r.booking.slot)}<br>${fmtTime(r.booking.slot)}</time>
              <span style="min-width:0"><b>${esc(recName(r))}</b><small>${FORMATS[r.prefs.format]}</small></span>
              ${r.booking.status === 'requested' ? '<span class="badge warn">Request</span>' : '<span class="badge sky">Confirmed</span>'}</button>`).join('')
            : '<div class="empty">No sessions booked yet.</div>'}
        </section>
        <section class="panel" id="consents"><div class="panel-h"><h2>Partner consent</h2><small>${pending.length} pending</small></div>
          ${pending.length ? pending.map(r => `<div class="ctrack"><div><b>${esc(partnerName(r))}</b><small>Partner of ${esc(selfName(r))} · ${r.anonymous ? 'private link' : 'emailed'}</small></div>
              <button class="btn btn-ghost btn-sm" data-action="remind" data-id="${r.id}">${icon('bell', 14)} Remind</button></div>`).join('')
            : '<div class="empty">No consents outstanding.</div>'}
        </section>
      </div>
    </div>`
    : emptyState('No clients yet', 'When someone completes the intake on the website they’ll appear here, along with their booking request, consent status and messages.',
      '<a class="btn btn-primary" href="#/register">Submit a test intake</a><a class="btn btn-ghost" href="#/">Open the website</a>');

  return `<div class="dash">
    <aside class="side">
      ${logo('#/consultant')}
      <nav class="side-nav" aria-label="Dashboard sections">
        <button class="on" data-action="jump" data-target="top">${icon('grid')} Overview</button>
        <button data-action="jump" data-target="queue">${icon('inbox')} Clients ${nNew ? `<span class="count">${nNew}</span>` : ''}</button>
        <button data-action="jump" data-target="sessions">${icon('cal')} Sessions</button>
        <button data-action="jump" data-target="consents">${icon('file')} Consent</button>
      </nav>
      <div class="side-foot">
        ${all.length ? '<button class="reset" data-action="clearAll">Delete all test data</button>' : ''}
        <div class="side-me"><span class="av">${COUNSELLOR.initials}</span><div><b>${COUNSELLOR.name}</b><small>${COUNSELLOR.role}</small></div></div>
      </div>
    </aside>
    <main class="dash-main" id="top">
      <div class="dash-mhead">${logo('#/consultant')}<span class="av sm" title="${COUNSELLOR.name}">${COUNSELLOR.initials}</span></div>
      <header class="dash-top"><div class="eyebrow">Consultant portal</div><h1>${greeting()}, ${COUNSELLOR.first}</h1>
        <p>${dateLabel}${all.length ? ` · ${nNew} new intake${nNew === 1 ? '' : 's'}, ${requests.length} booking request${requests.length === 1 ? '' : 's'}` : ''}</p></header>
      ${body}
    </main>
  </div>
  ${state.openId ? drawer(byId(state.openId)) : ''}`;
}

function drawer(r) {
  if (!r) return '';
  const c = isCouple(r), k = r.consent, b = r.booking, s = state.picker.slot;
  const hidden = '<span class="redact" style="width:90px"></span>';
  const actions = [];
  if (b?.status === 'requested') actions.push(`<button class="btn btn-primary btn-sm" data-action="confirmBooking" data-id="${r.id}">${icon('check', 15)} Confirm ${fmtTime(b.slot)}</button>`);
  if (!b) actions.push(`<button class="btn btn-primary btn-sm" data-action="offer">${icon('cal', 15)} ${state.offering ? 'Hide times' : 'Offer a time'}</button>`);
  else actions.push(`<button class="btn btn-ghost btn-sm" data-action="offer">${state.offering ? 'Hide times' : b.status === 'requested' ? 'Suggest another time' : 'Reschedule'}</button>`);
  if (!consentDone(r)) actions.push(`<button class="btn btn-ghost btn-sm" data-action="remind" data-id="${r.id}">${icon('bell', 15)} Consent reminder</button>`);
  if (r.stage === 'new') actions.push(`<button class="btn btn-ghost btn-sm" data-action="reviewed" data-id="${r.id}">Mark reviewed</button>`);

  return `<div class="overlay" data-action="close"></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-label="Client details">
    <div class="drawer-h">${avatar(r)}<div class="drawer-t"><h3>${esc(recName(r))}</h3><small>${r.ref} · submitted ${ago(r.createdAt).toLowerCase()}</small><div class="badges">${badgesFor(r, true)}</div></div>
      <button class="icon-btn" data-action="close" aria-label="Close">${icon('x')}</button></div>
    <div class="drawer-b">
      ${flagged(r) ? `<div class="alert">${icon('alert', 18)}<div><b>Safety concern disclosed</b> — answered “${SAFE[r.safety.feelSafe]}”. Contact ${esc(selfName(r))} privately first${c ? ' and consider an individual session before any joint session' : ''}. Safe to contact by: ${esc(r.safety.contact.join(', ') || 'not specified')}.</div></div>` : ''}
      <div class="dsec"><h4>Session</h4>
        ${b ? `<div class="appt">${apptDate(b.slot)}<div><b>${fmtDay(b.slot)} · ${fmtTime(b.slot)}</b><small>${b.status === 'requested' ? 'Requested by client — needs confirming' : 'Confirmed'} · ${FORMATS[r.prefs.format]}</small></div></div>`
          : '<p class="muted">No session booked yet.</p>'}
        ${state.offering ? `<div class="offer">${slotPicker(r)}<button class="btn btn-primary btn-block" data-action="offerSlot" data-id="${r.id}" ${s ? '' : 'disabled'}>${s ? `Book ${fmtSlot(s)}` : 'Pick a day and time'}</button></div>` : ''}
      </div>
      <div class="dsec"><h4>Messages</h4>${thread(r, 'consultant')}${composer('sendConsultant', r.id, `Message ${r.anonymous ? r.you.alias : selfName(r).split(' ')[0]}…`)}</div>
      <div class="dsec"><h4>Overview</h4>${kv([['Counselling for', c ? 'Couple' : 'Individual'], ['Relationship', r.status], [c ? 'Together' : 'On their mind', r.rel.length], ['Living', r.rel.living], ['Children', r.rel.children], ['Previous counselling', r.rel.previous]])}</div>
      <div class="dsec"><h4>${c ? 'Partner 1 (filled in intake)' : 'Client'}</h4>
        ${r.anonymous
          ? kv([['Nickname', r.you.alias], ['Age range', r.you.age], ['Gender', r.you.gender], ['State', r.you.state]]) + `<div class="kv" style="margin-top:14px"><div><small>Name</small>${hidden}</div><div><small>Email / phone</small>${hidden}</div></div>`
          : kv([['Name', r.you.name], ['Preferred name', r.you.preferred], ['Email', r.you.email], ['Mobile', r.you.phone], ['Age range', r.you.age], ['Gender', r.you.gender], ['State', r.you.state]])}</div>
      ${c ? `<div class="dsec"><h4>Partner 2</h4>${kv([[r.anonymous ? 'Nickname' : 'Name', partnerName(r)], ['Email', r.partner.email], ['Age range', r.partner.age], ['Gender', r.partner.gender], ['Knows about counselling', AWARE[r.partner.aware]]])}</div>` : ''}
      <div class="dsec"><h4>Focus areas</h4><div class="tags" style="margin:0">${r.rel.concerns.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div></div>
      ${r.rel.story || r.rel.goals ? `<div class="dsec"><h4>In their words</h4>${r.rel.story ? `<div class="quote"><small>What’s been happening</small>${esc(r.rel.story)}</div>` : ''}${r.rel.goals ? `<div class="quote"><small>A good outcome</small>${esc(r.rel.goals)}</div>` : ''}</div>` : ''}
      <div class="dsec"><h4>Preferences</h4>${kv([['Format', FORMATS[r.prefs.format]], ['Days', r.prefs.days.join(', ')], ['Times', r.prefs.times.join(', ')], ['Start', URGENCY[r.prefs.urgency]], ['Contact by', r.safety.contact.join(', ')]])}</div>
      <div class="dsec"><h4>Consent</h4>
        <div class="party">${icon('file', 18)}<div><b>${esc(selfName(r))}</b><small>Signed “${esc(k.sig)}” · ${fmtDate(r.createdAt)}</small></div><span class="badge sky">${icon('check', 12)} Signed</span></div>
        ${c ? (consentDone(r)
          ? `<div class="party">${icon('file', 18)}<div><b>${esc(partnerName(r))}</b><small>Signed “${esc(k.partnerSig)}” · ${k.viaLink ? 'via link' : 'same device'}</small></div><span class="badge sky">${icon('check', 12)} Signed</span></div>`
          : `<div class="party">${icon('file', 18)}<div><b>${esc(partnerName(r))}</b><small>${r.anonymous ? 'Private link shared by partner' : `Emailed to ${esc(r.partner.email)}`}</small></div><span class="badge warn">${icon('clock', 12)} Pending</span></div>`) : ''}
      </div>
    </div>
    <div class="drawer-f">${actions.join('')}</div>
  </aside>`;
}
