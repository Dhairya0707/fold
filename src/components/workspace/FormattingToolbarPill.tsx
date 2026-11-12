"use client";

import React from "react";
import type { Editor } from "@tiptap/react";
import { Tooltip } from "./CraftTooltip";
import { audioHaptics } from "@/lib/audio-haptics";

export const TOOLBAR_DIVIDER_CLASS =
  "mx-1 h-3.5 w-[1px] shrink-0 bg-[var(--line,rgba(25,23,18,0.12))] dark:bg-white/15";

interface FormattingFloatingDockProps {
  children: React.ReactNode;
}

/**
 * Frosted floating formatting dock anchored over the bottom of the writing
 * canvas so the editor opens directly below the header with zero blank side rails.
 */
export function FormattingFloatingDock({ children }: FormattingFloatingDockProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3">
      <div
        role="toolbar"
        aria-label="Text formatting toolbar"
        className="pointer-events-auto relative flex max-w-full items-center gap-0.5 overflow-x-auto rounded-[13px] border border-[var(--line-strong,rgba(25,23,18,0.16))] bg-[var(--surface-card,#fffdf8)]/92 px-1.5 py-1 shadow-[0_12px_32px_-8px_rgba(45,36,22,0.22),0_2px_6px_-1px_rgba(45,36,22,0.08)] backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-white/15 dark:bg-[#1c1d17]/90 dark:shadow-[0_14px_36px_-8px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.04)] animate-in fade-in slide-in-from-bottom-2 duration-150"
      >
        {/* Top specular highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/85 to-transparent dark:via-white/20"
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  );
}

interface FormattingToolbarPillProps {
  editor: Editor | null;
  onInsertLink: () => void;
  isLocked?: boolean;
}

export function FormattingToolbarPill({
  editor,
  onInsertLink,
  isLocked = false,
}: FormattingToolbarPillProps) {
  if (!editor) return null;

  const btnClass = (active: boolean, disabled: boolean = false) =>
    `hit-target flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-xs transition-all duration-120 ease-[cubic-bezier(0.16,1,0.3,1)] ${
      disabled || isLocked
        ? "opacity-30 cursor-not-allowed text-[var(--faint,#595245)] dark:text-[#928c7d]"
        : active
        ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)] font-semibold shadow-2xs active:scale-90"
        : "text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] active:scale-90 dark:text-neutral-400 dark:hover:text-[#f4f0e6]"
    }`;

  const triggerAction = (action: () => void, haptic: "format" | "tap" = "format") => {
    if (isLocked) return;
    audioHaptics.trigger(haptic);
    action();
  };

  const canUndo = Boolean(editor.can().undo());
  const canRedo = Boolean(editor.can().redo());

  return (
    <>
      {/* Undo */}
      <Tooltip label="Undo" shortcut="⌘Z">
        <button
          type="button"
          disabled={!canUndo || isLocked}
          onClick={() => triggerAction(() => editor.chain().focus().undo().run(), "tap")}
          className={btnClass(false, !canUndo)}
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

      {/* Redo */}
      <Tooltip label="Redo" shortcut="⌘⇧Z">
        <button
          type="button"
          disabled={!canRedo || isLocked}
          onClick={() => triggerAction(() => editor.chain().focus().redo().run(), "tap")}
          className={btnClass(false, !canRedo)}
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

      {/* Bold */}
      <Tooltip label="Bold" shortcut="⌘B">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => triggerAction(() => editor.chain().focus().toggleBold().run())}
          className={btnClass(editor.isActive("bold"))}
          aria-label="Bold"
          aria-pressed={editor.isActive("bold")}
        >
          <span className="font-semibold text-[13px] leading-none">B</span>
        </button>
      </Tooltip>

      {/* Italic */}
      <Tooltip label="Italic" shortcut="⌘I">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => triggerAction(() => editor.chain().focus().toggleItalic().run())}
          className={btnClass(editor.isActive("italic"))}
          aria-label="Italic"
          aria-pressed={editor.isActive("italic")}
        >
          <span className="italic font-medium text-[13px] leading-none">I</span>
        </button>
      </Tooltip>

      {/* Heading 2 */}
      <Tooltip label="Heading" shortcut="⌘⌥2">
        <button
          type="button"
          disabled={isLocked}
          onClick={() =>
            triggerAction(() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            )
          }
          className={btnClass(editor.isActive("heading", { level: 2 }))}
          aria-label="Heading"
          aria-pressed={editor.isActive("heading", { level: 2 })}
        >
          <span className="font-semibold text-xs leading-none">H</span>
        </button>
      </Tooltip>

      <div className={TOOLBAR_DIVIDER_CLASS} aria-hidden="true" />

      {/* Bullet List */}
      <Tooltip label="Bullet list" shortcut="⌘⇧8">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => triggerAction(() => editor.chain().focus().toggleBulletList().run())}
          className={btnClass(editor.isActive("bulletList"))}
          aria-label="Bullet list"
          aria-pressed={editor.isActive("bulletList")}
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

      {/* Numbered List */}
      <Tooltip label="Numbered list" shortcut="⌘⇧7">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => triggerAction(() => editor.chain().focus().toggleOrderedList().run())}
          className={btnClass(editor.isActive("orderedList"))}
          aria-label="Numbered list"
          aria-pressed={editor.isActive("orderedList")}
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

      {/* Checklist / TaskList */}
      <Tooltip label="Checklist" shortcut="⌘⇧9">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => triggerAction(() => editor.chain().focus().toggleTaskList().run())}
          className={btnClass(editor.isActive("taskList"))}
          aria-label="Checklist"
          aria-pressed={editor.isActive("taskList")}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="m5.5 8 2 2 3.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </Tooltip>

      {/* Quote */}
      <Tooltip label="Blockquote">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => triggerAction(() => editor.chain().focus().toggleBlockquote().run())}
          className={btnClass(editor.isActive("blockquote"))}
          aria-label="Blockquote"
          aria-pressed={editor.isActive("blockquote")}
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

      {/* Code block */}
      <Tooltip label="Code block">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => triggerAction(() => editor.chain().focus().toggleCodeBlock().run())}
          className={btnClass(editor.isActive("codeBlock"))}
          aria-label="Code block"
          aria-pressed={editor.isActive("codeBlock")}
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

      {/* Insert Link */}
      <Tooltip label="Link" shortcut="⌘K">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => triggerAction(onInsertLink, "tap")}
          className={btnClass(editor.isActive("link"))}
          aria-label="Insert link"
          aria-pressed={editor.isActive("link")}
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

      {/* Highlight Text */}
      <Tooltip label="Highlight" shortcut="⌘⇧Y">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => triggerAction(() => editor.chain().focus().toggleHighlight().run())}
          className={btnClass(editor.isActive("highlight"))}
          aria-label="Highlight"
          aria-pressed={editor.isActive("highlight")}
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
    </>
  );
}
