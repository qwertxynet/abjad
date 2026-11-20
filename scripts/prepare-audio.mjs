// Converts the teacher's recordings (source/audio/*.wav, from the app's recording studio) into small MP3s in
// public/audio/, and rewrites public/audio/manifest.json, the list of clips the app may play.
// For the syllable drills (ls-*.wav) it also finds the pauses between syllables and writes
// public/audio/segments.json, so the app can play each syllable on its own.
// Run with: npm run audio
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { findSegments, expectedSyllables, isSyllableClip } from '../src/teacher/segments.js';
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// lamejs's CommonJS entry has a known "MPEGMode is not defined" bug; its single-file bundle works.
const ctx = {};
vm.runInNewContext(fs.readFileSync(require.resolve('lamejs/lame.all.js'), 'utf8'), ctx);
const lamejs = ctx.lamejs;

const SRC = path.join(__dirname, '..', 'source', 'audio');
const OUT = path.join(__dirname, '..', 'public', 'audio');
fs.mkdirSync(SRC, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

function readWav(file) {
  const buf = fs.readFileSync(file);
  let off = 12;
  let fmt, data;
  while (off < buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') fmt = { channels: buf.readUInt16LE(off + 10), rate: buf.readUInt32LE(off + 12), bits: buf.readUInt16LE(off + 22) };
    if (id === 'data') data = buf.subarray(off + 8, off + 8 + size);
    off += 8 + size + (size % 2);
  }
  if (!fmt || !data || fmt.bits !== 16) throw new Error('Unsupported WAV (need 16-bit PCM): ' + file);
  const frames = data.length / (2 * fmt.channels);
  const mono = new Int16Array(frames);
  for (let i = 0; i < frames; i++) {
    let s = 0;
    for (let c = 0; c < fmt.channels; c++) s += data.readInt16LE((i * fmt.channels + c) * 2);
    mono[i] = Math.round(s / fmt.channels);
  }
  return { rate: fmt.rate, samples: mono };
}

const RATES = [48000, 44100, 32000, 24000, 22050, 16000];
function toMp3({ rate, samples }) {
  if (!RATES.includes(rate)) throw new Error('Unsupported sample rate ' + rate);
  const enc = new lamejs.Mp3Encoder(1, rate, 64);
  const parts = [];
  for (let i = 0; i < samples.length; i += 1152) {
    const b = enc.encodeBuffer(samples.subarray(i, i + 1152));
    if (b.length) parts.push(Buffer.from(b));
  }
  const end = enc.flush();
  if (end.length) parts.push(Buffer.from(end));
  return Buffer.concat(parts);
}

let made = 0;
const segFile = path.join(OUT, 'segments.json');
const segments = fs.existsSync(segFile) ? JSON.parse(fs.readFileSync(segFile, 'utf8')) : {};
const problems = [];
for (const f of fs.readdirSync(SRC).filter((f) => f.toLowerCase().endsWith('.wav'))) {
  const id = f.replace(/\.wav$/i, '');
  const out = path.join(OUT, id + '.mp3');
  const src = path.join(SRC, f);
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs && (!isSyllableClip(id) || segments[id])) continue;
  const wav = readWav(src);
  fs.writeFileSync(out, toMp3(wav));
  made++;
  if (isSyllableClip(id)) {
    const segs = findSegments(Float32Array.from(wav.samples, (v) => v / 32768), wav.rate);
    if (segs.length === expectedSyllables(id)) segments[id] = segs;
    else {
      delete segments[id];
      problems.push(`${id}: found ${segs.length} syllables, expected ${expectedSyllables(id)}. Re-record it with a clear pause between syllables.`);
    }
  }
}
fs.writeFileSync(segFile, JSON.stringify(segments));
const list = fs.readdirSync(OUT).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).sort();
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(list));
console.log(`Converted ${made} new recording(s). ${list.length} clip(s) are now live in the app; ${Object.keys(segments).length} syllable drill(s) can be played one syllable at a time.`);
for (const p of problems) console.warn('! ' + p);
