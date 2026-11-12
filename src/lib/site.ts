/**
 * Fold — Central Site Configuration & Technical Metadata Constants
 * Single source of truth for SEO, canonical URLs, author info, and legal telemetry.
 */

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
    "A quiet, private, hardware-grade notes workspace for the web. Capture thoughts instantly, persist them on-device with IndexedDB, and keep your mind calm. Zero tracking, zero cloud, zero accounts.",
  /** Production domain used for canonical links and Open Graph metadata */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://foldnotes.app",
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
