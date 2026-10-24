import { Container } from "@/components/container";
import NowPlayingBackground from "@/components/nowPlayingBackground";
import { SongSmallCard } from "@/components/songs/songSmalCard";
import { SafeSide } from "@/hooks/useInsetStyle";
import { useSongsSearchQuery } from "@/screens/search/api/api.queries";
import { usePlayerStore } from "@/store/player.store";
import { useTheme } from "@/themes/theme.context";
import { handleSongPlay } from "@/utils/handleSongPlay";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useResponsive } from "react-native-fluid-styles";

const CATEGORIES = ["Songs", "Albums", "Artists", "Playlists"];
const RECENT_SEARCHES = ["The Weeknd", "Chill music", "Dua Lipa"];
const TRENDING = ["Blinding Lights", "Levitating", "Chill Vibes"];

type SearchRow =
  | { type: "discovery"; id: string }
  | { type: "results-header"; id: string }
  | { type: "empty"; id: string }
  | { type: "song"; id: string; song: any };

export default function SearchScreen() {
  const { Theme } = useTheme();
  const styles = useStyles();
  const r = useResponsive();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("Songs");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const inputRef = useRef(null as any);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery === debouncedQuery) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);

    const timeout = setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
      setIsDebouncing(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, debouncedQuery]);

  const songsQuery = useMemo(
    () => ({
      limit: 10,
      query: debouncedQuery,
    }),
    [debouncedQuery],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSongsSearchQuery(songsQuery);

  const results = useMemo(() => data?.pages.flat() ?? [], [data]);
  const showResults = debouncedQuery.length > 0;

  const activeMediaId = usePlayerStore((state) => state.activeTrack?.mediaId);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const selectSearch = useCallback((value: string) => {
    setQuery(value);
    setDebouncedQuery(value.trim());
    setIsDebouncing(false);
    inputRef.current?.focus();
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setCategory("Songs");
    setIsDebouncing(false);
    inputRef.current?.focus();
  }, []);

  const rememberSearch = useCallback((name: string) => {
    setRecentSearches((previous) =>
      [name, ...previous.filter((value) => value !== name)].slice(0, 5),
    );
  }, []);

  const renderSong = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <SongSmallCard
        isActive={activeMediaId === item.id}
        title={item.name}
        image={item?.image?.[2]?.url}
        number={index + 1}
        song={item}
        onPress={() => {
          Keyboard.dismiss();
          rememberSearch(item.name);
          handleSongPlay(index, results, true);
        }}
      />
    ),
    [activeMediaId, rememberSearch, results],
  );

  const renderDiscovery = useCallback(
    () => (
      <View style={styles.discoveryContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>

          {recentSearches.length > 0 && (
            <Pressable onPress={() => setRecentSearches([])} hitSlop={8}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
        </View>

        {recentSearches.map((item) => (
          <Pressable
            key={item}
            onPress={() => selectSearch(item)}
            style={({ pressed }) => [
              styles.recentItem,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.recentIcon}>
              <Ionicons
                name="time-outline"
                size={r.ms(17)}
                color={Theme.colors.text}
              />
            </View>

            <Text numberOfLines={1} style={styles.recentText}>
              {item}
            </Text>

            <Ionicons
              name="arrow-back"
              size={r.ms(18)}
              color={Theme.colors.text}
            />
          </Pressable>
        ))}

        <View style={[styles.sectionHeader, styles.trendingHeader]}>
          <View style={styles.trendingTitleRow}>
            <Ionicons
              name="trending-up"
              size={r.ms(15)}
              color={Theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>TRENDING SEARCHES</Text>
          </View>
        </View>

        <View style={styles.trendingGrid}>
          {TRENDING.map((item, index) => (
            <Pressable
              key={item}
              onPress={() => selectSearch(item)}
              style={({ pressed }) => [
                styles.trendingCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.trendingNumber}>
                <Text style={styles.trendingNumberText}>0{index + 1}</Text>
              </View>

              <Text numberOfLines={2} style={styles.trendingText}>
                {item}
              </Text>

              <Ionicons
                name="open-outline"
                size={r.ms(16)}
                color={Theme.colors.primary}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.discoveryFooter}>
          <Ionicons
            name="musical-notes-outline"
            size={r.ms(16)}
            color={Theme.colors.primary}
          />
          <Text style={styles.footerText}>Your next favorite is waiting.</Text>
        </View>
      </View>
    ),
    [recentSearches, selectSearch, styles, r, Theme],
  );

  const renderResultsHeader = useCallback(
    () => (
      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsTitle}>
            {isDebouncing ? "Finding your sound..." : "Search results"}
          </Text>

          <Text style={styles.resultsSubtitle}>
            {isDebouncing
              ? "Updating results"
              : `${results.length} ${
                  results.length === 1 ? "match" : "matches"
                } found`}
          </Text>
        </View>

        {isDebouncing && (
          <ActivityIndicator color={Theme.colors.primary} size="small" />
        )}
      </View>
    ),
    [isDebouncing, results.length, styles, Theme],
  );

  const renderEmptyResults = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="search-outline"
            size={r.ms(30)}
            color={Theme.colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>No sounds found</Text>

        <Text style={styles.emptyDescription}>
          We couldn't find anything for "{debouncedQuery}". Try another song,
          artist, or album.
        </Text>

        <Pressable
          onPress={clearSearch}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.resetButtonText}>Explore music</Text>
        </Pressable>
      </View>
    ),
    [debouncedQuery, clearSearch, styles, r, Theme],
  );

  const rows = useMemo<SearchRow[]>(() => {
    if (!showResults) {
      return [{ type: "discovery", id: "discovery" }];
    }

    const searchRows: SearchRow[] = [
      { type: "results-header", id: "results-header" },
    ];

    if (results.length > 0) {
      searchRows.push(
        ...results.map((song: any) => ({
          type: "song" as const,
          id: String(song.id ?? song._id ?? song.name),
          song,
        })),
      );
    } else if (!isDebouncing && !isLoading) {
      searchRows.push({ type: "empty", id: "empty" });
    }

    return searchRows;
  }, [showResults, results, isDebouncing, isLoading]);

  const renderRow = useCallback(
    ({ item, index }: { item: SearchRow; index: number }) => {
      switch (item.type) {
        case "discovery":
          return renderDiscovery();

        case "results-header":
          return renderResultsHeader();

        case "empty":
          return renderEmptyResults();

        case "song": {
          const songIndex = rows
            .slice(1, index)
            .filter((row) => row.type === "song").length;

          return renderSong({
            item: item.song,
            index: songIndex,
          });
        }

        default:
          return null;
      }
    },
    [
      renderDiscovery,
      renderResultsHeader,
      renderEmptyResults,
      renderSong,
      rows,
    ],
  );

  const renderStickyHeader = useCallback(
    () => (
      <View style={styles.stickyArea}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={r.ms(21)}
            color={Theme.colors.primary}
          />

          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleSearch}
            placeholder="Songs, artists, albums..."
            placeholderTextColor={Theme.colors.neutral400}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor={Theme.colors.primary}
            style={styles.input}
            accessibilityLabel="Search music"
          />

          {isDebouncing ? (
            <ActivityIndicator size="small" color={Theme.colors.primary} />
          ) : query.length > 0 ? (
            <Pressable onPress={clearSearch} hitSlop={10}>
              <Ionicons
                name="close-circle"
                size={r.ms(20)}
                color={Theme.colors.neutral400}
              />
            </Pressable>
          ) : (
            <Ionicons
              name="options-outline"
              size={r.ms(20)}
              color={Theme.colors.text}
            />
          )}
        </View>

        <View style={styles.categorySection}>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const active = category === item;

              return (
                <Pressable
                  onPress={() => setCategory(item)}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    active && styles.categoryChipActive,
                    pressed && styles.categoryPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      active && styles.categoryTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    ),
    [
      styles,
      r,
      Theme,
      query,
      handleSearch,
      isDebouncing,
      clearSearch,
      category,
    ],
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
      <View style={styles.container}>
        <SectionList<SearchRow>
          sections={[{ key: "search", data: rows }]}
          keyExtractor={(item, index) => item.id + index}
          renderItem={renderRow}
          renderSectionHeader={renderStickyHeader}
          stickySectionHeadersEnabled
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headingRow}>
                <Text style={styles.heading}>Search</Text>
                <View style={styles.titleDot} />
              </View>

              <Text style={styles.headerSubtitle}>
                Find your next favorite sound.
              </Text>
            </View>
          }
          ListFooterComponent={
            showResults && isFetchingNextPage ? (
              <View style={styles.listFooter}>
                <ActivityIndicator color={Theme.colors.primary} />
              </View>
            ) : (
              (null as any)
            )
          }
          onScrollBeginDrag={Keyboard.dismiss}
          onEndReached={() => {
            if (showResults && hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={8}
          windowSize={7}
          removeClippedSubviews
          extraData={{
            activeMediaId,
            category,
            isDebouncing,
          }}
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

  // Theme-aware translucent accent surfaces.
  const primarySurface = `${primary}15`;
  const primaryBorder = `${primary}30`;

  return StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 0,
      backgroundColor: "transparent",
      paddingBottom: r.ms(4),
      paddingHorizontal: r.ms(6),
    },

    header: {
      paddingBottom: r.ms(8),
      flexShrink: 0,
    },

    headingRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    heading: {
      fontSize: r.ms(27),
      lineHeight: r.ms(33),
      fontWeight: "800",
      letterSpacing: -0.8,
      color: text,
    },

    titleDot: {
      width: r.ms(6),
      height: r.ms(6),
      borderRadius: r.ms(3),
      backgroundColor: primary,
      marginLeft: r.ms(5),
      marginTop: r.ms(12),
    },

    headerSubtitle: {
      marginTop: r.ms(4),
      fontSize: r.ms(11),
      color: text,
      opacity: 0.7,
    },

    stickyArea: {
      flexShrink: 0,
      zIndex: 10,
      // elevation: 1,
      backgroundColor: background,
      padding: r.ms(6),
      borderRadius: r.ms(8),
    },

    searchBar: {
      minHeight: r.ms(52),
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(11),
      paddingHorizontal: r.ms(15),
      borderRadius: r.ms(10),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },

    input: {
      flex: 1,
      minWidth: 0,
      paddingVertical: r.ms(12),
      fontSize: r.ms(12),
      color: text,
    },

    categorySection: {
      marginTop: r.ms(12),
      marginBottom: r.ms(8),
    },

    categoryList: {
      gap: r.ms(9),
    },

    categoryChip: {
      minHeight: r.ms(34),
      paddingHorizontal: r.ms(14),
      borderRadius: r.ms(10),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },

    categoryChipActive: {
      backgroundColor: primary,
      borderColor: primary,
    },

    categoryPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.97 }],
    },

    categoryText: {
      fontSize: r.ms(11),
      fontWeight: "600",
      color: text,
    },

    categoryTextActive: {
      color: background,
    },

    scrollContent: {
      paddingTop: r.ms(12),
      paddingBottom: r.ms(130),
      flexGrow: 1,
    },

    discoveryContent: {
      marginTop: r.ms(8),
      paddingBottom: r.ms(20),
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: r.ms(10),
    },

    sectionTitle: {
      fontSize: r.ms(10),
      fontWeight: "800",
      letterSpacing: 1.1,
      color: text,
    },

    clearText: {
      fontSize: r.ms(11),
      fontWeight: "600",
      color: primary,
    },

    recentItem: {
      minHeight: r.ms(45),
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(11),
      borderRadius: r.ms(10),
    },

    recentIcon: {
      width: r.ms(32),
      height: r.ms(32),
      borderRadius: r.ms(10),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: cardBackground,
    },

    recentText: {
      flex: 1,
      fontSize: r.ms(12),
      fontWeight: "500",
      color: text,
    },

    trendingHeader: {
      marginTop: r.ms(27),
      marginBottom: r.ms(13),
    },

    trendingTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(7),
    },

    trendingGrid: {
      gap: r.ms(9),
    },

    trendingCard: {
      minHeight: r.ms(60),
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(12),
      paddingHorizontal: r.ms(13),
      paddingVertical: r.ms(10),
      borderRadius: r.ms(13),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },

    trendingNumber: {
      width: r.ms(31),
      height: r.ms(31),
      borderRadius: r.ms(9),
      backgroundColor: primarySurface,
      alignItems: "center",
      justifyContent: "center",
    },

    trendingNumberText: {
      color: primary,
      fontSize: r.ms(10),
      fontWeight: "800",
    },

    trendingText: {
      flex: 1,
      fontSize: r.ms(12),
      fontWeight: "600",
      color: text,
    },

    discoveryFooter: {
      marginTop: r.ms(28),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(7),
      opacity: 0.8,
    },

    footerText: {
      fontSize: r.ms(10),
      color: text,
    },

    resultsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: r.ms(12),
    },

    resultsTitle: {
      fontSize: r.ms(15),
      fontWeight: "800",
      color: text,
    },

    resultsSubtitle: {
      marginTop: r.ms(3),
      fontSize: r.ms(10),
      color: text,
      opacity: 0.65,
    },

    listFooter: {
      paddingVertical: r.ms(16),
    },

    emptyState: {
      flex: 1,
      minHeight: r.ms(270),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: r.ms(20),
    },

    emptyIcon: {
      width: r.ms(68),
      height: r.ms(68),
      borderRadius: r.ms(23),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primarySurface,
      borderWidth: 1,
      borderColor: primaryBorder,
    },

    emptyTitle: {
      marginTop: r.ms(17),
      fontSize: r.ms(17),
      fontWeight: "800",
      color: text,
    },

    emptyDescription: {
      marginTop: r.ms(8),
      fontSize: r.ms(11),
      lineHeight: r.ms(17),
      textAlign: "center",
      color: text,
      opacity: 0.7,
    },

    resetButton: {
      marginTop: r.ms(19),
      paddingHorizontal: r.ms(17),
      paddingVertical: r.ms(10),
      borderRadius: r.ms(11),
      backgroundColor: primary,
    },

    resetButtonText: {
      fontSize: r.ms(11),
      fontWeight: "700",
      color: background,
    },

    pressed: {
      opacity: 0.72,
    },
  });
};
