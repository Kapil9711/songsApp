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
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const total = Math.floor(seconds);

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function PlayerDock() {
  const [expanded, setExpanded] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const animation = useState(() => new Animated.Value(0))[0];

  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const repeatMode = usePlayerStore((state) => state.repeatMode);

  const position = usePlayerProgressStore((state) => state.position);
  const duration = usePlayerProgressStore((state) => state.duration);

  useEffect(() => {
    if (!seeking) {
      setSeekValue(position);
    }
  }, [position, seeking]);

  const setExpandedState = useCallback(
    (next: boolean) => {
      setExpanded(next);

      Animated.spring(animation, {
        toValue: next ? 1 : 0,
        useNativeDriver: false,
        speed: 18,
        bounciness: 0,
      }).start();
    },
    [animation],
  );

  const toggleExpanded = useCallback(() => {
    setExpandedState(!expanded);
  }, [expanded, setExpandedState]);

  const collapsePlayer = useCallback(() => {
    if (expanded) {
      setExpandedState(false);
    }
  }, [expanded, setExpandedState]);

  const seek = useCallback(async (value: number) => {
    setSeeking(false);
    setSeekValue(value);

    try {
      await PlayerService.seekTo(value);
    } catch (error) {
      console.error("Failed to seek:", error);
    }
  }, []);

  const handleTogglePlay = useCallback(async () => {
    try {
      await PlayerService.togglePlay();
    } catch (error) {
      console.error("Failed to toggle playback:", error);
    }
  }, []);

  const handlePrevious = useCallback(async () => {
    try {
      await PlayerService.previous();
    } catch (error) {
      console.error("Failed to play previous track:", error);
    }
  }, []);

  const handleNext = useCallback(async () => {
    try {
      await PlayerService.next();
    } catch (error) {
      console.error("Failed to play next track:", error);
    }
  }, []);

  const handleShuffle = useCallback(async () => {
    try {
      await PlayerService.toggleShuffle();
    } catch (error) {
      console.error("Failed to toggle shuffle:", error);
    }
  }, []);

  const handleRepeat = useCallback(async () => {
    try {
      await PlayerService.toggleRepeat();
    } catch (error) {
      console.error("Failed to toggle repeat:", error);
    }
  }, []);

  if (!activeTrack) return null;

  const track = activeTrack as typeof activeTrack & {
    artworkUrl?: string;
  };

  const max = Math.max(duration, 1);
  const currentPosition = Math.min(
    Math.max(0, seeking ? seekValue : position),
    max,
  );

  const collapsedHeight = moderateScale(36);
  const expandedHeight = moderateScale(280);

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [collapsedHeight, expandedHeight],
  });

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* Outside-tap backdrop. It exists only while expanded. */}
      {expanded && (
        <Pressable
          style={styles.backdrop}
          onPress={collapsePlayer}
          accessibilityRole="button"
          accessibilityLabel="Close expanded player"
        />
      )}

      <Animated.View
        style={[
          styles.container,
          {
            height,
            borderTopLeftRadius: expanded ? 0 : moderateScale(24),
            borderTopRightRadius: expanded ? 0 : moderateScale(24),
            zIndex: expanded ? 101 : 1,
            elevation: expanded ? 21 : 2,
          },
        ]}
      >
        {/* Compact player */}
        {!expanded && (
          <Pressable
            style={styles.compactArea}
            onPress={toggleExpanded}
            accessibilityRole="button"
            accessibilityLabel="Expand player"
          >
            <Slider
              style={styles.compactSlider}
              minimumValue={0}
              maximumValue={max}
              value={currentPosition}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#454545"
              thumbTintColor="#FFFFFF"
              disabled={duration <= 0}
              onSlidingStart={() => {
                setSeeking(true);
                setSeekValue(position);
              }}
              onValueChange={setSeekValue}
              onSlidingComplete={seek}
            />

            <View style={styles.compactTimes}>
              <Text style={styles.time}>{formatTime(currentPosition)}</Text>

              <Ionicons
                name="chevron-up"
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

            {/* Seek slider */}
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={max}
              value={currentPosition}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#454545"
              thumbTintColor="#FFFFFF"
              disabled={duration <= 0}
              onSlidingStart={() => {
                setSeeking(true);
                setSeekValue(position);
              }}
              onValueChange={setSeekValue}
              onSlidingComplete={seek}
            />

            <View style={styles.durationRow}>
              <Text style={styles.time}>{formatTime(currentPosition)}</Text>
              <Text style={styles.time}>{formatTime(duration)}</Text>
            </View>

            {/* Playback controls */}
            <View style={styles.controls}>
              <Pressable
                onPress={handleShuffle}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={
                  isShuffled ? "Disable shuffle" : "Enable shuffle"
                }
                accessibilityState={{ selected: isShuffled }}
              >
                <Ionicons
                  name="shuffle"
                  size={moderateScale(22)}
                  color={isShuffled ? "#B66BDD" : "#888888"}
                />
              </Pressable>

              <Pressable
                onPress={handlePrevious}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Previous track"
              >
                <Ionicons
                  name="play-skip-back"
                  size={moderateScale(28)}
                  color="#FFFFFF"
                />
              </Pressable>

              <Pressable
                onPress={handleTogglePlay}
                style={styles.playButton}
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? "Pause" : "Play"}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={moderateScale(32)}
                  color="#111111"
                />
              </Pressable>

              <Pressable
                onPress={handleNext}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Next track"
              >
                <Ionicons
                  name="play-skip-forward"
                  size={moderateScale(28)}
                  color="#FFFFFF"
                />
              </Pressable>

              <Pressable
                onPress={handleRepeat}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={
                  repeatMode === "track"
                    ? "Repeat track"
                    : repeatMode === "queue"
                      ? "Repeat queue"
                      : "Repeat off"
                }
                accessibilityState={{
                  selected: repeatMode !== "off",
                }}
              >
                <View style={styles.repeatIcon}>
                  <Ionicons
                    name="repeat"
                    size={moderateScale(22)}
                    color={repeatMode !== "off" ? "#B66BDD" : "#888888"}
                  />

                  {repeatMode === "track" && (
                    <Text style={styles.repeatOne}>1</Text>
                  )}
                </View>
              </Pressable>
            </View>

            {/* Collapse button */}
            <Pressable
              onPress={collapsePlayer}
              style={styles.collapseButton}
              accessibilityRole="button"
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    // position: "absolute",
    // left: 0,
    // right: 0,
    // bottom: 0,
    // overflow: "visible",
    // zIndex: 100,
    // elevation: 20,
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    // Extend the backdrop over the entire screen, not just the dock.
    position: "absolute",
    top: -1000,
    left: 0,
    right: 0,
    bottom: 0,
    height: 2000,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 100,
    // elevation: 19,
  },

  container: {
    backgroundColor: "#171717",
    overflow: "hidden",
    marginHorizontal: moderateScale(0),
  },

  compactArea: {
    height: moderateScale(40),
    justifyContent: "center",
    paddingHorizontal: moderateScale(14),
  },

  compactSlider: {
    width: "100%",
    height: moderateScale(8),
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
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: moderateScale(18),
    paddingHorizontal: moderateScale(2),
  },

  playButton: {
    width: moderateScale(54),
    height: moderateScale(54),
    borderRadius: moderateScale(27),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  repeatIcon: {
    alignItems: "center",
    justifyContent: "center",
  },

  repeatOne: {
    position: "absolute",
    color: "#B66BDD",
    fontSize: moderateScale(9),
    fontWeight: "700",
  },

  collapseButton: {
    alignSelf: "center",
    padding: moderateScale(5),
    marginTop: moderateScale(4),
  },
});
