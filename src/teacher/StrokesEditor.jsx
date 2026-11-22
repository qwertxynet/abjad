import { useEffect, useMemo, useRef, useState } from 'react';
import STROKES from '../data/strokes.json';
import Trace, { prepare, markerFor, strokeDef, DRAFT_KEY } from '../components/Trace.jsx';
import { buildStrokes, SIZE, BASE } from '../components/strokes.js';

// The teacher's stroke editor for one letter form.
//  • Drag the round handles to move a stroke's start, end or the points it passes through; the path follows the letter.
//  • Reorder, reverse, add or delete strokes, dots and the joining line.
// Changes are saved as a draft on this device (students on this device see them too) until you download the
// strokes file and put it in the project (src/data/strokes.json), which publishes them for everyone.

const readDrafts = () => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
  } catch {
    return {};
  }
};
const writeDrafts = (d) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable */
  }
};
export const draftCount = () => Object.keys(readDrafts()).length;

/** Downloads the published strokes merged with this device's drafts, as strokes.json. */
export function downloadStrokes() {
  const merged = { ...STROKES, ...readDrafts() };
  const blob = new Blob([JSON.stringify(merged, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'strokes.json';
  a.click();
}
export const discardDrafts = () => writeDrafts({});

const pathD = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
const round = (p) => [Math.round(p[0]), Math.round(p[1])];
const clone = (x) => JSON.parse(JSON.stringify(x));
const COLORS = ['#c0392b', '#1f5a66', '#8e44ad', '#d35400', '#2e7d32', '#6d4c41', '#00838f'];

export default function StrokesEditor({ glyph, base, form, onChanged }) {
  const key = `${base}:${form}`;
  const guide = useRef(null);
  const svg = useRef(null);
  const [info, setInfo] = useState(null);
  const [def, setDef] = useState(() => clone(strokeDef(base, form) || []));
  const [sel, setSel] = useState(0);
  const drag = useRef(null); // { item, point } while a handle is being dragged
  const live = useRef(def); // the latest definition, also mid-drag
  live.current = def;
  const [watchKey, setWatchKey] = useState(0);
  const edited = !!readDrafts()[key];

  useEffect(() => {
    let alive = true;
    (async () => {
      const d = await prepare(guide.current, glyph, base, form, def);
      if (!alive) return;
      d.g.globalCompositeOperation = 'source-in';
      d.g.fillStyle = '#C9D3E6';
      d.g.fillRect(0, 0, SIZE, SIZE);
      d.g.globalCompositeOperation = 'source-over';
      setInfo(d.info);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glyph]);

  // the strokes as students will see them, recomputed on every edit
  const view = useMemo(() => {
    if (!info) return null;
    const strokes = buildStrokes(info, def, glyph.startsWith('ـ') ? [SIZE * 0.8, SIZE * BASE] : [SIZE * 0.66, SIZE * 0.35]);
    const badges = [];
    const marks = strokes.map((s) => {
      const m = markerFor(info, s, badges);
      badges.push(m.badge);
      return m;
    });
    return { strokes, marks };
  }, [info, def, glyph]);

  function save(next) {
    setDef(next);
    const d = readDrafts();
    d[key] = next;
    writeDrafts(d);
    onChanged?.();
  }
  function reset() {
    const d = readDrafts();
    delete d[key];
    writeDrafts(d);
    setDef(clone(STROKES[key] || []));
    setSel(0);
    onChanged?.();
  }

  const svgPoint = (e) => {
    const r = svg.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE];
  };
  const pointsOf = (it) => (it.p ? it.p : it.join ? it.join : it.dot ? [it.dot] : []);
  function onMove(e) {
    const dg = drag.current;
    if (!dg) return;
    const p = round(svgPoint(e));
    const next = clone(live.current);
    const it = next[dg.item];
    if (it.p) it.p[dg.point] = p;
    else if (it.join) it.join[dg.point] = p;
    else if (it.dot) it.dot = p;
    live.current = next;
    setDef(next);
  }
  function onUp() {
    if (drag.current) save(live.current);
    drag.current = null;
  }

  // list actions
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= def.length) return;
    const next = clone(def);
    [next[i], next[j]] = [next[j], next[i]];
    save(next);
    setSel(j);
  };
  const remove = (i) => {
    save(def.filter((_, k) => k !== i));
    setSel(Math.max(0, i - 1));
  };
  const reverse = (i) => {
    const next = clone(def);
    if (next[i].p) next[i].p.reverse();
    save(next);
  };
  const addPoint = (i) => {
    const next = clone(def);
    const pts = next[i].p || next[i].join;
    if (!pts) return;
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    pts.splice(pts.length - 1, 0, round([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 8]));
    save(next);
  };
  const dropPoint = (i) => {
    const next = clone(def);
    const pts = next[i].p || next[i].join;
    if (!pts || pts.length <= 2) return;
    pts.splice(pts.length - 2, 1);
    save(next);
  };
  const add = (kind) => {
    const c = SIZE / 2;
    const item = kind === 'dot' ? { dot: [c, c - 60] } : kind === 'join' ? { join: [[c + 70, SIZE * BASE], [c + 30, SIZE * BASE]] } : { p: [[c + 30, c - 40], [c - 30, c + 20]] };
    save([...def, item]);
    setSel(def.length);
  };

  // numbering as students see it: line strokes and dots in order, joins not counted
  let n = 0;
  const label = (it) => (it.join ? 'Joining line (not traced)' : `${++n} · ${it.dot ? 'dot' : 'stroke'}`);

  return (
    <div className="stroke-editor">
      <div className="se-pad">
        <div className="trace-box">
          <canvas ref={guide} width={SIZE} height={SIZE} className="trace-guide" aria-hidden="true" />
          <svg ref={svg} className="se-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
            <defs>
              <marker id="ahe" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#b8452f" />
              </marker>
            </defs>
            {view?.strokes.joins?.map((j, k) => <path key={'j' + k} d={pathD(j.pts)} className="se-join" />)}
            {view?.strokes.map((s, k) => (
              <g key={k} opacity={0.95}>
                {s.kind === 'line' && <path d={pathD(s.pts)} stroke={COLORS[k % COLORS.length]} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />}
                {view.marks[k].arrow?.map((q, j) => <path key={j} d={pathD(q)} className="trace-arrow" markerEnd="url(#ahe)" />)}
                <circle cx={view.marks[k].badge[0]} cy={view.marks[k].badge[1]} r="12" className="trace-num" />
                <text x={view.marks[k].badge[0]} y={view.marks[k].badge[1] + 5} textAnchor="middle" className="trace-num-t">{k + 1}</text>
              </g>
            ))}
            {def[sel] &&
              pointsOf(def[sel]).map((p, j, arr) => (
                <g key={j} className="se-handle" onPointerDown={(e) => { e.preventDefault(); e.currentTarget.ownerSVGElement.setPointerCapture?.(e.pointerId); drag.current = { item: sel, point: j }; }}>
                  <circle cx={p[0]} cy={p[1]} r="9" className={j === 0 ? 'start' : j === arr.length - 1 ? 'end' : 'mid'} />
                  <text x={p[0]} y={p[1] + 3.5} textAnchor="middle">{j === 0 ? 'S' : j === arr.length - 1 ? 'E' : j}</text>
                </g>
              ))}
          </svg>
        </div>
        <p className="se-help">
          Drag the handles of the selected item: <b>S</b> = start, <b>E</b> = end, numbers = points the stroke passes through. The stroke follows
          the letter between them.
        </p>
      </div>
      <div className="se-side">
        <ol className="se-list">
          {def.map((it, i) => (
            <li key={i} className={i === sel ? 'on' : ''}>
              <button className="se-pick" onClick={() => setSel(i)}>
                {label(it)}
              </button>
              <span className="se-btns">
                <button title="Earlier" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button title="Later" onClick={() => move(i, 1)} disabled={i === def.length - 1}>↓</button>
                {it.p && <button title="Reverse the direction" onClick={() => reverse(i)}>⇄</button>}
                {(it.p || it.join) && <button title="Add a point it passes through" onClick={() => addPoint(i)}>＋pt</button>}
                {(it.p || it.join) && (it.p || it.join).length > 2 && <button title="Remove a point" onClick={() => dropPoint(i)}>−pt</button>}
                <button title="Delete" onClick={() => remove(i)}>✕</button>
              </span>
            </li>
          ))}
        </ol>
        {!def.length && <p className="se-help">No strokes saved for this form yet: students see an automatic guess. Add strokes to fix it.</p>}
        <div className="row wrap">
          <button className="btn ghost" onClick={() => add('line')}>+ Stroke</button>
          <button className="btn ghost" onClick={() => add('dot')}>+ Dot</button>
          {glyph.startsWith('ـ') && <button className="btn ghost" onClick={() => add('join')}>+ Joining line</button>}
        </div>
        <div className="row wrap">
          <button className="btn" onClick={() => setWatchKey((k) => k + 1)}>▶ Watch</button>
          {edited && <button className="btn ghost" onClick={reset}>Undo my changes to this form</button>}
        </div>
        {edited && <p className="se-help"><b>Edited</b> (saved on this device).</p>}
      </div>
      {watchKey > 0 && (
        <div className="se-watch">
          <Trace key={watchKey} glyph={glyph} base={base} form={form} def={def} />
        </div>
      )}
    </div>
  );
}
