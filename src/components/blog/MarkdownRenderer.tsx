import React from "react";
import Link from "next/link";
import { createHeadingSlugger, stripMarkdownInline } from "@/lib/blog-shared";
import { CodeBlock } from "@/components/blog/CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

type TableAlignment = "left" | "center" | "right";

type BlockNode =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; lines: string[] }
  | { type: "code"; language: string; title?: string; code: string }
  | { type: "hr" }
  | { type: "taskList"; items: Array<{ checked: boolean; text: string }> }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | {
      type: "table";
      headers: string[];
      alignments: TableAlignment[];
      rows: string[][];
    }
  | { type: "figure"; src: string; alt: string; caption?: string };

function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  return /^(https?:\/\/|mailto:|\/|#)/i.test(trimmed);
}

function parseTableCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let current = "";
  let escaped = false;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (escaped) {
      current += ch;
      escaped = false;
    } else if (ch === "\\") {
      escaped = true;
    } else if (ch === "|") {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function isTableSeparatorRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|") && !trimmed.includes("-")) return false;
  const cells = parseTableCells(trimmed);
  if (cells.length === 0) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseTableAlignments(line: string): TableAlignment[] {
  return parseTableCells(line).map((cell) => {
    const startsColon = cell.startsWith(":");
    const endsColon = cell.endsWith(":");
    if (startsColon && endsColon) return "center";
    if (endsColon) return "right";
    return "left";
  });
}

function parseFenceMeta(meta: string): { language: string; title?: string } {
  const trimmed = meta.trim();
  if (!trimmed) return { language: "text" };

  const titleMatch = trimmed.match(/title=["']([^"']+)["']/);
  const firstToken = trimmed.split(/\s+/)[0] || "text";
  return {
    language: firstToken,
    title: titleMatch?.[1],
  };
}

function parseBlocks(markdown: string): BlockNode[] {
  // Strip MDX JSX comments `{/* ... */}`
  const normalized = markdown.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").trim();
  const lines = normalized.split(/\r?\n/);
  const blocks: BlockNode[] = [];
  const nextSlug = createHeadingSlugger();

  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Fenced code block (``` or ~~~)
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const fenceChar = fence[0];
      const fenceLen = fence.length;
      const { language, title } = parseFenceMeta(fenceMatch[2] || "");
      const codeLines: string[] = [];
      i++;
      while (i < lines.length) {
        const candidate = lines[i].trim();
        if (
          candidate.startsWith(fenceChar.repeat(fenceLen)) &&
          new RegExp(`^${fenceChar}{${fenceLen},}\\s*$`).test(candidate)
        ) {
          i++;
          break;
        }
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: "code",
        language,
        title,
        code: codeLines.join("\n"),
      });
      continue;
    }

    // 2. Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 3. Headings (# .. ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+?)\s*#*$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4;
      const rawHeadingText = headingMatch[2];
      const plain = stripMarkdownInline(rawHeadingText);
      const id = level >= 2 ? nextSlug(plain) : "top";
      blocks.push({
        type: "heading",
        level,
        text: rawHeadingText,
        id,
      });
      i++;
      continue;
    }

    // 4. Standalone markdown image -> <figure>
    const mdImageMatch = trimmed.match(
      /^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)$/
    );
    if (mdImageMatch) {
      blocks.push({
        type: "figure",
        alt: mdImageMatch[1] || "",
        src: mdImageMatch[2],
        caption: mdImageMatch[3] || undefined,
      });
      i++;
      continue;
    }

    // 5. HTML <figure>...</figure> block
    if (trimmed.startsWith("<figure")) {
      const figLines: string[] = [trimmed];
      while (i + 1 < lines.length && !figLines.join("\n").includes("</figure>")) {
        i++;
        figLines.push(lines[i].trim());
      }
      const figHtml = figLines.join(" ");
      const srcMatch = figHtml.match(/src=["']([^"']+)["']/);
      const altMatch = figHtml.match(/alt=["']([^"']*)["']/);
      const capMatch = figHtml.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
      if (srcMatch) {
        blocks.push({
          type: "figure",
          src: srcMatch[1],
          alt: altMatch?.[1] || "",
          caption: capMatch?.[1]?.trim(),
        });
        i++;
        continue;
      }
    }

    // 6. Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", lines: quoteLines });
      continue;
    }

    // 7. GFM Table
    if (
      trimmed.includes("|") &&
      i + 1 < lines.length &&
      isTableSeparatorRow(lines[i + 1])
    ) {
      const headers = parseTableCells(trimmed);
      const alignments = parseTableAlignments(lines[i + 1]);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length) {
        const rowLine = lines[i].trim();
        if (!rowLine || !rowLine.includes("|")) break;
        rows.push(parseTableCells(rowLine));
        i++;
      }
      blocks.push({ type: "table", headers, alignments, rows });
      continue;
    }

    // 8. Task Checklist (- [ ] or - [x])
    if (/^[-*+]\s+\[[ xX]\]\s+/.test(trimmed)) {
      const items: Array<{ checked: boolean; text: string }> = [];
      while (i < lines.length) {
        const m = lines[i].trim().match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/);
        if (!m) break;
        items.push({
          checked: m[1].toLowerCase() === "x",
          text: m[2].trim(),
        });
        i++;
      }
      blocks.push({ type: "taskList", items });
      continue;
    }

    // 9. Unordered List (- / * / +)
    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const current = lines[i].trim();
        if (/^[-*+]\s+\[[ xX]\]\s+/.test(current)) break;
        const m = current.match(/^[-*+]\s+(.*)$/);
        if (!m) break;
        items.push(m[1].trim());
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // 10. Ordered List (1. )
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].trim().match(/^\d+\.\s+(.*)$/);
        if (!m) break;
        items.push(m[1].trim());
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // 11. Paragraph (collect consecutive non-block lines)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const nextLine = lines[i];
      const nextTrimmed = nextLine.trim();
      if (!nextTrimmed) break;
      if (
        /^(`{3,}|~{3,})/.test(nextTrimmed) ||
        /^#{1,4}\s+/.test(nextTrimmed) ||
        nextTrimmed.startsWith(">") ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(nextTrimmed) ||
        /^[-*+]\s+/.test(nextTrimmed) ||
        /^\d+\.\s+/.test(nextTrimmed) ||
        /^!\[([^\]]*)\]\([^)]+\)$/.test(nextTrimmed) ||
        (nextTrimmed.includes("|") &&
          i + 1 < lines.length &&
          isTableSeparatorRow(lines[i + 1]))
      ) {
        break;
      }
      paraLines.push(nextTrimmed);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join(" ") });
    } else {
      i++;
    }
  }

  return blocks;
}

interface InlineMatch {
  index: number;
  length: number;
  node: React.ReactNode;
}

function renderInline(text: string, keyPrefix = "in"): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let counter = 0;

  while (remaining.length > 0) {
    const candidates: InlineMatch[] = [];

    // Inline code
    const codeMatch = remaining.match(/`([^`]+)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      candidates.push({
        index: codeMatch.index,
        length: codeMatch[0].length,
        node: (
          <code
            key={`${keyPrefix}-code-${counter}`}
            className="rounded-[5px] border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-[0.12em] font-mono text-[0.86em] font-medium text-[var(--ink)]"
          >
            {codeMatch[1]}
          </code>
        ),
      });
    }

    // Markdown link [label](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
    if (linkMatch && linkMatch.index !== undefined) {
      const label = linkMatch[1];
      const href = linkMatch[2];
      const title = linkMatch[3];
      const safe = isSafeHref(href);
      const isExternal = /^https?:\/\//i.test(href);

      candidates.push({
        index: linkMatch.index,
        length: linkMatch[0].length,
        node: safe ? (
          isExternal ? (
            <a
              key={`${keyPrefix}-ext-${counter}`}
              href={href}
              title={title}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-[3px] transition-colors hover:decoration-[var(--accent)]"
            >
              {renderInline(label, `${keyPrefix}-l${counter}`)}
            </a>
          ) : (
            <Link
              key={`${keyPrefix}-int-${counter}`}
              href={href}
              title={title}
              className="font-medium text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-[3px] transition-colors hover:decoration-[var(--accent)]"
            >
              {renderInline(label, `${keyPrefix}-l${counter}`)}
            </Link>
          )
        ) : (
          <span key={`${keyPrefix}-txt-${counter}`}>{label}</span>
        ),
      });
    }

    // <mark>...</mark> or ==...==
    const markHtmlMatch = remaining.match(/<mark>([\s\S]*?)<\/mark>/i);
    if (markHtmlMatch && markHtmlMatch.index !== undefined) {
      candidates.push({
        index: markHtmlMatch.index,
        length: markHtmlMatch[0].length,
        node: (
          <mark
            key={`${keyPrefix}-mark-${counter}`}
            className="rounded-[4px] bg-[var(--highlight)] px-1.5 py-[0.1em] font-medium text-[var(--ink)] dark:text-[#fef3c7]"
          >
            {renderInline(markHtmlMatch[1], `${keyPrefix}-m${counter}`)}
          </mark>
        ),
      });
    }

    const markEqMatch = remaining.match(/==([^=\n]+)==/);
    if (markEqMatch && markEqMatch.index !== undefined) {
      candidates.push({
        index: markEqMatch.index,
        length: markEqMatch[0].length,
        node: (
          <mark
            key={`${keyPrefix}-markeq-${counter}`}
            className="rounded-[4px] bg-[var(--highlight)] px-1.5 py-[0.1em] font-medium text-[var(--ink)] dark:text-[#fef3c7]"
          >
            {renderInline(markEqMatch[1], `${keyPrefix}-meq${counter}`)}
          </mark>
        ),
      });
    }

    // <kbd>...</kbd>
    const kbdMatch = remaining.match(/<kbd>([^<]+)<\/kbd>/i);
    if (kbdMatch && kbdMatch.index !== undefined) {
      candidates.push({
        index: kbdMatch.index,
        length: kbdMatch[0].length,
        node: (
          <kbd
            key={`${keyPrefix}-kbd-${counter}`}
            className="inline-flex items-center rounded-[5px] border border-[var(--border-strong)] bg-[var(--surface-muted)] px-1.5 py-[0.08em] font-mono text-[0.82em] font-semibold text-[var(--ink)] shadow-[inset_0_-1px_0_var(--border)]"
          >
            {kbdMatch[1]}
          </kbd>
        ),
      });
    }

    // Bold (**...** or <strong>...</strong>)
    const boldMatch = remaining.match(/\*\*([^*\n]+)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      candidates.push({
        index: boldMatch.index,
        length: boldMatch[0].length,
        node: (
          <strong
            key={`${keyPrefix}-strong-${counter}`}
            className="font-semibold text-[var(--ink)]"
          >
            {renderInline(boldMatch[1], `${keyPrefix}-b${counter}`)}
          </strong>
        ),
      });
    }

    const strongHtmlMatch = remaining.match(/<strong>([\s\S]*?)<\/strong>/i);
    if (strongHtmlMatch && strongHtmlMatch.index !== undefined) {
      candidates.push({
        index: strongHtmlMatch.index,
        length: strongHtmlMatch[0].length,
        node: (
          <strong
            key={`${keyPrefix}-stronghtml-${counter}`}
            className="font-semibold text-[var(--ink)]"
          >
            {renderInline(strongHtmlMatch[1], `${keyPrefix}-bh${counter}`)}
          </strong>
        ),
      });
    }

    // Italic (*...* or _..._ bounded properly or <em>...</em>)
    const italicStarMatch = remaining.match(/(?<!\*)\*([^*\n]+)\*(?!\*)/);
    if (italicStarMatch && italicStarMatch.index !== undefined) {
      candidates.push({
        index: italicStarMatch.index,
        length: italicStarMatch[0].length,
        node: (
          <em key={`${keyPrefix}-em-${counter}`} className="italic">
            {renderInline(italicStarMatch[1], `${keyPrefix}-i${counter}`)}
          </em>
        ),
      });
    }

    const italicUnderscoreMatch = remaining.match(
      /(?<![A-Za-z0-9])_([^_\n]+)_(?![A-Za-z0-9])/
    );
    if (italicUnderscoreMatch && italicUnderscoreMatch.index !== undefined) {
      candidates.push({
        index: italicUnderscoreMatch.index,
        length: italicUnderscoreMatch[0].length,
        node: (
          <em key={`${keyPrefix}-emu-${counter}`} className="italic">
            {renderInline(italicUnderscoreMatch[1], `${keyPrefix}-iu${counter}`)}
          </em>
        ),
      });
    }

    const emHtmlMatch = remaining.match(/<em>([\s\S]*?)<\/em>/i);
    if (emHtmlMatch && emHtmlMatch.index !== undefined) {
      candidates.push({
        index: emHtmlMatch.index,
        length: emHtmlMatch[0].length,
        node: (
          <em key={`${keyPrefix}-emhtml-${counter}`} className="italic">
            {renderInline(emHtmlMatch[1], `${keyPrefix}-ih${counter}`)}
          </em>
        ),
      });
    }

    // Strikethrough (~~...~~)
    const strikeMatch = remaining.match(/~~([^~\n]+)~~/);
    if (strikeMatch && strikeMatch.index !== undefined) {
      candidates.push({
        index: strikeMatch.index,
        length: strikeMatch[0].length,
        node: (
          <del
            key={`${keyPrefix}-del-${counter}`}
            className="line-through opacity-70"
          >
            {renderInline(strikeMatch[1], `${keyPrefix}-d${counter}`)}
          </del>
        ),
      });
    }

    // <br />
    const brMatch = remaining.match(/<br\s*\/?>/i);
    if (brMatch && brMatch.index !== undefined) {
      candidates.push({
        index: brMatch.index,
        length: brMatch[0].length,
        node: <br key={`${keyPrefix}-br-${counter}`} />,
      });
    }

    if (candidates.length === 0) {
      nodes.push(remaining);
      break;
    }

    candidates.sort((a, b) => a.index - b.index);
    const earliest = candidates[0];

    if (earliest.index > 0) {
      nodes.push(remaining.slice(0, earliest.index));
    }
    nodes.push(earliest.node);
    remaining = remaining.slice(earliest.index + earliest.length);
    counter++;
  }

  return nodes;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const blocks = parseBlocks(content);

  return (
    <div className="fold-article-prose">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            if (block.level === 1) {
              return (
                <h1
                  key={`h1-${index}`}
                  className="mt-10 mb-4 text-[1.95rem] font-bold tracking-[-0.025em] leading-[1.2] text-[var(--ink)] [text-wrap:balance]"
                >
                  {renderInline(block.text, `h1-${index}`)}
                </h1>
              );
            }

            if (block.level === 2) {
              return (
                <h2
                  key={`h2-${index}-${block.id}`}
                  id={block.id}
                  className="group relative mt-12 mb-4 scroll-mt-28 border-b border-[var(--border)] pb-2.5 text-[1.55rem] sm:text-[1.72rem] font-semibold tracking-[-0.02em] leading-[1.26] text-[var(--ink)] [text-wrap:balance]"
                >
                  <a
                    href={`#${block.id}`}
                    aria-label={`Jump to section: ${stripMarkdownInline(block.text)}`}
                    className="inline-flex items-baseline gap-2 no-underline hover:text-[var(--ink)]"
                  >
                    <span>{renderInline(block.text, `h2-${index}`)}</span>
                    <span
                      aria-hidden="true"
                      className="font-mono text-base font-normal text-[var(--accent)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      #
                    </span>
                  </a>
                </h2>
              );
            }

            if (block.level === 3) {
              return (
                <h3
                  key={`h3-${index}-${block.id}`}
                  id={block.id}
                  className="group relative mt-8 mb-3 scroll-mt-28 text-[1.24rem] sm:text-[1.32rem] font-semibold tracking-[-0.015em] leading-[1.32] text-[var(--ink)] [text-wrap:balance]"
                >
                  <a
                    href={`#${block.id}`}
                    aria-label={`Jump to subsection: ${stripMarkdownInline(block.text)}`}
                    className="inline-flex items-baseline gap-1.5 no-underline hover:text-[var(--ink)]"
                  >
                    <span>{renderInline(block.text, `h3-${index}`)}</span>
                    <span
                      aria-hidden="true"
                      className="font-mono text-sm font-normal text-[var(--accent)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      #
                    </span>
                  </a>
                </h3>
              );
            }

            return (
              <h4
                key={`h4-${index}-${block.id}`}
                id={block.id}
                className="group relative mt-6 mb-2.5 scroll-mt-28 text-[1.08rem] font-semibold tracking-[-0.01em] leading-[1.38] text-[var(--ink)] [text-wrap:balance]"
              >
                <a
                  href={`#${block.id}`}
                  aria-label={`Jump to section: ${stripMarkdownInline(block.text)}`}
                  className="inline-flex items-baseline gap-1.5 no-underline"
                >
                  <span>{renderInline(block.text, `h4-${index}`)}</span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs font-normal text-[var(--accent)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  >
                    #
                  </span>
                </a>
              </h4>
            );
          }

          case "paragraph":
            return (
              <p
                key={`p-${index}`}
                className="my-5 font-[var(--font-ui)] text-[16px] sm:text-[16.5px] leading-[1.78] text-[var(--ink-secondary)]"
              >
                {renderInline(block.text, `p-${index}`)}
              </p>
            );

          case "blockquote":
            return (
              <blockquote
                key={`bq-${index}`}
                className="my-7 rounded-r-xl border-l-[3px] border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_5%,var(--surface-card))] px-5 py-4 shadow-[var(--shadow-card)]"
              >
                {block.lines.map((line, lIdx) =>
                  line ? (
                    <p
                      key={`bq-${index}-${lIdx}`}
                      className="text-[16.5px] leading-[1.68] text-[var(--ink)] [&+p]:mt-2.5"
                    >
                      {renderInline(line, `bq-${index}-${lIdx}`)}
                    </p>
                  ) : null
                )}
              </blockquote>
            );

          case "code":
            return (
              <CodeBlock
                key={`code-${index}`}
                code={block.code}
                language={block.language}
                title={block.title}
              />
            );

          case "hr":
            return (
              <hr
                key={`hr-${index}`}
                className="my-10 border-0 border-t border-[var(--border)]"
              />
            );

          case "taskList":
            return (
              <ul
                key={`tasks-${index}`}
                className="my-6 space-y-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-4 sm:p-5 list-none shadow-[var(--shadow-card)]"
              >
                {block.items.map((item, itemIdx) => (
                  <li
                    key={`task-${index}-${itemIdx}`}
                    className="flex items-start gap-3 text-[15px] leading-[1.6]"
                  >
                    <span
                      role="checkbox"
                      aria-checked={item.checked}
                      aria-label={item.checked ? "Completed item" : "Pending item"}
                      className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                        item.checked
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_1px_3px_rgba(184,69,44,0.3)]"
                          : "border-[var(--border-strong)] bg-[var(--surface)]"
                      }`}
                    >
                      {item.checked && (
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                          aria-hidden="true"
                        >
                          <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
                        </svg>
                      )}
                    </span>
                    <span
                      className={
                        item.checked
                          ? "text-[var(--ink)]"
                          : "text-[var(--ink-secondary)]"
                      }
                    >
                      {renderInline(item.text, `task-${index}-${itemIdx}`)}
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "ul":
            return (
              <ul
                key={`ul-${index}`}
                className="my-5 space-y-2.5 pl-5 text-[16px] leading-[1.72] text-[var(--ink-secondary)] list-disc marker:text-[var(--accent)]"
              >
                {block.items.map((item, itemIdx) => (
                  <li key={`ul-${index}-${itemIdx}`} className="pl-1">
                    {renderInline(item, `ul-${index}-${itemIdx}`)}
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol
                key={`ol-${index}`}
                className="my-5 space-y-2.5 pl-6 text-[16px] leading-[1.72] text-[var(--ink-secondary)] list-decimal marker:font-mono marker:text-[13px] marker:font-semibold marker:text-[var(--accent)]"
              >
                {block.items.map((item, itemIdx) => (
                  <li key={`ol-${index}-${itemIdx}`} className="pl-1.5">
                    {renderInline(item, `ol-${index}-${itemIdx}`)}
                  </li>
                ))}
              </ol>
            );

          case "table":
            return (
              <div
                key={`table-${index}`}
                className="my-7 overflow-x-auto rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]"
              >
                <table className="w-full min-w-[540px] border-collapse text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                      {block.headers.map((header, hIdx) => {
                        const align = block.alignments[hIdx] || "left";
                        const alignClass =
                          align === "center"
                            ? "text-center"
                            : align === "right"
                              ? "text-right"
                              : "text-left";
                        return (
                          <th
                            key={`th-${index}-${hIdx}`}
                            className={`px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--ink)] ${alignClass}`}
                          >
                            {renderInline(header, `th-${index}-${hIdx}`)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {block.rows.map((row, rIdx) => (
                      <tr
                        key={`tr-${index}-${rIdx}`}
                        className="transition-colors hover:bg-[var(--surface-hover)]"
                      >
                        {block.headers.map((_, cIdx) => {
                          const align = block.alignments[cIdx] || "left";
                          const alignClass =
                            align === "center"
                              ? "text-center"
                              : align === "right"
                                ? "text-right"
                                : "text-left";
                          return (
                            <td
                              key={`td-${index}-${rIdx}-${cIdx}`}
                              className={`px-4 py-3 text-[13.5px] leading-[1.55] text-[var(--ink-secondary)] ${alignClass}`}
                            >
                              {renderInline(
                                row[cIdx] ?? "",
                                `td-${index}-${rIdx}-${cIdx}`
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "figure": {
            const safeSrc = isSafeHref(block.src) ? block.src : "";
            if (!safeSrc) return null;
            return (
              <figure
                key={`fig-${index}`}
                className="my-8 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-[3px] shadow-[var(--shadow-card)]"
              >
                <div className="overflow-hidden rounded-[15px] border border-[var(--border)] bg-[var(--surface-card)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={safeSrc}
                    alt={block.alt}
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                  {(block.caption || block.alt) && (
                    <figcaption className="border-t border-[var(--border)] bg-[var(--surface-muted)]/50 px-4 py-2.5 text-center font-mono text-[11.5px] text-[var(--muted)]">
                      {block.caption || block.alt}
                    </figcaption>
                  )}
                </div>
              </figure>
            );
          }
        }
      })}
    </div>
  );
}
