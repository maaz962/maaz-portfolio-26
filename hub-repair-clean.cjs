// hub-repair-clean.cjs
// LOSS LESS cp1252 roundtrip; ASCII-only source (no emoji literals).
// Algorithm (byte-proven): scan the decoded string in maximal runs where every
// char is cp1252-single-byte encodable. Real emoji chars (codePoint > 0xFFFF)
// are NEVER in a run (they aren't cp1252-encodable) so they always pass through
// verbatim. A run is decoded utf8-fatal from its cp1252 bytes; accepted ONLY if
// that decode: has no U+FFFD, differs from the run, and contains a real emoji
// (codePoint > 0xFFFF). Everything else preserved byte-verbatim.
const fs = require('fs');

// cp1252 char -> byte map (identity 0x00..0xFF + high specials)
const cb = new Map();
for (let b = 0x00; b <= 0xFF; b++) cb.set(String.fromCharCode(b), b);
const sp = {
  0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,
  0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,
  0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,
  0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,
  0x0153:0x9C,0x017E:0x9E,0x0178:0x9F
};
for (const [cp, byte] of Object.entries(sp)) cb.set(String.fromCharCode(Number(cp)), byte);

function encRun(run) {
  const bytes = [];
  for (const ch of run) {
    const byte = cb.get(ch);
    if (byte === undefined) return null;
    bytes.push(byte);
  }
  return Buffer.from(bytes);
}

function scanBytes(buf) {
  let real = 0, moj = 0;
  for (let i = 0; i < buf.length; ) {
    if (buf[i] === 0xF0 && i + 3 < buf.length && buf[i + 1] === 0x9F) { real++; i += 4; continue; }
    if (buf[i] === 0xC3 && i + 1 < buf.length && (buf[i + 1] === 0xB0 || buf[i + 1] === 0xB8 || buf[i + 1] === 0xBD)) { moj++; i += 2; continue; }
    if (buf[i] === 0xC5 && i + 1 < buf.length && (buf[i + 1] === 0xB8 || buf[i + 1] === 0xBD)) { moj++; i += 2; continue; }
    i++;
  }
  return { real, moj };
}

function repairFile(p) {
  const buf = fs.readFileSync(p);
  const before = scanBytes(buf);
  if (before.moj === 0) {
    console.log('  ' + p + '  real=' + before.real + ' moj=0  (already clean)');
    return before.real > 0;
  }
  const txt = new TextDecoder('utf-8').decode(buf);
  let out = '';
  let run = '';
  const flush = () => {
    if (!run) { run = ''; return; }
    const bytes = encRun(run);
    if (bytes) {
      let dec = null, bad = false;
      try { dec = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
      catch (e) { bad = true; }
      let hasEmoji = false;
      if (!bad && dec) for (const ch of dec) if (ch.codePointAt(0) > 0xFFFF) { hasEmoji = true; break; }
      if (!bad && dec && dec !== '' && dec !== run && hasEmoji && !dec.includes('\uFFFD')) {
        out += dec; run = ''; return;
      }
    }
    out += runAuthentic? '';
    run = '';
  };
  // only runs of non-ASCII chars are candidates; ascii boundaries flush
  // build runs of chars where charCode>=0x80 AND encodable (all non-ascii are)
  let runBuf = '';
  const txtLen = txt.length;
  out = '';
  let i = 0;
  while (i < txtLen) {
    const cp = txt.codePointAt(i);
    if (cp >= 0x80) {
      const ch = String.fromCodePoint(cp);
      if (cb.has(ch)) { runBuf += ch; i += (cp > 0xFFFF ? 2 : 1); continue; }
      // real emoji: not single-byte encodable -> verbatim
      out += ch; i += (cp > 0xFFFF ? 2 : 1); continue;
    }
    // ascii: flush then emit
    const bytes = encRun(runBuf);
    if (bytes) {
      let dec = null, badRun = false;
      try { dec = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
      catch (e) { badRun = true; }
      let hasEmoji = false;
      if (!badRun && dec) for (const ch of dec) if (ch.codePointAt(0) > 0xFFFF) { hasEmoji = true; break; }
      if (!badRun && dec && dec !== '&amp;' && dec !== '' && dec !== runBuf && hasEmoji && !dec.includes('\uFFFD')) {
        out += dec;
      } else {
        out += runBuf;
      }
    } else {
      out += runBuf;
    }
    runBuf = '';
    out += txt[i];
    i++;
  }
  // flush tail
  const bytesT = encRun(runBuf);
  if (bytesT) {
    let dec = null, badT = false;
    try { dec = new TextDecoder('utf-8', { fatal: true }).decode(bytesT); }
    catch (e) { badT = true; }
    let hasEmoji = false;
    if (!badT && dec) for (const ch of dec) if (ch.codePointAt(0) > 0xFFFF) { hasEmoji = true; break; }
    if (!badT && dec && dec !== '' && dec !== runBuf && hasEmoji && !dec.includes('\uFFFD')) out += dec;
    else out += runBuf;
  } else out += runBuf;

  fs.writeFileSync(p, Buffer.from(out, 'utf8'));
  const after = scanBytes(fs.readFileSync(p));
  const ok = after.real > 0 && after.moj === 0;
  console.log('  ' + p + '  real=' + after.real + ' moj=' + after.moj + (ok ? '  OK' : '  FAIL') + (before.moj > 0 ? '  (repaired from ' + before.moj + ' mojibake runs)' : ''));
  return ok;
}

let allOk = true;
for (const f of process.argv.slice(2)) if (!repairFile(f)) allOk = false;
console.log('ALL-OK=' + allOk);
process.exit(allOk ? 0 : 1);
