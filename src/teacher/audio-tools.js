// Recording helpers for the studio: WAV encoding, a tiny ZIP writer, and IndexedDB storage for takes.

/** Decodes any recorded blob and re-encodes it as 16-bit mono WAV, trimming silence at both ends. */
export async function encodeWav(blob) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
  ctx.close();
  const rate = buf.sampleRate;
  const ch = buf.numberOfChannels;
  const len = buf.length;
  const mono = new Float32Array(len);
  for (let c = 0; c < ch; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) mono[i] += d[i] / ch;
  }
  // Trim silence (keep 0.15 s around the sound).
  const thr = 0.02;
  let a = 0;
  let b = len - 1;
  while (a < len && Math.abs(mono[a]) < thr) a++;
  while (b > a && Math.abs(mono[b]) < thr) b--;
  const padS = Math.floor(rate * 0.15);
  a = Math.max(0, a - padS);
  b = Math.min(len - 1, b + padS);
  const data = mono.subarray(a, b + 1);
  // Normalise to −1 dBFS.
  let peak = 0;
  for (const v of data) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? 0.89 / peak : 1;
  const out = new DataView(new ArrayBuffer(44 + data.length * 2));
  const w = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF');
  out.setUint32(4, 36 + data.length * 2, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true);
  out.setUint16(22, 1, true);
  out.setUint32(24, rate, true);
  out.setUint32(28, rate * 2, true);
  out.setUint16(32, 2, true);
  out.setUint16(34, 16, true);
  w(36, 'data');
  out.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i] * gain)) * 0x7fff, true);
  return new Blob([out], { type: 'audio/wav' });
}

// ---- ZIP (store only, no compression) ----
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (d) => {
  let c = 0xffffffff;
  for (let i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
export function makeZip(files) {
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(8, 0, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, f.data.length, true);
    local.setUint32(22, f.data.length, true);
    local.setUint16(26, name.length, true);
    parts.push(new Uint8Array(local.buffer), name, f.data);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, f.data.length, true);
    cen.setUint32(24, f.data.length, true);
    cen.setUint16(28, name.length, true);
    cen.setUint32(42, offset, true);
    central.push(new Uint8Array(cen.buffer), name);
    offset += 30 + name.length + f.data.length;
  }
  const cenSize = central.reduce((s, p) => s + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, cenSize, true);
  end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)]);
}

// ---- IndexedDB for takes ----
const DB = 'abjad-studio';
function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('takes');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const tx = async (mode, fn) => {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction('takes', mode);
    const out = fn(t.objectStore('takes'));
    t.oncomplete = () => res(out?.result);
    t.onerror = () => rej(t.error);
  });
};
export const idb = {
  put: (k, v) => tx('readwrite', (s) => s.put(v, k)).catch(() => {}),
  del: (k) => tx('readwrite', (s) => s.delete(k)).catch(() => {}),
  async all() {
    try {
      const db = await open();
      return await new Promise((res) => {
        const out = {};
        const r = db.transaction('takes').objectStore('takes').openCursor();
        r.onsuccess = () => {
          const c = r.result;
          if (c) {
            out[c.key] = c.value;
            c.continue();
          } else res(out);
        };
        r.onerror = () => res({});
      });
    } catch {
      return {};
    }
  },
};
