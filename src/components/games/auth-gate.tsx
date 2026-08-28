"use client";

import { motion } from "framer-motion";
import { Gamepad2, Key, ShieldCheck, MessageSquare, Heart } from "lucide-react";

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

        <h2 className="mt-4 font-display text-lg font-bold text-foreground">
          {loading ? "Checking your profile…" : "Sign in to play"}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          {loading
            ? "Just a second…"
            : "Create a free profile (or sign in) to unlock every game, drop your score and join the discussion with likes and comments."}
        </p>

        {!loading && (
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onRegister}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              <Key className="h-3.5 w-3.5" />
              Create Account
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background-secondary py-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              I already have an account
            </button>
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-4 border-t border-border/50 pt-4 text-[0.65rem] text-muted">
          <span className="flex items-center gap-1">
            <Gamepad2 className="h-3 w-3 text-primary" />
            Play all games
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-primary" />
            Like
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-primary" />
            Comment
          </span>
        </div>
      </motion.div>
    </div>
  );
}