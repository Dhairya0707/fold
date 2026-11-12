"use client";

import React from "react";
import { useWorkspace } from "./WorkspaceContext";
import { Sidebar } from "./Sidebar";
import { NoteList } from "./NoteList";
import { NoteEditor } from "./NoteEditor";
import { Toast } from "./Toast";
import { CommandPalette } from "./CommandPalette";
import { StorageModal } from "./StorageModal";

export function WorkspaceLayout({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const { zenMode } = useWorkspace();

  if (isEmbedded) {
    return (
      <div
        className={
          zenMode
            ? "fixed inset-0 z-40 flex h-dvh w-full overflow-hidden text-left bg-[var(--editor,#fbf8f0)] dark:bg-[#12130f]"
            : "relative flex h-full w-full overflow-hidden text-left bg-[var(--surface-card,#fffdf8)] dark:bg-[#12130f]"
        }
      >
        {/* Subtle Analog Film Grain when in full screen */}
        {zenMode && (
          <div className="studio-grain pointer-events-none" aria-hidden="true" />
        )}

        {/* 3 Panes */}
        <Sidebar isEmbedded={isEmbedded && !zenMode} />
        <NoteList isEmbedded={isEmbedded && !zenMode} />
        <NoteEditor isEmbedded={isEmbedded && !zenMode} />

        <Toast />
        <CommandPalette />
        <StorageModal />
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh w-full overflow-hidden text-left bg-[var(--editor,#fbf8f0)] dark:bg-[#12130f]">
      {/* Subtle Analog Film Grain */}
      <div className="studio-grain pointer-events-none" aria-hidden="true" />

      {/* 3 macOS Panes */}
      <Sidebar isEmbedded={false} />
      <NoteList isEmbedded={false} />
      <NoteEditor isEmbedded={false} />

      <Toast />
      <CommandPalette />
      <StorageModal />
    </div>
  );
}
