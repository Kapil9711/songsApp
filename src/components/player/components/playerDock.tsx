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
import { useTheme } from "@/themes/theme.context";
import { PlayerService } from "../player.service";
import NowPlayingBackground from "@/components/nowPlayingBackground";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const total = Math.floor(seconds);

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function PlayerDock() {
  const { Theme } = useTheme();

  const [expanded, setExpanded] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const [animation] = useState(() => new Animated.Value(0));

  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const repeatMode = usePlayerStore((state) => state.repeatMode);

  const position = usePlayerProgressStore((state) => state.position);
  const duration = usePlayerProgressStore((state) => state.duration);

  const styles = StyleSheet.create({
    root: {
      position: "relative",
    },

    backdrop: {
      ...StyleSheet.absoluteFill,
      position: "absolute",
      top: -1000,
      left: 0,
      right: 0,
      height: 2000,
      // backgroundColor: "rgba(0, 0, 0, 0.35)",
      zIndex: 100,
    },

    container: {
      backgroundColor: Theme.colors.background + "5",
      overflow: "hidden",
      marginHorizontal: moderateScale(0),
      borderColor: Theme.colors.background + "10",
      borderWidth: StyleSheet.hairlineWidth,
    },

    compactArea: {
      height: moderateScale(40),
      justifyContent: "center",
      paddingHorizontal: moderateScale(14),
      // backgroundColor: Theme.colors.background + "6",
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
      backgroundColor: Theme.colors.neutral100,
      alignItems: "center",
      justifyContent: "center",
    },

    trackInfo: {
      flex: 1,
      gap: moderateScale(6),
    },

    title: {
      color: Theme.colors.text,
      fontSize: moderateScale(17),
      fontWeight: "700",
    },

    artist: {
      color: Theme.colors.neutral400,
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
      color: Theme.colors.neutral400,
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
      backgroundColor: Theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },

    repeatIcon: {
      alignItems: "center",
      justifyContent: "center",
    },

    repeatOne: {
      position: "absolute",
      color: Theme.colors.primary,
      fontSize: moderateScale(9),
      fontWeight: "700",
    },

    collapseButton: {
      alignSelf: "center",
      padding: moderateScale(5),
      marginTop: moderateScale(4),
    },
  });

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

  if (!activeTrack) {
    return null;
  }

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
      {expanded && (
        <Pressable
          style={styles.backdrop}
          onPress={collapsePlayer}
          accessibilityRole="button"
          accessibilityLabel="Close expanded player"
        />
      )}
      {/* <NowPlayingBackground /> */}

      <Animated.View
        style={[
          styles.container,
          {
            height,
            borderTopLeftRadius: moderateScale(24),
            borderTopRightRadius: moderateScale(24),
            zIndex: expanded ? 101 : 1,
            // elevation: expanded ? 21 : 2,
          },
        ]}
      >
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
              minimumTrackTintColor={Theme.colors.primary}
              maximumTrackTintColor={Theme.colors.neutral200}
              thumbTintColor={Theme.colors.primary}
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
                color={Theme.colors.neutral400}
              />

              <Text style={styles.time}>{formatTime(duration)}</Text>
            </View>
          </Pressable>
        )}

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.header}>
              {track.artworkUrl ? (
                <Image
                  source={{ uri: track.artworkUrl }}
                  style={styles.artwork}
                  resizeMode="cover"
                  accessibilityLabel={`${track.title} artwork`}
                />
              ) : (
                <View style={[styles.artwork, styles.placeholder]}>
                  <Ionicons
                    name="musical-notes"
                    size={moderateScale(30)}
                    color={Theme.colors.neutral400}
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
              minimumTrackTintColor={Theme.colors.primary}
              maximumTrackTintColor={Theme.colors.neutral200}
              thumbTintColor={Theme.colors.primary}
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
                  color={
                    isShuffled ? Theme.colors.primary : Theme.colors.neutral400
                  }
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
                  color={Theme.colors.text}
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
                  color={Theme.colors.background}
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
                  color={Theme.colors.text}
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
                    color={
                      repeatMode !== "off"
                        ? Theme.colors.primary
                        : Theme.colors.neutral400
                    }
                  />

                  {repeatMode === "track" && (
                    <Text style={styles.repeatOne}>1</Text>
                  )}
                </View>
              </Pressable>
            </View>

            <Pressable
              onPress={collapsePlayer}
              style={styles.collapseButton}
              accessibilityRole="button"
              accessibilityLabel="Collapse player"
            >
              <Ionicons
                name="chevron-down"
                size={moderateScale(20)}
                color={Theme.colors.neutral400}
              />
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
