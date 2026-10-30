import { useEffect } from "react";
import { AppState } from "react-native";

import { usePlayerStore } from "@/store/player.store";
import { PlayerService } from "./player.service";

export function PlayerForegroundSync() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        nextState === "active" &&
        usePlayerStore.getState().status === "ready"
      ) {
        try {
          PlayerService.syncFromNative();
        } catch (error) {
          usePlayerStore
            .getState()
            .setError(
              error instanceof Error
                ? error.message
                : "Failed to restore player state",
            );
        }
      }
    });

    return () => subscription.remove();
  }, []);

  return null;
}
