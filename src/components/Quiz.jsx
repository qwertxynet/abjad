import { useState } from 'react';
import { drawQuiz, newSeed, QUIZ_VERSION } from '../quiz.js';
import { useStore, makeCode, saveCode, markStep, countAttempt, href, playQ, canPlayQ, useAudioSet, useAr } from '../lib.js';
import { Ar, Pic, Mixed } from './bits.jsx';
import QuizReview from './QuizReview.jsx';

const PASS = 8;

export default function Quiz({ wk, next }) {
  const s = useStore();
  const [seed, setSeed] = useState(newSeed);
  const [qs, setQs] = useState(() => drawQuiz(wk.n, seed));
  const [picks, setPicks] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [right, setRight] = useState(0);
  const [result, setResult] = useState(null);
  const ar = useAr();
  useAudioSet(); // re-render when the recordings list arrives
  const saved = s.codes?.[wk.n];

  if (!s.name)
    return (
      <div className="panel">
        <p>Before the quiz, enter your name on the <a href={href('codes')}>My codes</a> page. It goes inside your completion code.</p>
      </div>
    );

  const restart = () => {
    const sd = newSeed();
    setSeed(sd);
    setQs(drawQuiz(wk.n, sd));
    setPicks([]);
    setShowReview(false);
    setI(0);
    setPicked(null);
    setRight(0);
    setResult(null);
  };

  if (result) {
    const pass = result.right >= PASS;
    return (
      <div className={'result ' + (pass ? 'pass' : 'fail')}>
        <h2>
          {result.right} / {qs.length}
        </h2>
        {pass ? (
          <>
            <p>You passed! Copy this code into the Week {wk.n} homework in Canvas, and upload your worksheet photo there too.</p>
            <CodeBox code={result.code} />
            <p className="muted">
              Code for <b>{s.name}</b> (attempt {result.attempt}). It’s also saved on your <a href={href('codes')}>My codes</a> page.
            </p>
            <div className="next-row">
              <button className="btn ghost" onClick={() => setShowReview(!showReview)} aria-expanded={showReview}>
                {showReview ? 'Hide my answers' : 'Review my answers'}
              </button>
              <button className="btn ghost" onClick={restart}>Try again for a higher score</button>
              {next && <a className="btn" href={href('w', next)}>Go to Week {next} ›</a>}
            </div>
            {showReview && <QuizReview questions={qs} picks={picks} />}
          </>
        ) : (
          <>
            <p>You need {PASS} correct to pass. Go back over the lesson if you like, then try again: you’ll get new questions.</p>
            <div className="next-row">
              <button className="btn" onClick={restart}>Try again</button>
            </div>
          </>
        )}
      </div>
    );
  }

  const q0 = qs[i];
  // A listening question whose clip isn't recorded yet is shown as its reading version.
  const asReading = q0.audio && !canPlayQ(q0) && q0.fallback;
  const q = asReading ? { ...q0, audio: null, prompt: q0.fallback.prompt, pic: q0.fallback.pic } : q0;
  const answer = (k) => {
    if (picked !== null) return;
    setPicked(k);
    setPicks((p) => {
      const c = [...p];
      c[i] = k;
      return c;
    });
    if (k === q.answer) setRight(right + 1);
  };
  const advance = () => {
    if (i + 1 < qs.length) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    const score = Math.round((right / qs.length) * 100);
    const pass = right >= PASS;
    const attempt = countAttempt(wk.n);
    let code = null;
    if (pass) {
      code = makeCode(s.name, wk.n, score, { version: QUIZ_VERSION, attempt, seed, picks });
      // Keep the best score.
      if (!saved || saved.score <= score) saveCode(wk.n, { code, score, date: new Date().toISOString() });
      markStep(wk.n, 'quiz');
    }
    setResult({ right, code, attempt });
  };

  return (
    <div className="quiz">
      {saved && (
        <p className="note">
          You already passed this quiz ({saved.score}%). Your code: <b className="mono">{saved.code}</b>
        </p>
      )}
      <div className="quiz-top">
        <span>
          Question {i + 1} of {qs.length}
        </span>
        <span className="muted">{right} correct</span>
      </div>
      <div className="q">
        <p className="q-prompt"><Mixed text={q.prompt} /></p>
        {q.pic && <Pic id={q.pic} size={96} />}
        {q.audio && (
          <button className="btn" onClick={() => playQ(q)}>
            ▶ Play
          </button>
        )}
        {q.passage && (
          <div className="passage small">
            {q.passage.map((l, k) => (
              <Ar as="p" key={k}>{l}</Ar>
            ))}
          </div>
        )}
        {q.ar && <Ar as="p" className="q-ar">{q.ar}</Ar>}
        <div className={'opts' + (q.options.some((o) => o.big) ? ' grid4' : '')}>
          {q.options.map((o, k) => (
            <button
              key={k}
              className={
                'opt' + (o.big ? ' big' : '') + (picked !== null ? (k === q.answer ? ' right' : k === picked ? ' wrong' : ' dim') : '')
              }
              onClick={() => answer(k)}
            >
              {o.ar ? (
                <span lang="ar" className={'ar' + (o.spaced ? ' spaced' : '')}>
                  {ar(o.ar)}
                </span>
              ) : (
                <Mixed text={o.label} />
              )}
            </button>
          ))}
        </div>
      </div>
      {picked !== null && (
        <div className="next-row">
          <span className={'verdict ' + (picked === q.answer ? 'right' : 'wrong')}>{picked === q.answer ? 'Correct!' : 'Not this time.'}</span>
          <button className="btn" onClick={advance}>
            {i + 1 < qs.length ? 'Next ›' : 'See my score'}
          </button>
        </div>
      )}
    </div>
  );
}

export function CodeBox({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="codebox">
      <span className="mono">{code}</span>
      <button
        className="btn ghost"
        onClick={() => {
          navigator.clipboard?.writeText(code).then(() => setCopied(true), () => {});
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
