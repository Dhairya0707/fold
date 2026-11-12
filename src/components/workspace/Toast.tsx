"use client";

import React from "react";
import { useWorkspace } from "./WorkspaceContext";

export function Toast() {
  const { toast, hideToast } = useWorkspace();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute bottom-16 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-3 duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative flex items-center gap-3 rounded-[12px] border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] px-4 py-2.5 text-sm font-medium text-[var(--ink,#191712)] shadow-[0_12px_32px_-8px_rgba(45,36,22,0.22)] dark:border-white/15 dark:bg-[#1c1d18] dark:text-[#f4f0e6] dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7)]">
        {/* Specular line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
          aria-hidden="true"
        />

        <span>{toast.message}</span>

        {toast.actionLabel && toast.onAction && (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.();
              hideToast();
            }}
            className="rounded-[6px] bg-[var(--accent,#b8452c)] px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95"
          >
            {toast.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
