"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FolderOpen,
  Gamepad2,
  Lock,
  Sparkles,
  Terminal,
} from "lucide-react";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { AuthGate } from "@/components/games/auth-gate";
import { AuthModal } from "@/components/games/auth-modal";
import { GameSocial } from "@/components/games/game-social";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/lib/auth-context";
import "./game.css";

const GAME_SLUG = "js-detective";
const FALLBACK_TOTAL_LEVELS = 16;

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
  currentLevel: number;
  score: number;
  completed: Record<number, boolean>;
  totalLevels: number;
}

const TIER_ORDER = ["easy", "intermediate", "hard", "mostHard"];

const TIER_META = [
  { key: "easy", label: "Easy", blurb: "Warm-up — variables, types, operators and control flow." },
  { key: "intermediate", label: "Intermediate", blurb: "Clues tighten — loops, arrays, functions and objects." },
  { key: "hard", label: "Hard", blurb: "Real casework — modern syntax, higher-order arrays and the DOM." },
  { key: "mostHard", label: "Most Hard", blurb: "Final stretch — events, BOM and async bring the boss fight." },
];

const CONCEPT_LABELS: Record<string, string> = {
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
  return tierLevelsFor(levels, tierKey).filter((l) => completed[l.id - 1]).length;
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
  const need = prev === "hard" ? prevLevels.length : Math.max(1, prevLevels.length - 1);
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
  const need = prev === "hard" ? prevLevels.length : Math.max(1, prevLevels.length - 1);
  const left = Math.max(0, need - tierDoneFor(levels, completed, prev));
  const label = TIER_META.find((t) => t.key === prev)?.label || prev;
  return `Solve ${left} more ${label} case${left === 1 ? "" : "s"} to unlock this tier.`;
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
        if (Array.isArray(meta) && meta.length) setLevels(meta);
      } else {
        levelsTimer = setTimeout(pollLevels, 100);
      }
    };

    const pullState = () => {
      if (!alive) return;
      if (typeof w.__getJsDetectiveState === "function") {
        const s = w.__getJsDetectiveState();
        if (s) setGameState({ ...gameState, ...s });
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

  const openAuthModal = () => {
    setAuthRequest("login");
    setShowAuthModal(true);
  };

  const canInteract = Boolean(currentUser) && gamesAuthed;

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <span className="text-xl">🕵️</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              JS Detective
            </h1>
            <p className="text-xs text-muted">
              Solve JavaScript mysteries — variables, loops, arrays &amp; more
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
          <div className="jsd-game-wrapper">
            {/* LEFT SIDEBAR */}
            <div className="jsd-sidebar">
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
                    All Cases
                  </span>
                  <span className="jsd-ls-count">
                    {levels.filter((l) => gameState.completed[l.id - 1]).length}/{gameState.totalLevels}
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
                              const doneLevel = !!gameState.completed[level.id - 1];
                              const current = gameState.currentLevel === level.id - 1;
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
                      Solve 3 of 4 cases in a tier to unlock the next. All 4{" "}
                      <strong>Hard</strong> cases unlock <strong>Most Hard</strong>.
                    </div>
                  </div>
                )}
              </div>

              {/* Level Info */}
              <div className="jsd-level-info">
                <div className="jsd-level-header">
                  <span className="jsd-level-badge">
                    <Gamepad2 className="h-3 w-3" />
                    Case <span id="level-number">1</span>
                    <span className="text-muted">/</span>
                    <span id="level-total">{gameState.totalLevels}</span>
                  </span>
                  <span
                    id="level-difficulty"
                    className="jsd-level-difficulty easy"
                  >
                    Easy
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
              </div>

              {/* Code Editor */}
              <div className="jsd-editor">
                <div className="jsd-editor-header">
                  <div className="jsd-editor-dots">
                    <span className="jsd-editor-dot red" />
                    <span className="jsd-editor-dot yellow" />
                    <span className="jsd-editor-dot green" />
                  </div>
                  <span className="jsd-editor-title">solution.js</span>
                </div>
                <div className="jsd-editor-body">
                  <div id="jsd-line-numbers" className="jsd-line-numbers">
                    1<br />2<br />3<br />4<br />5<br />6<br />7<br />8
                  </div>
                  <div className="jsd-code-area">
                    <textarea
                      id="js-editor"
                      className="jsd-editor-textarea"
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
                <div id="toast" className="jsd-status-toast" />
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
            <div className="jsd-game-area">
              <div className="jsd-console-container">
                <div className="jsd-console-header">
                  <div className="jsd-console-tabs">
                    <button className="jsd-console-tab active">Console</button>
                  </div>
                  <div className="jsd-score">
                    <span id="score-display" className="jsd-score-value">
                      Score: 0
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
                  <div className="jsd-complete-text">Case Solved!</div>
                  <div className="jsd-complete-sub">
                    Great work, detective!
                  </div>
                  <div className="jsd-complete-msg"></div>
                  <button
                    type="button"
                    className="jsd-complete-btn overlay-btn"
                  >
                    Next Case →
                  </button>
                </div>
              </div>
              <div id="progress-dots" className="jsd-progress" />
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

        {/* LIKE + COMMENTS */}
        <GameSocial
          slug={GAME_SLUG}
          title="JS Detective"
          emoji="🕵️"
          accentText="text-amber-500"
          accentBg="bg-amber-500/10"
          currentUser={currentUser}
          canInteract={canInteract}
          onAuthRequired={openAuthModal}
        />
      </main>

      <Script src="/games/js-detective/levels.js" strategy="afterInteractive" />
      <Script src="/games/js-detective/game.js" strategy="afterInteractive" />

      <AuthModal
        open={showAuthModal}
        initialMode={authRequest}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
