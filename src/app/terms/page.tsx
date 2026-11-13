import type { Metadata } from "next";
import Link from "next/link";
import {
  FileCode2,
  KeyRound,
  HardDriveDownload,
  Scale,
  AlertCircle,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { IslandNavbar } from "@/components/IslandNavbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use: MIT open-source local-first notes",
  description:
    "Terms of use for Fold: MIT-licensed local-first software, full user ownership of notes, local backup responsibility, and warranty disclaimers.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of use: MIT open-source local-first notes | Fold",
    description:
      "Terms of use for Fold: MIT-licensed local-first software, full user ownership of notes, local backup responsibility, and warranty disclaimers.",
    url: `${SITE_CONFIG.url}/terms`,
    siteName: SITE_CONFIG.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Fold terms of use",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of use: MIT open-source local-first notes | Fold",
    description:
      "Terms of use for Fold: MIT-licensed local-first software, full user ownership of notes, local backup responsibility, and warranty disclaimers.",
    creator: SITE_CONFIG.author.handle,
    images: ["/opengraph-image"],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_CONFIG.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Terms of Use",
      item: `${SITE_CONFIG.url}/terms`,
    },
  ],
};

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <a className="skip-link" href="#terms-document">
        Skip to terms of use
      </a>

      {/* Atmospheric Film Grain & Spotlight */}
      <div className="studio-grain" aria-hidden="true" />
      <div className="studio-spotlight" aria-hidden="true" />

      <IslandNavbar />

      <main
        id="terms-document"
        className="relative z-10 py-12 sm:py-16 lg:py-20"
      >
        <div className="shell">
          <div className="mx-auto max-w-[860px]">
            {/* Breadcrumb Trail */}
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2 font-mono text-xs text-[var(--muted)]"
            >
              <Link
                href="/"
                className="transition-colors hover:text-[var(--ink)]"
              >
                Home
              </Link>
              <span aria-hidden="true" className="text-[var(--border-strong)]">
                /
              </span>
              <span className="text-[var(--ink)]" aria-current="page">
                Terms of Use
              </span>
            </nav>

            {/* Editorial Header */}
            <header className="mb-10 sm:mb-12">
              <h1 className="text-[clamp(2.2rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink)] mb-4 [text-wrap:balance]">
                Terms of use, without the legalese
              </h1>

              <p className="max-w-[64ch] text-[15px] sm:text-base leading-[1.68] text-[var(--muted)] [text-wrap:pretty]">
                Plain-spoken terms for local-first client software. You own
                everything you write, Fold claims nothing, and the software is
                offered freely under the MIT License.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 font-mono text-[11px] text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-card)] px-2.5 py-1 text-[var(--ink)]">
                  <span className="status-dot status-dot--active" />
                  <span>Effective 2026</span>
                </span>
                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
                  MIT License
                </span>
                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
                  100% User Ownership
                </span>
              </div>
            </header>

            {/* Concentric Double-Frame Terms Document */}
            <article className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-chassis)]">
              <div className="relative overflow-hidden rounded-[1.12rem] border border-[var(--border)] bg-[var(--double-frame-inner)] px-6 py-8 sm:px-10 sm:py-12">
                <div className="specular-line" aria-hidden="true" />

                <div className="space-y-10 text-[15px] leading-[1.72] text-[var(--ink-secondary)]">
                  {/* Section 1: Software Nature */}
                  <section aria-labelledby="terms-software">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        01 · Software Nature
                      </span>
                    </div>
                    <h2
                      id="terms-software"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Client-side software under the MIT License
                    </h2>
                    <p className="mb-3">
                      Fold is a client-side, local-first web application
                      provided free of charge under the{" "}
                      <strong className="font-semibold text-[var(--ink)]">
                        MIT License
                      </strong>
                      . By opening the public showcase or launching the local
                      workspace at{" "}
                      <code className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--ink)]">
                        /app
                      </code>
                      , you agree to these simple terms.
                    </p>
                    <p>
                      There are no subscriptions, seat licenses, paywalls, or
                      hosted cloud service level agreements because the entire
                      application executes directly inside your browser.
                    </p>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 2: Data Ownership */}
                  <section aria-labelledby="terms-ownership">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        02 · Data Ownership
                      </span>
                    </div>
                    <h2
                      id="terms-ownership"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      You own 100% of your notes and writing
                    </h2>
                    <p>
                      Every word, note, tag, task list, and exported archive you
                      create in Fold belongs exclusively to you. Fold claims
                      zero ownership, copyright, license, or commercial rights
                      to your content, and because your notes never leave your
                      device, we never possess or inspect them.
                    </p>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 3: Local Responsibility */}
                  <section aria-labelledby="terms-responsibility">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <HardDriveDownload
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        03 · Local Storage &amp; Backup Responsibility
                      </span>
                    </div>
                    <h2
                      id="terms-responsibility"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Managing your backups and device disk space
                    </h2>
                    <p className="mb-3">
                      Because Fold maintains zero remote servers, user
                      accounts, or cloud recovery copies, we cannot retrieve or
                      restore notes that are lost due to clearing browser site
                      data, browser storage eviction, device loss, or hardware
                      failure.
                    </p>
                    <p>
                      You are solely responsible for managing your local browser
                      storage quota, enabling persistent storage when prompted,
                      and exporting regular{" "}
                      <code className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--ink)]">
                        .zip
                      </code>{" "}
                      or{" "}
                      <code className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--ink)]">
                        .json
                      </code>{" "}
                      vault backups of critical writing.
                    </p>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 4: Acceptable Use */}
                  <section aria-labelledby="terms-acceptable">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        04 · Acceptable Use
                      </span>
                    </div>
                    <h2
                      id="terms-acceptable"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Respectful use of the public website
                    </h2>
                    <p>
                      When visiting the hosted Fold web domain, you agree not to
                      interfere with normal availability, launch automated
                      denial-of-service traffic, probe hosting infrastructure,
                      or misrepresent modified versions of Fold as the official
                      hosted release.
                    </p>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 5: Disclaimer of Warranty & Limitation of Liability */}
                  <section aria-labelledby="terms-warranty">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <AlertCircle
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        05 · Disclaimer &amp; Limitation of Liability
                      </span>
                    </div>
                    <h2
                      id="terms-warranty"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-4 [text-wrap:balance]"
                    >
                      Standard MIT open-source warranty disclaimer
                    </h2>
                    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface-muted)] p-5 font-mono text-[12px] leading-[1.7] text-[var(--muted)]">
                      THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT
                      WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
                      NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
                      FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
                      SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
                      CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
                      CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
                      CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
                      IN THE SOFTWARE.
                    </div>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 6: Contact */}
                  <section aria-labelledby="terms-contact">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        06 · Questions &amp; Contact
                      </span>
                    </div>
                    <h2
                      id="terms-contact"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Get in touch
                    </h2>
                    <p className="mb-5">
                      For questions about these Terms of Use, licensing, or
                      responsible disclosure, contact{" "}
                      <strong className="font-semibold text-[var(--ink)]">
                        {SITE_CONFIG.author.name}
                      </strong>{" "}
                      directly:
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={SITE_CONFIG.links.contactEmail}
                        className="btn-primary-tactile"
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        <span>{SITE_CONFIG.author.email}</span>
                      </a>

                      <a
                        href={SITE_CONFIG.links.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost-tactile"
                      >
                        <span>X / {SITE_CONFIG.author.handle}</span>
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  </section>
                </div>
              </div>
            </article>

            {/* Bottom Cross-Links */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 px-1 text-sm text-[var(--muted)]">
              <Link
                href="/privacy"
                className="font-medium transition-colors hover:text-[var(--accent)] underline underline-offset-4"
              >
                ← Read Privacy Policy
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--accent)] hover:underline underline-offset-4"
              >
                <span>Open Local Workspace</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
