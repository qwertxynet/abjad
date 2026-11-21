import sharp from 'sharp';
import fs from 'fs';
import { peep, INK } from './peeps.mjs';
const bodies = fs.readdirSync('node_modules/@opeepsfun/open-peeps/build/body/effigy').filter((f) => f !== 'index.js' && f.endsWith('.js')).map((f) => f.slice(0, -3));
const skin = '#D9A27A', W = 200, cols = 7;
const o = (x) => ({ outlineColor: INK, ...x });
const tiles = [];
for (const [i, b] of bodies.entries()) {
  const svg = peep({ head: { type: 'Hijab', options: o({ skinColor: skin, hijabColor: '#C8553D' }) }, face: { type: 'Smile', options: o({}) }, body: { type: b, options: o({ skinColor: skin, topColor: '#E8B8A4' }) } }).replace('<svg', `<svg width="${W}" height="${W * 1.2}"`);
  const png = await sharp(Buffer.from(svg)).resize(W, W * 1.2, { fit: 'contain', background: '#F3E8D2' }).png().toBuffer();
  const lab = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="24"><text x="${W / 2}" y="18" font-size="15" text-anchor="middle" font-family="Georgia" fill="${INK}">${i + 1}. ${b}</text></svg>`)).png().toBuffer();
  const x = (i % cols) * W, y = Math.floor(i / cols) * (W * 1.2 + 28);
  tiles.push({ input: png, left: x, top: y }, { input: lab, left: x, top: y + W * 1.2 + 2 });
}
const rows = Math.ceil(bodies.length / cols);
await sharp({ create: { width: W * cols, height: rows * (W * 1.2 + 28), channels: 3, background: '#F3E8D2' } }).composite(tiles).png().toFile(process.argv[2]);
console.log(bodies.length, 'bodies');
