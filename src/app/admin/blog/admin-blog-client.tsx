"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Shield, Newspaper, MessageSquare, Heart, Star, EyeOff, Eye, RefreshCw,
  LogOut, ExternalLink, Trash2, CornerDownRight, Send, Loader2,
  BarChart3, Rss, Search, X,
} from "lucide-react";
import { blogCategories } from "@/data/blog";
import { cn } from "@/lib/utils";
import type {
  AdminBlogPost, BlogSettings, BlogCategory, Comment,
} from "@/types";

interface AdminBlogClientProps {
  adminName: string;
  initialPosts: AdminBlogPost[];
  initialSettings: BlogSettings;
  initialComments: Comment[];
}

type Tab = "posts" | "comments";
type PostFilter = "all" | "hidden" | BlogCategory;

export function AdminBlogClient({
  adminName,
  initialPosts,
  initialSettings,
  initialComments,
}: AdminBlogClientProps) {
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<AdminBlogPost[]>(initialPosts);
  const [settings, setSettings] = useState<BlogSettings>(initialSettings);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [postFilter, setPostFilter] = useState<PostFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Reply state
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const postTitleBySlug = useMemo(() => {
    const map: Record<string, string> = {};
    posts.forEach((p) => {
      map[p.slug] = p.title;
    });
    return map;
  }, [posts]);

  const totals = useMemo(() => {
    return {
      posts: posts.length,
      likes: posts.reduce((sum, p) => sum + p.likesCount, 0),
      comments: comments.filter((c) => !c.isDeleted).length,
      activeSources: blogCategories.filter((c) => !settings.disabledSources.includes(c)).length,
    };
  }, [posts, comments, settings.disabledSources]);

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesFilter =
        postFilter === "all"
          ? true
          : postFilter === "hidden"
            ? p.hidden
            : p.category === postFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [posts, postFilter, searchQuery]);

  /** Comments grouped into threads per post slug. */
  const commentGroups = useMemo(() => {
    const visibleIds = new Set(comments.map((c) => c.id));
    const parentsById = comments.filter((c) => !c.parentId || !visibleIds.has(c.parentId));
    const childrenMap: Record<string, Comment[]> = {};

    comments
      .filter((c) => c.parentId && visibleIds.has(c.parentId))
      .forEach((c) => {
        const pid = c.parentId!;
        if (!childrenMap[pid]) childrenMap[pid] = [];
        childrenMap[pid].push(c);
      });

    interface Thread {
      parent: Comment;
      replies: Comment[];
    }
    interface Group {
      slug: string;
      title: string;
      totalComments: number;
      threads: Thread[];
    }

    const groupsBySlug: Record<string, Group> = {};
    parentsById.forEach((parent) => {
      const group: Group = groupsBySlug[parent.blogSlug] ?? {
        slug: parent.blogSlug,
        title: postTitleBySlug[parent.blogSlug] || parent.blogSlug,
        totalComments: comments.filter((c) => c.blogSlug === parent.blogSlug).length,
        threads: [],
      };
      group.threads.push({
        parent,
        replies: childrenMap[parent.id] || [],
      });
      groupsBySlug[parent.blogSlug] = group;
    });

    return Object.values(groupsBySlug).sort((a, b) => b.totalComments - a.totalComments);
  }, [comments, postTitleBySlug]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const [blogRes, commentsRes] = await Promise.all([
        fetch("/api/admin/blog"),
        fetch("/api/admin/comments"),
      ]);
      if (!blogRes.ok || !commentsRes.ok) {
        setError("Access denied — please sign in again.");
        return;
      }
      const blogData = await blogRes.json();
      const commentsData = await commentsRes.json();
      setPosts(blogData.posts);
      setSettings(blogData.settings);
      setComments(commentsData);
    } catch {
      setError("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Blog Admin | Dashboard";
  }, []);

  /** Shared action runner for post/source toggles. The API returns fresh posts+settings. */
  const runAction = async (key: string, body: Record<string, unknown>) => {
    setBusyKey(key);
    setError("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Action failed");
        return;
      }
      const data = await res.json();
      setPosts(data.posts);
      setSettings(data.settings);
    } catch {
      setError("Network error");
    } finally {
      setBusyKey(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch {
      setError("Logout failed");
    }
  };

  const handleReplySubmit = async (parent: Comment) => {
    const content = replyText.trim();
    if (content === "" || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: parent.blogSlug, content, parentId: parent.id }),
      });
      if (res.ok) {
        const newComment: Comment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setReplyToId(null);
        setReplyText("");
        setPosts((prev) =>
          prev.map((p) =>
            p.slug === parent.blogSlug && p.hidden ? p : { ...p, commentsCount: p.commentsCount + 1 }
          )
        );
      } else {
        setError("Failed to post reply");
      }
    } catch {
      setError("Network error");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setBusyKey(`comment-${commentId}`);
    setError("");
    try {
      const res = await fetch(`/api/admin/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId && !c.isDeleted
              ? { ...c, isDeleted: true, content: "[Comment deleted by moderator]" }
              : c
          )
        );
      } else {
        setError("Failed to delete comment");
      }
    } catch {
      setError("Network error");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">Blog Admin Dashboard</h1>
              <p className="text-xs text-muted">Signed in as {adminName} · manage imports, sources &amp; moderation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              View Site
            </a>
            <a
              href="/admin"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </a>
            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              title="Log out"
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-medium text-red-500/80 transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-500">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Newspaper} label="Imported Posts" value={totals.posts} sub={`${settings.hiddenSlugs.length} hidden`} />
          <StatCard icon={Heart} label="Total Likes" value={totals.likes} />
          <StatCard icon={MessageSquare} label="Live Comments" value={totals.comments} sub={`${comments.length - totals.comments} moderated`} />
          <StatCard icon={Rss} label="Active Sources" value={`${totals.activeSources}/${blogCategories.length}`} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/50 pb-px">
          <TabButton active={tab === "posts"} onClick={() => setTab("posts")} count={posts.length}>
            <Newspaper className="h-3.5 w-3.5" /> Posts
          </TabButton>
          <TabButton active={tab === "comments"} onClick={() => setTab("comments")} count={comments.length}>
            <MessageSquare className="h-3.5 w-3.5" /> Comments
          </TabButton>
        </div>

        {tab === "posts" ? (
          <>
            {/* Sources */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-1 text-sm font-semibold text-foreground">Import Sources</h3>
              <p className="mb-4 text-xs text-muted">
                Disabled sources stop importing new articles and hide their posts from the public blog.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {blogCategories.map((category) => {
                  const enabled = !settings.disabledSources.includes(category);
                  const key = `source-${category}`;
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-background-secondary/40 px-4 py-2.5"
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground">{category}</p>
                        <p className="text-[0.65rem] text-muted">{sourceCounts[category] || 0} imported posts</p>
                      </div>
                      <ToggleSwitch
                        on={enabled}
                        busy={busyKey === key}
                        onChange={() =>
                          runAction(key, { action: "toggle-source", category, enabled: !enabled })
                        }
                        label={`Toggle ${category} source`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search imported posts…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-card/65 py-2 pl-10 pr-9 text-xs text-foreground transition-all placeholder:text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter posts">
                <FilterChip label="All" active={postFilter === "all"} onClick={() => setPostFilter("all")} />
                <FilterChip label="Hidden" active={postFilter === "hidden"} onClick={() => setPostFilter("hidden")} />
                {blogCategories.map((category) => (
                  <FilterChip
                    key={category}
                    label={category}
                    active={postFilter === category}
                    onClick={() => setPostFilter(category)}
                  />
                ))}
              </div>
            </div>

            {/* Post rows */}
            <div className="space-y-2">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const featureKey = `feature-${post.slug}`;
                  const hideKey = `hide-${post.slug}`;
                  return (
                    <div
                      key={post.slug}
                      className={cn(
                        "group flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-card transition-all sm:flex-row sm:items-center sm:gap-4",
                        post.hidden ? "border-dashed border-border opacity-70" : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-primary">
                            {post.category}
                          </span>
                          {post.featured && (
                            <span className="flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[0.6rem] font-semibold text-accent">
                              <Star className="h-2.5 w-2.5 fill-current" /> Featured
                            </span>
                          )}
                          {post.hidden && (
                            <span className="flex items-center gap-1 rounded-full border border-border bg-background-secondary px-2 py-0.5 text-[0.6rem] font-semibold text-muted">
                              <EyeOff className="h-2.5 w-2.5" /> Hidden
                            </span>
                          )}
                          {settings.disabledSources.includes(post.category) && (
                            <span className="rounded-full border border-border bg-background-secondary px-2 py-0.5 text-[0.6rem] font-mono text-muted">
                              source off
                            </span>
                          )}
                        </div>
                        <h4 className="truncate font-display text-sm font-semibold text-foreground">
                          {post.sourceUrl ? (
                            <a href={post.sourceUrl} target="_blank" rel="noreferrer noopener" className="hover:text-primary transition-colors">
                              {post.title}
                            </a>
                          ) : (
                            post.title
                          )}
                        </h4>
                        <p className="truncate font-mono text-[0.65rem] text-muted">
                          {post.author.name} · {post.publishedDate} · {post.readTime}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="flex items-center gap-1.5 text-xs text-muted" title="Likes">
                          <Heart className="h-3.5 w-3.5 text-red-400" />
                          <span className="font-mono">{post.likesCount}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted" title="Comments">
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          <span className="font-mono">{post.commentsCount}</span>
                        </span>

                        <div className="flex items-center gap-1.5 border-l border-border/50 pl-3">
                          <IconButton
                            title={post.featured ? "Unfeature post" : "Feature post"}
                            onClick={() => runAction(featureKey, { action: "toggle-featured", slug: post.slug })}
                            busy={busyKey === featureKey}
                            className={post.featured ? "text-accent" : "text-muted hover:text-accent"}
                          >
                            <Star className={cn("h-4 w-4", post.featured && "fill-current")} />
                          </IconButton>
                          <IconButton
                            title={post.hidden ? "Unhide post" : "Hide post from public blog"}
                            onClick={() => runAction(hideKey, { action: "toggle-hidden", slug: post.slug, hidden: !post.hidden })}
                            busy={busyKey === hideKey}
                            className={post.hidden ? "text-foreground" : "text-muted hover:text-foreground"}
                          >
                            {post.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </IconButton>
                          {post.sourceUrl && (
                            <a
                              href={post.sourceUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              title="Open original article"
                              className="rounded-lg p-2 text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                  <Newspaper className="mx-auto h-7 w-7 text-muted/40" />
                  <p className="mt-3 text-sm text-muted">No posts match this filter.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ---------- COMMENTS TAB ---------- */
          <div className="space-y-4">
            {commentGroups.length > 0 ? (
              commentGroups.map((group) => (
                <div key={group.slug} className="space-y-2.5">
                  <div className="flex items-center gap-2 pt-2">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <h3 className="font-display text-sm font-semibold text-foreground">{group.title}</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold text-primary">
                      {group.totalComments} {group.totalComments === 1 ? "comment" : "comments"}
                    </span>
                  </div>

                  {group.threads.map(({ parent, replies }) => (
                    <div key={parent.id} className="space-y-2">
                      <AdminCommentRow
                        comment={parent}
                        busy={busyKey === `comment-${parent.id}`}
                        onReplyClick={() => {
                          setReplyToId(replyToId === parent.id ? null : parent.id);
                          setReplyText("");
                        }}
                        onDelete={() => handleDeleteComment(parent.id)}
                      />

                      {replies.map((reply) => (
                        <div key={reply.id} className="pl-6 flex gap-2">
                          <CornerDownRight className="mt-3 h-3.5 w-3.5 shrink-0 text-muted/50" />
                          <div className="min-w-0 flex-1">
                            <AdminCommentRow
                              comment={reply}
                              busy={busyKey === `comment-${reply.id}`}
                              onDelete={() => handleDeleteComment(reply.id)}
                              replyingToThis={replyToId === reply.id}
                              onCancelReply={() => setReplyToId(null)}
                              replyText={replyText}
                              setReplyText={setReplyText}
                              onReplySubmit={() => handleReplySubmit(reply)}
                              sendingReply={sendingReply}
                            />
                          </div>
                        </div>
                      ))}

                      {/* Inline reply form for the parent */}
                      {replyToId === parent.id && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleReplySubmit(parent);
                          }}
                          className="ml-6 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3"
                        >
                          <textarea
                            autoFocus
                            rows={2}
                            placeholder={`Reply to ${parent.userName}…`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/60"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyToId(null)}
                              className="rounded-full border border-border px-3.5 py-1 text-[0.65rem] font-semibold text-muted hover:text-foreground transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={replyText.trim() === "" || sendingReply}
                              className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-[0.65rem] font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
                            >
                              {sendingReply ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                              Post Reply
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <MessageSquare className="mx-auto h-7 w-7 text-muted/40" />
                <p className="mt-3 text-sm text-muted">No comments have been posted yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">{label}</span>
      </div>
      <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-[0.6rem] text-muted/70">{sub}</p>}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted hover:text-foreground"
      )}
    >
      {children}
      {typeof count === "number" && (
        <span className={cn(
          "rounded-full px-1.5 py-0.5 text-[0.6rem] font-mono",
          active ? "bg-primary/10 text-primary" : "bg-background-secondary text-muted"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "font-mono rounded-full border px-3.5 py-1.5 text-xs transition-all duration-200 focus-visible:outline-none",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-glow"
          : "border-border bg-card text-muted hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function ToggleSwitch({
  on,
  onChange,
  busy,
  label,
}: {
  on: boolean;
  onChange: () => void;
  busy?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={busy}
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border transition-all duration-200 disabled:opacity-60",
        on ? "border-primary bg-primary/80" : "border-border bg-background-secondary"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-all duration-200",
          on ? "left-[1.15rem]" : "left-0.5 bg-muted"
        )}
      />
    </button>
  );
}

function IconButton({
  title,
  onClick,
  busy,
  className,
  children,
}: {
  title: string;
  onClick: () => void;
  busy?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={busy}
      onClick={onClick}
      className={cn(
        "rounded-lg p-2 transition-colors disabled:opacity-50",
        className
      )}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

/** A single comment row inside the moderation tab. */
function AdminCommentRow({
  comment,
  busy,
  onReplyClick,
  onDelete,
  replyingToThis,
  onCancelReply,
  replyText,
  setReplyText,
  onReplySubmit,
  sendingReply,
}: {
  comment: Comment;
  busy: boolean;
  onReplyClick?: () => void;
  onDelete: () => void;
  replyingToThis?: boolean;
  onCancelReply?: () => void;
  replyText?: string;
  setReplyText?: (v: string) => void;
  onReplySubmit?: () => void;
  sendingReply?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 shadow-sm",
        comment.isDeleted ? "border-border/50 bg-card/50" : "border-border/60 bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-primary/10">
            <Image
              src={comment.userAvatar}
              alt={comment.userName}
              fill
              sizes="24px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[0.68rem] font-bold text-foreground/90">{comment.userName}</span>
              {comment.isDeleted && (
                <span className="rounded border border-red-500/20 bg-red-500/10 px-1 py-0.5 text-[0.55rem] font-mono font-medium text-red-500">
                  moderated
                </span>
              )}
            </div>
            <span className="block font-mono text-[0.6rem] text-muted/65">
              {new Date(comment.createdAt).toLocaleString()}
              {comment.parentId ? " · reply" : ""}
            </span>
          </div>
        </div>

        {!comment.isDeleted && (
          <div className="flex shrink-0 items-center gap-1">
            {onReplyClick && (
              <button
                onClick={onReplyClick}
                className={cn(
                  "font-mono rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold transition-colors",
                  replyingToThis
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-primary/80 hover:border-primary/40 hover:text-primary"
                )}
              >
                Reply
              </button>
            )}
            <button
              onClick={onDelete}
              disabled={busy}
              title="Moderate: delete comment"
              className="flex items-center gap-1 rounded-full border border-red-500/20 px-2.5 py-1 text-[0.62rem] font-semibold text-red-500/80 transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Trash2 className="h-2.5 w-2.5" />}
              Delete
            </button>
          </div>
        )}
      </div>

      <p
        className={cn(
          "mt-2 break-words font-sans text-xs leading-relaxed",
          comment.isDeleted ? "font-mono italic text-muted/60" : "text-foreground/80"
        )}
      >
        {comment.content}
      </p>

      {/* Compact inline reply form for nested replies */}
      {replyingToThis && setReplyText && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onReplySubmit?.();
          }}
          className="mt-2.5 space-y-1.5"
        >
          <textarea
            rows={2}
            placeholder={`Reply to ${comment.userName}…`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-primary/60 focus:outline-none"
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={onCancelReply}
              className="rounded-full border border-border px-3 py-0.5 text-[0.65rem] text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={(replyText ?? "").trim() === "" || sendingReply}
              className="rounded-full bg-primary px-3 py-0.5 text-[0.65rem] font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
