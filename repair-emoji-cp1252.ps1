# repair-emoji-cp1252.ps1 — byte-accurate cp1252 mojibake repair for UTF-8 sources.
# WHY: 4-byte emoji (F0 9F .. ..) were read back as cp1252 ("ðŸŽ¯") then re-saved as
# UTF-8 inside the file. The string in the file is consequently
#   U+00F0 U+0178 U+017D U+00AF ...   (Ÿ/Ž live in cp1252, NOT in latin-1 — the
#   earlier 28591 attempt could never repair them, hence "still corrupt").
# Repair: for each maximal run of non-ASCII chars: cp1252.GetBytes(run) recovers
# the original UTF-8 emoji bytes (F0 9F 8E AF) -> UTF8.GetString = real emoji 🏆.
# Guards: only accept when round-trip yields no U+FFFD and a different string;
# a lone valid 4-byte emoji (surrogate pair, > U+FFFF) makes cp1252.GetBytes throw
# -> run kept verbatim (never corrupted). ASCII and accented words stay untouched
# (0xE9 alone is not valid UTF-8 -> FFFD -> kept).

param([string]$Root = ".")
$cp1252 = [System.Text.Encoding]::GetEncoding(1252)
$utf8   = New-Object System.Text.UTF8Encoding($false)

function Count-Dbl([string]$p) {
  $b = [IO.File]::ReadAllBytes($p); $n = 0
  for ($i = 0; $i -lt $b.Length - 1; $i++) {
    if ($b[$i] -eq 0xC3 -and $b[$i + 1] -eq 0xB0) { $n++ }
  }
  return $n
}

function Fix-File([string]$f) {
  $d0 = Count-Dbl $f
  if ($d0 -eq 0) { return }
  $s  = [Text.Encoding]::UTF8.GetString([IO.File]::ReadAllBytes($f))
  $sb = New-Object System.Text.StringBuilder
  $run = New-Object System.Text.StringBuilder
  foreach ($ch in $s.ToCharArray()) {
    if ([int][char]$ch -ge 0x80) { [void]$run.Append($ch) }
    else {
      if ($run.Length -gt 0) {
        $r = $run.ToString(); [void]$run.Clear()
        try {
          $dec = $utf8.GetString($cp1252.GetBytes($r))
          if (-not $dec.Contains([char]0xFFFD) -and $dec -ne $r) { [void]$sb.Append($dec) }
          else { [void]$sb.Append($r) }
        } catch { [void]$sb.Append($r) }
      }
      [void]$sb.Append($ch)
    }
  }
  if ($run.Length -gt 0) {
    $r = $run.ToString()
    try {
      $dec = $utf8.GetString($cp1252.GetBytes($r))
      if (-not $dec.Contains([char]0xFFFD) -and $dec -ne $r) { [void]$sb.Append($dec) }
      else { [void]$sb.Append($r) }
    } catch { [void]$sb.Append($r) }
  }
  [IO.File]::WriteAllText($f, $sb.ToString(), $utf8)
  "  fixed: {0}  dbl={1} -> {2}" -f (Split-Path $f -Leaf), $d0, (Count-Dbl $f)
}

foreach ($f in @(
  (Join-Path $Root "src\app\games\page.tsx"),
  (Join-Path $Root "src\app\games\query-quest\page.tsx"),
  (Join-Path $Root "src\app\games\php-playground\page.tsx")
)) {
  if (Test-Path $f) { Fix-File $f }
}
