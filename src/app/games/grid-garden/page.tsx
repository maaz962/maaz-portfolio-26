"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowLeft,
  Gamepad2,
  Sparkles,
} from "lucide-react";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { AuthGate } from "@/components/games/auth-gate";
import { AuthModal } from "@/components/games/auth-modal";
import { GameSocial } from "@/components/games/game-social";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/lib/auth-context";
import "./game.css";

const GAME_SLUG = "grid-garden";

export default function GridGardenPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed && Boolean(currentUser),
    initKey: "__initGridGarden",
    resumeKey: "__resumeGridGarden",
    emitterKey: "__onGridGardenProgress",
  });

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <span className="text-xl">🌱</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Grid Garden
            </h1>
            <p className="text-xs text-muted">
              Build layouts and master CSS Grid by arranging garden plots
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
        <div className="grid-game-wrapper">
          {/* LEFT SIDEBAR */}
          <div className="grid-sidebar">
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
                <span className="grid-editor-title">style.css</span>
              </div>
              <div className="grid-editor-body">
                <div className="grid-line-numbers">
                  1<br />2<br />3<br />4<br />5<br />6
                </div>
                <div className="grid-code-area">
                  <div className="grid-code-prefix">
                    <span className="grid-css-selector">#container</span>{" "}
                    <span className="grid-css-brace">{"{"}</span>
                  </div>
                  <textarea
                    id="css-editor"
                    className="grid-editor-textarea"
                    placeholder="display: grid"
                    autoFocus
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                  <div id="grid-editor-hint" className="grid-editor-hint">
                    Type the CSS property here...
                  </div>
                </div>
              </div>
              <div id="toast" className="grid-status-toast" />
              <div className="grid-editor-actions">
                <button id="reset-btn" type="button" className="grid-reset-btn">
                  ↺ Reset
                </button>
                <div className="grid-nav-buttons">
                  <button id="prev-btn" type="button" className="grid-nav-btn prev" disabled>
                    ← Prev
                  </button>
                  <button id="next-btn" type="button" className="grid-nav-btn next" disabled>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT GAME AREA */}
          <div className="grid-game-area">
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
                    Score: 0
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
            </div>
          </div>
        </div>
        )}

        {/* LIKE + COMMENTS */}
        <GameSocial
          slug={GAME_SLUG}
          title="Grid Garden"
          emoji="🌱"
          accentText="text-emerald-500"
          accentBg="bg-emerald-500/10"
          currentUser={currentUser}
          canInteract={canInteract}
          onAuthRequired={openAuthModal}
        />
      </main>

      <Script src="/games/grid-garden/game.js" strategy="afterInteractive" />

      <AuthModal
        open={showAuthModal}
        initialMode={authRequest}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
