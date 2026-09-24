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

const GAME_SLUG = "grid-garden";
const FALLBACK_TOTAL_LEVELS = 15;

interface GridLevelMeta {
  id: number;
  title: string;
  difficulty: string;
}

interface GridGameState {
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

export default function GridGardenPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [levels, setLevels] = useState<GridLevelMeta[]>([]);
  const [gameState, setGameState] = useState<GridGameState>({
    currentLevel: 0,
    score: 0,
    completed: {},
    totalLevels: FALLBACK_TOTAL_LEVELS,
  });

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed && Boolean(currentUser),
    initKey: "__initGridGarden",
    resumeKey: "__resumeGridGarden",
    emitterKey: "__onGridGardenProgress",
  });

  useEffect(() => {
    if (!gamesAuthed) return;
    const w = window as any;
    let alive = true;
    let levelsTimer: ReturnType<typeof setTimeout> | undefined;
    let stateTimer: ReturnType<typeof setTimeout> | undefined;

    const pollLevels = () => {
      if (!alive) return;
      if (typeof w.__getGridGardenLevels === "function") {
        const meta = w.__getGridGardenLevels();
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
      if (typeof w.__getGridGardenState === "function") {
        const s = w.__getGridGardenState();
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
    window.addEventListener("grid-state", onState);
    return () => {
      alive = false;
      clearTimeout(levelsTimer);
      clearTimeout(stateTimer);
      clearTimeout(bootTimer);
      window.removeEventListener("grid-state", onState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesAuthed]);

  return (
    <>
    <GameShell
      title="Grid Garden"
      tagline="Build layouts and master CSS Grid by arranging garden plots"
      icon={<span className="text-xl">🌱</span>}
      iconClass="bg-emerald-500/10 text-emerald-500"
      scriptSrc={["/games/grid-garden/game.js"]}
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
            {/* All Levels Drawer */}
            <div className="grid-level-select">
              <button
                type="button"
                className={"grid-level-select-toggle" + (showLevelSelect ? " open" : "")}
                aria-expanded={showLevelSelect}
                onClick={() => setShowLevelSelect((v) => !v)}
              >
                <span className="grid-ls-label">
                  <FolderOpen className="h-3 w-3" />
                  All Levels
                </span>
                <span className="grid-ls-count">
                  {levels.filter((l) => gameState.completed[l.id - 1]).length}/{gameState.totalLevels}
                </span>
                <ChevronDown
                  className={"grid-ls-chevron" + (showLevelSelect ? " open" : "")}
                />
              </button>

              {showLevelSelect && (
                <div className="grid-level-select-body">
                  {DIFFICULTY_ORDER.map((tierKey) => {
                    const tierLevels = levels.filter((l) => l.difficulty === tierKey);
                    if (!tierLevels.length) return null;
                    const doneCount = tierLevels.filter(
                      (l) => gameState.completed[l.id - 1]
                    ).length;
                    return (
                      <div key={tierKey} className={"grid-tier-group " + tierKey}>
                        <div className="grid-tier-head">
                          <span className="grid-tier-name">
                            {DIFFICULTY_LABELS[tierKey] || tierKey}
                          </span>
                          <span className="grid-tier-count">
                            {doneCount}/{tierLevels.length}
                          </span>
                        </div>
                        <div className="grid-level-grid">
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
                                  "grid-level-card " +
                                  level.difficulty +
                                  (doneLevel ? " done" : "") +
                                  (current ? " current" : "")
                                }
                                title={level.title}
                                onClick={() => {
                                  const win = window as any;
                                  if (typeof win.__goToGridGardenLevel === "function") {
                                    win.__goToGridGardenLevel(idx);
                                  }
                                  setShowLevelSelect(false);
                                }}
                              >
                                <span className="grid-lk-num">
                                  {doneLevel ? (
                                    <Check className="grid-lk-check" />
                                  ) : locked ? (
                                    <Lock className="grid-lk-lock" />
                                  ) : (
                                    level.id
                                  )}
                                </span>
                                <span className="grid-lk-title">{level.title}</span>
                                <span className="grid-lk-meta">
                                  <span className="grid-lk-diff">
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
                  <div className="grid-ls-legend">
                    Levels unlock in order - solve a level to unlock the next.
                    Solved levels stay accessible.
                  </div>
                </div>
              )}
            </div>

            {/* Level Info */}
            <div className="grid-level-info">
              <div className="grid-level-header">
                <span className="grid-level-badge">
                  <Gamepad2 className="h-3 w-3" />
                  Level <span id="level-number">1</span>
                  <span className="text-muted">/</span>
                  <span>15</span>
                </span>
                <span id="level-difficulty" className="grid-level-difficulty beginner">
                  Beginner
                </span>
              </div>
              <h2
                id="level-title"
                className="font-display text-sm font-bold text-foreground"
              >
                Turn On Grid!
              </h2>
              <p id="level-instruction" className="grid-instruction mt-1">
                The blocks are stacked vertically. Activate CSS Grid to arrange them!
              </p>
              <div
                id="grid-solved-note"
                className="grid-solved-note"
                style={{ display: "none" }}
              >
                <span className="grid-solved-note-icon">✓</span>
                <span>
                  Solved! Answers are saved - you can return to this level
                  anytime.
                </span>
              </div>
              <div id="level-hint" className="grid-hint">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <span>
                  The magic property is <code>display: grid</code> — add it to the container.
                </span>
              </div>
            </div>

            {/* Code Editor */}
            <div className="grid-editor">
              <div className="grid-editor-header">
                <div className="grid-editor-dots">
                  <span className="grid-editor-dot red" />
                  <span className="grid-editor-dot yellow" />
                  <span className="grid-editor-dot green" />
                </div>
                <div className="grid-editor-title-row">
                  <span className="grid-editor-title">style.css</span>
                  <button
                    id="clear-btn"
                    type="button"
                    className="grid-editor-clear"
                    title="Clear code"
                    aria-label="Clear code"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid-editor-body game-shell-editor-body">
                <LineNumbers forId="css-editor" className="grid-line-numbers" />
                <div className="grid-code-area">
                  <div className="grid-code-prefix">
                    <span className="grid-css-selector">#container</span>{" "}
                    <span className="grid-css-brace">{"{"}</span>
                  </div>
                  <textarea
                    id="css-editor"
                    className="grid-editor-textarea game-shell-currentline"
                    placeholder="Write your grid code here..."
                    autoFocus
                    autoCapitalize="none"
                    spellCheck={false}
                    onKeyDown={handleEditorKeyDown}
                  />
                  <div id="grid-editor-hint" className="grid-editor-hint">
                    Type the CSS property here...
                  </div>
                </div>
              </div>
              <div id="toast" className="grid-status-toast" aria-live="polite" role="status" />
              <div
                id="grid-result"
                className="grid-result"
                role="status"
                style={{ display: "none" }}
              />
              <div className="grid-editor-actions">
                <button id="run-btn" type="button" className="grid-run-btn">
                  ▶ Run
                </button>
                <div className="grid-nav-buttons">
                  <button id="prev-btn" type="button" className="grid-nav-btn prev" disabled>
                    ← Prev
                  </button>
                  <button id="check-btn" type="button" className="grid-check-btn">
                    ✓ Check
                  </button>
                  <button id="next-btn" type="button" className="grid-nav-btn next" disabled>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT GAME AREA */}
          <div className="game-shell-panel">
            {/* Preview Panel for Level 15 */}
            <div id="grid-preview" className="grid-preview-panel" style={{ display: "none" }}>
              <div className="grid-preview-header">
                <span>Target Layout — Recreate This!</span>
              </div>
              <div className="grid-preview-board">
                <div className="grid-preview-item" style={{ gridArea: "header", background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>Header</div>
                <div className="grid-preview-item" style={{ gridArea: "sidebar", background: "linear-gradient(135deg, #f97316, #ea580c)" }}>Sidebar</div>
                <div className="grid-preview-item" style={{ gridArea: "main", background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>Main</div>
                <div className="grid-preview-item" style={{ gridArea: "footer", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>Footer</div>
              </div>
            </div>

            <div className="grid-board-container">
              <div className="grid-board-header">
                <div className="grid-board-tabs">
                  <button className="grid-board-tab active">Board</button>
                </div>
                <div className="grid-score">
                  <span id="score-display" className="grid-score-value">
                    Score: 0 XP
                  </span>
                </div>
              </div>
              <div id="grid-board" className="grid-board" />
              <div id="overlay" className="grid-complete-overlay" style={{ display: "none" }}>
                <div className="grid-stars">
                  <span className="grid-star earned">⭐</span>
                  <span className="grid-star earned">⭐</span>
                  <span className="grid-star earned">⭐</span>
                </div>
                <div className="grid-complete-text">Level Complete!</div>
                <div className="grid-complete-sub">Great job! You solved it!</div>
                <div className="grid-complete-msg"></div>
                <button type="button" className="grid-complete-btn overlay-btn">
                  Next Level →
                </button>
              </div>
              <div id="grid-progress" className="game-shell-dots" />
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
