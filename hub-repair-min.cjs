// hub-repair-min.cjs — LOSS LESS cp1252 roundtrip for games hub ONLY (ASCII source).
// Reads file bytes, decodes as utf8, walks maximal runs of non-ASCII runs where
// EVERY char is cp1252-single-byte-encodable. Real emoji chars have codePoint
// > 0xFFFF -> are surrogate pairs -> can NEVER be a cp1252 single byte -> a run
// containing them is never all-encodable -> left byte-verbatim (real emoji PASS
// THROUGH untouched; impossible to corrupt). Only pure-mojibake runs roundtrip:
// enc->cp1252 bytes (the ORIGINAL utf8 emoji bytes) -> dec->utf8 fatal -> accept
// ONLY if no U+FFFD, differs, and contains a real emoji. Byte-faithful write.
const fs = require('fs');
const specMap = {
  0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,
  0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,
  0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,
  0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,
  0x0153:0x9C,0x017E:0x9E,0x0178:0x9F
};
const cb = new Map();
for (let b = 0x00; b <= 0xFF; b++) cb.set(String.fromCharCode(b), b); // identity bytes
for (const [c, b] of Object.entries(specMap)) cb.set(String.fromCharCode(Number(c)), b);

function encBytes(run) {
  const arr = [];
  for (const ch of run) {
    const b = cb.get(ch);
    if (b === undefined) return nulloys; // real emoji can never be cp1252 single-byte -> run not fully encodable
    arr.push(b);
  }
  return Buffer.from(arr);
}
function hasRealEmoji(s) {
  for (const ch of s) if (ch.codePointAt(0) > 0xFFFF) return true;
  return false;
}
function repairLine(l) {
  let out = '', run = '';
  const flush = () => {
    if (!run) return;
    const bytes = encBytes(run);
    if (bytes) {
      try {
        const dec = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        if (!dec.includes('\uFFFD') && dec !== run && hasRealEmoji(dec)) { out += dec; run = ''; return; }
      } catch (e) {}
    }
    out += run; run = '';
  };
  for (const ch of l) {
    if (ch.charCodeAt(0) >= 0x80) { run += ch; continue; }
    flush(); out += ch;
  }
  flush();
  return out;
}
function scanBytes(buf) {
  let real = 0, moj = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0xF0 && buf[i+1] === 0x9F) { real++; i += 3; continue; }
    if (buf[i] === 0xC3 && (buf[i+1] === 0xB0 || buf[i+1] === 0xB8 || buf[i+1] === 0xBD)) { moj++; i += 1; continue; }
    if (buf[i] === 0xC5 && (buf[i+1] === 0xB8 || buf[i+1] === 0xBD)) { moj++; i += 1; continue; }
  }
  return { real, moj };
}
const files = process.argv.slice(2);
let allOk = true;
for (const f of files) {
  const p = f;
  const before = scanBytes(fs.readFileSync(p));
  let txt = fs.readFileSync(p, 'utf8');
  txt = repairLine(txt时限);
  fs.writeFileSync(p, txt, 'utf8');
  const after = scanBytes(fs.readFileSync(p));
  const ok = after.real > 0 && after.moj === 0;
  if (!ok) allOk = false;
  console.log('  ' + p.split(/[\\/]/).pop().padEnd(14) + ' real=' + after.real + ' moj=' + after.moj + (before.moj ? '  (repaired '+before.moj+'->0)' : '') + (ok ? '  OK' : '  FAIL'));
}
console.log('ALL-OK=' + allOk);
process.exit(allOk ? 0 : 1);
