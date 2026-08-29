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

const GAME_SLUG = "grid-garden";

export default function GridGardenPage() {
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
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!gamesAuthed || !currentUser) return;
    const tryInit = () => {
      if (typeof window !== "undefined" && (window as any).__initGridGarden) {
        (window as any).__initGridGarden();
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
        ? { emailOrUsername: authForm.username || authForm.email, password: authForm.password }
        : authForm;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || "Auth failed"); return; }
      setCurrentUser(data);
      setShowAuthModal(false);
      setAuthForm({ name: "", username: "", email: "", password: "" });
      setGamesAuthed(true);
    } catch { setAuthError("Server error"); }
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

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-glow"
            >
              <button onClick={() => setShowAuthModal(false)} className="absolute right-4 top-4 text-muted hover:text-foreground">
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
                  <p className="text-[0.65rem] text-muted">Sign in to like and comment</p>
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
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Full Name</label>
                    <input type="text" required placeholder="Jane Doe" value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none" />
                  </div>
                )}
                <div>
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Username</label>
                  <input type="text" required placeholder="jane_dev" value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none" />
                </div>
                {authMode === "register" && (
                  <div>
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Email</label>
                    <input type="email" required placeholder="jane@example.com" value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none" />
                  </div>
                )}
                <div>
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Password</label>
                  <div className="relative mt-1">
                  <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 pr-10 text-xs text-foreground focus:border-primary/60 focus:outline-none" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground">
                    {showPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                  </button>
                </div>
                </div>
                <button type="submit" className="mt-2 w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 shadow-glow">
                  {authMode === "login" ? "Sign In" : "Register"}
                </button>
              </form>
              <div className="mt-4 text-center text-xs text-muted">
                {authMode === "login" ? (
                  <p>
                    Don&apos;t have an account?{" "}
                    <button onClick={() => { setAuthMode("register"); setAuthError(""); }} className="font-semibold text-primary hover:underline">
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already registered?{" "}
                    <button onClick={() => { setAuthMode("login"); setAuthError(""); }} className="font-semibold text-primary hover:underline">
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
