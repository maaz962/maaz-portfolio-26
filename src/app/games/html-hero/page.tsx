"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowLeft,
  Gamepad2,
  Sparkles,
  RefreshCw,
  Play,
  Check,
} from "lucide-react";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { AuthGate } from "@/components/games/auth-gate";
import { AuthModal } from "@/components/games/auth-modal";
import { GameSocial } from "@/components/games/game-social";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/lib/auth-context";
import "./game.css";

const GAME_SLUG = "html-hero";
const TOTAL_LEVELS = 16;

export default function HtmlHeroPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed && Boolean(currentUser),
    initKey: "__initHtmlHero",
    resumeKey: "__resumeHtmlHero",
    emitterKey: "__onHtmlHeroProgress",
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <span className="text-xl">🦸</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              HTML Hero
            </h1>
            <p className="text-xs text-muted">
              Write real HTML tags, level by level, and become an HTML Master
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
        <div className="hh-game">
          {/* LEFT COLUMN */}
          <div className="hh-sidebar">
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
                Task: write an h1 tag.
              </p>
              <div id="level-hint" className="hh-hint">
                <Sparkles className="icon h-3 w-3" />
                <span>Hint: your hint appears here.</span>
              </div>
            </div>

            <div className="hh-editor">
              <div className="hh-editor-header">
                <div className="hh-editor-dots">
                  <span className="hh-editor-dot red" />
                  <span className="hh-editor-dot yellow" />
                  <span className="hh-editor-dot green" />
                </div>
                <span className="hh-editor-title">index.html</span>
              </div>
              <div className="hh-editor-body">
                <textarea
                  id="html-editor"
                  className="hh-editor-textarea"
                  placeholder='<h1>Hello World</h1>'
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <div id="toast" className="hh-status-toast" />
              <div className="hh-editor-actions">
                <button id="reset-btn" type="button" className="hh-btn hh-reset-btn">
                  <RefreshCw className="h-3 w-3" />
                  Reset
                </button>
                <div className="hh-nav-buttons">
                  <button id="check-btn" type="button" className="hh-btn hh-check-btn">
                    <Play className="h-3 w-3" />
                    Check
                  </button>
                  <button id="prev-btn" type="button" className="hh-btn hh-nav-btn prev" disabled>
                    ← Prev
                  </button>
                  <button id="next-btn" type="button" className="hh-btn hh-nav-btn next">
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="hh-panel">
            <div className="hh-preview-panel" style={{ position: "relative" }}>
              <div className="hh-preview-header">
                <div className="hh-preview-tabs">
                  <button type="button" className="hh-preview-tab active">
                    <Check className="h-3 w-3" />
                    Preview
                  </button>
                </div>
                <div className="hh-score">
                  <span id="score-display">Score: 0</span>
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

              <div id="progress-dots" className="hh-progress" />

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

        {/* LIKE + COMMENTS */}
        <GameSocial
          slug={GAME_SLUG}
          title="HTML Hero"
          emoji="🦸"
          accentText="text-indigo-500"
          accentBg="bg-indigo-500/10"
          currentUser={currentUser}
          canInteract={canInteract}
          onAuthRequired={openAuthModal}
        />
      </main>

      <Script src="/games/html-hero/game.js" strategy="afterInteractive" />

      <AuthModal
        open={showAuthModal}
        initialMode={authRequest}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}