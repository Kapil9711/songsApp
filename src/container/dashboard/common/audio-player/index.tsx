import React, { createContext, useContext, useEffect, useRef } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
} from "react-native";
import { Avatar } from "tamagui";
import { Icon, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { Text } from "@/src/providers/CustomText";
import { useAudioContext } from "@/src/providers/AudioProvider";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { getValueInAsync } from "@/src/utilities/helpers";
import { useSocket } from "@/src/providers/socketProvider";
import { colors } from "@/src/constants/theme";

import TrackPlayer from "react-native-track-player";
import { usePlayer } from "./usePlayer";

const { width } = Dimensions.get("window");

const PlayerContext = createContext(null as any);

const usePlayerConext = () => useContext(PlayerContext);

/* =========================================================
   PLAYER UI
========================================================= */

const PlayerUi = () => {
  const {
    imageUrl,
    sound,
    title,
    currentSong,
    position,
    setPosition,
    duration,
  } = usePlayerConext();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Reset playback position whenever a different song becomes active.
  useEffect(() => {
    if (!currentSong?.id) return;

    setPosition(0);
    TrackPlayer.seekTo(0).catch(() => {});
  }, [currentSong?.id, setPosition]);

  if (!currentSong) {
    return null;
  }

  return (
    <View
      style={[
        styles.player,
        {
          bottom: 68 + Math.max(insets.bottom, 8) + 8,
        },
      ]}
    >
      {/* Top purple indicator */}
      {/* <View style={styles.playerAccent} /> */}

      {/* Artwork */}
      <Pressable
        onPress={() => {
          router.push("/(dashboard)/home/songs-details");
        }}
        style={({ pressed }) => [
          styles.artworkButton,
          pressed && styles.pressed,
        ]}
      >
        <Avatar circular size="$4">
          <Avatar.Image src={imageUrl} />

          <Avatar.Fallback backgroundColor={colors.surfaceElevated}>
            <Ionicons name="musical-note" size={24} color={colors.textMuted} />
          </Avatar.Fallback>
        </Avatar>
      </Pressable>

      {/* Main */}
      <View style={styles.mainContent}>
        {/* Song information */}
        <Pressable
          onPress={() => {
            router.push("/(dashboard)/home/songs-details");
          }}
          style={styles.songHeader}
        >
          <View style={styles.songTextContainer}>
            <Text numberOfLines={1} style={styles.songTitle}>
              {title}
            </Text>

            <Text numberOfLines={1} style={styles.artist}>
              {currentSong?.artist || "Unknown Artist"}
            </Text>
          </View>

          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />

            <RNText style={styles.liveText}>PLAYING</RNText>
          </View>
        </Pressable>

        {/* Progress */}
        <ProgressBarComponent
          key={currentSong?.id}
          sound={sound}
          setPosition={setPosition}
          duration={duration}
          position={position}
          currentSongId={currentSong?.id}
        />

        {/* Controls */}
        <MediaControls />
      </View>

      {/* Time + download */}
      <ShowTime duration={duration} position={position} />
    </View>
  );
};

/* =========================================================
   TIME
========================================================= */

const ShowTime = ({ duration, position }: any) => {
  const { handleDownload } = useGlobalContext();

  const { currentSong } = usePlayerConext();

  const currentPath = usePathname();

  const remainingTime = Math.max(0, duration - position);

  return (
    <View style={styles.timeSection}>
      <RNText style={styles.timeText}>{formatTime(remainingTime)}</RNText>

      {currentPath.includes("home") && (
        <Pressable
          onPress={() => {
            handleDownload(
              currentSong?.downloadUrl?.[4]?.url,
              currentSong?.image?.[2]?.url,
              currentSong?.name,
            );
          }}
          style={({ pressed }) => [
            styles.downloadButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="download-outline"
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );
};

const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);

  const seconds = Math.floor((ms % 60000) / 1000);

  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

/* =========================================================
   DRAGGABLE PROGRESS BAR
========================================================= */

const ProgressBarComponent = ({
  sound,
  setPosition,
  duration,
  position,
  currentSongId,
}: any) => {
  const { socket } = useSocket();

  const progressWidth = width - 145;

  const progress =
    duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0;

  // Start every new song at zero. The key on ProgressBarComponent also
  // recreates the animated value when the song id changes.
  const progressValue = useSharedValue(0);

  const isDragging = useSharedValue(false);

  useEffect(() => {
    if (!currentSongId) return;

    progressValue.value = 0;
  }, [currentSongId]);

  useEffect(() => {
    if (!isDragging.value) {
      progressValue.value = progress;
    }
  }, [progress, currentSongId]);

  const seekToPosition = async (value: number) => {
    if (duration <= 1) {
      return;
    }

    const newPosition = Math.min(duration, Math.max(0, value * duration));

    setPosition(newPosition);

    await TrackPlayer.seekTo(newPosition / 1000);

    const user: any = await getValueInAsync("user");

    const userId = JSON.parse(user)?._id;

    socket?.emit("seekSong", {
      senderId: userId,
      newTime: newPosition,
    });
  };

  const gesture = Gesture.Pan()
    .onBegin((event) => {
      isDragging.value = true;

      const newProgress = Math.min(1, Math.max(0, event.x / progressWidth));

      progressValue.value = newProgress;
    })
    .onUpdate((event) => {
      const newProgress = Math.min(1, Math.max(0, event.x / progressWidth));

      progressValue.value = newProgress;
    })
    .onEnd(() => {
      isDragging.value = false;

      runOnJS(seekToPosition)(progressValue.value);
    });

  const tapGesture = Gesture.Tap().onEnd((event) => {
    const newProgress = Math.min(1, Math.max(0, event.x / progressWidth));

    progressValue.value = newProgress;

    runOnJS(seekToPosition)(newProgress);
  });

  const combinedGesture = Gesture.Simultaneous(gesture, tapGesture);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: progressValue.value * progressWidth,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      left: progressValue.value * progressWidth - 7,
    };
  });

  useEffect(() => {
    const syncSeek = async ({ newTime, receiverId }: any) => {
      try {
        const user: any = await getValueInAsync("user");

        const userId = JSON.parse(user)?._id;

        if (receiverId === userId) {
          await sound?.setPositionAsync(Number(newTime));

          setPosition(Number(newTime));
        }
      } catch (error) {
        console.error("Sync seek error:", error);
      }
    };

    socket?.on("syncSeek", syncSeek);

    return () => {
      socket?.off("syncSeek", syncSeek);
    };
  }, [sound]);

  return (
    <GestureDetector gesture={combinedGesture}>
      <View
        style={[
          styles.progressWrapper,
          {
            width: progressWidth,
          },
        ]}
      >
        {/* Background */}
        <View style={styles.progressTrack} />

        {/* Filled */}
        <Animated.View style={[styles.progressFill, progressStyle]} />

        {/* Thumb */}
        <Animated.View style={[styles.progressThumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
};

/* =========================================================
   MEDIA CONTROLS
========================================================= */

const MediaControls = () => {
  const {
    handlePause,
    handlePlay,
    isPlaying,
    handleNext,
    handlePrev,
    isLoop,
    setIsLoop,
    isShuffle,
    setIsShuffle,
  } = usePlayerConext();

  return (
    <View style={styles.controls}>
      {/* Repeat */}
      <Pressable
        onPress={() => setIsLoop((prev: boolean) => !prev)}
        style={({ pressed }) => [
          styles.controlButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="repeat"
          size={18}
          color={isLoop ? colors.primary : colors.textMuted}
        />
      </Pressable>

      {/* Previous */}
      <Pressable
        onPress={handlePrev}
        style={({ pressed }) => [
          styles.controlButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="play-skip-back" size={21} color={colors.text} />
      </Pressable>

      {/* Play / Pause */}
      <Pressable
        onPress={() => {
          if (isPlaying) {
            handlePause();
          } else {
            handlePlay();
          }
        }}
        style={({ pressed }) => [
          styles.playButton,
          pressed && styles.playButtonPressed,
        ]}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={20}
          color={colors.text}
        />
      </Pressable>

      {/* Next */}
      <Pressable
        onPress={handleNext}
        style={({ pressed }) => [
          styles.controlButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="play-skip-forward" size={21} color={colors.text} />
      </Pressable>

      {/* Shuffle */}
      <Pressable
        onPress={() => setIsShuffle((prev: boolean) => !prev)}
        style={({ pressed }) => [
          styles.controlButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="shuffle"
          size={18}
          color={isShuffle ? colors.primary : colors.textMuted}
        />
      </Pressable>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  player: {
    position: "absolute",

    left: 10,
    right: 10,

    width: width - 20,
    height: 96,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,

    borderRadius: 20,

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 14,

    elevation: 18,

    zIndex: 200,
    overflow: "hidden",
  },

  playerAccent: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,

    height: 2,

    backgroundColor: colors.primary,
  },

  artworkButton: {
    width: 62,
    height: 62,

    borderRadius: 15,

    overflow: "hidden",

    alignItems: "center",
    justifyContent: "center",
  },

  mainContent: {
    flex: 1,

    marginLeft: 10,

    justifyContent: "center",
  },

  songHeader: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 5,
  },

  songTextContainer: {
    flex: 1,

    marginRight: 6,
  },

  songTitle: {
    fontSize: 13,

    fontWeight: "700",

    color: colors.text,
  },

  artist: {
    marginTop: 1,

    fontSize: 10,

    color: colors.textMuted,
  },

  liveIndicator: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 8,

    backgroundColor: "rgba(168, 85, 247, 0.10)",
  },

  liveDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: colors.primary,

    marginRight: 4,
  },

  liveText: {
    fontSize: 7,

    fontWeight: "800",

    letterSpacing: 0.6,

    color: colors.primary,
  },

  progressWrapper: {
    height: 18,

    justifyContent: "center",

    position: "relative",
  },

  progressTrack: {
    position: "absolute",

    left: 0,
    right: 0,

    height: 4,

    borderRadius: 4,

    backgroundColor: colors.surfaceElevated,
  },

  progressFill: {
    position: "absolute",

    left: 0,

    height: 4,

    borderRadius: 4,

    backgroundColor: colors.primary,
  },

  progressThumb: {
    position: "absolute",

    width: 14,
    height: 14,

    borderRadius: 7,

    backgroundColor: colors.primary,

    borderWidth: 3,

    borderColor: colors.surface,

    shadowColor: colors.primary,

    shadowOpacity: 0.5,

    shadowRadius: 5,

    elevation: 5,
  },

  controls: {
    height: 28,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 9,
  },

  controlButton: {
    width: 26,
    height: 26,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",
  },

  playButton: {
    width: 30,
    height: 30,

    borderRadius: 15,

    backgroundColor: colors.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  playButtonPressed: {
    backgroundColor: colors.primaryPressed,

    transform: [
      {
        scale: 0.92,
      },
    ],
  },

  timeSection: {
    width: 48,

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 4,
  },

  timeText: {
    fontSize: 10,

    fontWeight: "600",

    color: colors.textSecondary,
  },

  downloadButton: {
    width: 34,
    height: 34,

    marginTop: 3,

    borderRadius: 11,

    backgroundColor: colors.surfaceElevated,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: colors.border,
  },

  pressed: {
    opacity: 0.6,

    transform: [
      {
        scale: 0.94,
      },
    ],
  },
});

const AudioPlayer = () => {
  const audioData = usePlayer();
  return (
    <PlayerContext.Provider value={audioData}>
      <PlayerUi />
    </PlayerContext.Provider>
  );
};

export default AudioPlayer;
