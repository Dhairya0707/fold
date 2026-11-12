"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ListTree } from "lucide-react";
import { BlogHeading } from "@/lib/blog-shared";
import { audioHaptics } from "@/lib/audio-haptics";

interface TableOfContentsProps {
  headings: BlogHeading[];
  variant?: "sidebar" | "inline";
}

export function TableOfContents({
  headings,
  variant = "sidebar",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-96px 0px -65% 0px",
        threshold: [0, 1],
      }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY < 120 && headings[0]) {
        setActiveId(headings[0].id);
        return;
      }

      const nearBottom =
        window.innerHeight + scrollY >=
        document.documentElement.scrollHeight - 60;
      if (nearBottom && headings.length > 0) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }

      let currentId = headings[0].id;
      for (const el of elements) {
        const top = el.getBoundingClientRect().top;
        if (top <= 140) {
          currentId = el.id;
        } else {
          break;
        }
      }
      setActiveId(currentId);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [headings]);

  if (headings.length < 2) return null;

  const handleJump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    audioHaptics.trigger("tap");
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
      setActiveId(id);
    }
    if (variant === "inline") {
      setMobileOpen(false);
    }
  };

  if (variant === "inline") {
    const activeHeading =
      headings.find((h) => h.id === activeId) ?? headings[0];

    return (
      <div className="mb-8 rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)]">
        <div className="relative overflow-hidden rounded-[13px] border border-[var(--border)] bg-[var(--surface-card)]">
          <div className="specular-line" aria-hidden="true" />
          <button
            type="button"
            onClick={() => {
              audioHaptics.trigger("tap");
              setMobileOpen((prev) => !prev);
            }}
            aria-expanded={mobileOpen}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ListTree className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              <div className="min-w-0">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                  On this page
                </div>
                <div className="truncate text-[13px] font-medium text-[var(--ink)]">
                  {activeHeading?.text}
                </div>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-200 ${
                mobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {mobileOpen && (
            <nav
              aria-label="Table of contents"
              className="border-t border-[var(--border)] px-3 py-2.5"
            >
              <ul className="space-y-1">
                {headings.map((heading) => {
                  const isActive = activeId === heading.id;
                  const indent =
                    heading.level === 2
                      ? "pl-2.5"
                      : heading.level === 3
                        ? "pl-5"
                        : "pl-7";
                  return (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        onClick={(e) => handleJump(e, heading.id)}
                        className={`block rounded-[7px] py-1.5 pr-2.5 text-[13px] leading-[1.4] transition-colors ${indent} ${
                          isActive
                            ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                            : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                        }`}
                      >
                        {heading.text}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>
      </div>
    );
  }

  return (
    <aside aria-label="Table of contents" className="w-full">
      <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)]">
        <div className="relative overflow-hidden rounded-[13px] border border-[var(--border)] bg-[var(--surface-card)] p-4">
          <div className="specular-line" aria-hidden="true" />

          <div className="mb-3 flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
            <ListTree className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.09em] text-[var(--accent)]">
              On This Page
            </span>
          </div>

          <nav>
            <ul className="space-y-1 border-l border-[var(--border)]">
              {headings.map((heading) => {
                const isActive = activeId === heading.id;
                const indent =
                  heading.level === 2
                    ? "pl-3"
                    : heading.level === 3
                      ? "pl-5"
                      : "pl-7";

                return (
                  <li key={heading.id} className="relative">
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute -left-[1.5px] top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-[var(--accent)]"
                      />
                    )}
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => handleJump(e, heading.id)}
                      className={`block rounded-r-[6px] py-1.5 pr-2 text-[12.5px] leading-[1.42] transition-all duration-150 ${indent} ${
                        isActive
                          ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                          : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {heading.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  );
}
