// Public website: prototype switcher, header, landing page, footer.
import { state, db, COUNSELLOR } from '../store.js';
import { icon, logo, stripes } from '../ui.js';

// Dark bar at the very top that lets the client jump between the three views.
export function protoBar() {
  const r = state.route;
  const active = r === 'consultant' ? 'c' : ['accounts', 'account', 'consent'].includes(r) ? 'u' : 's';
  const n = db.accounts.length;
  const tab = (key, href, ic, long, short, extra = '') =>
    `<a href="${href}" class="${active === key ? 'on' : ''}" ${active === key ? 'aria-current="page"' : ''}>${icon(ic, 15)}<span class="l">${long}</span><span class="s">${short}</span>${extra}</a>`;
  return `<div class="proto"><div class="proto-in"><span class="proto-tag">Prototype</span>
    <nav class="seg" aria-label="Prototype views">
      ${tab('s', '#/', 'globe', 'Client website', 'Website')}
      ${tab('u', '#/accounts', 'users', 'User accounts', 'Users', n ? `<i>${n}</i>` : '')}
      ${tab('c', '#/consultant', 'swap', active === 'c' ? 'Consultant mode' : 'Switch to consultant mode', 'Consultant')}
    </nav></div></div>`;
}

const NAV = [['who', 'Who we help'], ['how', 'How it works'], ['privacy', 'Privacy'], ['counsellor', 'Your counsellor']];

export function siteHeader() {
  const links = NAV.map(([id, l]) => `<button data-action="scroll" data-target="${id}">${l}</button>`).join('');
  return `<header class="site-header"><div class="wrap nav">
      ${logo()}
      <nav class="nav-links" aria-label="Main">${links}</nav>
      <div class="nav-right">
        ${state.route === 'register' ? '' : `<a class="btn btn-primary btn-sm" href="#/register">Get started</a>`}
        <button class="icon-btn menu-btn" data-action="menu" aria-expanded="${state.menuOpen}" aria-label="${state.menuOpen ? 'Close menu' : 'Open menu'}">${icon(state.menuOpen ? 'x' : 'menu', 22)}</button>
      </div>
    </div>
    ${state.menuOpen ? `<nav class="mobile-menu" aria-label="Main">${links}</nav>` : ''}
  </header>`;
}

export function footer() {
  return `<footer class="site-footer"><div class="wrap">
    <div class="foot">${logo()}
      <div class="foot-help"><b>Not an emergency service.</b> If you or someone else is in immediate danger, call <b>000</b>. For 24/7 support call 1800RESPECT on <b>1800 737 732</b> or Lifeline on <b>13 11 14</b>.</div>
    </div>
    <small>© 2026 Your Counselling Matters · icounsel.com.au · Interactive prototype — sample content only</small>
  </div></footer>`;
}

export function counsellorProfile() {
  const c = COUNSELLOR;
  return `<article class="profile">
    <div class="profile-id"><span class="av xl">${c.initials}</span><div><h3>${c.name}</h3><small>${c.role}</small></div></div>
    <div class="profile-body">
      <p>${c.bio}</p>
      <div class="tags">${c.specialties.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <dl class="meta">
        <div><dt>${icon('video', 16)} Sessions</dt><dd>${c.formats}</dd></div>
        <div><dt>${icon('clock', 16)} Hours</dt><dd>${c.hours}</dd></div>
      </dl>
      <p class="placeholder-note">Placeholder profile — swap in the counsellor’s real photo, bio and credentials.</p>
    </div>
  </article>`;
}

export function home() {
  return `
  <section class="hero"><div class="wrap hero-grid">
    <div>
      <div class="eyebrow">Relationship &amp; marriage counselling</div>
      <h1 class="display">Reclaim <strong><span class="rot" id="rot">you</span>.</strong></h1>
      <p class="lead">Private, professional counselling for couples — married or not — and for individuals working through what matters in their relationships. Share as much or as little as you like before your first session.</p>
      <div class="hero-cta"><a class="btn btn-primary" href="#/register">Start your intake ${icon('arrowR', 16)}</a><button class="btn btn-ghost" data-action="scroll" data-target="how">How it works</button></div>
      <ul class="trust"><li>${icon('eyeOff', 17)} Stay anonymous if you prefer</li><li>${icon('users', 17)} One form for both partners</li><li>${icon('cal', 17)} Book online in minutes</li></ul>
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="art-panel">${stripes('art-stripes')}<div class="art-mark">${logo()}</div></div>
      <div class="float f1"><span class="dot">${icon('eyeOff', 17)}</span><div><b>Anonymous mode on</b><small>Your name stays private</small></div></div>
      <div class="float f2"><span class="dot olive">${icon('check', 17)}</span><div><b>Both partners consented</b><small>Ready to book a session</small></div></div>
    </div>
  </div></section>

  <section class="section white" id="who"><div class="wrap">
    <div class="sec-head"><div class="eyebrow">Who we help</div><h2>Support for every kind of relationship</h2><p>Whether you come together or on your own, the process starts the same way: a short, private intake.</p></div>
    <div class="aud-grid">
      <article class="aud-card"><div class="ic-wrap">${icon('users', 26)}</div><h3>Couples</h3>
        <p>Married, engaged, de facto or dating. One partner fills in the intake for both of you, and you each agree to the consent form — together on one device, or separately by link.</p>
        <div class="tags"><span class="tag">Communication</span><span class="tag">Trust</span><span class="tag">Pre-marriage</span><span class="tag">Parenting</span><span class="tag">Separation</span></div></article>
      <article class="aud-card single"><div class="ic-wrap">${icon('user', 26)}</div><h3>Individuals</h3>
        <p>Single, separated, or attending without your partner. Talk through the patterns, decisions and feelings that keep coming up in your relationships.</p>
        <div class="tags"><span class="tag">Breakups</span><span class="tag">Dating</span><span class="tag">Self-esteem</span><span class="tag">Boundaries</span><span class="tag">Grief</span></div></article>
    </div>
  </div></section>

  <section class="section" id="how"><div class="wrap">
    <div class="sec-head"><div class="eyebrow">How it works</div><h2>Three steps to your first session</h2></div>
    <div class="how-grid">
      <div class="how"><div class="num">01</div><h3>Share what matters</h3><p>Fill in a short private intake — about ten minutes. Use your name or a nickname. It’s your choice.</p></div>
      <div class="how"><div class="num">02</div><h3>Agree together</h3><p>Couples each review and sign the consent form, so both partners know exactly what they’re saying yes to.</p></div>
      <div class="how"><div class="num">03</div><h3>Book &amp; meet</h3><p>Pick a time that suits you. ${COUNSELLOR.first} reads your intake first, so you don’t have to start from the beginning.</p></div>
    </div>
  </div></section>

  <section class="section white" id="privacy"><div class="wrap split">
    <div>
      <div class="eyebrow">Privacy first</div>
      <h2 class="h2">Stay anonymous for as long as you need</h2>
      <ul class="ticks">
        <li><span class="t">${icon('check', 14)}</span><div><b>Use a nickname</b><span>Your counsellor sees only what you choose to share.</span></div></li>
        <li><span class="t">${icon('check', 14)}</span><div><b>Talk in-app</b><span>No email or phone number needed in anonymous mode.</span></div></li>
        <li><span class="t">${icon('check', 14)}</span><div><b>Private safety check</b><span>Answered by you alone and seen only by your counsellor.</span></div></li>
      </ul>
    </div>
    <div class="preview" aria-label="Example of what the counsellor sees">
      <div class="preview-h"><span class="av anon">${icon('eyeOff', 20)}</span><div><b>Blue Wren &amp; Kookaburra</b><small>Couple · De facto · Anonymous</small></div></div>
      <div class="kv">
        <div><small>Name</small><span class="redact" style="width:100px"></span></div><div><small>Email</small><span class="redact" style="width:110px"></span></div>
        <div><small>Age range</small><span>25–34</span></div><div><small>Prefers</small><span>Text chat</span></div>
      </div>
      <div class="tags"><span class="badge teal">Trust</span><span class="badge teal">Communication</span><span class="badge warn">${icon('clock', 12)} Partner consent pending</span></div>
    </div>
  </div></section>

  <section class="section" id="counsellor"><div class="wrap">
    <div class="sec-head"><div class="eyebrow">Your counsellor</div><h2>One counsellor, from first message to final session</h2></div>
    ${counsellorProfile()}
  </div></section>

  <section><div class="wrap"><div class="cta">
    ${stripes('cta-stripes', 20, .9)}
    <div class="cta-inner"><h2>Reclaim <strong>us.</strong></h2><p>Take the first step today. It’s private, it’s on your terms, and you can stop at any time.</p>
    <a class="btn" href="#/register">Start your intake ${icon('arrowR', 16)}</a></div>
  </div></div></section>`;
}
