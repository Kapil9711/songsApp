import { PlayerService } from "@/components/player/player.service";
import { convertSongListToPlayerList } from "./convertSongListToPlayerList";

export const handleSongPlay = async (
  index: number,
  songs: any[],
  needConvertion?: boolean,
) => {
  if (needConvertion) {
    songs = convertSongListToPlayerList(songs);
  }
  await PlayerService.playQueue(songs, index >= 0 ? index : 0);
};
