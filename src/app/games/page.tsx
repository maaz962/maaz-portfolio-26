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
  UserPlus,
  LogOut,
  Trophy,
ListTodo,
  CheckCircle2,
  Award,
  Star,
  Flame,
  Medal,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { cn } from "@/lib/utils";
import { GameDiscussionPanel } from "./game-discussion-panel";
import { AuthModal } from "@/components/games/auth-modal";
import { LeaderboardPanel } from "@/components/games/leaderboard-panel";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import type { BlogEngagement, GameProgress, GamificationSummary } from "@/types";

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
    slug: "js-detective",
    title: "JS Detective",
    description:
      "Solve coding mysteries and master core JavaScript! Variables, loops, arrays, functions, .map, .filter and event handlers through fun console challenges.",
    difficulty: "All Levels",
    topics: ["JavaScript", "Variables", "Loops", "Functions"],
    animal: "🕵️",
    color: "from-yellow-500/20 to-amber-500/20",
    borderColor: "border-amber-500/30",
    accentColor: "text-amber-500",
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

/**
 * Zero-network mini "screenshot" of each game, rendered as pure CSS/JSX so
 * cards show the game in action without a single image request (lighter than
 * any GIF/video). Coming-soon games just show their mascot over the gradient.
 */
function GamePreview({ game }: { game: (typeof games)[0] }) {
  if (game.comingSoon) {
    return (
      <span className="text-7xl transition-transform duration-300 group-hover:scale-110">
        {game.animal}
      </span>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="relative mx-3 mt-4 h-32 overflow-hidden rounded-xl border border-white/15 bg-card/90 p-3 shadow-xl">
        {game.slug === "html-hero" && (
          <div className="font-mono text-[0.6rem] leading-relaxed">
            <div className="mb-2 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400/80" />
              <span className="h-2 w-2 rounded-full bg-amber-400/80" />
              <span className="h-2 w-2 rounded-full bg-green-400/80" />
            </div>
            <p className="text-pink-400">
              &lt;h1&gt;<span className="text-slate-200">Hello World</span>
              &lt;/h1&gt;
            </p>
            <p className="text-slate-300">
              &lt;ul&gt;{" "}
              <span className="text-indigo-300">
                &lt;li&gt;HTML&lt;/li&gt;
              </span>{" "}
              &lt;/ul&gt;
            </p>
            <p className="text-cyan-300">&lt;form action=&quot;...&quot;&gt;</p>
            <p className="text-slate-400">&lt;button&gt;Send&lt;/button&gt;</p>
            <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-gradient-to-r from-indigo-400/60 to-violet-400/60" />
          </div>
        )}

        {game.slug === "flexbox-zoo" && (
          <div className="flex h-full flex-col">
            <div className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black/20 p-2">
              <span className="flex h-9 flex-1 items-center justify-center rounded-lg bg-red-400/25 text-2xl">
                🦁
              </span>
              <span className="flex h-9 flex-1 items-center justify-center rounded-lg bg-sky-400/25 text-2xl">
                🐰
              </span>
              <span className="flex h-9 flex-1 items-center justify-center rounded-lg bg-yellow-400/25 text-2xl">
                🦊
              </span>
            </div>
            <p className="mt-2 font-mono text-[0.6rem] text-emerald-400">
              justify-content: <span className="text-slate-300">center;</span>
            </p>
          </div>
        )}

        {game.slug === "grid-garden" && (
          <div className="flex h-full flex-col">
            <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-1">
              <div className="flex items-center justify-center rounded-md border border-emerald-400/50 bg-emerald-500/30 text-xl">
                🌱
              </div>
              <div className="rounded-md bg-emerald-200/10" />
              <div className="rounded-md bg-emerald-200/10" />
              <div className="flex items-center justify-center rounded-md bg-emerald-500/20 text-sm">
                🧺
              </div>
              <div className="rounded-md bg-emerald-200/10" />
              <div className="rounded-md bg-emerald-200/10" />
            </div>
            <p className="mt-2 font-mono text-[0.6rem] text-emerald-400">
              repeat(3, 1fr) / <span className="text-slate-300">100px</span>
            </p>
          </div>
        )}

        {game.slug === "js-detective" && (
          <div className="font-mono text-[0.6rem] leading-relaxed">
            <div className="mb-2 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400/80" />
              <span className="h-2 w-2 rounded-full bg-amber-400/80" />
              <span className="h-2 w-2 rounded-full bg-green-400/80" />
            </div>
            <p className="text-slate-500">{"// detective-console.js"}</p>
            <p className="text-slate-300">
              {"const"} <span className="text-amber-300">clue</span> ={" "}
              <span className="text-emerald-300">&quot;mystery&quot;</span>;
            </p>
            <p className="text-slate-300">
              {"titleCase"}(
              <span className="text-amber-300">clue</span>)
            </p>
            <p className="text-emerald-400">→ &quot;Mystery solved!&quot;</p>
            <p className="text-slate-500">
              ▍<span className="animate-pulse">_</span>
            </p>
          </div>
        )}
      </div>
      <span className="absolute bottom-1.5 right-3 text-5xl opacity-80 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
        {game.animal}
      </span>
    </div>
  );
}

function GameCard({
  game,
  engagement,
  onLike,
  onComments,
  authed,
  openAuthModal,
  onPlay,
  progress,
}: {
  game: (typeof games)[0];
  engagement: BlogEngagement;
  onLike: (slug: string) => void;
  onComments: (slug: string) => void;
  authed: boolean;
  openAuthModal: () => void;
  onPlay: () => void;
  progress?: GameProgress;
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
          "relative h-40 overflow-hidden bg-gradient-to-br",
          game.color
        )}
      >
        <GamePreview game={game} />
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

        {!game.comingSoon && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-background-secondary/60 px-2.5 py-1.5">
              <p className="text-[0.55rem] font-semibold uppercase tracking-wider text-muted">
                Score
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-foreground">
                <Star className={cn("h-3.5 w-3.5", game.accentColor)} />
                {progress ? progress.score.toLocaleString() : "0"}
                <span className="text-[0.6rem] font-medium text-muted">
                  pts
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background-secondary/60 px-2.5 py-1.5">
              <p className="text-[0.55rem] font-semibold uppercase tracking-wider text-muted">
                Completed
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-foreground">
                <CheckCircle2 className={cn("h-3.5 w-3.5", game.accentColor)} />
                {progress
                  ? `${Object.values(progress.completed).filter(Boolean).length}/${progress.totalLevels}`
                  : "—"}
              </p>
            </div>
          </div>
        )}

        {authed && !game.comingSoon && (
          <div className="mt-2">
            {(() => {
              const done = progress
                ? Object.values(progress.completed).filter(Boolean).length
                : 0;
              const total = progress?.totalLevels ?? 0;
              const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
              return (
                <>
                  <span className="text-[0.6rem] font-semibold text-muted">
                    {done >= total
                      ? `${game.animal} Completed!`
                      : done > 0
                        ? `${game.animal} Playing — ${done}/${total} levels`
                        : `${game.animal} Not started`}
                  </span>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-background-secondary">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r", game.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        )}

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
  const { user, loading: authLoading, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [engagements, setEngagements] = useState<
    Record<string, BlogEngagement>
  >({});
  const [progress, setProgress] = useState<Record<string, GameProgress>>({});
  const [gamification, setGamification] = useState<GamificationSummary | null>(
    null
  );
  const [discussionSlug, setDiscussionSlug] = useState<string | null>(null);
  const router = useRouter();

  const currentUser = user;
  const gamesAuthed = Boolean(user) && !authLoading;

  useEffect(() => {
    games.forEach((game) => {
      fetch(`/api/blog/likes?slug=${encodeURIComponent(game.slug)}`)
        .then((r) => r.json())
        .then((d) =>
          setEngagements((prev) => ({ ...prev, [game.slug]: d }))
        )
        .catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (!gamesAuthed || !currentUser) {
      setProgress({});
      setGamification(null);
      return;
    }
    fetch("/api/games/progress")
      .then((r) => r.json())
      .then((d) => {
        if (d?.progress && typeof d.progress === "object") {
          setProgress(d.progress);
        }
        if (d?.gamification && typeof d.gamification === "object") {
          setGamification(d.gamification);
        }
      })
      .catch(() => {});
  }, [gamesAuthed, currentUser]);

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

  const handleLogout = async () => {
    await logout();
    setProgress({});
    setGamification(null);
  };

  const playerGames = games.filter((g) => !g.comingSoon);
  const pendingGames = playerGames.filter((g) => {
    const p = progress[g.slug];
    if (!p) return true;
    const done = Object.values(p.completed).filter(Boolean).length;
    return done < (p.totalLevels || 0);
  });
  const totalScore = playerGames.reduce((sum, g) => sum + (progress[g.slug]?.score ?? 0), 0);
  const completedGames = playerGames.filter((g) => {
    const p = progress[g.slug];
    if (!p) return false;
    return Object.values(p.completed).filter(Boolean).length >= (p.totalLevels || 0);
  }).length;

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

            {!gamesAuthed && !authLoading ? (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign In / Sign Up
              </button>
            ) : (
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-background-secondary sm:flex" />
            )}
          </div>

          {!gamesAuthed && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[0.65rem] text-amber-600">
              <Sparkles className="h-3 w-3" />
              A quick sign-in saves your progress, earns XP, builds daily
              streaks and gets you on the leaderboard. You stay signed in until
              you log out.
            </p>
          )}
        </div>

        <div className="mb-6">
          <LeaderboardPanel
            currentUserId={gamesAuthed ? (currentUser?.id ?? null) : null}
            onSignIn={() => setShowAuthModal(true)}
          />
        </div>

        {gamesAuthed && currentUser && (
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  seed={currentUser.id || currentUser.username}
                  name={currentUser.name}
                  className="h-14 w-14 rounded-2xl"
                />
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {currentUser.name}
                  </h2>
                  <p className="text-xs text-muted">@{currentUser.username}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1.5 rounded-full border border-border bg-background-secondary px-3.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-red-400/40 hover:text-red-500"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-background-secondary/60 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-lg bg-gradient-to-r from-primary to-violet-600 px-2.5 py-1 text-[0.65rem] font-bold text-white shadow-lg shadow-primary/25">
                    LEVEL {gamification?.level ?? 1}
                  </span>
                  <span className="text-[0.7rem] font-semibold text-foreground">
                    {(gamification?.totalXp ?? totalScore).toLocaleString()} XP
                  </span>
                  {gamification &&
                    gamification.levelNext > gamification.totalXp && (
                      <span className="text-[0.65rem] text-muted">
                        {(gamification.levelNext - gamification.totalXp).toLocaleString()}{" "}
                        XP to level {gamification.level + 1}
                      </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-[0.65rem] font-semibold text-orange-500">
                    <Flame className="h-3 w-3" />
                    {gamification?.currentStreak ?? 0} day streak
                  </span>
                  {gamification?.rank != null && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[0.65rem] font-semibold text-primary">
                      <Medal className="h-3 w-3" />
                      Rank #{gamification.rank}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-violet-600 transition-all duration-500"
                  style={{
                    width: `${Math.round((gamification?.levelProgressPct ?? 0) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background-secondary/60 p-3">
                <Star className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-lg font-bold leading-none text-foreground">
                    {(gamification?.totalXp ?? totalScore).toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] text-muted">Total XP</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background-secondary/60 p-3">
                <ListTodo className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-lg font-bold leading-none text-foreground">
                    {pendingGames.length}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] text-muted">
                    Games in progress
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background-secondary/60 p-3">
                <Award className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-lg font-bold leading-none text-foreground">
                    {completedGames}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] text-muted">Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background-secondary/60 p-3">
                <Flame className="h-5 w-5 shrink-0 text-orange-500" />
                <div>
                  <p className="text-lg font-bold leading-none text-foreground">
                    {gamification?.longestStreak ?? 0}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] text-muted">
                    Longest streak
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                Your progress
              </p>
              <div className="flex flex-wrap gap-2">
                {playerGames.map((g) => {
                  const p = progress[g.slug];
                  const done = p
                    ? Object.values(p.completed).filter(Boolean).length
                    : 0;
                  const total = p?.totalLevels ?? 0;
                  const left = p ? Math.max(0, total - done) : null;
                  const isDone = left !== null && left === 0;
                  return (
                    <Link
                      key={g.slug}
                      href={`/games/${g.slug}`}
                      className={cn(
                        "flex items-center gap-2 rounded-full border border-border bg-background-secondary px-3 py-1.5 text-xs transition-colors hover:border-primary/40",
                        g.accentColor
                      )}
                      title={`${g.title} — ${p ? `${p.score} pts, ${done}/${total} levels` : "not started"}`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <span>{g.animal}</span>
                      )}
                      <span className="font-bold text-foreground">
                        {p ? p.score : 0} pts
                      </span>
                      <span className="text-muted">
                        {left === null
                          ? "not started"
                          : left > 0
                            ? `${done}/${total} levels`
                            : "done"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {pendingGames.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-amber-600">
                  Pending games
                </p>
                <ul className="mt-1.5 space-y-1">
                  {pendingGames.map((g) => {
                    const p = progress[g.slug];
                    const done = p
                      ? Object.values(p.completed).filter(Boolean).length
                      : 0;
                    const total = p?.totalLevels ?? 0;
                    return (
                      <li key={g.slug} className="flex items-center gap-2 text-xs text-muted">
                        <span>{g.animal}</span>
                        <Link
                          href={`/games/${g.slug}`}
                          className="font-semibold text-foreground hover:text-primary"
                        >
                          {g.title}
                        </Link>
                        <span className="ml-auto">
                          {p ? `${done}/${total} levels left` : "not started"} —{" "}
                          {p?.score ?? 0} pts
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </motion.section>
        )}

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
              openAuthModal={() => setShowAuthModal(true)}
              onPlay={() => {
                setPendingSlug(game.slug);
                setShowAuthModal(true);
              }}
              progress={progress[game.slug]}
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
                    onAuthRequired={() => setShowAuthModal(true)}
                  />
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthed={() => {
          if (pendingSlug) {
            router.push(`/games/${pendingSlug}`);
            setPendingSlug(null);
          }
        }}
      />
    </div>
  );
}
