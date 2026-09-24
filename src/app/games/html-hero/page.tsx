"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  FolderOpen,
  Gamepad2,
  Sparkles,
  Terminal,
  Trash2,
} from "lucide-react";
import { GameShell } from "@/components/games/game-shell";
import { LineNumbers } from "@/components/games/line-numbers";
import { AuthGate } from "@/components/games/auth-gate";
import { AuthModal } from "@/components/games/auth-modal";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/lib/auth-context";
import "./game.css";

const GAME_SLUG = "html-hero";
const TOTAL_LEVELS = 16;

interface HhLevelMeta {
  id: number;
  title: string;
  difficulty: string;
}

interface HhGameState {
  currentLevel: number;
  score: number;
  completed: Record<number, boolean>;
  totalLevels: number;
}

const DIFFICULTY_ORDER = ["easy", "intermediate", "advanced"];

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function HtmlHeroPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [levels, setLevels] = useState<HhLevelMeta[]>([]);
  const [gameState, setGameState] = useState<HhGameState>({
    currentLevel: 0,
    score: 0,
    completed: {},
    totalLevels: TOTAL_LEVELS,
  });

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed && Boolean(currentUser),
    initKey: "__initHtmlHero",
    resumeKey: "__resumeHtmlHero",
    emitterKey: "__onHtmlHeroProgress",
  });

  useEffect(() => {
    if (!gamesAuthed) return;
    const w = window as any;
    let alive = true;
    let levelsTimer: ReturnType<typeof setTimeout> | undefined;
    let stateTimer: ReturnType<typeof setTimeout> | undefined;

    const pollLevels = () => {
      if (!alive) return;
      if (typeof w.__getHtmlHeroLevels === "function") {
        const meta = w.__getHtmlHeroLevels();
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
      if (typeof w.__getHtmlHeroState === "function") {
        const s = w.__getHtmlHeroState();
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
    window.addEventListener("hh-state", onState);
    return () => {
      alive = false;
      clearTimeout(levelsTimer);
      clearTimeout(stateTimer);
      clearTimeout(bootTimer);
      window.removeEventListener("hh-state", onState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesAuthed]);

  return (
    <>
    <GameShell
      title="HTML Hero"
      tagline="Write real HTML tags, level by level, and become an HTML Master"
      icon={<span className="text-xl">🦸</span>}
      iconClass="bg-indigo-500/10 text-indigo-500"
      scriptSrc={["/games/html-hero/game.js"]}
      doneCount={levels.filter((l) => gameState.completed[l.id - 1]).length}
      totalLevels={gameState.totalLevels || TOTAL_LEVELS}
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
          {/* LEFT COLUMN */}
          <div className="game-shell-sidebar">
            {/* All Levels Drawer */}
            <div className="hh-level-select">
              <button
                type="button"
                className={"hh-level-select-toggle" + (showLevelSelect ? " open" : "")}
                aria-expanded={showLevelSelect}
                onClick={() => setShowLevelSelect((v) => !v)}
              >
                <span className="hh-ls-label">
                  <FolderOpen className="h-3 w-3" />
                  All Levels
                </span>
                <span className="hh-ls-count">
                  {levels.filter((l) => gameState.completed[l.id - 1]).length}/{gameState.totalLevels}
                </span>
                <ChevronDown
                  className={"hh-ls-chevron" + (showLevelSelect ? " open" : "")}
                />
              </button>

              {showLevelSelect && (
                <div className="hh-level-select-body">
                  {DIFFICULTY_ORDER.map((tierKey) => {
                    const tierLevels = levels.filter((l) => l.difficulty === tierKey);
                    if (!tierLevels.length) return null;
                    const doneCount = tierLevels.filter(
                      (l) => gameState.completed[l.id - 1]
                    ).length;
                    return (
                      <div key={tierKey} className={"hh-tier-group " + tierKey}>
                        <div className="hh-tier-head">
                          <span className="hh-tier-name">
                            {DIFFICULTY_LABELS[tierKey] || tierKey}
                          </span>
                          <span className="hh-tier-count">
                            {doneCount}/{tierLevels.length}
                          </span>
                        </div>
                        <div className="hh-level-grid">
                          {tierLevels.map((level) => {
                            const idx = level.id - 1;
                            const doneLevel = !!gameState.completed[idx];
                            const current = gameState.currentLevel === idx;
                            return (
                              <button
                                key={level.id}
                                type="button"
                                className={
                                  "hh-level-card " +
                                  level.difficulty +
                                  (doneLevel ? " done" : "") +
                                  (current ? " current" : "")
                                }
                                title={level.title}
                                onClick={() => {
                                  const win = window as any;
                                  if (typeof win.__goToHtmlHeroLevel === "function") {
                                    win.__goToHtmlHeroLevel(idx);
                                  }
                                  setShowLevelSelect(false);
                                }}
                              >
                                <span className="hh-lk-num">
                                  {doneLevel ? (
                                    <Check className="hh-lk-check" />
                                  ) : (
                                    level.id
                                  )}
                                </span>
                                <span className="hh-lk-title">{level.title}</span>
                                <span className="hh-lk-meta">
                                  <span className="hh-lk-diff">
                                    {DIFFICULTY_LABELS[level.difficulty] || level.difficulty}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div className="hh-ls-legend">
                    All levels are open - jump to any challenge. Every card is
                    clickable; Preview always reflects the level you pick.
                  </div>
                </div>
              )}
            </div>

            <div className="hh-level-info">
              <div className="hh-level-header">
                <span className="hh-level-badge">
                  <Gamepad2 className="h-3 w-3 icon" />
                  Level <span id="level-number">1</span>
                  <span className="text-muted">/</span>
                  <span>{TOTAL_LEVELS}</span>
                </span>
                <span id="level-difficulty" className="hh-difficulty easy">
                  Easy
                </span>
              </div>
              <h2 id="level-title" className="hh-level-title">
                Hello, World!
              </h2>
              <p id="level-instruction" className="hh-instruction mt-1">
                Write an h1 tag.
              </p>
              <div id="level-hint" className="hh-hint">
                <Sparkles className="icon h-3 w-3" />
                <span>Hint: your hint appears here.</span>
              </div>
              <div id="hh-solved-note" className="hh-solved-note" hidden />
            </div>

            <div className="hh-editor">
              <div className="hh-editor-header">
                <div className="hh-editor-dots">
                  <span className="hh-editor-dot red" />
                  <span className="hh-editor-dot yellow" />
                  <span className="hh-editor-dot green" />
                </div>
                <div className="hh-editor-title-row">
                  <span className="hh-editor-title">index.html</span>
                  <button
                    id="clear-btn"
                    type="button"
                    className="hh-editor-clear"
                    title="Clear code"
                    aria-label="Clear code"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="hh-editor-body game-shell-editor-body">
                <LineNumbers forId="html-editor" className="hh-line-numbers" />
                <textarea
                  id="html-editor"
                  className="hh-editor-textarea game-shell-currentline"
                  placeholder="Write your HTML here..."
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <div id="hh-result" className="hh-result" role="status" hidden />
              <div id="toast" className="hh-status-toast" aria-live="polite" role="status" />
              <div className="hh-editor-actions">
                <button id="run-btn" type="button" className="hh-btn hh-run-btn">
                  <Terminal className="h-3 w-3" />
                  Run
                </button>
                <div className="hh-nav-buttons">
                  <button id="prev-btn" type="button" className="hh-btn hh-nav-btn prev" disabled>
                    ← Prev
                  </button>
                  <button id="check-btn" type="button" className="hh-btn hh-check-btn">
                    Check
                  </button>
                  <button id="next-btn" type="button" className="hh-btn hh-nav-btn next">
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="game-shell-panel">
            <div className="hh-preview-panel" style={{ position: "relative" }}>
              <div className="hh-preview-header">
                <div className="hh-preview-tabs">
                  <button type="button" className="hh-preview-tab active">
                    <Check className="h-3 w-3" />
                    Preview
                  </button>
                </div>
                <div className="hh-score">
                  <span id="score-display">Score: 0 XP</span>
                </div>
              </div>

              <div className="hh-preview-frame-wrap">
                <iframe
                  id="html-preview"
                  className="hh-preview-frame"
                  title="HTML Hero live preview"
                  sandbox="allow-popups"
                />
              </div>

              <div className="hh-preview-note">
                <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                <span>
                  Your page renders here as you type. Press “Check” to see if you nailed the task.
                </span>
              </div>

              <div id="progress-dots" className="game-shell-dots" />

              <div id="overlay" className="hh-complete-overlay" style={{ display: "none" }}>
                <div className="hh-stars">
                  <span className="hh-star">⭐</span>
                  <span className="hh-star">⭐</span>
                  <span className="hh-star">⭐</span>
                </div>
                <div className="hh-complete-text">Level Complete!</div>
                <div className="hh-complete-sub">Great job, code wrangler!</div>
                <div className="hh-complete-msg"></div>
                <button type="button" className="hh-complete-btn overlay-btn">
                  Next Level →
                </button>
              </div>
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