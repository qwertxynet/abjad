// Week 4 · The school. Nader's car, where everyone is from, and a hungry Nader.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure, seated } from '../cast.mjs';
import { both, circ, ell, sky, table, arch, glass } from './kit.mjs';

/** Nader's little round car, front wheel up on the kerb (k = how much it tilts). */
function car(x0, y0, k = 0.1) {
  const P = (x, y) => `${(x0 + x).toFixed(1)} ${(y0 + y - k * x).toFixed(1)}`;
  const body = `M${P(0, -10)} Q${P(0, -24)} ${P(14, -26)} L${P(28, -28)} Q${P(36, -46)} ${P(56, -46)} Q${P(76, -46)} ${P(84, -28)} L${P(92, -26)} Q${P(100, -24)} ${P(100, -10)} Z`;
  const win = `M${P(34, -28)} Q${P(40, -42)} ${P(54, -42)} L${P(54, -28)} Z M${P(58, -42)} Q${P(72, -42)} ${P(78, -28)} L${P(58, -28)} Z`;
  const [w1x, w1y] = P(22, 0).split(' ').map(Number), [w2x, w2y] = P(78, 0).split(' ').map(Number);
  return both('w-roof', body, 1.8) + both('w-sky', win, 1.3) + I(`M${P(56, -28)} L${P(56, -10)} M${P(46, -22)} h4`, 1.1) +
    W('w-lamp', circ(...P(97, -18).split(' ').map(Number), 3)) +
    W('w-hair', circ(w1x, w1y, 9) + ' ' + circ(w2x, w2y, 9)) + I(circ(w1x, w1y, 9) + ' ' + circ(w2x, w2y, 9) + ' ' + circ(w1x, w1y, 3.5) + ' ' + circ(w2x, w2y, 3.5), 1.5);
}
const school = () => [
  sky(240),
  W('w-stone', 'M10 214 V66 H310 V214 Z'), I('M10 214 V66 H310 V214 M4 66 H316 M4 58 H316 V66 M4 58 V66', 1.8),
  W('w-roof', 'M4 58 H316 V66 H4 Z'),
  ...[40, 90, 230, 280].map((x) => W('w-sky', arch(x - 14, 120, 28, 40)) + I(arch(x - 14, 120, 28, 40) + ` M${x} ${84} V120`, 1.4)),
  W('w-door', arch(130, 214, 60, 96)), I(arch(130, 214, 60, 96) + ' M160 118 V214', 2),
  I('M150 100 h20', 1.2), W('w-lamp', 'M154 76 h12 v12 h-12 Z'), I('M154 76 h12 v12 h-12 Z M160 76 v-6', 1.2),
].join('');
const board = () => W('#3F5A4A', 'M60 30 H260 V110 H60 Z') + I('M56 26 H264 V114 H56 Z M60 30 H260 V110 H60 Z', 2) +
  W('w-white:fine', 'M90 70 q14 12 28 0 q-14 8 -28 0 Z M140 66 q12 14 30 2 q-14 9 -30 -2 Z M196 72 q12 10 26 -2 q-12 7 -26 2 Z') +
  D('w-white:fine', [[104, 82, 2], [150, 54, 2], [156, 50, 2], [162, 54, 2], [210, 58, 2]]);

export const PANELS = [
  {
    svg: [
      school(),
      W('w-sand', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320', 1.6),
      W('w-stone', 'M0 208 H120 V214 H0 Z'), I('M0 208 H120 V214', 1.2),
      LAYER,
      car(8, 232, 0.12),
      figure('nader', { x: 226, y: 234, look: -1, mood: 'celebrate', armL: 'point', armR: 'hip' }),
    ].join(''),
    alt: 'Nader’s little red car is parked crookedly, one wheel on the kerb, outside the school. Nader is very proud of it.',
    bubbles: [{ who: 'caption', ar: 'سَيَّارَةُ نَادِر', en: 'Nader’s car', clip: 's-w04-p3', x: 97, y: 4, align: 'right' }],
  },
  {
    svg: [
      W('w-wall', 'M0 0 H320 V240 H0 Z'),
      board(),
      figure('teacher', { x: 34, y: 214, s: 0.9, look: 1, mood: 'smile', armR: 'point' }),
      seated('nader', { x: 150, y: 302, s: 1.2, look: 1, mood: 'talk' }),
      seated('rana', { x: 254, y: 302, s: 1.2, look: -1, mood: 'talk', armL: 'hip' }),
      LAYER,
      table(206),
    ].join(''),
    alt: 'In class. Rana says she is from Egypt; Nader says he is from Beirut.',
    bubbles: [
      { who: 'caption', ar: 'رَنَا مِنْ مِصْر، وَنَادِر مِنْ بَيْرُوت.', en: 'Rana is from Egypt, and Nader is from Beirut.', clip: 's-w04-s1', x: 97, y: 4, align: 'right' },
      { who: 'rana', ar: 'أَنَا مِنْ مِصْر.', en: 'I am from Egypt.', spoken: true, x: 66, y: 19, tail: 'down-right' },
      { who: 'nader', ar: 'وَأَنَا مِنْ بَيْرُوت.', en: 'And I am from Beirut.', spoken: true, x: 26, y: 28, tail: 'down-right' },
    ],
  },
  {
    svg: [
      W('w-wall', 'M0 0 H320 V240 H0 Z'),
      // the school photo on the wall
      both('w-wood', 'M20 22 h84 v62 h-84 Z', 1.8), W('w-sky', 'M26 28 h72 v50 h-72 Z'),
      W('w-stone', 'M34 78 V50 H90 V78 Z'), I('M34 78 V50 H90 V78 M30 50 H94 M56 78 V62 Q62 56 68 62 V78', 1),
      seated('nader', { x: 138, y: 366, s: 1.45, look: 0, mood: 'sleepy' }),
      figure('rana', { x: 252, y: 292, s: 1.2, look: -1, mood: 'surprised', armL: 'open', armR: 'rest' }),
      LAYER,
      table(196),
      both('w-shirt', 'M84 204 q0 -20 22 -20 h64 q22 0 22 20 Z', 1.8),
      I('M110 186 q-4 8 0 18 M166 186 q4 8 0 18', 1.2),
      D('w-skin-n', [[100, 200, 5.5], [176, 200, 5.5]]), D('ink', [[100, 200, 5.5], [176, 200, 5.5]], 5.5, 1.3),
    ].join(''),
    alt: 'Nader has his head down on the desk. Rana is worried. On the wall hangs a photo of the school.',
    bubbles: [
      { who: 'caption', ar: 'صُورَةُ الْمَدْرَسَة', en: 'The picture of the school', clip: 's-w04-p1', x: 34, y: 37 },
      { who: 'rana', ar: 'نَادِر مَرِيض؟', en: 'Is Nader sick?', clip: 's-w04-p4', x: 58, y: 12, tail: 'down-right' },
    ],
  },
  {
    svg: [
      W('w-wall', 'M0 0 H320 V240 H0 Z'),
      // Nader's daydream: tea and eggs
      both('w-white', 'M196 78 q-14 0 -14 -12 q0 -14 16 -12 q4 -16 22 -12 q12 -12 28 -2 q18 -4 22 12 q14 4 8 16 q-2 10 -16 10 Z', 1.5),
      D('w-white', [[196, 92, 4], [204, 102, 2.6]]), D('ink', [[196, 92, 4], [204, 102, 2.6]], 3, 1),
      glass(222, 70, 'w-roof'),
      W('w-white', ell(248, 64, 8, 10) + ' ' + ell(264, 66, 7, 9)), I(ell(248, 64, 8, 10) + ' ' + ell(264, 66, 7, 9), 1.2),
      figure('rana', { x: 74, y: 292, s: 1.2, look: 1, mood: 'laugh', armR: 'hip' }),
      seated('nader', { x: 214, y: 300, s: 1.2, look: -1, mood: 'celebrate', armL: 'up', armR: 'rest' }),
      LAYER,
      table(206),
    ].join(''),
    alt: 'Nader sits up, wide awake: he is not sick, just hungry, and dreams of tea and eggs. Rana laughs.',
    bubbles: [{ who: 'nader', ar: 'لَا! شَاي وَبَيْض؟', en: 'No! Tea and eggs?', x: 28, y: 12, tail: 'down-right' }],
  },
];
