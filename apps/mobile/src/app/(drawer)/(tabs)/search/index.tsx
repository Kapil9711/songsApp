import { Container } from "@/components/container";
import NowPlayingBackground from "@/components/nowPlayingBackground";
import { SongSmallCard } from "@/components/songs/songSmalCard";
import { SafeSide } from "@/hooks/useInsetStyle";
import {
  useAlbumsSearchQuery,
  usePlaylistsSearchQuery,
  useSongsSearchQuery,
} from "@/screens/search/api/api.queries";
import { usePlayerStore } from "@/store/player.store";
import { useTheme } from "@/themes/theme.context";
import { handleSongPlay } from "@/utils/handleSongPlay";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useResponsive } from "react-native-fluid-styles";

const CATEGORIES = ["All", "Songs", "Albums", "Playlists"] as const;

type SearchCategory = (typeof CATEGORIES)[number];

const TRENDING = ["Blinding Lights", "Levitating", "Chill Vibes"];

const RECENT_SEARCHES_KEY = "@riffly/recent-searches";
const MAX_RECENT_SEARCHES = 5;

type SearchItem = {
  id?: string | number;
  _id?: string;
  name?: string;
  title?: string;
  image?: { url?: string }[];
  imageUrl?: string;
  artwork?: string;
  [key: string]: any;
};

type SearchResult =
  | {
      kind: "song";
      item: SearchItem;
    }
  | {
      kind: "album";
      item: SearchItem;
    }
  | {
      kind: "playlist";
      item: SearchItem;
    };

type SearchRow =
  | {
      type: "discovery";
      id: string;
    }
  | {
      type: "results-header";
      id: string;
    }
  | {
      type: "empty";
      id: string;
    }
  | {
      type: "song";
      id: string;
      song: SearchItem;
    }
  | {
      type: "collection";
      id: string;
      item: SearchItem;
      collectionType: "album" | "playlist";
    };

const getItemName = (item: SearchItem) => item.name ?? item.title ?? "Untitled";

const getItemImage = (item: SearchItem) =>
  item.image?.[2]?.url ??
  item.image?.[1]?.url ??
  item.image?.[0]?.url ??
  item.imageUrl ??
  item.artwork ??
  undefined;

export default function SearchScreen() {
  const { Theme } = useTheme();
  const styles = useStyles();
  const r = useResponsive();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("All");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentSearchesLoaded, setRecentSearchesLoaded] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const inputRef = useRef<TextInput>(null);
  // Restore recent searches from AsyncStorage.
  useEffect(() => {
    let mounted = true;

    const loadRecentSearches = async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);

        if (mounted && stored) {
          const parsed: unknown = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            const validSearches = parsed.filter(
              (value): value is string => typeof value === "string",
            );

            setRecentSearches(validSearches.slice(0, MAX_RECENT_SEARCHES));
          }
        }
      } catch (error) {
        console.warn("Failed to load recent searches", error);
      } finally {
        if (mounted) {
          setRecentSearchesLoaded(true);
        }
      }
    };

    void loadRecentSearches();

    return () => {
      mounted = false;
    };
  }, []);

  // Persist recent searches after loading the saved history.
  useEffect(() => {
    if (!recentSearchesLoaded) {
      return;
    }

    AsyncStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(recentSearches),
    ).catch((error) => {
      console.warn("Failed to save recent searches", error);
    });
  }, [recentSearches, recentSearchesLoaded]);

  // Debounce search input.
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

    return () => {
      clearTimeout(timeout);
    };
  }, [query, debouncedQuery]);

  const searchParams = useMemo(
    () => ({
      limit: 10,
      query: debouncedQuery,
    }),
    [debouncedQuery],
  );

  // Search APIs.
  const songsQuery = useSongsSearchQuery(searchParams);
  const albumsQuery = useAlbumsSearchQuery(searchParams);
  const playlistsQuery = usePlaylistsSearchQuery(searchParams);

  const activeMediaId = usePlayerStore((state) => state.activeTrack?.mediaId);

  const showResults = debouncedQuery.length > 0;

  // Flatten paginated results.
  const songs = useMemo(
    () => songsQuery.data?.pages.flat() ?? [],
    [songsQuery.data],
  );

  const albums = useMemo(
    () => albumsQuery.data?.pages.flat() ?? [],
    [albumsQuery.data],
  );

  const playlists = useMemo(
    () => playlistsQuery.data?.pages.flat() ?? [],
    [playlistsQuery.data],
  );

  // Combine songs, albums, and playlists in the All tab.
  const mixedResults = useMemo<SearchResult[]>(
    () => [
      ...songs.map((item: SearchItem) => ({
        kind: "song" as const,
        item,
      })),
      ...albums.map((item: SearchItem) => ({
        kind: "album" as const,
        item,
      })),
      ...playlists.map((item: SearchItem) => ({
        kind: "playlist" as const,
        item,
      })),
    ],
    [songs, albums, playlists],
  );

  // Select the query matching the current category.
  const activeQuery =
    category === "Songs"
      ? songsQuery
      : category === "Albums"
        ? albumsQuery
        : category === "Playlists"
          ? playlistsQuery
          : null;

  // Use combined results for All and individual results for other tabs.
  const results = useMemo<SearchResult[]>(() => {
    if (category === "All") {
      return mixedResults;
    }

    return (activeQuery?.data?.pages.flat() ?? []).map((item: SearchItem) => ({
      kind:
        category === "Albums"
          ? ("album" as const)
          : category === "Playlists"
            ? ("playlist" as const)
            : ("song" as const),
      item,
    }));
  }, [category, mixedResults, activeQuery?.data]);

  const anyInitialPending =
    category === "All"
      ? songsQuery.isPending ||
        albumsQuery.isPending ||
        playlistsQuery.isPending
      : Boolean(activeQuery?.isPending);

  const anyFetching =
    category === "All"
      ? songsQuery.isFetching ||
        albumsQuery.isFetching ||
        playlistsQuery.isFetching
      : Boolean(activeQuery?.isFetching);

  const isFirstPageLoading =
    showResults &&
    (isDebouncing ||
      (anyInitialPending && results.length === 0) ||
      (anyFetching && results.length === 0));

  // Update the search input.
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  // Save a search in recent history, keeping the newest first.
  const rememberSearch = useCallback((value: string) => {
    const normalized = value.trim().replace(/\s+/g, " ");

    if (!normalized) {
      return;
    }

    setRecentSearches((previous) =>
      [
        normalized,
        ...previous.filter(
          (entry) => entry.toLowerCase() !== normalized.toLowerCase(),
        ),
      ].slice(0, MAX_RECENT_SEARCHES),
    );
  }, []);

  // Save completed searches, not each keystroke.
  useEffect(() => {
    if (debouncedQuery.trim() && !isDebouncing) {
      rememberSearch(debouncedQuery);
    }
  }, [debouncedQuery, isDebouncing, rememberSearch]);

  // Select a recent or trending search.
  const selectSearch = useCallback(
    (value: string) => {
      rememberSearch(value);
      setQuery(value);
      setDebouncedQuery(value.trim());
      setIsDebouncing(false);
      (inputRef.current as any)?.focus();
    },
    [rememberSearch],
  );

  // Clear search input and return to discovery.
  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setCategory("All");
    setIsDebouncing(false);
    (inputRef.current as any)?.focus();
  }, []);

  // Render a song result.
  const renderSong = useCallback(
    ({
      item,
      index,
      songResults,
    }: {
      item: SearchItem;
      index: number;
      songResults: SearchItem[];
    }) => (
      <SongSmallCard
        isActive={activeMediaId === item.id}
        title={getItemName(item)}
        image={getItemImage(item) as any}
        number={index + 1}
        song={item}
        onPress={() => {
          Keyboard.dismiss();

          rememberSearch(debouncedQuery || getItemName(item));

          void handleSongPlay(index, songResults, true);
        }}
      />
    ),
    [activeMediaId, debouncedQuery, rememberSearch],
  );

  // Render an album or playlist result.
  const renderCollection = useCallback(
    ({
      item,
      index,
      collectionType,
    }: {
      item: SearchItem;
      index: number;
      collectionType: "album" | "playlist";
    }) => {
      const name = getItemName(item);
      const image = getItemImage(item);
      const id = item.id ?? item._id;
      const isAlbum = collectionType === "album";

      return (
        <Pressable
          onPress={() => {
            rememberSearch(debouncedQuery || name);

            router.push({
              pathname: "/(drawer)/(tabs)/search/song",
              params: {
                id,
                isAlbum: isAlbum ? 1 : 0,
              },
            });
          }}
        >
          <View style={styles.collectionRow}>
            <View style={styles.collectionArtwork}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.collectionImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name={isAlbum ? "disc-outline" : "list-outline"}
                  size={r.ms(25)}
                  color={Theme.colors.primary}
                />
              )}
            </View>

            <View style={styles.collectionInfo}>
              <Text numberOfLines={1} style={styles.collectionTitle}>
                {name}
              </Text>

              <Text numberOfLines={1} style={styles.collectionSubtitle}>
                {isAlbum ? "Album" : "Playlist"}
              </Text>
            </View>

            <Text style={styles.collectionNumber}>
              {String(index + 1).padStart(2, "0")}
            </Text>
          </View>
        </Pressable>
      );
    },
    [styles, r, Theme, router, rememberSearch, debouncedQuery],
  );

  // Discovery screen: recent and trending searches.
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

  // Results section header.
  const renderResultsHeader = useCallback(
    () => (
      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsTitle}>
            {isDebouncing
              ? "Finding your sound..."
              : `Search ${category.toLowerCase()}`}
          </Text>

          <Text style={styles.resultsSubtitle}>
            {isDebouncing
              ? "Updating results"
              : `${results.length} ${
                  results.length === 1 ? "match" : "matches"
                } found`}
          </Text>
        </View>

        {(isDebouncing || isFirstPageLoading) && (
          <ActivityIndicator color={Theme.colors.primary} size="small" />
        )}
      </View>
    ),
    [category, isDebouncing, isFirstPageLoading, results.length, styles, Theme],
  );

  // Empty and loading states.
  const renderEmptyResults = useCallback(
    () => (
      <View style={styles.emptyState}>
        {isFirstPageLoading ? (
          <>
            <ActivityIndicator size="large" color={Theme.colors.primary} />

            <Text style={styles.emptyTitle}>
              Loading {category.toLowerCase()}...
            </Text>

            <Text style={styles.emptyDescription}>
              Please wait while we find your results.
            </Text>
          </>
        ) : (
          <>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="search-outline"
                size={r.ms(30)}
                color={Theme.colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>No results found</Text>

            <Text style={styles.emptyDescription}>
              We couldn't find {category.toLowerCase()} for
              {' "'}
              {debouncedQuery}
              {'". '}
              Try another search.
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
          </>
        )}
      </View>
    ),
    [
      isFirstPageLoading,
      category,
      Theme,
      debouncedQuery,
      clearSearch,
      styles,
      r,
    ],
  );

  // Build rows for SectionList.
  const rows = useMemo<SearchRow[]>(() => {
    if (!showResults) {
      return [
        {
          type: "discovery",
          id: "discovery",
        },
      ];
    }

    const searchRows: SearchRow[] = [
      {
        type: "results-header",
        id: "results-header",
      },
    ];

    if (isFirstPageLoading && results.length === 0) {
      searchRows.push({
        type: "empty",
        id: "loading",
      });

      return searchRows;
    }

    if (results.length > 0) {
      searchRows.push(
        ...results.map((result, index) => {
          const item = result.item;

          const id = String(
            item.id ?? item._id ?? `${getItemName(item)}-${index}`,
          );

          if (result.kind === "song") {
            return {
              type: "song" as const,
              id: `song-${id}`,
              song: item,
            };
          }

          return {
            type: "collection" as const,
            id: `${result.kind}-${id}`,
            item,
            collectionType: result.kind,
          };
        }),
      );
    } else if (!anyFetching) {
      searchRows.push({
        type: "empty",
        id: "empty",
      });
    }

    return searchRows;
  }, [showResults, results, isFirstPageLoading, anyFetching]);

  // Render each row type.
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
          const songRows = rows.filter(
            (row): row is Extract<SearchRow, { type: "song" }> =>
              row.type === "song",
          );

          const songIndex = songRows.findIndex((row) => row.id === item.id);

          const songResults = songRows.map((row) => row.song);

          return renderSong({
            item: item.song,
            index: Math.max(songIndex, 0),
            songResults,
          });
        }

        case "collection":
          return renderCollection({
            item: item.item,
            collectionType: item.collectionType,
            index: rows
              .slice(1, index)
              .filter((row) => row.type === "collection").length,
          });

        default:
          return null;
      }
    },
    [
      rows,
      renderDiscovery,
      renderResultsHeader,
      renderEmptyResults,
      renderSong,
      renderCollection,
    ],
  );

  // Search bar and category tabs.
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
            ref={inputRef as any}
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
            data={[...CATEGORIES]}
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

  // Pagination for the selected category.
  const handleLoadMore = useCallback(() => {
    if (!showResults) {
      return;
    }

    if (category === "All") {
      if (songsQuery.hasNextPage && !songsQuery.isFetching) {
        void songsQuery.fetchNextPage();
      }

      if (albumsQuery.hasNextPage && !albumsQuery.isFetching) {
        void albumsQuery.fetchNextPage();
      }

      if (playlistsQuery.hasNextPage && !playlistsQuery.isFetching) {
        void playlistsQuery.fetchNextPage();
      }

      return;
    }

    if (activeQuery?.hasNextPage && !activeQuery.isFetching) {
      void activeQuery.fetchNextPage();
    }
  }, [
    showResults,
    category,
    songsQuery,
    albumsQuery,
    playlistsQuery,
    activeQuery,
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

      <View style={styles.container}>
        <SectionList<SearchRow>
          sections={[
            {
              key: "search",
              data: rows,
            },
          ]}
          keyExtractor={(item, index) => `${item.id}-${index}`}
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
            category === "All" ? (
              songsQuery.isFetchingNextPage ||
              albumsQuery.isFetchingNextPage ||
              playlistsQuery.isFetchingNextPage ? (
                <View style={styles.listFooter}>
                  <ActivityIndicator color={Theme.colors.primary} />

                  <Text style={styles.footerLoadingText}>Loading more...</Text>
                </View>
              ) : null
            ) : activeQuery?.isFetchingNextPage ? (
              <View style={styles.listFooter}>
                <ActivityIndicator color={Theme.colors.primary} />

                <Text style={styles.footerLoadingText}>Loading more...</Text>
              </View>
            ) : (
              (null as any)
            )
          }
          onScrollBeginDrag={Keyboard.dismiss}
          onEndReached={handleLoadMore}
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
            isFirstPageLoading,
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
      alignItems: "center",
      gap: r.ms(8),
    },

    footerLoadingText: {
      fontSize: r.ms(10),
      color: text,
      opacity: 0.7,
    },

    emptyState: {
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
      textAlign: "center",
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

    collectionRow: {
      minHeight: r.ms(66),
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(12),
      paddingVertical: r.ms(7),
    },

    collectionArtwork: {
      width: r.ms(52),
      height: r.ms(52),
      borderRadius: r.ms(10),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

    collectionImage: {
      width: "100%",
      height: "100%",
    },

    collectionInfo: {
      flex: 1,
      minWidth: 0,
      gap: r.ms(4),
    },

    collectionTitle: {
      fontSize: r.ms(12),
      fontWeight: "700",
      color: text,
    },

    collectionSubtitle: {
      fontSize: r.ms(10),
      color: text,
      opacity: 0.65,
    },

    collectionNumber: {
      fontSize: r.ms(10),
      fontWeight: "700",
      color: primary,
    },
  });
};
