import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ExternalLink,
  FileText,
  Info,
  Layers,
  Star,
} from "lucide-react";
import { profile } from "@/data/profile";
import { Container } from "@/components/ui/container";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { FadeIn } from "@/components/animations/fade-in";
import type { BlogCategory, BlogPost } from "@/types";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/blog-service";
import { PostInteractions } from "./post-interactions";

interface BlogPostPageProps {
  params: { slug: string };
}

/** Original editorial copy describing what each category covers. Not article content. */
const CATEGORY_FOCUS: Record<BlogCategory, string> = {
  Flutter:
    "Pieces filed under Flutter concentrate on cross-platform mobile craft: widget composition, rendering pipelines, state management patterns, and performance profiling on real devices.",
  "Web Development":
    "Web Development articles track the platform itself: browser APIs, offline-first storage, accessibility, tooling, and the architecture decisions that keep frontends maintainable as they grow.",
  React:
    "React articles dig into component architecture, concurrent rendering features, compiler behavior, and data-fetching patterns that shape modern interactive interfaces.",
  "Next.js":
    "Next.js articles cover the App Router end to end: caching layers, server components, route handlers, deployment trade-offs, and scaling production workloads safely.",
  Cybersecurity:
    "Cybersecurity articles focus on practical defense: threat modeling, secure coding habits, hardening authentication flows, and guarding against common vulnerability classes like the OWASP Top 10.",
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) {
    return { title: `Article Not Found | ${profile.name}` };
  }
  return {
    title: `${post.title} | ${profile.name}`,
    description: post.description.slice(0, 158),
    openGraph: {
      title: post.title,
      description: post.description.slice(0, 158),
      type: "article",
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedBlogPosts(post.slug, post.category);

  return (
    <>
      <GlassNavbar activeSection="blog" />

      <article className="relative overflow-hidden bg-noise py-16 sm:py-24">
        {/* Orbs background */}
        <div aria-hidden className="glow-orb -right-20 top-10 h-64 w-64 bg-primary/15" />
        <div aria-hidden className="glow-orb -left-20 bottom-10 h-64 w-64 bg-accent/10" />

        <Container className="relative">
          {/* Back navigation */}
          <FadeIn>
            <Link
              href="/blog"
              className="text-mono inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to all articles
            </Link>
          </FadeIn>

          {/* Header */}
          <FadeIn delay={0.02}>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-mono rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.65rem] uppercase tracking-wide text-primary">
                {post.category}
              </span>
              {post.featured && (
                <span className="text-mono flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wide text-accent">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Featured
                </span>
              )}
              <span className="text-mono flex items-center gap-1 text-[0.65rem] text-muted">
                <BookOpen className="h-3 w-3" />
                {post.readTime}
              </span>
              <time className="text-mono flex items-center gap-1 text-[0.65rem] text-muted">
                <CalendarDays className="h-3 w-3" />
                {post.publishedDate}
              </time>
            </div>

            <h1 className="mt-5 max-w-4xl font-display text-3xl font-semibold leading-tight text-foreground md:text-5xl">
              {post.title}
            </h1>

            {/* Author + source attribution row */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-primary/20 bg-background-secondary">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-primary">
                    {post.author.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{post.author.name}</p>
                <p className="text-xs text-muted">
                  Originally published on{" "}
                  {post.sourceUrl ? (
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      {post.sourceName ?? "the original source"}
                    </a>
                  ) : (
                    <span>{post.sourceName ?? "this blog"}</span>
                  )}
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Featured image */}
          <FadeIn delay={0.05} className="mt-10">
            <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl border border-border bg-background-secondary shadow-card">
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.imageAlt ?? `${post.title} featured image`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
                  <p className="text-mono text-[0.65rem] uppercase tracking-widest text-primary">
                    {post.category}
                  </p>
                </div>
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/25 via-transparent to-transparent"
              />
            </div>
          </FadeIn>

          {/* Body + details sidebar */}
          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <FadeIn delay={0.08} className="space-y-8">
              {/* Summary */}
              <section
                aria-labelledby="overview-heading"
                className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h2
                    id="overview-heading"
                    className="font-display text-lg font-semibold text-foreground"
                  >
                    Overview
                  </h2>
                </div>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  {post.description}
                </p>
              </section>

              {/* Category focus */}
              <section
                aria-labelledby="focus-heading"
                className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <h2
                    id="focus-heading"
                    className="font-display text-lg font-semibold text-foreground"
                  >
                    Topic Focus
                  </h2>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {CATEGORY_FOCUS[post.category]}
                </p>
                <p className="text-mono mt-5 rounded-xl border border-dashed border-border bg-background-secondary/40 px-4 py-3 text-[0.68rem] leading-relaxed text-muted">
                  This reader page presents an editorial summary and discussion space only.
                  The full article body remains with its original author and publisher.
                </p>
              </section>

              {/* Attribution / original source CTA */}
              <section
                aria-labelledby="original-heading"
                className="rounded-2xl border border-primary/25 bg-primary/5 p-6 shadow-card md:p-8"
              >
                <h2
                  id="original-heading"
                  className="font-display text-lg font-semibold text-foreground"
                >
                  Read the full article
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  The complete version of this piece{" "}
                  {"— including code samples and media —"} is hosted by{" "}
                  {post.sourceName ?? "its publisher"}, where it was originally released.
                  All rights remain with the original author.
                </p>
                {post.sourceUrl && (
                  <a
                    href={post.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/cta mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 shadow-glow"
                  >
                    View original on {post.sourceName ?? "source"}
                    <ExternalLink className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                  </a>
                )}
              </section>
            </FadeIn>

            {/* Article details sidebar */}
            <FadeIn delay={0.1}>
              <aside className="lg:sticky lg:top-24">
                <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
                  <h2 className="text-mono flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-widest text-foreground">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    Article Details
                  </h2>

                  <dl className="space-y-4 text-xs">
                    <div>
                      <dt className="text-[0.62rem] uppercase tracking-wider text-muted">Title</dt>
                      <dd className="mt-1 font-medium leading-snug text-foreground">{post.title}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.62rem] uppercase tracking-wider text-muted">Category</dt>
                      <dd className="mt-1 font-medium text-foreground">{post.category}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.62rem] uppercase tracking-wider text-muted">Author</dt>
                      <dd className="mt-1 font-medium text-foreground">{post.author.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.62rem] uppercase tracking-wider text-muted">Published</dt>
                      <dd className="mt-1 font-medium text-foreground">{post.publishedDate}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.62rem] uppercase tracking-wider text-muted">Read Time</dt>
                      <dd className="mt-1 font-medium text-foreground">{post.readTime}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.62rem] uppercase tracking-wider text-muted">Source</dt>
                      <dd className="mt-1 font-medium text-foreground">
                        {post.sourceUrl ? (
                          <a
                            href={post.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                          >
                            {post.sourceName ?? "External"}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          "Original"
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </aside>
            </FadeIn>
          </div>

          {/* Likes + comments */}
          <FadeIn delay={0.05} className="mt-14">
            <PostInteractions post={post} />
          </FadeIn>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <section
              aria-labelledby="related-heading"
              className="mt-16 border-t border-border/50 pt-12"
            >
              <FadeIn>
                <p className="text-eyebrow">Keep reading</p>
                <h2
                  id="related-heading"
                  className="mt-3 font-display text-2xl font-semibold text-foreground md:text-3xl"
                >
                  Related Articles
                </h2>
              </FadeIn>

              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <RelatedCard key={related.slug} post={related} />
                ))}
              </div>
            </section>
          )}
        </Container>
      </article>
    </>
  );
}

function RelatedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:border-primary/35 hover:shadow-glow"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-background-secondary">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.imageAlt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center border border-dashed border-border bg-background-secondary p-4 text-center">
            <p className="text-mono text-[0.65rem] uppercase tracking-widest text-primary">
              {post.category}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-mono w-fit rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[0.6rem] uppercase tracking-wide text-primary">
          {post.category}
        </span>
        <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">
          {post.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
          <span className="text-mono text-[0.62rem] text-muted">
            {post.publishedDate} • {post.readTime}
          </span>
          <span className="text-mono inline-flex items-center gap-1 text-[0.65rem] font-semibold text-primary transition-colors group-hover:text-primary/80">
            Read More
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
