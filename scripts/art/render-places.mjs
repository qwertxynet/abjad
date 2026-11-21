// Renders the neighbourhood places (src/art/places2.js) into painted images:
//  • ink lines → rough.js (a slightly wobbly pen line, two passes on thicker strokes)
//  • washes → SVG watercolour filters: wobbly edges, darker pigment at the edges, paper-grain granulation
//  • shadows → light cross-hatching
// Output: public/places/<n>-day.webp and <n>-night.webp (lamps and windows lit at night).
// Usage: node scripts/art/render-places.mjs [weeks…] [--sheet out.png]
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import rough from 'roughjs';
import { PLACES2 } from '../../src/art/places2.js';

const OUT = 'public/places';
fs.mkdirSync(OUT, { recursive: true });
const gen = rough.generator();

const PALETTE = {
  day: {
    ink: '#2A2118', alpha: 0.86,
    'w-stone': '#E9D3A6', 'w-roof': '#D46F4D', 'w-sky': '#A9C3E3', 'w-door': '#3E7C8C', 'w-leaf': '#93BA7C', 'w-rose': '#D6668F',
    'w-sand': '#E7C06E', 'w-awning': '#E08F5E', 'w-lamp': '#F2C14E', 'w-shadow': '#BFA67A',
  },
  night: {
    ink: '#EADFC6', alpha: 0.9,
    'w-stone': '#4E4B66', 'w-roof': '#7A4646', 'w-sky': '#F5C451', 'w-door': '#284A5C', 'w-leaf': '#3F5E46', 'w-rose': '#86446A',
    'w-sand': '#6F5E3E', 'w-awning': '#7D4B3E', 'w-lamp': '#FFD86B', 'w-shadow': '#0B0F1F',
  },
};
const GLOW = new Set(['w-lamp']); // also windows (w-sky) at night

/** Splits a place's SVG string back into washes and ink strokes. */
function parse(svg) {
  const out = [];
  const re = /<g class="([^"]+)"(?: stroke-width="([^"]+)")?>(.*?)<\/g>|<path class="([^"]+)" d="([^"]+)"(?: stroke-width="([^"]+)")?\s*\/>/g;
  let m;
  while ((m = re.exec(svg))) {
    if (m[1]) {
      const cls = m[1], w = +(m[2] || 1.2);
      for (const c of m[3].matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"\/>/g)) {
        const [x, y, r] = [+c[1], +c[2], +c[3]];
        const d = `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
        out.push(cls === 'ink' ? { kind: 'ink', d, w } : { kind: 'wash', cls, d });
      }
      for (const p of m[3].matchAll(/<path d="([^"]+)"\/>/g)) out.push(cls === 'ink' ? { kind: 'ink', d: p[1], w } : { kind: 'wash', cls, d: p[1] });
    } else if (m[4] === 'ink') out.push({ kind: 'ink', d: m[5], w: +(m[6] || 2.4) });
    else out.push({ kind: 'wash', cls: m[4], d: m[5] });
  }
  return out;
}

const filter = (id, seed) => `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="warp"/>
<feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" result="shape"/>
<feMorphology in="shape" operator="erode" radius="1.4" result="inner"/>
<feComposite in="shape" in2="inner" operator="out" result="rim"/>
<feComponentTransfer in="rim" result="rimDark"><feFuncR type="linear" slope="0.72"/><feFuncG type="linear" slope="0.72"/><feFuncB type="linear" slope="0.72"/></feComponentTransfer>
<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed + 11}" result="grain"/>
<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.55 1.12" result="grainA"/>
<feComposite in="shape" in2="grainA" operator="in" result="granulated"/>
<feMerge><feMergeNode in="granulated"/><feMergeNode in="rimDark"/></feMerge>
</filter>`;
const glow = `<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

export function paint(n, mode) {
  const P = PALETTE[mode];
  const items = parse(PLACES2[n].svg);
  let defs = glow;
  let washes = '';
  let inks = '';
  let seed = n * 97;
  for (const it of items) {
    seed++;
    if (it.kind === 'wash') {
      const fill = P[it.cls] || '#ccc';
      const lit = GLOW.has(it.cls) || (mode === 'night' && it.cls === 'w-sky');
      if (it.cls === 'w-shadow') {
        // a faint wash plus pen hatching
        defs += filter('f' + seed, seed);
        washes += `<path d="${it.d}" fill="${fill}" opacity="${mode === 'night' ? 0.55 : 0.4}" filter="url(#f${seed})"/>`;
        const h = gen.path(it.d, { fill: P.ink, fillStyle: 'hachure', hachureAngle: -41, hachureGap: 5, fillWeight: 0.7, stroke: 'none', roughness: 1.2, seed });
        for (const p of gen.toPaths(h)) inks += `<path d="${p.d}" fill="none" stroke="${P.ink}" stroke-width="0.7" opacity="0.28"/>`;
        continue;
      }
      defs += filter('f' + seed, seed);
      washes += `<path d="${it.d}" fill="${fill}" opacity="${lit ? 1 : P.alpha}" filter="url(#f${seed})"/>`;
      if (lit && mode === 'night') washes += `<path d="${it.d}" fill="${fill}" opacity="0.55" filter="url(#glow)"/>`;
    } else {
      const thick = it.w >= 1.6;
      const drawable = gen.path(it.d, { stroke: P.ink, strokeWidth: it.w * 0.95, roughness: thick ? 0.9 : 0.6, bowing: 0.8, disableMultiStroke: !thick, preserveVertices: false, seed });
      for (const p of gen.toPaths(drawable)) inks += `<path d="${p.d}" fill="none" stroke="${P.ink}" stroke-width="${p.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="400" viewBox="0 0 240 200"><defs>${defs}</defs><g>${washes}</g><g>${inks}</g></svg>`;
}

const args = process.argv.slice(2);
const sheetAt = args.indexOf('--sheet');
const sheet = sheetAt >= 0 ? args[sheetAt + 1] : null;
const weeks = args.filter((a, i) => /^\d+$/.test(a) && (sheetAt < 0 || i !== sheetAt + 1)).map(Number);
const list = weeks.length ? weeks : Object.keys(PLACES2).map(Number);
const tiles = [];
for (const [i, n] of list.entries()) {
  for (const [j, mode] of ['day', 'night'].entries()) {
    const buf = await sharp(Buffer.from(paint(n, mode))).webp({ quality: 82 }).toBuffer();
    fs.writeFileSync(path.join(OUT, `${n}-${mode}.webp`), buf);
    if (sheet) tiles.push({ input: await sharp(buf).flatten({ background: mode === 'day' ? '#F3E8D2' : '#141A2E' }).png().toBuffer(), left: j * 480, top: i * 400 });
  }
  console.log('painted', n);
}
if (sheet) await sharp({ create: { width: 960, height: 400 * list.length, channels: 3, background: '#F3E8D2' } }).composite(tiles).png().toFile(sheet);
