import { useState } from 'react';
import { LETTERS, forms } from '../data/letters.js';
import { Overview } from '../components/Trace.jsx';
import StrokesEditor, { draftCount, downloadStrokes, discardDrafts } from './StrokesEditor.jsx';

const FORM_NAMES = { isolated: 'Alone', initial: 'Start', medial: 'Middle', final: 'End' };
const HAMZA = [
  { char: 'ء', nameEn: 'hamza', week: 8 },
  { char: 'أ', nameEn: 'alif + hamza', week: 8 },
  { char: 'ى', nameEn: 'alif maqṣūra', week: 8 },
  { char: 'آ', nameEn: 'alif madda', week: 8 },
].map((l) => ({ ...l, hamza: true }));
export const formsOf = (l) => (l.hamza ? ['isolated'] : l.joins ? ['isolated', 'initial', 'medial', 'final'] : ['isolated', 'final']);
const glyphOf = (l, fm) => (l.hamza ? l.char : forms(l.char)[fm]);

/** Teacher page: the stroke order of every letter form, week by week, and the editor. */
export default function StrokesTab() {
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8];
  const [wk, setWk] = useState(1);
  const [open, setOpen] = useState(null);
  const [version, setVersion] = useState(0);
  const [drafts, setDrafts] = useState(draftCount());
  const changed = () => {
    setVersion((v) => v + 1);
    setDrafts(draftCount());
  };
  const letters = wk === 8 ? HAMZA : LETTERS.filter((l) => l.week === wk);
  return (
    <section className="panel">
      <p>
        The stroke order students see when tracing (following Sakkal’s Naskh chart). Numbers show the order and each arrow runs beside its stroke in
        the writing direction. Tap a letter form to edit it.
      </p>
      <div className="se-bar">
        <span>
          {drafts ? (
            <>
              <b>{drafts}</b> letter form{drafts === 1 ? '' : 's'} changed on this device.
            </>
          ) : (
            'No changes yet.'
          )}
        </span>
        <button className="btn" onClick={downloadStrokes} disabled={!drafts}>
          ↓ Download strokes file
        </button>
        {drafts > 0 && (
          <button
            className="btn ghost"
            onClick={() => {
              if (window.confirm('Discard all your stroke changes on this device?')) {
                discardDrafts();
                setOpen(null);
                changed();
              }
            }}
          >
            Discard all changes
          </button>
        )}
      </div>
      {drafts > 0 && (
        <p className="se-help">
          To publish your changes for every student: download the strokes file, put it in the project folder as <code>abjad/src/data/strokes.json</code>{' '}
          (replacing the old one), and ask Claude to publish.
        </p>
      )}
      <div className="row wrap">
        {weeks.map((w) => (
          <button key={w} className={'chip' + (w === wk ? ' on' : '')} onClick={() => { setWk(w); setOpen(null); }}>
            Week {w}
          </button>
        ))}
      </div>
      {open && (
        <div className="strokes-open">
          <h3>
            <span lang="ar">{open.glyph}</span> · {open.name} · {FORM_NAMES[open.form]}{' '}
            <button className="btn ghost" onClick={() => setOpen(null)}>
              Close
            </button>
          </h3>
          <StrokesEditor key={open.c + open.form} glyph={open.glyph} base={open.c} form={open.form} onChanged={changed} />
        </div>
      )}
      <div className="strokes-grid">
        {letters.flatMap((l) =>
          formsOf(l).map((fm) => {
            const glyph = glyphOf(l, fm);
            return (
              <figure key={l.char + fm + version} onClick={() => setOpen({ c: l.char, form: fm, glyph, name: l.nameEn })} style={{ cursor: 'pointer' }}>
                <Overview glyph={glyph} base={l.char} form={fm} />
                <figcaption>
                  {l.nameEn} · {FORM_NAMES[fm]}
                </figcaption>
              </figure>
            );
          }),
        )}
      </div>
    </section>
  );
}
