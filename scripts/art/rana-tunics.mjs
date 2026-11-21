// Three hand-drawn long-sleeved outfits for Rana in the Open Peeps line style, swapped in for the Open Peeps body.
import sharp from 'sharp';
import { peep, INK } from './peeps.mjs';
const o = (x) => ({ outlineColor: INK, ...x });
const SW = 13; // ink line width, like Open Peeps
const line = (d, extra = '') => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const shape = (d, fill) => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
// Silhouette in Effigy coordinates (viewBox 184..1124 × 210..1341); the hijab covers the neck and upper shoulders.
const SIL = 'M372 600 C 290 615 228 668 205 790 C 186 905 176 1070 166 1360 L 834 1360 C 824 1070 814 905 795 790 C 772 668 710 615 628 600 Z';
const sleeves = (fill) => shape('M205 790 C 186 905 176 1070 166 1360 L 292 1360 C 286 1140 286 1000 292 900 C 265 845 236 810 205 790 Z', fill) + shape('M795 790 C 814 905 824 1070 834 1360 L 708 1360 C 714 1140 714 1000 708 900 C 735 845 764 810 795 790 Z', fill);
const diamonds = (x, y0, y1, c1, c2) => {
  let s = '';
  for (let y = y0; y < y1; y += 62) s += `<path d="M${x} ${y} l24 24 l-24 24 l-24 -24 Z" fill="${c1}" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="${y + 24}" r="6" fill="${c2}"/>`;
  return s;
};
const tunics = {
  'A · embroidered tunic': () =>
    shape(SIL, '#E8B8A4') + sleeves('#E8B8A4') +
    shape('M452 640 L548 640 L552 1360 L448 1360 Z', '#F3D9C9') + diamonds(500, 660, 1330, '#C8553D', '#F6EAD2') +
    `<g stroke="#C8553D" stroke-width="7" stroke-linecap="round">${[0, 1, 2, 3, 4].map((i) => `<path d="M${190 + i * 18} ${1262 - i} l9 12"/><path d="M${728 + i * 18} ${1262 - i} l9 12"/>`).join('')}</g>`,
  'B · open abaya over a dress': () =>
    shape(SIL, '#8FAE8A') + shape('M400 640 C 430 900 440 1150 440 1360 L 560 1360 C 560 1150 570 900 600 640 Z', '#E8B8A4') +
    line('M400 640 C 430 900 440 1150 440 1360') + line('M600 640 C 570 900 560 1150 560 1360') + sleeves('#8FAE8A') +
    `<g fill="#C8553D">${[700, 820, 940, 1060, 1180].map((y) => `<circle cx="500" cy="${y}" r="9"/>`).join('')}</g>`,
  'C · kaftan with trim': () =>
    shape(SIL, '#F2DEA3') + sleeves('#F2DEA3') +
    shape('M440 640 L 500 820 L 560 640 L 540 636 L 500 760 L 460 636 Z', '#C8553D') +
    shape('M488 820 L512 820 L515 1360 L485 1360 Z', '#C8553D') +
    shape('M171 1250 L 290 1250 L 292 1320 L 168 1320 Z', '#C8553D') + shape('M829 1250 L 710 1250 L 708 1320 L 832 1320 Z', '#C8553D'),
};
const W = 330;
const tiles = [];
for (const [i, [label, body]] of Object.entries(tunics).entries()) {
  let svg = peep({ head: { type: 'Hijab', options: o({ skinColor: '#D9A27A', hijabColor: '#C8553D' }) }, face: { type: 'Smile', options: o({}) }, body: { type: 'ButtonShirt', options: o({ skinColor: '#D9A27A', topColor: '#E8B8A4' }) } });
  const a = svg.indexOf('<g id="Body"'), b = svg.indexOf('<g id="Head"');
  svg = svg.slice(0, a) + `<g id="Body">${body()}</g>` + svg.slice(b);
  svg = svg.replace('<svg', `<svg width="${W}" height="${W * 1.2}"`);
  const png = await sharp(Buffer.from(svg)).resize(W, Math.round(W * 1.2), { fit: 'contain', background: '#F3E8D2' }).png().toBuffer();
  const lab = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30"><text x="${W / 2}" y="22" font-size="19" text-anchor="middle" font-family="Georgia" fill="${INK}">${label}</text></svg>`)).png().toBuffer();
  tiles.push({ input: png, left: i * W, top: 0 }, { input: lab, left: i * W, top: Math.round(W * 1.2) + 4 });
}
await sharp({ create: { width: W * 3, height: Math.round(W * 1.2) + 40, channels: 3, background: '#F3E8D2' } }).composite(tiles).png().toFile(process.argv[2]);
console.log('ok');
