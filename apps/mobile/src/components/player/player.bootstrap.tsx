import { useEffect } from "react";

import { initializePlayer } from "./player.service";
import { usePlayerStore } from "@/store/player.store";
import PlayerProgressTracker from "./components/playerProgressTracker";

export default function PlayerBootstrap() {
  const status = usePlayerStore((state) => state.status);

  useEffect(() => {
    initializePlayer().catch((error) => {
      console.error("Player initialization failed:", error);
    });
  }, []);

  if (status !== "ready") return null;

  return <PlayerProgressTracker />;
}
