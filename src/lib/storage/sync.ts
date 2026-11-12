import { Note } from "@/types/note";

export type SyncMessage =
  | { type: "note_saved"; note: Note; senderId: string }
  | { type: "note_deleted"; id: string; senderId: string }
  | { type: "batch_updated"; senderId: string };

const CHANNEL_NAME = "fold_sync_v2";

export class SyncEngine {
  private channel: BroadcastChannel | null = null;
  private senderId: string = "";
  private listeners: Set<(msg: SyncMessage) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const randStr =
        window.crypto && typeof window.crypto.randomUUID === "function"
          ? window.crypto.randomUUID()
          : Math.random().toString(16).slice(2, 8);
      this.senderId = "tab-" + Date.now() + "-" + randStr;

      if ("BroadcastChannel" in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
            const msg = event.data;
            if (!msg || msg.senderId === this.senderId) return;
            this.listeners.forEach((listener) => listener(msg));
          };
        } catch (e) {
          console.warn("BroadcastChannel not supported or restricted", e);
        }
      }
    }
  }

  public subscribe(listener: (msg: SyncMessage) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcastSave(note: Note): void {
    if (!this.channel) return;
    try {
      this.channel.postMessage({
        type: "note_saved",
        note,
        senderId: this.senderId,
      });
    } catch {}
  }

  public broadcastDelete(id: string): void {
    if (!this.channel) return;
    try {
      this.channel.postMessage({
        type: "note_deleted",
        id,
        senderId: this.senderId,
      });
    } catch {}
  }

  public broadcastBatch(): void {
    if (!this.channel) return;
    try {
      this.channel.postMessage({
        type: "batch_updated",
        senderId: this.senderId,
      });
    } catch {}
  }

  public close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

let globalSyncEngine: SyncEngine | null = null;

export function getSyncEngine(): SyncEngine {
  if (typeof window === "undefined") {
    // Return lightweight safe instance during SSR
    return new SyncEngine();
  }
  if (!globalSyncEngine) {
    globalSyncEngine = new SyncEngine();
  }
  return globalSyncEngine;
}
