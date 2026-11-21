// Week 5 · The bakery by the sea. Good morning, ten loaves, the beautiful sea, and a hungry camel.
import { W, I, D, LAYER, place } from '../paint.mjs';
import { figure } from '../cast.mjs';
import { both, circ, ell, sky, sun, table, arch, handAt, camel } from './kit.mjs';

const SEA = '#5E95BE';
const loaf = (x, y, r = 9) => both('w-sand', ell(x, y, r, r * 0.55), 1.2) + I(`M${x - r * 0.5} ${y - 2} l3 -2 M${x - 1} ${y - 2} l3 -2 M${x + r * 0.4} ${y - 2} l3 -2`, 0.9);

export const PANELS = [
  {
    svg: [
      sky(240),
      sun(46, 92, 13),
      W(SEA, 'M0 110 H130 V214 H0 Z'), I('M0 110 H130 M10 130 q8 -4 16 0 M50 150 q8 -4 16 0 M20 180 q8 -4 16 0 M80 170 q8 -4 16 0', 1.1),
      W('w-wall', 'M120 40 H320 V214 H120 Z'), I('M120 214 V40 H320 M116 40 H324', 1.8),
      W('w-door', arch(190, 214, 50, 90)), I(arch(190, 214, 50, 90) + ' M215 130 V214', 1.8),
      W('w-sky', arch(258, 150, 46, 56)), I(arch(258, 150, 46, 56), 1.6), loaf(270, 140, 7), loaf(290, 142, 7), loaf(280, 132, 7),
      both('w-lamp', 'M138 70 h44 v26 h-44 Z', 1.4), loaf(160, 84, 11),
      W('w-sand', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320', 1.6),
      figure('rana', { x: 76, y: 234, look: 1, mood: 'smile' }),
      figure('nader', { x: 252, y: 236, look: -1, mood: 'talk', armL: 'wave' }),
    ].join(''),
    alt: 'Morning at the white bakery by the sea. The sun is coming up. Nader waves to Rana.',
    bubbles: [
      { who: 'nader', ar: 'صَبَاحُ الْخَيْر!', en: 'Good morning!', x: 60, y: 7, tail: 'down-right' },
      { who: 'rana', ar: 'صَبَاحُ النُّور!', en: 'Good morning! (the reply)', x: 6, y: 14, tail: 'down-right' },
    ],
  },
  {
    svg: (() => {
      const [hx, hy] = handAt(176, 286, 1.2, 'hold', 1);
      return [
        W('w-wall', 'M0 0 H320 V240 H0 Z'),
        // the oven
        W('w-roof', 'M10 180 V70 Q60 20 110 70 V180 Z'), I('M10 180 V70 Q60 20 110 70 V180', 2),
        I('M20 84 h80 M16 104 h88 M14 124 h92 M14 144 h92 M14 164 h92', 0.8),
        W('w-night', 'M32 180 V120 Q60 92 88 120 V180 Z'), W('w-lamp', 'M40 180 q8 -26 20 -30 q12 10 20 30 Z'), I('M32 180 V120 Q60 92 88 120 V180', 1.8),
        I('M200 60 h110 M200 100 h110', 2), ...[0, 1, 2, 3, 4].map((k) => loaf(214 + k * 22, 54, 9)), ...[0, 1, 2, 3].map((k) => loaf(224 + k * 22, 94, 9)),
        figure('baker', { x: 176, y: 286, s: 1.2, look: 0, mood: 'talk', armR: 'hold', armL: 'open' }),
        LAYER,
        loaf(hx + 4, hy - 4, 10),
        table(188),
        ...[0, 1, 2, 3, 4].map((k) => loaf(110 + k * 22, 182, 10)),
        ...[0, 1, 2, 3].map((k) => loaf(121 + k * 22, 172, 10)),
        both('w-white', 'M262 188 h12 v-22 l-2 -6 v-5 h-8 v5 l-2 6 Z M280 188 h12 v-22 l-2 -6 v-5 h-8 v5 l-2 6 Z', 1.2),
      ].join('');
    })(),
    alt: 'Inside the bakery. The baker counts the loaves on the counter, next to bottles of milk.',
    bubbles: [
      { who: 'caption', ar: 'خُبْز وَحَلِيب', en: 'Bread and milk', clip: 's-w05-p1', x: 97, y: 4, align: 'right' },
      { who: 'baker', ar: 'سِتَّة، سَبْعَة، ثَمَانِيَة، تِسْعَة، عَشَرَة', en: 'six, seven, eight, nine, ten', clip: 's-w05-o1', spoken: true, x: 3, y: 8, tail: 'down-right' },
    ],
  },
  {
    svg: (() => {
      const [bx, by] = handAt(232, 262, 1.2, 'hold', -1);
      return [
        sky(110),
        sun(270, 40, 14),
        W(SEA, 'M0 100 H320 V170 H0 Z'), I('M0 100 H320 M30 120 q10 -5 20 0 M120 140 q10 -5 20 0 M220 118 q10 -5 20 0 M270 150 q10 -5 20 0 M70 156 q10 -5 20 0', 1.1),
        W('w-white:fine', 'M0 168 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 V172 H0 Z'),
        W('w-sand', 'M0 170 H320 V240 H0 Z'), I('M0 170 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0', 1.3),
        // a camel on the beach, far away
        both('w-sand', 'M296 160 q4 -14 10 -6 q4 -8 8 2 l4 -10 h4 l-2 14 v10 h-2 v-8 h-12 v8 h-2 Z', 1),
        figure('rana', { x: 104, y: 262, s: 1.2, look: 1, mood: 'celebrate', armL: 'up', armR: 'up' }),
        figure('nader', { x: 232, y: 262, s: 1.2, look: -1, mood: 'smile', armL: 'hold' }),
        LAYER,
        both('w-white', `M${bx - 8} ${by + 6} l2 -22 h12 l2 22 Z`, 1.3), loaf(bx, by - 18, 7),
      ].join('');
    })(),
    alt: 'On the beach. Rana throws her arms up at the sea. Nader holds the bag of bread. Far away, a camel is watching.',
    bubbles: [{ who: 'rana', ar: 'الْبَحْرُ جَمِيل!', en: 'The sea is beautiful!', clip: 's-w05-p2', x: 6, y: 8, tail: 'down-right' }],
  },
  {
    svg: (() => {
      const [hx, hy] = handAt(110, 334, 1.5, 'open', 1);
      return [
        sky(120),
        W(SEA, 'M0 110 H320 V170 H0 Z'), I('M0 110 H320', 1.1),
        W('w-sand', 'M0 168 H320 V240 H0 Z'), I('M0 168 H320', 1.3),
        figure('rana', { x: 30, y: 322, s: 1.3, look: 1, mood: 'laugh' }),
        figure('nader', { x: 110, y: 334, s: 1.5, look: 1, mood: 'surprised', armR: 'open', armL: 'rest' }),
        LAYER,
        loaf(hx + 2, hy - 2, 11),
        LAYER,
        place(camel(0, 0), { x: hx + 2 + 25.2, y: hy - 2 - 43.2, s: 1.8 }),
      ].join('');
    })(),
    alt: 'The camel has come over and is eating the bread right out of Nader’s hand. Rana can’t stop laughing.',
    bubbles: [
      { who: 'nader', ar: 'جَمَل!', en: 'A camel!', clip: 'w-jamal', x: 34, y: 6, tail: 'down-right' },
      { who: 'rana', ar: 'خُبْزُ نَادِر!', en: 'Nader’s bread!', x: 2, y: 22, tail: 'down-left' },
    ],
  },
];
