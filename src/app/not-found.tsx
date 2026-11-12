import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { IslandNavbar } from "@/components/IslandNavbar";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const metadata: Metadata = {
  title: "404: note not found",
  description:
    "The thought, link, or document you followed could not be found in Fold's index.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Subtle Film Grain & Spotlight */}
      <div className="studio-grain" aria-hidden="true" />
      <div className="studio-spotlight" aria-hidden="true" />

      <IslandNavbar />

      <main className="relative z-10 flex flex-1 items-center justify-center py-16 sm:py-24">
        <div className="shell">
          <div className="mx-auto max-w-[600px]">
            {/* Concentric Double-Frame Container */}
            <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-chassis)]">
              <div className="relative overflow-hidden rounded-[1.12rem] border border-[var(--border)] bg-[var(--double-frame-inner)] px-6 py-10 text-center sm:px-10 sm:py-12">
                <div className="specular-line" aria-hidden="true" />

                {/* Beveled Icon Tile */}
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                  <FileQuestion className="h-5 w-5" aria-hidden="true" />
                </div>

                {/* Editorial Status Kbd */}
                <div className="mb-4">
                  <kbd className="font-mono tabular-nums text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--accent)]">
                    404: note not found
                  </kbd>
                </div>

                {/* Display Heading */}
                <h1 className="text-[clamp(1.85rem,4vw,2.65rem)] font-bold leading-[1.12] tracking-[-0.03em] text-[var(--ink)] mb-4 [text-wrap:balance]">
                  This page does not exist in your vault
                </h1>

                {/* Explanatory Copy */}
                <p className="mx-auto mb-8 max-w-[44ch] text-[15px] leading-[1.65] text-[var(--muted)] [text-wrap:pretty]">
                  The thought, link, or document you followed could not be found
                  in Fold&apos;s index.
                </p>

                {/* Actions Cluster */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/" className="btn-primary-tactile">
                    ← Back to home
                  </Link>
                  <Link href="/app" className="btn-ghost-tactile">
                    Open workspace ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
