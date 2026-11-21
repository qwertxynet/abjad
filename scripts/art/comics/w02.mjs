// Week 2 · The garden. Figs, olives, berries, and Beirut.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure } from '../cast.mjs';
import { both, circ, ell, sky, tree, arch, handAt } from './kit.mjs';

const wall = (y1, y2) => W('w-stone', `M0 ${y1} H320 V${y2} H0 Z`) + I(`M0 ${y1} H320 ` +
  Array.from({ length: Math.floor((y2 - y1) / 16) }, (_, r) => `M0 ${y1 + 16 * (r + 1)} H320 ` + Array.from({ length: 9 }, (_, c) => `M${c * 40 + (r % 2) * 20} ${y1 + 16 * r} v16`).join(' ')).join(' '), 0.9);
const FIG = { leaf: 'w-leaf', fruit: ['w-purple', 3.4] };
const OLIVE = { leaf: '#A9B98F', fruit: ['#556B35', 2.2] };

export const PANELS = [
  {
    svg: [
      sky(120),
      tree(60, 150, 46, { ...FIG, seed: 1 }),
      tree(272, 150, 40, { ...OLIVE, seed: 3 }),
      LAYER,
      wall(110, 214),
      W('w-stone', 'M0 104 H320 V112 H0 Z'), I('M0 104 H320 M0 112 H320', 1.6),
      // the gate, open onto the garden
      W('w-leaf', arch(168, 214, 72, 108)), I(arch(168, 214, 72, 108), 2.2),
      W('w-leaf', 'M180 214 q8 -30 20 -36 q12 8 18 36 Z'),
      W('w-door', 'M240 214 L262 204 V124 L240 118 Z'), I('M240 214 L262 204 V124 L240 118 M246 200 V130 M254 198 V128', 1.6),
      W('w-sand', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320 M30 228 h50 M150 232 h40 M240 226 h60', 1.2),
      figure('rana', { x: 204, y: 222, look: -1, mood: 'talk', armL: 'wave' }),
      figure('nader', { x: 92, y: 234, look: 1, mood: 'smile' }),
    ].join(''),
    alt: 'Rana stands in her open garden gate, under fig and olive trees, and greets Nader.',
    bubbles: [
      { who: 'caption', ar: 'بَابُ بَيْتِ رَنَا', en: 'The door of Rana’s house', x: 97, y: 4, align: 'right' },
      { who: 'rana', ar: 'كَيْفَ حَالُك؟', en: 'How are you?', clip: 's-w02-o2', spoken: true, x: 57, y: 21, tail: 'down-left' },
      { who: 'nader', ar: 'بِخَيْر، الْحَمْدُ لِلّٰه.', en: 'Fine, thank God.', clip: 's-w02-o3', spoken: true, x: 4, y: 16, tail: 'down-right' },
    ],
  },
  {
    svg: (() => {
      const [hx, hy] = handAt(86, 300, 1.35, 'hold', 1);
      const px = hx - 4, py = hy - 30;
      return [
        sky(240),
        tree(40, 200, 60, { ...FIG, seed: 2 }),
        tree(300, 210, 56, { ...OLIVE, seed: 5 }),
        W('w-leaf', 'M0 196 Q160 186 320 196 V240 H0 Z'),
        figure('nader', { x: 236, y: 300, s: 1.35, look: -1, mood: 'talk', armR: 'hip' }),
        figure('rana', { x: 86, y: 300, s: 1.35, look: 1, mood: 'smile', armR: 'hold' }),
        LAYER,
        // Rana's holiday photo of Beirut: the sea and the Pigeon Rocks
        both('w-white', `M${px - 22} ${py + 16} h44 v-34 h-44 Z`, 1.6),
        W('w-sky', `M${px - 18} ${py + 2} h36 v-16 h-36 Z`), W('#4F86B0', `M${px - 18} ${py + 12} h36 v-10 h-36 Z`),
        both('w-stone', `M${px + 2} ${py + 10} q2 -12 6 -12 q4 0 5 6 q2 -6 4 -2 l1 8 Z`, 0.9),
        I(`M${px - 18} ${py + 2} h36`, 0.8),
      ].join('');
    })(),
    alt: 'In the garden. Nader says he is from Beirut; Rana shows him her photo of Beirut’s sea and the Pigeon Rocks.',
    bubbles: [
      { who: 'caption', ar: 'زَارَتْ رَنَا بَيْرُوت.', en: 'Rana visited Beirut.', clip: 's-w02-s1', x: 97, y: 4, align: 'right' },
      { who: 'nader', ar: 'أَنَا مِنْ بَيْرُوت.', en: 'I am from Beirut.', spoken: true, x: 58, y: 17, tail: 'down-right' },
      { who: 'rana', ar: 'بَيْرُوت!', en: 'Beirut!', x: 10, y: 22, tail: 'down-right' },
    ],
  },
  {
    svg: (() => {
      const [bx, by] = handAt(70, 254, 1.15, 'hold', 1);
      return [
        sky(240),
        tree(118, 210, 62, { ...FIG, seed: 4 }),
        tree(226, 214, 52, { ...OLIVE, seed: 6 }),
        W('w-leaf', 'M0 200 Q160 190 320 200 V240 H0 Z'), I('M0 200 Q160 190 320 200', 1.4),
        figure('nader', { x: 252, y: 254, s: 1.15, look: -1, mood: 'celebrate', armL: 'point' }),
        figure('rana', { x: 70, y: 254, s: 1.15, look: 1, mood: 'smile', armR: 'hold' }),
        LAYER,
        both('w-white', `M${bx - 14} ${by - 4} q14 16 28 0 Z`, 1.4),
        D('w-purple', [[bx - 8, by - 6, 3.2], [bx - 2, by - 8, 3.2], [bx + 4, by - 6, 3.2], [bx + 9, by - 5, 3], [bx + 1, by - 3, 3]]),
        I([[bx - 8, by - 6], [bx - 2, by - 8], [bx + 4, by - 6], [bx + 9, by - 5]].map(([x, y]) => circ(x, y, 3.2)).join(' '), 0.8),
      ].join('');
    })(),
    alt: 'Under the fig and olive trees. Nader points at the fruit; Rana holds a bowl of berries.',
    bubbles: [
      { who: 'nader', ar: 'تِين وَزَيْتُون!', en: 'Figs and olives!', clip: 's-w02-p3', x: 62, y: 8, tail: 'down-right' },
      { who: 'rana', ar: 'وَتُوت!', en: 'And berries!', x: 8, y: 20, tail: 'down-right' },
    ],
  },
  {
    svg: [
      sky(240, 'w-sky'),
      W('w-leaf', 'M0 240 V120 Q30 90 70 100 Q100 70 140 96 Q170 80 200 100 Q240 76 280 98 Q306 90 320 110 V240 Z'),
      I('M0 120 Q30 90 70 100 Q100 70 140 96 Q170 80 200 100 Q240 76 280 98 Q306 90 320 110', 1.6),
      D('w-purple', [[30, 130, 4], [52, 118, 4], [96, 112, 4], [150, 118, 4], [180, 110, 4], [260, 116, 4], [292, 126, 4], [20, 160, 4], [300, 160, 4]]),
      figure('rana', { x: 104, y: 330, s: 1.7, look: 0, mood: 'surprised', armL: 'open', armR: 'open', hands: 'w-purple' }),
      figure('nader', { x: 262, y: 330, s: 1.7, look: -1, mood: 'laugh', armL: 'point' }),
    ].join(''),
    alt: 'Rana holds up her hands: they are purple from the berries. Nader laughs.',
    bubbles: [{ who: 'nader', ar: 'يَدُ رَنَا!', en: 'Rana’s hand!', x: 64, y: 8, tail: 'down-right' }],
  },
];
