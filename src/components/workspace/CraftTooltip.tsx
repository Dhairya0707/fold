"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/lib/use-is-mounted";

interface TooltipProps {
  label: string;
  shortcut?: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
  /** Replaces the default `inline-flex` wrapper, e.g. to hide on mobile. */
  className?: string;
}

const GAP = 8;
const VIEWPORT_PADDING = 8;

export function Tooltip({
  label,
  shortcut,
  children,
  side = "bottom",
  delayMs = 280,
  className = "inline-flex",
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [resolvedSide, setResolvedSide] = useState<"top" | "bottom" | "left" | "right">(side);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const mounted = useIsMounted();

  const computeAndApplyPosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const tipEl = tooltipRef.current;
    if (!triggerEl || !tipEl) return side;

    const trigger = triggerEl.getBoundingClientRect();
    const tip = tipEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let nextSide = side;
    if (side === "bottom" && trigger.bottom + GAP + tip.height + VIEWPORT_PADDING > vh) {
      if (trigger.top - GAP - tip.height - VIEWPORT_PADDING >= 0) {
        nextSide = "top";
      }
    } else if (side === "top" && trigger.top - GAP - tip.height - VIEWPORT_PADDING < 0) {
      if (trigger.bottom + GAP + tip.height + VIEWPORT_PADDING <= vh) {
        nextSide = "bottom";
      }
    } else if (side === "left" && trigger.left - GAP - tip.width - VIEWPORT_PADDING < 0) {
      if (trigger.right + GAP + tip.width + VIEWPORT_PADDING <= vw) {
        nextSide = "right";
      }
    } else if (side === "right" && trigger.right + GAP + tip.width + VIEWPORT_PADDING > vw) {
      if (trigger.left - GAP - tip.width - VIEWPORT_PADDING >= 0) {
        nextSide = "left";
      }
    }

    let top = 0;
    let left = 0;

    if (nextSide === "top" || nextSide === "bottom") {
      const rawTop =
        nextSide === "top"
          ? trigger.top - GAP - tip.height
          : trigger.bottom + GAP;
      top = Math.max(
        VIEWPORT_PADDING,
        Math.min(vh - tip.height - VIEWPORT_PADDING, rawTop)
      );

      const centeredLeft = trigger.left + trigger.width / 2 - tip.width / 2;
      left = Math.max(
        VIEWPORT_PADDING,
        Math.min(vw - tip.width - VIEWPORT_PADDING, centeredLeft)
      );
    } else {
      const rawLeft =
        nextSide === "left"
          ? trigger.left - GAP - tip.width
          : trigger.right + GAP;
      left = Math.max(
        VIEWPORT_PADDING,
        Math.min(vw - tip.width - VIEWPORT_PADDING, rawLeft)
      );

      const centeredTop = trigger.top + trigger.height / 2 - tip.height / 2;
      top = Math.max(
        VIEWPORT_PADDING,
        Math.min(vh - tip.height - VIEWPORT_PADDING, centeredTop)
      );
    }

    tipEl.style.top = `${top}px`;
    tipEl.style.left = `${left}px`;
    return nextSide;
  }, [side]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const nextSide = computeAndApplyPosition();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setResolvedSide(nextSide);
      setIsVisible(true);
    });
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isOpen, label, shortcut, computeAndApplyPosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => {
      computeAndApplyPosition();
    };
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, computeAndApplyPosition]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const showTooltip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsOpen(true);
    }, delayMs);
  };

  const hideTooltip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsVisible(false);
    setIsOpen(false);
  };

  const hiddenOffset =
    resolvedSide === "top"
      ? "translateY(4px) scale(0.96)"
      : resolvedSide === "bottom"
      ? "translateY(-4px) scale(0.96)"
      : resolvedSide === "left"
      ? "translateX(4px) scale(0.96)"
      : "translateX(-4px) scale(0.96)";

  return (
    <div
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onPointerDown={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      className={className}
    >
      {children}

      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className="craft-floating-tooltip pointer-events-none fixed -top-[9999px] -left-[9999px] z-[60]"
          >
            <div
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translate3d(0, 0, 0) scale(1)" : hiddenOffset,
                transition: isVisible
                  ? "opacity 120ms cubic-bezier(0.23, 1, 0.32, 1), transform 120ms cubic-bezier(0.23, 1, 0.32, 1)"
                  : "none",
              }}
              className="relative flex max-w-[calc(100vw-16px)] items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--line-strong,rgba(25,23,18,0.2))] bg-[var(--surface,#fffdf8)] px-2.5 py-1 text-xs font-medium text-[var(--ink,#191712)] shadow-[0_8px_20px_-4px_rgba(45,36,22,0.18)] dark:border-white/15 dark:bg-[#1c1d18] dark:text-[#f4f0e6] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6)]"
            >
              {/* Specular catchlight on top edge */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
                aria-hidden="true"
              />
              <span>{label}</span>
              {shortcut && (
                <kbd className="inline-flex items-center rounded border border-[var(--line,rgba(25,23,18,0.15))] bg-[var(--surface-2,#f1ecdf)] px-1 py-0.2 text-[10px] font-mono text-[var(--muted,#5f594c)] dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                  {shortcut}
                </kbd>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
