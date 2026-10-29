import { useEffect } from "react";

import { useAuthStore } from "@/store/auth.store";
import { connectGroupSocket, disconnectGroupSocket } from "../socket.service";
import { useGroupStore } from "../group.store";
import { registerGroupSocketListeners } from "../group-socket.listner";
import { playerSyncService } from "../player-sync.service";
import { registerPlayerSyncListener } from "./registerPlayerSync";

export function GroupSocketInitializer() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isInitializing = useAuthStore((state) => state.isInitializing);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated || !token) {
      playerSyncService.cleanup();
      disconnectGroupSocket();
      useGroupStore.getState().reset();
      return;
    }

    // Create or reuse the authenticated socket.
    connectGroupSocket();

    // Register group event listeners.
    const unregister = registerGroupSocketListeners();
    const unregisterPlayerSync = registerPlayerSyncListener();

    // Register player synchronization on the same socket.
    // playerSyncService.initialize();

    return () => {
      unregister();
      unregisterPlayerSync();
    };
  }, [isAuthenticated, isInitializing, token]);

  return null;
}
