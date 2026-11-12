import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/site";

const BASE_URL = SITE_CONFIG.url.replace(/\/+$/, "");
const BLOG_CONTENT_DIR = path.join(process.cwd(), "src", "content", "blog");
const POST_EXTENSIONS = new Set([".md", ".mdx", ".json"]);
const DEFAULT_LAST_MODIFIED = new Date("2026-11-10T00:00:00.000Z");

function extractFrontmatterValue(raw: string, key: string): string | null {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return null;
  const lineMatch = fmMatch[1].match(new RegExp(`^${key}:\\s*["']?([^"'\\r\\n]+)["']?\\s*$`, "m"));
  return lineMatch ? lineMatch[1].trim() : null;
}

function getBlogPostEntries(): MetadataRoute.Sitemap {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return [];
  }

  try {
    const dirEntries = fs.readdirSync(BLOG_CONTENT_DIR, { withFileTypes: true });
    const seenSlugs = new Set<string>();
    const entries: MetadataRoute.Sitemap = [];

    for (const entry of dirEntries) {
      if (entry.name.startsWith(".") || entry.name.startsWith("_")) {
        continue;
      }

      let slug = "";
      let lastModified = DEFAULT_LAST_MODIFIED;
      const fullPath = path.join(BLOG_CONTENT_DIR, entry.name);

      if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (!POST_EXTENSIONS.has(ext)) continue;

        const base = path.basename(entry.name, ext);
        if (base === "index") continue;

        slug = base;

        try {
          if (ext === ".md" || ext === ".mdx") {
            const raw = fs.readFileSync(fullPath, "utf8");
            const frontmatterSlug = extractFrontmatterValue(raw, "slug");
            if (frontmatterSlug) slug = frontmatterSlug;

            const dateStr =
              extractFrontmatterValue(raw, "updatedAt") ||
              extractFrontmatterValue(raw, "publishedAt") ||
              extractFrontmatterValue(raw, "date");
            if (dateStr) {
              const parsed = new Date(dateStr);
              if (!Number.isNaN(parsed.getTime())) {
                lastModified = parsed;
              }
            }
          }

          if (lastModified === DEFAULT_LAST_MODIFIED) {
            lastModified = fs.statSync(fullPath).mtime;
          }
        } catch {
          lastModified = DEFAULT_LAST_MODIFIED;
        }
      } else if (entry.isDirectory()) {
        slug = entry.name;
        try {
          lastModified = fs.statSync(fullPath).mtime;
        } catch {
          lastModified = DEFAULT_LAST_MODIFIED;
        }
      }

      if (!slug || seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);

      entries.push({
        url: `${BASE_URL}/blog/${encodeURIComponent(slug)}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    return entries.sort((a, b) => a.url.localeCompare(b.url));
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticRoutes, ...getBlogPostEntries()];
}
