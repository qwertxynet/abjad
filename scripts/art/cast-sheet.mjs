// Model sheet for the painted cast: full figures in a few poses, then face close-ups in every mood.
// Usage: node scripts/art/cast-sheet.mjs out.png [who…]
import sharp from 'sharp';
import { paint } from './paint.mjs';
import { figure } from './cast.mjs';

const [out = 'scripts/art/cast.png', ...who] = process.argv.slice(2);
const people = who.length ? who : ['nader', 'rana'];
const POSES = [
  { mood: 'smile', armL: 'rest', armR: 'rest', look: 0 },
  { mood: 'talk', armL: 'rest', armR: 'wave', look: 1 },
  { mood: 'surprised', armL: 'open', armR: 'open', look: 0 },
  { mood: 'think', armL: 'hold', armR: 'point', look: -1 },
  { mood: 'celebrate', armL: 'up', armR: 'up', look: 0 },
];
const MOODS = ['smile', 'talk', 'surprised', 'celebrate', 'think'];
const SC = 3;
const tiles = [];
let top = 0;
for (const p of people) {
  // full figures: 120 × 180 units each
  for (const [i, pose] of POSES.entries()) {
    const svg = paint(figure(p, { x: 60, y: 172, ...pose }), { width: 120, height: 180, scale: SC, seed: 7 + i, bg: '#F6EEDD' });
    tiles.push({ input: await sharp(Buffer.from(svg)).png().toBuffer(), left: i * 120 * SC, top });
  }
  top += 180 * SC;
  // faces: 120 × 90 units, figure scaled ×2.4 so the head fills the cell
  for (const [i, mood] of MOODS.entries()) {
    const s = 2.4;
    const svg = paint(figure(p, { x: 60, y: 50 + 138 * s, s, mood, look: i === 1 ? 1 : 0 }), { width: 120, height: 90, scale: SC, seed: 40 + i, bg: '#FBF5E8' });
    tiles.push({ input: await sharp(Buffer.from(svg)).png().toBuffer(), left: i * 120 * SC, top });
  }
  top += 90 * SC;
}
await sharp({ create: { width: 600 * SC, height: top, channels: 3, background: '#F3E8D2' } }).composite(tiles).png().toFile(out);
console.log('wrote', out);
