// Every audio clip the app can play, in recording order. The id is the MP3 file name in public/audio/.
import { WEEKS, COUNTRIES } from '../data/weeks.js';
import { LETTERS, syllables } from '../data/letters.js';
import COMICS from '../data/comics.json' with { type: 'json' };

const hex = (c) => c.codePointAt(0).toString(16);
const clips = [];
const add = (group, id, ar, en, who) => {
  if (!clips.some((c) => c.id === id)) clips.push({ group, id, ar, en, ...(who ? { who } : {}) });
};

// Letters in teaching order: the name, then the syllable drill.
for (const l of [...LETTERS].sort((a, b) => a.week - b.week)) {
  add(`Letters (Week ${l.week})`, 'ln-' + hex(l.char), l.name, `Letter name: ${l.nameEn}`);
  add(`Letters (Week ${l.week})`, 'ls-' + hex(l.char), l.char === 'ا' ? 'بَا  دَا  رَا  زَا  نَا' : syllables(l.char).join('  '), `Syllables with ${l.nameEn}`);
}

for (const wk of WEEKS) {
  if (wk.review) continue;
  const g = `Week ${wk.n}`;
  for (const w of wk.words || []) add(g, 'w-' + w.id, w.ar, w.en);
  for (const w of wk.pattern?.extra || []) add(g, 'w-' + w.id, w.ar, w.en);
  for (const x of [...(wk.phrases || []), ...(wk.sentences || []), ...(wk.spoken || [])]) add(g, 's-' + x.id, x.ar, x.en);
  for (const x of wk.pattern?.examples || []) add(g, 's-' + x.id, x.ar, x.en);
  for (const x of wk.reading?.lines || []) add(g, 's-' + x.id, x.ar, x.en);
  for (const x of wk.write || []) add(g, 's-' + x.id, x.ar, x.en);
}
for (const c of COUNTRIES) add('Week 16 · countries', 'c-' + c.id, `${c.ar} · ${c.cap} · ${c.nat}`, `${c.en}: country, capital, nationality`);

// Comic speech bubbles. A bubble that repeats a lesson line plays that line's clip, so only new lines are listed.
// Each is tagged with its character, so other voices can record some parts.
for (const [n, panels] of Object.entries(COMICS))
  panels.forEach((p, i) => p.bubbles.forEach((b) => !b.clip && add(`Comics · Week ${n}`, b.id, b.ar, `${b.en} (panel ${i + 1})`, b.who)));

export const CLIPS = clips;
/** Who speaks a comic line, for the studio's voice filter. */
export const VOICES = { nader: 'Nader', rana: 'Rana', caption: 'Narrator (captions)', sami: 'Sami', dina: 'Dina', layla: 'Layla', salma: 'Salma', karim: 'Karim', grandma: 'Grandma', owner: 'Café owner', baker: 'Baker', seller: 'Fruit seller' };
