import { PlayerService } from "@/components/player/player.service";
import { convertSongListToPlayerList } from "./convertSongListToPlayerList";

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
  } catch (error) {
    console.error("[handleSongPlay] Failed to play song:", error);
  }
};
