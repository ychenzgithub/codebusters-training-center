// Generates many problems of every type and checks they decode to their answer.
require('../assets/js/engine.js'); require('../assets/js/data.js'); require('../assets/js/generators.js');
const CB = globalThis.CB, GEN = globalThis.GEN;
const N = Number(process.argv[2] || 150);
let fails = 0; const t0 = Date.now();
function check(name, cond, p) { if (!cond) { fails++; if (fails < 15) console.log('FAIL', name, JSON.stringify(p).slice(0, 300)); } }
for (const type of Object.keys(GEN.TYPES)) {
  for (const [mode] of GEN.TYPES[type].modes) for (const level of ['regional', 'state']) for (let i = 0; i < N; i++) {
    const p = GEN.generate(type, { mode, level });
    check(type + ' has answer', p && p.answer && p.points > 0 && p.prompt, p);
    if (!p) continue;
    if (p.units) {
      const plain = p.units.filter(u => !u.sep).map(u => u.p).join('');
      check(type + ' units=answer', plain === p.answer, p);
      // unit -> plain mapping must be a function (same unit, same letter)
      const m = {}; let ok = true;
      p.units.filter(u => !u.sep).forEach(u => { if (m[u.u] && m[u.u] !== u.p) ok = false; m[u.u] = u.p; });
      check(type + ' consistent units', ok, p);
      if (['aristocrat', 'patristocrat', 'xenocrypt'].includes(type))
        check(type + ' no self map', p.units.every(u => u.sep || u.u !== u.p), p);
    }
    if (type === 'porta') check('porta', CB.porta(p.cipherLetters, p.key) === p.answer, p);
    if (type === 'fracmorse') check('fracmorse', CB.lettersOnly(CB.fmDecode(p.cipherLetters, p.alphabet).text) === p.answer, p);
    if (type === 'columnar') check('columnar', CB.columnarDecode(p.cipherLetters, p.order).startsWith(p.answer), p);
    if (type === 'nihilist') {
      const sq = CB.polybius(p.polyKey);
      const dec = p.numbers.map((n, i) => { const v = n - p.keyValues[i % p.keyValues.length]; return sq.grid[Math.floor(v / 10) - 1][v % 10 - 1]; }).join('');
      check('nihilist', dec === p.answer, p);
    }
    if (type === 'checkerboard') {
      const dec = p.pairs.map(pr => p.square[p.rowKey.indexOf(pr[0])][p.colKey.indexOf(pr[1])]).join('');
      check('checkerboard', dec === p.answer, p);
    }
    if (type === 'homophonic') {
      const t = CB.homophonicTable(p.key);
      check('homophonic', p.numbers.map(n => t.byNumber[n]).join('') === p.answer, p);
    }
    if (type === 'baconian') {
      let ab;
      if (p.layout === 'words') ab = p.tokens.map(w => Array.from(w).map(c => p.abMap[c]).join('')).join('');
      else ab = p.tokens.map(t => p.abMap[t]).join('');
      check('baconian', CB.baconDecode(ab) === p.answer, p);
    }
    if (type === 'cryptarithm') {
      const s = p.solution, val = w => Number(Array.from(w).map(c => s[c]).join(''));
      check('crypt sum', val(p.addends[0]) + val(p.addends[1]) === val(p.result), p);
      check('crypt answer', p.answerDigits.map(d => Object.keys(s).find(k => s[k] === d)).join('') === p.answer, p);
    }
  }
}
console.log(fails ? `${fails} FAILURES` : 'ALL GENERATOR CHECKS PASSED', `(${Date.now() - t0} ms)`);
process.exit(fails ? 1 : 0);
