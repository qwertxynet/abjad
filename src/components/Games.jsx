import { useMemo, useState } from 'react';
import { WEEKS } from '../data/weeks.js';
import { LETTERS, byChar, forms } from '../data/letters.js';
import { shuffle, sample, strip, splitLetters, useAr, useAudioSet, play } from '../lib.js';
import { Ar, Pic } from './bits.jsx';

// Finish any two games to complete the PLAY step.
export default function Games({ wk, onDone }) {
  const audio = useAudioSet();
  const [game, setGame] = useState(null);
  const [won, setWon] = useState(new Set());
  const p1 = wk.part === 1;
  const list = p1
    ? [
        { id: 'hunt', label: 'Letter hunt', desc: 'Find the words that contain the letter.' },
        { id: 'forms', label: 'Match the forms', desc: 'Pair each letter with one of its shapes.' },
        { id: 'build', label: 'Build the word', desc: 'Put the letters together to spell the word.' },
      ]
    : [
        { id: 'pairs', label: 'Match pairs', desc: 'Match each Arabic word with its meaning.' },
        { id: 'picture', label: 'Picture pick', desc: 'Choose the word for the picture.' },
      ];
  const hasListen = wk.words.some((w) => audio.has('w-' + w.id));
  if (hasListen) list.push({ id: 'listen', label: 'Listen and pick', desc: 'Hear a word and choose it.' });
  const win = (id) => {
    setWon(new Set([...won, id]));
    setGame(null);
  };
  if (game) {
    const props = { wk, onWin: () => win(game), onQuit: () => setGame(null) };
    return (
      <div className="game">
        {game === 'hunt' && <Hunt {...props} />}
        {game === 'forms' && <MatchForms {...props} />}
        {game === 'build' && <Build {...props} />}
        {game === 'pairs' && <Pairs {...props} />}
        {game === 'picture' && <PicturePick {...props} />}
        {game === 'listen' && <Listen {...props} />}
      </div>
    );
  }
  return (
    <>
      <p className="lead">Play any two games to finish this step ({Math.min(won.size, 2)}/2). Play as often as you like.</p>
      <ul className="game-list">
        {list.map((g) => (
          <li key={g.id}>
            <button className={'game-card' + (won.has(g.id) ? ' won' : '')} onClick={() => setGame(g.id)}>
              <b>{g.label}</b>
              <span>{g.desc}</span>
              {won.has(g.id) && <span className="won-mark">★</span>}
            </button>
          </li>
        ))}
      </ul>
      <div className="next-row">
        <button className="btn" disabled={won.size < 2} onClick={onDone}>
          Next step ›
        </button>
      </div>
    </>
  );
}

function Head({ title, onQuit, children }) {
  return (
    <div className="game-head">
      <h2>{title}</h2>
      {children}
      <button className="btn ghost" onClick={onQuit}>
        ‹ Games
      </button>
    </div>
  );
}

function Won({ onWin, text = 'Well done!' }) {
  return (
    <div className="won-box">
      <p>★ {text}</p>
      <button className="btn" onClick={onWin}>
        Back to the games
      </button>
    </div>
  );
}

const knownWords = (wk) => WEEKS.filter((x) => x.part === 1 && x.n <= wk.n).flatMap((x) => x.words);

function Hunt({ wk, onWin, onQuit }) {
  const ar = useAr();
  const rounds = useMemo(
    () =>
      wk.newLetters.map((c) => {
        const all = knownWords(wk);
        const yes = sample(all.filter((w) => strip(w.ar).includes(c)), 3);
        const no = sample(all.filter((w) => !strip(w.ar).includes(c)), 8 - yes.length);
        return { c, cards: shuffle([...yes, ...no]) };
      }).filter((r) => r.cards.some((w) => strip(w.ar).includes(r.c))),
    [wk]
  );
  const [r, setR] = useState(0);
  const [picked, setPicked] = useState({});
  if (!rounds.length) return <Won onWin={onWin} />;
  if (r >= rounds.length) return <Won onWin={onWin} text="You found them all!" />;
  const { c, cards } = rounds[r];
  const need = cards.filter((w) => strip(w.ar).includes(c)).length;
  const got = cards.filter((w) => picked[w.id] && strip(w.ar).includes(c)).length;
  return (
    <>
      <Head title="Letter hunt" onQuit={onQuit}>
        <p>
          Tap every word that has <span className="big-letter" lang="ar">{c}</span> in it ({byChar[c]?.nameEn}). Remember its shapes:{' '}
          <span lang="ar" className="forms-inline">{Object.values(forms(c) || {}).join('  ')}</span>
        </p>
      </Head>
      <div className="card-grid">
        {cards.map((w) => {
          const has = strip(w.ar).includes(c);
          const st = picked[w.id] ? (has ? ' right' : ' wrong') : '';
          return (
            <button key={w.id} className={'opt big' + st} onClick={() => setPicked({ ...picked, [w.id]: true })}>
              <span lang="ar">{ar(w.ar)}</span>
            </button>
          );
        })}
      </div>
      <div className="next-row">
        <span className="muted">
          {got}/{need} found
        </span>
        <button className="btn" disabled={got < need} onClick={() => { setR(r + 1); setPicked({}); }}>
          Next ›
        </button>
      </div>
    </>
  );
}

function MatchForms({ wk, onWin, onQuit }) {
  const pool = LETTERS.filter((l) => l.week <= wk.n);
  const chosen = useMemo(() => {
    const fresh = wk.newLetters.map((c) => byChar[c]);
    const extra = sample(pool.filter((l) => !wk.newLetters.includes(l.char)), Math.max(0, 5 - fresh.length));
    return shuffle([...fresh, ...extra]).slice(0, 5).map((l) => {
      const f = forms(l.char);
      const pos = l.joins ? ['initial', 'medial', 'final'][Math.floor(Math.random() * 3)] : 'final';
      return { c: l.char, shape: f[pos] };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wk]);
  const right = useMemo(() => shuffle(chosen), [chosen]);
  const [sel, setSel] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [bad, setBad] = useState(null);
  if (matched.size === chosen.length) return <Won onWin={onWin} />;
  const tryMatch = (c) => {
    if (!sel) return;
    if (sel === c) {
      setMatched(new Set([...matched, c]));
      setSel(null);
    } else {
      setBad(c);
      setTimeout(() => setBad(null), 600);
      setSel(null);
    }
  };
  return (
    <>
      <Head title="Match the forms" onQuit={onQuit}>
        <p>Tap a letter, then the shape it takes inside a word.</p>
      </Head>
      <div className="match">
        <div className="col">
          {chosen.map((x) => (
            <button key={x.c} className={'opt big' + (matched.has(x.c) ? ' right' : sel === x.c ? ' sel' : '')} disabled={matched.has(x.c)} onClick={() => setSel(x.c)}>
              <span lang="ar">{x.c}</span>
            </button>
          ))}
        </div>
        <div className="col">
          {right.map((x) => (
            <button key={x.c} className={'opt big' + (matched.has(x.c) ? ' right' : bad === x.c ? ' wrong' : '')} disabled={matched.has(x.c)} onClick={() => tryMatch(x.c)}>
              <span lang="ar">{x.shape}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Build({ wk, onWin, onQuit }) {
  const ar = useAr();
  const words = useMemo(() => sample(wk.words.filter((w) => splitLetters(strip(w.ar)).length <= 7 && !w.ar.includes(' ')), 4), [wk]);
  const [i, setI] = useState(0);
  const [built, setBuilt] = useState([]);
  const w = words[i];
  const segs = useMemo(() => (w ? splitLetters(strip(w.ar)) : []), [w]);
  const tiles = useMemo(() => {
    if (!w) return [];
    const extra = sample(LETTERS.filter((l) => l.week <= wk.n && !segs.includes(l.char)).map((l) => l.char), 2);
    return shuffle([...segs, ...extra].map((t, k) => ({ t, k })));
  }, [w, segs, wk]);
  if (!w) return <Won onWin={onWin} text="You built every word!" />;
  const word = built.map((k) => tiles.find((x) => x.k === k).t).join('');
  const right = word === segs.join('');
  return (
    <>
      <Head title="Build the word" onQuit={onQuit}>
        <p>Tap the letters from right to left. Watch them join together as you go.</p>
      </Head>
      <div className="build-target">
        <Pic id={w.pic} size={80} />
        <span>{w.en}</span>
      </div>
      <div className="built big" dir="rtl" lang="ar" aria-live="polite">
        {word ? <span className="built-word">{word}</span> : <span className="placeholder">…</span>}
      </div>
      <div className="pool" dir="rtl" lang="ar">
        {tiles.map(({ t, k }) => (
          <button key={k} className="tok big" disabled={built.includes(k)} onClick={() => setBuilt([...built, k])}>
            {t}
          </button>
        ))}
      </div>
      <div className="next-row">
        <button className="btn ghost" onClick={() => setBuilt(built.slice(0, -1))} disabled={!built.length}>
          Undo
        </button>
        {right ? (
          <button className="btn" onClick={() => { setI(i + 1); setBuilt([]); }}>
            ✓ <span lang="ar">{ar(w.ar)}</span> · Next ›
          </button>
        ) : (
          built.length >= segs.length && <span className="verdict wrong">Not quite. Undo and try again.</span>
        )}
      </div>
    </>
  );
}

function Pairs({ wk, onWin, onQuit }) {
  const set = useMemo(() => sample(wk.words, 6), [wk]);
  const left = useMemo(() => shuffle(set), [set]);
  const right = useMemo(() => shuffle(set), [set]);
  const [sel, setSel] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [bad, setBad] = useState(null);
  const ar = useAr();
  if (matched.size === set.length) return <Won onWin={onWin} />;
  return (
    <>
      <Head title="Match pairs" onQuit={onQuit}>
        <p>Tap an Arabic word, then its meaning.</p>
      </Head>
      <div className="match">
        <div className="col">
          {left.map((w) => (
            <button key={w.id} className={'opt' + (matched.has(w.id) ? ' right' : sel === w.id ? ' sel' : '')} disabled={matched.has(w.id)} onClick={() => setSel(w.id)}>
              <span lang="ar" className="ar">{ar(w.ar)}</span>
            </button>
          ))}
        </div>
        <div className="col">
          {right.map((w) => (
            <button
              key={w.id}
              className={'opt' + (matched.has(w.id) ? ' right' : bad === w.id ? ' wrong' : '')}
              disabled={matched.has(w.id)}
              onClick={() => {
                if (!sel) return;
                if (sel === w.id) setMatched(new Set([...matched, w.id]));
                else {
                  setBad(w.id);
                  setTimeout(() => setBad(null), 600);
                }
                setSel(null);
              }}
            >
              {w.en}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function PicturePick({ wk, onWin, onQuit }) {
  const words = wk.words.filter((w) => w.pic);
  const rounds = useMemo(() => sample(words, Math.min(6, words.length)), [wk]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [pickd, setPickd] = useState(null);
  const ar = useAr();
  const opts = useMemo(() => (rounds[i] ? shuffle([rounds[i], ...sample(words.filter((w) => w.id !== rounds[i].id && w.en !== rounds[i].en), 3)]) : []), [i, rounds]); // eslint-disable-line react-hooks/exhaustive-deps
  if (i >= rounds.length) return <Won onWin={onWin} />;
  const w = rounds[i];
  return (
    <>
      <Head title="Picture pick" onQuit={onQuit}>
        <p>Which word goes with the picture?</p>
      </Head>
      <div className="build-target">
        <Pic id={w.pic} size={110} />
      </div>
      <div className="card-grid">
        {opts.map((o) => (
          <button
            key={o.id}
            className={'opt big' + (pickd === o.id ? (o.id === w.id ? ' right' : ' wrong') : '')}
            onClick={() => {
              setPickd(o.id);
              if (o.id === w.id) setTimeout(() => { setI(i + 1); setPickd(null); }, 700);
            }}
          >
            <span lang="ar">{ar(o.ar)}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Listen({ wk, onWin, onQuit }) {
  const audio = useAudioSet();
  const words = wk.words.filter((w) => audio.has('w-' + w.id));
  const rounds = useMemo(() => sample(words, Math.min(6, words.length)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [pickd, setPickd] = useState(null);
  const ar = useAr();
  const opts = useMemo(() => (rounds[i] ? shuffle([rounds[i], ...sample(wk.words.filter((w) => w.id !== rounds[i].id), 3)]) : []), [i, rounds, wk]);
  if (i >= rounds.length) return <Won onWin={onWin} />;
  const w = rounds[i];
  return (
    <>
      <Head title="Listen and pick" onQuit={onQuit}>
        <p>Press play, then choose the word you hear.</p>
      </Head>
      <div className="next-row center">
        <button className="btn" onClick={() => play('w-' + w.id)}>▶ Play</button>
      </div>
      <div className="card-grid">
        {opts.map((o) => (
          <button
            key={o.id}
            className={'opt big' + (pickd === o.id ? (o.id === w.id ? ' right' : ' wrong') : '')}
            onClick={() => {
              setPickd(o.id);
              if (o.id === w.id) setTimeout(() => { setI(i + 1); setPickd(null); }, 700);
            }}
          >
            <span lang="ar">{ar(o.ar)}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export { Ar };
