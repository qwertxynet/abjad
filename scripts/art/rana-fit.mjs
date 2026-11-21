import sharp from 'sharp';
import fs from 'fs';
import { peep, INK } from './peeps.mjs';
const src = fs.readFileSync('scripts/art/rana-tunics.mjs', 'utf8');
// reuse the tunic A drawing by evaluating its helper section
const helpers = src.slice(src.indexOf('const SW'), src.indexOf("const tunics = {"));
const tunicA = src.slice(src.indexOf("'A · embroidered tunic': () =>") + "'A · embroidered tunic': () =>".length, src.indexOf("'B · open abaya"));
const body = new Function('INK', helpers + 'return () => ' + tunicA.trim().replace(/,\s*$/, '') + ';')(INK);
const o = (x) => ({ outlineColor: INK, ...x });
const base = () => peep({ head: { type: 'Hijab', options: o({ skinColor: '#D9A27A', hijabColor: '#C8553D' }) }, face: { type: 'Smile', options: o({}) }, body: { type: 'ButtonShirt', options: o({ skinColor: '#D9A27A', topColor: '#E8B8A4' }) } });
const variants = [['Open Peeps shirt', null], ['x+100 y+150', [100, 150]], ['x+100 y+170', [100, 170]], ['x+110 y+190', [110, 190]], ['x+105 y+170 wider', [105, 170, 1.08]]];
const W = 260, tiles = [];
for (const [i, [label, t]] of variants.entries()) {
  let svg = base();
  if (t) {
    const a = svg.indexOf('<g id="Body"'), b = svg.indexOf('<g id="Head"');
    const [dx, dy, sx = 1] = t;
    svg = svg.slice(0, a) + `<g id="Body" transform="translate(${500 + dx} ${dy}) scale(${sx} 1) translate(-500 0)">${body()}</g>` + svg.slice(b);
  }
  svg = svg.replace('<svg', `<svg width="${W}" height="${W * 1.2}"`);
  const png = await sharp(Buffer.from(svg)).resize(W, Math.round(W * 1.2), { fit: 'contain', background: '#F3E8D2' }).png().toBuffer();
  const lab = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="28"><text x="${W / 2}" y="20" font-size="17" text-anchor="middle" font-family="Georgia" fill="${INK}">${label}</text></svg>`)).png().toBuffer();
  tiles.push({ input: png, left: i * W, top: 0 }, { input: lab, left: i * W, top: Math.round(W * 1.2) + 2 });
}
await sharp({ create: { width: W * variants.length, height: Math.round(W * 1.2) + 32, channels: 3, background: '#F3E8D2' } }).composite(tiles).png().toFile(process.argv[2]);
console.log('ok');
