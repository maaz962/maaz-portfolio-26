"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, History, Sparkles, Trophy, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard } from "@/components/admin/admin-card";
import { EmptyState } from "@/components/admin/empty-state";
import { StatCard } from "@/components/admin/analytics/stat-card";
import { InfoRow } from "@/components/admin/analytics/info-row";
import { ToastProvider, useToast } from "@/components/admin/toast";
import { useUserDetail } from "./use-user-detail";
import { XpAdjustmentPanel } from "./xp-adjustment-panel";
import { VisibilityPanel } from "./visibility-panel";
import { DangerZone } from "./danger-zone";
import type { AdminUserGameProgress, XpAdjustmentRecord } from "@/types";

/**
 * `/admin/users/[id]` — the one place an admin changes anything about a user.
 *
 * XP changes, leaderboard visibility and deletion used to be split between the
 * leaderboard and the users list, which gave an irreversible action two entry
 * points with different confirmation behaviour. They share one flow here, and
 * every XP write records who made it and why.
 */
export function UserDetailView({ userId }: { userId: string }) {
  return (
    <ToastProvider>
      <UserDetailPage userId={userId} />
    </ToastProvider>
  );
}

function UserDetailPage({ userId }: { userId: string }) {
  const router = useRouter();
  const { detail, loading, loaded, saving, feedback, reload, setTotalXp, setHidden, remove } =
    useUserDetail(userId);

  const { notify } = useToast();

  useEffect(() => {
    if (feedback) notify(feedback.message, feedback.variant);
  }, [feedback, notify]);

  const gameColumns = useMemo<AdminColumn<AdminUserGameProgress>[]>(
    () => [
      {
        key: "game",
        header: "Game",
        render: (game) => <span className="text-sm font-medium text-foreground">{game.title}</span>,
      },
      {
        key: "progress",
        header: "Levels",
        hideBelow: "sm",
        render: (game) => (
          <span className="text-mono text-sm whitespace-nowrap text-muted">
            {game.completedLevels}/{game.totalLevels}
          </span>
        ),
      },
      {
        key: "level",
        header: "Current",
        hideBelow: "md",
        className: "text-right",
        render: (game) => <span className="text-mono text-sm text-muted">{game.currentLevel}</span>,
      },
      {
        key: "score",
        header: "Score",
        className: "text-right whitespace-nowrap",
        render: (game) => (
          <span className="text-mono text-sm text-foreground">
            {game.score.toLocaleString()}
            {game.maxScore !== null && <span className="text-muted">/{game.maxScore}</span>}
          </span>
        ),
      },
    ],
    []
  );

  const historyColumns = useMemo<AdminColumn<XpAdjustmentRecord>[]>(
    () => [
      {
        key: "change",
        header: "Change",
        render: (entry) => {
          const delta = entry.totalXp - entry.previousTotalXp;
          return (
            <span className="text-mono text-sm whitespace-nowrap">
              <span className="text-muted">{entry.previousTotalXp.toLocaleString()}</span>
              <ChevronRight className="mx-1 inline h-3 w-3 text-muted" />
              <span className="text-foreground">{entry.totalXp.toLocaleString()}</span>
              <span
                className={
                  delta >= 0
                    ? "ml-2 text-emerald-600 dark:text-emerald-400"
                    : "ml-2 text-red-500"
                }
              >
                ({delta >= 0 ? "+" : ""}
                {delta.toLocaleString()})
              </span>
            </span>
          );
        },
      },
      {
        key: "reason",
        header: "Reason",
        render: (entry) => <span className="text-sm break-words text-foreground/80">{entry.reason}</span>,
      },
      {
        key: "by",
        header: "Applied by",
        hideBelow: "lg",
        render: (entry) => <span className="text-mono text-sm text-muted">@{entry.appliedBy}</span>,
      },
      {
        key: "when",
        header: "When",
        hideBelow: "md",
        className: "text-right whitespace-nowrap",
        render: (entry) => (
          <span className="text-mono text-sm text-muted">
            {new Date(entry.createdAt).toLocaleString()}
          </span>
        ),
      },
    ],
    []
  );

  if (!loaded) return <DetailSkeleton />;

  if (!detail) {
    return (
      <AdminPage>
        <EmptyState
          icon={UserX}
          title="User not found"
          description="This account may have been deleted, or the link is out of date."
        />
      </AdminPage>
    );
  }

  const { user } = detail;

  return (
    <AdminPage>
      <div className="space-y-5">
        {/* ---------- Identity header ---------- */}
        <AdminCard as="section">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar seed={user.id} name={user.name} className="h-12 w-12 shrink-0" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display truncate text-xl font-semibold text-foreground">
                    {user.name}
                  </h1>
                  {user.isAdmin && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Admin
                    </span>
                  )}
                  {user.hiddenFromLeaderboard && !user.isAdmin && (
                    <span className="rounded-full bg-muted/10 px-2 py-0.5 text-xs font-medium text-muted">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-muted">
                  @{user.username} &middot; {user.email}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
              Refresh
            </Button>
          </div>
        </AdminCard>

        {/* ---------- Gamification summary ---------- */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Sparkles} label="Total XP" value={detail.totalXp.toLocaleString()} />
          <StatCard icon={Trophy} label="Level" value={detail.level} />
          <StatCard
            icon={Trophy}
            label="Rank"
            value={detail.rank === null ? "Unranked" : `#${detail.rank}`}
          />
          <StatCard icon={Sparkles} label="Streak" value={`${detail.currentStreak}d`} />
        </section>

        <AdminCard as="section">
          <h2 className="mb-4 text-base font-semibold text-foreground">Level progress</h2>
          <div className="h-2.5 overflow-hidden rounded-full bg-background-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.round(detail.levelProgressPct * 100)}%` }}
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoRow label="Level floor" value={`${detail.levelFloor.toLocaleString()} XP`} />
            <InfoRow label="Next level" value={`${detail.levelNext.toLocaleString()} XP`} />
            <InfoRow label="Games played" value={String(detail.gamesPlayed)} />
            <InfoRow
              label="Admin XP offset"
              value={`${detail.xpAdjustment > 0 ? "+" : ""}${detail.xpAdjustment.toLocaleString()} XP`}
            />
          </div>
        </AdminCard>

        {/* ---------- Per-game progress ---------- */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Game progress</h2>
          <AdminTable<AdminUserGameProgress>
            caption={`Game progress for ${user.username}`}
            columns={gameColumns}
            rows={detail.games}
            getRowKey={(game) => game.gameSlug}
            sort={null}
            onSortChange={() => {}}
            emptyColSpan={gameColumns.length}
            empty={
              <EmptyState
                icon={Sparkles}
                title="No games played yet"
                description="Progress appears here once this account saves its first game."
              />
            }
          />
        </section>

        {/* ---------- Mutations ---------- */}
        <XpAdjustmentPanel detail={detail} saving={saving} onApply={setTotalXp} />
        <VisibilityPanel detail={detail} saving={saving} onChange={setHidden} />

        {/* ---------- XP audit trail ---------- */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">XP change history</h2>
          <AdminTable<XpAdjustmentRecord>
            caption={`XP changes for ${user.username}`}
            columns={historyColumns}
            rows={detail.xpHistory}
            getRowKey={(entry) => entry.id}
            sort={null}
            onSortChange={() => {}}
            emptyColSpan={historyColumns.length}
            empty={
              <EmptyState
                icon={History}
                title="No XP changes yet"
                description="Manual XP adjustments are recorded here with the reason and who applied them."
              />
            }
          />
        </section>

        <DangerZone
          user={user}
          saving={saving}
          onConfirm={remove}
          onDeleted={() => {
            router.replace("/admin/users");
            router.refresh();
          }}
        />
      </div>
    </AdminPage>
  );
}

function DetailSkeleton() {
  return (
    <AdminPage>
      <div className="space-y-5">
        <div className="h-24 animate-pulse rounded-2xl bg-background-secondary" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-background-secondary" />
          ))}
        </div>
        <div className="h-40 animate-pulse rounded-2xl bg-background-secondary" />
      </div>
    </AdminPage>
  );
}
