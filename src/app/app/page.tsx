"use client";

import React from "react";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function AppPage() {
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-[var(--editor,#fbf8f0)] dark:bg-[#12130f]">
        <div className="flex items-center gap-2 text-xs text-[var(--muted,#5f594c)]">
          <span className="h-2 w-2 rounded-full bg-[var(--accent,#b8452c)] animate-pulse" />
          <span>Opening Fold…</span>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <WorkspaceLayout isEmbedded={false} />
    </WorkspaceProvider>
  );
}
