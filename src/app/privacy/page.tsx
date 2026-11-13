import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Database,
  EyeOff,
  Radio,
  HardDrive,
  Download,
  Type,
  Mail,
  ArrowUpRight,
  Lock,
} from "lucide-react";
import { IslandNavbar } from "@/components/IslandNavbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy: local-first IndexedDB storage",
  description:
    "How Fold stores notes on-device in IndexedDB (fold_db v2), syncs tabs via BroadcastChannel, and guarantees zero servers, telemetry, or cookies.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy policy: local-first IndexedDB storage | Fold",
    description:
      "How Fold stores notes on-device in IndexedDB (fold_db v2), syncs tabs via BroadcastChannel, and guarantees zero servers, telemetry, or cookies.",
    url: `${SITE_CONFIG.url}/privacy`,
    siteName: SITE_CONFIG.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Fold privacy policy: local-first, zero telemetry",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy policy: local-first IndexedDB storage | Fold",
    description:
      "How Fold stores notes on-device in IndexedDB (fold_db v2), syncs tabs via BroadcastChannel, and guarantees zero servers, telemetry, or cookies.",
    creator: SITE_CONFIG.author.handle,
    images: ["/opengraph-image"],
  },
};

const STORAGE_KEYS = [
  {
    key: "fold_db (v2) → notes",
    kind: "IndexedDB",
    purpose:
      "Primary local database store (keyPath: id; indexed by updated & folder) holding note titles, HTML bodies, folders, tags, pin/star/lock states, and soft-delete timestamps.",
  },
  {
    key: "fold.notes.v1",
    kind: "localStorage",
    purpose:
      "Synchronous emergency mirror and legacy migration cache flushed on beforeunload and pagehide so rapid tab closes never drop in-flight keystrokes.",
  },
  {
    key: "fold.folders.v1",
    kind: "localStorage",
    purpose:
      "Persists your custom workspace folder list alongside default folders so newly created folders remain available even before adding notes.",
  },
  {
    key: "fold.theme.v1",
    kind: "localStorage",
    purpose:
      'Stores your active surface appearance preference ("paper" or "ink") so the correct theme paints before hydration without flashing.',
  },
  {
    key: "fold.sound.v1",
    kind: "localStorage",
    purpose:
      'Stores your mechanical Web Audio synthesizer preference ("active" or "muted").',
  },
  {
    key: "fold.lastBackupDate",
    kind: "localStorage",
    purpose:
      "Records the local calendar date of your most recent manual .zip or .json vault export to display backup status inside Storage & Data Trust.",
  },
] as const;

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
      name: "Privacy Policy",
      item: `${SITE_CONFIG.url}/privacy`,
    },
  ],
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <a className="skip-link" href="#privacy-document">
        Skip to privacy policy
      </a>

      {/* Atmospheric Film Grain & Spotlight */}
      <div className="studio-grain" aria-hidden="true" />
      <div className="studio-spotlight" aria-hidden="true" />

      <IslandNavbar />

      <main
        id="privacy-document"
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
                Privacy Policy
              </span>
            </nav>

            {/* Editorial Header */}
            <header className="mb-10 sm:mb-12">
              <h1 className="text-[clamp(2.2rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink)] mb-4 [text-wrap:balance]">
                Privacy policy, verified in code
              </h1>

              <p className="max-w-[64ch] text-[15px] sm:text-base leading-[1.68] text-[var(--muted)] [text-wrap:pretty]">
                Fold stores every note strictly inside your browser&apos;s local
                storage sandbox, with zero cloud databases, zero analytics
                scripts, and zero network egress.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 font-mono text-[11px] text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-card)] px-2.5 py-1 text-[var(--ink)]">
                  <span className="status-dot status-dot--active" />
                  <span>Effective 2026</span>
                </span>
                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
                  Engine: {SITE_CONFIG.engine.dbName} v2
                </span>
                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
                  IPC: {SITE_CONFIG.engine.ipcChannel}
                </span>
                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
                  Cookies: 0
                </span>
              </div>
            </header>

            {/* Quick-Audit Summary Strip (Concentric Double Frame) */}
            <section
              aria-label="Privacy architecture summary"
              className="mb-8 rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-chassis)]"
            >
              <div className="relative overflow-hidden rounded-[1.12rem] border border-[var(--border)] bg-[var(--double-frame-inner)] p-5 sm:p-6">
                <div className="specular-line" aria-hidden="true" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
                    <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                      <Database className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Primary Store</span>
                    </div>
                    <p className="font-mono text-xs font-semibold text-[var(--ink)]">
                      IndexedDB fold_db v2
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">
                      On-device disk partition
                    </p>
                  </div>

                  <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
                    <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Data Egress</span>
                    </div>
                    <p className="font-mono text-xs font-semibold text-[var(--ink)]">
                      0 bytes / session
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">
                      No servers or cloud sync
                    </p>
                  </div>

                  <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
                    <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Telemetry &amp; Cookies</span>
                    </div>
                    <p className="font-mono text-xs font-semibold text-[var(--ink)]">
                      None bundled
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">
                      document.cookie unused
                    </p>
                  </div>

                  <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
                    <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                      <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Tab Sync</span>
                    </div>
                    <p className="font-mono text-xs font-semibold text-[var(--ink)]">
                      BroadcastChannel IPC
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">
                      Browser-internal channel
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Primary Concentric Double-Frame Policy Document */}
            <article className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-chassis)]">
              <div className="relative overflow-hidden rounded-[1.12rem] border border-[var(--border)] bg-[var(--double-frame-inner)] px-6 py-8 sm:px-10 sm:py-12">
                <div className="specular-line" aria-hidden="true" />

                <div className="space-y-10 text-[15px] leading-[1.72] text-[var(--ink-secondary)]">
                  {/* Section 1: Zero Data Egress */}
                  <section aria-labelledby="policy-egress">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        01 · Zero Data Egress
                      </span>
                    </div>
                    <h2
                      id="policy-egress"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Your notes never leave your browser sandbox
                    </h2>
                    <p className="mb-3">
                      Fold is a 100% client-side workspace. Note bodies, titles,
                      folder names, tags, task checklists, lock flags, and
                      keystrokes are written strictly to your local browser
                      storage. They are never transmitted over the internet to
                      Fold, third-party APIs, or external databases.
                    </p>
                    <p>
                      There are no user accounts, no remote cloud servers, no
                      background sync queues, and no server-side search indexes.
                      Because Fold operates without a backend database, we have
                      zero technical ability to read, inspect, sell, or train AI
                      models on your writing.
                    </p>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 2: Local Storage Architecture */}
                  <section aria-labelledby="policy-storage">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <Database className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        02 · Local Storage Architecture
                      </span>
                    </div>
                    <h2
                      id="policy-storage"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Exact storage keys written on your device
                    </h2>
                    <p className="mb-5">
                      For full auditability, below is the complete inventory of
                      IndexedDB databases and{" "}
                      <code className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--ink)]">
                        localStorage
                      </code>{" "}
                      keys created by Fold on your machine:
                    </p>

                    <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface-muted)]">
                      <div className="divide-y divide-[var(--border)]">
                        {STORAGE_KEYS.map((item) => (
                          <div
                            key={item.key}
                            className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-[230px_1fr] sm:gap-4"
                          >
                            <div>
                              <code className="block font-mono text-xs font-semibold text-[var(--ink)]">
                                {item.key}
                              </code>
                              <span className="mt-1 inline-block rounded border border-[var(--border)] bg-[var(--surface-card)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--accent)]">
                                {item.kind}
                              </span>
                            </div>
                            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
                              {item.purpose}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 3: Zero Analytics, Telemetry & Cookies */}
                  <section aria-labelledby="policy-telemetry">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        03 · Zero Analytics, Telemetry &amp; Cookies
                      </span>
                    </div>
                    <h2
                      id="policy-telemetry"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      No tracking scripts, beacons, or cookies
                    </h2>
                    <p className="mb-3">
                      Fold bundles zero analytics SDKs, behavioral trackers,
                      session replays, or crash-reporting beacons. Specifically,
                      Fold does not load Google Analytics, PostHog, Plausible,
                      Mixpanel, Sentry, or advertising pixels.
                    </p>
                    <p>
                      Fold sets zero first-party or third-party HTTP cookies;{" "}
                      <code className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--ink)]">
                        document.cookie
                      </code>{" "}
                      is completely unused across the entire application.
                    </p>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 4: Multi-Tab Sync */}
                  <section aria-labelledby="policy-sync">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        04 · Multi-Tab Synchronization
                      </span>
                    </div>
                    <h2
                      id="policy-sync"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Browser-internal BroadcastChannel IPC
                    </h2>
                    <p>
                      If you open Fold in multiple tabs or windows within the
                      same browser profile, changes stay synchronized via the
                      standard W3C{" "}
                      <code className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--ink)]">
                        BroadcastChannel(&quot;fold_sync_v2&quot;)
                      </code>{" "}
                      API. Events (
                      <code className="font-mono text-[12.5px] text-[var(--ink)]">
                        note_saved
                      </code>
                      ,{" "}
                      <code className="font-mono text-[12.5px] text-[var(--ink)]">
                        note_deleted
                      </code>
                      , and{" "}
                      <code className="font-mono text-[12.5px] text-[var(--ink)]">
                        batch_updated
                      </code>
                      ) travel purely through browser-internal memory between
                      same-origin tabs, never across any network connection.
                    </p>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 5: Browser Data Clearing & Eviction Defense */}
                  <section aria-labelledby="policy-eviction">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        05 · Browser Cache Clearing &amp; Eviction Defense
                      </span>
                    </div>
                    <h2
                      id="policy-eviction"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Understanding local persistence limits
                    </h2>
                    <p className="mb-3">
                      Because Fold keeps zero copies of your writing on remote
                      servers,{" "}
                      <strong className="font-semibold text-[var(--ink)]">
                        clearing site data, clearing browser storage, or using
                        incognito/private sessions will permanently delete your
                        local IndexedDB vault on that device.
                      </strong>{" "}
                      We cannot recover deleted browser storage on your behalf.
                    </p>
                    <p className="mb-3">
                      To protect against automatic browser eviction when disk
                      space runs low (such as Safari&apos;s 7-day script-storage
                      cleanup policy), Fold calls the standard{" "}
                      <code className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--ink)]">
                        navigator.storage.persist()
                      </code>{" "}
                      API and surfaces real-time persistence status inside{" "}
                      <strong className="font-semibold text-[var(--ink)]">
                        Storage &amp; Data Trust
                      </strong>{" "}
                      in the workspace. In production, Fold also registers an
                      offline Service Worker (
                      <code className="font-mono text-[12.5px] text-[var(--ink)]">
                        sw.js
                      </code>
                      , cache{" "}
                      <code className="font-mono text-[12.5px] text-[var(--ink)]">
                        {SITE_CONFIG.engine.cacheName}
                      </code>
                      ) solely to cache static application assets for offline
                      use.
                    </p>
                    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-[13.5px] text-[var(--muted)]">
                      <strong className="font-semibold text-[var(--ink)]">
                        Recommended practice:
                      </strong>{" "}
                      Use the one-click{" "}
                      <span className="font-mono text-xs text-[var(--accent)]">
                        Markdown (.zip)
                      </span>{" "}
                      or{" "}
                      <span className="font-mono text-xs text-[var(--ink)]">
                        JSON Backup
                      </span>{" "}
                      export in the workspace sidebar periodically to keep an
                      independent copy of your notes on your file system or
                      preferred drive.
                    </div>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 6: Export & Data Sovereignty */}
                  <section aria-labelledby="policy-sovereignty">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        06 · Export &amp; Data Sovereignty
                      </span>
                    </div>
                    <h2
                      id="policy-sovereignty"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Zero lock-in, open formats
                    </h2>
                    <p className="mb-4">
                      Every export runs locally inside your browser using the{" "}
                      <code className="font-mono text-[12.5px] text-[var(--ink)]">
                        Blob
                      </code>{" "}
                      and{" "}
                      <code className="font-mono text-[12.5px] text-[var(--ink)]">
                        JSZip
                      </code>{" "}
                      APIs with zero server involvement:
                    </p>
                    <ul className="space-y-2.5 pl-1 text-[14.5px]">
                      <li className="flex items-start gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>
                          <strong className="font-semibold text-[var(--ink)]">
                            Single-Note Markdown (.md):
                          </strong>{" "}
                          Download any individual note cleanly formatted as
                          plain Markdown, or copy it directly to your clipboard.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>
                          <strong className="font-semibold text-[var(--ink)]">
                            Full ZIP Vault Archive:
                          </strong>{" "}
                          Export all active notes grouped by folder as standard{" "}
                          <code className="font-mono text-xs">.md</code> files
                          with YAML frontmatter (
                          <code className="font-mono text-xs">
                            title, date, folder, tag, starred, pinned
                          </code>
                          ) compatible with Obsidian, Bear, or iA Writer,
                          bundled alongside{" "}
                          <code className="font-mono text-xs">
                            fold-vault-manifest.json
                          </code>{" "}
                          for 1-click full restore.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>
                          <strong className="font-semibold text-[var(--ink)]">
                            Full JSON Vault:
                          </strong>{" "}
                          Export your complete raw note array (
                          <code className="font-mono text-xs">
                            fold-notes-backup-YYYY-MM-DD.json
                          </code>
                          ) for direct programmatic portability or re-import
                          into Fold.
                        </span>
                      </li>
                    </ul>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 7: Third-Party Font & Asset Isolation */}
                  <section aria-labelledby="policy-assets">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <Type className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        07 · Third-Party Font &amp; Asset Isolation
                      </span>
                    </div>
                    <h2
                      id="policy-assets"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Self-hosted typography and zero external CDNs
                    </h2>
                    <p>
                      Fold&apos;s typefaces (
                      <strong className="font-semibold text-[var(--ink)]">
                        Instrument Sans
                      </strong>{" "}
                      and{" "}
                      <strong className="font-semibold text-[var(--ink)]">
                        JetBrains Mono
                      </strong>
                      ) are downloaded and self-hosted at build time via{" "}
                      <code className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--ink)]">
                        next/font/google
                      </code>
                      . When you open Fold, your browser makes zero runtime
                      requests to{" "}
                      <code className="font-mono text-[12.5px] text-[var(--ink)]">
                        fonts.googleapis.com
                      </code>
                      ,{" "}
                      <code className="font-mono text-[12.5px] text-[var(--ink)]">
                        fonts.gstatic.com
                      </code>
                      , or any third-party font CDN.
                    </p>
                  </section>

                  <hr className="border-t border-[var(--border)]" />

                  {/* Section 8: Contact & Inquiries */}
                  <section aria-labelledby="policy-contact">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                        08 · Contact &amp; Inquiries
                      </span>
                    </div>
                    <h2
                      id="policy-contact"
                      className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] mb-3 [text-wrap:balance]"
                    >
                      Direct line to the maker
                    </h2>
                    <p className="mb-5">
                      If you have questions about how Fold handles local
                      storage, browser persistence, or security, reach out
                      directly to{" "}
                      <strong className="font-semibold text-[var(--ink)]">
                        {SITE_CONFIG.author.name}
                      </strong>
                      :
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
                href="/terms"
                className="font-medium transition-colors hover:text-[var(--accent)] underline underline-offset-4"
              >
                Read Terms of Use →
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
