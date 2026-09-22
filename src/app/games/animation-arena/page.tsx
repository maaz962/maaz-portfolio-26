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
} from "lucide-react";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { AuthGate } from "@/components/games/auth-gate";
import { AuthModal } from "@/components/games/auth-modal";
import { GameSocial } from "@/components/games/game-social";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/lib/auth-context";
import "./game.css";

const GAME_SLUG = "animation-arena";
const FALLBACK_TOTAL_LEVELS = 12;

interface ArenaLevelMeta {
  id: number;
  title: string;
  tier: string;
  concepts: string[];
  points: number;
  isFinal: boolean;
}

interface ArenaGameState {
  currentLevel: number;
  score: number;
  completed: Record<number, boolean>;
  totalLevels: number;
}

const TIER_ORDER = ["beginner", "intermediate"];

const TIER_META = [
  {
    key: "beginner",
    label: "Beginner",
    blurb: "First steps — transitions, transforms and one keyframe loop.",
  },
  {
    key: "intermediate",
    label: "Intermediate",
    blurb: "Delays, direction and hover — fine-tune your motion.",
  },
];

const CONCEPT_LABELS: Record<string, string> = {
  transition: "Transition",
  transform: "Transform",
  translate: "translate",
  rotate: "rotate",
  scale: "scale",
  animation: "Animation",
  keyframes: "Keyframes",
  iteration: "iteration-count",
  shorthand: "shorthand",
  timing: "timing",
  duration: "duration",
  delay: "delay",
  "animation-delay": "animation-delay",
  "animation-direction": "animation-direction",
  hover: "hover",
};

function tierLevelsFor(levels: ArenaLevelMeta[], tierKey: string): ArenaLevelMeta[] {
  return levels.filter((l) => l.tier === tierKey);
}

function tierDoneFor(
  levels: ArenaLevelMeta[],
  completed: Record<number, boolean>,
  tierKey: string
): number {
  return tierLevelsFor(levels, tierKey).filter((l) => completed[l.id - 1]).length;
}

function tierOpenFor(
  levels: ArenaLevelMeta[],
  completed: Record<number, boolean>,
  tierKey: string
): boolean {
  const ti = TIER_ORDER.indexOf(tierKey);
  if (ti <= 0) return true;
  const prev = TIER_ORDER[ti - 1] ?? "";
  const prevLevels = tierLevelsFor(levels, prev);
  // Arena levels unlock strictly in sequence, so a tier opens only once every
  // preceding level is complete.
  return prevLevels.length === 0 || tierDoneFor(levels, completed, prev) >= prevLevels.length;
}

function lockNoteFor(
  levels: ArenaLevelMeta[],
  completed: Record<number, boolean>,
  tierKey: string
): string {
  const ti = TIER_ORDER.indexOf(tierKey);
  if (ti <= 0) return "";
  const prev = TIER_ORDER[ti - 1] ?? "";
  const prevLevels = tierLevelsFor(levels, prev);
  const need = prevLevels.length - tierDoneFor(levels, completed, prev);
  const label = TIER_META.find((t) => t.key === prev)?.label || prev;
  return `Solve ${Math.max(0, need)} more ${label} challenge${need === 1 ? "" : "s"} to unlock this tier.`;
}

function tierLegendFor(levels: ArenaLevelMeta[]): string {
  const parts: string[] = [];
  for (let ti = 1; ti < TIER_ORDER.length; ti++) {
    const prev = TIER_ORDER[ti - 1] ?? "";
    const next = TIER_ORDER[ti] ?? "";
    const prevLevels = tierLevelsFor(levels, prev);
    if (!prevLevels.length) continue;
    const prevLabel = TIER_META.find((t) => t.key === prev)?.label || prev;
    const nextLabel = TIER_META.find((t) => t.key === next)?.label || next;
    parts.push(`Solve all ${prevLevels.length} ${prevLabel} challenges to unlock ${nextLabel}`);
  }
  return parts.join(". ");
}

export default function AnimationArenaPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [levels, setLevels] = useState<ArenaLevelMeta[]>([]);
  const [hintLeft, setHintLeft] = useState<number | null>(null);
  const [gameState, setGameState] = useState<ArenaGameState>({
    currentLevel: 0,
    score: 0,
    completed: {},
    totalLevels: FALLBACK_TOTAL_LEVELS,
  });

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed && Boolean(currentUser),
    initKey: "__initAnimationArena",
    resumeKey: "__resumeAnimationArena",
    emitterKey: "__onAnimationArenaProgress",
  });

  // Wire up the engine's hint request handler once. The engine never unlocks
  // hints itself — only a successful POST to /api/games/hints reveals one,
  // keeping the shared daily budget server-authoritative.
  useEffect(() => {
    const w = window as any;
    w.__onAnimationArenaHintRequest = async (index: number) => {
      try {
        const res = await fetch("/api/games/hints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data && data.ok) {
          if (typeof w.__animationArenaShowHint === "function") {
            w.__animationArenaShowHint(index);
          }
          if (typeof w.__animationArenaSetHintLeft === "function") {
            w.__animationArenaSetHintLeft(data.left);
          }
          setHintLeft(data.left);
        } else {
          if (typeof w.__animationArenaToast === "function") {
            w.__animationArenaToast(
              (data && data.error) || "No hints left today — come back tomorrow!",
              true
            );
          }
        }
      } catch {
        if (typeof w.__animationArenaToast === "function") {
          w.__animationArenaToast("Couldn't reach the hint service. Try again.", true);
        }
      }
    };
  }, []);

  // Pull the remaining daily hint budget when the user's session is ready.
  useEffect(() => {
    if (!gamesAuthed) return;
    let alive = true;
    fetch("/api/games/hints")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        if (data && typeof data.left === "number") {
          setHintLeft(data.left);
          const w = window as any;
          if (typeof w.__animationArenaSetHintLeft === "function") {
            w.__animationArenaSetHintLeft(data.left);
          }
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [gamesAuthed]);

  useEffect(() => {
    if (!gamesAuthed) return;
    const w = window as any;
    let alive = true;
    let levelsTimer: ReturnType<typeof setTimeout> | undefined;
    let stateTimer: ReturnType<typeof setTimeout> | undefined;

    const pollLevels = () => {
      if (!alive) return;
      if (typeof w.__getAnimationArenaLevels === "function") {
        const meta = w.__getAnimationArenaLevels();
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
      if (typeof w.__getAnimationArenaState === "function") {
        const s = w.__getAnimationArenaState();
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
    window.addEventListener("aaa-state", onState);
    return () => {
      alive = false;
      clearTimeout(levelsTimer);
      clearTimeout(stateTimer);
      clearTimeout(bootTimer);
      window.removeEventListener("aaa-state", onState);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Animation Arena
            </h1>
            <p className="text-xs text-muted">
              Bring robots to life with CSS transitions, transforms &amp; keyframes
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
          <div className="aaa-game-wrapper">
            {/* LEFT SIDEBAR */}
            <div className="aaa-sidebar">
              {/* Level Select Drawer */}
              <div className="aaa-level-select">
                <button
                  type="button"
                  className={"aaa-level-select-toggle" + (showLevelSelect ? " open" : "")}
                  aria-expanded={showLevelSelect}
                  onClick={() => setShowLevelSelect((v) => !v)}
                >
                  <span className="aaa-ls-label">
                    <FolderOpen className="h-3 w-3" />
                    All Levels
                  </span>
                  <span className="aaa-ls-count">
                    {levels.filter((l) => gameState.completed[l.id - 1]).length}/{gameState.totalLevels}
                  </span>
                  <ChevronDown
                    className={"aaa-ls-chevron" + (showLevelSelect ? " open" : "")}
                  />
                </button>

                {showLevelSelect && (
                  <div className="aaa-level-select-body">
                    {TIER_META.map((tier) => {
                      const ls = tierLevelsFor(levels, tier.key);
                      const done = tierDoneFor(levels, gameState.completed, tier.key);
                      const open = tierOpenFor(levels, gameState.completed, tier.key);
                      return (
                        <div
                          key={tier.key}
                          className={"aaa-tier-group " + tier.key + (open ? "" : " closed")}
                        >
                          <div className="aaa-tier-head">
                            <span className="aaa-tier-name">{tier.label}</span>
                            <span className="aaa-tier-count">
                              {done}/{ls.length}
                            </span>
                          </div>
                          <div className="aaa-tier-blurb">
                            {open ? tier.blurb : lockNoteFor(levels, gameState.completed, tier.key)}
                          </div>
                          <div className="aaa-level-grid">
                            {ls.map((level) => {
                              const doneLevel = !!gameState.completed[level.id - 1];
                              const current = gameState.currentLevel === level.id - 1;
                              const prevDone =
                                level.id === 1 ||
                                !!gameState.completed[level.id - 2];
                              const locked = !doneLevel && !prevDone;
                              return (
                                <button
                                  key={level.id}
                                  type="button"
                                  disabled={locked}
                                  className={
                                    "aaa-level-card " +
                                    level.tier +
                                    (doneLevel ? " done" : "") +
                                    (current ? " current" : "")
                                  }
                                  title={level.title}
                                  onClick={() => {
                                    const win = window as any;
                                    if (typeof win.__goToAnimationArenaLevel === "function") {
                                      win.__goToAnimationArenaLevel(level.id - 1);
                                    }
                                    setShowLevelSelect(false);
                                  }}
                                >
                                  <span className="aaa-lk-num">
                                    {doneLevel ? (
                                      <Check className="aaa-lk-check" />
                                    ) : locked ? (
                                      <Lock className="aaa-lk-lock" />
                                    ) : (
                                      level.id
                                    )}
                                  </span>
                                  <span className="aaa-lk-title">{level.title}</span>
                                  <span className="aaa-lk-meta">
                                    {level.concepts.slice(0, 3).map((c) => (
                                      <span key={c} className="aaa-concept-chip">
                                        {CONCEPT_LABELS[c] || c}
                                      </span>
                                    ))}
                                    <span className="aaa-lk-points">+{level.points} XP</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <div className="aaa-ls-legend">
                      {tierLegendFor(levels)}
                    </div>
                  </div>
                )}
              </div>

              {/* Level Info */}
              <div className="aaa-level-info">
                <div className="aaa-level-header">
                  <span className="aaa-level-badge">
                    <Gamepad2 className="h-3 w-3" />
                    Level <span id="level-number">1</span>
                    <span className="text-muted">/</span>
                    <span id="level-total">{gameState.totalLevels}</span>
                  </span>
                  <span
                    id="level-difficulty"
                    className="aaa-level-difficulty beginner"
                  >
                    Beginner
                  </span>
                </div>
                <h2
                  id="level-title"
                  className="aaa-level-title font-display"
                >
                  First Fade
                </h2>
                <p id="level-instruction" className="aaa-instruction mt-1">
                  Right now the robot snaps on and off. Add a{" "}
                  <code>transition</code> so the color change fades in smoothly!
                </p>
                <div id="level-hint" className="aaa-hint" hidden />
                <div id="aaa-solved-note" className="aaa-solved-note" hidden />
              </div>

              {/* Code Editor */}
              <div className="aaa-editor">
                <div className="aaa-editor-header">
                  <div className="aaa-editor-dots">
                    <span className="aaa-editor-dot red" />
                    <span className="aaa-editor-dot yellow" />
                    <span className="aaa-editor-dot green" />
                  </div>
                  <span className="aaa-editor-title">style.css</span>
                  <span
                    className="aaa-editor-target-badge"
                    role="note"
                    aria-label="This CSS targets the arena robot"
                  >
                    <span className="aaa-editor-target-dot" aria-hidden="true" />
                    target: robot
                  </span>
                </div>
                <div className="aaa-editor-body">
                  <div id="aaa-line-numbers" className="aaa-line-numbers">
                    1<br />2<br />3<br />4<br />5<br />6
                  </div>
                  <div className="aaa-code-area">
                    <div className="aaa-editor-prefix" aria-hidden="true">
                      <code>#board {"{"}</code>
                    </div>
                    <textarea
                      id="css-editor"
                      className="aaa-editor-textarea"
                      placeholder="transition: background-color 0.4s"
                      autoFocus
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                  </div>
                </div>
                <div id="aaa-editor-hint" className="aaa-editor-hint">
                  Type a CSS property like <code>transition: ...</code>
                </div>
                <div id="toast" className="aaa-status-toast" />
                <div className="aaa-editor-actions">
                  <button
                    id="reset-btn"
                    type="button"
                    className="aaa-reset-btn"
                  >
                    ↺ Reset
                  </button>
                  <button id="run-btn" type="button" className="aaa-run-btn">
                    ▶ Run
                  </button>
                  <div className="aaa-nav-buttons">
                    <button
                      id="prev-btn"
                      type="button"
                      className="aaa-nav-btn prev"
                      disabled
                    >
                      ← Prev
                    </button>
                    <button
                      id="check-btn"
                      type="button"
                      className="aaa-check-btn"
                    >
                      ✓ Check
                    </button>
                    <button
                      id="next-btn"
                      type="button"
                      className="aaa-nav-btn next"
                      disabled
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT GAME AREA */}
            <div className="aaa-game-area">
              <div className="aaa-board-container">
                <div className="aaa-board-header">
                  <div className="aaa-board-topline">
                    <span className="aaa-board-title">Board</span>
                    <div className="aaa-score">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span id="score-display">Score: 0</span>
                    </div>
                  </div>
                </div>
                <div id="arena-board" className="aaa-board" />
                <div
                  id="overlay"
                  className="aaa-complete-overlay"
                  style={{ display: "none" }}
                >
                  <div id="aaa-stars" className="aaa-stars">
                    <span className="aaa-star">⭐</span>
                    <span className="aaa-star">⭐</span>
                    <span className="aaa-star">⭐</span>
                  </div>
                  <div className="aaa-complete-text" id="aaa-complete-text">
                    Level Complete!
                  </div>
                  <div className="aaa-complete-sub">
                    Great job! You solved it!
                  </div>
                  <div className="aaa-complete-msg"></div>
                  <button
                    type="button"
                    className="aaa-complete-btn overlay-btn"
                  >
                    Next Level →
                  </button>
                </div>
              </div>
              <div id="progress-dots" className="aaa-progress" />
              <div className="aaa-hint-bar">
                <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                <span>
                  <strong>Hint:</strong> press Run to watch your CSS play live on
                  the robot — every <code>#board</code> rule targets it. Press{" "}
                  Check to validate against the goal.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* LIKE + COMMENTS */}
        <GameSocial
          slug={GAME_SLUG}
          title="Animation Arena"
          emoji="🤖"
          accentText="text-purple-400"
          accentBg="bg-purple-400/10"
          currentUser={currentUser}
          canInteract={canInteract}
          onAuthRequired={openAuthModal}
        />
      </main>

      <Script src="/games/animation-arena/game.js" strategy="afterInteractive" />

      <AuthModal
        open={showAuthModal}
        initialMode={authRequest}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}