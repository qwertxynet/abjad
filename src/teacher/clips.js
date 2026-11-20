// Every audio clip the app can play, in recording order. The id is the MP3 file name in public/audio/.
import { WEEKS, COUNTRIES } from '../data/weeks.js';
import { LETTERS, syllables } from '../data/letters.js';

const hex = (c) => c.codePointAt(0).toString(16);
const clips = [];
const add = (group, id, ar, en) => {
  if (!clips.some((c) => c.id === id)) clips.push({ group, id, ar, en });
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

export const CLIPS = clips;
