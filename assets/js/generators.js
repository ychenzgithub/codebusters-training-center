/* ==========================================================================
   Codebusters Training Center — problem generators
   Every generator returns a problem object:
     { type, mode, level, points, prompt, answer, freeErrors, ... }
   `answer` is the plaintext letters the solver must produce (no spaces).
   ========================================================================== */
(function (root) {
  'use strict';
  const CB = root.CB, D = root.CBDATA, R = CB.rand;

  const round5 = x => Math.max(50, Math.round(x / 5) * 5);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function pickQuote(min, max, lang) {
    const alpha = lang === 'es' ? CB.ES_ALPHA : CB.ALPHA;
    const src = lang === 'es' ? D.QUOTES_ES : D.QUOTES_EN;
    let pool = src.filter(q => {
      const n = CB.lettersOnly(CB.normalize(q[0], lang), alpha).length;
      return n >= min && n <= max;
    });
    if (!pool.length) pool = src;
    const q = R.pick(pool);
    const text = CB.normalize(q[0], lang);
    return { text, letters: CB.lettersOnly(text, alpha), author: lang === 'es' ? null : q[1], translation: lang === 'es' ? q[1] : null };
  }
  const who = q => (q.author && q.author !== 'Unknown' && q.author !== 'Proverb' ? ` by <b>${esc(q.author)}</b>` : '');
  const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : Math.min(n % 10, 4) % 4] || 'th');

  // Words of a text with their letter offsets
  function wordsWithPos(text, alpha) {
    const out = [];
    let pos = 0;
    for (const w of text.split(/[^A-ZÑ]+/)) {
      if (!w) continue;
      const clean = CB.lettersOnly(w, alpha || CB.ALPHA);
      if (clean) { out.push({ w: clean, pos }); pos += clean.length; }
    }
    return out;
  }
  function pickCribWord(text, minLen, alpha) {
    const ws = wordsWithPos(text, alpha).filter(x => x.w.length >= minLen);
    if (!ws.length) return null;
    ws.sort((a, b) => b.w.length - a.w.length);
    return R.pick(ws.slice(0, Math.max(2, Math.ceil(ws.length / 2))));
  }
  // Units: tokens for substitution-style workspaces
  function unitsFromText(text, map, alpha) {
    return Array.from(text).map(ch => (alpha.includes(ch) ? { u: map[ch], p: ch } : { sep: ch }));
  }
  function unitsGrouped(plainLetters, cipherUnits, n) {
    const units = [];
    cipherUnits.forEach((u, i) => {
      if (i && i % n === 0) units.push({ sep: ' ' });
      units.push({ u, p: plainLetters[i] });
    });
    return units;
  }

  const G = {};

  /* ---------------- Aristocrat ---------------- */
  G.aristocrat = function (o) {
    o = o || {};
    const q = pickQuote(o.timed ? 45 : 60, o.timed ? 100 : 130, 'en');
    const useK1 = o.alphabet === 'k1' || (o.alphabet !== 'random' && R.chance(0.45));
    let map, keyword = null;
    if (useK1) {
      for (let t = 0; t < 20 && !map; t++) {
        keyword = R.pick(D.KEYWORDS);
        const k = CB.k1Map(keyword, CB.ALPHA);
        if (k) map = k.map;
      }
    }
    if (!map) { map = CB.randomMap(); keyword = null; }
    const cipher = CB.substitute(q.text, map);
    let hint = '';
    const giveHint = o.hint === 'yes' || (o.hint !== 'no' && !o.timed && R.chance(0.6));
    if (giveHint) {
      const c = pickCribWord(q.text, 4);
      if (c) hint = ` It contains the word <b>${c.w}</b>.`;
    }
    const uniq = new Set(q.letters).size;
    return {
      type: 'aristocrat', mode: 'decode', level: o.level || 'regional',
      points: o.timed ? 0 : round5(120 + uniq * 7 + q.letters.length * 0.8 - (hint ? 40 : 0) - (keyword ? 30 : 0)),
      prompt: `Solve this ${keyword ? '<b>K1</b> ' : ''}Aristocrat, a quote${who(q)}.${hint}`,
      cipher, units: unitsFromText(q.text, map, CB.ALPHA), alpha: CB.ALPHA,
      answer: q.letters, display: q.text, keyword, alphabetType: keyword ? 'K1' : 'Random',
      solutionNote: keyword ? `K1 keyword: <b>${keyword}</b>` : 'Random alphabet', freeErrors: 2, timed: !!o.timed
    };
  };

  /* ---------------- Patristocrat ---------------- */
  G.patristocrat = function (o) {
    o = o || {};
    const q = pickQuote(60, 125, 'en');
    let map, keyword = null;
    if (o.alphabet !== 'random' && (o.alphabet === 'k1' || R.chance(0.75))) {
      for (let t = 0; t < 20 && !map; t++) {
        keyword = R.pick(D.KEYWORDS);
        const k = CB.k1Map(keyword, CB.ALPHA);
        if (k) map = k.map;
      }
    }
    if (!map) { map = CB.randomMap(); keyword = null; }
    const cipherLetters = CB.substitute(q.letters, map);
    const c = pickCribWord(q.text, 4);
    const crib = c ? ` The ${ord(c.pos + 1)} through ${ord(c.pos + c.w.length)} letters decode to <b>${c.w}</b>.` : '';
    return {
      type: 'patristocrat', mode: 'crypt', level: o.level || 'regional',
      points: round5(250 + q.letters.length * 1.6 - (keyword ? 30 : 0)),
      prompt: `Solve this ${keyword ? '<b>K1</b> ' : ''}Patristocrat, a quote${who(q)}.${crib}`,
      cipher: CB.groupBy(cipherLetters, 5),
      units: unitsGrouped(q.letters, Array.from(cipherLetters), 5), alpha: CB.ALPHA,
      answer: q.letters, display: q.text, keyword,
      solutionNote: keyword ? `K1 keyword: <b>${keyword}</b>` : 'Random alphabet', freeErrors: 2
    };
  };

  /* ---------------- Xenocrypt (Spanish) ---------------- */
  G.xenocrypt = function (o) {
    o = o || {};
    const q = pickQuote(22, 90, 'es');
    let map, keyword = null;
    const esKeys = ['CIENCIA', 'MUNDO', 'CAMINO', 'TIEMPO', 'SECRETO', 'AMIGO', 'ESCUELA', 'NARANJA', 'MONTAÑA', 'ESPAÑOL', 'LIBRO', 'VERANO'];
    if (o.alphabet !== 'random' && R.chance(0.5)) {
      for (let t = 0; t < 20 && !map; t++) {
        keyword = R.pick(esKeys);
        const k = CB.k1Map(keyword, CB.ES_ALPHA);
        if (k) map = k.map;
      }
    }
    if (!map) { map = CB.randomMap(CB.ES_ALPHA); keyword = null; }
    const cipher = CB.substitute(q.text, map);
    const c = pickCribWord(q.text, 4, CB.ES_ALPHA) || pickCribWord(q.text, 3, CB.ES_ALPHA);
    const hint = c ? ` It contains the word <b>${c.w}</b>.` : '';
    return {
      type: 'xenocrypt', mode: 'crypt', level: o.level || 'regional',
      points: round5(280 + q.letters.length * 3),
      prompt: `Solve this ${keyword ? '<b>K1</b> ' : ''}Xenocrypt. The plaintext is in <b>Spanish</b>.${hint}`,
      cipher, units: unitsFromText(q.text, map, CB.ES_ALPHA), alpha: CB.ES_ALPHA,
      answer: q.letters, display: q.text, keyword,
      solutionNote: (keyword ? `K1 keyword: <b>${keyword}</b>. ` : 'Random alphabet. ') + `Translation: “${esc(q.translation)}”`, freeErrors: 2
    };
  };

  /* ---------------- Caesar ---------------- */
  G.caesar = function (o) {
    o = o || {};
    const q = pickQuote(30, 90, 'en');
    const shift = R.int(1, 25);
    const map = {};
    for (const c of CB.ALPHA) map[c] = CB.caesar(c, shift);
    return {
      type: 'caesar', mode: 'decode', level: o.level || 'regional',
      points: round5(90 + q.letters.length * 1.2),
      prompt: `Decode this quote${who(q)}, which was encoded with a <b>Caesar</b> cipher.`,
      cipher: CB.substitute(q.text, map), units: unitsFromText(q.text, map, CB.ALPHA), alpha: CB.ALPHA,
      answer: q.letters, display: q.text, shift, solutionNote: `Shift of <b>${shift}</b> (plain A → cipher ${CB.caesar('A', shift)})`, freeErrors: 2
    };
  };

  /* ---------------- Atbash ---------------- */
  G.atbash = function (o) {
    o = o || {};
    const q = pickQuote(30, 90, 'en');
    const map = {};
    for (const c of CB.ALPHA) map[c] = CB.atbash(c);
    return {
      type: 'atbash', mode: 'decode', level: o.level || 'regional',
      points: round5(80 + q.letters.length * 1.1),
      prompt: `Decode this quote${who(q)}, which was encoded with the <b>Atbash</b> cipher.`,
      cipher: CB.substitute(q.text, map), units: unitsFromText(q.text, map, CB.ALPHA), alpha: CB.ALPHA,
      answer: q.letters, display: q.text, solutionNote: 'A↔Z, B↔Y, C↔X …', freeErrors: 2
    };
  };

  /* ---------------- Porta ---------------- */
  G.porta = function (o) {
    o = o || {};
    const mode = o.mode || (o.level === 'state' ? 'crypt' : 'decode');
    const q = pickQuote(28, 75, 'en');
    const key = R.pick(D.KEYWORDS.filter(k => k.length >= 4 && k.length <= 6));
    const cipherLetters = CB.porta(q.letters, key);
    let prompt, crib = null;
    if (mode === 'decode') {
      prompt = `Decode this quote${who(q)}, encoded with the <b>Porta</b> cipher using the keyword <b>${key}</b>.`;
    } else {
      const len = Math.max(key.length, 4) + R.int(0, 1);
      const start = R.int(0, q.letters.length - len);
      crib = { start, text: q.letters.slice(start, start + len) };
      prompt = `This quote${who(q)} was encoded with the <b>Porta</b> cipher using a ${key.length}-letter keyword. ` +
        `The ${ord(start + 1)} through ${ord(start + len)} cipher letters (<span class="mono">${cipherLetters.slice(start, start + len)}</span>) decode to <b>${crib.text}</b>.`;
    }
    return {
      type: 'porta', mode, level: o.level || 'regional',
      points: round5((mode === 'decode' ? 130 : 260) + q.letters.length * 1.5),
      prompt, cipher: CB.groupBy(cipherLetters, 5), cipherLetters, key, keyGiven: mode === 'decode', crib,
      answer: q.letters, display: q.text, solutionNote: `Keyword: <b>${key}</b>`, freeErrors: 2
    };
  };

  /* ---------------- Baconian ---------------- */
  const SYMBOL_SETS = [
    ['▲', '△', '▴', '▵'], ['●', '○', '◉', '◌'], ['■', '□', '▪', '▫'], ['↑', '↓', '⇡', '⇣'],
    ['♠', '♤', '♣', '♧'], ['★', '☆', '✦', '✧'], ['◆', '◇', '❖', '⬖'], ['♥', '♡', '♦', '♢']
  ];
  G.baconian = function (o) {
    o = o || {};
    const variant = o.variant || R.pick(['letters', 'symbols', 'words']);
    const shortPool = D.QUOTES_EN.map(q => CB.lettersOnly(CB.normalize(q[0]))).filter(l => l.length >= 10 && l.length <= 22);
    const shortPhrases = ['CODEBUSTERS', 'SCIENCEOLYMPIAD', 'KEEPCALMANDDECODE', 'KNOWLEDGEISPOWER', 'PRACTICEMAKESPERFECT',
      'THETRUTHISOUTTHERE', 'MEETMEATMIDNIGHT', 'THEEAGLEHASLANDED', 'SENDMORESPIES', 'BREAKTHECODE', 'TRUSTNOONE',
      'THEKEYISUNDERTHEMAT', 'FOLLOWTHEMAP', 'LOOKTOTHESTARS', 'SECRETSAREFUN'];
    const letters = R.pick(R.chance(0.6) ? shortPhrases : shortPool.length ? shortPool : shortPhrases);
    const ab = CB.baconEncode(letters);
    const answer = Array.from(letters).map(c => (c === 'J' ? 'I' : c === 'V' ? 'U' : c)).join('');
    let tokens, abMap = {}, layout;
    if (variant === 'letters') {
      const aSet = new Set(R.shuffle(Array.from(CB.ALPHA)).slice(0, 13));
      Array.from(CB.ALPHA).forEach(c => (abMap[c] = aSet.has(c) ? 'A' : 'B'));
      const A = Array.from(CB.ALPHA).filter(c => abMap[c] === 'A'), B = Array.from(CB.ALPHA).filter(c => abMap[c] === 'B');
      tokens = Array.from(ab).map(x => R.pick(x === 'A' ? A : B));
      layout = 'stream';
    } else if (variant === 'symbols') {
      const s = R.pick(SYMBOL_SETS);
      const sh = R.shuffle(s);
      const nA = R.int(1, 2);
      const A = sh.slice(0, nA), B = sh.slice(nA, nA + R.int(1, 2));
      A.forEach(c => (abMap[c] = 'A')); B.forEach(c => (abMap[c] = 'B'));
      tokens = Array.from(ab).map(x => R.pick(x === 'A' ? A : B));
      layout = 'stream';
    } else {
      // Word Baconian: each alphabet letter is A or B; each 5-letter word spells one code.
      let ok = false;
      for (let t = 0; t < 40 && !ok; t++) {
        const pattern = R.pick(['alt', 'half', 'random', 'vowel']);
        abMap = {};
        Array.from(CB.ALPHA).forEach((c, i) => {
          abMap[c] = pattern === 'alt' ? (i % 2 ? 'B' : 'A')
            : pattern === 'half' ? (i < 13 ? 'A' : 'B')
              : pattern === 'vowel' ? ('AEIOUY'.includes(c) ? 'A' : 'B')
                : (R.chance(0.5) ? 'A' : 'B');
        });
        const byCode = {};
        D.WORDS5.forEach(w => { const code = Array.from(w).map(c => abMap[c]).join(''); (byCode[code] = byCode[code] || []).push(w); });
        const codes = ab.match(/.{5}/g);
        if (codes.every(c => byCode[c])) {
          tokens = codes.map(c => R.pick(byCode[c]));
          ok = true;
        }
      }
      if (!ok) return G.baconian(Object.assign({}, o, { variant: 'letters' }));
      layout = 'words';
    }
    const cribLen = variant === 'words' ? 4 : R.int(3, 4);
    const crib = answer.slice(0, cribLen);
    const vName = { letters: 'letter-for-letter', symbols: 'symbol', words: 'word' }[variant];
    return {
      type: 'baconian', mode: 'crypt', level: o.level || 'regional', variant,
      points: round5((variant === 'words' ? 260 : 180) + answer.length * 6),
      prompt: `This message was encoded with a <b>${vName} Baconian</b> cipher. The first ${cribLen} letters decode to <b>${crib}</b>. What does it say?`,
      tokens, abMap, layout, ab, answer, solutionNote: variant === 'words'
        ? `A letters: ${Array.from(CB.ALPHA).filter(c => abMap[c] === 'A').join('')}; B letters: ${Array.from(CB.ALPHA).filter(c => abMap[c] === 'B').join('')}`
        : `A = ${Object.keys(abMap).filter(k => abMap[k] === 'A').join(' ')} ; B = ${Object.keys(abMap).filter(k => abMap[k] === 'B').join(' ')}`,
      freeErrors: 2
    };
  };

  /* ---------------- Fractionated Morse ---------------- */
  G.fracmorse = function (o) {
    o = o || {};
    const mode = o.mode || (R.chance(0.35) ? 'decode' : 'crypt');
    const q = pickQuote(18, 45, 'en');
    const key = R.pick(D.KEYWORDS);
    const r = CB.fmEncode(q.text, key);
    const words = wordsWithPos(q.text);
    let prompt, crib = null;
    if (mode === 'decode') {
      prompt = `Decode this quote${who(q)}, encoded with the <b>Fractionated Morse</b> cipher using the keyword <b>${key}</b>.`;
    } else {
      const lastWords = [];
      let n = 0;
      for (let i = words.length - 1; i >= 0 && n < 5; i--) { lastWords.unshift(words[i].w); n += words[i].w.length; }
      const cw = lastWords.join(' ');
      crib = { text: cw, where: 'end' };
      prompt = `This quote${who(q)} was encoded with the <b>Fractionated Morse</b> cipher. It ends with <b>${cw}</b>.`;
    }
    return {
      type: 'fracmorse', mode, level: o.level || 'regional',
      points: round5((mode === 'decode' ? 200 : 300) + q.letters.length * 4),
      prompt, cipher: CB.groupBy(r.cipher, 5), cipherLetters: r.cipher, alphabet: r.alphabet, stream: r.stream,
      key, keyGiven: mode === 'decode', crib, answer: q.letters, display: q.text,
      solutionNote: `Keyword: <b>${key}</b> → ${r.alphabet}`, freeErrors: 2
    };
  };

  /* ---------------- Cryptarithm ---------------- */
  G.cryptarithm = function (o) {
    o = o || {};
    const op = o.op || (o.level === 'state' && R.chance(0.4) ? 'sub' : 'add');
    // Unique 10-letter puzzles need long numbers: 6+6 digits succeeds ~5% of tries.
    for (let attempt = 0; attempt < 4000; attempt++) {
      const word = R.pick(D.ISO10);
      const digits = R.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const letterOf = {}; // digit -> letter
      Array.from(word).forEach((c, i) => (letterOf[digits[i]] = c));
      const la = 6, lb = R.pick([5, 6, 6]);
      const rnd = len => { let s = String(R.int(1, 9)); for (let i = 1; i < len; i++) s += R.int(0, 9); return Number(s); };
      const a = rnd(la), b = rnd(lb), c = a + b;
      const toL = n => Array.from(String(n)).map(d => letterOf[d]).join('');
      const A = toL(a), B = toL(b), C = toL(c);
      if (new Set(A + B + C).size !== 10) continue;
      const sol = CB.solveAddition([A, B], C, 2);
      if (sol.count !== 1) continue;
      const answerDigits = Array.from(word).map(ch => digits[word.indexOf(ch)]);
      const lines = op === 'add' ? { top: A, mid: B, res: C, sign: '+' } : { top: C, mid: B, res: A, sign: '−' };
      return {
        type: 'cryptarithm', mode: 'decode', level: o.level || 'regional', op,
        points: round5(260 + (la + lb) * 15),
        prompt: `Solve this cryptarithm. Each letter stands for a different digit, and no number starts with 0. ` +
          `The answer is the word spelled by the digits <b class="mono">${answerDigits.join(' ')}</b>. (No free errors.)`,
        lines, addends: [A, B], result: C, solution: sol.solution, answerDigits,
        answer: word, solutionNote: op === 'add' ? `${a} + ${b} = ${c}` : `${c} − ${b} = ${a}`,
        freeErrors: 0
      };
    }
    return null;
  };

  /* ---------------- Complete Columnar ---------------- */
  G.columnar = function (o) {
    o = o || {};
    const maxCols = o.level === 'state' ? 11 : 9;
    const q = pickQuote(24, 66, 'en');
    const n = R.int(3, Math.min(maxCols, Math.max(3, Math.floor(q.letters.length / 3))));
    let order;
    if (R.chance(0.5)) {
      const kw = D.KEYWORDS.find(k => k.length === n && R.chance(0.5)) || null;
      order = kw ? CB.keywordOrder(kw) : R.shuffle([...Array(n).keys()].map(i => i + 1));
    } else order = R.shuffle([...Array(n).keys()].map(i => i + 1));
    const r = CB.columnarEncode(q.letters, order);
    const c = pickCribWord(q.text, 5) || pickCribWord(q.text, 4) || pickCribWord(q.text, 3);
    return {
      type: 'columnar', mode: 'crypt', level: o.level || 'regional',
      points: round5(170 + n * 25 + q.letters.length * 1.2),
      prompt: `This quote${who(q)} was encoded with a <b>Complete Columnar</b> transposition using at most ${maxCols} columns. ` +
        (c ? `It contains the word <b>${c.w}</b>.` : ''),
      cipher: CB.groupBy(r.cipher, 5), cipherLetters: r.cipher, ncols: n, order, maxCols,
      answer: q.letters, padded: r.padded, crib: c && c.w, display: q.text,
      solutionNote: `${n} columns, read-out order ${order.join(' ')}`, freeErrors: 2
    };
  };

  /* ---------------- Nihilist ---------------- */
  G.nihilist = function (o) {
    o = o || {};
    const mode = o.mode || (o.level === 'state' ? 'crypt' : 'decode');
    const q = pickQuote(22, 60, 'en');
    const polyKey = R.pick(D.KEYWORDS);
    const key = R.pick(D.KEYWORDS.filter(k => k.length >= 3 && k.length <= 6 && k !== polyKey));
    const r = CB.nihilistEncode(q.letters, polyKey, key);
    let prompt, crib = null;
    if (mode === 'decode') {
      prompt = `Decode this quote${who(q)}, encoded with the <b>Nihilist Substitution</b> cipher. Polybius key: <b>${polyKey}</b>. Keyword: <b>${key}</b>.`;
    } else {
      const len = Math.min(q.letters.length - 1, key.length * 2 + R.int(1, 3));
      crib = { start: 0, text: q.letters.slice(0, len) };
      prompt = `This quote${who(q)} was encoded with the <b>Nihilist Substitution</b> cipher. The first ${len} letters decode to <b>${crib.text}</b>. What does it say?`;
    }
    return {
      type: 'nihilist', mode, level: o.level || 'regional',
      points: round5((mode === 'decode' ? 170 : 360) + q.letters.length * 2),
      prompt, numbers: r.numbers, square: r.square.grid, keyValues: r.keyValues, polyKey, key,
      keyGiven: mode === 'decode', crib, answer: q.letters.replace(/J/g, 'I'), display: q.text,
      solutionNote: `Polybius key <b>${polyKey}</b>, keyword <b>${key}</b> (${r.keyValues.join(' ')})`, freeErrors: 2
    };
  };

  /* ---------------- Checkerboard ---------------- */
  G.checkerboard = function (o) {
    o = o || {};
    const mode = o.mode || (o.level === 'state' && R.chance(0.5) ? 'crypt' : 'decode');
    let best = null;
    for (let t = 0; t < 60; t++) {
      const q = pickQuote(28, 70, 'en');
      const polyKey = R.pick(D.KEYWORDS);
      const rowKey = R.pick(D.ISO5), colKey = R.pick(D.ISO5.filter(w => w !== rowKey));
      const r = CB.checkerboardEncode(q.letters, polyKey, rowKey, colKey);
      const full = new Set(r.pairs.map(p => p[0])).size === 5 && new Set(r.pairs.map(p => p[1])).size === 5;
      best = { q, polyKey, rowKey, colKey, r, full };
      if (full) break;
    }
    const { q, polyKey, rowKey, colKey, r, full } = best;
    let prompt, crib = null;
    const keysNote = full ? '' : ` The row key is <b>${rowKey}</b> and the column key is <b>${colKey}</b>.`;
    if (mode === 'decode') {
      prompt = `Decode this quote${who(q)}, encoded with the <b>Checkerboard</b> cipher using the Polybius key <b>${polyKey}</b>.${keysNote}`;
    } else {
      const c = pickCribWord(q.text, 5) || pickCribWord(q.text, 4);
      crib = c;
      prompt = `This quote${who(q)} was encoded with the <b>Checkerboard</b> cipher. The ${ord(c.pos + 1)} through ${ord(c.pos + c.w.length)} cipher units ` +
        `(<span class="mono">${r.pairs.slice(c.pos, c.pos + c.w.length).join(' ')}</span>) decode to <b>${c.w}</b>.${keysNote}`;
    }
    return {
      type: 'checkerboard', mode, level: o.level || 'regional',
      points: round5((mode === 'decode' ? 190 : 380) + q.letters.length * 2),
      prompt, pairs: r.pairs, units: unitsGrouped(q.letters.replace(/J/g, 'I'), r.pairs, 5),
      square: r.square.grid, polyKey, rowKey, colKey, keyGiven: mode === 'decode',
      answer: q.letters.replace(/J/g, 'I'), display: q.text,
      solutionNote: `Polybius key <b>${polyKey}</b>, rows <b>${rowKey}</b>, columns <b>${colKey}</b>`, freeErrors: 2
    };
  };

  /* ---------------- Homophonic ---------------- */
  G.homophonic = function (o) {
    o = o || {};
    const mode = o.mode || (o.level === 'state' && R.chance(0.5) ? 'decode' : 'crypt');
    const q = pickQuote(30, 85, 'en');
    const key = R.pick(D.HOMOPHONIC_KEYS);
    const letters = q.letters.replace(/J/g, 'I');
    const r = CB.homophonicEncode(letters, key);
    let prompt, crib = null;
    if (mode === 'crypt') {
      const len = R.int(3, 5);
      const start = R.int(0, letters.length - len);
      crib = { start, text: letters.slice(start, start + len) };
      prompt = `This quote${who(q)} was encoded as a <b>Homophonic</b> cipher. The ${ord(start + 1)} through ${ord(start + len)} cipher values ` +
        `(<span class="mono">${r.numbers.slice(start, start + len).map(CB.homNum).join(' ')}</span>) decode to <b>${crib.text}</b>.`;
    } else {
      prompt = `Decode this quote${who(q)}, encoded as a <b>Homophonic</b> cipher with a four-letter keyword. No crib is given.`;
    }
    return {
      type: 'homophonic', mode, level: o.level || 'regional',
      points: round5((mode === 'crypt' ? 240 : 420) + letters.length * 2),
      prompt, numbers: r.numbers, units: unitsGrouped(letters, r.numbers.map(CB.homNum), 5),
      key, crib, answer: letters, display: q.text, solutionNote: `Keyword: <b>${key}</b>`, freeErrors: 2
    };
  };

  const TYPES = {
    atbash: { name: 'Atbash', modes: [['decode', 'Decode']] },
    caesar: { name: 'Caesar', modes: [['decode', 'Decode']] },
    aristocrat: { name: 'Aristocrat', modes: [['decode', 'Decode + Cryptanalysis']] },
    patristocrat: { name: 'Patristocrat', modes: [['crypt', 'Decode + Cryptanalysis']] },
    xenocrypt: { name: 'Xenocrypt', modes: [['crypt', 'Decode + Cryptanalysis']] },
    baconian: { name: 'Baconian', modes: [['crypt', 'Cryptanalysis']] },
    porta: { name: 'Porta', modes: [['decode', 'Decode (keyword given)'], ['crypt', 'Cryptanalysis (crib)']] },
    fracmorse: { name: 'Fractionated Morse', modes: [['decode', 'Decode (keyword given)'], ['crypt', 'Cryptanalysis (crib)']] },
    cryptarithm: { name: 'Cryptarithm', modes: [['decode', 'Solve']] },
    columnar: { name: 'Complete Columnar', modes: [['crypt', 'Cryptanalysis (crib)']] },
    nihilist: { name: 'Nihilist', modes: [['decode', 'Decode (keys given)'], ['crypt', 'Cryptanalysis (crib)']] },
    checkerboard: { name: 'Checkerboard', modes: [['decode', 'Decode (Polybius key given)'], ['crypt', 'Cryptanalysis (crib)']] },
    homophonic: { name: 'Homophonic', modes: [['crypt', 'Cryptanalysis (crib)'], ['decode', 'Decode (no crib)']] }
  };

  function generate(type, opts) {
    const p = G[type](opts || {});
    p.id = type + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return p;
  }

  root.GEN = { generate, TYPES, G, SYMBOL_SETS };
})(typeof window !== 'undefined' ? window : globalThis);
