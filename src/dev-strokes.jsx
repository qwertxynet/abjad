// Development aid (not part of the app): shows each letter form's centre line for placing strokes. In the dev console: (await import('/src/dev-strokes.jsx')).show(['ا', …])
import { drawGlyph, analyseGlyph, keyPoints, SIZE, GRID, CELL } from './components/strokes.js';
import { LETTERS, forms } from './data/letters.js';

export async function show(chars, scale = 1) {
  await document.fonts.load('200px "Noto Naskh Arabic"', 'ابت');
  document.getElementById('dev-strokes')?.remove();
  const host = document.createElement('div');
  host.id = 'dev-strokes';
  host.style.cssText = 'position:absolute;inset:0;z-index:9999;overflow:auto;background:#fff;display:flex;flex-wrap:wrap;gap:4px;padding:4px';
  document.body.appendChild(host);
  const report = {};
  for (const c of chars) {
    const l = LETTERS.find((x) => x.char === c);
    const f = forms(c);
    const list = l?.joins ? ['isolated', 'initial', 'medial', 'final'] : l ? ['isolated', 'final'] : ['isolated'];
    for (const fm of list) {
      const glyph = f ? f[fm] : c;
      const cv = document.createElement('canvas');
      cv.width = SIZE;
      cv.height = SIZE;
      cv.style.width = SIZE * scale + 'px';
      const g = cv.getContext('2d', { willReadFrequently: true });
      drawGlyph(g, glyph);
      const info = analyseGlyph(g);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = '#c9d8ee';
      g.fillRect(0, 0, SIZE, SIZE);
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = '#eee';
      g.fillStyle = '#999';
      g.font = '9px sans-serif';
      for (let v = 0; v <= SIZE; v += 20) {
        g.beginPath(); g.moveTo(v, 0); g.lineTo(v, SIZE); g.moveTo(0, v); g.lineTo(SIZE, v); g.stroke();
        if (v % 40 === 0) { g.fillText(v, v + 1, 9); g.fillText(v, 1, v - 1); }
      }
      g.fillStyle = '#d33';
      for (let i = 0; i < info.skel.length; i++) if (info.skel[i]) g.fillRect((i % GRID) * CELL, Math.floor(i / GRID) * CELL, CELL, CELL);
      const kp = keyPoints(info);
      g.font = 'bold 10px sans-serif';
      kp.ends.forEach(([x, y]) => { g.fillStyle = '#080'; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); g.fillText(`${x},${y}`, x + 4, y - 3); });
      kp.joins.forEach(([x, y]) => { g.fillStyle = '#00c'; g.fillRect(x - 2, y - 2, 4, 4); });
      g.fillStyle = '#000';
      g.font = 'bold 14px sans-serif';
      g.fillText(`${c} ${fm}`, 230, 310);
      host.appendChild(cv);
      report[`${c}:${fm}`] = { ends: kp.ends, joins: kp.joins.length, parts: info.parts.map((p) => ({ n: p.n, c: [Math.round(p.cx), Math.round(p.cy)] })) };
    }
  }
  return report;
}
