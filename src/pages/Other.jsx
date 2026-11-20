import { useState } from 'react';
import { LETTERS, forms } from '../data/letters.js';
import { LESSON_ORDER } from '../data/weeks.js';
import { useStore, setName, checkCode, addUnlock, saveCode, markStep, isOpen, href } from '../lib.js';
import { Ar, Say, letterClip } from '../components/bits.jsx';
import { CodeBox } from '../components/Quiz.jsx';

export function Alphabet() {
  const s = useStore();
  // A letter counts as learned once its week is open.
  const learned = (l) => isOpen(s, l.week) && (s.steps?.[l.week]?.meet || s.codes?.[l.week]);
  const [sel, setSel] = useState(null);
  return (
    <div>
      <h1>The alphabet</h1>
      <p className="lead">
        All 28 letters in alphabet order. Letters you have met are highlighted. Tap a letter to see its four shapes. A small number shows the
        week you learn it.
      </p>
      <div className="abc" dir="rtl">
        {LETTERS.map((l) => (
          <button key={l.char} className={'abc-cell' + (learned(l) ? ' learned' : '') + (sel === l.char ? ' on' : '')} onClick={() => setSel(l.char)}>
            <span className="abc-l" lang="ar">{l.char}</span>
            <span className="abc-n">{l.nameEn}</span>
            <span className="abc-w">W{l.week}</span>
          </button>
        ))}
      </div>
      {sel && <AbcDetail c={sel} />}
    </div>
  );
}

function AbcDetail({ c }) {
  const l = LETTERS.find((x) => x.char === c);
  const f = forms(c);
  return (
    <div className="letter-card">
      <div className="lc-big" lang="ar">{c}</div>
      <div className="lc-info">
        <h2>
          <Ar>{l.name}</Ar> <span className="muted">· {l.nameEn} · Week {l.week}</span> <Say id={letterClip(c, 'ln')} />
        </h2>
        <p>{l.sound}</p>
        <p className={'joins ' + (l.joins ? 'yes' : 'no')}>{l.joins ? 'Joins on both sides.' : 'Never joins to the letter after it.'}</p>
      </div>
      <table className="forms">
        <thead>
          <tr><th>End</th><th>Middle</th><th>Start</th><th>Alone</th></tr>
        </thead>
        <tbody>
          <tr lang="ar"><td>{f.final}</td><td>{f.medial}</td><td>{f.initial}</td><td>{f.isolated}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export function Codes() {
  const s = useStore();
  const [name, setN] = useState(s.name || '');
  const [paste, setPaste] = useState('');
  const [msg, setMsg] = useState(null);
  const editing = !s.name || name !== s.name;
  const codes = Object.entries(s.codes || {}).sort((a, b) => a[0] - b[0]);

  const usePaste = () => {
    const r = checkCode(s.name, paste);
    if (!r.ok) {
      setMsg({ bad: true, t: r.kind === 'invalid' ? 'That doesn’t look like an Abjad code.' : 'That code doesn’t match your name. Check that your name is spelled exactly as when you earned it.' });
      return;
    }
    if (r.kind === 'unlock') {
      addUnlock(r.upTo);
      setMsg({ t: `Unlocked every week up to Week ${r.upTo}.` });
    } else {
      saveCode(r.week, { code: r.code, score: r.score, date: null });
      markStep(r.week, 'quiz');
      const nx = LESSON_ORDER[LESSON_ORDER.indexOf(r.week) + 1];
      setMsg({ t: `Restored Week ${r.week} (${r.score}%).${nx ? ` Week ${nx} is open.` : ''}` });
    }
    setPaste('');
  };

  return (
    <div className="narrow">
      <h1>My codes</h1>
      <section className="panel">
        <h2>Your name</h2>
        <p>Type your first and last name exactly as they appear in Canvas. Your name goes inside every code you earn.</p>
        <div className="row">
          <input value={name} onChange={(e) => setN(e.target.value)} placeholder="First Last" aria-label="Your first and last name" autoComplete="name" />
          <button className="btn" disabled={!name.trim() || !editing} onClick={() => setName(name)}>
            {s.name ? 'Change' : 'Save'}
          </button>
        </div>
        {s.name && name !== s.name && <p className="hint">Codes you earned under “{s.name}” won’t match a new name.</p>}
      </section>

      <section className="panel">
        <h2>Earned codes</h2>
        {codes.length ? (
          <ul className="code-list">
            {codes.map(([n, c]) => (
              <li key={n}>
                <span>Week {n} · {c.score}%</span>
                <CodeBox code={c.code} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No codes yet. Pass a lesson quiz (8 out of 10) to earn one.</p>
        )}
      </section>

      <section className="panel">
        <h2>New phone or computer?</h2>
        <p>
          Progress is saved in this browser only. On a new device, enter your name above, then paste a code you submitted in Canvas (or an unlock code
          from your teacher) to open your weeks again.
        </p>
        <div className="row">
          <input value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="W03-90-0220-XXXXXX" aria-label="Code" disabled={!s.name} />
          <button className="btn" disabled={!s.name || !paste.trim()} onClick={usePaste}>
            Use code
          </button>
        </div>
        {msg && <p className={'verdict ' + (msg.bad ? 'wrong' : 'right')}>{msg.t}</p>}
      </section>
      <p>
        <a href={href()}>‹ Back to the lessons</a>
      </p>
    </div>
  );
}
