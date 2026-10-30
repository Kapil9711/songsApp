import { getGroupSocket } from "./socket.service";

export interface PlayerSyncPayload {
  songName: string;
  songId: string;
  songUrl: string;
  songImage: string;
  artist: string;
  seekPosition: number;
  isPlaying: boolean;
  userId: string;
  type: string;
}

type PlayerSyncHandler = (payload: PlayerSyncPayload) => void;

class PlayerSyncService {
  private listeners = new Set<PlayerSyncHandler>();
  initialize() {
    const socket = getGroupSocket();

    if (!socket) {
      console.warn("[PlayerSync] Socket not initialized");
      return;
    }

    // Avoid registering the same listener multiple times.
    socket.off("playerSync", this.handlePlayerSync);
    socket.on("playerSync", this.handlePlayerSync);
  }
  private handlePlayerSync = (payload: PlayerSyncPayload) => {
    console.log("[PlayerSync] Received payload:", payload);

    this.listeners.forEach((listener) => {
      listener(payload);
    });
  };
  subscribe(handler: PlayerSyncHandler) {
    this.listeners.add(handler);

    return () => {
      this.listeners.delete(handler);
    };
  }
  emit(payload: PlayerSyncPayload) {
    const socket = getGroupSocket();

    if (!socket?.connected) {
      console.warn("[PlayerSync] Socket is not connected");
      return;
    }

    socket.emit("playerSync", payload, (response: any) => {
      if (!response?.success) {
        console.error("[PlayerSync] Emit failed:", response);
      }
    });
  }
  cleanup() {
    getGroupSocket()?.off("playerSync", this.handlePlayerSync);
    this.listeners.clear();
  }
}

export const playerSyncService = new PlayerSyncService();
