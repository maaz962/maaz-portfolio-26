"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  ArrowLeft,
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
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { AuthGate } from "@/components/games/auth-gate";
import { AuthModal } from "@/components/games/auth-modal";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/lib/auth-context";
import "./game.css";

const GAME_SLUG = "query-quest";
const FALLBACK_TOTAL_LEVELS = 16;

interface QueryQuestLevelMeta {
  id: number;
  title: string;
  tier: "easy" | "intermediate" | "hard" | "mostHard";
  concept: string[];
  points: number;
  isFinal: boolean;
  shortDesc: string;
  instruction: string;
  hint: string;
  seedCode: string;
}

interface QueryQuestGameState {
  currentLevel: number;
  score: number;
  completed: Record<number, boolean>;
  solutions?: Record<number, string>;
  hints?: { date?: string; used: number };
  totalLevels: number;
  ready?: boolean;
  bootError?: string | null;
}

interface QueryOut {
  columns: string[];
  values: unknown[][];
  error: string | null;
  errorType?: string;
}

const TIER_ORDER = ["easy", "intermediate", "hard", "mostHard"];

const TIER_META = [
  { key: "easy", label: "Easy", blurb: "Warm-up — SELECT, WHERE, sorting and limits." },
  { key: "intermediate", label: "Intermediate", blurb: "Clues tighten — JOINs and the first aggregates." },
  { key: "hard", label: "Hard", blurb: "Real casework — subqueries and writing data." },
  { key: "mostHard", label: "Most Hard", blurb: "Final stretch — DELETE, revenue reports and the boss query." },
];

const CONCEPT_LABELS: Record<string, string> = {
  select: "SELECT",
  where: "WHERE",
  "order-by": "ORDER BY",
  limit: "LIMIT",
  "and-or": "AND / OR",
  join: "JOIN",
  "left-join": "LEFT JOIN",
  count: "COUNT",
  sum: "SUM",
  "group-by": "GROUP BY",
  subquery: "Subquery",
  insert: "INSERT",
  update: "UPDATE",
  delete: "DELETE",
  having: "HAVING",
  avg: "AVG",
};

/* ---- shared tier helpers (mirror js-detective) ---- */

function tierLevelsFor(levels: QueryQuestLevelMeta[], tierKey: string): QueryQuestLevelMeta[] {
  return levels.filter((l) => l.tier === tierKey);
}

function tierDoneFor(
  levels: QueryQuestLevelMeta[],
  completed: Record<number, boolean>,
  tierKey: string
): number {
  return tierLevelsFor(levels, tierKey).filter((l) => completed[l.id - 1]).length;
}

function tierOpenFor(
  levels: QueryQuestLevelMeta[],
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
  levels: QueryQuestLevelMeta[],
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

function tierLegendFor(levels: QueryQuestLevelMeta[]): string {
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

function displayValue(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  return String(v);
}

export default function QueryQuestPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [levels, setLevels] = useState<QueryQuestLevelMeta[]>([]);
  const [gameState, setGameState] = useState<QueryQuestGameState>({
    currentLevel: 0,
    score: 0,
    completed: {},
    totalLevels: FALLBACK_TOTAL_LEVELS,
  });
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [bootStatus, setBootStatus] = useState<"idle" | "booting" | "ready" | "error">("idle");
  const [bootMsg, setBootMsg] = useState("");
  const [queryOut, setQueryOut] = useState<QueryOut | null>(null);
  const [result, setResult] = useState<{ ok: boolean; label: string; detail?: string; score?: number } | null>(null);
  const [solved, setSolved] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [hintText, setHintText] = useState("");
  const [hintMsg, setHintMsg] = useState("");

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed,
    initKey: "__initQueryQuest",
    resumeKey: "__resumeQueryQuest",
    emitterKey: "__onQueryQuestProgress",
  });

  useEffect(() => {
    if (!gamesAuthed) return;
    const w = window as any;
    let alive = true;
    let levelsTimer: ReturnType<typeof setTimeout> | undefined;
    let stateTimer: ReturnType<typeof setTimeout> | undefined;

    const pollLevels = () => {
      if (!alive) return;
      if (typeof w.__getQueryQuestLevels === "function") {
        const meta = w.__getQueryQuestLevels();
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
      if (typeof w.__getQueryQuestState === "function") {
        const s = w.__getQueryQuestState();
        if (s && s.totalLevels > 0) {
          setGameState((g) => ({ ...g, ...s }));
          try {
            if (typeof w.__queryQuestBootState === "function") {
              const b = w.__queryQuestBootState();
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
        setBootMsg("Booting the SQL engine in your browser (WebAssembly)…");
      } else if (detail.status === "ready") {
        setBootStatus("ready");
        setBootMsg("");
      } else if (detail.status === "error") {
        setBootStatus("error");
        setBootMsg(detail.message || "SQL engine failed to boot.");
      }
    };
    const onState = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) setGameState((g) => ({ ...g, ...detail }));
    };

    pollLevels();
    pullState();
    window.addEventListener("query-quest-boot", onBoot);
    window.addEventListener("query-quest-state", onState);
    return () => {
      alive = false;
      clearTimeout(levelsTimer);
      clearTimeout(stateTimer);
      window.removeEventListener("query-quest-boot", onBoot);
      window.removeEventListener("query-quest-state", onState);
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
  const autoRunToken = useRef<number | null>(null);
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
      setQueryOut(null);
      setResult(null);
      setSolved(false);
      setHintRevealed(false);
      setHintText("");
      setHintMsg("");
    }
    const saved = gameState.completed[idx] ? gameState.solutions?.[idx] : undefined;
    const shouldHydrate =
      saved !== undefined &&
      hydratedForId.current !== current.id &&
      (levelChanged || code === current.seedCode);
    if (shouldHydrate) {
      // Revisiting an already-solved level re-runs their stored solution so the
      // result table they achieved is displayed again (the old equally-solved bug
      // from another game is not repeated here).
      hydratedForId.current = current.id;
      setCode(saved);
      autoRunToken.current = (autoRunToken.current ?? 0) + 1;
      const token = autoRunToken.current;
      const w = window as any;
      if (typeof w.__queryQuestRun === "function") {
        w.__queryQuestRun(idx, saved).then((r: QueryOut) => {
          if (autoRunToken.current === token) setQueryOut(r);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, gameState.completed?.[currentIdx], gameState.solutions?.[currentIdx]]);

  const goLevel = (idx: number) => {
    const w = window as any;
    if (typeof w.__goToQueryQuestLevel === "function") w.__goToQueryQuestLevel(idx);
    setShowLevelSelect(false);
  };

  const sqlErrorMessage = (r: QueryOut): string => {
    if (!r.error) return "";
    const m = String(r.error);
    if (r.errorType === "syntax") return `Syntax error: ${m}`;
    if (r.errorType === "table") return `Table not found — ${m}. Check the table names in the Mission.`;
    if (r.errorType === "column") return `Column not found — ${m}. Check the column names in the Mission.`;
    if (r.errorType === "function") return `Unknown function — ${m}.`;
    return m;
  };

  const renderQuery = (r: QueryOut) => {
    const err = sqlErrorMessage(r);
    if (!r.error && (!r.columns || r.columns.length === 0)) {
      return {
        columns: [],
        values: [],
        error: "Your query produced no table of results. Finish with a SELECT that returns rows.",
      };
    }
    return { columns: r.columns, values: r.values, error: err || null };
  };

  const run = async () => {
    const w = window as any;
    if (typeof w.__queryQuestRun !== "function") return;
    setRunning(true);
    setResult(null);
    setSolved(false);
    try {
      const r: QueryOut = await w.__queryQuestRun(currentIdx, code);
      const out = renderQuery(r);
      setQueryOut(out);
      if (r.error) {
        setResult({ ok: false, label: "SQL error", detail: sqlErrorMessage(r) });
      }
    } catch (e) {
      setResult({ ok: false, label: "Something went wrong", detail: String(e) });
    } finally {
      setRunning(false);
    }
  };

  const check = async () => {
    const w = window as any;
    if (typeof w.__queryQuestCheck !== "function") return;
    setRunning(true);
    setResult(null);
    setSolved(false);
    try {
      const r = await w.__queryQuestCheck(currentIdx, code);
      const isSqlError = r.errorType && r.errorType !== "wrong";
      setQueryOut(isSqlError ? { columns: [], values: [], error: r.error || null, errorType: r.errorType } : { columns: r.columns ?? [], values: r.values ?? [], error: null });
      if (r.ok) {
        setSolved(true);
        setResult({ ok: true, label: "Correct!", detail: "Result matches exactly. Nice work.", score: r.score });
      } else if (r.errorType === "wrong" && !r.error) {
        setResult({ ok: false, label: "Not quite", detail: "Your result doesn't match the target query output." });
      } else {
        setResult({
          ok: false,
          label: r.errorType === "wrong" ? "Not quite" : "SQL error",
          detail: r.error || `Expected the columns ${(r.expectedColumns || []).join(", ")}.`,
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
    if (typeof w.__queryQuestRevealHint !== "function") return;
    if (!current) return;
    setHintMsg("");
    try {
      const r = await w.__queryQuestRevealHint(currentIdx);
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
    if (typeof w.__initQueryQuest === "function") w.__initQueryQuest();
    setSolved(false);
    setResult(null);
    setQueryOut(null);
  };

  const hintRevealDisabled = Boolean(current && gameState.completed[currentIdx]) || hintsLeft === 0;
  const showSolvedNote = Boolean(current && gameState.completed[currentIdx]);

  return (
    <div className="relative min-h-screen bg-background">
      <GlassNavbar activeSection="games" />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28">
        <Link
          href="/games"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          All Games
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <span className="text-xl">🗃️</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Query Quest</h1>
            <p className="text-xs text-muted">
              Solve SQL challenges — SELECT, JOIN, aggregates &amp; the data-writing bosses
            </p>
          </div>
        </div>

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
          <div className="qq-game-wrapper">
            {/* LEFT SIDEBAR */}
            <div className="qq-sidebar">
              {/* Level Select Drawer */}
              <div className="qq-level-select">
                <button
                  type="button"
                  className={"qq-level-select-toggle" + (showLevelSelect ? " open" : "")}
                  aria-expanded={showLevelSelect}
                  onClick={() => setShowLevelSelect((v) => !v)}
                >
                  <span className="qq-ls-label">
                    <FolderOpen className="h-3 w-3" />
                    All Cases
                  </span>
                  <span className="qq-ls-count">
                    {levels.filter((l) => gameState.completed[l.id - 1]).length}/{gameState.totalLevels}
                  </span>
                  <ChevronDown className={"qq-ls-chevron" + (showLevelSelect ? " open" : "")} />
                </button>

                {showLevelSelect && (
                  <div className="qq-level-select-body">
                    {TIER_META.map((tier) => {
                      const ls = tierLevelsFor(levels, tier.key);
                      const done = tierDoneFor(levels, gameState.completed, tier.key);
                      const open = tierOpenFor(levels, gameState.completed, tier.key);
                      return (
                        <div
                          key={tier.key}
                          className={"qq-tier-group " + tier.key + (open ? "" : " closed")}
                        >
                          <div className="qq-tier-head">
                            <span className="qq-tier-name">{tier.label}</span>
                            <span className="qq-tier-count">
                              {done}/{ls.length}
                            </span>
                          </div>
                          <div className="qq-tier-blurb">
                            {open ? tier.blurb : lockNoteFor(levels, gameState.completed, tier.key)}
                          </div>
                          <div className="qq-level-grid">
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
                                    "qq-level-card " +
                                    level.tier +
                                    (doneLevel ? " done" : "") +
                                    (isCurrent ? " current" : "")
                                  }
                                  title={level.shortDesc || level.title}
                                  onClick={() => goLevel(level.id - 1)}
                                >
                                  <span className="qq-lk-num">
                                    {doneLevel ? (
                                      <Check className="qq-lk-check" />
                                    ) : locked ? (
                                      <Lock className="qq-lk-lock" />
                                    ) : (
                                      level.id
                                    )}
                                  </span>
                                  <span className="qq-lk-title">{level.title}</span>
                                  <span className="qq-lk-meta">
                                    {level.concept.slice(0, 3).map((c) => (
                                      <span key={c} className="qq-concept-chip">
                                        {CONCEPT_LABELS[c] || c}
                                      </span>
                                    ))}
                                    <span className="qq-lk-points">+{level.points} XP</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <div className="qq-ls-legend">{tierLegendFor(levels)}</div>
                  </div>
                )}
              </div>

              {/* Level Info */}
              {current && (
                <div className="qq-level-info">
                  <div className="qq-level-header">
                    <span className="qq-level-badge">
                      <Gamepad2 className="h-3 w-3" />
                      Level <span>{current.id}</span>
                      <span className="text-muted">/</span>
                      <span>{gameState.totalLevels}</span>
                    </span>
                    <span className={"qq-level-difficulty " + current.tier}>
                      {TIER_META.find((t) => t.key === current.tier)?.label ?? current.tier}
                    </span>
                  </div>
                  <h2 className="font-display text-sm font-bold text-foreground">{current.title}</h2>
                  <p className="qq-instruction mt-1" dangerouslySetInnerHTML={{ __html: current.instruction }} />

                  {hintRevealed && hintText && (
                    <div className="qq-hint">
                      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      <span dangerouslySetInnerHTML={{ __html: hintText }} />
                    </div>
                  )}
                  {!hintRevealed && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="qq-hint-reveal"
                        onClick={revealHint}
                        disabled={hintRevealDisabled}
                      >
                        <Lightbulb className="h-3 w-3" />
                        Show Hint
                      </button>
                      <div className="qq-hint-usage">
                        {hintMsg || `${hintsUsed}/3 hints used today`}
                      </div>
                    </div>
                  )}
                  {showSolvedNote && (
                    <div className="qq-solved-note">Solved! Answers are saved — you can return to this level anytime.</div>
                  )}
                </div>
              )}

              {/* Code Editor */}
              {current && (
                <div className="qq-editor">
                  <div className="qq-editor-header">
                    <div className="qq-editor-dots">
                      <span className="qq-editor-dot red" />
                      <span className="qq-editor-dot yellow" />
                      <span className="qq-editor-dot green" />
                    </div>
                    <div className="qq-editor-title-row">
                      <span className="qq-editor-title">solution.sql</span>
                      <button
                        type="button"
                        className="qq-editor-clear"
                        title="Clear code"
                        aria-label="Clear code"
                        onClick={() => setCode(current.seedCode)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="qq-editor-body">
                    <div className="qq-editor-wrap">
                      <CodeMirror
                        value={code}
                        height="320px"
                        theme={oneDark}
                        extensions={[sql()]}
                        onChange={(v) => setCode(v)}
                        editable={gamesAuthed}
                        basicSetup={{ lineNumbers: true, foldGutter: false }}
                        placeholder="Write your SQL query here…"
                      />
                    </div>
                  </div>

                  {result && (
                    <div className={"qq-result " + (result.ok ? "pass" : "fail")}>
                      <span className="qq-result-icon">
                        {result.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </span>
                      <span className="qq-result-body">
                        <strong>{result.label}</strong>
                        {result.score ? `+${result.score} XP` : null}
                        {result.detail && <pre>{result.detail}</pre>}
                      </span>
                    </div>
                  )}

                  <div className="qq-editor-actions">
                    <button
                      type="button"
                      className="qq-run-btn"
                      onClick={run}
                      disabled={running}
                    >
                      <Terminal className="h-3 w-3" />
                      {running ? "Running…" : "Run Query"}
                    </button>
                    <div className="qq-nav-buttons">
                      <button
                        type="button"
                        className="qq-nav-btn prev"
                        disabled={currentIdx === 0}
                        onClick={() => goLevel(currentIdx - 1)}
                      >
                        ← Prev
                      </button>
                      <button
                        type="button"
                        className="qq-check-btn"
                        onClick={check}
                        disabled={running}
                      >
                        Check
                      </button>
                      <button
                        type="button"
                        className="qq-nav-btn next"
                        disabled={!gameState.completed[currentIdx] || isLastLevel}
                        onClick={() => goLevel(currentIdx + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT GAME AREA */}
            <div className="qq-game-area">
              {bootStatus === "booting" && (
                <div className="qq-boot-strip">
                  <Terminal className="h-3 w-3 shrink-0 animate-spin" />
                  <span>{bootMsg}</span>
                </div>
              )}
              {bootStatus === "error" && (
                <div className="qq-boot-strip error">
                  <X className="h-3 w-3 shrink-0" />
                  <span>{bootMsg}</span>
                </div>
              )}

              <div className="qq-console-container">
                <div className="qq-console-header">
                  <div className="qq-console-tabs">
                    <button className="qq-console-tab active">Result</button>
                  </div>
                  <div className="qq-score">
                    <span className="qq-score-value">Score: {gameState.score}</span>
                    <span>XP</span>
                  </div>
                </div>
                <div className="qq-console">
                  {!queryOut || (queryOut.columns.length === 0 && !queryOut.error) ? (
                    <div className="qq-console-empty">
                      Result table appears here — hit Run Query to execute your SQL, or Check to test your answer.
                    </div>
                  ) : queryOut.error ? (
                    <div className="qq-console-error">
                      <X className="h-3 w-3 shrink-0" />
                      {queryOut.error}
                    </div>
                  ) : (
                    <div className="qq-console-table-wrap">
                      <table className="qq-console-table">
                        <thead>
                          <tr>
                            {queryOut.columns.map((c, i) => (
                              <th key={`${i}-${c}`}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryOut.values.map((row, i) => (
                            <tr key={i}>
                              {row.map((cell, j) => (
                                <td key={j}>{displayValue(cell)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {solved && (
                  <div className="qq-complete-overlay">
                    {isLastLevel ? (
                      <>
                        <div className="qq-stars">
                          <span className="qq-star earned">🏆</span>
                        </div>
                        <div className="qq-complete-text">SQL Master!</div>
                        <div className="qq-complete-sub">All 16 levels conquered.</div>
                        <div className="qq-victory-stats">
                          <div className="qq-victory-stat">
                            <div className="qq-victory-stat-value">{gameState.score}</div>
                            <div className="qq-victory-stat-label">Score</div>
                          </div>
                          <div className="qq-victory-stat">
                            <div className="qq-victory-stat-value">16/16</div>
                            <div className="qq-victory-stat-label">Levels</div>
                          </div>
                          <div className="qq-victory-stat">
                            <div className="qq-victory-stat-value">{hintsUsed}</div>
                            <div className="qq-victory-stat-label">Hints</div>
                          </div>
                        </div>
                        <button type="button" className="qq-complete-btn" onClick={replay}>
                          Play Again
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="qq-stars">
                          <span className="qq-star earned">⭐</span>
                          <span className="qq-star earned">⭐</span>
                          <span className="qq-star earned">⭐</span>
                        </div>
                        <div className="qq-complete-text">Case Solved!</div>
                        <div className="qq-complete-sub">Result matches exactly. Nice work.</div>
                        <div className="qq-complete-msg">
                          +{current?.points ?? 0} XP · Saved to your profile
                        </div>
                        <button
                          type="button"
                          className="qq-complete-btn"
                          onClick={() => goLevel(currentIdx + 1)}
                        >
                          Next Case →
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="qq-progress">
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
                        "qq-progress-dot " +
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

              <div className="qq-hint-bar">
                <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                <span>
                  Use <strong>Run Query</strong> to execute your SQL live and{" "}
                  <strong>Check</strong> when you think the result matches.{" "}
                  <strong>Show Hint</strong> reveals a nudge — you get 3 hints per day.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Script src="/games/query-quest/levels.js" strategy="afterInteractive" />
      <Script src="/games/query-quest/game.js" strategy="afterInteractive" />

      <AuthModal
        open={showAuthModal}
        initialMode={authRequest}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}