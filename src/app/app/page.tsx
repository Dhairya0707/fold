"use client";

import React from "react";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function AppPage() {
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading Fold workspace"
        className="flex h-dvh w-full overflow-hidden bg-[var(--editor,#fbf8f0)] dark:bg-[#12130f]"
      >
        {/* Sidebar skeleton (224px) */}
        <aside className="hidden md:flex md:w-[224px] shrink-0 flex-col border-r border-[var(--line,rgba(25,23,18,0.11))] bg-[var(--sidebar,#ece7da)] p-3 dark:border-white/10 dark:bg-[#161713]">
          <div className="mb-4 flex items-center gap-2 px-1 py-1">
            <div className="h-6 w-6 rounded-[7px] bg-[var(--line,rgba(25,23,18,0.12))] dark:bg-white/10 animate-pulse" />
            <div className="h-4 w-20 rounded bg-[var(--line,rgba(25,23,18,0.12))] dark:bg-white/10 animate-pulse" />
          </div>
          <div className="mb-4 h-8 w-full rounded-[9px] bg-[var(--surface,#fffdf8)]/80 border border-[var(--line,rgba(25,23,18,0.08))] dark:border-white/10 dark:bg-[#1f201a] animate-pulse" />
          <div className="space-y-2 px-1">
            <div className="h-3 w-12 rounded bg-[var(--line,rgba(25,23,18,0.1))] dark:bg-white/10 animate-pulse" />
            <div className="h-7 w-full rounded-lg bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
            <div className="h-7 w-full rounded-lg bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
            <div className="h-7 w-3/4 rounded-lg bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
          </div>
          <div className="mt-auto h-16 w-full rounded-[12px] border border-[var(--line,rgba(25,23,18,0.08))] bg-[var(--surface-2,#f1ecdf)] dark:border-white/10 dark:bg-[#1c1d18] animate-pulse" />
        </aside>

        {/* Note list skeleton (290px) */}
        <section className="flex w-full md:w-[290px] shrink-0 flex-col border-r border-[var(--line,rgba(25,23,18,0.11))] bg-[var(--list,#f7f3ea)] dark:border-white/10 dark:bg-[#1a1b16]">
          <div className="border-b border-[var(--line,rgba(25,23,18,0.08))] p-3 dark:border-white/5">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="h-5 w-24 rounded bg-[var(--line,rgba(25,23,18,0.12))] dark:bg-white/10 animate-pulse" />
              <div className="h-6 w-16 rounded bg-[var(--line,rgba(25,23,18,0.1))] dark:bg-white/10 animate-pulse" />
            </div>
            <div className="h-8 w-full rounded-md bg-[var(--surface,#fffdf8)] dark:bg-[#20211b] animate-pulse" />
          </div>
          <div className="space-y-2 p-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-[10px] border border-[var(--line,rgba(25,23,18,0.06))] bg-[var(--surface,#fffdf8)]/60 p-3 dark:border-white/5 dark:bg-[#22241d]/60"
              >
                <div className="mb-2 h-3.5 w-2/3 rounded bg-[var(--line,rgba(25,23,18,0.12))] dark:bg-white/10 animate-pulse" />
                <div className="mb-1.5 h-2.5 w-full rounded bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
                <div className="h-2.5 w-4/5 rounded bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Editor flex area skeleton */}
        <section className="hidden md:flex flex-1 min-w-0 flex-col bg-[var(--editor,#fbf8f0)] dark:bg-[#12130f]">
          <div className="flex items-center justify-between border-b border-[var(--line,rgba(25,23,18,0.08))] px-4 py-2.5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-20 rounded-md bg-[var(--line,rgba(25,23,18,0.1))] dark:bg-white/10 animate-pulse" />
              <div className="h-7 w-14 rounded-md bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-7 w-7 rounded-md bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
              <div className="h-7 w-7 rounded-md bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
              <div className="h-7 w-7 rounded-md bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 px-12 pt-8">
            <div className="mx-auto max-w-[65ch] space-y-4">
              <div className="h-8 w-2/5 rounded bg-[var(--line,rgba(25,23,18,0.12))] dark:bg-white/10 animate-pulse" />
              <div className="space-y-2.5 pt-2">
                <div className="h-3.5 w-full rounded bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
                <div className="h-3.5 w-11/12 rounded bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
                <div className="h-3.5 w-4/5 rounded bg-[var(--line,rgba(25,23,18,0.08))] dark:bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <WorkspaceLayout isEmbedded={false} />
    </WorkspaceProvider>
  );
}
