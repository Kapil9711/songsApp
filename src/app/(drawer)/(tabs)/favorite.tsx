import { Container } from "@/components/container";
import Loading from "@/components/loading";
import { SongSmallCard } from "@/components/songs/songSmalCard";
import { api } from "@/config/network/api.config";
import { endpoints } from "@/config/network/endpoints";
import { usePlayerStore } from "@/store/player.store";
import { useTheme } from "@/themes/theme.context";
import { convertSongListToPlayerList } from "@/utils/convertSongListToPlayerList";
import { handleSongPlay } from "@/utils/handleSongPlay";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useResponsive, useResponsiveStyles } from "react-native-fluid-styles";

export default function HomeScreen() {
  const { Theme } = useTheme();
  const [active, setActive] = useState("my");
  const r = useResponsive();
  const styles = useStyles();

  const { data: favoriteData, isLoading: isLoadingFavorite } =
    useFavoriteQuery();
  const { data: friends, isLoading: isLoadingFriends } = useFriendQuery();

  const activeMediaId = usePlayerStore((state) => state.activeTrack?.mediaId);

  const RenderItem = useCallback(
    ({ item, index }: any) => {
      const isActive = activeMediaId == item?.id;

      return (
        <Pressable
          style={({ pressed }) => [
            styles.songItem,
            pressed && styles.songItemPressed,
          ]}
        >
          <SongSmallCard
            isActive={isActive}
            title={item?.name ?? ""}
            image={item?.image?.[2]?.url}
            number={index + 1}
            song={item}
            onPress={() =>
              handleSongPlay(index, favoriteData?.songListForPlayer)
            }
          />
        </Pressable>
      );
    },
    [activeMediaId, favoriteData?.songListForPlayer],
  );

  return (
    <Container style={{ maxWidth: "100%" }}>
      <Loading loading={isLoadingFavorite || isLoadingFriends} />

      <View style={[styles.container]}>
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
            <Text style={styles.count}>{favoriteData?.favorite?.length}</Text>

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
                size={r.ms(13)}
                color={Theme.colors.primary}
              />

              <Text style={styles.filterTitle}>FAVORITES FROM</Text>
            </View>

            <Text style={styles.filterCount}>
              {friends?.length ?? 0} friends
            </Text>
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
                  gap: r.ms(2),
                  padding: r.ms(6),
                  // backgroundColor: Theme.colors.background,
                  borderRadius: 8,
                  // borderWidth: 1,
                  // borderColor: Theme.colors.text,
                }}
              >
                <Ionicons
                  name={active === "my" ? "heart" : "heart-outline"}
                  size={r.ms(14)}
                  color={
                    active === "my"
                      ? Theme.colors.background
                      : Theme.colors.text
                  }
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
                      gap: r.ms(6),
                      alignItems: "center",
                      padding: r.ms(6),
                      // backgroundColor: Theme.colors.background,
                      borderRadius: 8,
                      // borderWidth: 1,
                      // borderColor: Theme.colors.text,
                    }}
                  >
                    <View
                      style={[
                        styles.friendDot,
                        isActive && styles.friendDotActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.friendInitial,
                          isActive && styles.filterTextActive,
                        ]}
                      >
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
          data={favoriteData?.favorite}
          keyExtractor={(item: any) => String(item.id ?? item.name)}
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
            // paginatedFavorite.length === 0 && styles.emptyListContent,
          ]}
          // Pagination
          // onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          // Components
          // ListFooterComponent={RenderFooter}
          // ListEmptyComponent={EmptyFavorites}
        />
      </View>
    </Container>
  );
}

const useStyles = () => {
  const { Theme } = useTheme();
  return useResponsiveStyles((r) => {
    return {
      container: {
        flex: 1,

        backgroundColor: "transparent",

        position: "relative",
      },

      /* ================================================================ */
      /* HEADER                                                            */
      /* ================================================================ */

      header: {
        paddingHorizontal: r.ms(16),

        paddingTop: r.ms(14),

        paddingBottom: r.ms(15),

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
        fontSize: r.ms(26),

        lineHeight: r.ms(31),

        fontWeight: "800",

        letterSpacing: -0.8,

        color: Theme.colors.text,
      },

      titleDot: {
        width: r.ms(6),

        height: r.ms(6),

        borderRadius: r.ms(3),

        marginLeft: r.ms(5),

        marginTop: r.ms(12),

        backgroundColor: Theme.colors.primary,
      },

      subtitle: {
        marginTop: r.ms(3),

        fontSize: r.ms(10.5),

        color: Theme.colors.text,
      },

      /* ================================================================ */
      /* COUNT                                                             */
      /* ================================================================ */

      countCard: {
        width: r.ms(58),

        height: r.ms(58),

        marginLeft: r.ms(12),

        borderRadius: r.ms(17),

        alignItems: "center",

        justifyContent: "center",

        backgroundColor: Theme.colors.background,

        borderWidth: 1,

        borderColor: Theme.colors.text,
      },

      count: {
        fontSize: r.ms(18),

        lineHeight: r.ms(21),

        fontWeight: "800",

        color: Theme.colors.text,
      },

      countLabel: {
        marginTop: r.ms(2),

        fontSize: r.ms(8.5),

        fontWeight: "500",

        color: Theme.colors.text,
      },

      /* ================================================================ */
      /* FILTER                                                            */
      /* ================================================================ */

      filterSection: {
        marginBottom: r.ms(10),
      },

      filterHeader: {
        paddingHorizontal: r.ms(16),

        marginBottom: r.ms(9),

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",
      },

      filterTitleRow: {
        flexDirection: "row",

        alignItems: "center",

        gap: r.ms(6),
      },

      filterTitle: {
        fontSize: r.ms(12),

        fontWeight: "800",

        letterSpacing: 1.1,

        color: Theme.colors.text,
      },

      filterCount: {
        fontSize: r.ms(11.5),

        fontWeight: "500",

        color: Theme.colors.text,
      },

      filterContent: {
        paddingHorizontal: r.ms(16),

        gap: r.ms(16),
      },

      filterButton: {
        minHeight: r.ms(36),

        maxWidth: r.ms(150),

        paddingHorizontal: r.ms(6),

        borderRadius: r.ms(8),

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "center",

        gap: r.ms(6),

        backgroundColor: Theme.colors.background,

        borderWidth: 1,

        borderColor: Theme.colors.text,
      },

      filterButtonActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
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
        maxWidth: r.ms(110),

        fontSize: r.ms(11),

        fontWeight: "600",

        color: Theme.colors.text,
      },

      filterTextActive: {
        color: Theme.colors.background,
      },

      friendDot: {
        width: r.ms(14),

        height: r.ms(14),

        borderRadius: r.ms(8),

        alignItems: "center",

        justifyContent: "center",

        backgroundColor: Theme.colors.background,
      },

      friendDotActive: {
        backgroundColor: "rgba(255,255,255,0.18)",
      },

      friendInitial: {
        fontSize: r.ms(8),

        fontWeight: "800",

        color: Theme.colors.text,
      },

      /* ================================================================ */
      /* DIVIDER                                                           */
      /* ================================================================ */

      divider: {
        height: 1,

        marginHorizontal: r.ms(16),

        marginBottom: r.ms(5),

        backgroundColor: "rgba(255,255,255,0.045)",
      },

      /* ================================================================ */
      /* LIST                                                              */
      /* ================================================================ */

      listContent: {
        paddingTop: r.ms(4),

        paddingHorizontal: r.ms(5),

        paddingBottom: r.ms(190),
      },

      songItem: {
        marginVertical: r.ms(4),

        borderRadius: r.ms(17),
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

        minHeight: r.ms(350),

        alignItems: "center",

        justifyContent: "center",

        paddingHorizontal: r.ms(45),
      },

      emptyIcon: {
        width: r.ms(72),

        height: r.ms(72),

        borderRadius: r.ms(24),

        alignItems: "center",

        justifyContent: "center",

        overflow: "hidden",

        borderWidth: 1,

        borderColor: "rgba(168,85,247,0.18)",
      },

      emptyTitle: {
        marginTop: r.ms(16),

        fontSize: r.ms(17),

        fontWeight: "800",

        color: Theme.colors.text,
      },

      emptyDescription: {
        maxWidth: r.ms(260),

        marginTop: r.ms(7),

        fontSize: r.ms(11),

        lineHeight: r.ms(17),

        textAlign: "center",

        color: Theme.colors.text,
      },

      /* ================================================================ */
      /* TOP FADE                                                          */
      /* ================================================================ */

      topFade: {
        position: "absolute",

        top: 0,

        left: 0,

        right: 0,

        height: r.ms(42),

        zIndex: 20,
      },
    };
  });
};

export const useFavoriteQuery = () => {
  return useQuery({
    queryKey: ["favorite"],
    queryFn: async () => {
      const { data } = await api.get(endpoints.api.favorite);
      if (!data?.success || !Array.isArray(data.favorite)) {
        return { favorite: [], songListForPlayer: [] };
      }
      // const favorite = data?.favorite?.map((item: any) => {
      //   return { ...item, id: item?._id };
      // });
      const songListForPlayer: any = convertSongListToPlayerList(
        data?.favorite,
      );
      return {
        favorite: data?.favorite,
        songListForPlayer,
      };
    },
    staleTime: 0,
  });
};

export const useFriendQuery = () => {
  return useQuery({
    queryKey: ["friend"],
    queryFn: async () => {
      const { data } = await api.get(endpoints.api.friend);
      if (data.success) return data.friends;
      return [];
    },
  });
};
