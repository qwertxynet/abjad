import { useEffect, useMemo, useRef } from 'react';
import { WEEKS, DATES, LESSON_ORDER } from '../data/weeks.js';
import { PLACES2 as PLACES } from '../art/places2.js';
import { useStore, isOpen, href, update } from '../lib.js';
import { Ar } from '../components/bits.jsx';
import { Character } from '../components/Characters.jsx';

// The neighbourhood map: one place per week along a dotted street, from Rana's house (Week 1) to the street party (Week 17).
const STOPS = [...LESSON_ORDER.slice(0, 8), 9, ...LESSON_ORDER.slice(8)]; // Week 9 is spring break
const ROW = 200;
const xAt = (i) => 50 + 30 * Math.sin(i * 1.15 + 0.4); // percent across

export default function Home() {
  const s = useStore();
  const current = LESSON_ORDER.find((n) => isOpen(s, n) && !s.codes?.[n]) ?? 17;
  const curRef = useRef(null);
  const fresh = useMemo(() => LESSON_ORDER.filter((n) => s.codes?.[n] && !s.stamped?.[n]), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    curRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
    if (fresh.length) {
      const t = setTimeout(() => update((x) => ({ ...x, stamped: { ...x.stamped, ...Object.fromEntries(fresh.map((n) => [n, true])) } })), 1500);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pts = STOPS.map((n, i) => [xAt(i), 70 + i * ROW]);
  const height = 70 + (STOPS.length - 1) * ROW + 120;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    d += ` C${x0} ${y0 + ROW * 0.55} ${x1} ${y1 - ROW * 0.55} ${x1} ${y1}`;
  }
  const cw = WEEKS.find((w) => w.n === current);

  return (
    <div className="home">
      <section className="welcome">
        <div className="welcome-cast" aria-hidden="true">
          <Character who="nader" mood="smile" size={92} />
          <Character who="rana" mood="smile" size={92} />
        </div>
        <div className="welcome-text">
          <Ar as="h1" className="welcome-ar">مَرْحَبًا{s.name ? '' : '!'}</Ar>
          <p className="welcome-en">
            {s.name ? <>Welcome back, <b>{s.name.split(' ')[0]}</b>.</> : 'Welcome to Abjad.'} Nader and Rana are waiting at{' '}
            <b>{PLACES[current].name}</b>.
          </p>
          <a className="btn" href={href('w', current)}>
            {s.codes?.[1] || s.steps?.[1] ? 'Continue' : 'Start'} · Week {current} <Ar className="btn-ar">{cw.title}</Ar>
          </a>
        </div>
      </section>

      <section className="map" style={{ height }} aria-label="The neighbourhood: your weekly lessons">
        <svg className="map-route" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={d} className="route-wash" vectorEffect="non-scaling-stroke" />
          <path d={d} className="route" vectorEffect="non-scaling-stroke" />
        </svg>
        {STOPS.map((n, i) => {
          const [x, y] = pts[i];
          const w = WEEKS.find((k) => k.n === n);
          const place = PLACES[n];
          const recess = n === 9;
          const open = !recess && isOpen(s, n);
          const passed = !!s.codes?.[n];
          const here = n === current;
          const side = x > 50 ? 'left' : 'right';
          const body = (
            <>
              <picture>
                <source media="(prefers-color-scheme: dark)" srcSet={`./places/${n}-night.webp`} />
                <img className="place-art" src={`./places/${n}-day.webp`} alt="" width="480" height="400" loading={i < 6 ? 'eager' : 'lazy'} draggable="false" />
              </picture>
              <span className={'stop-label ' + side}>
                <span className="stop-week">{recess ? 'Mar 29 – Apr 4' : `Week ${n} · ${DATES[n][0]}`}</span>
                <span className="stop-name">{place.name}</span>
                {w && <Ar className={'stop-title' + (w.part === 1 ? ' letters' : '')}>{w.title}</Ar>}
              </span>
              {passed && (
                <span className={'stamp' + (fresh.includes(n) ? ' fresh' : '')} aria-label="Passed">
                  <span>✓</span>
                  <small>WEEK {n}</small>
                </span>
              )}
              {!open && !recess && <span className="lock" aria-label="Locked">🔒</span>}
            </>
          );
          return (
            <div key={n} className={'stop' + (open ? ' open' : ' closed') + (here ? ' here' : '') + (recess ? ' recess' : '')} style={{ left: `${x}%`, top: y }} ref={here ? curRef : null}>
              {open ? (
                <a href={href('w', n)} aria-label={`Week ${n}: ${place.name}${passed ? ', passed' : ''}`}>
                  {body}
                </a>
              ) : (
                <div aria-label={recess ? 'Spring break' : `Week ${n}: locked`}>{body}</div>
              )}
              {here && (
                <span className={'stop-cast ' + side} aria-hidden="true">
                  <Character who="nader" mood="smile" size={54} />
                  <Character who="rana" mood="smile" size={54} />
                </span>
              )}
            </div>
          );
        })}
      </section>

      <p className="home-links">
        <a className="btn ghost" href={href('alphabet')}>Alphabet chart</a>
        <a className="btn ghost" href={href('codes')}>My codes</a>
      </p>
    </div>
  );
}
