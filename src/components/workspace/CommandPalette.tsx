"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { audioHaptics } from "@/lib/audio-haptics";

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    notes,
    selectedId,
    selectNote,
    createNote,
    togglePin,
    toggleLock,
    duplicateNote,
    toggleSidebar,
    toggleTheme,
    toggleZenMode,
    exportVaultZip,
    exportBackup,
    setFolder,
    setStorageModalOpen,
  } = useWorkspace();

  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [commandPaletteOpen]);

  // Actions catalog
  const staticActions = useMemo(
    () => [
      {
        id: "new-note",
        title: "New note",
        subtitle: "Create a blank note in your current folder",
        shortcut: "N",
        category: "Actions",
        run: () => createNote(),
      },
      {
        id: "zen-mode",
        title: "Toggle full screen zen mode",
        subtitle: "Distraction-free blank canvas writing",
        shortcut: "⌘.",
        category: "View",
        run: () => toggleZenMode(),
      },
      {
        id: "toggle-sidebar",
        title: "Toggle sidebar",
        subtitle: "Show or hide folders and tags",
        shortcut: "⌘\\",
        category: "View",
        run: () => toggleSidebar(),
      },
      {
        id: "toggle-theme",
        title: "Toggle theme (light or dark)",
        subtitle: "Switch between warm light paper and dark ink",
        shortcut: "T",
        category: "Preferences",
        run: () => toggleTheme(),
      },
      ...(selectedId
        ? [
            {
              id: "pin-note",
              title: "Pin or unpin current note",
              subtitle: "Keep important notes anchored at the top",
              shortcut: "⌘P",
              category: "Note",
              run: () => togglePin(selectedId),
            },
            {
              id: "duplicate-note",
              title: "Duplicate current note",
              subtitle: "Create an editable copy of this note",
              shortcut: "⌘D",
              category: "Note",
              run: () => duplicateNote(selectedId),
            },
            {
              id: "lock-note",
              title: "Lock or unlock current note",
              subtitle: "Prevent accidental edits with read-only mode",
              shortcut: "⌥⇧L",
              category: "Note",
              run: () => toggleLock(selectedId),
            },
          ]
        : []),
      {
        id: "export-zip",
        title: "Export Markdown vault (.zip)",
        subtitle: "Download all notes as .md with YAML frontmatter",
        shortcut: "ZIP",
        category: "Data & Backup",
        run: () => exportVaultZip(),
      },
      {
        id: "export-json",
        title: "Export JSON vault backup",
        subtitle: "Complete raw backup for 1-click restore",
        shortcut: "JSON",
        category: "Data & Backup",
        run: () => exportBackup(),
      },
      {
        id: "storage-info",
        title: "Storage and persistence status",
        subtitle: "Inspect browser storage health and eviction protection",
        shortcut: "Info",
        category: "Data & Backup",
        run: () => setStorageModalOpen(true),
      },
      {
        id: "view-trash",
        title: "Open recently deleted (trash)",
        subtitle: "View and recover soft-deleted notes",
        category: "Navigation",
        run: () => setFolder("trash"),
      },
    ],
    [createNote, toggleZenMode, toggleSidebar, toggleTheme, selectedId, togglePin, duplicateNote, toggleLock, exportVaultZip, exportBackup, setFolder, setStorageModalOpen]
  );

  // Active notes for quick open
  const activeNotes = useMemo(
    () => notes.filter((n) => !n.deletedAt),
    [notes]
  );

  const matchedNotes = useMemo(() => {
    if (!search.trim()) return activeNotes.slice(0, 5);
    const q = search.toLowerCase().trim();
    return activeNotes
      .filter((n) => (n.title || "").toLowerCase().includes(q) || (n.tag || "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [activeNotes, search]);

  const matchedActions = useMemo(() => {
    if (!search.trim()) return staticActions;
    const q = search.toLowerCase().trim();
    return staticActions.filter(
      (a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );
  }, [staticActions, search]);

  const combinedItems = useMemo(() => {
    const list: Array<
      | { type: "note"; id: string; title: string; subtitle: string; run: () => void }
      | { type: "action"; id: string; title: string; subtitle: string; shortcut?: string; run: () => void }
    > = [];

    matchedNotes.forEach((n) => {
      list.push({
        type: "note",
        id: n.id,
        title: n.title || "Untitled note",
        subtitle: `Jump to note in ${n.folder || "Inbox"}`,
        run: () => {
          selectNote(n.id);
        },
      });
    });

    matchedActions.forEach((a) => {
      list.push({
        type: "action",
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        shortcut: a.shortcut,
        run: a.run,
      });
    });

    return list;
  }, [matchedNotes, matchedActions, selectNote]);

  // Handle keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, combinedItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedItems.length) % Math.max(1, combinedItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = combinedItems[selectedIndex];
      if (selected) {
        audioHaptics.trigger("tap");
        selected.run();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-40 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-[16px] border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] shadow-[0_24px_64px_-16px_rgba(45,36,22,0.35)] dark:border-white/15 dark:bg-[#1a1b16] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Specular catchlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
          aria-hidden="true"
        />

        {/* Input Header */}
        <div className="flex items-center gap-3 border-b border-[var(--line,rgba(25,23,18,0.08))] px-4 py-3 dark:border-white/5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-[var(--muted,#5f594c)] dark:text-neutral-400 shrink-0"
          >
            <circle cx="7.1" cy="7.1" r="4.35" stroke="currentColor" strokeWidth="1.5" />
            <path d="m10.4 10.4 2.6 2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or jump to a note…"
            className="flex-1 bg-transparent text-base sm:text-sm font-medium text-[var(--ink,#191712)] placeholder:text-[var(--muted,#5f594c)] outline-none dark:text-[#f4f0e6]"
          />
          <kbd className="rounded border border-[var(--line,rgba(25,23,18,0.15))] bg-[var(--surface-2,#f1ecdf)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted,#5f594c)] dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {combinedItems.length === 0 ? (
            <div className="p-8 text-center text-xs [text-wrap:pretty] text-[var(--muted,#5f594c)] dark:text-neutral-400">
              {search.trim()
                ? `No results for "${search.trim()}". Check spelling or clear search.`
                : "No notes or commands available."}
            </div>
          ) : (
            <div className="space-y-0.5">
              {combinedItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => {
                      audioHaptics.trigger("tap");
                      item.run();
                      setCommandPaletteOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-[9px] px-3 py-2 text-left transition ${
                      isSelected
                        ? "bg-[var(--selected,rgba(184,69,44,0.09))] text-[var(--accent,#b8452c)] dark:bg-[var(--accent,#b8452c)]/20"
                        : "text-[var(--ink,#191712)] hover:bg-[var(--hover,rgba(25,23,18,0.045))] dark:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0 text-[var(--muted,#5f594c)] dark:text-neutral-400">
                        {item.type === "note" ? (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M3 2.5h7l3 3v8H3z"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinejoin="round"
                            />
                            <path d="M10 2.5v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path
                              d="m8.5 2.5-5 6.5h4.5l-1 4.5 5-6.5H7.5z"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <div className="truncate">
                        <p className="truncate text-xs font-semibold leading-tight">{item.title}</p>
                        <p className="truncate text-[10px] text-[var(--muted,#5f594c)] dark:text-neutral-400">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    {item.type === "action" && item.shortcut && (
                      <kbd className="shrink-0 rounded border border-[var(--line,rgba(25,23,18,0.15))] bg-[var(--surface-2,#f1ecdf)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--muted,#5f594c)] dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-[var(--line,rgba(25,23,18,0.08))] px-3.5 py-2 text-[11px] text-[var(--muted,#5f594c)] dark:border-white/5 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> select</span>
            <span><kbd className="font-mono">Esc</kbd> close</span>
          </div>
          <span>Fold commands</span>
        </div>
      </div>
    </div>
  );
}
