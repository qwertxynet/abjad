import { useEffect, useMemo } from 'react';
import { Settings, useStore, setPref, useRoute, href } from './lib.js';
import Home from './pages/Home.jsx';
import Lesson from './pages/Lesson.jsx';
import { Alphabet, Codes } from './pages/Other.jsx';
import Teacher from './teacher/Teacher.jsx';

export default function App() {
  const store = useStore();
  const prefs = store.prefs || {};
  const settings = useMemo(() => ({ harakat: prefs.harakat !== false, size: prefs.size || 1 }), [prefs.harakat, prefs.size]);
  const { parts } = useRoute();
  useEffect(() => {
    document.documentElement.style.setProperty('--scale', settings.size);
  }, [settings.size]);

  let page;
  if (parts[0] === 'w' && parts[1]) page = <Lesson n={+parts[1]} step={parts[2]} />;
  else if (parts[0] === 'alphabet') page = <Alphabet />;
  else if (parts[0] === 'codes') page = <Codes />;
  else if (parts[0] === 'teacher') page = <Teacher tab={parts[1]} />;
  else page = <Home />;

  return (
    <Settings.Provider value={settings}>
      <Header settings={settings} section={parts[0] || 'home'} />
      {!store.name && parts[0] !== 'codes' && parts[0] !== 'teacher' && (
        <div className="banner">
          Welcome! First, <a href={href('codes')}>enter your name</a> so your quizzes can give you completion codes.
        </div>
      )}
      <main className="wrap">{page}</main>
      <footer className="foot wrap">
        Abjad · Arabic 120, Cuyamaca College · Spring 2027 · <a href={href('teacher')}>Teacher</a>
      </footer>
    </Settings.Provider>
  );
}

function Header({ settings, section }) {
  const sizes = [0.9, 1, 1.15, 1.3];
  const i = Math.max(0, sizes.indexOf(settings.size));
  return (
    <header className="topbar">
      <div className="wrap topbar-in">
        <a className="brand" href={href()}>
          <span className="brand-ar" lang="ar">أَبْجَد</span>
          <span className="brand-en">Abjad</span>
        </a>
        <nav className="nav" aria-label="Main">
          <a href={href()} className={section === 'home' || section === 'w' ? 'on' : ''}>Lessons</a>
          <a href={href('alphabet')} className={section === 'alphabet' ? 'on' : ''}>Alphabet</a>
          <a href={href('codes')} className={section === 'codes' ? 'on' : ''}>My codes</a>
        </nav>
        <div className="tools">
          <button
            className={'chip toggle' + (settings.harakat ? ' on' : '')}
            onClick={() => setPref('harakat', !settings.harakat)}
            aria-pressed={settings.harakat}
            title="Show or hide the vowel marks"
          >
            <span lang="ar">{settings.harakat ? 'حَرَكَات' : 'حركات'}</span>
          </button>
          <span className="chip-group" role="group" aria-label="Text size">
            <button className="chip" disabled={i === 0} onClick={() => setPref('size', sizes[i - 1])} aria-label="Smaller text">A−</button>
            <button className="chip" disabled={i === sizes.length - 1} onClick={() => setPref('size', sizes[i + 1])} aria-label="Larger text">A+</button>
          </span>
        </div>
      </div>
    </header>
  );
}
