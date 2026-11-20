// Builds the question bank for a lesson. A quiz draws 10 questions; 8 correct passes.
// Question: { kind, prompt, ar?, pic?, audio?, fallback?, options: [{ label, ar? }], answer }
//
// Every quiz is built from a numbered seed, so the same seed always rebuilds the same 10 questions with the same
// options. The completion code carries the seed and the student's picks, which lets the teacher page show the
// student's quiz again. For that to work the bank must not depend on anything that changes over time: listening
// questions are always in the bank, and are shown as reading questions (their `fallback`) until the clip is recorded.
// If lesson content changes in a way that alters the bank, bump QUIZ_VERSION.
import { WEEKS, weekByN, COUNTRIES } from './data/weeks.js';
import { LETTERS, byChar, forms } from './data/letters.js';
import { shuffle, sample, strip, splitLetters, baseLetter } from './lib.js';

export const QUIZ_VERSION = 1;

const POS = { initial: 'start', medial: 'middle', final: 'end', isolated: 'standing alone' };

// Two options clash when they share a meaning ("house" / "house, home") or a spelling.
const core = (en) => (en || '').toLowerCase().replace(/^the /, '').split(/[,(/]/)[0].replace(/s$/, '').trim();
const clash = (a, b) => typeof a === 'object' && typeof b === 'object' && ((a.en && core(a.en) === core(b.en)) || (a.ar && strip(a.ar) === strip(b.ar)));

function choices(correct, pool, k = 4, key = (x) => x) {
  const seen = new Set([key(correct)]);
  const others = [];
  for (const p of shuffle(pool)) {
    if (others.length === k - 1) break;
    if (seen.has(key(p)) || clash(p, correct) || others.some((o) => clash(o, p))) continue;
    seen.add(key(p));
    others.push(p);
  }
  const opts = shuffle([correct, ...others]);
  return { opts, answer: opts.indexOf(correct) };
}

const wordsOf = (wk) => [...(wk.words || []), ...(wk.pattern?.extra || [])];

function part1Bank(wk) {
  const bank = [];
  const words = wk.words;
  const letters = wk.newLetters.map((c) => byChar[c]);
  // Words up to this week, for distractors.
  const known = WEEKS.filter((x) => x.part === 1 && x.n <= wk.n).flatMap((x) => x.words);

  for (const wd of words) {
    // 1. Meaning → word
    const c1 = choices(wd, known, 4, (x) => strip(x.ar));
    bank.push({ kind: 'pick-word', prompt: `Which word means “${wd.en}”?`, pic: wd.pic, options: c1.opts.map((o) => ({ ar: o.ar })), answer: c1.answer });
    // 2. Word → meaning
    const c2 = choices(wd, known, 4, (x) => x.en);
    bank.push({ kind: 'pick-meaning', prompt: 'What does this word mean?', ar: wd.ar, options: c2.opts.map((o) => ({ label: o.en })), answer: c2.answer });
    // 3. Which letters make the word (Khalduniyya analysis)
    const segs = splitLetters(strip(wd.ar)).filter((x) => x.trim());
    if (segs.length >= 2 && segs.length <= 6) {
      const right = segs.join(' ');
      const pool = LETTERS.filter((l) => l.week <= wk.n).map((l) => l.char);
      const wrongs = new Set();
      let guard = 0;
      while (wrongs.size < 3 && guard++ < 40) {
        const s2 = [...segs];
        const i = Math.floor(Math.random() * s2.length);
        const rep = pool[Math.floor(Math.random() * pool.length)];
        if (rep === s2[i]) continue;
        s2[i] = rep;
        const cand = s2.join(' ');
        if (cand !== right) wrongs.add(cand);
      }
      const opts = shuffle([right, ...wrongs]);
      bank.push({ kind: 'spell', prompt: 'Which letters make up this word?', ar: wd.ar, options: opts.map((o) => ({ ar: o, spaced: true })), answer: opts.indexOf(right) });
    }
    // 7. Listening
    {
      const c7 = choices(wd, known, 4, (x) => strip(x.ar));
      bank.push({ kind: 'listen', prompt: 'Listen. Which word do you hear?', audio: 'w-' + wd.id, fallback: { prompt: `Which word means “${wd.en}”?`, pic: wd.pic }, options: c7.opts.map((o) => ({ ar: o.ar })), answer: c7.answer });
    }
  }

  for (const l of letters) {
    // 4. Which word contains the letter?
    const withIt = words.filter((x) => strip(x.ar).includes(l.char));
    const without = known.filter((x) => !strip(x.ar).includes(l.char));
    if (withIt.length && without.length >= 3) {
      const right = withIt[Math.floor(Math.random() * withIt.length)];
      const opts = shuffle([right, ...sample(without, 3)]);
      bank.push({ kind: 'find', prompt: `Which word has the letter ${l.char} (${l.nameEn}) in it?`, options: opts.map((o) => ({ ar: o.ar })), answer: opts.indexOf(right) });
    }
    // 5. Positional form
    const f = forms(l.char);
    const pos = l.joins ? ['initial', 'medial', 'final'][Math.floor(Math.random() * 3)] : 'final';
    const others = LETTERS.filter((x) => x.week <= wk.n && x.char !== l.char && x.joins === l.joins);
    const distract = sample(others, 2).map((x) => forms(x.char)[pos]);
    const other = l.joins ? f[pos === 'initial' ? 'final' : 'initial'] : f.isolated;
    const opts = shuffle([f[pos], other, ...distract]);
    bank.push({ kind: 'form', prompt: `How is ${l.char} (${l.nameEn}) written at the ${POS[pos]} of a word?`, options: opts.map((o) => ({ ar: o, big: true })), answer: opts.indexOf(f[pos]) });
    // 6. Letter name
    const c6 = choices(l, LETTERS.filter((x) => x.week <= wk.n), 4, (x) => x.char);
    bank.push({ kind: 'name', prompt: `Which letter is ${l.name} (${l.nameEn})?`, options: c6.opts.map((o) => ({ ar: o.char, big: true })), answer: c6.answer });
    // Joins or not
    bank.push({ kind: 'joins', prompt: `Does ${l.char} join to the letter after it (on its left)?`, options: [{ label: 'Yes' }, { label: 'No, never' }], answer: l.joins ? 0 : 1 });
    {
      const c8 = choices(l, LETTERS.filter((x) => x.week <= wk.n), 4, (x) => x.char);
      bank.push({ kind: 'listen', prompt: 'Listen to the syllables. Which letter is it?', audio: 'ls-' + l.char.codePointAt(0).toString(16), fallback: { prompt: `Which letter is ${l.nameEn}, as in ${l.char === 'ا' ? 'بَا دَا رَا' : l.char + 'َ ' + l.char + 'ُ ' + l.char + 'ِ'}?` }, options: c8.opts.map((o) => ({ ar: o.char, big: true })), answer: c8.answer });
    }
  }

  // Reading: phrase meaning
  for (const p of [...(wk.phrases || []), ...(wk.sentences || [])]) {
    const pool = WEEKS.filter((x) => x.part === 1 && x.n <= wk.n).flatMap((x) => [...(x.phrases || []), ...(x.sentences || [])]);
    const c = choices(p, pool, 3, (x) => x.en);
    bank.push({ kind: 'read', prompt: 'Read it. What does it mean?', ar: p.ar, options: c.opts.map((o) => ({ label: o.en })), answer: c.answer });
  }
  // Week 8: hamza seats
  if (wk.n === 8) {
    bank.push({ kind: 'sign', prompt: 'Which word ends in alif maqṣūra (ى)?', options: shuffle(['عَلَى', 'مَاء', 'أَنَا', 'شُكْرًا']).map((o) => ({ ar: o })), answer: null, right: 'عَلَى' });
    bank.push({ kind: 'sign', prompt: 'Which word has tanwīn (an extra “n” sound)?', options: shuffle(['شُكْرًا', 'أَنْتِ', 'مَسَاء', 'إِلَى']).map((o) => ({ ar: o })), answer: null, right: 'شُكْرًا' });
    bank.push({ kind: 'sign', prompt: 'In which word does the hamza sit on a wāw?', options: shuffle(['سُؤَال', 'أُمّ', 'مَاء', 'إِلَى']).map((o) => ({ ar: o })), answer: null, right: 'سُؤَال' });
  }
  return bank;
}

function part2Bank(wk) {
  const bank = [];
  const words = wordsOf(wk);
  const allP2 = WEEKS.filter((x) => x.part === 2).flatMap(wordsOf);
  for (const wd of words) {
    const pool = words.length >= 6 ? words : allP2;
    const c1 = choices(wd, pool, 4, (x) => x.en);
    bank.push({ kind: 'pick-word', prompt: `Which is “${wd.en}”?`, pic: /^(c-|clock|d\d|mon-|cal-)/.test(wd.pic || '') ? wd.pic : null, options: c1.opts.map((o) => ({ ar: o.ar })), answer: c1.answer });
    const c2 = choices(wd, pool, 4, (x) => x.en);
    bank.push({ kind: 'pick-meaning', prompt: 'What does it mean?', ar: wd.ar, options: c2.opts.map((o) => ({ label: o.en })), answer: c2.answer });
    {
      const c3 = choices(wd, pool, 4, (x) => x.en);
      bank.push({ kind: 'listen', prompt: 'Listen. Which word do you hear?', audio: 'w-' + wd.id, fallback: { prompt: `Which word means “${wd.en}”?` }, options: c3.opts.map((o) => ({ ar: o.ar })), answer: c3.answer });
    }
  }
  // Reading comprehension (the passage is shown with the question)
  for (const q of wk.reading?.questions || []) {
    const opts = shuffle(q.options.map((label, i) => ({ label, right: i === q.answer })));
    bank.push({ kind: 'reading', prompt: q.q, passage: wk.reading.lines.map((l) => l.ar), options: opts, answer: opts.findIndex((o) => o.right) });
  }
  // Complete the sentence (one word blanked from the WRITE sentences and pattern examples)
  for (const x of [...(wk.write || []), ...(wk.pattern?.examples || [])]) {
    const toks = x.ar.split(/\s+/).filter((t) => t.length > 1 && !/^[—–-]$/.test(t));
    if (toks.length < 2) continue;
    const i = Math.floor(Math.random() * toks.length);
    const gap = toks[i].replace(/[.،؟!]+$/, '');
    const pool = [...new Set(words.flatMap((wd) => wd.ar.split(/\s*\/\s*|\s+/)).concat(toks.map((t) => t.replace(/[.،؟!]+$/, ''))))].filter((t) => strip(t) !== strip(gap) && t.length > 1);
    if (pool.length < 3) continue;
    const opts = shuffle([gap, ...sample(pool, 3)]);
    bank.push({ kind: 'gap', prompt: `Complete: “${x.en}”`, ar: x.ar.replace(toks[i], '____'), options: opts.map((o) => ({ ar: o })), answer: opts.indexOf(gap) });
  }
  if (wk.n === 16) {
    for (const c of COUNTRIES) {
      const k1 = choices(c, COUNTRIES, 4, (x) => x.cap);
      bank.push({ kind: 'capital', prompt: `What is the capital of ${c.en}?`, ar: c.ar, options: k1.opts.map((o) => ({ ar: o.cap })), answer: k1.answer });
      const k2 = choices(c, COUNTRIES, 4, (x) => x.nat);
      bank.push({ kind: 'nisba', prompt: `Someone from ${c.en} is…`, ar: c.ar, options: k2.opts.map((o) => ({ ar: o.nat })), answer: k2.answer });
    }
  }
  return bank;
}

export function buildBank(n) {
  const wk = weekByN[n];
  if (wk.review) return WEEKS.filter((x) => !x.review).flatMap((x) => sample(buildBank(x.n), 6));
  const bank = wk.part === 1 ? part1Bank(wk) : part2Bank(wk);
  // Resolve "right" answers stored by value.
  for (const q of bank) if (q.answer === null) q.answer = q.options.findIndex((o) => o.ar === q.right);
  return bank;
}

/** Runs fn with Math.random replaced by a seeded generator (mulberry32), so the result depends only on the seed. */
function withSeed(seed, fn) {
  const orig = Math.random;
  let a = seed >>> 0 || 1;
  Math.random = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  try {
    return fn();
  } finally {
    Math.random = orig;
  }
}
export const newSeed = () => Math.floor(Math.random() * 0xffffff) + 1; // 24 bits

export function drawQuiz(n, seed = newSeed(), k = 10) {
  return withSeed(seed, () => draw(n, k));
}
function draw(n, k) {
  const bank = buildBank(n);
  // Spread question kinds: take at most 3 of any kind.
  const byKind = {};
  const out = [];
  for (const q of shuffle(bank)) {
    byKind[q.kind] = (byKind[q.kind] || 0) + 1;
    if (byKind[q.kind] <= 3) out.push(q);
    if (out.length === k) break;
  }
  for (const q of shuffle(bank)) {
    if (out.length >= k) break;
    if (!out.includes(q)) out.push(q);
  }
  return out;
}

export { baseLetter };
