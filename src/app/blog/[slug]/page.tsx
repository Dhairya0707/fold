import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  RefreshCw,
} from "lucide-react";
import { IslandNavbar } from "@/components/IslandNavbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ArticleActions } from "@/components/blog/ArticleActions";
import {
  formatBlogDate,
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";
import { SITE_CONFIG } from "@/lib/site";
import { serializeJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author.name, url: post.author.x }],
    keywords: post.tags,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      url: `/blog/${slug}`,
      siteName: SITE_CONFIG.name,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: post.author.handle,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post, 2);
  const siteUrl = SITE_CONFIG.url.replace(/\/$/, "");
  const articleUrl = `${siteUrl}/blog/${post.slug}`;

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.x,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon-512.png`,
      },
    },
    articleSection: post.category,
    keywords: post.tags.join(", "),
    wordCount: post.wordCount,
    image: `${articleUrl}/opengraph-image`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Field Notes",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(blogPostingJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />

      <a className="skip-link" href="#article-content">
        Skip to article
      </a>

      <div className="studio-grain" aria-hidden="true" />
      <div className="studio-spotlight" aria-hidden="true" />

      <IslandNavbar />

      <main id="article-content" className="relative z-[2] pb-20 pt-8 sm:pt-12">
        <div className="shell">
          <div className="mx-auto max-w-[1080px]">
            {/* Top Navigation & Breadcrumb */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-[9px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink)] shadow-[var(--shadow-bezel)] transition-all duration-150 hover:border-[var(--border-strong)] hover:text-[var(--accent)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>All field notes</span>
              </Link>

              <nav
                aria-label="Breadcrumb"
                className="hidden items-center gap-2 font-mono text-[11px] text-[var(--muted)] sm:flex"
              >
                <Link href="/" className="hover:text-[var(--ink)]">
                  Home
                </Link>
                <span aria-hidden="true">/</span>
                <Link href="/blog" className="hover:text-[var(--ink)]">
                  Blog
                </Link>
                <span aria-hidden="true">/</span>
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="text-[var(--accent)] hover:underline"
                >
                  {post.category}
                </Link>
              </nav>
            </div>

            {/* Article Header */}
            <header className="mb-10 max-w-[780px]">
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="rounded-[6px] border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--accent-on-muted,var(--accent))] transition-opacity hover:opacity-85"
                >
                  {post.category}
                </Link>

                <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface-card)] px-2.5 py-1 font-mono text-[11px] tabular-nums text-[var(--muted)]">
                  <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>{post.readingTimeText}</span>
                </span>

                <time
                  dateTime={post.publishedAt}
                  className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-[var(--muted)]"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Published {formatBlogDate(post.publishedAt, "long")}</span>
                </time>

                {post.updatedAt && (
                  <time
                    dateTime={post.updatedAt}
                    className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink-secondary)]"
                  >
                    <RefreshCw className="h-3 w-3 text-[var(--accent)]" />
                    <span>Updated {formatBlogDate(post.updatedAt)}</span>
                  </time>
                )}
              </div>

              <h1 className="text-[clamp(2rem,4.4vw,3.05rem)] font-bold leading-[1.12] tracking-[-0.03em] text-[var(--ink)] [text-wrap:balance]">
                {post.title}
              </h1>

              <p className="mt-4 text-[16.5px] sm:text-[17.5px] leading-[1.68] text-[var(--muted)]">
                {post.description}
              </p>

              {/* Inline Author Header Row */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
                <div className="flex items-center gap-3">
                  {post.author.avatar && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full border border-[var(--border-strong)] object-cover shadow-[var(--shadow-card)]"
                    />
                  )}
                  <div>
                    <div className="text-[13.5px] font-semibold text-[var(--ink)]">
                      {post.author.name}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11.5px] text-[var(--muted)]">
                      <a
                        href={post.author.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] hover:underline"
                      >
                        {post.author.handle}
                      </a>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{post.wordCount.toLocaleString()} words</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Mobile Collapsible Table of Contents */}
            <div className="lg:hidden">
              <TableOfContents headings={post.headings} variant="inline" />
            </div>

            {/* Two-Column Reading Canvas + Sticky TOC Sidebar */}
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_270px] xl:gap-12">
              {/* Primary Prose Column */}
              <div className="min-w-0">
                <article className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-chassis)]">
                  <div className="relative overflow-hidden rounded-[19px] border border-[var(--border)] bg-[var(--double-frame-inner)] px-5 py-7 sm:px-9 sm:py-10">
                    <div className="specular-line" aria-hidden="true" />
                    <MarkdownRenderer content={post.content} />
                  </div>
                </article>

                {/* Article Tags */}
                {post.tags.length > 0 && (
                  <div className="mt-7 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
                      Tagged:
                    </span>
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="rounded-[7px] border border-[var(--border)] bg-[var(--surface-card)] px-2.5 py-1 font-mono text-[11.5px] text-[var(--muted)] shadow-[var(--shadow-card)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Share & Copy Link Actions */}
                <ArticleActions title={post.title} slug={post.slug} />

                {/* Author Card */}
                <section
                  aria-label="About the author"
                  className="my-10 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)]"
                >
                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-[15px] border border-[var(--border)] bg-[var(--double-frame-inner)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="specular-line" aria-hidden="true" />

                    <div className="flex items-start gap-4">
                      {post.author.avatar && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          width={52}
                          height={52}
                          className="h-13 w-13 shrink-0 rounded-full border border-[var(--border-strong)] object-cover shadow-[var(--shadow-bezel)]"
                        />
                      )}
                      <div>
                        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.09em] text-[var(--accent)]">
                          Written by
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                          <h2 className="text-[1.15rem] font-bold text-[var(--ink)] [text-wrap:balance]">
                            {post.author.name}
                          </h2>
                          <a
                            href={post.author.x}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[12px] text-[var(--muted)] hover:text-[var(--accent)]"
                          >
                            {post.author.handle}
                          </a>
                        </div>
                        <p className="mt-1.5 max-w-[52ch] text-[13.5px] leading-[1.6] text-[var(--muted)]">
                          Creator of Fold. Designing quiet, local-first software
                          instruments with mathematical framing, zero telemetry,
                          and durable on-device storage.
                        </p>
                      </div>
                    </div>

                    <a
                      href={post.author.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-[9px] border border-[var(--border)] bg-[var(--surface-card)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--ink)] shadow-[var(--shadow-bezel)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--accent)] sm:self-center"
                    >
                      <span>Follow on X</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </section>
              </div>

              {/* Desktop Sticky TOC & Quiet Workspace Promo */}
              <div className="hidden space-y-5 lg:sticky lg:top-24 lg:block">
                <TableOfContents headings={post.headings} variant="sidebar" />

                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)]">
                  <div className="relative overflow-hidden rounded-[13px] border border-[var(--border)] bg-[var(--double-frame-inner)] p-4">
                    <div className="specular-line" aria-hidden="true" />
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.09em] text-[var(--accent)]">
                      Experience Fold
                    </div>
                    <h3 className="mt-1.5 text-[1.05rem] font-bold leading-[1.28] text-[var(--ink)] [text-wrap:balance]">
                      Notes without the noise.
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[var(--muted)]">
                      Try the local-first IndexedDB workspace right in this
                      browser. No sign-up required.
                    </p>
                    <Link
                      href="/app"
                      className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-[9px] bg-[var(--ink)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--bg-canvas)] shadow-[var(--shadow-bezel)] transition-opacity hover:opacity-90"
                    >
                      <span>Open workspace</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <section
                aria-labelledby="related-heading"
                className="mt-14 border-t border-[var(--border)] pt-10"
              >
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.09em] text-[var(--accent)]">
                      Continue reading
                    </div>
                    <h2
                      id="related-heading"
                      className="mt-1 text-[1.6rem] font-bold tracking-[-0.02em] text-[var(--ink)] [text-wrap:balance]"
                    >
                      More from Field Notes
                    </h2>
                  </div>

                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    <span>View archive</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {relatedPosts.map((related) => (
                    <article
                      key={related.slug}
                      className="group relative flex flex-col rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card-hover)] focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--bg-canvas)]"
                    >
                      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[15px] border border-[var(--border)] bg-[var(--double-frame-inner)] p-5 sm:p-6">
                        <div className="specular-line" aria-hidden="true" />

                        <div>
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded-[6px] border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[var(--accent-on-muted,var(--accent))]">
                              {related.category}
                            </span>
                            <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-[var(--muted)]">
                              <span>{related.readingTimeText}</span>
                              <span aria-hidden="true">·</span>
                              <time dateTime={related.publishedAt}>
                                {formatBlogDate(related.publishedAt)}
                              </time>
                            </div>
                          </div>

                          <h3 className="text-[1.25rem] font-bold leading-[1.26] tracking-[-0.02em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)] [text-wrap:balance]">
                            <Link
                              href={`/blog/${related.slug}`}
                              className="after:absolute after:inset-0 focus-visible:outline-none"
                            >
                              {related.title}
                            </Link>
                          </h3>

                          <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--muted)]">
                            {related.description}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-3.5 text-[12.5px] font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                          <span>Read essay</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
