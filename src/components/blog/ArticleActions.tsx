"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Link2, Share2 } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site";
import { audioHaptics } from "@/lib/audio-haptics";

interface ArticleActionsProps {
  title: string;
  slug: string;
}

export function ArticleActions({ title, slug }: ArticleActionsProps) {
  const [copied, setCopied] = useState(false);

  const canonicalUrl = `${SITE_CONFIG.url.replace(/\/$/, "")}/blog/${slug}`;

  const getShareUrl = () => {
    if (typeof window !== "undefined" && window.location.origin) {
      return `${window.location.origin}/blog/${slug}`;
    }
    return canonicalUrl;
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      audioHaptics.trigger("success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      audioHaptics.trigger("tap");
    }
  };

  const xShareHref = `https://x.com/intent/tweet?text=${encodeURIComponent(
    `${title} (via @dhairya0707)`
  )}&url=${encodeURIComponent(canonicalUrl)}`;

  const linkedInShareHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    canonicalUrl
  )}`;

  return (
    <div className="my-10 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)]">
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-[15px] border border-[var(--border)] bg-[var(--double-frame-inner)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="specular-line" aria-hidden="true" />

        <Link
          href="/blog"
          onClick={() => audioHaptics.trigger("tap")}
          className="inline-flex items-center gap-2 self-start rounded-[9px] border border-[var(--border)] bg-[var(--surface-card)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink)] shadow-[var(--shadow-bezel)] transition-all duration-150 hover:border-[var(--border-strong)] hover:text-[var(--accent)] active:scale-[0.98]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to all notes</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.07em] text-[var(--muted)] sm:inline-flex">
            <Share2 className="h-3 w-3 text-[var(--accent)]" />
            <span>Share</span>
          </span>

          <button
            type="button"
            onClick={handleCopyLink}
            aria-label={copied ? "Article link copied" : "Copy article link"}
            className={`inline-flex items-center gap-1.5 rounded-[9px] border px-3 py-2 text-[12.5px] font-semibold shadow-[var(--shadow-bezel)] transition-all duration-150 active:scale-[0.98] ${
              copied
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--ink)] hover:border-[var(--border-strong)]"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Link copied</span>
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5 text-[var(--muted)]" />
                <span>Copy link</span>
              </>
            )}
          </button>

          <a
            href={xShareHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioHaptics.trigger("tap")}
            aria-label="Share this article on X"
            className="inline-flex items-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 text-[12.5px] font-semibold text-[var(--ink)] shadow-[var(--shadow-bezel)] transition-all duration-150 hover:border-[var(--border-strong)] hover:text-[var(--accent)] active:scale-[0.98]"
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
            <span>Post on X</span>
          </a>

          <a
            href={linkedInShareHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioHaptics.trigger("tap")}
            aria-label="Share this article on LinkedIn"
            className="inline-flex items-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 text-[12.5px] font-semibold text-[var(--ink)] shadow-[var(--shadow-bezel)] transition-all duration-150 hover:border-[var(--border-strong)] hover:text-[var(--accent)] active:scale-[0.98]"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
            </svg>
            <span>LinkedIn</span>
          </a>
        </div>
      </div>
    </div>
  );
}
