/* ==========================================================================
   Codebusters Training Center — Cipher Engine
   Pure functions for every 2026-27 Division B cipher, plus key builders,
   random helpers and a cryptarithm solver.  No DOM access in this file.
   ========================================================================== */
(function (root) {
  'use strict';

  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ES_ALPHA = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  const ALPHA25 = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // Polybius / Homophonic (I = J)

  /* ---------------- random helpers ---------------- */
  const rand = {
    int(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    chance(p) { return Math.random() < p; }
  };

  /* ---------------- text helpers ---------------- */
  // Upper-case and strip accents.  For Spanish we keep Ñ as its own letter.
  function normalize(text, lang) {
    let t = String(text).toUpperCase();
    if (lang === 'es') {
      t = t.replace(/Ñ/g, '\u0000');
      t = t.normalize('NFD').replace(/[̀-ͯ]/g, '');
      t = t.replace(/\u0000/g, 'Ñ');
    } else {
      t = t.normalize('NFD').replace(/[̀-ͯ]/g, '');
    }
    return t.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[—–]/g, '-');
  }
  function lettersOnly(text, alpha) {
    alpha = alpha || ALPHA;
    return Array.from(text).filter(c => alpha.includes(c)).join('');
  }
  function dedupe(str) {
    let out = '';
    for (const c of str) if (!out.includes(c)) out += c;
    return out;
  }
  // Keyword-mixed alphabet: unique keyword letters then the rest in order.
  function keyedAlphabet(keyword, alpha) {
    alpha = alpha || ALPHA;
    let k = normalize(keyword);
    if (alpha === ALPHA25) k = k.replace(/J/g, 'I');
    k = dedupe(lettersOnly(k, alpha));
    return k + Array.from(alpha).filter(c => !k.includes(c)).join('');
  }
  function groupBy(str, n) {
    const out = [];
    for (let i = 0; i < str.length; i += n) out.push(str.slice(i, i + n));
    return out.join(' ');
  }
  function frequency(text, alpha) {
    alpha = alpha || ALPHA;
    const f = {};
    for (const c of alpha) f[c] = 0;
    for (const c of text) if (c in f) f[c]++;
    return f;
  }
  function isIsogram(w) { return new Set(w).size === w.length; }

  /* ---------------- monoalphabetic substitution ---------------- */
  // A map is an object plain -> cipher.
  function invert(map) {
    const inv = {};
    for (const k in map) inv[map[k]] = k;
    return inv;
  }
  function substitute(text, map) {
    return Array.from(text).map(c => (c in map ? map[c] : c)).join('');
  }
  // Random derangement: no letter maps to itself (Aristocrat rule).
  function randomMap(alpha) {
    alpha = alpha || ALPHA;
    const letters = Array.from(alpha);
    for (;;) {
      const s = rand.shuffle(letters);
      if (s.every((c, i) => c !== letters[i])) {
        const m = {};
        letters.forEach((c, i) => (m[c] = s[i]));
        return m;
      }
    }
  }
  // K1: the keyed alphabet is the PLAIN alphabet, written under a straight
  // cipher alphabet starting at `offset`.  When students write plaintext
  // under cipher letters A..Z the keyword shows up in the replacement row.
  function k1Map(keyword, alpha, offset) {
    alpha = alpha || ALPHA;
    const keyed = keyedAlphabet(keyword, alpha);
    const n = alpha.length;
    const offsets = offset != null ? [offset] : rand.shuffle([...Array(n).keys()]);
    for (const off of offsets) {
      const m = {};
      let ok = true;
      for (let i = 0; i < n; i++) {
        const cipher = alpha[(off + i) % n];
        const plain = keyed[i];
        if (cipher === plain) { ok = false; break; }
        m[plain] = cipher;
      }
      if (ok) return { map: m, offset: off, keyed };
    }
    return null;
  }
  function caesar(text, shift) {
    shift = ((shift % 26) + 26) % 26;
    return Array.from(text).map(c => {
      const i = ALPHA.indexOf(c);
      return i < 0 ? c : ALPHA[(i + shift) % 26];
    }).join('');
  }
  function atbash(text) {
    return Array.from(text).map(c => {
      const i = ALPHA.indexOf(c);
      return i < 0 ? c : ALPHA[25 - i];
    }).join('');
  }

  /* ---------------- Porta (ACA table) ---------------- */
  function portaRow(k) { return Math.floor(ALPHA.indexOf(k) / 2); }
  function portaChar(k, c) {
    const row = portaRow(k);
    const i = ALPHA.indexOf(c);
    if (i < 0) return c;
    if (i < 13) return ALPHA[13 + ((i + row) % 13)];
    return ALPHA[((i - 13 - row) % 13 + 13) % 13];
  }
  // Porta is reciprocal: the same call encrypts and decrypts.
  function porta(text, key) {
    key = lettersOnly(normalize(key));
    let j = 0;
    return Array.from(text).map(c => {
      if (!ALPHA.includes(c)) return c;
      return portaChar(key[j++ % key.length], c);
    }).join('');
  }
  function portaTable() {
    const rows = [];
    for (let r = 0; r < 13; r++) {
      const label = ALPHA[2 * r] + ',' + ALPHA[2 * r + 1];
      const cells = [];
      for (let i = 0; i < 13; i++) cells.push(ALPHA[13 + ((i + r) % 13)]);
      rows.push({ label, cells });
    }
    return rows;
  }

  /* ---------------- Baconian (24-letter) ---------------- */
  const BACON_LETTERS = 'ABCDEFGHIKLMNOPQRSTUWXYZ'; // I=J, U=V
  function baconCode(letter) {
    let c = letter === 'J' ? 'I' : letter === 'V' ? 'U' : letter;
    const i = BACON_LETTERS.indexOf(c);
    if (i < 0) return null;
    return i.toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B');
  }
  function baconLetter(code) {
    if (!/^[AB]{5}$/.test(code)) return '?';
    const i = parseInt(code.replace(/A/g, '0').replace(/B/g, '1'), 2);
    return i < 24 ? BACON_LETTERS[i] : '?';
  }
  function baconEncode(letters) {
    return Array.from(letters).map(baconCode).filter(Boolean).join('');
  }
  function baconDecode(ab) {
    let out = '';
    for (let i = 0; i + 5 <= ab.length; i += 5) out += baconLetter(ab.slice(i, i + 5));
    return out;
  }
  function baconDisplay(letter) {
    return letter === 'I' ? 'I/J' : letter === 'U' ? 'U/V' : letter;
  }

  /* ---------------- Morse / Fractionated Morse ---------------- */
  const MORSE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
    I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
    Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
  };
  const MORSE_INV = invert(MORSE);
  const FM_SYMBOLS = '.-x';
  // Trigram i (0..25) = sym[i/9] sym[(i/3)%3] sym[i%3]; 'xxx' is never used.
  const FM_TRIGRAMS = Array.from({ length: 26 }, (_, i) =>
    FM_SYMBOLS[Math.floor(i / 9)] + FM_SYMBOLS[Math.floor(i / 3) % 3] + FM_SYMBOLS[i % 3]);

  function toMorseStream(text) {
    // letters separated by x, words by xx
    const words = normalize(text).split(/[^A-Z0-9]+/).filter(Boolean);
    return words.map(w => Array.from(w).map(c => MORSE[c]).join('x')).join('xx');
  }
  function fmEncode(text, keyword) {
    const alpha = keyedAlphabet(keyword);
    let stream = toMorseStream(text);
    while (stream.length % 3) stream += 'x';
    let out = '';
    for (let i = 0; i < stream.length; i += 3) {
      out += alpha[FM_TRIGRAMS.indexOf(stream.slice(i, i + 3))];
    }
    return { cipher: out, alphabet: alpha, stream };
  }
  function morseStreamToText(stream) {
    // Returns plaintext letters with spaces between words, '?' for bad codes.
    return stream.replace(/x+$/, '').split('xx').map(w =>
      w.split('x').filter(Boolean).map(code => MORSE_INV[code] || '?').join('')).join(' ');
  }
  function fmDecode(cipher, alphabet) {
    const stream = Array.from(cipher).map(c => {
      const i = alphabet.indexOf(c);
      return i < 0 ? '???' : FM_TRIGRAMS[i];
    }).join('');
    return { stream, text: morseStreamToText(stream) };
  }
  function prettyMorse(s) {
    return s.replace(/\./g, '●').replace(/-/g, '–').replace(/x/g, '×');
  }

  /* ---------------- Polybius / Nihilist / Checkerboard ---------------- */
  function polybius(keyword) {
    const a = keyedAlphabet(keyword, ALPHA25);
    const grid = [];
    for (let r = 0; r < 5; r++) grid.push(Array.from(a.slice(r * 5, r * 5 + 5)));
    const pos = {};
    grid.forEach((row, r) => row.forEach((c, k) => (pos[c] = [r, k])));
    pos.J = pos.I;
    return { grid, pos, sequence: a };
  }
  function polyValue(sq, letter) {
    const p = sq.pos[letter];
    return (p[0] + 1) * 10 + (p[1] + 1);
  }
  function nihilistEncode(plainLetters, polyKey, key) {
    const sq = polybius(polyKey);
    const k = lettersOnly(normalize(key));
    const kv = Array.from(k).map(c => polyValue(sq, c));
    const pv = Array.from(plainLetters).map(c => polyValue(sq, c));
    return { numbers: pv.map((v, i) => v + kv[i % kv.length]), square: sq, keyValues: kv, plainValues: pv };
  }
  function checkerboardEncode(plainLetters, polyKey, rowKey, colKey) {
    const sq = polybius(polyKey);
    const pairs = Array.from(plainLetters).map(c => {
      const [r, k] = sq.pos[c];
      return rowKey[r] + colKey[k];
    });
    return { pairs, square: sq };
  }

  /* ---------------- Homophonic (ACA, 4-letter keyword) ---------------- */
  function homophonicTable(keyword) {
    const k = normalize(keyword).replace(/J/g, 'I');
    const byNumber = {}; // number (1..100) -> letter
    const byLetter = {}; // letter -> [n1,n2,n3,n4]
    for (const c of ALPHA25) byLetter[c] = [];
    for (let s = 0; s < 4; s++) {
      const start = ALPHA25.indexOf(k[s]);
      for (let n = 0; n < 25; n++) {
        const letter = ALPHA25[(start + n) % 25];
        const num = s * 25 + n + 1;
        byNumber[num] = letter;
        byLetter[letter].push(num);
      }
    }
    byLetter.J = byLetter.I;
    return { byNumber, byLetter };
  }
  function homophonicEncode(plainLetters, keyword) {
    const t = homophonicTable(keyword);
    return { numbers: Array.from(plainLetters).map(c => rand.pick(t.byLetter[c])), table: t };
  }
  function homNum(n) { return n === 100 ? '00' : String(n); }

  /* ---------------- Complete Columnar ---------------- */
  // Rank of each keyword letter; equal letters rank left to right.
  function keywordOrder(keyword) {
    const k = Array.from(keyword);
    const idx = k.map((c, i) => i).sort((a, b) => (k[a] < k[b] ? -1 : k[a] > k[b] ? 1 : a - b));
    const rank = Array(k.length);
    idx.forEach((col, r) => (rank[col] = r + 1));
    return rank;
  }
  // order[c] = the position (1-based) in which column c is read out.
  function columnarEncode(letters, order) {
    const n = order.length;
    let t = letters;
    while (t.length % n) t += 'X';
    const rows = t.length / n;
    let out = '';
    for (let r = 1; r <= n; r++) {
      const col = order.indexOf(r);
      for (let i = 0; i < rows; i++) out += t[i * n + col];
    }
    return { cipher: out, padded: t };
  }
  function columnarDecode(cipher, order) {
    const n = order.length;
    const rows = cipher.length / n;
    const cols = Array(n);
    let p = 0;
    for (let r = 1; r <= n; r++) {
      cols[order.indexOf(r)] = cipher.slice(p, p + rows);
      p += rows;
    }
    let out = '';
    for (let i = 0; i < rows; i++) for (let c = 0; c < n; c++) out += cols[c][i];
    return out;
  }

  /* ---------------- Cryptarithm ---------------- */
  // Solve addends[0] + addends[1] (+...) = result.  Returns {count, solution}.
  function solveAddition(addends, result, maxSolutions) {
    maxSolutions = maxSolutions || 2;
    const W = addends.map(w => Array.from(w).reverse());
    const R = Array.from(result).reverse();
    const L = R.length;
    if (W.some(w => w.length > L)) return { count: 0, solution: null };
    const leading = new Set([...addends, result].filter(w => w.length > 1).map(w => w[0]));
    const assign = {};
    const used = Array(10).fill(false);
    let count = 0, first = null;
    function step(ci, carry, ai) {
      if (count >= maxSolutions) return;
      if (ci === L) {
        if (carry === 0) { count++; if (!first) first = Object.assign({}, assign); }
        return;
      }
      if (ai < W.length) {
        const w = W[ai];
        if (ci >= w.length || w[ci] in assign) return step(ci, carry, ai + 1);
        const ch = w[ci];
        for (let d = 0; d <= 9; d++) {
          if (used[d] || (d === 0 && leading.has(ch))) continue;
          assign[ch] = d; used[d] = true;
          step(ci, carry, ai + 1);
          delete assign[ch]; used[d] = false;
        }
        return;
      }
      let s = carry;
      for (const w of W) if (ci < w.length) s += assign[w[ci]];
      const d = s % 10, nc = Math.floor(s / 10), ch = R[ci];
      if (ch in assign) { if (assign[ch] === d) step(ci + 1, nc, 0); return; }
      if (used[d] || (d === 0 && leading.has(ch))) return;
      assign[ch] = d; used[d] = true;
      step(ci + 1, nc, 0);
      delete assign[ch]; used[d] = false;
    }
    step(0, 0, 0);
    return { count, solution: first };
  }

  /* ---------------- scoring (SciOly style) ---------------- */
  // Up to `free` errors cost nothing; every error beyond that costs 100.
  function scoreQuestion(points, errors, free) {
    free = free == null ? 2 : free;
    const extra = Math.max(0, errors - free);
    return Math.max(0, points - 100 * extra);
  }
  function timedBonus(seconds) { return Math.max(0, 2 * (600 - Math.round(seconds))); }
  function specialBonus(n) { return [0, 150, 400, 750][Math.min(3, n)]; }

  root.CB = {
    ALPHA, ES_ALPHA, ALPHA25, rand,
    normalize, lettersOnly, dedupe, keyedAlphabet, groupBy, frequency, isIsogram,
    invert, substitute, randomMap, k1Map, caesar, atbash,
    portaChar, porta, portaTable, portaRow,
    BACON_LETTERS, baconCode, baconLetter, baconEncode, baconDecode, baconDisplay,
    MORSE, MORSE_INV, FM_TRIGRAMS, toMorseStream, fmEncode, fmDecode, morseStreamToText, prettyMorse,
    polybius, polyValue, nihilistEncode, checkerboardEncode,
    homophonicTable, homophonicEncode, homNum,
    keywordOrder, columnarEncode, columnarDecode,
    solveAddition, scoreQuestion, timedBonus, specialBonus
  };
})(typeof window !== 'undefined' ? window : globalThis);
