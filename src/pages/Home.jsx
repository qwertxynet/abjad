import { WEEKS, DATES } from '../data/weeks.js';
import { useStore, isOpen, href } from '../lib.js';
import { Ar, Pic } from '../components/bits.jsx';

export default function Home() {
  const s = useStore();
  const parts = [
    { n: 1, title: 'Part 1 · The letters', sub: <>In the way of <bdi lang="ar" className="inline-ar">القراءة الخلدونية</bdi>, each week adds a few letters, and you read only real words made from letters you already know.</> },
    { n: 2, title: 'Part 2 · Daily life in Arabic', sub: 'Numbers, days and seasons, colours, family, food, your day, and the Arab world.' },
    { n: 3, title: 'Review', sub: 'Practice for the final exam.' },
  ];
  return (
    <div className="home">
      <section className="hero">
        <Ar as="h1" className="hero-ar">أَبْجَد</Ar>
        <p className="hero-en">Arabic 120 · Learn to read, write and understand Arabic, one letter at a time.</p>
        {s.name && <p className="hero-name">Signed in as <b>{s.name}</b> · <a href={href('codes')}>My codes</a></p>}
      </section>
      {parts.map((p) => (
        <section key={p.n} className="part">
          <h2>{p.title}</h2>
          <p className="part-sub">{p.sub}</p>
          <ol className="path">
            {WEEKS.filter((w) => w.part === p.n).map((w) => {
              const open = isOpen(s, w.n);
              const passed = !!s.codes?.[w.n];
              const first = w.words?.find((x) => x.pic);
              return (
                <li key={w.n} className={'lesson-card' + (open ? '' : ' locked') + (passed ? ' passed' : '')}>
                  <a href={open ? href('w', w.n) : undefined} aria-disabled={!open} tabIndex={open ? 0 : -1}>
                    <span className="lc-week">
                      Week {w.n}
                      <small>
                        {DATES[w.n][0]} – {DATES[w.n][1]}
                      </small>
                    </span>
                    <span className="lc-main">
                      <Ar className={'lc-title' + (w.part === 1 ? ' letters' : '')}>{w.title}</Ar>
                      <span className="lc-en">
                        {w.titleEn}
                        {w.online && <em> · online week</em>}
                        {w.test && <em> · Test {w.test} in class</em>}
                      </span>
                    </span>
                    {first && <Pic id={first.pic} size={46} className="lc-pic" />}
                    <span className="lc-state" aria-label={passed ? 'Passed' : open ? 'Open' : 'Locked'}>
                      {passed ? '✓' : open ? '›' : '🔒'}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      <p className="home-links">
        <a className="btn ghost" href={href('alphabet')}>Alphabet chart</a>
        <a className="btn ghost" href={href('codes')}>My codes</a>
      </p>
    </div>
  );
}
