// Verifies the cipher engine against worked examples from the Codebusters guide.
require('../assets/js/engine.js');
const CB = globalThis.CB;
let fails = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : `\n   got:  ${JSON.stringify(got)}\n   want: ${JSON.stringify(want)}`));
}
eq('porta', CB.porta('SCIENCEOLYMPIADCODEBREAKERS', 'PORTA'), 'LWQNAWYGULTIQWQWHYNOKYVTRKL');
eq('porta reciprocal', CB.porta('HHUWIPUWHEGCUAKBSUAWIHOCPLKBSYVIHCZM', 'WORK'), 'SOMETIMESYOUJUSTHAVETOGUESSTHEANSWER');
const n = CB.nihilistEncode('EASYCIPHEREXAMPLE', 'FASHIONED', 'SENSE');
eq('nihilist', n.numbers.join(' '), '36 35 35 67 54 28 64 36 36 66 36 76 34 48 64 47 46');
const c = CB.checkerboardEncode('EASYCIPHEREXAMPLE', 'FASHIONED', 'BRICK', 'PLANT');
eq('checkerboard', c.pairs.join(' '), 'RA BL BA KN IP BT CP BN RA CA RA KA BL IT CP IN RA');
const h = CB.homophonicTable('WORK');
eq('homophonic E', h.byLetter.E, [9, 42, 64, 96]);
eq('homophonic 71', h.byNumber[71], 'M');
eq('homophonic 100', h.byNumber[100], 'I');
eq('keyword order ORDER', CB.keywordOrder('ORDER').join(''), '34125');
eq('columnar enc', CB.columnarEncode('HEREISACOMPLETECOLUMNAREXAMPLE', [3,4,1,2,5]).cipher, 'RCELRPEOTUELHSPCNAEALOAMIMEMXE');
eq('columnar dec', CB.columnarDecode('MSLOIRSCTSTHWVDEOMLXSMOYROFELLETYENSTOETOENTFUITEOIEAEYLGPYX', [3,5,1,4,2,6]),
  'SOMETIMESTHEONLYWAYTOEVERFINDYOURSELFISTOGETCOMPLETELYLOSTXX');
eq('fracmorse', CB.fmEncode('CODEBUSTERS', 'DULCIMERS').cipher, 'BRJATAEMDXEFD');
eq('fracmorse decode', CB.fmDecode('KMUPKSGHPDWWKDMUVDHVIZSRKPGBILTVORTNLJMXXEWOMIRDBQIVGCKQQIS', CB.keyedAlphabet('MASTERING')).text,
  'THE USE OF MORSE CODE DATES BACK ALMOST TWO HUNDRED YEARS');
const s = CB.solveAddition(['SOCIAL', 'SOLAR'], 'VEHICLE');
eq('cryptarithm count', s.count, 1);
eq('cryptarithm A', s.solution.A, 6);
const k1 = CB.k1Map('BECAUSE', CB.ALPHA, null);
// Guide: replacement row (plain under cipher A..Z) = RTVWXYZBECAUSDFGHIJKLMNOPQ
const inv = CB.invert(k1.map);
eq('k1 has keyed alphabet', CB.keyedAlphabet('BECAUSE'), 'BECAUSDFGHIJKLMNOPQRTVWXYZ');
eq('k1 no self map', Object.keys(k1.map).every(p => k1.map[p] !== p), true);
eq('bacon N', CB.baconCode('N'), 'ABBAA');
eq('bacon roundtrip', CB.baconDecode(CB.baconEncode('STAYWARM')), 'STAYWARM');
eq('bacon V->U', CB.baconDecode(CB.baconEncode('VIVJ')), 'UIUI');
eq('atbash', CB.atbash('DISCOVER'), 'WRHXLEVI');
eq('caesar', CB.caesar('XYZ', 3), 'ABC');
eq('spanish normalize', CB.normalize('Mañana será día', 'es'), 'MAÑANA SERA DIA');
eq('score', [CB.scoreQuestion(300, 2), CB.scoreQuestion(300, 4), CB.scoreQuestion(300, 9), CB.scoreQuestion(300, 1, 0)], [300, 100, 0, 200]);
eq('timed bonus', CB.timedBonus(360), 480);
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(fails ? 1 : 0);
