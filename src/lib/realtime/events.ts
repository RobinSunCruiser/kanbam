export interface BoardUpdateEvent {
  boardUid: string;
  actorId: string;
}

type Callback = (event: BoardUpdateEvent) => void;

class BoardEventEmitter {
  private subscribers = new Map<string, Set<Callback>>();

  subscribe(boardUid: string, callback: Callback): () => void {
    if (!this.subscribers.has(boardUid)) {
      this.subscribers.set(boardUid, new Set());
    }
    this.subscribers.get(boardUid)!.add(callback);

    return () => {
      this.subscribers.get(boardUid)?.delete(callback);
      if (this.subscribers.get(boardUid)?.size === 0) {
        this.subscribers.delete(boardUid);
      }
    };
  }

  emit(event: BoardUpdateEvent): void {
    this.subscribers.get(event.boardUid)?.forEach((cb) => cb(event));
  }
}

// Use globalThis to ensure singleton across all module instances in Next.js
const globalForEvents = globalThis as unknown as {
  boardEvents: BoardEventEmitter | undefined;
};

if (!globalForEvents.boardEvents) {
  globalForEvents.boardEvents = new BoardEventEmitter();
}

export const boardEvents = globalForEvents.boardEvents;
