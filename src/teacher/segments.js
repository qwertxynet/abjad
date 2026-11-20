// Finds the separate syllables in a syllable-drill recording (بَ … بُ … بِ … بَا … بُو … بِي) by looking for the
// pauses between them. Used by the recording studio (to check a take right away) and by `npm run audio`
// (to save where each syllable starts and ends). Pure function: no browser or Node APIs.

const FRAME = 0.02; // seconds per analysis frame
const MIN_GAP = 0.16; // a quieter stretch shorter than this is part of a syllable (stop consonants, glottal catches)
const MIN_SOUND = 0.07; // ignore clicks and breaths shorter than this
const PAD = 0.05; // keep a little silence around each syllable

/** How many syllables a letter's drill should contain (alif's drill is بَا دَا رَا زَا نَا: five). */
export const expectedSyllables = (clipId) => (clipId === 'ls-627' ? 5 : 6);
export const isSyllableClip = (clipId) => /^ls-/.test(clipId);

/**
 * @param {ArrayLike<number>} samples mono samples in −1…1
 * @param {number} rate sample rate
 * @returns {Array<[number, number]>} [start, end] of each syllable, in seconds
 */
export function findSegments(samples, rate) {
  const step = Math.max(1, Math.round(rate * FRAME));
  const frames = Math.floor(samples.length / step);
  const rms = new Float64Array(frames);
  let peak = 0;
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    for (let i = f * step; i < (f + 1) * step; i++) sum += samples[i] * samples[i];
    rms[f] = Math.sqrt(sum / step);
    if (rms[f] > peak) peak = rms[f];
  }
  if (!peak) return [];
  const on = Array.from(rms, (v) => v > Math.max(0.015, peak * 0.1));
  // Runs of sound.
  let runs = [];
  for (let f = 0; f < frames; f++) {
    if (!on[f]) continue;
    const s = f;
    while (f < frames && on[f]) f++;
    runs.push([s, f]);
  }
  // Merge runs separated by short gaps.
  const merged = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    if (last && (r[0] - last[1]) * FRAME < MIN_GAP) last[1] = r[1];
    else merged.push([...r]);
  }
  runs = merged.filter(([s, e]) => (e - s) * FRAME >= MIN_SOUND);
  const dur = samples.length / rate;
  return runs.map(([s, e]) => [Math.max(0, s * FRAME - PAD), Math.min(dur, e * FRAME + PAD)].map((x) => Math.round(x * 1000) / 1000));
}
