import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/src/providers/CustomText";
import { colors } from "@/src/constants/theme";

import { useSocket } from "@/src/providers/socketProvider";

import SongsSmollCard from "@/src/container/dashboard/common/song-card/SongsSmollCard";
import { saveDebugJson } from "@/src/utilities/saveFiles";
import { usePlayerStore } from "@/src/store/playerStore";
import { useFavoriteStore } from "@/src/store/useFavorite";
import { useAuthStore } from "@/src/store/authStore";
import { usePaginatedData } from "@/src/hooks/usePaginatedData";
import { Spinner } from "tamagui";
import { CLoading } from "@/src/components/loader";

const Favorite = () => {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const setCurrentSongList = usePlayerStore(
    (state) => state.setCurrentSongList,
  );
  const favorite = useFavoriteStore((state) => state.favorite);
  const friends = useFavoriteStore((state) => state.friends);
  const loadFavorites = useFavoriteStore((state) => state.loadFavorites);
  const loadFriends = useFavoriteStore((state) => state.loadFriends);
  const { socket } = useSocket();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState("my");
  const user = useAuthStore((state) => state.user);
  const finalData = useMemo(() => {
    if (active === "my") {
      return favorite ?? [];
    }
    const friend: any = friends?.find(
      (item: any) => item?.user?.name === active,
    );

    return friend?.user?.favorite ?? [];
  }, [active, favorite, friends]);
  const [paginatedFavorite, loadMore, loading] = usePaginatedData(
    finalData,
    24,
  );

  const handleSongPress = async (item: any) => {
    setCurrentSong(item);
    // setTimeout(() => {
    //   setCurrentSongList(finalData);
    // }, 100);
    try {
      socket?.emit("songPlaying", {
        senderId: user?._id,
        song: item,
      });
    } catch (error) {
      console.error("Failed to emit songPlaying:", error);
    }
  };

  useEffect(() => {
    loadFavorites();
    loadFriends();
  }, [loadFavorites, loadFriends]);

  const RenderItem = useCallback(
    ({ item, index }: any) => (
      <Pressable
        style={({ pressed }) => [
          styles.songItem,
          pressed && styles.songItemPressed,
        ]}
      >
        <SongsSmollCard
          isActive={currentSong?.id === item?.id}
          title={item?.name ?? ""}
          image={item?.image?.[2]?.url}
          number={index + 1}
          song={item}
          onPress={() => handleSongPress(item)}
        />
      </Pressable>
    ),
    [favorite, friends],
  );

  const RenderFooter = useMemo(() => {
    const Item = loading ? (
      <CLoading />
    ) : (
      <View style={{ height: moderateScale(30) }} />
    );

    return Item;
  }, [loading]);

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
      {/* HEADER                                                        */}
      {/* ============================================================ */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Favorites</Text>

            <View style={styles.titleDot} />
          </View>

          <Text style={styles.subtitle}>Songs you never want to lose</Text>
        </View>

        {/* Count */}

        <View style={styles.countCard}>
          <Text style={styles.count}>{paginatedFavorite.length}</Text>

          <Text style={styles.countLabel}>songs</Text>
        </View>
      </View>

      {/* ============================================================ */}
      {/* FILTER                                                        */}
      {/* ============================================================ */}

      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <View style={styles.filterTitleRow}>
            <Ionicons
              name="people-outline"
              size={moderateScale(13)}
              color={colors.primary}
            />

            <Text style={styles.filterTitle}>FAVORITES FROM</Text>
          </View>

          <Text style={styles.filterCount}>{friends?.length ?? 0} friends</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {/* My Favorites */}

          <Pressable
            onPress={() => setActive("my")}
            style={({ pressed }) => [
              styles.filterButton,
              active === "my" && styles.filterButtonActive,
              pressed && styles.filterPressed,
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                gap: moderateScale(2),
                padding: moderateScale(6),
                backgroundColor: colors.surfaceElevated,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons
                name={active === "my" ? "heart" : "heart-outline"}
                size={moderateScale(14)}
                color={active === "my" ? colors.text : colors.textSecondary}
              />

              <Text
                style={[
                  styles.filterText,
                  active === "my" && styles.filterTextActive,
                ]}
              >
                My Favorites
              </Text>
            </View>
          </Pressable>

          {/* Friends */}

          {friends?.map((item: any) => {
            const name = item?.user?.name;

            if (!name) return null;

            const isActive = active === name;

            return (
              <Pressable
                key={item?._id ?? name}
                onPress={() => setActive(name)}
                style={({ pressed }) => [
                  styles.filterButton,
                  isActive && styles.filterButtonActive,
                  pressed && styles.filterPressed,
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: moderateScale(6),
                    alignItems: "center",
                    padding: moderateScale(6),
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={[
                      styles.friendDot,
                      isActive && styles.friendDotActive,
                    ]}
                  >
                    <Text style={styles.friendInitial}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {name}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ============================================================ */}
      {/* DIVIDER                                                       */}
      {/* ============================================================ */}

      <View style={styles.divider} />

      {/* ============================================================ */}
      {/* SONG LIST                                                     */}
      {/* ============================================================ */}

      <FlatList
        data={paginatedFavorite}
        keyExtractor={(item) => String(item.id ?? item.name)}
        renderItem={RenderItem}
        // Virtualization
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        // Reduce unnecessary work
        removeClippedSubviews={true}
        // Scroll behavior
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          paginatedFavorite.length === 0 && styles.emptyListContent,
        ]}
        // Pagination
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        // Components
        ListFooterComponent={RenderFooter}
        ListEmptyComponent={EmptyFavorites}
      />

      {/* ============================================================ */}
      {/* TOP FADE                                                      */}
      {/* ============================================================ */}

      <LinearGradient
        pointerEvents="none"
        colors={[colors.background, "rgba(8,0,3,0.78)", "rgba(8,0,3,0)"]}
        locations={[0, 0.45, 1]}
        style={styles.topFade}
      />
    </View>
  );
};

/* ================================================================== */
/* EMPTY STATE                                                        */
/* ================================================================== */

const EmptyFavorites = () => {
  return (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={["rgba(168,85,247,0.16)", "rgba(168,85,247,0.04)"]}
        style={styles.emptyIcon}
      >
        <Ionicons
          name="heart-outline"
          size={moderateScale(30)}
          color={colors.primary}
        />
      </LinearGradient>

      <Text style={styles.emptyTitle}>No favorites yet</Text>

      <Text style={styles.emptyDescription}>
        Songs you add to your favorites will appear here.
      </Text>
    </View>
  );
};

/* ================================================================== */
/* STYLES                                                             */
/* ================================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "transparent",

    position: "relative",
  },

  /* ================================================================ */
  /* HEADER                                                            */
  /* ================================================================ */

  header: {
    paddingHorizontal: moderateScale(16),

    paddingTop: moderateScale(14),

    paddingBottom: moderateScale(15),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  headerLeft: {
    flex: 1,

    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  title: {
    fontSize: moderateScale(26),

    lineHeight: moderateScale(31),

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
  },

  subtitle: {
    marginTop: moderateScale(3),

    fontSize: moderateScale(10.5),

    color: colors.textMuted,
  },

  /* ================================================================ */
  /* COUNT                                                             */
  /* ================================================================ */

  countCard: {
    width: moderateScale(58),

    height: moderateScale(58),

    marginLeft: moderateScale(12),

    borderRadius: moderateScale(17),

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: colors.surface,

    borderWidth: 1,

    borderColor: colors.border,
  },

  count: {
    fontSize: moderateScale(18),

    lineHeight: moderateScale(21),

    fontWeight: "800",

    color: colors.text,
  },

  countLabel: {
    marginTop: moderateScale(2),

    fontSize: moderateScale(8.5),

    fontWeight: "500",

    color: colors.textMuted,
  },

  /* ================================================================ */
  /* FILTER                                                            */
  /* ================================================================ */

  filterSection: {
    marginBottom: moderateScale(10),
  },

  filterHeader: {
    paddingHorizontal: moderateScale(16),

    marginBottom: moderateScale(9),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  filterTitleRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(6),
  },

  filterTitle: {
    fontSize: moderateScale(9),

    fontWeight: "800",

    letterSpacing: 1.1,

    color: colors.textMuted,
  },

  filterCount: {
    fontSize: moderateScale(8.5),

    fontWeight: "500",

    color: colors.textMuted,
  },

  filterContent: {
    paddingHorizontal: moderateScale(16),

    gap: moderateScale(16),
  },

  filterButton: {
    minHeight: moderateScale(38),

    maxWidth: moderateScale(150),

    paddingHorizontal: moderateScale(12),

    borderRadius: moderateScale(13),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: moderateScale(6),

    backgroundColor: colors.surface,

    borderWidth: 1,

    borderColor: colors.border,
  },

  filterButtonActive: {
    backgroundColor: colors.primary,

    borderColor: colors.primary,
  },

  filterPressed: {
    opacity: 0.72,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  filterText: {
    maxWidth: moderateScale(110),

    fontSize: moderateScale(11),

    fontWeight: "600",

    color: colors.textSecondary,
  },

  filterTextActive: {
    color: colors.text,
  },

  friendDot: {
    width: moderateScale(14),

    height: moderateScale(14),

    borderRadius: moderateScale(8),

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: colors.surfaceElevated,
  },

  friendDotActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  friendInitial: {
    fontSize: moderateScale(8),

    fontWeight: "800",

    color: colors.text,
  },

  /* ================================================================ */
  /* DIVIDER                                                           */
  /* ================================================================ */

  divider: {
    height: 1,

    marginHorizontal: moderateScale(16),

    marginBottom: moderateScale(5),

    backgroundColor: "rgba(255,255,255,0.045)",
  },

  /* ================================================================ */
  /* LIST                                                              */
  /* ================================================================ */

  listContent: {
    paddingTop: moderateScale(4),

    paddingHorizontal: moderateScale(5),

    paddingBottom: moderateScale(190),
  },

  songItem: {
    marginVertical: moderateScale(4),

    borderRadius: moderateScale(17),
  },

  songItemPressed: {
    opacity: 0.72,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  /* ================================================================ */
  /* EMPTY                                                             */
  /* ================================================================ */

  emptyListContent: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,

    minHeight: moderateScale(350),

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: moderateScale(45),
  },

  emptyIcon: {
    width: moderateScale(72),

    height: moderateScale(72),

    borderRadius: moderateScale(24),

    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.18)",
  },

  emptyTitle: {
    marginTop: moderateScale(16),

    fontSize: moderateScale(17),

    fontWeight: "800",

    color: colors.text,
  },

  emptyDescription: {
    maxWidth: moderateScale(260),

    marginTop: moderateScale(7),

    fontSize: moderateScale(11),

    lineHeight: moderateScale(17),

    textAlign: "center",

    color: colors.textMuted,
  },

  /* ================================================================ */
  /* TOP FADE                                                          */
  /* ================================================================ */

  topFade: {
    position: "absolute",

    top: 0,

    left: 0,

    right: 0,

    height: moderateScale(42),

    zIndex: 20,
  },
});

export default Favorite;
