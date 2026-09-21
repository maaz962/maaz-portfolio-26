// repair-emoji-node.cjs (rewrite, clean) — lossless cp1252 roundtrip ONLY for the
// games hub navigation page. Every write is byte-faithful (fs.writeFileSync default,
// no BOM). Real emoji (0xF0 0x9F..) / stray-Q guards proven in-session.
const fs = require('fs');
const cp1252 = new Map();
for (let b = 0x80; b <= 0xFF; b++) cp1252.set(String.fromCharCode(b), b);
const spec = {
  0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,
  0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,
  0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,
  0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,
  0x0153:0x9C,0x017E:0x9E,0x0178:0x9F
};
for (const [c, b] of Object.entries(spec)) cp1252.set(String.fromCharCode(+c), +b );

function runRepair(str) {
  // If the whole string is cp1252-single-byte-encodable, encode->bytes->utf8 gives
  // back real emoji bytes losslessly. Guarded: only accepted when result has real
  // emoji (F0 9F), no U+FFFD, and differs from input.
  const bytes = [];
  for (const ch of str) {
    const b = cp1252.get(ch);
    if (b === undefined) return str; // real emoji can never be cp1252-encoded -> leave verbatim
    bytes.push(b);
  }
  try {
    const dec = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.from(bytes));
    let hasEmoji = false, ff = false;
    for (const ch of dec) { const cp = ch.codePointAt(0); if (cp === 0xFFFD) { ff = true; break; } if (cp > 0xFFFF) hasEmoji = true; }
    if (!ff && hasEmoji && dec !== str) return dec;
  } catch (e) {}
  return str;
}

// Walk the file, applying runRepair to maximal runs of non-ASCII; keep ASCII verbatim.
function repairText(t) {
  let out = '', run = '';
  const flush = () => { out += runRepair(run); run = ''; };
  for (const ch of t) {
    if (ch.charCodeAt(0) >= 0x80) { run += ch; }
    else { flush(); out += ch; }
  }
  flush();
  return out;
}

const hub = 'src/app/games/page.tsx';
const raw = fs.readFileSync(hub);
const before = decodeUTF8fatal(raw) || '';
let out = repairText(before);
// strip any single stray leading '?' before "use client" (exact compile error)
if (out[0] === '?' && out[1] === '"') out = out.slice(1);
const written = Buffer.from(out, 'utf8');
fs.writeFileSync(hub, written);

function decodeUTF8fatal(b) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(b); } catch (e) { return ''; }
}

// verify reported counts
let realEmoji = 0, mojibake = 0, litQ = 0;
for (let i = 0; i < written.length; ) {
  if (written[i] === 0xF0 && i + 3 < written.length && written[i+1] === 0x9F) { realEmoji++; i += 4; continue; }
  if (written[i] === 0xC3 && i + 1 < written.length && (written[i+1] === 0xB0 || written[i+1] === 0xB8 || written[i+1] === 0xBD)) { mojibake++; i += 2; continue; }
  if (written[i] === 0xC5 && i + 1 < written.length && (written[i+1] === 0xB8 || written[i+1] === 0xBD)) { mojibake++; i += 2; continue; }
  if (written[i] === 0x3F) { litQ++; i += 1; continue; }
  i++;
}
const okLet = (realEmoji > 0 && mojibake === 0);
console.log('  page.tsx  realEmoji=' + realEmoji + '  mojibake=' + mojibake + '  litQ=' + litQ + '  ' + (okLet ? 'OK' : 'FAIL'));
process.exit(okLet ? 0 : 1);
