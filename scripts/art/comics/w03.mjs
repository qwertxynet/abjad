// Week 3 · The fruit stall. Lemons, bananas, a strange cob of corn, dates and milk, and the walk home at night.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure } from '../cast.mjs';
import { both, circ, ell, sky, crate, bananas, lemons, handAt, moon, stars, table } from './kit.mjs';

const awning = (x1, x2, y) => {
  const n = Math.round((x2 - x1) / 20);
  const w = (x2 - x1) / n;
  let stripes = '';
  for (let k = 0; k < n; k++) stripes += W(k % 2 ? 'w-white' : 'w-awning', `M${x1 + k * w} ${y} h${w} v24 q${-w / 2} 8 ${-w} 0 Z`);
  return stripes + I(`M${x1} ${y} H${x2} ` + Array.from({ length: n }, (_, k) => `M${x1 + k * w} ${y + 24} q${w / 2} 8 ${w} 0`).join(' '), 1.5);
};
const dates = (x, y) => both('w-wood', `M${x} ${y} h30 v-10 h-30 Z`, 1.3) + D('#6B3A22', Array.from({ length: 7 }, (_, k) => [x + 4 + k * 3.8, y - 12 - (k % 2) * 2, 3]));
const milk = (x, y) => both('w-white', `M${x} ${y} h10 v-18 l-2 -5 v-4 h-6 v4 l-2 5 Z`, 1.2) + W('w-sky', `M${x} ${y - 6} h10 v-6 h-10 Z`);
const corn = (x, y) => W('w-lamp', ell(x, y - 13, 5, 14)) + I(ell(x, y - 13, 5, 14) + ` M${x - 3} ${y - 20} h6 M${x - 4} ${y - 14} h8 M${x - 4} ${y - 8} h8`, 1.1) +
  both('w-leaf', `M${x - 2} ${y + 2} q-10 -10 -6 -24 q4 12 8 18 Z M${x + 2} ${y + 2} q10 -10 6 -24 q-4 12 -8 18 Z`, 1.1);

export const PANELS = [
  {
    svg: [
      sky(70),
      W('w-stone', 'M0 60 H150 V214 H0 Z'), I('M0 60 H150 V214', 1.6), W('w-sky', 'M30 150 V100 Q50 82 70 100 V150 Z'), I('M30 150 V100 Q50 82 70 100 V150 Z M50 88 V150', 1.4),
      W('w-door', 'M150 74 H320 V214 H150 Z'),
      figure('seller', { x: 246, y: 234, look: -1, mood: 'smile', armR: 'rest', armL: 'hip' }),
      LAYER,
      awning(144, 320, 52),
      W('w-wood', 'M150 150 H320 V214 H150 Z'), I('M150 150 H320 V214 M150 150 V214 M150 160 H320', 1.8),
      crate(156, 150, 40, 'w-lamp', 4.6), bananas(204, 142), crate(236, 150, 36, 'w-awning', 5), crate(278, 150, 38, 'w-roof', 5),
      W('w-sand', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320', 1.6),
      figure('rana', { x: 46, y: 234, look: 1, mood: 'smile' }),
      figure('nader', { x: 102, y: 236, look: 1, mood: 'talk', armR: 'point' }),
    ].join(''),
    alt: 'Nader and Rana at the fruit stall. The seller smiles behind crates of lemons, bananas, oranges and apples.',
    bubbles: [
      { who: 'caption', ar: 'الْوَلَد نَادِر وَالْبِنْت رَنَا.', en: 'The boy is Nader and the girl is Rana.', clip: 's-w03-s1', x: 97, y: 4, align: 'right' },
      { who: 'nader', ar: 'لَيْمُون وَمَوْز، مِنْ فَضْلِك.', en: 'Lemons and bananas, please.', spoken: true, x: 3, y: 9, tail: 'down-right' },
    ],
  },
  {
    svg: (() => {
      const [cx, cy] = handAt(234, 300, 1.35, 'hold', -1);
      return [
        W('w-wall', 'M0 0 H320 V240 H0 Z'), I('M0 40 H320 M0 44 H320', 1.2),
        W('w-wood', 'M0 150 H320 V240 H0 Z'), I('M0 150 H320', 1.8),
        crate(10, 150, 48, 'w-lamp', 5), crate(62, 150, 44, 'w-awning', 5.5), lemons(120, 140), bananas(170, 142), crate(206, 150, 50, 'w-roof', 5.5), crate(262, 150, 54, 'w-leaf', 5.5),
        figure('nader', { x: 84, y: 300, s: 1.35, look: 1, mood: 'think', armL: 'open', armR: 'open' }),
        figure('rana', { x: 234, y: 300, s: 1.35, look: -1, mood: 'surprised', armL: 'hold' }),
        LAYER,
        corn(cx + 2, cy + 6),
      ].join('');
    })(),
    alt: 'Rana holds up a cob of corn and looks puzzled. Nader shrugs.',
    bubbles: [
      { who: 'rana', ar: 'ذُرَة؟', en: 'Corn?', x: 64, y: 12, tail: 'down-right' },
      { who: 'nader', ar: 'لَا أَعْرِف!', en: 'I don’t know!', clip: 's-w03-o3', spoken: true, x: 10, y: 18, tail: 'down-right' },
    ],
  },
  {
    svg: (() => {
      const [bx, by] = handAt(170, 250, 1.2, 'open', 1);
      return [
        W('w-wall', 'M0 0 H320 V240 H0 Z'),
        I('M10 60 H110 M250 60 H316', 2), crate(14, 60, 44, 'w-awning', 5), crate(60, 60, 44, 'w-lamp', 4.6), crate(254, 60, 58, 'w-leaf', 5.5),
        I('M200 0 V30 M188 30 h24 M190 30 l-6 16 h12 Z M210 30 l6 16 h-12 Z', 1.3),
        figure('seller', { x: 170, y: 250, s: 1.2, look: 0, mood: 'smile', armR: 'open', armL: 'rest' }),
        LAYER,
        both('w-sand', `M${bx - 9} ${by + 4} l2 -22 h14 l2 22 Z`, 1.3), I(`M${bx - 7} ${by - 18} l3 4 l3 -4 l3 4 l3 -4`, 0.9),
        table(176),
        dates(110, 176), dates(144, 176), milk(196, 176), milk(210, 176),
        figure('rana', { x: 48, y: 300, s: 1.25, look: 1, mood: 'talk', armR: 'point' }),
        figure('nader', { x: 290, y: 300, s: 1.25, look: -1, mood: 'smile' }),
      ].join('');
    })(),
    alt: 'The seller hands over a paper bag. On the counter: boxes of dates and bottles of milk.',
    bubbles: [{ who: 'rana', ar: 'تَمْر وَلَبَن', en: 'Dates and milk', clip: 's-w03-p3', x: 4, y: 20, tail: 'down-right' }],
  },
  {
    lit: true,
    svg: [
      W('w-night', 'M0 0 H320 V240 H0 Z'),
      moon(262, 38, 12), stars([[30, 24], [70, 50], [120, 20], [170, 44], [210, 18], [300, 80], [150, 70], [40, 90]]),
      W('#5E5878', 'M0 240 V120 h50 v-20 h40 v34 h40 v-50 h40 v40 h60 v-24 h40 v36 h50 V240 Z'),
      I('M0 120 h50 v-20 h40 v34 h40 v-50 h40 v40 h60 v-24 h40 v36 h50', 1.4),
      W('w-lamp', 'M60 120 h8 v10 h-8 Z M150 100 h8 v10 h-8 Z M232 124 h8 v10 h-8 Z'),
      // street lamp
      I('M300 214 V110 M290 110 h20', 2), W('w-lamp', 'M292 110 h16 l-3 12 h-10 Z'), I('M292 110 h16 l-3 12 h-10 Z', 1.3),
      W('#7A6A58', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320', 1.6),
      figure('nader', { x: 120, y: 236, look: 1, mood: 'smile', armR: 'hold' }),
      figure('rana', { x: 190, y: 234, look: -1, mood: 'smile', armL: 'hold' }),
      LAYER,
      both('w-sand', 'M120 162 l2 -22 h14 l2 22 Z', 1.3), both('w-sand', 'M174 160 l2 -20 h12 l2 20 Z', 1.3),
    ].join(''),
    alt: 'Night. Nader and Rana walk home under the moon and stars, carrying their bags.',
    bubbles: [{ who: 'caption', ar: 'اللَّيْل', en: 'The night', clip: 'w-al-layl', x: 4, y: 4 }],
  },
];
