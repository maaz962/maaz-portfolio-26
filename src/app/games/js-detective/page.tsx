"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  FolderOpen,
  Gamepad2,
  Lock,
  Sparkles,
  Terminal,
  Trash2,
} from "lucide-react";
import { GameShell } from "@/components/games/game-shell";
import { AuthGate } from "@/components/games/auth-gate";
import { AuthModal } from "@/components/games/auth-modal";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/lib/auth-context";
import "./game.css";

const GAME_SLUG = "js-detective";
const FALLBACK_TOTAL_LEVELS = 18;

interface JsLevelMeta {
  id: number;
  title: string;
  tier: string;
  concepts: string[];
  points: number;
  isFinal: boolean;
  shortDesc: string;
}

interface JsGameState {
  /** Stable 1-based id of the currently open case (not a positional index). */
  currentLevel: number;
  score: number;
  /** Stable 1-based case id -> completed (id-keyed so a reorder can't misalign). */
  completed: Record<number, boolean>;
  totalLevels: number;
}

const TIER_ORDER = ["beginner", "easy", "intermediate", "mostHard"];

const TIER_META = [
  { key: "beginner", label: "Beginner", blurb: "First steps — console.log, strings, numbers and variables." },
  { key: "easy", label: "Easy", blurb: "Warm-up — variables, types, operators and control flow." },
  { key: "intermediate", label: "Intermediate", blurb: "Clues tighten — loops, arrays, functions and objects." },
  { key: "mostHard", label: "Most Hard", blurb: "Final stretch — events, BOM and async bring the boss fight." },
];

const CONCEPT_LABELS: Record<string, string> = {
  console: "console.log",
  strings: "Strings",
  numbers: "Numbers",
  variables: "Variables",
  "data-types": "Data types",
  operators: "Operators",
  "control-flow": "if/else switch",
  loops: "Loops",
  functions: "Functions",
  "arrow-functions": "Arrows",
  arrays: "Arrays",
  objects: "Objects",
  dom: "DOM",
  events: "Events",
  bom: "BOM",
  async: "Async",
};

function tierLevelsFor(levels: JsLevelMeta[], tierKey: string): JsLevelMeta[] {
  return levels.filter((l) => l.tier === tierKey);
}

function tierDoneFor(
  levels: JsLevelMeta[],
  completed: Record<number, boolean>,
  tierKey: string
): number {
  return tierLevelsFor(levels, tierKey).filter((l) => completed[l.id]).length;
}

function tierOpenFor(
  levels: JsLevelMeta[],
  completed: Record<number, boolean>,
  tierKey: string
): boolean {
  const ti = TIER_ORDER.indexOf(tierKey);
  if (ti <= 0) return true;
  const prev = TIER_ORDER[ti - 1] ?? "";
  const prevLevels = tierLevelsFor(levels, prev);
  const need = Math.max(1, prevLevels.length - 1);
  return prevLevels.length === 0 || tierDoneFor(levels, completed, prev) >= need;
}

function lockNoteFor(
  levels: JsLevelMeta[],
  completed: Record<number, boolean>,
  tierKey: string
): string {
  const ti = TIER_ORDER.indexOf(tierKey);
  if (ti <= 0) return "";
  const prev = TIER_ORDER[ti - 1] ?? "";
  const prevLevels = tierLevelsFor(levels, prev);
  const need = Math.max(1, prevLevels.length - 1);
  const left = Math.max(0, need - tierDoneFor(levels, completed, prev));
  const label = TIER_META.find((t) => t.key === prev)?.label || prev;
  return `Solve ${left} more ${label} case${left === 1 ? "" : "s"} to unlock this tier.`;
}

function tierLegendFor(levels: JsLevelMeta[]): string {
  const parts: string[] = [];
  for (let ti = 1; ti < TIER_ORDER.length; ti++) {
    const prev = TIER_ORDER[ti - 1] ?? "";
    const next = TIER_ORDER[ti] ?? "";
    const prevLevels = tierLevelsFor(levels, prev);
    if (!prevLevels.length) continue;
    const need = Math.max(1, prevLevels.length - 1);
    const prevLabel = TIER_META.find((t) => t.key === prev)?.label || prev;
    const nextLabel = TIER_META.find((t) => t.key === next)?.label || next;
    parts.push(`Solve ${need} of ${prevLevels.length} ${prevLabel} cases to unlock ${nextLabel}`);
  }
  return parts.join(". ");
}

export default function JsDetectivePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [levels, setLevels] = useState<JsLevelMeta[]>([]);
  const [gameState, setGameState] = useState<JsGameState>({
    currentLevel: 0,
    score: 0,
    completed: {},
    totalLevels: FALLBACK_TOTAL_LEVELS,
  });

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed && Boolean(currentUser),
    initKey: "__initJsDetective",
    resumeKey: "__resumeJsDetective",
    emitterKey: "__onJsDetectiveProgress",
  });

  useEffect(() => {
    if (!gamesAuthed) return;
    const w = window as any;
    let alive = true;
    let levelsTimer: ReturnType<typeof setTimeout> | undefined;
    let stateTimer: ReturnType<typeof setTimeout> | undefined;

    const pollLevels = () => {
      if (!alive) return;
      if (typeof w.__getJsDetectiveLevels === "function") {
        const meta = w.__getJsDetectiveLevels();
        if (Array.isArray(meta) && meta.length) {
          setLevels(meta);
        } else {
          // Engine is up but level data not parsed yet — keep polling.
          levelsTimer = setTimeout(pollLevels, 120);
        }
      } else {
        levelsTimer = setTimeout(pollLevels, 100);
      }
    };

    const pullState = () => {
      if (!alive) return;
      if (typeof w.__getJsDetectiveState === "function") {
        const s = w.__getJsDetectiveState();
        if (s && s.totalLevels > 0) {
          setGameState({ ...gameState, ...s });
        } else {
          stateTimer = setTimeout(pullState, 120);
        }
      } else {
        stateTimer = setTimeout(pullState, 120);
      }
    };

    const onState = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) setGameState(detail);
    };

    pollLevels();
    const bootTimer = setTimeout(pullState, 150);
    window.addEventListener("jsd-state", onState);
    return () => {
      alive = false;
      clearTimeout(levelsTimer);
      clearTimeout(stateTimer);
      clearTimeout(bootTimer);
      window.removeEventListener("jsd-state", onState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesAuthed]);

  return (
    <>
    <GameShell
      title="JS Detective"
      tagline="Solve JavaScript mysteries — variables, loops, arrays &amp; more"
      icon={<span className="text-xl">🕵️</span>}
      iconClass="bg-amber-500/10 text-amber-500"
      scriptSrc={["/games/js-detective/levels.js", "/games/js-detective/game.js"]}
      doneCount={levels.filter((l) => gameState.completed[l.id]).length}
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
              <div className="jsd-level-select">
                <button
                  type="button"
                  className={"jsd-level-select-toggle" + (showLevelSelect ? " open" : "")}
                  aria-expanded={showLevelSelect}
                  onClick={() => setShowLevelSelect((v) => !v)}
                >
                  <span className="jsd-ls-label">
                    <FolderOpen className="h-3 w-3" />
                    All Levels
                  </span>
                  <span className="jsd-ls-count">
                    {levels.filter((l) => gameState.completed[l.id]).length}/{gameState.totalLevels}
                  </span>
                  <ChevronDown
                    className={"jsd-ls-chevron" + (showLevelSelect ? " open" : "")}
                  />
                </button>

                {showLevelSelect && (
                  <div className="jsd-level-select-body">
                    {TIER_META.map((tier) => {
                      const ls = tierLevelsFor(levels, tier.key);
                      const done = tierDoneFor(levels, gameState.completed, tier.key);
                      const open = tierOpenFor(levels, gameState.completed, tier.key);
                      return (
                        <div
                          key={tier.key}
                          className={"jsd-tier-group " + tier.key + (open ? "" : " closed")}
                        >
                          <div className="jsd-tier-head">
                            <span className="jsd-tier-name">{tier.label}</span>
                            <span className="jsd-tier-count">
                              {done}/{ls.length}
                            </span>
                          </div>
                          <div className="jsd-tier-blurb">
                            {open ? tier.blurb : lockNoteFor(levels, gameState.completed, tier.key)}
                          </div>
                          <div className="jsd-level-grid">
                            {ls.map((level) => {
                              const doneLevel = !!gameState.completed[level.id];
                              const current = gameState.currentLevel === level.id;
                              const locked = !doneLevel && !tierOpenFor(levels, gameState.completed, level.tier);
                              return (
                                <button
                                  key={level.id}
                                  type="button"
                                  disabled={locked}
                                  className={
                                    "jsd-level-card " +
                                    level.tier +
                                    (doneLevel ? " done" : "") +
                                    (current ? " current" : "")
                                  }
                                  title={level.shortDesc || level.title}
                                  onClick={() => {
                                    const win = window as any;
                                    if (typeof win.__goToJsDetectiveLevel === "function") {
                                      win.__goToJsDetectiveLevel(level.id - 1);
                                    }
                                    setShowLevelSelect(false);
                                  }}
                                >
                                  <span className="jsd-lk-num">
                                    {doneLevel ? (
                                      <Check className="jsd-lk-check" />
                                    ) : locked ? (
                                      <Lock className="jsd-lk-lock" />
                                    ) : (
                                      level.id
                                    )}
                                  </span>
                                  <span className="jsd-lk-title">{level.title}</span>
                                  <span className="jsd-lk-meta">
                                    {level.concepts.slice(0, 3).map((c) => (
                                      <span key={c} className="jsd-concept-chip">
                                        {CONCEPT_LABELS[c] || c}
                                      </span>
                                    ))}
                                    <span className="jsd-lk-points">+{level.points} XP</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <div className="jsd-ls-legend">
                      {tierLegendFor(levels)}
                    </div>
                  </div>
                )}
              </div>

              {/* Level Info */}
              <div className="jsd-level-info">
                <div className="jsd-level-header">
                  <span className="jsd-level-badge">
                    <Gamepad2 className="h-3 w-3" />
                    Level <span id="level-number">1</span>
                    <span className="text-muted">/</span>
                    <span id="level-total">{gameState.totalLevels}</span>
                  </span>
                  <span
                    id="level-difficulty"
                    className="jsd-level-difficulty beginner"
                  >
                    Beginner
                  </span>
                </div>
                <h2
                  id="level-title"
                  className="font-display text-sm font-bold text-foreground"
                >
                  Hello, Detective!
                </h2>
                <p id="level-instruction" className="jsd-instruction mt-1">
                  Use <code>console.log</code> to print the message &quot;Ready!&quot;
                </p>
                <div id="level-hint" className="jsd-hint">
                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  <span>
                    Inside your code, write{" "}
                    <code>console.log(&quot;Ready!&quot;)</code>
                  </span>
                </div>
                <div id="jsd-solved-note" className="jsd-solved-note" hidden />
              </div>

              {/* Code Editor */}
              <div className="jsd-editor">
                <div className="jsd-editor-header">
                  <div className="jsd-editor-dots">
                    <span className="jsd-editor-dot red" />
                    <span className="jsd-editor-dot yellow" />
                    <span className="jsd-editor-dot green" />
                  </div>
                  <div className="jsd-editor-title-row">
                    <span className="jsd-editor-title">solution.js</span>
                    <button
                      id="clear-btn"
                      type="button"
                      className="jsd-editor-clear"
                      title="Clear code"
                      aria-label="Clear code"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="jsd-editor-body game-shell-editor-body">
                  <div id="jsd-line-numbers" className="jsd-line-numbers">
                    1<br />2<br />3<br />4<br />5<br />6<br />7<br />8
                  </div>
                  <div className="jsd-code-area">
                    <pre
                      id="jsd-highlight"
                      className="jsd-editor-highlight"
                      aria-hidden="true"
                    ></pre>
                    <textarea
                      id="js-editor"
                      className="jsd-editor-textarea game-shell-currentline"
                      placeholder="Write your JavaScript here..."
                      autoFocus
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    <div id="jsd-editor-hint" className="jsd-editor-hint">
                      Type your JavaScript solution...
                    </div>
                  </div>
                </div>
                <div id="jsd-result" className="jsd-result" role="status" hidden />
                <div id="toast" className="jsd-status-toast" aria-live="polite" role="status" />
                <div className="jsd-editor-actions">
                  <button
                    id="run-btn"
                    type="button"
                    className="jsd-run-btn"
                  >
                    <Terminal className="h-3 w-3" />
                    Run
                  </button>
                  <div className="jsd-nav-buttons">
                    <button
                      id="prev-btn"
                      type="button"
                      className="jsd-nav-btn prev"
                      disabled
                    >
                      ← Prev
                    </button>
                    <button
                      id="check-btn"
                      type="button"
                      className="jsd-check-btn"
                    >
                      Check
                    </button>
                    <button
                      id="next-btn"
                      type="button"
                      className="jsd-nav-btn next"
                      disabled
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT GAME AREA */}
            <div className="game-shell-panel">
              <div className="jsd-console-container">
                <div className="jsd-console-header">
                  <div className="jsd-console-tabs">
                    <button className="jsd-console-tab active">Console</button>
                  </div>
                  <div className="jsd-score">
                    <span id="score-display" className="jsd-score-value">
                      Score: 0 XP
                    </span>
                  </div>
                </div>
                <div id="jsd-console" className="jsd-console" />
                <div
                  id="overlay"
                  className="jsd-complete-overlay"
                  style={{ display: "none" }}
                >
                  <div className="jsd-stars">
                    <span className="jsd-star earned">⭐</span>
                    <span className="jsd-star earned">⭐</span>
                    <span className="jsd-star earned">⭐</span>
                  </div>
                  <div className="jsd-complete-text">Level Complete!</div>
                  <div className="jsd-complete-sub">
                    Great work, detective!
                  </div>
                  <div className="jsd-complete-msg"></div>
                  <button
                    type="button"
                    className="jsd-complete-btn overlay-btn"
                  >
                    Next Level →
                  </button>
                </div>
              </div>
              <div id="progress-dots" className="game-shell-dots" />
              <div className="jsd-hint-bar">
                <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                <span>
                  Use <strong>Run</strong> to test your code and{" "}
                  <strong>Check</strong> when you think you&apos;ve solved the case.
                </span>
              </div>
            </div>
          </div>
        )}
    </GameShell>

    <AuthModal
      open={showAuthModal}
      initialMode={authRequest}
      onClose={() => setShowAuthModal(false)}
    />
    </>
  );
}
