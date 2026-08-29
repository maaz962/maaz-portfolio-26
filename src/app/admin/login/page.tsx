"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, AlertCircle, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import type { User } from "@/types";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingSession, setCheckingSession] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = searchParams.get("from") || "/admin";

  // Already signed in as an admin? Skip the form.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user: User | null }) => {
        if (data.user?.isAdmin) {
          router.replace(redirectTo);
        } else {
          setCheckingSession(false);
        }
      })
      .catch(() => setCheckingSession(false));
  }, [router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername: identifier, password }),
      });
      const user: User & { error?: string } = await res.json();

      if (!res.ok || !user.id) {
        setError(user.error || "Invalid credentials");
        return;
      }

      if (!user.isAdmin) {
        // Not an admin — drop the session so it can't be reused
        await fetch("/api/auth/logout", { method: "POST" });
        setError("This account does not have admin access.");
        return;
      }

      router.replace(redirectTo);
    } catch {
      setError("Server communication error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div aria-hidden className="glow-orb -right-20 top-10 h-64 w-64 bg-primary/15" />
      <div aria-hidden className="glow-orb -left-20 bottom-10 h-64 w-64 bg-accent/10" />

      <div className="relative w-full max-w-sm">
        <a
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </a>

        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">Admin Access</h1>
              <p className="text-xs text-muted">Restricted area — admins only</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-500">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {checkingSession ? (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking session…
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label htmlFor="identifier" className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                  Username or Email
                </label>
                <input
                  id="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin username or email"
                  className="w-full rounded-xl border border-border bg-background-secondary px-4 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                  Password
                </label>
                <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background-secondary px-4 py-2.5 pr-11 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Sign in to Dashboard
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
