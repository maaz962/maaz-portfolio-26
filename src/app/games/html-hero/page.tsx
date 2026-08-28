"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Lock,
  Key,
  AlertCircle,
  CornerDownRight,
  X,
  Gamepad2,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  Play,
  Check,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { CommentBlock } from "@/components/comments/comment-block";
import { AuthGate } from "@/components/games/auth-gate";
import { cn } from "@/lib/utils";
import type { BlogEngagement, Comment, User } from "@/types";
import "./game.css";

const GAME_SLUG = "html-hero";
const TOTAL_LEVELS = 16;

export default function HtmlHeroPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [engagement, setEngagement] = useState<BlogEngagement>({
    likesCount: 0,
    commentsCount: 0,
    userLiked: false,
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setCurrentUser(d.user);
        } else {
          setAuthMode("register");
          setAuthError("");
          setShowAuthModal(true);
        }
      })
      .catch(() => { setShowAuthModal(true); })
      .finally(() => setAuthLoading(false));
    fetch(`/api/blog/likes?slug=${GAME_SLUG}`)
      .then((r) => r.json())
      .then(setEngagement)
      .catch(() => {});
    fetch(`/api/blog/comments?slug=${GAME_SLUG}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const tryInit = () => {
      if (typeof window !== "undefined" && (window as any).__initHtmlHero) {
        (window as any).__initHtmlHero();
      } else {
        setTimeout(tryInit, 100);
      }
    };
    const timer = setTimeout(tryInit, 200);
    return () => clearTimeout(timer);
  }, [currentUser]);

  const openAuthModal = () => {
    setAuthMode("login");
    setAuthError("");
    setShowAuthModal(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const url = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      authMode === "login"
        ? { emailOrUsername: authForm.username || authForm.email, password: authForm.password }
        : authForm;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || "Auth failed"); return; }
      setCurrentUser(data);
      setShowAuthModal(false);
      setAuthForm({ name: "", username: "", email: "", password: "" });
    } catch { setAuthError("Server error"); }
  };

  const handleToggleLike = async () => {
    if (!currentUser) { openAuthModal(); return; }
    try {
      const res = await fetch("/api/blog/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: GAME_SLUG }),
      });
      if (res.ok) { const data = await res.json(); setEngagement(data); }
    } catch {}
  };

  const handleAddComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!currentUser) return;
    const content = parentId ? replyText : newCommentText;
    if (content.trim() === "") return;
    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: GAME_SLUG, content, parentId }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setEngagement((prev) => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
        if (parentId) { setReplyText(""); setReplyingToId(null); }
        else { setNewCommentText(""); }
      }
    } catch {}
  };

  const handleEditComment = async (commentId: string) => {
    if (editText.trim() === "") return;
    try {
      const res = await fetch("/api/blog/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, content: editText }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
        setEditingCommentId(null);
        setEditText("");
      }
    } catch {}
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/blog/comments?commentId=${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, isDeleted: true, content: "[deleted]" } : c)));
        setEngagement((prev) => ({ ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) }));
      }
    } catch {}
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    try {
      const res = await fetch("/api/blog/comments/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likesCount: data.likesCount, userLiked: data.userLiked } : c))
        );
      }
    } catch {}
  };

  const commentThreads = useMemo(() => {
    const visibleIds = new Set(comments.map((c) => c.id));
    const parents = comments.filter((c) => !c.parentId || !visibleIds.has(c.parentId));
    const childrenMap: Record<string, Comment[]> = {};
    comments.filter((c) => c.parentId && visibleIds.has(c.parentId)).forEach((c) => {
      const pid = c.parentId!;
      if (!childrenMap[pid]) childrenMap[pid] = [];
      childrenMap[pid].push(c);
    });
    return parents.map((parent) => ({ parent, replies: childrenMap[parent.id] || [] }));
  }, [comments]);

  return (
    <div className="relative min-h-screen bg-background">
      <GlassNavbar activeSection="games" />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28">
        <Link
          href="/games"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          All Games
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <span className="text-xl">🦸</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              HTML Hero
            </h1>
            <p className="text-xs text-muted">
              Write real HTML tags, level by level, and become an HTML Master
            </p>
          </div>
        </div>

        {/* GAME SECTION */}
        {!authLoading && !currentUser ? (
          <AuthGate
            loading={authLoading}
            onSignIn={() => {
              setAuthMode("login");
              setAuthError("");
              setShowAuthModal(true);
            }}
            onRegister={() => {
              setAuthMode("register");
              setAuthError("");
              setShowAuthModal(true);
            }}
          />
        ) : (
        <>
        <div className="hh-game">
          {/* LEFT COLUMN */}
          <div className="hh-sidebar">
            <div className="hh-level-info">
              <div className="hh-level-header">
                <span className="hh-level-badge">
                  <Gamepad2 className="h-3 w-3 icon" />
                  Level <span id="level-number">1</span>
                  <span className="text-muted">/</span>
                  <span>{TOTAL_LEVELS}</span>
                </span>
                <span id="level-difficulty" className="hh-difficulty easy">
                  Easy
                </span>
              </div>
              <h2 id="level-title" className="hh-level-title">
                Hello, World!
              </h2>
              <p id="level-instruction" className="hh-instruction mt-1">
                Task: write an h1 tag.
              </p>
              <div id="level-hint" className="hh-hint">
                <Sparkles className="icon h-3 w-3" />
                <span>Hint: your hint appears here.</span>
              </div>
            </div>

            <div className="hh-editor">
              <div className="hh-editor-header">
                <div className="hh-editor-dots">
                  <span className="hh-editor-dot red" />
                  <span className="hh-editor-dot yellow" />
                  <span className="hh-editor-dot green" />
                </div>
                <span className="hh-editor-title">index.html</span>
              </div>
              <div className="hh-editor-body">
                <textarea
                  id="html-editor"
                  className="hh-editor-textarea"
                  placeholder='<h1>Hello World</h1>'
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <div id="toast" className="hh-status-toast" />
              <div className="hh-editor-actions">
                <button id="reset-btn" type="button" className="hh-btn hh-reset-btn">
                  <RefreshCw className="h-3 w-3" />
                  Reset
                </button>
                <div className="hh-nav-buttons">
                  <button id="check-btn" type="button" className="hh-btn hh-check-btn">
                    <Play className="h-3 w-3" />
                    Check
                  </button>
                  <button id="prev-btn" type="button" className="hh-btn hh-nav-btn prev" disabled>
                    ← Prev
                  </button>
                  <button id="next-btn" type="button" className="hh-btn hh-nav-btn next">
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="hh-panel">
            <div className="hh-preview-panel" style={{ position: "relative" }}>
              <div className="hh-preview-header">
                <div className="hh-preview-tabs">
                  <button type="button" className="hh-preview-tab active">
                    <Check className="h-3 w-3" />
                    Preview
                  </button>
                </div>
                <div className="hh-score">
                  <span id="score-display">Score: 0</span>
                </div>
              </div>

              <div className="hh-preview-frame-wrap">
                <iframe
                  id="html-preview"
                  className="hh-preview-frame"
                  title="HTML Hero live preview"
                  sandbox="allow-popups"
                />
              </div>

              <div className="hh-preview-note">
                <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                <span>
                  Your page renders here as you type. Press “Check” to see if you nailed the task.
                </span>
              </div>

              <div id="progress-dots" className="hh-progress" />

              <div id="overlay" className="hh-complete-overlay" style={{ display: "none" }}>
                <div className="hh-stars">
                  <span className="hh-star">⭐</span>
                  <span className="hh-star">⭐</span>
                  <span className="hh-star">⭐</span>
                </div>
                <div className="hh-complete-text">Level Complete!</div>
                <div className="hh-complete-sub">Great job, code wrangler!</div>
                <div className="hh-complete-msg"></div>
                <button type="button" className="hh-complete-btn overlay-btn">
                  Next Level →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LIKE + COMMENTS */}
        <div className="mx-auto mt-12 max-w-3xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="space-y-1">
              <h2 className="font-display text-base font-semibold text-foreground">
                Enjoyed this game?
              </h2>
              <p className="text-xs text-muted">
                {engagement.likesCount}{" "}
                {engagement.likesCount === 1 ? "person likes" : "people liked"}{" "}
                HTML Hero
              </p>
            </div>
            <button
              onClick={handleToggleLike}
              aria-pressed={engagement.userLiked}
              className={cn(
                "flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all duration-200",
                engagement.userLiked
                  ? "border-red-500 bg-red-500/10 text-red-500"
                  : "border-border bg-card text-muted hover:border-red-400 hover:text-red-500 hover:bg-red-500/5"
              )}
            >
              <Heart className={cn("h-4 w-4", engagement.userLiked && "fill-current")} />
              {engagement.userLiked ? "Liked" : "Like"}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-semibold text-foreground">
                Comments ({engagement.commentsCount})
              </h2>
            </div>

            {currentUser ? (
              <form onSubmit={(e) => handleAddComment(e)} className="mt-5 space-y-2.5">
                <textarea
                  rows={3}
                  placeholder="Share your thoughts about this game..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/60"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={newCommentText.trim() === ""}
                    className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
                  >
                    Submit Comment
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-background-secondary/20 p-5 text-center">
                <Lock className="mx-auto h-4 w-4 text-muted/60" />
                <p className="mt-1 text-xs text-muted">Join the conversation</p>
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="mt-3 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
                >
                  Sign In / Register
                </button>
              </div>
            )}

            <div className="mt-7 space-y-4">
              {commentThreads.length > 0 ? (
                commentThreads.map(({ parent, replies }) => (
                  <div key={parent.id} className="space-y-3.5">
                    <CommentBlock
                      comment={parent}
                      currentUser={currentUser}
                      onReplyClick={
                        currentUser
                          ? () => { setReplyingToId(parent.id); setReplyText(""); }
                          : undefined
                      }
                      onDeleteClick={() => handleDeleteComment(parent.id)}
                      onEditSubmit={(text) => { setEditText(text); handleEditComment(parent.id); }}
                      isEditing={editingCommentId === parent.id}
                      setIsEditing={(v) => { setEditingCommentId(v ? parent.id : null); setEditText(parent.content); }}
                      editText={editText}
                      setEditText={setEditText}
                      onLikeClick={handleLikeComment}
                      openAuth={openAuthModal}
                    />
                    {replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2 pl-6">
                        <CornerDownRight className="mt-2 h-4 w-4 shrink-0 text-muted/50" />
                        <div className="flex-1">
                          <CommentBlock
                            comment={reply}
                            currentUser={currentUser}
                            onDeleteClick={() => handleDeleteComment(reply.id)}
                            onEditSubmit={(text) => { setEditText(text); handleEditComment(reply.id); }}
                            isEditing={editingCommentId === reply.id}
                            setIsEditing={(v) => { setEditingCommentId(v ? reply.id : null); setEditText(reply.content); }}
                            editText={editText}
                            setEditText={setEditText}
                            onLikeClick={handleLikeComment}
                            openAuth={openAuthModal}
                          />
                        </div>
                      </div>
                    ))}
                    {replyingToId === parent.id && currentUser && (
                      <form onSubmit={(e) => handleAddComment(e, parent.id)} className="mt-1 space-y-2 pl-6">
                        <textarea
                          rows={2}
                          placeholder={`Replying to ${parent.userName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-primary/60 focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setReplyingToId(null)} className="rounded-full border border-border px-3.5 py-1 text-[0.65rem] font-semibold text-muted transition-all hover:text-foreground">
                            Cancel
                          </button>
                          <button type="submit" disabled={replyText.trim() === ""} className="rounded-full bg-primary px-3.5 py-1 text-[0.65rem] font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40">
                            Post Reply
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-muted">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </div>
        </>
        )}
      </main>

      <Script src="/games/html-hero/game.js" strategy="afterInteractive" />

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (currentUser) setShowAuthModal(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-glow"
            >
              <button onClick={() => { if (currentUser) setShowAuthModal(false); }} className="absolute right-4 top-4 text-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    {authMode === "login" ? "Welcome back" : "Create profile"}
                  </h3>
                  <p className="text-[0.65rem] text-muted">Sign in to like and comment</p>
                </div>
              </div>
              {authError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-[0.7rem] text-red-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
                {authMode === "register" && (
                  <div>
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Full Name</label>
                    <input type="text" required placeholder="Jane Doe" value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none" />
                  </div>
                )}
                <div>
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Username</label>
                  <input type="text" required placeholder="jane_dev" value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none" />
                </div>
                {authMode === "register" && (
                  <div>
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Email</label>
                    <input type="email" required placeholder="jane@example.com" value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none" />
                  </div>
                )}
                <div>
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Password</label>
                  <div className="relative mt-1">
                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 pr-10 text-xs text-foreground focus:border-primary/60 focus:outline-none" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground">
                      {showPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                    </button>
                  </div>
                </div>
                <button type="submit" className="mt-2 w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 shadow-glow">
                  {authMode === "login" ? "Sign In" : "Register"}
                </button>
              </form>
              <div className="mt-4 text-center text-xs text-muted">
                {authMode === "login" ? (
                  <p>
                    Don&apos;t have an account?{" "}
                    <button onClick={() => { setAuthMode("register"); setAuthError(""); }} className="font-semibold text-primary hover:underline">
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already registered?{" "}
                    <button onClick={() => { setAuthMode("login"); setAuthError(""); }} className="font-semibold text-primary hover:underline">
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}