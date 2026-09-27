/* ==========================================================================
   Codebusters Training Center — application (router, pages, test engine)
   ========================================================================== */
(function () {
  'use strict';
  const CB = window.CB, D = window.CBDATA, GEN = window.GEN, WS = window.WS;
  const { L: LESSONS, ORDER } = window.LESSONS;
  const { h } = WS;
  const app = document.getElementById('app');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = s => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  /* ---------------- persistence (per-browser, optional) ---------------- */
  const STORE = 'cbtc-progress-v1';
  function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function save(p) { try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) { /* storage unavailable */ } }
  const progress = Object.assign({ solved: {}, attempts: {}, best: {}, games: {}, tests: [], timed: null }, load());
  function record(type, ok, seconds) {
    progress.attempts[type] = (progress.attempts[type] || 0) + 1;
    if (ok) {
      progress.solved[type] = (progress.solved[type] || 0) + 1;
      if (seconds != null && (!progress.best[type] || seconds < progress.best[type])) progress.best[type] = Math.round(seconds);
    }
    save(progress);
  }

  /* ---------------- theme ---------------- */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
    try { t ? localStorage.setItem('cbtc-theme', t) : localStorage.removeItem('cbtc-theme'); } catch (e) { }
  }
  try { const t = localStorage.getItem('cbtc-theme'); if (t) applyTheme(t); } catch (e) { }
  document.getElementById('themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
  document.getElementById('menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));

  /* ---------------- router ---------------- */
  let cleanups = [];
  function onLeave(fn) { cleanups.push(fn); }
  const routes = [
    [/^\/?$/, pageHome], [/^\/guide$/, pageGuide], [/^\/learn$/, pageLearn], [/^\/learn\/(\w+)$/, pageLesson],
    [/^\/practice$/, pagePracticeIndex], [/^\/practice\/(\w+)$/, pagePractice], [/^\/games$/, pageGames],
    [/^\/games\/([\w-]+)$/, pageGame], [/^\/test$/, pageTestSetup], [/^\/test\/run$/, pageTestRun],
    [/^\/reference$/, pageReference], [/^\/progress$/, pageProgress], [/^\/coach$/, pageCoach]
  ];
  function route() {
    cleanups.forEach(f => { try { f(); } catch (e) { console.error(e); } });
    cleanups = [];
    document.body.classList.remove('nav-open');
    const raw = location.hash.slice(1) || '/';
    const [path, qs] = raw.split('?');
    const params = new URLSearchParams(qs || '');
    app.innerHTML = '';
    for (const [re, fn] of routes) {
      const m = path.match(re);
      if (m) {
        fn(params, ...m.slice(1));
        document.querySelectorAll('.nav a').forEach(a => {
          const hr = a.getAttribute('href').slice(1);
          a.classList.toggle('active', hr === '/' ? path === '/' || path === '' : path.startsWith(hr));
        });
        window.scrollTo(0, 0);
        return;
      }
    }
    app.append(h('div', { class: 'page' }, h('h1', null, 'Page not found'), h('p', null, h('a', { href: '#/' }, 'Go home'))));
  }
  window.addEventListener('hashchange', route);

  /* ---------------- shared bits ---------------- */
  function page(title, sub, ...kids) {
    const el = h('div', { class: 'page' }, h('header', { class: 'page-head' }, h('h1', null, title), sub ? h('p', { class: 'lead' }, sub) : null), ...kids);
    app.append(el);
    return el;
  }
  function usageBadges(id) {
    const u = LESSONS[id].usage;
    return h('div', { class: 'badges' },
      h('span', { class: 'badge reg', title: 'Invitational / Regional' }, 'Regional: ' + u.regional),
      h('span', { class: 'badge st', title: 'State / National' }, 'State/Nat: ' + u.state));
  }
  function cipherCard(id, href, extra) {
    const l = LESSONS[id];
    return h('a', { class: 'ccard', href },
      h('div', { class: 'cicon mono' }, l.icon),
      h('div', { class: 'cbody' }, h('h3', null, l.name, id === 'homophonic' ? h('span', { class: 'new' }, 'NEW') : null),
        h('div', { class: 'fam' }, l.family), h('p', null, l.summary), extra || null));
  }

  /* ======================================================================
     HOME
     ====================================================================== */
  function pageHome() {
    const solvedTotal = Object.values(progress.solved).reduce((a, b) => a + b, 0);
    const practiced = ORDER.filter(id => progress.solved[id]).length;
    const el = h('div', { class: 'page home' });
    el.append(
      h('section', { class: 'hero' },
        h('div', { class: 'hero-text' },
          h('div', { class: 'eyebrow' }, 'Science Olympiad · Division B · 2026–2027 season'),
          h('h1', null, 'Codebusters Training Center'),
          h('p', { class: 'lead' }, 'Learn, practice and race through all 13 Division B cipher types. Each one has a lesson with a step-by-step worked example, an unlimited practice generator with an interactive solving workspace, speed drills, and full mock tests scored with the official rules.'),
          h('div', { class: 'row gap wrap' },
            h('a', { class: 'btn primary', href: '#/learn' }, 'Start learning'),
            h('a', { class: 'btn', href: '#/practice/aristocrat?timed=1' }, 'Timed Aristocrat ⏱'),
            h('a', { class: 'btn', href: '#/test' }, 'Take a mock test'))),
        h('div', { class: 'hero-art mono', 'aria-hidden': 'true', html: heroArt() })),
      h('section', { class: 'stats' },
        stat(solvedTotal, 'problems solved'), stat(`${practiced}/13`, 'cipher types practiced'),
        stat(progress.timed ? fmt(progress.timed) : '—', 'best timed Aristocrat'),
        stat(Object.keys(progress.games).length, 'games played')),
      h('section', null,
        h('h2', null, 'Your training path'),
        h('div', { class: 'path' },
          step('1', 'Learn', 'Read each lesson: history, algorithm, strategy and a worked example you can step through.', '#/learn'),
          step('2', 'Drill', 'Play 60-second games to lock in Morse, Baconian, Atbash, Porta and pattern words.', '#/games'),
          step('3', 'Practice', 'Solve unlimited generated problems with hints and instant scoring.', '#/practice'),
          step('4', 'Compete', 'Take a timed 50-minute mock test with the timed question and special bonus questions.', '#/test'))),
      h('section', null,
        h('h2', null, '2026–27 Division B ciphers'),
        h('p', { class: 'muted' }, 'New this season: the Homophonic cipher. Dropped since last season: Affine.'),
        h('div', { class: 'cgrid' }, ORDER.map(id => cipherCard(id, '#/learn/' + id, usageBadges(id))))));
    app.append(el);
    function stat(v, l) { return h('div', { class: 'stat' }, h('b', null, String(v)), h('span', null, l)); }
    function step(n, t, d, href) { return h('a', { class: 'pstep', href }, h('span', { class: 'pn' }, n), h('b', null, t), h('span', null, d)); }
  }
  function heroArt() {
    const pt = 'CODEBUSTERS';
    const m = CB.randomMap();
    return `<div class="ha-row">${Array.from(pt).map(c => `<span class="ha-c">${m[c]}</span>`).join('')}</div>` +
      `<div class="ha-row">${Array.from(pt).map(c => `<span class="ha-p">${c}</span>`).join('')}</div>` +
      `<div class="ha-row small">${CB.prettyMorse(CB.toMorseStream('SOLVE'))}</div>` +
      `<div class="ha-row small">${CB.baconEncode('CODE').match(/.{5}/g).join(' ')}</div>`;
  }

  /* ======================================================================
     EVENT GUIDE
     ====================================================================== */
  function pageGuide() {
    const rows = ORDER.map(id => `<tr><th>${LESSONS[id].name}</th><td>${LESSONS[id].family}</td><td>${LESSONS[id].usage.regional}</td><td>${LESSONS[id].usage.state}</td></tr>`).join('');
    page('Event Guide', 'What Codebusters is, how it is scored, and how to win it.',
      h('div', { class: 'prose', html: `
      <div class="callout">This is a study summary. The <b>official 2027 Science Olympiad rules</b> and any official FAQ or clarifications
      always take precedence. Download them from <a href="https://www.soinc.org/rules-2027" target="_blank" rel="noopener">soinc.org</a>.</div>
      <h2>The event at a glance</h2>
      <ul>
        <li><b>Goal:</b> cryptanalyze and decode encrypted messages using historical and modern cipher techniques.</li>
        <li><b>Team:</b> up to 3 students working together on one test.</li>
        <li><b>Time:</b> 50 minutes.</li>
        <li><b>Bring:</b> writing utensils and a simple (4- or 5-function, non-programmable) calculator. Check the current rules for exact calculator limits. No notes or books.</li>
        <li><b>Provided:</b> a resource sheet for each team member, with tables such as Morse code, the Baconian alphabet, the Porta table and English letter frequencies. Know them anyway, because looking things up costs time.</li>
      </ul>
      <h2>2026–27 Division B cipher list</h2>
      <p>From the season rule summary (the “Regional” column also covers invitationals):</p>
      <div class="table-scroll"><table class="data"><tr><th>Cipher</th><th>Type</th><th>Regional / Invitational</th><th>State / National</th></tr>${rows}</table></div>
      <p class="small muted"><b>Decode</b> = the key or a hint is given. <b>Cryptanalysis</b> = you get a crib (some known plaintext) and must work out the key.
      Aristocrats use a random or K1 alphabet in Division B (K2/K3 are Division C only). Xenocrypts are in Spanish.
      For cryptanalysis questions the crib location is normally given, except for the Complete Columnar.</p>
      <h2>Scoring</h2>
      <div class="score-grid">
        <div class="scard"><b>Question value</b><p>Each question has a point value, usually 100 to 600 depending on difficulty.</p></div>
        <div class="scard"><b>Two free errors</b><p>Up to <b>2 wrong letters</b> cost nothing. Each error after that costs <b>100 points</b>, and a question never goes below 0. <b>Cryptarithms get no free errors.</b></p></div>
        <div class="scard"><b>Timed question</b><p>Question 1 is an Aristocrat. Solve it (≤ 2 errors) within 10 minutes and earn a bonus of <b>2 × (600 − seconds)</b>. A 3-minute solve is worth 840 points!</p></div>
        <div class="scard"><b>Special bonus</b><p>Questions marked with a ★ earn an extra bonus when solved: one = <b>150</b>, two = <b>400</b>, three = <b>750</b>.</p></div>
      </div>
      <p>Final score = sum of question scores + timed bonus + special bonus. Tiebreakers are listed in the official rules.</p>
      <h2>Winning strategy</h2>
      <ol>
        <li><b>Nail the timed question.</b> The bonus is often worth more than any single question. Everyone works on it together, and you raise your hand as soon as it is done.</li>
        <li><b>Split the test.</b> After the timed question, divide the questions by specialty. For example, one student takes the monoalphabetics, one the math and table ciphers (Cryptarithm, Nihilist, Porta, Checkerboard) and one the Morse, Baconian and Columnar questions.</li>
        <li><b>Go for value per minute.</b> Several quick 150-point Caesar, Atbash and Baconian questions can beat one long 500-point question. You are not expected to finish the whole test.</li>
        <li><b>Use the free errors.</b> Do not burn two minutes on the last rare letter. Guess it, because there is no penalty for a wrong guess within the two free errors.</li>
        <li><b>Hunt the ★ bonuses.</b> Solving all three special bonus questions is worth 750 points, which is roughly a hard question and a half.</li>
        <li><b>Write clearly.</b> Put every letter in its answer box. An unreadable letter counts as an error.</li>
      </ol>
      <h2>Suggested learning order (Division B)</h2>
      <p>This order is adapted from the national Codebusters coaching guide. It starts with quick wins and builds toward the harder ciphers.</p>
      <ol class="order">
        <li><a href="#/learn/aristocrat">Aristocrat</a>, which is also the timed question</li><li><a href="#/learn/caesar">Caesar</a> and <a href="#/learn/atbash">Atbash</a></li>
        <li><a href="#/learn/porta">Porta</a></li><li><a href="#/learn/baconian">Letter/Symbol Baconian</a></li><li>Aristocrat K1 keywords</li>
        <li><a href="#/learn/patristocrat">Patristocrat</a></li><li><a href="#/learn/fracmorse">Fractionated Morse</a></li><li><a href="#/learn/nihilist">Nihilist Substitution</a></li>
        <li><a href="#/learn/checkerboard">Checkerboard</a></li><li>Word Baconian</li><li><a href="#/learn/homophonic">Homophonic</a></li>
        <li><a href="#/learn/columnar">Complete Columnar</a></li><li><a href="#/learn/cryptarithm">Cryptarithm</a></li><li><a href="#/learn/xenocrypt">Xenocrypt</a></li>
      </ol>` }));
  }

  /* ======================================================================
     LEARN
     ====================================================================== */
  function pageLearn() {
    page('Cipher Library', 'Thirteen lessons, one for each 2026–27 Division B cipher. Each includes an interactive playground and a step-by-step worked example.',
      h('div', { class: 'cgrid' }, ORDER.map(id => cipherCard(id, '#/learn/' + id, usageBadges(id)))));
  }
  function pageLesson(params, id) {
    const l = LESSONS[id];
    if (!l) { page('Unknown cipher', null, h('a', { href: '#/learn' }, 'Back to the library')); return; }
    const idx = ORDER.indexOf(id);
    const ex = l.example();
    const game = window.GAMES.list.find(g => g.lesson === id);
    const el = page(l.name, l.summary,
      usageBadges(id),
      h('nav', { class: 'toc' }, ['Background', 'How it works', 'Playground', 'Strategy', 'Worked example', 'Tips'].map((t, i) =>
        h('a', { href: 'javascript:void 0', onclick: () => document.getElementById('sec' + i).scrollIntoView({ behavior: 'smooth' }) }, t))),
      section(0, 'Background', h('div', { class: 'prose', html: l.history })),
      section(1, 'How it works', h('div', { class: 'prose', html: l.how })),
      section(2, 'Playground', playground(id)),
      section(3, 'Solving strategy', h('ol', { class: 'strategy' }, l.strategy.map(s => h('li', { html: s })))),
      section(4, 'Worked example', stepper(ex)),
      section(5, 'Tips & pitfalls', h('div', { class: 'two' },
        h('div', { class: 'tipbox' }, h('h3', null, 'Tips'), h('ul', null, l.tips.map(t => h('li', { html: t })))),
        h('div', { class: 'tipbox warn' }, h('h3', null, 'Pitfalls'), h('ul', null, l.pitfalls.map(t => h('li', { html: t })))))),
      h('div', { class: 'cta row gap wrap' },
        h('a', { class: 'btn primary', href: `#/practice/${id}` }, `Practice ${l.name} →`),
        game ? h('a', { class: 'btn', href: `#/games/${game.id}` }, `Drill: ${game.name}`) : null,
        idx > 0 ? h('a', { class: 'btn ghost', href: '#/learn/' + ORDER[idx - 1] }, '← ' + LESSONS[ORDER[idx - 1]].name) : null,
        idx < ORDER.length - 1 ? h('a', { class: 'btn ghost', href: '#/learn/' + ORDER[idx + 1] }, LESSONS[ORDER[idx + 1]].name + ' →') : null));
    // fill mini-tables referenced by lesson HTML
    el.querySelectorAll('.bacon-mini').forEach(x => x.replaceWith(WS.baconTable()));
    el.querySelectorAll('.porta-mini').forEach(x => x.replaceWith(window.GAMES.portaMini()));
    el.querySelectorAll('.fm-mini').forEach(x => x.replaceWith(fmTable(CB.ALPHA)));
    function section(i, t, body) { return h('section', { class: 'lsec', id: 'sec' + i }, h('h2', null, t), body); }
  }
  function stepper(ex) {
    let i = 0;
    const body = h('div', { class: 'step-body' });
    const label = h('span', { class: 'muted small' });
    const prev = h('button', { class: 'btn ghost', type: 'button', onclick: () => go(i - 1) }, '← Back');
    const next = h('button', { class: 'btn primary', type: 'button', onclick: () => go(i + 1) }, 'Next step →');
    const all = h('button', { class: 'btn ghost', type: 'button', onclick: () => { body.innerHTML = ''; ex.steps.forEach((s, k) => body.append(stepEl(s, k))); label.textContent = 'All steps'; } }, 'Show all');
    const dots = h('div', { class: 'dots' }, ex.steps.map((_, k) => h('button', { class: 'dot', type: 'button', onclick: () => go(k), 'aria-label': 'step ' + (k + 1) })));
    function stepEl(s, k) { return h('div', { class: 'step' }, h('h4', null, `Step ${k + 1}: ${s.t}`), h('div', { html: s.h })); }
    function go(k) {
      i = Math.max(0, Math.min(ex.steps.length - 1, k));
      body.innerHTML = ''; body.append(stepEl(ex.steps[i], i));
      label.textContent = `Step ${i + 1} of ${ex.steps.length}`;
      prev.disabled = i === 0; next.disabled = i === ex.steps.length - 1;
      dots.querySelectorAll('.dot').forEach((d, j) => d.classList.toggle('on', j <= i));
    }
    const box = h('div', { class: 'stepper' }, h('div', { class: 'ex-intro', html: ex.intro }), dots, body, h('div', { class: 'row gap wrap step-nav' }, prev, next, all, label));
    go(0);
    return box;
  }
  function fmTable(alpha) {
    const tri = CB.FM_TRIGRAMS.map(CB.prettyMorse);
    const t = h('table', { class: 'ex-table mono small fm-ref' });
    t.append(h('tr', null, h('th', null, ''), ...Array.from(alpha).map(c => h('th', null, c))));
    for (let k = 0; k < 3; k++) t.append(h('tr', null, h('th', null, String(k + 1)), ...tri.map(x => h('td', null, x[k]))));
    return h('div', { class: 'table-scroll' }, t);
  }

  /* ---------------- playgrounds ---------------- */
  function playground(id) {
    const box = h('div', { class: 'playground' });
    const out = h('div', { class: 'pg-out' });
    const ta = (v, ph) => h('textarea', { class: 'txt', rows: 2, placeholder: ph || 'Type a message…', spellcheck: 'false' }, v);
    const ti = (v, ph, extra) => h('input', Object.assign({ class: 'txt', value: v, placeholder: ph || '', spellcheck: 'false' }, extra || {}));
    const field = (label, el) => h('label', { class: 'field' }, h('span', null, label), el);
    let inputs = [], draw;
    const N = s => CB.normalize(s);
    const Lt = s => CB.lettersOnly(N(s));
    switch (id) {
      case 'atbash': {
        const t = ta('Meet me at the library');
        inputs = [t]; draw = () => { out.innerHTML = `<div class="mono big">${esc(CB.atbash(N(t.value)))}</div>`; };
        box.append(field('Plaintext', t)); break;
      }
      case 'caesar': {
        const t = ta('Veni vidi vici'), s = ti('3', '', { type: 'number', min: 1, max: 25 });
        const brute = h('input', { type: 'checkbox' });
        inputs = [t, s, brute];
        draw = () => {
          const k = +s.value || 0;
          let html = `<div class="mono big">${esc(CB.caesar(N(t.value), k))}</div>`;
          if (brute.checked) {
            html += '<p class="small muted">All 25 shifts backward of your text. Use this table when you need to crack an unknown shift:</p><div class="brute mono">' +
              Array.from({ length: 25 }, (_, i) => `<div><b>−${i + 1}</b> ${esc(CB.caesar(N(t.value), -(i + 1)))}</div>`).join('') + '</div>';
          }
          out.innerHTML = html;
        };
        box.append(field('Text', t), h('div', { class: 'row gap wrap' }, field('Shift', s), h('label', { class: 'small' }, brute, ' Show all 25 shifts (brute force)'))); break;
      }
      case 'aristocrat': case 'patristocrat': case 'xenocrypt': {
        const es = id === 'xenocrypt';
        const alpha = es ? CB.ES_ALPHA : CB.ALPHA;
        const t = ta(es ? 'La práctica hace al maestro.' : 'The important thing is not to stop questioning.');
        const kw = ti(es ? 'CIENCIA' : 'CURIOUS', 'K1 keyword (blank = random)');
        const off = ti('3', '', { type: 'number', min: 0, max: alpha.length - 1 });
        const btn = h('button', { class: 'btn sm', type: 'button' }, 'New random alphabet');
        let rmap = CB.randomMap(alpha);
        btn.addEventListener('click', () => { rmap = CB.randomMap(alpha); kw.value = ''; draw(); });
        inputs = [t, kw, off];
        draw = () => {
          const text = CB.normalize(t.value, es ? 'es' : 'en');
          let map = rmap, note = 'Random alphabet';
          if (kw.value.trim()) {
            const k = CB.k1Map(kw.value, alpha, +off.value || 0);
            if (k) { map = k.map; note = `K1 alphabet: keyword <b>${esc(CB.dedupe(CB.lettersOnly(N(kw.value), alpha)))}</b> at offset ${+off.value || 0}`; }
            else note = '<span class="bad">That offset makes a letter map to itself. Try another offset.</span>';
          }
          let ct = CB.substitute(text, map);
          if (id === 'patristocrat') ct = CB.groupBy(CB.lettersOnly(ct, alpha), 5);
          const inv = CB.invert(map);
          out.innerHTML = `<div class="mono big">${esc(ct)}</div><p class="small">${note}. The table lists each cipher letter with the plaintext it stands for. For K1 the keyword appears in the replacement row:</p>` +
            `<div class="table-scroll"><table class="ex-table mono small"><tr><th>Cipher</th>${Array.from(alpha).map(c => `<th>${c}</th>`).join('')}</tr><tr><th>Plain</th>${Array.from(alpha).map(c => `<td>${inv[c] || ''}</td>`).join('')}</tr></table></div>`;
        };
        box.append(field('Plaintext', t), h('div', { class: 'row gap wrap' }, field('K1 keyword', kw), field('Offset', off), btn)); break;
      }
      case 'baconian': {
        const t = ti('Hidden message');
        const style = h('select', { class: 'txt' }, ['A/B', 'Symbols ▲▽', 'Upper/lower case', 'Letters A–M = A, N–Z = B'].map((x, i) => h('option', { value: i }, x)));
        inputs = [t, style];
        draw = () => {
          const ab = CB.baconEncode(Lt(t.value));
          let disp;
          const st = +style.value;
          if (st === 0) disp = ab.match(/.{1,5}/g) ? ab.match(/.{1,5}/g).join(' ') : '';
          else if (st === 1) disp = ab.replace(/A/g, '▲').replace(/B/g, '▽');
          else if (st === 2) { const carrier = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG'; disp = Array.from(ab).map((x, i) => (x === 'A' ? carrier[i % carrier.length] : carrier[i % carrier.length].toLowerCase())).join(''); }
          else disp = Array.from(ab).map(x => (x === 'A' ? 'ABCDEFGHIJKLM' : 'NOPQRSTUVWXYZ')[CB.rand.int(0, 12)]).join('');
          out.innerHTML = `<div class="mono big wrapall">${esc(disp)}</div><p class="small muted">${ab.length} symbols = ${ab.length / 5} letters.</p>`;
        };
        box.append(h('div', { class: 'row gap wrap' }, field('Plaintext', t), field('Disguise', style))); break;
      }
      case 'porta': {
        const t = ta('Keep calm and decode on'), k = ti('SOLVE', 'keyword');
        inputs = [t, k];
        draw = () => {
          const L = Lt(t.value), key = CB.lettersOnly(N(k.value)) || 'A';
          const kr = Array.from(L).map((_, i) => key[i % key.length]).join('');
          out.innerHTML = `<div class="ex-stack mono"><div class="k">${kr}</div><div>${L}</div><div class="p">${CB.porta(L, key)}</div></div><p class="small muted">Key · plaintext · ciphertext. Put the ciphertext back in with the same key and you get the plaintext again.</p>`;
        };
        box.append(field('Plaintext', t), field('Keyword', k)); break;
      }
      case 'fracmorse': {
        const t = ta('Codes are fun'), k = ti('PLANET', 'keyword');
        inputs = [t, k];
        draw = () => {
          const r = CB.fmEncode(t.value || 'A', k.value || 'A');
          out.innerHTML = `<p class="small">Morse stream (padded to a multiple of 3):</p><div class="mono wrapall">${CB.prettyMorse(r.stream)}</div>` +
            `<p class="small">Keyed alphabet over the trigrams:</p>`;
          out.append(fmTable(r.alphabet));
          out.append(h('div', { class: 'mono big' }, CB.groupBy(r.cipher, 5)));
        };
        box.append(field('Plaintext', t), field('Keyword', k)); break;
      }
      case 'cryptarithm': {
        const t = ti('SEND + MORE = MONEY', 'WORD + WORD = WORD');
        inputs = [t];
        draw = () => {
          const m = N(t.value).replace(/\s/g, '').match(/^([A-Z]+)\+([A-Z]+)=([A-Z]+)$/);
          if (!m) { out.innerHTML = '<p class="muted">Enter an addition such as SEND + MORE = MONEY.</p>'; return; }
          const letters = new Set(m[1] + m[2] + m[3]);
          if (letters.size > 10) { out.innerHTML = '<p class="bad">More than 10 different letters, which can’t be solved in base 10.</p>'; return; }
          const r = CB.solveAddition([m[1], m[2]], m[3], 5);
          if (!r.count) { out.innerHTML = '<p class="bad">No solution.</p>'; return; }
          const val = w => Array.from(w).map(c => r.solution[c]).join('');
          out.innerHTML = `<p>${r.count === 1 ? '<span class="good">Exactly one solution. This makes a fair puzzle!</span>' : `<span class="bad">${r.count >= 5 ? '5 or more' : r.count} solutions, so the puzzle is ambiguous.</span>`}</p>` +
            `<pre class="mono big crypt">  ${val(m[1]).padStart(m[3].length)}\n+ ${val(m[2]).padStart(m[3].length)}\n  ${'-'.repeat(m[3].length)}\n  ${val(m[3])}</pre>` +
            `<p class="small">${Object.keys(r.solution).sort().map(c => `${c}=${r.solution[c]}`).join(' · ')}</p>`;
        };
        box.append(field('Puzzle', t)); break;
      }
      case 'columnar': {
        const t = ta('Knowledge is power and practice is the key'), k = ti('MAP', 'keyword (sets the column order)');
        inputs = [t, k];
        draw = () => {
          const L = Lt(t.value), kw = CB.lettersOnly(N(k.value)) || 'AB';
          if (!L) { out.innerHTML = ''; return; }
          const order = CB.keywordOrder(kw);
          const r = CB.columnarEncode(L, order);
          const n = order.length, rows = r.padded.length / n;
          let tbl = `<table class="ex-table mono small"><tr>${Array.from(kw).map(c => `<th>${c}</th>`).join('')}</tr><tr>${order.map(o => `<th>${o}</th>`).join('')}</tr>`;
          for (let i = 0; i < rows; i++) tbl += '<tr>' + Array.from(r.padded.slice(i * n, i * n + n)).map(c => `<td>${c}</td>`).join('') + '</tr>';
          out.innerHTML = `<div class="table-scroll">${tbl}</table></div><p class="small">Read the columns in order 1, 2, 3, …</p><div class="mono big">${CB.groupBy(r.cipher, 5)}</div>`;
        };
        box.append(field('Plaintext', t), field('Keyword', k)); break;
      }
      case 'nihilist': {
        const t = ti('Secret code'), pk = ti('SCIENCE', 'Polybius key'), k = ti('MAP', 'keyword');
        inputs = [t, pk, k];
        draw = () => {
          const L = Lt(t.value).replace(/J/g, 'I'), key = CB.lettersOnly(N(k.value)) || 'A';
          if (!L) { out.innerHTML = ''; return; }
          const r = CB.nihilistEncode(L, pk.value || 'A', key);
          out.innerHTML = squareHTML(r.square.grid, '12345', '12345') +
            `<div class="table-scroll"><table class="ex-table mono small"><tr><th>Plain</th>${Array.from(L).map(c => `<td>${c}</td>`).join('')}</tr>` +
            `<tr><th>Value</th>${r.plainValues.map(v => `<td>${v}</td>`).join('')}</tr><tr><th>+ Key</th>${r.plainValues.map((_, i) => `<td>${r.keyValues[i % r.keyValues.length]}</td>`).join('')}</tr>` +
            `<tr><th>Cipher</th>${r.numbers.map(v => `<td><b>${v}</b></td>`).join('')}</tr></table></div>`;
        };
        box.append(field('Plaintext', t), h('div', { class: 'row gap wrap' }, field('Polybius key', pk), field('Keyword', k))); break;
      }
      case 'checkerboard': {
        const t = ti('Meet at noon'), pk = ti('OLYMPIAD', 'Polybius key'), rk = ti('BRICK', '5-letter row word'), ck = ti('PLANT', '5-letter column word');
        inputs = [t, pk, rk, ck];
        draw = () => {
          const L = Lt(t.value).replace(/J/g, 'I');
          const R5 = (CB.lettersOnly(N(rk.value)) + '?????').slice(0, 5), C5 = (CB.lettersOnly(N(ck.value)) + '?????').slice(0, 5);
          const r = CB.checkerboardEncode(L, pk.value || 'A', R5, C5);
          out.innerHTML = squareHTML(r.square.grid, R5, C5) + `<div class="mono big">${r.pairs.join(' ')}</div>`;
        };
        box.append(field('Plaintext', t), h('div', { class: 'row gap wrap' }, field('Polybius key', pk), field('Row word', rk), field('Column word', ck))); break;
      }
      case 'homophonic': {
        const t = ta('Numbers never lie'), k = ti('MATH', 'four different letters');
        const again = h('button', { class: 'btn sm', type: 'button' }, 'Re-encode (new random choices)');
        inputs = [t, k]; again.addEventListener('click', () => draw());
        draw = () => {
          const key = (CB.lettersOnly(N(k.value)).replace(/J/g, 'I') + 'WORK');
          const kk = CB.dedupe(key).slice(0, 4);
          const tb = CB.homophonicTable(kk);
          const L = Lt(t.value).replace(/J/g, 'I');
          const r = CB.homophonicEncode(L, kk);
          let bands = '<div class="table-scroll"><table class="ex-table mono small">';
          for (let b = 0; b < 4; b++) {
            bands += `<tr><th rowspan="2">${kk[b]}</th>${Array.from({ length: 25 }, (_, i) => `<td>${CB.homNum(b * 25 + i + 1)}</td>`).join('')}</tr>`;
            bands += `<tr>${Array.from({ length: 25 }, (_, i) => `<td><b>${tb.byNumber[b * 25 + i + 1]}</b></td>`).join('')}</tr>`;
          }
          out.innerHTML = `<p class="small">Keyword used: <b>${kk}</b></p>` + bands + '</table></div>' + `<div class="mono big">${r.numbers.map(CB.homNum).join(' ')}</div>`;
        };
        box.append(field('Plaintext', t), h('div', { class: 'row gap wrap' }, field('Keyword', k), again)); break;
      }
    }
    inputs.forEach(i => i.addEventListener('input', () => draw()));
    inputs.forEach(i => i.addEventListener('change', () => draw()));
    box.append(out);
    draw && draw();
    return box;
  }
  function squareHTML(grid, rows, cols) {
    return `<table class="ex-table mono small sq"><tr><th></th>${Array.from(cols).map(c => `<th>${c}</th>`).join('')}</tr>` +
      grid.map((r, i) => `<tr><th>${rows[i]}</th>${r.map(c => `<td>${c === 'I' ? 'I/J' : c}</td>`).join('')}</tr>`).join('') + '</table>';
  }

  /* ======================================================================
     QUESTION CARD (practice + test)
     ====================================================================== */
  function questionCard(p, opts) {
    opts = opts || {};
    const t0 = Date.now();
    let solvedAt = null, revealed = false, hints = 0;
    const result = h('div', { class: 'qresult', 'aria-live': 'polite' });
    const ws = WS.create(p, { onChange: () => { if (!opts.test) { result.innerHTML = ''; } } });
    const clock = h('span', { class: 'qclock mono' }, '0:00');
    const modeLabel = (GEN.TYPES[p.type].modes.find(m => m[0] === p.mode) || [0, ''])[1];
    const head = h('div', { class: 'qhead' },
      h('div', { class: 'qtitle' },
        opts.num ? h('span', { class: 'qnum' }, opts.num === 1 && p.timed ? 'Timed Question' : `Question ${opts.num}`) : null,
        h('span', { class: 'qtype' }, GEN.TYPES[p.type].name), h('span', { class: 'qmode' }, modeLabel)),
      h('div', { class: 'qmeta' },
        opts.special ? h('span', { class: 'special', title: 'Special bonus question' }, '★ Special bonus') : null,
        p.timed ? h('span', { class: 'pts timed' }, 'Timed bonus') : h('span', { class: 'pts' }, `${p.points} points`),
        opts.test ? null : clock));
    const card = h('section', { class: 'qcard' + (opts.special ? ' is-special' : '') }, head,
      h('div', { class: 'qprompt', html: p.prompt }), ws.el);
    const actions = h('div', { class: 'qactions row gap wrap' });
    if (!opts.test) {
      actions.append(
        h('button', { class: 'btn primary', type: 'button', onclick: check }, 'Check answer'),
        h('button', { class: 'btn', type: 'button', onclick: () => { hints++; const m = ws.hint(); result.innerHTML = `<div class="info">${esc(m)} <span class="muted small">(hints used: ${hints})</span></div>`; } }, 'Hint'),
        h('button', { class: 'btn ghost', type: 'button', onclick: () => { if (!revealed && !confirm('Reveal the full solution? This problem will not count toward your progress.')) return; revealed = true; ws.reveal(); showSolution(); } }, 'Reveal solution'),
        h('button', { class: 'btn ghost', type: 'button', onclick: () => { ws.clear(); result.innerHTML = ''; ws.mark([]); } }, 'Clear'),
        opts.onNew ? h('button', { class: 'btn', type: 'button', onclick: opts.onNew }, 'New problem ↻') : null);
    } else if (opts.timedSubmit) {
      actions.append(h('button', { class: 'btn primary', type: 'button', onclick: () => opts.timedSubmit(ws, result) }, 'Submit timed answer ✋'));
    }
    card.append(actions, result);
    const tick = setInterval(() => { if (!solvedAt) clock.textContent = fmt((Date.now() - t0) / 1000); }, 500);

    function check() {
      const { errors, wrong } = ws.countErrors();
      ws.mark(wrong);
      const sec = (Date.now() - t0) / 1000;
      const score = CB.scoreQuestion(p.points, errors, p.freeErrors);
      const ok = errors <= p.freeErrors;
      if (ok && !solvedAt) {
        solvedAt = sec;
        if (!revealed) {
          record(p.type, true, sec);
          if (p.timed && (!progress.timed || sec < progress.timed)) { progress.timed = Math.round(sec); save(progress); }
        }
      } else if (!ok && !revealed) record(p.type, false, sec);
      const bonus = p.timed ? CB.timedBonus(sec) : 0;
      result.innerHTML = ok
        ? `<div class="okbox"><b>${errors === 0 ? 'Perfect!' : `Solved with ${errors} error${errors > 1 ? 's' : ''}.`}</b> ` +
          (p.timed ? `Time ${fmt(sec)} → timed bonus <b>${bonus}</b> points${sec > 600 ? ' (over 10 minutes, so no bonus)' : ''}.` : `Score: <b>${score}</b> / ${p.points}.`) +
          `${revealed ? ' <span class="muted">(solution was revealed)</span>' : ''} ${hints ? `<span class="muted small">Hints used: ${hints}.</span>` : ''}</div>`
        : `<div class="badbox"><b>${errors} error${errors > 1 ? 's' : ''}</b> (${p.freeErrors} free). The score would be <b>${score}</b> / ${p.points}. Wrong or empty spots are marked in red. Keep going!</div>`;
      if (ok) showSolution(true);
    }
    function showSolution(quiet) {
      const extra = h('div', { class: 'solution' },
        h('div', null, h('b', null, 'Plaintext: '), h('span', { class: 'mono' }, p.display || p.answer)),
        p.solutionNote ? h('div', { class: 'small', html: p.solutionNote }) : null);
      if (!quiet) result.innerHTML = '';
      result.append(extra);
    }
    return {
      el: card, ws, problem: p, stop() { clearInterval(tick); },
      evaluate() { const { errors } = ws.countErrors(); return { errors, score: CB.scoreQuestion(p.points, errors, p.freeErrors) }; }
    };
  }

  /* ======================================================================
     PRACTICE
     ====================================================================== */
  function pagePracticeIndex() {
    page('Practice Lab', 'Unlimited, randomly generated test-style problems. Pick a cipher, a tournament level and a mode.',
      h('div', { class: 'callout' }, 'Every problem comes with an interactive workspace: fill in letters and they propagate, frequency tables fill themselves, and the key tools (Porta table, Polybius square, Morse table, band table, column dragging) are built in. “Check answer” scores you with the real rules: 2 free errors, then −100 each.'),
      h('div', { class: 'cgrid' }, ORDER.map(id => {
        const s = progress.solved[id] || 0;
        return cipherCard(id, '#/practice/' + id, h('div', { class: 'row gap wrap small' },
          h('span', { class: 'badge' }, `${s} solved`), progress.best[id] ? h('span', { class: 'badge' }, `best ${fmt(progress.best[id])}`) : null));
      })));
  }
  function pagePractice(params, type) {
    if (!GEN.TYPES[type]) { page('Unknown cipher', null); return; }
    const T = GEN.TYPES[type];
    const level = params.get('level') || 'regional';
    const mode = params.get('mode') || T.modes[0][0];
    const timed = params.get('timed') === '1' && type === 'aristocrat';
    const setParams = (k, v) => { params.set(k, v); location.hash = `#/practice/${type}?${params}`; };
    const levelSel = h('div', { class: 'seg' },
      ['regional', 'state'].map(l => h('button', { class: l === level ? 'on' : '', type: 'button', onclick: () => setParams('level', l) }, l === 'regional' ? 'Regional / Invitational' : 'State / National')));
    const modeSel = T.modes.length > 1 ? h('div', { class: 'seg' },
      T.modes.map(m => h('button', { class: m[0] === mode ? 'on' : '', type: 'button', onclick: () => setParams('mode', m[0]) }, m[1]))) : null;
    const timedToggle = type === 'aristocrat' ? h('div', { class: 'seg' },
      h('button', { class: timed ? '' : 'on', type: 'button', onclick: () => setParams('timed', '0') }, 'Normal'),
      h('button', { class: timed ? 'on' : '', type: 'button', onclick: () => setParams('timed', '1') }, 'Timed question ⏱')) : null;
    const holder = h('div');
    const el = page(`Practice: ${T.name}`, timed ? 'Simulate the timed question. Your bonus is 2 × (600 − seconds) when you solve it with at most 2 errors.' : LESSONS[type].summary,
      h('div', { class: 'row gap wrap controls' }, levelSel, modeSel, timedToggle,
        h('a', { class: 'btn ghost sm', href: '#/learn/' + type }, 'Lesson')),
      holder);
    let card;
    function fresh() {
      if (card) card.stop();
      holder.innerHTML = '';
      const p = GEN.generate(type, { level, mode, timed });
      card = questionCard(p, { onNew: fresh });
      holder.append(card.el);
      const first = card.el.querySelector('input.pt:not([disabled]), input.kv, button.sym');
      if (first && window.innerWidth > 700) first.focus();
    }
    fresh();
    onLeave(() => card && card.stop());
    return el;
  }

  /* ======================================================================
     GAMES
     ====================================================================== */
  function pageGames() {
    page('Training Games', 'Sixty-second speed drills for the tables and patterns that win Codebusters. Beat your high score!',
      h('div', { class: 'ggrid' }, window.GAMES.list.map(g => h('a', { class: 'gcard', href: '#/games/' + g.id },
        h('h3', null, g.name), h('p', null, g.desc),
        h('div', { class: 'row gap small' }, h('span', { class: 'badge' }, LESSONS[g.lesson].name),
          progress.games[g.id] ? h('span', { class: 'badge hi' }, `best ${progress.games[g.id].score}`) : null)))),
      h('div', { class: 'callout' }, 'Want the real thing? The ', h('a', { href: '#/practice/aristocrat?timed=1' }, 'Timed Aristocrat challenge'), ' uses the same bonus formula as the timed question on the test.'));
  }
  function pageGame(params, id) {
    const g = window.GAMES.list.find(x => x.id === id);
    if (!g) { page('Unknown game', null); return; }
    const mount = h('div');
    const start = h('button', { class: 'btn primary big-btn', type: 'button' }, 'Start (60 s)');
    const res = h('div');
    page(g.name, g.desc, h('div', { class: 'row gap' }, start, h('a', { class: 'btn ghost', href: '#/games' }, 'All games')), res, mount);
    let runner = null;
    start.addEventListener('click', () => {
      res.innerHTML = '';
      runner && runner.stop();
      start.textContent = 'Restart';
      runner = window.GAMES.run(g, mount, r => {
        const prev = progress.games[id];
        const isBest = !prev || r.score > prev.score;
        if (isBest) progress.games[id] = { score: r.score, acc: r.acc };
        save(progress);
        res.innerHTML = `<div class="${isBest ? 'okbox' : 'info'}"><b>Time’s up!</b> ${r.score} correct out of ${r.total} (${r.acc}% accuracy), best streak ${r.best}. ${isBest ? '🏆 New high score!' : `High score: ${prev.score}`}</div>`;
        mount.innerHTML = '';
      });
    });
    onLeave(() => runner && runner.stop());
  }

  /* ======================================================================
     MOCK TEST
     ====================================================================== */
  let currentTest = null;
  function pageTestSetup() {
    const lv = h('div', { class: 'seg' });
    let level = 'regional', length = 'full';
    ['regional', 'state'].forEach(l => lv.append(h('button', { class: l === level ? 'on' : '', type: 'button', onclick: e => { level = l; lv.querySelectorAll('button').forEach(b => b.classList.remove('on')); e.target.classList.add('on'); } }, l === 'regional' ? 'Regional / Invitational' : 'State / National')));
    const ln = h('div', { class: 'seg' });
    [['full', 'Full test · 50 min'], ['half', 'Half test · 25 min'], ['mini', 'Mini · 15 min']].forEach(([k, t]) => ln.append(h('button', { class: k === length ? 'on' : '', type: 'button', onclick: e => { length = k; ln.querySelectorAll('button').forEach(b => b.classList.remove('on')); e.target.classList.add('on'); } }, t)));
    const past = (progress.tests || []).slice(-5).reverse();
    page('Mock Test', 'A realistic Division B test: a timed Aristocrat first, a mix of every cipher type, three ★ special bonus questions, and official-style scoring.',
      currentTest && !currentTest.finished ? h('div', { class: 'callout' }, 'You have a test in progress. ', h('a', { href: '#/test/run' }, 'Resume it →')) : null,
      h('div', { class: 'setup' },
        h('h3', null, 'Tournament level'), lv,
        h('h3', null, 'Length'), ln,
        h('p', { class: 'small muted' }, 'Work like it is the real event: use scratch paper, split the questions with your teammates, and submit the timed question as soon as it is done. Answers are only graded when you finish.'),
        h('button', { class: 'btn primary big-btn', type: 'button', onclick: () => { buildTest(level, length); location.hash = '#/test/run'; } }, 'Start the test')),
      past.length ? h('div', null, h('h2', null, 'Recent results'), h('div', { class: 'table-scroll' }, h('table', { class: 'data' },
        h('tr', null, h('th', null, 'Date'), h('th', null, 'Level'), h('th', null, 'Length'), h('th', null, 'Score'), h('th', null, 'Timed bonus'), h('th', null, 'Special')),
        past.map(t => h('tr', null, h('td', null, new Date(t.date).toLocaleString()), h('td', null, t.level), h('td', null, t.length), h('td', null, h('b', null, String(t.total))), h('td', null, String(t.timedBonus)), h('td', null, String(t.special))))))) : null);
  }
  function buildTest(level, length) {
    const st = level === 'state';
    const R = CB.rand;
    let spec = [
      ['aristocrat', {}], ['aristocrat', { alphabet: 'k1' }], ['aristocrat', { hint: 'no' }],
      ['patristocrat', {}], ['caesar', {}], ['atbash', {}],
      ['baconian', { variant: R.pick(['letters', 'symbols']) }], ['baconian', { variant: 'words' }],
      ['porta', { mode: st ? 'crypt' : 'decode' }], ['fracmorse', {}], ['cryptarithm', {}], ['columnar', {}],
      ['nihilist', { mode: st ? 'crypt' : 'decode' }], ['checkerboard', { mode: 'decode' }], ['homophonic', { mode: 'crypt' }]
    ];
    if (st) spec.push(['xenocrypt', {}], ['xenocrypt', {}], ['patristocrat', {}], ['checkerboard', { mode: 'crypt' }], ['homophonic', { mode: 'decode' }]);
    else if (R.chance(0.7)) spec.push(['xenocrypt', {}]);
    const minutes = { full: 50, half: 25, mini: 15 }[length];
    if (length === 'half') spec = R.shuffle(spec).slice(0, 8);
    if (length === 'mini') spec = R.shuffle(spec).slice(0, 4);
    spec = R.shuffle(spec);
    const problems = [GEN.generate('aristocrat', { level, timed: true, hint: 'no' })]
      .concat(spec.map(([t, o]) => GEN.generate(t, Object.assign({ level }, o))));
    const specialIdx = new Set(R.shuffle(problems.slice(1).map((_, i) => i + 1)).slice(0, Math.min(3, problems.length - 1)));
    currentTest = {
      level, length, minutes, start: Date.now(), finished: false, timedAt: null, timedAttempts: 0,
      items: problems.map((p, i) => ({ p, special: specialIdx.has(i), card: null }))
    };
  }
  function pageTestRun() {
    const T = currentTest;
    if (!T) { location.hash = '#/test'; return; }
    const endAt = T.start + T.minutes * 60000;
    const clock = h('span', { class: 'tclock mono' });
    const timedClock = h('span', { class: 'mono' });
    const nav = h('div', { class: 'tnav' });
    const main = h('div', { class: 'tmain' });
    const finishBtn = h('button', { class: 'btn primary', type: 'button', onclick: () => { if (T.finished || confirm('Finish the test and grade it?')) finish(); } }, T.finished ? 'View results' : 'Finish & grade');
    const bar = h('div', { class: 'tbar' },
      h('div', null, h('b', null, `${T.level === 'state' ? 'State/National' : 'Regional'} mock test`), ' · ', h('span', { class: 'muted' }, `${T.items.length} questions`)),
      h('div', { class: 'row gap' }, h('span', { class: 'muted small' }, 'Timed Q:'), timedClock, h('span', { class: 'muted small' }, 'Remaining:'), clock, finishBtn));
    const el = h('div', { class: 'page test' }, bar, h('div', { class: 'tlayout' }, nav, main));
    app.append(el);
    let cur = 0;
    T.items.forEach((it, i) => {
      if (!it.card) {
        it.card = questionCard(it.p, {
          num: i + 1, test: true, special: it.special,
          timedSubmit: i === 0 ? (ws, result) => {
            if (T.timedAt != null) { result.innerHTML = `<div class="okbox">Already solved at ${fmt(T.timedAt)}.</div>`; return; }
            const sec = (Date.now() - T.start) / 1000;
            const { errors } = ws.countErrors();
            T.timedAttempts++;
            if (errors <= 2) {
              T.timedAt = sec;
              result.innerHTML = `<div class="okbox"><b>Correct!</b> Solved at ${fmt(sec)}. Timed bonus: <b>${CB.timedBonus(sec)}</b>${sec > 600 ? ' (after 10 minutes, so the bonus is 0)' : ''}.</div>`;
            } else result.innerHTML = `<div class="badbox">Not quite: more than 2 errors. Keep working and resubmit.</div>`;
            drawNav();
          } : null
        });
      }
    });
    function drawNav() {
      nav.innerHTML = '';
      T.items.forEach((it, i) => {
        const filled = it.card.ws.getAnswer().filter(Boolean).length;
        const pct = Math.round(filled / it.p.answer.length * 100);
        nav.append(h('button', { class: 'tq' + (i === cur ? ' on' : '') + (it.special ? ' sp' : ''), type: 'button', onclick: () => show(i) },
          h('span', { class: 'n' }, i === 0 ? '⏱' : String(i + 1)),
          h('span', { class: 't' }, GEN.TYPES[it.p.type].name + (it.special ? ' ★' : '')),
          h('span', { class: 'p' }, i === 0 ? (T.timedAt != null ? '✔' : '') : String(it.p.points)),
          h('span', { class: 'bar' }, h('i', { style: { width: pct + '%' } }))));
      });
    }
    function show(i) {
      cur = i;
      main.innerHTML = '';
      main.append(T.items[i].card.el,
        h('div', { class: 'row gap tnext' },
          i > 0 ? h('button', { class: 'btn ghost', type: 'button', onclick: () => show(i - 1) }, '← Previous') : null,
          i < T.items.length - 1 ? h('button', { class: 'btn', type: 'button', onclick: () => show(i + 1) }, 'Next →') : null));
      drawNav();
      window.scrollTo(0, 0);
    }
    function tick() {
      const left = (endAt - Date.now()) / 1000;
      clock.textContent = T.finished ? 'done' : fmt(left);
      clock.classList.toggle('low', left < 300);
      timedClock.textContent = T.timedAt != null ? `✔ ${fmt(T.timedAt)}` : fmt((Date.now() - T.start) / 1000);
      if (left <= 0 && !T.finished) { finish(); alert('Time is up! Your test has been graded.'); }
    }
    const iv = setInterval(tick, 500);
    const navIv = setInterval(() => { if (!T.finished) drawNav(); }, 3000);
    onLeave(() => { clearInterval(iv); clearInterval(navIv); });
    tick();
    if (T.finished) showResults(); else show(0);

    function finish() {
      if (!T.finished) {
        T.finished = true;
        T.results = T.items.map((it, i) => {
          if (i === 0) {
            const { errors } = it.card.ws.countErrors();
            return { errors, score: 0 };
          }
          return it.card.evaluate();
        });
        T.timedBonus = T.timedAt != null ? CB.timedBonus(T.timedAt) : 0;
        T.specialSolved = T.items.filter((it, i) => it.special && T.results[i].errors <= it.p.freeErrors).length;
        T.specialBonus = CB.specialBonus(T.specialSolved);
        T.total = T.results.reduce((a, r) => a + r.score, 0) + T.timedBonus + T.specialBonus;
        progress.tests = (progress.tests || []).concat([{ date: Date.now(), level: T.level, length: T.length, total: T.total, timedBonus: T.timedBonus, special: T.specialBonus }]).slice(-30);
        T.items.forEach((it, i) => { if (i > 0) record(it.p.type, T.results[i].errors <= it.p.freeErrors, null); });
        save(progress);
      }
      finishBtn.textContent = 'View results';
      showResults();
    }
    function showResults() {
      main.innerHTML = '';
      cur = -1; drawNav();
      const possible = T.items.slice(1).reduce((a, it) => a + it.p.points, 0);
      main.append(h('section', { class: 'results' },
        h('h2', null, 'Results'),
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('b', null, String(T.total)), h('span', null, 'total score')),
          h('div', { class: 'stat' }, h('b', null, String(T.timedBonus)), h('span', null, T.timedAt != null ? `timed bonus (${fmt(T.timedAt)})` : 'timed bonus (not solved)')),
          h('div', { class: 'stat' }, h('b', null, String(T.specialBonus)), h('span', null, `special bonus (${T.specialSolved}/3 ★)`)),
          h('div', { class: 'stat' }, h('b', null, `${T.total - T.timedBonus - T.specialBonus}/${possible}`), h('span', null, 'question points'))),
        h('div', { class: 'table-scroll' }, h('table', { class: 'data' },
          h('tr', null, h('th', null, '#'), h('th', null, 'Cipher'), h('th', null, 'Points'), h('th', null, 'Errors'), h('th', null, 'Score'), h('th', null, '')),
          T.items.map((it, i) => h('tr', null,
            h('td', null, i === 0 ? '⏱' : String(i + 1)),
            h('td', null, GEN.TYPES[it.p.type].name + (it.special ? ' ★' : '')),
            h('td', null, i === 0 ? 'bonus' : String(it.p.points)),
            h('td', { class: T.results[i].errors <= it.p.freeErrors ? 'good' : 'bad' }, String(T.results[i].errors)),
            h('td', null, h('b', null, i === 0 ? String(T.timedBonus) : String(T.results[i].score))),
            h('td', null, h('button', { class: 'btn sm ghost', type: 'button', onclick: () => review(i) }, 'Review')))))),
        h('div', { class: 'row gap' }, h('a', { class: 'btn primary', href: '#/test', onclick: () => { currentTest = null; } }, 'New test'))));
    }
    function review(i) {
      const it = T.items[i];
      show(i);
      it.card.ws.mark(it.card.ws.countErrors().wrong);
      main.append(h('div', { class: 'solution' }, h('b', null, 'Answer: '), h('span', { class: 'mono' }, it.p.display || it.p.answer),
        it.p.solutionNote ? h('div', { class: 'small', html: it.p.solutionNote }) : null,
        h('button', { class: 'btn sm', type: 'button', onclick: () => showResults() }, '← Back to results')));
    }
  }

  /* ======================================================================
     REFERENCE SHEET
     ====================================================================== */
  function pageReference() {
    const freqBars = (F, alpha) => {
      const max = Math.max(...Object.values(F));
      return h('div', { class: 'fbars' }, Array.from(alpha).map(c => h('div', { class: 'fb', title: `${c}: ${F[c] || 0}%` },
        h('i', { style: { height: ((F[c] || 0) / max * 100) + '%' } }), h('span', null, c))));
    };
    const common = Object.keys(D.COMMON_EN).map(n => `<tr><th>${n}-letter</th><td class="mono">${D.COMMON_EN[n].join(' ')}</td></tr>`).join('');
    const spanish = D.SPANISH_WORDS.map(([e, m]) => `<span class="sw"><b>${e}</b> ${esc(m)}</span>`).join('');
    page('Reference Sheet', 'The tables you should know by heart. Printable.',
      h('div', { class: 'row gap' }, h('button', { class: 'btn', type: 'button', onclick: () => window.print() }, 'Print this page')),
      h('div', { class: 'refgrid' },
        refBox('English letter frequency (%)', h('div', null, freqBars(D.FREQ_EN, CB.ALPHA), h('p', { class: 'small mono' }, 'By rank: E T A O I N S H R D L C U M W F G Y P B V K J X Q Z'))),
        refBox('Spanish letter frequency (%)', h('div', null, freqBars(D.FREQ_ES, CB.ES_ALPHA), h('p', { class: 'small mono' }, 'By rank: E A O S R N I D L C T U M P B G V Y Q H F Z J Ñ X K W'))),
        refBox('Morse code', WS.morseChart()),
        refBox('Baconian (24-letter)', WS.baconTable()),
        refBox('Porta table (ACA)', window.GAMES.portaMini()),
        refBox('Fractionated Morse trigram order', h('div', null, fmTable('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), h('p', { class: 'small' }, 'The keyword alphabet goes over this fixed order. ××× is never used.'))),
        refBox('Polybius square (I/J share a cell)', h('div', { html: squareHTML(CB.polybius('').grid, '12345', '12345') + '<p class="small">Nihilist: value = row·10 + column, cipher = plaintext value + key value (22–110). Checkerboard: row word letter + column word letter.</p>' })),
        refBox('Homophonic bands', h('div', { class: 'small', html: '<p>Keyword letters k1 k2 k3 k4 start the bands <b>1–25</b>, <b>26–50</b>, <b>51–75</b> and <b>76–00</b>. Inside a band the numbers run through the 25-letter alphabet (I/J together) starting at that keyword letter and wrapping from Z to A.</p>' })),
        refBox('Atbash & Caesar', h('div', { class: 'alpha-pair mono' }, h('div', null, 'A B C D E F G H I J K L M'), h('div', null, 'Z Y X W V U T S R Q P O N'))),
        refBox('Common English words', h('div', { class: 'table-scroll', html: `<table class="ex-table small">${common}</table>` })),
        refBox('Pattern words', h('p', { class: 'mono small' }, D.PATTERN_WORDS.join(' '))),
        refBox('Common Spanish words', h('div', { class: 'swords small', html: spanish }))));
    function refBox(t, body) { return h('section', { class: 'refbox' }, h('h3', null, t), body); }
  }

  /* ======================================================================
     PROGRESS
     ====================================================================== */
  function pageProgress() {
    page('My Progress', 'Saved only in this browser.',
      h('div', { class: 'table-scroll' }, h('table', { class: 'data' },
        h('tr', null, h('th', null, 'Cipher'), h('th', null, 'Solved'), h('th', null, 'Attempts'), h('th', null, 'Best time'), h('th', null, 'Mastery')),
        ORDER.map(id => {
          const s = progress.solved[id] || 0, a = progress.attempts[id] || 0;
          const m = Math.min(100, s * 20);
          return h('tr', null, h('td', null, h('a', { href: '#/practice/' + id }, LESSONS[id].name)), h('td', null, String(s)), h('td', null, String(a)),
            h('td', null, progress.best[id] ? fmt(progress.best[id]) : '—'),
            h('td', null, h('div', { class: 'meter', title: `${m}%` }, h('i', { style: { width: m + '%' } }))));
        }))),
      h('p', { class: 'small muted' }, 'Mastery fills after 5 problems of a cipher are solved without revealing the answer.'),
      h('h2', null, 'Game high scores'),
      h('div', { class: 'table-scroll' }, h('table', { class: 'data' }, h('tr', null, h('th', null, 'Game'), h('th', null, 'Best'), h('th', null, 'Accuracy')),
        window.GAMES.list.map(g => h('tr', null, h('td', null, h('a', { href: '#/games/' + g.id }, g.name)), h('td', null, progress.games[g.id] ? String(progress.games[g.id].score) : '—'), h('td', null, progress.games[g.id] ? progress.games[g.id].acc + '%' : '—'))))),
      h('div', { class: 'row gap' }, h('button', {
        class: 'btn ghost', type: 'button', onclick: () => {
          if (!confirm('Erase all saved progress in this browser?')) return;
          ['solved', 'attempts', 'best', 'games'].forEach(k => (progress[k] = {})); progress.tests = []; progress.timed = null; save(progress); route();
        }
      }, 'Reset progress')));
  }

  /* ======================================================================
     COACH'S CORNER
     ====================================================================== */
  function pageCoach() {
    page('Coach’s Corner', 'A season plan, meeting format and resources for coaches and self-driven teams.',
      h('div', { class: 'prose', html: `
      <h2>Meeting format that works</h2>
      <ol>
        <li><b>Minutes 0–10: timed Aristocrat.</b> Start the clock right at the start of the meeting and treat it like the real timed question. If you have two teams, race them.</li>
        <li><b>Minutes 10–25: one new cipher.</b> Walk through its lesson and worked example together on this site, then everyone encodes a message for a partner in the playground.</li>
        <li><b>Minutes 25–50: practice set.</b> Each student works on generated problems for their specialty. Compare times and scores.</li>
        <li><b>Minutes 50–60: speed drills.</b> One or two 60-second games (Morse, Baconian, Porta, pattern words). Post the high scores.</li>
        <li><b>Homework:</b> 2–3 extra problems to bring back next week.</li>
      </ol>
      <h2>An 8-week plan to your first tournament</h2>
      <div class="table-scroll"><table class="data">
        <tr><th>Week</th><th>New ciphers</th><th>Drills</th><th>Goal</th></tr>
        <tr><td>1</td><td>Aristocrat, Caesar, Atbash</td><td>Atbash Reflex, Pattern Detective</td><td>Solve an Aristocrat in under 15 minutes</td></tr>
        <tr><td>2</td><td>Aristocrat K1, Porta (decode)</td><td>Porta Pairs, Frequency Sense</td><td>Read a K1 keyword from the replacement row</td></tr>
        <tr><td>3</td><td>Baconian (letter, symbol, word)</td><td>Baconian Reader / Writer</td><td>Memorize the Baconian table</td></tr>
        <tr><td>4</td><td>Patristocrat, Fractionated Morse</td><td>Morse Reader / Writer</td><td>Know Morse by heart</td></tr>
        <tr><td>5</td><td>Nihilist, Checkerboard</td><td>Polybius Coordinates, Anagram Blitz</td><td>Build a Polybius square in 1 minute</td></tr>
        <tr><td>6</td><td>Homophonic, Complete Columnar</td><td>Morse Stream</td><td>Solve a crib-based Homophonic</td></tr>
        <tr><td>7</td><td>Cryptarithm, Xenocrypt</td><td>Spanish Word Match</td><td>Solve a Cryptarithm with zero errors</td></tr>
        <tr><td>8</td><td>Review & specialization</td><td>All</td><td>Two full mock tests as a team, then split roles</td></tr>
      </table></div>
      <h2>Assigning roles</h2>
      <ul>
        <li><b>Word person:</b> Aristocrats, Patristocrats, Xenocrypt (ideally someone who knows some Spanish), Caesar/Atbash.</li>
        <li><b>Table person:</b> Porta, Nihilist, Checkerboard, Homophonic, Baconian.</li>
        <li><b>Logic person:</b> Cryptarithm, Complete Columnar, Fractionated Morse.</li>
      </ul>
      <p>Everyone solves the timed Aristocrat together, then the team splits the rest of the test.</p>
      <h2>Official & community resources</h2>
      <ul>
        <li><a href="https://www.soinc.org/codebusters-b" target="_blank" rel="noopener">Science Olympiad Codebusters B event page</a> — rules, overview guide, sample tests and national test packets.</li>
        <li><a href="https://www.soinc.org/rules-2027" target="_blank" rel="noopener">2027 Rules</a> — the official rules manual (always the final word).</li>
        <li><a href="https://toebes.com/codebusters/Rule-Summary-2027.html" target="_blank" rel="noopener">2026–27 cipher summary</a> and the <a href="https://toebes.com/codebusters/TestBuild.html" target="_blank" rel="noopener">Codebusters test builder</a> by John Toebes.</li>
        <li><a href="https://toebes.com/codebusters/samples.html" target="_blank" rel="noopener">Codebusters exam archive</a> — real invitational and past tournament tests.</li>
        <li><a href="https://www.youtube.com/@Codebusters-sciol" target="_blank" rel="noopener">Codebusters YouTube channel</a> — tool tutorials and cipher walkthroughs.</li>
        <li><a href="https://www.cryptogram.org/" target="_blank" rel="noopener">American Cryptogram Association</a> — the source of the cipher definitions.</li>
        <li><a href="https://cryptograms.puzzlebaron.com/tutorial.php" target="_blank" rel="noopener">Puzzle Baron cryptogram tutorial</a> — an excellent Aristocrat guide with thousands of puzzles.</li>
        <li><a href="http://www.cryptoclub.org/" target="_blank" rel="noopener">CryptoClub</a> — friendly cipher activities for middle school.</li>
      </ul>
      <p class="small muted">This training center is an independent study tool and is not affiliated with or endorsed by Science Olympiad, Inc. Cipher conventions follow the Codebusters guide by John Toebes and the ACA.</p>` }));
  }

  route();
})();
