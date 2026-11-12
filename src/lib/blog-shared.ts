export interface BlogAuthor {
  name: string;
  handle: string;
  x: string;
  avatar?: string;
}

export interface BlogHeading {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  author: BlogAuthor;
  category: string;
  tags: string[];
  featured?: boolean;
  coverImage?: string;
}

export interface BlogPost extends BlogPostFrontmatter {
  content: string;
  readingTimeMinutes: number;
  readingTimeText: string;
  wordCount: number;
  headings: BlogHeading[];
  fileName: string;
  format: "mdx" | "md";
}

export type BlogPostSummary = Omit<BlogPost, "content">;

/**
 * Strips inline Markdown and safe inline HTML formatting for plain text / heading IDs.
 */
export function stripMarkdownInline(input: string): string {
  return input
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/==([^=]+)==/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Converts a heading string to a deterministic URL-safe anchor slug.
 */
export function slugifyHeading(text: string): string {
  const plain = stripMarkdownInline(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return plain || "section";
}

/**
 * Creates a stateful slugger so duplicate headings within one article
 * receive stable unique IDs (e.g. `overview`, `overview-2`).
 */
export function createHeadingSlugger(): (text: string) => string {
  const counts = new Map<string, number>();

  return (text: string): string => {
    const base = slugifyHeading(text);
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  };
}

/**
 * Formats a YYYY-MM-DD date string deterministically in UTC to avoid hydration mismatches.
 */
export function formatBlogDate(
  dateStr: string,
  style: "short" | "long" = "short"
): string {
  if (!dateStr) return "";

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())
    ? `${dateStr.trim()}T00:00:00.000Z`
    : dateStr.trim();

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return dateStr;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}
