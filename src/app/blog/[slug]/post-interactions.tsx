"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CornerDownRight,
  Heart,
  Key,
  Lock,
  MessageSquare,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CommentBlock } from "@/components/comments/comment-block";
import type { BlogEngagement, BlogPost, Comment, User } from "@/types";

/**
 * Likes + comments for the /blog/[slug] reader page.
 * Reuses the same session cookie auth and /api/blog/* endpoints as the
 * listing page discussion drawer — no backend changes required.
 */
export function PostInteractions({ post }: { post: BlogPost }) {
  const slug = post.slug;

  // Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ name: "", username: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Engagement states
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

  // Load session + engagement for this slug
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    fetch(`/api/blog/likes?slug=${slug}`)
      .then((res) => res.json())
      .then(setEngagement)
      .catch(console.error);

    fetch(`/api/blog/comments?slug=${slug}`)
      .then((res) => res.json())
      .then(setComments)
      .catch(console.error);
  }, [slug]);

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

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        return;
      }

      setCurrentUser(data);
      setShowAuthModal(false);
      setAuthForm({ name: "", username: "", email: "", password: "" });
    } catch {
      setAuthError("Server communication error");
    }
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      openAuthModal();
      return;
    }

    try {
      const res = await fetch("/api/blog/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const data = await res.json();
        setEngagement(data);
      }
    } catch (err) {
      console.error(err);
    }
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
        body: JSON.stringify({ slug, content, parentId }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setEngagement((prev) => ({ ...prev, commentsCount: prev.commentsCount + 1 }));

        if (parentId) {
          setReplyText("");
          setReplyingToId(null);
        } else {
          setNewCommentText("");
        }
      }
    } catch (err) {
      console.error(err);
    }
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/blog/comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, isDeleted: true, content: "[Comment deleted]" }
              : c
          )
        );
        setEngagement((prev) => ({
          ...prev,
          commentsCount: Math.max(0, prev.commentsCount - 1),
        }));
      }
    } catch (err) {
      console.error(err);
    }
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
          prev.map((c) =>
            c.id === commentId
              ? { ...c, likesCount: data.likesCount, userLiked: data.userLiked }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Group comments into parent-child threads (same logic as the listing drawer)
  const commentThreads = useMemo(() => {
    const visibleIds = new Set(comments.map((c) => c.id));
    const parents = comments.filter((c) => !c.parentId || !visibleIds.has(c.parentId));
    const childrenMap: Record<string, Comment[]> = {};

    comments
      .filter((c) => c.parentId && visibleIds.has(c.parentId))
      .forEach((c) => {
        const pid = c.parentId!;
        if (!childrenMap[pid]) childrenMap[pid] = [];
        childrenMap[pid].push(c);
      });

    return parents.map((parent) => ({
      parent,
      replies: childrenMap[parent.id] || [],
    }));
  }, [comments]);

  return (
    <section aria-label="Likes and comments">
      {/* Like block */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="space-y-1">
          <h2 className="font-display text-base font-semibold text-foreground">
            Enjoyed this article?
          </h2>
          <p className="text-xs text-muted">
            {engagement.likesCount}{" "}
            {engagement.likesCount === 1 ? "developer likes" : "developers liked"} this summary
          </p>
        </div>
        <button
          onClick={handleToggleLike}
          aria-pressed={engagement.userLiked}
          className={cn(
            "flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all duration-200",
            engagement.userLiked
              ? "border-red-500 bg-red-500/10 text-red-500 shadow-glow"
              : "border-border bg-card text-muted hover:border-red-400 hover:text-red-500 hover:bg-red-500/5"
          )}
        >
          <Heart className={cn("h-4 w-4", engagement.userLiked && "fill-current")} />
          {engagement.userLiked ? "Liked" : "Like"}
        </button>
      </div>

      {/* Comments */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
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
              placeholder="Share your thoughts about this article..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={newCommentText.trim() === ""}
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-40 shadow-glow"
              >
                Submit Comment
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-border bg-background-secondary/20 p-5 text-center">
            <Lock className="mx-auto h-4 w-4 text-muted/60" />
            <p className="mt-1 text-xs text-muted">Join the developer conversation</p>
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
                      ? () => {
                          setReplyingToId(parent.id);
                          setReplyText("");
                        }
                      : undefined
                  }
                  onDeleteClick={() => handleDeleteComment(parent.id)}
                  onEditSubmit={(text) => {
                    setEditText(text);
                    handleEditComment(parent.id);
                  }}
                  isEditing={editingCommentId === parent.id}
                  setIsEditing={(v) => {
                    setEditingCommentId(v ? parent.id : null);
                    setEditText(parent.content);
                  }}
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
                        onEditSubmit={(text) => {
                          setEditText(text);
                          handleEditComment(reply.id);
                        }}
                        isEditing={editingCommentId === reply.id}
                        setIsEditing={(v) => {
                          setEditingCommentId(v ? reply.id : null);
                          setEditText(reply.content);
                        }}
                        editText={editText}
                        setEditText={setEditText}
                        onLikeClick={handleLikeComment}
                        openAuth={openAuthModal}
                      />
                    </div>
                  </div>
                ))}

                {replyingToId === parent.id && currentUser && (
                  <form
                    onSubmit={(e) => handleAddComment(e, parent.id)}
                    className="mt-1 space-y-2 pl-6"
                  >
                    <textarea
                      rows={2}
                      placeholder={`Replying to ${parent.userName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-primary/60 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="rounded-full border border-border px-3.5 py-1 text-[0.65rem] font-semibold text-muted transition-all hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={replyText.trim() === ""}
                        className="rounded-full bg-primary px-3.5 py-1 text-[0.65rem] font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40"
                      >
                        Post Reply
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-muted">
              No discussions yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>

      {/* Auth modal */}
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
              <button
                onClick={() => setShowAuthModal(false)}
                aria-label="Close sign in dialog"
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
                    {authMode === "login" ? "Welcome back" : "Create developer profile"}
                  </h3>
                  <p className="text-[0.65rem] text-muted">
                    {authMode === "login"
                      ? "Enter details to write comments & like posts"
                      : "Join the developer portfolio discussions"}
                  </p>
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
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="jane_dev"
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                  />
                </div>

                {authMode === "register" && (
                  <div>
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
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
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
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
                  className="mt-2 w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 shadow-glow"
                >
                  {authMode === "login" ? "Sign In" : "Register Profile"}
                </button>
              </form>

              <div className="mt-4 text-center text-xs text-muted">
                {authMode === "login" ? (
                  <p>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthMode("register");
                        setAuthError("");
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
                        setAuthMode("login");
                        setAuthError("");
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
    </section>
  );
}
