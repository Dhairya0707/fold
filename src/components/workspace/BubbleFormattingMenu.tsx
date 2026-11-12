"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { audioHaptics } from "@/lib/audio-haptics";

interface BubbleFormattingMenuProps {
  editor: Editor | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onInsertLink: () => void;
  /** Zen/fullscreen state. Toggling it re-parents the layout and takes focus. */
  zenMode?: boolean;
}

/** Distance between the selection and the toolbar, and from the container edges. */
const GAP = 8;
const EDGE = 10;
/** Used on the first paint, before the toolbar itself can be measured. */
const FALLBACK_WIDTH = 232;
const FALLBACK_HEIGHT = 38;

type Placement = "top" | "bottom";

interface MenuPosition {
  top: number;
  left: number;
  placement: Placement;
}

/**
 * Anchor to the first visual line of the selection rather than its full bounding
 * box. A multi-line selection spans several rows, and centring on the union of
 * those rows parks the toolbar in the middle of the paragraph instead of above
 * the text the user actually started selecting.
 */
function measureSelectionAnchor(editor: Editor) {
  const { view, state } = editor;
  const { from, to } = state.selection;

  const domSelection = window.getSelection();
  if (domSelection && domSelection.rangeCount > 0 && !domSelection.isCollapsed) {
    const range = domSelection.getRangeAt(0);
    if (view.dom.contains(range.commonAncestorContainer)) {
      const rects = Array.from(range.getClientRects()).filter(
        (rect) => rect.width > 0 || rect.height > 0
      );
      if (rects.length > 0) {
        const firstTop = rects[0].top;
        // getClientRects returns one box per inline run — keep the first line.
        const line = rects.filter((rect) => Math.abs(rect.top - firstTop) < 2);
        const left = Math.min(...line.map((rect) => rect.left));
        const right = Math.max(...line.map((rect) => rect.right));
        const bottom = Math.max(...line.map((rect) => rect.bottom));
        return { top: firstTop, bottom, centerX: (left + right) / 2 };
      }
    }
  }

  // Fallback for cases where the DOM range is unavailable or out of sync.
  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);
  const sameLine = Math.abs(start.top - end.top) < 2;
  return {
    top: start.top,
    bottom: start.bottom,
    centerX: (start.left + (sameLine ? end.right : start.right)) / 2,
  };
}

export function BubbleFormattingMenu({
  editor,
  containerRef,
  onInsertLink,
  zenMode = false,
}: BubbleFormattingMenuProps) {
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [visible, setVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const blurTimer = useRef<number | null>(null);
  const preserveRef = useRef(false);
  const preserveTimer = useRef<number | null>(null);
  const visibleAtPointerDown = useRef(false);

  const show = useCallback(() => {
    visibleRef.current = true;
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    visibleRef.current = false;
    setVisible(false);
  }, []);

  /**
   * The control that toggles zen/fullscreen takes focus away from the editor.
   * The selection itself survives, but an unfocused ProseMirror view stops
   * painting the highlight and fires `blur` — which hides the toolbar. Handing
   * focus back at the existing selection keeps both the highlight and the
   * toolbar alive across the switch.
   *
   * Only does this for a toolbar that was already open: a dismissed toolbar
   * must never resurrect an old selection just because the layout changed.
   */
  const restoreSelectionFocus = useCallback(() => {
    if (!editor) return;
    if (!visibleRef.current && !preserveRef.current) return;
    if (editor.state.selection.empty) return;
    if (editor.view.hasFocus()) return;
    editor.commands.focus(undefined, { scrollIntoView: false });
  }, [editor]);

  /**
   * Marks a zen/fullscreen switch that began with the toolbar on screen.
   *
   * Snapshotting at pointerdown is what makes this precise: the editor blurs
   * (and a layout transaction can hide the toolbar) before React commits the
   * zen state, so by the time the effect runs the toolbar may already be gone.
   */
  const beginTransition = useCallback(() => {
    if (!visibleAtPointerDown.current) return;
    preserveRef.current = true;
    if (preserveTimer.current) window.clearTimeout(preserveTimer.current);
    preserveTimer.current = window.setTimeout(() => {
      preserveRef.current = false;
    }, 2500);
  }, []);

  useEffect(() => {
    const snapshot = () => {
      // A fresh pointer interaction starts a fresh intent: forget the previous
      // transition's preservation window so a dismissed toolbar stays dismissed.
      visibleAtPointerDown.current = visibleRef.current;
      preserveRef.current = false;
      if (preserveTimer.current) window.clearTimeout(preserveTimer.current);
    };
    document.addEventListener("pointerdown", snapshot, true);
    return () => document.removeEventListener("pointerdown", snapshot, true);
  }, []);

  /**
   * Resolve the toolbar position in the scroll container's content coordinate
   * space (the same space `scrollTop` and `position: absolute` use).
   */
  const computePosition = useCallback((): MenuPosition | null => {
    if (!editor || !containerRef.current) return null;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) return null;
    if (editor.state.selection.empty) return null;

    const anchor = measureSelectionAnchor(editor);

    const menuWidth = menuRef.current?.offsetWidth || FALLBACK_WIDTH;
    const menuHeight = menuRef.current?.offsetHeight || FALLBACK_HEIGHT;

    // The visible window inside the scroller, expressed in content coordinates.
    const scrollTop = container.scrollTop;
    const visibleTop = scrollTop + EDGE;
    const visibleBottom = scrollTop + container.clientHeight - EDGE;

    const anchorTop = anchor.top - containerRect.top + scrollTop;
    const anchorBottom = anchor.bottom - containerRect.top + scrollTop;

    // If the selection has scrolled completely outside the container's visible bounds,
    // don't leave the toolbar artificially pinned to the container edge.
    if (anchorBottom < visibleTop || anchorTop > visibleBottom) {
      return null;
    }

    // Flip below the selection when there is not enough room above it, so a
    // selection on the first line never pushes the toolbar off-screen.
    const placement: Placement =
      anchorTop - visibleTop >= menuHeight + GAP ? "top" : "bottom";

    const rawTop =
      placement === "top" ? anchorTop - menuHeight - GAP : anchorBottom + GAP;

    const top = Math.min(
      Math.max(rawTop, visibleTop),
      Math.max(visibleTop, visibleBottom - menuHeight)
    );

    // Keep the toolbar fully inside the container and viewport without clipping.
    const half = menuWidth / 2;
    let left: number;
    if (container.clientWidth < menuWidth + 2 * EDGE) {
      // Container width is smaller than menuWidth + 2*EDGE:
      // Shift so the toolbar stays within viewport bounds (EDGE .. window.innerWidth - EDGE)
      const idealViewportCenter = containerRect.left + container.clientWidth / 2;
      const clampedViewportCenter = Math.min(
        Math.max(idealViewportCenter, half + EDGE),
        window.innerWidth - half - EDGE
      );
      left = clampedViewportCenter - containerRect.left;
    } else {
      const minLeft = half + EDGE;
      const maxLeft = container.clientWidth - half - EDGE;
      left = Math.min(
        Math.max(anchor.centerX - containerRect.left, minLeft),
        maxLeft
      );
    }

    return { top, left, placement };
  }, [editor, containerRef]);

  useEffect(() => {
    if (!editor) return;

    let frame = 0;

    const syncPosition = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = computePosition();
        if (!next) {
          hide();
          return;
        }
        setPosition(next);
        show();
      });
    };

    const refreshFromSelection = () => {
      const { state, view } = editor;
      if (state.selection.empty || !view.hasFocus()) {
        hide();
        return;
      }
      syncPosition();
    };

    /**
     * Entering fullscreen/zen mode, resizing the window, or reflowing the editor
     * column moves the selection without firing a transaction, so the toolbar has
     * to re-measure from scratch. Only repositions a toolbar that is already on
     * screen — it must not resurrect one the user dismissed.
     */
    const refreshGeometry = () => {
      if (!visibleRef.current) return;
      syncPosition();
    };

    editor.on("selectionUpdate", refreshFromSelection);
    editor.on("transaction", refreshFromSelection);
    editor.on("focus", refreshFromSelection);

    const handleBlur = () => {
      if (blurTimer.current) window.clearTimeout(blurTimer.current);
      // Small timeout to allow clicking menu items without immediately vanishing
      blurTimer.current = window.setTimeout(() => {
        // Focus can come straight back — entering fullscreen briefly moves it
        // off the editor. That is not a dismissal, so keep the toolbar.
        if (editor.view.hasFocus()) return;
        if (menuRef.current?.contains(document.activeElement)) return;
        hide();
      }, 180);
    };
    editor.on("blur", handleBlur);

    /**
     * A fullscreen transition hands focus to the browser window chrome and
     * blurs the editor, so the toolbar dismisses itself even though the text is
     * still selected. Claim the selection back, then re-measure.
     */
    const handleFullscreenChange = () => {
      // Fullscreen change can happen via keyboard shortcut (⌘.) or browser gesture
      // without a pointerdown event. Ensure preservation is active so blur doesn't kill the toolbar.
      preserveRef.current = true;
      if (preserveTimer.current) window.clearTimeout(preserveTimer.current);
      preserveTimer.current = window.setTimeout(() => {
        preserveRef.current = false;
      }, 2500);

      restoreSelectionFocus();
      refreshGeometry();
    };

    window.addEventListener("resize", refreshGeometry);
    window.addEventListener("orientationchange", refreshGeometry);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    // Keep toolbar attached to the selection during scrolling and flip/hide if scrolled out of view
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", refreshGeometry, { passive: true });
    }

    // Catches the zen-mode pane collapse and the animated column re-centre,
    // which no window-level event reports.
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(refreshGeometry) : null;
    if (observer) {
      if (containerRef.current) observer.observe(containerRef.current);
      observer.observe(editor.view.dom);
    }

    return () => {
      cancelAnimationFrame(frame);
      if (blurTimer.current) window.clearTimeout(blurTimer.current);
      editor.off("selectionUpdate", refreshFromSelection);
      editor.off("transaction", refreshFromSelection);
      editor.off("focus", refreshFromSelection);
      editor.off("blur", handleBlur);
      window.removeEventListener("resize", refreshGeometry);
      window.removeEventListener("orientationchange", refreshGeometry);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      if (container) {
        container.removeEventListener("scroll", refreshGeometry);
      }
      observer?.disconnect();
    };
  }, [editor, containerRef, computePosition, hide, show, restoreSelectionFocus]);

  // Zen mode also switches without a native fullscreen event (the CSS-only
  // fallback, or a denied request), so restore focus on the state change too.
  const previousZenMode = useRef(zenMode);
  useEffect(() => {
    if (previousZenMode.current === zenMode) return;
    previousZenMode.current = zenMode;
    beginTransition();
    restoreSelectionFocus();
  }, [zenMode, beginTransition, restoreSelectionFocus]);

  useEffect(() => {
    return () => {
      if (preserveTimer.current) window.clearTimeout(preserveTimer.current);
      if (blurTimer.current) window.clearTimeout(blurTimer.current);
    };
  }, []);

  if (!visible || !position || !editor) return null;

  return (
    <div
      ref={menuRef}
      role="toolbar"
      aria-label="Floating text formatting"
      data-placement={position.placement}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      className="absolute z-30 flex items-center gap-0.5 rounded-[10px] border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] px-1.5 py-1 shadow-[0_12px_28px_-6px_rgba(45,36,22,0.25)] backdrop-blur-md dark:border-white/15 dark:bg-[#1a1b16] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Top Specular catchlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      {/* Bold */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          audioHaptics.trigger("format");
          editor.chain().focus().toggleBold().run();
        }}
        className={`hit-target flex h-7 w-7 items-center justify-center rounded-[6px] text-xs font-semibold transition duration-150 ${
          editor.isActive("bold")
            ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)] font-semibold"
            : "text-[var(--ink,#191712)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200"
        }`}
        aria-label="Bold"
      >
        B
      </button>

      {/* Italic */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          audioHaptics.trigger("format");
          editor.chain().focus().toggleItalic().run();
        }}
        className={`hit-target flex h-7 w-7 items-center justify-center rounded-[6px] text-xs italic transition duration-150 ${
          editor.isActive("italic")
            ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)]"
            : "text-[var(--ink,#191712)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200"
        }`}
        aria-label="Italic"
      >
        I
      </button>

      {/* Strike */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          audioHaptics.trigger("format");
          editor.chain().focus().toggleStrike().run();
        }}
        className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-xs line-through transition duration-150 ${
          editor.isActive("strike")
            ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)] font-semibold"
            : "text-[var(--ink,#191712)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200"
        }`}
        aria-label="Strikethrough"
      >
        S
      </button>

      {/* Highlight */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          audioHaptics.trigger("format");
          editor.chain().focus().toggleHighlight().run();
        }}
        className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition duration-150 ${
          editor.isActive("highlight")
            ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)] font-semibold"
            : "text-[var(--ink,#191712)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200"
        }`}
        aria-label="Highlight"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="m9.9 2.6 3.5 3.5-6.1 6.1-3.5-3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M3.8 8.7 2.5 12.3l3.6-1.3M4.4 13.2h9.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="mx-0.5 h-3.5 w-[1px] bg-[var(--line,rgba(25,23,18,0.12))] dark:bg-white/10" />

      {/* Heading 2 */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          audioHaptics.trigger("format");
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        className={`hit-target flex h-7 w-7 items-center justify-center rounded-[6px] text-xs font-semibold transition duration-150 ${
          editor.isActive("heading", { level: 2 })
            ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)]"
            : "text-[var(--ink,#191712)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200"
        }`}
        aria-label="Heading 2"
      >
        H2
      </button>

      {/* Code */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          audioHaptics.trigger("format");
          editor.chain().focus().toggleCode().run();
        }}
        className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition duration-150 ${
          editor.isActive("code")
            ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)] font-semibold"
            : "text-[var(--ink,#191712)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200"
        }`}
        aria-label="Code"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="m5.5 4.5-3.5 3.5 3.5 3.5M10.5 4.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Link */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          audioHaptics.trigger("format");
          onInsertLink();
        }}
        className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition duration-150 ${
          editor.isActive("link")
            ? "bg-[var(--accent,#b8452c)]/15 text-[var(--accent,#b8452c)] font-semibold"
            : "text-[var(--ink,#191712)] hover:bg-[var(--hover,rgba(25,23,18,0.06))] dark:text-neutral-200"
        }`}
        aria-label="Link"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M6.75 9.25a3.25 3.25 0 0 0 4.6 0l2.15-2.15a3.25 3.25 0 0 0-4.6-4.6L7.4 3.99" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.25 6.75a3.25 3.25 0 0 0-4.6 0L2.5 8.9a3.25 3.25 0 0 0 4.6 4.6l1.5-1.49" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
