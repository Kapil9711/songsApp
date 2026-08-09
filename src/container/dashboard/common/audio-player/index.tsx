import React, { createContext, useContext, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";

import { Text } from "@/src/providers/CustomText";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { getValueInAsync } from "@/src/utilities/helpers";
import { useSocket } from "@/src/providers/socketProvider";
import { colors } from "@/src/constants/theme";

import TrackPlayer from "react-native-track-player";
import { usePlayer } from "./usePlayer";

/* ================================================================== */
/* CONTEXT                                                            */
/* ================================================================== */

const PlayerContext = createContext(null as any);

export const usePlayerConext = () => useContext(PlayerContext);

/* ================================================================== */
/* PLAYER CONSTANTS                                                   */
/* ================================================================== */

const PLAYER_HEIGHT = moderateScale(92);

const PLAYER_GAP = moderateScale(10);

/**
 * Matches the compact BottomHeader.
 *
 * BottomHeader:
 *   height: 62
 *   safe area handled separately
 */
const BOTTOM_NAV_HEIGHT = moderateScale(55);
const PROGRESS_THUMB_OFFSET = moderateScale(4);

/* ================================================================== */
/* PLAYER UI                                                          */
/* ================================================================== */

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
  const currentPath = usePathname();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!currentSong?.id) return;

    setPosition(0);

    TrackPlayer.seekTo(0).catch(() => {});
  }, [currentSong?.id, setPosition]);

  if (!currentSong) {
    return null;
  }

  /**
   * Keep player clearly above the compact bottom nav.
   *
   * Player
   *   ↓
   * 10px gap
   *   ↓
   * Bottom nav
   *   ↓
   * Safe area
   */
  const bottomOffset =
    BOTTOM_NAV_HEIGHT + Math.max(insets.bottom, moderateScale(6)) + PLAYER_GAP;

  return (
    <View
      style={[
        styles.playerPosition,
        {
          bottom: bottomOffset,
        },
      ]}
    >
      {/* ============================================================ */}
      {/* GRADIENT BORDER                                               */}
      {/* ============================================================ */}

      <LinearGradient
        colors={[
          "rgba(168,85,247,0.62)",
          "rgba(106,66,150,0.22)",
          "rgba(168,85,247,0.48)",
        ]}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={styles.playerBorder}
      >
        {/* ======================================================== */}
        {/* PLAYER BODY                                               */}
        {/* ======================================================== */}

        <LinearGradient
          colors={[
            "rgba(28,20,38,0.99)",
            "rgba(16,14,22,0.99)",
            "rgba(24,17,34,0.99)",
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={styles.player}
        >
          {/* ====================================================== */}
          {/* TOP PURPLE ACCENT                                       */}
          {/* ====================================================== */}

          <LinearGradient
            colors={[
              "rgba(168,85,247,0.80)",
              "rgba(168,85,247,0.30)",
              "rgba(168,85,247,0)",
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={styles.playerAccent}
          />

          {/* ====================================================== */}
          {/* ARTWORK                                                 */}
          {/* ====================================================== */}

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
                <Ionicons
                  name="musical-note"
                  size={moderateScale(21)}
                  color={colors.textMuted}
                />
              </Avatar.Fallback>
            </Avatar>

            {/* Tiny playing indicator */}

            <View style={styles.artworkIndicator}>
              <View style={styles.artworkIndicatorDot} />
            </View>
          </Pressable>

          {/* ====================================================== */}
          {/* CENTER                                                  */}
          {/* ====================================================== */}

          <View style={styles.mainContent}>
            {/* ---------------------------------------------------- */}
            {/* Song info                                             */}
            {/* ---------------------------------------------------- */}

            <Pressable
              onPress={() => {
                router.push("/(dashboard)/home/songs-details");
              }}
              style={styles.songInfo}
            >
              <Text numberOfLines={1} style={styles.songTitle}>
                {title}
              </Text>

              <Text numberOfLines={1} style={styles.artist}>
                {currentSong?.artist ||
                  currentSong?.artists?.[0]?.name ||
                  "Unknown Artist"}
              </Text>
            </Pressable>

            {/* ---------------------------------------------------- */}
            {/* Progress                                              */}
            {/* ---------------------------------------------------- */}

            <ProgressBarComponent
              key={currentSong?.id}
              sound={sound}
              setPosition={setPosition}
              duration={duration}
              position={position}
              currentSongId={currentSong?.id}
            />

            {/* ---------------------------------------------------- */}
            {/* Controls                                              */}
            {/* ---------------------------------------------------- */}

            <MediaControls />
          </View>

          {/* ====================================================== */}
          {/* RIGHT SIDE                                              */}
          {/* ====================================================== */}

          <View style={styles.rightSection}>
            <Text style={styles.timeText}>
              {formatTime(Math.max(0, duration - position))}
            </Text>

            {currentPath.includes("home") && <DownloadButton />}
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

/* ================================================================== */
/* DOWNLOAD BUTTON                                                    */
/* ================================================================== */

const DownloadButton = () => {
  const { handleDownload } = useGlobalContext();

  const { currentSong } = usePlayerConext();

  return (
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
        size={moderateScale(17)}
        color={colors.textSecondary}
      />
    </Pressable>
  );
};

/* ================================================================== */
/* TIME FORMAT                                                        */
/* ================================================================== */

const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);

  const seconds = Math.floor((ms % 60000) / 1000);

  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

/* ================================================================== */
/* PROGRESS BAR                                                       */
/* ================================================================== */

const ProgressBarComponent = ({
  sound,
  setPosition,
  duration,
  position,
  currentSongId,
}: any) => {
  const { socket } = useSocket();

  /**
   * Instead of:
   *
   * width - 145
   *
   * we measure the actual available
   * width of the progress bar.
   */
  const [progressWidth, setProgressWidth] = useState(0);

  const progress =
    duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0;

  const progressValue = useSharedValue(0);

  const isDragging = useSharedValue(false);

  /* -------------------------------------------------------------- */
  /* Reset on song change                                           */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    if (!currentSongId) {
      return;
    }

    progressValue.value = 0;
  }, [currentSongId]);

  /* -------------------------------------------------------------- */
  /* Sync playback position                                         */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    if (!isDragging.value && progressWidth > 0) {
      progressValue.value = progress;
    }
  }, [progress, currentSongId, progressWidth]);

  /* -------------------------------------------------------------- */
  /* Seek                                                            */
  /* -------------------------------------------------------------- */

  const seekToPosition = async (value: number) => {
    if (duration <= 1 || progressWidth <= 0) {
      return;
    }

    const newPosition = Math.min(duration, Math.max(0, value * duration));

    setPosition(newPosition);

    await TrackPlayer.seekTo(newPosition / 1000);

    try {
      const user: any = await getValueInAsync("user");

      const userId = JSON.parse(user)?._id;

      socket?.emit("seekSong", {
        senderId: userId,
        newTime: newPosition,
      });
    } catch (error) {
      console.error("Seek user error:", error);
    }
  };

  /* -------------------------------------------------------------- */
  /* Pan gesture                                                    */
  /* -------------------------------------------------------------- */

  const gesture = Gesture.Pan()
    .onBegin((event) => {
      if (progressWidth <= 0) {
        return;
      }

      isDragging.value = true;

      const newProgress = Math.min(1, Math.max(0, event.x / progressWidth));

      progressValue.value = newProgress;
    })
    .onUpdate((event) => {
      if (progressWidth <= 0) {
        return;
      }

      const newProgress = Math.min(1, Math.max(0, event.x / progressWidth));

      progressValue.value = newProgress;
    })
    .onEnd(() => {
      isDragging.value = false;

      runOnJS(seekToPosition)(progressValue.value);
    });

  /* -------------------------------------------------------------- */
  /* Tap gesture                                                     */
  /* -------------------------------------------------------------- */

  const tapGesture = Gesture.Tap().onEnd((event) => {
    if (progressWidth <= 0) {
      return;
    }

    const newProgress = Math.min(1, Math.max(0, event.x / progressWidth));

    progressValue.value = newProgress;

    runOnJS(seekToPosition)(newProgress);
  });

  const combinedGesture = Gesture.Simultaneous(gesture, tapGesture);

  /* -------------------------------------------------------------- */
  /* Animated fill                                                   */
  /* -------------------------------------------------------------- */

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: progressValue.value * progressWidth,
    };
  });

  /* -------------------------------------------------------------- */
  /* Animated thumb                                                  */
  /* -------------------------------------------------------------- */

  const thumbStyle = useAnimatedStyle(() => {
    return {
      left: progressValue.value * progressWidth - PROGRESS_THUMB_OFFSET,
    };
  });

  /* -------------------------------------------------------------- */
  /* Socket sync                                                     */
  /* -------------------------------------------------------------- */

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
        onLayout={(event) => {
          const measuredWidth = event.nativeEvent.layout.width;

          if (measuredWidth !== progressWidth) {
            setProgressWidth(measuredWidth);
          }
        }}
        style={styles.progressWrapper}
      >
        {/* Track */}

        <View style={styles.progressTrack} />

        {/* Fill */}

        <Animated.View style={[styles.progressFill, progressStyle]} />

        {/* Thumb */}

        <Animated.View style={[styles.progressThumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
};

/* ================================================================== */
/* MEDIA CONTROLS                                                     */
/* ================================================================== */

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
      {/* ========================================================== */}
      {/* REPEAT                                                      */}
      {/* ========================================================== */}

      <Pressable
        onPress={() => setIsLoop((prev: boolean) => !prev)}
        style={({ pressed }) => [
          styles.controlButton,
          isLoop && styles.controlButtonActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="repeat"
          size={moderateScale(16)}
          color={isLoop ? colors.primary : colors.textMuted}
        />
      </Pressable>

      {/* ========================================================== */}
      {/* PREVIOUS                                                     */}
      {/* ========================================================== */}

      <Pressable
        onPress={handlePrev}
        style={({ pressed }) => [
          styles.controlButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="play-skip-back"
          size={moderateScale(19)}
          color={colors.text}
        />
      </Pressable>

      {/* ========================================================== */}
      {/* PLAY / PAUSE                                                 */}
      {/* ========================================================== */}

      <Pressable
        onPress={() => {
          if (isPlaying) {
            handlePause();
          } else {
            handlePlay();
          }
        }}
        style={({ pressed }) => [
          styles.playButtonOuter,
          pressed && styles.playButtonPressed,
        ]}
      >
        <LinearGradient
          colors={["#B05CFF", colors.primary]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={styles.playButton}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={moderateScale(18)}
            color="#17121D"
            style={
              !isPlaying
                ? {
                    marginLeft: moderateScale(2),
                  }
                : undefined
            }
          />
        </LinearGradient>
      </Pressable>

      {/* ========================================================== */}
      {/* NEXT                                                         */}
      {/* ========================================================== */}

      <Pressable
        onPress={handleNext}
        style={({ pressed }) => [
          styles.controlButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="play-skip-forward"
          size={moderateScale(19)}
          color={colors.text}
        />
      </Pressable>

      {/* ========================================================== */}
      {/* SHUFFLE                                                      */}
      {/* ========================================================== */}

      <Pressable
        onPress={() => setIsShuffle((prev: boolean) => !prev)}
        style={({ pressed }) => [
          styles.controlButton,
          isShuffle && styles.controlButtonActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="shuffle"
          size={moderateScale(16)}
          color={isShuffle ? colors.primary : colors.textMuted}
        />
      </Pressable>
    </View>
  );
};

/* ================================================================== */
/* STYLES                                                             */
/* ================================================================== */

const styles = StyleSheet.create({
  /* ================================================================ */
  /* POSITION                                                          */
  /* ================================================================ */

  playerPosition: {
    position: "absolute",

    left: moderateScale(10),
    right: moderateScale(10),

    height: PLAYER_HEIGHT,

    zIndex: 200,

    elevation: 24,
  },

  /* ================================================================ */
  /* GRADIENT BORDER                                                   */
  /* ================================================================ */

  playerBorder: {
    flex: 1,

    padding: 1,

    borderRadius: moderateScale(21),

    overflow: "hidden",

    shadowColor: colors.primary,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.18,

    shadowRadius: 14,
  },

  /* ================================================================ */
  /* PLAYER                                                            */
  /* ================================================================ */

  player: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: moderateScale(8),

    paddingVertical: moderateScale(6),

    borderRadius: moderateScale(20),

    overflow: "hidden",
  },

  /* ================================================================ */
  /* TOP ACCENT                                                        */
  /* ================================================================ */

  playerAccent: {
    position: "absolute",

    top: 0,

    left: moderateScale(24),
    right: moderateScale(24),

    height: moderateScale(2),

    borderRadius: moderateScale(2),
  },

  /* ================================================================ */
  /* ARTWORK                                                           */
  /* ================================================================ */

  artworkButton: {
    width: moderateScale(56),
    height: moderateScale(56),

    borderRadius: moderateScale(15),

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    backgroundColor: colors.surfaceElevated,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.10)",
  },

  artworkIndicator: {
    position: "absolute",

    right: moderateScale(4),
    bottom: moderateScale(4),

    width: moderateScale(14),
    height: moderateScale(14),

    borderRadius: moderateScale(7),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(18,14,24,0.90)",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.45)",
  },

  artworkIndicatorDot: {
    width: moderateScale(4),
    height: moderateScale(4),

    borderRadius: moderateScale(2),

    backgroundColor: colors.primary,
  },

  /* ================================================================ */
  /* MAIN CONTENT                                                      */
  /* ================================================================ */

  mainContent: {
    flex: 1,

    minWidth: 0,

    height: "100%",

    marginLeft: moderateScale(9),

    justifyContent: "center",
  },

  /* ================================================================ */
  /* SONG INFO                                                         */
  /* ================================================================ */

  songInfo: {
    height: moderateScale(25),

    justifyContent: "center",

    minWidth: 0,
  },

  songTitle: {
    fontSize: moderateScale(12.5),

    lineHeight: moderateScale(15),

    fontWeight: "800",

    color: colors.text,

    letterSpacing: -0.15,
  },

  artist: {
    marginTop: moderateScale(1),

    fontSize: moderateScale(9.5),

    lineHeight: moderateScale(12),

    color: colors.textMuted,
  },

  /* ================================================================ */
  /* PROGRESS                                                          */
  /* ================================================================ */

  progressWrapper: {
    height: moderateScale(11),

    width: "100%",

    justifyContent: "center",

    position: "relative",

    marginTop: moderateScale(1),

    overflow: "visible",
  },

  progressTrack: {
    position: "absolute",

    left: 0,
    right: 0,

    height: moderateScale(3),

    borderRadius: moderateScale(3),

    backgroundColor: "rgba(255,255,255,0.09)",
  },

  progressFill: {
    position: "absolute",

    left: 0,

    height: moderateScale(3),

    borderRadius: moderateScale(3),

    backgroundColor: colors.primary,
  },

  progressThumb: {
    position: "absolute",

    width: moderateScale(9),
    height: moderateScale(9),

    borderRadius: moderateScale(5),

    backgroundColor: colors.primary,

    borderWidth: 2,

    borderColor: "#17121D",

    shadowColor: colors.primary,

    shadowOpacity: 0.75,

    shadowRadius: 5,

    elevation: 5,
  },

  /* ================================================================ */
  /* CONTROLS                                                          */
  /* ================================================================ */

  controls: {
    height: moderateScale(34),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: moderateScale(4),

    marginTop: moderateScale(1),
  },

  controlButton: {
    width: moderateScale(31),
    height: moderateScale(31),

    borderRadius: moderateScale(16),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.035)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.055)",
  },

  controlButtonActive: {
    backgroundColor: "rgba(168,85,247,0.12)",

    borderColor: "rgba(168,85,247,0.28)",
  },

  /* ================================================================ */
  /* PLAY BUTTON                                                       */
  /* ================================================================ */

  playButtonOuter: {
    width: moderateScale(43),
    height: moderateScale(43),

    borderRadius: moderateScale(22),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(168,85,247,0.10)",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.55)",

    shadowColor: colors.primary,

    shadowOpacity: 0.28,

    shadowRadius: 9,

    elevation: 7,
  },

  playButton: {
    width: moderateScale(35),
    height: moderateScale(35),

    borderRadius: moderateScale(18),

    alignItems: "center",
    justifyContent: "center",
  },

  playButtonPressed: {
    transform: [
      {
        scale: 0.9,
      },
    ],
  },

  /* ================================================================ */
  /* RIGHT SECTION                                                     */
  /* ================================================================ */

  rightSection: {
    width: moderateScale(34),

    height: "100%",

    alignItems: "center",

    justifyContent: "center",

    marginLeft: moderateScale(4),
  },

  timeText: {
    fontSize: moderateScale(8),

    lineHeight: moderateScale(10),

    fontWeight: "700",

    color: colors.textSecondary,
  },

  /* ================================================================ */
  /* DOWNLOAD                                                          */
  /* ================================================================ */

  downloadButton: {
    width: moderateScale(29),
    height: moderateScale(29),

    marginTop: moderateScale(3),

    borderRadius: moderateScale(9),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.035)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.07)",
  },

  /* ================================================================ */
  /* PRESS                                                             */
  /* ================================================================ */

  pressed: {
    opacity: 0.65,

    transform: [
      {
        scale: 0.94,
      },
    ],
  },
});

/* ================================================================== */
/* AUDIO PLAYER                                                       */
/* ================================================================== */

const AudioPlayer = () => {
  const audioData = usePlayer();

  return (
    <PlayerContext.Provider value={audioData}>
      <PlayerUi />
    </PlayerContext.Provider>
  );
};

export default AudioPlayer;
