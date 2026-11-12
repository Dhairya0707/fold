"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HamburgerMenu } from "@/components/wensity/animated-hamburger-menu";
import { useTheme } from "@/lib/use-theme";
import { audioHaptics } from "@/lib/audio-haptics";

const NAV_ITEMS = [
  { label: "Demo", href: "/#app" },
  { label: "Why Fold", href: "/#features" },
  { label: "Architecture", href: "/#architecture" },
  { label: "Craft", href: "/#writing" },
  { label: "FAQ", href: "/#questions" },
  { label: "Blog", href: "/blog" },
] as const;

export function IslandNavbar() {
  const [theme, toggleTheme] = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu with Escape, outside pointer-down, and whenever
  // the viewport grows back to the desktop breakpoint where inline links show.
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    };

    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [mobileOpen]);

  return (
    <header className="island-nav-wrapper">
      <div className="island-nav-shell" ref={navContainerRef}>
        <div className="island-nav-outer">
          <nav className="island-nav-inner" aria-label="Main Navigation">
            <div className="specular-line" aria-hidden="true" />

            {/* Brand Mark */}
            <Link className="nav-brand" href="/" aria-label="Fold home">
              <span className="nav-brand__bezel" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
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
              <span className="nav-brand__name">
                fold<span className="nav-brand__dot">.</span>
              </span>
            </Link>

            {/* Center Nav Links */}
            <div
              className={`nav-links ${mobileOpen ? "is-open" : ""}`}
              id="navLinks"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === "/blog" && Boolean(pathname?.startsWith("/blog"));

                return (
                  <Link
                    key={item.href}
                    className={`nav-link ${isActive ? "!text-[var(--ink)] bg-[var(--surface-hover)]" : ""}`}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* The inline CTA is hidden on small screens, so surface it in
                  the mobile menu instead of dropping it entirely. */}
              <Link
                href="/app"
                className="nav-cta nav-cta--mobile"
                onClick={() => setMobileOpen(false)}
              >
                <span>Open workspace</span>
                <span className="nav-cta__arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </div>

            {/* Trailing Controls */}
            <div className="nav-actions">
              <button
                className="theme-toggle relative group"
                id="themeToggle"
                type="button"
                onClick={(e) => {
                  audioHaptics.trigger("toggle");
                  toggleTheme(undefined, e);
                }}
                aria-label={`Switch to ${theme === "paper" ? "dark (ink)" : "light (paper)"} theme`}
                title="Toggle Theme (T)"
              >
                <div className="relative flex h-4 w-4 items-center justify-center">
                  {/* Moon icon (paper/light mode) */}
                  <svg
                    className={`absolute inset-0 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      theme === "paper"
                        ? "rotate-0 scale-100 opacity-100 text-[var(--muted,#5f594c)] group-hover:text-[var(--ink,#191712)]"
                        : "rotate-90 scale-0 opacity-0 text-neutral-400"
                    }`}
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M13.5 9.5a5.5 5.5 0 0 1-7-7 5.5 5.5 0 1 0 7 7Z"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Sun icon (ink/dark mode) */}
                  <svg
                    className={`absolute inset-0 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      theme === "ink"
                        ? "rotate-0 scale-100 opacity-100 text-amber-300 group-hover:text-amber-200"
                        : "-rotate-90 scale-0 opacity-0 text-amber-500"
                    }`}
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
                    <path
                      d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </button>

              <div className="hidden sm:block">
                <Link href="/app" className="nav-cta">
                  <span>Open workspace</span>
                  <span className="nav-cta__arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </div>

              {/* Mobile menu toggle */}
              <div className="lg:hidden">
                <HamburgerMenu
                  open={mobileOpen}
                  onOpenChange={(val) => setMobileOpen(val)}
                  aria-label="Toggle Navigation Menu"
                  aria-controls="navLinks"
                />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
