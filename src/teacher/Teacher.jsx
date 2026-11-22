import { useEffect, useMemo, useRef, useState } from 'react';
import { checkCode, checkPassword, makeUnlock, useAudioSet, useAr } from '../lib.js';
import { LESSON_ORDER } from '../data/weeks.js';
import { CLIPS, VOICES } from './clips.js';
import { CodeBox } from '../components/Quiz.jsx';
import { encodeWav, makeZip, idb, readWav } from './audio-tools.js';
import { findSegments, expectedSyllables, isSyllableClip } from './segments.js';
import { drawQuiz, QUIZ_VERSION } from '../quiz.js';
import { weekByN } from '../data/weeks.js';
import QuizReview from '../components/QuizReview.jsx';
import StrokesTab from './StrokesTab.jsx';

export default function Teacher({ tab }) {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  if (!ok)
    return (
      <div className="narrow panel">
        <h1>Teacher pages</h1>
        <form
          className="row"
          onSubmit={async (e) => {
            e.preventDefault();
            const good = await checkPassword(pw);
            setOk(good);
            setErr(!good);
          }}
        >
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" aria-label="Teacher password" autoFocus />
          <button className="btn">Enter</button>
        </form>
        {err && <p className="verdict wrong">Wrong password.</p>}
      </div>
    );
  const T = [
    ['check', 'Check a code'],
    ['unlock', 'Unlock code'],
    ['studio', 'Recording studio'],
    ['strokes', 'Strokes'],
  ];
  const cur = T.find((t) => t[0] === tab) ? tab : 'check';
  return (
    <div>
      <h1>Teacher pages</h1>
      <div className="tabs wide">
        {T.map(([id, label]) => (
          <a key={id} className={'tab' + (id === cur ? ' on' : '')} href={'#/teacher/' + id}>
            {label}
          </a>
        ))}
      </div>
      {cur === 'check' && <Check />}
      {cur === 'unlock' && <Unlock />}
      {cur === 'studio' && <Studio />}
      {cur === 'strokes' && <StrokesTab />}
    </div>
  );
}

function Check() {
  const [name, setName] = useState('');
  const [codes, setCodes] = useState('');
  const rows = useMemo(
    () =>
      codes
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map((c) => checkCode(name, c)),
    [name, codes]
  );
  return (
    <section className="panel">
      <p>Type the student’s name as in Canvas, then paste one or more of their codes.</p>
      <div className="col-form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Student first and last name" aria-label="Student name" />
        <textarea value={codes} onChange={(e) => setCodes(e.target.value)} rows={3} placeholder="W03-90-0220-XXXXXX" aria-label="Codes" />
      </div>
      {rows.length > 0 && (
        <table className="tbl">
          <thead>
            <tr><th>Code</th><th>Valid for this name?</th><th>Week</th><th>Score</th><th>Date</th><th>Attempt</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.ok ? 'ok' : 'bad'}>
                <td className="mono">{r.code}</td>
                <td>{r.ok ? '✓ yes' : r.kind === 'invalid' ? '✗ not a code' : '✗ no'}</td>
                <td>{r.kind === 'lesson' ? r.week : r.kind === 'unlock' ? `unlock ≤ ${r.upTo}` : ''}</td>
                <td>{r.kind === 'lesson' ? r.score + '%' : ''}</td>
                <td>{r.kind === 'lesson' ? `${r.month}/${r.day}` : ''}</td>
                <td>{r.detail ? r.detail.attempt : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {rows.filter((r) => r.ok && r.detail).map((r) => (
        <StudentQuiz key={r.code} name={name} r={r} />
      ))}
      <p className="hint">The score is the best one the student chose to submit; they can retake quizzes as often as they like.</p>
    </section>
  );
}

function StudentQuiz({ name, r }) {
  const wk = weekByN[r.week];
  const questions = useMemo(() => (wk ? drawQuiz(r.week, r.detail.seed) : []), [wk, r.week, r.detail.seed]);
  if (!wk) return null;
  const right = questions.filter((q, i) => q.answer === r.detail.picks[i]).length;
  const matches = Math.round((right / questions.length) * 100) === r.score;
  return (
    <section className="student-quiz">
      <h2>
        Week {r.week} · {name} · {r.score}% · {r.month}/{r.day} · attempt {r.detail.attempt}
      </h2>
      {(r.detail.version !== QUIZ_VERSION || !matches) && (
        <p className="verdict wrong">
          This code was made with an older version of the quiz questions, so the questions below may not be exactly the ones the student saw.
        </p>
      )}
      <p className="muted">
        {right} of {questions.length} correct. Missed: {questions.filter((q, i) => q.answer !== r.detail.picks[i]).length || 'none'}.
      </p>
      <QuizReview questions={questions} picks={r.detail.picks} teacher />
    </section>
  );
}

function Unlock() {
  const [name, setName] = useState('');
  const [upTo, setUpTo] = useState(LESSON_ORDER[1]);
  return (
    <section className="panel">
      <p>Give a student a code that opens every week up to the one you choose, for example after an absence or on a new device.</p>
      <div className="row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Student first and last name" aria-label="Student name" />
        <select value={upTo} onChange={(e) => setUpTo(+e.target.value)} aria-label="Unlock up to">
          {LESSON_ORDER.slice(1).map((n) => (
            <option key={n} value={n}>
              Up to Week {n}
            </option>
          ))}
        </select>
      </div>
      {name.trim() && <CodeBox code={makeUnlock(name, upTo)} />}
    </section>
  );
}

// ───────────── Recording studio ─────────────
function Studio() {
  const published = useAudioSet();
  const [takes, setTakes] = useState({}); // id → Blob (wav), kept in IndexedDB between visits
  const [rec, setRec] = useState(null); // id being recorded
  const [group, setGroup] = useState(CLIPS[0].group);
  const [filter, setFilter] = useState('todo');
  const [voice, setVoice] = useState('all');
  const media = useRef(null);
  const ar = useAr();

  const [segs, setSegs] = useState({}); // syllable clips: id → [[start, end], …] found in the take
  const analyse = async (id, blob) => {
    if (!isSyllableClip(id)) return;
    const { rate, samples } = await readWav(blob);
    const found = findSegments(samples, rate);
    setSegs((x) => ({ ...x, [id]: found }));
  };
  useEffect(() => {
    idb.all().then((all) => {
      setTakes(all);
      for (const [id, b] of Object.entries(all)) analyse(id, b);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async (id) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const wav = await encodeWav(new Blob(chunks, { type: mr.mimeType }));
        await idb.put(id, wav);
        setTakes((t) => ({ ...t, [id]: wav }));
        analyse(id, wav);
        setRec(null);
      };
      mr.start();
      media.current = mr;
      setRec(id);
    } catch {
      alert('The microphone is not available. Allow microphone access for this page and try again.');
    }
  };
  const stop = () => media.current?.stop();
  const playTake = (id) => new Audio(URL.createObjectURL(takes[id])).play();
  const playPart = (id, [a, b]) => {
    const el = new Audio(URL.createObjectURL(takes[id]));
    el.addEventListener('loadedmetadata', () => {
      el.currentTime = a;
      el.play();
      setTimeout(() => el.pause(), (b - a) * 1000);
    }, { once: true });
  };
  const download = (id) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(takes[id]);
    a.download = id + '.wav';
    a.click();
  };
  const downloadAll = async () => {
    const files = await Promise.all(Object.entries(takes).map(async ([id, b]) => ({ name: id + '.wav', data: new Uint8Array(await b.arrayBuffer()) })));
    const zip = makeZip(files);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([zip], { type: 'application/zip' }));
    a.download = 'abjad-recordings.zip';
    a.click();
  };
  const forget = async (id) => {
    await idb.del(id);
    setTakes((t) => {
      const c = { ...t };
      delete c[id];
      return c;
    });
  };

  const groups = [...new Set(CLIPS.map((c) => c.group))];
  const voices = [...new Set(CLIPS.map((c) => c.who).filter(Boolean))];
  // A voice picks that character's comic lines from every week, so a guest reader can record all their lines at once.
  const list = CLIPS.filter((c) => (voice === 'all' ? c.group === group : c.who === voice)).filter((c) => (filter === 'all' ? true : filter === 'todo' ? !takes[c.id] && !published.has(c.id) : !!takes[c.id]));
  const total = CLIPS.length;
  const doneN = CLIPS.filter((c) => takes[c.id] || published.has(c.id)).length;

  return (
    <section className="panel studio">
      <p>
        Record each clip, check it, and re-record if needed. Takes stay in this browser until you download them. When you are ready, press{' '}
        <b>Download all</b>, unzip the files into <code>abjad/source/audio/</code>, and run <code>npm run audio</code>. The sound then switches on
        in the app for every clip you recorded.
      </p>
      <p>
        <b>
          {doneN} / {total}
        </b>{' '}
        clips recorded or published.{' '}
        <button className="btn" onClick={downloadAll} disabled={!Object.keys(takes).length}>
          Download all ({Object.keys(takes).length})
        </button>
      </p>
      <div className="row wrap">
        <select value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Group" disabled={voice !== 'all'}>
          {groups.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Show">
          <option value="todo">Still to record</option>
          <option value="done">Recorded here</option>
          <option value="all">All</option>
        </select>
        {voices.length > 0 && (
          <select value={voice} onChange={(e) => setVoice(e.target.value)} aria-label="Voice">
            <option value="all">Every voice (by group)</option>
            {voices.map((v) => (
              <option key={v} value={v}>
                Comic lines: {VOICES[v] || v}
              </option>
            ))}
          </select>
        )}
      </div>
      <ul className="clip-list">
        {list.map((c) => (
          <li key={c.id} className={takes[c.id] ? 'has' : published.has(c.id) ? 'pub' : ''}>
            <span className="clip-ar" lang="ar">{ar(c.ar)}</span>
            <span className="clip-en">
              {c.who && <b className="clip-who">{VOICES[c.who] || c.who}: </b>}
              {c.en} <code>{c.id}</code>
              {published.has(c.id) && <em> · published</em>}
              {isSyllableClip(c.id) && !takes[c.id] && <span className="clip-tip"> Pause about half a second between syllables.</span>}
            </span>
            {isSyllableClip(c.id) && takes[c.id] && segs[c.id] && (
              <span className={'clip-segs ' + (segs[c.id].length === expectedSyllables(c.id) ? 'good' : 'bad')}>
                {segs[c.id].length === expectedSyllables(c.id) ? (
                  <>
                    ✓ {segs[c.id].length} syllables found:{' '}
                    {segs[c.id].map((sg, k) => (
                      <button key={k} className="chip" onClick={() => playPart(c.id, sg)} aria-label={`Play syllable ${k + 1}`}>
                        ▶ {k + 1}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    ✗ Found {segs[c.id].length} syllables, expected {expectedSyllables(c.id)}. Re-record with a clear pause between each one.
                  </>
                )}
              </span>
            )}
            <span className="clip-btns">
              {rec === c.id ? (
                <button className="btn rec" onClick={stop}>■ Stop</button>
              ) : (
                <button className="btn" onClick={() => start(c.id)} disabled={!!rec}>● Record</button>
              )}
              {takes[c.id] && (
                <>
                  <button className="btn ghost" onClick={() => playTake(c.id)}>▶</button>
                  <button className="btn ghost" onClick={() => download(c.id)}>↓</button>
                  <button className="btn ghost" onClick={() => forget(c.id)} aria-label="Delete take">✕</button>
                </>
              )}
            </span>
          </li>
        ))}
        {!list.length && <li className="muted">Nothing here.</li>}
      </ul>
    </section>
  );
}
