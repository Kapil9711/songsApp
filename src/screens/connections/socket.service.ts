import { io, type Socket } from "socket.io-client";

import { useAuthStore } from "@/store/auth.store";

let groupSocket: Socket | null = null;

export function getGroupSocket(): Socket | null {
  return groupSocket;
}

export function connectGroupSocket(): Socket | null {
  const { token, isAuthenticated } = useAuthStore.getState();

  if (!isAuthenticated || !token) {
    disconnectGroupSocket();
    return null;
  }

  // Reuse the existing connection instead of creating duplicates.
  if (groupSocket) {
    const currentToken = groupSocket.auth;

    if (
      typeof currentToken === "object" &&
      currentToken !== null &&
      "token" in currentToken &&
      currentToken.token === token
    ) {
      if (!groupSocket.connected) {
        groupSocket.connect();
      }

      return groupSocket;
    }

    // The user logged in again with a different token.
    groupSocket.disconnect();
    groupSocket = null;
  }

  const serverUrl = process.env.EXPO_PUBLIC_SOCKET_URL;

  if (!serverUrl) {
    throw new Error("EXPO_PUBLIC_SOCKET_URL is not configured");
  }

  groupSocket = io(serverUrl, {
    autoConnect: false,
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  groupSocket.on("connect_error", (error) => {
    console.error("[GroupSocket] Connection failed:", error.message);
  });

  groupSocket.on("disconnect", (reason) => {
    console.log("[GroupSocket] Disconnected:", reason);
  });

  groupSocket.connect();

  return groupSocket;
}

export function disconnectGroupSocket(): void {
  if (!groupSocket) return;

  groupSocket.disconnect();
  groupSocket.removeAllListeners();
  groupSocket = null;
}
