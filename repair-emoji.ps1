# repair-emoji.ps1 — byte-accurate mojibake repair for UTF-8 source files.
#
# WHY: 4-byte emoji (F0 9F 8E AF = U+1F3AF "�" ) stored as UTF-8, then decoded
# with Windows-1252 into the string "ðŸŽ¯" (U+00F0 U+0178 U+017D U+00AF) and RE-SAVED
# as UTF-8 (C3 B0 C5 B8 C5 BD C2 AF). That is "double-encoded emoji". Repair =
# cp1252 GetBytes -> recovers original F0 9F 8E AF -> UTF-8 GetString -> real emoji.
#
# SAFETY: only runs made of chars that are BOTH >= 0x80 AND cp1252-encodable are
# round-tripped. ASCII, genuine multi-byte emoji, and single legit accented chars
# (whose lone cp1252 byte never forms valid multibyte UTF-8) are NEVER altered.

$ErrorActionPreference = "Stop"
$cp1252 = [Text.Encoding]::GetEncoding(1252)
$utf8   = New-Object System.Text.UTF8Encoding($false)

function Count-Mark([string]$path, [byte[]]$pat) {
  $b = [IO.File]::ReadAllBytes($path)
  $n = 0
  for ($i = 0; $i -lt $b.Length - 1; $i++) {
    if ($b[$i] -eq $pat[0] -and $b[$i + 1] -eq $pat[1]) { $n++ }
  }
  return $n
}

function Repair-File([string]$path) {
  $bytes = [IO.File]::ReadAllBytes($path)
  $s     = $utf8.GetString($bytes)
  $sb    = New-Object System.Text.StringBuilder
  $run   = New-Object System.Text.StringBuilder
  foreach ($ch in $s.ToCharArray()) {
    $code = [int][char]$ch
    $inRun = $false
    if ($code -ge 0x80) {
      try { if ($cp1252.GetByteCount([string]$ch) -eq 1) { $inRun = $true } } catch { $inRun = $false }
    }
    if ($inRun) {
      [void]$run.Append($ch)
    } else {
      if ($run.Length -gt 0) {
        [void]$sb.Append((Repair-Run $run.ToString()))
        [void]$run.Clear()
      }
      [void]$sb.Append($ch)
    }
  }
  if ($run.Length -gt 0) { [void]$sb.Append((Repair-Run $run.ToString())) }
  $new = $sb.ToString()
  if ($new -eq $s) { return $false }
  [IO.File]::WriteAllText($path, $new, $utf8)
  return $true
}

function Repair-Run([string]$run) {
  try {
    $bytes = $cp1252.GetBytes($run)
    $dec   = $utf8.GetString($bytes)
    if ($dec.Contains([char]0xFFFD)) { return $run }
    return $dec
  } catch {
    return $run
  }
}

$targets = @(
  "src\app\games\page.tsx",
  "src\app\games\php-playground\page.tsx",
  "src\app\games\query-quest\page.tsx",
  "src\app\components\sections\projects.tsx"
)

"=== REPAIR ($($targets.Count) files) ==="
foreach ($t in $targets) {
  if (-not (Test-Path $t)) { continue }
  $dbBefore = Count-Mark $t @(0xC3, 0xB0)      # "ð" mojibake pair
  $changed   = Repair-File $t
  $dbAfter   = Count-Mark $t @(0xC3, 0xB0)
  $valid     = Count-Mark $t @(0xF0, 0x9F)     # genuine 4-byte emoji, must survive
  "  {0,-44} changed={1}  dbl {2}->{3}  validEmoji={4}" -f (Split-Path $t -Leaf), $changed, $dbBefore, $dbAfter, $valid
}
"=== VERIFY: dbl must all be 0 ; validEmoji preserved on projects.tsx ==="
$allok = $true
foreach ($t in $targets) {
  if (-not (Test-Path $t)) { continue }
  $d = Count-Mark $t @(0xC3, 0xB0)
  if ($d -gt 0) { $allok = $false }
}
"  ALL-CLEAN=$allok"