import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LESSON_ORDER, prevLesson } from './data/weeks.js';

// ---------- Tashkeel ----------
const HARAKAT = /[ً-ْٰـ]/g;
export const strip = (s) => (s || '').replace(HARAKAT, '');
export const norm = (s) => strip(s).replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/[«»"'،.؛:!?؟…\-–—()]/g, '').trim();

// ---------- Settings ----------
export const Settings = createContext({ harakat: true, size: 1 });
export const useSettings = () => useContext(Settings);
/** Shows Arabic with or without tashkeel, depending on the switch. Tatweel (ـ) is kept for letter forms. */
export function useAr() {
  const { harakat } = useSettings();
  return useCallback((s) => (harakat ? s : (s || '').replace(/[ً-ْٰ]/g, '')), [harakat]);
}

// ---------- Storage ----------
const KEY = 'abjad-v1';
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
let state = load();
const listeners = new Set();
export function update(fn) {
  state = fn(structuredClone(state));
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: progress lasts for this visit only */
  }
  listeners.forEach((l) => l(state));
}
export function useStore() {
  const [s, set] = useState(state);
  useEffect(() => {
    listeners.add(set);
    return () => listeners.delete(set);
  }, []);
  return s;
}
export const getState = () => state;
export const setPref = (k, v) => update((s) => ({ ...s, prefs: { ...s.prefs, [k]: v } }));
export const setName = (name) => update((s) => ({ ...s, name: name.trim().replace(/\s+/g, ' ') }));
export const markStep = (n, step) =>
  update((s) => ({ ...s, steps: { ...s.steps, [n]: { ...(s.steps?.[n] || {}), [step]: true } } }));
export const saveCode = (n, entry) => update((s) => ({ ...s, codes: { ...s.codes, [n]: entry } }));
/** Counts a finished quiz attempt for week n and returns the new count. */
export function countAttempt(n) {
  let k = 1;
  update((s) => {
    k = (s.attempts?.[n] || 0) + 1;
    return { ...s, attempts: { ...s.attempts, [n]: k } };
  });
  return k;
}
export const addUnlock = (upTo) => update((s) => ({ ...s, unlockedTo: Math.max(s.unlockedTo || 1, upTo) }));

/** Lesson n is open if it is Week 1, its previous lesson's quiz was passed, or an unlock covers it. */
export function isOpen(s, n) {
  if (n === LESSON_ORDER[0]) return true;
  if ((s.unlockedTo || 0) >= n) return true;
  const p = prevLesson(n);
  return !!s.codes?.[p];
}

// ---------- Routing (hash) ----------
function parse() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [path, q] = h.split('?');
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(q || '') };
}
export function useRoute() {
  const [r, set] = useState(parse);
  useEffect(() => {
    const on = () => {
      set(parse());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}
export const href = (...p) => '#/' + p.filter((x) => x !== undefined && x !== null).join('/');
export const go = (...p) => {
  location.hash = href(...p);
};

// ---------- Audio (the teacher's own recordings) ----------
let available = new Set();
const audioListeners = new Set();
fetch('./audio/manifest.json', { cache: 'no-cache' })
  .then((r) => (r.ok ? r.json() : []))
  .then((list) => {
    available = new Set(list);
    audioListeners.forEach((l) => l(available));
  })
  .catch(() => {});
export function useAudioSet() {
  const [a, set] = useState(available);
  useEffect(() => {
    audioListeners.add(set);
    return () => audioListeners.delete(set);
  }, []);
  return a;
}
export const hasAudio = (id) => available.has(id);

// Where each syllable sits inside a syllable-drill clip: { 'ls-628': [[start, end], …] } in seconds.
let segments = {};
fetch('./audio/segments.json', { cache: 'no-cache' })
  .then((r) => (r.ok ? r.json() : {}))
  .then((j) => {
    segments = j || {};
    available = new Set(available); // a new object, so components re-render
    audioListeners.forEach((l) => l(available));
  })
  .catch(() => {});
/** True when syllable i of a drill clip can be played on its own. */
export const hasSegment = (id, i) => available.has(id) && !!segments[id]?.[i];

let current = null;
let stopTimer = null;
const players = {};
const stop = () => {
  clearTimeout(stopTimer);
  clearInterval(stopTimer);
  if (current) current.pause();
};
export function play(id) {
  if (!available.has(id)) return false;
  stop();
  current = new Audio(`./audio/${id}.mp3`);
  current.play().catch(() => {});
  return true;
}
/** Plays a list of clips one after another (skipping any not recorded yet). onEach(i) fires as clip i starts; onEnd when all are done. */
export function playList(ids, { onEach, onEnd } = {}) {
  stop();
  let k = 0;
  const next = () => {
    while (k < ids.length && !available.has(ids[k])) k++;
    if (k >= ids.length) return onEnd?.();
    const i = k++;
    onEach?.(i);
    const a = new Audio(`./audio/${ids[i]}.mp3`);
    current = a;
    a.addEventListener('ended', () => current === a && setTimeout(next, 350), { once: true });
    a.play().catch(() => onEnd?.());
  };
  next();
  return () => {
    k = ids.length;
    stop();
  };
}
/** Plays one syllable of a drill clip (one MP3, played from its start to its end time). */
export function playSegment(id, i) {
  const seg = segments[id]?.[i];
  if (!available.has(id) || !seg) return false;
  stop();
  const a = (players[id] ||= new Audio(`./audio/${id}.mp3`));
  current = a;
  const go = () => {
    a.currentTime = seg[0];
    a.play().catch(() => {});
    // Watch the real playback position (playback can stall briefly after a seek) and stop at the syllable's end.
    const started = Date.now();
    stopTimer = setInterval(() => {
      if (a.currentTime >= seg[1] || a.paused || Date.now() - started > 5000) {
        clearInterval(stopTimer);
        a.pause();
      }
    }, 15);
  };
  if (a.readyState >= 1) go();
  else a.addEventListener('loadedmetadata', go, { once: true });
  return true;
}
/** Plays a question's sound: a whole clip, or one syllable when the question names a segment. */
export const playQ = (q) => (q.seg !== undefined ? playSegment(q.audio, q.seg) : play(q.audio));
export const canPlayQ = (q) => !!q.audio && (q.seg !== undefined ? hasSegment(q.audio, q.seg) : hasAudio(q.audio));

// ---------- Completion and unlock codes ----------
// Not secure (anything in a static site can be read), but enough to stop casual copying between students.
const SECRET = 'abjad·120·خلدونية';
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const normName = (n) => (n || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z؀-ۿ]+/g, ' ').trim();
function fnv(str) {
  let h = 0x811c9dc5;
  for (const ch of str) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
function sig(str) {
  let a = fnv(SECRET + '|' + str);
  let b = fnv(str + '|' + SECRET + a);
  let out = '';
  for (let i = 0; i < 6; i++) {
    const v = i < 3 ? a : b;
    out += B32[(v >>> ((i % 3) * 5)) & 31];
  }
  return out;
}
const pad = (n, k = 2) => String(n).padStart(k, '0');

// Answer details: quiz version (3 bits) · attempt (5 bits, 1–31) · seed (24 bits) · ten picks (2 bits each) = 52 bits,
// written as 11 base-32 characters.
function packDetail({ version, attempt, seed, picks }) {
  let v = BigInt(version & 7);
  v = (v << 5n) | BigInt(Math.min(Math.max(attempt, 1), 31));
  v = (v << 24n) | BigInt(seed & 0xffffff);
  for (let i = 0; i < 10; i++) v = (v << 2n) | BigInt((picks[i] ?? 0) & 3);
  let out = '';
  for (let i = 0; i < 11; i++) {
    out = B32[Number(v & 31n)] + out;
    v >>= 5n;
  }
  return out;
}
function unpackDetail(str) {
  let v = 0n;
  for (const ch of str) v = (v << 5n) | BigInt(B32.indexOf(ch));
  const picks = [];
  for (let i = 0; i < 10; i++) {
    picks.unshift(Number(v & 3n));
    v >>= 2n;
  }
  const seed = Number(v & 0xffffffn);
  v >>= 24n;
  const attempt = Number(v & 31n);
  v >>= 5n;
  return { version: Number(v & 7n), attempt, seed, picks };
}

/** W03-80-0220-DDDDDDDDDDD-SSSSSS : week, score %, month+day, answer details, signature over the student's name. */
export function makeCode(name, week, score, detail, date = new Date()) {
  const md = pad(date.getMonth() + 1) + pad(date.getDate());
  const body = `W${pad(week)}-${pad(score, 2)}-${md}-${packDetail(detail)}`;
  return `${body}-${sig(normName(name) + '|' + body)}`;
}
/** U08-ABCDEF : opens every lesson up to Week 8 for this student. */
export const makeUnlock = (name, upTo) => {
  const body = `U${pad(upTo)}`;
  return `${body}-${sig(normName(name) + '|' + body)}`;
};
const CODE_RE = /^W(\d{2})-(\d{2,3})-(\d{2})(\d{2})-(?:([0-9A-Z]{11})-)?([0-9A-Z]{6})$/;
const UNLOCK_RE = /^U(\d{2})-([0-9A-Z]{6})$/;
export function checkCode(name, raw) {
  const code = (raw || '').trim().toUpperCase().replace(/\s+/g, '');
  let m = code.match(CODE_RE);
  if (m) {
    const body = code.slice(0, code.lastIndexOf('-'));
    const ok = sig(normName(name) + '|' + body) === m[6];
    return { kind: 'lesson', ok, week: +m[1], score: +m[2], month: +m[3], day: +m[4], detail: m[5] ? unpackDetail(m[5]) : null, code };
  }
  m = code.match(UNLOCK_RE);
  if (m) {
    const ok = sig(normName(name) + '|' + `U${m[1]}`) === m[2];
    return { kind: 'unlock', ok, upTo: +m[1], code };
  }
  return { kind: 'invalid', ok: false, code };
}

// Teacher password (stored as a SHA-256 hash).
const TEACHER_HASH = 'a5126530e71586e255d5cc2eb1da82a7f8c91cd05ce3239aa648b0594a5583e9';
export async function checkPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw.trim()));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex === TEACHER_HASH;
}

// ---------- Small helpers ----------
export const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};
export const sample = (a, k) => shuffle(a).slice(0, k);
export const pick = (a) => a[Math.floor(Math.random() * a.length)];

/** Splits Arabic text into letters, each with its own marks: "دَار" → ["دَ", "ا", "ر"]. */
export function splitLetters(word) {
  const out = [];
  for (const ch of word) {
    if (/[ً-ْٰ]/.test(ch) && out.length) out[out.length - 1] += ch;
    else if (ch === ' ') out.push(' ');
    else out.push(ch);
  }
  return out;
}
export const baseLetter = (seg) => strip(seg).replace(/[ٱ]/, 'ا');
