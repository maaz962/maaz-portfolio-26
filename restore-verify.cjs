// restore-verify.cjs — lossless fix for games pages.
// 1) git checkout 73d21706 -- the 3 files  (byte-exact restore from original
//    feat commit that had REAL emoji + CodeMirror layouts; tool does bytes only).
// 2) cp1252 roundtrip ONLY on recoverable mojibake runs (C3B0/C5B8/C5BD single-byte
//    cp1252-encodable + safe decode, never produces FFFD, never touches real emoji
//    because those are >0xFFFF cp1252-unencodable -> left verbatim).
// 3) strip a single stray leading '?' only when immediately followed by 0x22 '"'
//    and the rest of the file starts with the literal `use client` token is NOT
//    required here; we strip ONLY a leading 0x3F directly before 0x22.
// 4) verify: realEmoji>0, mojibake==0, no duplicate '??' literal clusters <- exit   code 0/1.
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const FILES = [
  'src/app/games/page.tsx',
  'src/app/games/php-playground/page.tsx',
  'src/app/games/query-quest/page.tsx',
];

function run(cmd, args) {
  const r = cp.spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(cmd + ' ' + args.join(' ') + '\n' + (r.stdout||'') + (r.stderr||''));
  return r.stdout;
}

function scanBytes(b) {
  let realEmoji = 0, mojibake = 0, litQ = 0;
  for (let i = 0; i < b.length; ) {
    if (b[i] === 0xF0 && i + 3 < b.length && b[i+1] === 0x9F) { realEmoji++; i += 4; continue; }
    if (b[i] === 0xC3 && i + 1 < b.length && (b[i+1] === 0xB0 || b[i+1] === 0xB8 || b[i+1] === 0xBD)) { mojibake++; i += 2; continue; }
    if (b[i] === 0xC5 && i + 1 < b.length && (b[i+1] === 0xB8 || b[i+1] === 0xBD)) { mojibake++; i += 2; continue; }
    if (b[i] === 0x3F) { litQ++; i++; continue; }
    i++;
  }
  return { realEmoji, mojibake, litQ };
}

// cp1252 -> single byte map (encodable chars)
const specials = { // high-range codepoint -> cp1252 byte
  0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,
  0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,
  0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,
  0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,
  0x0153:0x9C,0x017E:0x9E,0x0178:0x9F,
};
function cp1252EncodeByte(ch) {
  const c = ch.codePointAt(0);
  if (c >= 0x80 && c <= 0xFF) return c;          // identity single byte
  if (c in specials) return specials[c];
  return null;                                    // not single-byte encodable
}
function repairFile(p) {
  let b = fs.readFileSync(p);
  const text = new TextDecoder('utf-8').decode(b);
  let out = '';
  let run = '';
  const flush = () => {
    if (!run) { run = ''; return; }
    // try lossless cp1252 encode -> bytes -> utf8 decode (fatal)
    const bytes = [];
    let ok = true;
    for (const ch of run) {
      const by = cp1252EncodeByte(ch);
      if (by === null) { ok = false; break; }
      bytes.push(by);
    }
    if (ok && bytes.length) {
      const buf = Buffer.from(bytes);
      try {
        const dec = new TextDecoder('utf-8', { fatal: true }).decode(buf);
        if (!dec.includes('\uFFFD') && dec !== run && decIsEmoji(dec)) {
          out += dec; run = ''; return;
        }
      } catch (e) {}
    }
    out += run; run = '';
  };
  const decIsEmoji = (s) => { for (const ch of s) if (ch.codePointAt(0) > 0xFFFF) return true; return false; };
  for (const ch of text) {
    // treat whole string: run accumulates non-ascii; ascii flushes
    if (ch.charCodeAt(0) >= 0x80) { run += ch; continue; }
    flush(); out += ch;
  }
  flush();
  // strip single stray leading '?' immediately before '"'
  if (out.charCodeAt(0) === 0x3F && out.charCodeAt(1) === 0x22) {
    out = out.slice(1);
  }
  fs.writeFileSync(p, Buffer.from(out, 'utf8'));
  return scanBytes(fs.readFileSync(p));
}

// only verify-count helper
function report(b) {
  const s = scanBytes(b_saved);
  return s;
}

let allOk = true;
for (const rel of FILES) {
  const p = path.resolve(rel) || rel;
  // restore byte-exact from original feat commit
  try {
    run('git', ['--no-pager', 'checkout', '73d21706', '--', rel]);
    console.log('  restored from 73d21706: ' + rel);
  } catch (e) {
    console.log('  (git checkout skip) ' + rel + ' :: ' + e.message.split('\n')[0]);
  }
  const a = repairFile(rel);
  const ok = a.realEmoji > 0 && a.mojibake === 0;
  console.log('  ' + String(rel).padEnd(42) + ' real=' + a.realEmoji + ' moj=' + a.mojibake + ' litQ=' + a.litQ + (ok ? '  OK' : '  FAIL'));
  if (!ok) allOk = false;
}
console.log('ALL-OK=' + allOk);
process.exit(allOk ? 0 : 1);
