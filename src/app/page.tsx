import Link from "next/link";
import { IslandNavbar } from "@/components/IslandNavbar";
import rawSections from "@/components/raw_sections.json";
import { FoldWorkspace } from "@/components/FoldWorkspace";
import { WhyFoldBento } from "@/components/landing/WhyFoldBento";
import { CraftSpecs } from "@/components/landing/CraftSpecs";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { LaunchCta } from "@/components/landing/LaunchCta";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SITE_CONFIG } from "@/lib/site";
import {
  getFaqPageJsonLd,
  getOrganizationJsonLd,
  getSoftwareApplicationJsonLd,
  getWebSiteJsonLd,
  serializeJsonLd,
} from "@/lib/seo";

export default function Home() {
  const softwareJsonLd = getSoftwareApplicationJsonLd();
  const webSiteJsonLd = getWebSiteJsonLd();
  const organizationJsonLd = getOrganizationJsonLd();
  const faqJsonLd = getFaqPageJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />

      <a className="skip-link" href="#app">
        Skip to notes demo
      </a>

      {/* Subtle Film Grain */}
      <div className="studio-grain" aria-hidden="true" />

      {/* Section 1: Floating Island Navbar with Wensity UI components */}
      <IslandNavbar />

      <main id="top">
        {/* Section 2: Command Hero Section */}
        <section className="hero-section" aria-labelledby="heroTitle">
          {/* Folded Paper Atmosphere */}
          <div
            dangerouslySetInnerHTML={{
              __html: rawSections.heroAtmosphere,
            }}
          />

          <div className="shell hero-content">
            <div className="hero-content-intro">
              <h1 className="hero-display-heading" id="heroTitle">
                Notes, without the noise.
              </h1>

              <p className="hero-lede-text">
                A calm, private place for the thoughts you mean to keep.
                Fold runs entirely in your browser, saves to this device,
                and never asks for an account, a cookie, or a subscription.
              </p>

              <div className="hero-cta-cluster">
                <Link className="btn-primary-tactile" href="/app">
                  <span>Start writing in Fold</span>
                  <span className="btn-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <a className="btn-ghost-tactile" href="#app">
                  <span className="live-pulse-dot" aria-hidden="true" />
                  <span>Try the live demo</span>
                </a>
              </div>

              <div className="hero-badges-row">
                {["IndexedDB engine", "Works offline", "Open source (MIT)"].map((badge) => (
                  <span className="hero-badge-item" key={badge}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="m3.5 8.5 3 3 6-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </div>
            <FoldWorkspace />
          </div>
        </section>

        {/* Section 3: Bento Grid Layout */}
        <WhyFoldBento />

        {/* Section 4: The Craft & Specifications */}
        <CraftSpecs />

        {/* Technical Architecture & Machine-Readable Overview (GEO / AEO) */}
        <section
          className="architecture-section"
          id="architecture"
          aria-labelledby="architectureTitle"
        >
          <div className="shell">
            <header className="landing-section-header">
              <h2 className="landing-section-title" id="architectureTitle">
                How Fold works under the hood
              </h2>
              <p className="landing-section-subtitle">
                A short technical overview of the local storage engine, cross-tab sync, and the
                offline app runtime.
              </p>
            </header>

            <div className="architecture-plate">
              <div className="architecture-plate__inner">
                <div className="specular-line" aria-hidden="true" />

                <div className="architecture-grid">
                  <article className="architecture-item">
                    <h3 className="architecture-title">What Fold is</h3>
                    <p className="architecture-body">
                      Fold is a free,{" "}
                      <a
                        href={SITE_CONFIG.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-[var(--ink)] transition-colors"
                      >
                        open-source (MIT)
                      </a>{" "}
                      notes workspace for the web. It pairs a distraction-free editor with task
                      lists, folders, tags, and instant search, and runs entirely on this device. No
                      tracking scripts, no cookies, no cloud lock-in.
                    </p>
                  </article>

                  <article className="architecture-item">
                    <h3 className="architecture-title">Local storage engine</h3>
                    <p className="architecture-body">
                      Notes persist on your hard drive inside an asynchronous IndexedDB database (
                      <code className="architecture-code">fold_db</code> v2,{" "}
                      <code className="architecture-code">notes</code> store), mirrored to{" "}
                      <code className="architecture-code">localStorage</code> for emergency
                      recovery and synced across open tabs through{" "}
                      <code className="architecture-code">BroadcastChannel</code> (
                      <code className="architecture-code">fold_sync_v2</code>). No server
                      connection is involved.
                    </p>
                  </article>

                  <article className="architecture-item">
                    <h3 className="architecture-title">Offline use and export</h3>
                    <p className="architecture-body">
                      Fold installs as a standalone app with a service worker (
                      <code className="architecture-code">{SITE_CONFIG.engine.cacheName}</code>)
                      that caches the typography and application files, so writing works the same on
                      a plane or a train. Export any time as Markdown, a ZIP vault with YAML
                      frontmatter, or a full JSON backup.
                    </p>
                  </article>
                </div>

                <dl className="architecture-specs">
                  <div>
                    <dt>Storage engine</dt>
                    <dd>IndexedDB (fold_db v2)</dd>
                  </div>
                  <div>
                    <dt>Cross-tab sync</dt>
                    <dd>BroadcastChannel (fold_sync_v2)</dd>
                  </div>
                  <div>
                    <dt>Offline mode</dt>
                    <dd>Service worker</dd>
                  </div>
                  <div>
                    <dt>Network egress</dt>
                    <dd className="architecture-specs__accent">0 bytes. No tracking.</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Interactive FAQ Accordion */}
        <FaqAccordion />

        {/* Section 6: Launch CTA Banner */}
        <LaunchCta />
      </main>

      {/* Section 7: Hardware-Grade Site Footer */}
      <SiteFooter />
    </>
  );
}
