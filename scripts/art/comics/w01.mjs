// Week 1 · Rana's house. Nader is new on the street and visits Rana. Panels are 320 × 240.
import { W, I, D, LAYER } from '../paint.mjs';
import { figure, seated } from '../cast.mjs';

const rose = (x, y, r = 5) => W('w-rose', `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`) + I(`M${x - r * 0.5} ${y} q${r * 0.5} ${-r * 0.7} ${r * 0.7} 0 q${-r * 0.2} ${r * 0.6} ${-r * 0.7} ${r * 0.2} M${x - r * 0.9} ${y + r * 0.2} q${r * 0.2} ${r * 0.8} ${r} ${r * 0.7}`, 0.8);
const leaf = (x, y, a = 1) => `M${x} ${y} q${6 * a} -6 ${12 * a} -1 q${-6 * a} 6 ${-12 * a} 1 Z`;

export const PANELS = [
  // 1 · Nader at Rana's door, waving
  {
    svg: [
      W('w-sky', 'M0 0 H320 V48 H0 Z'),
      W('w-stone', 'M0 40 H320 V214 H0 Z'),
      W('w-roof', 'M-4 30 H324 V46 H-4 Z'),
      I('M-4 30 H324 M-4 46 H324', 2),
      I(Array.from({ length: 17 }, (_, k) => `M${k * 20} 30 q10 8 20 0`).join(' '), 1.1),
      // arched window with a grille
      W('w-sky', 'M30 150 V98 Q55 72 80 98 V150 Z'),
      I('M28 152 V98 Q55 68 82 98 V152 H28 M55 78 V152 M30 112 H80 M30 130 H80', 1.6),
      W('w-leaf', 'M26 160 h58 v-8 h-58 Z'), I('M26 160 h58 v-8 h-58 Z', 1.3),
      D('w-rose', [[34, 148, 4], [44, 146, 4], [56, 147, 4], [68, 145, 4], [76, 148, 4]]),
      // the door
      W('w-shadow', 'M180 214 V120 Q215 82 250 120 V214 Z'),
      W('w-door', 'M186 212 V122 Q215 90 244 122 V212 Z'),
      I('M182 214 V120 Q215 80 248 120 V214 M186 212 V122 Q215 90 244 122 V212 M215 96 V212', 2),
      D('ink', [[196, 140, 1], [196, 160, 1], [196, 180, 1], [234, 140, 1], [234, 160, 1], [234, 180, 1]], 1, 1.4),
      I('M224 168 h5', 2.2),
      I('M176 214 h78 M172 220 h86', 1.8),
      // lantern
      W('w-lamp', 'M162 122 h10 l-2 14 h-6 Z'), I('M167 112 v10 M162 122 h10 l-2 14 h-6 Z M163 128 h8', 1.4),
      // bougainvillea over the right
      W('w-leaf', 'M262 214 Q256 160 274 120 Q290 80 320 70 V214 Z'),
      I('M268 214 Q262 168 280 128 Q294 96 320 84 M286 140 q10 -6 20 -2 M276 176 q12 -4 24 2', 1.4),
      D('w-rose', [[278, 118, 6], [292, 100, 6], [306, 86, 7], [270, 146, 6], [300, 128, 6], [288, 160, 6], [312, 150, 6], [280, 190, 6], [304, 180, 6]]),
      // street
      W('w-sand', 'M0 214 H320 V240 H0 Z'),
      I('M0 214 H320 M20 226 h40 M90 232 h50 M170 228 h30 M260 230 h40', 1.2),
      W('w-shadow', 'M100 236 Q130 228 160 236 Z'),
      figure('nader', { x: 130, y: 234, look: 1, mood: 'talk', armR: 'wave', armL: 'rest' }),
    ].join(''),
    alt: 'Nader waves at the door of Rana’s stone house. Bougainvillea climbs the wall.',
    bubbles: [
      { who: 'caption', ar: 'زَارَ نَادِر دَارَ رَنَا.', en: 'Nader visited Rana’s house.', clip: 's-w01-s1', x: 97, y: 4, align: 'right' },
      { who: 'nader', ar: 'السَّلَامُ عَلَيْكُم!', en: 'Peace be upon you! (Hello!)', clip: 's-w01-o3', spoken: true, x: 22, y: 11, tail: 'down-right' },
    ],
  },

  // 2 · Rana opens the door
  {
    svg: [
      W('w-stone', 'M0 0 H320 V240 H0 Z'),
      // open door: dark inside, the door leaf swung in
      W('w-night', 'M172 240 V96 Q236 30 300 96 V240 Z'),
      W('w-door', 'M276 240 V100 L300 96 V240 Z'),
      I('M166 240 V94 Q236 22 306 94 V240 M172 240 V96 Q236 30 300 96 V240 M276 240 V100 L300 96', 2.2),
      W('w-lamp', 'M148 92 h12 l-2 16 h-8 Z'), I('M154 80 v12 M148 92 h12 l-2 16 h-8 Z M149 100 h10', 1.5),
      figure('nader', { x: 82, y: 300, s: 1.4, look: 1, mood: 'smile', armR: 'rest', armL: 'rest' }),
      figure('rana', { x: 236, y: 300, s: 1.4, look: -1, mood: 'talk', armL: 'wave', armR: 'rest' }),
    ].join(''),
    alt: 'Rana opens the door and waves; Nader smiles.',
    bubbles: [
      { who: 'rana', ar: 'وَعَلَيْكُمُ السَّلَام!\nاِسْمِي رَنَا.', en: 'And peace be upon you! (the reply) My name is Rana.', x: 60, y: 4, tail: 'down-right', spoken: true },
      { who: 'nader', ar: 'اِسْمِي نَادِر.', en: 'My name is Nader.', x: 4, y: 16, tail: 'down-right', spoken: true },
    ],
  },

  // 3 · Rana's roses in the courtyard
  {
    svg: [
      W('w-wall', 'M0 0 H320 V176 H0 Z'),
      I('M0 176 H320', 2),
      // zellige floor
      W('w-sand', 'M0 176 H320 V240 H0 Z'),
      I(Array.from({ length: 9 }, (_, k) => `M${k * 40 - 20} 240 L${k * 40 + 10} 176`).join(' ') + ' M0 204 H320', 1),
      D('w-door', Array.from({ length: 8 }, (_, k) => [k * 40 + 10, 190, 3])),
      // arch in the back wall
      W('w-sky', 'M10 176 V80 Q45 40 80 80 V176 Z'), I('M8 176 V80 Q45 36 82 80 V176', 1.8),
      W('w-leaf', 'M20 176 q10 -40 25 -60 q15 20 25 60 Z'),
      // a big pot of roses
      LAYER,
      W('w-roof', 'M128 236 L120 186 H210 L202 236 Z'), I('M128 236 L120 186 H210 L202 236 Z M116 186 h98 v-8 h-98 Z', 1.8),
      I('M140 210 q25 8 50 0', 1),
      W('w-leaf', 'M118 182 Q108 120 140 96 Q166 72 192 96 Q222 120 212 182 Z'),
      I('M150 182 Q146 140 136 118 M166 182 V100 M180 182 Q186 140 198 120', 1.3),
      LAYER,
      ...[[134, 120], [150, 104], [170, 96], [190, 106], [204, 128], [142, 146], [162, 128], [184, 136], [200, 156], [128, 166], [154, 168], [178, 160]].map(([x, y], k) => rose(x, y, k % 3 ? 7 : 8)),
      ...[[120, 140], [208, 144], [168, 150], [146, 128]].map(([x, y], k) => W('w-leaf', leaf(x, y, k % 2 ? 1 : -1)) + I(leaf(x, y, k % 2 ? 1 : -1), 0.8)),
      figure('rana', { x: 62, y: 290, s: 1.3, look: 1, mood: 'smile', armR: 'point', armL: 'rest' }),
      figure('nader', { x: 266, y: 290, s: 1.3, look: -1, mood: 'surprised', armL: 'open', armR: 'open' }),
    ].join(''),
    alt: 'Rana points to her pot of red roses. Nader is amazed.',
    bubbles: [
      { who: 'nader', ar: 'وَرْد!', en: 'Roses!', clip: 'w-ward', x: 74, y: 5, tail: 'down-right' },
      { who: 'rana', ar: 'وَرْدُ رَنَا.', en: 'Rana’s roses.', clip: 's-w01-p3', x: 4, y: 9, tail: 'down-left' },
    ],
  },

  // 4 · Evening: a board game by lamplight
  {
    lit: true,
    svg: [
      W('w-dusk', 'M0 0 H320 V240 H0 Z'),
      // window with the night sky and the moon
      W('w-night', 'M118 110 V44 Q160 8 202 44 V110 Z'),
      W('w-lamp', 'M176 40 a9 9 0 1 0 0.1 0 Z'), W('w-night', 'M181 37 a8 8 0 1 0 0.1 0 Z'),
      D('w-lamp', [[136, 60, 1.4], [150, 40, 1.2], [190, 78, 1.3], [140, 90, 1.1]]),
      I('M114 112 V44 Q160 2 206 44 V112 H114 M160 18 V112 M116 70 H204', 1.8),
      // a shelf with a vase
      I('M24 96 h70 M30 96 v6 M88 96 v6', 1.6), W('w-door', 'M40 96 q-6 -12 2 -24 h8 q8 12 2 24 Z'), I('M40 96 q-6 -12 2 -24 h8 q8 12 2 24 Z', 1.2),
      W('w-roof', 'M64 96 v-18 h20 v18 Z'), I('M64 96 v-18 h20 v18 Z M64 84 h20', 1.2),
      seated('rana', { x: 74, y: 292, s: 1.3, look: 1, mood: 'talk', armR: 'point', armL: 'hold' }),
      seated('nader', { x: 248, y: 288, s: 1.3, look: -1, mood: 'think', armL: 'hold', armR: 'rest' }),
      LAYER,
      // the table, the backgammon board, a candle and the lantern
      W('w-wood', 'M-6 200 H326 V240 H-6 Z'), I('M-6 200 H326 M-6 210 H326', 2),
      W('w-wood', 'M112 210 L124 182 H210 L222 210 Z'), I('M112 210 L124 182 H210 L222 210 Z M167 182 V210', 1.6),
      W('w-white:fine', [0, 1, 2, 3, 4, 5].map((k) => `M${128 + k * 6.5} 184 l3 10 l3 -10 Z M${170 + k * 6.5} 208 l3 -10 l3 10 Z`).join(' ')),
      W('w-roof:fine', [0, 1, 2, 3, 4, 5].map((k) => `M${170 + k * 6.5} 184 l3 10 l3 -10 Z M${128 + k * 6.5} 208 l3 -10 l3 10 Z`).join(' ')),
      D('w-white', [[140, 200, 3], [192, 192, 3], [198, 192, 3]]), D('ink', [[140, 200, 3], [192, 192, 3], [198, 192, 3]], 3, 0.9),
      W('w-white:fine', 'M228 212 h7 v-7 h-7 Z M238 214 h7 v-7 h-7 Z'), I('M228 212 h7 v-7 h-7 Z M238 214 h7 v-7 h-7 Z', 1),
      D('ink', [[231.5, 208.5, 0.6], [240, 209, 0.6], [243, 212, 0.6]], 0.6, 1.2),
      // candle (fire)
      W('w-white', 'M84 212 v-20 h8 v20 Z'), I('M84 212 v-20 h8 v20 Z M88 192 v-3', 1.3),
      W('w-lamp', 'M88 176 q-6 8 0 13 q6 -5 0 -13 Z'), W('w-roof:fine', 'M88 182 q-2.5 4 0 6 q2.5 -2 0 -6 Z'),
      // hanging lantern, a fanous (light)
      W('w-lamp', 'M282 54 h20 l-3 26 l-7 8 l-7 -8 Z'),
      I('M292 0 V36 M286 36 h12 l4 8 h-20 Z M282 44 h20 v10 h-20 Z M282 54 h20 l-3 26 l-7 8 l-7 -8 Z M292 54 v34 M286 64 h12 M292 88 v6', 1.5),
    ].join(''),
    alt: 'Evening. Rana and Nader play backgammon by a candle and a lantern. It is Nader’s turn.',
    bubbles: [
      { who: 'caption', ar: 'نُور وَنَار', en: 'Light and fire', clip: 's-w01-p2', x: 97, y: 4, align: 'right' },
      { who: 'rana', ar: 'دَوْرُ نَادِر!', en: 'Nader’s turn!', clip: 's-w01-p4', x: 4, y: 16, tail: 'down-left' },
    ],
  },
];
