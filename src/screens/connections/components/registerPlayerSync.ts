import { PlayerService } from "@/components/player/player.service";
import { useAuthStore } from "@/store/auth.store";
import { usePlayerStore } from "@/store/player.store";
import { playerSyncService } from "../player-sync.service";

export function registerPlayerSyncListener() {
  playerSyncService.initialize();

  return playerSyncService.subscribe(async (payload) => {
    try {
      console.log("[PlayerSync] Applying remote playback:", payload);
      const activeTrack = usePlayerStore.getState().activeTrack;

      console.log(activeTrack?.mediaId, payload.songId);

      const songs: any = [
        {
          title: payload?.songName,
          mediaId: payload.songId,
          url: payload?.songUrl,
          artworkUrl: payload.songImage ?? "",
          artist: payload.artist ?? "",
        },
      ];

      if (activeTrack?.mediaId == payload.songId) {
        if (payload.type != "initial") {
          await PlayerService.seekTo(Math.max(0, payload.seekPosition));
          if (payload.isPlaying) {
            await PlayerService.play();
          } else {
            await PlayerService.pause();
          }
        }
      } else {
        await PlayerService.playQueue(songs, 0);
        useAuthStore.setState({
          lastSocketUser: payload.userId,
        });
      }
      console.log("[PlayerSync] Remote playback applied successfully");
    } catch (error) {
      console.error("[PlayerSync] Failed to apply remote playback:", error);
    }
  });
}
