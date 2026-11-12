"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { Tooltip } from "./CraftTooltip";
import { SortMode } from "@/types/note";

function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>?/gm, "");
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function formatRelativeTime(timestamp: number): string {
  const diff = Math.max(0, Date.now() - timestamp);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  const date = new Date(timestamp);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) {
    return <>{text || "Untitled"}</>;
  }

  const cleanQuery = query.trim();
  const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded-[2px] bg-[var(--highlight,#f0ddae)] px-0.5 text-inherit font-medium dark:bg-amber-500/30 dark:text-amber-200"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function buildSnippet(text: string, query: string, maxLength: number = 90): string {
  const plain = stripHtml(text).replace(/\s+/g, " ").trim();
  if (!plain) return "No additional text";
  if (!query.trim()) {
    return plain.length > maxLength ? plain.slice(0, maxLength) + "…" : plain;
  }

  const q = query.trim().toLowerCase();
  const idx = plain.toLowerCase().indexOf(q);
  if (idx === -1) {
    return plain.length > maxLength ? plain.slice(0, maxLength) + "…" : plain;
  }

  const start = Math.max(0, idx - 25);
  const end = Math.min(plain.length, start + maxLength);
  const snippet = plain.slice(start, end);
  return (start > 0 ? "…" : "") + snippet + (end < plain.length ? "…" : "");
}

export function NoteList({ isEmbedded = false }: { isEmbedded?: boolean }) {
  void isEmbedded;
  const {
    notes,
    selectedId,
    folder,
    tag,
    query,
    sort,
    zenMode,
    selectNote,
    createNote,
    deleteNote,
    toggleStar,
    setQuery,
    setSort,
    toggleSidebar,
    importFiles,
    exportBackup,
    restoreNote,
    emptyTrash,
    toggleCommandPalette,
  } = useWorkspace();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // `/` focuses note list search when not typing in a field or dialog
  // (⌘K belongs cleanly to Command Palette without stealing focus).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const isTextEntry =
        Boolean(active?.isContentEditable) ||
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        active?.tagName === "SELECT";

      if (
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        event.key === "/" &&
        !isTextEntry &&
        !document.querySelector('[role="dialog"]')
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (event.key === "Escape" && active === searchInputRef.current) {
        setQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setQuery]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Trash view handles deleted items exclusively (when no tag is active)
      if (folder === "trash" && !tag) {
        return Boolean(n.deletedAt);
      }
      // Non-trash views ignore deleted notes
      if (n.deletedAt) return false;

      // When a tag is active, it filters across all folders in the library
      if (tag) {
        const targetTag = tag.toLowerCase().replace(/^#/, "").trim();
        const noteTag = (n.tag || "").toLowerCase().replace(/^#/, "").trim();
        if (noteTag !== targetTag) return false;
      } else {
        if (folder === "starred" && !n.starred) return false;
        if (folder !== "all" && folder !== "starred" && n.folder !== folder) return false;
      }

      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchTitle = (n.title || "").toLowerCase().includes(q);
        const matchBody = stripHtml(n.body).toLowerCase().includes(q);
        const matchTag = (n.tag || "").toLowerCase().includes(q);
        return matchTitle || matchBody || matchTag;
      }

      return true;
    });
  }, [notes, folder, tag, query]);

  // Sort notes: pinned notes stick to top unless sorted by starred
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      // Pinned notes always top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sort) {
        case "newest":
          return b.updated - a.updated;
        case "oldest":
          return a.updated - b.updated;
        case "az":
          return (a.title || "Untitled").localeCompare(b.title || "Untitled");
        case "za":
          return (b.title || "Untitled").localeCompare(a.title || "Untitled");
        case "starred":
          if (a.starred && !b.starred) return -1;
          if (!a.starred && b.starred) return 1;
          return b.updated - a.updated;
        default:
          return b.updated - a.updated;
      }
    });
  }, [filteredNotes, sort]);

  // On desktop view switches, auto-select the first note if current note is not in view
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    if (sortedNotes.length === 0) return;
    if (!selectedId || !sortedNotes.some((n) => n.id === selectedId)) {
      selectNote(sortedNotes[0].id);
    }
  }, [folder, tag, sortedNotes, selectedId, selectNote]);

  // Drag and drop file handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await importFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await importFiles(e.target.files);
      e.target.value = "";
    }
  };

  if (zenMode) return null;

  const cleanTag = tag ? tag.toLowerCase().replace(/^#/, "").trim() : null;

  const viewTitle = cleanTag
    ? `#${cleanTag}`
    : folder === "all"
    ? "All notes"
    : folder === "starred"
    ? "Starred"
    : folder === "trash"
    ? "Trash"
    : folder;

  return (
    <section
      className={`relative flex h-full w-full flex-col border-r border-[var(--line,rgba(25,23,18,0.11))] bg-[var(--list,#f7f3ea)] ${
        selectedId ? "hidden md:flex" : "flex"
      } ${
        isEmbedded ? "md:w-[275px] lg:w-[290px]" : "md:w-[300px] lg:w-[340px]"
      } shrink-0 text-left dark:border-white/10 dark:bg-[#1a1b16]`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="Notes list"
    >
      {/* Drop Zone Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center border-2 border-dashed border-[var(--accent,#b8452c)] bg-[var(--surface,#fffdf8)]/90 backdrop-blur-xs dark:bg-[#1a1b16]/90">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="mb-2 text-[var(--accent,#b8452c)]"
          >
            <path
              d="M12 4v12M7 11l5 5 5-5M4 18h16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm font-semibold text-[var(--ink,#191712)] dark:text-[#f4f0e6]">
            Drop Markdown or JSON file to import
          </p>
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-[var(--line,rgba(25,23,18,0.08))] p-3 dark:border-white/5">
        <div className="flex items-center justify-between pb-2.5">
          <div className="flex items-center gap-2">
            <Tooltip label="Toggle sidebar" shortcut="⌘\">
              <button
                type="button"
                onClick={toggleSidebar}
                className="hit-target flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
                aria-label="Toggle sidebar"
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="2.6"
                    y="3.6"
                    width="14.8"
                    height="12.8"
                    rx="2.8"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M7.4 3.8v12.4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </Tooltip>

            <div>
              <h1 className="text-sm font-semibold text-[var(--ink,#191712)] dark:text-[#f4f0e6]">
                {viewTitle}
              </h1>
              <p className="text-[11px] tabular-nums text-[var(--muted,#5f594c)] dark:text-neutral-400">
                {sortedNotes.length} {sortedNotes.length === 1 ? "note" : "notes"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Sort Pill */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                aria-label="Sort notes"
                className="h-7 cursor-pointer appearance-none rounded-md border border-[var(--line,rgba(25,23,18,0.12))] bg-[var(--surface,#fffdf8)] py-1 pr-6 pl-2 text-[11px] font-medium text-[var(--ink,#191712)] shadow-2xs outline-hidden dark:border-white/10 dark:bg-[#20211b] dark:text-neutral-300"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="az">A–Z</option>
                <option value="za">Z–A</option>
                <option value="starred">Starred</option>
              </select>
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[var(--muted,#5f594c)]"
              >
                <path
                  d="m3 4.5 3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Empty Trash Button (when in Trash view) */}
            {folder === "trash" && sortedNotes.length > 0 && (
              <button
                type="button"
                onClick={emptyTrash}
                className="hit-target h-7 rounded-md border border-[var(--danger,#a53c27)]/30 bg-[var(--danger,#a53c27)]/10 px-2 text-[11px] font-semibold text-[var(--danger,#a53c27)] hover:bg-[var(--danger,#a53c27)] hover:text-white transition"
              >
                Empty trash
              </button>
            )}

            {/* Import & Export Buttons (Available in full workspace) */}
            {!isEmbedded && (
              <>
                <Tooltip label="Import notes (.md, .txt, .json)">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="hit-target flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
                    aria-label="Import files"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 10V2.75M5.25 5.5 8 2.75 10.75 5.5M3 11.5v1.25c0 .4.35.75.75.75h8.5c.4 0 .75-.35.75-.75V11.5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </Tooltip>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt,.json"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <Tooltip label="Export all notes backup (JSON)">
                  <button
                    type="button"
                    onClick={exportBackup}
                    className="hit-target flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
                    aria-label="Export backup"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 2.5v7.25M5.25 7.25 8 10l2.75-2.75M3 11.5v1.25c0 .4.35.75.75.75h8.5c.4 0 .75-.35.75-.75V11.5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </Tooltip>
              </>
            )}

            {/* New Note Button */}
            <Tooltip label="New note" shortcut="N">
              <button
                type="button"
                onClick={() => createNote()}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--accent,#b8452c)] dark:text-neutral-400"
                aria-label="New note"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative">
          <label className="relative flex w-full items-center">
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              className="pointer-events-none absolute left-2.5 text-[var(--muted,#5f594c)] dark:text-neutral-400"
            >
              <circle cx="7.1" cy="7.1" r="4.35" stroke="currentColor" strokeWidth="1.4" />
              <path d="m10.4 10.4 2.6 2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes or content…"
              aria-label="Search notes"
              className="h-8 w-full rounded-md border border-[var(--line,rgba(25,23,18,0.1))] bg-[var(--surface,#fffdf8)] pr-12 pl-8.5 text-base md:text-xs text-[var(--ink,#191712)] shadow-2xs outline-hidden placeholder:text-[var(--muted,#5f594c)] focus:border-[var(--accent,#b8452c)] dark:border-white/10 dark:bg-[#20211b] dark:text-[#f4f0e6]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 text-xs text-[var(--muted,#5f594c)] hover:text-[var(--ink,#191712)] dark:text-neutral-400"
                aria-label="Clear search"
                title="Clear search (Esc)"
              >
                ✕
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleCommandPalette}
                className="absolute right-2 inline-flex h-4 items-center rounded border border-[var(--line,rgba(25,23,18,0.15))] bg-[var(--surface-2,#f1ecdf)] px-1 font-mono text-[9px] text-[var(--muted,#5f594c)] hover:border-[var(--accent,#b8452c)] dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                ⌘K
              </button>
            )}
          </label>
        </div>
      </header>

      {/* Note Cards List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {sortedNotes.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center p-4 text-center">
            <p className="text-xs font-medium text-[var(--muted,#5f594c)] [text-wrap:pretty] dark:text-neutral-400">
              {query
                ? `No notes matching "${query}". Check spelling or clear search.`
                : folder === "trash"
                ? "Deleted notes will appear here."
                : cleanTag
                ? `Notes tagged #${cleanTag} will appear here.`
                : folder !== "all" && folder !== "starred"
                ? `Notes in "${viewTitle}" will appear here.`
                : "Notes in this view will appear here."}
            </p>
            {(query || folder !== "trash") && (
              <button
                type="button"
                onClick={() => (query ? setQuery("") : createNote())}
                className="hit-target mt-2 text-xs font-semibold text-[var(--accent,#b8452c)] hover:underline"
              >
                {query ? "Clear search" : "Create a note"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {sortedNotes.map((note) => {
              const isSelected = note.id === selectedId;
              const snippet = buildSnippet(note.body, query);

              return (
                <div
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectNote(note.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-current={isSelected ? "true" : undefined}
                  className={`group relative flex cursor-pointer flex-col rounded-[10px] p-2.5 transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent,#b8452c)] ${
                    isSelected
                      ? "border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] shadow-[0_2px_8px_-2px_rgba(45,36,22,0.1)] dark:border-white/15 dark:bg-[#22241d] dark:shadow-none"
                      : "border border-transparent hover:border-[var(--line,rgba(25,23,18,0.08))] hover:bg-[var(--surface,#fffdf8)]/60 dark:hover:border-white/5 dark:hover:bg-[#1e1f19]"
                  }`}
                >
                  {/* Top card catchlight if selected */}
                  {isSelected && (
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
                      aria-hidden="true"
                    />
                  )}

                  {/* Card Title & Badges */}
                  <div className="mb-1 flex items-start justify-between gap-1.5">
                    <h3 className="line-clamp-1 text-[13px] leading-[1.35] font-semibold text-[var(--ink,#191712)] dark:text-[#f4f0e6]">
                      <HighlightedText text={note.title || "Untitled"} query={query} />
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {note.locked && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-amber-600 dark:text-amber-400"
                          aria-label="Locked"
                        >
                          <title>Locked (Read-only)</title>
                          <rect x="3.5" y="6.5" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M5.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                      )}
                      {note.pinned && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-[var(--accent,#b8452c)]"
                          aria-label="Pinned"
                        >
                          <title>Pinned</title>
                          <path
                            d="M9.5 2.5 13.5 6.5M10.5 4.5l-2 2-3.5-.5-2.5 2.5 4 4 2.5-2.5-.5-3.5 2-2M4.5 11.5 2 14"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {note.starred && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="text-[var(--star-gold,#d97706)]"
                          aria-label="Starred"
                        >
                          <title>Starred</title>
                          <path
                            d="m8 2.4 1.66 3.36 3.71.54-2.69 2.62.64 3.7L8 10.87l-3.32 1.75.64-3.7-2.69-2.62 3.71-.54z"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Snippet Preview */}
                  <p className="mb-2 line-clamp-2 text-xs text-[var(--muted,#5f594c)] leading-normal dark:text-neutral-400">
                    <HighlightedText text={snippet} query={query} />
                  </p>

                  {/* Card Footer Meta */}
                  <div className="flex items-center justify-between text-[11px] text-[var(--muted,#5f594c)] pt-0.5 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] tabular-nums">
                        {formatRelativeTime(note.updated)}
                      </span>
                      {note.folder && folder === "all" && (
                        <span className="rounded bg-[var(--surface-3,#e7e0d1)] px-1 py-0.2 text-[10px] font-medium text-[var(--ink-2,#3a352b)] dark:bg-white/10 dark:text-neutral-300">
                          {note.folder}
                        </span>
                      )}
                    </div>

                    {/* Quick Card Hover Actions: Star & Delete or Restore */}
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      {folder === "trash" ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreNote(note.id);
                            }}
                            className="hit-target flex h-5 items-center gap-1 rounded bg-[var(--accent,#b8452c)]/10 px-1.5 text-[10px] font-semibold text-[var(--accent,#b8452c)] hover:bg-[var(--accent,#b8452c)] hover:text-white"
                            title="Restore note from trash"
                            aria-label="Restore note from trash"
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="hit-target flex h-5 w-5 items-center justify-center rounded text-[var(--danger,#a53c27)] hover:bg-[var(--danger,#a53c27)]/10"
                            title="Permanently delete"
                            aria-label="Permanently delete note"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(note.id);
                            }}
                            className="hit-target flex h-5 w-5 items-center justify-center rounded text-[var(--muted,#5f594c)] hover:text-[var(--star-gold,#d97706)] hover:scale-120 active:scale-90 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            title={note.starred ? "Remove star" : "Star note"}
                            aria-label={note.starred ? "Remove star" : "Star note"}
                          >
                            <svg width="11" height="11" viewBox="0 0 16 16" fill={note.starred ? "currentColor" : "none"}>
                              <path
                                d="m8 2.4 1.66 3.36 3.71.54-2.69 2.62.64 3.7L8 10.87l-3.32 1.75.64-3.7-2.69-2.62 3.71-.54z"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="hit-target flex h-5 w-5 items-center justify-center rounded text-[var(--muted,#5f594c)] hover:text-[var(--danger,#a53c27)] hover:scale-115 active:scale-90 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            title="Move to trash"
                            aria-label="Move to trash"
                          >
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M3.25 4.75h9.5M6.25 4.75V3.5c0-.41.34-.75.75-.75h2c.41 0 .75.34.75.75v1.25M4.5 4.75l.5 8.25c.02.41.36.75.77.75h4.46c.41 0 .75-.34.77-.75l.5-8.25"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
