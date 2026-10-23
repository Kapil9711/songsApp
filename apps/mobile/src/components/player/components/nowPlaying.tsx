import { usePlayerStore } from "@/store/player.store";
import { Text, View } from "react-native";

export function NowPlaying() {
  const track = usePlayerStore((state) => state.activeTrack);

  if (!track) return null;

  return (
    <View>
      <Text>{track.title}</Text>
      <Text>{track.artist ?? "Unknown artist"}</Text>
    </View>
  );
}
