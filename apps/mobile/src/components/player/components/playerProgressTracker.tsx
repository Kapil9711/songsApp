import { useEffect } from "react";
import { useProgress } from "@rntp/player";

import { usePlayerProgressStore } from "@/store/player.progress.store";

export default function PlayerProgressTracker() {
  const progress = useProgress(1);
  const setProgress = usePlayerProgressStore((state) => state.setProgress);

  useEffect(() => {
    setProgress({
      position: progress.position,
      duration: progress.duration,
      buffered: progress.buffered,
      cached: progress.cached,
    });
  }, [
    progress.position,
    progress.duration,
    progress.buffered,
    progress.cached,
    setProgress,
  ]);

  return null;
}
