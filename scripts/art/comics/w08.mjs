// Week 8 · The café on the corner. Welcome, students, water please, thank you, goodbye.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure, seated } from '../cast.mjs';
import { both, circ, lights, table, cup, glass, arch } from './kit.mjs';

const awning = (y) => W('w-awning', `M0 ${y} H320 V${y + 22} Q300 ${y + 32} 280 ${y + 22} Q260 ${y + 32} 240 ${y + 22} Q220 ${y + 32} 200 ${y + 22} Q180 ${y + 32} 160 ${y + 22} Q140 ${y + 32} 120 ${y + 22} Q100 ${y + 32} 80 ${y + 22} Q60 ${y + 32} 40 ${y + 22} Q20 ${y + 32} 0 ${y + 22} Z`) +
  I(`M0 ${y} H320 M0 ${y + 22} Q20 ${y + 32} 40 ${y + 22} Q60 ${y + 32} 80 ${y + 22} Q100 ${y + 32} 120 ${y + 22} Q140 ${y + 32} 160 ${y + 22} Q180 ${y + 32} 200 ${y + 22} Q220 ${y + 32} 240 ${y + 22} Q260 ${y + 32} 280 ${y + 22} Q300 ${y + 32} 320 ${y + 22}`, 1.5) +
  I(Array.from({ length: 16 }, (_, k) => `M${k * 20 + 10} ${y} v24`).join(' '), 0.9);
const inside = () => W('w-dusk', 'M0 0 H320 V240 H0 Z') + I('M0 120 H320', 1.2) + W('w-wood', 'M0 120 H320 V240 H0 Z') +
  lights(-10, 14, 330, 14, 10, 10) + both('w-white', 'M240 30 h60 v40 h-60 Z', 1.4) + I('M250 42 h40 M250 52 h30 M250 60 h36', 0.9);

export const PANELS = [
  {
    lit: true,
    svg: [
      W('w-night', 'M0 0 H320 V60 H0 Z'),
      W('w-stone', 'M0 50 H320 V214 H0 Z'),
      awning(56),
      lights(-6, 40, 326, 40, 10, 8),
      W('w-lamp', arch(120, 214, 80, 120)), I(arch(120, 214, 80, 120), 2.2),
      W('w-lamp', 'M20 110 h80 v60 h-80 Z M220 110 h80 v60 h-80 Z'), I('M20 110 h80 v60 h-80 Z M60 110 v60 M220 110 h80 v60 h-80 Z M260 110 v60', 1.6),
      W('#7A6A58', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320', 1.6),
      figure('owner', { x: 160, y: 226, look: 0, mood: 'celebrate', armL: 'open', armR: 'open' }),
      figure('rana', { x: 52, y: 238, look: 1, mood: 'smile' }),
      figure('nader', { x: 272, y: 238, look: -1, mood: 'smile' }),
    ].join(''),
    alt: 'Evening at the café on the corner. The owner, in a red waistcoat, opens his arms in welcome under the string lights.',
    bubbles: [
      { who: 'owner', ar: 'أَهْلًا وَسَهْلًا!', en: 'Welcome!', clip: 's-w08-p3', x: 60, y: 6, tail: 'down-left' },
      { who: 'owner', ar: 'مَسَاءُ الْخَيْر.', en: 'Good evening.', clip: 's-w08-p2', x: 20, y: 14, tail: 'down-right' },
    ],
  },
  {
    lit: true,
    svg: [
      inside(),
      seated('rana', { x: 64, y: 300, s: 1.25, look: 1, mood: 'smile' }),
      seated('nader', { x: 256, y: 300, s: 1.25, look: -1, mood: 'smile' }),
      figure('owner', { x: 160, y: 270, s: 1.1, look: 0, mood: 'talk', armR: 'hold', armL: 'point' }),
      LAYER,
      table(206),
      cup(120, 206), cup(200, 206),
    ].join(''),
    alt: 'Inside. Nader and Rana sit at a table; the owner points at them, one after the other.',
    bubbles: [{ who: 'owner', ar: 'أَنْتَ طَالِب وَأَنْتِ طَالِبَة؟', en: 'You (m) are a student, and you (f) are a student?', x: 24, y: 7, tail: 'down-right' }],
  },
  {
    lit: true,
    svg: [
      inside(),
      seated('rana', { x: 210, y: 296, s: 1.4, look: -1, mood: 'talk', armL: 'hold' }),
      seated('nader', { x: 74, y: 300, s: 1.3, look: 1, mood: 'talk', armR: 'up' }),
      LAYER,
      table(206),
      cup(150, 206), glass(170, 206, 'w-sky'),
    ].join(''),
    alt: 'Rana introduces herself; Nader raises his hand to ask for water.',
    bubbles: [
      { who: 'rana', ar: 'أَنَا اسْمِي رَنَا، أَنَا مِنْ مِصْر.', en: 'My name is Rana, I am from Egypt.', clip: 's-w08-s1', x: 40, y: 6, tail: 'down-right' },
      { who: 'nader', ar: 'مَاء، مِنْ فَضْلِك.', en: 'Water, please.', x: 3, y: 22, tail: 'down-left' },
    ],
  },
  {
    lit: true,
    svg: [
      W('w-night', 'M0 0 H320 V240 H0 Z'),
      D('w-lamp', [[30, 20, 1.3], [90, 36, 1.2], [200, 16, 1.3], [290, 30, 1.2]]),
      W('w-stone', 'M150 30 H320 V214 H150 Z'), I('M150 214 V30 H320', 1.6),
      lights(150, 50, 326, 50, 7, 8),
      W('w-lamp', arch(200, 214, 70, 110)), I(arch(200, 214, 70, 110), 2),
      W('#7A6A58', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320', 1.6),
      figure('owner', { x: 236, y: 222, look: -1, mood: 'smile', armL: 'wave' }),
      figure('nader', { x: 124, y: 236, look: 1, mood: 'smile', armR: 'wave' }),
      figure('rana', { x: 58, y: 234, look: 1, mood: 'talk', armR: 'wave' }),
    ].join(''),
    alt: 'Leaving the café under the lights. Everyone waves goodbye.',
    bubbles: [
      { who: 'nader', ar: 'شُكْرًا!', en: 'Thank you!', clip: 'w-shukran', x: 36, y: 14, tail: 'down-right' },
      { who: 'owner', ar: 'عَفْوًا!', en: 'You’re welcome!', clip: 'w-afwan', x: 74, y: 22, tail: 'down-left' },
      { who: 'rana', ar: 'مَعَ السَّلَامَة!', en: 'Goodbye!', clip: 's-w08-s2', x: 2, y: 28, tail: 'down-right' },
    ],
  },
];
