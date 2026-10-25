import { useEffect } from "react";
import { startPlaybackSync, stopPlaybackSync } from "./syncPlayback.service";

export function PlaybackSyncBootstrap() {
  useEffect(() => {
    startPlaybackSync();

    return () => {
      stopPlaybackSync();
    };
  }, []);

  return null;
}
