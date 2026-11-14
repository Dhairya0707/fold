import { SITE_CONFIG } from "@/lib/site";

const BASE_URL = SITE_CONFIG.url.replace(/\/+$/, "");

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * Mirrors the 6 canonical FAQ items rendered in `src/components/landing/FaqAccordion.tsx`.
 * Keep synchronized so structured data accurately reflects visible page copy.
 */
const LANDING_FAQS: readonly FaqEntry[] = [
  {
    question: "Where are my notes actually stored?",
    answer:
      "Your notes live directly inside your browser's IndexedDB database (fold_db v2) on your local hard drive, with a synchronous localStorage mirror for crash recovery. Fold operates completely on your machine, so no note body, title, folder name, or keystroke is ever transmitted over the network to any server.",
  },
  {
    question: "Does Fold track my writing or collect telemetry?",
    answer:
      "No. Fold includes zero analytics scripts, behavioral trackers, session replays, error-reporting beacons, or first-party and third-party HTTP cookies. All typography is self-hosted at build time, so your browser makes no runtime requests to external font CDNs. Your notes, tags, and drafts stay strictly inside your local browser sandbox.",
  },
  {
    question: "Does Fold work without an internet connection?",
    answer:
      "Yes. Fold installs as a Progressive Web App (PWA) backed by a dedicated Service Worker that caches application scripts, styles, and self-hosted fonts locally. Once loaded, you can open your workspace, search notes, and write offline on airplanes, trains, or remote locations with zero degradation in typing speed.",
  },
  {
    question: "Can I export my notes if I ever decide to leave?",
    answer:
      "Yes, at any time. You can export your entire workspace with one click as a ZIP vault of standard Markdown (.md) files with YAML frontmatter, or as a raw JSON backup for re-import. You can also download or copy any single note as clean Markdown for Obsidian, Bear, or iA Writer.",
  },
  {
    question: "What happens if I close the browser or restart?",
    answer:
      "IndexedDB writes directly to your device's local disk partition, and Fold flushes a localStorage backup mirror before the tab closes. Your notes, folders, tags, and task checklists persist across browser closures, system restarts, and app updates. Only clearing browser site data or using private browsing removes local storage.",
  },
  {
    question: "Is Fold completely free to use?",
    answer:
      "Yes. Fold is completely free and open source under the MIT License, with no paywalls, monthly subscriptions, user accounts, or gated features. Because the entire notes workspace runs locally inside your browser without hosted cloud databases or sync servers, there are no recurring infrastructure costs to pass on to users.",
  },
] as const;

export function getSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${BASE_URL}/#software`,
    name: SITE_CONFIG.legalName,
    alternateName: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: BASE_URL,
    installUrl: `${BASE_URL}/app`,
    applicationCategory: "ProductivityApplication",
    applicationSubCategory: "NoteTakingApplication",
    operatingSystem: "Any (Web, PWA)",
    softwareVersion: SITE_CONFIG.engine.version,
    browserRequirements:
      "Requires JavaScript and IndexedDB. Supports offline use via Service Worker.",
    inLanguage: "en-US",
    isAccessibleForFree: true,
    image: `${BASE_URL}/og-image.png`,
    screenshot: `${BASE_URL}/og-image.png`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      category: "Free",
    },
    featureList: [
      "Local-first IndexedDB storage (fold_db v2) with zero cloud lock-in",
      "Offline-first Progressive Web App (PWA) with Service Worker asset caching",
      "Zero tracking, zero analytics telemetry, zero cookies, and zero user accounts",
      "Markdown ZIP vault export with YAML frontmatter, JSON backup, and single-note .md export",
      "Real-time multi-tab synchronization via BroadcastChannel (fold_sync_v2)",
      "Instant full-text local search and keyboard-driven Command Palette",
    ],
    author: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      alternateName: SITE_CONFIG.author.handle,
      url: SITE_CONFIG.author.x,
      sameAs: [SITE_CONFIG.author.x],
    },
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: SITE_CONFIG.name,
      url: BASE_URL,
    },
  };
}

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.legalName,
    description: SITE_CONFIG.description,
    url: BASE_URL,
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: SITE_CONFIG.name,
      url: BASE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: BASE_URL,
    description: SITE_CONFIG.description,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/icon-512.png`,
      width: 512,
      height: 512,
    },
    email: SITE_CONFIG.author.email,
    founder: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      alternateName: SITE_CONFIG.author.handle,
      url: SITE_CONFIG.author.x,
      sameAs: [SITE_CONFIG.author.x],
    },
    creator: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      alternateName: SITE_CONFIG.author.handle,
      url: SITE_CONFIG.author.x,
      sameAs: [SITE_CONFIG.author.x],
    },
    sameAs: [SITE_CONFIG.author.x],
    contactPoint: {
      "@type": "ContactPoint",
      email: SITE_CONFIG.author.email,
      contactType: "customer support",
      url: SITE_CONFIG.author.x,
    },
  };
}

export function getFaqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${BASE_URL}/#faq`,
    url: `${BASE_URL}/#questions`,
    mainEntity: LANDING_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const normalizedUrl = item.url.startsWith("http")
        ? item.url
        : `${BASE_URL}${item.url.startsWith("/") ? item.url : `/${item.url}`}`;

      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: normalizedUrl,
      };
    }),
  };
}

/**
 * Safely serializes JSON-LD payloads for `<script type="application/ld+json">`,
 * escaping `<` as `\u003c` to prevent XSS script breakout.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
