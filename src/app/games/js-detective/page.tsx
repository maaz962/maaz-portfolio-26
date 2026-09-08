"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowLeft,
  Gamepad2,
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
const TOTAL_LEVELS = 15;

export default function JsDetectivePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");

  const gamesAuthed = Boolean(currentUser) && !authLoading;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed && Boolean(currentUser),
    initKey: "__initJsDetective",
    resumeKey: "__resumeJsDetective",
    emitterKey: "__onJsDetectiveProgress",
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
              {/* Level Info */}
              <div className="jsd-level-info">
                <div className="jsd-level-header">
                  <span className="jsd-level-badge">
                    <Gamepad2 className="h-3 w-3" />
                    Case <span id="level-number">1</span>
                    <span className="text-muted">/</span>
                    <span>{TOTAL_LEVELS}</span>
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

      <Script src="/games/js-detective/game.js" strategy="afterInteractive" />

      <AuthModal
        open={showAuthModal}
        initialMode={authRequest}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
