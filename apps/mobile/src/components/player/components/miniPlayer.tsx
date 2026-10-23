import { useCallback, useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { moderateScale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";

import { PlayerService } from "../player.service";
import { usePlayerStore } from "@/store/player.store";
import { usePlayerProgressStore } from "@/store/player.progress.store";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function MiniPlayer() {
  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const position = usePlayerProgressStore((state) => state.position);
  const duration = usePlayerProgressStore((state) => state.duration);

  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  useEffect(() => {
    if (!seeking) {
      setSeekValue(position);
    }
  }, [position, seeking]);

  const handleSeek = useCallback(async (value: number) => {
    setSeeking(false);
    await PlayerService.seekTo(value);
  }, []);

  const handleTogglePlay = useCallback(async () => {
    await PlayerService.togglePlay();
  }, []);

  const handlePrevious = useCallback(async () => {
    await PlayerService.previous();
  }, []);

  const handleNext = useCallback(async () => {
    await PlayerService.next();
  }, []);

  if (!activeTrack) return null;

  const artworkUrl =
    "artworkUrl" in activeTrack ? activeTrack.artworkUrl : undefined;

  const progressMax = Math.max(duration, 1);
  const displayedPosition = seeking ? seekValue : position;

  return (
    <View style={styles.container}>
      <View style={styles.songRow}>
        {artworkUrl ? (
          <Image source={{ uri: artworkUrl } as any} style={styles.artwork} />
        ) : (
          <View style={[styles.artwork, styles.placeholder]}>
            <Ionicons
              name="musical-notes"
              size={moderateScale(22)}
              color="#999"
            />
          </View>
        )}

        <View style={styles.songInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {activeTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {activeTrack.artist || "Unknown artist"}
          </Text>
        </View>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={progressMax}
        value={Math.min(displayedPosition, progressMax)}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#414141"
        thumbTintColor="#FFFFFF"
        onSlidingStart={(value: any) => {
          setSeeking(true);
          setSeekValue(value);
        }}
        onValueChange={(value: any) => {
          setSeekValue(value);
        }}
        onSlidingComplete={handleSeek}
        disabled={duration <= 0}
      />

      <View style={styles.durationRow}>
        <Text style={styles.duration}>{formatTime(displayedPosition)}</Text>
        <Text style={styles.duration}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={handlePrevious}
          hitSlop={10}
          accessibilityLabel="Previous track"
        >
          <Ionicons
            name="play-skip-back"
            size={moderateScale(27)}
            color="#FFFFFF"
          />
        </Pressable>

        <Pressable
          onPress={handleTogglePlay}
          hitSlop={12}
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          style={styles.playButton}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={moderateScale(28)}
            color="#111111"
          />
        </Pressable>

        <Pressable
          onPress={handleNext}
          hitSlop={10}
          accessibilityLabel="Next track"
        >
          <Ionicons
            name="play-skip-forward"
            size={moderateScale(27)}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#171717",
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    gap: moderateScale(4),
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  artwork: {
    width: moderateScale(54),
    height: moderateScale(54),
    borderRadius: moderateScale(8),
  },
  placeholder: {
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },
  songInfo: {
    flex: 1,
    gap: moderateScale(4),
  },
  title: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  artist: {
    color: "#A3A3A3",
    fontSize: moderateScale(11),
  },
  slider: {
    width: "100%",
    height: moderateScale(28),
    marginTop: moderateScale(6),
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -moderateScale(5),
  },
  duration: {
    color: "#A3A3A3",
    fontSize: moderateScale(10),
    fontVariant: ["tabular-nums"],
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: moderateScale(38),
    marginTop: moderateScale(10),
  },
  playButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
