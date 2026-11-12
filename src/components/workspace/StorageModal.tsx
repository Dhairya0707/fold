"use client";

import React, { useState } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { audioHaptics } from "@/lib/audio-haptics";

export function StorageModal() {
  const {
    storageModalOpen,
    setStorageModalOpen,
    stats,
    notes,
    exportVaultZip,
    exportBackup,
    requestStoragePersistence,
  } = useWorkspace();

  const [requesting, setRequesting] = useState(false);

  if (!storageModalOpen) return null;

  const activeNotesCount = notes.filter((n) => !n.deletedAt).length;
  const trashNotesCount = notes.filter((n) => Boolean(n.deletedAt)).length;

  const handlePersist = async () => {
    setRequesting(true);
    await requestStoragePersistence();
    setRequesting(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="storage-modal-title"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setStorageModalOpen(false)}
    >
      <div
        className="relative w-full max-w-[480px] overflow-hidden rounded-[18px] border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] p-6 shadow-[0_24px_64px_-16px_rgba(45,36,22,0.35)] dark:border-white/15 dark:bg-[#1a1b16] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Specular catchlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line,rgba(25,23,18,0.08))] dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--accent,#b8452c)]/10 text-[var(--accent,#b8452c)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2.5" y="3.5" width="11" height="9" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5.5 6.5h5M5.5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <h2 id="storage-modal-title" className="text-base font-semibold [text-wrap:balance] text-[var(--ink,#191712)] dark:text-[#f4f0e6]">
                Storage and data trust
              </h2>
              <p className="text-[11px] text-[var(--muted,#5f594c)] dark:text-neutral-400">
                100% private, on-device IndexedDB storage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStorageModalOpen(false)}
            className="hit-target flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Storage Health Metrics */}
        <div className="my-5 space-y-3.5">
          <div className="rounded-[12px] border border-[var(--line,rgba(25,23,18,0.1))] bg-[var(--surface-2,#f1ecdf)]/60 p-3.5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-[var(--ink,#191712)] dark:text-neutral-200">
                IndexedDB engine
              </span>
              <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--accent,#b8452c)]">
                {stats.formattedSize}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] tabular-nums text-[var(--muted,#5f594c)] dark:text-neutral-400">
              <span>{activeNotesCount} {activeNotesCount === 1 ? "active note" : "active notes"}{trashNotesCount > 0 ? `, ${trashNotesCount} in trash` : ""}</span>
              <span>Last backup: {stats.lastBackupDate || "Never"}</span>
            </div>
          </div>

          {/* Browser Persistence Guarantee */}
          <div className="flex items-start gap-3 rounded-[12px] border border-[var(--line,rgba(25,23,18,0.1))] p-3.5 dark:border-white/10">
            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${stats.isPersisted ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
              {stats.isPersisted ? "✓" : "!"}
            </span>
            <div className="flex-1 text-xs">
              <p className="font-semibold text-[var(--ink,#191712)] dark:text-[#f4f0e6]">
                {stats.isPersisted
                  ? "Persistent storage active"
                  : "Protect notes from browser cleanup"}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--muted,#5f594c)] dark:text-neutral-400 leading-relaxed">
                {stats.isPersisted
                  ? "The browser has committed not to purge your notes even when disk space is tight."
                  : "Safari or Chrome may clear site data after long inactivity. Requesting persistence locks your notes into safe storage."}
              </p>
              {!stats.isPersisted && (
                <button
                  type="button"
                  onClick={handlePersist}
                  disabled={requesting}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--accent,#b8452c)] bg-[var(--accent,#b8452c)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--accent,#b8452c)] transition hover:bg-[var(--accent,#b8452c)] hover:text-white"
                >
                  {requesting ? "Requesting…" : "Enable persistent storage"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vault Export Buttons */}
        <div className="space-y-2 pt-2 border-t border-[var(--line,rgba(25,23,18,0.08))] dark:border-white/5">
          <p className="text-xs font-medium text-[var(--faint,#595245)] dark:text-neutral-400">
            Export your vault
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                audioHaptics.trigger("tap");
                exportVaultZip();
              }}
              className="flex items-center justify-center gap-2 rounded-[9px] border border-[var(--accent,#b8452c)] bg-[var(--accent,#b8452c)] px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 2.5v7.25M5.25 7.25 8 10l2.75-2.75M3 11.5v1.25c0 .4.35.75.75.75h8.5c.4 0 .75-.35.75-.75V11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Export Markdown (.zip)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioHaptics.trigger("tap");
                exportBackup();
              }}
              className="flex items-center justify-center gap-2 rounded-[9px] border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface-2,#f1ecdf)] px-3 py-2 text-xs font-semibold text-[var(--ink,#191712)] transition hover:bg-[var(--surface-3,#e7e0d1)] active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-[#f4f0e6]"
            >
              <span>Export JSON backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
