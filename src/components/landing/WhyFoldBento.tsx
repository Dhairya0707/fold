"use client";

import React, { useState } from "react";
import Link from "next/link";
import { audioHaptics } from "@/lib/audio-haptics";

interface SearchPreset {
  id: string;
  query: string;
  matchTitle: string;
  matchSnippet: string;
}

const SEARCH_PRESETS: SearchPreset[] = [
  {
    id: "lease",
    query: "lease",
    matchTitle: "Studio lease, 2026 renewal",
    matchSnippet: "Renewal window opens 1 June…",
  },
  {
    id: "craft",
    query: "craft",
    matchTitle: "Hardware-grade craft notes",
    matchSnippet: "Fold is built around concentric framing…",
  },
  {
    id: "remember",
    query: "remember",
    matchTitle: "Things I want to remember",
    matchSnippet: "There is a version of this week where I do less…",
  },
];

export function WhyFoldBento() {
  const [activeQuery, setActiveQuery] = useState("lease");

  const currentMatch =
    SEARCH_PRESETS.find((p) => p.query === activeQuery) || SEARCH_PRESETS[0];

  const handleSelectQuery = (q: string) => {
    setActiveQuery(q);
    audioHaptics.trigger("tap");
  };

  return (
    <section className="landing-bento-section" id="features" aria-labelledby="bentoTitle">
      <div className="shell">
        {/* Section Header */}
        <header className="landing-section-header">
          <h2 className="landing-section-title" id="bentoTitle">
            Everything your mind needs.<br />
            Nothing it doesn’t.
          </h2>
          <p className="landing-section-subtitle">
            Most note apps ask for attention with feeds, subscriptions, and sync spinners.
            Fold gives you one quiet page that simply works.
          </p>
        </header>

        {/* Balanced 3-Card Grid */}
        <div className="landing-bento-trio">
          {/* Card 1: Local-First Foundations (Left Column) */}
          <div className="landing-bento-card">
            <div className="landing-bento-card__head">
              <h3 className="landing-bento-card__title">On-device by default</h3>
              <p className="landing-bento-card__desc">
                Your thoughts never leave this machine. No keystroke logging, no LLM scrapers, and
                no cloud server in between.
              </p>
            </div>

            <div className="telemetry-compact-table">
              <div className="telemetry-compact-row">
                <span className="telemetry-label">Storage</span>
                <span className="telemetry-val text-accent">IndexedDB local</span>
              </div>
              <div className="telemetry-compact-row">
                <span className="telemetry-label">Server requests</span>
                <span className="telemetry-val font-mono tabular-nums">0 / min</span>
              </div>
              <div className="telemetry-compact-row">
                <span className="telemetry-label">Account needed</span>
                <span className="telemetry-val">None</span>
              </div>
            </div>

            <div className="landing-bento-card__foot">
              <div className="bento-status-pill">
                <span className="status-dot status-dot--active" />
                <span>Isolated local sandbox</span>
              </div>
            </div>
          </div>

          {/* Card 2: Centerpiece with Concentric Double-Border & Specular Catchlight */}
          <div className="landing-bento-concentric-wrap">
            <div className="landing-bento-concentric-inner">
              <div className="specular-line" aria-hidden="true" />

              <div className="landing-bento-card__head">
                <h3 className="landing-bento-card__title">Search as you type</h3>
                <p className="landing-bento-card__desc">
                  Query every title, tag, and checklist item as you type, with matching text
                  highlighted right in the results.
                </p>
              </div>

              {/* Search Simulator */}
              <div className="bento-search-demo">
                <div className="bento-search-input-box">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="bento-search-icon"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span className="bento-search-text font-mono">{activeQuery}</span>
                  <span className="bento-search-cursor" aria-hidden="true" />
                  <span className="bento-search-kbd font-mono">⌘K</span>
                </div>

                <div className="bento-search-presets" role="group" aria-label="Search presets">
                  {SEARCH_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectQuery(preset.query)}
                      aria-pressed={activeQuery === preset.query}
                      className={`bento-search-chip ${activeQuery === preset.query ? "bento-search-chip--active" : ""}`}
                    >
                      {preset.query}
                    </button>
                  ))}
                </div>

                <div className="bento-search-result-card">
                  <div className="bento-result-title">
                    {currentMatch.matchTitle.split(new RegExp(`(${activeQuery})`, "gi")).map((part, i) =>
                      part.toLowerCase() === activeQuery.toLowerCase() ? (
                        <mark key={i} className="search-match">
                          {part}
                        </mark>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </div>
                  <div className="bento-result-snippet">{currentMatch.matchSnippet}</div>
                </div>
              </div>

              <div className="landing-bento-card__foot">
                <Link href="/app" className="bento-action-link">
                  <span>Open app to search</span>
                  <span className="bento-action-arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Portability & Markdown (Right Column) */}
          <div className="landing-bento-card">
            <div className="landing-bento-card__head">
              <h3 className="landing-bento-card__title">Markdown and vaults</h3>
              <p className="landing-bento-card__desc">
                Export one note or the whole workspace as Markdown files or a portable JSON vault
                at any time.
              </p>
            </div>

            <div className="bento-badge-row">
              <span className="format-badge">.md</span>
              <span className="format-badge">CommonMark</span>
              <span className="format-badge">GFM tables</span>
              <span className="format-badge">JSON vault</span>
            </div>

            <div className="telemetry-compact-table">
              <div className="telemetry-compact-row">
                <span className="telemetry-label">Export formats</span>
                <span className="telemetry-val text-accent">Markdown, JSON</span>
              </div>
              <div className="telemetry-compact-row">
                <span className="telemetry-label">Data format</span>
                <span className="telemetry-val">Open standards</span>
              </div>
            </div>

            <div className="landing-bento-card__foot">
              <span className="bento-note-subtext">No proprietary database schemas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
