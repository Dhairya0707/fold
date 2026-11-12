import { Note, StorageStats } from "@/types/note";

const DB_NAME = "fold_db";
const DB_VERSION = 2;
const STORE_NAME = "notes";
const STORAGE_KEY = "fold.notes.v1";

export function generateId(): string {
  if (typeof window !== "undefined") {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "note-" + Date.now().toString(36) + "-" + Math.random().toString(16).slice(2, 8);
  }
  return "note-initial-placeholder";
}

export function getSeedNotes(): Note[] {
  const baseTime = 1731000000000;
  return [
    {
      id: "seed-welcome-fold",
      title: "Welcome to Fold — Private, Local & Quiet",
      folder: "Inbox",
      tag: "welcome",
      updated: baseTime,
      starred: true,
      pinned: true,
      body: `
        <p>Fold is your calm, private scratchpad. <strong>Notes live exclusively in this browser's IndexedDB engine</strong> — zero cloud sync, zero tracking, zero accounts.</p>
        <p><mark>What you write here belongs entirely to you.</mark> Highlighting any text reveals the tactile bubble formatting menu.</p>
        <h3>Essential Shortcuts</h3>
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="true"><p><strong>⌘K</strong> — Open Command Palette & Quick Switcher (or insert link on selected text)</p></li>
          <li data-type="taskItem" data-checked="true"><p><strong>N</strong> or <strong>⌥⇧N</strong> — Create a new note</p></li>
          <li data-type="taskItem" data-checked="true"><p><strong>⌘S</strong> — Instantly save & confirm local persistence</p></li>
          <li data-type="taskItem" data-checked="false"><p><strong>⌘.</strong> — Enter serene Zen Focus Mode (Esc to exit)</p></li>
          <li data-type="taskItem" data-checked="false"><p><strong>⌘P</strong> — Pin note to the top of your list</p></li>
        </ul>
        <h3>Trust & Backups</h3>
        <p>Because browser storage can be cleared if site data is purged, use <strong>Backup Vault (.zip / JSON)</strong> in the sidebar to download your full markdown library at any time.</p>
      `.trim(),
    },
    {
      id: "seed-craft-notes",
      title: "Hardware-grade craft notes",
      folder: "Ideas",
      tag: "craft",
      updated: baseTime - 15 * 60 * 1000,
      starred: false,
      pinned: false,
      body: `
        <p>Fold is built around <strong>concentric double-framing</strong>, specular reflections, and pure local persistence.</p>
        <p><mark>No accounts, no cloud sync, no tracking.</mark> Every thought belongs only to this device.</p>
        <h3>Craft tenets</h3>
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="true"><p>Concentric radius law: R_inner = R_outer - Padding</p></li>
          <li data-type="taskItem" data-checked="true"><p>Directional specular catchlights on top edges</p></li>
          <li data-type="taskItem" data-checked="false"><p>IndexedDB asynchronous local-first persistence</p></li>
          <li data-type="taskItem" data-checked="false"><p>Analog film-grain depth and calm typography</p></li>
        </ul>
      `.trim(),
    },
    {
      id: "seed-remember",
      title: "Things I want to remember",
      folder: "Journal",
      tag: "personal",
      updated: baseTime - 45 * 60 * 1000,
      starred: true,
      pinned: false,
      body: `
        <p>There is a version of this week where I do less and it still works. I want to remember that.</p>
        <p><mark>The quiet part is the point.</mark> Not every open tab deserves a reply.</p>
        <h3>Small list</h3>
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="true"><p>Book the train for Friday</p></li>
          <li data-type="taskItem" data-checked="true"><p>Call the dentist before 5</p></li>
          <li data-type="taskItem" data-checked="false"><p>Read the lease terms</p></li>
        </ul>
      `.trim(),
    },
    {
      id: "seed-architecture",
      title: "Studio architecture, Doblique & Wensity",
      folder: "Ideas",
      tag: "design",
      updated: baseTime - 2 * 60 * 60 * 1000,
      starred: false,
      pinned: false,
      body: `
        <p>A workspace should feel like a fine physical instrument. Tactile weight, subtle elevation, and responsive deceleration physics.</p>
        <blockquote>Make the product the first thing a person can touch.</blockquote>
      `.trim(),
    },
    {
      id: "seed-renewal",
      title: "Studio lease, 2026 renewal",
      folder: "Work",
      tag: "admin",
      updated: baseTime - 26 * 60 * 60 * 1000,
      starred: false,
      pinned: false,
      body: `
        <p>Renewal window opens 1 June. Ask about storage unit expansion and dedicated fiber.</p>
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="false"><p>Find the signed lease copy</p></li>
          <li data-type="taskItem" data-checked="true"><p>Email the building manager</p></li>
        </ul>
      `.trim(),
    },
  ];
}

/**
 * Normalizes legacy HTML check-rows or legacy fields into standard Note structure.
 */
export function normalizeNote(raw: Partial<Note>): Note {
  let body = typeof raw.body === "string" ? raw.body : "";

  // Convert legacy check-rows or check-lists to TipTap task lists
  if (body.includes("check-row") || body.includes('type="checkbox"')) {
    // 1. Matches <div class="check-row">...<input type="checkbox"...>...</div>
    body = body.replace(
      /<div[^>]*class=["'][^"']*check-row[^"']*["'][^>]*>\s*<input[^>]*type=["']checkbox["']([^>]*)>\s*(?:<span>|<p>)?([\s\S]*?)(?:<\/span>|<\/p>)?\s*<\/div>/gi,
      (_match, attrs, text) => {
        const isChecked = attrs.includes("checked");
        const cleanText = text.replace(/<[^>]*>?/gm, "").trim();
        return `<ul data-type="taskList"><li data-type="taskItem" data-checked="${isChecked}"><p>${cleanText || "Task item"}</p></li></ul>`;
      }
    );

    // 2. Matches orphaned <input type="checkbox" ...> followed by text or paragraph
    body = body.replace(
      /<p[^>]*>\s*<input[^>]*type=["']checkbox["']([^>]*)>\s*([\s\S]*?)<\/p>/gi,
      (_match, attrs, text) => {
        const isChecked = attrs.includes("checked");
        const cleanText = text.replace(/<[^>]*>?/gm, "").trim();
        return `<ul data-type="taskList"><li data-type="taskItem" data-checked="${isChecked}"><p>${cleanText || "Task item"}</p></li></ul>`;
      }
    );

    // Consolidate adjacent </ul><ul data-type="taskList">
    body = body.replace(/<\/ul>\s*(?:<p>\s*<\/p>\s*)*<ul data-type="taskList">/gi, "");
  }

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : generateId(),
    title: typeof raw.title === "string" ? raw.title : "",
    body,
    folder: typeof raw.folder === "string" && raw.folder ? raw.folder : "Inbox",
    tag: typeof raw.tag === "string" ? raw.tag.toLowerCase().replace(/^#/, "").trim() : "",
    updated: typeof raw.updated === "number" && !isNaN(raw.updated) ? raw.updated : Date.now(),
    starred: Boolean(raw.starred),
    pinned: Boolean(raw.pinned),
    locked: Boolean(raw.locked),
    deletedAt: typeof raw.deletedAt === "number" ? raw.deletedAt : null,
  };
}

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase | null> | null = null;

export function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("updated", "updated", { unique: false });
          store.createIndex("folder", "folder", { unique: false });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        // Listen for close/versionchange
        dbInstance.onversionchange = () => {
          dbInstance?.close();
          dbInstance = null;
        };
        resolve(dbInstance);
      };

      request.onerror = (e) => {
        console.warn("IndexedDB failed to open, using memory/localStorage fallback", e);
        resolve(null);
      };
    } catch (err) {
      console.warn("IndexedDB initialization exception", err);
      resolve(null);
    }
  });

  return dbPromise;
}

/**
 * Loads all notes from IndexedDB. If empty, checks localStorage migration, otherwise returns seeds.
 */
export async function idbLoadAllNotes(): Promise<Note[]> {
  const db = await openDatabase();
  let loaded: Note[] | null = null;

  if (db) {
    try {
      loaded = await new Promise<Note[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("Error reading from IndexedDB", e);
    }
  }

  // Check localStorage mirror / legacy
  let rawLocalStorage: string | null = null;
  try {
    rawLocalStorage = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
  } catch {}

  let legacyNotes: Note[] | null = null;
  if (rawLocalStorage) {
    try {
      const parsed = JSON.parse(rawLocalStorage);
      if (Array.isArray(parsed) && parsed.length > 0) {
        legacyNotes = parsed;
      }
    } catch {}
  }

  function dedupeNotes(list: Note[]): Note[] {
    const seenIds = new Set<string>();
    const titleToNote = new Map<string, Note>();
    const result: Note[] = [];

    // Sort newest first so newer edits supersede older duplicates
    const sorted = [...list].sort((a, b) => (b.updated || 0) - (a.updated || 0));

    for (const item of sorted) {
      if (seenIds.has(item.id)) continue;
      const cleanTitle = (item.title || "").trim().toLowerCase();
      if (cleanTitle && titleToNote.has(cleanTitle)) {
        continue;
      }
      seenIds.add(item.id);
      if (cleanTitle) {
        titleToNote.set(cleanTitle, item);
      }
      result.push(item);
    }
    return result;
  }

  // Migration logic
  if (loaded && loaded.length > 0) {
    // Normal case: IndexedDB has data
    const normalized = dedupeNotes(loaded.map(normalizeNote));
    if (normalized.length !== loaded.length && db) {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        for (const n of normalized) {
          store.put(n);
        }
      } catch (err) {
        console.warn("Failed to prune duplicates from IndexedDB", err);
      }
    }
    syncLocalStorageMirror(normalized);
    return normalized;
  }

  if (legacyNotes && legacyNotes.length > 0) {
    // Migrate from legacy localStorage
    const normalized = dedupeNotes(legacyNotes.map(normalizeNote));
    await idbBatchSaveNotes(normalized);
    syncLocalStorageMirror(normalized);
    return normalized;
  }

  // Truly fresh install: seed initial notes
  const seeds = dedupeNotes(getSeedNotes());
  await idbBatchSaveNotes(seeds);
  syncLocalStorageMirror(seeds);
  return seeds;
}

/**
 * Upserts a single note atomically in IndexedDB without clearing or locking all other notes.
 */
export async function idbSaveNote(note: Note): Promise<boolean> {
  const normalized = normalizeNote(note);
  const db = await openDatabase();

  let idbSuccess = false;
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(normalized);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      idbSuccess = true;
    } catch (e) {
      console.warn("IndexedDB single note put failed", e);
    }
  }

  return idbSuccess;
}

/**
 * Deletes a single note by id from IndexedDB.
 */
export async function idbDeleteNote(id: string): Promise<boolean> {
  const db = await openDatabase();
  if (!db) return false;

  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return true;
  } catch (e) {
    console.warn("IndexedDB note delete failed", e);
    return false;
  }
}

/**
 * Atomically batch-saves all notes without clearing store unsafely.
 */
export async function idbBatchSaveNotes(notes: Note[]): Promise<boolean> {
  const db = await openDatabase();
  if (!db) {
    syncLocalStorageMirror(notes);
    return false;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      // Clean transactional put for each
      for (const note of notes) {
        store.put(normalizeNote(note));
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error("Transaction aborted"));
    });
    syncLocalStorageMirror(notes);
    return true;
  } catch (e) {
    console.warn("IndexedDB batch save failed", e);
    syncLocalStorageMirror(notes);
    return false;
  }
}

/**
 * Emergency backup mirror to localStorage
 */
function syncLocalStorageMirror(notes: Note[]) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  } catch {
    // Silent fail if quota exceeded
  }
}

/**
 * Calculates storage statistics including byte size and note count.
 */
export async function idbCalculateStats(notes: Note[]): Promise<StorageStats> {
  let byteSize = 0;
  for (const n of notes) {
    byteSize += (n.title || "").length * 2;
    byteSize += (n.body || "").length * 2;
    byteSize += (n.folder || "").length * 2;
    byteSize += (n.tag || "").length * 2;
    byteSize += 64; // metadata overhead
  }

  let formatted = "0 KB";
  if (byteSize < 1024) {
    formatted = `${byteSize} B`;
  } else if (byteSize < 1024 * 1024) {
    formatted = `${(byteSize / 1024).toFixed(1)} KB`;
  } else {
    formatted = `${(byteSize / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Prefer the browser's real origin quota; fall back to a 5 MB estimate when
  // the Storage API is unavailable (Safari private mode, older browsers).
  let usagePercent = Math.min(100, Math.max(1, (byteSize / (5 * 1024 * 1024)) * 100));
  let isPersisted = false;
  try {
    if (typeof navigator !== "undefined" && navigator.storage) {
      if (navigator.storage.persisted) {
        isPersisted = await navigator.storage.persisted();
      }
      if (navigator.storage.estimate) {
        const { usage, quota } = await navigator.storage.estimate();
        if (typeof usage === "number" && typeof quota === "number" && quota > 0) {
          usagePercent = Math.min(100, Math.max(1, (usage / quota) * 100));
        }
      }
    }
  } catch {
    // Keep the conservative fallback.
  }

  let lastBackupDate: string | null = null;
  try {
    if (typeof window !== "undefined") {
      lastBackupDate = window.localStorage.getItem("fold.lastBackupDate");
    }
  } catch {}

  return {
    byteSize,
    noteCount: notes.length,
    formattedSize: formatted,
    usagePercent,
    isPersisted,
    lastBackupDate,
  };
}
