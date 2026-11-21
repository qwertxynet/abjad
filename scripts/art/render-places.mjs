// Renders the neighbourhood places (src/art/places2.js) into painted images:
//  • ink lines → rough.js (a slightly wobbly pen line, two passes on thicker strokes)
//  • washes → SVG watercolour filters: wobbly edges, darker pigment at the edges, paper-grain granulation
//  • shadows → light cross-hatching
// Output: public/places/<n>-day.webp and <n>-night.webp (lamps and windows lit at night).
// Usage: node scripts/art/render-places.mjs [weeks…] [--sheet out.png]
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PLACES2 } from '../../src/art/places2.js';
import { paint as paintSvg } from './paint.mjs';

const OUT = 'public/places';
fs.mkdirSync(OUT, { recursive: true });

export const paint = (n, mode) => paintSvg(PLACES2[n].svg, { mode, seed: n * 97 });

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
