import { useMemo, useState } from 'react';
import { weekByN, DATES, COUNTRIES, nextLesson } from '../data/weeks.js';
import { byChar, forms, syllables, SIGNS, knownBy } from '../data/letters.js';
import { useStore, markStep, go, href, splitLetters, strip, shuffle, isOpen, useAr } from '../lib.js';
import { Ar, Pic, Say, Steps, letterClip, Mixed, SyllableRow } from '../components/bits.jsx';
import Trace, { TRACE_TIPS } from '../components/Trace.jsx';
import Games from '../components/Games.jsx';
import Quiz from '../components/Quiz.jsx';

const P1 = [
  { id: 'words', label: 'Words' },
  { id: 'split', label: 'Split' },
  { id: 'meet', label: 'Meet' },
  { id: 'trace', label: 'Trace' },
  { id: 'read', label: 'Read' },
  { id: 'play', label: 'Play' },
  { id: 'quiz', label: 'Quiz' },
];
const P2 = [
  { id: 'words', label: 'Words' },
  { id: 'cards', label: 'Cards' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'read', label: 'Read' },
  { id: 'write', label: 'Write' },
  { id: 'play', label: 'Play' },
  { id: 'quiz', label: 'Quiz' },
];
const REVIEW = [{ id: 'quiz', label: 'Review quiz' }];

export default function Lesson({ n, step }) {
  const s = useStore();
  const wk = weekByN[n];
  if (!wk) return <p>That lesson doesn’t exist. <a href={href()}>Back to the lessons</a></p>;
  if (!isOpen(s, n))
    return (
      <div className="panel">
        <h2>Week {n} is locked</h2>
        <p>Pass the quiz of the week before to open it, or paste a code on the <a href={href('codes')}>My codes</a> page.</p>
      </div>
    );
  const steps = wk.review ? REVIEW : wk.part === 1 ? P1 : P2;
  const done = s.steps?.[n] || {};
  const firstOpen = steps.find((x, i) => !done[x.id] && (i === 0 || done[steps[i - 1].id]))?.id || steps[steps.length - 1].id;
  const cur = steps.find((x) => x.id === step) ? step : firstOpen;
  const idx = steps.findIndex((x) => x.id === cur);
  const curOpen = idx === 0 || done[steps[idx - 1].id];
  const complete = () => {
    markStep(n, cur);
    const nx = steps[idx + 1];
    if (nx) go('w', n, nx.id);
  };

  return (
    <div className="lesson">
      <header className="lesson-head">
        <a href={href()} className="back">‹ All weeks</a>
        <div className="lh-title">
          <span className="lh-week">
            Week {n} · {DATES[n][0]} – {DATES[n][1]}
          </span>
          <Ar as="h1" className={wk.part === 1 ? 'letters' : ''}>{wk.title}</Ar>
          <p className="lh-en">{wk.titleEn}</p>
        </div>
      </header>
      {steps.length > 1 && <Steps steps={steps} current={cur} done={done} onPick={(id) => go('w', n, id)} />}
      {!curOpen ? (
        <p className="panel">Finish the earlier steps first.</p>
      ) : (
        <section className="step-body" key={cur}>
          {cur === 'words' && <WordsStep wk={wk} onDone={complete} />}
          {cur === 'split' && <SplitStep wk={wk} onDone={complete} />}
          {cur === 'meet' && <MeetStep wk={wk} onDone={complete} />}
          {cur === 'trace' && <TraceStep wk={wk} onDone={complete} />}
          {cur === 'read' && (wk.part === 1 ? <ReadStep1 wk={wk} onDone={complete} /> : <ReadStep2 wk={wk} onDone={complete} />)}
          {cur === 'cards' && <CardsStep wk={wk} onDone={complete} />}
          {cur === 'pattern' && <PatternStep wk={wk} onDone={complete} />}
          {cur === 'write' && <WriteStep wk={wk} onDone={complete} />}
          {cur === 'play' && <Games wk={wk} onDone={complete} />}
          {cur === 'quiz' && <Quiz wk={wk} next={nextLesson(n)} />}
        </section>
      )}
    </div>
  );
}

function Next({ onClick, label = 'Next step', disabled }) {
  return (
    <div className="next-row">
      <button className="btn" onClick={onClick} disabled={disabled}>
        {label} ›
      </button>
    </div>
  );
}

// Letters known this week (red) vs before (blue).
function useLetterClass(wk) {
  const fresh = new Set(wk.newLetters || []);
  const known = new Set(knownBy(wk.n));
  return (seg) => {
    const b = strip(seg).replace(/[أإآٱ]/, 'ا');
    if (fresh.has(b)) return 'new';
    if (known.has(b)) return 'known';
    return 'sign';
  };
}

// ───────────── Part 1 ─────────────
function WordsStep({ wk, onDone }) {
  const tr = wk.n <= 3;
  return (
    <>
      <p className="lead">
        {wk.part === 1
          ? 'Look at each whole word and its picture. Say it out loud. Next, you will take the words apart to find the new letters.'
          : 'Here are this week’s words. Say each one out loud.'}
      </p>
      {wk.intro && <p className="note">{wk.intro}</p>}
      <ul className="word-grid">
        {wk.words.map((w) => (
          <li key={w.id} className="word-card">
            <Pic id={w.pic} size={72} />
            <Ar className="wc-ar">{w.ar}</Ar>
            {tr && w.tr && <span className="wc-tr">{w.tr}</span>}
            <span className="wc-en">{w.en}</span>
            <Say id={'w-' + w.id} />
          </li>
        ))}
      </ul>
      {wk.pattern?.extra && (
        <>
          <h3>Tens (for ages over 20)</h3>
          <ul className="word-grid small">
            {wk.pattern.extra.map((w) => (
              <li key={w.id} className="word-card">
                <Pic id={w.pic} size={56} />
                <Ar className="wc-ar">{w.ar}</Ar>
                <span className="wc-en">{w.en}</span>
                <Say id={'w-' + w.id} />
              </li>
            ))}
          </ul>
        </>
      )}
      <Next onClick={onDone} />
    </>
  );
}

function SplitStep({ wk, onDone }) {
  const [open, setOpen] = useState({});
  const [seen, setSeen] = useState({});
  const cls = useLetterClass(wk);
  const ar = useAr();
  const all = wk.words.every((w) => seen[w.id]);
  return (
    <>
      <p className="lead">
        Tap a word to take it apart into its letters, then tap again to put it back together. <span className="k new">Red</span> letters are new
        this week; <span className="k known">blue</span> ones you already know.
      </p>
      <ul className="split-list">
        {wk.words.map((w) => {
          const segs = splitLetters(w.ar).filter((x) => x !== ' ');
          const isOpen = open[w.id];
          return (
            <li key={w.id}>
              <button
                className={'split-card' + (isOpen ? ' open' : '')}
                onClick={() => {
                  setOpen({ ...open, [w.id]: !isOpen });
                  setSeen({ ...seen, [w.id]: true });
                }}
                aria-expanded={!!isOpen}
              >
                <Pic id={w.pic} size={44} />
                {isOpen ? (
                  <span className="split-letters" dir="rtl" lang="ar">
                    {segs.map((g, i) => (
                      <span key={i} className={'seg ' + cls(g)}>
                        {ar(g)}
                      </span>
                    ))}
                  </span>
                ) : (
                  <Ar className="split-whole">{w.ar}</Ar>
                )}
                <span className="split-en">{w.en}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Next onClick={onDone} disabled={!all} label={all ? 'Next step' : `Split every word (${Object.keys(seen).length}/${wk.words.length})`} />
    </>
  );
}

function MeetStep({ wk, onDone }) {
  const items = [...wk.newLetters.map((c) => ({ kind: 'letter', c })), ...wk.signs.map((id) => ({ kind: 'sign', id }))];
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState({ 0: true });
  const it = items[i];
  const goTo = (k) => {
    setI(k);
    setSeen({ ...seen, [k]: true });
  };
  const all = items.every((_, k) => seen[k]);
  return (
    <>
      <p className="lead">Meet the new letters you found inside the words: their names, their sounds, and how they change shape.</p>
      <div className="tabs" role="tablist">
        {items.map((x, k) => (
          <button key={k} role="tab" aria-selected={k === i} className={'tab' + (k === i ? ' on' : '') + (seen[k] ? ' seen' : '')} onClick={() => goTo(k)}>
            <span lang="ar">{x.kind === 'letter' ? x.c : SIGNS.find((g) => g.id === x.id).char}</span>
          </button>
        ))}
      </div>
      {it.kind === 'letter' ? <LetterCard c={it.c} /> : <SignCard id={it.id} />}
      <div className="next-row">
        {i < items.length - 1 ? (
          <button className="btn" onClick={() => goTo(i + 1)}>
            Next letter ›
          </button>
        ) : (
          <button className="btn" onClick={onDone} disabled={!all}>
            Next step ›
          </button>
        )}
      </div>
    </>
  );
}

export function LetterCard({ c }) {
  const l = byChar[c];
  const f = forms(c);
  const ar = useAr();
  return (
    <div className="letter-card">
      <div className="lc-big" lang="ar">{c}</div>
      <div className="lc-info">
        <h2>
          <Ar>{l.name}</Ar> <span className="muted">· {l.nameEn}</span> <Say id={letterClip(c, 'ln')} label="Hear the name" />
        </h2>
        <p>{l.sound}</p>
        <p className={'joins ' + (l.joins ? 'yes' : 'no')}>{l.joins ? 'Joins on both sides.' : 'Never joins to the letter after it (on its left).'}</p>
        <SyllableRow c={c} />
      </div>
      <table className="forms">
        <thead>
          <tr>
            <th>End</th>
            <th>Middle</th>
            <th>Start</th>
            <th>Alone</th>
          </tr>
        </thead>
        <tbody>
          <tr lang="ar">
            <td>{f.final}</td>
            <td>{f.medial}</td>
            <td>{f.initial}</td>
            <td>{f.isolated}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SignCard({ id }) {
  const g = SIGNS.find((x) => x.id === id);
  return (
    <div className="letter-card sign">
      <div className="lc-big small" lang="ar">
        <Ar>{g.char}</Ar>
      </div>
      <div className="lc-info">
        <h2>
          <Ar>{g.name}</Ar> <span className="muted">· {g.nameEn}</span>
        </h2>
        <p>{g.note}</p>
      </div>
    </div>
  );
}

function TraceStep({ wk, onDone }) {
  const letters = wk.newLetters.length ? wk.newLetters : ['ء', 'أ', 'ى', 'آ'];
  const [i, setI] = useState(0);
  const [form, setForm] = useState('isolated');
  const [got, setGot] = useState({});
  const c = letters[i];
  const f = forms(c) || { isolated: c, initial: c, medial: c, final: c };
  const glyph = f[form];
  const keyOf = (ch, fm) => ch + ':' + fm;
  const all = letters.every((ch) => got[keyOf(ch, 'isolated')]);
  const FORMS = byChar[c]?.joins ? ['isolated', 'initial', 'medial', 'final'] : byChar[c] ? ['isolated', 'final'] : ['isolated'];
  return (
    <>
      <p className="lead">
        Trace each new letter with your finger or mouse. Start at <b>1</b> and follow the arrow, then add the dots and marks in order. Fill the
        bar to earn a star. Each letter is required on its own; the other forms are extra practice.
      </p>
      <div className="tabs">
        {letters.map((ch, k) => (
          <button key={ch} className={'tab' + (k === i ? ' on' : '') + (got[keyOf(ch, 'isolated')] ? ' seen' : '')} onClick={() => { setI(k); setForm('isolated'); }}>
            <span lang="ar">{ch}</span>
          </button>
        ))}
      </div>
      <div className="form-pick">
        {FORMS.map((fm) => (
          <button key={fm} className={'chip' + (fm === form ? ' on' : '')} onClick={() => setForm(fm)}>
            {{ isolated: 'Alone', initial: 'Start', medial: 'Middle', final: 'End' }[fm]} <span lang="ar">{f[fm]}</span>
            {got[keyOf(c, fm)] ? ' ★' : ''}
          </button>
        ))}
      </div>
      {TRACE_TIPS[c] && <p className="hint">{TRACE_TIPS[c]}</p>}
      <Trace key={glyph} glyph={glyph} base={c} done={!!got[keyOf(c, form)]} onDone={() => setGot((g) => ({ ...g, [keyOf(c, form)]: true }))} />
      <div className="next-row">
        {i < letters.length - 1 && (
          <button className="btn ghost" onClick={() => { setI(i + 1); setForm('isolated'); }}>
            Next letter ›
          </button>
        )}
        <button className="btn" onClick={onDone} disabled={!all}>
          {all ? 'Next step ›' : `Trace every letter alone (${letters.filter((ch) => got[keyOf(ch, 'isolated')]).length}/${letters.length})`}
        </button>
      </div>
    </>
  );
}

function Line({ x, big }) {
  const [show, setShow] = useState(false);
  return (
    <li className={'read-line' + (big ? ' big' : '')}>
      <Ar className="rl-ar">{x.ar}</Ar>
      <Say id={'s-' + x.id} />
      <button className="chip" onClick={() => setShow(!show)} aria-expanded={show}>
        {show ? x.en : 'Meaning?'}
      </button>
    </li>
  );
}

function ReadStep1({ wk, onDone }) {
  return (
    <>
      <p className="lead">Read each phrase out loud, then check the meaning. Every word uses only letters you know.</p>
      <ul className="read-list">
        {wk.phrases.map((x) => (
          <Line key={x.id} x={x} />
        ))}
      </ul>
      <h3>This week’s sentence</h3>
      <ul className="read-list">
        {wk.sentences.map((x) => (
          <Line key={x.id} x={x} big />
        ))}
      </ul>
      {wk.spoken?.length > 0 && (
        <>
          <h3>Say it (we practise these in class; you’ll be able to read them later)</h3>
          <ul className="read-list spoken">
            {wk.spoken.map((x) => (
              <Line key={x.id} x={x} />
            ))}
          </ul>
        </>
      )}
      <Next onClick={onDone} />
    </>
  );
}

// ───────────── Part 2 ─────────────
function CardsStep({ wk, onDone }) {
  const words = wk.words;
  const [queue, setQueue] = useState(() => shuffle(words.map((w) => w.id)));
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(new Set());
  const byId = Object.fromEntries(words.map((w) => [w.id, w]));
  const w = byId[queue[0]];
  const answer = (ok) => {
    setFlip(false);
    if (ok) {
      setKnown(new Set([...known, w.id]));
      setQueue(queue.slice(1));
    } else setQueue([...queue.slice(1), w.id]);
  };
  if (!w)
    return (
      <>
        <p className="lead">You know all {words.length} cards. 🎉</p>
        <div className="next-row">
          <button className="btn ghost" onClick={() => { setQueue(shuffle(words.map((x) => x.id))); setKnown(new Set()); }}>Go again</button>
          <button className="btn" onClick={onDone}>Next step ›</button>
        </div>
      </>
    );
  return (
    <>
      <p className="lead">
        Read the Arabic, say the meaning, then flip the card to check. Cards you miss come back. {known.size}/{words.length} known.
      </p>
      <button className={'flash' + (flip ? ' flipped' : '')} onClick={() => setFlip(!flip)} aria-label="Flip the card">
        {!flip ? (
          <Ar className="flash-ar">{w.ar}</Ar>
        ) : (
          <span className="flash-back">
            <Pic id={w.pic} size={80} />
            <span>{w.en}</span>
          </span>
        )}
      </button>
      <div className="next-row center">
        <Say id={'w-' + w.id} />
        <button className="btn ghost" onClick={() => answer(false)}>Again</button>
        <button className="btn" onClick={() => answer(true)}>I know it</button>
      </div>
    </>
  );
}

function PatternStep({ wk, onDone }) {
  const p = wk.pattern;
  const ar = useAr();
  const [country, setCountry] = useState(null);
  return (
    <>
      <h2 className="pattern-title"><Mixed text={p.title} /></h2>
      {p.explain.map((t, i) => (
        <p key={i} className="explain"><Mixed text={t} /></p>
      ))}
      <h3>Examples</h3>
      <ul className="read-list">
        {p.examples.map((x) => (
          <Line key={x.id} x={x} />
        ))}
      </ul>
      {p.ages && (
        <>
          <h3>Ages</h3>
          <table className="tbl">
            <tbody>
              {p.ages.map(([n, t]) => (
                <tr key={n}>
                  <td className="num">{n}</td>
                  <td lang="ar" className="ar">{ar('عُمْرِي ' + t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {wk.n === 11 && <MonthsTable wk={wk} />}
      {p.verbs && (
        <>
          <h3>I · he · she</h3>
          <table className="tbl">
            <thead>
              <tr><th>meaning</th><th>هِيَ she</th><th>هُوَ he</th><th>أَنَا I</th></tr>
            </thead>
            <tbody>
              {p.verbs.map(([a, b, c, en]) => (
                <tr key={a}>
                  <td>{en}</td>
                  <td className="ar" lang="ar">{ar(c)}</td>
                  <td className="ar" lang="ar">{ar(b)}</td>
                  <td className="ar" lang="ar">{ar(a)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {wk.n === 16 && (
        <>
          <h3>The Arab world: tap a country</h3>
          <TileMap onPick={setCountry} picked={country} />
          {country && (
            <div className="country-card">
              <Ar as="h3">{country.ar}</Ar>
              <p>
                {country.en} · capital <Ar>{country.cap}</Ar> ({country.capEn}) · nationality <Ar>{country.nat}</Ar> / <Ar>{country.nat + 'َة'}</Ar>
              </p>
              <Say id={'c-' + country.id} />
            </div>
          )}
        </>
      )}
      <Next onClick={onDone} />
    </>
  );
}

function MonthsTable({ wk }) {
  const ar = useAr();
  const m = wk.words.filter((w) => /^m\d/.test(w.id));
  const l = wk.words.filter((w) => /^l\d/.test(w.id));
  return (
    <>
      <h3>The months, side by side</h3>
      <table className="tbl">
        <thead>
          <tr><th></th><th>Levant & Iraq</th><th>Egypt, North Africa, Gulf</th></tr>
        </thead>
        <tbody>
          {m.map((x, i) => (
            <tr key={x.id}>
              <td>{x.en}</td>
              <td className="ar" lang="ar">{ar(l[i].ar)}</td>
              <td className="ar" lang="ar">{ar(x.ar)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function TileMap({ onPick, picked, mark }) {
  const ar = useAr();
  const minR = Math.min(...COUNTRIES.map((c) => c.at[0]));
  return (
    <div className="tilemap" role="group" aria-label="Map of the Arab world">
      {COUNTRIES.map((c) => (
        <button
          key={c.id}
          className={'tile' + (picked?.id === c.id ? ' on' : '') + (mark?.(c) || '')}
          style={{ gridRow: c.at[0] - minR + 1, gridColumn: c.at[1] + 1 }}
          onClick={() => onPick(c)}
          title={c.en}
        >
          <span lang="ar">{ar(c.ar)}</span>
        </button>
      ))}
    </div>
  );
}

function ReadStep2({ wk, onDone }) {
  const r = wk.reading;
  const [ans, setAns] = useState({});
  const ok = r.questions.every((q, i) => ans[i] === q.answer);
  const opts = useMemo(() => r.questions.map((q) => shuffle(q.options.map((o, i) => ({ o, i })))), [r]);
  return (
    <>
      <p className="lead">Read the text out loud, then answer the questions. Tap a line to hear it (when recorded).</p>
      <div className="passage">
        {r.lines.map((x) => (
          <Line key={x.id} x={x} />
        ))}
      </div>
      {r.gloss.length > 0 && (
        <p className="gloss">
          New words:{' '}
          {r.gloss.map(([a, e], i) => (
            <span key={a}>
              {i > 0 && ' · '}
              <Ar>{a}</Ar> {e}
            </span>
          ))}
        </p>
      )}
      <ol className="questions">
        {r.questions.map((q, i) => (
          <li key={i}>
            <p><Mixed text={q.q} /></p>
            <div className="opts">
              {opts[i].map(({ o, i: oi }) => (
                <button
                  key={oi}
                  className={'opt' + (ans[i] === oi ? (oi === q.answer ? ' right' : ' wrong') : '')}
                  onClick={() => setAns({ ...ans, [i]: oi })}
                >
                  {/[؀-ۿ]/.test(o) ? <Ar>{o}</Ar> : o}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <Next onClick={onDone} disabled={!ok} label={ok ? 'Next step' : 'Answer every question correctly'} />
    </>
  );
}

function WriteStep({ wk, onDone }) {
  const [i, setI] = useState(0);
  const [built, setBuilt] = useState([]);
  const [doneSet, setDoneSet] = useState(new Set());
  const x = wk.write[i];
  const toks = useMemo(() => x.ar.split(/\s+/), [x]);
  const pool = useMemo(() => shuffle(toks.map((t, k) => ({ t, k }))), [toks]);
  const ar = useAr();
  const right = built.length === toks.length && built.every((b, k) => toks[b] === toks[k]);
  const finished = doneSet.size === wk.write.length;
  return (
    <>
      <p className="lead">
        Build the Arabic sentence: tap the words in order, from right to left. Then copy it into your notebook. Sentence {i + 1} of {wk.write.length}.
      </p>
      <p className="write-en">“{x.en}”</p>
      <div className="built" dir="rtl" lang="ar" aria-live="polite">
        {built.map((k, j) => (
          <button key={j} className="tok on" onClick={() => setBuilt(built.filter((_, q) => q !== j))}>
            {ar(toks[k])}
          </button>
        ))}
        {!built.length && <span className="placeholder">…</span>}
      </div>
      <div className="pool" dir="rtl" lang="ar">
        {pool.map(({ t, k }) => (
          <button key={k} className="tok" disabled={built.includes(k)} onClick={() => setBuilt([...built, k])}>
            {ar(t)}
          </button>
        ))}
      </div>
      {built.length === toks.length && (
        <p className={'verdict ' + (right ? 'right' : 'wrong')}>{right ? 'Correct! Now write it in your notebook.' : 'Not quite: tap a word to take it back.'}</p>
      )}
      <div className="next-row">
        {right && !finished && i < wk.write.length - 1 && (
          <button className="btn" onClick={() => { setDoneSet(new Set([...doneSet, i])); setI(i + 1); setBuilt([]); }}>
            Next sentence ›
          </button>
        )}
        {right && i === wk.write.length - 1 && (
          <button className="btn" onClick={() => { setDoneSet(new Set([...doneSet, i])); onDone(); }}>
            Next step ›
          </button>
        )}
      </div>
    </>
  );
}
