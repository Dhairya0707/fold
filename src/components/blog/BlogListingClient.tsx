"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Hash,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { BlogPostSummary, formatBlogDate } from "@/lib/blog-shared";
import { audioHaptics } from "@/lib/audio-haptics";

interface BlogListingClientProps {
  posts: BlogPostSummary[];
  categories: string[];
  tags: string[];
}

function subscribeUrlSearch(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getUrlSearchSnapshot(): string {
  return typeof window !== "undefined" ? window.location.search : "";
}

function getServerUrlSearchSnapshot(): string {
  return "";
}

export function BlogListingClient({
  posts,
  categories,
  tags,
}: BlogListingClientProps) {
  const urlSearch = useSyncExternalStore(
    subscribeUrlSearch,
    getUrlSearchSnapshot,
    getServerUrlSearchSnapshot
  );

  const urlDefaults = useMemo(() => {
    if (!urlSearch) {
      return { category: "All", tag: null as string | null, q: "" };
    }
    try {
      const params = new URLSearchParams(urlSearch);
      const catParam = params.get("category");
      const tagParam = params.get("tag");
      const qParam = params.get("q");
      return {
        category: catParam && categories.includes(catParam) ? catParam : "All",
        tag: tagParam && tags.includes(tagParam) ? tagParam : null,
        q: qParam ?? "",
      };
    } catch {
      return { category: "All", tag: null as string | null, q: "" };
    }
  }, [urlSearch, categories, tags]);

  const [categoryOverride, setCategoryOverride] = useState<string | undefined>(
    undefined
  );
  const [tagOverride, setTagOverride] = useState<string | null | undefined>(
    undefined
  );
  const [searchOverride, setSearchOverride] = useState<string | undefined>(
    undefined
  );

  const selectedCategory =
    categoryOverride !== undefined ? categoryOverride : urlDefaults.category;
  const selectedTag =
    tagOverride !== undefined ? tagOverride : urlDefaults.tag;
  const searchQuery =
    searchOverride !== undefined ? searchOverride : urlDefaults.q;

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    }
    return counts;
  }, [posts]);

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedTag !== null ||
    searchQuery.trim().length > 0;

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      if (selectedCategory !== "All" && post.category !== selectedCategory) {
        return false;
      }
      if (
        selectedTag !== null &&
        !post.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      ) {
        return false;
      }
      if (q) {
        const haystack = [
          post.title,
          post.description,
          post.category,
          ...post.tags,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [posts, selectedCategory, selectedTag, searchQuery]);

  const featuredPost = useMemo(() => {
    if (hasActiveFilters) return null;
    return posts.find((p) => p.featured) ?? posts[0] ?? null;
  }, [posts, hasActiveFilters]);

  const gridPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter((p) => p.slug !== featuredPost.slug);
  }, [filteredPosts, featuredPost]);

  const handleCategorySelect = (category: string) => {
    audioHaptics.trigger("tap");
    setCategoryOverride(category);
  };

  const handleTagToggle = (tag: string) => {
    audioHaptics.trigger("tap");
    setTagOverride(selectedTag === tag ? null : tag);
  };

  const handleResetFilters = () => {
    audioHaptics.trigger("toggle");
    setCategoryOverride("All");
    setTagOverride(null);
    setSearchOverride("");
  };

  return (
    <div className="space-y-10">
      {/* Interactive Filter & Search Toolbar */}
      <section
        aria-label="Filter articles"
        className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)]"
      >
        <div className="relative overflow-hidden rounded-[15px] border border-[var(--border)] bg-[var(--double-frame-inner)] p-4 sm:p-5">
          <div className="specular-line" aria-hidden="true" />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Category Filter Pills */}
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter by category"
            >
              <button
                type="button"
                onClick={() => handleCategorySelect("All")}
                aria-pressed={selectedCategory === "All"}
                className={`inline-flex items-center gap-1.5 rounded-[9px] border px-3 py-1.5 text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.97] ${
                  selectedCategory === "All"
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]"
                }`}
              >
                <span>All notes</span>
                <span className="font-mono text-[10.5px] opacity-75">
                  {posts.length}
                </span>
              </button>

              {categories.map((category) => {
                const isActive = selectedCategory === category;
                const count = categoryCounts.get(category) ?? 0;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-1.5 rounded-[9px] border px-3 py-1.5 text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.97] ${
                      isActive
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <span>{category}</span>
                    <span className="font-mono text-[10.5px] opacity-75">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instant Search Field */}
            <div className="relative w-full lg:w-[280px]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchOverride(e.target.value)}
                placeholder="Search essays or topics…"
                aria-label="Search blog articles"
                className="w-full rounded-[9px] border border-[var(--border)] bg-[var(--surface-muted)]/75 py-1.5 pl-9 pr-8 text-base sm:text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)]/80 transition-colors focus:border-[var(--accent)] focus:bg-[var(--surface-card)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    audioHaptics.trigger("tap");
                    setSearchOverride("");
                  }}
                  aria-label="Clear search query"
                  className="hit-target absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Tag Filter Strip */}
          {tags.length > 0 && (
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3.5">
              <div
                className="flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label="Filter by tag"
              >
                <span className="mr-1 inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
                  <Hash className="h-3 w-3 text-[var(--accent)]" />
                  <span>Topics</span>
                </span>
                {tags.map((tag) => {
                  const active = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      aria-pressed={active}
                      className={`hit-target rounded-[6px] border px-2 py-1.5 sm:py-0.5 font-mono text-[11px] transition-all duration-150 ${
                        active
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--accent-on-muted,var(--accent))]"
                          : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--accent)] transition-opacity hover:opacity-80"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="mx-auto max-w-[540px] py-6">
          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)]">
            <div className="relative overflow-hidden rounded-[17px] border border-[var(--border)] bg-[var(--double-frame-inner)] px-6 py-10 text-center">
              <div className="specular-line" aria-hidden="true" />
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-[11px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-[1.4rem] font-bold tracking-[-0.02em] text-[var(--ink)] [text-wrap:balance]">
                No field notes match those filters
              </h2>
              <p className="mx-auto mt-2 max-w-[380px] text-[14px] leading-[1.6] text-[var(--muted)]">
                Try clearing the active category, topic tag, or search query to
                browse the full local-first engineering journal.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[var(--ink)] px-4 py-2.5 text-[13px] font-semibold text-[var(--bg-canvas)] shadow-[var(--shadow-bezel)] transition-transform duration-150 hover:opacity-90 active:scale-[0.97]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Show all {posts.length} articles</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Featured Article Hero Card */}
      {featuredPost && (
        <article
          aria-label={`Featured article: ${featuredPost.title}`}
          className="group relative rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-chassis)] transition-all duration-200 hover:border-[var(--border-strong)]"
        >
          <div className="relative overflow-hidden rounded-[19px] border border-[var(--border)] bg-[var(--double-frame-inner)] p-6 sm:p-8 lg:p-9">
            <div className="specular-line" aria-hidden="true" />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.9fr)] lg:items-center">
              {/* Main Essay Column */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                    <Sparkles className="h-3 w-3" />
                    <span>Featured Essay</span>
                  </span>
                  <span className="rounded-[6px] border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[var(--ink)]">
                    {featuredPost.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-[var(--muted)]">
                    <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span>{featuredPost.readingTimeText}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-[var(--border-strong)]"
                  >
                    ·
                  </span>
                  <time
                    dateTime={featuredPost.publishedAt}
                    className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-[var(--muted)]"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatBlogDate(featuredPost.publishedAt)}</span>
                  </time>
                </div>

                <h2 className="text-[1.7rem] sm:text-[2.15rem] font-bold tracking-[-0.025em] leading-[1.15] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)] [text-wrap:balance]">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    onClick={() => audioHaptics.trigger("tap")}
                    className="after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {featuredPost.title}
                  </Link>
                </h2>

                <p className="max-w-[60ch] text-[15px] leading-[1.7] text-[var(--muted)]">
                  {featuredPost.description}
                </p>

                <div className="relative z-10 flex flex-wrap items-center gap-1.5 pt-1">
                  {featuredPost.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className="hit-target rounded-[6px] border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1.5 sm:py-0.5 font-mono text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
                  <div className="flex items-center gap-2.5">
                    {featuredPost.author.avatar && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        width={30}
                        height={30}
                        className="h-7.5 w-7.5 rounded-full border border-[var(--border-strong)] object-cover"
                      />
                    )}
                    <div className="text-[12.5px] leading-tight">
                      <span className="font-semibold text-[var(--ink)]">
                        {featuredPost.author.name}
                      </span>
                      <span className="ml-1.5 font-mono text-[11px] text-[var(--muted)]">
                        {featuredPost.author.handle}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                    <span>Read essay</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>

              {/* Architectural Outline Specimen Card */}
              <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)]/75 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.09em] text-[var(--accent)]">
                    Essay Outline
                  </span>
                  <span className="font-mono text-[10.5px] text-[var(--faint)]">
                    {featuredPost.wordCount.toLocaleString()} words ·{" "}
                    {featuredPost.format.toUpperCase()}
                  </span>
                </div>

                <ol className="space-y-2">
                  {featuredPost.headings
                    .filter((h) => h.level === 2)
                    .slice(0, 5)
                    .map((heading, idx) => (
                      <li
                        key={heading.id}
                        className="flex items-start gap-2.5 text-[12.5px] leading-[1.45] text-[var(--ink-secondary)]"
                      >
                        <span className="mt-0.5 font-mono text-[10.5px] font-semibold text-[var(--accent)]">
                          0{idx + 1}
                        </span>
                        <span>{heading.text}</span>
                      </li>
                    ))}
                </ol>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Responsive Article Grid */}
      {gridPosts.length > 0 && (
        <section aria-label="Articles list">
          {hasActiveFilters && (
            <div className="mb-4 flex items-center justify-between font-mono text-[11.5px] text-[var(--muted)]">
              <span>
                Showing {filteredPosts.length}{" "}
                {filteredPosts.length === 1 ? "article" : "articles"}
                {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
                {selectedTag ? ` tagged #${selectedTag}` : ""}
              </span>
            </div>
          )}

          <div
            className={`grid grid-cols-1 gap-6 ${
              gridPosts.length >= 3
                ? "md:grid-cols-2 lg:grid-cols-3"
                : "md:grid-cols-2"
            }`}
          >
            {gridPosts.map((post) => (
              <article
                key={post.slug}
                className="group relative flex flex-col rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[15px] border border-[var(--border)] bg-[var(--double-frame-inner)] p-5 sm:p-6">
                  <div className="specular-line" aria-hidden="true" />

                  <div>
                    {/* Card Top Metadata */}
                    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-[6px] border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[var(--accent)]">
                        {post.category}
                      </span>

                      <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted)]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[var(--accent)]" />
                          <span>{post.readingTimeText}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-[var(--border-strong)]"
                        >
                          ·
                        </span>
                        <time dateTime={post.publishedAt}>
                          {formatBlogDate(post.publishedAt)}
                        </time>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-[1.32rem] sm:text-[1.42rem] font-bold tracking-[-0.02em] leading-[1.24] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)] [text-wrap:balance]">
                      <Link
                        href={`/blog/${post.slug}`}
                        onClick={() => audioHaptics.trigger("tap")}
                        className="after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    {/* Description */}
                    <p className="mt-2.5 text-[14px] leading-[1.65] text-[var(--muted)]">
                      {post.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 space-y-4">
                    <div className="relative z-10 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => {
                        const isSelected = selectedTag === tag;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`hit-target rounded-[5px] border px-2 py-1.5 sm:py-0.5 font-mono text-[10.5px] transition-colors ${
                              isSelected
                                ? "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--accent-on-muted,var(--accent))]"
                                : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            }`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-3.5">
                      <div className="flex items-center gap-2">
                        {post.author.avatar && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full border border-[var(--border-strong)] object-cover"
                          />
                        )}
                        <span className="text-[12px] font-medium text-[var(--ink-secondary)]">
                          {post.author.name}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                        <span>Read</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
