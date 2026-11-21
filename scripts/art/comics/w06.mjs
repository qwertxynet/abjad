// Week 6 · The souq. Apples and oranges, Nader's friend Sami from Iraq, apple juice, and the moon.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure } from '../cast.mjs';
import { both, circ, crate, fanous, handAt, glass, stars, table } from './kit.mjs';

const arcade = (fill = 'w-stone', lit = false) => [
  W(fill, 'M0 0 H320 V214 H0 Z'),
  ...[20, 120, 220].map((x) => W(lit ? 'w-night' : 'w-shadow', `M${x} 214 V90 Q${x + 40} 40 ${x + 80} 90 V214 Z`) + I(`M${x} 214 V90 Q${x + 40} 40 ${x + 80} 90 V214`, 2)),
  I('M0 30 H320 M0 36 H320', 1.3),
].join('');
const stand = (x, y, w, fruit, r = 5) => crate(x, y, w, fruit, r) + both('w-wood', `M${x - 2} ${y + 26} h${w + 4} v-26 h${-w - 4} Z`, 1.4);

export const PANELS = [
  {
    svg: [
      arcade(),
      fanous(60, 64), fanous(160, 64), fanous(260, 64),
      stand(30, 176, 56, 'w-roof', 5.5), stand(230, 176, 60, 'w-awning', 5.5),
      W('w-sand', 'M0 202 H320 V240 H0 Z'), I('M0 202 H320', 1.6),
      LAYER,
      figure('rana', { x: 132, y: 232, s: 0.95, look: 1, mood: 'smile' }),
      figure('nader', { x: 182, y: 234, s: 0.95, look: -1, mood: 'talk', armR: 'point' }),
    ].join(''),
    alt: 'The covered souq: stone arches, hanging lanterns and stands of red apples and oranges. Nader and Rana walk through.',
    bubbles: [{ who: 'caption', ar: 'فِي السُّوق تُفَّاح وَبُرْتُقَال.', en: 'In the market there are apples and oranges.', clip: 's-w06-s1', x: 97, y: 4, align: 'right' }],
  },
  {
    svg: [
      arcade(),
      fanous(100, 50), fanous(240, 50),
      figure('rana', { x: 50, y: 292, s: 1.25, look: 1, mood: 'smile', armR: 'wave' }),
      figure('sami', { x: 150, y: 292, s: 1.25, look: 1, mood: 'celebrate', armL: 'wave' }),
      figure('nader', { x: 252, y: 292, s: 1.25, look: -1, mood: 'talk', armL: 'open' }),
    ].join(''),
    alt: 'Nader introduces his friend Sami, in a yellow T-shirt, to Rana. Sami waves.',
    bubbles: [
      { who: 'nader', ar: 'صَدِيقِي سَامِي، مِنَ الْعِرَاق.', en: 'My friend Sami, from Iraq.', x: 52, y: 7, tail: 'down-right' },
      { who: 'rana', ar: 'أَهْلًا!', en: 'Hi!', clip: 's-w01-o2', spoken: true, x: 3, y: 19, tail: 'down-right' },
    ],
  },
  {
    svg: (() => {
      const [gx, gy] = handAt(232, 290, 1.25, 'hold', -1);
      const [rx, ry] = handAt(80, 290, 1.25, 'hold', 1);
      return [
        W('w-wall', 'M0 0 H320 V240 H0 Z'),
        both('w-awning', 'M0 0 H320 V22 Q300 32 280 22 Q260 32 240 22 Q220 32 200 22 Q180 32 160 22 Q140 32 120 22 Q100 32 80 22 Q60 32 40 22 Q20 32 0 22 Z', 1.5),
        I('M20 70 H140 M180 70 H300', 2),
        crate(24, 70, 50, 'w-roof', 5.5), crate(80, 70, 56, 'w-awning', 5.5), crate(184, 70, 50, 'w-leaf', 5.5), crate(240, 70, 56, 'w-roof', 5.5),
        figure('rana', { x: 80, y: 290, s: 1.25, look: 1, mood: 'smile', armR: 'hold' }),
        figure('sami', { x: 232, y: 290, s: 1.25, look: -1, mood: 'talk', armL: 'hold' }),
        LAYER,
        glass(gx, gy + 4, 'w-lamp'), glass(rx, ry + 4, 'w-lamp'),
        table(206),
        glass(140, 206, 'w-lamp'), glass(156, 206, 'w-awning'), both('w-roof', circ(176, 200, 6), 1.2), both('w-awning', circ(190, 200, 6), 1.2),
      ].join('');
    })(),
    alt: 'At the juice stall. Sami offers apple juice; Rana already has a glass.',
    bubbles: [{ who: 'sami', ar: 'عَصِيرُ تُفَّاح؟', en: 'Apple juice?', x: 60, y: 14, tail: 'down-right' }],
  },
  {
    lit: true,
    svg: [
      W('w-night', 'M0 0 H320 V240 H0 Z'),
      both('w-lamp', circ(250, 50, 22), 1.4), W('w-white:fine', circ(244, 44, 5) + ' ' + circ(258, 58, 3)),
      stars([[30, 30], [80, 18], [120, 50], [170, 24], [200, 70], [300, 100]]),
      W('#5E5878', 'M0 240 V110 Q40 80 80 110 Q120 80 160 110 Q200 80 240 110 Q280 80 320 110 V240 Z'), I('M0 110 Q40 80 80 110 Q120 80 160 110 Q200 80 240 110 Q280 80 320 110', 1.6),
      fanous(80, 132), fanous(240, 132),
      W('#7A6A58', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320', 1.6),
      figure('nader', { x: 220, y: 236, look: -1, mood: 'smile' }),
      figure('sami', { x: 160, y: 236, look: 1, mood: 'smile' }),
      figure('rana', { x: 96, y: 234, look: 1, mood: 'talk', armR: 'up' }),
    ].join(''),
    alt: 'Night over the souq. A big full moon rises above the arches; Rana points up at it.',
    bubbles: [{ who: 'rana', ar: 'الْقَمَرُ جَمِيل.', en: 'The moon is beautiful.', clip: 's-w06-p1', x: 4, y: 24, tail: 'down-right' }],
  },
];
