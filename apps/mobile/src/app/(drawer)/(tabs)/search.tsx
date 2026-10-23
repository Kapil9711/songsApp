import { Container } from "@/components/container";
import { SongSmallCard } from "@/components/songs/songSmalCard";
import { useSongsSearchQuery } from "@/screens/search/api/api.queries";
import { usePlayerStore } from "@/store/player.store";
import { useTheme } from "@/themes/theme.context";
import { handleSongPlay } from "@/utils/handleSongPlay";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  moderateScale,
  useResponsive,
  useResponsiveStyles,
} from "react-native-fluid-styles";

type MediaType = "Song" | "Album" | "Artist" | "Playlist";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  type: MediaType;
  image: string;
};

const SEARCH_DATA: SearchItem[] = [
  {
    id: "1",
    title: "Blinding Lights",
    subtitle: "The Weeknd",
    type: "Song",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
  },
  {
    id: "2",
    title: "Starboy",
    subtitle: "The Weeknd, Daft Punk",
    type: "Song",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300",
  },
  {
    id: "3",
    title: "After Hours",
    subtitle: "The Weeknd",
    type: "Album",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
  },
  {
    id: "4",
    title: "Save Your Tears",
    subtitle: "The Weeknd",
    type: "Song",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300",
  },
  {
    id: "5",
    title: "Future Nostalgia",
    subtitle: "Dua Lipa",
    type: "Album",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
  },
  {
    id: "6",
    title: "Levitating",
    subtitle: "Dua Lipa",
    type: "Song",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300",
  },
  {
    id: "7",
    title: "Dua Lipa",
    subtitle: "Artist",
    type: "Artist",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=300",
  },
  {
    id: "8",
    title: "Chill Vibes",
    subtitle: "Playlist · 32 songs",
    type: "Playlist",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
  },
  {
    id: "9",
    title: "Shape of You",
    subtitle: "Ed Sheeran",
    type: "Song",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300",
  },
];

const CATEGORIES = ["All", "Songs", "Albums", "Artists", "Playlists"];

const RECENT_SEARCHES = ["The Weeknd", "Chill music", "Dua Lipa"];

const TRENDING = ["Blinding Lights", "Levitating", "Chill Vibes"];

function SearchResultCard({
  item,
  index,
  onPress,
}: {
  item: SearchItem;
  index: number;
  onPress: (item: SearchItem) => void;
}) {
  const styles = useStyles();
  const { Theme } = useTheme();
  const r = useResponsive();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 240,
        delay: Math.min(index * 35, 210),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 240,
        delay: Math.min(index * 35, 210),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [index, opacity, translateY]);

  const iconName =
    item.type === "Album"
      ? "disc-outline"
      : item.type === "Artist"
        ? "person-outline"
        : item.type === "Playlist"
          ? "list-outline"
          : "musical-note";

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      <Pressable
        onPress={() => onPress(item)}
        style={({ pressed }) => [
          styles.resultCard,
          pressed && styles.resultPressed,
        ]}
      >
        <Image source={{ uri: item.image }} style={styles.artwork} />

        <View style={styles.resultInfo}>
          <Text numberOfLines={1} style={styles.resultTitle}>
            {item.title}
          </Text>

          <View style={styles.resultSubtitleRow}>
            <Ionicons
              name={iconName as any}
              size={r.ms(12)}
              color={Theme.colors.primary}
            />

            <Text numberOfLines={1} style={styles.resultSubtitle}>
              {item.type} · {item.subtitle}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => onPress(item)}
          hitSlop={8}
          style={styles.resultAction}
        >
          <Ionicons name="play" size={r.ms(17)} color={Theme.colors.primary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export default function SearchScreen() {
  const { Theme } = useTheme();
  const styles = useStyles();
  const r = useResponsive();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [songsPage, setSongsPage] = useState(1);
  const inputRef = useRef<TextInput>(null);
  // Debounce search input by 350ms.
  useEffect(() => {
    if (query.trim() === debouncedQuery) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);

    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setIsDebouncing(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, debouncedQuery]);

  const loadMoreSongs = () => {
    setSongsPage((page) => page + 1);
  };

  const songsQuery = useMemo(() => {
    return { limit: 10, query: debouncedQuery };
  }, [debouncedQuery]);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSongsSearchQuery(songsQuery);

  const results = useMemo(() => {
    return data?.pages.flat() ?? [];
  }, [data]);

  console.log(data, "searchSong");

  // const results = useMemo(() => {
  //   if (!debouncedQuery) return [];

  //   const normalizedQuery = debouncedQuery.toLowerCase();

  //   return SEARCH_DATA.filter((item) => {
  //     const matchesQuery =
  //       item.title.toLowerCase().includes(normalizedQuery) ||
  //       item.subtitle.toLowerCase().includes(normalizedQuery) ||
  //       item.type.toLowerCase().includes(normalizedQuery);

  //     const matchesCategory =
  //       category === "All" ||
  //       item.type === category.slice(0, -1) ||
  //       (category === "Songs" && item.type === "Song");

  //     return matchesQuery && matchesCategory;
  //   });
  // }, [debouncedQuery, category]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const selectSearch = useCallback((value: string) => {
    setQuery(value);
    setDebouncedQuery(value.trim());
    setIsDebouncing(false);
    (inputRef.current as any)?.focus?.();
  }, []);

  const activeMediaId = usePlayerStore((state) => state.activeTrack?.mediaId);

  const handleResultPress = useCallback((item: SearchItem) => {
    Keyboard.dismiss();

    setRecentSearches((previous) =>
      [item.title, ...previous.filter((value) => value !== item.title)].slice(
        0,
        5,
      ),
    );

    // TODO: Navigate to the media screen or play the song.
    console.log("Selected:", item);
  }, []);

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
          onPress={() => handleSongPlay(index, results, true)}
        />
      );
    },
    [results, activeMediaId],
  );

  const showResults = debouncedQuery.length > 0;

  return (
    <Container style={{ maxWidth: "100%" }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headingRow}>
            <Text style={styles.heading}>Search</Text>
            <View style={styles.titleDot} />
          </View>

          <Text style={styles.headerSubtitle}>
            Find your next favorite sound.
          </Text>
        </View>

        {/* Search input */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={r.ms(21)}
              color={Theme.colors.primary}
            />

            <TextInput
              ref={inputRef as any}
              value={query}
              onChangeText={handleSearch}
              placeholder="Songs, artists, albums..."
              placeholderTextColor="#858995"
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
              <Pressable
                onPress={() => {
                  setQuery("");
                  setDebouncedQuery("");
                  setCategory("All");
                  (inputRef?.current as any)?.focus?.();
                }}
                hitSlop={10}
              >
                <Ionicons name="close-circle" size={r.ms(20)} color="#858995" />
              </Pressable>
            ) : (
              <Ionicons
                name="options-outline"
                size={r.ms(20)}
                color={Theme.colors.text}
              />
            )}
          </View>
        </View>

        {/* Category filters */}
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

        {/* Search content */}
        {!showResults ? (
          <FlatList
            data={[]}
            renderItem={null as any}
            keyExtractor={(item: any) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.discoveryContent}
            ListHeaderComponent={
              <View>
                {/* Recent searches */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>

                  {recentSearches.length > 0 && (
                    <Pressable
                      onPress={() => setRecentSearches([])}
                      hitSlop={8}
                    >
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
                      pressed && styles.resultPressed,
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
                      size={20}
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
                        pressed && styles.resultPressed,
                      ]}
                    >
                      <View style={styles.trendingNumber}>
                        <Text style={styles.trendingNumberText}>
                          0{index + 1}
                        </Text>
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
                  <Text style={styles.footerText}>
                    Your next favorite is waiting.
                  </Text>
                </View>
              </View>
            }
          />
        ) : (
          <View style={styles.resultsContainer}>
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

            {results?.length > 0 ? (
              <FlatList
                data={results}
                keyExtractor={(item, index) => item.id + index}
                renderItem={RenderItem}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsList}
                initialNumToRender={8}
                windowSize={7}
                removeClippedSubviews
                onEndReached={() => {
                  // console.log("END REACHED");
                  // console.log("hasNextPage:", hasNextPage);
                  // console.log("isFetchingNextPage:", isFetchingNextPage);

                  if (hasNextPage && !isFetchingNextPage) {
                    // console.log("FETCHING NEXT PAGE");
                    fetchNextPage();
                  }
                }}
                ListFooterComponent={() => {
                  return (
                    <View style={{ marginTop: moderateScale(10) }}>
                      <ActivityIndicator
                        size={"large"}
                        color={Theme.colors.primary}
                      />
                    </View>
                  );
                }}
              />
            ) : (
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
                  We couldn't find anything for "{debouncedQuery}". Try another
                  song, artist, or album.
                </Text>

                <Pressable
                  onPress={() => {
                    setQuery("");
                    setDebouncedQuery("");
                    setCategory("All");
                  }}
                  style={styles.resetButton}
                >
                  <Text style={styles.resetButtonText}>Explore music</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    </Container>
  );
}

const useStyles = () => {
  const { Theme } = useTheme();

  return useResponsiveStyles((r) => ({
    container: {
      flex: 1,
      backgroundColor: "transparent",
      paddingBottom: r.ms(4),
    },

    header: {
      paddingHorizontal: r.ms(16),
      paddingTop: r.ms(14),
      paddingBottom: r.ms(18),
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
      color: Theme.colors.text,
    },

    titleDot: {
      width: r.ms(6),
      height: r.ms(6),
      borderRadius: r.ms(3),
      backgroundColor: Theme.colors.primary,
      marginLeft: r.ms(5),
      marginTop: r.ms(12),
    },

    headerSubtitle: {
      marginTop: r.ms(4),
      fontSize: r.ms(11),
      color: Theme.colors.text,
      opacity: 0.7,
    },

    searchWrapper: {
      paddingHorizontal: r.ms(16),
    },

    searchBar: {
      minHeight: r.ms(52),
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(11),
      paddingHorizontal: r.ms(15),
      borderRadius: r.ms(15),
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: "rgba(197,255,74,0.28)",
    },

    input: {
      flex: 1,
      minWidth: 0,
      paddingVertical: r.ms(12),
      fontSize: r.ms(12),
      color: Theme.colors.text,
    },

    categorySection: {
      marginTop: r.ms(18),
      marginBottom: r.ms(18),
    },

    categoryList: {
      paddingHorizontal: r.ms(16),
      gap: r.ms(9),
    },

    categoryChip: {
      minHeight: r.ms(34),
      paddingHorizontal: r.ms(14),
      borderRadius: r.ms(10),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },

    categoryChipActive: {
      backgroundColor: Theme.colors.primary,
      borderColor: Theme.colors.primary,
    },

    categoryPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.97 }],
    },

    categoryText: {
      fontSize: r.ms(11),
      fontWeight: "600",
      color: Theme.colors.text,
    },

    categoryTextActive: {
      color: Theme.colors.background,
    },

    discoveryContent: {
      paddingHorizontal: r.ms(16),
      paddingBottom: r.ms(130),
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
      color: Theme.colors.text,
    },

    clearText: {
      fontSize: r.ms(11),
      fontWeight: "600",
      color: Theme.colors.primary,
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
      backgroundColor: Theme.colors.background,
    },

    recentText: {
      flex: 1,
      fontSize: r.ms(12),
      fontWeight: "500",
      color: Theme.colors.text,
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
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },

    trendingNumber: {
      width: r.ms(31),
      height: r.ms(31),
      borderRadius: r.ms(9),
      backgroundColor: "rgba(197,255,74,0.09)",
      alignItems: "center",
      justifyContent: "center",
    },

    trendingNumberText: {
      color: Theme.colors.primary,
      fontSize: r.ms(10),
      fontWeight: "800",
    },

    trendingText: {
      flex: 1,
      fontSize: r.ms(12),
      fontWeight: "600",
      color: Theme.colors.text,
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
      color: Theme.colors.text,
    },

    resultsContainer: {
      flex: 1,
      paddingHorizontal: r.ms(16),
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
      color: Theme.colors.text,
    },

    resultsSubtitle: {
      marginTop: r.ms(3),
      fontSize: r.ms(10),
      color: Theme.colors.text,
      opacity: 0.65,
    },

    resultsList: {
      paddingBottom: r.ms(130),
      gap: r.ms(8),
    },

    resultCard: {
      minHeight: r.ms(70),
      flexDirection: "row",
      alignItems: "center",
      padding: r.ms(8),
      gap: r.ms(11),
      borderRadius: r.ms(14),
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.055)",
    },

    resultPressed: {
      opacity: 0.72,
      transform: [{ scale: 0.985 }],
    },

    artwork: {
      width: r.ms(52),
      height: r.ms(52),
      borderRadius: r.ms(10),
      backgroundColor: Theme.colors.background,
    },

    resultInfo: {
      flex: 1,
      minWidth: 0,
      gap: r.ms(6),
    },

    resultTitle: {
      fontSize: r.ms(12),
      fontWeight: "700",
      color: Theme.colors.text,
    },

    resultSubtitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(5),
    },

    resultSubtitle: {
      flex: 1,
      fontSize: r.ms(10),
      color: Theme.colors.text,
      opacity: 0.7,
    },

    resultAction: {
      width: r.ms(35),
      height: r.ms(35),
      borderRadius: r.ms(12),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(197,255,74,0.09)",
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
      backgroundColor: "rgba(197,255,74,0.08)",
      borderWidth: 1,
      borderColor: "rgba(197,255,74,0.18)",
    },

    emptyTitle: {
      marginTop: r.ms(17),
      fontSize: r.ms(17),
      fontWeight: "800",
      color: Theme.colors.text,
    },

    emptyDescription: {
      marginTop: r.ms(8),
      fontSize: r.ms(11),
      lineHeight: r.ms(17),
      textAlign: "center",
      color: Theme.colors.text,
      opacity: 0.7,
    },

    resetButton: {
      marginTop: r.ms(19),
      paddingHorizontal: r.ms(17),
      paddingVertical: r.ms(10),
      borderRadius: r.ms(11),
      backgroundColor: Theme.colors.primary,
    },

    resetButtonText: {
      fontSize: r.ms(11),
      fontWeight: "700",
      color: Theme.colors.background,
    },
  }));
};
