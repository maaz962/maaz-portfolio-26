"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import CodeMirror from "@uiw/react-codemirror";
import { php } from "@codemirror/lang-php";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Gamepad2,
  Lock,
  Pause,
  Play,
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

const GAME_SLUG = "php-playground";
const FALLBACK_TOTAL_LEVELS = 8;

interface PhpLevelMeta {
  id: number;
  title: string;
  tier: "easy" | "intermediate" | "hard" | "mostHard";
  concepts: string[];
  points: number;
  isFinal?: boolean;
  seedCode: string;
  seedHint: string;
}

interface PhpGameState {
  currentLevel: number;
  score: number;
  completed: Record<number, boolean>;
  totalLevels: number;
}

const TIER_ORDER = ["easy", "intermediate", "hard", "mostHard"];

const TIER_META: Record<string, { label: string; blurb: string }> = {
  easy: { label: "Easy", blurb: "echo, variables, types & control flow" },
  intermediate: { label: "Intermediate", blurb: "functions, arrays & string helpers" },
  hard: { label: "Hard", blurb: "superglobals, null-coalescing & array fns" },
  mostHard: { label: "Most Hard", blurb: "array_map, array_sum & the boss levels" },
};

const TIER_STYLE: Record<string, { chip: string }> = {
  easy: { chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
  intermediate: { chip: "bg-sky-500/15 text-sky-300 border-sky-400/30" },
  hard: { chip: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
  mostHard: { chip: "bg-rose-500/15 text-rose-300 border-rose-400/30" },
};

export default function PhpPlaygroundPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequest, setAuthRequest] = useState<"login" | "register">("login");
  const [levels, setLevels] = useState<PhpLevelMeta[]>([]);
  const [gameState, setGameState] = useState<PhpGameState>({
    currentLevel: 0,
    score: 0,
    completed: {},
    totalLevels: FALLBACK_TOTAL_LEVELS,
  });
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootMsg, setBootMsg] = useState(
    "Loading the in-browser PHP engine (WebAssembly, ~19 MB on first visit, then cached)…"
  );
  const [result, setResult] = useState<{
    ok: boolean;
    stdout?: string;
    error?: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);

  const loggedIn = Boolean(currentUser) && !authLoading;
  const gamesAuthed = loggedIn;

  useGameProgress({
    slug: GAME_SLUG,
    enabled: gamesAuthed,
    initKey: "__initPhpPlayground",
    resumeKey: "__resumePhpPlayground",
    emitterKey: "__onPhpPlaygroundProgress",
  });

  useEffect(() => {
    if (!gamesAuthed) return;
    const w = window as any;
    let alive = true;
    let levelsTimer: ReturnType<typeof setTimeout> | undefined;
    let stateTimer: ReturnType<typeof setTimeout> | undefined;

    const pollLevels = () => {
      if (!alive) return;
      if (typeof w.__getPhpPlaygroundLevels === "function") {
        const meta = w.__getPhpPlaygroundLevels();
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
      if (typeof w.__getPhpPlaygroundState === "function") {
        const s = w.__getPhpPlaygroundState();
        if (s && s.totalLevels > 0) {
          setBooting(false);
          setGameState((g) => ({ ...g, ...s }));
        } else {
          stateTimer = setTimeout(pullState, 150);
        }
      } else {
        stateTimer = setTimeout(pullState, 100);
      }
    };

    const onBoot = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail) return;
      if (detail.status === "booting") {
        setBooting(true);
      } else if (detail.status === "ready") {
        setBooting(false);
        setBootMsg("PHP ready — running live in your browser.");
      } else if (detail.status === "error") {
        setBooting(false);
        setBootMsg("PHP engine failed to start — see deployment notes for the php-wasm assets.");
        setResult({ ok: false, error: detail.message || "PHP engine failed to boot." });
      }
    };
    const onState = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) setGameState((g) => ({ ...g, ...detail }));
    };

    pollLevels();
    pullState();
    window.addEventListener("php-playground-boot", onBoot);
    window.addEventListener("php-playground-state", onState);
    return () => {
      alive = false;
      clearTimeout(levelsTimer);
      clearTimeout(stateTimer);
      window.removeEventListener("php-playground-boot", onBoot);
      window.removeEventListener("php-playground-state", onState);
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
    if (typeof w.__runPhpPlayground === "function") {
      setRunning(true);
      setResult(null);
      try {
        const r = await w.__runPhpPlayground(code, gameState.currentLevel);
        setResult(typeof r === "object" ? r : { ok: !!r, stdout: String(r) });
      } catch (e) {
        setResult({ ok: false, error: String(e) });
      } finally {
        setRunning(false);
      }
    } else {
      setResult({
        ok: false,
        error: "The PHP engine is still starting up — give it a few seconds, then try again.",
      });
    }
  };

  const goLevel = (id: number) => {
    const w = window as any;
    if (typeof w.__goToPhpPlaygroundLevel === "function") w.__goToPhpPlaygroundLevel(id);
  };

  const tierFor = (l: PhpLevelMeta) => l.tier || "easy";
  const tierLevels = (tier: string) => levels.filter((l) => tierFor(l) === tier);
  const tierDone = (tier: string) => tierLevels(tier).filter((l) => gameState.completed[l.id]).length;
  const openTiers = (tier: string) => {
    const i = TIER_ORDER.indexOf(tier);
    if (i <= 0) return true;
    const prev = TIER_ORDER[i - 1] ?? "";
    const prevList = tierLevels(prev);
    if (!prevList.length) return true;
    return tierDone(prev) === prevList.length;
  };

  return (
    <div className="relative min-h-screen bg-[#04060c] text-slate-100">
      <GlassNavbar activeSection="games" />
      {showAuthModal && (
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authRequest}
        />
      )}

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/games"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-400 transition hover:border-slate-500 hover:text-foreground"
              aria-label="Back to all games"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐘</span>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">PHP Playground</h1>
              </div>
              <p className="text-sm text-slate-400">
                Type real PHP and watch it run live in your browser — a sandboxed PHP 8.4 compiled to WebAssembly.
              </p>
            </div>
          </div>
          <GameSocial
            slug={GAME_SLUG}
            title="PHP Playground"
            emoji="🐘"
            accentText="text-amber-400"
            accentBg="bg-amber-500/10"
            currentUser={currentUser}
            canInteract={gamesAuthed}
            onAuthRequired={() => {
              setAuthRequest("login");
              setShowAuthModal(true);
            }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-5">
            {TIER_ORDER.map((tier) => {
              const list = tierLevels(tier);
              if (!list.length) return null;
              const open = openTiers(tier);
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
                      {done}/{list.length}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-slate-500">{meta?.blurb}</p>
                  <div className="space-y-1.5">
                    {list.map((l) => {
                      const isCurrent = l.id === gameState.currentLevel;
                      const isDone = !!gameState.completed[l.id];
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => goLevel(l.id)}
                          disabled={!open && !isCurrent}
                          className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                            isCurrent
                              ? "border-amber-400/50 bg-amber-500/10 text-white"
                              : open
                                ? "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:text-white"
                                : "cursor-not-allowed border-slate-800/50 text-slate-600"
                          }`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-[11px] text-slate-400">
                            {isDone ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : l.id}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{l.title}</span>
                          {!open && !isCurrent && <Lock className="h-3.5 w-3.5 shrink-0" />}
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
                  <Gamepad2 className="h-4 w-4" />
                  Score
                </span>
                <span className="font-bold text-amber-300">{gameState.score} XP</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all"
                  style={{ width: `${(gameState.score / Math.max(gameState.totalLevels * 75, 1)) * 100}%` }}
                />
              </div>
            </div>

            {booting && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
                <Play className="h-4 w-4 animate-pulse" />
                <span>{bootMsg}</span>
              </div>
            )}
          </aside>

          <section className="space-y-4">
            {!loggedIn && (
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
            )}

            {loggedIn && current && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Pause className="h-4 w-4 text-amber-400" />
                    <h3 className="font-semibold text-foreground">
                      Level {current.id} · {current.title}
                    </h3>
                  </div>
                  {current.points > 0 && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                      +{current.points} XP
                    </span>
                  )}
                </div>
                <p className="mb-3 text-sm text-slate-400">{current.seedHint}</p>

                <div className="overflow-hidden rounded-xl border border-slate-800">
                  <CodeMirror
                    value={code}
                    height="260px"
                    theme={oneDark}
                    extensions={[php()]}
                    onChange={(v) => setCode(v)}
                    editable={gamesAuthed}
                    basicSetup={{ lineNumbers: true, foldGutter: false }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={run}
                    disabled={!gamesAuthed || running}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {running ? <Terminal className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {running ? "Running…" : "Run PHP"}
                  </button>
                  <button
                    onClick={() => setShowHint((s) => !s)}
                    disabled={!gamesAuthed}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 disabled:opacity-50"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showHint ? "rotate-180" : ""}`}
                    />
                    Hint
                  </button>
                  <span className="ml-auto flex items-center gap-1.5 text-sm text-slate-500">
                    <Sparkles className="h-4 w-4" />
                    PHP 8.4 · in-browser
                  </span>
                </div>

                {showHint && current.seedCode && (
                  <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
                    <p className="mb-1 font-semibold text-amber-300">Starter code</p>
                    <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-amber-100/90">
                      {current.seedCode}
                    </pre>
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
                    <div className="mb-1 font-semibold">
                      {result.ok ? "✓ Correct!" : "✗ Not quite:"}
                    </div>
                    {result.stdout && <pre className="whitespace-pre-wrap text-xs">{result.stdout}</pre>}
                    {result.error && <pre className="whitespace-pre-wrap text-xs">{result.error}</pre>}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <Script src="/games/php-playground/levels.js" strategy="afterInteractive" />
      <Script src="/games/php-playground/game.js" strategy="afterInteractive" />
    </div>
  );
}
