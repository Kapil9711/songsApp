import { usePlayerStore } from "@/store/player.store";
import { useEffect, useRef } from "react";
import {
  isApplyingRemoteCommand,
  startPlaybackSync,
  stopPlaybackSync,
  syncedPlayback,
} from "./syncPlayback.service";

export function PlaybackSyncBootstrap() {
  const activeTrack = usePlayerStore((state) => state.activeTrack);

  // Track the last active song to avoid broadcasting the initial state.
  const previousTrackId = useRef<string | null>(null);

  useEffect(() => {
    startPlaybackSync();

    return () => {
      stopPlaybackSync();
    };
  }, []);

  useEffect(() => {
    if (!activeTrack?.mediaId) {
      return;
    }

    const trackId = String(activeTrack.mediaId);

    // Ignore duplicate track updates.
    if (previousTrackId.current === trackId) {
      return;
    }

    previousTrackId.current = trackId;

    // Do not rebroadcast a song received from another device.
    if (isApplyingRemoteCommand()) {
      return;
    }

    syncedPlayback.broadcastSong({
      id: trackId,
      title: activeTrack.title as any,
      artist: activeTrack.artist,
      artworkUrl: activeTrack.artworkUrl as any,
      url: activeTrack.url as any,
    });
  }, [activeTrack]);

  return null;
}
