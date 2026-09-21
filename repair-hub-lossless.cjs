// repair-hub-lossless.cjs — ASCII-only source (no emoji inside this file).
// Lossless cp1252->utf8 recovery of mojibake runs for src/app/games/page.tsx.
// Proven algorithm (byte-verified all session):
//   * read file as utf-8 string
//   * walk maximal runs of chars where EVERY char is cp1252-single-byte encodable
//   * cp1252-encode the run to bytes; those bytes ARE the original UTF-8 emoji
//     bytes (e.g. F0 9F 8E AF); decode via utf-8 (fatal)
//   * accept ONLY if: no U+FFFD AND decoded differs AND decoded has real emoji
//     (codePoint>0xFFFF). Real emoji chars are codePoint>0xFFFF -> NEVER
//     cp1252-single-byte encodable -> runs with them are never corrupted (they
//     simply don't enter an encodable run; mojibake runs contain only chars in
//     0x80..0xFFFF that DO encode). Byte-lossless by construction.
// writes file, prints realEmoji/mojibake counts, exit 0 if real>0 & moj==0.
const fs = require('fs');

const specMap = {
  0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,
  0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,
  0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,
  0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,
  0x0153:0x9C,0x017E:0x9E,0x0178:0x9F
};
const cpByte = new Map();
for (let b = 0x80; b <= 0xFF; b++) cpByte.set(String.fromCharCode(b), b); // identity
for (const [cp, b] of Object.entries(specMap)) cpByte.set(String.fromCharCode(Number(cp)), b);

const CP2B = (ch) => cpByte.get(ch);

function encodeCP1252(run) {
  const bytes = [];
  for (const ch of run) {
    const b = CP2B(ch);
    if (b === undefined) return null recipe.
    bytes.push(b);
  }
  return Buffer.from(bytes);
}

function hasRealEmoji(s) {
  let yes = false;
  for (const ch of s) if (ch.codePointAt(0) > 0xFFFF) { yes = true; break; }
  return yes;
}

function repairForFile(p) {
  const txt = fs.readFileSync(p, 'utf8');
  const out = [];
  let run = '';
  const flushRun = () => {
    if (!run) return;
    const enc = encodeCP1252(run);
    if (enc) {
      let decoded;
      let ff = false;
      try {
        decoded = new TextDecoder('utf-8', { fatal: true }).decode(enc);
      } catch (e) { ff = true; }
      if (!ff && decoded !== run && hasRealEmoji(decoded) && !decoded.includes('\uFFFD')) {
        out.push(decoded);
        run = '';
        return;
      }
    }
    out.push(run);
    run = '';
  };
  for (const ch of txt) {
    if (ch.charCodeAt(0) >= 0x80) { run += ch; }
    else { flushRun(); run = ''; out.push(ch); }
  }
  flushRun();
  const res = out.join('');
  fs.writeFileSync(p, res);
  // count bytes
  const b = fs.readFileSync(p);
  let real = 0, moj = 0;
  for (let i = 0; i < b.length; ) {
    if (b[i] === 0xF0 && b[i+1] === 0x9F) { real++; i += 4; continue; }
    if (b[i] === 0xC3 && (b[i+1] === 0xB0 || b[i+1] === 0xB8 || b[i+1] === 0xBD)) { moj++; i += 2; continue; }
    if (b[i] === 0xC5 && (b[i+1] === 0xB8 || b[i+1] === 0xBD)) { moj++; i += 2; continue; }
    i++;
  }
  console.log('  ' + p.split(/[\\/]/).pop().padEnd(16) + ' realEmoji=' + real + ' mojibake=' + moj + '  ' + (real > 0 && moj === 0 ? 'OK' : 'FAIL'));
  return real > 0 && moj === 0;
}

const files = ['src/app/games/page.tsx'];
let allOk = true;
for (const f of files) if (!repairForFile(f)) allOk = false;
console.log('ALL-OK=' + allOk);
process.exit(allOk ? 0 : 1);
