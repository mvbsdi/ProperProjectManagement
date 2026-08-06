/* ============================================================================
   Timmy the Tote — governance suite assistant, v2 (assistant.js)
   Included by every page:  <script defer src="assistant.js"></script>

   WHAT HE DOES
   - First visit: intro → "who are you" → spotlights that role's starting doc.
   - CLICK HIM any time → a menu: Onboard me / Walk me through this page /
     Where do I start? / change role / swap avatar / hide.
   - "Onboard me": a tracked, resumable tour of the onboarding docs. Execs get
     the exec deck. Everyone else gets the exec deck FIRST (the candid,
     no-fluff diagnosis — that's what wins buy-in) and then the team deck,
     swimlane, and tracker. Progress survives navigation; if someone fizzles
     out mid-tour he offers ONCE per browser session to resume — never spams.
   - "Walk me through this page": step-by-step spotlight tour of the actual
     sections/fields on the current page, written for someone who has never
     seen a process document in their life. Next/Back, never blocks input.
   - STAYS OUT OF THE WAY: fades to a ghost whenever you're typing in any
     field, comes back when you stop. One context tip per page, shown once.
   - Dismiss (×) = this session; "don't show again" = permanent; a "need a
     hand?" edge tab re-summons him either way.
   - Avatars: Timmy the Tote (red AutoStore bin) or Robert the Robo-Arm.
   - State: localStorage "ppm_assistant" {off, role, avatar, seen:{}, tour:{i}}
   ========================================================================== */
(function () {
  'use strict';

  var LS = 'ppm_assistant';
  function state() { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } }
  function setState(patch) { var s = state(); Object.keys(patch).forEach(function (k) { s[k] = patch[k]; }); localStorage.setItem(LS, JSON.stringify(s)); return s; }

  var page = (location.pathname.split('/').pop() || 'forms-index.html').toLowerCase() || 'forms-index.html';
  var isHub = page === 'forms-index.html' || page === '';

  /* ------------------------------------------------------------------ roles */
  // [name, start-doc, start-tip, tracker guiding-light]
  var ROLES = [
    ['Executive', 'project-lifecycle-exec.html',
      'Start with the Executive Working Session deck — 20 slides, ends with the four asks.',
      'On the tracker, watch the gate markers: a red G means a project is waiting on a sign-off.'],
    ['KAM / Sales', 'project-lifecycle-slides.html',
      'Start with the Team Overview deck. One rule matters most to you: Software and Controls get consulted at Solution Shaping — BEFORE the SOW (Rule 6).',
      'Your projects live at Stages 1–3 here. Get them into Intake early — that\'s the whole point.'],
    ['Project Manager', 'tracker.html',
      'Start at the Active Projects tracker — it shows every project, where it sits, and the one next action.',
      'You own the schedule. The stage strip shows what\'s blocked; the history shows who did what.'],
    ['TPM', 'tracker.html',
      'Start at the tracker, then live in the Gate Checklist — you run the gate reviews and own the FSD.',
      'Gates 1, 2, 3 are yours to run. Record results here the moment the review ends.'],
    ['Solution Architect', 'swimlane.html',
      'Start with the Swimlane — find your lane and see exactly which stages you drive.',
      'Check Stage 8 (Site Readiness) items early — you\'re the one on site.'],
    ['Software Engineer', 'tracker.html',
      'Start at the tracker — find your project and it tells you what stage it\'s in and what\'s next.',
      'Rule 1: no customization without a signed CR. If work shows up without one, point at the CR form.'],
    ['Controls Engineer', 'tracker.html',
      'Start at the tracker — find your project. Controls signs Gate 1, 2 AND 3.',
      'No Gate 3 sign-off, no travel. Your name is on that line.'],
    ['Just looking around', 'forms-index.html',
      'The flow strip at the top of the hub is the whole process in one row — start there.',
      'Poke around. Everything links back to the Document Hub.']
  ];

  /* ------------------------------------------------------- onboarding tours */
  // Execs: the exec deck then the tracker. Everyone else: exec deck FIRST
  // (candid diagnosis = buy-in), then the team deck, swimlane, tracker.
  function tourSteps() {
    var exec = state().role === 'Executive';
    if (exec) return [
      ['project-lifecycle-exec.html', 'The working session deck', 'This is the whole case in 20 slides: what keeps failing, why, and the four decisions being asked of leadership. Use ← → arrow keys.'],
      ['tracker.html', 'The Active Projects tracker', 'This is where you check status without calling a meeting. Red gate marker = a project waiting on a sign-off.']
    ];
    return [
      ['project-lifecycle-exec.html', 'Why this exists (the candid one)', 'Start here even though it says "executive" — it\'s the blunt version: software finds out last, people scramble, deadlines slip. If that\'s ever been your week, this deck is about you. Use ← → arrow keys.'],
      ['project-lifecycle-slides.html', 'How it works day-to-day', 'Now the practical version — one idea per slide, no jargon. This is what the process asks of YOU and what it promises back.'],
      ['swimlane.html', 'Find your lane', 'One picture: every role, every stage. Find your row and read left to right — that\'s your whole job in this process.'],
      ['tracker.html', 'Where you\'ll actually live', 'Day to day, this page is it: find your project, it shows one highlighted next action. If you learn one page, learn this one.']
    ];
  }
  function tour() { return state().tour || null; }

  /* -------------------------------------------------------- per-page helps */
  // Step-by-step walkthroughs. Each step: [css-selector or null, text].
  // Written for a first-time user. Selectors verified against the real pages.
  var WALKS = {
    'forms-index.html': [
      ['.flow', 'This strip is the whole process in one row. A project moves left to right. The red GATE boxes are checkpoints — a project can\'t move past one until the right people sign off.'],
      ['a.doc-card[href="tracker.html"]', 'The tracker is the live list of every project. If you only ever click one thing, click this.'],
      ['a.doc-card[href="form-project-intake.html"]', 'Forms look like paperwork, but each one is just "write it down so nobody can pretend they didn\'t know." This one starts a project officially.'],
      ['.rules', 'These are the rules everyone agreed to. Short version: no surprises, no verbal promises, no skipped sign-offs.']
    ],
    'tracker.html': [
      ['.toolbar', 'Top bar: filter buttons on the left, "+ New Project" on the right. Put your name in the box at the top right of the page — that\'s how the history knows who did what.'],
      ['#list', 'Every card here is one project. The numbered strip is the 10 stages — blue segments are done, the bright one is where the project is NOW. Little G badges are the gates: green ✓ passed, red = waiting.'],
      [null, 'Click any project card to open it. Inside, the "YOU ARE HERE" box always shows exactly ONE blue button — that is the next thing to do. You never have to figure it out yourself.'],
      [null, 'When a gate review happens: click "Record Gate result", paste the doc ID from the checklist email, and hit PASS / CONDITIONAL / FAIL. PASS moves the project forward automatically.']
    ],
    'form-project-intake.html': [
      [null, 'This form officially starts a project. Fill it top to bottom — anything you don\'t know yet, say so in the field rather than leaving it blank.'],
      ['.section', 'Work one gray section card at a time. The header tells you what the section is for. Fields marked * are required; everything else is "fill what you know."'],
      [null, 'The document ID in the top corner (INT-2026-…) is generated for you. Copy it into the tracker\'s "Intake doc ID" field afterwards so the project and the paperwork stay linked.'],
      [null, 'When you hit Submit, nothing scary happens — it just opens an email with everything you typed, addressed to the process owner. Read it, hit send. Done.']
    ],
    'form-change-request.html': [
      [null, 'Use this any time someone wants something that isn\'t in the agreed scope — a new screen, a new feature, "one small thing." The rule is simple: no CR, no work.'],
      ['.section', 'Same drill as every form: one section card at a time, top to bottom. The impact matrix is just "who gets more work because of this change" — be honest.'],
      [null, 'Effort estimate: a rough number from the Software or Controls lead is fine. The point is that SOMEONE with knowledge sized it before anyone promised it.'],
      [null, 'Submit opens a pre-written email. The CR isn\'t real until the approvals come back — don\'t start work on a verbal "yeah, go ahead."']
    ],
    'form-gate-checklist.html': [
      ['.gate-tabs', 'First: pick which gate you\'re running with these three tabs. Gate 1 = before the contract, Gate 2 = before building, Gate 3 = before anyone travels to site.'],
      ['.section', 'Each item is a checkbox. Check it only if it\'s actually true — this list is the record everyone points at later.'],
      [null, 'Items tagged BLOCKER are non-negotiable. The form will physically refuse to submit a PASS while any blocker is unchecked. That\'s not a bug — that\'s the whole point.'],
      [null, 'Outcome: PASS = move on. CONDITIONAL = move on, but the leftover conditions are written down with an owner. FAIL = fix and re-run. Then Submit opens the email — send it and record the result in the tracker.']
    ],
    'form-closeout-retro.html': [
      [null, 'Last form of a project, Stage 10. Twenty minutes of honesty here is what stops the next project from having the same problems.'],
      ['.section', 'Top sections are facts: dates, what shipped vs. what was sold, which gates passed first try. Just look them up in the tracker and copy them in.'],
      [null, 'The keep / stop / start part: write like a human. "Stop: finding out about projects the week docs are due" is a perfectly good answer.'],
      [null, 'Action items need an owner and a date or they\'re wishes, not actions. Then submit — it opens the usual pre-written email.']
    ],
    'swimlane.html': [
      ['.legend', 'The colors mean how much a role owns a stage: red = owns the decision, yellow = does the work, blue = helps, green = gets asked, gray = just kept in the loop.'],
      ['.grid', 'Find YOUR row. Read it left to right — that\'s your whole involvement across a project\'s life. Notice nobody owns everything.'],
      [null, 'The GATE badges on stages 3-ish, 6, and 8 are the sign-off points. If your row is red or yellow at a gate column, your signature is part of that gate.']
    ],
    'raci.html': [
      ['.legend', 'Four letters: R = does the work, A = accountable (one throat to choke), C = gets consulted first, I = gets told after.'],
      ['table', 'Click a role\'s column header to light up everything they touch. Click a row to spotlight one activity.'],
      ['.filters', 'These buttons answer "what is X actually on the hook for?" — one click per role. Reset clears it.']
    ],
    'project-lifecycle-exec.html': [[null, 'Use ← → arrow keys to move through the deck. It builds: diagnosis → framework → governance → the four asks. About 15 minutes.']],
    'project-lifecycle-slides.html': [[null, 'Use ← → arrow keys. One idea per slide, built for a first read. If a slide feels obvious, good — next.']],
    'project-lifecycle-pack.html': [[null, 'This is the everything-document: lifecycle, RACI, gates, rules, metrics on one page. Nobody reads it top to bottom — Ctrl+F what you need.']]
  };

  // one-line passive tips (shown once per page after onboarding)
  var TIPS = {
    'tracker.html': 'This is the live inventory. Click a project — there\'s always ONE highlighted next action. Click me if you want the full walkthrough.',
    'form-project-intake.html': 'One section card at a time, top to bottom. Click me and I\'ll walk you through it.',
    'form-change-request.html': 'No CR = no work — that\'s the rule this form enforces. Click me for a walkthrough.',
    'form-gate-checklist.html': 'Pick your gate tab first. PASS won\'t submit while a BLOCKER is unchecked — on purpose. Click me for the full tour.',
    'form-closeout-retro.html': 'Stage 10. Be honest in here — it\'s how the process gets better. Click me if anything\'s unclear.',
    'swimlane.html': 'Find your row, read left to right. Click me and I\'ll decode the colors.',
    'raci.html': 'Click a role\'s column header to see everything they own. Click me for more.',
    'project-lifecycle-exec.html': 'Use ← → arrow keys to move through the deck.',
    'project-lifecycle-slides.html': 'Use ← → arrow keys. One idea per slide.',
    'project-lifecycle-pack.html': 'The dense one. Ctrl+F is your friend.'
  };

  /* ---------------------------------------------------------------- avatars */
  function timmySVG() {
    return '<svg viewBox="0 0 100 90" width="72" height="65" aria-label="Timmy the Tote">' +
      '<g class="tw-bob">' +
      '<path d="M14 22 L86 22 L80 82 L20 82 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="3"/>' +
      '<path d="M14 22 L86 22 L84 34 L16 34 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="3"/>' +
      '<line x1="30" y1="36" x2="27" y2="78" stroke="#7f1d1d" stroke-width="2" opacity=".55"/>' +
      '<line x1="50" y1="36" x2="50" y2="78" stroke="#7f1d1d" stroke-width="2" opacity=".55"/>' +
      '<line x1="70" y1="36" x2="73" y2="78" stroke="#7f1d1d" stroke-width="2" opacity=".55"/>' +
      '<g class="tw-eye"><circle cx="38" cy="54" r="9" fill="#fff"/><circle class="tw-pupil" cx="40" cy="56" r="4" fill="#111"/></g>' +
      '<g class="tw-eye"><circle cx="62" cy="54" r="9" fill="#fff"/><circle class="tw-pupil" cx="64" cy="56" r="4" fill="#111"/></g>' +
      '<path d="M42 68 Q50 74 58 68" stroke="#7f1d1d" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '</g></svg>';
  }
  function robertSVG() {
    return '<svg viewBox="0 0 100 90" width="72" height="65" aria-label="Robert the Robo-Arm">' +
      '<g class="tw-bob">' +
      '<rect x="30" y="72" width="40" height="12" rx="3" fill="#475569" stroke="#1e293b" stroke-width="3"/>' +
      '<path d="M50 74 L38 48" stroke="#64748b" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M38 48 L58 28" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>' +
      '<circle cx="38" cy="48" r="6" fill="#f97316" stroke="#7c2d12" stroke-width="2"/>' +
      '<path d="M58 28 L70 20 M58 28 L52 14" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/>' +
      '<g class="tw-eye"><circle cx="58" cy="42" r="8" fill="#fff"/><circle class="tw-pupil" cx="60" cy="44" r="3.5" fill="#111"/></g>' +
      '<g class="tw-eye"><circle cx="76" cy="42" r="8" fill="#fff"/><circle class="tw-pupil" cx="78" cy="44" r="3.5" fill="#111"/></g>' +
      '<path d="M62 54 Q69 58 76 54" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '</g></svg>';
  }
  function avatarSVG() { return (state().avatar === 'robert' ? robertSVG() : timmySVG()); }
  function avatarName() { return state().avatar === 'robert' ? 'Robert the Robo-Arm' : 'Timmy the Tote'; }

  /* -------------------------------------------------------------------- css */
  var css = '' +
    '#tw-wrap{position:fixed;right:18px;bottom:18px;z-index:9999;font-family:"Segoe UI",system-ui,sans-serif;display:flex;flex-direction:column;align-items:flex-end;gap:8px;transition:opacity .35s;}' +
    '#tw-wrap.tw-ghost{opacity:.14;pointer-events:none;}' +
    '#tw-bubble{background:#1c2030;border:1px solid #3b82f6;border-radius:12px;padding:14px 16px;max-width:310px;color:#f1f5f9;font-size:13px;line-height:1.55;box-shadow:0 8px 30px #0009;position:relative;}' +
    '#tw-bubble:after{content:"";position:absolute;right:26px;bottom:-8px;width:14px;height:14px;background:#1c2030;border-right:1px solid #3b82f6;border-bottom:1px solid #3b82f6;transform:rotate(45deg);}' +
    '#tw-bubble b{color:#fff}' +
    '#tw-bubble .tw-x{position:absolute;top:6px;right:9px;background:none;border:0;color:#64748b;font-size:15px;cursor:pointer;padding:2px}' +
    '#tw-bubble .tw-x:hover{color:#f1f5f9}' +
    '.tw-step{font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#3b82f6;margin-bottom:5px}' +
    '.tw-btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}' +
    '.tw-btns button,.tw-btns a{background:#0b0d13;border:1px solid #252a3d;border-radius:7px;color:#94a3b8;font-size:12px;padding:6px 10px;cursor:pointer;text-decoration:none;font-family:inherit}' +
    '.tw-btns button:hover,.tw-btns a:hover{border-color:#3b82f6;color:#f1f5f9}' +
    '.tw-btns .tw-primary{background:#3b82f6;border-color:#3b82f6;color:#fff;font-weight:600}' +
    '.tw-menu{display:flex;flex-direction:column;gap:6px;margin-top:10px}' +
    '.tw-menu button{text-align:left;background:#0b0d13;border:1px solid #252a3d;border-radius:8px;color:#f1f5f9;font-size:13px;padding:9px 12px;cursor:pointer;font-family:inherit}' +
    '.tw-menu button:hover{border-color:#3b82f6}' +
    '.tw-menu button small{display:block;color:#64748b;font-size:11px;margin-top:2px}' +
    '.tw-foot{margin-top:10px;padding-top:8px;border-top:1px solid #252a3d;display:flex;gap:12px;font-size:11px;flex-wrap:wrap}' +
    '.tw-foot a{color:#64748b;cursor:pointer;text-decoration:none}' +
    '.tw-foot a:hover{color:#94a3b8;text-decoration:underline}' +
    '#tw-avatar{cursor:pointer;filter:drop-shadow(0 4px 10px #0008);background:none;border:0;padding:0;line-height:0}' +
    '.tw-bob{animation:twBob 3.2s ease-in-out infinite;transform-origin:50% 90%}' +
    '@keyframes twBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}' +
    '.tw-pupil{animation:twLook 7s ease-in-out infinite}' +
    '@keyframes twLook{0%,60%,100%{transform:translate(0,0)}70%,90%{transform:translate(-3px,-1px)}}' +
    '.tw-eye{animation:twBlink 5.5s infinite;transform-origin:center 54px}' +
    '@keyframes twBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}' +
    '#tw-tab{position:fixed;right:0;bottom:90px;z-index:9998;background:#13161f;border:1px solid #252a3d;border-right:0;border-radius:8px 0 0 8px;color:#64748b;font-size:11px;padding:8px 7px;cursor:pointer;writing-mode:vertical-rl;letter-spacing:.08em}' +
    '#tw-tab:hover{color:#f1f5f9;border-color:#3b82f6}' +
    '.tw-spot{position:relative;z-index:9997!important;outline:3px solid #3b82f6!important;outline-offset:4px;border-radius:12px;box-shadow:0 0 0 9999px rgba(4,6,10,.72)!important;transition:box-shadow .3s}' +
    '@media(max-width:640px){#tw-bubble{max-width:76vw}}' +
    '@media print{#tw-wrap,#tw-tab{display:none!important}}';

  /* -------------------------------------------------------------------- dom */
  var wrap, bubble, spotEl = null, lastSay = null;

  function ensureDom() {
    if (wrap) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    wrap = document.createElement('div'); wrap.id = 'tw-wrap';
    wrap.innerHTML = '<div id="tw-bubble"></div><button id="tw-avatar" title="' + avatarName() + '">' + avatarSVG() + '</button>';
    document.body.appendChild(wrap);
    bubble = wrap.querySelector('#tw-bubble');
    // CLICKING HIM = the menu (or reopen last bubble if it was hidden)
    wrap.querySelector('#tw-avatar').addEventListener('click', function () {
      if (bubble.style.display === 'none') { menu(); } else { menu(); }
    });
    // step aside while the user types
    document.addEventListener('focusin', function (e) {
      if (!wrap || wrap.contains(e.target)) return;
      var t = e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || e.target.isContentEditable) wrap.classList.add('tw-ghost');
    });
    document.addEventListener('focusout', function (e) {
      if (!wrap) return;
      setTimeout(function () {
        var a = document.activeElement, t = a && a.tagName;
        if (!(t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (a && a.isContentEditable))) wrap.classList.remove('tw-ghost');
      }, 150);
    });
  }

  function refreshAvatar() { var b = wrap.querySelector('#tw-avatar'); b.innerHTML = avatarSVG(); b.title = avatarName(); }

  function tab() {
    if (document.getElementById('tw-tab')) return;
    var t = document.createElement('button'); t.id = 'tw-tab'; t.textContent = 'need a hand?';
    t.title = 'Bring back the assistant';
    t.addEventListener('click', function () { t.remove(); setState({ off: 0 }); boot(true); });
    document.body.appendChild(t);
  }

  function dismiss(forever) {
    unspot();
    if (wrap) { wrap.remove(); wrap = null; bubble = null; }
    if (forever) setState({ off: 1 });
    else try { sessionStorage.setItem('tw_off', '1'); } catch (e) {}
    tab();
  }

  function unspot() { if (spotEl) { spotEl.classList.remove('tw-spot'); spotEl = null; } }
  function spot(sel) {
    unspot();
    if (!sel) return false;
    var el = document.querySelector(sel);
    if (!el) return false;
    el.classList.add('tw-spot'); spotEl = el;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }

  function footer() {
    return '<div class="tw-foot">' +
      '<a data-a="swap">swap to ' + (state().avatar === 'robert' ? 'Timmy' : 'Robert') + '</a>' +
      '<a data-a="role">change role</a>' +
      '<a data-a="never">don\u2019t show again</a></div>';
  }

  function say(html, btns, opts) {
    ensureDom();
    opts = opts || {};
    bubble.style.display = '';
    bubble.innerHTML = '<button class="tw-x" title="Hide for now">\u00d7</button>' + html +
      (btns || '') + (opts.noFoot ? '' : footer());
    bubble.querySelector('.tw-x').addEventListener('click', function () { unspot(); bubble.style.display = 'none'; });
    bubble.querySelectorAll('[data-a]').forEach(function (el) {
      el.addEventListener('click', function () { act(el.getAttribute('data-a')); });
    });
  }

  function act(a) {
    if (a === 'never') { dismiss(true); return; }
    if (a === 'hide') { dismiss(false); return; }
    if (a === 'swap') { setState({ avatar: state().avatar === 'robert' ? 'timmy' : 'robert' }); refreshAvatar(); if (lastSay) lastSay(); return; }
    if (a === 'role') { askRole(); return; }
    if (a === 'menu') { menu(); return; }
    if (a === 'onboard') { startTour(); return; }
    if (a === 'walk') { walk(0); return; }
    if (a === 'start') { whereToStart(); return; }
    if (a === 'quiet') { unspot(); markSeen(); bubble.style.display = 'none'; return; }
    if (a === 'tour-quit') { setState({ tour: null }); menu(); return; }
    if (a === 'tour-later') { try { sessionStorage.setItem('tw_tour_snooze', '1'); } catch (e) {} unspot(); bubble.style.display = 'none'; return; }
    if (a.indexOf('walk:') === 0) { walk(parseInt(a.slice(5), 10)); return; }
    if (a.indexOf('tour-next:') === 0) { tourAdvance(parseInt(a.slice(10), 10)); return; }
    if (a.indexOf('pick:') === 0) { pickRole(a.slice(5)); return; }
  }

  function roleObj() {
    var r = state().role;
    for (var i = 0; i < ROLES.length; i++) if (ROLES[i][0] === r) return ROLES[i];
    return null;
  }

  function markSeen() { var s = state(); s.seen = s.seen || {}; s.seen[page] = 1; localStorage.setItem(LS, JSON.stringify(s)); }

  /* ------------------------------------------------------------------- menu */
  function menu() {
    lastSay = menu;
    unspot();
    var t = tour();
    var hasWalk = !!WALKS[page];
    var m = '<div class="tw-menu">' +
      '<button data-a="onboard"><b>' + (t ? 'Continue onboarding (' + (t.i + 1) + ' of ' + tourSteps().length + ')' : 'Onboard me') + '</b>' +
      '<small>' + (t ? 'Pick up the tour where you left off.' : 'A short guided tour of the docs — why this exists, then how to use it.') + '</small></button>' +
      (hasWalk ? '<button data-a="walk"><b>Walk me through this page</b><small>Step-by-step, with the important parts highlighted.</small></button>' : '') +
      '<button data-a="start"><b>Where do I start?</b><small>Points you at the right document for your role.</small></button>' +
      '<button data-a="hide"><b>Hide for now</b><small>I\u2019ll wait behind the "need a hand?" tab.</small></button>' +
      '</div>';
    say('<b>What do you need?</b>' + m, '', {});
  }

  function whereToStart() {
    var r = roleObj();
    if (!r) { askRole(); return; }
    lastSay = whereToStart;
    var spotted = isHub && spot('a.doc-card[href="' + r[1] + '"]');
    say('<b>' + r[0] + ':</b> ' + r[2] + (spotted ? '<br><br>That\u2019s the one lit up.' : ''),
      '<div class="tw-btns"><a class="tw-primary" href="' + r[1] + '">Take me there \u2192</a><button data-a="menu">\u2190 back</button></div>');
  }

  /* ------------------------------------------------------------- first visit */
  function intro() {
    lastSay = intro;
    say('<b>Hi! I\u2019m ' + avatarName() + '.</b><br>First time in the governance suite? Tell me who you are and I\u2019ll point you at the right starting place. Click me any time you\u2019re stuck \u2014 I can walk you through any page here.',
      '<div class="tw-btns"><button class="tw-primary" data-a="role">Sure, help me out</button><button data-a="quiet">I\u2019ll wander on my own</button></div>');
  }

  function askRole() {
    lastSay = askRole;
    var btns = ROLES.map(function (r) { return '<button data-a="pick:' + r[0] + '">' + r[0] + '</button>'; }).join('');
    say('<b>Who are you around here?</b><br>This never locks anything away \u2014 it just tells me where to point you.',
      '<div class="tw-btns">' + btns + '</div>');
  }

  function pickRole(name) {
    setState({ role: name });
    markSeen();
    var r = roleObj();
    lastSay = afterPick;
    afterPick();
    function afterPick() {
      var spotted = isHub && spot('a.doc-card[href="' + r[1] + '"]');
      say('<b>' + r[0] + ' \u2014 got it.</b><br>' + r[2] + (spotted ? '<br><br>That\u2019s the one lit up.' : '') +
        '<br><br>Want the short onboarding tour? It starts with WHY this process exists \u2014 that part\u2019s worth it, promise.',
        '<div class="tw-btns"><button class="tw-primary" data-a="onboard">Onboard me</button>' +
        '<a href="' + r[1] + '">Just take me there \u2192</a><button data-a="quiet">Neither, thanks</button></div>');
    }
  }

  /* ------------------------------------------------------------ onboarding */
  function startTour() {
    if (!state().role) { askRole(); return; }
    var t = tour() || { i: 0 };
    setState({ tour: t });
    var steps = tourSteps();
    var step = steps[Math.min(t.i, steps.length - 1)];
    if (page !== step[0]) { location.href = step[0]; return; }
    tourBubble();
  }

  function tourBubble() {
    var t = tour(); if (!t) return;
    var steps = tourSteps();
    var i = Math.min(t.i, steps.length - 1);
    var step = steps[i];
    var last = i === steps.length - 1;
    lastSay = tourBubble;
    say('<div class="tw-step">Onboarding \u00b7 step ' + (i + 1) + ' of ' + steps.length + '</div>' +
      '<b>' + step[1] + '</b><br>' + step[2],
      '<div class="tw-btns">' +
      '<button class="tw-primary" data-a="tour-next:' + i + '">' + (last ? 'Finish \u2713' : 'Done here \u2014 next \u2192') + '</button>' +
      '<button data-a="tour-later">Finish later</button>' +
      '<button data-a="tour-quit">Quit tour</button></div>');
  }

  function tourAdvance(i) {
    var steps = tourSteps();
    if (i >= steps.length - 1) {
      setState({ tour: null, tourDone: 1 });
      say('<b>That\u2019s the tour \u2014 you\u2019re onboarded.</b><br>From here on, the tracker tells you what\u2019s next on every project, and I\u2019m in the corner if a page ever stops making sense.',
        '<div class="tw-btns"><a class="tw-primary" href="tracker.html">Open the tracker \u2192</a><button data-a="quiet">Done</button></div>');
      return;
    }
    setState({ tour: { i: i + 1 } });
    location.href = steps[i + 1][0];
  }

  /* ------------------------------------------------------- page walkthrough */
  function walk(i) {
    var stepsW = WALKS[page];
    if (!stepsW || !stepsW.length) { menu(); return; }
    i = Math.max(0, Math.min(i, stepsW.length - 1));
    var s = stepsW[i];
    var last = i === stepsW.length - 1;
    lastSay = function () { walk(i); };
    spot(s[0]);
    say('<div class="tw-step">This page \u00b7 ' + (i + 1) + ' of ' + stepsW.length + '</div>' + s[1],
      '<div class="tw-btns">' +
      (i > 0 ? '<button data-a="walk:' + (i - 1) + '">\u2190 back</button>' : '') +
      (last ? '<button class="tw-primary" data-a="quiet">Got it \u2713</button>'
            : '<button class="tw-primary" data-a="walk:' + (i + 1) + '">Next \u2192</button>') +
      '<button data-a="menu">menu</button></div>');
  }

  /* ------------------------------------------------------------ passive tip */
  function contextTip() {
    var r = roleObj();
    var tip = TIPS[page];
    var extra = '';
    if (page === 'tracker.html' && r) extra = '<br><br><b>For you (' + r[0] + '):</b> ' + r[3];
    if (!tip && !extra) { if (bubble) bubble.style.display = 'none'; return; }
    lastSay = contextTip;
    say((tip || '') + extra, '<div class="tw-btns">' + (WALKS[page] ? '<button class="tw-primary" data-a="walk">Walk me through it</button>' : '') + '<button data-a="quiet">Got it</button></div>');
  }

  /* ------------------------------------------------------------------- boot */
  function boot(force) {
    var s = state();
    var sessOff = false; try { sessOff = sessionStorage.getItem('tw_off') === '1'; } catch (e) {}
    if (!force && (s.off || sessOff)) { tab(); return; }
    ensureDom();
    if (!s.role) { intro(); return; }
    // mid-tour and we're standing on the tour's current page → keep touring
    var t = tour();
    if (t) {
      var steps = tourSteps();
      var cur = steps[Math.min(t.i, steps.length - 1)];
      if (page === cur[0]) { tourBubble(); return; }
      // unfinished tour, wandered off: offer to resume ONCE per session, no nagging
      var snoozed = false; try { snoozed = sessionStorage.getItem('tw_tour_snooze') === '1'; } catch (e) {}
      if (!snoozed) {
        lastSay = boot.bind(null, true);
        say('You\u2019re partway through onboarding (step ' + (t.i + 1) + ' of ' + steps.length + '). Want to pick it back up? No pressure.',
          '<div class="tw-btns"><button class="tw-primary" data-a="onboard">Resume tour</button><button data-a="tour-later">Not now</button></div>');
        return;
      }
    }
    if (force) { menu(); return; }
    if (!(s.seen && s.seen[page])) { markSeen(); contextTip(); return; }
    bubble.style.display = 'none';
    lastSay = contextTip;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { boot(false); });
  else boot(false);
})();
