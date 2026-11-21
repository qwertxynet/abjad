import { useEffect, useRef, useState } from 'react';
import data from '../data/comics.json';
import { useAudioSet, play, playList } from '../lib.js';
import { Ar } from './bits.jsx';

/** The weekly comics: { week: [ { img, alt, bubbles: [ { id, who, ar, en, clip?, x, y, tail?, align? } ] } ] } */
export const COMICS = data;
/** The recording a bubble plays: a clip already in the lesson, or the bubble's own. */
export const bubbleClip = (b) => b.clip || b.id;
const WHO = { nader: 'Nader', rana: 'Rana', caption: '' };

/**
 * One panel at a time, read right to left like an Arabic book: the next panel is to the LEFT
 * (the ‹ button, the ← key, or a swipe from left to right).
 */
export default function Comic({ n, onDone }) {
  const panels = COMICS[n] || [];
  const [i, setI] = useState(0);
  const [open, setOpen] = useState({});
  const [speaking, setSpeaking] = useState(null);
  const stopRef = useRef(null);
  const touch = useRef(null);
  const audio = useAudioSet();
  const p = panels[i];
  const last = i === panels.length - 1;

  const goTo = (k) => {
    stopRef.current?.();
    setSpeaking(null);
    setI(Math.max(0, Math.min(panels.length - 1, k)));
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goTo(i + 1);
      if (e.key === 'ArrowRight') goTo(i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => () => stopRef.current?.(), []);
  if (!p) return null;

  const tap = (b) => {
    setOpen((o) => ({ ...o, [b.id]: !o[b.id] }));
    play(bubbleClip(b));
  };
  const ids = p.bubbles.map(bubbleClip);
  const canPlayAll = ids.some((id) => audio.has(id));
  const playAll = () => {
    stopRef.current?.();
    stopRef.current = playList(ids, { onEach: (k) => setSpeaking(p.bubbles[k].id), onEnd: () => setSpeaking(null) });
  };

  return (
    <div className="comic">
      <p className="comic-hint">Tap a bubble to see what it means{canPlayAll ? ' and hear it' : ''}.</p>
      <div
        className="comic-panel"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - (touch.current ?? e.changedTouches[0].clientX);
          if (dx > 50) goTo(i + 1);
          if (dx < -50) goTo(i - 1);
          touch.current = null;
        }}
      >
        <img src={`./comics/${p.img}`} alt={p.alt} width="960" height="720" draggable="false" />
        {panels[i + 1] && <link rel="prefetch" href={`./comics/${panels[i + 1].img}`} />}
        {p.bubbles.map((b) => {
          const pos = b.align === 'right' ? { right: `${100 - b.x}%`, top: `${b.y}%` } : { left: `${b.x}%`, top: `${b.y}%` };
          return (
            <button
              key={b.id}
              className={`bubble ${b.who}${b.tail ? ' tail-' + b.tail : ''}${open[b.id] ? ' open' : ''}${speaking === b.id ? ' speaking' : ''}`}
              style={pos}
              onClick={() => tap(b)}
              aria-expanded={!!open[b.id]}
              aria-label={`${WHO[b.who] ? WHO[b.who] + ' says: ' : ''}${b.ar}. Tap for the meaning.`}
            >
              <Ar className="bubble-ar">{b.ar}</Ar>
              {open[b.id] && <span className="bubble-en">{b.en}</span>}
            </button>
          );
        })}
      </div>
      <div className="comic-nav" dir="rtl">
        <button dir="ltr" className="btn ghost round" onClick={() => goTo(i - 1)} disabled={i === 0} aria-label="Previous panel">
          ›
        </button>
        <span className="comic-dots" dir="rtl" aria-label={`Panel ${i + 1} of ${panels.length}`}>
          {panels.map((_, k) => (
            <button key={k} className={'dot' + (k === i ? ' on' : '')} onClick={() => goTo(k)} aria-label={`Panel ${k + 1}`} />
          ))}
        </span>
        {canPlayAll && (
          <button className="btn ghost" onClick={playAll}>
            ▶ Play all
          </button>
        )}
        <button dir="ltr" className="btn round" onClick={() => goTo(i + 1)} disabled={last} aria-label="Next panel">
          ‹
        </button>
      </div>
      {last && (
        <div className="next-row comic-end">
          <button className="btn ghost" onClick={() => goTo(0)}>
            Read it again
          </button>
          <button className="btn" onClick={onDone}>
            On to the quiz ›
          </button>
        </div>
      )}
    </div>
  );
}
