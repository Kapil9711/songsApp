import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { useRouter } from "expo-router";

import SongBigCard from "../../common/song-card/SongBigCard";
import PlaylistCard from "./newSongCard";

import { useAudioContext } from "@/src/providers/AudioProvider";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { colors } from "@/src/constants/theme";
import { Text } from "@/src/providers/CustomText";

type VerticalListProps = {
  data: any[];
  type?: "song" | "album" | "playlist" | string;
};

const VerticalList = ({ data = [], type = "song" }: VerticalListProps) => {
  const { width } = useWindowDimensions();

  const { setCurrentSong, setCurrentSongList } = useAudioContext();

  const { handleSingleAlbumOrPlalist, setPage } = useGlobalContext();

  const router = useRouter();

  /*
   * Albums + Playlists
   * ------------------
   * One large card per row.
   *
   * Songs
   * -----
   * Two columns.
   */
  const isLargeCard = type === "album" || type === "playlist";

  const horizontalPadding = moderateScale(16);

  const columnGap = moderateScale(14);

  const columnCount = isLargeCard ? 2 : 2;

  const cardWidth = useMemo(() => {
    // if (isLargeCard) {
    //   return width - horizontalPadding * 2;
    // }

    return (width - horizontalPadding * 2 - columnGap) / 2;
  }, [width, horizontalPadding, columnGap, isLargeCard]);

  /* ================================================================ */
  /* HANDLE PRESS                                                      */
  /* ================================================================ */

  const handlePress = useCallback(
    (item: any) => {
      if (type === "song") {
        setCurrentSong(item);
        setCurrentSongList(data);
        return;
      }

      if (type === "album" || type === "playlist") {
        handleSingleAlbumOrPlalist(item.id, type);

        setPage(999);

        router.push("/(dashboard)/home/songs");
      }
    },
    [
      type,
      data,
      setCurrentSong,
      setCurrentSongList,
      handleSingleAlbumOrPlalist,
      setPage,
      router,
    ],
  );

  /* ================================================================ */
  /* EMPTY                                                             */
  /* ================================================================ */

  if (!data?.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name={
              type === "album"
                ? "albums-outline"
                : type === "playlist"
                  ? "list-outline"
                  : "musical-notes-outline"
            }
            size={moderateScale(27)}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>Nothing here yet</Text>

        <Text style={styles.emptyText}>
          Your{" "}
          {type === "album"
            ? "albums"
            : type === "playlist"
              ? "playlists"
              : "songs"}{" "}
          will appear here.
        </Text>
      </View>
    );
  }

  /* ================================================================ */
  /* LIST                                                              */
  /* ================================================================ */

  return (
    <FlatList
      data={data}
      numColumns={columnCount}
      keyExtractor={(item, index) => `${item?.id ?? item?.name}-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.listContent,
        {
          paddingHorizontal: horizontalPadding,
        },
      ]}
      columnWrapperStyle={
        !isLargeCard
          ? { ...styles.columnWrapper }
          : {
              ...styles.columnWrapper,
            }
      }
      renderItem={({ item, index }) => {
        const image =
          item?.image?.[2]?.url ||
          item?.image?.[1]?.url ||
          item?.image?.[0]?.url;

        return (
          <Pressable
            onPress={() => handlePress(item)}
            style={({ pressed }) => [
              styles.cardWrapper,
              {
                width: cardWidth,
              },
              pressed && styles.cardPressed,
            ]}
          >
            {/* ==================================================== */}
            {/* ALBUM + PLAYLIST                                      */}
            {/* ==================================================== */}

            {isLargeCard && (
              <View
                style={[
                  styles.songArtwork,
                  {
                    width: cardWidth,
                  },
                ]}
              >
                <PlaylistCard
                  image={image}
                  title={item?.name ?? ""}
                  index={index}
                  type={type === "album" ? "album" : "playlist"}
                />
              </View>
            )}

            {/* ==================================================== */}
            {/* SONG                                                   */}
            {/* ==================================================== */}

            {type === "song" && (
              <View
                style={[
                  styles.songArtwork,
                  {
                    width: cardWidth,
                  },
                ]}
              >
                <SongBigCard
                  type="song"
                  image={image}
                  title={item?.name ?? ""}
                />
              </View>
            )}
          </Pressable>
        );
      }}
      ListFooterComponent={<View style={styles.footerSpace} />}
    />
  );
};

const styles = StyleSheet.create({
  /* ================================================================ */
  /* LIST                                                              */
  /* ================================================================ */

  listContent: {
    paddingTop: moderateScale(8),

    paddingBottom: moderateScale(190),
  },

  columnWrapper: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: moderateScale(24),
  },

  /* ================================================================ */
  /* CARD                                                              */
  /* ================================================================ */

  cardWrapper: {
    minWidth: 0,

    maxWidth: "100%",

    flexShrink: 1,

    overflow: "hidden",

    borderRadius: moderateScale(20),

    marginBottom: moderateScale(24),
  },

  cardPressed: {
    opacity: 0.78,

    transform: [
      {
        scale: 0.975,
      },
    ],
  },

  /* ================================================================ */
  /* SONG                                                              */
  /* ================================================================ */

  songArtwork: {
    width: "100%",

    overflow: "hidden",

    borderRadius: moderateScale(18),
  },

  /* ================================================================ */
  /* EMPTY                                                             */
  /* ================================================================ */

  emptyContainer: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: moderateScale(35),

    paddingBottom: moderateScale(100),
  },

  emptyIcon: {
    width: moderateScale(72),

    height: moderateScale(72),

    borderRadius: moderateScale(24),

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(168,85,247,0.10)",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.20)",
  },

  emptyTitle: {
    marginTop: moderateScale(16),

    fontSize: moderateScale(16),

    fontWeight: "800",

    color: colors.text,
  },

  emptyText: {
    marginTop: moderateScale(5),

    fontSize: moderateScale(10.5),

    color: colors.textMuted,

    textAlign: "center",
  },

  footerSpace: {
    height: moderateScale(20),
  },
});

export default VerticalList;
