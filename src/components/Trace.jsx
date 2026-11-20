import { useEffect, useRef, useState } from 'react';

// Tracing pad: the letter is drawn faintly with the course font, then split into its connected parts
// (the main body and each dot or mark). Each part gets a numbered start marker with an arrow, in writing order:
// the body first, then the dots and marks from right to left. Coverage is checked against the glyph's ink.

const SIZE = 320; // canvas pixels (CSS scales it)
const GRID = 80; // analysis grid
const PASS = 0.72; // share of the ink the student must cover
export const BASE = 0.62; // the writing line, as a share of the height (matches the CSS rule)

// Where the main stroke starts and which way it goes (degrees: 0 = right, 90 = down, 180 = left).
// Keyed by base letter; position-specific overrides use "char:form".
const START = {
  'ا': ['top', 90], 'د': ['top', 60], 'ذ': ['top', 60], 'ر': ['top', 110], 'ز': ['top', 110], 'و': ['tr', 180],
  'ب': ['tr', 100], 'ت': ['tr', 100], 'ث': ['tr', 100], 'ن': ['tr', 100], 'ي': ['tr', 180],
  'ج': ['tl', 0], 'ح': ['tl', 0], 'خ': ['tl', 0], 'س': ['tr', 90], 'ش': ['tr', 90], 'ص': ['tl', 330], 'ض': ['tl', 330],
  'ط': ['tl', 330], 'ظ': ['tl', 330], 'ع': ['tr', 180], 'غ': ['tr', 180], 'ف': ['tr', 180], 'ق': ['tr', 180],
  'ك': ['top', 100], 'ل': ['top', 90], 'م': ['tr', 180], 'ه': ['tr', 180], 'ة': ['tr', 180],
};
export const TRACE_TIPS = {
  'ط': 'Draw the loop first, from the left, then lift the pen and add the tall stroke.',
  'ظ': 'Draw the loop first, from the left, then the tall stroke, then the dot.',
  'ك': 'Draw the tall body first, then the small mark inside.',
  'ص': 'Start at the left of the loop and go round to the right, then down into the bowl.',
  'ض': 'Start at the left of the loop and go round to the right, then down into the bowl, then the dot.',
};

function analyse(ctx) {
  const img = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const cell = SIZE / GRID;
  const ink = new Uint8Array(GRID * GRID);
  for (let gy = 0; gy < GRID; gy++)
    for (let gx = 0; gx < GRID; gx++) {
      let on = 0;
      for (let y = 0; y < cell; y += 2)
        for (let x = 0; x < cell; x += 2) {
          const i = ((Math.floor(gy * cell + y) * SIZE) + Math.floor(gx * cell + x)) * 4;
          if (img[i + 3] > 90) on++;
        }
      ink[gy * GRID + gx] = on > 0 ? 1 : 0;
    }
  // Connected parts (8-neighbour flood fill).
  const lab = new Int32Array(GRID * GRID).fill(-1);
  const parts = [];
  for (let i = 0; i < ink.length; i++) {
    if (!ink[i] || lab[i] >= 0) continue;
    const id = parts.length;
    const cells = [];
    const st = [i];
    lab[i] = id;
    while (st.length) {
      const c = st.pop();
      cells.push(c);
      const cx = c % GRID, cy = (c - cx) / GRID;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
          const n = ny * GRID + nx;
          if (ink[n] && lab[n] < 0) {
            lab[n] = id;
            st.push(n);
          }
        }
    }
    parts.push(cells);
  }
  return { ink, parts };
}

function startOf(cells, rule) {
  const pts = cells.map((c) => [c % GRID, Math.floor(c / GRID)]);
  const minY = Math.min(...pts.map((p) => p[1]));
  const maxY = Math.max(...pts.map((p) => p[1]));
  const band = (f) => pts.filter((p) => p[1] <= minY + Math.max(2, (maxY - minY) * f));
  let best;
  if (rule === 'right') {
    // End and middle forms start at the joining stroke on the right.
    const maxX = Math.max(...pts.map((p) => p[0]));
    best = pts.filter((p) => p[0] >= maxX - 1).sort((a, b) => b[1] - a[1])[0];
  } else if (rule === 'top') best = band(0.05).sort((a, b) => b[0] - a[0])[0];
  else if (rule === 'tl') best = band(0.2).sort((a, b) => a[0] - b[0])[0];
  else best = band(0.25).sort((a, b) => b[0] - a[0])[0]; // tr
  return best.map((v) => (v + 0.5) * (SIZE / GRID));
}

export default function Trace({ glyph, base, onDone, done }) {
  const guide = useRef(null);
  const pad = useRef(null);
  const info = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const covered = useRef(new Set());
  const [markers, setMarkers] = useState([]);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        await document.fonts.load('200px "Noto Naskh Arabic"', glyph);
      } catch {
        /* fall back to whatever font is available */
      }
      if (!alive) return;
      const g = guide.current.getContext('2d');
      g.clearRect(0, 0, SIZE, SIZE);
      g.font = `${glyph.length > 2 ? 160 : 200}px "Noto Naskh Arabic", serif`;
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      g.direction = 'rtl';
      g.fillStyle = '#000';
      g.fillText(glyph, SIZE / 2, SIZE * BASE);
      const a = analyse(g);
      info.current = a;
      // Repaint the guide in a soft colour.
      const css = getComputedStyle(guide.current);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = css.getPropertyValue('--trace-guide').trim() || '#d9cfb8';
      g.fillRect(0, 0, SIZE, SIZE);
      g.globalCompositeOperation = 'source-over';
      // Order the parts: biggest first (the body), then the rest from right to left, top to bottom.
      const parts = [...a.parts].map((cells) => ({ cells, n: cells.length }));
      parts.sort((p, q) => q.n - p.n);
      const [body, ...rest] = parts;
      const joinedRight = glyph.startsWith('ـ');
      const rule = joinedRight ? ['right', 180] : START[base] || ['tr', 180];
      const ms = [];
      if (body) ms.push({ at: startOf(body.cells, rule[0]), angle: rule[1], dot: false });
      rest
        .filter((p) => p.n >= 2)
        .map((p) => ({ p, c: startOf(p.cells, 'tr') }))
        .sort((u, v) => v.c[0] - u.c[0] || u.c[1] - v.c[1])
        .forEach(({ p, c }) => ms.push({ at: c, angle: null, dot: p.n < 30 }));
      setMarkers(ms);
      clear();
    };
    run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glyph]);

  function clear() {
    const c = pad.current.getContext('2d');
    c.clearRect(0, 0, SIZE, SIZE);
    covered.current = new Set();
    setScore(0);
    setPassed(false);
  }

  const pos = (e) => {
    const r = pad.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE];
  };

  function mark([x, y]) {
    const a = info.current;
    if (!a) return;
    const cell = SIZE / GRID;
    const R = 3; // brush radius in grid cells
    const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++) {
        const nx = gx + dx, ny = gy + dy;
        if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID || dx * dx + dy * dy > R * R) continue;
        const i = ny * GRID + nx;
        if (a.ink[i]) covered.current.add(i);
      }
  }

  function down(e) {
    e.preventDefault();
    pad.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    mark(last.current);
  }
  function move(e) {
    if (!drawing.current) return;
    const p = pos(e);
    const c = pad.current.getContext('2d');
    const css = getComputedStyle(pad.current);
    c.strokeStyle = css.getPropertyValue('--trace-ink').trim() || '#22407a';
    c.lineWidth = 16;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(...last.current);
    c.lineTo(...p);
    c.stroke();
    // Mark along the segment.
    const steps = Math.ceil(Math.hypot(p[0] - last.current[0], p[1] - last.current[1]) / 3);
    for (let i = 1; i <= steps; i++) mark([last.current[0] + ((p[0] - last.current[0]) * i) / steps, last.current[1] + ((p[1] - last.current[1]) * i) / steps]);
    last.current = p;
  }
  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    const a = info.current;
    if (!a) return;
    const total = a.ink.reduce((s, v) => s + v, 0) || 1;
    const sc = covered.current.size / total;
    setScore(sc);
    if (sc >= PASS && !passed) {
      setPassed(true);
      onDone?.();
    }
  }

  return (
    <div className="trace">
      <div className="trace-box">
        <canvas ref={guide} width={SIZE} height={SIZE} className="trace-guide" aria-hidden="true" />
        <svg className="trace-marks" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          {markers.map((m, i) => {
            const [sx, sy] = m.at;
            const rad = ((m.angle ?? 0) * Math.PI) / 180;
            // The badge sits beside the start point (behind the arrow, or up and right of a dot) so it never hides the ink.
            const [x, y] = m.angle === null ? [sx + 20, sy - 16] : [sx - Math.cos(rad) * 16, sy - Math.sin(rad) * 16];
            return (
              <g key={i}>
                {m.angle !== null && (
                  <path
                    d={`M${sx + Math.cos(rad) * 6} ${sy + Math.sin(rad) * 6} l${Math.cos(rad) * 40} ${Math.sin(rad) * 40}`}
                    className="trace-arrow"
                    markerEnd="url(#ah)"
                  />
                )}
                <circle cx={x} cy={y} r="13" className="trace-num" />
                <text x={x} y={y + 5} textAnchor="middle" className="trace-num-t">
                  {i + 1}
                </text>
              </g>
            );
          })}
          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" className="trace-arrowhead" />
            </marker>
          </defs>
        </svg>
        <canvas
          ref={pad}
          width={SIZE}
          height={SIZE}
          className="trace-pad"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label={`Tracing pad for ${glyph}`}
        />
        {(passed || done) && <div className="trace-star" aria-label="Well done">★</div>}
      </div>
      <div className="trace-bar">
        <div className="meter" aria-label="How much of the letter you have covered">
          <span style={{ width: `${Math.min(100, (score / PASS) * 100)}%` }} />
        </div>
        <button className="btn ghost" onClick={clear}>
          Clear
        </button>
      </div>
    </div>
  );
}
