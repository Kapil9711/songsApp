import { Container } from "@/components/container";
import Loading from "@/components/loading";
import NowPlayingBackground from "@/components/nowPlayingBackground";
import { SongSmallCard } from "@/components/songs/songSmalCard";
import { SafeSide } from "@/hooks/useInsetStyle";
import { useDownloadStore } from "@/store/donwload.store";
import { usePlayerStore } from "@/store/player.store";
import { useTheme } from "@/themes/theme.context";
import { convertSongListToPlayerList } from "@/utils/convertSongListToPlayerList";
import { downloadService } from "@/utils/download.service";
import { handleSongPlay } from "@/utils/handleSongPlay";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useResponsive } from "react-native-fluid-styles";

// Update this import if your DownloadService is located elsewhere.
// import {
//   downloadService,
//   type DownloadedSong,
// } from

export default function DownloadedSongsScreen() {
  const { Theme } = useTheme();
  const r = useResponsive();
  const styles = useStyles();

  const songs = useDownloadStore((state) => state.downloadedSongs);
  const setDownloadedSongs = useDownloadStore(
    (state) => state.setDownloadedSongs,
  );
  const isLoading = useDownloadStore((state) => state.isLoading);
  const setLoading = useDownloadStore((state) => state.setLoading);
  // const [songs, setSongs] = useState<DownloadedSong[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMediaId = usePlayerStore((state) => state.activeTrack?.mediaId);

  /**
   * Load downloaded songs from local storage.
   */
  const loadDownloadedSongs = useCallback(
    async (refresh = false) => {
      try {
        setError(null);

        if (refresh) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }

        const downloaded = await downloadService.getDownloadedSongs();

        setDownloadedSongs(downloaded);
      } catch (err) {
        console.error("Failed to load downloaded songs:", err);

        setError(
          "Couldn't load your downloaded songs. Pull down to try again.",
        );
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [setDownloadedSongs, setLoading],
  );

  /**
   * Reload whenever the screen becomes active.
   */
  useFocusEffect(
    useCallback(() => {
      void loadDownloadedSongs();
    }, [loadDownloadedSongs]),
  );

  /**
   * Adapt downloaded songs to the song structure used by the existing
   * SongSmallCard and player utilities.
   *
   * IMPORTANT:
   * Your player converter must preserve the localUri as the playback URL.
   * If it always selects a streaming URL, update the converter to support
   * local downloads explicitly.
   */

  const playableSongs = useMemo(
    () =>
      songs.map((song) => ({
        ...song,
        id: String(song.id),
        name: song.name ?? "Unknown song",

        // Adapt the local file to the URL structure expected by your app.
        downloadUrl: [
          { url: song.localUri, quality: "320kbps" },
          { url: song.localUri, quality: "320kbps" },
          { url: song.localUri, quality: "320kbps" },
          { url: song.localUri, quality: "320kbps" },
          {
            url: song.localUri,
            quality: "320kbps",
          },
        ],

        image: song.image,
      })),
    [songs],
  );

  const playerList = useMemo(
    () => convertSongListToPlayerList(playableSongs),
    [playableSongs],
  );

  /**
   * Render an individual downloaded song.
   */
  const renderSong = useCallback(
    ({
      item,
      index,
    }: {
      item: (typeof playableSongs)[number];
      index: number;
    }) => {
      const isActive = activeMediaId === item.id;

      return (
        <Pressable
          style={({ pressed }) => [
            styles.songItem,
            pressed && styles.songItemPressed,
          ]}
        >
          <SongSmallCard
            isShowButton={false}
            isActive={isActive}
            title={item.name ?? "Unknown song"}
            image={item.image?.[2]?.url}
            number={index + 1}
            song={item}
            onPress={() => handleSongPlay(index, playerList)}
          />
        </Pressable>
      );
    },
    [activeMediaId, playerList, playableSongs, styles],
  );

  /**
   * Screen header.
   */
  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Downloads</Text>

            <View style={styles.titleDot} />
          </View>

          <Text style={styles.subtitle}>Your music, available offline</Text>
        </View>

        <View style={styles.countCard}>
          <Text style={styles.count}>{songs.length}</Text>

          <Text style={styles.countLabel}>
            {songs.length === 1 ? "song" : "songs"}
          </Text>
        </View>
      </View>
    ),
    [songs.length, styles],
  );

  /**
   * Empty state and error state.
   */
  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="cloud-download-outline"
            size={r.ms(30)}
            color={Theme.colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          {error ? "Something went wrong" : "No downloads yet"}
        </Text>

        <Text style={styles.emptyText}>
          {error ??
            "Songs you download will appear here, ready to play offline."}
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => void loadDownloadedSongs(true)}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
        >
          <Ionicons
            name="refresh"
            size={r.ms(15)}
            color={Theme.colors.background}
          />

          <Text style={styles.retryText}>Refresh</Text>
        </Pressable>
      </View>
    );
  }, [
    Theme.colors.background,
    Theme.colors.primary,
    error,
    isLoading,
    loadDownloadedSongs,
    r,
    styles,
  ]);

  return (
    <Container
      style={{
        maxWidth: "100%",
        backgroundColor: Theme.colors.background,
      }}
      insetStyle={{
        ...SafeSide,
        bottom: false,
      }}
    >
      <NowPlayingBackground />

      <Loading loading={isLoading} />

      <View style={styles.container}>
        <FlatList
          data={playableSongs}
          keyExtractor={(item, index) =>
            String(item.id ?? item.localUri ?? index)
          }
          renderItem={renderSong}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadDownloadedSongs(true)}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
            />
          }
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews
          extraData={activeMediaId}
        />
      </View>
    </Container>
  );
}

/**
 * Screen styles.
 */
const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  const primary = Theme.colors.primary;
  const background = Theme.colors.background;
  const text = Theme.colors.text;
  const border = Theme.styles.Card.borderColor;
  const cardBackground = Theme.styles.Card.backgroundColor;

  return StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 0,
      backgroundColor: "transparent",
    },

    header: {
      paddingBottom: r.ms(12),
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

    listContent: {
      paddingTop: r.ms(10),
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

    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: r.ms(28),
      paddingTop: r.ms(60),
    },

    emptyIcon: {
      width: r.ms(66),
      height: r.ms(66),
      borderRadius: r.ms(22),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}15`,
      marginBottom: r.ms(16),
    },

    emptyTitle: {
      fontSize: r.ms(17),
      fontWeight: "800",
      color: text,
      textAlign: "center",
    },

    emptyText: {
      marginTop: r.ms(7),
      fontSize: r.ms(12),
      lineHeight: r.ms(18),
      color: text,
      opacity: 0.7,
      textAlign: "center",
    },

    retryButton: {
      marginTop: r.ms(16),
      paddingHorizontal: r.ms(16),
      minHeight: r.ms(38),
      borderRadius: r.ms(11),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(7),
      backgroundColor: primary,
    },

    retryButtonPressed: {
      opacity: 0.75,
    },

    retryText: {
      color: background,
      fontSize: r.ms(12),
      fontWeight: "700",
    },
  });
};
