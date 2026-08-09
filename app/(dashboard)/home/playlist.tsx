import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";

import Playlist from "@/src/container/dashboard/home/playlist";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { colors } from "@/src/constants/theme";
import { Text } from "@/src/providers/CustomText";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PlaylistPage = () => {
  const { playListToRender } = useGlobalContext();

  const count = playListToRender?.length ?? 0;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Playlists</Text>

            <View style={styles.dot} />
          </View>

          <Text style={styles.subtitle}>Your music, your way</Text>
        </View>

        <View style={styles.headerIcon}>
          <LinearGradient
            colors={["rgba(168,85,247,0.18)", "rgba(168,85,247,0.04)"]}
            style={styles.iconGradient}
          >
            <Ionicons
              name="list-outline"
              size={moderateScale(20)}
              color={colors.primary}
            />
          </LinearGradient>
        </View>
      </View>

      {/* Collection bar */}
      <View style={styles.collectionBar}>
        <View style={styles.collectionLeft}>
          <Text style={styles.collectionTitle}>Your playlists</Text>

          <View style={styles.countBadge}>
            <Text style={styles.count}>{count}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.action}>
            <Ionicons
              name="swap-vertical-outline"
              size={moderateScale(16)}
              color={colors.textSecondary}
            />
          </Pressable>

          <Pressable style={styles.action}>
            <Ionicons
              name="options-outline"
              size={moderateScale(16)}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* SAME GRID AS ALBUM */}
      <View style={styles.list}>
        <Playlist />
      </View>

      {/* Top fade */}
      <LinearGradient
        pointerEvents="none"
        colors={[colors.background, "rgba(18,15,22,0.85)", "rgba(18,15,22,0)"]}
        locations={[0, 0.45, 1]}
        style={styles.fade}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: "relative",
  },

  header: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(14),
    paddingBottom: moderateScale(11),

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

  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),

    marginLeft: moderateScale(5),
    marginTop: moderateScale(11),

    backgroundColor: colors.primary,
  },

  subtitle: {
    marginTop: moderateScale(3),
    fontSize: moderateScale(10.5),
    color: colors.textMuted,
  },

  headerIcon: {
    width: moderateScale(44),
    height: moderateScale(44),

    borderRadius: moderateScale(15),

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.18)",
  },

  iconGradient: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

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

  count: {
    fontSize: moderateScale(8.5),
    fontWeight: "700",
    color: colors.primary,
  },

  actions: {
    flexDirection: "row",
    gap: moderateScale(5),
  },

  action: {
    width: moderateScale(32),
    height: moderateScale(32),

    borderRadius: moderateScale(10),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.025)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  list: {
    flex: 1,
    // width: "100%",
  },

  fade: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,

    height: moderateScale(38),

    zIndex: 20,
  },
});

export default PlaylistPage;
