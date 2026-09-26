"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { GamePreview } from "@/components/games/game-preview";
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
import { buttonStyles } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { games, type GameMeta } from "@/data/games";
import { AuthModal } from "@/components/games/auth-modal";
import { LeaderboardPanel } from "@/components/games/leaderboard-panel";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import type { GameProgress, GamificationSummary } from "@/types";

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
  // Fall back to the shipped level count so cards always show "X/Y": even
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
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 hover:shadow-glow",
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
          <h3 className="font-display text-lg font-semibold text-foreground">
            {game.title}
          </h3>
          <Chip
            variant="primary"
            title={
              game.difficulty.includes("\u2192")
                ? "Multiple difficulty tiers inside one game \u2014 easy to advanced challenges"
                : undefined
            }
            className="shrink-0 font-semibold"
          >
            {game.difficulty}
          </Chip>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-3 min-h-[3.75rem]">
          {game.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {game.topics.slice(0, 4).map((topic) => (
            <Chip key={topic} className="font-semibold">
              {topic}
            </Chip>
          ))}
          {game.topics.length > 4 && (
            <Chip className="font-semibold">+{game.topics.length - 4}</Chip>
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
              className={buttonStyles({
                size: "sm",
                variant: "primary",
                className: "w-full sm:w-auto",
              })}
            >
              {btnLabel}
            </Link>
          ) : (
            <button
              onClick={onPlay}
              className={buttonStyles({
                size: "sm",
                variant: "primary",
                className: "w-full sm:w-auto",
              })}
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
  const { user, loading: authLoading, logout, refresh } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, GameProgress>>({});
  const [gamification, setGamification] = useState<GamificationSummary | null>(
    null
  );
  const router = useRouter();

  const currentUser = user;
  const gamesAuthed = Boolean(user) && !authLoading;

  const loadProgress = useCallback(async () => {
    if (!gamesAuthed || !currentUser) {
      setProgress({});
      setGamification(null);
      return;
    }

    try {
      const res = await fetch("/api/games/progress", {
        cache: "no-store",
      });
      if (res.status === 401) {
        setProgress({});
        setGamification(null);
        await refresh();
        return;
      }
      if (!res.ok) return;

      const data = await res.json();
      if (data?.progress && typeof data.progress === "object") {
        setProgress(data.progress);
      }
      if (data?.gamification && typeof data.gamification === "object") {
        setGamification(data.gamification);
      }
    } catch {}
  }, [gamesAuthed, currentUser, refresh]);

  useEffect(() => {
    const refreshProgress = () => {
      if (document.visibilityState === "visible") {
        void loadProgress();
      }
    };

    void loadProgress();
    const interval = window.setInterval(refreshProgress, 15000);
    window.addEventListener("focus", refreshProgress);
    document.addEventListener("visibilitychange", refreshProgress);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshProgress);
      document.removeEventListener("visibilitychange", refreshProgress);
    };
  }, [loadProgress]);

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

      <main id="main-content" className="main-content mx-auto w-full max-w-content-wide px-[var(--content-pad-inline)] pb-24">
        <div className="mx-auto w-full max-w-[1100px]">
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
                <h1 className="font-display text-2xl font-semibold text-foreground">
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
                className={buttonStyles({
                  size: "sm",
                  className: "bg-gradient-to-r from-primary to-[hsl(var(--games-accent))]",
                })}
              >
                <UserPlus className="h-4 w-4" strokeWidth={1.75} />
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
                className={buttonStyles({
                  variant: "outline",
                  size: "sm",
                  className: "hover:border-red-400/40 hover:text-red-500",
                })}
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Logout
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-background-secondary/60 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-lg bg-gradient-to-r from-primary to-[hsl(var(--games-accent))] px-2.5 py-1 text-xs font-bold text-white shadow-lg shadow-primary/25">
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
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--games-accent))] transition-all duration-500"
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
                Finish any game to see it light up green below, your first
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
            development step by step, start at HTML Hero and climb to Query
            Quest.
          </p>
        </div>
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
