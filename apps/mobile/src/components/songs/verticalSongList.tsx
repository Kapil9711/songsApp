import { Container } from "@/components/container";
import { BackHeader } from "@/components/header/backHeader";
import { SongSmallCard } from "@/components/songs/songSmalCard";
import { SafeSide } from "@/hooks/useInsetStyle";
import { usePlayerStore } from "@/store/player.store";
import { useTheme } from "@/themes/theme.context";
import { convertSongListToPlayerList } from "@/utils/convertSongListToPlayerList";
import { handleSongPlay } from "@/utils/handleSongPlay";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useResponsive } from "react-native-fluid-styles";
import NowPlayingBackground from "@/components/nowPlayingBackground";
const INITIAL_RENDER = 10;
const BATCH_SIZE = 8;
const WINDOW_SIZE = 5;

const keyExtractor = (item: any) => String(item.id);

const VerticalSongList = ({
  listToRender,
  heading,
}: {
  listToRender: any[];
  heading: string;
}) => {
  const activeMediaId = usePlayerStore((state) => state.activeTrack?.mediaId);
  const { Theme } = useTheme();
  const styles = useStyles();
  const r = useResponsive();
  const songListForPlayer = useMemo(
    () => convertSongListToPlayerList(listToRender),
    [listToRender],
  );

  const RenderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <SongSmallCard
        isActive={activeMediaId === item.id}
        title={item.name}
        image={item?.image?.[2]?.url}
        number={index + 1}
        song={item}
        onPress={() => handleSongPlay(index, songListForPlayer)}
      />
    ),
    [activeMediaId, songListForPlayer],
  );

  const ListHeader = useMemo(
    () => (
      <View style={styles.listHeaderWrapper}>
        <View style={styles.pageHeader}>
          <View>
            <View style={styles.titleRow}>
              <Text style={[Theme.styles.H1, styles.title]}>Songs</Text>
              <View style={styles.titleDot} />
            </View>

            <Text style={[Theme.styles.text.muted, styles.subtitle]}>
              {listToRender.length} songs
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

        <View style={styles.collectionHeader}>
          <View style={styles.listTitleContainer}>
            <Text style={[Theme.styles.H5, styles.listTitle]}>
              Your collection
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>{listToRender.length}</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter songs"
            style={({ pressed }) => [
              Theme.styles.p2,
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
      </View>
    ),
    [Theme, styles, listToRender.length, r],
  );

  return (
    <Container
      style={styles.screen}
      insetStyle={{
        ...SafeSide,
        bottom: false,
      }}
    >
      <StatusBar
        barStyle={
          Theme.colors.background.toLowerCase() === "#ffffff" ||
          Theme.colors.background.toLowerCase() === "#f7f0e7"
            ? "dark-content"
            : "light-content"
        }
      />
      <NowPlayingBackground />

      <BackHeader title={heading || "Song"} />

      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={listToRender}
          renderItem={RenderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={INITIAL_RENDER}
          maxToRenderPerBatch={BATCH_SIZE}
          updateCellsBatchingPeriod={40}
          windowSize={WINDOW_SIZE}
          removeClippedSubviews={Platform.OS === "android"}
        />
      </View>
    </Container>
  );
};

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  return StyleSheet.create({
    screen: {
      flex: 1,
      maxWidth: "100%",
      backgroundColor: Theme.colors.background,
    },

    container: {
      flex: 1,
      // backgroundColor: Theme.colors.background,
    },

    list: {
      flex: 1,
      // backgroundColor: Theme.colors.background,
    },

    listContent: {
      paddingTop: r.ms(2),
      paddingBottom: r.ms(190),
      // backgroundColor: Theme.colors.background,
    },

    listHeaderWrapper: {
      width: "100%",
      // backgroundColor: Theme.colors.background,
    },

    pageHeader: {
      ...Theme.styles.px4,
      paddingTop: r.ms(14),
      paddingBottom: r.ms(13),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      // backgroundColor: Theme.colors.background,
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
    },

    subtitle: {
      marginTop: r.ms(3),
      fontSize: r.ms(10.5),
      color: Theme.colors.neutral400,
    },

    musicIcon: {
      width: r.ms(40),
      height: r.ms(40),
      borderRadius: r.ms(13),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Theme.colors.primary + "15",
      borderWidth: 1,
      borderColor: Theme.colors.primary + "30",
    },

    collectionHeader: {
      ...Theme.styles.px4,
      marginBottom: r.ms(6),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      // backgroundColor: Theme.colors.background,
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
      backgroundColor: Theme.colors.primary + "15",
      borderWidth: 1,
      borderColor: Theme.colors.primary + "30",
    },

    countText: {
      fontSize: r.ms(8.5),
      fontWeight: "700",
      color: Theme.colors.primary,
    },

    filterButton: {
      minWidth: r.ms(32),
      minHeight: r.ms(32),
      borderRadius: r.ms(10),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Theme.colors.primary + "15",
      borderWidth: 1,
      borderColor: Theme.colors.neutral200,
    },

    filterButtonPressed: {
      opacity: 0.6,
      transform: [{ scale: 0.96 }],
    },
  });
};

export default VerticalSongList;
