import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { moderateScale } from "react-native-size-matters";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { Text } from "@/src/providers/CustomText";
import { colors } from "@/src/constants/theme";

import { useGlobalContext } from "@/src/providers/GlobalProvider";

import { ProgressBarComponent } from "../../common/audio-player";
import { usePlayerContext } from "@/src/providers/PlaterProvider";

const SongsDetails = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  /* ================================================================ */
  /* EXISTING PLAYER                                                   */
  /* ================================================================ */

  const {
    imageUrl,
    sound,
    title,
    currentSong,

    position,
    setPosition,
    duration,

    handlePause,
    handlePlay,
    isPlaying,

    handleNext,
    handlePrev,

    isLoop,
    setIsLoop,

    isShuffle,
    setIsShuffle,
    currentSong: audioCurrentSong,
  } = usePlayerContext();

  /* ================================================================ */
  /* AUDIO CONTEXT                                                     */
  /* ================================================================ */

  /* ================================================================ */
  /* GLOBAL                                                             */
  /* ================================================================ */

  const { favorite, handleFavorite, handleDownload } = useGlobalContext();

  /* ================================================================ */
  /* FAVORITE                                                           */
  /* ================================================================ */

  const activeSong = currentSong || audioCurrentSong;

  const isFavorite =
    favorite?.some((item: any) => item?.id === activeSong?.id) ?? false;

  /* ================================================================ */
  /* PLAY / PAUSE                                                       */
  /* ================================================================ */

  const togglePlayback = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  /* ================================================================ */
  /* SHUFFLE                                                            */
  /* ================================================================ */

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  /* ================================================================ */
  /* LOOP                                                               */
  /* ================================================================ */

  const toggleLoop = () => {
    setIsLoop(!isLoop);
  };

  /* ================================================================ */
  /* FAVORITE                                                           */
  /* ================================================================ */

  const toggleFavorite = () => {
    if (!activeSong) {
      return;
    }

    handleFavorite(activeSong);
  };

  /* ================================================================ */
  /* DOWNLOAD                                                           */
  /* ================================================================ */

  const downloadSong = () => {
    if (!activeSong) {
      return;
    }

    handleDownload(
      activeSong?.downloadUrl?.[4]?.url,
      activeSong?.image?.[2]?.url,
      activeSong?.name,
    );
  };

  /* ================================================================ */
  /* EMPTY STATE                                                        */
  /* ================================================================ */

  if (!activeSong) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="musical-notes-outline"
            size={moderateScale(30)}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>No song playing</Text>

        <Text style={styles.emptySubtitle}>
          Start playing a song to see the player.
        </Text>
      </View>
    );
  }

  /* ================================================================ */
  /* ARTIST                                                             */
  /* ================================================================ */

  const artist =
    activeSong?.artist || activeSong?.artists?.[0]?.name || "Unknown Artist";

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      {/* ============================================================ */}
      {/* BACKGROUND                                                     */}
      {/* ============================================================ */}

      <View pointerEvents="none" style={styles.backgroundGlow}>
        <LinearGradient
          colors={[
            "rgba(168,85,247,0.20)",
            "rgba(168,85,247,0.07)",
            "transparent",
          ]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* ============================================================ */}
      {/* HEADER                                                         */}
      {/* ============================================================ */}

      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [
            styles.topButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="chevron-down"
            size={moderateScale(23)}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.nowPlaying}>
          <View style={styles.liveDot} />

          <Text style={styles.nowPlayingText}>NOW PLAYING</Text>
        </View>

        <Pressable
          onPress={downloadSong}
          hitSlop={10}
          style={({ pressed }) => [
            styles.topButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={moderateScale(21)}
            color={colors.text}
          />
        </Pressable>
      </View>

      {/* ============================================================ */}
      {/* ARTWORK                                                        */}
      {/* ============================================================ */}

      <View style={styles.artworkWrapper}>
        <View style={styles.artworkContainer}>
          <Image
            source={{
              uri: imageUrl,
            }}
            style={styles.artwork}
            contentFit="cover"
            transition={200}
          />

          <LinearGradient
            pointerEvents="none"
            colors={["transparent", "rgba(8,0,3,0.04)", "rgba(8,0,3,0.30)"]}
            locations={[0.55, 0.8, 1]}
            style={styles.artworkGradient}
          />
        </View>
      </View>

      {/* ============================================================ */}
      {/* SONG INFO                                                      */}
      {/* ============================================================ */}

      <View style={styles.songInfo}>
        <View style={styles.songInfoMain}>
          <Text numberOfLines={1} style={styles.title}>
            {title || activeSong?.name}
          </Text>

          <Text numberOfLines={1} style={styles.artist}>
            {artist}
          </Text>
        </View>

        <Pressable
          onPress={toggleFavorite}
          hitSlop={8}
          style={({ pressed }) => [
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={moderateScale(22)}
            color={isFavorite ? colors.primary : colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* ============================================================ */}
      {/* SLIDER                                                         */}
      {/* ============================================================ */}

      <ProgressBarComponent
        sound={sound}
        setPosition={setPosition}
        duration={duration}
        position={position}
        currentSongId={currentSong?.id}
      />

      {/* <View style={styles.progressContainer}>
        <MusicSlider
          position={position || 0}
          duration={duration || 0}
          onSeek={(value) => {
            setPosition(value);
          }}
        />

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position || 0)}</Text>

          <Text style={styles.timeText}>
            -{formatTime(Math.max((duration || 0) - (position || 0), 0))}
          </Text>
        </View>
      </View> */}

      {/* ============================================================ */}
      {/* PLAYER CONTROLS                                                */}
      {/* ============================================================ */}

      <View style={styles.controls}>
        {/* Shuffle */}

        <Pressable
          onPress={toggleShuffle}
          hitSlop={10}
          style={({ pressed }) => [
            styles.sideControl,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="shuffle"
            size={moderateScale(20)}
            color={isShuffle ? colors.primary : colors.textSecondary}
          />

          {isShuffle && <View style={styles.controlDot} />}
        </Pressable>

        {/* Previous */}

        <Pressable
          onPress={handlePrev}
          hitSlop={10}
          style={({ pressed }) => [
            styles.skipControl,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="play-skip-back"
            size={moderateScale(26)}
            color={colors.text}
          />
        </Pressable>

        {/* Play / Pause */}

        <Pressable
          onPress={togglePlayback}
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.playButtonPressed,
          ]}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={moderateScale(27)}
            color={colors.text}
            style={
              !isPlaying
                ? {
                    marginLeft: moderateScale(3),
                  }
                : undefined
            }
          />
        </Pressable>

        {/* Next */}

        <Pressable
          onPress={handleNext}
          hitSlop={10}
          style={({ pressed }) => [
            styles.skipControl,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="play-skip-forward"
            size={moderateScale(26)}
            color={colors.text}
          />
        </Pressable>

        {/* Repeat */}

        <Pressable
          onPress={toggleLoop}
          hitSlop={10}
          style={({ pressed }) => [
            styles.sideControl,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="repeat"
            size={moderateScale(20)}
            color={isLoop ? colors.primary : colors.textSecondary}
          />

          {isLoop && <View style={styles.controlDot} />}
        </Pressable>
      </View>

      {/* ============================================================ */}
      {/* EXTRA ACTIONS                                                  */}
      {/* ============================================================ */}

      <View style={styles.extraActions}>
        <Pressable
          onPress={downloadSong}
          style={({ pressed }) => [
            styles.extraAction,
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={styles.extraIcon}>
            <Ionicons
              name="download-outline"
              size={moderateScale(17)}
              color={colors.textSecondary}
            />
          </View>

          <Text style={styles.extraText}>Download</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.extraAction,
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={styles.extraIcon}>
            <Ionicons
              name="list-outline"
              size={moderateScale(17)}
              color={colors.textSecondary}
            />
          </View>

          <Text style={styles.extraText}>Queue</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.extraAction,
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={styles.extraIcon}>
            <Ionicons
              name="share-outline"
              size={moderateScale(17)}
              color={colors.textSecondary}
            />
          </View>

          <Text style={styles.extraText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
};

/* ================================================================== */
/* SLIDER                                                             */
/* ================================================================== */

const MusicSlider = ({
  position,
  duration,
  onSeek,
}: {
  position: number;
  duration: number;
  onSeek: (value: number) => void;
}) => {
  const [width, setWidth] = useState(0);

  const progress =
    duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0;

  const progressValue = useSharedValue(progress);

  const dragging = useSharedValue(false);

  useEffect(() => {
    if (!dragging.value) {
      progressValue.value = progress;
    }
  }, [progress, progressValue]);

  const calculateProgress = (x: number) => {
    "worklet";

    if (width <= 0) {
      return 0;
    }

    return Math.min(1, Math.max(0, x / width));
  };

  const pan = Gesture.Pan()
    .onBegin((event) => {
      dragging.value = true;

      progressValue.value = calculateProgress(event.x);
    })
    .onUpdate((event) => {
      progressValue.value = calculateProgress(event.x);
    })
    .onEnd(() => {
      dragging.value = false;

      const value = progressValue.value * duration;

      runOnJS(onSeek)(value);
    });

  const tap = Gesture.Tap().onEnd((event) => {
    const next = calculateProgress(event.x);

    progressValue.value = next;

    runOnJS(onSeek)(next * duration);
  });

  const gesture = Gesture.Exclusive(pan, tap);

  const fillStyle = useAnimatedStyle(() => ({
    width: progressValue.value * width,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: progressValue.value * width - 6,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={styles.slider}
        onLayout={(event) => {
          setWidth(event.nativeEvent.layout.width);
        }}
      >
        <View style={styles.sliderTrack} />

        <Animated.View style={[styles.sliderFill, fillStyle]} />

        <Animated.View style={[styles.sliderThumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
};

/* ================================================================== */
/* TIME                                                               */
/* ================================================================== */

const formatTime = (milliseconds: number) => {
  if (!milliseconds || milliseconds <= 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

/* ================================================================== */
/* STYLES                                                             */
/* ================================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: moderateScale(18),
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: moderateScale(62),
    height: moderateScale(62),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyTitle: {
    marginTop: moderateScale(14),
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: colors.text,
  },

  emptySubtitle: {
    marginTop: moderateScale(5),
    fontSize: moderateScale(11),
    color: colors.textMuted,
  },

  backgroundGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: moderateScale(390),
  },

  /* ================================================================ */
  /* TOP BAR                                                           */
  /* ================================================================ */

  topBar: {
    height: moderateScale(52),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },

  nowPlaying: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(7),
  },

  liveDot: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(3),
    backgroundColor: colors.primary,
  },

  nowPlayingText: {
    fontSize: moderateScale(8),
    fontWeight: "800",
    letterSpacing: 1.4,
    color: colors.textMuted,
  },

  /* ================================================================ */
  /* ARTWORK                                                           */
  /* ================================================================ */

  artworkWrapper: {
    flex: 1,
    minHeight: moderateScale(260),
    maxHeight: moderateScale(390),
    alignItems: "center",
    justifyContent: "center",
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(18),
  },

  artworkContainer: {
    width: "100%",
    maxWidth: moderateScale(350),
    aspectRatio: 1,
    borderRadius: moderateScale(24),
    overflow: "hidden",
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.45,
    shadowRadius: 25,
    elevation: 15,
    position: "relative",
  },

  artwork: {
    width: "100%",
    height: "100%",
  },

  artworkGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "45%",
  },

  /* ================================================================ */
  /* SONG INFO                                                         */
  /* ================================================================ */

  songInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: moderateScale(3),
    paddingBottom: moderateScale(12),
  },

  songInfoMain: {
    flex: 1,
    minWidth: 0,
    paddingRight: moderateScale(12),
  },

  title: {
    fontSize: moderateScale(21),
    lineHeight: moderateScale(26),
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },

  artist: {
    marginTop: moderateScale(3),
    fontSize: moderateScale(12),
    color: colors.textMuted,
    fontWeight: "500",
  },

  favoriteButton: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  favoriteButtonActive: {
    backgroundColor: "rgba(168,85,247,0.13)",
    borderColor: "rgba(168,85,247,0.35)",
  },

  /* ================================================================ */
  /* SLIDER                                                            */
  /* ================================================================ */

  progressContainer: {
    paddingTop: moderateScale(2),
    paddingBottom: moderateScale(12),
  },

  slider: {
    width: "100%",
    height: moderateScale(22),
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },

  sliderTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    height: moderateScale(4),
    borderRadius: moderateScale(4),
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  sliderFill: {
    position: "absolute",
    left: 0,
    height: moderateScale(4),
    borderRadius: moderateScale(4),
    backgroundColor: colors.primary,
  },

  sliderThumb: {
    position: "absolute",
    top: moderateScale(5),
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 7,
    elevation: 5,
  },

  timeRow: {
    marginTop: moderateScale(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timeText: {
    fontSize: moderateScale(9),
    fontWeight: "500",
    color: colors.textMuted,
  },

  /* ================================================================ */
  /* CONTROLS                                                          */
  /* ================================================================ */

  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(3),
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(10),
  },

  sideControl: {
    width: moderateScale(34),
    height: moderateScale(34),
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  controlDot: {
    position: "absolute",
    bottom: 0,
    width: moderateScale(4),
    height: moderateScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: colors.primary,
  },

  skipControl: {
    width: moderateScale(45),
    height: moderateScale(45),
    alignItems: "center",
    justifyContent: "center",
  },

  playButton: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },

  playButtonPressed: {
    transform: [
      {
        scale: 0.91,
      },
    ],
    opacity: 0.9,
  },

  /* ================================================================ */
  /* EXTRA ACTIONS                                                     */
  /* ================================================================ */

  extraActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(28),
    paddingTop: moderateScale(4),
    paddingBottom: moderateScale(12),
  },

  extraAction: {
    alignItems: "center",
    justifyContent: "center",
  },

  extraIcon: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(11),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  extraText: {
    marginTop: moderateScale(4),
    fontSize: moderateScale(8),
    fontWeight: "600",
    color: colors.textMuted,
  },

  /* ================================================================ */
  /* PRESSED                                                           */
  /* ================================================================ */

  buttonPressed: {
    opacity: 0.6,
    transform: [
      {
        scale: 0.93,
      },
    ],
  },
});

export default SongsDetails;
