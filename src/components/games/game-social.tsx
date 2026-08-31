"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CornerDownRight,
  Heart,
  Lock,
  MessageCircle,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { CommentBlock } from "@/components/comments/comment-block";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { BlogEngagement, Comment, User } from "@/types";

export interface GameSocialProps {
  slug: string;
  title: string;
  emoji: string;
  accentText: string;
  accentBg: string;
  currentUser: User | null;
  canInteract: boolean;
  onAuthRequired: () => void;
}

export function GameSocial({
  slug,
  title,
  emoji,
  accentText,
  accentBg,
  currentUser,
  canInteract,
  onAuthRequired,
}: GameSocialProps) {
  const [engagement, setEngagement] = useState<BlogEngagement>({
    likesCount: 0,
    commentsCount: 0,
    userLiked: false,
    recentLikers: [],
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/blog/likes?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setEngagement((prev) => ({ ...prev, ...d })))
      .catch(() => {});

    fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  const handleToggleLike = async () => {
    if (!canInteract) {
      onAuthRequired();
      return;
    }
    if (engagement.userLiked) {
      // Instant optimistic unlike (the like already stays on the server until posts settle)
      setEngagement((prev) => ({
        ...prev,
        userLiked: false,
        likesCount: Math.max(0, prev.likesCount - 1),
        recentLikers: (prev.recentLikers || []).filter(
          (l) => l.id !== currentUser?.id
        ),
      }));
    } else {
      setEngagement((prev) => ({
        ...prev,
        userLiked: true,
        likesCount: prev.likesCount + 1,
        recentLikers: currentUser
          ? [
              {
                id: currentUser.id,
                name: currentUser.name,
                username: currentUser.username,
                avatarUrl: currentUser.avatarUrl,
              },
              ...(prev.recentLikers || []).filter((l) => l.id !== currentUser.id),
            ].slice(0, 5)
          : prev.recentLikers,
      }));
    }
    try {
      const res = await fetch("/api/blog/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const data = await res.json();
        setEngagement((prev) => ({ ...prev, ...data }));
      }
    } catch {}
  };

  const handleAddComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!canInteract) return;
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
        setEngagement((prev) => ({
          ...prev,
          commentsCount: prev.commentsCount + 1,
        }));
        if (parentId) {
          setReplyText("");
          setReplyingToId(null);
        } else {
          setNewCommentText("");
        }
      }
    } catch {}
  };

  const handleEditComment = async (commentId: string) => {
    if (!canInteract) return;
    if (editText.trim() === "") return;
    try {
      const res = await fetch("/api/blog/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, content: editText }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? updated : c))
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch {}
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!canInteract) return;
    try {
      const res = await fetch(
        `/api/blog/comments?commentId=${commentId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, isDeleted: true, content: "[deleted]" }
              : c
          )
        );
        setEngagement((prev) => ({
          ...prev,
          commentsCount: Math.max(0, prev.commentsCount - 1),
        }));
      }
    } catch {}
  };

  const handleLikeComment = async (commentId: string) => {
    if (!canInteract) {
      onAuthRequired();
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
              ? {
                  ...c,
                  likesCount: data.likesCount,
                  userLiked: data.userLiked,
                }
              : c
          )
        );
      }
    } catch {}
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} — Maaz's Learn Game`,
      text: `Check out ${title}, a web dev learning game from Maaz's portfolio!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      throw new Error("share not supported");
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
        shareTimeoutRef.current = setTimeout(() => setShareCopied(false), 2000);
      } catch {}
    }
  };

  const commentThreads = useMemo(() => {
    const visibleIds = new Set(comments.map((c) => c.id));
    const parents = comments.filter(
      (c) => !c.parentId || !visibleIds.has(c.parentId)
    );
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

  const likers = engagement.recentLikers || [];

  return (
    <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Post header */}
      <div className="flex items-center gap-3 border-b border-border/50 px-5 py-3.5">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/20",
            accentBg
          )}
        >
          <span className="text-lg">{emoji}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground">
            @{title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}
          </p>
          <p className="truncate text-[0.65rem] text-muted">{title}</p>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-4 px-5 pt-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.8 }}
          onClick={handleToggleLike}
          aria-pressed={engagement.userLiked}
          aria-label="Like this game"
          className={cn(
            "flex items-center gap-1.5 text-sm font-semibold transition-colors",
            engagement.userLiked ? "text-red-500" : "text-muted hover:text-red-500"
          )}
        >
          <motion.span
            key={String(engagement.userLiked)}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="inline-flex"
          >
            <Heart
              className={cn(
                "h-6 w-6",
                engagement.userLiked && "fill-current"
              )}
            />
          </motion.span>
          <span className="text-sm tabular-nums">{engagement.likesCount}</span>
        </motion.button>

        <button
          type="button"
          aria-label="Comment on this game"
          onClick={() =>
            document
              .getElementById("game-social-comments")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-sm tabular-nums">
            {engagement.commentsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label={shareCopied ? "Link copied" : "Share this game"}
          title="Share"
          className="ml-auto flex items-center gap-1 text-muted transition-colors hover:text-primary"
        >
          {shareCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          {shareCopied && (
            <span className="text-[0.62rem] font-semibold text-green-500">
              Copied
            </span>
          )}
        </button>
      </div>

      {/* Likes strip */}
      <div className="px-5 pt-3">
        <p className="text-xs font-semibold text-foreground">
          {engagement.likesCount}{" "}
          {engagement.likesCount === 1 ? "like" : "likes"}
        </p>
        {likers.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex -space-x-2">
              {likers.slice(0, 4).map((l) => (
                <div
                  key={l.id}
                  className="h-6 w-6 overflow-hidden rounded-full border-2 border-background"
                >
                  <Avatar
                    seed={l.id || l.username}
                    name={l.name || l.username}
                    className="h-6 w-6"
                  />
                </div>
              ))}
            </div>
            <p className="truncate text-[0.65rem] text-muted">
              {likers.map((l) => `@${l.username}`).join(", ")}
              {engagement.likesCount > likers.length &&
                ` +${engagement.likesCount - likers.length} more`}
            </p>
          </div>
        )}
      </div>

      {/* Comments */}
      <div
        id="game-social-comments"
        className="mt-3 border-t border-border/50"
      >
        <div className="flex items-center gap-2 px-5 pt-4">
          <MessageCircle className="h-3.5 w-3.5 text-primary" />
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Comments ({engagement.commentsCount})
          </h3>
        </div>

        {canInteract ? (
          <form
            onSubmit={(e) => handleAddComment(e)}
            className="mt-3 flex items-start gap-3 px-5"
          >
            {currentUser && (
              <div className="mt-0.5 h-8 w-8 shrink-0">
                <Avatar
                  seed={currentUser.id || currentUser.username}
                  name={currentUser.name}
                  className="h-8 w-8"
                />
              </div>
            )}
            <div className="flex-1">
              <textarea
                rows={2}
                placeholder={`Add a comment as @${currentUser?.username || "you"}...`}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full resize-none rounded-xl border border-border bg-background-secondary px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/60"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={newCommentText.trim() === ""}
                  className="rounded-full bg-primary px-4 py-1.5 text-[0.65rem] font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
                >
                  Post
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mx-5 mt-3 rounded-xl border border-dashed border-border bg-background-secondary/20 p-4 text-center">
            <Lock className="mx-auto h-4 w-4 text-muted/60" />
            <p className="mt-1 text-[0.65rem] text-muted">
              Log in to like and comment
            </p>
            <button
              type="button"
              onClick={onAuthRequired}
              className="mt-2.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[0.65rem] font-semibold text-primary transition-all hover:bg-primary/20"
            >
              Log In / Sign Up
            </button>
          </div>
        )}

        {/* Threads */}
        <div className="mt-4 space-y-4 px-5 pb-6">
          {commentThreads.length > 0 ? (
            commentThreads.map(({ parent, replies }) => (
              <div key={parent.id} className="space-y-3">
                <CommentBlock
                  comment={parent}
                  currentUser={canInteract ? currentUser : null}
                  onReplyClick={
                    canInteract
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
                  openAuth={onAuthRequired}
                />

                {replies.map((reply) => (
                  <div key={reply.id} className="flex gap-2 pl-6">
                    <CornerDownRight className="mt-2 h-4 w-4 shrink-0 text-muted/40" />
                    <div className="flex-1">
                      <CommentBlock
                        comment={reply}
                        currentUser={canInteract ? currentUser : null}
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
                        openAuth={onAuthRequired}
                      />
                    </div>
                  </div>
                ))}

                {replyingToId === parent.id && canInteract && (
                  <form
                    onSubmit={(e) => handleAddComment(e, parent.id)}
                    className="ml-9 mt-1 space-y-2"
                  >
                    <textarea
                      rows={2}
                      placeholder={`Reply to @${parent.userName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full resize-none rounded-xl border border-border bg-background-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-primary/60 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="rounded-full border border-border px-3 py-1 text-[0.6rem] font-semibold text-muted transition-all hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={replyText.trim() === ""}
                        className="rounded-full bg-primary px-3 py-1 text-[0.6rem] font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40"
                      >
                        Reply
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))
          ) : (
            <p className="py-5 text-center text-xs text-muted">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}