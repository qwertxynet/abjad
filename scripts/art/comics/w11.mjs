// Week 11 · The park. Monday and sunny, summer and winter, spring, and tomorrow.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure } from '../cast.mjs';
import { both, circ, ell, sky, sun, tree } from './kit.mjs';

const grass = (y = 196) => W('w-leaf', `M0 ${y} Q160 ${y - 10} 320 ${y} V240 H0 Z`) + I(`M0 ${y} Q160 ${y - 10} 320 ${y}`, 1.4);
const bench = (x, y) => both('w-wood', `M${x} ${y} h90 v-8 h-90 Z M${x} ${y - 18} h90 v-6 h-90 Z`, 1.4) + I(`M${x + 8} ${y} v14 M${x + 82} ${y} v14 M${x + 8} ${y - 18} v10 M${x + 82} ${y - 18} v10`, 1.6);
const blossom = (x, y, r = 40, seed = 1) => tree(x, y, r, { leaf: '#F3C7D3', fruit: ['w-rose', 3], seed });
const rain = (x1, x2) => I(Array.from({ length: 22 }, (_, k) => `M${x1 + ((k * 37) % (x2 - x1))} ${10 + ((k * 53) % 180)} l-3 9`).join(' '), 1);
const umbrella = (x, y, len = 40) => both('w-door', `M${x - 26} ${y} Q${x - 24} ${y - 26} ${x} ${y - 28} Q${x + 24} ${y - 26} ${x + 26} ${y} Q${x + 13} ${y - 6} ${x} ${y} Q${x - 13} ${y - 6} ${x - 26} ${y} Z`, 1.5) + I(`M${x} ${y - 28} V${y + len} q0 6 -5 6`, 1.6);

export const PANELS = [
  {
    svg: [
      sky(240), sun(270, 40, 15),
      tree(40, 200, 44, { seed: 2 }), tree(120, 196, 36, { seed: 4 }),
      grass(),
      bench(150, 214),
      figure('rana', { x: 216, y: 234, look: -1, mood: 'talk', armL: 'up' }),
      figure('nader', { x: 84, y: 236, look: 1, mood: 'smile' }),
    ].join(''),
    alt: 'A sunny Monday in the park. Rana points up at the sun.',
    bubbles: [{ who: 'rana', ar: 'الْيَوْمُ الِاثْنَيْن، وَالْجَوُّ مُشْمِس.', en: 'Today is Monday, and the weather is sunny.', clip: 's-w11-r1', x: 34, y: 6, tail: 'down-right' }],
  },
  {
    svg: [
      // right half: summer · left half: winter (read right to left)
      W('w-sky', 'M160 0 H320 V240 H160 Z'), sun(282, 40, 16),
      W('w-sand', 'M160 196 H320 V240 H160 Z'),
      W('#8E9DB0', 'M0 0 H160 V240 H0 Z'), W('#C9D4DE', 'M0 196 H160 V240 H0 Z'), rain(4, 156),
      I('M0 196 H320', 1.4),
      figure('nader', { x: 240, y: 268, s: 1.2, look: 0, mood: 'surprised', armR: 'hold', shirt: '#F2DEA3', collar: 'tee' }),
      figure('nader', { x: 80, y: 268, s: 1.2, look: 0, mood: 'think', armR: 'hold', shirt: '#56606E', trousers: '#3B3F4A' }),
      LAYER,
      umbrella(92, 74, 92),
      D('w-sky', [[228, 108, 1.8], [252, 112, 1.6], [240, 100, 1.4]]),
      LAYER,
      W('w-white', 'M157 0 H163 V240 H157 Z'), I('M157 0 V240 M163 0 V240', 2),
    ].join(''),
    alt: 'A split picture: on the right, Nader sweats in the summer sun; on the left, he shelters under an umbrella in the winter rain.',
    bubbles: [
      { who: 'caption', ar: 'فِي الصَّيْف الْجَوُّ حَارّ.', en: 'In summer the weather is hot.', clip: 's-w11-r2', x: 97, y: 4, align: 'right' },
      { who: 'caption', ar: 'وَفِي الشِّتَاء الْجَوُّ بَارِد وَمُمْطِر.', en: 'And in winter the weather is cold and rainy.', clip: 's-w11-r3', x: 3, y: 4 },
    ],
  },
  {
    svg: [
      sky(240),
      blossom(60, 200, 50, 1), blossom(170, 190, 42, 3), blossom(280, 200, 48, 5),
      grass(200),
      D('w-rose', [[30, 214, 3], [70, 222, 3], [120, 216, 3], [200, 226, 3], [250, 214, 3], [300, 224, 3]]),
      figure('rana', { x: 112, y: 290, s: 1.25, look: 1, mood: 'celebrate', armL: 'open', armR: 'open' }),
      figure('nader', { x: 236, y: 292, s: 1.25, look: -1, mood: 'smile' }),
    ].join(''),
    alt: 'Spring: the trees are full of pink blossom. Rana spreads her arms.',
    bubbles: [{ who: 'rana', ar: 'الرَّبِيعُ جَمِيل جِدًّا.', en: 'Spring is very beautiful.', clip: 's-w11-r4', gloss: [['جِدًّا', 'very']], x: 6, y: 8, tail: 'down-right' }],
  },
  {
    svg: [
      W('w-awning', 'M0 0 H320 V100 H0 Z'), W('w-lamp', 'M0 90 H320 V130 H0 Z'), W('#F3C7A0', 'M0 126 H320 V200 H0 Z'), both('w-lamp', circ(160, 128, 22), 1.3),
      tree(40, 204, 40, { seed: 6 }), tree(286, 200, 36, { seed: 8 }),
      grass(196),
      bench(116, 216),
      figure('nader', { x: 230, y: 236, look: -1, mood: 'talk', armL: 'wave' }),
      figure('rana', { x: 100, y: 234, look: 1, mood: 'smile', armR: 'wave' }),
    ].join(''),
    alt: 'Sunset in the park. Nader and Rana wave goodbye until tomorrow.',
    bubbles: [{ who: 'nader', ar: 'غَدًا الثُّلَاثَاء.', en: 'Tomorrow is Tuesday.', clip: 's-w11-r5', x: 58, y: 8, tail: 'down-right' }],
  },
];
