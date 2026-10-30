import { Pressable, Text } from "react-native";
import { usePlayerStore } from "@/store/player.store";
import { PlayerService } from "../player.service";

export function PlayPauseButton() {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const status = usePlayerStore((state) => state.status);

  return (
    <Pressable
      disabled={status !== "ready"}
      onPress={() => PlayerService.togglePlay()}
    >
      <Text>{isPlaying ? "Pause" : "Play"}</Text>
    </Pressable>
  );
}
