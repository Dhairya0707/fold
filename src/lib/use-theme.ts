"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "data-theme") {
        callback();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => {
    window.removeEventListener("storage", callback);
    observer.disconnect();
  };
}

function getSnapshot(): "paper" | "ink" {
  if (typeof window === "undefined") return "paper";
  const docTheme = document.documentElement.dataset.theme;
  if (docTheme === "ink" || docTheme === "paper") return docTheme;
  try {
    const stored = localStorage.getItem("fold.theme.v1");
    if (stored === "ink" || stored === "paper") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "ink" : "paper";
  } catch {
    return "paper";
  }
}

export type ThemeTriggerEvent =
  | React.MouseEvent<HTMLElement>
  | MouseEvent
  | { clientX?: number; clientY?: number };

export function useTheme(): [
  "paper" | "ink",
  (next?: "paper" | "ink", event?: ThemeTriggerEvent) => void
] {
  const theme = useSyncExternalStore<"paper" | "ink">(subscribe, getSnapshot, () => "paper");

  const setTheme = (nextTheme?: "paper" | "ink", event?: ThemeTriggerEvent) => {
    if (typeof window === "undefined") return;
    const resolved: "paper" | "ink" = nextTheme ?? (theme === "paper" ? "ink" : "paper");
    if (resolved === theme) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => {
        ready: Promise<void>;
        finished: Promise<void>;
      };
    };

    // If modern View Transitions API is supported and user hasn't requested reduced-motion:
    if (!prefersReducedMotion && typeof doc.startViewTransition === "function") {
      const clientX =
        event && "clientX" in event && typeof event.clientX === "number"
          ? event.clientX
          : window.innerWidth / 2;
      const clientY =
        event && "clientY" in event && typeof event.clientY === "number"
          ? event.clientY
          : window.innerHeight / 2;

      const endRadius = Math.hypot(
        Math.max(clientX, window.innerWidth - clientX),
        Math.max(clientY, window.innerHeight - clientY)
      );

      // Add temporary class for sub-element smoothness
      document.documentElement.classList.add("theme-transitioning");

      const transition = doc.startViewTransition(() => {
        document.documentElement.dataset.theme = resolved;
        try {
          localStorage.setItem("fold.theme.v1", resolved);
        } catch {}
        window.dispatchEvent(new Event("storage"));
      });

      transition.ready
        .then(() => {
          const clipPath = [
            `circle(0px at ${clientX}px ${clientY}px)`,
            `circle(${endRadius}px at ${clientX}px ${clientY}px)`,
          ];
          document.documentElement.animate(
            {
              clipPath,
            },
            {
              duration: 260,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {});

      transition.finished
        .then(() => {
          document.documentElement.classList.remove("theme-transitioning");
        })
        .catch(() => {
          document.documentElement.classList.remove("theme-transitioning");
        });

      return;
    }

    // Fallback: Crisp 240ms CSS variable interpolation
    document.documentElement.classList.add("theme-transitioning");
    document.documentElement.dataset.theme = resolved;
    try {
      localStorage.setItem("fold.theme.v1", resolved);
    } catch {}
    window.dispatchEvent(new Event("storage"));

    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 240);
  };

  return [theme, setTheme];
}
