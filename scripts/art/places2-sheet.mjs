import sharp from 'sharp';
import { PLACES2 } from '../../src/art/places2.js';
import { PLACES } from '../../src/art/places.js';
const style = `.ink{fill:none;stroke:#2A2118;stroke-linecap:round;stroke-linejoin:round}
.w-stone{fill:#EBD9B4;opacity:.9}.w-roof{fill:#D9785A;opacity:.85}.w-sky{fill:#AFC7E6;opacity:.85}.w-door{fill:#3E7C8C;opacity:.8}
.w-leaf{fill:#9BBF86;opacity:.85}.w-rose{fill:#D9739A;opacity:.8}.w-sand{fill:#E9C77E;opacity:.85}.w-awning{fill:#E39A6A;opacity:.85}
.w-lamp{fill:#F2C14E;opacity:.95}.w-shadow{fill:#C9B48C;opacity:.45}
.a{fill:#F1C7B5}.b{fill:#C8D7EE}.g{fill:#CFE3C4}.y{fill:#F2DEA3}.t{fill:#E8A38E}.win{fill:#FFF6DD}`;
const tiles = [];
let i = 0;
for (const n of [1, 6, 8]) {
  const old = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="200" viewBox="0 0 120 100" fill="none" stroke="#2A2118" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><style>${style}</style>${PLACES[n].svg}</svg>`;
  const neu = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="300" viewBox="0 0 240 200"><style>${style}</style>${PLACES2[n].svg}</svg>`;
  tiles.push({ input: await sharp(Buffer.from(old)).png().toBuffer(), left: 20, top: 40 + i * 320 + 50 });
  tiles.push({ input: await sharp(Buffer.from(neu)).png().toBuffer(), left: 300, top: 40 + i * 320 });
  i++;
}
const lab = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="700" height="30"><text x="140" y="22" font-size="18" text-anchor="middle" font-family="Georgia" fill="#2A2118">current</text><text x="480" y="22" font-size="18" text-anchor="middle" font-family="Georgia" fill="#2A2118">new style</text></svg>`)).png().toBuffer();
tiles.push({ input: lab, left: 0, top: 4 });
await sharp({ create: { width: 700, height: 1010, channels: 3, background: '#F3E8D2' } }).composite(tiles).png().toFile(process.argv[2]);
console.log('ok');
