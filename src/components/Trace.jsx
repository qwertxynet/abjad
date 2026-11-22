import { useEffect, useMemo, useRef, useState } from 'react';
import STROKES from '../data/strokes.json';
import { SIZE, BASE, GRID, CELL, drawGlyph, analyseGlyph, buildStrokes, besideArrow, badgeSpot, ownership } from './strokes.js';

// Tracing pad.
//  1. Watch: a pen writes the letter stroke by stroke, in order, then taps in each dot.
//  2. Trace: only the current stroke is marked, with a numbered start dot and a curved arrow running beside the
//     letter (never on it). When most of that stroke is covered it turns green and the next one appears.
// Stroke order comes from src/data/strokes.json (drawn per letter form; see strokes.js), or from the teacher's
// draft in the Strokes editor.

export { BASE };
const STROKE_DONE = 0.7; // share of a stroke's ink to cover before moving on
const PASS = 0.72; // share of the whole letter
const BRUSH = 6; // brush radius in skeleton-grid cells (12 canvas pixels)
export const DRAFT_KEY = 'abjad-strokes-draft';

export const TRACE_TIPS = {
  'ط': "Start at the top of the curve: go down round the end, back along the line, then up and over to close the loop. Lift the pen and draw the downstroke from the top.",
  'ظ': "The loop first, from the top of the curve: down round the end, back along the line, up and over. Then the downstroke from the top, then the dot.",
  'ف': "The head first, from the top: to the left, round and back up. Lift the pen, then the base from right to left.",
  'ق': "The head first, from the top: to the left, round and back up. Lift the pen, then the deep tail from right to left.",
  'ج': "The top bar first, from left to right. Lift the pen, then the bowl from the top down and round.",
  'ح': "The top bar first, from left to right. Lift the pen, then the bowl from the top down and round.",
  'خ': "The top bar first, from left to right. Lift the pen, then the bowl; the dot comes last.",
  'د': "The slant first, from the top down. Lift the pen, then the base from right to left.",
  'ذ': "The slant first, from the top down. Lift the pen, then the base from right to left; the dot comes last.",
  'ل': "The stem first, from the top down. Lift the pen, then the bowl from right to left.",
  'م': "The head first, then lift the pen and draw the tail down.",
  'و': "Start at the top-left of the head: right over the top, down, round the bottom back to the left, then down into the tail.",
  'ع': "The head first, then lift the pen and draw the bowl.",
  'غ': "The head first, then the bowl; the dot comes last.",
  'ص': "Draw the loop first: from its left, up and over to the right and back along the line. Then lift the pen and draw the small tooth from its top, down into the bowl.",
  'ض': "Draw the loop first, from its left, round to the right and back; then the tooth from its top, down into the bowl; then the dot.",
  'ك': "The stem first, from the top down. Then the base, and the small mark last.",
};

/** The stroke definition for a letter form: the teacher's draft (if any, on this device) or the published one. */
export function strokeDef(base, form) {
  const key = `${base}:${form}`;
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    if (draft[key]) return draft[key];
  } catch {
    /* no draft */
  }
  return STROKES[key] || null;
}

const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const pathD = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
const lengthOf = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

/** Prepares a letter form: guide image, skeleton, strokes, and which ink belongs to which stroke. */
export async function prepare(canvas, glyph, base, form, def) {
  try {
    await document.fonts.load('200px "Noto Naskh Arabic"', glyph);
  } catch {
    /* use whatever font is there */
  }
  const g = canvas.getContext('2d', { willReadFrequently: true });
  drawGlyph(g, glyph);
  const info = analyseGlyph(g);
  const joinedRight = glyph.startsWith('ـ');
  const strokes = buildStrokes(info, def ?? strokeDef(base, form), joinedRight ? [SIZE * 0.8, SIZE * BASE] : [SIZE * 0.66, SIZE * 0.35]);
  const own = ownership(info, strokes);
  const totals = strokes.map((_, k) => own.reduce((s, o) => s + (o === k ? 1 : 0), 0));
  return { g, info, strokes, own, totals };
}

/** The marker drawing for one stroke: arrow points beside the letter and a badge spot (canvas pixels). */
export function markerFor(info, s, avoid = []) {
  if (s.kind === 'dot') return { badge: badgeSpot(info, s.at, 13, avoid) };
  const arrow = besideArrow(info, s.pts); // pieces
  return { arrow, badge: badgeSpot(info, s.pts[0], 13, avoid) }; // the number sits by where the stroke really starts
}

export default function Trace({ glyph, base, form = 'isolated', onDone, done, def = null, autoWatch = true }) {
  const guide = useRef(null);
  const pad = useRef(null);
  const data = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const covered = useRef(new Set());
  const anim = useRef(0);
  const [ready, setReady] = useState(0);
  const [phase, setPhase] = useState('watch');
  const [demo, setDemo] = useState({ k: -1, t: 0 }); // stroke being drawn in Watch, and how far (0..1)
  const [finished, setFinished] = useState([]); // strokes the student has completed
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const d = await prepare(guide.current, glyph, base, form, def);
      if (!alive) return;
      data.current = d;
      const css = getComputedStyle(guide.current);
      d.g.globalCompositeOperation = 'source-in';
      d.g.fillStyle = css.getPropertyValue('--trace-guide').trim() || '#d9cfb8';
      d.g.fillRect(0, 0, SIZE, SIZE);
      d.g.globalCompositeOperation = 'source-over';
      clear();
      setReady((r) => r + 1);
      if (autoWatch) watch();
      else setPhase('trace');
    })();
    return () => {
      alive = false;
      cancelAnimationFrame(anim.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glyph, form, def]);

  function watch() {
    const d = data.current;
    if (!d) return;
    cancelAnimationFrame(anim.current);
    setPhase('watch');
    const still = reduceMotion();
    const durs = d.strokes.map((s) => (s.kind === 'dot' ? 350 : Math.max(650, lengthOf(s.pts) * 5)));
    const start = performance.now();
    const step = (now) => {
      let t = now - start;
      let k = 0;
      while (k < durs.length && t > durs[k] + 250) {
        t -= durs[k] + 250;
        k++;
      }
      if (k >= durs.length) {
        setDemo({ k: durs.length, t: 1 });
        anim.current = requestAnimationFrame(() => setTimeout(() => setPhase('trace'), 500));
        return;
      }
      setDemo({ k, t: still ? 1 : Math.min(1, t / durs[k]) });
      anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }

  function clear() {
    const c = pad.current?.getContext('2d');
    c?.clearRect(0, 0, SIZE, SIZE);
    covered.current = new Set();
    setFinished([]);
    setScore(0);
    setPassed(false);
  }

  const pos = (e) => {
    const r = pad.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE];
  };
  function mark([x, y]) {
    const d = data.current;
    if (!d) return;
    const gx = Math.floor(x / CELL), gy = Math.floor(y / CELL);
    for (let dy = -BRUSH; dy <= BRUSH; dy++)
      for (let dx = -BRUSH; dx <= BRUSH; dx++) {
        const nx = gx + dx, ny = gy + dy;
        if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID || dx * dx + dy * dy > BRUSH * BRUSH) continue;
        const i = ny * GRID + nx;
        if (d.info.mask[i]) covered.current.add(i);
      }
  }
  function down(e) {
    e.preventDefault();
    if (phase === 'watch') {
      cancelAnimationFrame(anim.current);
      setPhase('trace');
    }
    pad.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    mark(last.current);
  }
  function move(e) {
    if (!drawing.current) return;
    const p = pos(e);
    const c = pad.current.getContext('2d');
    c.strokeStyle = getComputedStyle(pad.current).getPropertyValue('--trace-ink').trim() || '#22407a';
    c.lineWidth = 16;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(...last.current);
    c.lineTo(...p);
    c.stroke();
    const steps = Math.ceil(Math.hypot(p[0] - last.current[0], p[1] - last.current[1]) / 3);
    for (let i = 1; i <= steps; i++) mark([last.current[0] + ((p[0] - last.current[0]) * i) / steps, last.current[1] + ((p[1] - last.current[1]) * i) / steps]);
    last.current = p;
    check(false);
  }
  function check(final) {
    const d = data.current;
    if (!d) return;
    const got = d.totals.map(() => 0);
    for (const i of covered.current) if (d.own[i] >= 0) got[d.own[i]]++;
    const fin = d.totals.map((t, k) => (t ? got[k] / t >= STROKE_DONE : true)).flatMap((ok, k) => (ok ? [k] : []));
    if (fin.length !== finished.length) setFinished(fin);
    if (final) {
      // only the letter's own ink counts (not the joining line from the letter before)
      const total = d.totals.reduce((s, v) => s + v, 0) || 1;
      const sc = got.reduce((s, v) => s + v, 0) / total;
      setScore(sc);
      if (sc >= PASS && fin.length === d.strokes.length && !passed) {
        setPassed(true);
        onDone?.();
      }
    }
  }
  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    check(true);
  }

  // What to draw on the marker layer.
  const d = data.current;
  const view = useMemo(() => {
    if (!d) return null;
    const cur = d.strokes.findIndex((_, k) => !finished.includes(k));
    const m = cur >= 0 ? markerFor(d.info, d.strokes[cur]) : null;
    return { cur, m };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, finished]);

  return (
    <div className="trace">
      <div className="trace-box">
        <canvas ref={guide} width={SIZE} height={SIZE} className="trace-guide" aria-hidden="true" />
        <svg className="trace-marks" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" className="trace-arrowhead" />
            </marker>
          </defs>
          {d &&
            d.strokes.map((s, k) =>
              finished.includes(k) && phase === 'trace' ? (
                s.kind === 'dot' ? <circle key={k} cx={s.at[0]} cy={s.at[1]} r="11" className="trace-done" /> : <path key={k} d={pathD(s.pts)} className="trace-done" />
              ) : null,
            )}
          {d && phase === 'watch' && d.strokes.map((s, k) => <Demo key={k} s={s} t={k < demo.k ? 1 : k === demo.k ? demo.t : 0} n={k + 1} info={d.info} />)}
          {d && phase === 'trace' && view?.m && (
            <g className="trace-current">
              {view.m.arrow?.map((q, j) => <path key={j} d={pathD(q)} className="trace-arrow" markerEnd="url(#ah)" />)}
              <circle cx={view.m.badge[0]} cy={view.m.badge[1]} r="13" className="trace-num" />
              <text x={view.m.badge[0]} y={view.m.badge[1] + 5} textAnchor="middle" className="trace-num-t">
                {view.cur + 1}
              </text>
            </g>
          )}
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
        <button className="btn ghost" onClick={() => { clear(); watch(); }} title="Watch the letter being written">
          ▶ Watch
        </button>
        <div className="meter" aria-label="How much of the letter you have covered">
          <span style={{ width: `${Math.min(100, (score / PASS) * 100)}%` }} />
        </div>
        <button className="btn ghost" onClick={clear}>
          Clear
        </button>
      </div>
      {d && (
        <p className="trace-step-note" aria-live="polite">
          {phase === 'watch' ? 'Watch the pen, then trace.' : view?.cur >= 0 ? `Stroke ${view.cur + 1} of ${d.strokes.length}${d.strokes[view.cur].kind === 'dot' ? ' · a dot' : ''}` : 'All strokes done.'}
        </p>
      )}
    </div>
  );
}

/** One stroke of the Watch animation: the ink appearing along the path, with the pen at its tip. */
export function Demo({ s, t, n }) {
  if (t <= 0) return null;
  if (s.kind === 'dot')
    return (
      <g>
        <circle cx={s.at[0]} cy={s.at[1]} r={11 * Math.min(1, t * 1.6)} className="trace-demo-dot" />
      </g>
    );
  const L = lengthOf(s.pts);
  // the part of the path drawn so far
  let acc = 0;
  const shown = [s.pts[0]];
  for (let i = 1; i < s.pts.length; i++) {
    const seg = Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]);
    if (acc + seg <= L * t) {
      shown.push(s.pts[i]);
      acc += seg;
    } else {
      const f = (L * t - acc) / (seg || 1);
      shown.push([s.pts[i - 1][0] + (s.pts[i][0] - s.pts[i - 1][0]) * f, s.pts[i - 1][1] + (s.pts[i][1] - s.pts[i - 1][1]) * f]);
      break;
    }
  }
  const tip = shown[shown.length - 1];
  return (
    <g>
      <path d={pathD(shown)} className="trace-demo" />
      {t < 1 && <circle cx={tip[0]} cy={tip[1]} r="7" className="trace-pen" />}
      {t >= 1 && n && <text x={s.pts[0][0]} y={s.pts[0][1] + 4} textAnchor="middle" className="trace-demo-n">{n}</text>}
    </g>
  );
}

/** Every stroke of a letter form at once, numbered, with its arrow beside the letter: for review sheets and the editor. */
export function Overview({ glyph, base, form = 'isolated', def = null, onPick, selected = -1 }) {
  const guide = useRef(null);
  const [view, setView] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const d = await prepare(guide.current, glyph, base, form, def);
      if (!alive) return;
      const css = getComputedStyle(guide.current);
      d.g.globalCompositeOperation = 'source-in';
      d.g.fillStyle = css.getPropertyValue('--trace-guide').trim() || '#d9cfb8';
      d.g.fillRect(0, 0, SIZE, SIZE);
      d.g.globalCompositeOperation = 'source-over';
      const badges = [];
      const marks = d.strokes.map((s) => {
        const m = markerFor(d.info, s, badges);
        badges.push(m.badge);
        return m;
      });
      setView({ strokes: d.strokes, marks });
    })();
    return () => {
      alive = false;
    };
  }, [glyph, base, form, def]);
  return (
    <div className="trace-box overview">
      <canvas ref={guide} width={SIZE} height={SIZE} className="trace-guide" aria-hidden="true" />
      <svg className="trace-marks" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Stroke order for ${glyph}`}>
        <defs>
          <marker id="ah2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" className="trace-arrowhead" />
          </marker>
        </defs>
        {view?.strokes.map((s, k) => (
          <g key={k} className={'ov-stroke' + (k === selected ? ' sel' : '')} onClick={onPick ? () => onPick(k) : undefined}>
            {s.kind === 'line' && <path d={pathD(s.pts)} className="ov-path" />}
            {view.marks[k].arrow?.map((q, j) => <path key={j} d={pathD(q)} className="trace-arrow" markerEnd="url(#ah2)" />)}
            <circle cx={view.marks[k].badge[0]} cy={view.marks[k].badge[1]} r="13" className="trace-num" />
            <text x={view.marks[k].badge[0]} y={view.marks[k].badge[1] + 5} textAnchor="middle" className="trace-num-t">
              {k + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
