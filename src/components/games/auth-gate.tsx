"use client";

import { motion } from "framer-motion";
import { Gamepad2, Key, ShieldCheck, Trophy, Flame, Star } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

interface AuthGateProps {
  loading?: boolean;
  onSignIn: () => void;
  onRegister: () => void;
}

export function AuthGate({ loading, onSignIn, onRegister }: AuthGateProps) {
  return (
    <div className="mx-auto my-8 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-border bg-card p-7 text-center shadow-glow"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Gamepad2 className="h-7 w-7" />
        </div>

        <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
          {loading ? "Checking your profile…" : "Sign in to play"}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          {loading
            ? "Just a second…"
            : "Create a free profile (or sign in) to save your progress, earn XP, build daily streaks and climb the leaderboard."}
        </p>

        {!loading && (
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onRegister}
              className={buttonStyles({
                size: "md",
                variant: "primary",
                className: "w-full",
              })}
            >
              <Key className="h-4 w-4" strokeWidth={1.75} />
              Create Account
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className={buttonStyles({
                size: "md",
                variant: "outline",
                className: "w-full",
              })}
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              I already have an account
            </button>
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-4 border-t border-border/50 pt-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Gamepad2 className="h-3 w-3 text-primary" />
            Save progress
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-primary" />
            Earn XP
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-primary" />
            Streaks
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-primary" />
            Leaderboard
          </span>
        </div>
      </motion.div>
    </div>
  );
}