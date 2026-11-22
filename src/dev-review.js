// Development aid (not part of the app): makes stroke-order review sheets: (await import('/src/dev-review.js')).sheet(1)
import { LETTERS, forms } from './data/letters.js';
import { prepare, markerFor } from './components/Trace.jsx';
import { SIZE } from './components/strokes.js';

const NAMES = { isolated: 'Alone', initial: 'Start', medial: 'Middle', final: 'End' };
const formsOf = (l) => (l.joins ? ['isolated', 'initial', 'medial', 'final'] : ['isolated', 'final']);
const line = (g, pts) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); };

export async function sheet(week, chars = null) {
  const H8 = ['ء', 'أ', 'ى', 'آ'].map((c) => ({ char: c, nameEn: { 'ء': 'hamza', 'أ': 'alif + hamza', 'ى': 'alif maqṣūra', 'آ': 'alif madda' }[c], week: 8, hamza: true }));
  const letters = chars ? chars.map((c) => LETTERS.find((l) => l.char === c)) : week === 8 ? H8 : LETTERS.filter((l) => l.week === week);
  const cells = letters.flatMap((l) => (l.hamza ? ['isolated'] : formsOf(l)).map((fm) => ({ l, fm })));
  const P = 220, MAXW = 1640;
  // lay out: one block per form, one small panel per stroke
  const blocks = [];
  for (const { l, fm } of cells) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = SIZE;
    const glyph = l.hamza ? l.char : forms(l.char)[fm];
    const d = await prepare(cv, glyph, l.char, fm);
    blocks.push({ l, fm, glyph, d, w: Math.max(1, d.strokes.length) * (P + 6) + 6 });
  }
  let x = 10, y = 60, lineH = P + 44;
  const pos = blocks.map((b) => {
    if (x + b.w > MAXW) { x = 10; y += lineH; }
    const at = [x, y];
    x += b.w + 18;
    return at;
  });
  const out = document.createElement('canvas');
  out.width = MAXW;
  out.height = y + lineH + 10;
  const o = out.getContext('2d');
  o.fillStyle = '#F6EEDD';
  o.fillRect(0, 0, out.width, out.height);
  o.fillStyle = '#2A2118';
  o.font = 'bold 24px Georgia';
  o.fillText(`Week ${week} · stroke order, one stroke per picture · green = written · red = this stroke · grey dashes = joining line (not traced)`, 12, 34);
  blocks.forEach((b, bi) => {
    const [bx, by] = pos[bi];
    o.fillStyle = '#2A2118';
    o.font = '17px Georgia';
    o.fillText(`${b.l.nameEn} · ${NAMES[b.fm]}  ${b.glyph}`, bx, by - 6);
    b.d.strokes.forEach((s, k) => {
      const c = document.createElement('canvas');
      c.width = c.height = SIZE;
      const g = c.getContext('2d');
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, SIZE, SIZE);
      g.drawImage(b.d.g.canvas, 0, 0);
      g.globalCompositeOperation = 'source-over';
      // tint the guide
      const tint = document.createElement('canvas'); tint.width = tint.height = SIZE;
      const tg = tint.getContext('2d'); tg.drawImage(b.d.g.canvas, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = '#C9D3E6'; tg.fillRect(0, 0, SIZE, SIZE);
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, SIZE, SIZE); g.drawImage(tint, 0, 0);
      for (const jn of b.d.strokes.joins || []) { g.strokeStyle = 'rgba(120,110,95,0.55)'; g.lineWidth = 3; g.setLineDash([6, 5]); line(g, jn.pts); g.stroke(); g.setLineDash([]); }
      for (let j = 0; j < k; j++) {
        const t = b.d.strokes[j];
        g.strokeStyle = 'rgba(111,163,90,0.6)'; g.fillStyle = 'rgba(111,163,90,0.6)'; g.lineWidth = 20; g.lineCap = 'round'; g.lineJoin = 'round';
        if (t.kind === 'line') { line(g, t.pts); g.stroke(); } else { g.beginPath(); g.arc(t.at[0], t.at[1], 11, 0, 7); g.fill(); }
      }
      const m = markerFor(b.d.info, s);
      if (s.kind === 'line') { g.strokeStyle = 'rgba(31,90,102,0.8)'; g.lineWidth = 2; g.setLineDash([3, 4]); line(g, s.pts); g.stroke(); g.setLineDash([]); }
      for (const piece of m.arrow || []) {
        g.strokeStyle = '#B8452F'; g.lineWidth = 3.5; g.lineCap = 'round'; g.lineJoin = 'round'; line(g, piece); g.stroke();
        const a = piece[piece.length - 1], q = piece[Math.max(0, piece.length - 4)];
        const ang = Math.atan2(a[1] - q[1], a[0] - q[0]);
        g.fillStyle = '#B8452F'; g.beginPath(); g.moveTo(a[0] + Math.cos(ang) * 7, a[1] + Math.sin(ang) * 7);
        g.lineTo(a[0] + Math.cos(ang + 2.5) * 12, a[1] + Math.sin(ang + 2.5) * 12); g.lineTo(a[0] + Math.cos(ang - 2.5) * 12, a[1] + Math.sin(ang - 2.5) * 12); g.fill();
      }
      g.fillStyle = '#B8452F'; g.beginPath(); g.arc(m.badge[0], m.badge[1], 14, 0, 7); g.fill();
      g.fillStyle = '#FFF8EC'; g.font = 'bold 18px Georgia'; g.textAlign = 'center'; g.fillText(String(k + 1), m.badge[0], m.badge[1] + 6);
      const px = bx + k * (P + 6), py = by;
      o.drawImage(c, px, py, P, P);
      o.strokeStyle = '#D8C7A0'; o.strokeRect(px, py, P, P);
    });
  });
  const data = out.toDataURL('image/png').split(',')[1];
  const r = await fetch(`/__save?name=strokes-w${week}.png`, { method: 'POST', body: data });
  return r.text();
}
