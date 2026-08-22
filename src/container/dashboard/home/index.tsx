import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScrollView, Spinner } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ShowData from "./components/ShowData";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { colors } from "@/src/constants/theme";
import { moderateScale } from "react-native-size-matters";
import Header from "../common/header";
import TopFade from "../../shared/topFade";
import Radio from "./components/RadioList";

const Home = () => {
  const {
    searchedSongList,
    albumListToRender,
    playListToRender,
    isLoadingSongListToRender,
    active,
    setActive,
    hindi,
    punjabi,
    haryanvi,
    recentlyPlayed,
    searchQuery,
  } = useGlobalContext();

  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          // paddingTop: insets.top,
        },
      ]}
    >
      {active === "search" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={{ flex: 1, paddingTop: insets.top, gap: moderateScale(20) }}
          >
            <HomeHeader />

            {/* <SearchModeSwitch active={active} setActive={setActive} /> */}

            <View style={{ flex: 1 }}>
              <Radio
                onCategoryPress={(category) => {
                  console.log("Selected:", category.id);
                  console.log("Title:", category.title);
                }}
              />
            </View>

            {isLoadingSongListToRender ? (
              <Loading />
            ) : (
              <>
                {searchQuery && (
                  <>
                    <ShowData
                      data={searchedSongList.slice(0, 6)}
                      heading="Songs"
                      type="song"
                    />

                    <ShowData
                      isTrending
                      data={albumListToRender.slice(0, 6)}
                      renderData={albumListToRender}
                      heading="Albums"
                      type="album"
                    />

                    <ShowData
                      isTrending
                      data={playListToRender.slice(0, 6)}
                      renderData={playListToRender}
                      heading="Playlists"
                      type="playlist"
                    />
                  </>
                )}

                {recentlyPlayed.length > 0 && (
                  <ShowData
                    isTrending
                    data={recentlyPlayed.slice(0, 6)}
                    renderData={recentlyPlayed}
                    heading="Recently Played"
                    type="song"
                  />
                )}

                <View
                  style={{
                    flex: 1,
                    paddingTop: insets.top,
                    gap: moderateScale(20),
                  }}
                >
                  {/* <HomeHeader showHeader={false} />

            <SearchModeSwitch active={active} setActive={setActive} /> */}

                  <View
                    style={[
                      styles.container,
                      { paddingHorizontal: moderateScale(5) },
                    ]}
                  >
                    <View style={styles.greetingContainer}>
                      <Text style={styles.greeting}>Trending Songs</Text>

                      <Text style={styles.subtitle}>
                        Currently Trending Songs
                      </Text>
                    </View>
                  </View>

                  <>
                    <ShowData
                      isTrending
                      data={hindi.slice(0, 6)}
                      renderData={hindi}
                      heading="Hindi"
                      type="song"
                    />

                    <ShowData
                      isTrending
                      data={haryanvi.slice(0, 6)}
                      renderData={haryanvi}
                      heading="Haryanvi"
                      type="song"
                    />

                    <ShowData
                      isTrending
                      data={punjabi.slice(0, 6)}
                      renderData={punjabi}
                      heading="Punjabi"
                      type="song"
                    />
                  </>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={{ flex: 1, paddingTop: insets.top, gap: moderateScale(20) }}
          >
            {/* <HomeHeader showHeader={false} />

            <SearchModeSwitch active={active} setActive={setActive} /> */}

            <>
              <ShowData
                isTrending
                data={hindi.slice(0, 6)}
                renderData={hindi}
                heading="Hindi"
                type="song"
              />

              <ShowData
                isTrending
                data={haryanvi.slice(0, 6)}
                renderData={haryanvi}
                heading="Haryanvi"
                type="song"
              />

              <ShowData
                isTrending
                data={punjabi.slice(0, 6)}
                renderData={punjabi}
                heading="Punjabi"
                type="song"
              />
            </>
          </View>
        </ScrollView>
      )}

      <TopFade height={insets.top} />
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

const HomeHeader = ({ showHeader = true }: any) => {
  const greeting = useMemo(() => {
    // IST (Asia/Kolkata)
    const now = new Date();

    const istTime = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).formatToParts(now);

    const hour = Number(
      istTime.find((part) => part.type === "hour")?.value ?? 0,
    );

    if (hour >= 5 && hour < 12) {
      return "Good morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    }

    if (hour >= 17 && hour < 21) {
      return "Good evening";
    }

    return "Good night";
  }, []);

  return (
    <View style={[styles.container, { paddingHorizontal: moderateScale(5) }]}>
      {/* Small greeting */}

      {showHeader && <Header />}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>{greeting}</Text>

        <Text style={styles.subtitle}>Your music, your mood.</Text>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Search / Trending Switch                                                   */
/* -------------------------------------------------------------------------- */

type SearchModeSwitchProps = {
  active: string;
  setActive: (value: "search" | "trending") => void;
};

const SearchModeSwitch = ({ active, setActive }: SearchModeSwitchProps) => {
  return (
    <View style={styles.segmentWrapper}>
      <View style={styles.segmentControl}>
        <View
          style={[
            styles.activeIndicator,
            active === "trending" && styles.activeIndicatorRight,
          ]}
        />

        <Pressable
          onPress={() => setActive("search")}
          style={styles.segmentButton}
        >
          <Ionicons
            name="search-outline"
            size={moderateScale(15)}
            color={active === "search" ? colors.text : colors.textMuted}
          />

          <Text
            style={[
              styles.segmentText,
              active === "search" && styles.activeSegmentText,
            ]}
          >
            Search
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActive("trending")}
          style={styles.segmentButton}
        >
          <Ionicons
            name="flame-outline"
            size={moderateScale(15)}
            color={active === "trending" ? colors.text : colors.textMuted}
          />

          <Text
            style={[
              styles.segmentText,
              active === "trending" && styles.activeSegmentText,
            ]}
          >
            Trending
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

const Loading = () => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCircle}>
        <Spinner size="large" color={colors.primary} />
      </View>

      <Text style={styles.loadingTitle}>Finding your music</Text>

      <Text style={styles.loadingText}>
        Looking for something you'll love...
      </Text>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: ,
    position: "relative",
  },

  scrollContent: {
    // paddingTop: moderateScale(10),
    paddingBottom: moderateScale(180),
    // gap: moderateScale(30),
  },

  /* Header */

  header: {
    paddingHorizontal: moderateScale(16),
    // paddingTop: moderateScale(8),
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
  },

  profileContainer: {
    position: "relative",
  },

  avatar: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    color: colors.primary,
  },

  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 1,

    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),

    backgroundColor: "#48D597",

    borderWidth: 2,
    borderColor: colors.background,
  },

  searchContainer: {
    flex: 1,

    height: moderateScale(48),

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: moderateScale(14),

    borderRadius: moderateScale(24),

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,
  },

  searchInput: {
    flex: 1,

    marginLeft: moderateScale(8),

    paddingVertical: 0,

    fontSize: moderateScale(14),
    color: colors.text,
  },

  menuButton: {
    width: moderateScale(36),
    height: moderateScale(44),

    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.55,
  },

  greetingContainer: {
    // marginTop: moderateScale(16),
    paddingHorizontal: moderateScale(5),
  },

  greeting: {
    fontSize: moderateScale(25),
    fontWeight: "800",
    letterSpacing: -0.6,
    color: colors.text,
  },

  subtitle: {
    marginTop: moderateScale(3),
    fontSize: moderateScale(12),
    color: colors.textSecondary,
  },

  /* Segment */

  segmentWrapper: {
    paddingHorizontal: moderateScale(16),
    marginTop: moderateScale(-12),
  },

  segmentControl: {
    height: moderateScale(42),

    borderRadius: moderateScale(22),

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: "row",
    alignItems: "center",

    position: "relative",
    overflow: "hidden",
  },

  activeIndicator: {
    position: "absolute",

    left: moderateScale(3),
    top: moderateScale(3),
    bottom: moderateScale(3),

    width: "50%",

    borderRadius: moderateScale(20),

    backgroundColor: colors.primary,
  },

  activeIndicatorRight: {
    left: "50%",
  },

  segmentButton: {
    flex: 1,

    height: "100%",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: moderateScale(6),

    zIndex: 1,
  },

  segmentText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: colors.textMuted,
  },

  activeSegmentText: {
    color: colors.text,
  },

  /* Loading */

  loadingContainer: {
    minHeight: moderateScale(420),

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: moderateScale(30),
  },

  loadingCircle: {
    width: moderateScale(64),
    height: moderateScale(64),

    borderRadius: moderateScale(32),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,
  },

  loadingTitle: {
    marginTop: moderateScale(18),

    fontSize: moderateScale(15),
    fontWeight: "700",

    color: colors.text,
  },

  loadingText: {
    marginTop: moderateScale(5),

    fontSize: moderateScale(12),

    color: colors.textSecondary,

    textAlign: "center",
  },
});

export default Home;
