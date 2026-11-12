import { Note } from "@/types/note";
import JSZip from "jszip";

export function sanitizeFileName(name: string): string {
  return (
    name
      .replace(/[^a-z0-9_-]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "untitled-note"
  );
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^(https?:|\/|mailto:)/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Converts rich HTML content (from Tiptap or legacy Fold) to clean Markdown.
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>?/gm, "");
  }

  const container = document.createElement("div");
  container.innerHTML = html;

  // Process task items first
  container.querySelectorAll('li[data-type="taskItem"], .check-row').forEach((item) => {
    const isChecked =
      item.getAttribute("data-checked") === "true" ||
      Boolean(item.querySelector('input[type="checkbox"]:checked'));
    const checkboxToken = isChecked ? "- [x] " : "- [ ] ";
    const textNode = item.querySelector("p") || item.querySelector("span") || item;
    const text = textNode.textContent?.trim() || "";
    const p = document.createElement("p");
    p.textContent = checkboxToken + text;
    item.replaceWith(p);
  });

  // Process Headings
  container.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
    const level = parseInt(h.tagName.substring(1), 10) || 2;
    const prefix = "#".repeat(level) + " ";
    const p = document.createElement("p");
    p.textContent = prefix + (h.textContent?.trim() || "");
    h.replaceWith(p);
  });

  // Process standard list items
  container.querySelectorAll("li").forEach((li) => {
    const p = document.createElement("p");
    p.textContent = "- " + (li.textContent?.trim() || "");
    li.replaceWith(p);
  });

  // Process blockquotes
  container.querySelectorAll("blockquote").forEach((bq) => {
    const p = document.createElement("p");
    p.textContent = "> " + (bq.textContent?.trim() || "");
    bq.replaceWith(p);
  });

  // Process inline tags
  function convertInline(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    Array.from(el.childNodes).forEach(convertInline);

    const tag = el.tagName.toLowerCase();
    let prefix = "";
    let suffix = "";

    if (tag === "strong" || tag === "b") {
      prefix = "**";
      suffix = "**";
    } else if (tag === "em" || tag === "i") {
      prefix = "*";
      suffix = "*";
    } else if (tag === "code") {
      prefix = "`";
      suffix = "`";
    } else if (tag === "mark") {
      prefix = "==";
      suffix = "==";
    } else if (tag === "a") {
      const href = sanitizeUrl(el.getAttribute("href"));
      if (href) {
        prefix = "[";
        suffix = `](${href})`;
      }
    }

    if (prefix || suffix) {
      const text = el.textContent || "";
      el.replaceWith(document.createTextNode(prefix + text + suffix));
    }
  }

  Array.from(container.childNodes).forEach(convertInline);

  const lines: string[] = [];
  container.childNodes.forEach((node) => {
    const t = (node.textContent || "").trim();
    if (t) lines.push(t);
  });

  return lines.join("\n\n");
}

/**
 * Converts Markdown string into semantic HTML with Tiptap taskList structures.
 */
export function markdownToHtml(md: string): string {
  if (!md) return "";
  const rawLines = md.split(/\r?\n/);
  const output: string[] = [];
  let inTaskList = false;
  let inBulletList = false;

  for (const rawLine of rawLines) {
    let line = rawLine.trim();
    if (!line) {
      if (inTaskList) {
        output.push("</ul>");
        inTaskList = false;
      }
      if (inBulletList) {
        output.push("</ul>");
        inBulletList = false;
      }
      continue;
    }

    line = escapeHtml(line);
    line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    line = line.replace(/\*(.+?)\*/g, "<em>$1</em>");
    line = line.replace(/`(.+?)`/g, "<code>$1</code>");
    line = line.replace(/==(.+?)==/g, "<mark>$1</mark>");
    line = line.replace(/\[(.+?)\]\((.+?)\)/g, (_match, label, url) => {
      const safe = sanitizeUrl(url);
      return safe ? `<a href="${safe}" rel="noopener noreferrer">${label}</a>` : label;
    });

    // Task list items: - [ ] or - [x]
    const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (taskMatch) {
      if (inBulletList) {
        output.push("</ul>");
        inBulletList = false;
      }
      if (!inTaskList) {
        output.push('<ul data-type="taskList">');
        inTaskList = true;
      }
      const isChecked = taskMatch[1].toLowerCase() === "x";
      output.push(
        `<li data-type="taskItem" data-checked="${isChecked}"><p>${taskMatch[2]}</p></li>`
      );
      continue;
    }

    // Bullet list items: - or *
    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      if (inTaskList) {
        output.push("</ul>");
        inTaskList = false;
      }
      if (!inBulletList) {
        output.push("<ul>");
        inBulletList = true;
      }
      output.push(`<li>${listMatch[1]}</li>`);
      continue;
    }

    if (inTaskList) {
      output.push("</ul>");
      inTaskList = false;
    }
    if (inBulletList) {
      output.push("</ul>");
      inBulletList = false;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = Math.min(3, headingMatch[1].length);
      output.push(`<h${level}>${headingMatch[2]}</h${level}>`);
      continue;
    }

    // Blockquote
    const bqMatch = line.match(/^&gt;\s+(.*)$/);
    if (bqMatch) {
      output.push(`<blockquote><p>${bqMatch[1]}</p></blockquote>`);
      continue;
    }

    // Paragraph
    output.push(`<p>${line}</p>`);
  }

  if (inTaskList || inBulletList) {
    output.push("</ul>");
  }

  return output.join("");
}

export function downloadNoteAsMarkdown(note: Note): void {
  const mdBody = htmlToMarkdown(note.body);
  const fullContent = `# ${note.title || "Untitled"}\n\n${mdBody}\n`;
  const blob = new Blob([fullContent], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFileName(note.title || "note")}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyNoteAsMarkdown(note: Note): Promise<boolean> {
  const mdBody = htmlToMarkdown(note.body);
  const fullContent = `# ${note.title || "Untitled"}\n\n${mdBody}\n`;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullContent);
      return true;
    }
    return false;
  } catch (e) {
    console.warn("Failed to copy markdown to clipboard", e);
    return false;
  }
}

export function exportAllNotesAsJson(notes: Note[]): void {
  const data = JSON.stringify(notes, null, 2);
  const blob = new Blob([data], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fold-notes-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("fold.lastBackupDate", new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    }
  } catch {}
}

/**
 * Exports all active notes as individual Markdown files inside a .zip archive,
 * organized with standard YAML frontmatter for seamless import into Obsidian, Bear, or iA Writer.
 */
export async function exportAllNotesAsZip(notes: Note[]): Promise<void> {
  const zip = new JSZip();
  const dateStr = new Date().toISOString().slice(0, 10);

  // Group notes into folders
  const activeNotes = notes.filter((n) => !n.deletedAt);
  const usedFileNames = new Set<string>();

  for (const note of activeNotes) {
    const rawTitle = note.title.trim() || "Untitled";
    const baseName = sanitizeFileName(rawTitle);
    let fileName = `${baseName}.md`;
    let counter = 2;
    while (usedFileNames.has(`${note.folder}/${fileName}`)) {
      fileName = `${baseName}-${counter}.md`;
      counter++;
    }
    usedFileNames.add(`${note.folder}/${fileName}`);

    const mdContent = htmlToMarkdown(note.body);
    const dateFormatted = new Date(note.updated).toISOString().slice(0, 10);
    const frontmatter = [
      "---",
      `title: "${rawTitle.replace(/"/g, '\\"')}"`,
      `date: ${dateFormatted}`,
      `folder: "${note.folder}"`,
      `tag: "${note.tag}"`,
      `starred: ${Boolean(note.starred)}`,
      `pinned: ${Boolean(note.pinned)}`,
      "---",
      "",
      `# ${rawTitle}`,
      "",
      mdContent,
      "",
    ].join("\n");

    const folderPath = note.folder ? `${sanitizeFileName(note.folder)}/` : "";
    zip.file(`${folderPath}${fileName}`, frontmatter);
  }

  // Also include the raw JSON vault backup for 1-click full restore
  zip.file("fold-vault-manifest.json", JSON.stringify(notes, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fold-vault-backup-${dateStr}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("fold.lastBackupDate", new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    }
  } catch {}
}

export interface ImportedNotePayload {
  isBackup: boolean;
  notes?: Note[];
  singleNote?: {
    title: string;
    body: string;
  };
}

export async function processImportFile(file: File): Promise<ImportedNotePayload> {
  const text = await file.text();

  if (file.name.endsWith(".json") || file.type === "application/json") {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { isBackup: true, notes: parsed };
      }
    } catch (e) {
      console.warn("Could not parse JSON import, treating as text", e);
    }
  }

  // Treat as Markdown or plain text
  const lines = text.split(/\r?\n/);
  let title = file.name.replace(/\.[^/.]+$/, "");
  let bodyLines = lines;

  // If first line is a markdown heading, use it as title
  const firstNonEmptyIndex = lines.findIndex((l) => l.trim().length > 0);
  if (firstNonEmptyIndex !== -1) {
    const firstLine = lines[firstNonEmptyIndex].trim();
    if (firstLine.startsWith("# ")) {
      title = firstLine.replace(/^#+\s*/, "").trim();
      bodyLines = lines.slice(firstNonEmptyIndex + 1);
    }
  }

  const rawMd = bodyLines.join("\n").trim();
  const htmlBody = markdownToHtml(rawMd);

  return {
    isBackup: false,
    singleNote: {
      title,
      body: htmlBody || "<p></p>",
    },
  };
}
