import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { moderateScale } from "react-native-size-matters";

import { usePlayerProgressStore } from "@/store/player.progress.store";
import { usePlayerStore } from "@/store/player.store";
import { PlayerService } from "../player.service";

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds || 0));

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function PlayerDock() {
  const [expanded, setExpanded] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const animation = useState(() => new Animated.Value(0))[0];

  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const position = usePlayerProgressStore((state) => state.position);
  const duration = usePlayerProgressStore((state) => state.duration);

  useEffect(() => {
    if (!seeking) setSeekValue(position);
  }, [position, seeking]);

  const toggleExpanded = useCallback(() => {
    const next = !expanded;
    setExpanded(next);

    Animated.spring(animation, {
      toValue: next ? 1 : 0,
      useNativeDriver: false,
      speed: 18,
      bounciness: 0,
    }).start();
  }, [expanded, animation]);

  const seek = useCallback(async (value: number) => {
    setSeeking(false);
    setSeekValue(value);
    await PlayerService.seekTo(value);
  }, []);

  if (!activeTrack) return null;

  const track = activeTrack as typeof activeTrack & {
    artworkUrl?: string;
  };

  const max = Math.max(duration, 1);
  const currentPosition = Math.min(seeking ? seekValue : position, max);

  const collapsedHeight = moderateScale(30);
  const expandedHeight = moderateScale(280);

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [collapsedHeight, expandedHeight],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height,
          borderTopLeftRadius: expanded ? 0 : moderateScale(18),
          borderTopRightRadius: expanded ? 0 : moderateScale(18),
        },
      ]}
    >
      {/* Always-visible compact progress strip */}
      {!expanded && (
        <Pressable
          style={styles.compactArea}
          onPress={toggleExpanded}
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Collapse player" : "Expand player"}
        >
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((currentPosition / max) * 100, 100)}%`,
                },
              ]}
            />
          </View>

          <View style={styles.compactTimes}>
            <Text style={styles.time}>{formatTime(currentPosition)}</Text>
            <Ionicons
              name={expanded ? "chevron-down" : "chevron-up"}
              size={moderateScale(15)}
              color="#A3A3A3"
            />
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>
        </Pressable>
      )}

      {/* Expanded player */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.header}>
            {track.artworkUrl ? (
              <Image
                source={{ uri: track.artworkUrl }}
                style={styles.artwork}
              />
            ) : (
              <View style={[styles.artwork, styles.placeholder]}>
                <Ionicons
                  name="musical-notes"
                  size={moderateScale(30)}
                  color="#999"
                />
              </View>
            )}

            <View style={styles.trackInfo}>
              <Text style={styles.title} numberOfLines={1}>
                {track.title}
              </Text>
              <Text style={styles.artist} numberOfLines={2}>
                {track.artist || "Unknown artist"}
              </Text>
            </View>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={max}
            value={currentPosition}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#454545"
            thumbTintColor="#FFFFFF"
            disabled={duration <= 0}
            onSlidingStart={(value) => {
              setSeeking(true);
              setSeekValue(value);
            }}
            onValueChange={setSeekValue}
            onSlidingComplete={seek}
          />

          <View style={styles.durationRow}>
            <Text style={styles.time}>{formatTime(currentPosition)}</Text>
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.controls}>
            <Pressable
              onPress={() => void PlayerService.previous()}
              hitSlop={12}
              accessibilityLabel="Previous track"
            >
              <Ionicons
                name="play-skip-back"
                size={moderateScale(32)}
                color="#FFFFFF"
              />
            </Pressable>

            <Pressable
              onPress={() => void PlayerService.togglePlay()}
              style={styles.playButton}
              accessibilityLabel={isPlaying ? "Pause" : "Play"}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={moderateScale(32)}
                color="#111111"
              />
            </Pressable>

            <Pressable
              onPress={() => void PlayerService.next()}
              hitSlop={12}
              accessibilityLabel="Next track"
            >
              <Ionicons
                name="play-skip-forward"
                size={moderateScale(32)}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <Pressable
            onPress={toggleExpanded}
            style={styles.collapseButton}
            accessibilityLabel="Collapse player"
          >
            <Ionicons
              name="chevron-down"
              size={moderateScale(20)}
              color="#A3A3A3"
            />
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#171717",

    overflow: "hidden",
    marginHorizontal: moderateScale(0),
  },
  compactArea: {
    height: moderateScale(34),
    justifyContent: "center",
    paddingHorizontal: moderateScale(14),
  },
  progressTrack: {
    height: moderateScale(3),
    backgroundColor: "#414141",
    borderRadius: moderateScale(3),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#B66BDD",
  },
  compactTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: moderateScale(3),
  },
  expandedContent: {
    flex: 1,
    paddingHorizontal: moderateScale(18),
    paddingTop: moderateScale(12),
    paddingBottom: moderateScale(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  artwork: {
    width: moderateScale(76),
    height: moderateScale(76),
    borderRadius: moderateScale(10),
  },
  placeholder: {
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfo: {
    flex: 1,
    gap: moderateScale(6),
  },
  title: {
    color: "#FFFFFF",
    fontSize: moderateScale(17),
    fontWeight: "700",
  },
  artist: {
    color: "#A3A3A3",
    fontSize: moderateScale(12),
  },
  slider: {
    width: "100%",
    height: moderateScale(34),
    marginTop: moderateScale(12),
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -moderateScale(6),
  },
  time: {
    color: "#A3A3A3",
    fontSize: moderateScale(10),
    fontVariant: ["tabular-nums"],
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: moderateScale(42),
    marginTop: moderateScale(18),
  },
  playButton: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  collapseButton: {
    alignSelf: "center",
    padding: moderateScale(5),
    marginTop: moderateScale(6),
  },
});
