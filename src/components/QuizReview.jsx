import { useAr, hasAudio, play } from '../lib.js';
import { Ar, Pic, Mixed } from './bits.jsx';

/** One quiz, question by question: the student's pick, the right answer, ✓ / ✗. */
export default function QuizReview({ questions, picks, teacher = false }) {
  const ar = useAr();
  return (
    <ol className="review">
      {questions.map((q, i) => {
        const pick = picks[i];
        const ok = pick === q.answer;
        const shownAsReading = q.audio && q.fallback && !hasAudio(q.audio);
        const prompt = shownAsReading && !teacher ? q.fallback.prompt : q.prompt;
        const pic = shownAsReading && !teacher ? q.fallback.pic : q.pic;
        return (
          <li key={i} className={'rv ' + (ok ? 'ok' : 'bad')}>
            <div className="rv-head">
              <span className="rv-mark" aria-label={ok ? 'Correct' : 'Wrong'}>{ok ? '✓' : '✗'}</span>
              <span className="rv-prompt">
                <Mixed text={prompt} />
                {teacher && q.audio && (
                  <span className="rv-note">
                    {' '}
                    Listening question{q.fallback ? `; shown as “${q.fallback.prompt}” while the recording didn’t exist` : ''}.{' '}
                    {hasAudio(q.audio) && (
                      <button className="chip" onClick={() => play(q.audio)}>
                        ▶ clip
                      </button>
                    )}
                  </span>
                )}
              </span>
              {pic && <Pic id={pic} size={44} />}
            </div>
            {q.passage && (
              <details className="rv-passage">
                <summary>Reading text</summary>
                {q.passage.map((l, k) => (
                  <Ar as="p" key={k}>{l}</Ar>
                ))}
              </details>
            )}
            {q.ar && <Ar as="p" className="rv-ar">{q.ar}</Ar>}
            <ul className="rv-opts">
              {q.options.map((o, k) => {
                const right = k === q.answer;
                const chosen = k === pick;
                return (
                  <li key={k} className={(right ? 'right' : '') + (chosen && !right ? ' wrong' : '') + (chosen ? ' chosen' : '')}>
                    <span className="rv-dot">{right ? '✓' : chosen ? '✗' : '○'}</span>
                    {o.ar ? (
                      <span lang="ar" className={'ar' + (o.big ? ' big' : '') + (o.spaced ? ' spaced' : '')}>
                        {ar(o.ar)}
                      </span>
                    ) : (
                      <Mixed text={o.label} />
                    )}
                    {chosen && <em className="rv-who">{teacher ? 'student’s answer' : 'your answer'}</em>}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
