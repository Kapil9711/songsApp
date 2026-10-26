// store/syncSocketStore.ts

import { create } from "zustand";

import {
  syncSocketService,
  type GroupMembersPayload,
  type OnlineUsersPayload,
  type PlayerCommand,
  type PlayerCommandPayload,
  type SyncAcceptedPayload,
  type SyncErrorPayload,
  type SyncRejectedPayload,
  type SyncRequestPayload,
  type SyncRequestSentPayload,
} from "../config/socket/syncServer";

type SyncSocketState = {
  userId: string | null;
  isConnected: boolean;

  // Current synchronized listening group
  groupId: string | null;
  groupMembers: string[];

  // Connection requests
  pendingRequestFrom: string[];
  sentRequestTo: string[];

  // Online users
  onlineUsers: string[];

  // Last server error
  lastError: string | null;

  connect: (userId: string) => void;
  disconnect: () => void;

  requestConnection: (receiverId: string) => void;
  acceptConnection: (senderId: string) => void;
  rejectConnection: (senderId: string) => void;

  leaveGroup: () => void;
  sendCommand: (command: PlayerCommand) => void;

  clearError: () => void;
};

let cleanupListeners: Array<() => void> = [];
let activeUserId: string | null = null;

export const useSyncSocketStore = create<SyncSocketState>((set, get) => ({
  userId: null,
  isConnected: false,

  groupId: null,
  groupMembers: [],

  pendingRequestFrom: [],
  sentRequestTo: [],

  onlineUsers: [],

  lastError: null,

  // --------------------------------------------------
  // CONNECT
  // --------------------------------------------------

  connect: (userId) => {
    const normalizedUserId = userId?.trim();

    if (!normalizedUserId) return;

    // Do not register duplicate listeners for the same user.
    if (activeUserId === normalizedUserId) {
      set({
        isConnected: syncSocketService.isConnected(),
      });

      return;
    }

    // Remove listeners belonging to the previous session.
    cleanupListeners.forEach((cleanup) => cleanup());
    cleanupListeners = [];

    // Replace the connection if the authenticated user changed.
    if (activeUserId !== null) {
      syncSocketService.disconnect();
    }

    activeUserId = normalizedUserId;

    set({
      userId: normalizedUserId,
      isConnected: false,

      groupId: null,
      groupMembers: [],

      pendingRequestFrom: [],
      sentRequestTo: [],

      onlineUsers: [],

      lastError: null,
    });

    const socket = syncSocketService.connect(normalizedUserId);

    // --------------------------------------------------
    // SOCKET CONNECTION EVENTS
    // --------------------------------------------------

    const handleConnect = () => {
      set({ isConnected: true });

      console.log("[Riffly Sync] Socket connected.");
    };

    const handleDisconnect = () => {
      set({
        isConnected: false,
        onlineUsers: [],
      });

      console.log("[Riffly Sync] Socket disconnected.");
    };

    // --------------------------------------------------
    // ONLINE USERS
    // --------------------------------------------------

    const handleOnlineUsers = (payload: OnlineUsersPayload) => {
      const currentUserId = get().userId;

      set({
        onlineUsers: payload.users.filter((id) => id !== currentUserId),
      });
    };

    // --------------------------------------------------
    // GROUP MEMBERS
    // --------------------------------------------------

    const handleConnectionsUpdated = (payload: GroupMembersPayload) => {
      set({
        groupId: payload.groupId,
        groupMembers: payload.users,
      });
    };

    // --------------------------------------------------
    // INCOMING CONNECTION REQUEST
    // --------------------------------------------------

    const handleSyncRequest = (payload: SyncRequestPayload) => {
      if (!payload.senderId) return;

      set((state) => ({
        pendingRequestFrom: state.pendingRequestFrom.includes(payload.senderId)
          ? state.pendingRequestFrom
          : [...state.pendingRequestFrom, payload.senderId],
      }));

      console.log("[Riffly Sync] Incoming request from:", payload.senderId);
    };

    // --------------------------------------------------
    // OUTGOING REQUEST CONFIRMATION
    // --------------------------------------------------

    const handleSyncRequestSent = (payload: SyncRequestSentPayload) => {
      set((state) => ({
        sentRequestTo: state.sentRequestTo.includes(payload.receiverId)
          ? state.sentRequestTo
          : [...state.sentRequestTo, payload.receiverId],
      }));

      console.log("[Riffly Sync] Request sent to:", payload.receiverId);
    };

    // --------------------------------------------------
    // CONNECTION ACCEPTED
    // --------------------------------------------------

    const handleSyncAccepted = (payload: SyncAcceptedPayload) => {
      set({
        groupId: payload.groupId,
        sentRequestTo: [],
        lastError: null,
      });

      console.log("[Riffly Sync] Connection accepted:", payload.groupId);
    };

    // --------------------------------------------------
    // CONNECTION REJECTED
    // --------------------------------------------------

    const handleSyncRejected = (payload: SyncRejectedPayload) => {
      // This assumes senderId identifies the original requester
      // in the rejection event delivered to that requester.
      set((state) => ({
        sentRequestTo: state.sentRequestTo.filter(
          (id) => id !== payload.senderId,
        ),
      }));

      console.log(
        "[Riffly Sync] Connection request rejected:",
        payload.senderId,
      );
    };

    // --------------------------------------------------
    // GROUP LEFT
    // --------------------------------------------------

    const handleGroupLeft = () => {
      set({
        groupId: null,
        groupMembers: [],
      });

      console.log("[Riffly Sync] Group left.");
    };

    // --------------------------------------------------
    // OTHER USER DISCONNECTED
    // --------------------------------------------------

    const handleSyncDisconnected = () => {
      set({
        groupId: null,
        groupMembers: [],
      });

      console.log("[Riffly Sync] Group disconnected.");
    };

    // --------------------------------------------------
    // PLAYER COMMAND
    // --------------------------------------------------

    const handlePlayerCommand = (payload: PlayerCommandPayload) => {
      // TODO:
      // Forward this command to your PlayerService.
      //
      // Do not broadcast the received command again,
      // otherwise clients may create a command loop.

      console.log("[Riffly Sync] Received player command:", payload);
    };

    // --------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------

    const handleSyncError = (payload: SyncErrorPayload) => {
      set((state) => {
        // If the server identifies the receiver of a failed
        // request, remove that request from the pending list.
        const receiverId =
          typeof payload.receiverId === "string" ? payload.receiverId : null;

        return {
          lastError: payload.message,

          sentRequestTo: receiverId
            ? state.sentRequestTo.filter((id) => id !== receiverId)
            : state.sentRequestTo,
        };
      });

      console.error("[Riffly Sync] Server error:", payload.message);
    };

    // --------------------------------------------------
    // REGISTER LISTENERS
    // --------------------------------------------------

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    const unsubscribeOnlineUsers = syncSocketService.on(
      "users",
      handleOnlineUsers,
    );

    const unsubscribeConnections = syncSocketService.on(
      "connectionsUpdated",
      handleConnectionsUpdated,
    );

    const unsubscribeRequest = syncSocketService.on(
      "syncRequest",
      handleSyncRequest,
    );

    const unsubscribeRequestSent = syncSocketService.on(
      "syncRequestSent",
      handleSyncRequestSent,
    );

    const unsubscribeAccepted = syncSocketService.on(
      "syncAccepted",
      handleSyncAccepted,
    );

    const unsubscribeRejected = syncSocketService.on(
      "syncRejected",
      handleSyncRejected,
    );

    const unsubscribeGroupLeft = syncSocketService.on(
      "groupLeft",
      handleGroupLeft,
    );

    const unsubscribeDisconnected = syncSocketService.on(
      "syncDisconnected",
      handleSyncDisconnected,
    );

    const unsubscribePlayerCommand = syncSocketService.on(
      "playerCommand",
      handlePlayerCommand,
    );

    const unsubscribeSyncError = syncSocketService.on(
      "syncError",
      handleSyncError,
    );

    // Keep all cleanup functions so listeners are removed
    // when the user logs out or the authenticated user changes.
    cleanupListeners = [
      () => socket.off("connect", handleConnect),
      () => socket.off("disconnect", handleDisconnect),

      unsubscribeOnlineUsers,
      unsubscribeConnections,
      unsubscribeRequest,
      unsubscribeRequestSent,
      unsubscribeAccepted,
      unsubscribeRejected,
      unsubscribeGroupLeft,
      unsubscribeDisconnected,
      unsubscribePlayerCommand,
      unsubscribeSyncError,
    ];

    set({
      isConnected: socket.connected,
    });
  },

  // --------------------------------------------------
  // DISCONNECT
  // --------------------------------------------------

  disconnect: () => {
    cleanupListeners.forEach((cleanup) => cleanup());
    cleanupListeners = [];

    syncSocketService.disconnect();

    activeUserId = null;

    set({
      userId: null,
      isConnected: false,

      groupId: null,
      groupMembers: [],

      pendingRequestFrom: [],
      sentRequestTo: [],

      onlineUsers: [],

      lastError: null,
    });
  },

  // --------------------------------------------------
  // REQUEST CONNECTION
  // --------------------------------------------------

  requestConnection: (receiverId) => {
    const { userId, isConnected, groupId, sentRequestTo } = get();

    const normalizedReceiverId = receiverId?.trim();

    if (!isConnected) {
      set({
        lastError: "You are not connected to the sync server.",
      });

      return;
    }

    if (!normalizedReceiverId) return;

    if (normalizedReceiverId === userId) return;

    if (groupId) {
      set({
        lastError:
          "Leave your current group before connecting to another user.",
      });

      return;
    }

    if (sentRequestTo.includes(normalizedReceiverId)) {
      return;
    }

    if (get().pendingRequestFrom.includes(normalizedReceiverId)) {
      set({
        lastError: "This user has already sent you a connection request.",
      });

      return;
    }

    // Optimistically update the UI.
    set((state) => ({
      sentRequestTo: [...state.sentRequestTo, normalizedReceiverId],
      lastError: null,
    }));

    syncSocketService.requestConnection(normalizedReceiverId);
  },

  // --------------------------------------------------
  // ACCEPT CONNECTION
  // --------------------------------------------------

  acceptConnection: (senderId) => {
    const { isConnected, groupId, pendingRequestFrom } = get();

    if (!isConnected) {
      set({
        lastError: "You are not connected to the sync server.",
      });

      return;
    }

    if (groupId) {
      set({
        lastError: "You are already in a listening group.",
      });

      return;
    }

    if (!pendingRequestFrom.includes(senderId)) {
      return;
    }

    syncSocketService.acceptConnection(senderId);

    // Remove the request from the UI.
    // The server should emit syncAccepted after successful acceptance.
    set((state) => ({
      pendingRequestFrom: state.pendingRequestFrom.filter(
        (id) => id !== senderId,
      ),
      lastError: null,
    }));
  },

  // --------------------------------------------------
  // REJECT CONNECTION
  // --------------------------------------------------

  rejectConnection: (senderId) => {
    if (!get().isConnected) {
      set({
        lastError: "You are not connected to the sync server.",
      });

      return;
    }

    syncSocketService.rejectConnection(senderId);

    set((state) => ({
      pendingRequestFrom: state.pendingRequestFrom.filter(
        (id) => id !== senderId,
      ),
      lastError: null,
    }));
  },

  // --------------------------------------------------
  // LEAVE GROUP
  // --------------------------------------------------

  leaveGroup: () => {
    if (!get().isConnected) return;

    syncSocketService.leaveGroup();

    set({
      groupId: null,
      groupMembers: [],
    });
  },

  // --------------------------------------------------
  // PLAYER COMMAND
  // --------------------------------------------------

  sendCommand: (command) => {
    const { isConnected, groupId } = get();

    if (!isConnected) {
      set({
        lastError: "You are not connected to the sync server.",
      });

      return;
    }

    if (!groupId) {
      set({
        lastError: "Join a listening group before sending player commands.",
      });

      return;
    }

    syncSocketService.sendCommand(command);
  },

  // --------------------------------------------------
  // CLEAR ERROR
  // --------------------------------------------------

  clearError: () => {
    set({ lastError: null });
  },
}));
