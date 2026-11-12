"use client";

import React, { useState } from "react";
import Link from "next/link";
import { audioHaptics } from "@/lib/audio-haptics";

const CRAFT_SHORTCUTS = [
  { key: "⌘B", label: "Bold", hint: "Wraps selection in **bold** markdown" },
  { key: "⌘I", label: "Italic", hint: "Emphasizes a phrase with *italic*" },
  { key: "⌘⇧Y", label: "Highlight", hint: "Marks a line in warm amber ink" },
  { key: "⌘⇧9", label: "Checklist", hint: "Turns the current line into a task" },
  { key: "⌘.", label: "Zen mode", hint: "Fades sidebars for full-bleed focus" },
] as const;

export function CraftSpecs() {
  const [task1Checked, setTask1Checked] = useState(true);
  const [task2Checked, setTask2Checked] = useState(false);
  const [activeShortcut, setActiveShortcut] = useState("⌘⇧9");

  const activeShortcutItem =
    CRAFT_SHORTCUTS.find((item) => item.key === activeShortcut) ?? CRAFT_SHORTCUTS[3];

  const toggleTask = (taskNum: 1 | 2) => {
    audioHaptics.trigger("tap");
    if (taskNum === 1) setTask1Checked((v) => !v);
    else setTask2Checked((v) => !v);
  };

  const handleShortcutClick = (shortcut: string) => {
    setActiveShortcut(shortcut);
    audioHaptics.trigger("toggle");
  };

  return (
    <section className="landing-craft-section" id="writing" aria-labelledby="craftTitle">
      <div className="shell">
        {/* Section Header */}
        <header className="landing-section-header">
          <h2 className="landing-section-title" id="craftTitle">
            Built like fine stationery
          </h2>
          <p className="landing-section-subtitle">
            Every curve, shortcut, and interaction is tuned for calm, continuous focus.
          </p>
        </header>

        {/* 2-Column Balanced Tactile Pair */}
        <div className="craft-specimen-grid">
          {/* Card 1: The Stationery Specimen (Left Column) */}
          <div className="craft-double-card">
            <div className="craft-double-card-inner">
              <div className="specular-line" aria-hidden="true" />

              <div className="craft-card-top">
                <span className="craft-mini-tag">Stationery specimen</span>
                <span className="craft-tag-pill">#craft</span>
              </div>

              {/* Specimen Note View */}
              <div className="specimen-content">
                <h3 className="specimen-title">
                  Quiet notes on digital paper.
                </h3>
                <p className="specimen-body">
                  Fold is built with mathematical concentric framing, warm paper contrast, and{" "}
                  <mark className="search-match">zero-latency persistence</mark>.
                </p>

                {/* Interactive Tactile Task Checklist */}
                <div className="specimen-tasks" role="group" aria-label="Interactive checklist demo">
                  <label className="specimen-task-row">
                    <input
                      type="checkbox"
                      checked={task1Checked}
                      onChange={() => toggleTask(1)}
                      className="specimen-checkbox"
                    />
                    <span className={task1Checked ? "task-done" : ""}>
                      Feel subtle audio feedback on toggle
                    </span>
                  </label>
                  <label className="specimen-task-row">
                    <input
                      type="checkbox"
                      checked={task2Checked}
                      onChange={() => toggleTask(2)}
                      className="specimen-checkbox"
                    />
                    <span className={task2Checked ? "task-done" : ""}>
                      Save directly to IndexedDB without cloud spinners
                    </span>
                  </label>
                </div>
              </div>

              {/* Specimen Telemetry Footnote */}
              <div className="specimen-foot">
                <span><span className="font-mono tabular-nums">34</span> words</span>
                <span>~<span className="font-mono tabular-nums">1</span> min read</span>
                <span className="text-accent">Instant local save</span>
              </div>
            </div>
          </div>

          {/* Card 2: The Muscle Memory & Engineering Architecture (Right Column) */}
          <div className="craft-double-card">
            <div className="craft-double-card-inner">
              <div className="specular-line" aria-hidden="true" />

              <div className="craft-card-top">
                <span className="craft-mini-tag">Keyboard shortcuts</span>
                <span className="craft-tag-pill">Keys</span>
              </div>

              {/* Interactive Keybinding Deck */}
              <div className="craft-shortcuts-deck">
                <div className="shortcuts-row" role="group" aria-label="Keyboard shortcut selector">
                  {CRAFT_SHORTCUTS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleShortcutClick(item.key)}
                      aria-pressed={activeShortcut === item.key}
                      className={`craft-shortcut-btn ${activeShortcut === item.key ? "craft-shortcut-btn--active" : ""}`}
                    >
                      <span className="shortcut-key font-mono">{item.key}</span>
                      <span className="shortcut-lbl">{item.label}</span>
                    </button>
                  ))}
                </div>
                <p
                  aria-live="polite"
                  className="mt-2.5 flex items-center gap-2 text-[12.5px] text-[var(--muted)]"
                >
                  <span className="font-mono font-semibold text-[var(--accent)]">
                    {activeShortcutItem.key}
                  </span>
                  <span>{activeShortcutItem.hint}</span>
                </p>
              </div>

              {/* High-Density Architecture Specification Rows */}
              <div className="craft-specs-list">
                <div className="craft-spec-row">
                  <div className="craft-spec-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <div className="craft-spec-info">
                    <span className="craft-spec-title">Multi-tab sync</span>
                    <span className="craft-spec-desc">Syncs split windows in real time with zero network calls.</span>
                  </div>
                </div>

                <div className="craft-spec-row">
                  <div className="craft-spec-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
                    </svg>
                  </div>
                  <div className="craft-spec-info">
                    <span className="craft-spec-title">Offline service worker</span>
                    <span className="craft-spec-desc">Pre-caches typography and app shell for offline writing.</span>
                  </div>
                </div>

                <div className="craft-spec-row">
                  <div className="craft-spec-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  </div>
                  <div className="craft-spec-info">
                    <span className="craft-spec-title">Audio feedback</span>
                    <span className="craft-spec-desc">Plays subtle mechanical clicks on task toggle.</span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="craft-engine-foot">
                <Link href="/app" className="bento-action-link">
                  <span>Open workspace</span>
                  <span className="bento-action-arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
