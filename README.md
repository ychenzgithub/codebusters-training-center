# Codebusters Training Center — Science Olympiad Division B (2026–2027)

An interactive, browser-based training center for the Science Olympiad **Codebusters** event, Division B, 2026–2027 season.
It covers all 13 Division B cipher types, with lessons, worked examples, unlimited practice problems, speed-drill games and full mock tests.

**Live site:** https://ychenzgithub.github.io/codebusters-training-center/

## What's inside

| Section | What it does |
|---|---|
| **Event Guide** | Event format, the 2026–27 Div B cipher list (Regional vs. State/National), scoring (2 free errors, −100 per extra error, timed-question bonus `2 × (600 − seconds)`, special bonus 150/400/750), and team strategy. |
| **Learn** | One lesson per cipher: history, how it works, an **interactive playground** (encode anything), a solving strategy, a **step-by-step worked example**, and tips and pitfalls. |
| **Practice** | Unlimited randomly generated, test-style problems for every cipher and mode (decode / cryptanalysis, Regional / State). Each problem opens in an interactive solving workspace with hints, answer checking with the official error rules, and a solution reveal. |
| **Games** | 60-second drills: Morse Reader/Writer/Stream, Atbash Reflex, Caesar Shift, Baconian Reader/Writer, Porta Pairs, Polybius Coordinates, Pattern Detective, Anagram Blitz, Spanish Word Match, Frequency Sense. |
| **Mock Test** | Full (50 min), half or mini tests: a timed Aristocrat first, a realistic cipher mix, three ★ special bonus questions and official-style scoring. |
| **Reference** | A printable sheet: letter frequencies (English and Spanish), Morse, Baconian, Porta, Fractionated Morse trigrams, Polybius, homophonic bands, and common and pattern words. |
| **Progress / Coach** | Per-cipher progress saved in the browser, plus an 8-week coaching plan, meeting format and resource links. |

### 2026–27 Division B ciphers

Atbash · Caesar · Aristocrat (random / K1) · Patristocrat · Xenocrypt (Spanish) · Baconian · Porta · Fractionated Morse ·
Cryptarithm · Complete Columnar · Nihilist Substitution · Checkerboard · **Homophonic (new this season)**

### Solving workspaces

- **Substitution ciphers** (Aristocrat, Patristocrat, Xenocrypt with Ñ, Caesar, Atbash, Checkerboard, Homophonic): type a letter once and it fills every matching cipher unit. The workspace also has a live frequency/replacement table, duplicate warnings, a Caesar shift explorer, a Checkerboard Polybius square builder, and a Homophonic band table.
- **Porta:** key row that repeats automatically, and a Porta table that highlights the row and pair for the letter you are on.
- **Nihilist:** key numbers with automatic subtraction, an editable Polybius square, and a key-length finder based on digit spread.
- **Baconian:** click symbols (or letters, for Word Baconians) to assign A or B; the groups decode themselves.
- **Fractionated Morse:** a keyed trigram table, Morse shown under every cipher letter, a live decoded stream, and a crib-to-Morse converter.
- **Cryptarithm:** digit assignment, a live equation check, and an elimination grid.
- **Complete Columnar:** choose the column count, drag columns into order, and watch the crib get highlighted.

## Run locally

The site is plain HTML, CSS and JavaScript with no build step and no dependencies.

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

## Tests

```bash
node tests/engine.test.js          # cipher engine vs. worked examples from the Codebusters guide
node tests/generators.test.js 150  # generates problems of every type/mode and checks they decode correctly
```

## Project layout

```
index.html              app shell
assets/css/style.css    styles (light/dark, mobile, print)
assets/js/engine.js     cipher algorithms, cryptarithm solver, scoring
assets/js/data.js       quote banks (English/Spanish), keywords, word lists, frequencies
assets/js/generators.js test-style problem generators
assets/js/lessons.js    lesson content and worked examples
assets/js/workspaces.js interactive solving workspaces
assets/js/games.js      speed-drill games
assets/js/app.js        router, pages, practice, mock test, progress
tests/                  Node test scripts
```

## Sources and disclaimer

Cipher conventions follow the *Science Olympiad Codebusters Guide for Coaches, Event Supervisors and Students* (John Toebes, 2026–27 update),
the [2026–27 rules summary](https://toebes.com/codebusters/Rule-Summary-2027.html), and the ACA cipher definitions.
This is an independent study tool and is **not affiliated with or endorsed by Science Olympiad, Inc.**
The official rules at [soinc.org](https://www.soinc.org/codebusters-b) always take precedence.

## Copyright & license

© 2026 Yang Chen ([@ychenzgithub](https://github.com/ychenzgithub)). Source code is released under the [MIT License](LICENSE).
