import type { Metadata } from "next";
import { IslandNavbar } from "@/components/IslandNavbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { BlogListingClient } from "@/components/blog/BlogListingClient";
import {
  getAllCategories,
  getAllPostSummaries,
  getAllTags,
} from "@/lib/blog";
import { SITE_CONFIG } from "@/lib/site";
import { serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Field notes: engineering and design journal",
  description:
    "Engineering essays from Fold on local-first software architecture, IndexedDB browser storage, eviction defense, and calm digital stationery.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Field notes: engineering and design journal | Fold",
    description:
      "Engineering essays from Fold on local-first software architecture, IndexedDB browser storage, eviction defense, and calm digital stationery.",
    url: "/blog",
    siteName: SITE_CONFIG.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Fold field notes: engineering and design journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Field notes: engineering and design journal | Fold",
    description:
      "Engineering essays from Fold on local-first software architecture, IndexedDB browser storage, eviction defense, and calm digital stationery.",
    creator: SITE_CONFIG.author.handle,
    images: ["/opengraph-image"],
  },
};

export default function BlogPage() {
  const posts = getAllPostSummaries();
  const categories = getAllCategories(posts);
  const tags = getAllTags(posts);

  const siteUrl = SITE_CONFIG.url.replace(/\/$/, "");

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
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Fold Field Notes",
    description:
      "Engineering and design essays on local-first software, browser storage durability, and quiet writing instruments.",
    url: `${siteUrl}/blog`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: siteUrl,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(collectionJsonLd),
        }}
      />

      <a className="skip-link" href="#blog-main">
        Skip to articles
      </a>

      <div className="studio-grain" aria-hidden="true" />
      <div className="studio-spotlight" aria-hidden="true" />

      <IslandNavbar />

      <main id="blog-main" className="relative z-[2] pb-20 pt-10 sm:pt-14">
        <div className="shell">
          {/* Editorial Header */}
          <header className="mx-auto mb-10 max-w-[740px] text-center sm:mb-12">
            <h1 className="text-[clamp(2.25rem,5vw,3.35rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[var(--ink)] [text-wrap:balance]">
              Notes on local-first design and quiet software
            </h1>

            <p className="mx-auto mt-4 max-w-[580px] text-[15.5px] leading-[1.68] text-[var(--muted)] [text-wrap:pretty]">
              Architectural essays and technical field notes from building{" "}
              <strong className="font-semibold text-[var(--ink)]">Fold</strong>,
              exploring IndexedDB persistence, multi-window IPC, eviction
              defense, and distraction-free design.
            </p>

            {/* Quiet Telemetry Strip */}
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-1.5 font-mono text-[11px] text-[var(--muted)] shadow-[var(--shadow-card)]">
              <span className="inline-flex items-center gap-1.5 text-[var(--ink)] font-semibold">
                <span className="status-dot status-dot--active" />
                <span>{posts.length} Essays</span>
              </span>
              <span aria-hidden="true" className="text-[var(--border-strong)]">
                ·
              </span>
              <span>Zero Cloud</span>
              <span aria-hidden="true" className="text-[var(--border-strong)]">
                ·
              </span>
              <span>Static MDX / Markdown</span>
            </div>
          </header>

          {/* Interactive Filter Bar, Featured Hero & Grid */}
          <BlogListingClient
            posts={posts}
            categories={categories}
            tags={tags}
          />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
