"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { audioHaptics } from "@/lib/audio-haptics";
import { useTheme } from "@/lib/use-theme";
import { Tooltip } from "@/components/workspace/CraftTooltip";
import { FormattingToolsToggle } from "@/components/workspace/FormattingToolsToggle";
import {
  FormattingFloatingDock,
  TOOLBAR_DIVIDER_CLASS,
} from "@/components/workspace/FormattingToolbarPill";

interface DemoTask {
  id: string;
  text: string;
  checked: boolean;
}

interface DemoNote {
  id: string;
  title: string;
  folder: string;
  tag: string;
  updated: string;
  starred: boolean;
  pinned: boolean;
  intro: string;
  highlight?: string;
  tasks?: DemoTask[];
  quote?: string;
  outro?: string;
}

const INITIAL_DEMO_NOTES: DemoNote[] = [
  {
    id: "seed-welcome",
    title: "Welcome to Fold: private, local, quiet",
    folder: "Inbox",
    tag: "welcome",
    updated: "Just now",
    starred: true,
    pinned: true,
    intro:
      "Fold is your calm, private scratchpad. Notes live exclusively on this device with zero tracking, zero cloud dependencies, and zero accounts.",
    highlight:
      "What you write here belongs entirely to you. Highlighting any text reveals tactile micro-formatting tools.",
    tasks: [
      { id: "w1", text: "⌘K opens the command palette", checked: true },
      { id: "w2", text: "N or ⌥⇧N creates a new note", checked: true },
      { id: "w3", text: "⌘S confirms local persistence", checked: true },
      { id: "w4", text: "⌘. enters full-screen zen mode", checked: false },
      { id: "w5", text: "⌘P pins a note to the top", checked: false },
    ],
    outro:
      "Your notes persist reliably in this browser engine. Download your full vault as Markdown (.zip) or JSON anytime.",
  },
  {
    id: "seed-craft",
    title: "Hardware-grade craft notes",
    folder: "Ideas",
    tag: "craft",
    updated: "15m ago",
    starred: true,
    pinned: false,
    intro:
      "Fold is built around concentric double-framing, specular top reflections, and pure local persistence.",
    highlight: "No accounts, no cloud sync, no tracking. Every thought belongs only to this device.",
    tasks: [
      { id: "c1", text: "Concentric radius law: R_inner = R_outer - Padding", checked: true },
      { id: "c2", text: "Directional specular catchlights on top edges", checked: true },
      { id: "c3", text: "IndexedDB asynchronous local-first persistence", checked: false },
      { id: "c4", text: "Analog film-grain depth and calm typography", checked: false },
    ],
    outro: "Designed to feel like a thoughtfully balanced physical instrument.",
  },
  {
    id: "seed-remember",
    title: "Things I want to remember",
    folder: "Journal",
    tag: "personal",
    updated: "45m ago",
    starred: false,
    pinned: false,
    intro:
      "There is a version of this week where I do less and it still works. I want to remember that.",
    highlight: "The quiet part is the point. Not every open tab deserves an immediate reply.",
    tasks: [
      { id: "r1", text: "Book the train for Friday morning", checked: true },
      { id: "r2", text: "Call the dentist before 5:00 PM", checked: true },
      { id: "r3", text: "Read the studio lease renewal terms", checked: false },
    ],
  },
  {
    id: "seed-architecture",
    title: "Studio architecture, Doblique & Wensity",
    folder: "Ideas",
    tag: "design",
    updated: "2h ago",
    starred: false,
    pinned: false,
    intro:
      "A workspace should feel like a fine physical instrument: tactile weight, subtle elevation, and responsive deceleration physics.",
    quote: "Make the product the first thing a person can touch.",
    outro:
      "Eliminate unnecessary dashboards and artificial AI chatter. Focus on the words and clarity.",
  },
  {
    id: "seed-renewal",
    title: "Studio lease, 2026 renewal",
    folder: "Work",
    tag: "admin",
    updated: "1d ago",
    starred: false,
    pinned: false,
    intro:
      "Renewal window opens 1 June. Ask about storage unit expansion and dedicated fiber connection.",
    tasks: [
      { id: "l1", text: "Find the signed lease copy", checked: false },
      { id: "l2", text: "Email the building manager", checked: true },
    ],
    outro: "Verify building insurance coverage and parking allotment before signing.",
  },
];

export function FoldWorkspace() {
  const [theme, setTheme] = useTheme();
  const [notes, setNotes] = useState<DemoNote[]>(INITIAL_DEMO_NOTES);
  const [selectedId, setSelectedId] = useState<string>("seed-welcome");
  const [folder, setFolder] = useState<string>("all");
  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<"newest" | "oldest" | "az">("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTools, setShowTools] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set(["b", "task"]));

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedNote = useMemo(() => {
    return notes.find((n) => n.id === selectedId) || notes[0];
  }, [notes, selectedId]);

  // Dynamic word count & reading time
  const stats = useMemo(() => {
    if (!selectedNote) return { words: 0, readTime: "1 min read" };
    const taskText = (selectedNote.tasks || []).map((t) => t.text).join(" ");
    const fullText = `${selectedNote.title} ${selectedNote.intro} ${selectedNote.highlight || ""} ${taskText} ${selectedNote.quote || ""} ${selectedNote.outro || ""}`;
    const words = fullText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return {
      words,
      readTime: `${minutes} min read`,
    };
  }, [selectedNote]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    const matched = notes.filter((n) => {
      if (folder === "starred" && !n.starred) return false;
      if (folder !== "all" && folder !== "starred" && n.folder !== folder) return false;
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchIntro = n.intro.toLowerCase().includes(q);
        const matchTag = n.tag.toLowerCase().includes(q);
        return matchTitle || matchIntro || matchTag;
      }
      return true;
    });

    if (sort === "oldest") {
      return [...matched].reverse();
    }
    if (sort === "az") {
      return [...matched].sort((a, b) => a.title.localeCompare(b.title));
    }
    return matched;
  }, [notes, folder, query, sort]);

  // Interactive task toggle with sound
  const handleToggleTask = (noteId: string, taskId: string) => {
    audioHaptics.trigger("tap");
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          tasks: (n.tasks || []).map((t) => (t.id === taskId ? { ...t, checked: !t.checked } : t)),
        };
      })
    );
  };

  // Star toggle
  const handleToggleStar = (noteId: string) => {
    audioHaptics.trigger("tap");
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, starred: !n.starred } : n))
    );
  };

  // Pin toggle
  const handleTogglePin = (noteId: string) => {
    audioHaptics.trigger("tap");
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Formatting tool toggle
  const handleToggleTool = (tool: string) => {
    audioHaptics.trigger("format");
    setActiveTools((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) next.delete(tool);
      else next.add(tool);
      return next;
    });
  };

  // Tool button class matching actual app pad (FormattingToolbarPill)
  const btnClass = (active: boolean, disabled: boolean = false) =>
    `hit-target flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-xs transition-all duration-120 ease-[cubic-bezier(0.16,1,0.3,1)] ${
      disabled
        ? "opacity-30 cursor-not-allowed text-[var(--muted,#5f594c)] dark:text-[#928c7d]"
        : active
        ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)] font-semibold shadow-2xs active:scale-90 dark:bg-[var(--accent,#b8452c)]/25 dark:text-[#ff8a65]"
        : "text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] active:scale-90 dark:text-neutral-400 dark:hover:text-[#f4f0e6]"
    }`;

  // Title update
  const handleTitleChange = (newTitle: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === selectedId ? { ...n, title: newTitle } : n))
    );
  };

  // Auto-resize title
  useEffect(() => {
    const el = titleTextareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [selectedNote?.title]);

  // New note creation in demo
  const handleCreateDemoNote = () => {
    audioHaptics.trigger("tap");
    const newId = `note-${Date.now().toString(36)}`;
    const newNote: DemoNote = {
      id: newId,
      title: "Untitled thought",
      folder: folder !== "all" && folder !== "starred" ? folder : "Inbox",
      tag: "draft",
      updated: "Just now",
      starred: false,
      pinned: false,
      intro: "Start writing your calm thought here…",
      tasks: [
        { id: `t1-${Date.now()}`, text: "First reflection or task item", checked: false },
      ],
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newId);
  };

  // Browser-safe shortcuts scoped directly to the embedded demo container
  const handleDemoKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isCmd = e.metaKey || e.ctrlKey;
    if (e.key === "Escape" && zenMode) {
      e.preventDefault();
      setZenMode(false);
      return;
    }
    if (!isCmd || e.shiftKey || e.altKey) return;
    if (e.key === "." || e.code === "Period") {
      e.preventDefault();
      audioHaptics.trigger("tap");
      setZenMode((z) => !z);
    } else if (e.key === "\\" || e.code === "Backslash") {
      e.preventDefault();
      audioHaptics.trigger("tap");
      setSidebarOpen((s) => !s);
    } else if (e.key === "/" || e.code === "Slash") {
      e.preventDefault();
      audioHaptics.trigger("tap");
      setShowTools((t) => !t);
    }
  };

  return (
    <div
      onKeyDown={handleDemoKeyDown}
      className={`demo-showcase-container mx-auto w-full max-w-[1060px] pt-6 text-left ${
        zenMode ? "fixed inset-0 z-40 max-w-none p-0 pt-0 bg-[var(--editor,#fbf8f0)] dark:bg-[#12130f]" : ""
      }`}
      id="app"
    >
      {/* Demo Header Caption */}
      {!zenMode && (
        <div className="demo-caption-top mb-3 flex items-center justify-between gap-3 text-xs text-[var(--muted,#5f594c)] dark:text-neutral-400">
          <div className="flex min-w-0 items-center gap-2">
            <span className="status-pulse-dot shrink-0" aria-hidden="true" />
            <span className="truncate font-mono text-[11px] font-medium text-[var(--ink,#191712)] dark:text-neutral-200">
              <span className="sm:hidden">Live demo: local</span>
              <span className="hidden sm:inline">
                Interactive demo: notes without the noise
              </span>
            </span>
          </div>
          <Link
            href="/app"
            className="demo-popout-link inline-flex shrink-0 items-center gap-1 font-mono text-[11px] font-semibold text-[var(--accent,#b8452c)] hover:underline"
            title="Open dedicated full workspace in new tab or window"
          >
            <span className="hidden sm:inline">Open full workspace</span>
            <span className="sm:hidden">Open app</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      )}

      {/* Concentric Mac Window Chassis */}
      <div
        className={`demo-mac-chassis relative overflow-hidden rounded-[1.35rem] border border-[var(--border-strong,rgba(25,23,18,0.18))] bg-[var(--surface-outer,#e5dfd3)] p-[3px] shadow-[var(--shadow-chassis,0_24px_64px_-16px_rgba(45,36,22,0.18))] dark:border-white/15 dark:bg-[#12130f] ${
          zenMode ? "h-screen rounded-none border-0 p-0" : ""
        }`}
      >
        <div className="specular-line" aria-hidden="true" />

        {/* macOS Titlebar */}
        <div className="demo-mac-titlebar relative flex h-[40px] items-center gap-2 border-b border-[var(--border,rgba(25,23,18,0.11))] bg-[var(--surface-outer,#e5dfd3)]/95 px-3 font-mono text-[11px] text-[var(--muted,#5f594c)] sm:gap-0 sm:px-4 dark:border-white/10 dark:bg-[#161713]">
          <div className="demo-mac-dots flex shrink-0 items-center gap-2 sm:w-[140px]">
            <span className="demo-dot demo-dot--close h-3 w-3 rounded-full bg-[#ff5f56] opacity-80" />
            <span className="demo-dot demo-dot--min h-3 w-3 rounded-full bg-[#ffbd2e] opacity-80" />
            <button
              type="button"
              onClick={() => {
                audioHaptics.trigger("tap");
                setZenMode((z) => !z);
              }}
              className="demo-dot demo-dot--zoom h-3 w-3 rounded-full bg-[#27c93f] hover:scale-125 active:scale-95 transition cursor-pointer"
              title="Toggle Zen Fullscreen Mode (⌘.)"
              aria-label="Toggle Fullscreen"
            />
          </div>
          <div className="demo-mac-title min-w-0 flex-1 truncate text-center font-medium">
            <span className="text-[var(--ink,#191712)] font-semibold dark:text-[#f4f0e6]">fold</span>
            <span className="opacity-50"> › </span>
            <span className="hidden sm:inline text-[var(--ink,#191712)] opacity-80 dark:text-neutral-300">
              demo workspace
            </span>
            <span className="hidden md:inline opacity-40"> / </span>
            <span className="hidden md:inline text-[var(--accent,#b8452c)] opacity-90 truncate">
              {selectedNote?.title}
            </span>
          </div>
          <div className="demo-mac-actions flex shrink-0 items-center justify-end sm:w-[140px]">
            <span className="storage-pill inline-flex items-center gap-1.5 rounded-full border border-[var(--border,rgba(25,23,18,0.12))] bg-[var(--surface-card,#fffdf8)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--muted,#5f594c)] shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
              <span className="status-pulse-dot h-1.5 w-1.5 rounded-full bg-[#27c93f] shadow-[0_0_6px_#27c93f]" aria-hidden="true" />
              <span className="hidden sm:inline">100% on-device</span>
              <span className="sm:hidden">Local</span>
            </span>
          </div>
        </div>

        {/* 3-Pane Body */}
        <div
          className={`demo-app-body flex overflow-hidden rounded-b-[1.12rem] bg-[var(--surface-card,#fffdf8)] text-left max-sm:flex-col dark:bg-[#161713] ${
            zenMode ? "h-[calc(100vh-40px)] rounded-none" : "h-[580px] max-sm:h-[640px]"
          }`}
        >
          {/* 1. Mini Collapsible Sidebar */}
          {sidebarOpen && (
            <aside className="relative flex w-[230px] shrink-0 flex-col border-r border-[var(--line,rgba(25,23,18,0.11))] bg-[var(--sidebar,#ece7da)] p-3 text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden max-sm:w-full max-sm:max-h-[240px] max-sm:border-r-0 max-sm:border-b dark:border-white/10 dark:bg-[#161713]">
              {/* Head */}
              <div className="flex items-center justify-between pb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[var(--accent,#b8452c)] text-[var(--accent-fg,#ffffff)] text-[11px] font-bold">
                    f.
                  </span>
                  <span className="text-[15px] font-bold text-[var(--ink,#191712)] dark:text-[#f4f0e6]">
                    fold<span className="text-[var(--accent,#b8452c)]">.</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-400"
                  aria-label="Close sidebar"
                >
                  ✕
                </button>
              </div>

              {/* New note button */}
              <button
                type="button"
                onClick={handleCreateDemoNote}
                className="group mb-3 flex w-full items-center justify-between rounded-[8px] border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink,#191712)] shadow-2xs transition hover:border-[var(--accent,#b8452c)] active:scale-[0.98] dark:border-white/15 dark:bg-[#1f201a] dark:text-[#f4f0e6]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[var(--accent,#b8452c)] font-bold">+</span>
                  <span>New note</span>
                </div>
                <kbd className="rounded border border-[var(--line,rgba(25,23,18,0.15))] bg-[var(--surface-2,#f1ecdf)] px-1 font-mono text-[9px] text-[var(--muted,#5f594c)] dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                  N
                </kbd>
              </button>

              {/* Folders navigation */}
              <div className="flex-1 overflow-y-auto space-y-1">
                <p className="px-2 pt-1 pb-1 text-[11px] font-semibold text-[var(--faint,#595245)] dark:text-neutral-400">
                  Library
                </p>
                <button
                  type="button"
                  onClick={() => {
                    audioHaptics.trigger("tap");
                    setFolder("all");
                  }}
                  className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition ${
                    folder === "all"
                      ? "bg-[var(--selected,rgba(184,69,44,0.09))] text-[var(--accent,#b8452c)] font-semibold dark:bg-[var(--accent,#b8452c)]/20"
                      : "text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.05))] dark:text-neutral-300"
                  }`}
                >
                  <span>All notes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioHaptics.trigger("tap");
                    setFolder("starred");
                  }}
                  className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition ${
                    folder === "starred"
                      ? "bg-[var(--selected,rgba(184,69,44,0.09))] text-[var(--accent,#b8452c)] font-semibold dark:bg-[var(--accent,#b8452c)]/20"
                      : "text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.05))] dark:text-neutral-300"
                  }`}
                >
                  <span>Starred</span>
                </button>

                <p className="px-2 pt-3 pb-1 text-[11px] font-semibold text-[var(--faint,#595245)] dark:text-neutral-400">
                  Folders
                </p>
                {(["Inbox", "Ideas", "Work", "Journal"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      audioHaptics.trigger("tap");
                      setFolder(f);
                    }}
                    className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition ${
                      folder === f
                        ? "bg-[var(--selected,rgba(184,69,44,0.09))] text-[var(--accent,#b8452c)] font-semibold dark:bg-[var(--accent,#b8452c)]/20"
                        : "text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.05))] dark:text-neutral-300"
                    }`}
                  >
                    <span>{f}</span>
                  </button>
                ))}
              </div>

              {/* Sidebar foot */}
              <div className="border-t border-[var(--line,rgba(25,23,18,0.08))] pt-2 flex items-center justify-between text-xs text-[var(--muted,#5f594c)] dark:border-white/5 dark:text-neutral-400">
                <button
                  type="button"
                  onClick={(e) => {
                    audioHaptics.trigger("toggle");
                    setTheme(undefined, e);
                  }}
                  className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-[var(--hover,rgba(25,23,18,0.06))] transition"
                  title="Toggle Theme"
                >
                  <span>{theme === "paper" ? "🌙 Ink" : "☀️ Paper"}</span>
                </button>
                <span className="font-mono text-[10px] opacity-70">On-Device</span>
              </div>
            </aside>
          )}

          {/* 2. Mini Note List */}
          <section
            className={`relative flex h-full shrink-0 flex-col border-r border-[var(--line,rgba(25,23,18,0.11))] bg-[var(--list,#f7f3ea)] p-3 text-left max-sm:h-auto max-sm:w-full max-sm:flex-none max-sm:border-r-0 max-sm:border-b max-sm:p-2 dark:border-white/10 dark:bg-[#1a1b16] ${
              sidebarOpen ? "hidden w-[240px] lg:flex" : "w-[260px] max-sm:w-full sm:w-[275px]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-[var(--line,rgba(25,23,18,0.08))] pb-2.5 max-sm:pb-2 dark:border-white/5">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    audioHaptics.trigger("tap");
                    setSidebarOpen((s) => !s);
                  }}
                  className="hit-target flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
                  title="Toggle Sidebar (⌘\)"
                  aria-label="Toggle sidebar"
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <rect x="2.6" y="3.6" width="14.8" height="12.8" rx="2.8" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M7.4 3.8v12.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
                <div className="min-w-0">
                  <h2 className="truncate text-xs font-semibold text-[var(--ink,#191712)] dark:text-[#f4f0e6]">
                    {folder === "all" ? "All notes" : folder === "starred" ? "Starred" : folder}
                  </h2>
                  <p className="text-[10px] tabular-nums text-[var(--muted,#5f594c)] dark:text-neutral-400">
                    {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "newest" | "oldest" | "az")}
                  className="h-6 cursor-pointer appearance-none rounded border border-[var(--line,rgba(25,23,18,0.12))] bg-[var(--surface,#fffdf8)] pr-4 pl-1.5 text-[10px] font-medium text-[var(--ink,#191712)] outline-none dark:border-white/10 dark:bg-[#20211b] dark:text-neutral-300"
                  aria-label="Sort notes"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="az">A–Z</option>
                </select>
                <button
                  type="button"
                  onClick={handleCreateDemoNote}
                  className="hit-target flex h-6 w-6 items-center justify-center rounded text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--accent,#b8452c)] dark:text-neutral-400"
                  title="New note"
                  aria-label="New note"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative my-2">
              <label className="relative flex w-full items-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="pointer-events-none absolute left-2.5 text-[var(--muted,#5f594c)] dark:text-neutral-400">
                  <circle cx="7.1" cy="7.1" r="4.35" stroke="currentColor" strokeWidth="1.4" />
                  <path d="m10.4 10.4 2.6 2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notes…"
                  aria-label="Search notes"
                  className="h-8 sm:h-7 w-full rounded-md border border-[var(--line,rgba(25,23,18,0.1))] bg-[var(--surface,#fffdf8)] pr-8 pl-8 text-base sm:text-[11px] text-[var(--ink,#191712)] outline-none placeholder:text-[var(--muted,#5f594c)] focus:border-[var(--accent,#b8452c)] dark:border-white/10 dark:bg-[#20211b] dark:text-[#f4f0e6]"
                />
                <kbd className="pointer-events-none absolute right-1.5 hidden sm:inline-block rounded border border-[var(--line,rgba(25,23,18,0.15))] bg-[var(--surface-2,#f1ecdf)] px-1 font-mono text-[9px] text-[var(--muted,#5f594c)] dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                  ⌘K
                </kbd>
              </label>
            </div>

            {/* Scrollable Note Cards */}
            <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 max-sm:flex max-sm:flex-none max-sm:gap-2 max-sm:space-y-0 max-sm:overflow-x-auto max-sm:overflow-y-visible max-sm:pb-1 max-sm:pr-0">
              {filteredNotes.map((note) => {
                const isActive = note.id === selectedId;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      audioHaptics.trigger("tap");
                      setSelectedId(note.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        audioHaptics.trigger("tap");
                        setSelectedId(note.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    className={`group relative flex cursor-pointer flex-col rounded-[9px] p-2.5 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] select-none max-sm:w-[218px] max-sm:min-w-[218px] max-sm:shrink-0 ${
                      isActive
                        ? "border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] shadow-2xs dark:border-white/15 dark:bg-[#22241d]"
                        : "border border-transparent bg-transparent hover:bg-[var(--hover,rgba(25,23,18,0.04))] dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Active accent catchlight */}
                    {isActive && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
                    )}

                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="text-[13px] font-bold tracking-tight text-[var(--ink,#191712)] dark:text-[#f4f0e6] truncate">
                        {note.title}
                      </h3>
                      {note.starred && (
                        <span className="text-[var(--star-gold,#d97706)] text-xs shrink-0">★</span>
                      )}
                    </div>

                    <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--muted,#5f594c)] dark:text-neutral-400">
                      {note.intro}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--muted,#5f594c)] opacity-80 dark:text-neutral-400">
                      <span className="font-mono">{note.updated}</span>
                      <span className="rounded bg-[var(--surface-3,#e7e0d1)] px-1.5 py-0.5 font-medium dark:bg-white/10">
                        {note.folder}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Mini Note Editor */}
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--editor,#fbf8f0)] dark:bg-[#12130f]">
            {/* Header Bar */}
            <header className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--line,rgba(25,23,18,0.08))] px-3 py-2 sm:px-4 dark:border-white/5">
              <div className="flex items-center gap-2">
                {/* Folder pill */}
                <select
                  value={selectedNote.folder}
                  onChange={(e) => {
                    const newFolder = e.target.value;
                    setNotes((prev) =>
                      prev.map((n) => (n.id === selectedId ? { ...n, folder: newFolder } : n))
                    );
                  }}
                  className="h-7 cursor-pointer appearance-none rounded-md border border-[var(--line,rgba(25,23,18,0.12))] bg-[var(--surface,#fffdf8)] py-1 pr-6 pl-2.5 text-xs font-medium text-[var(--ink,#191712)] shadow-2xs outline-none dark:border-white/10 dark:bg-[#1a1b15] dark:text-neutral-300"
                  aria-label="Note folder"
                >
                  <option value="Inbox">Inbox</option>
                  <option value="Ideas">Ideas</option>
                  <option value="Work">Work</option>
                  <option value="Journal">Journal</option>
                </select>

                {/* Tag pill */}
                <div className="flex h-7 items-center rounded-md border border-[var(--line,rgba(25,23,18,0.1))] bg-[var(--surface,#fffdf8)] px-2 text-xs shadow-2xs transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-[var(--accent,#b8452c)] focus-within:ring-1 focus-within:ring-[var(--accent,#b8452c)]/20 max-[359px]:hidden dark:border-white/10 dark:bg-[#1a1b15]">
                  <span className="text-[var(--accent,#b8452c)] font-semibold text-xs select-none">#</span>
                  <input
                    type="text"
                    value={selectedNote.tag}
                    onChange={(e) => {
                      const newTag = e.target.value.toLowerCase().replace(/^#/, "");
                      setNotes((prev) =>
                        prev.map((n) => (n.id === selectedId ? { ...n, tag: newTag } : n))
                      );
                    }}
                    placeholder="tag"
                    maxLength={24}
                    style={{
                      width: `${Math.min(Math.max((selectedNote.tag || "").length, 3) + 1, 14)}ch`,
                    }}
                    className="min-w-[2.5rem] max-w-[6.5rem] sm:max-w-[8.5rem] bg-transparent pl-1 text-xs font-medium text-[var(--ink,#191712)] outline-none placeholder:text-[var(--muted,#5f594c)] placeholder:font-normal dark:text-neutral-200"
                    aria-label="Note tag"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Star toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleStar(selectedNote.id)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition active:scale-90 ${
                    selectedNote.starred
                      ? "text-[var(--star-gold,#d97706)]"
                      : "text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--star-gold,#d97706)] dark:text-neutral-400"
                  }`}
                  title={selectedNote.starred ? "Unstar note" : "Star note"}
                  aria-label="Star note"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill={selectedNote.starred ? "currentColor" : "none"}>
                    <path
                      d="m8 2.25 1.72 3.49 3.85.56-2.79 2.72.66 3.84L8 11.05l-3.44 1.81.66-3.84-2.79-2.72 3.85-.56z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Pin toggle */}
                <button
                  type="button"
                  onClick={() => handleTogglePin(selectedNote.id)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition active:scale-90 ${
                    selectedNote.pinned
                      ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)]"
                      : "text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400"
                  }`}
                  title={selectedNote.pinned ? "Unpin note" : "Pin note"}
                  aria-label="Pin note"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M9.5 2.5 13.5 6.5M10.5 4.5l-2 2-3.5-.5-2.5 2.5 4 4 2.5-2.5-.5-3.5 2-2M4.5 11.5 2 14"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Zen fullscreen toggle */}
                <button
                  type="button"
                  onClick={() => {
                    audioHaptics.trigger("tap");
                    setZenMode((z) => !z);
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition active:scale-90 ${
                    zenMode
                      ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)] ring-1 ring-[var(--accent,#b8452c)]/30"
                      : "text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400"
                  }`}
                  title="Zen Mode (⌘.)"
                  aria-label="Zen Mode"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M3.25 7.5V3.25H7.5M12.5 3.25h4.25V7.5M16.75 12.5v4.25H12.5M7.5 16.75H3.25V12.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Tools Toggle */}
                <FormattingToolsToggle
                  open={showTools}
                  onToggle={() => {
                    audioHaptics.trigger("tap");
                    setShowTools((t) => !t);
                  }}
                  shortcut="⌘/"
                />
              </div>
            </header>

            {/* Writing Canvas + Floating Formatting Dock */}
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div
                className={`flex-1 overflow-y-auto px-6 pt-6 sm:px-8 sm:pt-7 text-left ${
                  showTools ? "pb-20" : "pb-8"
                }`}
              >
                <div className="mx-auto max-w-2xl text-left">
                {/* Auto-growing Title Textarea */}
                <textarea
                  ref={titleTextareaRef}
                  rows={1}
                  value={selectedNote.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Note title…"
                  className="mb-4 block w-full resize-none overflow-hidden p-0 m-0 border-0 outline-none ring-0 shadow-none bg-transparent text-2xl sm:text-3xl font-bold tracking-tight text-left text-[var(--ink,#191712)] placeholder:text-[var(--faint,#595245)]/40 focus:ring-0 focus:outline-none dark:text-[#f4f0e6] dark:placeholder:text-[#928c7d] leading-tight"
                />

                {/* Content Elements */}
                <div className="space-y-4 text-[14.5px] leading-relaxed text-[var(--ink,#191712)] dark:text-[#f4f0e6]">
                  {/* Paragraph 1 */}
                  <p>{selectedNote.intro}</p>

                  {/* Highlight callout if present */}
                  {selectedNote.highlight && (
                    <p className="rounded-[4px] bg-[var(--highlight,#f0ddae)]/60 px-2 py-1.5 font-medium text-[var(--ink,#191712)] dark:bg-amber-500/20 dark:text-amber-200">
                      {selectedNote.highlight}
                    </p>
                  )}

                  {/* Interactive Tasks Checklist */}
                  {selectedNote.tasks && selectedNote.tasks.length > 0 && (
                    <div className="my-4">
                      <h4 className="mb-2 text-xs font-semibold text-[var(--faint,#595245)] dark:text-neutral-400">
                        Checklist
                      </h4>
                      <ul className="space-y-2">
                        {selectedNote.tasks.map((task) => (
                          <li key={task.id}>
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={task.checked}
                              onClick={() => handleToggleTask(selectedNote.id, task.id)}
                              className="group/task flex w-full cursor-pointer items-start gap-3 rounded-md py-0.5 select-none text-left focus-visible:outline-2 focus-visible:outline-[var(--accent,#b8452c)]"
                            >
                              <span
                                aria-hidden="true"
                                className={`mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border transition-all duration-150 ${
                                  task.checked
                                    ? "border-[var(--accent,#b8452c)] bg-[var(--accent,#b8452c)] text-[var(--accent-fg,#ffffff)] shadow-xs"
                                    : "border-[var(--line-strong,rgba(25,23,18,0.28))] bg-[var(--surface-card,#fffdf8)] group-hover/task:border-[var(--accent,#b8452c)] dark:border-white/20 dark:bg-[#1a1b16]"
                                }`}
                              >
                                {task.checked && (
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
                                  </svg>
                                )}
                              </span>
                              <span
                                className={`text-[14.5px] leading-relaxed transition-colors duration-150 ${
                                  task.checked
                                    ? "text-[var(--muted,#5f594c)] line-through opacity-75 dark:text-[#928c7d]"
                                    : "text-[var(--ink,#191712)] dark:text-[#f4f0e6]"
                                }`}
                              >
                                {task.text}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Blockquote if present */}
                  {selectedNote.quote && (
                    <blockquote className="my-4 border-l-2 border-[var(--accent,#b8452c)] pl-3.5 italic text-[var(--ink-2,#3a352b)] dark:text-neutral-300">
                      “{selectedNote.quote}”
                    </blockquote>
                  )}

                  {/* Outro paragraph if present */}
                  {selectedNote.outro && <p>{selectedNote.outro}</p>}
                </div>
              </div>
              </div>

              {/* Floating Bottom Formatting Bubble */}
              {showTools && (
                <FormattingFloatingDock>
                  <Tooltip label="Undo" shortcut="⌘Z">
                    <button
                      type="button"
                      onClick={() => audioHaptics.trigger("tap")}
                      className={btnClass(false)}
                      aria-label="Undo"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M3.5 6.5h7a3 3 0 0 1 3 3v.5M3.5 6.5 6.5 3.5M3.5 6.5l3 3"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Tooltip>

                  <Tooltip label="Redo" shortcut="⌘⇧Z">
                    <button
                      type="button"
                      onClick={() => audioHaptics.trigger("tap")}
                      className={btnClass(false)}
                      aria-label="Redo"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M12.5 6.5h-7a3 3 0 0 0-3 3v.5M12.5 6.5l-3-3M12.5 6.5l-3 3"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Tooltip>

                  <div className={TOOLBAR_DIVIDER_CLASS} aria-hidden="true" />

                  <Tooltip label="Bold" shortcut="⌘B">
                    <button
                      type="button"
                      onClick={() => handleToggleTool("b")}
                      className={btnClass(activeTools.has("b"))}
                      aria-label="Bold"
                      aria-pressed={activeTools.has("b")}
                    >
                      <span className="font-semibold text-[13px] leading-none">B</span>
                    </button>
                  </Tooltip>

                  <Tooltip label="Italic" shortcut="⌘I">
                    <button
                      type="button"
                      onClick={() => handleToggleTool("i")}
                      className={btnClass(activeTools.has("i"))}
                      aria-label="Italic"
                      aria-pressed={activeTools.has("i")}
                    >
                      <span className="italic font-medium text-[13px] leading-none">I</span>
                    </button>
                  </Tooltip>

                  <Tooltip label="Heading" shortcut="⌘⌥2">
                    <button
                      type="button"
                      onClick={() => handleToggleTool("h")}
                      className={btnClass(activeTools.has("h"))}
                      aria-label="Heading"
                      aria-pressed={activeTools.has("h")}
                    >
                      <span className="font-semibold text-xs leading-none">H</span>
                    </button>
                  </Tooltip>

                  <div className={TOOLBAR_DIVIDER_CLASS} aria-hidden="true" />

                  <Tooltip label="Bullet list" shortcut="⌘⇧8">
                    <button
                      type="button"
                      onClick={() => handleToggleTool("bullet")}
                      className={btnClass(activeTools.has("bullet"))}
                      aria-label="Bullet list"
                      aria-pressed={activeTools.has("bullet")}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Tooltip>

                  <Tooltip label="Numbered list" shortcut="⌘⇧7">
                    <button
                      type="button"
                      onClick={() => handleToggleTool("ordered")}
                      className={btnClass(activeTools.has("ordered"))}
                      aria-label="Numbered list"
                      aria-pressed={activeTools.has("ordered")}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M6 4h7.5M6 8h7.5M6 12h7.5M2 3.5l1-.5v3M2 10c0-.8 1-.8 1-1.2 0-.3-.3-.5-.7-.5-.4 0-.7.2-.8.5M2 13h1.5v-1"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Tooltip>

                  <Tooltip label="Checklist" shortcut="⌘⇧9">
                    <button
                      type="button"
                      onClick={() => handleToggleTool("task")}
                      className={btnClass(activeTools.has("task"))}
                      aria-label="Checklist"
                      aria-pressed={activeTools.has("task")}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
                        <path d="m5.5 8 2 2 3.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </Tooltip>

                  <Tooltip label="Blockquote">
                    <button
                      type="button"
                      onClick={() => handleToggleTool("quote")}
                      className={btnClass(activeTools.has("quote"))}
                      aria-label="Blockquote"
                      aria-pressed={activeTools.has("quote")}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M3.5 5.5h3v3.5a2 2 0 0 1-2 2h-.5M9.5 5.5h3v3.5a2 2 0 0 1-2 2h-.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Tooltip>

                  <Tooltip label="Code block">
                    <button
                      type="button"
                      onClick={() => handleToggleTool("code")}
                      className={btnClass(activeTools.has("code"))}
                      aria-label="Code block"
                      aria-pressed={activeTools.has("code")}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="m5 5-3 3 3 3M11 5l3 3-3 3M9.5 3.5l-3 9"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Tooltip>

                  <div className={TOOLBAR_DIVIDER_CLASS} aria-hidden="true" />

                  <Tooltip label="Link" shortcut="⌘K">
                    <button
                      type="button"
                      onClick={() => handleToggleTool("link")}
                      className={btnClass(activeTools.has("link"))}
                      aria-label="Insert link"
                      aria-pressed={activeTools.has("link")}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M6.5 9.5a3 3 0 0 0 4.24 0l1.76-1.76a3 3 0 0 0-4.24-4.24L7.5 4.26M9.5 6.5a3 3 0 0 0-4.24 0L3.5 8.26a3 3 0 0 0 4.24 4.24L8.5 11.74"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Tooltip>

                  <Tooltip label="Highlight" shortcut="⌘⇧Y">
                    <button
                      type="button"
                      onClick={() => handleToggleTool("highlight")}
                      className={btnClass(activeTools.has("highlight"))}
                      aria-label="Highlight"
                      aria-pressed={activeTools.has("highlight")}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M10.5 2.5 13.5 5.5 5.5 13.5H2.5v-3L10.5 2.5zM2 14.5h12"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Tooltip>
                </FormattingFloatingDock>
              )}
            </div>

            {/* Footer Bar */}
            <footer className="flex min-h-9 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[var(--line,rgba(25,23,18,0.08))] px-3 py-1.5 text-[11px] text-[var(--muted,#5f594c)] sm:px-4 dark:border-white/5 dark:text-neutral-400">
              <div className="flex items-center gap-2 font-mono text-[10px] tabular-nums">
                <span>{stats.words} words</span>
                <span className="opacity-70">{stats.readTime}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium max-sm:hidden">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>All changes saved locally</span>
                </span>
                <Link
                  href="/app"
                  className="font-semibold text-[var(--accent,#b8452c)] hover:underline sm:ml-1"
                >
                  Open app ↗
                </Link>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
