/**
 * Fold: Central Site Configuration & Technical Metadata Constants
 * Single source of truth for SEO, canonical URLs, author info, and legal telemetry.
 */

const DEFAULT_SITE_URL = "https://foldnotes.web.app";

function resolveSiteUrl(raw: string | undefined): string {
  const candidate = raw?.trim();
  if (!candidate) return DEFAULT_SITE_URL;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return DEFAULT_SITE_URL;
    }
    return parsed.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support.dhairyadarji@gmail.com";

const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL?.trim() || "https://github.com/dhairya0707/fold";

export const SITE_CONFIG = {
  name: "Fold",
  shortName: "Fold",
  legalName: "Fold Notes",
  tagline: "Notes without the noise",
  description:
    "A private local-first notes app powered by on-device IndexedDB. Write offline with zero tracking, zero cookies, and one-click Markdown or JSON export.",
  /** Production domain used for canonical links and Open Graph metadata */
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  author: {
    name: "Dhairya Darji",
    handle: "@dhairya0707",
    x: "https://x.com/dhairya0707",
    email: SUPPORT_EMAIL,
  },
  links: {
    x: "https://x.com/dhairya0707",
    github: GITHUB_URL,
    contactEmail: `mailto:${SUPPORT_EMAIL}?subject=Fold%20Workspace%20Inquiry`,
  },
  engine: {
    name: "IndexedDB Local Engine",
    version: "2.0",
    dbName: "fold_db",
    storageStore: "notes",
    ipcChannel: "fold_sync_v2",
    cacheName: "fold-v2.1",
  },
  themeColors: {
    paper: "#f4f0e6",
    ink: "#141511",
    accent: "#b8452c",
    accentInk: "#e07b56",
  },
} as const;
