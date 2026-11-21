// Week 13 · Grandma's house. Layla, her parents in a photo, her brother and sisters, and her grandmother from Iraq.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure } from '../cast.mjs';
import { both, circ, sky, arch, frame } from './kit.mjs';

const room = () => W('w-wall', 'M0 0 H320 V240 H0 Z') + W('#B85A45', 'M0 206 H320 V240 H0 Z') + I('M0 206 H320', 1.6) +
  I(Array.from({ length: 8 }, (_, k) => `M${k * 44 + 10} 220 l10 -8 l10 8 l-10 8 Z`).join(' '), 0.9);
const cat = (x, y) => both('w-awning', `M${x} ${y} q-2 -16 10 -18 l2 -6 l3 6 h4 l3 -6 l2 6 q8 4 6 18 Z`, 1.3) + I(`M${x + 26} ${y} q10 -2 8 -14`, 1.4) + D('ink', [[x + 11, y - 13, 0.7], [x + 17, y - 13, 0.7]], 0.7, 1.4);

export const PANELS = [
  {
    svg: [
      sky(240),
      W('w-stone', 'M20 214 V40 H300 V214 Z'), I('M20 214 V40 H300 V214 M14 40 H306', 1.8),
      // carved wooden balcony
      both('w-wood', 'M70 110 h180 v-60 h-180 Z', 1.8), I(Array.from({ length: 12 }, (_, k) => `M${80 + k * 15} 56 v48`).join(' ') + ' M70 70 h180 M70 90 h180', 1),
      W('w-door', arch(140, 214, 40, 70)), I(arch(140, 214, 40, 70), 2),
      W('w-sand', 'M0 214 H320 V240 H0 Z'), I('M0 214 H320 M128 214 h64 v6 h-64', 1.6),
      cat(150, 214),
      figure('layla', { x: 236, y: 234, look: -1, mood: 'talk', armL: 'wave' }),
      figure('rana', { x: 60, y: 236, look: 1, mood: 'smile' }),
      figure('nader', { x: 104, y: 238, look: 1, mood: 'smile' }),
    ].join(''),
    alt: 'Grandma’s house, with a carved wooden balcony and a cat on the step. Layla waves to Nader and Rana.',
    bubbles: [{ who: 'layla', ar: 'اِسْمِي لَيْلَى.', en: 'My name is Layla.', clip: 's-w13-r1', x: 62, y: 18, tail: 'down-right' }],
  },
  {
    svg: [
      room(),
      frame(40, 30, 130, 100,
        figure('ahmad', { x: 82, y: 154, s: 0.62, look: 1, mood: 'smile' }) + figure('salma', { x: 128, y: 152, s: 0.62, look: -1, mood: 'smile' }),
        'w-wood', 'w-sky'),
      LAYER,
      W('w-wall', 'M0 130 H320 V206 H0 Z'), W('w-wall', 'M0 0 H40 V130 H0 Z M170 0 H320 V130 H170 Z M40 0 H170 V30 H40 Z'),
      I('M40 30 h130 v100 h-130 Z', 1.8),
      W('#B85A45', 'M0 206 H320 V240 H0 Z'), I('M0 206 H320', 1.6),
      figure('layla', { x: 240, y: 300, s: 1.3, look: -1, mood: 'talk', armL: 'point' }),
    ].join(''),
    alt: 'Layla points to a framed photo of her parents, Ahmad and Salma.',
    bubbles: [{ who: 'layla', ar: 'أَبِي اِسْمُهُ أَحْمَد، وَأُمِّي اِسْمُهَا سَلْمَى.', en: 'My father’s name is Ahmad, and my mother’s name is Salma.', clip: 's-w13-r2', x: 44, y: 46, tail: 'down-right' }],
  },
  {
    svg: [
      room(),
      figure('layla', { x: 260, y: 290, s: 1.25, look: -1, mood: 'smile', armL: 'open' }),
      figure('sami', { x: 170, y: 270, s: 1.0, look: 1, mood: 'laugh', skin: '#C99366', hair: 'short', shirt: '#C8553D', armR: 'wave' }),
      figure('layla', { x: 100, y: 262, s: 0.86, look: 1, mood: 'celebrate', hair: 'bun', tunic: '#A9C4D6', panel: null, trim: null, armL: 'up' }),
      figure('layla', { x: 42, y: 256, s: 0.74, look: 1, mood: 'smile', tunic: '#E8B8A4', panel: null, trim: 'w-roof', armR: 'wave' }),
    ].join(''),
    alt: 'Layla’s younger brother and two little sisters come running in, waving.',
    bubbles: [{ who: 'layla', ar: 'عِنْدِي أَخٌ وَاحِد وَأُخْتَان.', en: 'I have one brother and two sisters.', clip: 's-w13-r3', gloss: [['أُخْتَان', 'two sisters']], x: 54, y: 8, tail: 'down-right' }],
  },
  {
    svg: [
      room(),
      W('w-sky', arch(30, 160, 60, 110)), I(arch(30, 160, 60, 110), 1.8),
      figure('grandma', { x: 92, y: 294, s: 1.3, look: 1, mood: 'celebrate', armR: 'wave' }),
      figure('layla', { x: 238, y: 294, s: 1.3, look: -1, mood: 'talk', armL: 'open' }),
    ].join(''),
    alt: 'Grandma, in a white hijab and glasses, comes in smiling and waving.',
    bubbles: [
      { who: 'layla', ar: 'لَيْسَ عِنْدِي جَدّ، وَلَكِنْ عِنْدِي جَدَّة.', en: 'I don’t have a grandfather, but I have a grandmother.', clip: 's-w13-r4', gloss: [['وَلَكِنْ', 'but']], x: 46, y: 4, tail: 'down-right' },
      { who: 'caption', ar: 'جَدَّتِي مِنَ الْعِرَاق.', en: 'My grandmother is from Iraq.', clip: 's-w13-r5', x: 3, y: 20 },
    ],
  },
];
