// Week 15 · The clock tower square. Salma (Layla's mother) and her day, with the time in every panel.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure, seated } from '../cast.mjs';
import { both, circ, sky, clock, table, cup, handAt, book, moon, stars, arch } from './kit.mjs';

const tower = (x, h, m, top = 20) => both('w-stone', `M${x - 26} 214 V${top + 20} h52 V214 Z`, 1.8) + both('w-roof', `M${x - 30} ${top + 20} L${x} ${top - 6} L${x + 30} ${top + 20} Z`, 1.6) +
  clock(x, top + 48, 18, h, m) + I(`M${x - 26} ${top + 80} h52 M${x - 10} 214 V${top + 130} q10 -12 20 0 V214`, 1.4);
const square = (skyCls = 'w-sky') => sky(214, skyCls) + W('w-sand', 'M0 214 H320 V240 H0 Z') + I('M0 214 H320 M30 226 h40 M140 230 h40 M250 224 h40', 1.3);

export const PANELS = [
  {
    svg: (() => {
      const [hx, hy] = handAt(208, 300, 1.25, 'hold', -1);
      return [
        square(),
        tower(70, 7, 0),
        seated('salma', { x: 208, y: 300, s: 1.25, look: -1, mood: 'talk', armL: 'hold' }),
        LAYER,
        cup(hx - 2, hy + 4),
        table(210, 'w-wood', 120, 326),
      ].join('');
    })(),
    alt: 'Seven o’clock on the tower clock. Salma has her morning coffee at a café table in the square.',
    bubbles: [
      { who: 'salma', ar: 'أَنَا سَلْمَى.', en: 'I am Salma.', clip: 's-w15-r1', x: 72, y: 8, tail: 'down-left' },
      { who: 'salma', ar: 'أَسْتَيْقِظُ السَّاعَةَ السَّابِعَة وَأَشْرَبُ الْقَهْوَة.', en: 'I wake up at seven and drink coffee.', clip: 's-w15-r2', x: 34, y: 22, tail: 'down-right' },
    ],
  },
  {
    svg: [
      square(),
      tower(250, 9, 0),
      // the university gate, down the street
      both('w-stone', 'M10 214 V110 H130 V214 Z', 1.6), W('w-door', arch(48, 214, 44, 70)), I(arch(48, 214, 44, 70), 1.8), both('w-lamp', 'M30 118 h80 v14 h-80 Z', 1.2),
      figure('salma', { x: 168, y: 236, look: -1, mood: 'smile', armL: 'point', armR: 'hold' }),
      LAYER,
      both('w-wood', 'M176 156 h16 v-14 h-16 Z', 1.3),
    ].join(''),
    alt: 'Nine o’clock. Salma hurries with her bag towards the university gate.',
    bubbles: [{ who: 'salma', ar: 'أَذْهَبُ إِلَى الْجَامِعَة السَّاعَةَ التَّاسِعَة.', en: 'I go to the university at nine.', clip: 's-w15-r3', gloss: [['الْجَامِعَة', 'the university']], x: 34, y: 8, tail: 'down-right' }],
  },
  {
    svg: (() => {
      const [bx, by] = handAt(250, 300, 1.2, 'hold', -1);
      return [
        // right: studying Arabic · left: at the office
        W('w-wall', 'M160 0 H320 V240 H160 Z'), clock(290, 40, 14, 10, 0),
        W('#D9E2E8', 'M0 0 H160 V240 H0 Z'), clock(30, 40, 14, 2, 0),
        seated('salma', { x: 250, y: 300, s: 1.2, look: -1, mood: 'think', armL: 'hold' }),
        seated('salma', { x: 90, y: 300, s: 1.2, look: 1, mood: 'smile', armR: 'hold' }),
        LAYER,
        book(bx - 10, by + 6, 'w-leaf', 22, 26),
        table(208, 'w-wood'),
        both('#3A3A44', 'M100 208 l4 -40 h46 l-4 40 Z', 1.4), W('w-sky', 'M108 202 l3 -28 h36 l-3 28 Z'),
        LAYER,
        W('w-white', 'M157 0 H163 V240 H157 Z'), I('M157 0 V240 M163 0 V240', 2),
      ].join('');
    })(),
    alt: 'Two pictures: on the right Salma studies an Arabic book at ten; on the left she works at an office computer at two.',
    bubbles: [{ who: 'caption', ar: 'أَدْرُسُ الْعَرَبِيَّة، ثُمَّ أَعْمَلُ فِي مَكْتَب.', en: 'I study Arabic, then I work in an office.', clip: 's-w15-r4', gloss: [['الْعَرَبِيَّة', 'Arabic (the language)'], ['ثُمَّ', 'then']], x: 97, y: 76, align: 'right' }],
  },
  {
    lit: true,
    svg: [
      // right: home at six · left: asleep at eleven
      W('w-awning', 'M160 0 H320 V214 H160 Z'), W('w-sand', 'M160 214 H320 V240 H160 Z'),
      tower(280, 6, 0),
      figure('salma', { x: 214, y: 236, look: -1, mood: 'smile', armR: 'hold' }),
      W('w-night', 'M0 0 H160 V240 H0 Z'), moon(40, 36, 11), stars([[90, 24], [130, 50], [20, 80]]),
      both('w-stone', 'M20 240 V110 H140 V240 Z', 1.6), both('#4E4B66', 'M50 190 V150 Q80 126 110 150 V190 Z', 1.6),
      clock(124, 92, 12, 11, 0),
      LAYER,
      W('w-white', 'M157 0 H163 V240 H157 Z'), I('M157 0 V240 M163 0 V240', 2),
    ].join(''),
    alt: 'Two pictures: on the right Salma walks home at six as the sun sets; on the left her window is dark at eleven: she is asleep.',
    bubbles: [
      { who: 'caption', ar: 'أَرْجِعُ إِلَى الْبَيْت السَّاعَةَ السَّادِسَة.', en: 'I return home at six.', clip: 's-w15-r5', x: 97, y: 4, align: 'right' },
      { who: 'caption', ar: 'وَأَنَامُ السَّاعَةَ الْحَادِيَةَ عَشْرَة.', en: 'And I sleep at eleven.', clip: 's-w15-r6', x: 2, y: 82 },
    ],
  },
];
