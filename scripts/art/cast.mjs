// The painted cast for the comics, drawn for the ink-and-watercolour painter (paint.mjs).
// figure(who, opts) returns a drawing with the feet at (x, y). Unscaled, a figure is about 160 units tall.
//   opts: x, y, s (scale), look (-1 left · 0 front · 1 right), mood, armL / armR (screen left / right), seated
//   moods: smile, talk, surprised, celebrate, think, laugh
//   arms:  rest, wave, point, hold, hip, open, up
import { W, I, D, LAYER, place } from './paint.mjs';

const ARMS = {
  rest: [[21, -113], [25, -92], [24, -72]],
  wave: [[21, -113], [33, -121], [35, -144]],
  point: [[21, -113], [36, -106], [53, -109]],
  hold: [[21, -113], [24, -92], [9, -86]],
  hip: [[21, -113], [32, -96], [19, -80]],
  open: [[21, -113], [31, -97], [40, -92]],
  up: [[21, -113], [28, -132], [26, -152]],
  ear: [[21, -113], [27, -122], [13, -136]],
};

/** A sleeve along a bent polyline, with a cuff and a hand. side: 1 = screen right, -1 = screen left. */
function arm(pose, side, sleeve, skin, w = 8.5, cuff = '') {
  const pts = (ARMS[pose] || ARMS.rest).map(([x, y]) => [x * side, y]);
  const n = pts.length;
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const h = (i === n - 1 ? w * 0.42 : w / 2);
    L.push([pts[i][0] - dy * h, pts[i][1] + dx * h]);
    R.push([pts[i][0] + dy * h, pts[i][1] - dx * h]);
  }
  const f = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const outline = `M${f(L[0])} Q${f(L[1])} ${f(L[2])} L${f(R[2])} Q${f(R[1])} ${f(R[0])} Z`;
  const [hx, hy] = pts[n - 1];
  const [px, py] = pts[n - 2];
  const dl = Math.hypot(hx - px, hy - py);
  const hand = [hx + ((hx - px) / dl) * 3.4, hy + ((hy - py) / dl) * 3.4];
  let out = W(sleeve, outline) + I(`M${f(L[0])} Q${f(L[1])} ${f(L[2])} M${f(R[2])} Q${f(R[1])} ${f(R[0])}`, 1.5) + I(`M${f(L[2])} L${f(R[2])}`, 1.2);
  if (cuff) {
    const c1 = [L[2][0] + (L[1][0] - L[2][0]) * 0.22, L[2][1] + (L[1][1] - L[2][1]) * 0.22];
    const c2 = [R[2][0] + (R[1][0] - R[2][0]) * 0.22, R[2][1] + (R[1][1] - R[2][1]) * 0.22];
    out += W(cuff + ':fine', `M${f(L[2])} L${f(c1)} L${f(c2)} L${f(R[2])} Z`) + I(`M${f(c1)} L${f(c2)}`, 0.8);
  }
  out += D(skin, [[hand[0], hand[1], 3.7]]) + D('ink', [[hand[0], hand[1], 3.7]], 3.7, 1.2);
  return out;
}

/** Eyes, brows, nose, mouth and cheeks, centred on the face at (fx, -136). */
function face(mood, fx, { brows = 1.1, old = false } = {}) {
  const ex = [-4.3 + fx, 4.3 + fx];
  let eyes;
  if (mood === 'celebrate' || mood === 'laugh') eyes = I(ex.map((x) => `M${x - 2} -137.5 q2 -2.6 4 0`).join(' '), 1.2);
  else if (mood === 'sleepy') eyes = I(ex.map((x) => `M${x - 2} -138.4 q2 1.8 4 0`).join(' '), 1.2);
  else if (mood === 'surprised') eyes = I(ex.map((x) => `M${x} -140 v3.2`).join(' '), 2.2);
  else eyes = I(ex.map((x) => `M${x} -139.4 v2.4`).join(' '), 2);
  const browY = mood === 'surprised' ? -144.5 : -143;
  const brow = mood === 'think'
    ? I(`M${ex[0] - 2.4} ${browY} q2.4 -1.2 4.8 0 M${ex[1] - 2.4} ${browY - 1.8} q2.4 -2 4.8 -0.4`, brows)
    : I(ex.map((x) => `M${x - 2.4} ${browY} q2.4 -1.6 4.8 0`).join(' '), brows);
  // The nose points the way the person is looking (and straight down the middle when facing front).
  const nose = fx < 0 ? I(`M${fx - 0.6} -136.5 q-1.6 3.6 0.9 4.2`, 0.9) : fx > 0 ? I(`M${fx + 0.6} -136.5 q1.6 3.6 -0.9 4.2`, 0.9) : I(`M0.3 -136.5 q1.4 3.4 -0.6 4.2 q-1 0.2 -1.6 -0.4`, 0.9);
  const mx = fx;
  const mouths = {
    smile: I(`M${mx - 3.4} -130.6 q3.4 2.8 6.8 0`, 1.2),
    talk: W('w-roof:fine', `M${mx - 3} -131 q3 -0.8 6 0 q-3 4.6 -6 0 Z`) + I(`M${mx - 3} -131 q3 -0.8 6 0 q-3 4.6 -6 0 Z`, 1),
    surprised: W('w-roof:fine', `M${mx - 1.8} -129.6 a1.8 2.2 0 1 0 3.6 0 a1.8 2.2 0 1 0 -3.6 0 Z`) + I(`M${mx - 1.8} -129.6 a1.8 2.2 0 1 0 3.6 0 a1.8 2.2 0 1 0 -3.6 0 Z`, 1),
    celebrate: W('w-white:fine', `M${mx - 4.6} -131.4 h9.2 q0 5.6 -4.6 5.6 q-4.6 0 -4.6 -5.6 Z`) + I(`M${mx - 4.6} -131.4 h9.2 q0 5.6 -4.6 5.6 q-4.6 0 -4.6 -5.6 Z`, 1.1),
    think: I(`M${mx - 2.6} -130 q2.4 0.4 5.4 -1.4`, 1.2),
    sleepy: I(`M${mx - 2} -130 q2 -0.6 4 0`, 1.1),
  };
  mouths.laugh = mouths.celebrate;
  const cheeks = W('w-cheek:fine', `M${ex[0] - 3.8} -133.5 a2.6 1.8 0 1 0 5.2 0 a2.6 1.8 0 1 0 -5.2 0 Z M${ex[1] - 1.4} -133.5 a2.6 1.8 0 1 0 5.2 0 a2.6 1.8 0 1 0 -5.2 0 Z`);
  const lines = old ? I(`M${ex[0] - 4.6} -139.6 l-1.6 -0.8 M${ex[0] - 4.6} -137.6 l-1.8 0.4 M${ex[1] + 4.6} -139.6 l1.6 -0.8 M${ex[1] + 4.6} -137.6 l1.8 0.4 M${fx - 6} -131.5 q-1 2.2 0.6 3.8 M${fx + 6} -131.5 q1 2.2 -0.6 3.8`, 0.7) : '';
  return cheeks + eyes + brow + nose + lines + (mouths[mood] || mouths.smile);
}

const HEAD = 1.15;
/** Draws the head a little larger than life (friendlier, and faces read better in small panels). */
const big = (parts, pivot = -124) => place(parts.join(''), { s: HEAD, y: pivot - pivot * HEAD });
const oval = (cx, cy, rx, ry) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;

// ---- men -------------------------------------------------------------------
const HAIR_M = {
  wavy: ['M-11.4 -137 Q-14 -152 -3 -153.5 Q3 -158 9.5 -152.5 Q14.5 -148 11.6 -136.5 Q10.6 -143.5 5.5 -145 Q1 -142 -4 -145 Q-9 -143.5 -11.4 -137 Z',
    'M-11.4 -137 Q-14 -152 -3 -153.5 Q3 -158 9.5 -152.5 Q14.5 -148 11.6 -136.5', 'M-8 -148.5 q3 -2.4 6 0 q3 2.4 6 0 M-5 -152 q2.6 -1.6 5 0'],
  curly: ['M-11.6 -136 q-4 -6 -1 -11 q0 -7 7 -7.5 q4 -4.5 9.5 -1 q6.5 -0.5 7 6 q3.5 5 0.6 13.5 q-2 -6 -6 -7.5 q-5 2.5 -9.5 0.5 q-5 0.5 -7.6 7 Z',
    'M-11.6 -136 q-4 -6 -1 -11 q0 -7 7 -7.5 q4 -4.5 9.5 -1 q6.5 -0.5 7 6 q3.5 5 0.6 13.5', 'M-8 -149 a2 2 0 1 1 3 1.5 M0 -152 a2 2 0 1 1 3 1.5 M5 -147 a2 2 0 1 1 3 1.5'],
  short: ['M-11 -138 Q-12 -151.5 0 -152.5 Q12 -151.5 11 -138 Q10 -145.5 0 -146.5 Q-10 -145.5 -11 -138 Z', 'M-11 -138 Q-12 -151.5 0 -152.5 Q12 -151.5 11 -138', 'M-6 -149 l2 -1.5 M2 -150 l2 -1'],
  grey: ['M-11 -137 Q-12 -148 -6 -150 Q-8 -146 -9.5 -137 Z M11 -137 Q12 -148 6 -150 Q8 -146 9.5 -137 Z', 'M-11 -137 Q-12 -148 -6 -150 M11 -137 Q12 -148 6 -150', ''],
  bald: ['M-10.8 -134 q-1.2 -7 1.6 -10 v8 Z M10.8 -134 q1.2 -7 -1.6 -10 v8 Z', '', 'M-3 -150 q3 -1 6 0'],
};
const BEARD = {
  chin: ['M-10.4 -134 Q-9.4 -121.6 0 -121 Q9.4 -121.6 10.4 -134 Q8.4 -127.6 4 -126.8 Q0 -126.2 -4 -126.8 Q-8.4 -127.6 -10.4 -134 Z', 'M-10.4 -134 Q-9.4 -121.6 0 -121 Q9.4 -121.6 10.4 -134', 1.1],
  full: ['M-10.6 -139 Q-11 -122 0 -119.5 Q11 -122 10.6 -139 Q9.6 -129 4.5 -127.6 Q0 -126.6 -4.5 -127.6 Q-9.6 -129 -10.6 -139 Z', 'M-10.6 -139 Q-11 -122 0 -119.5 Q11 -122 10.6 -139', 1.1],
  moustache: ['M-5.6 -133.6 q2.8 -2.6 5.6 -1.1 q2.8 -1.5 5.6 1.1 q-2.8 1.1 -5.6 0.4 q-2.8 0.7 -5.6 -0.4 Z', 'M-5.6 -133.6 q2.8 -2.6 5.6 -1.1 q2.8 -1.5 5.6 1.1 q-2.8 1.1 -5.6 0.4 q-2.8 0.7 -5.6 -0.4 Z', 0.9],
};

export function man({ look = 0, mood = 'smile', armL = 'rest', armR = 'rest', seated = false, hands,
  skin = 'w-skin-n', hair = 'wavy', hairCls = 'w-hair', beard = 'chin', beardCls, shirt = 'w-shirt', collar = 'button',
  trousers = 'w-trousers', apron = null, vest = null, jacket = null, hat = null, glasses = false, old = false }) {
  const fx = look * 0.8; // a small turn only, so the face stays centred on the head
  const legs = seated ? '' : [
    W(trousers, 'M-18 -72 L-17 -4 L-3 -4 L0 -58 L3 -4 L17 -4 L18 -72 Z'),
    I('M-18 -72 L-17 -4 L-3 -4 L0 -58 L3 -4 L17 -4 L18 -72', 1.6),
    W('w-hair', 'M-19 0 Q-19 -5.5 -12 -5.5 L-3 -5.5 L-3 0 Z M19 0 Q19 -5.5 12 -5.5 L3 -5.5 L3 0 Z'),
    I('M-19 0 Q-19 -5.5 -12 -5.5 L-3 -5.5 L-3 0 Z M19 0 Q19 -5.5 12 -5.5 L3 -5.5 L3 0 Z', 1.3),
  ].join('');
  const top = collar === 'button'
    ? 'M-15 -118 Q-22 -117 -23 -107 Q-21 -88 -19 -69 Q0 -67 19 -69 Q21 -88 23 -107 Q22 -117 15 -118 L4 -119 L0 -113 L-4 -119 Z'
    : 'M-15 -118 Q-22 -117 -23 -107 Q-21 -88 -19 -69 Q0 -67 19 -69 Q21 -88 23 -107 Q22 -117 15 -118 Q0 -112 -15 -118 Z';
  const [hw, hi, hd] = HAIR_M[hair] || HAIR_M.wavy;
  const bc = beardCls || hairCls;
  const hand = hands || skin;
  const bd = BEARD[beard];
  return [
    LAYER,
    legs,
    W(skin, 'M-4.5 -126 L-4.5 -116 L4.5 -116 L4.5 -126 Z'),
    W(shirt, top),
    I(top, 1.7),
    collar === 'button'
      ? I('M-4 -119 L-7 -112 L0 -113 L7 -112 L4 -119', 1.1) + I('M0 -113 V-68', 1) + D('ink', [[1.6, -104, 0.7], [1.6, -94, 0.7], [1.6, -84, 0.7]], 0.7, 1)
      : I('M-6 -117.5 q6 4 12 0', 1.1),
    collar === 'button' && !apron && !vest ? I('M-12 -100 h5 v5', 0.9) : '',
    vest ? W(vest, 'M-22.5 -108 L-19 -69 L-4 -68 L-3 -111 Z M22.5 -108 L19 -69 L4 -68 L3 -111 Z') + I('M-22.5 -108 L-19 -69 L-4 -68 L-3 -111 M22.5 -108 L19 -69 L4 -68 L3 -111', 1.3) : '',
    jacket ? W(jacket, 'M-15 -118 Q-22 -117 -23 -107 Q-21 -88 -20 -64 L-5 -64 L-4 -100 L-9 -116 Z M15 -118 Q22 -117 23 -107 Q21 -88 20 -64 L5 -64 L4 -100 L9 -116 Z') + I('M-15 -118 Q-22 -117 -23 -107 Q-21 -88 -20 -64 L-5 -64 L-4 -100 L-9 -116 M15 -118 Q22 -117 23 -107 Q21 -88 20 -64 L5 -64 L4 -100 L9 -116 M-9 -116 L-12 -104 L-5 -102 M9 -116 L12 -104 L5 -102 M-17 -84 h8 M-3 -80 h0.1', 1.3) : '',
    apron ? W(apron, 'M-14 -103 H14 L17 -38 H-17 Z') + I('M-14 -103 H14 L17 -38 H-17 Z M-14 -103 L-6 -117 M14 -103 L6 -117 M-6 -70 h12 v10 h-12', 1.2) : '',
    LAYER,
    arm(armL, -1, jacket || shirt, hand),
    arm(armR, 1, jacket || shirt, hand),
    LAYER,
    big([
      W(skin, oval(0, -136, 10.6, 13.2) + ` M-12.4 -138 q-2.6 2 0 5 M12.4 -138 q2.6 2 0 5`),
      I(oval(0, -136, 10.6, 13.2), 1.5),
      I(`M-10.6 -138.5 q-3 2.4 0.2 5.6 M10.6 -138.5 q3 2.4 -0.2 5.6`, 1),
      W(hairCls, hw), hi ? I(hi, 1.5) : '', hd ? I(hd, 0.9) : '',
      bd ? W(bc, bd[0]) + I(bd[1], bd[2]) : '',
      face(mood, fx, { old }),
      glasses ? I(`M${-7.7 + fx} -137.6 a3.4 3.1 0 1 0 6.8 0 a3.4 3.1 0 1 0 -6.8 0 M${0.9 + fx} -137.6 a3.4 3.1 0 1 0 6.8 0 a3.4 3.1 0 1 0 -6.8 0 M${-0.9 + fx} -138 h1.8`, 1) : '',
      hat === 'baker' ? W('w-white', 'M-10.6 -145 Q-15.5 -160 -6.5 -161 Q0 -169 6.5 -161 Q15.5 -160 10.6 -145 Z') + I('M-10.6 -145 Q-15.5 -160 -6.5 -161 Q0 -169 6.5 -161 Q15.5 -160 10.6 -145 Z M-10.6 -149 H10.6', 1.3) : '',
      hat === 'kufi' ? W('w-white', 'M-10.8 -145 Q-10 -156 0 -156.5 Q10 -156 10.8 -145 Z') + I('M-10.8 -145 Q-10 -156 0 -156.5 Q10 -156 10.8 -145 Z M-8 -149 h16', 1.1) : '',
    ]),
  ].join('');
}

// ---- women -----------------------------------------------------------------
export function woman({ look = 0, mood = 'smile', armL = 'rest', armR = 'rest', seated = false, hands,
  skin = 'w-skin-r', hijab = 'w-hijab', hair = 'bun', hairCls = 'w-hair', tunic = 'w-tunic', panel = 'w-tunic2', trim = 'w-hijab',
  skirt = 'w-skirt', coat = null, apron = null, stethoscope = false, glasses = false, old = false }) {
  const fx = look * 0.8;
  const lower = seated ? '' : [
    W(skirt, 'M-20 -46 L-22 -5 L22 -5 L20 -46 Z'),
    I('M-20 -46 L-22 -5 M22 -5 L20 -46 M-6 -40 L-7 -6 M7 -38 L8 -6', 1.3),
    W('w-hair', 'M-17 0 Q-17 -5.5 -10 -5.5 L-2 -5.5 L-2 0 Z M17 0 Q17 -5.5 10 -5.5 L2 -5.5 L2 0 Z'),
    I('M-17 0 Q-17 -5.5 -10 -5.5 L-2 -5.5 L-2 0 Z M17 0 Q17 -5.5 10 -5.5 L2 -5.5 L2 0 Z', 1.3),
  ].join('');
  const body = 'M-16 -112 Q-22 -108 -22 -98 L-27 -44 Q0 -39 27 -44 L22 -98 Q22 -108 16 -112 Z';
  const diamonds = [-98, -86, -74, -62, -51].map((y) => `M0 ${y - 4} l3 4 l-3 4 l-3 -4 Z`).join(' ');
  const hand = hands || skin;
  const sleeve = coat || tunic;
  const head = [];
  if (hijab) {
    head.push(
      W(hijab, 'M-13.6 -137 C-15 -156 -8 -161 0 -161 C8 -161 15 -156 13.6 -137 Q15.5 -123 23 -110 Q12 -101 0 -104 Q-12 -101 -23 -110 Q-15.5 -123 -13.6 -137 Z'),
      I('M-13.6 -137 C-15 -156 -8 -161 0 -161 C8 -161 15 -156 13.6 -137 Q15.5 -123 23 -110 Q12 -101 0 -104 Q-12 -101 -23 -110 Q-15.5 -123 -13.6 -137', 1.7),
      I('M-10 -122 Q-8 -113 -16 -108 M9 -121 Q12 -113 17 -108 M-3 -118 q2 6 -1 12', 1),
      W(skin, oval(0, -136.5, 9.2, 11.8)),
      I(oval(0, -136.5, 9.2, 11.8), 1.3),
      I('M-11 -138 Q-11 -152 0 -152.5 Q11 -152 11 -138', 1),
    );
  } else {
    if (hair === 'long') head.push(W(hairCls, 'M-12 -136 Q-14 -154 0 -155 Q14 -154 12 -136 Q13 -122 16 -112 Q10 -109 7 -116 L-7 -116 Q-10 -109 -16 -112 Q-13 -122 -12 -136 Z'), I('M-12 -136 Q-14 -154 0 -155 Q14 -154 12 -136 Q13 -122 16 -112 Q10 -109 7 -116 M-7 -116 Q-10 -109 -16 -112 Q-13 -122 -12 -136', 1.4));
    if (hair === 'bun') head.push(W(hairCls, oval(0, -155.5, 6.2, 5.2)), I(oval(0, -155.5, 6.2, 5.2) + ' M-3 -157 q3 2 6 0', 1.2));
    head.push(
      W(skin, 'M-4 -126 L-4 -118 L4 -118 L4 -126 Z'),
      W(skin, oval(0, -136.5, 9.8, 12.4)),
      I(oval(0, -136.5, 9.8, 12.4), 1.4),
      W(hairCls, 'M-10.4 -135 Q-12.5 -151 0 -151.5 Q12.5 -151 10.4 -135 Q9.6 -143 4 -145 Q0 -141.5 -7 -143.5 Q-9.6 -141 -10.4 -135 Z'),
      I('M-10.4 -135 Q-12.5 -151 0 -151.5 Q12.5 -151 10.4 -135 M-7 -143.5 Q0 -141.5 4 -145', 1.3),
    );
  }
  head.push(face(mood, fx, { brows: 1, old }));
  if (glasses) head.push(I(`M${-7.7 + fx} -137.6 a3.3 3 0 1 0 6.6 0 a3.3 3 0 1 0 -6.6 0 M${0.9 + fx} -137.6 a3.3 3 0 1 0 6.6 0 a3.3 3 0 1 0 -6.6 0 M${-1.1 + fx} -138 h2`, 0.9));
  return [
    LAYER,
    lower,
    W(tunic, body),
    panel ? W(panel, 'M-6 -110 L6 -110 L7.5 -42 L-7.5 -42 Z') : '',
    trim ? W(trim + ':fine', diamonds) : '',
    I(body, 1.7),
    panel ? I('M-6 -108 L-7.5 -42 M6 -108 L7.5 -42', 0.9) : '',
    trim ? I(diamonds, 0.8) + I('M-25 -49 q4 3 8 0 q4 3 8 0 q4 3 9 0 q4 3 8 0 q4 3 8 0 q4 3 9 0', 0.8) : '',
    coat ? W(coat, 'M-16 -113 Q-23 -109 -23 -98 L-27 -42 L-7 -42 L-4 -104 Z M16 -113 Q23 -109 23 -98 L27 -42 L7 -42 L4 -104 Z') + I('M-16 -113 Q-23 -109 -23 -98 L-27 -42 L-7 -42 L-4 -104 L-6 -113 M16 -113 Q23 -109 23 -98 L27 -42 L7 -42 L4 -104 L6 -113 M-18 -74 h7 M11 -74 h7', 1.4) : '',
    apron ? W(apron, 'M-13 -102 H13 L19 -40 H-19 Z') + I('M-13 -102 H13 L19 -40 H-19 Z M-13 -102 L-7 -112 M13 -102 L7 -112 M-24 -80 H24 M-7 -66 h14 v10 h-14', 1.2) : '',
    // without a hijab, a collar over the shoulders keeps the neck a natural length
    !hijab ? W(coat || tunic, 'M-17 -110 Q-13 -118.5 -4.5 -118.5 L4.5 -118.5 Q13 -118.5 17 -110 Z') + I('M-17 -110 Q-13 -118.5 -4.5 -118.5 M4.5 -118.5 Q13 -118.5 17 -110', 1.5) : '',
    stethoscope ? I('M-6 -114 Q-9 -96 -2 -90 M6 -114 Q9 -96 2 -90 M0 -90 V-82', 1.2) + W('w-door:fine', oval(0, -79, 3, 3)) + I(oval(0, -79, 3, 3), 1) : '',
    LAYER,
    arm(armL, -1, sleeve, hand, 8.5, coat ? '' : trim || ''),
    arm(armR, 1, sleeve, hand, 8.5, coat ? '' : trim || ''),
    LAYER,
    big(head, hijab ? -118 : -124),
  ].join('');
}

/** The cast. Nader and Rana are the defaults; everyone else is the same body with different clothes, hair and skin. */
const PEOPLE = {
  nader: (o) => man(o),
  rana: (o) => woman(o),
  sami: (o) => man({ skin: '#C68B5E', hair: 'curly', beard: 'none', shirt: '#E2A33B', collar: 'tee', trousers: '#3D4F6B', ...o }),
  dina: (o) => woman({ skin: '#E0B08A', hijab: null, hair: 'bun', hairCls: '#5A3A26', tunic: '#7FB2AC', panel: null, trim: null, coat: 'w-white', stethoscope: true, skirt: '#3E4A5E', ...o }),
  seller: (o) => man({ skin: '#B07A52', hair: 'grey', hairCls: '#B9B2A6', beard: 'moustache', beardCls: '#8E877C', shirt: '#7E9C6A', apron: '#D8C29A', trousers: '#5B4E44', hat: 'kufi', ...o }),
  baker: (o) => man({ skin: '#C9915F', hair: 'short', beard: 'moustache', shirt: 'w-white', collar: 'tee', apron: '#EFE6D2', hat: 'baker', trousers: '#6B6F78', ...o }),
  owner: (o) => man({ skin: '#A86F48', hair: 'bald', hairCls: '#5A4A40', beard: 'full', beardCls: '#8A8079', shirt: 'w-white', vest: '#7A3E35', trousers: '#3A3A44', glasses: true, ...o }),
  // Weeks 10-16
  layla: (o) => woman({ skin: '#C99366', hijab: null, hair: 'long', hairCls: '#2E211A', tunic: '#F2DEA3', panel: '#FBF1D6', trim: 'w-door', skirt: '#5B4E6E', ...o }),
  salma: (o) => woman({ skin: '#C99366', hijab: '#6E5A9A', tunic: '#A9C4D6', panel: null, trim: null, skirt: '#3E4A5E', ...o }),
  grandma: (o) => woman({ skin: '#B98863', hijab: 'w-white', tunic: '#4A3F55', panel: null, trim: '#C9A24A', skirt: '#4A3F55', glasses: true, old: true, ...o }),
  karim: (o) => man({ skin: '#B57F55', hair: 'short', beard: 'full', shirt: 'w-white', jacket: '#2F4F6F', trousers: '#3B3F4A', ...o }),
  ahmad: (o) => man({ skin: '#B07A52', hair: 'short', hairCls: '#4A4038', beard: 'moustache', beardCls: '#4A4038', shirt: '#C8A27A', collar: 'button', trousers: '#5B4E44', ...o }),
  teacher: (o) => woman({ skin: '#C89270', hijab: '#2F6B72', tunic: '#D9CBB0', panel: null, trim: null, skirt: '#4B4560', glasses: true, ...o }),
};
export const CAST = Object.keys(PEOPLE);

export function figure(who, { x = 0, y = 0, s = 1, ...o } = {}) {
  const draw = PEOPLE[who];
  if (!draw) throw new Error('No such person: ' + who);
  return place(draw(o), { x, y, s });
}

/** A seated figure: drawn lower, with the legs left out (a table or seat covers them). */
export const seated = (who, o) => figure(who, { ...o, seated: true });
