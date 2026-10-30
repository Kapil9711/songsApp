import { Container } from "@/components/container";
import Loading from "@/components/loading";
import NowPlayingBackground from "@/components/nowPlayingBackground";
import { SongSmallCard } from "@/components/songs/songSmalCard";
import { api } from "@/config/network/api.config";
import { endpoints } from "@/config/network/endpoints";
import { SafeSide } from "@/hooks/useInsetStyle";
import { usePlayerStore } from "@/store/player.store";
import { useTheme } from "@/themes/theme.context";
import { convertSongListToPlayerList } from "@/utils/convertSongListToPlayerList";
import { handleSongPlay } from "@/utils/handleSongPlay";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useResponsive } from "react-native-fluid-styles";

export default function HomeScreen() {
  const { Theme } = useTheme();
  const r = useResponsive();
  const styles = useStyles();

  const [active, setActive] = useState("my");

  const { data: favoriteData, isLoading: isLoadingFavorite } =
    useFavoriteQuery();

  // const { data: friends, isLoading: isLoadingFriends } = useFriendQuery();

  const favorites = favoriteData?.favorite ?? [];
  const finalData = favorites;

  // const finalData = useMemo(() => {
  //   if (active === "my") {
  //     return favorites;
  //   }

  //   const friend = friends?.find((item: any) => item?.user?.name === active);

  //   return friend?.user?.favorite ?? [];
  // }, [active, favorites, friends]);

  const playerList = useMemo(
    () => convertSongListToPlayerList(finalData),
    [finalData],
  );

  const activeMediaId = usePlayerStore((state) => state.activeTrack?.mediaId);

  const renderSong = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const isActive = activeMediaId === item?.id;

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
            onPress={() => handleSongPlay(index, playerList)}
          />
        </Pressable>
      );
    },
    [activeMediaId, playerList, styles],
  );

  // const filterItems = useMemo(
  //   () => [
  //     { id: "my", name: "My Favorites", isMine: true },
  //     ...(friends ?? [])
  //       .filter((friend: any) => friend?.user?.name)
  //       .map((friend: any) => ({
  //         id: String(friend?._id ?? friend.user.name),
  //         name: friend.user.name,
  //         isMine: false,
  //       })),
  //   ],
  //   [friends],
  // );

  const renderStickyFilters = useCallback(
    () => (
      <View style={styles.stickyArea}>
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

            {/* <Text style={styles.filterCount}>/ */}
            {/* {friends?.length ?? 0} friends */}
            {/* </Text> */}
          </View>

          {/* <FlatList
            horizontal
            data={filterItems}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isActive = active === (item.isMine ? "my" : item.name);

              return (
                <Pressable
                  onPress={() => setActive(item.isMine ? "my" : item.name)}
                  style={({ pressed }) => [
                    styles.filterButton,
                    isActive && styles.filterButtonActive,
                    pressed && styles.filterPressed,
                  ]}
                >
                  {item.isMine ? (
                    <View style={styles.filterInnerRow}>
                      <Ionicons
                        name={isActive ? "heart" : "heart-outline"}
                        size={r.ms(14)}
                        color={
                          isActive ? Theme.colors.background : Theme.colors.text
                        }
                      />

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.filterText,
                          isActive && styles.filterTextActive,
                        ]}
                      >
                        My Favorites
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.filterInnerRow}>
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
                          {item.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.filterText,
                          isActive && styles.filterTextActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            }}
          /> */}
        </View>

        <View style={styles.divider} />
      </View>
    ),
    [active, styles, r, Theme],
  );

  const renderPageHeader = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Favorites</Text>
            <View style={styles.titleDot} />
          </View>

          <Text style={styles.subtitle}>Songs you never want to lose</Text>
        </View>

        <View style={styles.countCard}>
          <Text style={styles.count}>{favorites.length}</Text>
          <Text style={styles.countLabel}>songs</Text>
        </View>
      </View>
    ),
    [favorites.length, styles],
  );

  const sections = useMemo(
    () => [
      {
        key: "favorites",
        data: finalData,
      },
    ],
    [finalData],
  );

  return (
    <Container
      style={{
        maxWidth: "100%",
        backgroundColor: Theme.colors.background,
      }}
      insetStyle={{ ...SafeSide, bottom: false }}
    >
      <NowPlayingBackground />
      <Loading loading={isLoadingFavorite} />

      <View style={styles.container}>
        <SectionList
          sections={sections}
          keyExtractor={(item: any, index) =>
            String(item?.id ?? item?._id ?? item?.name ?? index)
          }
          renderItem={renderSong}
          renderSectionHeader={renderStickyFilters}
          stickySectionHeadersEnabled
          ListHeaderComponent={renderPageHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews
          onEndReachedThreshold={0.4}
          extraData={activeMediaId}
        />
      </View>
    </Container>
  );
}

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  const primary = Theme.colors.primary;
  const background = Theme.colors.background;
  const text = Theme.colors.text;
  const border = Theme.styles.Card.borderColor;
  const cardBackground = Theme.styles.Card.backgroundColor;

  // Theme-derived subtle surfaces.
  const primarySurface = `${primary}15`;
  const primaryBorder = `${primary}30`;
  const activeDotSurface = `${background}30`;

  return StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 0,
      backgroundColor: "transparent",
    },

    // Normal scrolling heading.
    header: {
      paddingBottom: r.ms(8),
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
      color: text,
    },

    titleDot: {
      width: r.ms(6),
      height: r.ms(6),
      borderRadius: r.ms(3),
      marginLeft: r.ms(5),
      marginTop: r.ms(12),
      backgroundColor: primary,
    },

    subtitle: {
      marginTop: r.ms(3),
      fontSize: r.ms(10.5),
      color: text,
      opacity: 0.7,
    },

    countCard: {
      width: r.ms(58),
      height: r.ms(58),
      marginLeft: r.ms(12),
      borderRadius: r.ms(17),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },

    count: {
      fontSize: r.ms(18),
      lineHeight: r.ms(21),
      fontWeight: "800",
      color: text,
    },

    countLabel: {
      marginTop: r.ms(2),
      fontSize: r.ms(8.5),
      fontWeight: "500",
      color: text,
      opacity: 0.75,
    },

    // Native sticky header: keep its background opaque.
    stickyArea: {
      backgroundColor: background,
      padding: r.ms(10),
      borderRadius: r.ms(10),
      zIndex: 20,
    },

    filterSection: {
      paddingTop: r.ms(3),
      paddingBottom: r.ms(10),
    },

    filterHeader: {
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
      color: text,
    },

    filterCount: {
      fontSize: r.ms(11.5),
      fontWeight: "500",
      color: text,
      opacity: 0.75,
    },

    filterContent: {
      gap: r.ms(8),
      paddingRight: r.ms(4),
    },

    filterButton: {
      minHeight: r.ms(36),
      maxWidth: r.ms(150),
      paddingHorizontal: r.ms(6),
      borderRadius: r.ms(8),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },

    filterButtonActive: {
      backgroundColor: primary,
      borderColor: primary,
    },

    filterPressed: {
      opacity: 0.72,
      transform: [{ scale: 0.96 }],
    },

    filterInnerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(6),
      padding: r.ms(6),
      borderRadius: r.ms(8),
    },

    filterText: {
      maxWidth: r.ms(110),
      fontSize: r.ms(11),
      fontWeight: "600",
      color: text,
    },

    filterTextActive: {
      color: background,
    },

    friendDot: {
      width: r.ms(14),
      height: r.ms(14),
      borderRadius: r.ms(8),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primarySurface,
    },

    friendDotActive: {
      backgroundColor: activeDotSurface,
    },

    friendInitial: {
      fontSize: r.ms(8),
      fontWeight: "800",
      color: text,
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      marginHorizontal: r.ms(0),
      marginBottom: r.ms(5),
      backgroundColor: border,
    },

    listContent: {
      paddingTop: r.ms(4),
      paddingHorizontal: r.ms(5),
      paddingBottom: r.ms(130),
      flexGrow: 1,
    },

    songItem: {
      borderRadius: r.ms(17),
    },

    songItemPressed: {
      opacity: 0.72,
      transform: [{ scale: 0.985 }],
    },
  });
};

export const useFavoriteQuery = () => {
  return useQuery({
    queryKey: ["favorite"],
    queryFn: async () => {
      const { data } = await api.get(endpoints.api.favorite, {
        params: { page: 1, pageSize: 100 },
      });

      if (!data?.success || !Array.isArray(data.data)) {
        return { favorite: [], songListForPlayer: [] };
      }

      const formatedFavorite = data?.data?.map((item: any) => {
        return { ...item, id: item?.songId, artists: item?.artist };
      });

      const songListForPlayer: any[] =
        convertSongListToPlayerList(formatedFavorite);

      const favoriteIdMap: any = {};
      formatedFavorite?.forEach((item: any) => {
        favoriteIdMap[item.id] = true;
      });

      return {
        favorite: formatedFavorite,
        songListForPlayer,
        favoriteIdMap,
      };
    },
  });
};

export const useAddFavoriteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["addFavorite"],

    mutationFn: async (payload: {
      name: string;
      songId: string;
      downloadUrl: any[];
      image: any[];
      artist: any;
    }) => {
      const { data } = await api.post(endpoints.api.favorite, payload);

      return data;
    },

    onMutate: async (newFavorite) => {
      await queryClient.cancelQueries({
        queryKey: ["favorite"],
      });

      const previousFavorites = queryClient.getQueryData<
        Awaited<ReturnType<typeof useFavoriteQuery>>
      >(["favorite"]);

      queryClient.setQueryData(["favorite"], (old: any) => {
        if (!old) return old;

        const favorites = old.favorite;

        if (!Array.isArray(favorites)) {
          return old;
        }

        const alreadyExists = favorites.some(
          (item: any) => item.songId === newFavorite.songId,
        );

        let updatedFavorites: any[];

        if (alreadyExists) {
          // Remove the existing favorite.
          updatedFavorites = favorites.filter(
            (item: any) => item.songId !== newFavorite.songId,
          );
        } else {
          // Add the new favorite.
          updatedFavorites = [...favorites, newFavorite];
        }

        // Rebuild the player list and ID map.
        const songListForPlayer = convertSongListToPlayerList(updatedFavorites);

        const favoriteIdMap = updatedFavorites.reduce(
          (map: Record<string, boolean>, item: any) => {
            map[item.songId] = true;
            return map;
          },
          {},
        );

        return {
          ...old,
          favorite: updatedFavorites,
          songListForPlayer,
          favoriteIdMap,
        };
      });

      return { previousFavorites };
    },

    onError: (_error, _newFavorite, context) => {
      if (context?.previousFavorites !== undefined) {
        queryClient.setQueryData(["favorite"], context.previousFavorites);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["favorite"],
      });
    },
  });
};

export const useFriendQuery = () => {
  return useQuery({
    queryKey: ["friend"],
    queryFn: async () => {
      const { data } = await api.get(endpoints.api.friend);

      if (data.success) {
        return (
          data.friends?.filter(
            (item: any) =>
              item?.user?.isFavouritePublic && item?.user?.favorite?.length,
          ) ?? []
        );
      }

      return [];
    },
  });
};
