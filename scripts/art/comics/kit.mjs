// Scenery pieces shared by the comic panels (320 × 240). Everything returns W / I / D drawing strings.
import { W, I, D, LAYER } from '../paint.mjs';

export const circ = (x, y, r) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
export const ell = (x, y, rx, ry) => `M${x - rx} ${y} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
export const both = (cls, d, w = 1.4) => W(cls, d) + I(d, w);

/** Where a figure's hand ends up, for putting props in it. side: 1 screen right, -1 screen left. */
const HAND = { rest: [24.4, -68.6], wave: [35.3, -147.4], point: [56.4, -109.6], hold: [5.8, -84.7], hip: [17, -77.4], open: [43, -90.4], up: [25.7, -155.4] };
export const handAt = (x, y, s, pose, side = 1) => [x + s * side * HAND[pose][0], y + s * HAND[pose][1]];

export const sky = (h = 60, cls = 'w-sky') => W(cls, `M0 0 H320 V${h} H0 Z`);
export const stars = (pts) => D('w-lamp', pts.map(([x, y]) => [x, y, 1.3]));
export const moon = (x, y, r = 9) => both('w-lamp', `M${x} ${y - r} A${r} ${r} 0 1 0 ${x} ${y + r} A${r * 0.72} ${r} 0 1 1 ${x} ${y - r} Z`, 1.1);
export const sun = (x, y, r = 12) => both('w-lamp', circ(x, y, r), 1.3) + I(Array.from({ length: 8 }, (_, k) => {
  const a = (k * Math.PI) / 4;
  return `M${(x + Math.cos(a) * (r + 4)).toFixed(1)} ${(y + Math.sin(a) * (r + 4)).toFixed(1)} L${(x + Math.cos(a) * (r + 9)).toFixed(1)} ${(y + Math.sin(a) * (r + 9)).toFixed(1)}`;
}).join(' '), 1.3);

export const ground = (y = 214, cls = 'w-sand') => W(cls, `M0 ${y} H320 V240 H0 Z`) + I(`M0 ${y} H320`, 1.6);
export const paving = (y = 214) => I(`M0 ${y + 10} H320 M20 ${y} l-6 10 M70 ${y} l-6 10 M120 ${y} l-6 10 M170 ${y} l-6 10 M220 ${y} l-6 10 M270 ${y} l-6 10 M45 ${y + 10} l-6 16 M145 ${y + 10} l-6 16 M245 ${y + 10} l-6 16`, 1);

/** A round leafy crown on a trunk. fruit: [cls, r] dots scattered in the crown. */
export function tree(x, y, r = 34, { leaf = 'w-leaf', fruit = null, trunk = 'w-wood', seed = 1 } = {}) {
  const pts = Array.from({ length: 9 }, (_, k) => {
    const a = (k / 9) * Math.PI * 2 + seed;
    const rr = r * (0.82 + 0.18 * Math.sin(k * 2.3 + seed));
    return [x + Math.cos(a) * rr, y - r - 10 + Math.sin(a) * rr * 0.8];
  });
  const crown = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} ` + pts.map((p, k) => {
    const q = pts[(k + 1) % pts.length];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const ox = (mx - x) * 0.25, oy = (my - (y - r - 10)) * 0.25;
    return `Q${(mx + ox).toFixed(1)} ${(my + oy).toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  }).join(' ') + ' Z';
  let out = both(trunk, `M${x - 5} ${y} L${x - 3} ${y - r} L${x + 3} ${y - r} L${x + 5} ${y} Z`, 1.6) + LAYER + both(leaf, crown, 1.6);
  out += I(`M${x - r * 0.4} ${y - r - 4} q6 -4 12 0 M${x + r * 0.1} ${y - r - 22} q6 -4 12 0 M${x - r * 0.5} ${y - r - 26} q5 -3 10 0`, 0.9);
  if (fruit) {
    const [cls, fr] = fruit;
    const dots = Array.from({ length: 9 }, (_, k) => [x + Math.cos(k * 2.1 + seed) * r * 0.62, y - r - 10 + Math.sin(k * 2.1 + seed) * r * 0.5, fr]);
    out += D(cls, dots) + D('ink', dots, fr, 0.9);
  }
  return out;
}

/** An arched opening (door or window). */
export const arch = (x, y, w, h) => `M${x} ${y} V${y - h + w / 2} Q${x + w / 2} ${y - h - w * 0.1} ${x + w} ${y - h + w / 2} V${y} Z`;

/** A wooden crate full of round fruit. */
export function crate(x, y, w = 40, fruitCls = 'w-lamp', r = 5) {
  const dots = [];
  for (let k = 0; k < Math.floor(w / (r * 1.7)); k++) dots.push([x + r + 2 + k * r * 1.7, y - 13 - (k % 2) * 2, r]);
  for (let k = 0; k < Math.floor(w / (r * 1.7)) - 1; k++) dots.push([x + r * 1.9 + 2 + k * r * 1.7, y - 19 - (k % 2), r]);
  return D(fruitCls, dots) + D('ink', dots, r, 1) + both('w-wood', `M${x} ${y} h${w} v-14 h${-w} Z`, 1.4) + I(`M${x} ${y - 7} h${w}`, 0.9);
}
export const bananas = (x, y) => both('w-lamp', `M${x} ${y} q12 10 26 -4 q-2 -3 -5 -2 q-8 8 -18 1 Z M${x + 2} ${y - 6} q12 9 24 -5 q-2 -3 -5 -2 q-8 7 -16 1 Z`, 1.2) + I(`M${x + 24} ${y - 9} l3 -3`, 1.4);
export const lemons = (x, y, n = 5) => D('w-lamp', Array.from({ length: n }, (_, k) => [x + k * 9, y - (k % 2) * 4, 4.6])) + I(Array.from({ length: n }, (_, k) => ell(x + k * 9, y - (k % 2) * 4, 5, 4.2)).join(' '), 1);

/** A string of lights from (x1, y1) to (x2, y2) sagging by sag. */
export function lights(x1, y1, x2, y2, n = 8, sag = 12) {
  const pts = Array.from({ length: n }, (_, k) => {
    const t = (k + 0.5) / n;
    return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + Math.sin(Math.PI * t) * sag + 3, 3];
  });
  return I(`M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag * 2} ${x2} ${y2}`, 1.1) + D('w-lamp', pts);
}

/** A hanging lantern (fanous) from the ceiling at x, body centred at y. */
export const fanous = (x, y, cls = 'w-lamp') => W(cls, `M${x - 9} ${y - 6} h18 l-3 18 l-6 6 l-6 -6 Z`) +
  I(`M${x} 0 V${y - 16} M${x - 6} ${y - 16} h12 l3 6 h-18 Z M${x - 9} ${y - 10} h18 v4 h-18 Z M${x - 9} ${y - 6} h18 l-3 18 l-6 6 l-6 -6 Z M${x} ${y - 6} v24`, 1.4);

/** A camel's head and neck coming in from the right, munching. */
export function camel(x, y) {
  const neck = `M${x + 60} ${y + 90} Q${x + 34} ${y + 40} ${x + 22} ${y + 10} L${x + 4} ${y + 12} Q${x - 10} ${y + 14} ${x - 14} ${y + 24} Q${x - 10} ${y + 34} ${x + 4} ${y + 32} L${x + 14} ${y + 30} Q${x + 22} ${y + 60} ${x + 40} ${y + 100} Z`;
  return both('w-sand', neck, 1.8) + both('w-sand', ell(x + 18, y + 6, 4, 6), 1.3) + D('ink', [[x + 8, y + 18, 1.2]], 1.2, 2) +
    I(`M${x - 13} ${y + 26} q3 2 6 1 M${x - 8} ${y + 19} q2 -1 4 0 M${x + 18} ${y + 30} q4 8 0 14 M${x + 26} ${y + 12} q6 2 8 8`, 1);
}

/** A small dog, facing right, at its feet (x, y). */
export function dog(x, y, cls = 'w-sand') {
  const body = `M${x - 22} ${y - 14} Q${x - 22} ${y - 26} ${x - 8} ${y - 26} H${x + 8} Q${x + 12} ${y - 34} ${x + 20} ${y - 34} Q${x + 30} ${y - 34} ${x + 30} ${y - 26} L${x + 26} ${y - 20} Q${x + 18} ${y - 18} ${x + 16} ${y - 14} Z`;
  return both(cls, body, 1.6) + both(cls, `M${x - 18} ${y - 14} v14 h5 v-14 M${x + 8} ${y - 14} v14 h5 v-14`, 1.4) +
    both('w-wood', `M${x + 14} ${y - 34} q-6 4 -2 12 q4 -2 6 -8 Z`, 1.2) + D('ink', [[x + 24, y - 29, 1]], 1, 2) +
    I(`M${x - 22} ${y - 22} q-8 -6 -6 -14 M${x + 29} ${y - 25} l3 1`, 1.4);
}

/** A table top (and front) across the panel from y. */
export const table = (y, cls = 'w-wood', x1 = -6, x2 = 326) => W(cls, `M${x1} ${y} H${x2} V240 H${x1} Z`) + I(`M${x1} ${y} H${x2} M${x1} ${y + 9} H${x2}`, 2);
export const cup = (x, y, cls = 'w-white') => both(cls, `M${x - 5} ${y} h10 l-1 -10 h-8 Z`, 1.2) + I(`M${x + 5} ${y - 7} q4 0 3 3 q-1 2 -4 2`, 1);
export const glass = (x, y, cls = 'w-lamp') => W(cls, `M${x - 4} ${y} h8 l1 -11 h-10 Z`) + I(`M${x - 4} ${y} h8 l1.5 -14 h-11 Z`, 1.1);
export const book = (x, y, cls = 'w-roof', w = 16, h = 20) => both(cls, `M${x} ${y} h${w} v${-h} h${-w} Z`, 1.3) + I(`M${x + 3} ${y} v${-h}`, 0.9);
export const shelf = (x, y, w, colors = ['w-roof', 'w-door', 'w-leaf', 'w-lamp', 'w-rose', 'w-shirt']) => {
  let out = '';
  let cx = x + 2;
  let k = 0;
  while (cx < x + w - 8) {
    const bw = 6 + ((k * 7) % 5), bh = 18 + ((k * 5) % 8);
    out += both(colors[k % colors.length], `M${cx} ${y} h${bw} v${-bh} h${-bw} Z`, 1);
    cx += bw + 1;
    k++;
  }
  return out + I(`M${x} ${y} h${w}`, 2);
};
