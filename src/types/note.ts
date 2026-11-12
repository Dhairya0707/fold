export interface Note {
  id: string;
  title: string;
  body: string;
  folder: string;
  tag: string;
  updated: number;
  starred: boolean;
  pinned: boolean;
  locked?: boolean;
  deletedAt?: number | null; // Soft-delete timestamp for Trash / recovery
}

export type SortMode = "newest" | "oldest" | "az" | "za" | "starred";

export type SaveStatus = "saved" | "saving" | "offline" | "error";

export interface StorageStats {
  byteSize: number;
  noteCount: number;
  formattedSize: string;
  usagePercent: number;
  isPersisted?: boolean;
  lastBackupDate?: string | null;
}

export const DEFAULT_FOLDERS = ["Inbox", "Ideas", "Work", "Journal"] as const;
export type DefaultFolder = (typeof DEFAULT_FOLDERS)[number];
