"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gamepad2,
  Sparkles,
  UserPlus,
  LogOut,
  CheckCircle2,
  Award,
  Star,
  Flame,
  Medal,
} from "lucide-react";
import { motion } from "framer-motion";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { cn } from "@/lib/utils";
import { games, type GameMeta } from "@/data/games";
import { AuthModal } from "@/components/games/auth-modal";
import { LeaderboardPanel } from "@/components/games/leaderboard-panel";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import type { GameProgress, GamificationSummary } from "@/types";

/**
 * Zero-network mini "screenshot" of each game, rendered as pure CSS/JSX so
 * cards show the game in action without a single image request (lighter than
 * any GIF/video). Coming-soon games just show their mascot over the gradient.
 */
function GamePreview({ game }: { game: GameMeta }) {
  if (game.comingSoon) {
    return (
      <span
        aria-hidden="true"
        className="text-7xl transition-transform duration-300 group-hover:scale-110"
      >
        {game.animal}
      </span>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="relative mx-3 mt-4 h-32 overflow-hidden rounded-xl border border-white/15 bg-black/80 p-3 shadow-xl">
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
            <p className="text-emerald-400">&rarr; &quot;Mystery solved!&quot;</p>
            <p className="text-slate-500">
              ▓<span className="animate-pulse">_</span>
            </p>
          </div>
        )}

        {game.slug === "php-playground" && (
          <div className="flex h-full flex-col gap-1.5 font-mono text-[0.6rem] leading-relaxed">
            <p className="text-slate-500">{"// playground.php"}</p>
            <p>
              <span className="text-purple-400">&lt;?php</span>{" "}
              <span className="text-sky-300">echo</span>{" "}
              <span className="text-emerald-300">&quot;Hello, PHP!&quot;</span>;{" "}
            </p>
            <p className="text-slate-400">
              {"$name"} = <span className="text-emerald-300">&quot;Maaz&quot;</span>;
            </p>
            <p>
              <span className="text-sky-300">echo</span>{" "}
              <span className="text-amber-300">strtoupper</span>(
              <span className="text-slate-300">{"$name"}</span>);
            </p>
            <p className="text-emerald-400"> echo &quot;MAAZ&quot;</p>
            <p className="text-slate-500">
              <span className="text-purple-400">?&gt;</span>
              <span className="animate-pulse">_</span>
            </p>
          </div>
        )}

        {game.slug === "query-quest" && (
          <div className="flex h-full flex-col gap-1.5 font-mono text-[0.6rem] leading-relaxed">
            <p className="text-slate-500">{">_ query_01.sql"}</p>
            <p>
              <span className="text-sky-300">SELECT</span>{" "}
              <span className="text-amber-300">name</span>,{" "}
              <span className="text-amber-300">tier</span>
            </p>
            <p>
              <span className="text-sky-300">FROM</span>{" "}
              <span className="text-slate-300">students</span>
            </p>
            <p>
              <span className="text-sky-300">ORDER BY</span>{" "}
              <span className="text-amber-300">tier</span>{" "}
              <span className="text-sky-300">DESC</span>;
            </p>
            <div className="mt-1 flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              3 rows · 0.2ms
            </div>
            <p className="text-slate-500">
              <span className="animate-pulse">_</span>
            </p>
          </div>
        )}

        {game.slug === "animation-arena" && (
          <div className="relative flex h-full flex-col overflow-hidden rounded-lg bg-gradient-to-b from-purple-900/40 to-black/40">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-6 h-1/3 bg-purple-500/20 blur-xl"
            />
            <div className="flex flex-1 items-center justify-center pb-1">
              <span className="rob-preview-still text-5xl drop-shadow-[0_6px_10px_rgba(167,139,250,0.35)]">
                🤖
              </span>
            </div>
            <p className="pb-2 text-center font-mono text-[0.6rem] text-purple-300">
              <span className="text-slate-400">@keyframes</span>{" "}
              <span className="text-purple-400">spin</span>{" "}
              <span className="text-slate-400">{"{"}</span>{" "}
              <span className="text-slate-500">transform:</span>{" "}
              <span className="text-amber-300">rotate(360deg)</span>{" "}
              <span className="text-slate-400">{"}"}</span>
            </p>
          </div>
        )}

      </div>
      <span
        aria-hidden="true"
        className="absolute bottom-1.5 right-3 text-5xl opacity-80 drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
      >
        {game.animal}
      </span>
    </div>
  );
}

function GameCard({
  game,
  authed,
  onPlay,
  progress,
}: {
  game: GameMeta;
  authed: boolean;
  onPlay: () => void;
  progress?: GameProgress;
}) {
  const doneCount = progress
    ? Object.values(progress.completed ?? {}).filter(Boolean).length
    : 0;
  // Fall back to the shipped level count so cards always show "X/Y" — even
  // before a progress row exists (e.g. "0/16"). Guard NaN/undefined.
  const levelCount =
    Number.isFinite(progress?.totalLevels) && (progress?.totalLevels ?? 0) > 0
      ? (progress?.totalLevels as number)
      : game.totalLevels;
  const isComplete = levelCount > 0 && doneCount >= levelCount;
  const pct =
    levelCount > 0 ? Math.min(100, Math.round((doneCount / levelCount) * 100)) : 0;
  const btnLabel = game.comingSoon
    ? null
    : !authed
      ? "Play"
      : isComplete
        ? "Play again"
        : doneCount > 0
          ? "Continue"
          : "Start";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 hover:shadow-lg",
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
          <div className="absolute right-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-muted backdrop-blur-sm">
            Coming Soon
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-foreground">
            {game.title}
          </h3>
          <span
            title={
              game.difficulty.includes("\u2192")
                ? "Multiple difficulty tiers inside one game \u2014 easy to advanced challenges"
                : undefined
            }
            className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
          >
            {game.difficulty}
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-3 min-h-[3.75rem]">
          {game.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {game.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="rounded-md border border-border bg-background-secondary px-2 py-0.5 text-xs font-medium text-muted"
            >
              {topic}
            </span>
          ))}
          {game.topics.length > 4 && (
            <span className="rounded-md border border-border bg-background-secondary px-2 py-0.5 text-xs font-medium text-muted">
              +{game.topics.length - 4}
            </span>
          )}
        </div>

        {!game.comingSoon && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-background-secondary/60 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Score
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xl font-bold leading-none text-foreground">
                <Star className={cn("h-4 w-4", game.accentColor)} />
                {progress ? progress.score.toLocaleString() : "0"}
                <span className="text-xs font-medium text-muted">
                  pts
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background-secondary/60 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Completed
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xl font-bold leading-none text-foreground">
                <CheckCircle2 className={cn("h-4 w-4", game.accentColor)} />
                {`${doneCount}/${levelCount}`}
              </p>
            </div>
          </div>
        )}

        {authed && !game.comingSoon && (
          <div className="mt-3">
            {isComplete ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </span>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {doneCount > 0
                    ? `In progress \u2014 ${doneCount}/${levelCount} levels`
                    : "Not started"}
                </p>
                {doneCount > 0 && (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r",
                        game.color
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-center gap-3 border-t border-border/50 pt-4 sm:justify-end">
          {game.comingSoon ? (
            <span className="text-xs text-muted">Stay tuned...</span>
          ) : authed ? (
            <Link
              href={`/games/${game.slug}`}
              className="flex w-full justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 sm:w-auto"
            >
              {btnLabel}
            </Link>
          ) : (
            <button
              onClick={onPlay}
              className="flex w-full justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 sm:w-auto"
            >
              {btnLabel}
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
  const [progress, setProgress] = useState<Record<string, GameProgress>>({});
  const [gamification, setGamification] = useState<GamificationSummary | null>(
    null
  );
  const router = useRouter();

  const currentUser = user;
  const gamesAuthed = Boolean(user) && !authLoading;

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

  const handleLogout = async () => {
    await logout();
    setProgress({});
    setGamification(null);
  };

  const playerGames = games.filter((g) => !g.comingSoon);
  const totalScore = playerGames.reduce((sum, g) => sum + (progress[g.slug]?.score ?? 0), 0);
  const completedGames = playerGames.filter((g) => {
    const p = progress[g.slug];
    if (!p) return false;
    const total = Number.isFinite(p.totalLevels) ? p.totalLevels : 0;
    if (total <= 0) return false;
    return Object.values(p.completed ?? {}).filter(Boolean).length >= total;
  }).length;

  return (
    <div className="relative min-h-screen bg-background">
      <GlassNavbar activeSection="games" />

      <main id="main-content" className="main-content mx-auto w-full max-w-content px-[var(--content-pad-inline)] pb-24">
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted shadow-sm transition-colors hover:border-primary/40 hover:text-foreground"
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
                  Fun interactive games to master HTML, CSS, JavaScript, PHP
                  &amp; SQL
                </p>
              </div>
            </div>

            {!gamesAuthed && !authLoading && (
              <button
                onClick={() => {
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
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400">
              <Sparkles className="h-3 w-3" />
              A quick sign-in saves your progress, earns XP, builds daily
              streaks and gets you on the leaderboard. Your session stays
              active for up to a year, or until you log out.
            </p>
          )}
        </div>

        <div className="mb-6">
          <LeaderboardPanel
            currentUserId={gamesAuthed ? (currentUser?.id ?? null) : null}
            onSignIn={() => setShowAuthModal(true)}
            onPlayGame={() => {
              const reduced =
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              document
                .getElementById("games-grid")
                ?.scrollIntoView({
                  behavior: reduced ? "auto" : "smooth",
                  block: "start",
                });
            }}
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
                  <span className="rounded-lg bg-gradient-to-r from-primary to-violet-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg shadow-primary/25">
                    LEVEL {gamification?.level ?? 1}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {(gamification?.totalXp ?? totalScore).toLocaleString()} XP
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:text-orange-400">
                    <Flame className="h-3 w-3" />
                    {gamification?.currentStreak ?? 0} day streak
                  </span>
                  {gamification?.rank != null && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
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
              {gamification &&
                gamification.levelNext > gamification.totalXp && (
                  <p className="mt-1.5 text-right text-xs text-muted">
                    {(gamification.levelNext - gamification.totalXp).toLocaleString()}{" "}
                    XP to next level
                  </p>
                )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background-secondary/60 p-3">
                <Star className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-none text-foreground">
                    {(gamification?.totalXp ?? totalScore).toLocaleString()}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    Total XP
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-3",
                  completedGames === playerGames.length
                    ? "border-green-400/30 bg-green-500/10"
                    : completedGames > 0
                      ? "border-primary/30 bg-primary/10"
                      : "border-border bg-background-secondary/60"
                )}
              >
                <Award
                  className={cn(
                    "h-5 w-5 shrink-0",
                    completedGames === playerGames.length
                      ? "text-green-700 dark:text-green-400"
                      : "text-primary"
                  )}
                />
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-none text-foreground">
                    {completedGames}/{playerGames.length}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    Games completed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background-secondary/60 p-3">
                <Flame className="h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-none text-foreground">
                    {gamification?.currentStreak ?? 0}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    Day streak
                  </p>
                </div>
              </div>
            </div>

            {completedGames < playerGames.length && (
              <p className="mt-3 text-center text-xs text-muted">
                Finish any game to see it light up green below — your first
                completed game is a level away.
              </p>
            )}
          </motion.section>
        )}

        <div id="games-grid" className="grid grid-cols-1 gap-5 min-[900px]:grid-cols-2">
          {games.map((game) => (
            <GameCard
              key={game.slug}
              game={game}
              authed={Boolean(currentUser) && gamesAuthed}
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
            All seven games are ready to play!
          </p>
          <p className="mt-1 text-xs text-muted">
            HTML, CSS, JavaScript, PHP, and SQL games to help you learn web
            development step by step — start at HTML Hero and climb to Query
            Quest.
          </p>
        </div>
      </main>

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
