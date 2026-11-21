// Paints the weekly comics (scripts/art/comics/wNN.mjs) into public/comics/<week>-<panel>.webp,
// and writes the speech bubbles for the app into src/data/comics.json.
// Usage: node scripts/art/render-comics.mjs [weeks…] [--sheet out.png]
import fs from 'fs';
import sharp from 'sharp';
import { paint, PALETTE } from './paint.mjs';

PALETTE.day['w-dusk'] = '#C7A07C';
const OUT = 'public/comics';
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const sheetAt = args.indexOf('--sheet');
const sheet = sheetAt >= 0 ? args[sheetAt + 1] : null;
const dataOnly = args.includes('--data'); // only rewrite the bubbles (no repainting)
const pick = args.filter((a, i) => /^\d+$/.test(a) && (sheetAt < 0 || i !== sheetAt + 1)).map(Number);
const all = fs.readdirSync('scripts/art/comics').map((f) => +f.match(/^w(\d+)\.mjs$/)?.[1]).filter(Boolean).sort((a, b) => a - b);
const weeks = pick.length ? pick : all;

const DATA = 'src/data/comics.json';
const data = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, 'utf8')) : {};
const tiles = [];
for (const n of weeks) {
  const { PANELS } = await import(`./comics/w${String(n).padStart(2, '0')}.mjs`);
  data[n] = [];
  for (const [i, p] of PANELS.entries()) {
    const file = `${n}-${i + 1}.webp`;
    let buf = null;
    if (!dataOnly) {
      const svg = paint(p.svg, { width: 320, height: 240, scale: 3, seed: n * 1000 + i * 100, lit: p.lit, bg: '#F6EEDD' });
      buf = await sharp(Buffer.from(svg)).webp({ quality: 80 }).toBuffer();
      fs.writeFileSync(`${OUT}/${file}`, buf);
    }
    data[n].push({
      img: file,
      alt: p.alt,
      bubbles: p.bubbles.map((b, k) => ({ id: `k${String(n).padStart(2, '0')}-${i + 1}${'abcdef'[k]}`, ...b })),
    });
    if (!buf) continue;
    if (sheet) tiles.push({ input: await sharp(buf).resize(640).png().toBuffer(), left: (tiles.length % 2) * 650, top: Math.floor(tiles.length / 2) * 490 });
    console.log('painted', file, Math.round(buf.length / 1024) + ' KB');
  }
}
fs.writeFileSync(DATA, JSON.stringify(data, null, 1));
if (sheet) await sharp({ create: { width: 1300, height: Math.ceil(tiles.length / 2) * 490, channels: 3, background: '#F3E8D2' } }).composite(tiles).png().toFile(sheet);
