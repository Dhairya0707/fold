"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { audioHaptics } from "@/lib/audio-haptics";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      audioHaptics.trigger("success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      audioHaptics.trigger("tap");
    }
  };

  const displayLang = (language || "text").toLowerCase();

  return (
    <div className="my-7 rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)]">
      <div className="relative overflow-hidden rounded-[13px] border border-[var(--border)] bg-[var(--surface-card)]">
        <div className="specular-line" aria-hidden="true" />

        {/* Hardware code header bar */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)]/70 px-4 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center rounded-[5px] border border-[var(--border)] bg-[var(--surface-card)] px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
              {displayLang}
            </span>
            {title && (
              <span className="truncate font-mono text-[11.5px] text-[var(--muted)]">
                {title}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Code copied to clipboard" : "Copy code snippet"}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[7px] border border-[var(--border)] bg-[var(--surface-card)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--muted)] shadow-[var(--shadow-bezel)] transition-all duration-150 hover:border-[var(--border-strong)] hover:text-[var(--ink)] active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Body */}
        <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-[1.65] text-[var(--ink)] [tab-size:2]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
