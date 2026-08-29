"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CornerDownRight,
  Gamepad2,
  Heart,
  Lock,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentBlock } from "@/components/comments/comment-block";
import type { BlogEngagement, Comment, User } from "@/types";

export interface GameDiscussionProps {
  game: {
    slug: string;
    title: string;
    animal: string;
    accentColor: string;
  };
  currentUser: User | null;
  onAuthRequired: () => void;
  onEngagementChange?: (slug: string, engagement: BlogEngagement) => void;
}

export function GameDiscussionPanel({
  game,
  currentUser,
  onAuthRequired,
  onEngagementChange,
}: GameDiscussionProps) {
  const slug = game.slug;

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
    fetch(`/api/blog/likes?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then(setEngagement)
      .catch(() => {});

    fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [slug]);

  const notify = (next: BlogEngagement) => {
    setEngagement(next);
    onEngagementChange?.(slug, next);
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      onAuthRequired();
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
        notify(data);
      }
    } catch {}
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) {
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
              ? { ...c, likesCount: data.likesCount, userLiked: data.userLiked }
              : c
          )
        );
      }
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
        body: JSON.stringify({ slug, content, parentId }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        if (parentId) {
          setReplyText("");
          setReplyingToId(null);
        } else {
          setNewCommentText("");
        }
        notify({ ...engagement, commentsCount: engagement.commentsCount + 1 });
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
      const res = await fetch(`/api/blog/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, isDeleted: true, content: "[deleted]" }
              : c
          )
        );
        notify({ ...engagement, commentsCount: Math.max(0, engagement.commentsCount - 1) });
      }
    } catch {}
  };

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
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3 border-b border-border/50 pb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10", game.accentColor)}>
          <span className="text-xl">{game.animal}</span>
        </div>
        <div className="min-w-0">
          <h2 className="font-display truncate text-base font-bold text-foreground">
            {game.title} Discussion
          </h2>
          <p className="text-xs text-muted">Like, comment & help the community</p>
        </div>
        <Gamepad2 className="ml-auto hidden h-4 w-4 text-muted sm:block" />
      </div>

      {/* Like block */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Enjoyed this game?
          </h3>
          <p className="text-xs text-muted">
            {engagement.likesCount}{" "}
            {engagement.likesCount === 1 ? "person likes" : "people liked"} {game.title}
          </p>
          {(engagement.recentLikers?.length ?? 0) > 0 && (
            <p className="pt-1 text-[0.65rem] text-muted">
              Liked by{" "}
              <span className="font-semibold text-foreground">
                {(engagement.recentLikers || [])
                  .map((l) => `@${l.username}`)
                  .join(", ")}
              </span>
              {engagement.likesCount > (engagement.recentLikers?.length ?? 0) &&
                ` +${engagement.likesCount - (engagement.recentLikers?.length ?? 0)} more`}
            </p>
          )}
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

      {/* Comment input */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">
            Comments ({engagement.commentsCount})
          </h3>
        </div>

        {currentUser ? (
          <form onSubmit={(e) => handleAddComment(e)} className="mt-4 space-y-2.5">
            <textarea
              rows={3}
              placeholder={`Share your thoughts about ${game.title}...`}
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
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-background-secondary/20 p-5 text-center">
            <Lock className="mx-auto h-4 w-4 text-muted/60" />
            <p className="mt-1 text-xs text-muted">Sign in to like and comment on games</p>
            <button
              type="button"
              onClick={onAuthRequired}
              className="mt-3 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* Comment threads */}
        <div className="mt-6 space-y-3.5">
          {commentThreads.length > 0 ? (
            commentThreads.map(({ parent, replies }) => (
              <div key={parent.id} className="space-y-3">
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
                  openAuth={onAuthRequired}
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
                        openAuth={onAuthRequired}
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
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}