"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useWorkspace } from "./WorkspaceContext";
import { Tooltip } from "./CraftTooltip";
import { audioHaptics } from "@/lib/audio-haptics";

export function Sidebar({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const {
    notes,
    folder,
    folders,
    tag,
    stats,
    sidebarOpen,
    zenMode,
    theme,
    createNote,
    createFolder,
    deleteFolder,
    deleteTag,
    setFolder,
    setTag,
    toggleSidebar,
    toggleZenMode,
    toggleTheme,
    showToast,
    setStorageModalOpen,
  } = useWorkspace();

  const [soundMuted, setSoundMuted] = useState(audioHaptics.isMuted());
  const [newFolderInput, setNewFolderInput] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderPendingDelete, setFolderPendingDelete] = useState<{
    name: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (!folderPendingDelete) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFolderPendingDelete(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [folderPendingDelete]);

  const activeNotes = notes.filter((n) => !n.deletedAt);

  // Extract all distinct tags (normalized lowercase without leading #)
  const tagCounts = activeNotes.reduce<Record<string, number>>((acc, n) => {
    const clean = (n.tag || "").toLowerCase().replace(/^#/, "").trim();
    if (clean) {
      acc[clean] = (acc[clean] || 0) + 1;
    }
    return acc;
  }, {});
  const distinctTags = Object.keys(tagCounts).sort();

  // If currently active tag has no remaining notes, reset tag
  useEffect(() => {
    if (tag) {
      const cleanTag = tag.toLowerCase().replace(/^#/, "").trim();
      if (!tagCounts[cleanTag]) {
        setTag(null);
      }
    }
  }, [tag, tagCounts, setTag]);

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = folderName.trim();
    if (!clean) {
      setNewFolderInput(false);
      return;
    }
    if (createFolder(clean)) {
      setFolderName("");
      setNewFolderInput(false);
    }
  };

  const handleToggleSound = () => {
    const isNowMuted = audioHaptics.toggleMute();
    setSoundMuted(isNowMuted);
    showToast(isNowMuted ? "Sound effects muted" : "Sound effects enabled");
  };

  if (zenMode) return null;

  return (
    <>
      {/* Mobile Backdrop Scrim (only on standalone app) */}
      {sidebarOpen && !isEmbedded && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${
          sidebarOpen ? "is-open" : "is-closed"
        } flex flex-col border-r border-[var(--line,rgba(25,23,18,0.11))] bg-[var(--sidebar,#ece7da)] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] dark:border-white/10 dark:bg-[#161713] ${
          isEmbedded
            ? `md:w-[240px] md:min-w-[240px] md:max-w-[240px] md:shrink-0 md:overflow-hidden ${
                sidebarOpen ? "hidden md:flex" : "hidden"
              }`
            : `fixed inset-y-0 left-0 z-40 w-[260px] ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full md:hidden"
              } md:static md:translate-x-0`
        }`}
      >
        <div className="flex h-full flex-col p-3">
          {/* 1. Sidebar Head */}
          <div className="flex items-center justify-between px-1 py-1 pb-3">
            <Link
              href="/"
              className="group flex items-center gap-2 text-inherit no-underline"
              title="Back to Fold home"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-[7px] border border-[var(--accent,#b8452c)]/20 bg-[var(--accent,#b8452c)] text-white shadow-xs transition group-hover:scale-105">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5.75 3.25h8l5 5v12.5h-13z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.75 3.25v5h5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.75 12h5.5M8.75 15.5h3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="text-[17px] font-semibold tracking-tight text-[var(--ink,#191712)] dark:text-[#f4f0e6]">
                fold<span className="text-[var(--accent,#b8452c)]">.</span>
              </span>
              <span className="rounded-full bg-[var(--surface-3,#e7e0d1)] px-2 py-0.5 text-xs font-medium text-[var(--muted,#5f594c)] dark:bg-white/10 dark:text-neutral-400">
                Notes
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleSidebar}
              className="hit-target flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] md:hidden dark:text-neutral-400"
              aria-label="Close sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="m4 4 8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* 2. New Note Primary CTA */}
          <button
            type="button"
            onClick={() => createNote()}
            className="group relative mb-3 flex w-full items-center justify-between rounded-[9px] border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] px-2.5 py-1.5 text-[13px] font-medium text-[var(--ink,#191712)] shadow-[0_1px_2px_rgba(45,36,22,0.06)] transition hover:border-[var(--accent,#b8452c)] hover:shadow-2xs active:scale-[0.99] dark:border-white/15 dark:bg-[#1f201a] dark:text-[#f4f0e6]"
          >
            {/* Top specular highlight */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
              aria-hidden="true"
            />
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--accent,#b8452c)]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>New note</span>
            </div>
            <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-[var(--line,rgba(25,23,18,0.15))] bg-[var(--surface-2,#f1ecdf)] px-1 font-mono text-[11px] text-[var(--muted,#5f594c)] dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
              N
            </kbd>
          </button>

          {/* 3. Navigation Sections (Scrollable) */}
          <div className="flex-1 space-y-4 overflow-y-auto">
            {/* Library Section */}
            <div className="space-y-0.5">
              <p className="px-2.5 pb-1 text-xs font-medium text-[var(--faint,#595245)] dark:text-neutral-400">
                Library
              </p>
              <button
                type="button"
                onClick={() => {
                  setFolder("all");
                  setTag(null);
                }}
                className={`flex min-h-8 w-full items-center gap-2 rounded-lg px-2.5 py-1 text-[13px] font-medium transition ${
                  folder === "all" && tag === null
                    ? "bg-[var(--selected,rgba(184,69,44,0.09))] text-[var(--accent,#b8452c)] font-semibold shadow-2xs dark:bg-[var(--accent,#b8452c)]/20 dark:text-[#ff8a75]"
                    : "text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.045))] dark:text-neutral-300"
                }`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 3.75h10M3 8h10M3 12.25h6.5"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="truncate">All notes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFolder("starred");
                  setTag(null);
                }}
                className={`flex min-h-8 w-full items-center gap-2 rounded-lg px-2.5 py-1 text-[13px] font-medium transition ${
                  folder === "starred" && tag === null
                    ? "bg-[var(--selected,rgba(184,69,44,0.09))] text-[var(--accent,#b8452c)] font-semibold shadow-2xs dark:bg-[var(--accent,#b8452c)]/20 dark:text-[#ff8a75]"
                    : "text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.045))] dark:text-neutral-300"
                }`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--star-gold,#d97706)]">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="m8 2.4 1.66 3.36 3.71.54-2.69 2.62.64 3.7L8 10.87l-3.32 1.75.64-3.7-2.69-2.62 3.71-.54z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="truncate">Starred</span>
              </button>

              {/* Trash / Recently Deleted */}
              <button
                type="button"
                onClick={() => {
                  setFolder("trash");
                  setTag(null);
                }}
                className={`flex min-h-8 w-full items-center gap-2 rounded-lg px-2.5 py-1 text-[13px] font-medium transition ${
                  folder === "trash" && tag === null
                    ? "bg-[var(--selected,rgba(184,69,44,0.09))] text-[var(--accent,#b8452c)] font-semibold shadow-2xs dark:bg-[var(--accent,#b8452c)]/20 dark:text-[#ff8a75]"
                    : "text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.045))] dark:text-neutral-300"
                }`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.25 4.75h9.5M6.25 4.75V3.5c0-.41.34-.75.75-.75h2c.41 0 .75.34.75.75v1.25M4.5 4.75l.5 8.25c.02.41.36.75.77.75h4.46c.41 0 .75-.34.77-.75l.5-8.25"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="truncate">Trash</span>
              </button>
            </div>

            {/* Folders Section */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between px-2.5 pb-1">
                <p className="text-xs font-medium text-[var(--faint,#595245)] dark:text-neutral-400">
                  Folders
                </p>
                <Tooltip label="Create folder">
                  <button
                    type="button"
                    onClick={() => setNewFolderInput((p) => !p)}
                    className="hit-target flex h-5 w-5 items-center justify-center rounded text-[var(--muted,#5f594c)] transition hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
                    aria-label="Create folder"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
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

              {newFolderInput && (
                <form onSubmit={handleAddFolder} className="mb-2 flex items-center gap-1 px-2.5">
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setNewFolderInput(false);
                        setFolderName("");
                      }
                    }}
                    placeholder="Folder name…"
                    autoFocus
                    aria-label="New folder name"
                    className="min-w-0 flex-1 rounded-md border border-[var(--accent,#b8452c)] bg-[var(--surface,#fffdf8)] px-2 py-1 text-base md:text-xs text-[var(--ink,#191712)] shadow-xs outline-hidden dark:bg-[#1f201a] dark:text-[#f4f0e6]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNewFolderInput(false);
                      setFolderName("");
                    }}
                    className="hit-target flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
                    aria-label="Cancel folder creation"
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4 4l8 8M12 4l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </form>
              )}

              {folders.map((fName) => {
                const isActive = folder === fName && tag === null;
                const folderCount = activeNotes.filter((n) => n.folder === fName).length;
                const canDelete = fName !== "Inbox";
                return (
                  <div
                    key={fName}
                    className={`group flex min-h-8 w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 transition ${
                      isActive
                        ? "bg-[var(--selected,rgba(184,69,44,0.09))] text-[var(--accent,#b8452c)] font-semibold shadow-2xs dark:bg-[var(--accent,#b8452c)]/20 dark:text-[#ff8a75]"
                        : "text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.045))] dark:text-neutral-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFolder(fName);
                        setTag(null);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left text-[13px] font-medium"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center ${
                          isActive
                            ? "text-[var(--accent,#b8452c)] dark:text-[#ff8a75]"
                            : "text-[var(--muted,#5f594c)] dark:text-neutral-400"
                        }`}
                      >
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M2.5 4a1.5 1.5 0 0 1 1.5-1.5h2.5l1.5 1.5H12A1.5 1.5 0 0 1 13.5 5.5v6.5a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 12V4Z"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="truncate">{fName}</span>
                    </button>
                    {canDelete && (
                      <Tooltip
                        label="Delete folder"
                        className="inline-flex shrink-0 transition-opacity duration-100 [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:pointer-events-auto [@media(hover:hover)]:group-focus-within:opacity-100"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (folderCount === 0) {
                              deleteFolder(fName);
                            } else {
                              setFolderPendingDelete({ name: fName, count: folderCount });
                            }
                          }}
                          className="hit-target flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted,#5f594c)] opacity-80 transition hover:bg-[var(--danger,#a53c27)]/12 hover:text-[var(--danger,#a53c27)] focus:opacity-100 dark:text-neutral-400 dark:hover:text-[#ff8a75]"
                          aria-label={`Delete folder ${fName}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M3.5 4.5h9M6 4.5V3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1.5M5 4.5v8A1 1 0 0 0 6 13.5h4a1 1 0 0 0 1-1v-8"
                              stroke="currentColor"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tags Section (if any note has tags) */}
            {distinctTags.length > 0 && (
              <div className="space-y-0.5">
                <p className="px-2.5 pb-1 text-xs font-medium text-[var(--faint,#595245)] dark:text-neutral-400">
                  Tags
                </p>
                {distinctTags.map((tName) => {
                  const isActive = (tag || "").toLowerCase().replace(/^#/, "").trim() === tName;
                  return (
                    <div
                      key={tName}
                      className={`group flex min-h-8 w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 transition ${
                        isActive
                          ? "bg-[var(--selected,rgba(184,69,44,0.09))] text-[var(--accent,#b8452c)] font-semibold shadow-2xs dark:bg-[var(--accent,#b8452c)]/20 dark:text-[#ff8a75]"
                          : "text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.045))] dark:text-neutral-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            setTag(null);
                          } else {
                            setFolder("all");
                            setTag(tName);
                          }
                        }}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left text-[13px] font-medium"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--accent,#b8452c)] font-semibold dark:text-[#ff8a75]">
                          #
                        </span>
                        <span className="truncate">{tName}</span>
                      </button>
                      <Tooltip
                        label="Remove tag"
                        className="inline-flex shrink-0 transition-opacity duration-100 [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:pointer-events-auto [@media(hover:hover)]:group-focus-within:opacity-100"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTag(tName);
                          }}
                          className="hit-target flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted,#5f594c)] opacity-80 transition hover:bg-[var(--danger,#a53c27)]/12 hover:text-[var(--danger,#a53c27)] focus:opacity-100 dark:text-neutral-400 dark:hover:text-[#ff8a75]"
                          aria-label={`Remove tag #${tName}`}
                        >
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M4 4l8 8M12 4l-8 8"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Bottom Concentric Storage Telemetry Card */}
          <div className="mt-auto pt-3">
            <div
              onClick={() => setStorageModalOpen(true)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
                  e.preventDefault();
                  setStorageModalOpen(true);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Open storage and backup settings"
              className="group relative mb-2.5 cursor-pointer rounded-[12px] border border-[var(--line,rgba(25,23,18,0.12))] bg-[var(--surface-2,#f1ecdf)] p-2.5 shadow-2xs transition hover:border-[var(--line-strong,rgba(25,23,18,0.25))] dark:border-white/10 dark:bg-[#1c1d18]"
            >
              {/* Top Specular catchlight */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
                aria-hidden="true"
              />
              <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[var(--ink,#191712)] dark:text-neutral-200">
                  <span className={`h-1.5 w-1.5 rounded-full ${stats.isPersisted ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                  Stored on this device
                </span>
                <span className="text-xs font-medium tabular-nums text-[var(--muted,#5f594c)] dark:text-neutral-400">
                  {stats.formattedSize}
                </span>
              </div>

              {/* Progress meter */}
              <div className="mb-1.5 h-1 w-full overflow-hidden rounded-full bg-[var(--line,rgba(25,23,18,0.1))] dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[var(--accent,#b8452c)] transition-all duration-300"
                  style={{ width: `${Math.max(2, stats.usagePercent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted,#5f594c)] dark:text-neutral-400">
                <span className="tabular-nums">{stats.noteCount} {stats.noteCount === 1 ? "note" : "notes"}, {stats.isPersisted ? "safe" : "local"}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStorageModalOpen(true);
                  }}
                  className="font-medium text-[var(--accent,#b8452c)] group-hover:underline dark:text-[#ff8a75]"
                >
                  Manage storage ↗
                </button>
              </div>
            </div>

            {/* 5. Utility Controls */}
            <div className="flex items-center justify-between border-t border-[var(--line,rgba(25,23,18,0.08))] pt-2.5 px-1 dark:border-white/5">
              <div className="flex items-center gap-1">
                {/* Theme Toggle */}
                <Tooltip
                  label={theme === "paper" ? "Switch to dark mode" : "Switch to light mode"}
                  shortcut="T"
                  side="top"
                >
                  <button
                    type="button"
                    onClick={(e) => toggleTheme(e)}
                    className="hit-target group relative flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] active:scale-90 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] dark:text-neutral-400 dark:hover:text-white"
                    aria-label="Toggle theme"
                  >
                    <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                      {/* Moon icon (paper/light mode) */}
                      <svg
                        className={`absolute inset-0 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          theme === "paper"
                            ? "rotate-0 scale-100 opacity-100"
                            : "rotate-90 scale-0 opacity-0"
                        }`}
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M16.8 12.2A7.2 7.2 0 0 1 7.8 3.2a7.3 7.3 0 1 0 9 9Z"
                          stroke="currentColor"
                          strokeWidth="1.45"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {/* Sun icon (ink/dark mode) */}
                      <svg
                        className={`absolute inset-0 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          theme === "ink"
                            ? "rotate-0 scale-100 opacity-100 text-amber-300"
                            : "-rotate-90 scale-0 opacity-0"
                        }`}
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="10" cy="10" r="3.3" stroke="currentColor" strokeWidth="1.45" />
                        <path
                          d="M10 2.2v1.7M10 16.1v1.7M2.2 10h1.7M16.1 10h1.7M4.5 4.5l1.2 1.2M14.3 14.3l1.2 1.2M15.5 4.5l-1.2 1.2M5.7 14.3l-1.2 1.2"
                          stroke="currentColor"
                          strokeWidth="1.45"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </button>
                </Tooltip>

                {/* Zen Focus Mode Toggle */}
                <Tooltip label="Zen focus mode" shortcut="⌘." side="top">
                  <button
                    type="button"
                    onClick={toggleZenMode}
                    className="hit-target flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
                    aria-label="Toggle zen focus mode"
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
                </Tooltip>

                {/* Audio Haptics Mute Toggle */}
                <Tooltip label={soundMuted ? "Unmute clicks" : "Mute click sounds"} side="top">
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className="hit-target flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
                    aria-label="Toggle click sound effects"
                  >
                    {soundMuted ? (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M9.5 4.5 5.5 8H2.5v4h3l4 3.5v-11ZM17.5 7.5l-5 5M12.5 7.5l5 5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M9.5 4.5 5.5 8H2.5v4h3l4 3.5v-11ZM14 7a4 4 0 0 1 0 6M16.5 4.5a7.5 7.5 0 0 1 0 11"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </Tooltip>
              </div>

              {/* Showcase Link (only in standalone full workspace) */}
              {!isEmbedded && (
                <Tooltip label="Back to home" side="top">
                  <Link
                    href="/"
                    className="hit-target flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
                    aria-label="Back to home"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M15.5 10H4.5M9 5.5 4.5 10 9 14.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </aside>

      {folderPendingDelete &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-folder-title"
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setFolderPendingDelete(null)}
          >
            <div
              className="relative w-full max-w-[400px] overflow-hidden rounded-[18px] border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] p-5 shadow-[0_24px_64px_-16px_rgba(45,36,22,0.35)] dark:border-white/15 dark:bg-[#1a1b16] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
                aria-hidden="true"
              />
              <h2
                id="delete-folder-title"
                className="text-base font-semibold [text-wrap:balance] text-[var(--ink,#191712)] dark:text-[#f4f0e6]"
              >
                Delete folder &ldquo;{folderPendingDelete.name}&rdquo;?
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed [text-wrap:pretty] tabular-nums text-[var(--muted,#5f594c)] dark:text-neutral-400">
                This folder contains {folderPendingDelete.count}{" "}
                {folderPendingDelete.count === 1 ? "note" : "notes"}. Choose whether to keep{" "}
                {folderPendingDelete.count === 1 ? "it" : "them"} in Inbox or move{" "}
                {folderPendingDelete.count === 1 ? "it" : "them"} to trash.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    deleteFolder(folderPendingDelete.name, "move-to-inbox");
                    setFolderPendingDelete(null);
                  }}
                  className="w-full rounded-[10px] bg-[var(--ink,#191712)] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 dark:bg-[#f4f0e6] dark:text-[#12130f]"
                >
                  Keep notes in Inbox
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteFolder(folderPendingDelete.name, "move-to-trash");
                    setFolderPendingDelete(null);
                  }}
                  className="w-full rounded-[10px] border border-[var(--danger,#a53c27)]/30 bg-[var(--danger,#a53c27)]/10 px-3.5 py-2 text-xs font-semibold text-[var(--danger,#a53c27)] transition hover:bg-[var(--danger,#a53c27)] hover:text-white dark:text-[#ff8a75] dark:hover:text-white"
                >
                  Move notes to trash
                </button>
                <button
                  type="button"
                  onClick={() => setFolderPendingDelete(null)}
                  className="w-full rounded-[10px] border border-[var(--line,rgba(25,23,18,0.12))] bg-transparent px-3.5 py-2 text-xs font-medium text-[var(--muted,#5f594c)] transition hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:border-white/10 dark:text-neutral-400 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
