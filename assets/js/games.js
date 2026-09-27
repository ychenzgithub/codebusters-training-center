/* ==========================================================================
   Codebusters Training Center — speed drills ("games")
   Each game is a generator of questions; a shared 60-second engine runs it.
   ========================================================================== */
(function (root) {
  'use strict';
  const CB = root.CB, D = root.CBDATA, R = CB.rand;
  const { h } = root.WS;

  const GAMES = [
    {
      id: 'morse-read', name: 'Morse Reader', lesson: 'fracmorse', kind: 'type', autoLen: 1,
      desc: 'Read a Morse code and type the letter. This is essential for Fractionated Morse.',
      gen() { const L = R.pick(Object.keys(CB.MORSE).filter(k => /[A-Z]/.test(k))); return { q: `<span class="big mono">${CB.prettyMorse(CB.MORSE[L])}</span>`, a: L }; }
    },
    {
      id: 'morse-write', name: 'Morse Writer', lesson: 'fracmorse', kind: 'morse',
      desc: 'See a letter and tap out its Morse code with ● and – (keyboard: . and -, Enter to submit).',
      gen() { const L = R.pick(Object.keys(CB.MORSE).filter(k => /[A-Z]/.test(k))); return { q: `<span class="big">${L}</span>`, a: CB.MORSE[L], show: CB.prettyMorse(CB.MORSE[L]) }; }
    },
    {
      id: 'morse-stream', name: 'Morse Stream', lesson: 'fracmorse', kind: 'type',
      desc: 'Decode a short word from a Morse stream with × between letters.',
      gen() {
        const w = R.pick(D.COMMON_EN[3].concat(D.COMMON_EN[4]));
        return { q: `<span class="mono big">${CB.prettyMorse(CB.toMorseStream(w))}</span>`, a: w };
      }
    },
    {
      id: 'atbash', name: 'Atbash Reflex', lesson: 'atbash', kind: 'type', autoLen: 1,
      desc: 'Type the Atbash partner of each letter (A↔Z, B↔Y, …).',
      gen() { const L = R.pick(Array.from(CB.ALPHA)); return { q: `<span class="big">${L}</span> ↔ ?`, a: CB.atbash(L) }; }
    },
    {
      id: 'caesar', name: 'Caesar Shift', lesson: 'caesar', kind: 'type', autoLen: 1,
      desc: 'Shift a letter forward or backward by the given amount.',
      gen() {
        const L = R.pick(Array.from(CB.ALPHA)), k = R.int(1, 12), dir = R.chance(0.5) ? 1 : -1;
        return { q: `<span class="big">${L}</span> ${dir > 0 ? '+' : '−'} ${k}`, a: CB.caesar(L, dir * k) };
      }
    },
    {
      id: 'bacon-read', name: 'Baconian Reader', lesson: 'baconian', kind: 'type', autoLen: 1,
      desc: 'Read a 5-letter A/B code and type the letter (24-letter table: I=J, U=V).',
      gen() {
        const L = R.pick(Array.from(CB.BACON_LETTERS));
        return { q: `<span class="big mono">${CB.baconCode(L)}</span>`, a: L, accept: v => v === L || (L === 'I' && v === 'J') || (L === 'U' && v === 'V'), show: CB.baconDisplay(L) };
      }
    },
    {
      id: 'bacon-write', name: 'Baconian Writer', lesson: 'baconian', kind: 'type', autoLen: 5,
      desc: 'Type the 5-symbol A/B code for each letter.',
      gen() { const L = R.pick(Array.from(CB.BACON_LETTERS)); return { q: `<span class="big">${CB.baconDisplay(L)}</span>`, a: CB.baconCode(L) }; }
    },
    {
      id: 'porta', name: 'Porta Pairs', lesson: 'porta', kind: 'type', autoLen: 1,
      desc: 'Use the Porta table: given a key letter and a cipher letter, type the plaintext letter.',
      table: true,
      gen() {
        const k = R.pick(Array.from(CB.ALPHA)), c = R.pick(Array.from(CB.ALPHA));
        return { q: `key <b class="big">${k}</b> · cipher <b class="big">${c}</b>`, a: CB.portaChar(k, c) };
      }
    },
    {
      id: 'polybius', name: 'Polybius Coordinates', lesson: 'nihilist', kind: 'type', autoLen: 2,
      desc: 'Find the letter in a keyword square and type its row and column (e.g. 23).',
      setup() { this.sq = CB.polybius(R.pick(D.KEYWORDS)); },
      gen() {
        const sq = this.sq;
        const L = R.pick(Array.from(CB.ALPHA25));
        const grid = '<table class="mini-sq mono"><tr><th></th>' + [1, 2, 3, 4, 5].map(i => `<th>${i}</th>`).join('') + '</tr>' +
          sq.grid.map((r, i) => `<tr><th>${i + 1}</th>${r.map(c => `<td>${c === 'I' ? 'I/J' : c}</td>`).join('')}</tr>`).join('') + '</table>';
        return { q: `<span class="big">${L === 'I' ? 'I/J' : L}</span>${grid}`, a: String(CB.polyValue(sq, L)) };
      }
    },
    {
      id: 'pattern', name: 'Pattern Detective', lesson: 'aristocrat', kind: 'choice',
      desc: 'Which word could this Aristocrat cipher word be? Match the letter pattern.',
      gen() {
        const pool = D.PATTERN_WORDS.concat(D.COMMON_EN[3], D.COMMON_EN[4]);
        const w = R.pick(pool);
        const pat = x => Array.from(x).map(c => x.indexOf(c)).join(',');
        const m = CB.randomMap();
        const cw = Array.from(w).map(c => m[c]).join('');
        const all = pool.concat(D.WORDS5);
        const wrong = R.shuffle(all.filter(x => x.length === w.length && pat(x) !== pat(w))).slice(0, 3);
        while (wrong.length < 3) wrong.push(R.pick(all.filter(x => pat(x) !== pat(w))));
        return { q: `<span class="big mono">${cw}</span>`, a: w, choices: R.shuffle([w].concat(wrong)) };
      }
    },
    {
      id: 'anagram', name: 'Anagram Blitz', lesson: 'checkerboard', kind: 'type',
      desc: 'Unscramble the 5 letters into a word, the way you find Checkerboard row and column keys.',
      gen() {
        const w = R.pick(D.ISO5);
        let s; do { s = R.shuffle(Array.from(w)).join(''); } while (s === w);
        const key = x => Array.from(x).sort().join('');
        const ok = new Set(D.ISO5.concat(D.WORDS5).filter(x => key(x) === key(w)));
        return { q: `<span class="big mono">${s.split('').join(' ')}</span>`, a: w, accept: v => ok.has(v) };
      }
    },
    {
      id: 'spanish', name: 'Spanish Word Match', lesson: 'xenocrypt', kind: 'choice',
      desc: 'Match common Spanish words to their meanings. Recognizing them quickly makes Xenocrypts much easier.',
      gen() {
        const [es, en] = R.pick(D.SPANISH_WORDS);
        const wrong = R.shuffle(D.SPANISH_WORDS.filter(x => x[1] !== en)).slice(0, 3).map(x => x[1]);
        return { q: `<span class="big">${es}</span>`, a: en, choices: R.shuffle([en].concat(wrong)) };
      }
    },
    {
      id: 'frequency', name: 'Frequency Sense', lesson: 'aristocrat', kind: 'choice',
      desc: 'Which letter is more common in English? Build your instinct for frequency analysis.',
      gen() {
        const letters = Object.keys(D.FREQ_EN);
        let a, b;
        do { a = R.pick(letters); b = R.pick(letters); } while (a === b || Math.abs(D.FREQ_EN[a] - D.FREQ_EN[b]) < 0.6);
        const win = D.FREQ_EN[a] > D.FREQ_EN[b] ? a : b;
        return { q: 'More common in English?', a: win, choices: [a, b] };
      }
    }
  ];

  /* ---------------- engine ---------------- */
  function run(game, mount, onFinish) {
    const DURATION = 60;
    let score = 0, total = 0, streak = 0, best = 0, cur = null, t0 = 0, timer = null, done = false;
    if (game.setup) game.setup();
    mount.innerHTML = '';
    const clock = h('div', { class: 'g-clock' }, String(DURATION));
    const sc = h('div', { class: 'g-score' }, '0');
    const qEl = h('div', { class: 'g-q' });
    const fb = h('div', { class: 'g-fb' });
    const inputArea = h('div', { class: 'g-input' });
    const box = h('div', { class: 'game-box' },
      h('div', { class: 'g-top' }, h('div', null, h('span', { class: 'muted small' }, 'Time'), clock), h('div', null, h('span', { class: 'muted small' }, 'Score'), sc)),
      qEl, inputArea, fb);
    mount.append(box);
    if (game.table) mount.append(h('details', { class: 'tool', open: true }, h('summary', null, 'Porta table'), portaMini()));

    let inp = null, morseBuf = '';
    const morseShow = h('div', { class: 'big mono morse-buf' }, '');
    if (game.kind === 'type') {
      inp = h('input', { class: 'txt g-text', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false' });
      inp.addEventListener('input', () => {
        inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9Ñ]/g, '');
        if (game.autoLen && inp.value.length >= game.autoLen) submit(inp.value);
      });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(inp.value); });
      inputArea.append(inp, h('button', { class: 'btn', type: 'button', onclick: () => submit(inp.value) }, 'Enter'));
    } else if (game.kind === 'morse') {
      const add = s => { morseBuf += s; morseShow.textContent = CB.prettyMorse(morseBuf); };
      inputArea.append(morseShow, h('div', { class: 'row gap' },
        h('button', { class: 'btn big-btn', type: 'button', onclick: () => add('.') }, '●'),
        h('button', { class: 'btn big-btn', type: 'button', onclick: () => add('-') }, '–'),
        h('button', { class: 'btn ghost', type: 'button', onclick: () => { morseBuf = morseBuf.slice(0, -1); morseShow.textContent = CB.prettyMorse(morseBuf); } }, '⌫'),
        h('button', { class: 'btn', type: 'button', onclick: () => submit(morseBuf) }, 'Enter')));
      box.tabIndex = 0;
      box.addEventListener('keydown', e => {
        if (e.key === '.') add('.'); else if (e.key === '-') add('-');
        else if (e.key === 'Backspace') { morseBuf = morseBuf.slice(0, -1); morseShow.textContent = CB.prettyMorse(morseBuf); }
        else if (e.key === 'Enter') submit(morseBuf);
      });
    }
    if (game.kind === 'choice') {
      box.tabIndex = 0;
      box.addEventListener('keydown', e => { const n = +e.key; if (n >= 1 && n <= 4 && cur && cur.choices[n - 1]) submit(cur.choices[n - 1]); });
    }

    function next() {
      cur = game.gen();
      qEl.innerHTML = cur.q;
      if (game.kind === 'choice') {
        inputArea.innerHTML = '';
        cur.choices.forEach((c, i) => inputArea.append(h('button', { class: 'btn choice', type: 'button', onclick: () => submit(c) }, h('span', { class: 'k' }, String(i + 1)), ' ', c)));
        box.focus();
      } else if (inp) { inp.value = ''; inp.focus(); }
      else { morseBuf = ''; morseShow.textContent = ''; box.focus(); }
    }
    function submit(v) {
      if (done || !cur) return;
      v = String(v).toUpperCase().trim();
      if (!v) return;
      total++;
      const ok = cur.accept ? cur.accept(v) : v === String(cur.a).toUpperCase();
      if (ok) { score++; streak++; best = Math.max(best, streak); fb.className = 'g-fb good'; fb.textContent = '✔ ' + (streak >= 3 ? `streak ${streak}!` : 'correct'); }
      else { streak = 0; fb.className = 'g-fb bad'; fb.textContent = `✘ answer: ${cur.show || cur.a}`; }
      sc.textContent = String(score);
      next();
    }
    function finish() {
      done = true; clearInterval(timer);
      const acc = total ? Math.round(score / total * 100) : 0;
      onFinish && onFinish({ score, total, acc, best });
    }
    t0 = Date.now();
    timer = setInterval(() => {
      const left = Math.max(0, DURATION - Math.floor((Date.now() - t0) / 1000));
      clock.textContent = String(left);
      clock.classList.toggle('low', left <= 10);
      if (left <= 0) finish();
    }, 250);
    next();
    return { stop() { done = true; clearInterval(timer); } };
  }
  function portaMini() {
    const rows = CB.portaTable();
    return h('div', {
      class: 'table-scroll', html: '<table class="porta-table mono small"><tr><th>Key</th>' + Array.from('ABCDEFGHIJKLM').map(c => `<th>${c}</th>`).join('') + '</tr>' +
        rows.map(r => `<tr><th>${r.label}</th>${r.cells.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') + '</table>'
    });
  }

  root.GAMES = { list: GAMES, run, portaMini };
})(typeof window !== 'undefined' ? window : globalThis);
