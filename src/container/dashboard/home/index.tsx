import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView, Spinner } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ShowData from "./components/ShowData";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { colors } from "@/src/constants/theme";

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
      {/* Content */}
      {active === "search" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>
                Melodia<Text style={styles.logoDot}>.</Text>
              </Text>

              <Text style={styles.subtitle}>Your music, your mood.</Text>
            </View>
          </View>

          {/* Search / Trending Switch */}
          <View style={styles.segmentContainer}>
            <View style={styles.segmentControl}>
              <View
                style={[
                  styles.activeIndicator,
                  active === "trending" && styles.activeIndicatorRight,
                ]}
              />

              <Text
                onPress={() => setActive("search")}
                style={[
                  styles.segmentText,
                  active === "search" && styles.activeSegmentText,
                ]}
              >
                Search
              </Text>

              <Text
                onPress={() => setActive("trending")}
                style={[
                  styles.segmentText,
                  active === "trending" && styles.activeSegmentText,
                ]}
              >
                Trending
              </Text>
            </View>
          </View>
          {isLoadingSongListToRender ? (
            <Loading />
          ) : (
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

              {recentlyPlayed.length > 0 && (
                <ShowData
                  isTrending
                  data={recentlyPlayed.slice(0, 6)}
                  renderData={recentlyPlayed}
                  heading="Recently Played"
                  type="song"
                />
              )}
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentTrending}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>
                Melodia<Text style={styles.logoDot}>.</Text>
              </Text>

              <Text style={styles.subtitle}>Your music, your mood.</Text>
            </View>
          </View>

          {/* Search / Trending Switch */}
          <View style={styles.segmentContainer}>
            <View style={styles.segmentControl}>
              <View
                style={[
                  styles.activeIndicator,
                  active === "trending" && styles.activeIndicatorRight,
                ]}
              />

              <Text
                onPress={() => setActive("search")}
                style={[
                  styles.segmentText,
                  active === "search" && styles.activeSegmentText,
                ]}
              >
                Search
              </Text>

              <Text
                onPress={() => setActive("trending")}
                style={[
                  styles.segmentText,
                  active === "trending" && styles.activeSegmentText,
                ]}
              >
                Trending
              </Text>
            </View>
          </View>
          {false ? (
            <Loading />
          ) : (
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
          )}
        </ScrollView>
      )}
    </View>
  );
};

const Loading = () => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCircle}>
        <Spinner size="large" color={colors.primary} />
      </View>

      <Text style={styles.loadingText}>Finding your music...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 0,
  },

  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.8,
  },

  logoDot: {
    color: colors.primary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },

  segmentContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  segmentControl: {
    height: 46,
    borderRadius: 14,
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
    left: 3,
    top: 3,
    bottom: 3,
    width: "50%",
    borderRadius: 11,
    backgroundColor: colors.primary,
  },

  activeIndicatorRight: {
    left: "50%",
  },

  segmentText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    zIndex: 1,
    paddingVertical: 14,
  },

  activeSegmentText: {
    color: colors.text,
  },

  scrollContent: {
    paddingTop: 10,
    paddingBottom: 190,
    gap: 24,
  },

  scrollContentTrending: {
    paddingTop: 10,
    paddingBottom: 190,
    gap: 30,
  },

  loadingContainer: {
    flex: 1,
    minHeight: 400,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default Home;
