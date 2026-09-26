import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GameMeta } from "@/data/games";

// Brand logos dropped on the game cards' mascot corner (see /public/icon).
export const GAME_LOGO_SRC: Record<string, string> = {
  "html-hero": "/icon/html3.png",
  "flexbox-zoo": "/icon/css%202.png",
  "grid-garden": "/icon/css%202.png",
  "animation-arena": "/icon/css%202.png",
  "js-detective": "/icon/js3.png",
  "php-playground": "/icon/php.png",
  "query-quest": "/icon/mysql.png",
};

/**
 * Zero-network mini "screenshot" of each game, rendered as pure CSS/JSX so
 * cards show the game in action without a single image request (lighter than
 * any GIF/video). Coming-soon games just show their mascot over the gradient.
 *
 * Shared by the /games hub cards and the homepage "Learn Web Dev by Playing"
 * teaser grid so both show the identical thumbnail, just at different sizes.
 */
interface GamePreviewProps {
  game: GameMeta;
  /** Classes for the dark "editor" panel. Overrides the card-sized default. */
  showcaseClassName?: string;
  /** Classes for the tech-logo badge in the bottom-right corner. */
  badgeClassName?: string;
}

const DEFAULT_SHOWCASE =
  "relative mx-3 mt-4 h-32 overflow-hidden rounded-xl border border-white/15 bg-black/80 p-3 shadow-xl";
const DEFAULT_BADGE =
  "absolute bottom-2.5 right-2.5 flex h-12 items-center justify-center text-5xl opacity-80 transition-transform duration-300 group-hover:scale-110";

export function GamePreview({
  game,
  showcaseClassName,
  badgeClassName,
}: GamePreviewProps) {
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

  const logoSrc = GAME_LOGO_SRC[game.slug];

  return (
    <div className="relative h-full w-full">
      <div className={cn(DEFAULT_SHOWCASE, showcaseClassName)}>
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
              <span className="flex h-9 flex-1 items-center justify-center rounded-lg bg-red-400/25 text-2xl leading-none">
                🦁
              </span>
              <span className="flex h-9 flex-1 items-center justify-center rounded-lg bg-sky-400/25 text-2xl leading-none">
                🐰
              </span>
              <span className="flex h-9 flex-1 items-center justify-center rounded-lg bg-yellow-400/25 text-2xl leading-none">
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
              <div className="flex items-center justify-center rounded-md border border-emerald-400/50 bg-emerald-500/30 text-xl leading-none">
                🌱
              </div>
              <div className="rounded-md bg-emerald-200/10" />
              <div className="rounded-md bg-emerald-200/10" />
              <div className="flex items-center justify-center rounded-md bg-emerald-500/20 text-sm leading-none">
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
              <span className="rob-preview-still text-5xl leading-none drop-shadow-[0_6px_10px_rgba(167,139,250,0.35)]">
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
        <span
          aria-hidden="true"
          className={cn(DEFAULT_BADGE, badgeClassName)}
        >
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt=""
              width={48}
              height={48}
              className="h-full w-auto object-contain"
            />
          ) : (
            game.animal
          )}
        </span>
      </div>
    </div>
  );
}
