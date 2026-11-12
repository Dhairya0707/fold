"use client";

import React from "react";
import { Tooltip } from "./CraftTooltip";

interface FormattingToolsToggleProps {
  open: boolean;
  onToggle: () => void;
  shortcut?: string;
}

/**
 * Header toggle button for the formatting toolbar pill.
 * Uses a 2-row sliders stroke icon aligned with the editor's 1.3px icon language
 * and expands its touch target on coarse pointers without shifting header bounds.
 */
export function FormattingToolsToggle({
  open,
  onToggle,
  shortcut = "⌘/",
}: FormattingToolsToggleProps) {
  const actionLabel = open ? "Hide formatting tools" : "Show formatting tools";

  return (
    <Tooltip label={actionLabel} shortcut={shortcut}>
      <button
        type="button"
        onClick={onToggle}
        className={`hit-target flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium active:scale-90 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-auto sm:gap-1.5 sm:px-2 ${
          open
            ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)] ring-1 ring-inset ring-[var(--accent,#b8452c)]/25 hover:bg-[var(--accent,#b8452c)]/20"
            : "text-[var(--muted,#5f594c)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] hover:text-[var(--ink,#191712)] dark:text-neutral-400 dark:hover:text-white"
        }`}
        aria-label={actionLabel}
        aria-expanded={open}
        aria-pressed={open}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M2.25 5h6M11.75 5h2M2.25 11h2M7.75 11h6"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <circle cx="10" cy="5" r="1.75" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="6" cy="11" r="1.75" stroke="currentColor" strokeWidth="1.3" />
        </svg>
        <span className="hidden sm:inline">Tools</span>
      </button>
    </Tooltip>
  );
}
