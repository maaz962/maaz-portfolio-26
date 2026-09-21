# repair-emoji.ps1 — byte-accurate UTF-8 mojibake repair (Next.js TSX sources).
# 4-byte emoji (F0 9F ..) stored as UTF-8, then mis-decoded with cp1252 and
# re-encoded as UTF-8 (mojibake "<0xF0><0x9F>" -> "C3 B0 C5 B8 .."). This script
# recovers the ORIGINAL bytes though a lossless cp1252->UTF-8 round-trip, and
# only touches characters cp1252 can encode (never corrupts genuine >0xFF text).
$ErrorActionPreference = "Stop"
$cp1252 = [System.Text.Encoding]::GetEncoding(1252)
$utf8   = New-Object System.Text.UTF8Encoding($false)

function Count-Mark([string]$path, [byte[]]$pat) {
  $b = [IO.File]::ReadAllBytes($path)
  $n = 0
  for ($i = 0; $i -lt $b.Length - 1; $i++) {
    if ($b[$i] -eq $pat[0] -and $b[$i + 1] -eq $pat[1]) { $n++ }
  }
  return $n
}

function Repair-Run([string]$run) {
  if ($run.Length -eq 0) { return $run }
  try {
    $bytes = $cp1252.GetBytes($run)
    $dec   = $utf8.GetString($bytes)
    if ($dec.IndexOf([char]0xFFFD) -ge 0) { return $run }
    if ($dec -eq $run) { return $run }
    $hasHigh = $false
    foreach ($ch in $dec.ToCharArray()) { if ([int][char]$ch -gt 0x7F) { $hasHigh = $true; break } }
    if (-not $hasHigh) { return $run }
    return $dec
  } catch {
    return $run
  }
}

function Repair-File([string]$path) {
  $bytes = [IO.File]::ReadAllBytes($path)
  $s     = $utf8.GetString($bytes)
  $out   = New-Object System.Text.StringBuilder
  $run   = New-Object System.Text.StringBuilder
  foreach ($ch in $s.ToCharArray()) {
    if ([int][char]$ch -le 0xFF) { [void]$run.Append($ch) }
    else {
      [void]$out.Append((Repair-Run $run.ToString()))
      [void]$out.Append($ch)
      [void]$run.Clear()
    }
  }
  [void]$out.Append((Repair-Run $run.ToString()))
  $new = $out.ToString()
  if ($new -eq $s) { return $false }
  [IO.File]::WriteAllText($path, $new, $utf8)
  return $true
}

$targets = @(
  "src\app\games\page.tsx",
  "src\app\games\query-quest\page.tsx",
  "src\app\games\php-playground\page.tsx",
  "src\components\sections\projects.tsx"
)

"=== BEFORE (dbl=C3 B0 mojibake / valid=F0 9F emoji) ==="
foreach ($t in $targets) {
  if (-not (Test-Path $t)) { continue }
  "  {0,-40} dbl={1}  validEmoji={2}" -f (Split-Path $t -Leaf), (Count-Mark $t @(0xC3,0xB0)), (Count-Mark $t @(0xF0,0x9F))
}
"=== REPAIR ==="
foreach ($t in $targets) {
  if (-not (Test-Path $t)) { continue }
  $beforeDbl = Count-Mark $t @(0xC3,0xB0)
  $fixed = Repair-File $t
  if ($fixed) { "  REPAIRED " + (Split-Path $t -Leaf) }
  else        { "  ok-clean " + (Split-Path $t -Leaf) }
}
"=== AFTER (dbl must be 0 everywhere, validEmoji preserved where present) ==="
$allok = $true
foreach ($t in $targets) {
  if (-not (Test-Path $t)) { continue }
  $d = Count-Mark $t @(0xC3,0xB0)
  $v = Count-Mark $t @(0xF0,0x9F)
  if ($d -gt 0) { $allok = $false }
  "  {0,-40} dbl={1}  validEmoji={2}" -f (Split-Path $t -Leaf), $d, $v
}
if ($allok) { "ALL-CLEAN" } else { "STILL-CORRUPT" }
