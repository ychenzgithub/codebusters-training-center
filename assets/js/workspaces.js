/* ==========================================================================
   Codebusters Training Center — interactive solving workspaces
   WS.create(problem, ctx) -> { el, getAnswer(), countErrors(), mark(wrongIdx),
                                hint(), reveal(), clear() }
   ========================================================================== */
(function (root) {
  'use strict';
  const CB = root.CB;

  /* ---------------- DOM helper ---------------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
    return el;
  }
  const up = s => (s || '').toUpperCase();
  function letterInput(extra) {
    return h('input', Object.assign({
      class: 'pt', maxlength: 2, autocomplete: 'off', autocapitalize: 'characters',
      spellcheck: 'false', inputmode: 'text'
    }, extra || {}));
  }
  // Last typed character, upper-cased
  function typed(input) { const v = up(input.value); return v ? v[v.length - 1] : ''; }
  function eqNorm(type) {
    if (type === 'baconian') return c => (c === 'J' ? 'I' : c === 'V' ? 'U' : c);
    if (['nihilist', 'checkerboard', 'homophonic'].includes(type)) return c => (c === 'J' ? 'I' : c);
    return c => c;
  }
  function defaultErrors(p, user) {
    const norm = eqNorm(p.type);
    const wrong = [];
    for (let i = 0; i < p.answer.length; i++) {
      const u = user[i] ? norm(user[i]) : '';
      if (u !== norm(p.answer[i])) wrong.push(i);
    }
    return { errors: wrong.length, wrong };
  }
  // Keyboard navigation over an ordered list of inputs
  function navigable(list, getList) {
    const L = () => (getList ? getList() : list);
    return function (e) {
      const arr = L(), i = arr.indexOf(e.target);
      if (i < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter' || (e.key === ' ' && !e.target.dataset.allowSpace)) { e.preventDefault(); arr[Math.min(arr.length - 1, i + 1)].focus(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); arr[Math.max(0, i - 1)].focus(); }
      else if (e.key === 'Backspace' && !e.target.value) { e.preventDefault(); if (i > 0) { arr[i - 1].focus(); } }
    };
  }
  function panel(title, body, open) {
    const d = h('details', { class: 'tool', open: open ? true : null }, h('summary', null, title), h('div', { class: 'tool-body' }, body));
    return d;
  }
  function polybiusEditor(onChange, opts) {
    opts = opts || {};
    const cells = [];
    const grid = h('table', { class: 'poly-edit' });
    const headRow = h('tr', null, h('th', null, ''));
    const colHeads = [];
    for (let c = 0; c < 5; c++) {
      const th = h('th', null, opts.colLabels ? '' : String(c + 1));
      colHeads.push(th); headRow.append(th);
    }
    grid.append(headRow);
    const rowHeads = [];
    for (let r = 0; r < 5; r++) {
      const th = h('th', null, opts.rowLabels ? '' : String(r + 1));
      rowHeads.push(th);
      const tr = h('tr', null, th);
      for (let c = 0; c < 5; c++) {
        const inp = letterInput({ class: 'pt sq', 'aria-label': `row ${r + 1} column ${c + 1}` });
        inp.addEventListener('input', () => { let v = typed(inp); if (v === 'J') v = 'I'; inp.value = /[A-Z]/.test(v) ? v : ''; markDup(); onChange(); });
        cells.push(inp);
        tr.append(h('td', null, inp));
      }
      grid.append(tr);
    }
    grid.addEventListener('keydown', navigable(cells));
    function markDup() {
      const seen = {};
      cells.forEach(c => { if (c.value) (seen[c.value] = seen[c.value] || []).push(c); });
      cells.forEach(c => c.classList.toggle('dup', !!(c.value && seen[c.value].length > 1)));
    }
    const kw = h('input', { class: 'txt', placeholder: 'keyword', autocomplete: 'off', spellcheck: 'false' });
    const fill = h('button', {
      class: 'btn sm', type: 'button', onclick: () => {
        if (!kw.value.trim()) return;
        const a = CB.keyedAlphabet(kw.value, CB.ALPHA25);
        cells.forEach((c, i) => (c.value = a[i]));
        markDup(); onChange();
      }
    }, 'Fill square from keyword');
    const clr = h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { cells.forEach(c => (c.value = '')); markDup(); onChange(); } }, 'Clear');
    const el = h('div', { class: 'poly-wrap' }, grid, h('div', { class: 'row gap' }, kw, fill, clr));
    return {
      el, cells, rowHeads, colHeads,
      get(r, c) { return cells[r * 5 + c].value; },
      set(r, c, v) { cells[r * 5 + c].value = v; markDup(); },
      find(letter) { const i = cells.findIndex(x => x.value === letter); return i < 0 ? null : [Math.floor(i / 5), i % 5]; },
      setAll(grid2) { grid2.forEach((row, r) => row.forEach((v, c) => (cells[r * 5 + c].value = v))); markDup(); }
    };
  }

  /* ======================================================================
     1. Substitution-style workspace (unit -> letter)
        Aristocrat, Patristocrat, Xenocrypt, Caesar, Atbash, Checkerboard, Homophonic
     ====================================================================== */
  function SubstWS(p, ctx) {
    const plainAlpha = p.type === 'xenocrypt' ? CB.ES_ALPHA : CB.ALPHA;
    const j2i = ['checkerboard', 'homophonic'].includes(p.type);
    const map = {};
    const cells = [];
    const byUnit = {};
    const bandInputs = {}, bandKey = [];
    let autoBand = false, lastFocused = null;
    const el = h('div', { class: 'ws ws-subst' });
    const block = h('div', { class: 'cipher-block' + (['homophonic', 'checkerboard'].includes(p.type) ? ' units-wide' : '') });
    let word = h('span', { class: 'word' });
    let pos = 0;
    p.units.forEach(t => {
      if (t.sep !== undefined) {
        if (t.sep === ' ') { if (word.childNodes.length) block.append(word); word = h('span', { class: 'word' }); }
        else word.append(h('span', { class: 'cell punct' }, h('span', { class: 'ct' }, t.sep), h('span', { class: 'pt-static' }, t.sep)));
        return;
      }
      const inp = letterInput({ 'aria-label': 'plaintext for ' + t.u });
      const cell = h('span', { class: 'cell' }, h('span', { class: 'ct' }, t.u), inp);
      const c = { unit: t.u, input: inp, el: cell, idx: pos++ };
      cells.push(c);
      (byUnit[t.u] = byUnit[t.u] || []).push(c);
      inp.addEventListener('focus', () => focusUnit(t.u));
      inp.addEventListener('input', () => {
        let v = typed(inp);
        if (j2i && v === 'J') v = 'I';
        if (v && plainAlpha.includes(v)) { set(t.u, v); const nx = cells[c.idx + 1]; if (nx) nx.input.focus(); }
        else { inp.value = map[t.u] || ''; }
      });
      inp.addEventListener('keydown', e => {
        if ((e.key === 'Backspace' || e.key === 'Delete') && inp.value) { e.preventDefault(); set(t.u, null); }
      });
      word.append(cell);
    });
    if (word.childNodes.length) block.append(word);
    block.addEventListener('keydown', navigable(null, () => cells.map(c => c.input)));
    el.append(block);

    const units = Object.keys(byUnit);
    const counts = {};
    units.forEach(u => (counts[u] = byUnit[u].length));

    /* ---- frequency / replacement table ---- */
    const freqInputs = {};
    function freqTable() {
      const isLetters = !['checkerboard', 'homophonic'].includes(p.type);
      let cols;
      if (isLetters) cols = Array.from(p.alpha || CB.ALPHA);
      else cols = units.slice().sort((a, b) => counts[b] - counts[a] || (a < b ? -1 : 1));
      const t = h('table', { class: 'freq' });
      const r1 = h('tr', null, h('th', null, 'Cipher'));
      const r2 = h('tr', null, h('th', null, 'Freq'));
      const r3 = h('tr', null, h('th', null, 'Replacement'));
      cols.forEach(u => {
        r1.append(h('td', { class: 'mono' }, u));
        r2.append(h('td', { class: 'cnt' }, counts[u] ? String(counts[u]) : ''));
        const inp = letterInput({ 'aria-label': 'replacement for ' + u });
        if (!counts[u]) inp.disabled = true;
        inp.addEventListener('input', () => {
          let v = typed(inp); if (j2i && v === 'J') v = 'I';
          if (v && plainAlpha.includes(v)) set(u, v); else inp.value = map[u] || '';
        });
        inp.addEventListener('keydown', e => { if ((e.key === 'Backspace' || e.key === 'Delete') && inp.value) { e.preventDefault(); set(u, null); } });
        inp.addEventListener('focus', () => focusUnit(u));
        freqInputs[u] = inp;
        r3.append(h('td', null, inp));
      });
      t.append(r1, r2, r3);
      const list = Object.values(freqInputs).filter(i => !i.disabled);
      t.addEventListener('keydown', navigable(list));
      return h('div', { class: 'freq-wrap' }, t);
    }
    if (p.type !== 'homophonic') el.append(freqTable());

    /* ---- plaintext alphabet usage ---- */
    const usage = h('div', { class: 'usage mono', title: 'Plaintext letters you have used' });
    el.append(h('div', { class: 'usage-row' }, h('span', { class: 'muted small' }, 'Used plaintext letters: '), usage));

    /* ---- type-specific tools ---- */
    const tools = h('div', { class: 'tools' });
    if (p.type === 'xenocrypt') {
      tools.append(h('div', { class: 'row gap' },
        h('button', { class: 'btn sm', type: 'button', onmousedown: e => e.preventDefault(), onclick: () => insertLetter('Ñ') }, 'Type Ñ'),
        h('span', { class: 'muted small' }, 'Tip: you can also type “;” in a box to enter Ñ.')));
    }
    if (p.type === 'caesar') tools.append(caesarTool());
    if (p.type === 'atbash') tools.append(panel('Atbash fold', h('div', { class: 'alpha-pair mono' }, h('div', null, 'A B C D E F G H I J K L M'), h('div', null, 'Z Y X W V U T S R Q P O N'))));
    if (p.type === 'checkerboard') tools.append(checkerTool());
    if (p.type === 'homophonic') tools.append(homophonicTool());
    el.append(tools);

    function focusUnit(u) {
      lastFocused = u;
      cells.forEach(c => c.el.classList.toggle('same', c.unit === u));
      Object.keys(freqInputs).forEach(k => freqInputs[k].parentElement.classList.toggle('same', k === u));
    }
    function insertLetter(L) {
      const u = lastFocused;
      if (u) set(u, L);
    }
    // semicolon shortcut for Ñ
    if (p.type === 'xenocrypt') el.addEventListener('keydown', e => {
      if (e.key === ';' && e.target.classList.contains('pt')) {
        e.preventDefault();
        const c = cells.find(x => x.input === e.target);
        if (c) set(c.unit, 'Ñ');
        else { const u = Object.keys(freqInputs).find(k => freqInputs[k] === e.target); if (u) set(u, 'Ñ'); }
      }
    });

    function set(u, v) {
      if (v) map[u] = v; else delete map[u];
      (byUnit[u] || []).forEach(c => { c.input.value = v || ''; c.el.classList.remove('wrong', 'hinted'); });
      if (freqInputs[u]) freqInputs[u].value = v || '';
      if (bandInputs[u]) bandInputs[u].value = v || '';
      refresh();
      if (v && autoBand && p.type === 'homophonic') extendBand(u, v);
      ctx.onChange && ctx.onChange();
    }
    function refresh() {
      const used = {};
      Object.keys(map).forEach(u => (used[map[u]] = (used[map[u]] || 0) + 1));
      const dupLetters = new Set(Object.keys(used).filter(k => used[k] > 1));
      cells.forEach(c => c.el.classList.toggle('dup', !!(map[c.unit] && dupLetters.has(map[c.unit]) && p.type !== 'homophonic')));
      usage.innerHTML = '';
      Array.from(plainAlpha).forEach(L => {
        if (j2i && L === 'J') return;
        usage.append(h('span', { class: used[L] ? (dupLetters.has(L) && p.type !== 'homophonic' ? 'u dup' : 'u on') : 'u' }, L));
      });
    }

    /* ---- Caesar shift explorer ---- */
    function caesarTool() {
      const out = h('div', { class: 'alpha-pair mono' });
      const lab = h('b', null, '1');
      const slider = h('input', { type: 'range', min: 1, max: 25, value: 1 });
      function draw() {
        const k = +slider.value; lab.textContent = String(k);
        out.innerHTML = '';
        out.append(h('div', null, 'Cipher: ' + CB.ALPHA.split('').join(' ')), h('div', null, 'Plain : ' + CB.caesar(CB.ALPHA, -k).split('').join(' ')));
      }
      slider.addEventListener('input', draw); draw();
      const apply = h('button', {
        class: 'btn sm', type: 'button', onclick: () => {
          const k = +slider.value;
          units.forEach(u => set(u, CB.caesar(u, -k)));
        }
      }, 'Apply this shift');
      return panel('Shift explorer (decode = shift back)', h('div', null, h('div', { class: 'row gap' }, 'Shift back by ', lab, slider, apply), out));
    }

    /* ---- Checkerboard helper ---- */
    function checkerTool() {
      const rowsL = [...new Set(p.pairs.map(x => x[0]))].sort().join(' ');
      const colsL = [...new Set(p.pairs.map(x => x[1]))].sort().join(' ');
      const rk = h('input', { class: 'txt', maxlength: 5, placeholder: 'row word', spellcheck: 'false' });
      const ck = h('input', { class: 'txt', maxlength: 5, placeholder: 'column word', spellcheck: 'false' });
      const pe = polybiusEditor(() => { }, { rowLabels: true, colLabels: true });
      function labels() {
        const r = up(rk.value), c = up(ck.value);
        pe.rowHeads.forEach((th, i) => (th.textContent = r[i] || ''));
        pe.colHeads.forEach((th, i) => (th.textContent = c[i] || ''));
      }
      rk.addEventListener('input', labels); ck.addEventListener('input', labels);
      const apply = h('button', {
        class: 'btn sm', type: 'button', onclick: () => {
          const r = up(rk.value), c = up(ck.value);
          units.forEach(u => {
            const ri = r.indexOf(u[0]), ci = c.indexOf(u[1]);
            if (ri >= 0 && ci >= 0) { const v = pe.get(ri, ci); if (v) set(u, v); }
          });
        }
      }, 'Apply square to the answer');
      return panel('Polybius square builder', h('div', null,
        h('p', { class: 'small' }, 'Row letters found: ', h('b', { class: 'mono' }, rowsL), ' · Column letters found: ', h('b', { class: 'mono' }, colsL), '. Anagram each set into a 5-letter word.'),
        h('div', { class: 'row gap' }, 'Rows: ', rk, ' Columns: ', ck), pe.el, apply), true);
    }

    /* ---- Homophonic band tool ---- */
    function extendBand(u, v) {
      const n = u === '00' ? 100 : +u;
      const b = Math.floor((n - 1) / 25), off = (n - 1) % 25;
      const start = (CB.ALPHA25.indexOf(v) - off + 25) % 25;
      bandKey[b].value = CB.ALPHA25[start];
      fillBand(b, CB.ALPHA25[start], true);
    }
    function fillBand(b, L, silent) {
      const start = CB.ALPHA25.indexOf(L);
      if (start < 0) return;
      for (let i = 0; i < 25; i++) {
        const num = CB.homNum(b * 25 + i + 1);
        const letter = CB.ALPHA25[(start + i) % 25];
        if (byUnit[num]) {
          map[num] = letter;
          byUnit[num].forEach(c => { c.input.value = letter; c.el.classList.remove('wrong'); });
        }
        if (bandInputs[num]) bandInputs[num].value = letter;
      }
      refresh();
      if (!silent) ctx.onChange && ctx.onChange();
    }
    function homophonicTool() {
      const wrap = h('div', { class: 'bands' });
      for (let b = 0; b < 4; b++) {
        const kin = letterInput({ class: 'pt key', 'aria-label': `keyword letter ${b + 1}` });
        kin.addEventListener('input', () => { let v = typed(kin); if (v === 'J') v = 'I'; kin.value = CB.ALPHA25.includes(v) ? v : ''; if (kin.value) fillBand(b, kin.value); });
        bandKey.push(kin);
        const t = h('table', { class: 'band' });
        const r1 = h('tr'), r2 = h('tr'), r3 = h('tr');
        for (let i = 0; i < 25; i++) {
          const num = CB.homNum(b * 25 + i + 1);
          r1.append(h('td', { class: 'mono' + (byUnit[num] ? ' present' : '') }, num));
          r2.append(h('td', { class: 'cnt' }, counts[num] ? String(counts[num]) : ''));
          const inp = letterInput({ 'aria-label': 'letter for ' + num });
          inp.addEventListener('input', () => { let v = typed(inp); if (v === 'J') v = 'I'; if (v && CB.ALPHA25.includes(v)) { if (byUnit[num]) set(num, v); else inp.value = v; } else inp.value = map[num] || ''; });
          inp.addEventListener('focus', () => focusUnit(num));
          bandInputs[num] = inp;
          r3.append(h('td', null, inp));
        }
        t.append(r1, r2, r3);
        wrap.append(h('div', { class: 'band-row' },
          h('div', { class: 'band-label' }, h('b', null, `Band ${b + 1}`), h('span', { class: 'muted small' }, `${b * 25 + 1}–${b === 3 ? '00' : (b + 1) * 25}`), h('label', { class: 'small' }, 'Key letter ', kin)),
          h('div', { class: 'band-scroll' }, t)));
      }
      const auto = h('input', { type: 'checkbox' });
      auto.addEventListener('change', () => (autoBand = auto.checked));
      return panel('Band table (keyword letters → all numbers)', h('div', null,
        h('p', { class: 'small' }, 'Type a key letter to fill a whole band, or type letters under individual numbers. Numbers shown in bold appear in the cipher.'),
        wrap, h('label', { class: 'small' }, auto, ' Training wheels: typing a letter in the answer also fills its whole band')), true);
    }

    refresh();
    return {
      el,
      getAnswer: () => cells.map(c => map[c.unit] || ''),
      mark(wrong) { const s = new Set(wrong); cells.forEach(c => c.el.classList.toggle('wrong', s.has(c.idx))); },
      hint() {
        // Reveal the most frequent unit that is missing or wrong
        const cand = units.filter(u => map[u] !== solutionOf(u))
          .sort((a, b) => counts[b] - counts[a]);
        if (!cand.length) return 'Everything is already filled in correctly.';
        const u = cand[0];
        set(u, solutionOf(u));
        byUnit[u].forEach(c => c.el.classList.add('hinted'));
        return `Hint: ${u} → ${solutionOf(u)}`;
      },
      reveal() { units.forEach(u => set(u, solutionOf(u))); },
      clear() { units.forEach(u => set(u, null)); bandKey.forEach(k => (k.value = '')); }
    };
    function solutionOf(u) { return p.units.find(t => t.u === u).p; }
  }

  /* ======================================================================
     2. Porta workspace
     ====================================================================== */
  function PortaWS(p, ctx) {
    const ct = p.cipherLetters, n = ct.length;
    const el = h('div', { class: 'ws ws-poly' });
    const keyIn = [], plainIn = [], cols = [];
    let keyLen = p.key.length;
    const lenIn = h('input', { class: 'txt num', type: 'number', min: 1, max: 12, value: keyLen });
    lenIn.addEventListener('input', () => (keyLen = +lenIn.value || 0));
    const kw = h('input', { class: 'txt', placeholder: 'keyword', spellcheck: 'false' });
    const assist = h('input', { type: 'checkbox' });
    el.append(h('div', { class: 'row gap wrap ws-controls' },
      h('label', null, 'Key length ', lenIn),
      h('span', { class: 'muted small' }, '(typing a key letter repeats it every key-length letters)'),
      kw, h('button', { class: 'btn sm', type: 'button', onclick: () => { const k = CB.lettersOnly(up(kw.value)); if (!k) return; for (let i = 0; i < n; i++) setKey(i, k[i % k.length], true); lenIn.value = keyLen = k.length; update(); } }, 'Fill key row'),
      h('label', { class: 'small' }, assist, ' Show table lookups as grey hints')));
    assist.addEventListener('change', update);

    const grid = h('div', { class: 'poly-grid' });
    for (let i = 0; i < n; i++) {
      if (i && i % 5 === 0) grid.append(h('span', { class: 'gap5' }));
      const k = letterInput({ class: 'pt key', 'aria-label': 'key letter ' + (i + 1) });
      const pt = letterInput({ 'aria-label': 'plaintext ' + (i + 1) });
      k.addEventListener('input', () => { const v = typed(k); if (/[A-Z]/.test(v)) { setKey(i, v); k.blur(); pt.focus(); } else k.value = ''; update(); });
      k.addEventListener('focus', () => highlight(i));
      pt.addEventListener('focus', () => highlight(i));
      pt.addEventListener('input', () => { const v = typed(pt); pt.value = /[A-Z]/.test(v) ? v : ''; pt.parentElement.classList.remove('wrong'); if (pt.value && plainIn[i + 1]) plainIn[i + 1].focus(); ctx.onChange && ctx.onChange(); });
      const col = h('span', { class: 'pcol' }, k, h('span', { class: 'ct' }, ct[i]), pt);
      keyIn.push(k); plainIn.push(pt); cols.push(col);
      grid.append(col);
    }
    grid.addEventListener('keydown', e => {
      if (plainIn.includes(e.target)) navigable(plainIn)(e);
    });
    el.append(grid);
    if (p.crib) {
      for (let i = 0; i < p.crib.text.length; i++) cols[p.crib.start + i].classList.add('crib');
    }

    // Porta table with highlighting
    const tbl = h('table', { class: 'porta-table mono' });
    const head = h('tr', null, h('th', null, 'Key'));
    Array.from('ABCDEFGHIJKLM').forEach(c => head.append(h('th', null, c)));
    tbl.append(head);
    const rowsEl = CB.portaTable().map(r => {
      const tr = h('tr', null, h('th', null, r.label));
      r.cells.forEach(c => tr.append(h('td', null, c)));
      tbl.append(tr);
      return tr;
    });
    el.append(panel('Porta table (ACA)', h('div', { class: 'table-scroll' }, tbl), true));

    function setKey(i, v, silent) {
      if (keyLen > 0) { for (let j = i % keyLen; j < n; j += keyLen) keyIn[j].value = v; }
      else keyIn[i].value = v;
      if (!silent) update();
    }
    function highlight(i) {
      cols.forEach((c, j) => c.classList.toggle('same', keyLen > 0 && j % keyLen === i % keyLen));
      rowsEl.forEach(r => { r.classList.remove('hl-row'); r.querySelectorAll('td,th').forEach(x => x.classList.remove('hl', 'hlx')); });
      tbl.rows[0].querySelectorAll('th').forEach(x => x.classList.remove('hlx'));
      const k = keyIn[i].value;
      if (!k) return;
      const row = rowsEl[CB.portaRow(k)];
      row.classList.add('hl-row');
      row.querySelectorAll('td,th').forEach(x => x.classList.add('hl'));
      const c = ct[i];
      const idx = CB.ALPHA.indexOf(c);
      let col;
      if (idx < 13) col = idx; else col = Array.from(row.querySelectorAll('td')).findIndex(td => td.textContent === c);
      const td = row.querySelectorAll('td')[col];
      if (td) td.classList.add('hlx');
      const th = tbl.rows[0].cells[col + 1];
      if (th) th.classList.add('hlx');
    }
    function update() {
      for (let i = 0; i < n; i++) {
        const k = keyIn[i].value;
        plainIn[i].placeholder = assist.checked && k ? CB.portaChar(k, ct[i]) : '';
      }
      ctx.onChange && ctx.onChange();
    }
    return {
      el,
      getAnswer: () => plainIn.map((x, i) => x.value || (assist.checked ? x.placeholder : '') || ''),
      mark(wrong) { const s = new Set(wrong); cols.forEach((c, i) => c.classList.toggle('wrong', s.has(i))); },
      hint() {
        const i = keyIn.findIndex((k, j) => k.value !== p.key[j % p.key.length]);
        if (i < 0) {
          const j = plainIn.findIndex((x, t) => x.value !== p.answer[t]);
          if (j < 0) return 'Everything is already correct.';
          plainIn[j].value = p.answer[j]; return `Hint: letter ${j + 1} is ${p.answer[j]}`;
        }
        const save = keyLen; keyLen = p.key.length; setKey(i, p.key[i % p.key.length]); keyLen = save;
        return `Hint: the key letter at position ${(i % p.key.length) + 1} of the keyword is ${p.key[i % p.key.length]}`;
      },
      reveal() { for (let i = 0; i < n; i++) { keyIn[i].value = p.key[i % p.key.length]; plainIn[i].value = p.answer[i]; } update(); },
      clear() { keyIn.forEach(k => (k.value = '')); plainIn.forEach(x => (x.value = '')); update(); }
    };
  }

  /* ======================================================================
     3. Nihilist workspace
     ====================================================================== */
  function NihilistWS(p, ctx) {
    const nums = p.numbers, n = nums.length;
    const el = h('div', { class: 'ws ws-poly' });
    let keyLen = p.keyGiven ? p.key.length : 0;
    const lenIn = h('input', { class: 'txt num', type: 'number', min: 0, max: 12, value: keyLen || '' });
    lenIn.addEventListener('input', () => (keyLen = +lenIn.value || 0));
    const pe = polybiusEditor(update);
    const kw = h('input', { class: 'txt', placeholder: 'keyword', spellcheck: 'false' });
    const kvIn = [], diffEl = [], plainIn = [], cols = [];
    el.append(h('div', { class: 'row gap wrap ws-controls' },
      h('label', null, 'Key length ', lenIn), kw,
      h('button', {
        class: 'btn sm', type: 'button', onclick: () => {
          const k = CB.lettersOnly(up(kw.value).replace(/J/g, 'I')); if (!k) return;
          const vals = Array.from(k).map(c => { const f = pe.find(c); return f ? (f[0] + 1) * 10 + f[1] + 1 : ''; });
          if (vals.some(v => v === '')) { alert('Fill in the Polybius square first so the keyword letters can be converted to numbers.'); return; }
          lenIn.value = keyLen = k.length;
          for (let i = 0; i < n; i++) kvIn[i].value = vals[i % vals.length];
          update();
        }
      }, 'Keyword → key numbers')));
    const grid = h('div', { class: 'poly-grid nih' });
    for (let i = 0; i < n; i++) {
      const kv = h('input', { class: 'kv', maxlength: 2, inputmode: 'numeric', autocomplete: 'off', 'aria-label': 'key value ' + (i + 1) });
      const d = h('span', { class: 'diff' });
      const pt = letterInput({ 'aria-label': 'plaintext ' + (i + 1) });
      kv.addEventListener('input', () => {
        kv.value = kv.value.replace(/\D/g, '').slice(0, 2);
        if (kv.value.length === 2 && keyLen > 0) for (let j = i % keyLen; j < n; j += keyLen) kvIn[j].value = kv.value;
        update();
      });
      kv.addEventListener('focus', () => cols.forEach((c, j) => c.classList.toggle('same', keyLen > 0 && j % keyLen === i % keyLen)));
      pt.addEventListener('input', () => { let v = typed(pt); if (v === 'J') v = 'I'; pt.value = /[A-Z]/.test(v) ? v : ''; pt.parentElement.classList.remove('wrong'); ctx.onChange && ctx.onChange(); });
      const col = h('span', { class: 'pcol' }, h('span', { class: 'ct num' }, String(nums[i])), kv, d, pt);
      kvIn.push(kv); diffEl.push(d); plainIn.push(pt); cols.push(col);
      grid.append(col);
    }
    grid.addEventListener('keydown', e => { if (plainIn.includes(e.target)) navigable(plainIn)(e); });
    el.append(h('div', { class: 'legend small muted' }, 'Each column: cipher number · key number (you type) · difference · plaintext'), grid);
    if (p.crib) for (let i = 0; i < p.crib.text.length; i++) cols[p.crib.start + i].classList.add('crib');
    el.append(panel('Polybius square', pe.el, true));
    el.append(panel('Key-length finder (digit spread)', periodFinder(nums)));

    function update() {
      for (let i = 0; i < n; i++) {
        const kv = +kvIn[i].value;
        if (kvIn[i].value.length === 2) {
          const dv = nums[i] - kv;
          const ok = dv >= 11 && dv <= 55 && dv % 10 >= 1 && dv % 10 <= 5;
          diffEl[i].textContent = String(dv);
          diffEl[i].classList.toggle('bad', !ok);
          plainIn[i].placeholder = ok ? (pe.get(Math.floor(dv / 10) - 1, dv % 10 - 1) || '') : '';
        } else { diffEl[i].textContent = ''; plainIn[i].placeholder = ''; }
      }
      ctx.onChange && ctx.onChange();
    }
    return {
      el,
      getAnswer: () => plainIn.map(x => x.value || x.placeholder || ''),
      mark(wrong) { const s = new Set(wrong); cols.forEach((c, i) => c.classList.toggle('wrong', s.has(i))); },
      hint() {
        const i = kvIn.findIndex((k, j) => +k.value !== p.keyValues[j % p.keyValues.length]);
        if (i >= 0) {
          const L = p.keyValues.length;
          for (let j = i % L; j < n; j += L) kvIn[j].value = p.keyValues[j % L];
          update();
          return `Hint: key position ${(i % L) + 1} of ${L} has value ${p.keyValues[i % L]} (filled everywhere it repeats)`;
        }
        const r = p.square.findIndex(row => row.some((c, k) => c && pe.get(p.square.indexOf(row), k) !== c));
        if (r >= 0) { const c = p.square[r].findIndex((x, k) => pe.get(r, k) !== x); pe.set(r, c, p.square[r][c]); update(); return `Hint: square row ${r + 1}, column ${c + 1} is ${p.square[r][c]}`; }
        return 'Everything is already filled in.';
      },
      reveal() { pe.setAll(p.square); for (let i = 0; i < n; i++) { kvIn[i].value = p.keyValues[i % p.keyValues.length]; plainIn[i].value = ''; } lenIn.value = keyLen = p.keyValues.length; update(); },
      clear() { kvIn.forEach(k => (k.value = '')); plainIn.forEach(x => (x.value = '')); pe.cells.forEach(c => (c.value = '')); update(); }
    };
  }
  function periodFinder(nums) {
    const sel = h('select', { class: 'txt' });
    for (let L = 2; L <= 8; L++) sel.append(h('option', { value: L }, String(L)));
    const out = h('div');
    function draw() {
      const L = +sel.value;
      out.innerHTML = '';
      const mk = (label, f, range) => {
        const t = h('table', { class: 'freq period' });
        const head = h('tr', null, h('th', null, label));
        range.forEach(d => head.append(h('th', null, String(d))));
        head.append(h('th', null, '#'));
        t.append(head);
        for (let k = 0; k < L; k++) {
          const seen = new Set();
          for (let i = k; i < nums.length; i += L) seen.add(f(nums[i]));
          const tr = h('tr', null, h('th', null, 'K' + (k + 1)));
          range.forEach(d => tr.append(h('td', { class: seen.has(d) ? 'x' : '' }, seen.has(d) ? '✕' : '')));
          tr.append(h('td', { class: seen.size > 5 ? 'bad' : 'good' }, String(seen.size)));
          t.append(tr);
        }
        return t;
      };
      out.append(h('p', { class: 'small' }, 'For the correct key length, each key position shows at most 5 different ones digits and at most 5 different tens values. A count above 5 (red) rules that length out.'),
        h('div', { class: 'table-scroll' }, mk('Ones digit', x => x % 10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])),
        h('div', { class: 'table-scroll' }, mk('Tens (⌊n/10⌋)', x => Math.floor(x / 10), [2, 3, 4, 5, 6, 7, 8, 9, 10, 11])));
    }
    sel.addEventListener('change', draw); draw();
    return h('div', null, h('label', null, 'Try key length ', sel), out);
  }

  /* ======================================================================
     4. Baconian workspace
     ====================================================================== */
  function BaconianWS(p, ctx) {
    const el = h('div', { class: 'ws ws-bacon' });
    const assign = {}; // symbol -> 'A'|'B'
    let symbols;
    let groups; // array of arrays of tokens(symbols)
    if (p.layout === 'words') {
      groups = p.tokens.map(w => Array.from(w));
      symbols = Array.from(new Set(groups.flat())).sort();
    } else {
      groups = [];
      for (let i = 0; i < p.tokens.length; i += 5) groups.push(p.tokens.slice(i, i + 5));
      symbols = Array.from(new Set(p.tokens)).sort();
    }
    // Symbol assignment panel
    const symBtns = {};
    const symPanel = h('div', { class: 'sym-panel' });
    symbols.forEach(s => {
      const cnt = p.layout === 'words' ? groups.flat().filter(x => x === s).length : p.tokens.filter(x => x === s).length;
      const b = h('button', { class: 'sym', type: 'button', title: 'Click to cycle ? → A → B' },
        h('span', { class: 'sym-c' }, s), h('span', { class: 'sym-v' }, '?'), h('span', { class: 'sym-n' }, '×' + cnt));
      b.addEventListener('click', () => { assign[s] = assign[s] === 'A' ? 'B' : assign[s] === 'B' ? undefined : 'A'; draw(); });
      symBtns[s] = b; symPanel.append(b);
    });
    el.append(h('div', { class: 'small muted' }, p.layout === 'words'
      ? 'Assign each alphabet letter to A or B (click to cycle). Every word spells one 5-symbol code.'
      : 'Assign each symbol to A or B (click to cycle). Every 5 symbols spell one letter.'), symPanel);

    const rawToggle = h('input', { type: 'checkbox' });
    if (p.layout !== 'words') el.append(h('label', { class: 'small' }, rawToggle, ' Show the original ungrouped text'));
    const raw = h('div', { class: 'bacon-raw mono', style: { display: 'none' } }, p.tokens.join(''));
    rawToggle.addEventListener('change', () => (raw.style.display = rawToggle.checked ? '' : 'none'));
    el.append(raw);

    const grid = h('div', { class: 'bacon-grid' });
    const plainIn = [], codeEls = [], gEls = [];
    groups.forEach((g, gi) => {
      const syms = h('div', { class: 'b-syms mono' }, g.join(p.layout === 'words' ? '' : ''));
      const code = h('div', { class: 'b-code mono' });
      const pt = letterInput({ 'aria-label': 'letter ' + (gi + 1) });
      pt.addEventListener('input', () => { let v = typed(pt); if (v === 'J') v = 'I'; if (v === 'V') v = 'U'; pt.value = /[A-Z]/.test(v) ? v : ''; ge.classList.remove('wrong'); if (pt.value && plainIn[gi + 1]) plainIn[gi + 1].focus(); ctx.onChange && ctx.onChange(); });
      const ge = h('div', { class: 'b-group' + (p.layout === 'words' ? ' word' : '') }, syms, code, pt);
      grid.append(ge);
      plainIn.push(pt); codeEls.push(code); gEls.push(ge);
    });
    grid.addEventListener('keydown', navigable(plainIn));
    el.append(grid);
    el.append(panel('Baconian table (24 letters)', baconTable()));

    function draw() {
      symbols.forEach(s => {
        symBtns[s].querySelector('.sym-v').textContent = assign[s] || '?';
        symBtns[s].className = 'sym' + (assign[s] ? ' ' + assign[s].toLowerCase() : '');
      });
      groups.forEach((g, gi) => {
        const code = g.map(s => assign[s] || '?').join('');
        codeEls[gi].textContent = code;
        const L = /\?/.test(code) ? '' : CB.baconLetter(code);
        plainIn[gi].placeholder = L === '?' ? '' : L;
        codeEls[gi].classList.toggle('bad', L === '?');
      });
      ctx.onChange && ctx.onChange();
    }
    draw();
    return {
      el,
      getAnswer: () => plainIn.map(x => x.value || x.placeholder || ''),
      mark(wrong) { const s = new Set(wrong); gEls.forEach((g, i) => g.classList.toggle('wrong', s.has(i))); },
      hint() {
        const s = symbols.find(x => assign[x] !== p.abMap[x]);
        if (!s) return 'All symbols are already assigned correctly.';
        assign[s] = p.abMap[s]; draw();
        return `Hint: “${s}” stands for ${p.abMap[s]}`;
      },
      reveal() { symbols.forEach(s => (assign[s] = p.abMap[s])); plainIn.forEach(x => (x.value = '')); draw(); },
      clear() { symbols.forEach(s => delete assign[s]); plainIn.forEach(x => (x.value = '')); draw(); }
    };
  }
  function baconTable() {
    const rows = [];
    const L = CB.BACON_LETTERS;
    for (let r = 0; r < 6; r++) {
      const tr = [];
      for (let c = 0; c < 4; c++) {
        const i = c * 6 + r;
        tr.push(`<td class="mono">${CB.baconCode(L[i])}</td><th>${CB.baconDisplay(L[i])}</th>`);
      }
      rows.push('<tr>' + tr.join('') + '</tr>');
    }
    return h('div', { class: 'table-scroll', html: `<table class="bacon-table">${rows.join('')}</table>` });
  }

  /* ======================================================================
     5. Fractionated Morse workspace
     ====================================================================== */
  function FracMorseWS(p, ctx) {
    const ct = p.cipherLetters;
    const el = h('div', { class: 'ws ws-fm' });
    const tri = CB.FM_TRIGRAMS;
    const tInputs = [];
    const t = h('table', { class: 'fm-table' });
    const r0 = h('tr', null, h('th', null, 'Letter'));
    tri.forEach((tg, i) => {
      const inp = letterInput({ 'aria-label': 'letter for ' + CB.prettyMorse(tg) });
      inp.addEventListener('input', () => { const v = typed(inp); inp.value = /[A-Z]/.test(v) ? v : ''; update(); if (inp.value && tInputs[i + 1]) tInputs[i + 1].focus(); });
      tInputs.push(inp);
      r0.append(h('td', null, inp));
    });
    t.append(r0);
    for (let k = 0; k < 3; k++) {
      const tr = h('tr', null, h('th', null, String(k + 1)));
      tri.forEach(tg => tr.append(h('td', { class: 'fs' }, CB.prettyMorse(tg[k]))));
      t.append(tr);
    }
    t.addEventListener('keydown', navigable(tInputs));
    const kw = h('input', { class: 'txt', placeholder: 'keyword', spellcheck: 'false' });
    el.append(h('div', { class: 'row gap wrap ws-controls' }, kw,
      h('button', { class: 'btn sm', type: 'button', onclick: () => { if (!kw.value.trim()) return; const a = CB.keyedAlphabet(kw.value); tInputs.forEach((x, i) => (x.value = a[i])); update(); } }, 'Fill table from keyword'),
      h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { tInputs.forEach(x => (x.value = '')); update(); } }, 'Clear table')));
    el.append(h('div', { class: 'table-scroll' }, t));

    const cells = h('div', { class: 'fm-cells' });
    const cellEls = Array.from(ct).map((c, i) => {
      const e = h('div', { class: 'fm-cell' }, h('b', null, c), h('span', { class: 'm' }, '???'));
      cells.append(e);
      return e;
    });
    el.append(h('div', { class: 'small muted' }, 'Cipher letters with the Morse symbols they stand for:'), cells);
    const out = h('div', { class: 'fm-out' });
    el.append(h('div', { class: 'small muted' }, 'Decoded Morse stream (× = letter break, ×× = word break):'), out);

    const crib = h('input', { class: 'txt', placeholder: 'type a word', spellcheck: 'false' });
    const cribOut = h('span', { class: 'mono' });
    crib.addEventListener('input', () => { const s = CB.toMorseStream(crib.value); cribOut.textContent = s ? CB.prettyMorse(s) : ''; });
    el.append(panel('Crib → Morse converter', h('div', { class: 'row gap wrap' }, crib, cribOut), !p.keyGiven));
    el.append(panel('Morse code chart', morseChart()));

    function userMap() {
      const m = {};
      tInputs.forEach((x, i) => { if (x.value) m[x.value] = (m[x.value] || []).concat(i); });
      return m;
    }
    function update() {
      const m = userMap();
      tInputs.forEach(x => x.classList.toggle('dup', !!(x.value && m[x.value].length > 1)));
      let stream = '';
      Array.from(ct).forEach((c, i) => {
        const idx = m[c] && m[c].length === 1 ? m[c][0] : -1;
        const tg = idx >= 0 ? tri[idx] : '???';
        cellEls[i].querySelector('.m').textContent = idx >= 0 ? CB.prettyMorse(tg) : '???';
        cellEls[i].classList.toggle('known', idx >= 0);
        stream += tg;
      });
      // render decoded stream: split into words/letters; unknown symbols make '?'
      out.innerHTML = '';
      const words = stream.replace(/x+$/, '').split('xx');
      words.forEach((w, wi) => {
        const wEl = h('span', { class: 'fm-word' });
        w.split('x').filter(Boolean).forEach(code => {
          const L = /\?/.test(code) ? '?' : (CB.MORSE_INV[code] || '✗');
          wEl.append(h('span', { class: 'fm-letter' + (L === '?' ? ' unk' : L === '✗' ? ' bad' : '') }, h('span', { class: 'mono s' }, CB.prettyMorse(code)), h('b', null, L)));
        });
        out.append(wEl);
        if (wi < words.length - 1) out.append(h('span', { class: 'fm-sep' }, '/'));
      });
      ctx.onChange && ctx.onChange();
    }
    update();
    // Error counting: a plaintext letter is correct only if every cipher
    // letter covering its Morse (plus the separators around it) is mapped right.
    const spans = (() => {
      const s = p.stream, res = [];
      let i = 0;
      while (i < s.length) {
        if (s[i] === 'x') { i++; continue; }
        const st = i;
        while (i < s.length && s[i] !== 'x') i++;
        res.push([Math.max(0, st - 1), Math.min(s.length - 1, i)]);
      }
      return res;
    })();
    function cipherOK() {
      const m = userMap();
      return Array.from(ct).map(c => m[c] && m[c].length === 1 && p.alphabet[m[c][0]] === c);
    }
    return {
      el,
      getAnswer: () => {
        const ok = cipherOK();
        return spans.map((sp, k) => {
          for (let q = Math.floor(sp[0] / 3); q <= Math.floor(sp[1] / 3); q++) if (!ok[q]) return '';
          return p.answer[k];
        });
      },
      mark() {
        const ok = cipherOK();
        cellEls.forEach((e, i) => e.classList.toggle('wrong', !ok[i]));
      },
      hint() {
        const used = new Set(ct);
        const i = Array.from(p.alphabet).findIndex((c, k) => used.has(c) && tInputs[k].value !== c);
        if (i < 0) return 'All letters that appear in the cipher are placed correctly.';
        tInputs[i].value = p.alphabet[i]; update();
        return `Hint: ${p.alphabet[i]} = ${CB.prettyMorse(tri[i])}`;
      },
      reveal() { tInputs.forEach((x, i) => (x.value = p.alphabet[i])); update(); },
      clear() { tInputs.forEach(x => (x.value = '')); update(); }
    };
  }
  function morseChart() {
    const box = h('div', { class: 'morse-chart' });
    Object.keys(CB.MORSE).filter(k => /[A-Z]/.test(k)).forEach(k => box.append(h('span', null, h('b', null, k), ' ', h('span', { class: 'mono' }, CB.prettyMorse(CB.MORSE[k])))));
    return box;
  }

  /* ======================================================================
     6. Cryptarithm workspace
     ====================================================================== */
  function CryptarithmWS(p, ctx) {
    const el = h('div', { class: 'ws ws-crypt' });
    const letters = Array.from(new Set(p.addends.join('') + p.result)).sort();
    const dig = {}; // letter -> digit string
    const L = p.lines;
    const width = Math.max(L.top.length, L.mid.length, L.res.length) + 2;
    const eq = h('div', { class: 'crypt-eq mono' });
    function line(word, sign) {
      const row = h('div', { class: 'ceq-row' });
      const pad = width - word.length - 1;
      row.append(h('span', { class: 'ceq-sign' }, sign || ''));
      for (let i = 0; i < pad; i++) row.append(h('span', { class: 'ceq-cell empty' }));
      Array.from(word).forEach(ch => row.append(h('span', { class: 'ceq-cell', 'data-l': ch }, h('b', null, ch), h('i', null, ''))));
      return row;
    }
    eq.append(line(L.top), line(L.mid, L.sign), h('div', { class: 'ceq-bar' }), line(L.res));
    const status = h('div', { class: 'small' });
    el.append(h('div', { class: 'row gap wrap' }, eq, status));

    const asg = h('div', { class: 'crypt-assign' });
    const dIn = {};
    letters.forEach(ch => {
      const inp = h('input', { class: 'pt dig', maxlength: 1, inputmode: 'numeric', autocomplete: 'off', 'aria-label': 'digit for ' + ch });
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); dig[ch] = inp.value; update(); });
      dIn[ch] = inp;
      asg.append(h('label', { class: 'dcell' }, h('b', null, ch), inp));
    });
    asg.addEventListener('keydown', navigable(Object.values(dIn)));
    el.append(h('div', { class: 'small muted' }, 'Type the digit for each letter:'), asg);

    // elimination grid
    const g = h('table', { class: 'elim' });
    const head = h('tr', null, h('th', null, ''));
    for (let d = 0; d <= 9; d++) head.append(h('th', null, String(d)));
    g.append(head);
    letters.forEach(ch => {
      const tr = h('tr', null, h('th', null, ch));
      for (let d = 0; d <= 9; d++) {
        const td = h('td', { title: 'click: ✕ → ✓ → blank' });
        td.addEventListener('click', () => { td.textContent = td.textContent === '' ? '✕' : td.textContent === '✕' ? '✓' : ''; td.className = td.textContent === '✓' ? 'yes' : td.textContent === '✕' ? 'no' : ''; });
        tr.append(td);
      }
      g.append(tr);
    });
    el.append(panel('Elimination grid (scratch work)', h('div', { class: 'table-scroll' }, g), true));

    // answer row
    const ans = h('div', { class: 'crypt-ans' });
    const ansIn = p.answerDigits.map((d, i) => {
      const inp = letterInput({ 'aria-label': 'answer letter ' + (i + 1) });
      inp.addEventListener('input', () => { const v = typed(inp); inp.value = /[A-Z]/.test(v) ? v : ''; inp.parentElement.classList.remove('wrong'); ctx.onChange && ctx.onChange(); });
      ans.append(h('span', { class: 'cell' }, h('span', { class: 'ct' }, String(d)), inp));
      return inp;
    });
    el.append(h('div', { class: 'small muted' }, 'Answer: the letters for these digits'), ans);

    function update() {
      const byDigit = {};
      letters.forEach(ch => { if (dig[ch] !== undefined && dig[ch] !== '') (byDigit[dig[ch]] = byDigit[dig[ch]] || []).push(ch); });
      letters.forEach(ch => dIn[ch].classList.toggle('dup', !!(dig[ch] && byDigit[dig[ch]].length > 1)));
      eq.querySelectorAll('.ceq-cell[data-l]').forEach(c => (c.querySelector('i').textContent = dig[c.dataset.l] || ''));
      p.answerDigits.forEach((d, i) => { const ls = byDigit[String(d)]; ansIn[i].placeholder = ls && ls.length === 1 ? ls[0] : ''; });
      const full = letters.every(ch => dig[ch] !== undefined && dig[ch] !== '');
      if (full) {
        const val = w => Number(Array.from(w).map(c => dig[c]).join(''));
        const ok = val(p.addends[0]) + val(p.addends[1]) === val(p.result) && Object.values(byDigit).every(a => a.length === 1)
          && ![p.addends[0], p.addends[1], p.result].some(w => dig[w[0]] === '0');
        status.innerHTML = ok ? '<span class="good">✔ The arithmetic checks out.</span>' : '<span class="bad">✘ The digits do not satisfy the sum yet.</span>';
      } else status.textContent = '';
      ctx.onChange && ctx.onChange();
    }
    update();
    return {
      el,
      getAnswer: () => ansIn.map(x => x.value || x.placeholder || ''),
      mark(wrong) { const s = new Set(wrong); ansIn.forEach((x, i) => x.parentElement.classList.toggle('wrong', s.has(i))); },
      hint() {
        const ch = letters.find(c => String(p.solution[c]) !== dig[c]);
        if (!ch) return 'All digits are already correct.';
        dig[ch] = String(p.solution[ch]); dIn[ch].value = dig[ch]; update();
        return `Hint: ${ch} = ${p.solution[ch]}`;
      },
      reveal() { letters.forEach(c => { dig[c] = String(p.solution[c]); dIn[c].value = dig[c]; }); ansIn.forEach(x => (x.value = '')); update(); },
      clear() { letters.forEach(c => { dig[c] = ''; dIn[c].value = ''; }); ansIn.forEach(x => (x.value = '')); update(); }
    };
  }

  /* ======================================================================
     7. Complete Columnar workspace
     ====================================================================== */
  function ColumnarWS(p, ctx) {
    const ct = p.cipherLetters, len = ct.length;
    const el = h('div', { class: 'ws ws-col' });
    let n = 0, arrangement = []; // arrangement: list of chunk indices, left to right
    const btns = h('div', { class: 'row gap wrap' }, h('span', null, 'Number of columns: '));
    const divs = [];
    for (let k = 2; k <= Math.min(12, Math.floor(len / 2)); k++) if (len % k === 0) divs.push(k);
    divs.forEach(k => btns.append(h('button', { class: 'btn sm ghost', type: 'button', 'data-k': k, onclick: () => setN(k) }, String(k))));
    el.append(h('div', { class: 'cipher-line mono' }, p.cipher));
    el.append(h('p', { class: 'small muted' }, `${len} letters. Only column counts that divide ${len} are possible. Drag the column headers (or use ◀ ▶) to reorder.`), btns);
    const gridWrap = h('div', { class: 'col-grid-wrap' });
    const readout = h('div', { class: 'col-readout mono' });
    el.append(gridWrap, h('div', { class: 'small muted' }, 'Reading across the rows:'), readout);

    function chunks() {
      const rows = len / n;
      return Array.from({ length: n }, (_, i) => ct.slice(i * rows, i * rows + rows));
    }
    function setN(k) {
      n = k; arrangement = [...Array(n).keys()];
      btns.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.k === k));
      draw();
    }
    function move(from, to) {
      if (to < 0 || to >= n) return;
      const [x] = arrangement.splice(from, 1);
      arrangement.splice(to, 0, x);
      draw();
    }
    function text() {
      if (!n) return '';
      const ch = chunks(), rows = len / n;
      let s = '';
      for (let r = 0; r < rows; r++) arrangement.forEach(c => (s += ch[c][r]));
      return s;
    }
    function draw() {
      gridWrap.innerHTML = '';
      if (!n) { readout.textContent = ''; return; }
      const ch = chunks(), rows = len / n;
      const grid = h('div', { class: 'col-grid' });
      arrangement.forEach((c, pos) => {
        const col = h('div', { class: 'col-strip', draggable: 'true' },
          h('div', { class: 'col-head' },
            h('button', { class: 'mini', type: 'button', onclick: () => move(pos, pos - 1), 'aria-label': 'move left' }, '◀'),
            h('span', null, 'C' + (c + 1)),
            h('button', { class: 'mini', type: 'button', onclick: () => move(pos, pos + 1), 'aria-label': 'move right' }, '▶')),
          ...Array.from(ch[c]).map(x => h('div', { class: 'col-cell' }, x)));
        col.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', String(pos)); col.classList.add('dragging'); });
        col.addEventListener('dragend', () => col.classList.remove('dragging'));
        col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('over'); });
        col.addEventListener('dragleave', () => col.classList.remove('over'));
        col.addEventListener('drop', e => { e.preventDefault(); col.classList.remove('over'); move(+e.dataTransfer.getData('text/plain'), pos); });
        grid.append(col);
      });
      gridWrap.append(grid);
      const t = text();
      let html = '';
      for (let r = 0; r < rows; r++) html += t.slice(r * n, r * n + n) + ' ';
      if (p.crib) {
        const i = t.indexOf(p.crib);
        readout.innerHTML = i >= 0
          ? escHtml(t.slice(0, i)) + `<mark>${p.crib}</mark>` + escHtml(t.slice(i + p.crib.length))
          : escHtml(t);
      } else readout.textContent = t;
      ctx.onChange && ctx.onChange();
    }
    function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    return {
      el,
      getAnswer: () => { const t = text(); return Array.from(p.answer).map((_, i) => t[i] || ''); },
      mark() { },
      hint() {
        if (n !== p.order.length) { setN(p.order.length); return `Hint: the cipher uses ${p.order.length} columns.`; }
        // place the first misplaced column
        const target = p.order.map((_, col) => p.order[col] - 1); // chunk index for each original column
        const i = arrangement.findIndex((c, pos) => c !== target[pos]);
        if (i < 0) return 'The columns are already in the right order.';
        move(arrangement.indexOf(target[i]), i);
        return `Hint: column ${i + 1} should be C${target[i] + 1}.`;
      },
      reveal() { setN(p.order.length); arrangement = p.order.map(r => r - 1); draw(); },
      clear() { n = 0; arrangement = []; btns.querySelectorAll('button').forEach(b => b.classList.remove('on')); draw(); }
    };
  }

  /* ======================================================================
     Factory
     ====================================================================== */
  function create(p, ctx) {
    ctx = ctx || {};
    let ws;
    switch (p.type) {
      case 'porta': ws = PortaWS(p, ctx); break;
      case 'nihilist': ws = NihilistWS(p, ctx); break;
      case 'baconian': ws = BaconianWS(p, ctx); break;
      case 'fracmorse': ws = FracMorseWS(p, ctx); break;
      case 'cryptarithm': ws = CryptarithmWS(p, ctx); break;
      case 'columnar': ws = ColumnarWS(p, ctx); break;
      default: ws = SubstWS(p, ctx);
    }
    ws.countErrors = () => defaultErrors(p, ws.getAnswer());
    return ws;
  }

  root.WS = { create, h, defaultErrors, baconTable, morseChart, polybiusEditor };
})(typeof window !== 'undefined' ? window : globalThis);
