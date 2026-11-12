"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { DEFAULT_FOLDERS, Note, SortMode, SaveStatus, StorageStats } from "@/types/note";

const FOLDERS_STORAGE_KEY = "fold.folders.v1";
const RESERVED_FOLDER_NAMES = new Set(["all", "starred", "trash"]);

function isReservedFolderName(name: string): boolean {
  return RESERVED_FOLDER_NAMES.has(name.trim().toLowerCase());
}

function normalizeNoteFolder(name: string | undefined): string {
  const clean = (name || "").trim();
  return !clean || isReservedFolderName(clean) ? "Inbox" : clean;
}

function mergeFolders(base: string[], discovered: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of ["Inbox", ...base, ...discovered]) {
    const clean = raw.trim();
    if (!clean || isReservedFolderName(clean)) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }
  return result;
}
import {
  idbLoadAllNotes,
  idbSaveNote,
  idbDeleteNote,
  idbBatchSaveNotes,
  idbCalculateStats,
  generateId,
  getSeedNotes,
} from "@/lib/storage/idb";
import { getSyncEngine } from "@/lib/storage/sync";
import {
  coerceImportedNote,
  processImportFile,
  downloadNoteAsMarkdown,
  copyNoteAsMarkdown,
  exportAllNotesAsJson,
  exportAllNotesAsZip,
} from "@/lib/storage/markdown";
import { audioHaptics } from "@/lib/audio-haptics";
import { useTheme } from "@/lib/use-theme";

interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface WorkspaceContextType {
  notes: Note[];
  selectedId: string | null;
  selectedNote: Note | null;
  folder: string;
  folders: string[];
  tag: string | null;
  query: string;
  sort: SortMode;
  saveStatus: SaveStatus;
  stats: StorageStats;
  sidebarOpen: boolean;
  zenMode: boolean;
  theme: "paper" | "ink";
  toast: ToastState | null;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  storageModalOpen: boolean;
  setStorageModalOpen: (open: boolean) => void;

  // Actions
  createNote: (folderOverride?: string) => Note;
  createFolder: (name: string) => boolean;
  deleteFolder: (name: string, mode?: "move-to-inbox" | "move-to-trash") => void;
  deleteTag: (tagName: string) => void;
  selectNote: (id: string | null) => void;
  updateNoteTitle: (id: string, title: string) => void;
  updateNoteBody: (id: string, body: string) => void;
  updateNoteFolder: (id: string, folder: string) => void;
  updateNoteTag: (id: string, tag: string) => void;
  toggleStar: (id: string) => void;
  togglePin: (id: string) => void;
  toggleLock: (id: string) => void;
  duplicateNote: (id: string) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  emptyTrash: () => void;
  setFolder: (folder: string) => void;
  setTag: (tag: string | null) => void;
  setQuery: (query: string) => void;
  setSort: (sort: SortMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleZenMode: () => void;
  toggleTheme: (event?: React.MouseEvent | MouseEvent) => void;
  importFiles: (files: FileList | File[]) => Promise<void>;
  exportBackup: () => void;
  exportVaultZip: () => Promise<void>;
  requestStoragePersistence: () => Promise<boolean>;
  downloadCurrentNote: () => void;
  copyCurrentNote: () => Promise<boolean>;
  showToast: (message: string, actionLabel?: string, onAction?: () => void) => void;
  hideToast: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({
  children,
  defaultSidebarOpen,
}: {
  children: ReactNode;
  defaultSidebarOpen?: boolean;
}) {
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("fold.notes.v1");
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const validNotes = parsed
              .map(coerceImportedNote)
              .filter((n): n is Note => n !== null);
            if (validNotes.length > 0) {
              const seenIds = new Set<string>();
              const seenTitles = new Set<string>();
              const result: Note[] = [];
              const sorted = [...validNotes].sort((a, b) => (b.updated || 0) - (a.updated || 0));
              for (const n of sorted) {
                const cleanTitle = n.title.trim().toLowerCase();
                if (seenIds.has(n.id)) continue;
                if (cleanTitle && seenTitles.has(cleanTitle)) continue;
                seenIds.add(n.id);
                if (cleanTitle) seenTitles.add(cleanTitle);
                result.push({
                  ...n,
                  folder: normalizeNoteFolder(n.folder),
                });
              }
              return result;
            }
          }
        }
      } catch {}
    }
    return getSeedNotes();
  });
  const [folders, setFolders] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(FOLDERS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (f): f is string => typeof f === "string" && Boolean(f.trim()) && !isReservedFolderName(f)
            );
            return mergeFolders(valid, []);
          }
        }
      } catch {}
    }
    return [...DEFAULT_FOLDERS];
  });
  const foldersRef = useRef<string[]>(folders);
  useEffect(() => {
    foldersRef.current = folders;
    try {
      window.localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
    } catch {}
  }, [folders]);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    // Phones start on the note list; the editor opens after a tap.
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      return null;
    }
    return "seed-craft-notes";
  });
  const [folder, setFolder] = useState<string>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [stats, setStats] = useState<StorageStats>({
    byteSize: 0,
    noteCount: 0,
    formattedSize: "0 KB",
    usagePercent: 0,
  });
  // On phones the sidebar is an overlay, so it must start closed or it hides
  // the note list behind it. In embedded demo layouts it defaults to closed to give
  // the editor canvas ample room. On desktop full app it starts open.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (defaultSidebarOpen !== undefined) return defaultSidebarOpen;
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 768px)").matches;
  });
  const [zenMode, setZenMode] = useState(false);
  const [theme, setTheme] = useTheme();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [storageModalOpen, setStorageModalOpen] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notesRef = useRef<Note[]>(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Initialize Storage and Sync
  useEffect(() => {
    let isMounted = true;

    // Load from IndexedDB
    idbLoadAllNotes().then((loaded) => {
      if (!isMounted) return;
      const dirtyNotes: Note[] = [];
      const sanitized = loaded.map((n) => {
        const fixedFolder = normalizeNoteFolder(n.folder);
        if (fixedFolder !== n.folder) {
          const repaired = { ...n, folder: fixedFolder };
          dirtyNotes.push(repaired);
          return repaired;
        }
        return n;
      });
      if (dirtyNotes.length > 0) {
        idbBatchSaveNotes(dirtyNotes).catch(() => {});
      }
      setNotes(sanitized);
      const discoveredFolders = sanitized
        .filter((n) => !n.deletedAt)
        .map((n) => n.folder);
      setFolders((prev) => mergeFolders(prev, discoveredFolders));
      if (
        sanitized.length > 0 &&
        (typeof window === "undefined" ||
          window.matchMedia("(min-width: 768px)").matches)
      ) {
        setSelectedId(sanitized[0].id);
      }
      idbCalculateStats(sanitized).then(setStats);
    });

    // Setup Multi-tab synchronization
    const sync = getSyncEngine();
    const unsubscribe = sync.subscribe((msg) => {
      if (!isMounted) return;
      if (msg.type === "note_saved") {
        setNotes((prev) => {
          const index = prev.findIndex((n) => n.id === msg.note.id);
          if (index !== -1) {
            const next = [...prev];
            next[index] = msg.note;
            return next;
          } else {
            return [msg.note, ...prev];
          }
        });
      } else if (msg.type === "note_deleted") {
        setNotes((prev) => {
          const remaining = prev.filter((n) => n.id !== msg.id);
          setSelectedId((curr) => (curr === msg.id ? (remaining.length > 0 ? remaining[0].id : null) : curr));
          return remaining;
        });
      } else if (msg.type === "batch_updated") {
        idbLoadAllNotes().then((refreshed) => {
          if (isMounted) setNotes(refreshed);
        });
      }
    });

    // Refresh from storage on visibility change
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        idbLoadAllNotes().then((refreshed) => {
          if (isMounted) setNotes(refreshed);
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Request persistent storage quietly on startup to protect against eviction
    if (typeof navigator !== "undefined" && navigator.storage?.persist) {
      navigator.storage.persist().then((persisted) => {
        if (persisted && isMounted) {
          setStats((prev) => ({ ...prev, isPersisted: true }));
        }
      }).catch(() => {});
    }

    return () => {
      isMounted = false;
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Update storage telemetry when notes list changes
  useEffect(() => {
    idbCalculateStats(notes).then(setStats);
  }, [notes]);

  const showToast = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({ message, actionLabel, onAction });
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 4000);
    },
    []
  );

  const hideToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  // Schedule debounced save for note changes
  const scheduleSave = useCallback((noteToSave: Note) => {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const ok = await idbSaveNote(noteToSave);
      if (ok) {
        setSaveStatus("saved");
        getSyncEngine().broadcastSave(noteToSave);
      } else {
        setSaveStatus("error");
      }
    }, 280);
  }, []);

  const createNote = useCallback(
    (folderOverride?: string): Note => {
      audioHaptics.trigger("tap");
      const targetFolder =
        folderOverride ||
        (folder === "all" || folder === "starred" || folder === "trash"
          ? "Inbox"
          : folder);

      const newNote: Note = {
        id: generateId(),
        title: "",
        body: "<p></p>",
        folder: targetFolder,
        tag: tag || "",
        updated: Date.now(),
        starred: false,
        pinned: false,
      };

      const updated = [newNote, ...notesRef.current];
      setNotes(updated);
      setSelectedId(newNote.id);
      idbSaveNote(newNote).then(() => {
        setSaveStatus("saved");
        getSyncEngine().broadcastSave(newNote);
      });
      showToast("Created note");
      return newNote;
    },
    [folder, tag, showToast]
  );

  const createFolder = useCallback(
    (rawName: string): boolean => {
      const clean = rawName.trim();
      if (!clean) return false;

      if (isReservedFolderName(clean)) {
        audioHaptics.trigger("tap");
        showToast(`"${clean}" is a reserved view. Choose another folder name.`);
        return false;
      }

      const existing = foldersRef.current.find(
        (f) => f.toLowerCase() === clean.toLowerCase()
      );
      if (existing) {
        audioHaptics.trigger("tap");
        setFolder(existing);
        setTag(null);
        showToast(`Opened "${existing}"`);
        return true;
      }

      audioHaptics.trigger("success");
      setFolders((prev) => mergeFolders(prev, [clean]));
      setFolder(clean);
      setTag(null);
      showToast(`Created folder "${clean}"`);
      return true;
    },
    [showToast]
  );

  const deleteFolder = useCallback(
    (name: string, mode: "move-to-inbox" | "move-to-trash" = "move-to-inbox") => {
      if (name === "Inbox") {
        showToast("Inbox cannot be deleted");
        return;
      }

      const prevFolders = [...foldersRef.current];
      const prevNotes = [...notesRef.current];
      const affected = prevNotes.filter((n) => !n.deletedAt && n.folder === name);
      const nextFolders = prevFolders.filter((f) => f !== name);

      audioHaptics.trigger("delete");
      setFolders(nextFolders);

      if (folder === name) {
        setFolder("all");
      }

      if (affected.length === 0) {
        showToast(`Deleted folder "${name}"`, "Undo", () => {
          setFolders(prevFolders);
          setFolder(name);
          setTag(null);
          showToast(`Restored folder "${name}"`);
        });
        return;
      }

      const now = Date.now();
      const updatedNotes = prevNotes.map((n) => {
        if (n.deletedAt || n.folder !== name) return n;
        if (mode === "move-to-trash") {
          return { ...n, folder: "Inbox", deletedAt: now, updated: now };
        }
        return { ...n, folder: "Inbox", updated: now };
      });

      setNotes(updatedNotes);

      if (
        mode === "move-to-trash" &&
        selectedId &&
        affected.some((n) => n.id === selectedId)
      ) {
        const nextActive = updatedNotes.find((n) => !n.deletedAt);
        setSelectedId(nextActive ? nextActive.id : null);
      }

      const changed = updatedNotes.filter((n) =>
        affected.some((orig) => orig.id === n.id)
      );
      idbBatchSaveNotes(changed).then(() => {
        getSyncEngine().broadcastBatch();
      });

      const countLabel = `${affected.length} ${affected.length === 1 ? "note" : "notes"}`;
      const actionMsg =
        mode === "move-to-trash"
          ? `Deleted "${name}" and moved ${countLabel} to trash`
          : `Deleted "${name}" and moved ${countLabel} to Inbox`;

      showToast(actionMsg, "Undo", () => {
        setFolders(prevFolders);
        setNotes(prevNotes);
        idbBatchSaveNotes(affected).then(() => {
          getSyncEngine().broadcastBatch();
        });
        setFolder(name);
        setTag(null);
        showToast(`Restored folder "${name}"`);
      });
    },
    [folder, selectedId, showToast]
  );

  const deleteTag = useCallback(
    (tagName: string) => {
      const target = tagName.toLowerCase().replace(/^#/, "").trim();
      const prevNotes = [...notesRef.current];
      const affected = prevNotes.filter(
        (n) =>
          !n.deletedAt &&
          (n.tag || "").toLowerCase().replace(/^#/, "").trim() === target
      );
      if (affected.length === 0) return;

      audioHaptics.trigger("delete");
      const now = Date.now();
      const updatedNotes = prevNotes.map((n) =>
        !n.deletedAt &&
        (n.tag || "").toLowerCase().replace(/^#/, "").trim() === target
          ? { ...n, tag: "", updated: now }
          : n
      );
      setNotes(updatedNotes);
      if ((tag || "").toLowerCase().replace(/^#/, "").trim() === target) {
        setTag(null);
      }

      const changed = updatedNotes.filter((n) =>
        affected.some((orig) => orig.id === n.id)
      );
      idbBatchSaveNotes(changed).then(() => {
        getSyncEngine().broadcastBatch();
      });

      showToast(`Removed tag #${target}`, "Undo", () => {
        setNotes(prevNotes);
        idbBatchSaveNotes(affected).then(() => {
          getSyncEngine().broadcastBatch();
        });
        showToast(`Restored tag #${target}`);
      });
    },
    [tag, showToast]
  );

  const selectNote = useCallback((id: string | null) => {
    audioHaptics.trigger("tap");
    setSelectedId(id);
    // After picking a note on a phone, get the overlay sidebar out of the way
    // so the editor is immediately usable.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches
    ) {
      setSidebarOpen(false);
    }
  }, []);

  const updateNoteTitle = useCallback(
    (id: string, title: string) => {
      const current = notesRef.current.find((n) => n.id === id);
      if (!current || current.title === title) return;

      const updatedNote: Note = { ...current, title, updated: Date.now() };
      setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
      scheduleSave(updatedNote);
    },
    [scheduleSave]
  );

  const updateNoteBody = useCallback(
    (id: string, body: string) => {
      const current = notesRef.current.find((n) => n.id === id);
      if (!current || current.body === body) return;

      const updatedNote: Note = { ...current, body, updated: Date.now() };
      setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
      scheduleSave(updatedNote);
    },
    [scheduleSave]
  );

  const updateNoteFolder = useCallback(
    (id: string, newFolder: string) => {
      audioHaptics.trigger("tap");
      const current = notesRef.current.find((n) => n.id === id);
      if (!current) return;

      const updatedNote: Note = { ...current, folder: newFolder, updated: Date.now() };
      setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
      scheduleSave(updatedNote);
      showToast(`Moved to ${newFolder}`);
    },
    [scheduleSave, showToast]
  );

  const updateNoteTag = useCallback(
    (id: string, newTag: string) => {
      const clean = newTag.toLowerCase().replace(/^#/, "").trim();
      const current = notesRef.current.find((n) => n.id === id);
      if (!current) return;

      const updatedNote: Note = { ...current, tag: clean, updated: Date.now() };
      setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
      scheduleSave(updatedNote);
    },
    [scheduleSave]
  );

  const toggleStar = useCallback(
    (id: string) => {
      audioHaptics.trigger("toggle");
      const current = notesRef.current.find((n) => n.id === id);
      if (!current) return;

      const nextVal = !current.starred;
      const updatedNote: Note = { ...current, starred: nextVal, updated: Date.now() };
      setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
      scheduleSave(updatedNote);
      showToast(nextVal ? "Starred note" : "Unstarred note");
    },
    [scheduleSave, showToast]
  );

  const togglePin = useCallback(
    (id: string) => {
      audioHaptics.trigger("toggle");
      const current = notesRef.current.find((n) => n.id === id);
      if (!current) return;

      const nextVal = !current.pinned;
      const updatedNote: Note = { ...current, pinned: nextVal, updated: Date.now() };
      setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
      scheduleSave(updatedNote);
      showToast(nextVal ? "Pinned to top" : "Unpinned note");
    },
    [scheduleSave, showToast]
  );

  const toggleLock = useCallback(
    (id: string) => {
      audioHaptics.trigger("toggle");
      const current = notesRef.current.find((n) => n.id === id);
      if (!current) return;

      const nextVal = !current.locked;
      const updatedNote: Note = { ...current, locked: nextVal, updated: Date.now() };
      setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
      scheduleSave(updatedNote);
      showToast(nextVal ? "Note locked (read-only)" : "Note unlocked (editing enabled)");
    },
    [scheduleSave, showToast]
  );

  const duplicateNote = useCallback(
    (id: string) => {
      audioHaptics.trigger("tap");
      const current = notesRef.current.find((n) => n.id === id);
      if (!current) return;

      const dup: Note = {
        ...current,
        id: generateId(),
        title: current.title ? `${current.title} (Copy)` : "Untitled Note (Copy)",
        updated: Date.now(),
        pinned: false,
      };

      const updated = [dup, ...notesRef.current];
      setNotes(updated);
      setSelectedId(dup.id);
      idbSaveNote(dup).then(() => {
        setSaveStatus("saved");
        getSyncEngine().broadcastSave(dup);
      });
      showToast("Duplicated note");
    },
    [showToast]
  );

  // Soft delete: moves note to Trash (deletedAt timestamp) so accidental deletes are 100% recoverable
  const deleteNote = useCallback(
    (id: string) => {
      audioHaptics.trigger("delete");
      const target = notesRef.current.find((n) => n.id === id);
      if (!target) return;

      // If already in trash, permanently delete
      if (target.deletedAt) {
        const remaining = notesRef.current.filter((n) => n.id !== id);
        setNotes(remaining);
        if (selectedId === id) {
          const nextActive = remaining.find((n) => !n.deletedAt);
          setSelectedId(nextActive ? nextActive.id : null);
        }
        idbDeleteNote(id).then(() => {
          getSyncEngine().broadcastDelete(id);
        });
        showToast("Note permanently deleted");
        return;
      }

      // Soft-delete to Trash
      const softDeleted: Note = {
        ...target,
        deletedAt: Date.now(),
        updated: Date.now(),
      };

      const updated = notesRef.current.map((n) => (n.id === id ? softDeleted : n));
      setNotes(updated);
      idbSaveNote(softDeleted).then(() => {
        getSyncEngine().broadcastSave(softDeleted);
      });

      if (selectedId === id) {
        const nextActive = updated.find((n) => !n.deletedAt && n.id !== id);
        setSelectedId(nextActive ? nextActive.id : null);
      }

      showToast("Moved to trash", "Undo", () => {
        const restored: Note = { ...target, deletedAt: null, updated: Date.now() };
        setNotes((prev) => prev.map((n) => (n.id === id ? restored : n)));
        setSelectedId(id);
        idbSaveNote(restored).then(() => {
          getSyncEngine().broadcastSave(restored);
        });
        showToast("Note restored from trash");
      });
    },
    [selectedId, showToast]
  );

  const restoreNote = useCallback(
    (id: string) => {
      audioHaptics.trigger("success");
      const target = notesRef.current.find((n) => n.id === id);
      if (!target) return;

      const restored: Note = { ...target, deletedAt: null, updated: Date.now() };
      setNotes((prev) => prev.map((n) => (n.id === id ? restored : n)));
      setSelectedId(id);
      idbSaveNote(restored).then(() => {
        getSyncEngine().broadcastSave(restored);
      });
      showToast("Note restored from trash");
    },
    [showToast]
  );

  const emptyTrash = useCallback(() => {
    audioHaptics.trigger("delete");
    const trashNotes = notesRef.current.filter((n) => Boolean(n.deletedAt));
    if (trashNotes.length === 0) return;

    const remaining = notesRef.current.filter((n) => !n.deletedAt);
    setNotes(remaining);
    if (trashNotes.some((n) => n.id === selectedId)) {
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }

    Promise.all(trashNotes.map((n) => idbDeleteNote(n.id))).then(() => {
      getSyncEngine().broadcastBatch();
    });

    showToast(`Emptied ${trashNotes.length} ${trashNotes.length === 1 ? "note" : "notes"} from trash`);
  }, [selectedId, showToast]);

  const toggleSidebar = useCallback(() => {
    audioHaptics.trigger("tap");
    setSidebarOpen((prev) => !prev);
  }, []);

  const zenModeRef = useRef(zenMode);
  useEffect(() => {
    zenModeRef.current = zenMode;
  }, [zenMode]);

  const toggleZenMode = useCallback(() => {
    audioHaptics.trigger("toggle");
    const next = !zenModeRef.current;

    // Synchronously request/exit native browser fullscreen in the user event stack
    if (typeof window !== "undefined") {
      try {
        const doc = document as Document & {
          webkitFullscreenElement?: Element;
          webkitExitFullscreen?: () => Promise<void>;
        };
        const el = document.documentElement as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
        };
        if (next) {
          if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
            if (el.requestFullscreen) {
              el.requestFullscreen().catch(() => {});
            } else if (el.webkitRequestFullscreen) {
              el.webkitRequestFullscreen();
            }
          }
          showToast("Entered full screen (⌘. or Esc to exit)");
        } else {
          if (doc.fullscreenElement || doc.webkitFullscreenElement) {
            if (doc.exitFullscreen) {
              doc.exitFullscreen().catch(() => {});
            } else if (doc.webkitExitFullscreen) {
              doc.webkitExitFullscreen();
            }
          }
          showToast("Exited full screen");
        }
      } catch {}
    }

    setZenMode(next);
  }, [showToast]);

  // Sync state if user exits browser native fullscreen via Esc or browser gestures
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
      };
      const isNativeFullscreen = Boolean(
        doc.fullscreenElement || doc.webkitFullscreenElement
      );
      if (!isNativeFullscreen && zenModeRef.current) {
        setZenMode(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleTheme = useCallback((event?: React.MouseEvent | MouseEvent) => {
    audioHaptics.trigger("toggle");
    setTheme(undefined, event);
  }, [setTheme]);

  const importFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileList = Array.from(files);
      if (fileList.length === 0) return;

      let importedCount = 0;
      const newNotes: Note[] = [];

      for (const file of fileList) {
        try {
          const result = await processImportFile(file);
          if (result.isBackup && result.notes) {
            // Restore entire backup
            const normalizedBackup = result.notes.map((n) => ({
              ...n,
              folder: normalizeNoteFolder(n.folder),
            }));
            await idbBatchSaveNotes(normalizedBackup);
            setNotes(normalizedBackup);
            setFolders((prev) =>
              mergeFolders(
                prev,
                normalizedBackup.filter((n) => !n.deletedAt).map((n) => n.folder)
              )
            );
            if (normalizedBackup.length > 0) {
              setSelectedId(normalizedBackup[0].id);
            }
            getSyncEngine().broadcastBatch();
            showToast(`Restored backup of ${normalizedBackup.length} notes`);
            return;
          } else if (result.singleNote) {
            const note: Note = {
              id: generateId(),
              title: result.singleNote.title,
              body: result.singleNote.body,
              folder:
                folder === "all" || folder === "starred" || folder === "trash"
                  ? "Inbox"
                  : folder,
              tag: "imported",
              updated: Date.now(),
              starred: false,
              pinned: false,
            };
            newNotes.push(note);
            await idbSaveNote(note);
            importedCount++;
          }
        } catch (e) {
          console.error("File import failed", e);
        }
      }

      if (newNotes.length > 0) {
        setNotes((prev) => [...newNotes, ...prev]);
        setSelectedId(newNotes[0].id);
        getSyncEngine().broadcastBatch();
        audioHaptics.trigger("success");
        showToast(`Imported ${importedCount} note${importedCount > 1 ? "s" : ""}`);
      }
    },
    [folder, showToast]
  );

  const exportBackup = useCallback(() => {
    audioHaptics.trigger("tap");
    exportAllNotesAsJson(notesRef.current);
    idbCalculateStats(notesRef.current).then(setStats);
    showToast("Exported all notes backup (.json)");
  }, [showToast]);

  const exportVaultZip = useCallback(async () => {
    audioHaptics.trigger("tap");
    try {
      await exportAllNotesAsZip(notesRef.current);
      idbCalculateStats(notesRef.current).then(setStats);
      showToast("Exported Markdown vault (.zip)");
    } catch (e) {
      console.error("Failed to generate zip vault", e);
      showToast("Could not generate ZIP vault. Try exporting a JSON backup instead.");
    }
  }, [showToast]);

  const requestStoragePersistence = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.storage?.persist) {
      try {
        const persisted = await navigator.storage.persist();
        setStats((prev) => ({ ...prev, isPersisted: persisted }));
        showToast(
          persisted
            ? "Persistent storage guaranteed by browser"
            : "Browser denied persistent storage"
        );
        return persisted;
      } catch {
        showToast("Could not verify persistent storage. Try checking browser site settings.");
        return false;
      }
    }
    showToast("Storage API not supported on this device");
    return false;
  }, [showToast]);

  const toggleCommandPalette = useCallback(() => {
    audioHaptics.trigger("tap");
    setCommandPaletteOpen((prev) => !prev);
  }, []);

  const selectedNote = notes.find((n) => n.id === selectedId) || null;

  const downloadCurrentNote = useCallback(() => {
    if (!selectedNote) return;
    audioHaptics.trigger("tap");
    downloadNoteAsMarkdown(selectedNote);
    showToast("Downloaded note as Markdown");
  }, [selectedNote, showToast]);

  const copyCurrentNote = useCallback(async () => {
    if (!selectedNote) return false;
    audioHaptics.trigger("tap");
    const ok = await copyNoteAsMarkdown(selectedNote);
    if (ok) {
      showToast("Copied note as Markdown");
      return true;
    }
    return false;
  }, [selectedNote, showToast]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const isTextEntry = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      const hasOpenDialog = Boolean(document.querySelector('[role="dialog"]'));

      // CMD + S: flush the pending debounced save immediately (blocks browser Save Page As)
      if (isCmd && !e.shiftKey && !e.altKey && key === "s") {
        e.preventDefault();
        const note = notesRef.current.find((n) => n.id === selectedId);
        if (note) {
          setSaveStatus("saving");
          idbSaveNote(note).then((ok) => {
            setSaveStatus(ok ? "saved" : "error");
            showToast(ok ? "Saved to this device" : "Could not save locally");
          });
        }
        return;
      }

      // OPTION/ALT + SHIFT + N: New Note anywhere (avoids browser-reserved CMD + N new window)
      if (!isCmd && e.altKey && e.shiftKey && e.code === "KeyN") {
        e.preventDefault();
        createNote();
        return;
      }

      // CMD + \: Toggle Sidebar
      if (isCmd && !e.shiftKey && !e.altKey && (e.key === "\\" || e.code === "Backslash")) {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // CMD + .: Zen Focus Mode (avoids macOS Chrome/Safari CMD + SHIFT + F toolbar/fullscreen collision)
      if (isCmd && !e.shiftKey && !e.altKey && (e.key === "." || e.code === "Period")) {
        e.preventDefault();
        toggleZenMode();
        return;
      }

      // CMD + D: Duplicate Note (blocks browser Bookmark Page)
      if (isCmd && !e.shiftKey && !e.altKey && key === "d") {
        if (selectedId) {
          e.preventDefault();
          duplicateNote(selectedId);
        }
        return;
      }

      // CMD + P: Pin / unpin the selected note (blocks browser Print)
      if (isCmd && !e.shiftKey && !e.altKey && key === "p") {
        if (selectedId) {
          e.preventDefault();
          togglePin(selectedId);
        }
        return;
      }

      // OPTION/ALT + SHIFT + L: Lock / unlock note (avoids CMD + SHIFT + L checklist & extension conflicts)
      if (!isCmd && e.altKey && e.shiftKey && e.code === "KeyL") {
        if (selectedId) {
          e.preventDefault();
          toggleLock(selectedId);
        }
        return;
      }

      // CMD + K: Global Command Palette / Quick Open
      // (NoteEditor intercepts CMD + K in capture phase when text is selected or caret is in a link.)
      if (isCmd && !e.shiftKey && !e.altKey && key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Plain single-key shortcuts only fire outside text fields and open dialogs.
      if (isCmd || e.altKey || hasOpenDialog || isTextEntry(e.target)) {
        // Escape exits full screen or closes the mobile drawer
        if (e.key === "Escape") {
          if (zenModeRef.current) {
            e.preventDefault();
            toggleZenMode();
            return;
          }
          setSidebarOpen(false);
        }
        return;
      }

      // N: New Note (matches the visible "N" keycap in the sidebar)
      if (key === "n" && !e.shiftKey) {
        e.preventDefault();
        createNote();
        return;
      }

      // T: Toggle theme (matches the theme tooltip)
      if (key === "t" && !e.shiftKey) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      if (e.key === "Escape") {
        if (zenModeRef.current) {
          e.preventDefault();
          toggleZenMode();
          return;
        }
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    createNote,
    toggleSidebar,
    toggleZenMode,
    duplicateNote,
    selectedId,
    togglePin,
    toggleLock,
    toggleTheme,
    showToast,
  ]);

  // Last-chance mirror so a reload or tab close cannot lose the most recent
  // keystrokes while the debounced IndexedDB write is still in flight.
  useEffect(() => {
    const flushMirror = () => {
      try {
        window.localStorage.setItem(
          "fold.notes.v1",
          JSON.stringify(notesRef.current)
        );
      } catch {}
    };

    window.addEventListener("beforeunload", flushMirror);
    window.addEventListener("pagehide", flushMirror);
    return () => {
      window.removeEventListener("beforeunload", flushMirror);
      window.removeEventListener("pagehide", flushMirror);
    };
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        notes,
        selectedId,
        selectedNote,
        folder,
        folders,
        tag,
        query,
        sort,
        saveStatus,
        stats,
        sidebarOpen,
        zenMode,
        theme,
        toast,

        commandPaletteOpen,
        setCommandPaletteOpen,
        toggleCommandPalette,
        storageModalOpen,
        setStorageModalOpen,

        createNote,
        createFolder,
        deleteFolder,
        deleteTag,
        selectNote,
        updateNoteTitle,
        updateNoteBody,
        updateNoteFolder,
        updateNoteTag,
        toggleStar,
        togglePin,
        toggleLock,
        duplicateNote,
        deleteNote,
        restoreNote,
        emptyTrash,
        setFolder,
        setTag,
        setQuery,
        setSort,
        toggleSidebar,
        setSidebarOpen,
        toggleZenMode,
        toggleTheme,
        importFiles,
        exportBackup,
        exportVaultZip,
        requestStoragePersistence,
        downloadCurrentNote,
        copyCurrentNote,
        showToast,
        hideToast,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
