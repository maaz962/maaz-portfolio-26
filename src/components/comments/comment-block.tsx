"use client";

import Image from "next/image";
import { CornerDownRight, Edit2, Heart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Comment, User } from "@/types";

export interface CommentBlockProps {
  comment: Comment;
  currentUser: User | null;
  onReplyClick?: () => void;
  onDeleteClick: () => void;
  onEditSubmit: (text: string) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  editText: string;
  setEditText: (v: string) => void;
  onLikeClick?: (commentId: string) => void;
  openAuth?: () => void;
}

export function CommentBlock({
  comment,
  currentUser,
  onReplyClick,
  onDeleteClick,
  onEditSubmit,
  isEditing,
  setIsEditing,
  editText,
  setEditText,
  onLikeClick,
  openAuth,
}: CommentBlockProps) {
  const isOwner = currentUser?.id === comment.userId;
  const isAdmin = currentUser?.isAdmin || false;
  const likesCount = comment.likesCount ?? 0;
  const userLiked = comment.userLiked ?? false;

  const handleLike = () => {
    if (!currentUser) {
      openAuth?.();
      return;
    }
    onLikeClick?.(comment.id);
  };

  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-5 overflow-hidden rounded-full border border-primary/10">
            <Image
              src={comment.userAvatar}
              alt={comment.userName}
              fill
              sizes="20px"
              className="object-cover"
            />
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
          <textarea
            rows={2}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded-lg border border-border bg-background-secondary p-2 text-xs text-foreground focus:outline-none"
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-full border border-border px-3 py-0.5 text-[0.65rem] text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={() => onEditSubmit(editText)}
              disabled={editText.trim() === ""}
              className="rounded-full bg-primary px-3 py-0.5 text-[0.65rem] text-primary-foreground hover:brightness-110 disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p
          className={cn(
            "font-sans text-xs leading-relaxed text-foreground/80",
            comment.isDeleted && "font-mono italic text-muted/60"
          )}
        >
          {comment.content}
        </p>
      )}

      {!comment.isDeleted && !isEditing && (
        <div className="flex items-center justify-between gap-3 border-t border-border/20 pt-1.5">
          <button
            onClick={handleLike}
            aria-pressed={userLiked}
            className={cn(
              "text-mono flex items-center gap-1 text-[0.62rem] font-semibold transition-colors",
              userLiked ? "text-red-500" : "text-muted hover:text-red-500"
            )}
          >
            <Heart className={cn("h-3 w-3", userLiked && "fill-current")} />
            {likesCount > 0 ? likesCount : "Like"}
          </button>

          <div className="flex items-center gap-3">
            {onReplyClick && (
              <button
                onClick={onReplyClick}
                className="text-mono flex items-center gap-0.5 text-[0.62rem] font-semibold text-primary/80 transition-colors hover:text-primary"
              >
                <CornerDownRight className="h-2.5 w-2.5" />
                Reply
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-mono flex items-center gap-0.5 text-[0.62rem] font-semibold text-muted transition-colors hover:text-foreground"
              >
                <Edit2 className="h-2.5 w-2.5" />
                Edit
              </button>
            )}
            {(isOwner || isAdmin) && (
              <button
                onClick={onDeleteClick}
                className="text-mono flex items-center gap-0.5 text-[0.62rem] font-semibold text-red-500/80 transition-colors hover:text-red-500"
              >
                <Trash2 className="h-2.5 w-2.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}