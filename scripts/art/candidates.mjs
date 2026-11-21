import sharp from 'sharp';
import { peep, INK } from './peeps.mjs';
const skinN = '#B9784A', skinR = '#D9A27A';
const o = (x) => ({ outlineColor: INK, ...x });
const cands = [
  ['Nader A', { head: { type: 'ShortOne', options: o({ skinColor: skinN, hairColor: '#2A2118' }) }, face: { type: 'Smile', options: o({}) }, body: { type: 'Explaining', options: o({ skinColor: skinN, topColor: '#9DB8E6' }) } }],
  ['Nader B', { head: { type: 'Wavy', options: o({ skinColor: skinN, hairColor: '#2A2118' }) }, face: { type: 'BigSmile', options: o({}) }, body: { type: 'ButtonShirt', options: o({ skinColor: skinN, topColor: '#9DB8E6' }) }, beard: { type: 'Chin', options: o({}) } }],
  ['Rana A', { head: { type: 'Hijab', options: o({ skinColor: skinR, hijabColor: '#C8553D' }) }, face: { type: 'Smile', options: o({}) }, body: { type: 'Explaining', options: o({ skinColor: skinR, topColor: '#E8B8A4' }) } }],
  ['Rana B', { head: { type: 'LongHair', options: o({ skinColor: skinR, hairColor: '#3B2418' }) }, face: { type: 'BigSmile', options: o({}) }, body: { type: 'Dress', options: o({ skinColor: skinR, topColor: '#E8B8A4' }) } }],
];
const W = 300, H = 380;
const tiles = await Promise.all(cands.map(async ([label, p], i) => {
  const svg = peep(p).replace('<svg', `<svg width="${W}" height="${W * 1.2}"`);
  const png = await sharp(Buffer.from(svg)).resize(W, Math.round(W * 1.2), { fit: 'contain', background: '#F3E8D2' }).png().toBuffer();
  const lab = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30"><text x="${W / 2}" y="22" font-size="20" text-anchor="middle" font-family="Georgia" fill="${INK}">${label}</text></svg>`)).png().toBuffer();
  return [{ input: png, left: i * W, top: 0 }, { input: lab, left: i * W, top: Math.round(W * 1.2) + 4 }];
}));
await sharp({ create: { width: W * cands.length, height: H + 10, channels: 3, background: '#F3E8D2' } }).composite(tiles.flat()).png().toFile(process.argv[2]);
console.log('ok');
