import fs from "node:fs";
import path from "node:path";
import { SITE_CONFIG } from "@/lib/site";
import {
  BlogAuthor,
  BlogHeading,
  BlogPost,
  BlogPostFrontmatter,
  BlogPostSummary,
  createHeadingSlugger,
  formatBlogDate,
  slugifyHeading,
  stripMarkdownInline,
} from "@/lib/blog-shared";

export type {
  BlogAuthor,
  BlogHeading,
  BlogPostFrontmatter,
  BlogPost,
  BlogPostSummary,
};
export { createHeadingSlugger, formatBlogDate, slugifyHeading, stripMarkdownInline };

const BLOG_CONTENT_DIR = path.join(process.cwd(), "src", "content", "blog");

const DEFAULT_AUTHOR: BlogAuthor = {
  name: SITE_CONFIG.author.name,
  handle: SITE_CONFIG.author.handle,
  x: SITE_CONFIG.author.x,
  avatar: "/avatar.jpg",
};

function stripOuterQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const inner = trimmed.slice(1, -1);
    if (trimmed.startsWith('"')) {
      return inner
        .replace(/\\"/g, '"')
        .replace(/\\n/g, "\n")
        .replace(/\\\\/g, "\\");
    }
    return inner.replace(/''/g, "'");
  }
  return trimmed;
}

function stripInlineComment(raw: string): string {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const prev = i > 0 ? raw[i - 1] : "";

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle && prev !== "\\") {
      inDouble = !inDouble;
    } else if (ch === "#" && !inSingle && !inDouble && (i === 0 || /\s/.test(prev))) {
      return raw.slice(0, i).trim();
    }
  }

  return raw.trim();
}

function parseScalar(raw: string): string | boolean {
  const cleaned = stripInlineComment(raw);
  if (cleaned === "true") return true;
  if (cleaned === "false") return false;
  return stripOuterQuotes(cleaned);
}

function parseInlineArray(raw: string): string[] {
  const inner = raw.trim().slice(1, -1).trim();
  if (!inner) return [];

  const items: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    const prev = i > 0 ? inner[i - 1] : "";

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      current += ch;
    } else if (ch === '"' && !inSingle && prev !== "\\") {
      inDouble = !inDouble;
      current += ch;
    } else if (ch === "," && !inSingle && !inDouble) {
      const val = stripOuterQuotes(current);
      if (val) items.push(val);
      current = "";
    } else {
      current += ch;
    }
  }

  const tail = stripOuterQuotes(current);
  if (tail) items.push(tail);
  return items;
}

function parseInlineObject(raw: string): Record<string, string> {
  const inner = raw.trim().slice(1, -1).trim();
  const obj: Record<string, string> = {};
  if (!inner) return obj;

  const pairs: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    const prev = i > 0 ? inner[i - 1] : "";
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle && prev !== "\\") inDouble = !inDouble;

    if (ch === "," && !inSingle && !inDouble) {
      pairs.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) pairs.push(current);

  for (const pair of pairs) {
    const colonIdx = pair.indexOf(":");
    if (colonIdx === -1) continue;
    const key = stripOuterQuotes(pair.slice(0, colonIdx)).trim();
    const val = stripOuterQuotes(pair.slice(colonIdx + 1)).trim();
    if (key) obj[key] = val;
  }

  return obj;
}

/**
 * Pure TypeScript YAML frontmatter parser tailored for static MDX/MD blog articles.
 */
export function parseFrontmatter(
  rawSource: string,
  fallbackSlug: string
): { frontmatter: BlogPostFrontmatter; content: string } {
  const source = rawSource.replace(/^\uFEFF/, "");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return {
      frontmatter: {
        title: fallbackSlug,
        description: "",
        slug: fallbackSlug,
        publishedAt: "2026-01-01",
        author: { ...DEFAULT_AUTHOR },
        category: "Engineering",
        tags: [],
        featured: false,
      },
      content: source.trim(),
    };
  }

  const yamlBlock = match[1];
  const content = match[2].trim();
  const lines = yamlBlock.split(/\r?\n/);

  const record: Record<string, unknown> = {};
  let currentBlockKey: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const indent = rawLine.length - rawLine.trimStart().length;

    // Nested list item (e.g. `  - local-first`)
    if (indent >= 0 && trimmed.startsWith("- ") && currentBlockKey) {
      const existing = Array.isArray(record[currentBlockKey])
        ? (record[currentBlockKey] as string[])
        : [];
      const itemVal = String(parseScalar(trimmed.slice(2)));
      if (itemVal) {
        existing.push(itemVal);
      }
      record[currentBlockKey] = existing;
      continue;
    }

    // Nested object property (e.g. `  name: "Dhairya Darji"`)
    if (indent > 0 && currentBlockKey) {
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx !== -1) {
        const subKey = trimmed.slice(0, colonIdx).trim();
        const subRaw = trimmed.slice(colonIdx + 1).trim();
        const existingObj =
          typeof record[currentBlockKey] === "object" &&
          record[currentBlockKey] !== null &&
          !Array.isArray(record[currentBlockKey])
            ? (record[currentBlockKey] as Record<string, unknown>)
            : {};
        existingObj[subKey] = parseScalar(subRaw);
        record[currentBlockKey] = existingObj;
        continue;
      }
    }

    // Top-level key: value
    const colonIdx = rawLine.indexOf(":");
    if (colonIdx === -1) continue;

    const key = rawLine.slice(0, colonIdx).trim();
    const rawValue = rawLine.slice(colonIdx + 1).trim();

    if (!rawValue) {
      currentBlockKey = key;
      continue;
    }

    currentBlockKey = null;

    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      record[key] = parseInlineArray(rawValue);
    } else if (rawValue.startsWith("{") && rawValue.endsWith("}")) {
      record[key] = parseInlineObject(rawValue);
    } else {
      record[key] = parseScalar(rawValue);
    }
  }

  const rawAuthor =
    typeof record.author === "object" &&
    record.author !== null &&
    !Array.isArray(record.author)
      ? (record.author as Record<string, unknown>)
      : {};

  const author: BlogAuthor = {
    name:
      typeof rawAuthor.name === "string" && rawAuthor.name.trim()
        ? rawAuthor.name.trim()
        : DEFAULT_AUTHOR.name,
    handle:
      typeof rawAuthor.handle === "string" && rawAuthor.handle.trim()
        ? rawAuthor.handle.trim()
        : DEFAULT_AUTHOR.handle,
    x:
      typeof rawAuthor.x === "string" && rawAuthor.x.trim()
        ? rawAuthor.x.trim()
        : DEFAULT_AUTHOR.x,
    avatar:
      typeof rawAuthor.avatar === "string" && rawAuthor.avatar.trim()
        ? rawAuthor.avatar.trim()
        : DEFAULT_AUTHOR.avatar,
  };

  const tags = Array.isArray(record.tags)
    ? record.tags
        .map((t) => String(t).trim())
        .filter(Boolean)
    : [];

  const frontmatter: BlogPostFrontmatter = {
    title:
      typeof record.title === "string" && record.title.trim()
        ? record.title.trim()
        : fallbackSlug,
    description:
      typeof record.description === "string" ? record.description.trim() : "",
    slug:
      typeof record.slug === "string" && record.slug.trim()
        ? record.slug.trim()
        : fallbackSlug,
    publishedAt:
      typeof record.publishedAt === "string" && record.publishedAt.trim()
        ? record.publishedAt.trim()
        : "2026-01-01",
    updatedAt:
      typeof record.updatedAt === "string" && record.updatedAt.trim()
        ? record.updatedAt.trim()
        : undefined,
    author,
    category:
      typeof record.category === "string" && record.category.trim()
        ? record.category.trim()
        : "Engineering",
    tags,
    featured: Boolean(record.featured),
    coverImage:
      typeof record.coverImage === "string" && record.coverImage.trim()
        ? record.coverImage.trim()
        : undefined,
  };

  return { frontmatter, content };
}

/**
 * Extracts h2, h3, and h4 headings from Markdown/MDX outside fenced code blocks.
 */
export function extractHeadings(markdown: string): BlogHeading[] {
  const lines = markdown.split(/\r?\n/);
  const headings: BlogHeading[] = [];
  const nextSlug = createHeadingSlugger();

  let inFence = false;
  let fenceChar = "";

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!inFence) {
        inFence = true;
        fenceChar = marker;
      } else if (marker === fenceChar) {
        inFence = false;
        fenceChar = "";
      }
      continue;
    }

    if (inFence) continue;

    const headingMatch = trimmed.match(/^(#{2,4})\s+(.+?)\s*#*$/);
    if (!headingMatch) continue;

    const level = headingMatch[1].length as 2 | 3 | 4;
    const text = stripMarkdownInline(headingMatch[2]);
    if (!text) continue;

    headings.push({
      id: nextSlug(text),
      text,
      level,
    });
  }

  return headings;
}

/**
 * Computes accurate word count and reading time at 220 words per minute.
 */
export function calculateReadingTime(markdown: string): {
  wordCount: number;
  readingTimeMinutes: number;
  readingTimeText: string;
} {
  const cleaned = markdown
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/```[^\n]*\n([\s\S]*?)```/g, " $1 ")
    .replace(/~~~[^\n]*\n([\s\S]*?)~~~/g, " $1 ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*`|~=-]/g, " ");

  const words = cleaned
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));

  return {
    wordCount,
    readingTimeMinutes,
    readingTimeText: `${readingTimeMinutes} min read`,
  };
}

function readAllPostsFromDisk(): BlogPost[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(BLOG_CONTENT_DIR, { withFileTypes: true });
  const posts: BlogPost[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".mdx") && !entry.name.endsWith(".md")) continue;

    const format = entry.name.endsWith(".mdx") ? "mdx" : "md";
    const fallbackSlug = entry.name.replace(/\.(mdx|md)$/i, "");
    const fullPath = path.join(BLOG_CONTENT_DIR, entry.name);
    const rawSource = fs.readFileSync(fullPath, "utf8");

    const { frontmatter, content } = parseFrontmatter(rawSource, fallbackSlug);
    const headings = extractHeadings(content);
    const { wordCount, readingTimeMinutes, readingTimeText } =
      calculateReadingTime(content);

    posts.push({
      ...frontmatter,
      content,
      headings,
      wordCount,
      readingTimeMinutes,
      readingTimeText,
      fileName: entry.name,
      format,
    });
  }

  return posts.sort((a, b) => {
    const timeDiff =
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    if (!Number.isNaN(timeDiff) && timeDiff !== 0) {
      return timeDiff;
    }
    return a.slug.localeCompare(b.slug);
  });
}

export function getAllPosts(): BlogPost[] {
  return readAllPostsFromDisk();
}

export function getAllPostSummaries(): BlogPostSummary[] {
  return getAllPosts().map((post) => {
    const { content: _content, ...summary } = post;
    void _content;
    return summary;
  });
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

export function getAllCategories(posts?: readonly BlogPostSummary[]): string[] {
  const source = posts ?? getAllPostSummaries();
  const seen = new Set<string>();
  for (const post of source) {
    if (post.category) seen.add(post.category);
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

export function getAllTags(posts?: readonly BlogPostSummary[]): string[] {
  const source = posts ?? getAllPostSummaries();
  const seen = new Set<string>();
  for (const post of source) {
    for (const tag of post.tags) {
      if (tag) seen.add(tag);
    }
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

export function getRelatedPosts(
  current: Pick<BlogPost, "slug" | "category" | "tags">,
  limit = 2
): BlogPostSummary[] {
  const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));
  const candidates = getAllPostSummaries().filter(
    (post) => post.slug !== current.slug
  );

  const scored = candidates.map((candidate) => {
    let score = 0;
    if (candidate.category.toLowerCase() === current.category.toLowerCase()) {
      score += 3;
    }
    for (const tag of candidate.tags) {
      if (currentTags.has(tag.toLowerCase())) {
        score += 2;
      }
    }
    return { candidate, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (
      new Date(b.candidate.publishedAt).getTime() -
      new Date(a.candidate.publishedAt).getTime()
    );
  });

  return scored.slice(0, limit).map((item) => item.candidate);
}
