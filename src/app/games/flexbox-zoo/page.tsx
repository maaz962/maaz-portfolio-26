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

const GAME_SLUG = "flexbox-zoo";

export default function FlexboxZooPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed && Boolean(currentUser),
    initKey: "__initFlexboxZoo",
    resumeKey: "__resumeFlexboxZoo",
    emitterKey: "__onFlexboxZooProgress",
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
            <span className="text-xl">🦁</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Flexbox Zoo
            </h1>
            <p className="text-xs text-muted">
              Master CSS Flexbox by helping animals find their enclosures
            </p>
          </div>
        </div>

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
        <div className="zoo-game-wrapper">
          {/* LEFT SIDEBAR — html structure */}
          <div className="zoo-sidebar">
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
                <span className="zoo-editor-title">style.css</span>
              </div>
              <div className="zoo-editor-body">
                <div id="zoo-line-numbers" className="zoo-line-numbers">
                  1<br />2<br />3<br />4<br />5<br />6
                </div>
                <div className="zoo-code-area">
                  <div className="zoo-code-prefix">
                    <span className="zoo-css-selector">#board</span>{" "}
                    <span className="zoo-css-brace">{"{"}</span>
                  </div>
                  <textarea
                    id="css-editor"
                    className="zoo-editor-textarea"
                    placeholder="display: flex"
                    autoFocus
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                  <div id="zoo-editor-hint" className="zoo-editor-hint">
                    Type the CSS property here...
                  </div>
                </div>
              </div>
              <div id="toast" className="zoo-status-toast" />
              <div className="zoo-editor-actions">
                <button
                  id="reset-btn"
                  type="button"
                  className="zoo-reset-btn"
                >
                  ↺ Reset
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
          <div className="zoo-game-area">
            <div className="zoo-board-container">
              <div className="zoo-board-header">
                <div className="zoo-board-tabs">
                  <button className="zoo-board-tab active">Board</button>
                </div>
                <div className="zoo-score">
                  <span id="score-display" className="zoo-score-value">
                    Score: 0
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
            </div>
          </div>
        </div>
        )}

        {/* LIKE + COMMENTS */}
        <GameSocial
          slug={GAME_SLUG}
          title="Flexbox Zoo"
          emoji="🦁"
          accentText="text-green-500"
          accentBg="bg-green-500/10"
          currentUser={currentUser}
          canInteract={canInteract}
          onAuthRequired={openAuthModal}
        />
      </main>

      <Script src="/games/flexbox-zoo/game.js" strategy="afterInteractive" />

      <AuthModal
        open={showAuthModal}
        initialMode={authRequest}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
