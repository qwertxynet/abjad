import { useState } from 'react';
import { drawQuiz } from '../quiz.js';
import { useStore, makeCode, saveCode, markStep, href, play, useAr } from '../lib.js';
import { Ar, Pic, Mixed } from './bits.jsx';

const PASS = 8;

export default function Quiz({ wk, next }) {
  const s = useStore();
  const [qs, setQs] = useState(() => drawQuiz(wk.n));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [right, setRight] = useState(0);
  const [result, setResult] = useState(null);
  const ar = useAr();
  const saved = s.codes?.[wk.n];

  if (!s.name)
    return (
      <div className="panel">
        <p>Before the quiz, enter your name on the <a href={href('codes')}>My codes</a> page. It goes inside your completion code.</p>
      </div>
    );

  const restart = () => {
    setQs(drawQuiz(wk.n));
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
              Code for <b>{s.name}</b>. It’s also saved on your <a href={href('codes')}>My codes</a> page.
            </p>
            <div className="next-row">
              <button className="btn ghost" onClick={restart}>Try again for a higher score</button>
              {next && <a className="btn" href={href('w', next)}>Go to Week {next} ›</a>}
            </div>
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

  const q = qs[i];
  const answer = (k) => {
    if (picked !== null) return;
    setPicked(k);
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
    let code = null;
    if (pass) {
      code = makeCode(s.name, wk.n, score);
      // Keep the best score.
      if (!saved || saved.score <= score) saveCode(wk.n, { code, score, date: new Date().toISOString() });
      markStep(wk.n, 'quiz');
    }
    setResult({ right, code });
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
          <button className="btn" onClick={() => play(q.audio)}>
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
