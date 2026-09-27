/* ==========================================================================
   Codebusters Training Center — lessons for every 2026-27 Division B cipher
   Each lesson: background, how it works, solving strategy, a step-by-step
   worked example (data verified against the engine), tips and pitfalls.
   ========================================================================== */
(function (root) {
  'use strict';
  const CB = root.CB;

  /* ---------- small HTML helpers used by the worked examples ---------- */
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Two-line display: cipher on top, (partial) plaintext underneath.
  function pair(cipher, plain) {
    const c = Array.from(cipher), p = Array.from(plain || '');
    let top = '', bot = '';
    c.forEach((ch, i) => {
      const pc = p[i] && p[i] !== '_' ? p[i] : (/[A-ZÑ]/.test(ch) ? '·' : ch);
      top += `<span>${esc(ch)}</span>`;
      bot += `<span class="${/[A-ZÑ]/.test(ch) && p[i] && p[i] !== '_' && p[i] !== ' ' ? 'hit' : ''}">${esc(pc === ' ' ? ' ' : pc)}</span>`;
    });
    return `<div class="ex-pair"><div class="ex-c">${top}</div><div class="ex-p">${bot}</div></div>`;
  }
  // Decode cipher with a partial map (cipher->plain) for pair() display
  function partial(cipher, map) {
    return Array.from(cipher).map(ch => (/[A-ZÑ]/.test(ch) ? (map[ch] || '_') : ch)).join('');
  }
  function table(rows, opts) {
    opts = opts || {};
    return `<table class="ex-table ${opts.cls || ''}">` + rows.map((r, i) =>
      `<tr>${r.map((c, j) => (i === 0 && opts.head) || (j === 0 && opts.side)
        ? `<th>${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('') + '</table>';
  }
  function replRow(alpha, map, label) {
    const inv = map;
    return table([
      ['Cipher', ...Array.from(alpha)],
      [label || 'Plain', ...Array.from(alpha).map(c => inv[c] || '')]
    ], { head: true, side: true, cls: 'mono small' });
  }
  function note(t) { return `<div class="ex-note">${t}</div>`; }

  /* ======================================================================
     Lesson definitions
     ====================================================================== */
  const L = {};

  /* ----------------------------- ATBASH ------------------------------ */
  L.atbash = {
    id: 'atbash', name: 'Atbash', family: 'Monoalphabetic', icon: 'A⇄Z',
    usage: { regional: 'Decode', state: 'Decode' },
    summary: 'The alphabet folded in half: A↔Z, B↔Y, C↔X … Encoding and decoding are the same operation.',
    history: `<p>Atbash was first used with the <b>Hebrew alphabet</b> and shows up in the Book of Jeremiah, where
      the word <i>Sheshach</i> stands for <i>Babel</i>. The name tells you the rule: the first Hebrew letter
      <b>A</b>leph swaps with the last, <b>T</b>av, and the second, <b>B</b>eth, swaps with the second-to-last,
      <b>Sh</b>in: A-T-B-Sh.</p>
      <p>It has no key, so it offers no real security, but it is an ideal first cipher. Geocachers still use it today.</p>`,
    how: `<p>Write the alphabet forwards, then write it backwards underneath. Each letter swaps with the letter in
      the same spot on the other row.</p>
      <div class="alpha-pair mono"><div>A B C D E F G H I J K L M</div><div>Z Y X W V U T S R Q P O N</div></div>
      <p>There are only <b>13 pairs</b>. A handy check is that the alphabet positions of each pair add up to 27
      (A=1 and Z=26, B=2 and Y=25, …). Atbash undoes itself: encoding the ciphertext again gives back the plaintext.</p>`,
    strategy: [
      'Memorize the 13 pairs as two rows: <span class="mono">ABCDEFGHIJKLM</span> over <span class="mono">ZYXWVUTSRQPON</span>.',
      'Decode left to right, writing the plaintext letter directly under each cipher letter.',
      'Do not stop to check each word. Atbash is pure speed, and the answer will make sense when you are done.',
      'If the decoded text looks like gibberish, the cipher is probably not Atbash. Try a Caesar shift instead.'
    ],
    example() {
      const pt = 'SCIENCE IS FUN TO DECODE', ct = CB.atbash(pt);
      return {
        intro: `Decode this Atbash cipher: <span class="mono">${ct}</span>`,
        steps: [
          { t: 'Write the fold', h: `<div class="alpha-pair mono"><div>A B C D E F G H I J K L M</div><div>Z Y X W V U T S R Q P O N</div></div>` },
          { t: 'Swap each letter', h: `H↔S, X↔C, R↔I, V↔E, M↔N …` + pair(ct, 'SCIENCE' + ct.slice(7).replace(/[A-Z]/g, '_')) },
          { t: 'Finish the message', h: pair(ct, pt) + note('Every letter was swapped with its mirror. Nothing else was needed.') }
        ]
      };
    },
    tips: ['A timed Atbash drill (in Games) is the fastest way to lock in the 13 pairs.',
      'M↔N sits in the middle, so letters close to M or N swap with letters close to them.'],
    pitfalls: ['Mixing up neighboring pairs such as G↔T and H↔S. Say the pairs out loud while you practice.']
  };

  /* ----------------------------- CAESAR ------------------------------ */
  L.caesar = {
    id: 'caesar', name: 'Caesar', family: 'Monoalphabetic', icon: '+3',
    usage: { regional: 'Decode', state: 'Decode' },
    summary: 'Every letter is shifted the same number of places down the alphabet. There are only 25 possible keys.',
    history: `<p>The Roman historian Suetonius wrote that <b>Julius Caesar</b> protected his private letters by
      shifting each letter three places (A→D). His successor Augustus reportedly used a shift of one. The version
      with a shift of 13, <b>ROT13</b>, is still used online to hide puzzle answers and spoilers. Because 13 is half
      of 26, ROT13 undoes itself, just like Atbash.</p>`,
    how: `<p>Pick a shift <i>k</i> from 1 to 25. Each plaintext letter moves <i>k</i> places forward, wrapping
      from Z back to A. To decode, move each letter <i>k</i> places backward.</p>
      <div class="alpha-pair mono"><div>Plain : A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</div><div>Shift 3: D E F G H I J K L M N O P Q R S T U V W X Y Z A B C</div></div>`,
    strategy: [
      'Look for a short word and guess it. The most common three-letter word is THE, and single letters are A or I.',
      'Work out the shift from your guess. For example, if <span class="mono">AOL</span> = THE, then T→A is a shift of 7.',
      'Check the shift on a second word before decoding everything.',
      'Decode by counting backwards. Writing a shifted alphabet strip in the margin makes it faster.',
      'If you are stuck, the most frequent cipher letter is usually E, which also gives you the shift.'
    ],
    example() {
      const pt = 'THE DIE IS CAST', ct = CB.caesar(pt, 7);
      return {
        intro: `Decode: <span class="mono">${ct}</span>`,
        steps: [
          { t: 'Guess a common word', h: `The first word <span class="mono">AOL</span> has three letters. Try THE.` + pair(ct, 'THE' + ct.slice(3).replace(/[A-Z]/g, '_')) },
          { t: 'Find the shift', h: `T (20th letter) became A. Counting forward from T: U, V, W, X, Y, Z, A is <b>7 steps</b>. H→O and E→L confirm the same shift.` },
          { t: 'Shift everything back by 7', h: pair(ct, pt) + note('Julius Caesar is said to have spoken this line as he crossed the Rubicon.') }
        ]
      };
    },
    tips: ['Test your guessed shift on two different letters before committing.',
      'Caesar and Atbash can look like Aristocrats. Try both quick checks before settling in for a long solve.'],
    pitfalls: ['Shifting the wrong way. Encoding adds the shift and decoding subtracts it.']
  };

  /* ---------------------------- ARISTOCRAT --------------------------- */
  L.aristocrat = {
    id: 'aristocrat', name: 'Aristocrat', family: 'Monoalphabetic', icon: 'Aa',
    usage: { regional: 'Decode + Cryptanalysis (random or K1 alphabet)', state: 'Decode + Cryptanalysis (random or K1 alphabet)' },
    summary: 'The classic newspaper cryptogram: a scrambled alphabet with word spaces kept. It is also the timed first question on every test.',
    history: `<p>“Aristocrat” is the <b>American Cryptogram Association (ACA)</b> name for a simple substitution
      cipher that keeps word divisions. Solving one depends on <b>frequency analysis</b>, which the Arab scholar
      <b>Al-Kindi</b> described in the 9th century: in a long English text, E, T, A, O, I and N are much more common
      than J, Q, X and Z.</p>
      <p>In Codebusters the <b>first question is a timed Aristocrat</b>. Solving it within 10 minutes earns a bonus of
      2 × (600 − seconds), so a 4-minute solve adds <b>720 points</b>.</p>`,
    how: `<p>Every plaintext letter is replaced by one fixed cipher letter, and <b>no letter ever stands for
      itself</b>. Spaces and punctuation are kept.</p>
      <p><b>Random alphabet:</b> the replacements are shuffled with no pattern.</p>
      <p><b>K1 alphabet</b> (Div B/C): the <i>plaintext</i> alphabet is keyword-mixed. Write the keyword without repeats,
      then the rest of the alphabet in order, and slide it under a normal A–Z cipher alphabet. When you write the plaintext
      letters under the cipher letters A–Z in the frequency table, <b>the keyword shows up in the “Replacement” row</b>
      and the rest of the alphabet runs in order after it. That pattern lets you fill in letters you have not solved yet.</p>`,
    strategy: [
      'Fill in any hint or crib first.',
      'One-letter words are almost always A or I.',
      'Mark the highest-frequency letters. E, T, A, O, I, N, S, H and R cover about 70% of English.',
      'Attack short words: THE, AND, THAT, TO, OF, IS, IT, IN. Apostrophes help too: ’S, ’T, N’T.',
      'Use word <b>patterns</b>. A word shaped like ABCA is often THAT, and ABCDEFGHAD fits DIFFERENCE.',
      'Every time you place a letter, fill it in everywhere it appears and look for words that are nearly complete.',
      'For a K1 alphabet, look for runs in the replacement row (…RST…) and use the gaps to place the remaining letters.',
      'Up to <b>2 wrong letters are free</b>, so do not spend a minute on the last rare letter during the timed question.'
    ],
    example() {
      const pt = 'THE IMPORTANT THING IS NOT TO STOP QUESTIONING.';
      const k = CB.k1Map('CURIOUS', CB.ALPHA, 3);
      const ct = CB.substitute(pt, k.map), inv = CB.invert(k.map);
      const m = {};
      const add = s => { for (const c of s) m[k.map[c]] = c; return partial(ct, m); };
      return {
        intro: `Solve this K1 Aristocrat (a quote by Albert Einstein):<div class="mono big">${ct}</div>`,
        steps: [
          { t: 'Count frequencies', h: `X appears <b>8 times</b>. G, H and U appear 5 times each. X is very likely T or E.` },
          { t: 'Use short words', h: `<span class="mono">XPM</span>, <span class="mono">XH</span> and <span class="mono">UHX</span> all start or end with X.
              X = T fits all three: <b>THE</b>, <b>TO</b> and ?OT. So P=H, M=E, H=O.` + pair(ct, add('THEO')) },
          { t: 'The frequent U', h: `<span class="mono">UHX</span> = ?OT could be NOT, GOT, HOT or LOT. U is frequent, so try <b>N</b>. Then
              <span class="mono">XPGUO</span> = TH?N? looks like <b>THING</b> (G=I, O=G), and <span class="mono">GI</span> = I? must be <b>IS</b>, because T is taken.` + pair(ct, add('NIGS')) },
          { t: 'Pattern words', h: `<span class="mono">GTVHFXJUX</span> = I??O?T?NT becomes <b>IMPORTANT</b>. <span class="mono">IXHV</span> = STO? becomes <b>STOP</b>.
              <span class="mono">WEMIXGHUGUO</span> = ??ESTIONING becomes <b>QUESTIONING</b>.` + pair(ct, add('MPRAQU')) },
          { t: 'Read the K1 keyword', h: `Write each plaintext letter under its cipher letter. The replacement row now contains the run
              <b>U R I O S</b> under cipher E F G H I, followed by the alphabet in order. The keyword is <b>CURIOUS</b>, which is fitting for Einstein!` +
              replRow(CB.ALPHA, inv, 'Replacement') + note('A K1 keyword is not needed to get credit, but it lets you fill in letters that never appear in the text.') }
        ]
      };
    },
    tips: ['Solve in pencil. Guessing and backtracking is normal.',
      'During the timed question, one teammate can fill in letters while another looks for pattern words.',
      'Learn the top pattern words (Games → Pattern Detective).'],
    pitfalls: ['Forgetting that no letter maps to itself. If cipher E is E, your guess is wrong.',
      'Assigning the same plaintext letter to two cipher letters.']
  };

  /* --------------------------- PATRISTOCRAT -------------------------- */
  L.patristocrat = {
    id: 'patristocrat', name: 'Patristocrat', family: 'Monoalphabetic', icon: 'AAAAA',
    usage: { regional: 'Decode + Cryptanalysis', state: 'Decode + Cryptanalysis' },
    summary: 'An Aristocrat with the spaces removed. The letters are written in blocks of five, so word shapes disappear.',
    history: `<p>The ACA calls a word-less substitution cipher a <b>Patristocrat</b>. Writing ciphertext in
      <b>groups of five</b> is an old telegraph habit: it hides word lengths and makes transmission errors easier to
      count. Codebusters Patristocrats usually use a <b>K1 alphabet</b> and usually come with a crib.</p>`,
    how: `<p>Encryption is exactly like an Aristocrat. Afterwards, every space and punctuation mark is removed and the
      letters are regrouped in fives. The groups have <b>nothing to do</b> with the real word boundaries.</p>`,
    strategy: [
      'Place the crib first, and pay attention to the location the question gives you.',
      'Frequency matters even more here: map the top letters to E, T, A, O, I, N.',
      'Look for common letter strings: THE, ING, ION, AND, ENT, TION. THE is by far the most common trigram.',
      'Repeated cipher sequences are usually repeated words (THE, AND, THAT).',
      'Once a few letters are in, look for places where word breaks become obvious.',
      'Use the K1 replacement-row pattern exactly as you would for an Aristocrat.'
    ],
    example() {
      const pt = CB.lettersOnly(CB.normalize('Knowledge is power, and there is no power like the power of learning.'));
      const k = CB.k1Map('SECRET', CB.ALPHA, 4); const ct = CB.substitute(pt, k.map);
      const m = {}; const add = s => { for (const c of s) m[k.map[c]] = c; return partial(ct, m); };
      const g = s => CB.groupBy(s, 5);
      return {
        intro: `Solve this K1 Patristocrat. It contains the word <b>POWER</b> three times.<div class="mono big">${g(ct)}</div>`,
        steps: [
          { t: 'Find the repeats', h: `The five-letter string <span class="mono">WVAFH</span> appears three times (starting at letters 12, 29 and 41). Those are the three POWERs: W=P, V=O, A=W, F=E, H=R. F is also the most frequent cipher letter (10 times), which fits E.` + pair(g(ct), g(add('POWER'))) },
          { t: 'Words around the crib', h: `The three letters after the first POWER (<span class="mono">JUL</span>) are a good fit for <b>AND</b>: J=A, U=N, L=D. The two letters before the second POWER (<span class="mono">UV</span>) are then N O, giving “NO POWER”. After the last POWER, <span class="mono">VM</span> = O? is <b>OF</b>, so M=F.` + pair(g(ct), g(add('ANDF'))) },
          { t: 'Sight-read the rest', h: `The start <span class="mono">RUVAS FLNFP E</span> = ?NOW? ED?E? ? reads as <b>KNOWLEDGE IS</b> (R=K, S=L, N=G, P=I, E=S). Between AND and IS comes THERE, followed by LIKE THE, and the end is LEARNING.` + pair(g(ct), g(pt)) + note('KNOWLEDGE IS POWER AND THERE IS NO POWER LIKE THE POWER OF LEARNING. The replacement row shows the K1 keyword SECRET.') }
        ]
      };
    },
    tips: ['Write the plaintext directly under each group and add slashes where you think words break.',
      'THE and ING are often the first breaks to appear in a Patristocrat.'],
    pitfalls: ['Treating the five-letter groups as words. They never are.']
  };

  /* ---------------------------- XENOCRYPT ---------------------------- */
  L.xenocrypt = {
    id: 'xenocrypt', name: 'Xenocrypt', family: 'Monoalphabetic · Spanish', icon: 'Ñ',
    usage: { regional: 'Decode + Cryptanalysis (0–1 on the test)', state: 'Decode + Cryptanalysis (1–2 on the test)' },
    summary: 'An Aristocrat in Spanish. The alphabet has 27 letters because Ñ is its own letter.',
    history: `<p>“Xeno” means foreign. Xenocrypts are foreign-language cryptograms, and the ACA publishes them
      in dozens of languages. Science Olympiad uses <b>Spanish</b>. You do not need to speak Spanish, but knowing the
      common words and endings is a big advantage. It also gives teammates who speak Spanish a way to shine.</p>`,
    how: `<p>This is an Aristocrat over the Spanish alphabet <span class="mono">A B C D E F G H I J K L M N Ñ O P Q R S T U V W X Y Z</span>.
      Accents are dropped (Á→A, É→E …), but <b>Ñ stays a separate letter</b>. Alphabets are random or K1.</p>
      <table class="ex-table small"><tr><th>Most common Spanish letters</th><td class="mono">E A O S R N I D L C T U</td></tr>
      <tr><th>Most common words</th><td class="mono">DE LA QUE EL EN Y A LOS SE DEL LAS UN POR CON NO UNA SU PARA ES AL</td></tr>
      <tr><th>Useful patterns</th><td>QU always goes together; words often end in <span class="mono">-O, -A, -OS, -AS, -ES, -AR, -ER, -IR, -CION, -MENTE</span>; double LL and RR</td></tr></table>`,
    strategy: [
      'E and A are both very common in Spanish. Decide which is which from the short words.',
      'Try the most common short words: <span class="mono">DE, LA, EL, EN, ES, LO, NO, SE, QUE, LOS, LAS, DEL, POR, CON, UNA, PARA</span>.',
      'Q is almost always followed by U and then E or I (QUE, QUI).',
      'Look for cognates, words that look like English: CIENCIA (science), IMPORTANTE, UNIVERSO, NATURAL.',
      'A single-letter word is usually <b>Y</b> (and), <b>A</b> (to) or <b>O</b> (or).',
      'Remember Ñ when you run the K1 alphabet: it comes right after N.'
    ],
    example() {
      const pt = CB.normalize('No dejes para mañana lo que puedes hacer hoy.', 'es');
      const k = CB.k1Map('CIENCIA', CB.ES_ALPHA, 3); const ct = CB.substitute(pt, k.map);
      const m = {}; const add = s => { for (const c of s) m[k.map[c]] = c; return partial(ct, m); };
      return {
        intro: `Solve this Spanish saying:<div class="mono big">${ct}</div>`,
        steps: [
          { t: 'Frequencies', h: `F and H each appear 6 times, so they are probably E and A. <span class="mono">PHQHGH</span> has H in every other spot, which is a very Spanish shape (…A?A?A).` },
          { t: 'The word QUE', h: `The three-letter word <span class="mono">TXF</span> is a great candidate for <b>QUE</b>, the third most common Spanish word. That makes F=E, so H=A.` + pair(ct, add('QUEA')) },
          { t: 'Build from E and A', h: `<span class="mono">SXFJFV</span> = ?UE?E? becomes <b>PUEDES</b> (S=P, J=D, V=S). <span class="mono">JFNFV</span> = DE?ES becomes <b>DEJES</b> (N=J). <span class="mono">SHUH</span> = PA?A becomes <b>PARA</b>.` + pair(ct, add('PDSJR')) },
          { t: 'Ñ appears', h: `<span class="mono">PHQHGH</span> = MA?A?A is <b>MAÑANA</b> (tomorrow), so Q=Ñ and G=N. Then <span class="mono">GR</span>=NO, <span class="mono">OR</span>=LO, <span class="mono">MHDFU</span>=HACER and <span class="mono">MRB</span>=HOY.` + pair(ct, pt) +
              note('“Don’t leave for tomorrow what you can do today.” The K1 keyword was CIENCIA (science).') }
        ]
      };
    },
    tips: ['Study the 100 most common Spanish words (Games → Spanish Word Match).',
      'Many proverbs appear on tests, so reading a list of <i>refranes</i> is worthwhile practice.'],
    pitfalls: ['Forgetting Ñ in the frequency table.', 'Expecting English letter frequencies. Spanish has far more A, O and S.']
  };

  /* ----------------------------- BACONIAN ---------------------------- */
  L.baconian = {
    id: 'baconian', name: 'Baconian', family: 'Steganography', icon: 'AB',
    usage: { regional: 'Cryptanalysis', state: 'Cryptanalysis' },
    summary: 'Each letter becomes five A/B symbols. The A’s and B’s are hidden in symbols, letter shapes or whole words.',
    history: `<p><b>Sir Francis Bacon</b> devised this “biliteral” cipher around 1605 and published it in 1623. Its goal
      was <b>steganography</b>, hiding the fact that a message exists at all. You could hide the A’s and B’s in
      two slightly different fonts inside an ordinary-looking letter. Science Olympiad uses the <b>24-letter</b> version,
      where I/J and U/V share codes.</p>`,
    how: `<p>Each plaintext letter becomes a 5-symbol code (a binary number from 0 to 23, with A=0 and B=1):</p>
      <div class="bacon-mini mono"></div>
      <p>Then every A and B is disguised. <b>Letter-for-letter</b> uses two sets of symbols or letters.
      <b>Sequence</b> uses a repeating text where, for example, accented letters mean B. <b>Word Baconian</b> uses a
      sentence of 5-letter words where each letter of the alphabet has been assigned to A or B.</p>`,
    strategy: [
      'Split the ciphertext into groups of five.',
      '<b>No code starts with BB</b>, because the largest code is BABBB (Z). If a group starts with two identical symbols, those symbols are A.',
      'A’s outnumber B’s. The symbol type you see most often is probably A.',
      'A group of five identical symbols is AAAAA, which is the letter A.',
      'Use the crib: write its A/B codes under the matching symbols to learn which symbol is A and which is B.',
      'For a Word Baconian, map each letter of the alphabet to A or B from the crib, then look for a pattern (for example, alternating A/B).'
    ],
    example() {
      const code = CB.baconEncode('CIPHER');
      const sy = code.replace(/A/g, '▲').replace(/B/g, '▽');
      const grp = s => s.match(/.{1,5}/g).join(' ');
      return {
        intro: `Symbols: <div class="mono big">${sy}</div>The message starts with <b>CI</b>. Decode it.`,
        steps: [
          { t: 'Group by fives', h: `<div class="mono big">${grp(sy)}</div>` },
          { t: 'Match the crib', h: `C = AAABA and I = ABAAA. The first group ▲▲▲▽▲ lines up with AAABA, so <b>▲ = A</b> and <b>▽ = B</b>. This also agrees with the rules above: the most common symbol is ▲, and several groups start with ▲▲.` },
          { t: 'Convert and look up', h: `<div class="mono big">${grp(code)}</div>` +
              table([['Group', ...grp(code).split(' ')], ['Letter', ...grp(code).split(' ').map(CB.baconLetter)]], { side: true, cls: 'mono small' }) + note('The answer is CIPHER.') }
        ]
      };
    },
    tips: ['Memorize the table. It is binary counting: A=AAAAA(0), B=AAAAB(1), C=AAABA(2) …',
      'Codes for letters after M start with AB or BA. Codes for A through H start with AA.'],
    pitfalls: ['Forgetting the 24-letter rule. I and J share a code, and U and V share a code.',
      'Miscounting a group. Rule off every five symbols with a pencil line.']
  };

  /* ------------------------------ PORTA ------------------------------ */
  L.porta = {
    id: 'porta', name: 'Porta', family: 'Polyalphabetic', icon: 'A|N',
    usage: { regional: 'Decode (keyword given)', state: 'Cryptanalysis (crib given)' },
    summary: 'A keyword chooses one of 13 reciprocal alphabets for each letter. A–M always swaps with N–Z.',
    history: `<p>Invented by <b>Giovan Battista della Porta</b> in 1563 (in <i>De Furtivis Literarum Notis</i>),
      this was one of the first ciphers to use a <b>keyword</b> to switch between alphabets. It is an ancestor of the
      Vigenère cipher. Codebusters uses the ACA version of the table.</p>`,
    how: `<p>Repeat the keyword over the plaintext. Each key letter picks a row of the table (rows come in pairs: A/B,
      C/D, …). Letters in A–M are found in the header row and swap with the letter below them in the chosen row.
      Letters in N–Z are found in the row and swap with the header letter above them.</p>
      <div class="porta-mini"></div>
      <p>Because every row just swaps pairs, <b>encoding and decoding are identical</b>. A–M always becomes N–Z and
      N–Z always becomes A–M.</p>`,
    strategy: [
      '<b>Decode:</b> write the repeating keyword above the ciphertext, then decode all letters that share a key letter together. You use the same row each time, which is faster.',
      '<b>Cryptanalysis:</b> for each crib letter, sort the pair (cipher, plain) alphabetically. The A–M letter gives the column, and finding the N–Z letter in that column gives the row, and therefore the key letter pair.',
      'Each row covers two key letters (such as K,L). Line up the pairs to spell a real word, like WORK from W/X, O/P, Q/R, K/L.',
      'The crib position tells you where the key repeats: position mod keyword length.',
      'If you know the key length, you can fill the key forward and backward without knowing the whole word.'
    ],
    example() {
      const pt = 'KEEPCALMANDDECODEON', key = 'SOLVE';
      const ct = CB.porta(pt, key);
      const keyRow = Array.from(pt).map((_, i) => key[i % key.length]).join('');
      return {
        intro: `Decode <span class="mono">${CB.groupBy(ct, 5)}</span> with the keyword <b>SOLVE</b>.`,
        steps: [
          { t: 'Write the key over the cipher', h: `<div class="ex-stack mono"><div class="k">${keyRow}</div><div>${ct}</div></div>` },
          { t: 'First letter: key S, cipher T', h: `S uses row <b>S,T</b>: <span class="mono">W X Y Z N O P Q R S T U V</span> under A–M. T is an N–Z letter, so find T in the row. It sits under the header letter <b>K</b>, so T→K.` },
          { t: 'Second letter: key O, cipher Y', h: `Row <b>O,P</b>: <span class="mono">U V W X Y Z N O P Q R S T</span>. Y sits under <b>E</b>, so Y→E.` },
          { t: 'Group by key letter', h: `Do every letter under an S, then every letter under an O, and so on. Each time you only need one row.` +
              `<div class="ex-stack mono"><div class="k">${keyRow}</div><div>${ct}</div><div class="p">${pt}</div></div>` + note('KEEP CALM AND DECODE ON') }
        ]
      };
    },
    tips: ['Always sort the pair alphabetically before looking it up. The A–M letter is the column.',
      'A cipher letter can never equal its plaintext letter, and it is always in the other half of the alphabet. Use that to check your work.'],
    pitfalls: ['Looking up an N–Z letter in the header row. The header only contains A–M.']
  };

  /* ------------------------ FRACTIONATED MORSE ----------------------- */
  L.fracmorse = {
    id: 'fracmorse', name: 'Fractionated Morse', family: 'Tomogrammic', icon: '●–×',
    usage: { regional: 'Decode + Cryptanalysis', state: 'Decode + Cryptanalysis' },
    summary: 'Convert the text to Morse code, cut the stream into groups of three symbols, and replace each group with a letter from a keyword alphabet.',
    history: `<p>Morse code was developed by <b>Samuel Morse and Alfred Vail</b> in the 1830s–40s. The Fractionated Morse
      cipher was invented in 1960 by an ACA member known as <b>FIDDLE</b>. It breaks each Morse letter into pieces that end up
      spread across different cipher letters. That is <b>fractionation</b>.</p>`,
    how: `<p>1. Write the plaintext in Morse. Put <b>×</b> between letters and <b>××</b> between words.
      2. Pad the end with × so the length is a multiple of 3.
      3. Build a keyword alphabet (keyword without repeats, then the remaining letters A–Z) and place it over the 26 fixed trigrams:</p>
      <div class="fm-mini"></div>
      <p>4. Replace each group of three symbols with the letter above it. <b>×××</b> never occurs, which is why there are only 26 groups.</p>`,
    strategy: [
      'Learn Morse code cold. This cipher is impossible without it.',
      'Convert the crib to Morse (with × between letters) and slide it into position to find out which trigram each cipher letter stands for.',
      'Watch the ×’s at the edges of the crib. Try adding one or two × at the start or end until the groups line up with a consistent mapping.',
      'Fill in the table. The alphabet is keyword first, then the remaining letters in order, and it often ends with …UVWXYZ. Gaps between known letters tell you what must fit in between.',
      'Write the Morse under every cipher letter you know, then read words off wherever × breaks appear.',
      'Remember that ××● can only follow a word break.'
    ],
    example() {
      const r = CB.fmEncode('CODES ARE FUN', 'PLANET');
      const tri = CB.FM_TRIGRAMS.map(CB.prettyMorse);
      const cells = Array.from(r.cipher).map(c => `<div class="fm-cell"><b>${c}</b><span>${tri[r.alphabet.indexOf(c)]}</span></div>`).join('');
      return {
        intro: `Decode <span class="mono">${r.cipher}</span> with the keyword <b>PLANET</b>.`,
        steps: [
          { t: 'Build the keyed alphabet', h: `<span class="mono">PLANET</span> + the remaining letters gives <span class="mono">${r.alphabet}</span>. Write it over the fixed trigram order:` +
              table([['', ...Array.from(r.alphabet)], ['1', ...tri.map(t => t[0])], ['2', ...tri.map(t => t[1])], ['3', ...tri.map(t => t[2])]], { head: true, side: true, cls: 'mono small' }) },
          { t: 'Replace letters with trigrams', h: `<div class="fm-row">${cells}</div>` },
          { t: 'Read the Morse stream', h: `<div class="mono">${CB.prettyMorse(r.stream)}</div>Split at × (letter) and ×× (word):<div class="mono big">${r.stream.split('xx').map(w => w.split('x').filter(Boolean).map(m => CB.prettyMorse(m)).join(' ')).join('  /  ')}</div>` },
          { t: 'Translate Morse', h: `<div class="mono big">${CB.morseStreamToText(r.stream)}</div>` + note('The trailing × was padding.') }
        ]
      };
    },
    tips: ['Practice Morse daily (Games → Morse Sprint) until you can read it at a glance.',
      'Mark word breaks (××) with a slash as soon as you see them.'],
    pitfalls: ['Forgetting that a letter’s Morse can be split across two cipher letters.',
      'Mixing up the fixed trigram order. The first symbol changes slowest: ●●●, ●●–, ●●×, ●–●, …']
  };

  /* ---------------------------- CRYPTARITHM -------------------------- */
  L.cryptarithm = {
    id: 'cryptarithm', name: 'Cryptarithm', family: 'Math · Logic', icon: '9+1',
    usage: { regional: 'Decode + Cryptanalysis (no free errors)', state: 'Decode + Cryptanalysis (no free errors)' },
    summary: 'An arithmetic problem where every digit has been replaced by a letter. Use carries and logic to recover the digits.',
    history: `<p>Letter-arithmetic puzzles date to at least the 1860s. The most famous one,
      <span class="mono">SEND + MORE = MONEY</span>, was published by <b>Henry Dudeney</b> in 1924. The word
      <i>cryptarithm</i> was coined by the Belgian puzzle writer Minos in 1931. In Science Olympiad the puzzles are
      in base 10 and use <b>10 different letters</b>, one per digit. The answer is a word or phrase you spell by
      reading the letters for a list of digits.</p>`,
    how: `<p>Each letter stands for one digit, each digit is used by one letter, and <b>numbers never start with 0</b>.
      Write the columns right to left and track the carries. A carry from adding two numbers is at most 1. Subtraction
      can be rewritten as addition: if A − B = C, then C + B = A.</p>`,
    strategy: [
      'If the result is longer than every addend, its leading letter is 1 (the carry).',
      'Write the column equations: letter + letter + carry = result + 10 × (next carry).',
      'A column like X + Y = X (+ carry) means Y is 0 or 9.',
      'Keep a 10×10 elimination grid (letters × digits) and cross out impossible digits.',
      'Try a small number of cases. Pick the most constrained letter and branch on it.',
      'Check the whole sum at the end. There are <b>no free errors</b> for a Cryptarithm, so every letter of the answer must be right.'
    ],
    example() {
      return {
        intro: `The classic: <pre class="mono big crypt">  SEND\n+ MORE\n------\n MONEY</pre>`,
        steps: [
          { t: 'The leading carry', h: `MONEY has 5 digits and the addends have 4. The extra digit comes from a carry, so <b>M = 1</b>.` },
          { t: 'Thousands column', h: `S + M + carry = O + 10. With M = 1: S + 1 + c ≥ 10, so S is 8 or 9, and O is 0 or 1. M is already 1, so <b>O = 0</b>.` },
          { t: 'Hundreds column', h: `E + O + c = N gives E + c = N. E ≠ N, so a carry must come in: <b>N = E + 1</b>. This column cannot carry out, because that would need E = 9 and N = 0, and O is already 0. With no carry into the thousands, S + 1 = 10, so <b>S = 9</b>.` },
          { t: 'Tens column', h: `N + R + c₁ = E + 10 (this column must carry). Substitute N = E + 1: E + 1 + R + c₁ = E + 10, so R + c₁ = 9. R ≠ 9 (S is 9), so c₁ = 1 and <b>R = 8</b>.` },
          { t: 'Units column', h: `D + E = Y + 10, because there is a carry into the tens. The digits left are 2–7, and N = E + 1. Checking each case, only E = 5, N = 6, D = 7, Y = 2 fits.<pre class="mono big crypt">  9567\n+ 1085\n------\n 10652</pre>` + note('The Science Olympiad version has 10 letters and asks you to decode a digit string such as “3 1 4 1 5” into letters.') }
        ]
      };
    },
    tips: ['Start from the left (the carries into the top digits) and from any column with repeated letters.',
      'The Cryptarithm playground below checks whether your puzzle has exactly one solution. Use it to make practice puzzles for friends.'],
    pitfalls: ['Forgetting the carry into a column.', 'Letting a number start with 0.']
  };

  /* ------------------------- COMPLETE COLUMNAR ----------------------- */
  L.columnar = {
    id: 'columnar', name: 'Complete Columnar', family: 'Transposition', icon: '▥',
    usage: { regional: 'Cryptanalysis (≤ 9 columns)', state: 'Cryptanalysis (≤ 11 columns)' },
    summary: 'The letters stay the same but change places. Write the text in rows, then read out the columns in a scrambled order.',
    history: `<p>Columnar transposition was a workhorse of military cryptography. During World War I, armies used
      double columnar transposition as a field cipher. “Complete” means the grid is completely filled, with padding
      (usually X) added at the end if needed.</p>`,
    how: `<p>1. Choose the number of columns <i>n</i>. 2. Write the plaintext row by row and pad the last row with X.
      3. Number the columns, often by the alphabetical order of a keyword (ORDER → 3 4 1 2 5; for repeated letters the left one comes first).
      4. Read each column top to bottom in that numbered order.</p>`,
    strategy: [
      'Count the letters. The number of columns must divide the length evenly.',
      'Try each possible column count: write the ciphertext down in equal-length columns.',
      'X’s at the bottom of columns are a strong hint that they are padding. All the padding X’s land in the last row.',
      'Find the crib. Its letters must appear in consecutive columns of the same row, or wrap to the start of the next row.',
      'Place the crib’s columns, then slide the remaining columns around until every row reads as English.',
      'Common letter pairs (TH, HE, IN, ER, QU) help you decide which columns sit next to each other.'
    ],
    example() {
      const pt = CB.lettersOnly(CB.normalize('Knowledge is power, and practice is the key'));
      const r = CB.columnarEncode(pt, [3, 1, 4, 2]);
      const rows = r.cipher.length / 4;
      const cols = [0, 1, 2, 3].map(i => r.cipher.slice(i * rows, i * rows + rows));
      const grid = (order, labels) => table([labels, ...Array.from({ length: rows }, (_, i) => order.map(c => cols[c][i]))], { head: true, cls: 'mono small' });
      return {
        intro: `Ciphertext (${r.cipher.length} letters): <span class="mono">${CB.groupBy(r.cipher, 5)}</span>. The crib is <b>POWER</b>.`,
        steps: [
          { t: 'Pick the number of columns', h: `36 = 2×18 = 3×12 = 4×9 = 6×6. Start with 4 columns of 9 letters. Write the ciphertext down in columns:` + grid([0, 1, 2, 3], ['C1', 'C2', 'C3', 'C4']) },
          { t: 'Look at the bottom row', h: `The last row is <span class="mono">${[0, 1, 2, 3].map(c => cols[c][rows - 1]).join(' ')}</span>. The X in C2 is probably padding, so C2 is likely the <b>last</b> column.` },
          { t: 'Place the crib', h: `POWER needs O, W, E, R side by side in one row. Row 4 contains W (C1), R (C2), O (C3) and E (C4), so the order is <b>C3 C1 C4 C2</b>, with C2 last as predicted. The P should end the row above: row 3 in that order reads E I S P. ✔` +
              grid([2, 0, 3, 1], ['C3', 'C1', 'C4', 'C2']) },
          { t: 'Read across the rows', h: `<div class="mono big">${CB.columnarDecode(r.cipher, [3, 1, 4, 2])}</div>` + note('KNOWLEDGE IS POWER AND PRACTICE IS THE KEY (X is padding).') }
        ]
      };
    },
    tips: ['Cut paper strips, one per column, and slide them around. The Practice workspace lets you drag columns.',
      'Trying every order is impractical for large n. Use the crib and letter pairs to narrow it down.'],
    pitfalls: ['Reading the columns in the wrong direction. Columns always read top to bottom.']
  };

  /* ----------------------------- NIHILIST ---------------------------- */
  L.nihilist = {
    id: 'nihilist', name: 'Nihilist Substitution', family: 'Polybius Square', icon: '5×5',
    usage: { regional: 'Decode (both keys given)', state: 'Cryptanalysis (crib given)' },
    summary: 'Turn letters into Polybius square numbers, then add the numbers of a repeating keyword.',
    history: `<p>Named after the Russian <b>Nihilist</b> revolutionaries of the 1880s, who used it against the Tsar’s
      police. The underlying <b>Polybius square</b> goes back to the Greek historian Polybius (about 150 BC), who
      proposed it for signaling with torches.</p>`,
    how: `<p>1. Build a 5×5 square from a keyword (I and J share a cell): the keyword letters without repeats, then the rest of the alphabet.
      2. Each letter becomes <b>row digit, column digit</b> (11 to 55).
      3. Repeat a second keyword over the plaintext and turn it into numbers the same way.
      4. Ciphertext = plaintext number + key number. Values range from 22 to 110.</p>`,
    strategy: [
      '<b>Decode:</b> build the square, write the key numbers under the ciphertext, subtract, and look up each row/column.',
      '<b>Find the key length:</b> for a guessed length L, look at every L-th number. The last digits of those numbers can only take 5 values (one per column), and the tens digits can only take 5 values (one per row). The right L never shows more than 5 different values.',
      'The spread of those digits also tells you the key’s row and column, for example that the key digit is 3 in the last place.',
      'Subtract the crib values to get the key numbers, then reason about the square: the keyword fills the first cells and the rest of the alphabet follows in order.',
      'Watch the borrows: 102 − 34 = 68.'
    ],
    example() {
      const r = CB.nihilistEncode('SECRETCODE', 'SCIENCE', 'MAP');
      const g = r.square.grid;
      const sq = table([['', '1', '2', '3', '4', '5'], ...g.map((row, i) => [String(i + 1), ...row.map(c => (c === 'I' ? 'I/J' : c))])], { head: true, side: true, cls: 'mono small' });
      const kv = r.numbers.map((_, i) => r.keyValues[i % 3]);
      return {
        intro: `Decode <span class="mono">${r.numbers.join(' ')}</span>. Polybius key: <b>SCIENCE</b>. Keyword: <b>MAP</b>.`,
        steps: [
          { t: 'Build the square', h: `SCIENCE without repeats is SCIEN, followed by the rest of the alphabet (J shares a cell with I):` + sq },
          { t: 'Keyword numbers', h: `M is row 3, column 4 → <b>34</b>. A → <b>21</b>. P → <b>41</b>.` },
          { t: 'Subtract', h: table([['Cipher', ...r.numbers], ['Key', ...kv], ['Diff', ...r.plainValues]], { side: true, cls: 'mono small' }) },
          { t: 'Look up row/column', h: table([['Diff', ...r.plainValues], ['Letter', ...r.plainValues.map(v => g[Math.floor(v / 10) - 1][v % 10 - 1])]], { side: true, cls: 'mono small' }) + note('SECRET CODE') }
        ]
      };
    },
    tips: ['Write the key numbers in a different color so you do not subtract the wrong line.',
      'Every difference must have both digits from 1 to 5. A 0 or a 6 means you made an arithmetic mistake.'],
    pitfalls: ['Forgetting that I and J share a cell.', 'Numbering the square from 0 instead of 1.']
  };

  /* --------------------------- CHECKERBOARD -------------------------- */
  L.checkerboard = {
    id: 'checkerboard', name: 'Checkerboard', family: 'Polybius Square', icon: '▦',
    usage: { regional: 'Decode (Polybius key given)', state: 'Decode + Cryptanalysis' },
    summary: 'A Polybius square whose rows and columns are labeled by two 5-letter words. Each letter becomes a pair of letters.',
    history: `<p>Using letters instead of numbers for the Polybius coordinates is a famous idea. The German
      <b>ADFGX</b> cipher of 1918 labeled its square with A, D, F, G and X because those letters are easy to tell apart
      in Morse. The ACA “Checkerboard” uses two 5-letter keywords as labels.</p>`,
    how: `<p>1. Build a 5×5 keyword square (I/J share a cell).
      2. Label the rows with one 5-letter word and the columns with another.
      3. Each plaintext letter becomes <b>row label + column label</b>, so the ciphertext is twice as long as the plaintext.</p>`,
    strategy: [
      'Collect the distinct <b>first</b> letters of the pairs. They are the row word’s five letters. Anagram them. For example, K C R I B gives BRICK.',
      'Do the same with the <b>second</b> letters to get the column word.',
      'If several anagrams are possible, decode a few pairs with each option and keep the one that gives English.',
      'Decode mode: fill in the square from the given Polybius key, then read each pair.',
      'Cryptanalysis: place the crib letters in the square cells their pairs point to. The keyword letters come first and the alphabet runs in order after them, so fill the gaps.',
      'You can also treat each pair as one symbol and solve it like an Aristocrat.'
    ],
    example() {
      const pt = CB.lettersOnly(CB.normalize('The quick brown fox jumps over the lazy dog'));
      const r = CB.checkerboardEncode(pt, 'OLYMPIAD', 'BRICK', 'PLANT');
      const g = r.square.grid;
      const rowsL = [...new Set(r.pairs.map(p => p[0]))].join(' ');
      const colsL = [...new Set(r.pairs.map(p => p[1]))].join(' ');
      const sq = table([['', ...'PLANT'], ...g.map((row, i) => ['BRICK'[i], ...row.map(c => (c === 'I' ? 'I/J' : c))])], { head: true, side: true, cls: 'mono small' });
      return {
        intro: `Decode this Checkerboard. Polybius key: <b>OLYMPIAD</b>.<div class="mono">${r.pairs.join(' ')}</div>`,
        steps: [
          { t: 'Collect the row letters', h: `First letters: <span class="mono">${rowsL}</span>. Anagram them to <b>BRICK</b>.` },
          { t: 'Collect the column letters', h: `Second letters: <span class="mono">${colsL}</span>. Anagram them to <b>PLANT</b>.` },
          { t: 'Build the square', h: `OLYMPIAD has no repeated letters, so the square starts O L Y M P I A D, then the rest of the alphabet (skipping J):` + sq },
          { t: 'Decode each pair', h: `CT = row C, column T = <b>${g[3][4]}</b>. IN = row I, column N = <b>${g[2][3]}</b> …` +
              `<div class="mono">${pt}</div>` + note('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG uses every letter, so all five row and column letters appear.') }
        ]
      };
    },
    tips: ['Anagram practice (Games → Anagram Blitz) pays off here.',
      'The row word and the column word can share letters (for example ALERT and LATER).'],
    pitfalls: ['Swapping row and column. The first letter is always the row.']
  };

  /* ---------------------------- HOMOPHONIC --------------------------- */
  L.homophonic = {
    id: 'homophonic', name: 'Homophonic', family: 'Homophonic Substitution', icon: '#4',
    usage: { regional: 'Cryptanalysis (crib given)', state: 'Cryptanalysis + Decode' },
    summary: 'New for 2026–27. Every letter has four possible numbers, which flattens the letter frequencies.',
    history: `<p>“Homophones” are several cipher symbols that sound alike, meaning they stand for the same letter.
      Italian secretaries used them as early as <b>1401</b> (a Mantuan cipher) to defeat frequency analysis. The
      mysterious <b>Beale ciphers</b> are a book-based homophonic system. Codebusters uses the <b>ACA version</b> with a
      single four-letter keyword that has four different letters.</p>`,
    how: `<p>Write the 25-letter alphabet (I and J share a cell). The keyword has four letters and creates four bands of numbers:
      1–25 start at keyword letter 1, 26–50 at letter 2, 51–75 at letter 3 and 76–100 at letter 4 (100 is written as 00).
      Inside each band the numbers run through the alphabet and wrap from Z to A. Each plaintext letter can be encoded as
      <b>any</b> of its four numbers.</p>`,
    strategy: [
      'Every number tells you its band: 1–25 → keyword letter 1, 26–50 → letter 2, 51–75 → letter 3, 76–00 → letter 4.',
      'One known (number, letter) pair unlocks the <b>entire band</b>. Put the letter under the number and count along the alphabet, or count back to the start of the band to find the keyword letter.',
      'Place the crib first. Each crib letter can unlock a whole band.',
      'Once 2–3 bands are known, look for partial words. The last keyword letter usually falls out quickly.',
      'The keyword is a real four-letter word (WORK, MATH …), so a couple of known letters let you guess the rest.'
    ],
    example() {
      const nums = [38, 45, 69, 16, 30, 74, 7, 81, 98, 10, 62, 42, 25, 66, 19];
      const pt = 'NUMBERSNEVERLIE';
      const t = CB.homophonicTable('MATH');
      const ok = nums.every((n, i) => t.byNumber[n] === pt[i]);
      const band = s => table([[...Array.from({ length: 25 }, (_, i) => CB.homNum(s * 25 + i + 1))],
        [...Array.from({ length: 25 }, (_, i) => t.byNumber[s * 25 + i + 1])]], { cls: 'mono small' });
      return {
        intro: `Crib: the message starts with <b>NUMBERS</b>.<div class="mono big">${nums.map(CB.homNum).join(' ')}</div>${ok ? '' : '<b>(data check failed)</b>'}`,
        steps: [
          { t: 'Place the crib and note the bands', h: table([['Number', ...nums.slice(0, 7)], ['Band', ...nums.slice(0, 7).map(n => Math.ceil(n / 25))], ['Plain', ...'NUMBERS']], { side: true, cls: 'mono small' }) },
          { t: 'Unlock band 1 from B=16', h: `16 is the 16th number in band 1. Counting back 15 letters from B (in the 25-letter alphabet) lands on <b>M</b>, so band 1 starts at M:` + band(0) },
          { t: 'Bands 2 and 3', h: `N=38 is 13th in band 2, so band 2 starts at <b>A</b>. M=69 is 19th in band 3, so band 3 starts at <b>T</b>.` + band(1) + band(2) },
          { t: 'Decode what you can', h: `The numbers 10, 62, 42, 25, 66, 19 become V E R L I E, so the text reads NUMBERS ?? VERLIE. That is <b>NEVER LIE</b>, so 81 = N and 98 = E, and band 4 starts at <b>H</b>.` + band(3) + note('The keyword is MATH. NUMBERS NEVER LIE.') }
        ]
      };
    },
    tips: ['Write each band as a row of 25 numbers with the alphabet below it. Filling in one letter fills in the whole row.',
      'Numbers 1–25 are the easiest to spot, so start with any crib letter that uses one.'],
    pitfalls: ['Forgetting that I and J share a slot (25 letters, not 26).', 'Treating 00 as 0. It is 100, in the last band.']
  };

  /* ======================================================================
     Order and grouping for the library
     ====================================================================== */
  const ORDER = ['atbash', 'caesar', 'aristocrat', 'patristocrat', 'xenocrypt', 'baconian', 'porta',
    'fracmorse', 'cryptarithm', 'columnar', 'nihilist', 'checkerboard', 'homophonic'];

  root.LESSONS = { L, ORDER, helpers: { pair, partial, table, replRow } };
})(typeof window !== 'undefined' ? window : globalThis);
