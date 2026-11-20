// Dev helper: renders every drawing onto one PNG to check them by eye.
import sharp from 'sharp';
import { PICS, picSvg } from '../src/data/pics.js';
const ids = Object.keys(PICS);
const cols = 12, cell = 110;
const rows = Math.ceil(ids.length / cols);
const parts = await Promise.all(ids.map(async (id, i) => {
  const svg = picSvg(id, { size: 90 }).replace('</svg>', '') + `</svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cell}" height="16"><text x="${cell/2}" y="12" font-size="11" text-anchor="middle" font-family="Arial">${id}</text></svg>`);
  return [{ input: png, left: (i % cols) * cell + 10, top: Math.floor(i / cols) * cell }, { input: await sharp(label).png().toBuffer(), left: (i % cols) * cell, top: Math.floor(i / cols) * cell + 92 }];
}));
await sharp({ create: { width: cols * cell, height: rows * cell, channels: 3, background: '#fffaf0' } }).composite(parts.flat()).png().toFile(process.argv[2]);
console.log(ids.length, 'drawings');
