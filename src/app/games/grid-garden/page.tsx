"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Lock,
  Key,
  AlertCircle,
  CornerDownRight,
  Edit2,
  Trash2,
  X,
  Gamepad2,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { cn } from "@/lib/utils";
import type { BlogEngagement, Comment, User } from "@/types";
import "./game.css";

const GAME_SLUG = "grid-garden";

export default function GridGardenPage() {
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
      .then((d) => { if (d.user) setCurrentUser(d.user); })
      .catch(() => {});
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
    const tryInit = () => {
      if (typeof window !== "undefined" && (window as any).__initGridGarden) {
        (window as any).__initGridGarden();
      } else {
        setTimeout(tryInit, 100);
      }
    };
    const timer = setTimeout(tryInit, 200);
    return () => clearTimeout(timer);
  }, []);

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <span className="text-xl">🌱</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Grid Garden
            </h1>
            <p className="text-xs text-muted">
              Build layouts and master CSS Grid by arranging garden plots
            </p>
          </div>
        </div>

        {/* GAME SECTION */}
        <div className="grid-game-wrapper">
          {/* LEFT SIDEBAR */}
          <div className="grid-sidebar">
            {/* Level Info */}
            <div className="grid-level-info">
              <div className="grid-level-header">
                <span className="grid-level-badge">
                  <Gamepad2 className="h-3 w-3" />
                  Level <span id="level-number">1</span>
                  <span className="text-muted">/</span>
                  <span>15</span>
                </span>
                <span id="level-difficulty" className="grid-level-difficulty beginner">
                  Beginner
                </span>
              </div>
              <h2
                id="level-title"
                className="font-display text-sm font-bold text-foreground"
              >
                Turn On Grid!
              </h2>
              <p id="level-instruction" className="grid-instruction mt-1">
                The blocks are stacked vertically. Activate CSS Grid to arrange them!
              </p>
              <div id="level-hint" className="grid-hint">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <span>
                  The magic property is <code>display: grid</code> — add it to the container.
                </span>
              </div>
            </div>

            {/* Code Editor */}
            <div className="grid-editor">
              <div className="grid-editor-header">
                <div className="grid-editor-dots">
                  <span className="grid-editor-dot red" />
                  <span className="grid-editor-dot yellow" />
                  <span className="grid-editor-dot green" />
                </div>
                <span className="grid-editor-title">style.css</span>
              </div>
              <div className="grid-editor-body">
                <div className="grid-line-numbers">
                  1<br />2<br />3<br />4<br />5<br />6
                </div>
                <div className="grid-code-area">
                  <div className="grid-code-prefix">
                    <span className="grid-css-selector">#container</span>{" "}
                    <span className="grid-css-brace">{"{"}</span>
                  </div>
                  <textarea
                    id="css-editor"
                    className="grid-editor-textarea"
                    placeholder="display: grid"
                    autoFocus
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                  <div id="grid-editor-hint" className="grid-editor-hint">
                    Type the CSS property here...
                  </div>
                </div>
              </div>
              <div id="toast" className="grid-status-toast" />
              <div className="grid-editor-actions">
                <button id="reset-btn" type="button" className="grid-reset-btn">
                  ↺ Reset
                </button>
                <div className="grid-nav-buttons">
                  <button id="prev-btn" type="button" className="grid-nav-btn prev" disabled>
                    ← Prev
                  </button>
                  <button id="next-btn" type="button" className="grid-nav-btn next" disabled>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT GAME AREA */}
          <div className="grid-game-area">
            {/* Preview Panel for Level 15 */}
            <div id="grid-preview" className="grid-preview-panel" style={{ display: "none" }}>
              <div className="grid-preview-header">
                <span>Target Layout — Recreate This!</span>
              </div>
              <div className="grid-preview-board">
                <div className="grid-preview-item" style={{ gridArea: "header", background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>Header</div>
                <div className="grid-preview-item" style={{ gridArea: "sidebar", background: "linear-gradient(135deg, #f97316, #ea580c)" }}>Sidebar</div>
                <div className="grid-preview-item" style={{ gridArea: "main", background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>Main</div>
                <div className="grid-preview-item" style={{ gridArea: "footer", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>Footer</div>
              </div>
            </div>

            <div className="grid-board-container">
              <div className="grid-board-header">
                <div className="grid-board-tabs">
                  <button className="grid-board-tab active">Board</button>
                </div>
                <div className="grid-score">
                  <span id="score-display" className="grid-score-value">
                    Score: 0
                  </span>
                </div>
              </div>
              <div id="grid-board" className="grid-board" />
              <div id="overlay" className="grid-complete-overlay" style={{ display: "none" }}>
                <div className="grid-stars">
                  <span className="grid-star earned">⭐</span>
                  <span className="grid-star earned">⭐</span>
                  <span className="grid-star earned">⭐</span>
                </div>
                <div className="grid-complete-text">Level Complete!</div>
                <div className="grid-complete-sub">Great job! You solved it!</div>
                <div className="grid-complete-msg"></div>
                <button type="button" className="grid-complete-btn overlay-btn">
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
                Grid Garden
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
      </main>

      <Script src="/games/grid-garden/game.js" strategy="afterInteractive" />

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-glow"
            >
              <button onClick={() => setShowAuthModal(false)} className="absolute right-4 top-4 text-muted hover:text-foreground">
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
                  <input type="password" required placeholder="••••••••" value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none" />
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

function CommentBlock({
  comment,
  currentUser,
  onReplyClick,
  onDeleteClick,
  onEditSubmit,
  isEditing,
  setIsEditing,
  editText,
  setEditText,
}: {
  comment: Comment;
  currentUser: User | null;
  onReplyClick?: () => void;
  onDeleteClick: () => void;
  onEditSubmit: (text: string) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  editText: string;
  setEditText: (v: string) => void;
}) {
  const isOwner = currentUser?.id === comment.userId;
  const isAdmin = currentUser?.isAdmin || false;

  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-5 overflow-hidden rounded-full border border-primary/10">
            <Image src={comment.userAvatar} alt={comment.userName} fill sizes="20px" className="object-cover" />
          </div>
          <span className="text-[0.68rem] font-bold text-foreground/90">{comment.userName}</span>
          {comment.userId === "admin-user-id" && (
            <span className="rounded border border-primary/20 bg-primary/10 px-1 py-0.2 text-[0.55rem] font-mono font-medium text-primary">
              Author
            </span>
          )}
        </div>
        <div className="text-mono flex items-center gap-1.5 text-[0.6rem] text-muted/65">
          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          {comment.updatedAt && <span className="italic">(edited)</span>}
        </div>
      </div>
      {isEditing ? (
        <div className="space-y-1.5">
          <textarea rows={2} value={editText} onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded-lg border border-border bg-background-secondary p-2 text-xs text-foreground focus:outline-none" />
          <div className="flex justify-end gap-1.5">
            <button onClick={() => setIsEditing(false)} className="rounded-full border border-border px-3 py-0.5 text-[0.65rem] text-muted hover:text-foreground">Cancel</button>
            <button onClick={() => onEditSubmit(editText)} disabled={editText.trim() === ""} className="rounded-full bg-primary px-3 py-0.5 text-[0.65rem] text-primary-foreground hover:brightness-110 disabled:opacity-40">Save</button>
          </div>
        </div>
      ) : (
        <p className={cn("font-sans text-xs leading-relaxed text-foreground/80", comment.isDeleted && "font-mono italic text-muted/60")}>
          {comment.content}
        </p>
      )}
      {!comment.isDeleted && !isEditing && (
        <div className="flex items-center justify-end gap-3 border-t border-border/20 pt-1">
          {onReplyClick && (
            <button onClick={onReplyClick} className="text-mono text-[0.62rem] font-semibold text-primary/80 transition-colors hover:text-primary">Reply</button>
          )}
          {isOwner && (
            <button onClick={() => setIsEditing(true)} className="text-mono flex items-center gap-0.5 text-[0.62rem] font-semibold text-muted transition-colors hover:text-foreground">
              <Edit2 className="h-2.5 w-2.5" /> Edit
            </button>
          )}
          {(isOwner || isAdmin) && (
            <button onClick={onDeleteClick} className="text-mono flex items-center gap-0.5 text-[0.62rem] font-semibold text-red-500/80 transition-colors hover:text-red-500">
              <Trash2 className="h-2.5 w-2.5" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
