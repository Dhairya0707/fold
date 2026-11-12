"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Download, Home, RotateCcw } from "lucide-react";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const EMERGENCY_STORAGE_KEY = "fold.notes.v1";

export default function AppWorkspaceError({ error, reset }: AppErrorProps) {
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.error("Fold workspace boundary caught error:", {
        name: error?.name || "Error",
        digest: error?.digest ?? null,
      });
    } else {
      console.error("Fold workspace boundary caught error:", error);
    }
  }, [error]);

  const digest =
    error && typeof error === "object" && "digest" in error && error.digest
      ? String(error.digest)
      : null;

  const handleDownloadEmergencyBackup = () => {
    try {
      const raw = window.localStorage.getItem(EMERGENCY_STORAGE_KEY);
      if (!raw) {
        setBackupMessage("No local backup mirror was found in browser storage.");
        return;
      }

      let formatted = raw;
      try {
        formatted = JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        // Fall back to exporting raw string if JSON formatting fails.
      }

      const blob = new Blob([formatted], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fold-emergency-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMessage("Emergency JSON backup downloaded.");
    } catch {
      setBackupMessage("Unable to read local backup from browser storage.");
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--bg)] px-4 py-12 text-[var(--ink)]">
      <div className="w-full max-w-[540px] rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-chassis)]">
        <div className="relative overflow-hidden rounded-[1.12rem] border border-[var(--border)] bg-[var(--double-frame-inner)] px-6 py-9 text-center sm:px-9 sm:py-11">
          <div className="specular-line" aria-hidden="true" />

          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--shadow-bezel)]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <kbd className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 font-mono text-xs text-[var(--accent)]">
              Workspace recovery
            </kbd>
            {digest ? (
              <span className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 font-mono text-[11px] text-[var(--muted)]">
                digest: {digest}
              </span>
            ) : null}
          </div>

          <h1 className="mb-3 text-2xl font-bold tracking-[-0.025em] text-[var(--ink)] sm:text-[1.75rem]">
            Workspace hit a snag
          </h1>

          <p className="mx-auto mb-7 max-w-[44ch] text-sm leading-relaxed text-[var(--muted)]">
            The editor stopped rendering, but your notes remain saved locally in
            IndexedDB. Retry loading the workspace or export an emergency JSON
            backup right now.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="btn-primary-tactile"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Retry</span>
            </button>

            <Link href="/" className="btn-ghost-tactile">
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Go home</span>
            </Link>
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={handleDownloadEmergencyBackup}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3.5 py-2 text-xs font-medium text-[var(--ink)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--accent)]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Download emergency JSON backup</span>
            </button>

            {backupMessage ? (
              <p className="mt-2.5 text-xs text-[var(--muted)]" role="status">
                {backupMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
