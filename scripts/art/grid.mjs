import sharp from 'sharp';
import { peep, INK } from './peeps.mjs';
const o = (x) => ({ outlineColor: INK, ...x });
let svg = peep({ head: { type: 'Hijab', options: o({ skinColor: '#D9A27A', hijabColor: '#C8553D' }) }, face: { type: 'Smile', options: o({}) }, body: { type: 'ButtonShirt', options: o({ skinColor: '#D9A27A', topColor: '#E8B8A4' }) } });
// grid in effigy coordinates (viewBox 184..1124 x 210..1341)
let grid = '';
for (let x = 200; x <= 1100; x += 50) grid += `<line x1="${x}" y1="210" x2="${x}" y2="1341" stroke="${x % 100 ? '#9cf' : '#36c'}" stroke-width="${x % 100 ? 1 : 2}"/>` + (x % 100 ? '' : `<text x="${x + 3}" y="240" font-size="22" fill="#36c">${x}</text>`);
for (let y = 250; y <= 1340; y += 50) grid += `<line x1="184" y1="${y}" x2="1124" y2="${y}" stroke="${y % 100 ? '#9cf' : '#36c'}" stroke-width="${y % 100 ? 1 : 2}"/>` + (y % 100 ? '' : `<text x="190" y="${y - 4}" font-size="22" fill="#36c">${y}</text>`);
svg = svg.replace('</svg>', `<g opacity="0.55">${grid}</g></svg>`).replace('<svg', '<svg width="940" height="1131"');
await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).png().toFile(process.argv[2]);
console.log('ok');
