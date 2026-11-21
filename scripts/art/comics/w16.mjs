// Week 16 · The travel agency. Karim from Morocco, who lives in San Diego, and his friend Dina from Lebanon.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure, seated } from '../cast.mjs';
import { both, circ, ell, table, handAt, tree } from './kit.mjs';

// A simple map of the Mediterranean: Morocco on the left, Lebanon on the right.
const map = (x, y, w, h, pins = true) => [
  both('w-white', `M${x} ${y} h${w} v${h} h${-w} Z`, 1.8), W('w-sky', `M${x + 4} ${y + 4} h${w - 8} v${h - 8} h${-w + 8} Z`),
  // Europe along the top, North Africa along the bottom, the Levant coast down the right-hand side
  W('w-leaf', `M${x + 4} ${y + 4} H${x + w - 4} V${y + h * 0.22} Q${x + w * 0.7} ${y + h * 0.3} ${x + w * 0.5} ${y + h * 0.2} Q${x + w * 0.3} ${y + h * 0.34} ${x + 4} ${y + h * 0.24} Z`),
  W('w-sand', `M${x + 4} ${y + h - 4} V${y + h * 0.6} Q${x + w * 0.25} ${y + h * 0.5} ${x + w * 0.5} ${y + h * 0.66} Q${x + w * 0.7} ${y + h * 0.72} ${x + w * 0.8} ${y + h * 0.6} Q${x + w * 0.84} ${y + h * 0.4} ${x + w * 0.83} ${y + h * 0.22} H${x + w - 4} V${y + h - 4} Z`),
  I(`M${x + 4} ${y + h * 0.6} Q${x + w * 0.25} ${y + h * 0.5} ${x + w * 0.5} ${y + h * 0.66} Q${x + w * 0.7} ${y + h * 0.72} ${x + w * 0.8} ${y + h * 0.6} Q${x + w * 0.84} ${y + h * 0.4} ${x + w * 0.83} ${y + h * 0.22}`, 1),
  pins ? [[x + w * 0.1, y + h * 0.62], [x + w * 0.85, y + h * 0.42]].map(([px, py]) => both('w-roof', `M${px} ${py} l-4.5 -9 a5 5 0 1 1 9 0 Z`, 1.2) + D('w-white', [[px, py - 11, 1.6]])).join('') : '',
].join('');
const posterSD = (x, y) => both('w-white', `M${x} ${y} h56 v70 h-56 Z`, 1.6) + W('w-sky', `M${x + 4} ${y + 4} h48 v40 h-48 Z`) + W('#4F86B0', `M${x + 4} ${y + 44} h48 v10 h-48 Z`) + W('w-sand', `M${x + 4} ${y + 54} h48 v12 h-48 Z`) +
  I(`M${x + 36} ${y + 58} q-2 -20 2 -40 M${x + 38} ${y + 18} q-10 -2 -14 4 M${x + 38} ${y + 18} q10 -4 14 2 M${x + 38} ${y + 18} q-4 -8 -12 -8 M${x + 38} ${y + 18} q6 -8 12 -6`, 1.2) + D('w-lamp', [[x + 14, y + 16, 5]]);
const office = () => W('w-wall', 'M0 0 H320 V240 H0 Z') + map(170, 16, 140, 90) + posterSD(20, 20);

export const PANELS = [
  {
    svg: [
      office(),
      seated('karim', { x: 160, y: 300, s: 1.3, look: 0, mood: 'talk', armL: 'open', armR: 'hold' }),
      LAYER,
      table(206),
      both('w-white', 'M200 206 l4 -10 h30 l-4 10 Z', 1.2),
    ].join(''),
    alt: 'The travel agency, with a map of the Mediterranean and a poster of San Diego. Karim introduces himself from behind his desk.',
    bubbles: [
      { who: 'karim', ar: 'اِسْمِي كَرِيم.', en: 'My name is Karim.', clip: 's-w16-r1', x: 64, y: 50, tail: 'down-left' },
      { who: 'karim', ar: 'أَنَا مِنَ الْمَغْرِب، أَنَا مَغْرِبِيّ.', en: 'I am from Morocco, I am Moroccan.', clip: 's-w16-r2', x: 4, y: 40, tail: 'down-right' },
    ],
  },
  {
    svg: [
      office(),
      figure('karim', { x: 100, y: 300, s: 1.3, look: -1, mood: 'smile', armL: 'up' }),
    ].join(''),
    alt: 'Karim points up at the poster of San Diego: sun, sea and a palm tree.',
    bubbles: [{ who: 'karim', ar: 'أَسْكُنُ فِي سَان دِييغُو.', en: 'I live in San Diego.', clip: 's-w16-r3', x: 44, y: 54, tail: 'down-left' }],
  },
  {
    svg: [
      office(),
      figure('karim', { x: 236, y: 300, s: 1.3, look: -1, mood: 'talk', armL: 'open' }),
      figure('dina', { x: 90, y: 300, s: 1.3, look: 1, mood: 'celebrate', armR: 'wave' }),
    ].join(''),
    alt: 'Dina comes in and waves. Karim introduces his friend.',
    bubbles: [{ who: 'karim', ar: 'صَدِيقَتِي دِينَا مِنْ لُبْنَان، هِيَ لُبْنَانِيَّة.', en: 'My friend Dina is from Lebanon; she is Lebanese.', clip: 's-w16-r4', gloss: [['صَدِيقَتِي', 'my (female) friend']], x: 40, y: 48, tail: 'down-right' }],
  },
  {
    svg: (() => {
      const [tx, ty] = handAt(80, 300, 1.3, 'hold', 1);
      return [
        W('w-wall', 'M0 0 H320 V240 H0 Z'),
        map(30, 20, 260, 150),
        figure('karim', { x: 250, y: 316, s: 1.25, look: -1, mood: 'talk', armL: 'up' }),
        figure('dina', { x: 80, y: 300, s: 1.3, look: 1, mood: 'smile', armR: 'hold' }),
        LAYER,
        both('w-lamp', `M${tx - 4} ${ty + 8} h30 v-16 h-30 Z`, 1.3), I(`M${tx + 4} ${ty + 8} v-16 M${tx + 8} ${ty - 2} h14 M${tx + 8} ${ty + 3} h10`, 0.9),
      ].join('');
    })(),
    alt: 'A big map: a pin on Rabat in Morocco and a pin on Beirut in Lebanon. Dina holds her ticket to Beirut.',
    bubbles: [{ who: 'karim', ar: 'عَاصِمَةُ لُبْنَان بَيْرُوت، وَعَاصِمَةُ الْمَغْرِب الرِّبَاط.', en: 'The capital of Lebanon is Beirut, and the capital of Morocco is Rabat.', clip: 's-w16-r5', x: 97, y: 74, align: 'right' }],
  },
];
