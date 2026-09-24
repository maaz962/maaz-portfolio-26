"use client";

import { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { php } from "@codemirror/lang-php";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  Check,
  ChevronDown,
  FolderOpen,
  Gamepad2,
  Lightbulb,
  Lock,
  Sparkles,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { GameShell } from "@/components/games/game-shell";
import { MobileActionBar } from "@/components/games/mobile-action-bar";
import { AuthGate } from "@/components/games/auth-gate";
import { AuthModal } from "@/components/games/auth-modal";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/lib/auth-context";
import "./game.css";

const GAME_SLUG = "php-playground";
const FALLBACK_TOTAL_LEVELS = 16;

interface PhpLevelMeta {
  id: number;
  title: string;
  tier: "easy" | "intermediate" | "hard" | "mostHard";
  concepts: string[];
  points: number;
  isFinal: boolean;
  shortDesc: string;
  instruction: string;
  hint: string;
  seedCode: string;
}

interface PhpGameState {
  currentLevel: number;
  score: number;
  completed: Record<number, boolean>;
  solutions?: Record<number, string>;
  hints?: { date?: string; used: number };
  totalLevels: number;
}

interface PhpRunResult {
  ok?: boolean;
  stdout?: string;
  stderr?: string;
  exit?: number;
  score?: number;
  error?: string;
  errorType?: string;
}

interface ConsoleLine {
  type: "log" | "error";
  text: string;
}

const PHP_ERROR_RE = /(?:^|\s)(?:Parse |Fatal )?error:|Warning:|Notice:|Deprecated:/i;

function phpErrorFrom(output?: string): string {
  const text = (output ?? "").trim();
  if (!text) return "";
  const line = text.split("\n").find((l) => PHP_ERROR_RE.test(l));
  return (line ?? "").trim();
}

const TIER_ORDER = ["easy", "intermediate", "hard", "mostHard"];

const TIER_META = [
  { key: "easy", label: "Easy", blurb: "Warm-up — echo, variables, types and control flow." },
  { key: "intermediate", label: "Intermediate", blurb: "Clues tighten — functions, arrays and string helpers." },
  { key: "hard", label: "Hard", blurb: "Real casework — superglobals, null-coalescing and array helpers." },
  { key: "mostHard", label: "Most Hard", blurb: "Final stretch — array_map, array_filter and the boss reduce." },
];

const CONCEPT_LABELS: Record<string, string> = {
  variables: "Variables",
  "data types": "Types",
  gettype: "gettype",
  operators: "Operators",
  "if/else": "if/else",
  comparison: "Comparison",
  foreach: "foreach",
  functions: "Functions",
  parameters: "Parameters",
  arrays: "Arrays",
  count: "count",
  array_sum: "sum",
  strtoupper: "strtoupper",
  trim: "trim",
  "associative arrays": "Keyed arrays",
  for: "for",
  continue: "continue",
  "$_GET": "GET",
  superglobals: "Superglobals",
  explode: "explode",
  implode: "implode",
  "??": "??",
  array_map: "map",
  array_filter: "filter",
  "arrow functions": "Arrows",
  array_reduce: "reduce",
};

/* ---- shared tier helpers (mirror js-detective) ---- */

function tierLevelsFor(levels: PhpLevelMeta[], tierKey: string): PhpLevelMeta[] {
  return levels.filter((l) => l.tier === tierKey);
}

function tierDoneFor(
  levels: PhpLevelMeta[],
  completed: Record<number, boolean>,
  tierKey: string
): number {
  return tierLevelsFor(levels, tierKey).filter((l) => completed[l.id - 1]).length;
}

function tierOpenFor(
  levels: PhpLevelMeta[],
  completed: Record<number, boolean>,
  tierKey: string
): boolean {
  const ti = TIER_ORDER.indexOf(tierKey);
  if (ti <= 0) return true;
  const prev = TIER_ORDER[ti - 1] ?? "";
  const prevLevels = tierLevelsFor(levels, prev);
  const need = prev === "hard" ? prevLevels.length : Math.max(1, prevLevels.length - 1);
  return prevLevels.length === 0 || tierDoneFor(levels, completed, prev) >= need;
}

function lockNoteFor(
  levels: PhpLevelMeta[],
  completed: Record<number, boolean>,
  tierKey: string
): string {
  const ti = TIER_ORDER.indexOf(tierKey);
  if (ti <= 0) return "";
  const prev = TIER_ORDER[ti - 1] ?? "";
  const prevLevels = tierLevelsFor(levels, prev);
  const need = prev === "hard" ? prevLevels.length : Math.max(1, prevLevels.length - 1);
  const left = Math.max(0, need - tierDoneFor(levels, completed, prev));
  const label = TIER_META.find((t) => t.key === prev)?.label || prev;
  return `Solve ${left} more ${label} level${left === 1 ? "" : "s"} to unlock this tier.`;
}

function tierLegendFor(levels: PhpLevelMeta[]): string {
  const parts: string[] = [];
  for (let ti = 1; ti < TIER_ORDER.length; ti++) {
    const prev = TIER_ORDER[ti - 1] ?? "";
    const next = TIER_ORDER[ti] ?? "";
    const prevLevels = tierLevelsFor(levels, prev);
    if (!prevLevels.length) continue;
    const need = prev === "hard" ? prevLevels.length : Math.max(1, prevLevels.length - 1);
    const prevLabel = TIER_META.find((t) => t.key === prev)?.label || prev;
    const nextLabel = TIER_META.find((t) => t.key === next)?.label || next;
    parts.push(`Solve ${need} of ${prevLevels.length} ${prevLabel} levels to unlock ${nextLabel}`);
  }
  return parts.join(". ");
}

function consoleLinesFor(res: PhpRunResult): ConsoleLine[] {
  const lines: ConsoleLine[] = [];
  const stdout = res.stdout ?? "";
  const stderr = res.stderr ?? "";
  const stdoutTrimmed = stdout.replace(/\n$/, "");
  stdoutTrimmed.split("\n").forEach((l) => {
    if (l.length) lines.push({ type: "log", text: l });
  });
  stderr
    .replace(/\n$/, "")
    .split("\n")
    .forEach((l) => {
      if (l.length) lines.push({ type: "error", text: l });
    });
  return lines;
}

export default function PhpPlaygroundPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [levels, setLevels] = useState<PhpLevelMeta[]>([]);
  const [gameState, setGameState] = useState<PhpGameState>({
    currentLevel: 0,
    score: 0,
    completed: {},
    totalLevels: FALLBACK_TOTAL_LEVELS,
  });
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [bootStatus, setBootStatus] = useState<"idle" | "booting" | "ready" | "error">("idle");
  const [bootMsg, setBootMsg] = useState("");
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [result, setResult] = useState<{ ok: boolean; label: string; detail?: string; score?: number } | null>(null);
  const [solved, setSolved] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [hintText, setHintText] = useState("");
  const [hintMsg, setHintMsg] = useState("");

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed,
    initKey: "__initPhpPlayground",
    resumeKey: "__resumePhpPlayground",
    emitterKey: "__onPhpPlaygroundProgress",
  });

  useEffect(() => {
    if (!gamesAuthed) return;
    const w = window as any;
    let alive = true;
    let levelsTimer: ReturnType<typeof setTimeout> | undefined;
    let stateTimer: ReturnType<typeof setTimeout> | undefined;

    const pollLevels = () => {
      if (!alive) return;
      if (typeof w.__getPhpPlaygroundLevels === "function") {
        const meta = w.__getPhpPlaygroundLevels();
        if (Array.isArray(meta) && meta.length) {
          setLevels(meta);
        } else {
          levelsTimer = setTimeout(pollLevels, 120);
        }
      } else {
        levelsTimer = setTimeout(pollLevels, 100);
      }
    };

    const pullState = () => {
      if (!alive) return;
      if (typeof w.__getPhpPlaygroundState === "function") {
        const s = w.__getPhpPlaygroundState();
        if (s && s.totalLevels > 0) {
          setGameState((g) => ({ ...g, ...s }));
          try {
            if (typeof w.__phpPlaygroundBootState === "function") {
              const b = w.__phpPlaygroundBootState();
              if (b && b.boot) setBootStatus(b.boot);
            }
          } catch (e) {
            /* ignore */
          }
        } else {
          stateTimer = setTimeout(pullState, 150);
        }
      } else {
        stateTimer = setTimeout(pullState, 100);
      }
    };

    const onBoot = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail) return;
      if (detail.status === "booting") {
        setBootStatus("booting");
        setBootMsg("Booting PHP 8.4 in your browser (WebAssembly)…");
      } else if (detail.status === "ready") {
        setBootStatus("ready");
        setBootMsg("");
      } else if (detail.status === "error") {
        setBootStatus("error");
        setBootMsg(detail.message || "PHP engine failed to boot.");
      }
    };
    const onState = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) setGameState((g) => ({ ...g, ...detail }));
    };

    pollLevels();
    pullState();
    window.addEventListener("php-playground-boot", onBoot);
    window.addEventListener("php-playground-state", onState);
    return () => {
      alive = false;
      clearTimeout(levelsTimer);
      clearTimeout(stateTimer);
      window.removeEventListener("php-playground-boot", onBoot);
      window.removeEventListener("php-playground-state", onState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesAuthed]);

  const currentIdx = gameState.currentLevel;
  const current = levels.length ? levels[currentIdx] : undefined;
  const isLastLevel = Boolean(current?.isFinal);

  const hintsUsed = gameState.hints?.used ?? 0;
  const hintsLeft = Math.max(0, 3 - hintsUsed);

  /* Reset the workspace only when the level actually changes; completion data
     for the current level may arrive later (resume/DB poll) and must not reset
     the editor or the just-shown solved overlay. */
  const loadedForId = useRef<number | null>(null);
  const hydratedForId = useRef<number | null>(null);
  useEffect(() => {
    if (!current) return;
    const idx = current.id - 1;
    const levelChanged = loadedForId.current !== current.id;
    if (levelChanged) {
      // True level change: reset the workspace; the stored solution is applied
      // right below if the level is already completed.
      loadedForId.current = current.id;
      hydratedForId.current = null;
      setCode(current.seedCode);
      setResult(null);
      setConsoleLines([]);
      setSolved(false);
      setHintRevealed(false);
      setHintText("");
      setHintMsg("");
    }
    const saved = gameState.completed[idx] ? gameState.solutions?.[idx] : undefined;
    if (saved !== undefined && hydratedForId.current !== current.id) {
      // On a genuine level change, or on a late arrival of completion data for
      // the current level whose editor still holds untouched starter code.
      if (levelChanged || code === current.seedCode) {
        hydratedForId.current = current.id;
        setCode(saved);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, gameState.completed?.[currentIdx], gameState.solutions?.[currentIdx]]);

  const goLevel = (idx: number) => {
    const w = window as any;
    if (typeof w.__goToPhpPlaygroundLevel === "function") w.__goToPhpPlaygroundLevel(idx);
    setShowLevelSelect(false);
  };

  const appendConsole = (res: PhpRunResult) => {
    const lines = consoleLinesFor(res);
    if (lines.length) setConsoleLines((prev) => [...prev, ...lines]);
  };

  const run = async () => {
    const w = window as any;
    if (typeof w.__phpPlaygroundRun !== "function") return;
    setRunning(true);
    setResult(null);
    setSolved(false);
    try {
      const r: PhpRunResult = await w.__phpPlaygroundRun(currentIdx, code);
      appendConsole(r);
      const phpErr = phpErrorFrom(r.stdout) || (r.stderr ?? "").trim();
      if (phpErr) {
        setResult({ ok: false, label: "PHP reported an error", detail: phpErr });
      }
    } catch (e) {
      setResult({ ok: false, label: "Something went wrong", detail: String(e) });
    } finally {
      setRunning(false);
    }
  };

  const check = async () => {
    const w = window as any;
    if (typeof w.__phpPlaygroundCheck !== "function") return;
    setRunning(true);
    setResult(null);
    setSolved(false);
    try {
      const r: PhpRunResult = await w.__phpPlaygroundCheck(currentIdx, code);
      appendConsole(r);
      if (r.ok) {
        setSolved(true);
        setResult({ ok: true, label: "Correct!", detail: "Output matches exactly.", score: r.score });
      } else if (r.error) {
        setResult({
          ok: false,
          label: r.errorType === "runtime" ? "PHP reported an error" : "Not quite",
          detail: r.error,
        });
      } else {
        setResult({
          ok: false,
          label: "Not quite",
          detail: `Expected your output to match the target. Your output was:\n${(r.stdout ?? "").trim() || "(empty)"}`,
        });
      }
    } catch (e) {
      setResult({ ok: false, label: "Something went wrong", detail: String(e) });
    } finally {
      setRunning(false);
    }
  };

  const revealHint = async () => {
    const w = window as any;
    if (typeof w.__phpPlaygroundRevealHint !== "function") return;
    if (!current) return;
    setHintMsg("");
    try {
      const r = await w.__phpPlaygroundRevealHint(currentIdx);
      if (r && r.ok) {
        setHintText(r.hint ?? current.hint);
        setHintRevealed(true);
      } else if (r && r.left === 0) {
        setHintMsg("You've used all 3 hints today. Come back tomorrow for more.");
      }
    } catch (e) {
      setHintMsg(String(e));
    }
  };

  const replay = () => {
    const w = window as any;
    if (typeof w.__initPhpPlayground === "function") w.__initPhpPlayground();
    setSolved(false);
    setResult(null);
    setConsoleLines([]);
  };

  const hintRevealDisabled = Boolean(current && gameState.completed[currentIdx]) || hintsLeft === 0;
  const showSolvedNote = Boolean(current && gameState.completed[currentIdx]);

  return (
    <>
    <GameShell
      title="PHP Playground"
      tagline="Solve PHP challenges — variables, functions, arrays &amp; the higher-order bosses"
      icon={<span className="text-xl">🐘</span>}
      iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-500"
      scriptSrc={["/games/php-playground/levels.js", "/games/php-playground/game.js"]}
      doneCount={levels.filter((l) => gameState.completed[l.id - 1]).length}
      totalLevels={gameState.totalLevels || FALLBACK_TOTAL_LEVELS}
    >
        {/* GAME SECTION */}
        {!authLoading && !gamesAuthed ? (
          <AuthGate
            loading={authLoading}
            onSignIn={() => {
              setAuthRequest("login");
              setShowAuthModal(true);
            }}
            onRegister={() => {
              setAuthRequest("register");
              setShowAuthModal(true);
            }}
          />
        ) : (
          <div className="game-shell-grid">
            {/* LEFT SIDEBAR */}
            <div className="game-shell-sidebar">
              {/* Level Select Drawer */}
              <div className="php-level-select">
                <button
                  type="button"
                  className={"php-level-select-toggle" + (showLevelSelect ? " open" : "")}
                  aria-expanded={showLevelSelect}
                  onClick={() => setShowLevelSelect((v) => !v)}
                >
                  <span className="php-ls-label">
                    <FolderOpen className="h-3 w-3" />
                    All Levels
                  </span>
                  <span className="php-ls-count">
                    {levels.filter((l) => gameState.completed[l.id - 1]).length}/{gameState.totalLevels}
                  </span>
                  <ChevronDown className={"php-ls-chevron" + (showLevelSelect ? " open" : "")} />
                </button>

                {showLevelSelect && (
                  <div className="php-level-select-body">
                    {TIER_META.map((tier) => {
                      const ls = tierLevelsFor(levels, tier.key);
                      const done = tierDoneFor(levels, gameState.completed, tier.key);
                      const open = tierOpenFor(levels, gameState.completed, tier.key);
                      return (
                        <div
                          key={tier.key}
                          className={"php-tier-group " + tier.key + (open ? "" : " closed")}
                        >
                          <div className="php-tier-head">
                            <span className="php-tier-name">{tier.label}</span>
                            <span className="php-tier-count">
                              {done}/{ls.length}
                            </span>
                          </div>
                          <div className="php-tier-blurb">
                            {open ? tier.blurb : lockNoteFor(levels, gameState.completed, tier.key)}
                          </div>
                          <div className="php-level-grid">
                            {ls.map((level) => {
                              const doneLevel = !!gameState.completed[level.id - 1];
                              const isCurrent = gameState.currentLevel === level.id - 1;
                              const locked =
                                !doneLevel && !tierOpenFor(levels, gameState.completed, level.tier);
                              return (
                                <button
                                  key={level.id}
                                  type="button"
                                  disabled={locked}
                                  className={
                                    "php-level-card " +
                                    level.tier +
                                    (doneLevel ? " done" : "") +
                                    (isCurrent ? " current" : "")
                                  }
                                  title={level.shortDesc || level.title}
                                  onClick={() => goLevel(level.id - 1)}
                                >
                                  <span className="php-lk-num">
                                    {doneLevel ? (
                                      <Check className="php-lk-check" />
                                    ) : locked ? (
                                      <Lock className="php-lk-lock" />
                                    ) : (
                                      level.id
                                    )}
                                  </span>
                                  <span className="php-lk-title">{level.title}</span>
                                  <span className="php-lk-meta">
                                    {level.concepts.slice(0, 3).map((c) => (
                                      <span key={c} className="php-concept-chip">
                                        {CONCEPT_LABELS[c] || c}
                                      </span>
                                    ))}
                                    <span className="php-lk-points">+{level.points} XP</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <div className="php-ls-legend">{tierLegendFor(levels)}</div>
                  </div>
                )}
              </div>

              {/* Level Info */}
              {current && (
                <div className="php-level-info">
                  <div className="php-level-header">
                    <span className="php-level-badge">
                      <Gamepad2 className="h-3 w-3" />
                      Level <span>{current.id}</span>
                      <span className="text-muted">/</span>
                      <span>{gameState.totalLevels}</span>
                    </span>
                    <span className={"php-level-difficulty " + current.tier}>
                      {TIER_META.find((t) => t.key === current.tier)?.label ?? current.tier}
                    </span>
                  </div>
                  <h2 className="font-display text-sm font-bold text-foreground">{current.title}</h2>
                  <p className="php-instruction mt-1" dangerouslySetInnerHTML={{ __html: current.instruction }} />

                  {hintRevealed && hintText && (
                    <div className="php-hint">
                      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      <span dangerouslySetInnerHTML={{ __html: hintText }} />
                    </div>
                  )}
                  {!hintRevealed && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="php-hint-reveal"
                        onClick={revealHint}
                        disabled={hintRevealDisabled}
                      >
                        <Lightbulb className="h-3 w-3" />
                        Show Hint
                      </button>
                      <div className="php-hint-usage">
                        {hintMsg || `${hintsUsed}/3 hints used today`}
                      </div>
                    </div>
                  )}
                  {showSolvedNote && (
                    <div className="php-solved-note">Solved! Answers are saved — you can return to this level anytime.</div>
                  )}
                </div>
              )}

              {/* Code Editor */}
              {current && (
                <div className="php-editor">
                  <div className="php-editor-header">
                    <div className="php-editor-dots">
                      <span className="php-editor-dot red" />
                      <span className="php-editor-dot yellow" />
                      <span className="php-editor-dot green" />
                    </div>
                    <div className="php-editor-title-row">
                      <span className="php-editor-title">solution.php</span>
                      <button
                        type="button"
                        className="php-editor-clear"
                        title="Clear code"
                        aria-label="Clear code"
                        onClick={() => setCode(current.seedCode)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="php-editor-body game-shell-editor-body">
                    <div
                      className="php-editor-wrap"
                      onKeyDown={(e) => {
                        if (!(e.ctrlKey || e.metaKey) || e.key !== "Enter") return;
                        e.preventDefault();
                        if (e.shiftKey) {
                          if (!running) check();
                        } else if (!running) {
                          run();
                        }
                      }}
                    >
                      <CodeMirror
                        value={code}
                        height="320px"
                        theme={oneDark}
                        extensions={[php()]}
                        onChange={(v) => setCode(v)}
                        editable={gamesAuthed}
                        basicSetup={{ lineNumbers: true, foldGutter: false }}
                        placeholder="Write your PHP solution here…"
                      />
                    </div>
                  </div>

                  {result && (
                    <div
                      className={"php-result " + (result.ok ? "pass" : "fail")}
                      role="status"
                    >
                      <span className="php-result-icon">
                        {result.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </span>
                      <span className="php-result-body">
                        <strong>{result.label}</strong>
                        {result.score ? `+${result.score} XP` : null}
                        {result.detail && <pre>{result.detail}</pre>}
                      </span>
                    </div>
                  )}

                  <div className="php-editor-actions">
                    <button
                      id="run-btn"
                      type="button"
                      className="php-run-btn"
                      onClick={run}
                      disabled={running}
                      title={running ? "Please wait — running…" : undefined}
                    >
                      <Terminal className="h-3 w-3" />
                      {running ? "Running…" : "Run PHP"}
                    </button>
                    <div className="php-nav-buttons">
                      <button
                        id="prev-btn"
                        type="button"
                        className="php-nav-btn prev"
                        disabled={currentIdx === 0}
                        onClick={() => goLevel(currentIdx - 1)}
                        title={currentIdx === 0 ? "You're on the first level" : undefined}
                      >
                        ← Prev
                      </button>
                      <button
                        id="check-btn"
                        type="button"
                        className="php-check-btn"
                        onClick={check}
                        disabled={running}
                        title={running ? "Please wait — running…" : undefined}
                      >
                        Check
                      </button>
                      <button
                        id="next-btn"
                        type="button"
                        className="php-nav-btn next"
                        disabled={!gameState.completed[currentIdx] || isLastLevel}
                        onClick={() => goLevel(currentIdx + 1)}
                        title={
                          !gameState.completed[currentIdx] || isLastLevel
                            ? !gameState.completed[currentIdx]
                              ? "Complete this level to unlock the next"
                              : "You're on the last level"
                            : undefined
                        }
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT GAME AREA */}
            <div className="game-shell-panel">
              {bootStatus === "booting" && (
                <div className="php-boot-strip">
                  <Terminal className="h-3 w-3 shrink-0 animate-spin" />
                  <span>{bootMsg}</span>
                </div>
              )}
              {bootStatus === "error" && (
                <div className="php-boot-strip error">
                  <X className="h-3 w-3 shrink-0" />
                  <span>{bootMsg}</span>
                </div>
              )}

              <div className="php-console-container">
                <div className="php-console-header">
                  <div className="php-console-tabs">
                    <button className="php-console-tab active">Output</button>
                  </div>
                  <div className="php-score">
                    <span className="php-score-value">Score: {gameState.score}</span>
                    <span>XP</span>
                  </div>
                </div>
                <div className="php-console">
                  {consoleLines.length === 0 ? (
                    <div className="php-console-empty">
                      Output appears here — hit Run PHP to execute your script, or Check to test your answer.
                    </div>
                  ) : (
                    consoleLines.map((line, i) => (
                      <div key={`${i}-${line.type}`} className={"php-console-line " + line.type}>
                        <span className="path">php://</span>
                        {line.type === "log" ? <span className="prompt">&gt;</span> : <span className="prompt">!</span>}
                        {line.text}
                      </div>
                    ))
                  )}
                </div>

                {solved && (
                  <div className="php-complete-overlay">
                      {isLastLevel ? (
                        <>
                          <div className="php-stars">
                            <span className="php-star earned">🏆</span>
                          </div>
                          <div className="php-complete-text">PHP Master!</div>
                          <div className="php-complete-sub">All 16 levels conquered.</div>
                          <div className="php-victory-stats">
                            <div className="php-victory-stat">
                              <div className="php-victory-stat-value">{gameState.score}</div>
                              <div className="php-victory-stat-label">Score</div>
                            </div>
                            <div className="php-victory-stat">
                              <div className="php-victory-stat-value">16/16</div>
                              <div className="php-victory-stat-label">Levels</div>
                            </div>
                            <div className="php-victory-stat">
                              <div className="php-victory-stat-value">{hintsUsed}</div>
                              <div className="php-victory-stat-label">Hints</div>
                            </div>
                          </div>
                          <button type="button" className="php-complete-btn" onClick={replay}>
                            Play Again
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="php-stars">
                            <span className="php-star earned">⭐</span>
                            <span className="php-star earned">⭐</span>
                            <span className="php-star earned">⭐</span>
                          </div>
                          <div className="php-complete-text">Level Complete!</div>
                          <div className="php-complete-sub">Output matches exactly. Nice work.</div>
                          <div className="php-complete-msg">
                            +{current?.points ?? 0} XP · Saved to your profile
                          </div>
                          <button
                            type="button"
                            className="php-complete-btn"
                            onClick={() => goLevel(currentIdx + 1)}
                          >
                            Next Level →
                          </button>
                        </>
                      )}
                    </div>
                  )}
              </div>

              <div className="game-shell-dots">
                {levels.map((l, i) => {
                  const doneLevel = !!gameState.completed[l.id - 1];
                  const isCurrent = currentIdx === i;
                  const locked = !doneLevel && !tierOpenFor(levels, gameState.completed, l.tier);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      disabled={locked}
                      title={`${l.id}. ${l.title}`}
                      className={
                        "php-progress-dot " +
                        (isCurrent ? "current" : "") +
                        (doneLevel ? " done" : "") +
                        (locked ? " locked" : "")
                      }
                      onClick={() => goLevel(i)}
                    >
                      {doneLevel ? <Check className="h-3 w-3" /> : locked ? <Lock className="h-3 w-3" /> : l.id}
                    </button>
                  );
                })}
              </div>

              <div className="php-hint-bar">
                <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                <span>
                  Use <strong>Run PHP</strong> to try your script live and{" "}
                  <strong>Check</strong> when you think the output matches.{" "}
                  <strong>Show Hint</strong> reveals a nudge — you get 3 hints per day.
                </span>
              </div>
            </div>
          </div>
        )}
    </GameShell>

    <MobileActionBar />

    <AuthModal
      open={showAuthModal}
      initialMode={authRequest}
      onClose={() => setShowAuthModal(false)}
    />
    </>
  );
}