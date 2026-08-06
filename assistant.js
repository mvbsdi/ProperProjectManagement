/* ============================================================================
   Timmy the Tote — governance suite assistant (assistant.js)
   One shared file, included by every page:  <script defer src="assistant.js"></script>

   - Bottom-right margin dweller. First visit: introduces himself, asks who you
     are, then SPOTLIGHTS where that role should start. Not a filter, a guide.
   - Context tip on every page (shown once per page, re-summonable).
   - Dismiss (×) hides for the session; "don't show again" is permanent; a tiny
     tab stays in the corner to bring him back either way.
   - Avatar is swappable: Timmy the Tote (AutoStore bin) or Robert the Robo-Arm.
   - State in localStorage "ppm_assistant": {off, role, avatar, seen:{page:1}}
   ========================================================================== */
(function () {
  'use strict';

  var LS = 'ppm_assistant';
  function state() { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } }
  function setState(patch) { var s = state(); Object.keys(patch).forEach(function (k) { s[k] = patch[k]; }); localStorage.setItem(LS, JSON.stringify(s)); return s; }

  var page = (location.pathname.split('/').pop() || 'forms-index.html').toLowerCase() || 'forms-index.html';
  var isHub = page === 'forms-index.html' || page === '';

  // --- roles: where each one starts, and their tracker "guiding light" --------
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
      'Start at the tracker — find your project and it tells you what stage it\'s in and what\'s next. The RACI shows where Software must sign.',
      'Rule 1: no customization without a signed CR. If work shows up without one, point at the CR form.'],
    ['Controls Engineer', 'tracker.html',
      'Start at the tracker — find your project. Controls signs Gate 1, 2 AND 3; the RACI shows where.',
      'No Gate 3 sign-off, no travel. Your name is on that line.'],
    ['Just looking around', 'forms-index.html',
      'Fair enough. The flow strip at the top of the hub is the whole process in one row — start there.',
      'Poke around. Everything links back to the Document Hub.']
  ];

  // --- per-page context tips ---------------------------------------------------
  var TIPS = {
    'tracker.html': 'This is the live inventory. Click a project to see exactly where it is — there\'s always ONE highlighted next action. No guessing.',
    'form-project-intake.html': 'Stage 4 paperwork. The TPM fills this in; it feeds Gate 1. Submitting opens an email with everything pre-filled — just hit send.',
    'form-change-request.html': 'No CR = no work. Fill this BEFORE anyone touches a keyboard. Verbal requests are not work orders.',
    'form-gate-checklist.html': 'Pick your gate tab at the top. Heads up: PASS won\'t submit while any BLOCKER item is unchecked — that\'s on purpose.',
    'form-closeout-retro.html': 'Stage 10. Be honest in here — especially the "was the TPM engaged" part. This form is how the process gets better.',
    'swimlane.html': 'Find your row, read left to right. Color = how much you own that stage. Gates are flagged on their columns.',
    'raci.html': 'Click a role\'s column header to light up everything they\'re on the hook for. The filter buttons show where each role is Accountable.',
    'project-lifecycle-exec.html': 'Use ← → arrow keys to move through the deck.',
    'project-lifecycle-slides.html': 'Use ← → arrow keys. One idea per slide, no traps.',
    'project-lifecycle-pack.html': 'This is the dense one. Ctrl+F is your friend.'
  };

  // --- avatars ------------------------------------------------------------------
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

  // --- css ------------------------------------------------------------------------
  var css = '' +
    '#tw-wrap{position:fixed;right:18px;bottom:18px;z-index:9999;font-family:"Segoe UI",system-ui,sans-serif;display:flex;flex-direction:column;align-items:flex-end;gap:8px;}' +
    '#tw-bubble{background:#1c2030;border:1px solid #3b82f6;border-radius:12px;padding:14px 16px;max-width:300px;color:#f1f5f9;font-size:13px;line-height:1.55;box-shadow:0 8px 30px #0009;position:relative;}' +
    '#tw-bubble:after{content:"";position:absolute;right:26px;bottom:-8px;width:14px;height:14px;background:#1c2030;border-right:1px solid #3b82f6;border-bottom:1px solid #3b82f6;transform:rotate(45deg);}' +
    '#tw-bubble b{color:#fff}' +
    '#tw-bubble .tw-x{position:absolute;top:6px;right:9px;background:none;border:0;color:#64748b;font-size:15px;cursor:pointer;padding:2px}' +
    '#tw-bubble .tw-x:hover{color:#f1f5f9}' +
    '.tw-btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}' +
    '.tw-btns button,.tw-btns a{background:#0b0d13;border:1px solid #252a3d;border-radius:7px;color:#94a3b8;font-size:12px;padding:6px 10px;cursor:pointer;text-decoration:none;font-family:inherit}' +
    '.tw-btns button:hover,.tw-btns a:hover{border-color:#3b82f6;color:#f1f5f9}' +
    '.tw-btns .tw-primary{background:#3b82f6;border-color:#3b82f6;color:#fff;font-weight:600}' +
    '.tw-foot{margin-top:10px;padding-top:8px;border-top:1px solid #252a3d;display:flex;gap:12px;font-size:11px}' +
    '.tw-foot a{color:#64748b;cursor:pointer;text-decoration:none}' +
    '.tw-foot a:hover{color:#94a3b8;text-decoration:underline}' +
    '#tw-avatar{cursor:pointer;filter:drop-shadow(0 4px 10px #0008);background:none;border:0;padding:0;line-height:0}' +
    '.tw-bob{animation:twBob 3.2s ease-in-out infinite;transform-origin:50% 90%}' +
    '@keyframes twBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}' +
    '.tw-pupil{animation:twLook 7s ease-in-out infinite}' +
    '@keyframes twLook{0%,60%,100%{transform:translate(0,0)}70%,90%{transform:translate(-3px,-1px)}}' +
    '.tw-eye{animation:twBlink 5.5s infinite}' +
    '@keyframes twBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}' +
    '.tw-eye{transform-origin:center 54px}' +
    '#tw-tab{position:fixed;right:0;bottom:90px;z-index:9998;background:#13161f;border:1px solid #252a3d;border-right:0;border-radius:8px 0 0 8px;color:#64748b;font-size:11px;padding:8px 7px;cursor:pointer;writing-mode:vertical-rl;letter-spacing:.08em}' +
    '#tw-tab:hover{color:#f1f5f9;border-color:#3b82f6}' +
    '.tw-spot{position:relative;z-index:9997!important;outline:3px solid #3b82f6!important;outline-offset:4px;border-radius:12px;box-shadow:0 0 0 9999px rgba(4,6,10,.72)!important;transition:box-shadow .3s}' +
    '@media(max-width:640px){#tw-bubble{max-width:76vw}}' +
    '@media print{#tw-wrap,#tw-tab{display:none!important}}';

  // --- dom ------------------------------------------------------------------------
  var wrap, bubble, spotEl = null;

  function ensureDom() {
    if (wrap) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    wrap = document.createElement('div'); wrap.id = 'tw-wrap';
    wrap.innerHTML = '<div id="tw-bubble"></div><button id="tw-avatar" title="' + avatarName() + '">' + avatarSVG() + '</button>';
    document.body.appendChild(wrap);
    bubble = wrap.querySelector('#tw-bubble');
    wrap.querySelector('#tw-avatar').addEventListener('click', function () {
      if (bubble.style.display === 'none') { bubble.style.display = ''; } else { bubble.style.display = 'none'; unspot(); }
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
    if (wrap) { wrap.remove(); wrap = null; }
    if (forever) setState({ off: 1 });
    else window.twSessionOff = true;
    tab();
  }

  function unspot() { if (spotEl) { spotEl.classList.remove('tw-spot'); spotEl = null; } }
  function spot(sel) {
    unspot();
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

  function say(html, btns) {
    ensureDom();
    bubble.style.display = '';
    bubble.innerHTML = '<button class="tw-x" title="Hide for now">\u00d7</button>' + html +
      (btns ? '<div class="tw-btns">' + btns + '</div>' : '') + footer();
    bubble.querySelector('.tw-x').addEventListener('click', function () { dismiss(false); });
    bubble.querySelectorAll('[data-a]').forEach(function (el) {
      el.addEventListener('click', function () {
        var a = el.getAttribute('data-a');
        if (a === 'never') dismiss(true);
        if (a === 'swap') { setState({ avatar: state().avatar === 'robert' ? 'timmy' : 'robert' }); refreshAvatar(); rerun(); }
        if (a === 'role') askRole();
        if (a === 'go') { var r = roleObj(); if (r) location.href = r[1]; }
        if (a === 'spot') { var r2 = roleObj(); if (r2) spotCard(r2[1]); }
        if (a === 'done') { markSeen(); say('I\u2019ll be down here if you need me. Click me any time.'); }
        if (a.indexOf('pick:') === 0) pickRole(a.slice(5));
      });
    });
  }

  var lastSay = null;
  function rerun() { if (lastSay) lastSay(); }

  function roleObj() {
    var r = state().role;
    for (var i = 0; i < ROLES.length; i++) if (ROLES[i][0] === r) return ROLES[i];
    return null;
  }

  function markSeen() { var s = state(); s.seen = s.seen || {}; s.seen[page] = 1; localStorage.setItem(LS, JSON.stringify(s)); }

  // --- conversation steps -----------------------------------------------------------
  function intro() {
    lastSay = intro;
    say('<b>Hi! I\u2019m ' + avatarName() + '.</b><br>Looks like it\u2019s your first time in the governance suite. Two quick questions and I\u2019ll point you at exactly where to start \u2014 then I\u2019ll get out of your way.',
      '<button class="tw-primary" data-a="role2">Sure, help me out</button><button data-a="done">I\u2019ll wander on my own</button>');
    bubble.querySelector('[data-a="role2"]').addEventListener('click', askRole);
  }

  function askRole() {
    lastSay = askRole;
    var btns = ROLES.map(function (r) { return '<button data-a="pick:' + r[0] + '">' + r[0] + '</button>'; }).join('');
    say('<b>Who are you around here?</b><br>This just tells me where to point you \u2014 it never locks anything away.', btns);
  }

  function pickRole(name) {
    setState({ role: name });
    var r = roleObj();
    markSeen();
    if (isHub) {
      lastSay = function () { afterPick(r); };
      afterPick(r);
    } else {
      lastSay = function () { offRolePage(r); };
      offRolePage(r);
    }
  }

  function afterPick(r) {
    var target = r[1];
    var spotted = spotCard(target);
    say('<b>' + r[0] + ' \u2014 got it.</b><br>' + r[2] + (spotted ? '<br><br>That\u2019s the one lit up \u2014 hard to miss.' : ''),
      '<a class="tw-primary" href="' + target + '">Take me there \u2192</a><button data-a="done">Thanks, I\u2019m good</button>');
  }

  function offRolePage(r) {
    say('<b>' + r[0] + ' \u2014 got it.</b><br>' + r[2],
      '<a class="tw-primary" href="' + r[1] + '">Take me there \u2192</a><button data-a="done">Thanks, I\u2019m good</button>');
  }

  function spotCard(href) {
    // hub cards are <a class="doc-card" href="...">; fall back to any link to the target
    return spot('a.doc-card[href="' + href + '"]') || spot('a[href="' + href + '"]');
  }

  function contextTip() {
    var r = roleObj();
    var tip = TIPS[page];
    var extra = '';
    if (page === 'tracker.html' && r) extra = '<br><br><b>For you (' + r[0] + '):</b> ' + r[3];
    if (!tip && !extra) { tab(); return; }
    lastSay = contextTip;
    say((tip ? tip : '') + extra, '<button class="tw-primary" data-a="done">Got it</button>');
  }

  // --- boot -------------------------------------------------------------------------
  function boot(force) {
    var s = state();
    if (!force && (s.off || window.twSessionOff)) { tab(); return; }
    ensureDom();
    if (!s.role) { intro(); return; }
    if (force || !(s.seen && s.seen[page])) { contextTip(); return; }
    // seen everything here: sit quietly, bubble hidden
    bubble.style.display = 'none';
    lastSay = contextTip;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { boot(false); });
  else boot(false);
})();
