// Week 12 · The clothes shop. A table and a chair, colours, a book and a notebook, a green shirt and a yellow hat.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure } from '../cast.mjs';
import { both, circ, ell, handAt, book } from './kit.mjs';

const rack = (x, y, colors) => I(`M${x} ${y} h100 M${x + 4} ${y} v120 M${x + 96} ${y} v120`, 2) +
  colors.map((c, k) => both(c, `M${x + 10 + k * 16} ${y + 6} l-6 10 v50 h16 v-50 l-6 -10 Z`, 1.1) + I(`M${x + 10 + k * 16} ${y} v6`, 1)).join('');
const tableAt = (x, y, cls = 'w-white') => both(cls, `M${x} ${y} h80 v-8 h-80 Z`, 1.6) + I(`M${x + 6} ${y} v40 M${x + 74} ${y} v40`, 2.2);
const chairAt = (x, y, cls = '#3A3A44') => both(cls, `M${x} ${y} h34 v-6 h-34 Z M${x + 28} ${y - 6} v-40 h6 v40 Z`, 1.5) + I(`M${x + 3} ${y} v30 M${x + 31} ${y} v30`, 2.2);
const shop = () => W('w-wall', 'M0 0 H320 V200 H0 Z') + W('w-wood', 'M0 200 H320 V240 H0 Z') + I('M0 200 H320', 1.6);

export const PANELS = [
  {
    svg: [
      shop(),
      rack(10, 40, ['w-roof', 'w-door', 'w-leaf', 'w-lamp', 'w-rose']),
      W('w-awning', 'M180 20 H310 V200 H180 Z'), I('M180 20 H310 V200 M180 20 V200', 1.6), I('M186 26 q10 6 20 0 q10 6 20 0 q10 6 20 0 q10 6 20 0 q10 6 20 0 q10 6 20 0', 1.2),
      W('w-wall', 'M196 50 H296 V200 H196 Z'),
      tableAt(206, 168), chairAt(254, 186),
      figure('rana', { x: 120, y: 236, look: 1, mood: 'smile', armR: 'point' }),
    ].join(''),
    alt: 'The clothes shop: a rack of colourful clothes, and a little room behind a curtain with a table and a chair.',
    bubbles: [{ who: 'caption', ar: 'فِي الْغُرْفَة طَاوِلَة وَكُرْسِيّ.', en: 'In the room there is a table and a chair.', clip: 's-w12-r1', x: 97, y: 4, align: 'right' }],
  },
  {
    svg: [
      W('w-wall', 'M0 0 H320 V240 H0 Z'), W('w-wood', 'M0 196 H320 V240 H0 Z'), I('M0 196 H320', 1.6),
      both('w-white', 'M40 150 h150 v-12 h-150 Z', 1.8), I('M52 150 v66 M178 150 v66', 3),
      both('#3A3A44', 'M210 170 h66 v-10 h-66 Z M262 160 v-74 h12 v74 Z', 1.8), I('M214 170 v48 M272 170 v48', 3),
    ].join(''),
    alt: 'A white table and a black chair.',
    bubbles: [{ who: 'caption', ar: 'الطَّاوِلَةُ بَيْضَاء، وَالْكُرْسِيُّ أَسْوَد.', en: 'The table is white, and the chair is black.', clip: 's-w12-r2', x: 97, y: 4, align: 'right' }],
  },
  {
    svg: [
      W('w-wall', 'M0 0 H320 V240 H0 Z'),
      figure('nader', { x: 250, y: 300, s: 1.3, look: -1, mood: 'talk', armL: 'point' }),
      LAYER,
      both('w-white', 'M-6 186 H230 V198 H-6 Z', 1.8), I('M20 198 v42 M200 198 v42', 3),
      book(70, 186, 'w-roof', 40, 10), I('M72 180 h36', 0.8),
      both('w-door', 'M124 186 l6 -14 h40 l-6 14 Z', 1.4), I('M134 176 h28 M131 181 h28', 0.8),
    ].join(''),
    alt: 'On the white table: a red book and a blue notebook. Nader points at them.',
    bubbles: [{ who: 'nader', ar: 'عَلَى الطَّاوِلَة كِتَابٌ أَحْمَر وَدَفْتَرٌ أَزْرَق.', en: 'On the table there is a red book and a blue notebook.', clip: 's-w12-r3', x: 18, y: 8, tail: 'down-right' }],
  },
  {
    svg: (() => {
      const [hx, hy] = handAt(96, 300, 1.35, 'up', 1);
      return [
        shop(),
        rack(200, 30, ['w-lamp', 'w-rose', 'w-door', 'w-roof', 'w-leaf']),
        figure('nader', { x: 230, y: 300, s: 1.35, look: -1, mood: 'celebrate', armL: 'hip', armR: 'hip', shirt: 'w-leaf' }),
        figure('rana', { x: 96, y: 300, s: 1.35, look: 1, mood: 'talk', armR: 'up' }),
        LAYER,
        both('w-lamp', `M${hx - 18} ${hy + 2} q18 -8 36 0 q-4 -4 -8 -4 q0 -14 -10 -14 q-10 0 -10 14 q-4 0 -8 4 Z`, 1.4),
      ].join('');
    })(),
    alt: 'Nader tries on a green shirt; Rana holds up a yellow hat.',
    bubbles: [{ who: 'rana', ar: 'هَذَا قَمِيصٌ أَخْضَر، وَهَذِهِ قُبَّعَةٌ صَفْرَاء.', en: 'This is a green shirt, and this is a yellow hat.', clip: 's-w12-r4', x: 30, y: 4, tail: 'down-left' }],
  },
];
