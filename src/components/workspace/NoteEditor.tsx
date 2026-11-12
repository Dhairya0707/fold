"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

import { useWorkspace } from "./WorkspaceContext";
import { Tooltip } from "./CraftTooltip";
import { BubbleFormattingMenu } from "./BubbleFormattingMenu";
import { FormattingFloatingDock, FormattingToolbarPill } from "./FormattingToolbarPill";
import { FormattingToolsToggle } from "./FormattingToolsToggle";
import { audioHaptics } from "@/lib/audio-haptics";
import { sanitizeUrl } from "@/lib/storage/markdown";

function calculateStats(text: string) {
  const plain = text.trim();
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  const minutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
  return {
    words,
    readingTime: `${minutes} min read`,
  };
}

export function NoteEditor({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const {
    folders,
    selectedNote,
    selectedId,
    saveStatus,
    zenMode,
    selectNote,
    createNote,
    updateNoteTitle,
    updateNoteBody,
    updateNoteFolder,
    updateNoteTag,
    togglePin,
    toggleLock,
    duplicateNote,
    toggleStar,
    deleteNote,
    downloadCurrentNote,
    copyCurrentNote,
    toggleZenMode,
  } = useWorkspace();

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<{
    href: string;
    text: string;
    top: number;
    left: number;
  } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const linkHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const selectedNoteRef = useRef(selectedNote);

  useEffect(() => {
    selectedNoteRef.current = selectedNote;
  }, [selectedNote]);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuListRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const linkModalRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const isUpdatingFromContext = useRef(false);
  const previousNoteId = useRef<string | null>(selectedId);

  // Titles wrap instead of clipping in narrow (three-pane) layouts.
  const resizeTitleInput = useCallback(() => {
    const el = titleInputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Setup Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false,
    // Keep toolbar active states and undo/redo availability in sync with the
    // caret — TipTap v3 no longer re-renders on every transaction by default.
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        // StarterKit v3 already bundles Link. Configuring it here avoids the
        // "Duplicate extension names: ['link']" warning and a second set of
        // keyboard shortcuts fighting the first.
        link: {
          openOnClick: false,
          autolink: true,
          isAllowedUri: (url: string) => sanitizeUrl(url) !== null,
          HTMLAttributes: {
            class: "editor-link",
            rel: "noopener noreferrer nofollow",
          },
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item-row",
        },
      }),
      Highlight.extend({
        addKeyboardShortcuts() {
          // Avoid TipTap's default Mod-Shift-h (macOS Chrome/Safari Home); we bind ⌘⇧Y cleanly instead.
          return {};
        },
      }).configure({
        multicolor: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
    ],
    content: selectedNote?.body || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "focus:outline-hidden text-[var(--ink,#191712)] dark:text-[#f4f0e6] leading-relaxed text-[15px]",
        spellcheck: "true",
      },
      handleClick: (_view, _pos, event) => {
        const target = event.target as HTMLElement | null;
        const link = target?.closest("a");
        if (!link) return false;
        const safeHref = sanitizeUrl(link.getAttribute("href"));
        if (!safeHref) return false;

        const currentNote = selectedNoteRef.current;
        // If note is locked or Cmd/Ctrl key is held, open link directly in a new tab!
        if (currentNote?.locked || event.metaKey || event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          audioHaptics.trigger("tap");
          window.open(safeHref, "_blank", "noopener,noreferrer");
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (isUpdatingFromContext.current) return;
      if (selectedId) {
        const html = ed.getHTML();
        updateNoteBody(selectedId, html);
      }
    },
  });

  // Switch content and editable state when selected note changes
  useEffect(() => {
    if (!editor || !selectedNote) return;

    const editable = !selectedNote.locked;
    if (editor.isEditable !== editable) {
      editor.setEditable(editable);
    }

    const currentHtml = editor.getHTML();
    if (currentHtml !== selectedNote.body) {
      isUpdatingFromContext.current = true;
      editor.commands.setContent(selectedNote.body || "<p></p>", { emitUpdate: false });
      isUpdatingFromContext.current = false;
    }
    // Re-measure title input so it never clips or collapses on note change
    resizeTitleInput();
  }, [editor, selectedNote, resizeTitleInput]);

  // Handle Link Insertion
  const handleInsertLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setLinkError(null);
    setShowLinkModal(true);
  }, [editor]);

  const closeLinkModal = useCallback(() => {
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkError(null);
    requestAnimationFrame(() => editor?.commands.focus());
  }, [editor]);

  const confirmLink = () => {
    if (!editor) return;
    let finalUrl = linkUrl.trim();
    if (finalUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      closeLinkModal();
      return;
    }
    const schemeMatch = finalUrl.match(/^([a-zA-Z][a-zA-Z\d+.-]*):/);
    if (!schemeMatch && !finalUrl.startsWith("/")) {
      finalUrl = `https://${finalUrl}`;
    }
    const safeUrl = sanitizeUrl(finalUrl);
    if (!safeUrl) {
      setLinkError("Only http, https, mailto, or relative links are supported.");
      return;
    }
    // If nothing is selected, insert the URL as linked text so ⌘K is useful
    // even from a bare caret instead of silently doing nothing.
    if (editor.state.selection.empty) {
      const label = safeUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "");
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: label,
          marks: [{ type: "link", attrs: { href: safeUrl } }],
        })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: safeUrl }).run();
    }
    closeLinkModal();
  };

  // Browser-safe keyboard shortcuts inside the editor + toolbar toggle (⌘/).
  // Captured in capture phase so TipTap list/heading chords don't double-toggle
  // and ⌘K only opens Insert Link when text is selected or caret is inside a link.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (!isCmd) return;

      // CMD + /: Toggle formatting tools pill anywhere a note is active
      // (replaces browser-reserved CMD + SHIFT + T reopen closed tab)
      if (!e.shiftKey && !e.altKey && (e.key === "/" || e.code === "Slash")) {
        if (!selectedNoteRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        audioHaptics.trigger("toggle");
        setShowToolbar((open) => !open);
        return;
      }

      if (!editor || !editor.isFocused || selectedNoteRef.current?.locked) return;

      // CMD + K: Edit link or convert selected text into a link (otherwise Command Palette opens)
      if (!e.shiftKey && !e.altKey && e.code === "KeyK") {
        if (!editor.state.selection.empty || editor.isActive("link")) {
          e.preventDefault();
          e.stopPropagation();
          handleInsertLink();
        }
        return;
      }

      // CMD + ALT + 1/2/3: Toggle Heading 1–3 (avoids Chrome/Safari CMD + SHIFT + H)
      if (e.altKey && !e.shiftKey) {
        const headingLevel =
          e.code === "Digit1" ? 1 : e.code === "Digit2" ? 2 : e.code === "Digit3" ? 3 : null;
        if (headingLevel) {
          e.preventDefault();
          e.stopPropagation();
          audioHaptics.trigger("format");
          editor.chain().focus().toggleHeading({ level: headingLevel }).run();
          return;
        }
      }

      if (!e.shiftKey || e.altKey) return;

      if (e.code === "Digit7") {
        e.preventDefault();
        e.stopPropagation();
        audioHaptics.trigger("format");
        editor.chain().focus().toggleOrderedList().run();
      } else if (e.code === "Digit8") {
        e.preventDefault();
        e.stopPropagation();
        audioHaptics.trigger("format");
        editor.chain().focus().toggleBulletList().run();
      } else if (e.code === "Digit9") {
        e.preventDefault();
        e.stopPropagation();
        audioHaptics.trigger("format");
        editor.chain().focus().toggleTaskList().run();
      } else if (e.code === "KeyY") {
        e.preventDefault();
        e.stopPropagation();
        audioHaptics.trigger("format");
        editor.chain().focus().toggleHighlight().run();
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [editor, handleInsertLink]);

  // Dismiss the compact action menu on outside click or Escape, and provide
  // minimal keyboard navigation (arrows/Home/End) for its menu items.
  useEffect(() => {
    if (!showMoreMenu) return;
    const menuItems = () =>
      Array.from(moreMenuListRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

    requestAnimationFrame(() => {
      menuItems()[0]?.focus();
    });

    const onPointerDown = (event: PointerEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMoreMenu(false);
        moreButtonRef.current?.focus();
        return;
      }
      if (event.key === "Tab") {
        setShowMoreMenu(false);
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      const list = menuItems();
      if (!list.length) return;
      event.preventDefault();
      const current = list.indexOf(document.activeElement as HTMLElement);
      let next = current < 0 ? 0 : current;
      if (event.key === "ArrowDown") next = (current + 1 + list.length) % list.length;
      else if (event.key === "ArrowUp") next = (current - 1 + list.length) % list.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = list.length - 1;
      list[next]?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showMoreMenu]);

  // Close the link popover on outside click / Escape and trap Tab focus inside.
  useEffect(() => {
    if (!showLinkModal) return;

    requestAnimationFrame(() => {
      linkInputRef.current?.focus();
    });

    const onPointerDown = (event: PointerEvent) => {
      if (!linkModalRef.current?.contains(event.target as Node)) {
        closeLinkModal();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLinkModal();
        return;
      }
      if (event.key !== "Tab" || !linkModalRef.current) return;
      const focusable = Array.from(
        linkModalRef.current.querySelectorAll<HTMLElement>(
          'input:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !linkModalRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !linkModalRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showLinkModal, closeLinkModal]);

  // Dismiss the floating link action card on Escape.
  useEffect(() => {
    if (!hoveredLink) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setHoveredLink(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hoveredLink]);

  // Keep the wrapping title height in sync with its content / selected note.
  useEffect(() => {
    resizeTitleInput();
  }, [selectedNote?.id, selectedNote?.title, resizeTitleInput]);

  // Jump straight into the title when a fresh, empty note is created or
  // selected — pressing N should let the user type immediately.
  useEffect(() => {
    const previous = previousNoteId.current;
    previousNoteId.current = selectedNote?.id ?? null;
    if (!selectedNote || selectedNote.id === previous) return;
    const bodyIsEmpty = !selectedNote.body || selectedNote.body === "<p></p>";
    if (!selectedNote.title && bodyIsEmpty) {
      requestAnimationFrame(() => titleInputRef.current?.focus());
    }
  }, [selectedNote]);

  // Floating link hover card state handlers
  const handleEditorMouseMove = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    const link = target?.closest("a.editor-link") || target?.closest(".tiptap a");
    if (link && editorContainerRef.current) {
      if (linkHoverTimeoutRef.current) {
        clearTimeout(linkHoverTimeoutRef.current);
        linkHoverTimeoutRef.current = null;
      }
      const safeHref = sanitizeUrl(link.getAttribute("href"));
      if (!safeHref) return;
      const rect = link.getBoundingClientRect();
      const containerRect = editorContainerRef.current.getBoundingClientRect();

      const top = rect.bottom - containerRect.top + editorContainerRef.current.scrollTop + 6;
      const left = Math.max(
        12,
        Math.min(
          containerRect.width - 290,
          rect.left - containerRect.left + rect.width / 2 - 120
        )
      );

      setHoveredLink((prev) => {
        if (prev?.href === safeHref && Math.abs(prev.top - top) < 4 && Math.abs(prev.left - left) < 4) {
          return prev;
        }
        return {
          href: safeHref,
          text: link.textContent || safeHref,
          top,
          left,
        };
      });
    }
  }, []);

  const handleEditorMouseLeave = useCallback(() => {
    if (linkHoverTimeoutRef.current) clearTimeout(linkHoverTimeoutRef.current);
    linkHoverTimeoutRef.current = setTimeout(() => {
      setHoveredLink(null);
    }, 280);
  }, []);

  const handleCardMouseEnter = useCallback(() => {
    if (linkHoverTimeoutRef.current) {
      clearTimeout(linkHoverTimeoutRef.current);
      linkHoverTimeoutRef.current = null;
    }
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    if (linkHoverTimeoutRef.current) clearTimeout(linkHoverTimeoutRef.current);
    linkHoverTimeoutRef.current = setTimeout(() => {
      setHoveredLink(null);
    }, 280);
  }, []);

  const previousSelectedNoteId = useRef<string | null>(selectedNote?.id ?? null);
  if (previousSelectedNoteId.current !== (selectedNote?.id ?? null)) {
    previousSelectedNoteId.current = selectedNote?.id ?? null;
    if (hoveredLink) {
      setHoveredLink(null);
    }
  }

  // All folders available for dropdown (keep current folder as fallback if needed)
  const allFolders =
    selectedNote?.folder && !folders.includes(selectedNote.folder)
      ? [...folders, selectedNote.folder]
      : folders;

  // Compute stats reactively so the footer updates immediately when the
  // selected note (or the document content) changes.
  const plainText = useEditorState({
    editor,
    selector: ({ editor: ed }) => ed?.getText() ?? "",
  }) ?? "";
  const { words, readingTime } = calculateStats(plainText);

  // Empty state when no note is selected
  if (!selectedNote) {
    return (
      <section
        className={`flex h-full flex-1 flex-col items-center justify-center bg-[var(--editor,#fbf8f0)] p-6 text-center ${
          !selectedId ? "hidden md:flex" : "flex"
        } dark:bg-[#12130f]`}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] text-[var(--accent,#b8452c)] shadow-sm dark:border-white/10 dark:bg-[#1a1b15]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.75 3.25h8l5 5v12.5h-13z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M13.75 3.25v5h5M8.75 12h5.5M8.75 15.5h3.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold [text-wrap:balance] text-[var(--ink,#191712)] dark:text-[#f4f0e6]">
          No note selected
        </h2>
        <p className="mt-1 max-w-xs text-xs [text-wrap:pretty] text-[var(--muted,#5f594c)] dark:text-neutral-400">
          Select a note from the library, press <kbd className="font-mono font-medium">N</kbd>, or drop a Markdown file.
        </p>
        <button
          type="button"
          onClick={() => createNote()}
          className="mt-4 rounded-[8px] bg-[var(--accent,#b8452c)] px-4 py-2 text-xs font-semibold text-[var(--accent-fg,#ffffff)] shadow-sm transition hover:opacity-90 active:scale-95"
        >
          Create note
        </button>
      </section>
    );
  }

  return (
    <section
      className={`relative flex h-full flex-1 min-w-0 flex-col bg-[var(--editor,#fbf8f0)] ${
        !selectedId ? "hidden md:flex" : "flex"
      } text-left dark:bg-[#12130f]`}
    >
      {/* 1. Editor Header Bar */}
      <header className="flex items-center justify-between gap-2 border-b border-[var(--line,rgba(25,23,18,0.08))] px-3 py-2.5 sm:px-4 dark:border-white/5">
        <div className="flex min-w-0 items-center gap-2">
          {/* Back button (for mobile or single-pane view) */}
          <button
            type="button"
            onClick={() => selectNote(null)}
            className="hit-target flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] md:hidden dark:text-neutral-400 dark:hover:text-white"
            aria-label="Back to notes list"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path
                d="m12 4.5-5.5 5.5 5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Folder Pill Selector */}
          <div className="relative">
            <select
              value={selectedNote.folder}
              disabled={Boolean(selectedNote.locked)}
              onChange={(e) => updateNoteFolder(selectedNote.id, e.target.value)}
              className={`h-7 appearance-none rounded-md border border-[var(--line,rgba(25,23,18,0.12))] bg-[var(--surface,#fffdf8)] py-1 pr-6 pl-2.5 text-xs font-medium text-[var(--ink,#191712)] shadow-2xs outline-hidden dark:border-white/10 dark:bg-[#1a1b15] dark:text-neutral-300 ${
                selectedNote.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
              aria-label="Select folder"
            >
              {allFolders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
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

          {/* Tag Pill Input */}
          <div
            className={`flex h-7 items-center rounded-md border border-[var(--line,rgba(25,23,18,0.1))] bg-[var(--surface,#fffdf8)] px-2 text-xs shadow-2xs transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-[var(--accent,#b8452c)] focus-within:ring-1 focus-within:ring-[var(--accent,#b8452c)]/20 max-[359px]:hidden dark:border-white/10 dark:bg-[#1a1b15] ${
              selectedNote.locked ? "opacity-60" : ""
            }`}
          >
            <span className="text-[var(--accent,#b8452c)] font-semibold text-xs select-none">#</span>
            <input
              type="text"
              value={selectedNote.tag || ""}
              disabled={Boolean(selectedNote.locked)}
              onChange={(e) => updateNoteTag(selectedNote.id, e.target.value)}
              placeholder="tag"
              maxLength={24}
              aria-label="Note tag"
              style={{
                width: `${Math.min(Math.max((selectedNote.tag || "").length, 3) + 1, 14)}ch`,
              }}
              className={`min-w-[2.5rem] max-w-[6.5rem] sm:max-w-[8.5rem] bg-transparent pl-1 text-xs font-medium text-[var(--ink,#191712)] outline-hidden placeholder:text-[var(--muted,#5f594c)] placeholder:font-normal dark:text-neutral-200 ${
                selectedNote.locked ? "cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>

        {/* Action Controls: Star, Pin, and Consolidated ••• Overflow Menu */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {/* Star Note */}
          <Tooltip label={selectedNote.starred ? "Unstar note" : "Star note"}>
            <button
              type="button"
              onClick={() => toggleStar(selectedNote.id)}
              className={`hit-target flex h-7 w-7 items-center justify-center rounded-md active:scale-90 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                selectedNote.starred
                  ? "text-[var(--star-gold,#d97706)]"
                  : "text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--star-gold,#d97706)] dark:text-neutral-400"
              }`}
              aria-label="Star note"
              aria-pressed={selectedNote.starred}
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
          </Tooltip>

          {/* Pin Note */}
          <Tooltip label={selectedNote.pinned ? "Unpin note" : "Pin note to top"} shortcut="⌘P">
            <button
              type="button"
              onClick={() => togglePin(selectedNote.id)}
              className={`hit-target flex h-7 w-7 items-center justify-center rounded-md active:scale-90 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                selectedNote.pinned
                  ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)]"
                  : "text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
              }`}
              aria-label="Pin note"
              aria-pressed={selectedNote.pinned}
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
          </Tooltip>

          {/* Full Screen Zen Mode */}
          <Tooltip label={zenMode ? "Exit full screen" : "Full screen focus mode"} shortcut="⌘.">
            <button
              type="button"
              onClick={toggleZenMode}
              className={`hit-target flex h-7 w-7 items-center justify-center rounded-md active:scale-90 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                zenMode
                  ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)] ring-1 ring-[var(--accent,#b8452c)]/30 font-semibold"
                  : "text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
              }`}
              aria-label={zenMode ? "Exit full screen" : "Full screen mode"}
              aria-pressed={zenMode}
            >
              {zenMode ? (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 3.25v4.25H3.25M12.5 3.25v4.25h4.25M7.5 16.75v-4.25H3.25M12.5 16.75v-4.25h4.25"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3.25 7.5V3.25H7.5M12.5 3.25h4.25V7.5M16.75 12.5v4.25H12.5M7.5 16.75H3.25V12.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </Tooltip>

          {/* Formatting Tools Pill Toggle */}
          <FormattingToolsToggle
            open={showToolbar}
            onToggle={() => {
              audioHaptics.trigger("toggle");
              setShowToolbar((open) => !open);
            }}
            shortcut="⌘/"
          />

          {/* Consolidated Actions Overflow Menu (•••) */}
          <div ref={moreMenuRef} className="relative">
            <Tooltip label="More note actions">
              <button
                ref={moreButtonRef}
                type="button"
                onClick={() => setShowMoreMenu((open) => !open)}
                className={`hit-target flex h-7 w-7 items-center justify-center rounded-md transition ${
                  showMoreMenu
                    ? "bg-[var(--hover,rgba(25,23,18,0.08))] text-[var(--ink,#191712)] dark:text-white"
                    : "text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400"
                }`}
                aria-label="More note actions"
                aria-haspopup="menu"
                aria-expanded={showMoreMenu}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="3" cy="8" r="1.15" />
                  <circle cx="8" cy="8" r="1.15" />
                  <circle cx="13" cy="8" r="1.15" />
                </svg>
              </button>
            </Tooltip>

            {showMoreMenu && (
              <div
                ref={moreMenuListRef}
                role="menu"
                aria-label="Note actions"
                className="absolute top-full right-0 z-30 mt-1 w-52 overflow-hidden rounded-[12px] border border-[var(--line-strong,rgba(25,23,18,0.18))] bg-[var(--surface,#fffdf8)] py-1.5 shadow-[0_16px_40px_-12px_rgba(45,36,22,0.3)] dark:border-white/15 dark:bg-[#1f201a] dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Lock note */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    toggleLock(selectedNote.id);
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    {selectedNote.locked ? (
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="text-amber-600 dark:text-amber-400">
                        <rect x="3.5" y="6.5" width="9" height="7" rx="1.5" />
                        <path d="M5.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <rect x="3.5" y="6.5" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M5.5 6.5V4.5a2.5 2.5 0 0 1 5 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    )}
                    <span>{selectedNote.locked ? "Unlock note" : "Lock note (read-only)"}</span>
                  </div>
                  <kbd className="font-mono text-[9px] text-[var(--muted,#5f594c)] opacity-60">⌥⇧L</kbd>
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    duplicateNote(selectedNote.id);
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <rect x="5.5" y="5.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M3.5 10.5H3a1.5 1.5 0 0 1-1.5-1.5V3.5A1.5 1.5 0 0 1 3 2h5.5a1.5 1.5 0 0 1 1.5 1.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <span>Duplicate note</span>
                  </div>
                  <kbd className="font-mono text-[9px] text-[var(--muted,#5f594c)] opacity-60">⌘D</kbd>
                </button>

                {/* Copy Markdown */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    await copyCurrentNote();
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M5.5 3.5h5M5.5 7h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                    <span>Copy as Markdown</span>
                  </div>
                </button>

                {/* Download Markdown */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    downloadCurrentNote();
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-[var(--ink-2,#3a352b)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2.5v7.25M5.25 7.25 8 10l2.75-2.75M3 11.5v1.25c0 .4.35.75.75.75h8.5c.4 0 .75-.35.75-.75V11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Download .md file</span>
                  </div>
                </button>

                <div className="my-1 border-t border-[var(--line,rgba(25,23,18,0.08))] dark:border-white/10" />

                {/* Move to Trash */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    deleteNote(selectedNote.id);
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-[var(--danger,#a53c27)] hover:bg-[var(--danger,#a53c27)]/10"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.25 4.75h9.5M6.25 4.75V3.5c0-.41.34-.75.75-.75h2c.41 0 .75.34.75.75v1.25M4.5 4.75l.5 8.25c.02.41.36.75.77.75h4.46c.41 0 .75-.34.77-.75l.5-8.25"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Move to trash</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Lock Banner (if note is locked) */}
      {selectedNote.locked && (
        <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/[0.08] px-3 py-2 sm:px-6 dark:border-amber-400/20 dark:bg-amber-400/10">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-900 dark:text-amber-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300 shrink-0">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3.5" y="6.5" width="9" height="7" rx="1.5" />
                <path d="M5.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <span>This note is locked to prevent accidental edits (read-only).</span>
          </div>
          <button
            type="button"
            onClick={() => toggleLock(selectedNote.id)}
            className="inline-flex items-center gap-1.5 rounded-[6px] border border-amber-600/30 bg-[var(--surface,#fffdf8)] px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs transition hover:bg-amber-50 active:scale-95 dark:border-amber-400/30 dark:bg-[#1a1b15] dark:text-amber-200 dark:hover:bg-amber-950/40"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <rect x="3.5" y="6.5" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5.5 6.5V4.5a2.5 2.5 0 0 1 5 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Unlock note
          </button>
        </div>
      )}

      {/* Link Input Modal Popover */}
      {showLinkModal && (
        <div
          ref={linkModalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Insert link"
          className="absolute top-14 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[420px] -translate-x-1/2 rounded-[12px] border border-[var(--border-strong,rgba(25,23,18,0.18))] bg-[var(--surface-card,#fffdf8)] p-2.5 shadow-xl backdrop-blur-md sm:p-3 dark:border-white/15 dark:bg-[#1f201a]"
        >
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <span className="hidden text-[var(--muted,#5f594c)] sm:inline-flex">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6.75 9.25a3.25 3.25 0 0 0 4.6 0l2.15-2.15a3.25 3.25 0 0 0-4.6-4.6L7.4 3.99" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.25 6.75a3.25 3.25 0 0 0-4.6 0L2.5 8.9a3.25 3.25 0 0 0 4.6 4.6l1.5-1.49" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                if (linkError) setLinkError(null);
              }}
              placeholder="Paste or type a link"
              autoFocus
              aria-label="Link URL"
              aria-invalid={Boolean(linkError)}
              aria-describedby={linkError ? "link-url-error" : undefined}
              inputMode="url"
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmLink();
                if (e.key === "Escape") closeLinkModal();
              }}
              className="h-8 min-w-0 flex-1 basis-full rounded-md border border-[var(--line,rgba(25,23,18,0.15))] bg-transparent px-2.5 text-base sm:text-xs text-[var(--ink,#191712)] outline-none focus:border-[var(--accent,#b8452c)] sm:basis-auto dark:border-white/10 dark:text-[#f4f0e6]"
            />
            <div className="flex w-full items-center justify-end gap-1.5 sm:w-auto">
              <button
                type="button"
                onClick={confirmLink}
                className="rounded-md bg-[var(--accent,#b8452c)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-fg,#ffffff)] hover:opacity-90 active:scale-95 transition"
              >
                {editor?.isActive("link") ? "Save link" : "Insert link"}
              </button>
              {editor?.isActive("link") && (
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                    closeLinkModal();
                  }}
                  className="rounded-md border border-[var(--line,rgba(25,23,18,0.15))] px-2.5 py-1.5 text-xs text-[var(--danger,#a53c27)] hover:bg-[var(--danger,#a53c27)]/10 active:scale-95 transition"
                >
                  Unlink
                </button>
              )}
              <button
                type="button"
                onClick={closeLinkModal}
                className="rounded-md px-2 py-1.5 text-xs text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-400"
              >
                Cancel
              </button>
            </div>
          </div>
          {linkError && (
            <p
              id="link-url-error"
              role="alert"
              className="mt-1.5 text-[11px] font-medium text-[var(--danger,#a53c27)] dark:text-[#ff8a75]"
            >
              {linkError}
            </p>
          )}
        </div>
      )}

      {/* 3. Serene Writing Canvas + Floating Formatting Dock */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={editorContainerRef}
          onMouseMove={handleEditorMouseMove}
          onMouseLeave={handleEditorMouseLeave}
          className={`relative flex-1 overflow-y-auto ${
            zenMode
              ? "px-6 py-8 sm:px-12 md:px-20 lg:px-28"
              : isEmbedded
              ? "px-6 pt-6 sm:px-8 sm:pt-7"
              : "px-4 pt-6 sm:px-6 sm:pt-8 md:px-12 lg:px-16"
          } ${showToolbar ? "pb-20" : "pb-8"} text-left`}
        >
        {/* Contextual Bubble Formatting Popover on text selection */}
        <BubbleFormattingMenu
          editor={editor}
          containerRef={editorContainerRef}
          onInsertLink={handleInsertLink}
          zenMode={zenMode}
        />
        {/* Floating Exit Full Screen Pill (in Zen mode) */}
        {zenMode && (
          <div className="sticky top-2 z-20 mb-6 flex justify-center animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              type="button"
              onClick={toggleZenMode}
              className="flex items-center gap-1.5 rounded-full border border-[var(--line-strong,rgba(25,23,18,0.18))] bg-[var(--surface-card,#fffdf8)]/95 px-3.5 py-1 text-xs font-medium text-[var(--ink,#191712)] shadow-md backdrop-blur-md transition hover:bg-[var(--surface-card,#fffdf8)] hover:scale-105 active:scale-95 dark:border-white/15 dark:bg-[#1f201a]/95 dark:text-[#f4f0e6]"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Exit full screen</span>
              <kbd className="ml-1 rounded bg-[var(--surface-muted,#f1ecdf)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted,#5f594c)] dark:bg-white/10 dark:text-neutral-400">Esc</kbd>
            </button>
          </div>
        )}
        {/* Floating Link Action Card */}
        {hoveredLink && (() => {
          const safeHoveredHref = sanitizeUrl(hoveredLink.href);
          if (!safeHoveredHref) return null;
          return (
          <div
            role="region"
            aria-label="Link actions"
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            style={{
              top: `${hoveredLink.top}px`,
              left: `${hoveredLink.left}px`,
            }}
            className="absolute z-30 flex items-center gap-1.5 rounded-[10px] border border-[var(--line-strong,rgba(25,23,18,0.18))] bg-[var(--surface-card,#fffdf8)] px-2.5 py-1.5 shadow-[0_12px_28px_-6px_rgba(45,36,22,0.22)] backdrop-blur-md dark:border-white/15 dark:bg-[#1f201a] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="flex h-5 w-5 items-center justify-center text-[var(--muted,#5f594c)] dark:text-neutral-400">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
                <path d="M1.75 8h12.5M8 1.75c1.6 2 2.25 4 2.25 6.25s-.65 4.25-2.25 6.25c-1.6-2-2.25-4-2.25-6.25S6.4 3.75 8 1.75z" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </span>

            <a
              href={safeHoveredHref}
              target="_blank"
              rel="noopener noreferrer"
              className="max-w-[170px] sm:max-w-[220px] truncate font-mono text-xs text-[var(--accent,#b8452c)] hover:underline dark:text-[#ea8a67]"
              title={safeHoveredHref}
            >
              {safeHoveredHref.replace(/^https?:\/\//i, "")}
            </a>

            <div className="mx-0.5 h-3.5 w-[1px] bg-[var(--line,rgba(25,23,18,0.12))] dark:bg-white/15" />

            <button
              type="button"
              onClick={() => {
                audioHaptics.trigger("tap");
                window.open(safeHoveredHref, "_blank", "noopener,noreferrer");
              }}
              className="flex items-center gap-1 rounded-[5px] bg-[var(--accent,#b8452c)] px-2 py-1 text-[11px] font-semibold text-[var(--accent-fg,#ffffff)] shadow-2xs hover:opacity-90 active:scale-95 transition"
              title="Open in new browser tab"
            >
              <span>Open</span>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M6 3.5h6.5V10M12.5 3.5 3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(safeHoveredHref);
                  audioHaptics.trigger("tap");
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 1600);
                } catch {}
              }}
              className="flex h-6 items-center gap-1 rounded-[5px] px-1.5 text-[11px] font-medium text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white transition"
              title="Copy link address"
            >
              {linkCopied ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <path d="m3.5 8.5 3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Copied
                </span>
              ) : (
                <span>Copy</span>
              )}
            </button>

            {!selectedNote.locked && (
              <button
                type="button"
                onClick={() => {
                  setLinkUrl(safeHoveredHref);
                  setLinkError(null);
                  setShowLinkModal(true);
                  setHoveredLink(null);
                }}
                className="flex h-6 items-center rounded-[5px] px-1.5 text-[11px] font-medium text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white transition"
                title="Edit link destination"
              >
                Edit
              </button>
            )}

            <button
              type="button"
              onClick={() => setHoveredLink(null)}
              className="hit-target flex h-5 w-5 items-center justify-center rounded-[4px] text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400"
              title="Dismiss"
              aria-label="Dismiss"
            >
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          );
        })()}

        <div className="mx-auto max-w-[65ch] text-left transition-all duration-300">
          {/* Note Title Input — auto-growing textarea mathematically aligned with body */}
          <textarea
            ref={titleInputRef}
            rows={1}
            readOnly={Boolean(selectedNote.locked)}
            value={selectedNote.title}
            onChange={(e) => {
              if (selectedNote.locked) return;
              updateNoteTitle(selectedNote.id, e.target.value);
              resizeTitleInput();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !selectedNote.locked) {
                e.preventDefault();
                editor?.commands.focus("start");
              }
            }}
            placeholder="Title"
            className={`mb-4 block w-full resize-none overflow-hidden p-0 m-0 border-0 outline-none ring-0 shadow-none bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight [text-wrap:balance] text-left text-[var(--ink,#191712)] placeholder:text-[var(--faint,#595245)]/40 focus:ring-0 focus:outline-none dark:text-[#f4f0e6] dark:placeholder:text-neutral-600 leading-tight ${
              selectedNote.locked ? "cursor-default select-text" : ""
            }`}
            aria-label="Note title"
          />

          {/* Tiptap Rich Editor Body */}
          <div className="min-h-[400px] text-left">
            <EditorContent editor={editor} className="text-left" />
          </div>
        </div>
        </div>

        {/* Floating Bottom Formatting Bubble */}
        {showToolbar && (
          <FormattingFloatingDock>
            <FormattingToolbarPill
              editor={editor}
              onInsertLink={handleInsertLink}
              isLocked={Boolean(selectedNote.locked)}
            />
          </FormattingFloatingDock>
        )}
      </div>

      {/* 4. Editor Status Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[var(--line,rgba(25,23,18,0.08))] px-3 py-2 text-[11px] text-[var(--muted,#5f594c)] sm:px-4 dark:border-white/5 dark:text-neutral-400">
        <div className="flex items-center gap-3 text-[11px] tabular-nums">
          <span>{words} {words === 1 ? "word" : "words"}</span>
          <span>{readingTime}</span>
        </div>

        {/* Real save state indicator + Locked indicator */}
        <div className="flex items-center gap-2">
          {selectedNote.locked && (
            <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3.5" y="6.5" width="9" height="7" rx="1.5" />
                <path d="M5.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              </svg>
              Locked (read-only)
            </span>
          )}
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                saveStatus === "saving"
                  ? "bg-amber-500 animate-pulse"
                  : saveStatus === "saved"
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            />
            <span className="text-[11px]">
              {saveStatus === "saving"
                ? "Saving…"
                : saveStatus === "saved"
                ? "All changes saved locally"
                : "Storage offline"}
            </span>
          </div>
        </div>

        {/* Keyboard hints (hidden in the narrow embedded demo) */}
        {!isEmbedded && (
          <div className="hidden items-center gap-3 text-[11px] opacity-70 sm:flex">
            <span><kbd className="font-mono">⌘K</kbd> command</span>
            <span><kbd className="font-mono">⌘S</kbd> save</span>
            <span><kbd className="font-mono">⌘D</kbd> duplicate</span>
            <span><kbd className="font-mono">⌘.</kbd> zen</span>
          </div>
        )}
      </footer>
    </section>
  );
}
