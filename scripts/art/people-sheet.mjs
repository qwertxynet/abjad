// A labelled sheet of cast members for review: a full figure and a face close-up each.
// Usage: node scripts/art/people-sheet.mjs out.png who[:key=value,…] …   e.g. dina:hijab=#8C6BA8
import sharp from 'sharp';
import { paint } from './paint.mjs';
import { figure } from './cast.mjs';

const [out, ...list] = process.argv.slice(2);
const SC = 3;
const tiles = [];
for (const [i, spec] of list.entries()) {
  const [who, extra = ''] = spec.split(':');
  const o = Object.fromEntries(extra.split(',').filter(Boolean).map((kv) => kv.split('=')));
  const full = paint(figure(who, { x: 60, y: 172, mood: 'smile', armR: 'wave', look: 0, ...o }), { width: 120, height: 180, scale: SC, seed: 11 + i, bg: '#F6EEDD' });
  const s = 2.4;
  const face = paint(figure(who, { x: 60, y: 50 + 138 * s, s, mood: 'talk', look: 1, ...o }), { width: 120, height: 90, scale: SC, seed: 51 + i, bg: '#FBF5E8' });
  const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${120 * SC}" height="60"><rect width="100%" height="100%" fill="#F3E8D2"/><text x="50%" y="40" font-family="Georgia" font-size="30" text-anchor="middle" fill="#2A2118">${String.fromCharCode(65 + i)}. ${who}${o.hijab ? ' (hijab)' : ''}</text></svg>`);
  const left = i * 120 * SC;
  tiles.push({ input: await sharp(label).png().toBuffer(), left, top: 0 });
  tiles.push({ input: await sharp(Buffer.from(full)).png().toBuffer(), left, top: 60 });
  tiles.push({ input: await sharp(Buffer.from(face)).png().toBuffer(), left, top: 60 + 180 * SC });
}
await sharp({ create: { width: list.length * 120 * SC, height: 60 + 270 * SC, channels: 3, background: '#F3E8D2' } }).composite(tiles).png().toFile(out);
console.log('wrote', out);
