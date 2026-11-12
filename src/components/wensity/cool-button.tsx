"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

/**
 * Self-injects these keyframes (no global CSS required):
 *
 * @keyframes cool-spin {
 *   from { transform: rotate(0deg); }
 *   to { transform: rotate(360deg); }
 * }
 * @keyframes cool-spin-slow {
 *   from { transform: rotate(0deg); }
 *   to { transform: rotate(-360deg); }
 * }
 */

const STYLE_ID = "wensity-cool-button-styles";

const KEYFRAMES_CSS = `
@keyframes cool-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes cool-spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}
.animate-cool-spin {
  animation: cool-spin 3s linear infinite;
}
.animate-cool-spin-slow {
  animation: cool-spin-slow 5s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .animate-cool-spin,
  .animate-cool-spin-slow {
    animation: none;
  }
}
`;

function ensureCoolButtonStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = KEYFRAMES_CSS;
  document.head.appendChild(style);
}

export type CoolButtonProps<E extends "a" | "button" = "a"> = {
  /** The HTML element to render as. @default "a" */
  as?: E;
} & ComponentPropsWithoutRef<E>;

/**
 * An animated button/link with a soft spinning orbit border.
 * Renders as an anchor by default; use `as="button"` for button behavior.
 *
 * @example
 * // As link (default)
 * <CoolButton href="/about">About</CoolButton>
 *
 * @example
 * // As button
 * <CoolButton as="button" onClick={handleClick}>Submit</CoolButton>
 */
export function CoolButton<E extends "a" | "button" = "a">({
  as,
  className,
  children,
  ...props
}: CoolButtonProps<E>) {
  useEffect(() => {
    ensureCoolButtonStyles();
  }, []);

  const Element = as ?? "a";
  const isAnchor = Element === "a";

  const baseClassName = cn(
    "group/cool relative inline-flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-[15px] p-[3px] transition-transform  ",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f87171] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0c0912]",
    className,
  );

  const content = (
    <>
      {/* Animated orbit border - enlarges on hover */}
      <span className="absolute inset-0 overflow-hidden rounded-[15px] transition-all duration-300 ease-out group-hover/cool:inset-[-3px] group-hover/cool:rounded-[15px]">
        <span className="absolute inset-[-200%] animate-cool-spin bg-[conic-gradient(from_0deg,#ef4444,#f87171,#fb7185,#dc2626,#991b1b,#e11d48,#ef4444)] opacity-95 blur-[2px]" />
      </span>

      {/* Noise/texture overlay on the border - enlarges on hover */}
      <span className="absolute inset-0 overflow-hidden rounded-[15px] opacity-45 mix-blend-soft-light transition-all duration-300 ease-out group-hover/cool:inset-[-3px] group-hover/cool:rounded-[15px] dark:opacity-60 dark:mix-blend-overlay">
        <span className="absolute inset-[-200%] animate-cool-spin-slow bg-[conic-gradient(from_180deg,#fb7185_0%,transparent_30%,#ef4444_50%,transparent_70%,#991b1b_100%)] blur-[2px]" />
      </span>

      {/* Theme-aware inner background — off-white light / black dark */}
      <span className="relative z-10 flex items-center gap-3 rounded-[12px] bg-[#fafafa] px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-1px_0_rgba(15,23,42,0.08),0_1px_1px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.14)] transition-all duration-300 group-hover/cool:shadow-[inset_0_1px_0_rgba(255,255,255,0.82),inset_0_-1px_0_rgba(15,23,42,0.12),0_2px_6px_rgba(15,23,42,0.14),0_12px_34px_rgba(15,23,42,0.2)] dark:bg-black dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_1px_1px_rgba(0,0,0,0.45),0_10px_28px_rgba(0,0,0,0.35)] dark:group-hover/cool:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.55),0_14px_34px_rgba(0,0,0,0.42)] active:scale-[0.98]">
        <span className="font-medium text-base tracking-wide text-neutral-950 dark:text-white">
          {children ?? "Welcome to wensity ui"}
        </span>
      </span>
    </>
  );

  if (isAnchor) {
    const { href, rel, target, ...rest } =
      props as ComponentPropsWithoutRef<"a">;
    return (
      <a
        className={baseClassName}
        href={href ?? "/"}
        rel={rel ?? "noopener noreferrer"}
        target={target ?? "_blank"}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={baseClassName}
      {...(props as ComponentPropsWithoutRef<"button">)}
    >
      {content}
    </button>
  );
}
