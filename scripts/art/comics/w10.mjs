// Week 10 · The phone shop. Sami works here part-time: his age, his number, and Nader's age.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure } from '../cast.mjs';
import { both, circ, table, handAt, phone } from './kit.mjs';

const wall = () => [
  W('w-wall', 'M0 0 H320 V240 H0 Z'),
  ...[50, 92].map((y) => I(`M14 ${y} H306`, 2) + Array.from({ length: 12 }, (_, k) => phone(30 + k * 24, y - 12, 1.1, ['w-hair', 'w-door', 'w-roof', 'w-white'][k % 4])).join('')),
].join('');

export const PANELS = [
  {
    svg: (() => {
      const [px, py] = handAt(232, 290, 1.25, 'ear', -1);
      return [
        wall(),
        figure('sami', { x: 232, y: 290, s: 1.25, look: -1, mood: 'talk', armL: 'ear' }),
        LAYER,
        phone(px + 2, py, 1.2),
        table(196),
        phone(60, 186, 1.3), phone(90, 186, 1.3, 'w-roof'), phone(120, 186, 1.3, 'w-door'),
        figure('rana', { x: 46, y: 300, s: 1.2, look: 1, mood: 'smile' }),
        figure('nader', { x: 112, y: 300, s: 1.2, look: 1, mood: 'smile' }),
      ].join('');
    })(),
    alt: 'The phone shop. Sami answers the shop phone behind the counter as Nader and Rana come in.',
    bubbles: [{ who: 'sami', ar: 'مَرْحَبًا! اِسْمِي سَامِي.', en: 'Hello! My name is Sami.', clip: 's-w10-r1', x: 50, y: 6, tail: 'down-right' }],
  },
  {
    svg: [
      wall(),
      figure('sami', { x: 220, y: 300, s: 1.35, look: -1, mood: 'talk', armL: 'open' }),
      figure('rana', { x: 84, y: 300, s: 1.35, look: 1, mood: 'talk', armR: 'point' }),
    ].join(''),
    alt: 'Rana asks Sami how old he is.',
    bubbles: [
      { who: 'rana', ar: 'كَمْ عُمْرُكَ؟', en: 'How old are you?', x: 6, y: 10, tail: 'down-right' },
      { who: 'sami', ar: 'أَنَا طَالِب، وَعُمْرِي ثَمَانِيَ عَشْرَةَ سَنَةً.', en: 'I am a student, and I am eighteen.', clip: 's-w10-r2', x: 40, y: 22, tail: 'down-right' },
    ],
  },
  {
    svg: (() => {
      const [cx, cy] = handAt(170, 300, 1.4, 'point', 1);
      return [
        wall(),
        figure('sami', { x: 170, y: 300, s: 1.4, look: 0, mood: 'smile', armR: 'point', armL: 'rest' }),
        LAYER,
        both('w-white', `M${cx - 4} ${cy + 12} h46 v-28 h-46 Z`, 1.6),
        I(`M${cx + 2} ${cy - 8} h34 M${cx + 2} ${cy} h20 M${cx + 2} ${cy + 6} h30`, 1),
      ].join('');
    })(),
    alt: 'Sami holds out a card with his phone number on it.',
    bubbles: [{ who: 'sami', ar: 'رَقْمُ هَاتِفِي ٦١٩ ٥٥٥ ٠١٤٧.', en: 'My phone number is 619 555 0147.', clip: 's-w10-r3', x: 6, y: 8, tail: 'down-right' }],
  },
  {
    svg: [
      wall(),
      figure('nader', { x: 196, y: 300, s: 1.35, look: -1, mood: 'laugh' }),
      figure('sami', { x: 124, y: 300, s: 1.35, look: 1, mood: 'celebrate', armR: 'up' }),
    ].join(''),
    alt: 'Sami puts an arm up next to Nader: his friend, also a student, and twenty years old.',
    bubbles: [
      { who: 'sami', ar: 'نَادِر صَدِيقِي، وَهُوَ طَالِب أَيْضًا.', en: 'Nader is my friend, and he is a student too.', clip: 's-w10-r4', gloss: [['أَيْضًا', 'also, too']], x: 3, y: 5, tail: 'down-right' },
      { who: 'sami', ar: 'عُمْرُ نَادِر عِشْرُونَ سَنَةً.', en: 'Nader is twenty.', clip: 's-w10-r5', x: 58, y: 18, tail: 'down-left' },
    ],
  },
];
