import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";

import VerticalList from "../components/VerticalList";

import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { colors } from "@/src/constants/theme";
import { Text } from "@/src/providers/CustomText";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Album = () => {
  const { albumListToRender } = useGlobalContext();

  const albumCount = albumListToRender?.length ?? 0;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, borderWidth: 1, borderColor: "white" },
      ]}
    >
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Albums</Text>

              <View style={styles.titleDot} />
            </View>

            <Text style={styles.subtitle}>Explore your music collection</Text>
          </View>

          {/* Header icon */}

          <View style={styles.headerIcon}>
            <LinearGradient
              colors={["rgba(168,85,247,0.18)", "rgba(168,85,247,0.04)"]}
              style={styles.headerIconGradient}
            >
              <Ionicons
                name="albums-outline"
                size={moderateScale(20)}
                color={colors.primary}
              />
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* ============================================================ */}
      {/* COLLECTION BAR                                                */}
      {/* ============================================================ */}

      <View style={styles.collectionBar}>
        <View style={styles.collectionLeft}>
          <Text style={styles.collectionTitle}>Your albums</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>{albumCount}</Text>
          </View>
        </View>

        <View style={styles.collectionActions}>
          {/* Sort */}

          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={moderateScale(16)}
              color={colors.textSecondary}
            />
          </Pressable>

          {/* Filter */}

          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={moderateScale(16)}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* ============================================================ */}
      {/* ALBUM CONTENT                                                 */}
      {/* ============================================================ */}

      {albumCount > 0 ? (
        <View style={styles.listContainer}>
          <VerticalList data={albumListToRender} type="album" />
        </View>
      ) : (
        <EmptyAlbums />
      )}

      {/* ============================================================ */}
      {/* TOP FADE                                                      */}
      {/* ============================================================ */}

      <LinearGradient
        pointerEvents="none"
        colors={[colors.background, "rgba(18,15,22,0.85)", "rgba(18,15,22,0)"]}
        locations={[0, 0.45, 1]}
        style={styles.topFade}
      />
    </View>
  );
};

/* ================================================================== */
/* EMPTY STATE                                                         */
/* ================================================================== */

const EmptyAlbums = () => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconOuter}>
        <LinearGradient
          colors={["rgba(168,85,247,0.18)", "rgba(168,85,247,0.04)"]}
          style={styles.emptyIcon}
        >
          <Ionicons
            name="albums-outline"
            size={moderateScale(28)}
            color={colors.primary}
          />
        </LinearGradient>
      </View>

      <Text style={styles.emptyTitle}>No albums yet</Text>

      <Text style={styles.emptyDescription}>
        Albums from your music collection will appear here.
      </Text>

      <View style={styles.emptyHint}>
        <Ionicons
          name="musical-notes-outline"
          size={moderateScale(14)}
          color={colors.textMuted}
        />

        <Text style={styles.emptyHintText}>
          Start searching for music to build your collection.
        </Text>
      </View>
    </View>
  );
};

/* ================================================================== */
/* STYLES                                                              */
/* ================================================================== */

const styles = StyleSheet.create({
  /* ================================================================ */
  /* CONTAINER                                                         */
  /* ================================================================ */

  container: {
    flex: 1,

    backgroundColor: colors.background,

    position: "relative",
  },

  /* ================================================================ */
  /* HEADER                                                            */
  /* ================================================================ */

  header: {
    paddingHorizontal: moderateScale(16),

    paddingTop: moderateScale(14),

    paddingBottom: moderateScale(11),
  },

  headerContent: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  titleRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  title: {
    fontSize: moderateScale(26),

    lineHeight: moderateScale(31),

    fontWeight: "800",

    letterSpacing: -0.8,

    color: colors.text,
  },

  titleDot: {
    width: moderateScale(6),

    height: moderateScale(6),

    borderRadius: moderateScale(3),

    marginLeft: moderateScale(5),

    marginTop: moderateScale(11),

    backgroundColor: colors.primary,

    shadowColor: colors.primary,

    shadowOpacity: 0.8,

    shadowRadius: 6,

    elevation: 4,
  },

  subtitle: {
    marginTop: moderateScale(3),

    fontSize: moderateScale(10.5),

    color: colors.textMuted,
  },

  /* ================================================================ */
  /* HEADER ICON                                                       */
  /* ================================================================ */

  headerIcon: {
    width: moderateScale(44),

    height: moderateScale(44),

    borderRadius: moderateScale(15),

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.18)",
  },

  headerIconGradient: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",
  },

  /* ================================================================ */
  /* COLLECTION BAR                                                    */
  /* ================================================================ */

  collectionBar: {
    paddingHorizontal: moderateScale(16),

    marginBottom: moderateScale(7),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  collectionLeft: {
    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(7),
  },

  collectionTitle: {
    fontSize: moderateScale(14),

    fontWeight: "700",

    color: colors.text,
  },

  countBadge: {
    minWidth: moderateScale(23),

    height: moderateScale(19),

    paddingHorizontal: moderateScale(5),

    borderRadius: moderateScale(7),

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(168,85,247,0.10)",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.17)",
  },

  countText: {
    fontSize: moderateScale(8.5),

    fontWeight: "700",

    color: colors.primary,
  },

  collectionActions: {
    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(5),
  },

  iconButton: {
    width: moderateScale(32),

    height: moderateScale(32),

    borderRadius: moderateScale(10),

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.025)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.06)",
  },

  iconButtonPressed: {
    opacity: 0.6,

    transform: [
      {
        scale: 0.92,
      },
    ],
  },

  /* ================================================================ */
  /* LIST                                                              */
  /* ================================================================ */

  listContainer: {
    flex: 1,

    paddingHorizontal: moderateScale(8),

    // paddingBottom: moderateScale(175),
  },

  /* ================================================================ */
  /* TOP FADE                                                          */
  /* ================================================================ */

  topFade: {
    position: "absolute",

    top: 0,

    left: 0,

    right: 0,

    height: moderateScale(38),

    zIndex: 20,
  },

  /* ================================================================ */
  /* EMPTY STATE                                                       */
  /* ================================================================ */

  emptyContainer: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: moderateScale(40),

    paddingBottom: moderateScale(70),
  },

  emptyIconOuter: {
    width: moderateScale(80),

    height: moderateScale(80),

    borderRadius: moderateScale(27),

    padding: 1,

    backgroundColor: "rgba(168,85,247,0.12)",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.22)",
  },

  emptyIcon: {
    flex: 1,

    borderRadius: moderateScale(26),

    alignItems: "center",

    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: moderateScale(19),

    fontSize: moderateScale(17),

    fontWeight: "800",

    color: colors.text,
  },

  emptyDescription: {
    marginTop: moderateScale(6),

    maxWidth: moderateScale(270),

    fontSize: moderateScale(10.5),

    lineHeight: moderateScale(16),

    color: colors.textMuted,

    textAlign: "center",
  },

  emptyHint: {
    marginTop: moderateScale(17),

    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(5),

    paddingHorizontal: moderateScale(11),

    paddingVertical: moderateScale(7),

    borderRadius: moderateScale(10),

    backgroundColor: "rgba(255,255,255,0.025)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.05)",
  },

  emptyHintText: {
    fontSize: moderateScale(8.5),

    color: colors.textMuted,
  },
});

export default Album;
