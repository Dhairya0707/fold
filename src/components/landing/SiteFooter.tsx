"use client";

import React from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site";
import { audioHaptics } from "@/lib/audio-haptics";

export function SiteFooter() {
  const handleNavClick = () => {
    audioHaptics.trigger("tap");
  };

  return (
    <footer className="landing-site-footer" role="contentinfo">
      <div className="shell">
        <div className="landing-footer-grid">
          {/* Col 1: Brand & Philosophy */}
          <div className="footer-col footer-col--brand">
            <div className="footer-brand-title">
              <Link href="/" className="font-bold text-lg text-[var(--ink)] hover:text-[var(--accent)] transition-colors">
                fold<span className="text-accent">.</span>
              </Link>
            </div>
            <p className="footer-tagline">
              A quiet, hardware-grade field workspace for the web. Made for the thoughts you mean
              to keep.
            </p>
            <div className="footer-engine-status">
              <span className="status-dot status-dot--active" />
              <span>{SITE_CONFIG.engine.name} version {SITE_CONFIG.engine.version}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
              <span>Crafted by {SITE_CONFIG.author.name}</span>
              <a
                href={SITE_CONFIG.links.x}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleNavClick}
                className="hover:text-[var(--accent)] transition-colors underline underline-offset-2"
              >
                {SITE_CONFIG.author.handle}
              </a>
              <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
              <a
                href={SITE_CONFIG.links.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleNavClick}
                className="hover:text-[var(--accent)] transition-colors underline underline-offset-2"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Product and writing</h4>
            <ul className="footer-nav-list">
              <li>
                <Link
                  href="/#app"
                  onClick={handleNavClick}
                  className="footer-nav-link"
                >
                  Live demo
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  onClick={handleNavClick}
                  className="footer-nav-link"
                >
                  Why Fold
                </Link>
              </li>
              <li>
                <Link
                  href="/#writing"
                  onClick={handleNavClick}
                  className="footer-nav-link"
                >
                  Craft and specs
                </Link>
              </li>
              <li>
                <Link
                  href="/#questions"
                  onClick={handleNavClick}
                  className="footer-nav-link"
                >
                  Questions
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  onClick={handleNavClick}
                  className="footer-nav-link flex items-center gap-1.5"
                >
                  <span>Field notes</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--accent)] border border-[var(--border)]">
                    New
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/app" onClick={handleNavClick} className="footer-nav-link font-semibold text-accent">
                  Open full workspace ↗
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Keybinding Quick Reference */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Shortcut cheatsheet</h4>
            <div className="footer-shortcuts-list">
              <div className="shortcut-row">
                <span>Quick find</span>
                <kbd className="footer-kbd font-mono">⌘K</kbd>
              </div>
              <div className="shortcut-row">
                <span>Task checklist</span>
                <kbd className="footer-kbd font-mono">⌘⇧9</kbd>
              </div>
              <div className="shortcut-row">
                <span>Zen focus mode</span>
                <kbd className="footer-kbd font-mono">⌘.</kbd>
              </div>
              <div className="shortcut-row">
                <span>Bold and italic</span>
                <kbd className="footer-kbd font-mono">⌘B / ⌘I</kbd>
              </div>
              <div className="shortcut-row">
                <span>Theme toggle</span>
                <kbd className="footer-kbd font-mono">T</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Hairline & Legal Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-left flex items-center gap-4 flex-wrap">
            <span>&copy; 2026 Fold. Designed for clarity.</span>
            <span aria-hidden="true" className="text-[var(--border-strong)]">/</span>
            <Link href="/privacy" className="hover:text-[var(--ink)] transition-colors underline underline-offset-2">
              Privacy policy
            </Link>
            <span aria-hidden="true" className="text-[var(--border-strong)]">/</span>
            <Link href="/terms" className="hover:text-[var(--ink)] transition-colors underline underline-offset-2">
              Terms of use
            </Link>
            <span aria-hidden="true" className="text-[var(--border-strong)]">/</span>
            <a href={SITE_CONFIG.links.contactEmail} className="hover:text-[var(--ink)] transition-colors underline underline-offset-2">
              Contact
            </a>
            <span aria-hidden="true" className="text-[var(--border-strong)]">/</span>
            <a
              href={SITE_CONFIG.links.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleNavClick}
              className="hover:text-[var(--ink)] transition-colors underline underline-offset-2"
            >
              GitHub
            </a>
          </div>
          <div className="footer-bottom-right">
            <span>Zero cookies. 100% on-device. Open source (MIT).</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
