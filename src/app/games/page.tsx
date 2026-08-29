"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageSquare,
  ArrowLeft,
  Gamepad2,
  Sparkles,
  X,
  Eye,
  EyeOff,
  UserPlus,
  LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { cn } from "@/lib/utils";
import { GameDiscussionPanel } from "./game-discussion-panel";
import {
  getGamesSession,
  setGamesSession,
  clearGamesSession,
} from "@/lib/games-session";
import type { BlogEngagement, User } from "@/types";

const games = [
  {
    slug: "html-hero",
    title: "HTML Hero",
    description:
      "Become an HTML Master! Write real tags for headings, lists, tables, forms and full pages across easy to advanced challenges.",
    difficulty: "All Levels",
    topics: ["HTML", "Tags", "Semantics", "Forms"],
    animal: "🦸",
    color: "from-indigo-500/20 to-violet-500/20",
    borderColor: "border-indigo-500/30",
    accentColor: "text-indigo-500",
    comingSoon: false,
  },
  {
    slug: "flexbox-zoo",
    title: "Flexbox Zoo",
    description:
      "Help adorable animals find their enclosures by mastering CSS Flexbox properties. Learn justify-content, align-items, flex-direction and more through fun challenges!",
    difficulty: "Beginner",
    topics: ["Flexbox", "CSS Layout", "justify-content", "align-items"],
    animal: "🦁",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
    accentColor: "text-green-500",
    comingSoon: false,
  },
  {
    slug: "grid-garden",
    title: "Grid Garden",
    description:
      "Build layouts and master CSS Grid. Learn grid-template-columns, grid-areas, spanning, and more through fun challenges!",
    difficulty: "Intermediate",
    topics: ["CSS Grid", "grid-template", "grid-areas", "spanning"],
    animal: "🌱",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    accentColor: "text-emerald-500",
    comingSoon: false,
  },
  {
    slug: "css selectors",
    title: "Selector Safari",
    description:
      "Hunt for elements using CSS selectors. Master class, ID, attribute, and pseudo selectors!",
    difficulty: "Beginner",
    topics: ["Selectors", "Class", "ID", "Pseudo-classes"],
    animal: "🎯",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    accentColor: "text-blue-500",
    comingSoon: true,
  },
  {
    slug: "animation-arena",
    title: "Animation Arena",
    description:
      "Bring characters to life with CSS animations and transitions. Learn keyframes, timing, and more!",
    difficulty: "Advanced",
    topics: ["Animations", "Transitions", "Keyframes"],
    animal: "✨",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    accentColor: "text-purple-500",
    comingSoon: true,
  },
];

function GameCard({
  game,
  engagement,
  onLike,
  onComments,
  authed,
  openAuthModal,
  onPlay,
}: {
  game: (typeof games)[0];
  engagement: BlogEngagement;
  onLike: (slug: string) => void;
  onComments: (slug: string) => void;
  authed: boolean;
  openAuthModal: () => void;
  onPlay: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg",
        game.borderColor
      )}
    >
      <div
        className={cn(
          "relative flex h-40 items-center justify-center bg-gradient-to-br",
          game.color
        )}
      >
        <span className="text-7xl transition-transform duration-300 group-hover:scale-110">
          {game.animal}
        </span>
        {game.comingSoon && (
          <div className="absolute right-3 top-3 rounded-full bg-background/80 px-3 py-1 text-[0.65rem] font-semibold text-muted backdrop-blur-sm">
            Coming Soon
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {game.title}
          </h3>
          <span
            className={cn(
              "rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-semibold",
              game.accentColor
            )}
          >
            {game.difficulty}
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-muted">
          {game.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {game.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-md bg-background-secondary px-2 py-0.5 text-[0.6rem] font-medium text-muted"
            >
              {topic}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!authed) {
                  openAuthModal();
                  return;
                }
                onLike(game.slug);
              }}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                engagement.userLiked
                  ? "text-red-500"
                  : "text-muted hover:text-red-500"
              )}
            >
              <Heart
                className={cn("h-3.5 w-3.5", engagement.userLiked && "fill-current")}
              />
              {engagement.likesCount}
            </button>
            <button
              onClick={() => onComments(game.slug)}
              className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-primary"
              title={`View comments & discussion for ${game.title}`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {engagement.commentsCount}
            </button>
          </div>

          {game.comingSoon ? (
            <span className="text-xs text-muted">Stay tuned...</span>
          ) : authed ? (
            <Link
              href={`/games/${game.slug}`}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              Play Now
            </Link>
          ) : (
            <button
              onClick={onPlay}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              Play Now
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function GamesPage() {
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
  const [gamesAuthed, setGamesAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [engagements, setEngagements] = useState<
    Record<string, BlogEngagement>
  >({});
  const [discussionSlug, setDiscussionSlug] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));

    if (typeof window !== "undefined") {
      setGamesAuthed(getGamesSession());
    }

    games.forEach((game) => {
      fetch(`/api/blog/likes?slug=${encodeURIComponent(game.slug)}`)
        .then((r) => r.json())
        .then((d) =>
          setEngagements((prev) => ({ ...prev, [game.slug]: d }))
        )
        .catch(() => {});
    });
  }, []);

  const handleLike = async (slug: string) => {
    if (!currentUser || !gamesAuthed) return;
    try {
      const res = await fetch("/api/blog/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const data = await res.json();
        setEngagements((prev) => ({ ...prev, [slug]: data }));
      }
    } catch {}
  };

  const handleEngagementChange = (slug: string, engagement: BlogEngagement) => {
    setEngagements((prev) => ({ ...prev, [slug]: engagement }));
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
      if (!res.ok) {
        setAuthError(data.error || "Auth failed");
        return;
      }
      setCurrentUser(data);
      setShowAuthModal(false);
      setAuthForm({ name: "", username: "", email: "", password: "" });
      setGamesSession();
      setGamesAuthed(true);
      if (pendingSlug) {
        router.push(`/games/${pendingSlug}`);
        setPendingSlug(null);
      }
    } catch {
      setAuthError("Server error");
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <GlassNavbar activeSection="games" />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-28">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Portfolio
        </Link>

        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Learn Web Dev by Playing
                </h1>
                <p className="text-xs text-muted">
                  Fun interactive games to master HTML, CSS & JavaScript
                </p>
              </div>
            </div>

            {gamesAuthed && currentUser ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-3 pr-1.5 text-xs">
                <span className="text-muted">
                  Playing as{" "}
                  <span className="font-semibold text-foreground">
                    @{currentUser.username}
                  </span>
                </span>
                <button
                  onClick={() => {
                    clearGamesSession();
                    setGamesAuthed(false);
                    setCurrentUser(null);
                  }}
                  title="Sign out of games (login is required again on your next visit)"
                  className="flex items-center gap-1 rounded-full bg-background-secondary px-2.5 py-1 text-muted transition-colors hover:text-foreground"
                >
                  <LogOut className="h-3 w-3" />
                  Games Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign In / Sign Up
              </button>
            )}
          </div>

          {!gamesAuthed && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[0.65rem] text-amber-600">
              <Sparkles className="h-3 w-3" />
              A quick sign-in is required before playing — every time you visit.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {games.map((game) => (
            <GameCard
              key={game.slug}
              game={game}
              engagement={
                engagements[game.slug] || {
                  likesCount: 0,
                  commentsCount: 0,
                  userLiked: false,
                }
              }
              onLike={handleLike}
              onComments={(slug) => setDiscussionSlug(slug)}
              authed={Boolean(currentUser) && gamesAuthed}
              openAuthModal={() => {
                setAuthMode("login");
                setAuthError("");
                setShowAuthModal(true);
              }}
              onPlay={() => {
                setAuthMode("register");
                setAuthError("");
                setPendingSlug(game.slug);
                setShowAuthModal(true);
              }}
            />
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
          <Sparkles className="mx-auto mb-2 h-5 w-5 text-primary" />
          <p className="text-sm font-semibold text-foreground">
            More games coming soon!
          </p>
          <p className="mt-1 text-xs text-muted">
            HTML, CSS, and JavaScript games to help you learn web development
            step by step.
          </p>
        </div>
      </main>

      <AnimatePresence>
        {discussionSlug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDiscussionSlug(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-glow"
            >
              <button
                onClick={() => setDiscussionSlug(null)}
                aria-label="Close discussion"
                className="absolute right-4 top-4 z-10 text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              {(() => {
                const game = games.find((g) => g.slug === discussionSlug);
                if (!game) return null;
                return (
                  <GameDiscussionPanel
                    game={game}
                    currentUser={currentUser}
                    onEngagementChange={handleEngagementChange}
                    onAuthRequired={() => {
                      setAuthMode("login");
                      setAuthError("");
                      setShowAuthModal(true);
                    }}
                  />
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute right-4 top-4 text-muted hover:text-foreground"
              >
                ✕
              </button>
              <h3 className="font-display text-sm font-semibold text-foreground">
                {authMode === "login" ? "Welcome back" : "Create profile"}
              </h3>
              <p className="mt-1 text-[0.65rem] text-muted">
                Sign up first to start playing, like and comment on games
              </p>

              {authError && (
                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-[0.7rem] text-red-500">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
                {authMode === "register" ? (
                  <>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={authForm.name}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Username"
                      value={authForm.username}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, username: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={authForm.email}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                    />
                  </>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Username or Email"
                    value={authForm.username}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, username: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                  />
                )}
                <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
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
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110"
                >
                  {authMode === "login" ? "Sign In" : "Register"}
                </button>
              </form>

              <div className="mt-3 text-center text-xs text-muted">
                {authMode === "login" ? (
                  <p>
                    No account?{" "}
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
                    Have account?{" "}
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
