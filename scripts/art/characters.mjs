// Builds نادر and رنا as static SVGs (Open Peeps CC0 parts + Rana's hand-drawn tunic) into src/art/characters/.
// Run: node scripts/art/characters.mjs [contact-sheet.png]
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { peep, INK } from './peeps.mjs';
const o = (x) => ({ outlineColor: INK, ...x });
const src = fs.readFileSync('scripts/art/rana-tunics.mjs', 'utf8');
const helpers = src.slice(src.indexOf('const SW'), src.indexOf('const tunics = {'));
const tunicA = src.slice(src.indexOf("'A · embroidered tunic': () =>") + "'A · embroidered tunic': () =>".length, src.indexOf("'B · open abaya"));
const tunic = new Function('INK', helpers + 'return () => ' + tunicA.trim().replace(/,\s*$/, '') + ';')(INK);

export const MOODS = { smile: 'Smile', talk: 'Explaining', surprised: 'Awe', celebrate: 'BigSmile', think: 'Calm' };
const SKIN_N = '#B9784A', SKIN_R = '#D9A27A';
function nader(face) {
  return peep({ head: { type: 'Wavy', options: o({ skinColor: SKIN_N, hairColor: INK }) }, face: { type: face, options: o({}) }, body: { type: 'ButtonShirt', options: o({ skinColor: SKIN_N, topColor: '#9DB8E6' }) }, beard: { type: 'Chin', options: o({}) } });
}
function rana(face) {
  let svg = peep({ head: { type: 'Hijab', options: o({ skinColor: SKIN_R, hijabColor: '#C8553D' }) }, face: { type: face, options: o({}) }, body: { type: 'ButtonShirt', options: o({ skinColor: SKIN_R, topColor: '#E8B8A4' }) } });
  const a = svg.indexOf('<g id="Body"'), b = svg.indexOf('<g id="Head"');
  return svg.slice(0, a) + `<g id="Body" transform="translate(605 170) scale(1.08 1) translate(-500 0)">${tunic()}</g>` + svg.slice(b);
}
const OUT = 'src/art/characters';
fs.mkdirSync(OUT, { recursive: true });
const all = [];
for (const [who, fn] of [['nader', nader], ['rana', rana]])
  for (const [mood, face] of Object.entries(MOODS)) {
    const svg = fn(face).replace('<svg', '<svg role="img"');
    fs.writeFileSync(path.join(OUT, `${who}-${mood}.svg`), svg);
    all.push([`${who} · ${mood}`, svg]);
  }
if (process.argv[2]) {
  const W = 200, cols = 5, tiles = [];
  for (const [i, [label, svg]] of all.entries()) {
    const png = await sharp(Buffer.from(svg.replace('<svg', `<svg width="${W}" height="${W * 1.2}"`))).resize(W, W * 1.2, { fit: 'contain', background: '#F3E8D2' }).png().toBuffer();
    const lab = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="26"><text x="${W / 2}" y="19" font-size="16" text-anchor="middle" font-family="Georgia" fill="${INK}">${label}</text></svg>`)).png().toBuffer();
    const x = (i % cols) * W, y = Math.floor(i / cols) * (W * 1.2 + 30);
    tiles.push({ input: png, left: x, top: y }, { input: lab, left: x, top: y + W * 1.2 + 2 });
  }
  await sharp({ create: { width: W * cols, height: 2 * (W * 1.2 + 30), channels: 3, background: '#F3E8D2' } }).composite(tiles).png().toFile(process.argv[2]);
}
console.log('wrote', all.length, 'character SVGs');
