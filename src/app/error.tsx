"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { IslandNavbar } from "@/components/IslandNavbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { audioHaptics } from "@/lib/audio-haptics";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.error("Fold boundary caught error:", {
        name: error?.name || "Error",
        digest: error?.digest ?? null,
      });
    } else {
      console.error("Fold boundary caught error:", error);
    }
  }, [error]);

  const digest =
    error && typeof error === "object" && "digest" in error && error.digest
      ? String(error.digest)
      : null;

  const handleRetry = () => {
    audioHaptics.trigger("tap");
    retry();
  };

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

                {/* Beveled Error Icon Tile */}
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </div>

                {/* Status Badge */}
                <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                  <kbd className="font-mono text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--accent)]">
                    Runtime recovery
                  </kbd>
                  {digest ? (
                    <span className="font-mono text-[11px] px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)]">
                      digest: {digest}
                    </span>
                  ) : null}
                </div>

                {/* Display Heading */}
                <h1 className="text-[clamp(1.75rem,3.8vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.03em] text-[var(--ink)] mb-4 [text-wrap:balance]">
                  Something interrupted this view
                </h1>

                {/* Reassuring Copy */}
                <p className="mx-auto mb-8 max-w-[46ch] text-[15px] leading-[1.65] text-[var(--muted)] [text-wrap:pretty]">
                  Something stopped this screen while rendering. Your notes in
                  IndexedDB remain safely stored on this device.
                </p>

                {/* Actions Cluster */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="btn-primary-tactile"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Try again</span>
                  </button>

                  <Link href="/" className="btn-ghost-tactile">
                    ← Back to home
                  </Link>

                  <Link
                    href="/app"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                  >
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
