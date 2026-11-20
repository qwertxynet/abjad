import { picMarkup } from '../data/pics.js';
import { useAr, useAudioSet, play, playSegment, hasSegment } from '../lib.js';
import { syllables } from '../data/letters.js';

export function Pic({ id, size = 72, className = '' }) {
  const inner = picMarkup(id);
  if (!inner) return null;
  return (
    <svg
      className={'pic ' + className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

/** Arabic text that follows the tashkeel switch. */
export function Ar({ children, className = '', as: Tag = 'span', ...rest }) {
  const ar = useAr();
  return (
    <Tag className={'ar ' + className} lang="ar" dir="rtl" {...rest}>
      {ar(children)}
    </Tag>
  );
}

/** Plays the teacher's recording. Hidden until that clip has been recorded. */
export function Say({ id, label = 'Listen' }) {
  const set = useAudioSet();
  if (!id || !set.has(id)) return null;
  return (
    <button className="say" onClick={() => play(id)} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export const letterClip = (c, kind) => `${kind}-${c.codePointAt(0).toString(16)}`;

export function Steps({ steps, current, done, onPick }) {
  return (
    <ol className="steps" aria-label="Lesson steps">
      {steps.map((s, i) => {
        const open = i === 0 || done[steps[i - 1].id];
        return (
          <li key={s.id}>
            <button
              className={'step' + (s.id === current ? ' on' : '') + (done[s.id] ? ' done' : '')}
              disabled={!open}
              onClick={() => onPick(s.id)}
              aria-current={s.id === current ? 'step' : undefined}
            >
              <span className="step-n">{done[s.id] ? '✓' : i + 1}</span>
              <span className="step-l">{s.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** English text with Arabic words mixed in: each Arabic run gets the Arabic font and its own direction. */
export function Mixed({ text }) {
  const ar = useAr();
  const parts = String(text).split(/([؀-ۿ][؀-ۿً-ْ\s…ـ/،؟]*[؀-ۿً-ْـ؟]|[؀-ۿ])/);
  return parts.map((t, i) =>
    /[؀-ۿ]/.test(t) ? (
      <bdi key={i} lang="ar" className="inline-ar">
        {ar(t)}
      </bdi>
    ) : (
      t
    )
  );
}

/** The Khalduniyya syllable drill for one letter. Once the teacher's recording is in, each syllable plays on its own. */
export function SyllableRow({ c }) {
  const ar = useAr();
  useAudioSet();
  const clip = letterClip(c, 'ls');
  const syl = c === 'ا' ? ['بَا', 'دَا', 'رَا', 'زَا', 'نَا'] : syllables(c);
  const tappable = syl.some((_, i) => hasSegment(clip, i));
  return (
    <div className="syl" lang="ar" dir="rtl">
      {syl.map((x, i) =>
        hasSegment(clip, i) ? (
          <button key={x} className="syl-btn" onClick={() => playSegment(clip, i)} aria-label={`Hear ${x}`}>
            {ar(x)}
          </button>
        ) : (
          <span key={x}>{ar(x)}</span>
        )
      )}
      <Say id={clip} label="Hear all the syllables" />
      {tappable && <span className="syl-hint" dir="ltr" lang="en">Tap a syllable to hear it</span>}
    </div>
  );
}
