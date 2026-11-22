// Stroke engine for the tracing pad.
// The guide letter is drawn with the course font on a 320 × 320 canvas, then:
//  • its ink is thinned to a one-pixel centre line (the skeleton, on a 160 × 160 grid);
//  • each stroke of a letter form is stored as a few waypoints (start, points it passes, end) in canvas pixels,
//    and the path between them follows the skeleton, so a stroke always hugs the real letter;
//  • dots are the letter's small separate parts, each its own numbered step.
// Stroke definitions live in src/data/strokes.json, keyed "char:form" (e.g. "ب:initial").

export const SIZE = 320;
export const BASE = 0.62; // the writing line, as a share of the height
const SK = 160; // skeleton grid
const SC = SIZE / SK;

/** Draws a glyph exactly as the tracing pad does. */
export function drawGlyph(ctx, glyph) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.font = `${glyph.length > 2 ? 160 : 200}px "Noto Naskh Arabic", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.direction = 'rtl';
  ctx.fillStyle = '#000';
  ctx.fillText(glyph, SIZE / 2, SIZE * BASE);
}

/** The ink as a 160 × 160 mask, its connected parts, and its skeleton. */
export function analyseGlyph(ctx) {
  const img = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const m = new Uint8Array(SK * SK);
  for (let y = 0; y < SK; y++)
    for (let x = 0; x < SK; x++) {
      let on = 0;
      for (let dy = 0; dy < SC; dy++) for (let dx = 0; dx < SC; dx++) if (img[((y * SC + dy) * SIZE + x * SC + dx) * 4 + 3] > 90) on++;
      m[y * SK + x] = on >= 2 ? 1 : 0;
    }
  // Connected parts.
  const lab = new Int32Array(SK * SK).fill(-1);
  const parts = [];
  for (let i = 0; i < m.length; i++) {
    if (!m[i] || lab[i] >= 0) continue;
    const id = parts.length, cells = [i], st = [i];
    lab[i] = id;
    while (st.length) {
      const c = st.pop(), cx = c % SK, cy = (c - cx) / SK;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx, ny = cy + dy, n = ny * SK + nx;
          if (nx < 0 || ny < 0 || nx >= SK || ny >= SK || !m[n] || lab[n] >= 0) continue;
          lab[n] = id;
          cells.push(n);
          st.push(n);
        }
    }
    let sx = 0, sy = 0;
    for (const c of cells) { sx += c % SK; sy += Math.floor(c / SK); }
    parts.push({ id, cells, n: cells.length, cx: ((sx / cells.length) + 0.5) * SC, cy: ((sy / cells.length) + 0.5) * SC });
  }
  const skel = thin(m);
  return { mask: m, lab, parts, skel };
}

/** Zhang–Suen thinning. */
function thin(src) {
  const a = Uint8Array.from(src);
  const P = (x, y) => (x < 0 || y < 0 || x >= SK || y >= SK ? 0 : a[y * SK + x]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of [0, 1]) {
      const del = [];
      for (let y = 0; y < SK; y++)
        for (let x = 0; x < SK; x++) {
          if (!a[y * SK + x]) continue;
          const n = [P(x, y - 1), P(x + 1, y - 1), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1), P(x - 1, y + 1), P(x - 1, y), P(x - 1, y - 1)];
          const B = n.reduce((s, v) => s + v, 0);
          if (B < 2 || B > 6) continue;
          let A = 0;
          for (let k = 0; k < 8; k++) if (!n[k] && n[(k + 1) % 8]) A++;
          if (A !== 1) continue;
          if (step === 0 ? n[0] * n[2] * n[4] || n[2] * n[4] * n[6] : n[0] * n[2] * n[6] || n[0] * n[4] * n[6]) continue;
          del.push(y * SK + x);
        }
      for (const i of del) a[i] = 0;
      if (del.length) changed = true;
    }
  }
  return a;
}

const toCanvas = (i) => [((i % SK) + 0.5) * SC, (Math.floor(i / SK) + 0.5) * SC];

/** The skeleton pixel nearest to a canvas point (optionally only within one connected part). */
function snap(info, [x, y], part = null) {
  let best = -1, bd = Infinity;
  for (let i = 0; i < info.skel.length; i++) {
    if (!info.skel[i] || (part !== null && info.lab[i] !== part)) continue;
    const [cx, cy] = toCanvas(i);
    const d = (cx - x) ** 2 + (cy - y) ** 2;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

/** Shortest path along the skeleton between two skeleton pixels (Dijkstra, 8 neighbours). */
function along(info, a, b) {
  if (a < 0 || b < 0) return null;
  if (a === b) return [a];
  const dist = new Float32Array(SK * SK).fill(Infinity);
  const prev = new Int32Array(SK * SK).fill(-1);
  dist[a] = 0;
  const open = [a];
  while (open.length) {
    let k = 0;
    for (let j = 1; j < open.length; j++) if (dist[open[j]] < dist[open[k]]) k = j;
    const c = open.splice(k, 1)[0];
    if (c === b) break;
    const cx = c % SK, cy = (c - cx) / SK;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy, n = ny * SK + nx;
        if (nx < 0 || ny < 0 || nx >= SK || ny >= SK || !info.skel[n]) continue;
        const nd = dist[c] + (dx && dy ? 1.414 : 1);
        if (nd < dist[n]) {
          if (dist[n] === Infinity) open.push(n);
          dist[n] = nd;
          prev[n] = c;
        }
      }
  }
  if (dist[b] === Infinity) return null;
  const out = [];
  for (let c = b; c !== -1; c = prev[c]) out.push(c);
  return out.reverse();
}

/** Thins a list of points to roughly every `gap` pixels and rounds the corners (Chaikin). */
function smooth(pts, gap = 6) {
  if (pts.length < 3) return pts;
  const s = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc >= gap) { s.push(pts[i]); acc = 0; }
  }
  if (s[s.length - 1] !== pts[pts.length - 1]) s.push(pts[pts.length - 1]);
  let q = s;
  for (let it = 0; it < 2; it++) {
    const r = [q[0]];
    for (let i = 0; i < q.length - 1; i++) {
      const [x0, y0] = q[i], [x1, y1] = q[i + 1];
      r.push([0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1], [0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1]);
    }
    r.push(q[q.length - 1]);
    q = r;
  }
  return q;
}

/** A stroke's path from its waypoints, following the skeleton (straight lines where the skeleton has no route). */
export function strokePath(info, waypoints) {
  return strokeRoute(info, waypoints).pts;
}
/** strokePath, plus the connected part the stroke is drawn on. */
export function strokeRoute(info, waypoints) {
  const first = snap(info, waypoints[0]);
  const part = first >= 0 ? info.lab[first] : null;
  let pts = [];
  for (let k = 0; k < waypoints.length - 1; k++) {
    const a = snap(info, waypoints[k], part), b = snap(info, waypoints[k + 1], part);
    const seg = along(info, a, b);
    const run = seg ? seg.map(toCanvas) : [waypoints[k], waypoints[k + 1]];
    pts = pts.concat(k ? run.slice(1) : run);
  }
  return { pts: smooth(pts), part };
}

// A small separate part is a dot, unless a line stroke is drawn on it (a hamza, the mark in ك).
export const SMALL = 200; // cells on the 160 grid

/**
 * The strokes of a glyph: a definition's items in order ({ p: [[x,y]…] } line strokes, { dot: [x,y] } dots),
 * then any dots the definition did not mention, from right to left. Without a definition, one automatic stroke.
 */
export function buildStrokes(info, def, fallbackStart) {
  const body = [...info.parts].sort((p, q) => q.n - p.n)[0];
  const small = info.parts.filter((p) => p !== body && p.n < SMALL);
  const marks = info.parts.filter((p) => p !== body && p.n >= SMALL);
  const used = new Set();
  const out = [];
  const items = def?.length ? def : autoDef(info, body, marks, fallbackStart);
  // The joining line from the letter before (middle and end forms) is not a stroke: it belongs to that letter.
  const joins = items.filter((it) => it.join?.length >= 2).map((it) => ({ kind: 'join', pts: strokePath(info, it.join) }));
  for (const it of items) {
    if (it.p?.length >= 2) {
      const r = strokeRoute(info, it.p);
      if (r.part !== null && r.part !== body?.id) used.add(r.part);
      out.push({ kind: 'line', pts: r.pts, way: it.p });
    }
  }
  const dotParts = small.filter((p) => !used.has(p.id));
  for (const it of items) {
    if (it.dot) {
      const d = nearestPart(dotParts, it.dot, used);
      const at = items.filter((x) => !x.join).indexOf(it);
      if (d) { used.add(d.id); out.splice(Math.min(at, out.length), 0, { kind: 'dot', at: [d.cx, d.cy], part: d.id }); }
    }
  }
  dotParts
    .filter((d) => !used.has(d.id))
    .sort((a, b) => b.cx - a.cx || a.cy - b.cy)
    .forEach((d) => out.push({ kind: 'dot', at: [d.cx, d.cy], part: d.id }));
  out.joins = joins;
  return out;
}

function nearestPart(parts, [x, y], used) {
  let best = null, bd = Infinity;
  for (const p of parts) {
    if (used.has(p.id)) continue;
    const d = (p.cx - x) ** 2 + (p.cy - y) ** 2;
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

/** A guess for letters without a definition: from the start rule's point to the far end of the body; marks after. */
function autoDef(info, body, marks, start) {
  const out = [];
  if (body) {
    const s = snap(info, start || [SIZE * 0.7, SIZE * 0.3], body.id);
    // the skeleton pixel furthest along the body from the start
    let far = s, fd = -1;
    const dist = new Map([[s, 0]]);
    const q = [s];
    while (q.length) {
      const c = q.shift(), cx = c % SK, cy = (c - cx) / SK;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const n = (cy + dy) * SK + cx + dx;
          if (!info.skel[n] || dist.has(n)) continue;
          dist.set(n, dist.get(c) + 1);
          if (dist.get(n) > fd) { fd = dist.get(n); far = n; }
          q.push(n);
        }
    }
    out.push({ p: [toCanvas(s), toCanvas(far)] });
  }
  for (const m of marks.sort((a, b) => b.cx - a.cx)) {
    const top = snap(info, [m.cx + 6, m.cy - 10], m.id);
    if (top >= 0) out.push({ p: [toCanvas(top), [m.cx - 4, m.cy + 6]] });
  }
  return out;
}

/** The skeleton's ends and junctions, for drawing stroke definitions. */
export function keyPoints(info) {
  const ends = [], joins = [];
  for (let i = 0; i < info.skel.length; i++) {
    if (!info.skel[i]) continue;
    const x = i % SK, y = (i - x) / SK;
    let n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && info.skel[(y + dy) * SK + x + dx]) n++;
    if (n === 1) ends.push(toCanvas(i).map(Math.round));
    if (n >= 3) joins.push(toCanvas(i).map(Math.round));
  }
  return { ends, joins };
}

// ---- marker geometry --------------------------------------------------------

const inkAt = (info, x, y) => {
  const gx = Math.floor(x / SC), gy = Math.floor(y / SC);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (info.mask[(gy + dy) * SK + gx + dx]) return true;
  return false;
};

/**
 * The guide arrow for a line stroke: the path moved off the letter, alongside it (outside each bend).
 * gap = distance from the centre line (canvas pixels). Returns the arrow as pieces (lists of points, start → end):
 * it breaks where it would otherwise cross the letter or change sides.
 */
export function besideArrow(info, pts, gap = 22) {
  const n = pts.length;
  if (n < 2) return pts;
  const dir = (i) => {
    const a = pts[Math.max(0, i - 2)], b = pts[Math.min(n - 1, i + 2)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  };
  const clearAt = (x, y, r = 7) => {
    if (x < 6 || y < 6 || x > SIZE - 6 || y > SIZE - 6) return false;
    for (let a = 0; a < 8; a++) if (inkAt(info, x + Math.cos((a * Math.PI) / 4) * r, y + Math.sin((a * Math.PI) / 4) * r)) return false;
    return !inkAt(info, x, y);
  };
  const offset = (i, side, g) => {
    const [dx, dy] = dir(i);
    return [pts[i][0] - dy * side * g, pts[i][1] + dx * side * g];
  };
  // 1. Which side is outside each bend (+1 / -1), smoothed; straight parts take the side of the nearest bend.
  const k = 5;
  const bend = pts.map((p, i) => {
    const a = pts[Math.max(0, i - k)], b = pts[Math.min(n - 1, i + k)];
    const z = (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]);
    return Math.abs(z) < 20 ? 0 : -Math.sign(z);
  });
  let side = bend.map((_, i) => {
    let t = 0;
    for (let j = Math.max(0, i - 8); j <= Math.min(n - 1, i + 8); j++) t += bend[j];
    return Math.sign(t);
  });
  // where both sides are possible, prefer the side with more free room
  const room = (sg) => pts.reduce((s2, _, i) => s2 + (clearAt(...offset(i, sg, gap)) ? 1 : 0), 0);
  const fallback = room(1) >= room(-1) ? 1 : -1;
  for (let i = 0; i < n; i++) if (!side[i]) side[i] = i ? side[i - 1] : 0;
  for (let i = n - 1; i >= 0; i--) if (!side[i]) side[i] = side[i + 1] || fallback;
  // 2. No short flickers: runs shorter than a quarter of the stroke join their neighbours.
  const runs = [];
  side.forEach((v, i) => (runs.length && runs[runs.length - 1].v === v ? runs[runs.length - 1].e = i : runs.push({ v, s: i, e: i })));
  for (const r of runs) if (runs.length > 1 && r.e - r.s + 1 < n / 4) r.v = 0;
  for (let i = 0; i < runs.length; i++) if (!runs[i].v) runs[i].v = (runs[i - 1] && runs[i - 1].v) || (runs[i + 1] && runs[i + 1].v) || fallback;
  runs.forEach((r) => { for (let i = r.s; i <= r.e; i++) side[i] = r.v; });
  // 3. Offset points, a little further out where the letter is in the way. The arrow is drawn in pieces:
  //    a new piece starts where it changes side or where the letter blocks it, so it never crosses the ink.
  const pieces = [];
  let cur = [];
  let lastI = -10;
  for (let i = 0; i < n; i++) {
    let p = null;
    for (const g of [gap, gap + 6, gap + 12]) {
      const q = offset(i, side[i], g);
      if (clearAt(...q)) { p = q; break; }
    }
    const breakHere = !p || (i > 0 && side[i] !== side[i - 1]) || i - lastI > 2;
    if (breakHere && cur.length) { pieces.push(cur); cur = []; }
    if (p) { cur.push(p); lastI = i; }
  }
  if (cur.length) pieces.push(cur);
  const len = (q) => q.reduce((t, p, i) => (i ? t + Math.hypot(p[0] - q[i - 1][0], p[1] - q[i - 1][1]) : 0), 0);
  let keep = pieces.filter((q) => q.length >= 3 && len(q) >= 18);
  if (!keep.length) keep = pieces.length ? [pieces.sort((x, y) => len(y) - len(x))[0]] : [[offset(0, side[0], gap), offset(n - 1, side[n - 1], gap)]];
  // 4. Smooth each piece (moving average, then rounded corners).
  return keep.map((q) => {
    const avg = q.map((_, i) => {
      let sx = 0, sy = 0, c = 0;
      for (let j = Math.max(0, i - 3); j <= Math.min(q.length - 1, i + 3); j++) { sx += q[j][0]; sy += q[j][1]; c++; }
      return [sx / c, sy / c];
    });
    avg[0] = q[0];
    avg[avg.length - 1] = q[q.length - 1];
    return smooth(avg, 5);
  });
}

/** A spot near (x, y) for a number badge that does not cover any ink (and stays inside the pad). */
export function badgeSpot(info, [x, y], r = 13, avoid = []) {
  const clear = (px, py) => {
    if (px < r + 2 || py < r + 2 || px > SIZE - r - 2 || py > SIZE - r - 2) return false;
    for (let a = 0; a < 8; a++) if (inkAt(info, px + Math.cos((a * Math.PI) / 4) * r, py + Math.sin((a * Math.PI) / 4) * r)) return false;
    if (inkAt(info, px, py)) return false;
    return avoid.every(([ax, ay]) => Math.hypot(ax - px, ay - py) > r * 2 + 2);
  };
  for (let d = r + 6; d < 120; d += 4)
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d;
      if (clear(px, py)) return [px, py];
    }
  return [x + r + 8, y - r - 8];
}

/** Which stroke each ink cell belongs to (the nearest stroke's path, or its own dot part); -2 = the joining line. */
export function ownership(info, strokes) {
  const joins = strokes.joins || [];
  const own = new Int16Array(SK * SK).fill(-1);
  const dotOf = new Map(strokes.map((s, k) => [s.part, k]).filter(([p]) => p !== undefined));
  for (let i = 0; i < info.mask.length; i++) {
    if (!info.mask[i]) continue;
    const part = info.lab[i];
    if (dotOf.has(part)) { own[i] = dotOf.get(part); continue; }
    const [x, y] = toCanvas(i);
    let best = -1, bd = Infinity;
    strokes.forEach((s, k) => {
      if (s.kind !== 'line') return;
      for (const [px, py] of s.pts) {
        const d = (px - x) ** 2 + (py - y) ** 2;
        if (d < bd) { bd = d; best = k; }
      }
    });
    for (const j of joins)
      for (const [px, py] of j.pts) {
        const d = (px - x) ** 2 + (py - y) ** 2;
        if (d < bd) { bd = d; best = -2; }
      }
    own[i] = best;
  }
  return own;
}

export const GRID = SK;
export const CELL = SC;
