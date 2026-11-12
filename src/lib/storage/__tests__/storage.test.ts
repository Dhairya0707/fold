import { describe, it } from "node:test";
import assert from "node:assert/strict";

const markdown = (await import(
  new URL("../markdown.ts", import.meta.url).href
)) as typeof import("../markdown");
const idb = (await import(
  new URL("../idb.ts", import.meta.url).href
)) as typeof import("../idb");

const {
  MAX_IMPORT_BYTES,
  coerceImportedNote,
  escapeHtml,
  htmlToMarkdown,
  markdownToHtml,
  processImportFile,
  sanitizeUrl,
} = markdown;
const { normalizeNote } = idb;

describe("sanitizeUrl", () => {
  it("accepts http, https, mailto, and single-leading-slash relative URLs", () => {
    assert.equal(sanitizeUrl("https://foldnotes.web.app/app"), "https://foldnotes.web.app/app");
    assert.equal(sanitizeUrl("  http://localhost:3000/notes  "), "http://localhost:3000/notes");
    assert.equal(sanitizeUrl("mailto:support@foldnotes.web.app"), "mailto:support@foldnotes.web.app");
    assert.equal(sanitizeUrl("/blog/offline-notes"), "/blog/offline-notes");
    assert.equal(sanitizeUrl("/"), "/");
  });

  it("rejects protocol-relative, schemeless colon, and dangerous URLs", () => {
    assert.equal(sanitizeUrl("//evil.example/steal"), null);
    assert.equal(sanitizeUrl("///evil.example"), null);
    assert.equal(sanitizeUrl("http:foo"), null);
    assert.equal(sanitizeUrl("https:bar"), null);
    assert.equal(sanitizeUrl("javascript:alert(1)"), null);
    assert.equal(sanitizeUrl("JAVASCRIPT:alert(1)"), null);
    assert.equal(sanitizeUrl("data:text/html,<script>alert(1)</script>"), null);
    assert.equal(sanitizeUrl("vbscript:msgbox(1)"), null);
    assert.equal(sanitizeUrl(""), null);
    assert.equal(sanitizeUrl("   "), null);
    assert.equal(sanitizeUrl(null), null);
    assert.equal(sanitizeUrl(undefined), null);
  });
});

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    assert.equal(
      escapeHtml(`<script>alert("xss" & 'test')</script>`),
      "&lt;script&gt;alert(&quot;xss&quot; &amp; &#039;test&#039;)&lt;/script&gt;"
    );
  });

  it("leaves safe plain text untouched", () => {
    assert.equal(escapeHtml("Fold local-first notes 2026"), "Fold local-first notes 2026");
  });
});

describe("htmlToMarkdown & markdownToHtml", () => {
  it("returns empty string for empty input and strips tags in non-DOM fallback", () => {
    assert.equal(htmlToMarkdown(""), "");
    assert.equal(
      htmlToMarkdown("<p>Hello <strong>Fold</strong></p>"),
      "Hello Fold"
    );
  });

  it("uses DOMParser instead of innerHTML when DOM globals are available", () => {
    let parseCalledWith: { html: string; mimeType: string } | null = null;
    const originalDOMParser = globalThis.DOMParser;
    const originalDocument = globalThis.document;
    const originalNode = globalThis.Node;

    class MockElement {
      nodeType = 1;
      tagName = "P";
      textContent = "Parsed safely";
      childNodes: MockElement[] = [];
      querySelectorAll() {
        return [];
      }
      querySelector() {
        return null;
      }
      getAttribute() {
        return null;
      }
      replaceWith() {}
    }

    const mockBody = {
      childNodes: [new MockElement()],
      querySelectorAll() {
        return [];
      },
    };

    try {
      (globalThis as unknown as { Node: unknown }).Node = { ELEMENT_NODE: 1 };
      (globalThis as unknown as { document: unknown }).document = {
        createElement: () => {
          throw new Error("Should not create container via document.createElement");
        },
      };
      (globalThis as unknown as { DOMParser: unknown }).DOMParser = class {
        parseFromString(html: string, mimeType: string) {
          parseCalledWith = { html, mimeType };
          return {
            body: mockBody,
            createElement: () => new MockElement(),
            createTextNode: () => new MockElement(),
          };
        }
      };

      const result = htmlToMarkdown("<p>Parsed safely<img src=x onerror=alert(1)></p>");
      assert.deepEqual(parseCalledWith, {
        html: "<p>Parsed safely<img src=x onerror=alert(1)></p>",
        mimeType: "text/html",
      });
      assert.equal(result, "Parsed safely");
    } finally {
      (globalThis as unknown as { DOMParser: unknown }).DOMParser = originalDOMParser;
      (globalThis as unknown as { document: unknown }).document = originalDocument;
      (globalThis as unknown as { Node: unknown }).Node = originalNode;
    }
  });

  it("escapes inline HTML and strips unsafe links in markdownToHtml", () => {
    const html = markdownToHtml(
      "- [x] Buy <milk> & [link](//evil.com) and [safe](https://foldnotes.web.app)"
    );
    assert.ok(html.includes("&lt;milk&gt; &amp;"));
    assert.ok(!html.includes('href="//evil.com"'));
    assert.ok(html.includes('<a href="https://foldnotes.web.app" rel="noopener noreferrer">safe</a>'));
  });
});

describe("processImportFile", () => {
  it("rejects files exceeding the 10 MB size cap before reading file contents", async () => {
    let textCalled = false;
    const oversizedFile = {
      name: "huge-backup.json",
      type: "application/json",
      size: MAX_IMPORT_BYTES + 1,
      text: async () => {
        textCalled = true;
        return "[]";
      },
    } as unknown as File;

    await assert.rejects(
      () => processImportFile(oversizedFile),
      /10 MB size limit/i
    );
    assert.equal(textCalled, false);
  });

  it("rejects malformed JSON backup files", async () => {
    const brokenJson = new File(["{not valid json"], "backup.json", {
      type: "application/json",
    });

    await assert.rejects(
      () => processImportFile(brokenJson),
      /Invalid JSON backup file/i
    );
  });

  it("rejects non-array JSON backup payloads or arrays with no valid notes", async () => {
    const objectJson = new File([JSON.stringify({ id: "1", title: "x", body: "y" })], "backup.json", {
      type: "application/json",
    });
    await assert.rejects(
      () => processImportFile(objectJson),
      /must be an array/i
    );

    const invalidArrayJson = new File(
      [JSON.stringify([null, "bad", { id: "", title: "t", body: "b" }, { id: "1", title: 99, body: "b" }])],
      "backup.json",
      { type: "application/json" }
    );
    await assert.rejects(
      () => processImportFile(invalidArrayJson),
      /No valid notes found/i
    );
  });

  it("parses valid JSON backups and strips untrusted fields via coerceImportedNote", async () => {
    const payload = [
      {
        id: "note-1",
        title: "First Note",
        body: "<p>Hello</p>",
        folder: "Work",
        tag: "#Craft",
        updatedAt: "2026-11-10T10:00:00.000Z",
        starred: true,
        pinned: "true",
        extraEvilProp: "should-not-copy",
      },
      { id: 123, title: "Invalid", body: "skip me" },
      null,
    ];

    const file = new File([JSON.stringify(payload)], "fold-notes-backup.json", {
      type: "application/json",
    });

    const result = await processImportFile(file);
    assert.equal(result.isBackup, true);
    assert.equal(result.notes?.length, 1);
    const note = result.notes![0];
    assert.equal(note.id, "note-1");
    assert.equal(note.title, "First Note");
    assert.equal(note.body, "<p>Hello</p>");
    assert.equal(note.folder, "Work");
    assert.equal(note.tag, "craft");
    assert.equal(note.updated, Date.parse("2026-11-10T10:00:00.000Z"));
    assert.equal(note.starred, true);
    assert.equal(note.pinned, false);
    assert.equal(note.locked, false);
    assert.equal(note.deletedAt, null);
    assert.equal("extraEvilProp" in note, false);
  });

  it("imports markdown files into a sanitized single note", async () => {
    const mdFile = new File(
      ["# Weekly Plan\n\n- [ ] Ship <fix> & verify\n"],
      "weekly-plan.md",
      { type: "text/markdown" }
    );

    const result = await processImportFile(mdFile);
    assert.equal(result.isBackup, false);
    assert.equal(result.singleNote?.title, "Weekly Plan");
    assert.ok(result.singleNote?.body.includes("Ship &lt;fix&gt; &amp; verify"));
  });
});

describe("coerceImportedNote", () => {
  it("rejects primitives, arrays, and non-plain prototypes", () => {
    assert.equal(coerceImportedNote(null), null);
    assert.equal(coerceImportedNote("str"), null);
    assert.equal(coerceImportedNote([]), null);
    assert.equal(coerceImportedNote(new Date()), null);
  });
});

describe("normalizeNote", () => {
  it("escapes &, <, > in legacy .check-row migration before inserting into <p>", () => {
    const normalized = normalizeNote({
      id: "legacy-1",
      title: "Legacy checklist",
      body:
        '<div class="check-row"><input type="checkbox" checked><span>Buy a & b < c > d</span></div>' +
        '<p><input type="checkbox"> Second & item < 2 > 1</p>',
      updated: 1700000000000,
    });

    assert.ok(
      normalized.body.includes(
        '<li data-type="taskItem" data-checked="true"><p>Buy a &amp; b &lt; c &gt; d</p></li>'
      )
    );
    assert.ok(
      normalized.body.includes(
        '<li data-type="taskItem" data-checked="false"><p>Second &amp; item &lt; 2 &gt; 1</p></li>'
      )
    );
    // Consolidates adjacent taskLists into a single <ul data-type="taskList">
    assert.equal(normalized.body.match(/<ul data-type="taskList">/g)?.length, 1);
  });

  it("escapes unclosed angle brackets in legacy checkbox text", () => {
    const normalized = normalizeNote({
      id: "legacy-2",
      title: "Unclosed tag",
      body: '<div class="check-row"><input type="checkbox"><span>5 < 10 & 20 > 3</span></div>',
      updated: 1700000000000,
    });

    assert.ok(normalized.body.includes("5 &lt; 10 &amp; 20 &gt; 3"));
    assert.equal(normalized.folder, "Inbox");
    assert.equal(normalized.deletedAt, null);
  });
});
