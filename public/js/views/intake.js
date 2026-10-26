// Multi-step intake (registration) form.
import { state, isCouple, selfName, partnerName, COUNSELLOR, AGES, GENDERS, STATES, LENGTHS, DURATIONS, STATUS, CONCERNS, FORMATS, SAFE, URGENCY, AWARE } from '../store.js';
import { icon, esc, getP, inp, sel, area, cards, chips, check, group, opts, mapOpts } from '../ui.js';

export const STEPS = [
  { id: 'type', title: 'Who’s this for?', short: 'Getting started' },
  { id: 'you', title: 'About you', short: 'About you' },
  { id: 'partner', title: 'About your partner', short: 'Your partner', couple: true },
  { id: 'relationship', title: 'What’s been happening', short: 'Your situation' },
  { id: 'safety', title: 'Your safety', short: 'Safety' },
  { id: 'prefs', title: 'Session preferences', short: 'Preferences' },
  { id: 'consent', title: 'Consent', short: 'Consent' },
  { id: 'review', title: 'Review & send', short: 'Review' },
];
export const activeSteps = () => STEPS.filter(s => !s.couple || isCouple());

export function consentDoc(couple) {
  const n = couple ? 1 : 0;
  return `<div class="consent-doc" tabindex="0" aria-label="Consent form">
    <span class="draft-flag">Placeholder wording — final consent text to be supplied by the practice</span>
    <h5>1. About counselling</h5><p>Counselling is voluntary. You can pause or stop at any time, and you can ask about your counsellor’s approach, qualifications and fees before you begin.</p>
    <h5>2. Confidentiality and its limits</h5><p>What you share stays between you and your counsellor, except where:</p>
    <ul><li>there is a serious risk of harm to you or someone else;</li><li>a child’s safety may be at risk;</li><li>we are required to share it by law, such as a court order.</li></ul>
    ${couple ? `<h5>3. Counselling as a couple</h5><p>Your counsellor works with the relationship, not for one partner. Before your first joint session they’ll explain how anything shared in an individual conversation is handled.</p>` : ''}
    <h5>${3 + n}. Staying anonymous</h5><p>You may use a nickname. If your counsellor believes someone is at serious risk, they may ask for identifying details or contact emergency services.</p>
    <h5>${4 + n}. Your information</h5><p>Your intake is stored securely and handled under the Australian Privacy Principles. You can ask to see, correct or delete it at any time.</p>
    <h5>${5 + n}. Not an emergency service</h5><p>If you or someone else is in immediate danger, call 000.</p>
  </div>`;
}

const VIEWS = {
  type() {
    const f = state.form;
    return `<p class="step-sub">Couples can complete one intake together. One of you fills in the details for both, then each partner agrees to the consent form.</p>
      ${group('Who is the counselling for?', cards('type', [
        { v: 'individual', t: 'Just me', d: 'Individual counselling about a relationship — current, past or future.', ic: 'user' },
        { v: 'couple', t: 'My partner and me', d: 'Couples counselling, whether you’re married or not.', ic: 'users' },
      ], { cols: 2, big: true }))}
      ${f.type ? group(isCouple() ? 'How would you describe your relationship?' : 'Your current relationship status', cards('status', opts(STATUS[f.type]), { cols: 3 })) : ''}`;
  },

  you() {
    const a = state.form.anonymous;
    return `<div class="anon ${a ? 'on' : ''}">
        <div class="anon-ic">${icon(a ? 'eyeOff' : 'eye', 22)}</div>
        <div><b>Stay anonymous</b><p>Use a nickname instead of your real name. Your counsellor won’t see your name, email or phone — you’ll talk through private in-app messages.</p></div>
        <button type="button" class="switch ${a ? 'on' : ''}" role="switch" aria-checked="${a}" aria-label="Stay anonymous" data-action="anon"><span></span></button>
      </div>
      ${a ? `
        <div class="row">${inp('you.alias', 'Nickname', { req: true, ph: 'e.g. Blue Wren', hint: 'Anything that isn’t your real name.' })}${sel('you.age', 'Age range', AGES, { req: true })}</div>
        <div class="row">${sel('you.gender', 'Gender', GENDERS)}${sel('you.state', 'State or territory', STATES)}</div>
        <div class="note">${icon('lock', 16)}<span>You’ll get a private reference code after you submit. Keep it safe — it’s how you get back to your account.</span></div>`
      : `
        <div class="row">${inp('you.name', 'Full name', { req: true, auto: 'name' })}${inp('you.preferred', 'What should we call you?', { auto: 'nickname' })}</div>
        <div class="row">${inp('you.email', 'Email', { type: 'email', req: true, auto: 'email' })}${inp('you.phone', 'Mobile', { type: 'tel', auto: 'tel' })}</div>
        <div class="row">${sel('you.age', 'Age range', AGES, { req: true })}${sel('you.gender', 'Gender', GENDERS)}</div>
        <div class="row">${sel('you.state', 'State or territory', STATES)}</div>`}`;
  },

  partner() {
    const a = state.form.anonymous;
    return `<p class="step-sub">You’re filling this in on your partner’s behalf. They’ll see everything you enter here before they agree to the consent form.</p>
      ${a ? `<div class="note">${icon('eyeOff', 16)}<span>Anonymous mode is on, so we only need a nickname for your partner too.</span></div>
        <div class="row">${inp('partner.alias', 'Partner’s nickname', { req: true, ph: 'e.g. Kookaburra' })}${sel('partner.age', 'Their age range', AGES, { req: true })}</div>
        <div class="row">${sel('partner.gender', 'Their gender', GENDERS)}</div>`
      : `<div class="row">${inp('partner.name', 'Partner’s full name', { req: true })}${sel('partner.age', 'Their age range', AGES, { req: true })}</div>
        <div class="row">${inp('partner.email', 'Partner’s email', { type: 'email', hint: 'Only used to send them the consent form if they’re not with you now.' })}${sel('partner.gender', 'Their gender', GENDERS)}</div>`}
      ${group('Does your partner know you’re arranging counselling?', cards('partner.aware', mapOpts({ yes: 'Yes, we decided together', told: 'They know, but weren’t sure', no: 'Not yet' }), { cols: 3 }))}`;
  },

  relationship() {
    const c = isCouple();
    return `<p class="step-sub">This helps ${COUNSELLOR.first} prepare. Share as much or as little as you’re comfortable with.</p>
      <div class="row">${sel('rel.length', c ? 'How long have you been together?' : 'How long has this been on your mind?', c ? LENGTHS : DURATIONS)}
        ${c ? sel('rel.living', 'Living arrangement', ['Living together', 'Living apart', 'Recently separated']) : sel('rel.previous', 'Had counselling before?', ['No', 'Yes, individually', 'Yes, as a couple'])}</div>
      ${c ? `<div class="row">${sel('rel.children', 'Children', ['No children', 'Children at home', 'Children not at home', 'Expecting'])}${sel('rel.previous', 'Had counselling before?', ['No', 'Yes, together', 'Yes, individually', 'Both'])}</div>` : ''}
      ${group('What would you like to work on? <em>*</em>', chips('rel.concerns', CONCERNS[c ? 'couple' : 'individual']), 'choose any')}
      ${area('rel.story', 'In your own words, what’s been happening?', { ph: 'There’s no right or wrong way to put it.' })}
      ${area('rel.goals', 'What would a good outcome look like?', { rows: 3, ph: c ? 'e.g. We want to stop having the same argument every week.' : 'e.g. I want to understand why my relationships end the same way.' })}`;
  },

  safety() {
    const v = state.form.safety.feelSafe, c = isCouple();
    return `<p class="step-sub">We ask everyone this. ${c ? '<b>If your partner is with you, you may want to answer this part privately.</b> ' : ''}Your answer is only seen by your counsellor.</p>
      ${group(c ? 'Do you feel safe in your relationship?' : 'Do you currently feel safe in your relationships and at home?', cards('safety.feelSafe', mapOpts({ yes: 'Yes', sometimes: 'Not always', no: 'No', skip: 'I’d rather not say' }), { cols: 4 }))}
      ${v && v !== 'yes' ? `<div class="safety-box">
        <h4>${icon('heart', 18)} Thank you for telling us</h4>
        <p>${COUNSELLOR.first} will contact you privately first${c ? ' and may suggest an individual conversation before any joint session' : ''}. You don’t have to go through this alone.</p>
        <div class="lines"><a href="tel:000"><b>000</b>If you’re in immediate danger</a><a href="tel:1800737732"><b>1800 737 732</b>1800RESPECT, 24/7</a><a href="tel:131114"><b>13 11 14</b>Lifeline, 24/7</a></div>
        <button class="btn btn-sm quick-exit" data-action="exit">${icon('arrowR', 15)} Leave this site quickly</button>
      </div>` : ''}
      ${group('How is it safe to contact you?', chips('safety.contact', ['Email', 'Phone call', 'SMS', 'In-app messages only']), 'choose all that apply')}`;
  },

  prefs() {
    return `<p class="step-sub">You’ll choose an exact time with ${COUNSELLOR.first} straight after you submit.</p>
      ${group('How would you like to meet? <em>*</em>', cards('prefs.format', [
        { v: 'video', t: 'Video', d: 'From anywhere', ic: 'video' }, { v: 'phone', t: 'Phone', d: 'Audio only', ic: 'phone' },
        { v: 'inperson', t: 'In person', d: 'At the practice', ic: 'pin' }, { v: 'chat', t: 'Text chat', d: 'Written sessions', ic: 'chat' }], { cols: 4 }))}
      <div class="row">${group('Days that usually suit', chips('prefs.days', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']))}${group('Times that usually suit', chips('prefs.times', ['Morning', 'Afternoon', 'Evening']))}</div>
      ${group('How soon would you like to start?', cards('prefs.urgency', mapOpts({ asap: 'As soon as possible', '2w': 'In the next 2 weeks', flex: 'I’m flexible' }), { cols: 3 }))}`;
  },

  consent() {
    const f = state.form, c = isCouple(), k = f.consent, a = f.anonymous;
    return `<p class="step-sub">Please read this carefully.${c ? ' <b>Both partners need to agree</b> before your first joint session.' : ''}</p>
      ${consentDoc(c)}
      <div class="sign-block">
        <h4>${icon('user', 18)} ${esc(selfName(f))}</h4>
        ${check('consent.read', 'I have read and understood the consent form.')}
        ${check('consent.limits', 'I understand confidentiality has limits when someone’s safety is at risk.')}
        ${check('consent.notEmergency', 'I understand this is not an emergency service.')}
        ${c ? check('consent.share', 'The details I’ve given about my partner are accurate as far as I know, and I understand they’ll be able to see them.') : ''}
        <div style="margin-top:20px">${inp('consent.sig', `Type your ${a ? 'nickname' : 'full name'} to sign`, { req: true })}</div>
      </div>
      ${c ? `<div class="sign-block">
        <h4>${icon('users', 18)} ${esc(partnerName(f))}</h4>
        ${group('How will your partner give consent? <em>*</em>', cards('consent.partnerMode', [
          { v: 'now', t: 'They’re with me now', d: 'They can read the form and sign on this device.' },
          { v: 'later', t: a ? 'Send them a private link' : 'Email them the form', d: a ? 'You’ll get a link to share from your account.' : 'They’ll review and sign from their own device.' }]))}
        ${k.partnerMode === 'now' ? `${check('consent.partnerRead', `I’m ${esc(partnerName(f))}. I’ve read the consent form and the details my partner entered about me, and I agree.`)}
          <div style="margin-top:20px">${inp('consent.partnerSig', `Partner: type your ${a ? 'nickname' : 'full name'} to sign`, { req: true })}</div>` : ''}
        ${k.partnerMode === 'later' && !a ? inp('partner.email', 'Partner’s email', { type: 'email', req: true, auto: 'off' }) : ''}
      </div>` : ''}`;
  },

  review() {
    const f = state.form, c = isCouple(), steps = activeSteps(), idx = id => steps.findIndex(s => s.id === id), k = f.consent;
    const sec = (title, id, rows) => `<div class="rev"><div class="rev-h"><h4>${title}</h4><button class="link" data-action="goto" data-step="${idx(id)}">Edit</button></div>
      <dl>${rows.filter(r => r[1]).map(([t, v]) => `<dt>${t}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>`;
    return `<p class="step-sub">Check everything looks right. Next, you’ll pick a time for your first session.</p>
      ${sec('Counselling for', 'type', [['Type', c ? 'Couple' : 'Individual'], ['Relationship', f.status]])}
      ${sec('You', 'you', f.anonymous
        ? [['Identity', 'Anonymous'], ['Nickname', f.you.alias], ['Age', f.you.age], ['Gender', f.you.gender], ['State', f.you.state]]
        : [['Name', f.you.name], ['Email', f.you.email], ['Mobile', f.you.phone], ['Age', f.you.age], ['Gender', f.you.gender], ['State', f.you.state]])}
      ${c ? sec('Your partner', 'partner', [[f.anonymous ? 'Nickname' : 'Name', partnerName(f)], ['Email', f.partner.email], ['Age', f.partner.age], ['Knows about this', AWARE[f.partner.aware]]]) : ''}
      ${sec('What’s been happening', 'relationship', [['Focus', f.rel.concerns.join(', ')], [c ? 'Together' : 'On your mind', f.rel.length], ['In your words', f.rel.story], ['Good outcome', f.rel.goals]])}
      ${sec('Safety', 'safety', [['Feels safe', SAFE[f.safety.feelSafe]], ['Safe to contact by', f.safety.contact.join(', ')]])}
      ${sec('Preferences', 'prefs', [['Format', FORMATS[f.prefs.format]], ['Days', f.prefs.days.join(', ')], ['Times', f.prefs.times.join(', ')], ['Start', URGENCY[f.prefs.urgency]]])}
      ${sec('Consent', 'consent', [['You', k.sig && `Signed by ${k.sig}`], ['Partner', c && (k.partnerMode === 'now' ? `Signed by ${k.partnerSig}` : f.anonymous ? 'Will sign via private link' : `Form will be emailed to ${f.partner.email}`)]])}`;
  },
};

export function validate(id) {
  const f = state.form, e = {};
  const req = (p, m) => { const v = getP(f, p); if (!v || (Array.isArray(v) && !v.length)) e[p] = m; };
  const email = p => { const v = getP(f, p); if (v && !/^\S+@\S+\.\S+$/.test(v)) e[p] = 'Enter a valid email address'; };
  switch (id) {
    case 'type':
      req('type', 'Choose who the counselling is for');
      if (f.type) req('status', 'Choose one');
      break;
    case 'you':
      if (f.anonymous) req('you.alias', 'Choose a nickname');
      else { req('you.name', 'Enter your name'); req('you.email', 'Enter your email'); email('you.email'); }
      req('you.age', 'Select your age range');
      break;
    case 'partner':
      if (f.anonymous) req('partner.alias', 'Choose a nickname for your partner');
      else { req('partner.name', 'Enter your partner’s name'); email('partner.email'); }
      req('partner.age', 'Select an age range');
      break;
    case 'relationship': req('rel.concerns', 'Choose at least one'); break;
    case 'safety': req('safety.feelSafe', 'Please choose an answer'); break;
    case 'prefs': req('prefs.format', 'Choose how you’d like to meet'); break;
    case 'consent':
      ['read', 'limits', 'notEmergency'].forEach(k => req('consent.' + k, 'Required to continue'));
      if (isCouple()) req('consent.share', 'Required to continue');
      req('consent.sig', 'Type your name to sign');
      if (isCouple()) {
        req('consent.partnerMode', 'Choose how your partner will consent');
        if (f.consent.partnerMode === 'now') { req('consent.partnerRead', 'Your partner needs to agree'); req('consent.partnerSig', 'Your partner needs to sign'); }
        if (f.consent.partnerMode === 'later' && !f.anonymous) { req('partner.email', 'Enter your partner’s email'); email('partner.email'); }
      }
      break;
  }
  return e;
}

export function register() {
  const steps = activeSteps();
  const i = Math.min(state.step, steps.length - 1), s = steps[i];
  return `<section class="reg"><div class="wrap reg-grid">
    <aside class="reg-aside">
      <div class="eyebrow">Intake form</div>
      <h2 class="reg-h">Before you meet your counsellor</h2>
      <p class="muted">About 10 minutes. You can stay anonymous.</p>
      <ol class="steps">${steps.map((st, k) => `<li class="${k < i ? 'done' : k === i ? 'current' : ''}" ${k < i ? `data-action="goto" data-step="${k}"` : ''} ${k === i ? 'aria-current="step"' : ''}><span class="n">${k < i ? icon('check', 14) : k + 1}</span>${st.short}</li>`).join('')}</ol>
      <div class="aside-note">${icon('lock', 16)}<span>Your answers are only shared with your counsellor.</span></div>
    </aside>
    <div class="reg-main">
      <div class="progress" aria-hidden="true"><span style="width:${((i + 1) / steps.length) * 100}%"></span></div>
      <div class="step-meta">Step ${i + 1} of ${steps.length}</div>
      <div class="card form-card"><h2 class="step-title">${s.title}</h2>${VIEWS[s.id]()}</div>
      <div class="form-nav">
        ${i > 0 ? `<button class="btn btn-ghost" data-action="back" aria-label="Back">${icon('arrowL', 16)}<span class="hide-xs">Back</span></button>` : `<a class="btn btn-ghost" href="#/">Cancel</a>`}
        <button class="btn btn-primary" data-action="next">${s.id === 'review' ? `Send &amp; choose a time ${icon('arrowR', 16)}` : `Continue ${icon('arrowR', 16)}`}</button>
      </div>
    </div>
  </div></section>`;
}
