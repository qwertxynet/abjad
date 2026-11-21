// The shared ink-and-watercolour painter used by the map places and the comic panels.
//  • ink lines → rough.js (a slightly wobbly pen line, two passes on thicker strokes)
//  • washes → SVG watercolour filters: wobbly edges, darker pigment at the edges, paper-grain granulation
//  • shadows → a faint wash plus light cross-hatching
// Drawings are plain SVG strings made with the W / I / D helpers below.
import rough from 'roughjs';

const gen = rough.generator();

export const PALETTE = {
  day: {
    ink: '#2A2118', alpha: 0.86,
    'w-stone': '#E9D3A6', 'w-roof': '#D46F4D', 'w-sky': '#A9C3E3', 'w-door': '#3E7C8C', 'w-leaf': '#93BA7C', 'w-rose': '#D6668F',
    'w-sand': '#E7C06E', 'w-awning': '#E08F5E', 'w-lamp': '#F2C14E', 'w-shadow': '#BFA67A',
    // people and interiors (comics)
    'w-skin-n': '#B9784A', 'w-skin-r': '#D9A27A', 'w-hair': '#3A2A20', 'w-shirt': '#8FB0E0', 'w-trousers': '#56606E',
    'w-hijab': '#C8553D', 'w-tunic': '#E8B8A4', 'w-tunic2': '#F6E2D3', 'w-skirt': '#6E5A70', 'w-cheek': '#E58A7A',
    'w-white': '#FBF6EA', 'w-wood': '#A9774E', 'w-night': '#2E3A5C', 'w-wall': '#EFDDBA', 'w-purple': '#7A4A8C',
  },
  night: {
    ink: '#EADFC6', alpha: 0.9,
    'w-stone': '#4E4B66', 'w-roof': '#7A4646', 'w-sky': '#F5C451', 'w-door': '#284A5C', 'w-leaf': '#3F5E46', 'w-rose': '#86446A',
    'w-sand': '#6F5E3E', 'w-awning': '#7D4B3E', 'w-lamp': '#FFD86B', 'w-shadow': '#0B0F1F',
  },
};

/** Splits a drawing back into washes and ink strokes, in drawing order. */
export function parse(svg) {
  const out = [];
  const re = /<g class="([^"]+)"(?: stroke-width="([^"]+)")?>(.*?)<\/g>|<path class="([^"]+)" d="([^"]+)"(?: stroke-width="([^"]+)")?\s*\/>/g;
  let m;
  while ((m = re.exec(svg))) {
    if (m[1]) {
      const cls = m[1], w = +(m[2] || 1.2);
      if (cls === 'layer') { out.push({ kind: 'layer' }); continue; }
      for (const c of m[3].matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"\/>/g)) {
        const [x, y, r] = [+c[1], +c[2], +c[3]];
        const d = `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
        out.push(cls === 'ink' ? { kind: 'ink', d, w } : { kind: 'wash', cls, d });
      }
      for (const p of m[3].matchAll(/<path d="([^"]+)"\/>/g)) out.push(cls === 'ink' ? { kind: 'ink', d: p[1], w } : { kind: 'wash', cls, d: p[1] });
    } else if (m[4] === 'ink') out.push({ kind: 'ink', d: m[5], w: +(m[6] || 2.4) });
    else out.push({ kind: 'wash', cls: m[4], d: m[5] });
  }
  return out;
}

const filter = (id, seed) => `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="warp"/>
<feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" result="shape"/>
<feMorphology in="shape" operator="erode" radius="1.4" result="inner"/>
<feComposite in="shape" in2="inner" operator="out" result="rim"/>
<feComponentTransfer in="rim" result="rimDark"><feFuncR type="linear" slope="0.72"/><feFuncG type="linear" slope="0.72"/><feFuncB type="linear" slope="0.72"/></feComponentTransfer>
<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed + 11}" result="grain"/>
<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.55 1.12" result="grainA"/>
<feComposite in="shape" in2="grainA" operator="in" result="granulated"/>
<feMerge><feMergeNode in="granulated"/><feMergeNode in="rimDark"/></feMerge>
</filter>`;
// Small shapes (faces, buttons) get a gentler filter so they don't melt.
const fineFilter = (id, seed) => filter(id, seed).replace('scale="6"', 'scale="1.6"').replace('radius="1.4"', 'radius="0.6"');
const underFilter = (id, seed, fine) => `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="warp"/><feDisplacementMap in="SourceGraphic" in2="warp" scale="${fine ? 1.6 : 6}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
const mix = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const glow = `<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

/**
 * Paints a drawing. opts: mode ('day' | 'night'), width/height (viewBox), scale (output pixels per unit),
 * seed, lit (glow the lamps even in day mode, for evening scenes), bg (a paper colour behind everything, or none).
 */
export function paint(svg, { mode = 'day', width = 240, height = 200, scale = 2, seed = 1, lit = false, bg = null } = {}) {
  const P = PALETTE[mode];
  let defs = glow;
  const layers = [{ washes: '', inks: '', opaque: false }];
  let L = layers[0];
  for (const it of parse(svg)) {
    seed++;
    if (it.kind === 'layer') {
      L = { washes: '', inks: '', opaque: true };
      layers.push(L);
      continue;
    }
    if (it.kind === 'wash') {
      const fine = it.cls.endsWith(':fine');
      const cls = fine ? it.cls.slice(0, -5) : it.cls;
      const fill = cls.startsWith('#') ? cls : P[cls] || PALETTE.day[cls] || '#ccc';
      const isLit = cls === 'w-lamp' || (mode === 'night' && cls === 'w-sky');
      if (cls === 'w-shadow') {
        defs += filter('f' + seed, seed);
        L.washes += `<path d="${it.d}" fill="${fill}" opacity="${mode === 'night' ? 0.55 : 0.4}" filter="url(#f${seed})"/>`;
        const h = gen.path(it.d, { fill: P.ink, fillStyle: 'hachure', hachureAngle: -41, hachureGap: 5, fillWeight: 0.7, stroke: 'none', roughness: 1.2, seed });
        for (const p of gen.toPaths(h)) L.inks += `<path d="${p.d}" fill="none" stroke="${P.ink}" stroke-width="0.7" opacity="0.28"/>`;
        continue;
      }
      defs += (fine ? fineFilter : filter)('f' + seed, seed);
      const op = cls === 'w-cheek' ? 0.45 : isLit ? 1 : P.alpha;
      if (L.opaque && cls !== 'w-cheek') {
        // an opaque underpaint with the same wobbly edge, so a figure hides the lines behind it
        defs += underFilter('u' + seed, seed, fine);
        L.washes += `<path d="${it.d}" fill="${mix(fill, '#FBF6EA', 0.45)}" filter="url(#u${seed})"/>`;
      }
      L.washes += `<path d="${it.d}" fill="${fill}" opacity="${op}" filter="url(#f${seed})"/>`;
      if (isLit && (mode === 'night' || lit)) L.washes += `<path d="${it.d}" fill="${fill}" opacity="0.55" filter="url(#glow)"/>`;
    } else {
      const thick = it.w >= 1.6;
      const tiny = it.w < 0.9;
      const drawable = gen.path(it.d, { stroke: P.ink, strokeWidth: it.w * 0.95, roughness: tiny ? 0.25 : thick ? 0.9 : 0.6, bowing: tiny ? 0.2 : 0.8, disableMultiStroke: !thick, preserveVertices: tiny, seed });
      for (const p of gen.toPaths(drawable)) L.inks += `<path d="${p.d}" fill="none" stroke="${P.ink}" stroke-width="${p.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  }
  const back = bg ? `<rect width="${width}" height="${height}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}"><defs>${defs}</defs>${back}${layers.map((l) => `<g>${l.washes}</g><g>${l.inks}</g>`).join('')}</svg>`;
}

// ---- drawing helpers -------------------------------------------------------
/** Starts a new layer: everything after it is painted opaquely over everything before it, ink included. */
export const LAYER = '<g class="layer"></g>';
export const W = (cls, d) => `<path class="${cls}" d="${d}" />`;
export const I = (d, w = 2.4) => `<path class="ink" d="${d}" stroke-width="${w}"/>`;
export const D = (cls, pts, r = 4, w) => `<g class="${cls}"${w ? ` stroke-width="${w}"` : ''}>${pts.map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr || r}"/>`).join('')}</g>`;

/** Moves a path: x' = x0 + s·(flip ? −x : x), y' = y0 + s·y. Handles M L H V C S Q T A Z, absolute and relative. */
export function tx(d, { x = 0, y = 0, s = 1, flip = false } = {}) {
  const fx = flip ? -1 : 1;
  const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g);
  let out = '';
  let cmd = '';
  let i = 0;
  const num = () => +toks[i++];
  const r2 = (v) => Math.round(v * 100) / 100;
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    const abs = cmd === cmd.toUpperCase();
    const C = cmd.toUpperCase();
    const X = (v) => r2(abs ? x + s * fx * v : s * fx * v);
    const Y = (v) => r2(abs ? y + s * v : s * v);
    if (C === 'Z') { out += cmd + ' '; continue; }
    const pairs = { M: 1, L: 1, T: 1, Q: 2, S: 2, C: 3 }[C];
    if (pairs) {
      const nums = [];
      for (let k = 0; k < pairs; k++) { const a = num(), b = num(); nums.push(X(a), Y(b)); }
      out += cmd + nums.join(' ') + ' ';
    } else if (C === 'H') out += cmd + X(num()) + ' ';
    else if (C === 'V') out += cmd + Y(num()) + ' ';
    else if (C === 'A') {
      const rx = num(), ry = num(), rot = num(), large = num(), sweep = num(), ex = num(), ey = num();
      out += `${cmd}${r2(rx * s)} ${r2(ry * s)} ${rot} ${large} ${flip ? 1 - sweep : sweep} ${X(ex)} ${Y(ey)} `;
    }
    if (C === 'M') cmd = abs ? 'L' : 'l'; // implicit lineto after moveto
  }
  return out.trim();
}

/** Moves a whole drawing (W / I / D output) with tx; circle radii and stroke widths scale too. */
export function place(svg, t) {
  const s = t.s ?? 1;
  return svg
    .replace(/ d="([^"]+)"/g, (_, d) => ` d="${tx(d, t)}"`)
    .replace(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"\/>/g, (_, cx, cy, r) => `<circle cx="${Math.round(((t.x ?? 0) + s * (t.flip ? -1 : 1) * cx) * 100) / 100}" cy="${Math.round(((t.y ?? 0) + s * cy) * 100) / 100}" r="${Math.round(r * s * 100) / 100}"/>`)
    .replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${Math.round(w * Math.sqrt(s) * 100) / 100}"`);
}
