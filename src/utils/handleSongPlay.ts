import { PlayerService } from "@/components/player/player.service";
import { convertSongListToPlayerList } from "./convertSongListToPlayerList";
import { playerSyncService } from "@/screens/connections/player-sync.service";
import { useAuthStore } from "@/store/auth.store";

export const handleSongPlay = async (
  index: number,
  songs: any[],
  needConvertion?: boolean,
) => {
  try {
    const playerSongs = needConvertion
      ? convertSongListToPlayerList(songs)
      : songs;

    const selectedIndex = index >= 0 ? index : 0;
    await PlayerService.playQueue(playerSongs, selectedIndex);
    // const selectedSong = playerSongs?.[selectedIndex];
    // playerSyncService.emit(convertPlayerSongToSocket(selectedSong, true, 0));
  } catch (error) {
    console.error("[handleSongPlay] Failed to play song:", error);
  }
};

export const convertPlayerSongToSocket = (
  song: any,
  isPlaying: boolean,
  seekPosition: number,
  type: string,
) => {
  const userId = useAuthStore.getState()?.user?.id;
  return {
    songName: song?.title,
    songId: song.mediaId,
    songUrl: song?.url,
    songImage: song.artworkUrl ?? "",
    artist: song.artist ?? "",
    seekPosition: seekPosition,
    isPlaying: isPlaying,
    userId: userId as string,
    type,
  };
};
