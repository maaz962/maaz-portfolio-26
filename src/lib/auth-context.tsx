"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types";

/**
 * Lightweight client-side marker used only to avoid a "logged-out flash"
 * on first render after a refresh / navigation. The authoritative source of
 * truth is ALWAYS the httpOnly session cookie, which the server validates on
 * /api/auth/me. This flag is purely a UX cache and never a security boundary.
 */
const AUTH_CACHE_KEY = "mp_auth_user_cached";

export interface AuthCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  /** The signed-in user, or null when logged out. */
  user: User | null;
  /** True only while the first session check is still resolving. */
  loading: boolean;
  /** Explicit, shared logout — the ONLY way a session is cleared. */
  logout: () => Promise<void>;
  /** Refresh from the server (re-validates the cookie). */
  refresh: () => Promise<void>;
  /** Log in with email/username + password. Throws on failure. */
  login: (credentials: AuthCredentials) => Promise<User>;
  /** Register a new account. Throws on failure. */
  register: (payload: RegisterPayload) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Prevent duplicate /me calls in StrictMode double-invoke.
  const bootedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      const next = data && data.user ? (data.user as User) : null;
      setUser(next);
      if (next) {
        try {
          window.localStorage.setItem(AUTH_CACHE_KEY, "1");
        } catch {}
      } else {
        try {
          window.localStorage.removeItem(AUTH_CACHE_KEY);
        } catch {}
      }
    } catch (e) {
      // A transient network error should NOT log a signed-in user out.
      // Keep whatever we already had; only flip out of loading on first boot.
    }
  }, []);

  // Single session check on mount. Reads the httpOnly cookie server-side via
  // /api/auth/me — the SAME source of truth for every page.
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    try {
      window.localStorage.removeItem(AUTH_CACHE_KEY);
    } catch {}
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Invalid username/email or password");
    }
    const next = data as User;
    setUser(next);
    try {
      window.localStorage.setItem(AUTH_CACHE_KEY, "1");
    } catch {}
    return next;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Registration failed");
    }
    const next = data as User;
    setUser(next);
    try {
      window.localStorage.setItem(AUTH_CACHE_KEY, "1");
    } catch {}
    return next;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, refresh, login, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
