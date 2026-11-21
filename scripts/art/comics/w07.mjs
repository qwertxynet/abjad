// Week 7 · The library and the doctor. A book, Dina the doctor, and her dog in the kitchen.
import { W, I, D, LAYER, place } from '../paint.mjs';
import { figure } from '../cast.mjs';
import { both, circ, ell, shelf, handAt, book, arch, dog, cup } from './kit.mjs';

const shelves = () => W('w-wood', 'M0 0 H320 V240 H0 Z') + ['w-roof', 'w-door'].map(() => '').join('') +
  [44, 92, 140, 188].map((y) => shelf(4, y, 312)).join('');

export const PANELS = [
  {
    svg: (() => {
      const [bx, by] = handAt(232, 290, 1.25, 'hold', -1);
      return [
        shelves(),
        figure('rana', { x: 86, y: 290, s: 1.25, look: 1, mood: 'talk', armR: 'point' }),
        figure('nader', { x: 232, y: 290, s: 1.25, look: -1, mood: 'smile', armL: 'hold' }),
        LAYER,
        book(bx - 10, by + 6, 'w-roof', 22, 28),
      ].join('');
    })(),
    alt: 'In the library. Nader holds up a red book; Rana points at it: it’s hers!',
    bubbles: [
      { who: 'nader', ar: 'هَذَا كِتَاب.', en: 'This is a book.', clip: 's-w07-p1', x: 62, y: 8, tail: 'down-right' },
      { who: 'rana', ar: 'هَذَا كِتَابُ رَنَا!', en: 'This is Rana’s book!', x: 6, y: 16, tail: 'down-right' },
    ],
  },
  {
    svg: [
      W('w-wall', 'M0 0 H320 V214 H0 Z'),
      W('w-white', arch(160, 214, 100, 170)), I(arch(160, 214, 100, 170), 2),
      both('w-white', 'M60 60 h70 v44 h-70 Z', 1.6),
      W('w-roof', 'M86 70 a12 12 0 1 0 0.1 24 a9 10 0 1 1 0 -24 Z'),
      I('M100 76 h22 M100 84 h18 M100 92 h20', 1),
      W('w-sand', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320', 1.6),
      figure('nader', { x: 76, y: 292, s: 1.25, look: 1, mood: 'smile' }),
      figure('dina', { x: 214, y: 290, s: 1.25, look: -1, mood: 'talk', armL: 'wave' }),
    ].join(''),
    alt: 'Next door is the doctor’s. Dina, in a white coat with a stethoscope, waves hello to Nader.',
    bubbles: [
      { who: 'dina', ar: 'السَّلَامُ عَلَيْكُم! كَيْفَ حَالُك؟', en: 'Hello! How are you?', clip: 's-w07-s1', x: 34, y: 4, tail: 'down-right' },
      { who: 'dina', ar: 'اِسْمِي دِينَا.', en: 'My name is Dina.', x: 66, y: 20, tail: 'down-left' },
    ],
  },
  {
    svg: (() => {
      const [bx, by] = handAt(228, 300, 1.35, 'hold', -1);
      return [
        W('w-wall', 'M0 0 H320 V240 H0 Z'),
        shelf(180, 50, 130),
        both('w-white', 'M20 30 h60 v70 h-60 Z', 1.4), I('M30 50 h40 M30 62 h34 M30 74 h38', 1), W('w-roof', 'M44 36 h12 v4 h4 v4 h-4 v4 h-12 v-4 h-4 v-4 h4 Z'),
        figure('dina', { x: 90, y: 300, s: 1.35, look: 1, mood: 'smile', armR: 'hip' }),
        figure('nader', { x: 228, y: 300, s: 1.35, look: -1, mood: 'smile', armL: 'hold' }),
        LAYER,
        book(bx - 12, by + 8, 'w-door', 24, 8) + book(bx - 10, by, 'w-lamp', 22, 8) + book(bx - 12, by - 8, 'w-leaf', 24, 8),
      ].join('');
    })(),
    alt: 'Nader with a pile of books, and Dina the doctor.',
    bubbles: [{ who: 'caption', ar: 'هُوَ طَالِب وَهِيَ طَبِيبَة.', en: 'He is a student and she is a doctor.', clip: 's-w07-s2', x: 97, y: 4, align: 'right' }],
  },
  {
    svg: [
      W('w-wall', 'M0 0 H320 V240 H0 Z'),
      // kitchen: cupboards, a counter and a kettle
      both('w-door', 'M30 20 h120 v50 h-120 Z', 1.6), I('M90 20 v50 M84 44 v6 M96 44 v6', 1.2),
      both('w-wood', 'M0 150 H170 V214 H0 Z', 1.6), I('M0 160 H170 M60 160 V214 M120 160 V214', 1.2),
      both('w-door', 'M30 150 q0 -18 14 -18 h12 q8 0 8 8 v10 Z', 1.3), I('M64 140 q8 -2 8 8', 1.2),
      W('w-sand', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320', 1.6),
      LAYER,
      W('w-wood', ell(196, 228, 30, 6)),
      both('w-white', 'M214 232 l14 -6 l4 8 l-14 6 Z', 1.2),
      place(dog(0, 0), { x: 140, y: 236, s: 1.7 }),
      figure('dina', { x: 50, y: 290, s: 1.25, look: 1, mood: 'surprised', armL: 'open', armR: 'open' }),
      figure('nader', { x: 266, y: 290, s: 1.25, look: -1, mood: 'talk', armL: 'point' }),
    ].join(''),
    alt: 'Dina’s dog has run into the kitchen and knocked over a cup of coffee. Nader points; Dina stares at the puddle.',
    bubbles: [
      { who: 'nader', ar: 'الْكَلْبُ فِي الْمَطْبَخ!', en: 'The dog is in the kitchen!', clip: 's-w07-p3', x: 44, y: 8, tail: 'down-right' },
      { who: 'dina', ar: 'هَذِهِ قَهْوَة؟', en: 'Is this coffee?', x: 3, y: 26, tail: 'down-left' },
    ],
  },
];
