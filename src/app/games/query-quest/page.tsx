"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Database,
  Lock,
  Play,
  RefreshCw,
  Sparkles,
  Terminal,
  Trophy,
} from "lucide-react";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { AuthGate } from "@/components/games/auth-gate";
import { AuthModal } from "@/components/games/auth-modal";
import { GameSocial } from "@/components/games/game-social";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/lib/auth-context";
import "./game.css";

const GAME_SLUG = "query-quest";
const FALLBACK_TOTAL_LEVELS = 8;

interface QqLevelMeta {
  id: number;
  title: string;
  tier: "easy" | "intermediate" | "hard" | "mostHard";
  concept: string;
  points: number;
  isFinal?: boolean;
  seedCode: string;
  seedHint: string;
}

interface QqGameState {
  currentLevel: number;
  score: number;
  completed: Record<number, boolean>;
  totalLevels: number;
}

const TIER_ORDER = ["easy", "intermediate", "hard", "mostHard"];

const TIER_META: Record<string, { label: string; blurb: string }> = {
  easy: { label: "Easy", blurb: "SELECT, FROM, WHERE, ORDER BY — read data like a pro." },
  intermediate: { label: "Intermediate", blurb: "JOINs, aliases, aggregate fns & GROUP BY." },
  hard: { label: "Hard", blurb: "Subqueries, CASE, UPDATE/INSERT with real data." },
  mostHard: { label: "Most Hard", blurb: "DELETE, HAVING, window-ish tricks & the final boss." },
};

const TIER_STYLE: Record<string, { bar: string; chip: string }> = {
  easy: {
    bar: "from-emerald-500 to-teal-400",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  },
  intermediate: {
    bar: "from-sky-500 to-indigo-400",
    chip: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  },
  hard: {
    bar: "from-amber-500 to-orange-400",
    chip: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  },
  mostHard: {
    bar: "from-rose-500 to-red-400",
    chip: "bg-rose-500/15 text-rose-300 border-rose-400/30",
  },
};

export default function QueryQuestPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [levels, setLevels] = useState<QqLevelMeta[]>([]);
  const [gameState, setGameState] = useState<QqGameState>({
    currentLevel: 0,
    score: 0,
    completed: {},
    totalLevels: FALLBACK_TOTAL_LEVELS,
  });
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [booting, setBooting] = useState(true);
  const [result, setResult] = useState<{
    ok: boolean;
    rows?: any[];
    error?: string;
    stdout?: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");

  const loggedIn = !authLoading && Boolean(currentUser);
  const gamesAuthed = loggedIn;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed,
    initKey: "__initQueryQuest",
    resumeKey: "__resumeQueryQuest",
    emitterKey: "__onQueryQuestProgress",
  });

  useEffect(() => {
    if (!gamesAuthed) return;
    const w = window as any;
    let alive = true;
    let levelsTimer: ReturnType<typeof setTimeout> | undefined;
    let stateTimer: ReturnType<typeof setTimeout> | undefined;

    const pollLevels = () => {
      if (!alive) return;
      if (typeof w.__getQueryQuestLevels === "function") {
        const meta = w.__getQueryQuestLevels();
        if (Array.isArray(meta) && meta.length) {
          setLevels(meta);
        } else {
          levelsTimer = setTimeout(pollLevels, 120);
        }
      } else {
        levelsTimer = setTimeout(pollLevels, 100);
      }
    };

    const pullState = () => {
      if (!alive) return;
      if (typeof w.__getQueryQuestState === "function") {
        const s = w.__getQueryQuestState();
        if (s && s.totalLevels > 0) {
          setBooting(false);
          setGameState((g) => ({ ...g, ...s }));
        } else {
          stateTimer = setTimeout(pullState, 150);
        }
      } else {
        stateTimer = setTimeout(pullState, 120);
      }
    };

    const onState = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) setGameState((g) => ({ ...g, ...detail }));
    };

    pollLevels();
    pullState();
    window.addEventListener("query-quest-state", onState);
    return () => {
      alive = false;
      clearTimeout(levelsTimer);
      clearTimeout(stateTimer);
      window.removeEventListener("query-quest-state", onState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesAuthed]);

  const current = useMemo(
    () => levels.find((l) => l.id === gameState.currentLevel),
    [levels, gameState.currentLevel]
  );

  useEffect(() => {
    if (current) {
      setCode(current.seedCode);
      setResult(null);
      setShowHint(false);
    }
  }, [current]);

  const run = async () => {
    const w = window as any;
    if (typeof w.__runQueryQuest === "function") {
      setRunning(true);
      setResult(null);
      try {
        const r = await w.__runQueryQuest(code, gameState.currentLevel);
        setResult(typeof r === "object" ? r : { ok: !!r, stdout: String(r) });
      } catch (e) {
        setResult({ ok: false, error: String(e) });
      } finally {
        setRunning(false);
      }
    } else {
      setResult({ ok: false, error: "SQL engine is still starting up. Give it a second and try again." });
    }
  };

  const goLevel = (id: number) => {
    const w = window as any;
    if (typeof w.__goToQueryQuestLevel === "function") w.__goToQueryQuestLevel(id);
  };

  const tierFor = (l: QqLevelMeta) => l.tier;
  const tierLevels = (tier: string) => levels.filter((l) => tierFor(l) === tier);
  const tierDone = (tier: string) => tierLevels(tier).filter((l) => gameState.completed[l.id]).length;
  const tierOpen = (tier: string) => {
    const i = TIER_ORDER.indexOf(tier);
    if (i <= 0) return true;
    const prev = TIER_ORDER[i - 1] ?? "";
    const prevList = tierLevels(prev);
    if (!prevList.length) return true;
    return tierDone(prev) === prevList.length;
  };

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100">
      <GlassNavbar activeSection="games" />
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Engine + levels are lazy-loaded from the public WASM folder. */}
      <Script src="/games/query-quest/levels.js" strategy="afterInteractive" />
      <Script src="/games/query-quest/game.js" strategy="afterInteractive" />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/games"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
              aria-label="Back to all games"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🗃️</span>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Query Quest</h1>
              </div>
              <p className="text-sm text-slate-400">
                Solv SQL queries against a real in-browser SQLite database — powered by sql.js (WASM).
              </p>
            </div>
          </div>
          <GameSocial slug={GAME_SLUG}  title="Query Quest" emoji="dY-?{?" accentText="text-emerald-400" accentBg="bg-emerald-500/10" currentUser={currentUser} canInteract={gamesAuthed} onAuthRequired={() => { setAuthRequest("login"); setShowAuthModal(true); }} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* LEFT — tier / level sidebar */}
          <aside className="space-y-5">
            {TIER_ORDER.map((tier) => {
              const tLevels = tierLevels(tier);
              if (!tLevels.length) return null;
              const open = tierOpen(tier);
              const done = tierDone(tier);
              const meta = TIER_META[tier];
              const style = TIER_STYLE[tier];
              return (
                <div key={tier} className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-200">{meta?.label}</h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${style?.chip}`}
                    >
                      <Check className="h-3 w-3" />
                      {done}/{tLevels.length}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-slate-500">{meta?.blurb}</p>
                  <div className="space-y-1.5">
                    {tLevels.map((l) => {
                      const isCurrent = l.id === gameState.currentLevel;
                      const isDone = gameState.completed[l.id];
                      return (
                        <button
                          key={l.id}
                          onClick={() => open && goLevel(l.id)}
                          disabled={!open && !isCurrent}
                          className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                            isCurrent
                              ? "border-emerald-400/50 bg-emerald-500/10 text-white"
                              : open
                                ? "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:text-white"
                                : "cursor-not-allowed border-slate-800/50 text-slate-600"
                          }`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-[11px] text-slate-400">
                            {isDone ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : l.id}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{l.title}</span>
                          <Lock className={`h-3.5 w-3.5 shrink-0 ${open ? "opacity-0" : ""}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Score
                </span>
                <span className="font-display font-bold text-amber-300">{gameState.score} XP</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all"
                  style={{
                    width: `${((gameState.score || 0) / Math.max(gameState.totalLevels * 75, 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </aside>

          {/* RIGHT — editor + output */}
          <section className="space-y-4">
            {booting && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Downloading &amp; booting the SQLite engine (WASM ~640&nbsp;KB)…
              </div>
            )}

            {current && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <h3 className="font-semibold text-white">
                      Level {current.id} · {current.title}
                    </h3>
                  </div>
                  {current.points > 0 && (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                      +{current.points} XP
                    </span>
                  )}
                </div>
                <p className="mb-4 text-sm text-slate-400">
                  <span className="font-semibold text-slate-200">Mission:</span> {current.seedHint}
                </p>

                <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b0f1a]">
                  <CodeMirror
                    value={code}
                    height="240px"
                    theme={oneDark}
                    extensions={[sql()]}
                    onChange={(v) => setCode(v)}
                    readOnly={!gamesAuthed}
                    basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={run}
                    disabled={!gamesAuthed || running}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Run &amp; Check
                  </button>
                  <button
                    onClick={() => setShowHint((s) => !s)}
                    disabled={!gamesAuthed}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 disabled:opacity-50"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${showHint ? "rotate-180" : ""}`} />
                    Hint
                  </button>
                  <span className="ml-auto flex items-center gap-1.5 text-sm text-slate-500">
                    <Terminal className="h-4 w-4" />
                    SQLite · sql.js
                  </span>
                </div>

                {showHint && current.seedCode && (
                  <div className="mt-3 rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 text-sm text-sky-200">
                    <span className="font-semibold">Starter:</span>{" "}
                    <code className="text-sky-100">{current.seedCode}</code>
                  </div>
                )}

                {result && (
                  <div
                    className={`mt-3 rounded-xl border p-4 text-sm ${
                      result.ok
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200"
                        : "border-rose-500/30 bg-rose-500/5 text-rose-200"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      {result.ok ? <Trophy className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                      {result.ok ? "Correct! Nice query." : "Not quite — engine said:"}
                    </div>
                    {result.error && <pre className="mt-1 whitespace-pre-wrap text-xs text-rose-200/90">{result.error}</pre>}
                    {Array.isArray(result.rows) && (
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-emerald-500/20 text-emerald-300">
                              {Object.keys(result.rows[0] || {}).map((k) => (
                                <th key={k} className="px-2 py-1 font-medium">
                                  {k}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {result.rows.map((row, i) => (
                              <tr key={i} className="border-b border-slate-800/60">
                                {Object.values(row).map((v, j) => (
                                  <td key={j} className="px-2 py-1 text-slate-300">
                                    {String(v)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!gamesAuthed && (
              <AuthGate
                loading={authLoading}
                onSignIn={() => { setAuthRequest("login"); setShowAuthModal(true); }}
                onRegister={() => { setAuthRequest("register"); setShowAuthModal(true); }}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
