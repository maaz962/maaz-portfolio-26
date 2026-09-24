"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  FolderOpen,
  Gamepad2,
  Lock,
  Sparkles,
  Trash2,
} from "lucide-react";
import { GameShell } from "@/components/games/game-shell";
import { LineNumbers } from "@/components/games/line-numbers";
import { handleEditorKeyDown } from "@/components/games/editor-shortcuts";
import { MobileActionBar } from "@/components/games/mobile-action-bar";
import { AuthGate } from "@/components/games/auth-gate";
import { AuthModal } from "@/components/games/auth-modal";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/lib/auth-context";
import "./game.css";

const GAME_SLUG = "flexbox-zoo";
const FALLBACK_TOTAL_LEVELS = 15;

interface ZooLevelMeta {
  id: number;
  title: string;
  difficulty: string;
}

interface ZooGameState {
  currentLevel: number;
  score: number;
  completed: Record<number, boolean>;
  totalLevels: number;
}

const DIFFICULTY_ORDER = ["beginner", "intermediate", "advanced"];

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function FlexboxZooPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [levels, setLevels] = useState<ZooLevelMeta[]>([]);
  const [gameState, setGameState] = useState<ZooGameState>({
    currentLevel: 0,
    score: 0,
    completed: {},
    totalLevels: FALLBACK_TOTAL_LEVELS,
  });

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed && Boolean(currentUser),
    initKey: "__initFlexboxZoo",
    resumeKey: "__resumeFlexboxZoo",
    emitterKey: "__onFlexboxZooProgress",
  });

  useEffect(() => {
    if (!gamesAuthed) return;
    const w = window as any;
    let alive = true;
    let levelsTimer: ReturnType<typeof setTimeout> | undefined;
    let stateTimer: ReturnType<typeof setTimeout> | undefined;

    const pollLevels = () => {
      if (!alive) return;
      if (typeof w.__getFlexboxZooLevels === "function") {
        const meta = w.__getFlexboxZooLevels();
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
      if (typeof w.__getFlexboxZooState === "function") {
        const s = w.__getFlexboxZooState();
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
    window.addEventListener("zoo-state", onState);
    return () => {
      alive = false;
      clearTimeout(levelsTimer);
      clearTimeout(stateTimer);
      clearTimeout(bootTimer);
      window.removeEventListener("zoo-state", onState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesAuthed]);

return (
    <>
    <GameShell
      title="Flexbox Zoo"
      tagline="Master CSS Flexbox by helping animals find their enclosures"
      icon={<span className="text-xl">🦁</span>}
      iconClass="bg-green-500/10 text-green-600 dark:text-green-500"
      scriptSrc={["/games/flexbox-zoo/game.js"]}
      doneCount={levels.filter((l) => gameState.completed[l.id - 1]).length}
      totalLevels={gameState.totalLevels || FALLBACK_TOTAL_LEVELS}
    >
        {/* GAME SECTION — html / css / js structure */}
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
          {/* LEFT SIDEBAR — html structure */}
          <div className="game-shell-sidebar">
            {/* All Levels Drawer */}
            <div className="zoo-level-select">
              <button
                type="button"
                className={"zoo-level-select-toggle" + (showLevelSelect ? " open" : "")}
                aria-expanded={showLevelSelect}
                onClick={() => setShowLevelSelect((v) => !v)}
              >
                <span className="zoo-ls-label">
                  <FolderOpen className="h-3 w-3" />
                  All Levels
                </span>
                <span className="zoo-ls-count">
                  {levels.filter((l) => gameState.completed[l.id - 1]).length}/{gameState.totalLevels}
                </span>
                <ChevronDown
                  className={"zoo-ls-chevron" + (showLevelSelect ? " open" : "")}
                />
              </button>

              {showLevelSelect && (
                <div className="zoo-level-select-body">
                  {DIFFICULTY_ORDER.map((tierKey) => {
                    const tierLevels = levels.filter((l) => l.difficulty === tierKey);
                    if (!tierLevels.length) return null;
                    const doneCount = tierLevels.filter(
                      (l) => gameState.completed[l.id - 1]
                    ).length;
                    return (
                      <div key={tierKey} className={"zoo-tier-group " + tierKey}>
                        <div className="zoo-tier-head">
                          <span className="zoo-tier-name">
                            {DIFFICULTY_LABELS[tierKey] || tierKey}
                          </span>
                          <span className="zoo-tier-count">
                            {doneCount}/{tierLevels.length}
                          </span>
                        </div>
                        <div className="zoo-level-grid">
                          {tierLevels.map((level) => {
                            const idx = level.id - 1;
                            const doneLevel = !!gameState.completed[idx];
                            const current = gameState.currentLevel === idx;
                            const locked = !doneLevel && idx > gameState.currentLevel;
                            return (
                              <button
                                key={level.id}
                                type="button"
                                disabled={locked}
                                className={
                                  "zoo-level-card " +
                                  level.difficulty +
                                  (doneLevel ? " done" : "") +
                                  (current ? " current" : "")
                                }
                                title={level.title}
                                onClick={() => {
                                  const win = window as any;
                                  if (typeof win.__goToFlexboxZooLevel === "function") {
                                    win.__goToFlexboxZooLevel(idx);
                                  }
                                  setShowLevelSelect(false);
                                }}
                              >
                                <span className="zoo-lk-num">
                                  {doneLevel ? (
                                    <Check className="zoo-lk-check" />
                                  ) : locked ? (
                                    <Lock className="zoo-lk-lock" />
                                  ) : (
                                    level.id
                                  )}
                                </span>
                                <span className="zoo-lk-title">{level.title}</span>
                                <span className="zoo-lk-meta">
                                  <span className="zoo-lk-diff">
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
                  <div className="zoo-ls-legend">
                    Levels unlock in order - solve a level to unlock the next.
                    Solved levels stay accessible.
                  </div>
                </div>
              )}
            </div>

            {/* Level Info — html */}
            <div className="zoo-level-info">
              <div className="zoo-level-header">
                <span className="zoo-level-badge">
                  <Gamepad2 className="h-3 w-3" />
                  Level <span id="level-number">1</span>
                  <span className="text-muted">/</span>
                  <span>15</span>
                </span>
                <span id="level-difficulty" className="zoo-level-difficulty beginner">
                  Beginner
                </span>
              </div>
              <h2
                id="level-title"
                className="font-display text-sm font-bold text-foreground"
              >
                Turn On Flexbox!
              </h2>
              <p id="level-instruction" className="zoo-instruction mt-1">
                Right now the animals are stacked on top of each other. Turn on
                CSS Flexbox so they line up in a row!
              </p>
              <div
                id="zoo-solved-note"
                className="zoo-solved-note"
                style={{ display: "none" }}
              >
                <span className="zoo-solved-note-icon">✓</span>
                <span>
                  Solved! Answers are saved - you can return to this level
                  anytime.
                </span>
              </div>
              <div id="level-hint" className="zoo-hint">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <span>
                  The magic property is <code>display: flex</code> — add it to
                  the parent container.
                </span>
              </div>
            </div>

            {/* Code Editor — css structure */}
            <div className="zoo-editor">
              <div className="zoo-editor-header">
                <div className="zoo-editor-dots">
                  <span className="zoo-editor-dot red" />
                  <span className="zoo-editor-dot yellow" />
                  <span className="zoo-editor-dot green" />
                </div>
                <div className="zoo-editor-title-row">
                  <span className="zoo-editor-title">style.css</span>
                  <button
                    id="clear-btn"
                    type="button"
                    className="zoo-editor-clear"
                    title="Clear code"
                    aria-label="Clear code"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="zoo-editor-body game-shell-editor-body">
                <LineNumbers forId="css-editor" className="zoo-line-numbers" />
                <div className="zoo-code-area">
                  <div className="zoo-code-prefix">
                    <span className="zoo-css-selector">#board</span>{" "}
                    <span className="zoo-css-brace">{"{"}</span>
                  </div>
                  <textarea
                    id="css-editor"
                    className="zoo-editor-textarea game-shell-currentline"
                    placeholder="Write your flexbox code here..."
                    autoFocus
                    autoCapitalize="none"
                    spellCheck={false}
                    onKeyDown={handleEditorKeyDown}
                  />
                  <div id="zoo-editor-hint" className="zoo-editor-hint">
                    Type the CSS property here...
                  </div>
                </div>
              </div>
              <div id="toast" className="zoo-status-toast" aria-live="polite" role="status" />
              <div
                id="zoo-result"
                className="zoo-result"
                role="status"
                style={{ display: "none" }}
              />
              <div className="zoo-editor-actions">
                <button
                  id="run-btn"
                  type="button"
                  className="zoo-run-btn"
                >
                  ▶ Run
                </button>
                <div className="zoo-nav-buttons">
                  <button
                    id="prev-btn"
                    type="button"
                    className="zoo-nav-btn prev"
                    disabled
                  >
                    ← Prev
                  </button>
                  <button
                    id="check-btn"
                    type="button"
                    className="zoo-check-btn"
                  >
                    ✓ Check
                  </button>
                  <button
                    id="next-btn"
                    type="button"
                    className="zoo-nav-btn next"
                    disabled
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT GAME AREA — js renders here */}
          <div className="game-shell-panel">
            <div className="zoo-board-container">
              <div className="zoo-board-header">
                <div className="zoo-board-tabs">
                  <button className="zoo-board-tab active">Board</button>
                </div>
                <div className="zoo-score">
                  <span id="score-display" className="zoo-score-value">
                    Score: 0 XP
                  </span>
                </div>
              </div>
              <div id="zoo-board" className="zoo-board" />
              <div
                id="overlay"
                className="zoo-complete-overlay"
                style={{ display: "none" }}
              >
                <div className="zoo-stars">
                  <span className="zoo-star earned">⭐</span>
                  <span className="zoo-star earned">⭐</span>
                  <span className="zoo-star earned">⭐</span>
                </div>
                <div className="zoo-complete-text">Level Complete!</div>
                <div className="zoo-complete-sub">
                  Great job! You solved it!
                </div>
                <div className="zoo-complete-msg"></div>
<button
                  type="button"
                  className="zoo-complete-btn overlay-btn"
                >
                  Next Level →
                </button>
              </div>
              <div id="zoo-progress" className="game-shell-dots" />
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
