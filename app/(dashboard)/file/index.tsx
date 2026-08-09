import React, { useEffect, useState, useCallback } from "react";

import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import { Spinner } from "tamagui";

import SongsSmollCard from "@/src/container/dashboard/common/song-card/SongsSmollCard";

import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { useAudioContext } from "@/src/providers/AudioProvider";
import { colors } from "@/src/constants/theme";
import { Text } from "@/src/providers/CustomText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "@/src/container/dashboard/common/header";
import {
  exportDownloadedSongs,
  exportSongToFolder,
  importDownloadedSongs,
} from "@/src/utilities/helpers";

const LIMIT = 100;

const Files = () => {
  const { localFilesAfterSearch, setImportCount } = useGlobalContext();

  const { setCurrentSong, setCurrentSongList, currentSong } = useAudioContext();

  const [page, setPage] = useState(1);

  const [filterData, setFilterData] = useState<any[]>([]);

  /* ================================================================ */
  /* PAGINATION                                                        */
  /* ================================================================ */

  useEffect(() => {
    const nextData = localFilesAfterSearch?.slice(0, page * LIMIT) || [];

    setFilterData(nextData);
  }, [page, localFilesAfterSearch]);

  /* ================================================================ */
  /* RESET PAGE WHEN SEARCH CHANGES                                   */
  /* ================================================================ */

  useEffect(() => {
    setPage(1);
  }, [localFilesAfterSearch?.length]);

  /* ================================================================ */
  /* PLAY SONG                                                         */
  /* ================================================================ */

  const handleSongPress = useCallback(
    (item: any) => {
      setCurrentSong(item);
      setCurrentSongList(filterData);
    },
    [setCurrentSong, setCurrentSongList, filterData],
  );

  /* ================================================================ */
  /* LOAD MORE                                                         */
  /* ================================================================ */

  const handleLoadMore = useCallback(() => {
    if (filterData.length >= localFilesAfterSearch.length) {
      return;
    }

    setPage((prev) => prev + 1);
  }, [filterData.length, localFilesAfterSearch.length]);

  /* ================================================================ */
  /* EMPTY STATE                                                       */
  /* ================================================================ */

  // if (!localFilesAfterSearch || localFilesAfterSearch.length === 0) {
  //   return <EmptyState />;
  // }

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}

      <View style={styles.header}>
        <Header />
        {/* <View style={styles.headerContent}>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Downloads</Text>

              <View style={styles.titleDot} />
            </View>

            <Text style={styles.subtitle}>Your offline music collection</Text>
          </View>

          <View style={styles.downloadIcon}>
            <LinearGradient
              colors={["rgba(168,85,247,0.16)", "rgba(168,85,247,0.04)"]}
              style={styles.downloadIconGradient}
            >
              <Ionicons
                name="download-outline"
                size={moderateScale(19)}
                color={colors.primary}
              />
            </LinearGradient>
          </View>
        </View> */}
      </View>

      {/* ============================================================ */}
      {/* COLLECTION SUMMARY                                            */}
      {/* ============================================================ */}

      {/* ============================================================ */}
      {/* SONG LIST                                                     */}
      {/* ============================================================ */}

      <FlatList
        data={filterData}
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
              isShowButton={false}
              onPress={() => handleSongPress(item)}
            />
          );
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.25}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              {/* <Header /> */}
              <View style={styles.headerContent}>
                <View>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>Downloads</Text>

                    <View style={styles.titleDot} />
                  </View>

                  <Text style={styles.subtitle}>
                    Your offline music collection
                  </Text>
                </View>

                {/* Download icon */}
                <View style={styles.actionContainer}>
                  {/* Import */}
                  <Pressable
                    onPress={async () => {
                      const success = await importDownloadedSongs();

                      setImportCount((prev: any) => prev + 1);

                      if (success) {
                        Alert.alert("Success", "Songs imported successfully");
                      }
                    }}
                  >
                    <View style={styles.downloadIcon}>
                      <LinearGradient
                        colors={[
                          "rgba(168,85,247,0.16)",
                          "rgba(168,85,247,0.04)",
                        ]}
                        style={styles.downloadIconGradient}
                      >
                        <Ionicons
                          name="cloud-download-outline"
                          size={moderateScale(19)}
                          color={colors.primary}
                        />
                      </LinearGradient>
                    </View>
                  </Pressable>

                  {/* Export */}
                  <Pressable
                    onPress={async () => {
                      const success = await exportDownloadedSongs();

                      if (success) {
                        Alert.alert("Success", "Songs exported successfully");
                      }
                    }}
                  >
                    <View style={styles.downloadIcon}>
                      <LinearGradient
                        colors={[
                          "rgba(168,85,247,0.16)",
                          "rgba(168,85,247,0.04)",
                        ]}
                        style={styles.downloadIconGradient}
                      >
                        <Ionicons
                          name="cloud-upload-outline"
                          size={moderateScale(19)}
                          color={colors.primary}
                        />
                      </LinearGradient>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryTitle}>Offline songs</Text>

                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {localFilesAfterSearch.length}
                  </Text>
                </View>
              </View>

              <View style={styles.offlineBadge}>
                <View style={styles.offlineDot} />

                <Text style={styles.offlineText}>Available offline</Text>
              </View>
            </View>
          </>
        }
        ListFooterComponent={
          filterData.length < localFilesAfterSearch.length ? (
            <View style={styles.footerLoader}>
              <View style={styles.loaderCircle}>
                <Spinner size="small" color={colors.primary} />
              </View>

              <Text style={styles.loadingText}>Loading more</Text>
            </View>
          ) : (
            <View style={styles.endContainer}>
              <View style={styles.endLine} />

              <Text style={styles.endText}>All downloads loaded</Text>

              <View style={styles.endLine} />
            </View>
          )
        }
      />

      {/* ============================================================ */}
      {/* TOP FADE                                                      */}
      {/* ============================================================ */}

      <LinearGradient
        pointerEvents="none"
        colors={[colors.background, "rgba(18,15,22,0.86)", "rgba(18,15,22,0)"]}
        locations={[0, 0.45, 1]}
        style={styles.topFade}
      />
    </View>
  );
};

/* ================================================================== */
/* EMPTY STATE                                                         */
/* ================================================================== */

const EmptyState = () => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconOuter}>
        <LinearGradient
          colors={["rgba(168,85,247,0.18)", "rgba(168,85,247,0.04)"]}
          style={styles.emptyIcon}
        >
          <Ionicons
            name="download-outline"
            size={moderateScale(26)}
            color={colors.primary}
          />
        </LinearGradient>
      </View>

      <Text style={styles.emptyTitle}>No downloads yet</Text>

      <Text style={styles.emptyDescription}>
        Songs you download will appear here for offline listening.
      </Text>

      <View style={styles.emptyHint}>
        <Ionicons
          name="information-circle-outline"
          size={moderateScale(14)}
          color={colors.textMuted}
        />

        <Text style={styles.emptyHintText}>
          Download your favorite songs to listen without internet.
        </Text>
      </View>
    </View>
  );
};

/* ================================================================== */
/* STYLES                                                              */
/* ================================================================== */

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  /* ================================================================ */
  /* CONTAINER                                                         */
  /* ================================================================ */

  container: {
    flex: 1,

    // backgroundColor: colors.background,

    position: "relative",
  },

  /* ================================================================ */
  /* HEADER                                                            */
  /* ================================================================ */

  header: {
    paddingHorizontal: moderateScale(16),

    // paddingTop: moderateScale(15),

    paddingBottom: moderateScale(12),
  },

  headerContent: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  titleRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  title: {
    fontSize: moderateScale(25),

    lineHeight: moderateScale(30),

    fontWeight: "800",

    letterSpacing: -0.7,

    color: colors.text,
  },

  titleDot: {
    width: moderateScale(6),
    height: moderateScale(6),

    borderRadius: moderateScale(3),

    marginLeft: moderateScale(5),

    marginTop: moderateScale(11),

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

  /* ================================================================ */
  /* DOWNLOAD ICON                                                     */
  /* ================================================================ */

  downloadIcon: {
    width: moderateScale(42),
    height: moderateScale(42),

    borderRadius: moderateScale(14),

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.17)",
  },

  downloadIconGradient: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  /* ================================================================ */
  /* SUMMARY                                                           */
  /* ================================================================ */

  summary: {
    paddingHorizontal: moderateScale(16),

    marginBottom: moderateScale(7),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  summaryLeft: {
    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(7),
  },

  summaryTitle: {
    fontSize: moderateScale(13.5),

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

  offlineBadge: {
    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(5),

    paddingHorizontal: moderateScale(8),

    paddingVertical: moderateScale(5),

    borderRadius: moderateScale(9),

    backgroundColor: "rgba(34,197,94,0.06)",

    borderWidth: 1,

    borderColor: "rgba(34,197,94,0.12)",
  },

  offlineDot: {
    width: moderateScale(5),
    height: moderateScale(5),

    borderRadius: moderateScale(3),

    backgroundColor: colors.success,
  },

  offlineText: {
    fontSize: moderateScale(7.5),

    fontWeight: "600",

    color: colors.textMuted,
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

    height: moderateScale(36),

    zIndex: 20,
  },

  /* ================================================================ */
  /* FOOTER                                                            */
  /* ================================================================ */

  footerLoader: {
    height: moderateScale(70),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

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

  endContainer: {
    height: moderateScale(60),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: moderateScale(8),
  },

  endLine: {
    width: moderateScale(25),

    height: 1,

    backgroundColor: "rgba(255,255,255,0.07)",
  },

  endText: {
    fontSize: moderateScale(8.5),

    color: colors.textMuted,
  },

  /* ================================================================ */
  /* EMPTY STATE                                                       */
  /* ================================================================ */

  emptyContainer: {
    flex: 1,

    backgroundColor: colors.background,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: moderateScale(40),

    paddingBottom: moderateScale(70),
  },

  emptyIconOuter: {
    width: moderateScale(78),
    height: moderateScale(78),

    borderRadius: moderateScale(26),

    padding: 1,

    backgroundColor: "rgba(168,85,247,0.12)",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.22)",
  },

  emptyIcon: {
    flex: 1,

    borderRadius: moderateScale(25),

    alignItems: "center",

    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: moderateScale(19),

    fontSize: moderateScale(17),

    fontWeight: "800",

    color: colors.text,
  },

  emptyDescription: {
    marginTop: moderateScale(6),

    maxWidth: moderateScale(260),

    fontSize: moderateScale(10.5),

    lineHeight: moderateScale(16),

    color: colors.textMuted,

    textAlign: "center",
  },

  emptyHint: {
    marginTop: moderateScale(17),

    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(5),

    paddingHorizontal: moderateScale(10),

    paddingVertical: moderateScale(7),

    borderRadius: moderateScale(10),

    backgroundColor: "rgba(255,255,255,0.025)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.05)",
  },

  emptyHintText: {
    fontSize: moderateScale(8.5),

    color: colors.textMuted,
  },
});

export default Files;
