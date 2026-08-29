"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Runs after a successful login/register (e.g. redirect to a pending game). */
  onAuthed?: () => void;
  /** Which tab to show when opened. Defaults to "login". */
  initialMode?: "login" | "register";
}

export function AuthModal({ open, onClose, onAuthed, initialMode = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Re-sync the active tab whenever the modal is (re)opened, so callers can
  // request "login" vs "register" up front.
  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const reset = () => {
    setError("");
    setPassword("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "register") {
        await register({ name, username, email, password });
      } else {
        await login({ emailOrUsername: username || email, password });
      }
      reset();
      onClose();
      onAuthed?.();
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-glow"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {mode === "login" ? "Welcome back" : "Create profile"}
                </h3>
                <p className="text-[0.65rem] text-muted">
                  Sign in once and stay signed in until you log out
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-[0.7rem] text-red-500">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {mode === "register" && (
                <div>
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                  {mode === "register" ? "Username" : "Username or Email"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={mode === "register" ? "jane_dev" : "jane_dev or jane@example.com"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                />
              </div>
              {mode === "register" && (
                <div>
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 shadow-glow disabled:opacity-60"
              >
                {submitting
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign In"
                    : "Register"}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-muted">
              {mode === "login" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError("");
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
  );
}
