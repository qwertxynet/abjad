// Week 14 · The falafel restaurant. Rana waits tables; Nader orders. (The reading's lines address a man: مَاذَا تُحِبّ، تَفَضَّلْ.)
import { W, I, D, LAYER } from '../paint.mjs';
import { figure, seated } from '../cast.mjs';
import { both, circ, ell, table, handAt, glass } from './kit.mjs';

const APRON = { apron: 'w-white' };
const room = () => [
  W('w-wall', 'M0 0 H320 V240 H0 Z'),
  both('w-door', 'M150 14 h150 v66 h-150 Z', 1.8), I('M160 30 h60 M160 44 h44 M160 58 h70 M250 30 h36 M256 44 h30 M244 58 h42', 1.2),
  D('w-wood', [[236, 30, 3], [242, 30, 3], [236, 44, 3], [236, 58, 3]]),
  I('M20 70 h100', 2), D('w-wood', [[30, 62, 6], [44, 62, 6], [58, 62, 6], [72, 62, 6], [86, 62, 6], [100, 62, 6]]),
].join('');
const hummus = (x, y) => both('w-white', ell(x, y, 18, 6), 1.3) + W('w-sand', ell(x, y - 1, 14, 4)) + I(`M${x - 8} ${y - 1} q8 -4 14 0`, 0.9) + D('w-leaf', [[x + 3, y - 2, 1.6]]);
const falafel = (x, y) => both('w-white', ell(x, y, 18, 6), 1.3) + D('w-wood', [[x - 8, y - 3, 4.5], [x, y - 4, 4.5], [x + 8, y - 3, 4.5], [x - 4, y - 8, 4.5], [x + 4, y - 8, 4.5]]) + I([[x - 8, y - 3], [x, y - 4], [x + 8, y - 3], [x - 4, y - 8], [x + 4, y - 8]].map(([a, b]) => circ(a, b, 4.5)).join(' '), 0.9);
const fish = (x, y) => both('w-white', ell(x, y + 4, 22, 6), 1.3) + both('#9DB8C9', `M${x - 16} ${y} q16 -12 28 0 q-12 12 -28 0 Z M${x + 12} ${y} l8 -6 v12 Z`, 1.2) + D('ink', [[x - 9, y - 1.5, 0.8]], 0.8, 1.4);

export const PANELS = [
  {
    svg: [
      room(),
      seated('nader', { x: 92, y: 300, s: 1.25, look: 1, mood: 'talk', armR: 'hold' }),
      figure('rana', { x: 232, y: 300, s: 1.3, look: -1, mood: 'talk', armL: 'hold', ...APRON }),
      LAYER,
      table(206, 'w-wood', -6, 180),
      both('w-white', 'M200 210 h26 v-30 h-26 Z', 1.3), I('M204 196 h18 M204 202 h14', 0.9),
    ].join(''),
    alt: 'The falafel restaurant. Rana, in an apron, takes Nader’s order.',
    bubbles: [
      { who: 'rana', ar: 'مَرْحَبًا! مَاذَا تُحِبّ؟', en: 'Hello! What do you like?', clip: 's-w14-r1', x: 58, y: 10, tail: 'down-right' },
      { who: 'nader', ar: 'أُحِبُّ الْحُمُّص وَالْفَلَافِل.', en: 'I like hummus and falafel.', clip: 's-w14-r2', x: 4, y: 26, tail: 'down-right' },
    ],
  },
  {
    svg: (() => {
      const [hx, hy] = handAt(232, 300, 1.3, 'hold', -1);
      return [
        room(),
        seated('nader', { x: 92, y: 300, s: 1.25, look: 1, mood: 'think', armR: 'open' }),
        figure('rana', { x: 232, y: 300, s: 1.3, look: -1, mood: 'smile', armL: 'hold', ...APRON }),
        LAYER,
        fish(hx - 4, hy - 2),
        table(206, 'w-wood', -6, 180),
      ].join('');
    })(),
    alt: 'Rana offers a plate of fish. Nader holds up a hand: no thanks.',
    bubbles: [
      { who: 'rana', ar: 'هَلْ تُحِبُّ السَّمَك؟', en: 'Do you like fish?', clip: 's-w14-r3', x: 60, y: 10, tail: 'down-right' },
      { who: 'nader', ar: 'لَا، لَا أُحِبُّ السَّمَك.', en: 'No, I don’t like fish.', clip: 's-w14-r4', x: 4, y: 24, tail: 'down-right' },
    ],
  },
  {
    svg: [
      room(),
      seated('nader', { x: 92, y: 300, s: 1.25, look: 1, mood: 'talk', armR: 'up' }),
      figure('rana', { x: 232, y: 300, s: 1.3, look: -1, mood: 'talk', armL: 'hip', ...APRON }),
      LAYER,
      table(206, 'w-wood', -6, 180),
    ].join(''),
    alt: 'Rana asks what Nader will drink. He asks for tea.',
    bubbles: [
      { who: 'rana', ar: 'وَمَاذَا تَشْرَب؟', en: 'And what will you drink?', gloss: [['تَشْرَب', 'you drink']], x: 60, y: 10, tail: 'down-right' },
      { who: 'nader', ar: 'شَاي، مِنْ فَضْلِك.', en: 'Tea, please.', gloss: [['مِنْ فَضْلِك', 'please']], x: 6, y: 24, tail: 'down-right' },
    ],
  },
  {
    svg: [
      room(),
      seated('nader', { x: 92, y: 300, s: 1.25, look: 1, mood: 'celebrate', armR: 'up' }),
      figure('rana', { x: 232, y: 300, s: 1.3, look: -1, mood: 'celebrate', armL: 'open', ...APRON }),
      LAYER,
      table(206, 'w-wood', -6, 180),
      hummus(70, 204), falafel(118, 204), glass(156, 206, 'w-roof'),
    ].join(''),
    alt: 'Rana serves hummus, falafel and tea. Nader is delighted.',
    bubbles: [{ who: 'rana', ar: 'تَفَضَّلْ! صَحْتَيْن!', en: 'Here you are! Bon appétit!', clip: 's-w14-r6', x: 54, y: 10, tail: 'down-right' }],
  },
];
