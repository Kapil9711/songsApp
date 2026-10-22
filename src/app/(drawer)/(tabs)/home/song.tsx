import { Container } from "@/components/container";
import { SongSmallCard } from "@/components/songs/songSmalCard";
import { SafeSide } from "@/hooks/useInsetStyle";
import { usePlayerStore } from "@/store/player.store";
import { useTheme } from "@/themes/theme.context";
import { convertSongListToPlayerList } from "@/utils/convertSongListToPlayerList";
import { handleSongPlay } from "@/utils/handleSongPlay";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, Platform, Pressable, Text, View } from "react-native";
import { useResponsive, useResponsiveStyles } from "react-native-fluid-styles";
import { useHomePageQuery } from ".";

const INITIAL_RENDER = 10;
const BATCH_SIZE = 8;
const WINDOW_SIZE = 5;

const keyExtractor = (item: any) => String(item.id);

const Song = () => {
  const { data } = useHomePageQuery();
  const { listType } = useLocalSearchParams<{ listType: string }>();
  const activeMediaId = usePlayerStore((state) => state.activeTrack?.mediaId);
  const { Theme } = useTheme();
  const styles = useStyles();
  const r = useResponsive();
  let staticSongList = [];
  switch (listType) {
    case "hindi":
      staticSongList = data?.hindi;
      break;
    case "haryanvi":
      staticSongList = data?.haryanvi;
      break;
    case "punjabi":
      staticSongList = data?.punjabi;
      break;
  }

  const songListForPlayer = useMemo(() => {
    return convertSongListToPlayerList(staticSongList);
  }, [staticSongList]);

  const RenderItem = useCallback(
    ({ item, index }: any) => {
      const isActive = activeMediaId === item.id;
      return (
        <SongSmallCard
          isActive={isActive}
          title={item.name}
          image={item?.image?.[2]?.url}
          number={index + 1}
          song={item}
          onPress={() => handleSongPlay(index, songListForPlayer)}
        />
      );
    },
    [songListForPlayer, activeMediaId],
  );

  return (
    <View style={[styles.container]}>
      <FlatList
        data={staticSongList}
        renderItem={RenderItem}
        keyExtractor={keyExtractor}
        // ListHeaderComponent={SongListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Virtualization
        initialNumToRender={INITIAL_RENDER}
        maxToRenderPerBatch={BATCH_SIZE}
        updateCellsBatchingPeriod={40}
        windowSize={WINDOW_SIZE}
        // Platform-specific optimization
        removeClippedSubviews={Platform.OS === "android"}
        // onEndReached={() => {
        //   if (hasMore) loadMore();
        // }}
        ListHeaderComponent={
          <Container
            style={{ maxWidth: "100%" }}
            insetStyle={{
              ...SafeSide,
              top: false,
              left: false,
              right: false,
              bottom: false,
            }}
          >
            {/* <Header /> */}

            <View style={styles.pageHeader}>
              <View>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>Songs</Text>

                  <View style={styles.titleDot} />
                </View>

                <Text style={styles.subtitle}>
                  {staticSongList?.length ?? 0} songs
                </Text>
              </View>

              <View style={styles.musicIcon}>
                <Ionicons
                  name="musical-notes"
                  size={r.ms(18)}
                  color={Theme.colors.primary}
                />
              </View>
            </View>

            <View style={styles.listHeader}>
              <View style={styles.listTitleContainer}>
                <Text style={styles.listTitle}>Your collection</Text>

                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {staticSongList?.length ?? 0}
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
                  size={r.ms(16)}
                  color={Theme.colors.text}
                />
              </Pressable>
            </View>
          </Container>
        }
        //   ListFooterComponent={() =>
        //     isLoadingSongListToRender ? (
        //       <View style={styles.footerLoader}>
        //         <View style={styles.loaderCircle}>
        //           <Spinner size="small" color={Theme.colorsprimary} />
        //         </View>

        //         <Text style={styles.loadingText}>Loading more</Text>
        //       </View>
        //     ) : (
        //       <View style={styles.footerSpace} />
        //     )
        //   }
      />

      <Stack.Screen
        options={{
          title: listType ? listType.toUpperCase() : "Song",
          headerShown: true,

          // Header background
          headerStyle: {
            backgroundColor: Theme.colors.primary,
          },

          // Title styling
          headerTitleStyle: {
            fontSize: r.ms(18),
            fontWeight: "700",
            color: Theme.colors.background,
          },

          // Back button and header icons
          headerTintColor: Theme.colors.background,

          // Remove bottom border/shadow
          headerShadowVisible: false,
        }}
      />

      {/* ============================================================ */}
      {/* TOP FADE                                                      */}
      {/* ============================================================ */}

      {/* <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(18,15,22,0.88)",
          "rgba(18,15,22,0.88)",
          "rgba(18,15,22,0)",
        ]}
        locations={[0, 0.45, 1]}
        style={styles.topFade}
      /> */}
    </View>
  );
};

const useStyles = () => {
  const { Theme } = useTheme();
  return useResponsiveStyles((r) => {
    return {
      container: {
        flex: 1,
        // backgroundColor: "black",
        position: "relative",
      },

      /* ================================================================ */
      /* PAGE HEADER                                                       */
      /* ================================================================ */

      pageHeader: {
        paddingHorizontal: r.ms(8),

        paddingTop: r.ms(14),

        paddingBottom: r.ms(13),

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",
      },

      titleRow: {
        flexDirection: "row",

        alignItems: "center",
      },

      title: {
        fontSize: r.ms(26),

        lineHeight: r.ms(30),

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

        shadowColor: Theme.colors.primary,

        shadowOpacity: 0.8,

        shadowRadius: 6,

        elevation: 4,
      },

      subtitle: {
        marginTop: r.ms(3),

        fontSize: r.ms(10.5),

        color: Theme.colors.text,
      },

      musicIcon: {
        width: r.ms(40),
        height: r.ms(40),

        borderRadius: r.ms(13),

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
        paddingHorizontal: r.ms(16),

        marginBottom: r.ms(6),

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",
      },

      listTitleContainer: {
        flexDirection: "row",

        alignItems: "center",

        gap: r.ms(7),
      },

      listTitle: {
        fontSize: r.ms(14),

        fontWeight: "700",

        color: Theme.colors.text,
      },

      countBadge: {
        minWidth: r.ms(23),

        height: r.ms(19),

        paddingHorizontal: r.ms(5),

        borderRadius: r.ms(7),

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "rgba(168,85,247,0.10)",

        borderWidth: 1,

        borderColor: "rgba(168,85,247,0.16)",
      },

      countText: {
        fontSize: r.ms(8.5),

        fontWeight: "700",

        color: Theme.colors.primary,
      },

      filterButton: {
        width: r.ms(32),
        height: r.ms(32),

        borderRadius: r.ms(10),

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
        paddingHorizontal: r.ms(6),

        paddingTop: r.ms(2),

        paddingBottom: r.ms(190),
      },

      /* ================================================================ */
      /* TOP FADE                                                          */
      /* ================================================================ */

      topFade: {
        position: "absolute",

        top: 0,
        left: 0,
        right: 0,

        height: r.ms(35),

        zIndex: 20,
      },

      /* ================================================================ */
      /* FOOTER                                                            */
      /* ================================================================ */

      footerLoader: {
        height: r.ms(75),

        alignItems: "center",
        justifyContent: "center",

        flexDirection: "row",

        gap: r.ms(8),
      },

      loaderCircle: {
        width: r.ms(28),
        height: r.ms(28),

        borderRadius: r.ms(14),

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "rgba(168,85,247,0.08)",
      },

      loadingText: {
        fontSize: r.ms(9.5),

        color: Theme.colors.text,
      },

      footerSpace: {
        height: r.ms(30),
      },

      /* ================================================================ */
      /* LOADING SCREEN                                                    */
      /* ================================================================ */

      loadingContainer: {
        flex: 1,

        backgroundColor: "transparent",

        alignItems: "center",
        paddingTop: r.ms(100),
        // justifyContent: "center",

        paddingBottom: r.ms(80),
      },

      loadingGlow: {
        width: r.ms(70),
        height: r.ms(70),

        borderRadius: r.ms(35),

        padding: 1,

        backgroundColor: "rgba(168,85,247,0.16)",

        borderWidth: 1,

        borderColor: "rgba(168,85,247,0.25)",
      },

      loadingGradient: {
        flex: 1,

        borderRadius: r.ms(34),

        alignItems: "center",
        justifyContent: "center",
      },

      loadingTitle: {
        marginTop: r.ms(16),

        fontSize: r.ms(15),

        fontWeight: "700",

        color: Theme.colors.text,
      },

      loadingSubtitle: {
        marginTop: r.ms(4),

        fontSize: r.ms(10.5),

        color: Theme.colors.text,
      },

      spinner: {
        marginTop: r.ms(12),
      },
    };
  });
};

export default Song;
