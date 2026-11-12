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
      "Directly in your browser's IndexedDB storage on your hard drive. Fold operates 100% locally on your machine. No note text, title, or keystroke is ever transmitted over the wire to any server.",
  },
  {
    question: "Does Fold track my writing or collect telemetry?",
    answer:
      "Zero. No tracking scripts, analytics beacons, error-logging telemetry, or third-party cookies are bundled into Fold. Your words and drafts stay strictly inside your local browser sandbox.",
  },
  {
    question: "Does Fold work without an internet connection?",
    answer:
      "Yes. Fold installs as a Progressive Web App (PWA) with a dedicated Service Worker caching typography and application scripts. You can write in airplanes, subways, and remote locations with identical speed.",
  },
  {
    question: "Can I export my notes if I ever decide to leave?",
    answer:
      "Always. You can export all notes with one click as structured Markdown files (.md) or a portable JSON vault. You can also copy any individual note as clean Markdown to paste into any editor.",
  },
  {
    question: "What happens if I close the browser or restart?",
    answer:
      "IndexedDB writes directly to your local disk partition. Your notes persist across browser closures, system reboots, and updates without losing formatting or tags.",
  },
  {
    question: "Is Fold completely free to use?",
    answer:
      "Yes, 100% free with no paywalls, monthly subscriptions, or feature locks. The entire application runs client-side and requires zero expensive cloud server infrastructure to maintain.",
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
    image: `${BASE_URL}/opengraph-image`,
    screenshot: `${BASE_URL}/opengraph-image`,
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
      "Sub-millisecond full-text local search and keyboard-driven Command Palette",
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
