"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowLeft,
  Key,
  AlertCircle,
  X,
  Gamepad2,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { AuthGate } from "@/components/games/auth-gate";
import { GameSocial } from "@/components/games/game-social";
import type { User } from "@/types";
import "./game.css";

const GAME_SLUG = "flexbox-zoo";

export default function FlexboxZooPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
const [authLoading, setAuthLoading] = useState(true);
  const [gamesAuthed, setGamesAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setCurrentUser(d.user);
          setGamesAuthed(true);
        } else {
          setAuthMode("register");
          setAuthError("");
          setShowAuthModal(true);
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!gamesAuthed || !currentUser) return;
    const tryInit = () => {
      if (typeof window !== "undefined" && (window as any).__initFlexboxZoo) {
        (window as any).__initFlexboxZoo();
      } else {
        setTimeout(tryInit, 100);
      }
    };
    const timer = setTimeout(tryInit, 200);
    return () => clearTimeout(timer);
  }, [gamesAuthed, currentUser]);

  const openAuthModal = () => {
    setAuthMode("login");
    setAuthError("");
    setShowAuthModal(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const url = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      authMode === "login"
        ? {
            emailOrUsername: authForm.username || authForm.email,
            password: authForm.password,
          }
        : authForm;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Auth failed");
        return;
      }
      setCurrentUser(data);
      setShowAuthModal(false);
      setAuthForm({ name: "", username: "", email: "", password: "" });
      setGamesAuthed(true);
    } catch {
      setAuthError("Server error");
    }
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
              setAuthMode("login");
              setAuthError("");
              setShowAuthModal(true);
            }}
            onRegister={() => {
              setAuthMode("register");
              setAuthError("");
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

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (gamesAuthed) setShowAuthModal(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-glow"
            >
              <button
                onClick={() => { if (gamesAuthed) setShowAuthModal(false); }}
                aria-label="Close"
                className="absolute right-4 top-4 text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    {authMode === "login" ? "Welcome back" : "Create profile"}
                  </h3>
                  <p className="text-[0.65rem] text-muted">
                    Sign in to like and comment
                  </p>
                </div>
              </div>
              {authError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-[0.7rem] text-red-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
                {authMode === "register" && (
                  <div>
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={authForm.name}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, name: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="jane_dev"
                    value={authForm.username}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, username: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                  />
                </div>
                {authMode === "register" && (
                  <div>
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={authForm.email}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, email: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, password: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 pr-10 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 shadow-glow"
                >
                  {authMode === "login" ? "Sign In" : "Register"}
                </button>
              </form>
              <div className="mt-4 text-center text-xs text-muted">
                {authMode === "login" ? (
                  <p>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthMode("register");
                        setAuthError("");
                      }}
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already registered?{" "}
                    <button
                      onClick={() => {
                        setAuthMode("login");
                        setAuthError("");
                      }}
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
