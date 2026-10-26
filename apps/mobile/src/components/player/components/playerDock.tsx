import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { moderateScale } from "react-native-fluid-styles";

import { SongSmallCard } from "@/components/songs/songSmalCard";
import { usePlayerProgressStore } from "@/store/player.progress.store";
import { usePlayerStore } from "@/store/player.store";
import { useTheme } from "@/themes/theme.context";
import { convertPlayerListToNormalSongList } from "@/utils/convertSongListToPlayerList";
import { handleSongPlay } from "@/utils/handleSongPlay";
import { PlayerService } from "../player.service";

type SongItem = {
  id?: string | number;
  mediaId?: string | number;
  name?: string;
  title?: string;
  artist?: string;
  image?: Array<{ url?: string }> | string;
  artworkUrl?: string;
  url?: string;
  [key: string]: any;
};

type PlayerDockProps = {
  songListForPlayer?: SongItem[];
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function getSongImage(song?: SongItem): string | undefined {
  if (!song) return undefined;

  if (typeof song.image === "string") {
    return song.image;
  }

  return song.image?.[2]?.url ?? song.artworkUrl;
}

function normalizeQueueSong(song: SongItem, index: number): SongItem {
  return {
    ...song,
    id: song.id ?? song.mediaId ?? song.url ?? `queue-song-${index}`,
    name: song.name ?? song.title ?? "Unknown track",
    image:
      song.image ?? (song.artworkUrl ? [{ url: song.artworkUrl }] : undefined),
  };
}

export default function PlayerDock({
  songListForPlayer: suppliedSongList,
}: PlayerDockProps) {
  const { Theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const [expanded, setExpanded] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [queueVisible, setQueueVisible] = useState(true);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const storedQueue = usePlayerStore((state) => state.queue);

  const activeMediaId = usePlayerStore((state) => state.activeTrack?.mediaId);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const repeatMode = usePlayerStore((state) => state.repeatMode);

  const position = usePlayerProgressStore((state) => state.position);
  const duration = usePlayerProgressStore((state) => state.duration);

  const songListForPlayer = useMemo(() => {
    const source = (suppliedSongList ?? storedQueue ?? []) as SongItem[];
    return convertPlayerListToNormalSongList(source);
  }, [suppliedSongList, storedQueue]);

  const styles = StyleSheet.create({
    root: {
      position: "relative",
    },

    miniCard: {
      overflow: "hidden",
      // marginHorizontal: moderateScale(8),
      marginBottom: moderateScale(4),
      // borderRadius: moderateScale(17),
      backgroundColor: Theme.colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Theme.colors.neutral300,
    },

    miniProgress: {
      height: moderateScale(2),
      width: "100%",
    },

    miniProgressFill: {
      height: "100%",
      backgroundColor: Theme.colors.primary,
    },

    miniRow: {
      minHeight: moderateScale(64),
      // paddingHorizontal: moderateScale(8),

      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: moderateScale(14),
      paddingVertical: moderateScale(7),
      gap: moderateScale(8),
    },

    miniArtwork: {
      width: moderateScale(45),
      height: moderateScale(45),
      borderRadius: moderateScale(9),
      backgroundColor: Theme.colors.neutral200,
    },

    miniTrackInfo: {
      flex: 1,
      gap: moderateScale(3),
    },

    miniTitle: {
      color: Theme.colors.text,
      fontSize: moderateScale(12),
      fontWeight: "700",
    },

    miniArtist: {
      color: Theme.colors.neutral600,
      fontSize: moderateScale(10),
    },

    miniButton: {
      width: moderateScale(36),
      height: moderateScale(42),
      alignItems: "center",
      justifyContent: "center",
    },

    miniPlay: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      backgroundColor: Theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    modal: {
      flex: 1,
      backgroundColor: Theme.colors.background,
    },

    screen: {
      flex: 1,
      paddingHorizontal: moderateScale(20),
    },

    topBar: {
      minHeight: moderateScale(44),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    topButton: {
      width: moderateScale(42),
      height: moderateScale(42),
      alignItems: "center",
      justifyContent: "center",
    },

    topCenter: {
      alignItems: "center",
      gap: moderateScale(2),
    },

    eyebrow: {
      color: Theme.colors.neutral400,
      fontSize: moderateScale(9),
      fontWeight: "800",
      letterSpacing: 1.6,
    },

    topTitle: {
      color: Theme.colors.text,
      fontSize: moderateScale(11),
      fontWeight: "700",
    },

    artworkStage: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: moderateScale(12),
      paddingBottom: moderateScale(18),
    },

    largeArtwork: {
      width: Math.min(windowWidth - moderateScale(64), moderateScale(330)),
      height: Math.min(windowWidth - moderateScale(64), moderateScale(330)),
      borderRadius: moderateScale(22),
      backgroundColor: Theme.colors.neutral200,
    },

    artworkPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Theme.colors.neutral200,
    },

    trackHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: moderateScale(10),
    },

    trackInfo: {
      flex: 1,
      gap: moderateScale(4),
    },

    trackTitle: {
      color: Theme.colors.text,
      fontSize: moderateScale(20),
      fontWeight: "800",
      letterSpacing: -0.4,
    },

    trackArtist: {
      color: Theme.colors.text,
      fontSize: moderateScale(12),
    },

    slider: {
      width: "100%",
      height: moderateScale(32),
      marginTop: moderateScale(14),
    },

    timeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: moderateScale(-5),
    },

    time: {
      color: Theme.colors.text,
      fontSize: moderateScale(10),
      fontVariant: ["tabular-nums"],
    },

    controls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: moderateScale(1),
      marginTop: moderateScale(12),
      marginBottom: moderateScale(12),
    },

    controlButton: {
      width: moderateScale(40),
      height: moderateScale(46),
      alignItems: "center",
      justifyContent: "center",
    },

    playButton: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
      backgroundColor: Theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: Theme.colors.primary,
      shadowOpacity: 0.22,
      shadowRadius: moderateScale(10),
      shadowOffset: {
        width: 0,
        height: moderateScale(4),
      },
      elevation: 4,
    },

    queuePanel: {
      flex: 1,
      minHeight: moderateScale(90),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: Theme.colors.text,
      paddingTop: moderateScale(11),
    },

    queueHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: moderateScale(8),
    },

    queueTitle: {
      color: Theme.colors.text,
      fontSize: moderateScale(15),
      fontWeight: "800",
    },

    queueSubtitle: {
      color: Theme.colors.neutral400,
      fontSize: moderateScale(10),
      marginTop: moderateScale(2),
    },

    emptyQueue: {
      color: Theme.colors.neutral400,
      textAlign: "center",
      fontSize: moderateScale(11),
      paddingVertical: moderateScale(20),
    },

    songCardWrap: {
      marginBottom: moderateScale(3),
    },
  });

  useEffect(() => {
    if (!seeking) {
      setSeekValue(position);
    }
  }, [position, seeking]);

  const openPlayer = useCallback(() => {
    setExpanded(true);
    slideAnim.setValue(0);
    backdropAnim.setValue(0);

    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),

        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [backdropAnim, slideAnim]);

  const closePlayer = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 190,
        useNativeDriver: true,
      }),

      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 170,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setExpanded(false);
      }
    });
  }, [backdropAnim, slideAnim]);

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

  const handleQueueSongPress = useCallback(
    (index: number) => {
      handleSongPlay(index, songListForPlayer, true);
    },
    [songListForPlayer],
  );

  const track: any = activeTrack as SongItem | null;
  const artwork = getSongImage(track);

  const max = Math.max(duration, 1);

  const currentPosition = Math.min(
    Math.max(0, seeking ? seekValue : position),
    max,
  );

  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  const resolvedActiveIndex = songListForPlayer.findIndex(
    (item: any) => item.id === activeMediaId || item.mediaId === activeMediaId,
  );

  const upcomingCount = Math.max(
    songListForPlayer.length - Math.max(resolvedActiveIndex, 0) - 1,
    0,
  );

  const topInset = Math.max(insets.top, moderateScale(8));
  const bottomInset = Math.max(insets.bottom, moderateScale(8));

  const RenderItem = useCallback(
    ({ item, index }: { item: SongItem; index: number }) => {
      return (
        <View style={styles.songCardWrap}>
          <SongSmallCard
            isActive={activeMediaId === item.id}
            title={item.name ?? item.title ?? "Unknown track"}
            image={getSongImage(item) as any}
            number={index + 1}
            song={item}
            onPress={() => handleQueueSongPress(index)}
          />
        </View>
      );
    },
    [activeMediaId, handleQueueSongPress, styles.songCardWrap],
  );

  if (!activeTrack || !track) {
    return null;
  }

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* Compact mini-player */}
      <Pressable
        onPress={openPlayer}
        style={styles.miniCard}
        accessibilityRole="button"
        accessibilityLabel="Open full-screen player and queue"
      >
        <View style={styles.miniProgress}>
          <View
            style={[styles.miniProgressFill, { width: `${progress * 100}%` }]}
          />
        </View>

        <View style={styles.miniRow}>
          {artwork ? (
            <Image source={{ uri: artwork }} style={styles.miniArtwork} />
          ) : (
            <View style={[styles.miniArtwork, styles.artworkPlaceholder]}>
              <Ionicons
                name="musical-notes"
                size={moderateScale(20)}
                color={Theme.colors.neutral400}
              />
            </View>
          )}

          <View style={styles.miniTrackInfo}>
            <Text numberOfLines={1} style={styles.miniTitle}>
              {track.title ?? track.name ?? "Unknown track"}
            </Text>

            <Text numberOfLines={1} style={styles.miniArtist}>
              {track.artist ?? "Unknown artist"}
            </Text>
          </View>

          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              void handlePrevious();
            }}
            style={styles.miniButton}
            hitSlop={5}
            accessibilityRole="button"
            accessibilityLabel="Previous track"
          >
            <Ionicons
              name="play-skip-back"
              size={moderateScale(18)}
              color={Theme.colors.text}
            />
          </Pressable>

          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              void handleTogglePlay();
            }}
            style={styles.miniPlay}
            hitSlop={5}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? "Pause" : "Play"}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={moderateScale(20)}
              color={Theme.colors.background}
            />
          </Pressable>

          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              void handleNext();
            }}
            style={styles.miniButton}
            hitSlop={5}
            accessibilityRole="button"
            accessibilityLabel="Next track"
          >
            <Ionicons
              name="play-skip-forward"
              size={moderateScale(18)}
              color={Theme.colors.text}
            />
          </Pressable>
        </View>
      </Pressable>

      {/* Full-screen player */}
      <Modal
        visible={expanded}
        animationType="none"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={closePlayer}
      >
        <View style={styles.modal}>
          <StatusBar barStyle="light-content" />

          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: Theme.colors.background,
                opacity: backdropAnim,
              },
            ]}
          />

          <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
            <Animated.View
              style={[
                styles.screen,
                {
                  paddingTop: topInset,
                  paddingBottom: bottomInset,
                  opacity: slideAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [Math.min(windowHeight * 0.16, 120), 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.topBar}>
                <Pressable
                  onPress={closePlayer}
                  style={styles.topButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close player"
                >
                  <Ionicons
                    name="chevron-down"
                    size={moderateScale(25)}
                    color={Theme.colors.text}
                  />
                </Pressable>

                <View style={styles.topCenter}>
                  <Text style={styles.eyebrow}>NOW PLAYING</Text>
                  <Text style={styles.topTitle}>RIFFLY PLAYER</Text>
                </View>

                <Pressable
                  onPress={() => setQueueVisible((visible) => !visible)}
                  style={styles.topButton}
                  accessibilityRole="button"
                  accessibilityLabel={
                    queueVisible ? "Hide queue" : "Show queue"
                  }
                >
                  <Ionicons
                    name="list"
                    size={moderateScale(23)}
                    color={
                      queueVisible ? Theme.colors.primary : Theme.colors.text
                    }
                  />
                </Pressable>
              </View>

              {/* Album artwork */}
              <View style={styles.artworkStage}>
                {artwork ? (
                  <Image
                    source={{ uri: artwork }}
                    style={styles.largeArtwork}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[styles.largeArtwork, styles.artworkPlaceholder]}
                  >
                    <Ionicons
                      name="musical-notes"
                      size={moderateScale(70)}
                      color={Theme.colors.neutral400}
                    />
                  </View>
                )}
              </View>

              {/* Track information */}
              <View style={styles.trackHeader}>
                <View style={styles.trackInfo}>
                  <Text numberOfLines={1} style={styles.trackTitle}>
                    {track.title ?? track.name ?? "Unknown track"}
                  </Text>

                  <Text numberOfLines={1} style={styles.trackArtist}>
                    {track.artist ?? "Unknown artist"}
                  </Text>
                </View>

                <Pressable
                  onPress={handleShuffle}
                  style={styles.topButton}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isShuffled ? "Disable shuffle" : "Enable shuffle"
                  }
                >
                  <Ionicons
                    name="shuffle"
                    size={moderateScale(23)}
                    color={
                      isShuffled ? Theme.colors.primary : Theme.colors.text
                    }
                  />
                </Pressable>
              </View>

              {/* Seek bar */}
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={max}
                value={currentPosition}
                minimumTrackTintColor={Theme.colors.primary}
                maximumTrackTintColor={Theme.colors.neutral300}
                thumbTintColor={Theme.colors.primary}
                disabled={duration <= 0}
                onSlidingStart={() => {
                  setSeeking(true);
                  setSeekValue(position);
                }}
                onValueChange={setSeekValue}
                onSlidingComplete={seek}
              />

              <View style={styles.timeRow}>
                <Text style={styles.time}>{formatTime(currentPosition)}</Text>

                <Text style={styles.time}>{formatTime(duration)}</Text>
              </View>

              {/* Playback controls */}
              <View style={styles.controls}>
                <Pressable
                  onPress={handleShuffle}
                  style={styles.controlButton}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isShuffled ? "Disable shuffle" : "Enable shuffle"
                  }
                >
                  <Ionicons
                    name="shuffle"
                    size={moderateScale(21)}
                    color={
                      isShuffled ? Theme.colors.primary : Theme.colors.text
                    }
                  />
                </Pressable>

                <Pressable
                  onPress={handlePrevious}
                  style={styles.controlButton}
                  accessibilityRole="button"
                  accessibilityLabel="Previous track"
                >
                  <Ionicons
                    name="play-skip-back"
                    size={moderateScale(26)}
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
                    size={moderateScale(29)}
                    color={Theme.colors.background}
                  />
                </Pressable>

                <Pressable
                  onPress={handleNext}
                  style={styles.controlButton}
                  accessibilityRole="button"
                  accessibilityLabel="Next track"
                >
                  <Ionicons
                    name="play-skip-forward"
                    size={moderateScale(26)}
                    color={Theme.colors.text}
                  />
                </Pressable>

                <Pressable
                  onPress={handleRepeat}
                  style={styles.controlButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Repeat ${repeatMode}`}
                >
                  <View>
                    <Ionicons
                      name="repeat"
                      size={moderateScale(21)}
                      color={
                        repeatMode !== "off"
                          ? Theme.colors.primary
                          : Theme.colors.text
                      }
                    />

                    {repeatMode === "track" && (
                      <Text
                        style={{
                          position: "absolute",
                          alignSelf: "center",
                          top: moderateScale(6),
                          color: Theme.colors.primary,
                          fontSize: moderateScale(8),
                          fontWeight: "800",
                        }}
                      >
                        1
                      </Text>
                    )}
                  </View>
                </Pressable>
              </View>

              {/* Expandable queue */}
              {queueVisible && (
                <View style={styles.queuePanel}>
                  <View style={styles.queueHeader}>
                    <View>
                      <Text style={styles.queueTitle}>Up Next</Text>

                      <Text style={styles.queueSubtitle}>
                        {upcomingCount} upcoming{" "}
                        {upcomingCount === 1 ? "track" : "tracks"}
                      </Text>
                    </View>

                    <Ionicons
                      name="reorder-two"
                      size={moderateScale(22)}
                      color={Theme.colors.neutral400}
                    />
                  </View>

                  <FlatList
                    data={songListForPlayer}
                    renderItem={RenderItem}
                    keyExtractor={(item, index) =>
                      String(item.id ?? item.mediaId ?? item.url ?? index)
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingBottom: moderateScale(10),
                    }}
                    initialNumToRender={8}
                    maxToRenderPerBatch={8}
                    windowSize={5}
                    removeClippedSubviews
                    ListEmptyComponent={
                      <Text style={styles.emptyQueue}>
                        Your queue is empty.
                      </Text>
                    }
                  />
                </View>
              )}
            </Animated.View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
