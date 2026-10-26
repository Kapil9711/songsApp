// src/config/socket/syncServer.ts

import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://10.95.249.59:5001";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type SyncSong = {
  id: string;
  title: string;
  artist?: string;
  artworkUrl?: string;
  url?: string;
};

export type PlayerCommand =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "SEEK"; position: number }
  | { type: "PLAY_SONG"; song: SyncSong };

export type GroupMembersPayload = {
  groupId: string | null;
  users: string[];
};

export type PlayerCommandPayload = {
  commandId: string;
  groupId: string;
  senderId: string;
  command: PlayerCommand;
  issuedAt: number;
};

export type PlaybackControllerPayload = {
  groupId: string;
  controllerId: string | null;
};

export type SyncRequestPayload = {
  senderId: string;
};

export type SyncRequestSentPayload = {
  receiverId: string;
};

export type SyncAcceptedPayload = {
  groupId: string;
  receiverId: string;
};

export type SyncRejectedPayload = {
  receiverId?: string;
  senderId?: string;
  reason?: string;
};

export type SyncErrorPayload = {
  message: string;
  [key: string]: unknown;
};

export type OnlineUsersPayload = {
  users: string[];
};

// --------------------------------------------------
// SOCKET EVENTS
// --------------------------------------------------

export type ServerToClientEvents = {
  joined: (payload?: { userId?: string }) => void;

  users: (payload: OnlineUsersPayload) => void;

  connectionsUpdated: (payload: GroupMembersPayload) => void;

  syncRequest: (payload: SyncRequestPayload) => void;

  syncRequestSent: (payload: SyncRequestSentPayload) => void;

  syncAccepted: (payload: SyncAcceptedPayload) => void;

  syncRejected: (payload: SyncRejectedPayload) => void;

  syncDisconnected: (payload?: { userId?: string; reason?: string }) => void;

  groupLeft: (payload?: { success?: boolean; groupId?: string | null }) => void;

  playerCommand: (payload: PlayerCommandPayload) => void;

  playbackControllerUpdated: (payload: PlaybackControllerPayload) => void;

  syncError: (payload: SyncErrorPayload) => void;
};

export type ClientToServerEvents = {
  join: (userId: string) => void;

  requestSync: (payload: { receiverId: string }) => void;

  acceptSync: (payload: { senderId: string }) => void;

  rejectSync: (payload: { senderId: string }) => void;

  leaveGroup: () => void;

  playerCommand: (payload: {
    command: PlayerCommand;
    commandId?: string;
  }) => void;
};

export type SyncSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// --------------------------------------------------
// SOCKET SERVICE
// --------------------------------------------------

class SyncSocketService {
  private socket: SyncSocket | null = null;
  private userId: string | null = null;

  /**
   * Connect the current user to the sync server.
   * Reuses the existing socket for the same user.
   */
  connect(userId: string): SyncSocket {
    const normalizedUserId = userId?.trim();

    if (!normalizedUserId) {
      throw new Error("A valid userId is required to connect to Riffly sync.");
    }

    // Reuse the socket for the same user.
    if (this.socket && this.userId === normalizedUserId) {
      if (!this.socket.connected) {
        this.socket.connect();
      }

      return this.socket;
    }

    // Clean up the previous user's socket.
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.userId = normalizedUserId;

    const socket: SyncSocket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket = socket;

    socket.on("connect", () => {
      console.log("[Riffly Sync] Connected:", socket.id);

      // Join after initial connection and every reconnection.
      if (this.socket === socket && this.userId === normalizedUserId) {
        socket.emit("join", normalizedUserId);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("[Riffly Sync] Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("[Riffly Sync] Connection error:", error.message);
    });

    socket.on("syncError", (payload) => {
      console.error("[Riffly Sync] Server error:", payload.message);
    });

    socket.on("playbackControllerUpdated", (payload) => {
      console.log("[Riffly Sync] Playback controller:", payload.controllerId);
    });

    socket.connect();

    return socket;
  }

  getSocket(): SyncSocket | null {
    return this.socket;
  }

  getUserId(): string | null {
    return this.userId;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  requestConnection(receiverId: string): void {
    if (!this.ensureConnected()) return;

    const normalizedReceiverId = receiverId?.trim();

    if (!normalizedReceiverId) {
      console.warn("[Riffly Sync] receiverId is required.");
      return;
    }

    if (normalizedReceiverId === this.userId) {
      console.warn("[Riffly Sync] Cannot connect to yourself.");
      return;
    }

    this.socket!.emit("requestSync", {
      receiverId: normalizedReceiverId,
    });
  }

  acceptConnection(senderId: string): void {
    if (!this.ensureConnected()) return;

    const normalizedSenderId = senderId?.trim();

    if (!normalizedSenderId) {
      console.warn("[Riffly Sync] senderId is required.");
      return;
    }

    this.socket!.emit("acceptSync", {
      senderId: normalizedSenderId,
    });
  }

  rejectConnection(senderId: string): void {
    if (!this.ensureConnected()) return;

    const normalizedSenderId = senderId?.trim();

    if (!normalizedSenderId) {
      console.warn("[Riffly Sync] senderId is required.");
      return;
    }

    this.socket!.emit("rejectSync", {
      senderId: normalizedSenderId,
    });
  }

  leaveGroup(): void {
    if (!this.ensureConnected()) return;

    this.socket!.emit("leaveGroup");
  }

  /**
   * Broadcast a player command.
   *
   * The server sends it to the other group members.
   * The current device must execute its own action locally.
   */
  sendCommand(command: PlayerCommand): boolean {
    if (!this.ensureConnected()) {
      console.warn("[Riffly Sync] Cannot send command: socket unavailable.");
      return false;
    }

    const commandId = [
      this.userId,
      Date.now(),
      Math.random().toString(36).slice(2, 8),
    ].join("-");

    this.socket!.emit("playerCommand", {
      command,
      commandId,
    });

    console.log("[Riffly Sync] Command sent:", {
      senderId: this.userId,
      commandId,
      type: command.type,
    });

    return true;
  }

  /**
   * Subscribe to a server event.
   * Returns an unsubscribe function.
   */
  on<K extends keyof ServerToClientEvents>(
    event: K,
    listener: ServerToClientEvents[K],
  ): () => void {
    const socket = this.socket;

    if (!socket) {
      console.warn(
        `[Riffly Sync] Cannot listen to "${String(event)}" before connecting.`,
      );

      return () => {};
    }

    socket.on(event, listener as never);

    return () => {
      // Remove the listener from the original socket.
      socket.off(event, listener as never);
    };
  }

  disconnect(): void {
    const socket = this.socket;

    if (!socket) {
      this.userId = null;
      return;
    }

    socket.removeAllListeners();
    socket.disconnect();

    this.socket = null;
    this.userId = null;
  }

  private ensureConnected(): boolean {
    if (!this.socket) {
      console.warn("[Riffly Sync] Connect the socket before sending events.");

      return false;
    }

    if (!this.socket.connected) {
      console.warn("[Riffly Sync] Socket is not connected.");

      return false;
    }

    return true;
  }
}

export const syncSocketService = new SyncSocketService();
