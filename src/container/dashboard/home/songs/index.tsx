import React, { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Spinner } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { useAudioContext } from "@/src/providers/AudioProvider";
import { useSocket } from "@/src/providers/socketProvider";
import { getValueInAsync } from "@/src/utilities/helpers";
import { colors } from "@/src/constants/theme";
import { Text } from "@/src/providers/CustomText";

import SongsSmollCard from "../../common/song-card/SongsSmollCard";
import Header from "../../common/header";
import { saveDebugJson } from "@/src/utilities/saveFiles";

const Songs = () => {
  const { songListToRender, isLoadingSongListToRender, fetchData, isLoading } =
    useGlobalContext();

  const { currentSong, setCurrentSong, setCurrentSongList } = useAudioContext();

  const { socket } = useSocket();

  const insets = useSafeAreaInsets();

  /* ================================================================ */
  /* PLAY SONG                                                         */
  /* ================================================================ */

  // saveDebugJson(songListToRender);

  const handleSongPress = useCallback(
    async (item: any) => {
      setCurrentSong(item);
      setCurrentSongList(songListToRender);

      if (item.type || item.downloadUrl?.[0]?.url) {
        try {
          const user: any = await getValueInAsync("user");

          const userId = JSON.parse(user || "{}")?._id;

          socket?.emit("songPlaying", {
            senderId: userId,
            song: item,
          });
        } catch (error) {
          console.log("Unable to play song:", error);
        }
      }
    },
    [setCurrentSong, setCurrentSongList, songListToRender, socket],
  );

  /* ================================================================ */
  /* LOADING                                                           */
  /* ================================================================ */

  // if (isLoading) {
  //   return <LoadingState />;
  // }

  return (
    <View
      style={[
        styles.container,
        {
          // paddingTop: insets.top,
        },
      ]}
    >
      {/* ============================================================ */}
      {/* SONG LIST                                                     */}
      {/* ============================================================ */}

      {isLoading && (
        <View style={{ paddingTop: insets.top }}>
          <Header />

          <View style={styles.pageHeader}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Songs</Text>

                <View style={styles.titleDot} />
              </View>

              <Text style={styles.subtitle}>
                {songListToRender?.length ?? 0} songs
              </Text>
            </View>

            <View style={styles.musicIcon}>
              <Ionicons
                name="musical-notes"
                size={moderateScale(18)}
                color={colors.primary}
              />
            </View>
          </View>

          <View style={styles.listHeader}>
            <View style={styles.listTitleContainer}>
              <Text style={styles.listTitle}>Your collection</Text>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {songListToRender?.length ?? 0}
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.filterButton,
                pressed && styles.filterButtonPressed,
              ]}
            >
              <Ionicons
                name="options-outline"
                size={moderateScale(16)}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      )}

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={songListToRender}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const isActive = currentSong?.id === item.id;

            return (
              <SongsSmollCard
                isActive={isActive}
                title={item.name}
                image={item?.image?.[2]?.url}
                number={index + 1}
                song={item}
                onPress={() => handleSongPress(item)}
              />
            );
          }}
          onEndReached={fetchData}
          onEndReachedThreshold={0.25}
          ListHeaderComponent={
            <View style={{ paddingTop: insets.top }}>
              <Header />

              <View style={styles.pageHeader}>
                <View>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>Songs</Text>

                    <View style={styles.titleDot} />
                  </View>

                  <Text style={styles.subtitle}>
                    {songListToRender?.length ?? 0} songs
                  </Text>
                </View>

                <View style={styles.musicIcon}>
                  <Ionicons
                    name="musical-notes"
                    size={moderateScale(18)}
                    color={colors.primary}
                  />
                </View>
              </View>

              <View style={styles.listHeader}>
                <View style={styles.listTitleContainer}>
                  <Text style={styles.listTitle}>Your collection</Text>

                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {songListToRender?.length ?? 0}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.filterButton,
                    pressed && styles.filterButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="options-outline"
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          }
          ListFooterComponent={() =>
            isLoadingSongListToRender ? (
              <View style={styles.footerLoader}>
                <View style={styles.loaderCircle}>
                  <Spinner size="small" color={colors.primary} />
                </View>

                <Text style={styles.loadingText}>Loading more</Text>
              </View>
            ) : (
              <View style={styles.footerSpace} />
            )
          }
        />
      )}

      {/* ============================================================ */}
      {/* TOP FADE                                                      */}
      {/* ============================================================ */}

      <LinearGradient
        pointerEvents="none"
        colors={[colors.background, "rgba(18,15,22,0.88)", "rgba(18,15,22,0)"]}
        locations={[0, 0.45, 1]}
        style={styles.topFade}
      />
    </View>
  );
};

/* ================================================================== */
/* LOADING                                                             */
/* ================================================================== */

const LoadingState = () => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingGlow}>
        <LinearGradient
          colors={["rgba(168,85,247,0.25)", "rgba(168,85,247,0.03)"]}
          style={styles.loadingGradient}
        >
          <Ionicons
            name="musical-notes"
            size={moderateScale(25)}
            color={colors.primary}
          />
        </LinearGradient>
      </View>

      <Text style={styles.loadingTitle}>Finding your music</Text>

      <Text style={styles.loadingSubtitle}>Getting your songs ready...</Text>

      <Spinner size="small" color={colors.primary} style={styles.spinner} />
    </View>
  );
};

/* ================================================================== */
/* STYLES                                                              */
/* ================================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: colors.background,

    position: "relative",
  },

  /* ================================================================ */
  /* PAGE HEADER                                                       */
  /* ================================================================ */

  pageHeader: {
    paddingHorizontal: moderateScale(16),

    paddingTop: moderateScale(14),

    paddingBottom: moderateScale(13),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  titleRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  title: {
    fontSize: moderateScale(26),

    lineHeight: moderateScale(30),

    fontWeight: "800",

    letterSpacing: -0.8,

    color: colors.text,
  },

  titleDot: {
    width: moderateScale(6),
    height: moderateScale(6),

    borderRadius: moderateScale(3),

    marginLeft: moderateScale(5),

    marginTop: moderateScale(12),

    backgroundColor: colors.primary,

    shadowColor: colors.primary,

    shadowOpacity: 0.8,

    shadowRadius: 6,

    elevation: 4,
  },

  subtitle: {
    marginTop: moderateScale(3),

    fontSize: moderateScale(10.5),

    color: colors.textMuted,
  },

  musicIcon: {
    width: moderateScale(40),
    height: moderateScale(40),

    borderRadius: moderateScale(13),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(168,85,247,0.08)",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.16)",
  },

  /* ================================================================ */
  /* LIST HEADER                                                       */
  /* ================================================================ */

  listHeader: {
    paddingHorizontal: moderateScale(16),

    marginBottom: moderateScale(6),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  listTitleContainer: {
    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(7),
  },

  listTitle: {
    fontSize: moderateScale(14),

    fontWeight: "700",

    color: colors.text,
  },

  countBadge: {
    minWidth: moderateScale(23),

    height: moderateScale(19),

    paddingHorizontal: moderateScale(5),

    borderRadius: moderateScale(7),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(168,85,247,0.10)",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.16)",
  },

  countText: {
    fontSize: moderateScale(8.5),

    fontWeight: "700",

    color: colors.primary,
  },

  filterButton: {
    width: moderateScale(32),
    height: moderateScale(32),

    borderRadius: moderateScale(10),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.025)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.06)",
  },

  filterButtonPressed: {
    opacity: 0.6,

    transform: [
      {
        scale: 0.93,
      },
    ],
  },

  /* ================================================================ */
  /* LIST                                                              */
  /* ================================================================ */

  listContent: {
    paddingHorizontal: moderateScale(10),

    paddingTop: moderateScale(2),

    paddingBottom: moderateScale(190),
  },

  /* ================================================================ */
  /* TOP FADE                                                          */
  /* ================================================================ */

  topFade: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,

    height: moderateScale(35),

    zIndex: 20,
  },

  /* ================================================================ */
  /* FOOTER                                                            */
  /* ================================================================ */

  footerLoader: {
    height: moderateScale(75),

    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",

    gap: moderateScale(8),
  },

  loaderCircle: {
    width: moderateScale(28),
    height: moderateScale(28),

    borderRadius: moderateScale(14),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(168,85,247,0.08)",
  },

  loadingText: {
    fontSize: moderateScale(9.5),

    color: colors.textMuted,
  },

  footerSpace: {
    height: moderateScale(30),
  },

  /* ================================================================ */
  /* LOADING SCREEN                                                    */
  /* ================================================================ */

  loadingContainer: {
    flex: 1,

    backgroundColor: colors.background,

    alignItems: "center",
    paddingTop: moderateScale(100),
    // justifyContent: "center",

    paddingBottom: moderateScale(80),
  },

  loadingGlow: {
    width: moderateScale(70),
    height: moderateScale(70),

    borderRadius: moderateScale(35),

    padding: 1,

    backgroundColor: "rgba(168,85,247,0.16)",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.25)",
  },

  loadingGradient: {
    flex: 1,

    borderRadius: moderateScale(34),

    alignItems: "center",
    justifyContent: "center",
  },

  loadingTitle: {
    marginTop: moderateScale(16),

    fontSize: moderateScale(15),

    fontWeight: "700",

    color: colors.text,
  },

  loadingSubtitle: {
    marginTop: moderateScale(4),

    fontSize: moderateScale(10.5),

    color: colors.textMuted,
  },

  spinner: {
    marginTop: moderateScale(12),
  },
});

export default Songs;
