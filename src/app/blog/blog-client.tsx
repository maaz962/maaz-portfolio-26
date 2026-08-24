"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, X, ArrowRight, BookOpen, Terminal, Heart, MessageSquare,
  Trash2, Edit2, CornerDownRight, Shield, BarChart2, LogOut, Lock,
  User as UserIcon, AlertCircle, Key, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { FadeIn } from "@/components/animations/fade-in";
import { blogCategories } from "@/data/blog";
import { cn } from "@/lib/utils";
import type { BlogPost, BlogCategory, User, Comment, BlogEngagement } from "@/types";

type ActiveFilter = "all" | BlogCategory;

interface BlogClientProps {
  initialPosts: BlogPost[];
}

export function BlogClient({ initialPosts }: BlogClientProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ name: "", username: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");

  // Drawer / Interaction States
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [engagement, setEngagement] = useState<BlogEngagement>({ likesCount: 0, commentsCount: 0, userLiked: false });
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Admin Stats State
  const [adminStats, setAdminStats] = useState<{
    totalLikes: number;
    totalComments: number;
    topLiked: { slug: string; count: number }[];
    topCommented: { slug: string; count: number }[];
  } | null>(null);
  const [showAdminStats, setShowAdminStats] = useState(false);

  // Fetch Session on Mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(console.error);
  }, []);

  // Simulate loading state on filters/search
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeFilter, searchQuery]);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        activeFilter === "all" || post.category === activeFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, activeFilter, searchQuery]);

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const url = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = authMode === "login"
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setShowAdminStats(false);
      setAdminStats(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Stats Fetching
  const toggleAdminStats = async () => {
    if (showAdminStats) {
      setShowAdminStats(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/engagement");
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
        setShowAdminStats(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Interactions Operations
  const openCommentsDrawer = async (post: BlogPost) => {
    setSelectedPost(post);
    try {
      const engRes = await fetch(`/api/blog/likes?slug=${post.slug}`);
      const engData = await engRes.json();
      setEngagement(engData);

      const commRes = await fetch(`/api/blog/comments?slug=${post.slug}`);
      const commData = await commRes.json();
      setComments(commData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      setAuthMode("login");
      setAuthError("");
      setShowAuthModal(true);
      return;
    }
    if (!selectedPost) return;

    try {
      const res = await fetch("/api/blog/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selectedPost.slug }),
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
    if (!currentUser || !selectedPost) return;

    const content = parentId ? replyText : newCommentText;
    if (content.trim() === "") return;

    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedPost.slug,
          content,
          parentId,
        }),
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
            c.id === commentId ? { ...c, isDeleted: true, content: "[Comment deleted]" } : c
          )
        );
        setEngagement((prev) => ({ ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Group comments into parent-child lists
  const commentThreads = useMemo(() => {
    const visibleIds = new Set(comments.map((c) => c.id));
    // Replies whose parent was deleted/moderated are promoted to top level
    const parents = comments.filter((c) => !c.parentId || !visibleIds.has(c.parentId));
    const childrenMap: Record<string, Comment[]> = {};
    
    comments.filter((c) => c.parentId && visibleIds.has(c.parentId)).forEach((c) => {
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
    <>
      <GlassNavbar activeSection="blog" onNavigate={() => {}} />

      <section className="relative overflow-hidden bg-noise py-16 sm:py-24">
        {/* Orbs background */}
        <div aria-hidden className="glow-orb -right-20 top-10 h-64 w-64 bg-primary/15" />
        <div aria-hidden className="glow-orb -left-20 bottom-10 h-64 w-64 bg-accent/10" />

        <Container className="relative">
          {/* Header Row with User Info */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <FadeIn>
              <SectionHeading
                eyebrow="My thoughts & engagement"
                title="Developer Blog"
                description="Deep dives into Flutter, Next.js, React, cybersecurity, and modern web architectures."
              />
            </FadeIn>

            <FadeIn delay={0.05} className="flex flex-wrap items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-3 rounded-full border border-border bg-card/65 px-4 py-1.5 dark:bg-card/40">
                  <div className="relative h-6 w-6 overflow-hidden rounded-full border border-primary/20">
                    <Image
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground/95">{currentUser.name}</span>
                  {currentUser.isAdmin && (
                    <span className="flex items-center gap-1 rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[0.6rem] font-mono font-medium text-primary">
                      <Shield className="h-2.5 w-2.5" />
                      Admin
                    </span>
                  )}
                  <div className="h-3 w-px bg-border" />
                  {currentUser.isAdmin && (
                    <button
                      onClick={toggleAdminStats}
                      title="Admin statistics"
                      className="p-1 text-muted hover:text-primary transition-colors"
                    >
                      <BarChart2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-1 text-muted hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setShowAuthModal(true);
                  }}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted hover:border-primary/45 hover:text-foreground transition-all duration-200"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  Sign In / Join
                </button>
              )}
            </FadeIn>
          </div>

          {/* Admin Stats Section */}
          <AnimatePresence>
            {showAdminStats && adminStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="space-y-1">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Total Live Likes</p>
                    <p className="font-display text-2xl font-bold text-primary">{adminStats.totalLikes}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Total Live Comments</p>
                    <p className="font-display text-2xl font-bold text-accent">{adminStats.totalComments}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Top Liked Posts</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {adminStats.topLiked.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[0.7rem] text-muted">
                          <span className="truncate max-w-[120px] font-mono">{item.slug}</span>
                          <span className="font-semibold text-primary">{item.count} likes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Top Commented Posts</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {adminStats.topCommented.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[0.7rem] text-muted">
                          <span className="truncate max-w-[120px] font-mono">{item.slug}</span>
                          <span className="font-semibold text-accent">{item.count} comments</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Category Filter Toolbar */}
          <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-8">
            <FadeIn delay={0.05} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search articles by title, keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-card/65 py-2.5 pl-11 pr-10 text-sm text-foreground transition-all duration-200 placeholder:text-muted focus:border-primary/60 focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary/60 dark:bg-card/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.08}>
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Filter blog posts by category"
              >
                <FilterTab
                  label="All"
                  active={activeFilter === "all"}
                  onClick={() => setActiveFilter("all")}
                />
                {blogCategories.map((category) => (
                  <FilterTab
                    key={category}
                    label={category}
                    active={activeFilter === category}
                    onClick={() => setActiveFilter(category)}
                  />
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Articles Grid / Layout */}
          <div className="mt-12 min-h-[400px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {Array.from({ length: 3 }).map((_, index) => (
                    <BlogCardSkeleton key={index} />
                  ))}
                </motion.div>
              ) : filteredPosts.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {filteredPosts.map((post) => (
                    <div key={post.slug} className="h-full">
                      <BlogCard
                        post={post}
                        onOpenComments={() => openCommentsDrawer(post)}
                      />
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">No articles found</h3>
                  <p className="mt-2 max-w-xs text-xs text-muted">
                    We couldn&apos;t find any posts matching &ldquo;
                    <span className="font-mono text-primary">{searchQuery || activeFilter}</span>
                    &rdquo;.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </section>

      {/* --- SIDE DETAILS DRAWER (LIKES & COMMENTS) --- */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card border-l border-border shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="truncate">
                  <h3 className="truncate font-display text-sm font-semibold text-foreground">{selectedPost.title}</h3>
                  <p className="text-[0.65rem] text-muted truncate">Discussion and Engagement statistics</p>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-full border border-border p-1.5 text-muted hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Like Button Block */}
                <div className="flex items-center justify-between rounded-xl bg-background-secondary/40 p-4 border border-border/50">
                  <div className="space-y-1">
                    <span className="text-xs text-muted">Do you like this article?</span>
                    <p className="text-xs font-semibold text-foreground/90">
                      {engagement.likesCount} {engagement.likesCount === 1 ? "developer likes" : "developers liked"} this
                    </p>
                  </div>
                  <button
                    onClick={handleToggleLike}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200",
                      engagement.userLiked
                        ? "border-red-500 bg-red-500/10 text-red-500 shadow-glow"
                        : "border-border text-muted hover:border-red-400 hover:text-red-500 hover:bg-red-500/5"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", engagement.userLiked && "fill-current")} />
                  </button>
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h4 className="font-display text-sm font-semibold text-foreground">
                      Comments ({engagement.commentsCount})
                    </h4>
                  </div>

                  {/* Add Comment Input */}
                  {currentUser ? (
                    <form onSubmit={(e) => handleAddComment(e)} className="space-y-2.5">
                      <textarea
                        rows={3}
                        placeholder="Write a comment..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/60"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={newCommentText.trim() === ""}
                          className="rounded-full bg-primary px-4 py-1.5 text-[0.7rem] font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-glow"
                        >
                          Submit Comment
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-background-secondary/20 p-4 text-center">
                      <Lock className="mx-auto h-4 w-4 text-muted/60" />
                      <p className="mt-1 text-xs text-muted">Join the developer conversation</p>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setAuthError("");
                          setShowAuthModal(true);
                        }}
                        className="mt-3 rounded-full bg-primary/10 border border-primary/20 px-4.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}

                  {/* Comments Feed List */}
                  <div className="space-y-4 mt-6">
                    {commentThreads.length > 0 ? (
                      commentThreads.map(({ parent, replies }) => (
                        <div key={parent.id} className="space-y-3.5">
                          {/* Parent Comment */}
                          <CommentBlock
                            comment={parent}
                            currentUser={currentUser}
                            onReplyClick={() => {
                              setReplyingToId(parent.id);
                              setReplyText("");
                            }}
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
                          />

                          {/* Nested Replies */}
                          {replies.map((reply) => (
                            <div key={reply.id} className="pl-6 flex gap-2">
                              <CornerDownRight className="h-4 w-4 text-muted/50 shrink-0 mt-2" />
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
                                />
                              </div>
                            </div>
                          ))}

                          {/* Inline Reply Form */}
                          {replyingToId === parent.id && currentUser && (
                            <form onSubmit={(e) => handleAddComment(e, parent.id)} className="pl-6 space-y-2 mt-1">
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
                                  className="rounded-full border border-border px-3.5 py-1 text-[0.65rem] font-semibold text-muted hover:text-foreground transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={replyText.trim() === ""}
                                  className="rounded-full bg-primary px-3.5 py-1 text-[0.65rem] font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-40 transition-all"
                                >
                                  Post Reply
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-muted py-6">No discussions yet. Be the first to comment!</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- AUTH MODAL --- */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-glow"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute right-4 top-4 text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-foreground">
                    {authMode === "login" ? "Welcome back" : "Create developer profile"}
                  </h4>
                  <p className="text-[0.65rem] text-muted">
                    {authMode === "login" ? "Enter details to write comments & like posts" : "Join the developer portfolio discussions"}
                  </p>
                </div>
              </div>

              {authError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-[0.7rem] text-red-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
                {authMode === "register" && (
                  <div>
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Full Name</label>
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
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Username</label>
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
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Email Address</label>
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
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background-secondary px-3.5 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all shadow-glow"
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
    </>
  );
}

function FilterTab({
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
        "text-mono rounded-full border px-4 py-2 text-xs transition-all duration-200 focus-visible:outline-none",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-glow"
          : "border-border bg-card text-muted hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

interface BlogCardProps {
  post: BlogPost;
  onOpenComments: () => void;
}

function BlogCard({ post, onOpenComments }: BlogCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:border-primary/35 hover:shadow-glow">
      {/* Featured Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-background-secondary">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.imageAlt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-border bg-background-secondary p-6 text-center">
            <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
            <p className="text-mono text-[0.65rem] uppercase tracking-widest text-primary">
              {post.category}
            </p>
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-mono rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-primary">
              {post.category}
            </span>
            {post.featured && (
              <span className="text-mono flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-accent">
                <Star className="h-2.5 w-2.5 fill-current" />
                Featured
              </span>
            )}
          </div>
          <span className="text-mono text-[0.65rem] text-muted flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {post.readTime}
          </span>
        </div>

        <h3 className="mt-4 text-lg text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
          {post.description}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-mono text-[0.65rem] text-foreground/80">
            By {post.author.name} {post.sourceName ? `• ${post.sourceName}` : ""}
          </span>
          <time className="text-mono text-[0.65rem] text-muted">
            {post.publishedDate}
          </time>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Link
            href={`/blog/${post.slug}`}
            className="text-mono inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/btn"
          >
            Read More
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </Link>

          {/* Engagement Button Triggers */}
          <button
            onClick={onOpenComments}
            className="flex items-center gap-1 rounded-full border border-border/50 bg-background-secondary/35 px-2.5 py-1 text-[0.65rem] text-muted hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-200"
          >
            <MessageSquare className="h-3 w-3" />
            Discussion
          </button>
        </div>
      </div>
    </article>
  );
}

// Sub-Component: Single Comment Block with inline edit support
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
    <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm space-y-2">
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
            <span className="rounded bg-primary/10 border border-primary/20 px-1 py-0.2 text-[0.55rem] font-mono font-medium text-primary">
              Author
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-mono text-[0.6rem] text-muted/65">
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
        <p className={cn("text-xs text-foreground/80 leading-relaxed font-sans", comment.isDeleted && "text-muted/60 italic font-mono")}>
          {comment.content}
        </p>
      )}

      {!comment.isDeleted && !isEditing && (
        <div className="flex items-center justify-end gap-3 pt-1 border-t border-border/20">
          {onReplyClick && (
            <button
              onClick={onReplyClick}
              className="text-mono text-[0.62rem] font-semibold text-primary/80 hover:text-primary transition-colors"
            >
              Reply
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-mono text-[0.62rem] font-semibold text-muted hover:text-foreground flex items-center gap-0.5 transition-colors"
            >
              <Edit2 className="h-2.5 w-2.5" />
              Edit
            </button>
          )}
          {(isOwner || isAdmin) && (
            <button
              onClick={onDeleteClick}
              className="text-mono text-[0.62rem] font-semibold text-red-500/80 hover:text-red-500 flex items-center gap-0.5 transition-colors"
            >
              <Trash2 className="h-2.5 w-2.5" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-pulse">
      <div className="aspect-[16/10] w-full bg-border/40" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-border/40" />
          <div className="h-3 w-12 rounded bg-border/30" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-5 w-5/6 rounded bg-border/40" />
          <div className="h-5 w-2/3 rounded bg-border/40" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3.5 w-full rounded bg-border/30" />
          <div className="h-3.5 w-full rounded bg-border/30" />
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-border/20 pt-4">
          <div className="h-3 w-16 rounded bg-border/30" />
          <div className="h-3 w-12 rounded bg-border/30" />
        </div>
        <div className="mt-5 h-4 w-20 rounded bg-border/40" />
      </div>
    </div>
  );
}
