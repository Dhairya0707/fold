"use client";

import React, { useState } from "react";
import { audioHaptics } from "@/lib/audio-haptics";
import { SITE_CONFIG } from "@/lib/site";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "storage",
    category: "Storage",
    question: "Where are my notes actually stored?",
    answer:
      "Your notes live directly inside your browser's IndexedDB database (fold_db v2) on your local hard drive, with a synchronous localStorage mirror for crash recovery. Fold operates completely on your machine, so no note body, title, folder name, or keystroke is ever transmitted over the network to any server.",
  },
  {
    id: "privacy",
    category: "Privacy",
    question: "Does Fold track my writing or collect telemetry?",
    answer:
      "No. Fold includes zero analytics scripts, behavioral trackers, session replays, error-reporting beacons, or first-party and third-party HTTP cookies. All typography is self-hosted at build time, so your browser makes no runtime requests to external font CDNs. Your notes, tags, and drafts stay strictly inside your local browser sandbox.",
  },
  {
    id: "offline",
    category: "Offline",
    question: "Does Fold work without an internet connection?",
    answer:
      "Yes. Fold installs as a Progressive Web App (PWA) backed by a dedicated Service Worker that caches application scripts, styles, and self-hosted fonts locally. Once loaded, you can open your workspace, search notes, and write offline on airplanes, trains, or remote locations with zero degradation in typing speed.",
  },
  {
    id: "export",
    category: "Portability",
    question: "Can I export my notes if I ever decide to leave?",
    answer:
      "Yes, at any time. You can export your entire workspace with one click as a ZIP vault of standard Markdown (.md) files with YAML frontmatter, or as a raw JSON backup for re-import. You can also download or copy any single note as clean Markdown for Obsidian, Bear, or iA Writer.",
  },
  {
    id: "safety",
    category: "Persistence",
    question: "What happens if I close the browser or restart?",
    answer:
      "IndexedDB writes directly to your device's local disk partition, and Fold flushes a localStorage backup mirror before the tab closes. Your notes, folders, tags, and task checklists persist across browser closures, system restarts, and app updates. Only clearing browser site data or using private browsing removes local storage.",
  },
  {
    id: "pricing",
    category: "Pricing",
    question: "Is Fold completely free to use?",
    answer:
      "Yes. Fold is completely free and open source under the MIT License, with no paywalls, monthly subscriptions, user accounts, or gated features. Because the entire notes workspace runs locally inside your browser without hosted cloud databases or sync servers, there are no recurring infrastructure costs to pass on to users.",
  },
];

const CREATOR_X_HANDLE = SITE_CONFIG.author.handle;
const CREATOR_X_URL = SITE_CONFIG.links.x;
const CREATOR_EMAIL = SITE_CONFIG.links.contactEmail;

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>("storage");

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
    audioHaptics.trigger("tap");
  };

  const handleContactClick = () => {
    audioHaptics.trigger("tap");
  };

  return (
    <section className="landing-faq-section" id="questions" aria-labelledby="faqTitle">
      <div className="shell">
        {/* Editorial header: display title left, quiet context right */}
        <header className="faq-head">
          <div className="faq-head__lead">
            <h2 className="faq-title" id="faqTitle">
              Frequently asked questions
            </h2>
          </div>

          <div className="faq-head__meta">
            <span className="faq-head__rule" aria-hidden="true" />
            <p className="faq-head__desc">
              Six plain answers on storage, privacy, and what happens when the
              network disappears.
            </p>
          </div>
        </header>

        {/* Editorial remarks list */}
        <div className="faq-list" role="region" aria-label="Frequently Asked Questions">
          {FAQS.map((faq, index) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className={`faq-entry ${isOpen ? "is-open" : ""}`}>
                <h3 className="faq-entry__heading">
                  <button
                    type="button"
                    className="faq-entry__trigger"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    id={`faq-btn-${faq.id}`}
                  >
                    <span className="faq-entry__num" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="faq-entry__question">{faq.question}</span>
                    <span className="faq-entry__marker" aria-hidden="true">
                      <span className="faq-entry__marker-h" />
                      <span className="faq-entry__marker-v" />
                    </span>
                  </button>
                </h3>

                <div
                  id={`faq-answer-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${faq.id}`}
                  aria-hidden={!isOpen}
                  className="faq-entry__panel"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="faq-entry__panel-inner">
                    <p className="faq-entry__answer">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct line to the maker */}
        <div className="faq-contact-bar">
          <div className="faq-contact-bar__id">
            <div className="faq-contact-bar__avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar.jpg" alt="Dhairya" width="40" height="40" />
            </div>
            <div className="faq-contact-bar__copy">
              <p className="faq-contact-bar__title">Still have a question?</p>
              <p className="faq-contact-bar__desc">
                Ask about storage, migration, or keybindings. I answer every
                message myself.
              </p>
            </div>
          </div>

          <div className="faq-contact-bar__actions">
            <a
              href={CREATOR_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleContactClick}
              className="faq-contact-bar__btn"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>DM on X {CREATOR_X_HANDLE}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>

            <a
              href={SITE_CONFIG.links.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleContactClick}
              className="faq-contact-bar__mail"
            >
              View on GitHub
            </a>

            <a href={CREATOR_EMAIL} onClick={handleContactClick} className="faq-contact-bar__mail">
              Send an email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
