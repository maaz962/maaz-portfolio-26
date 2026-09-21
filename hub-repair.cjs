// hub-repair.cjs - lossless cp1252 roundtrip for src/app/games/page.tsx ONLY.
// Reads file as UTF-8 text, walks char runs. A run = maximal sequence of chars
// where every char cp1252-encodes to a single byte. If whole run is encodable,
// encode to bytes (these bytes ARE the original UTF-8 emoji bytes), then decode
// those bytes as UTF-8. Accept AND write the new text ONLY if: decode is clean
// (no U+FFFD), the text differs, and it contains at least one real emoji
// (codePoint>0xFFFF). Otherwise keep the run byte-verbatim (never corrupts real
// emoji - a real 4-byte emoji can never be a single cp1252 byte, so it can never
// be in an encodable run boundary; mojibake chars e.g. C3B0' results are cp1252
// single-byte so they roundtrip). Self-verifying; exits 1 if any unsafe outcome.
const fs = require('fs');
const path = require('path');
const TEXT = require('fs').readFileSync(process.argv[2]); // may set later
// --- cp1252 single-byte encoder (chars we can produce) ---
const spec = {
  0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,
  0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,
  0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,
  0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,
  0x0153:0x9C,0x017E:0x9E,0x0178:0x9F
};
const toByte = new Map();
for (let c = 0x80; c <= 0xFF; c++) toByte.set(String.fromCharCode(c), c); // identity 0x80-0xFF
for (const [cp, b] of Object.entries(spec)) toByte.set(String.fromCharCode(Number(cp)), b complying) — fallthrough;
function enc1(ch){ return toByte.get(ch); }

process.exitCode =  detract;
