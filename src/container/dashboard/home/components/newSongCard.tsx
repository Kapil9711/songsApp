import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";

import { Text } from "@/src/providers/CustomText";
import { colors } from "@/src/constants/theme";

type PlaylistCardProps = {
  image?: string;
  title: string;
  index?: number;
  type?: "album" | "playlist";
};

const PlaylistCard = ({
  image,
  title,
  index,
  type = "playlist",
}: PlaylistCardProps) => {
  const isAlbum = type === "album";

  const typeLabel = isAlbum ? "Album" : "Playlist";

  const typeIcon = isAlbum ? "disc-outline" : "list-outline";

  const fallbackIcon = isAlbum ? "disc" : "musical-notes";

  return (
    <View style={styles.card}>
      {/* ========================================================== */}
      {/* ARTWORK                                                     */}
      {/* ========================================================== */}

      <View style={styles.artwork}>
        {image ? (
          <Image
            source={{ uri: image }}
            accessibilityLabel={title}
            resizeMode="cover"
            style={styles.image}
          />
        ) : (
          <LinearGradient
            colors={["rgba(168,85,247,0.24)", "rgba(168,85,247,0.06)"]}
            style={styles.fallback}
          >
            <View style={styles.fallbackIcon}>
              <Ionicons
                name={fallbackIcon}
                size={moderateScale(32)}
                color={colors.primary}
              />
            </View>
          </LinearGradient>
        )}

        {/* Subtle image overlay */}

        <View pointerEvents="none" style={styles.imageOverlay} />

        {/* Bottom fade */}

        <LinearGradient
          pointerEvents="none"
          colors={[
            "transparent",
            "rgba(8,6,12,0.05)",
            "rgba(8,6,12,0.35)",
            "rgba(8,6,12,0.86)",
          ]}
          locations={[0, 0.45, 0.7, 1]}
          style={styles.bottomGradient}
        />

        {/* ======================================================== */}
        {/* NUMBER                                                     */}
        {/* ======================================================== */}

        {typeof index === "number" && (
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>
              {String(index + 1).padStart(2, "0")}
            </Text>
          </View>
        )}

        {/* ======================================================== */}
        {/* TYPE BADGE                                                 */}
        {/* ======================================================== */}

        <View style={styles.typeBadge}>
          <Ionicons
            name={typeIcon}
            size={moderateScale(10)}
            color={colors.text}
          />

          <Text numberOfLines={1} style={styles.typeText}>
            {typeLabel}
          </Text>
        </View>

        {/* ======================================================== */}
        {/* OPEN BUTTON                                                */}
        {/* ======================================================== */}

        <View style={styles.playButton}>
          <Ionicons
            name="chevron-forward"
            size={moderateScale(17)}
            color={colors.text}
          />
        </View>
      </View>

      {/* ========================================================== */}
      {/* INFORMATION                                                 */}
      {/* ========================================================== */}

      <View style={styles.info}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <Ionicons
              name={typeIcon}
              size={moderateScale(11)}
              color={colors.primary}
            />

            <Text numberOfLines={1} style={styles.metaText}>
              {typeLabel}
            </Text>
          </View>

          <View style={styles.openHint}>
            <Text style={styles.openText}>View</Text>

            <Ionicons
              name="arrow-forward"
              size={moderateScale(10)}
              color={colors.textMuted}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* ================================================================ */
  /* CARD                                                              */
  /* ================================================================ */

  card: {
    width: "100%",

    minWidth: 0,

    overflow: "hidden",
  },

  /* ================================================================ */
  /* ARTWORK                                                           */
  /* ================================================================ */

  artwork: {
    width: "100%",

    aspectRatio: 1,

    position: "relative",

    overflow: "hidden",

    borderRadius: moderateScale(20),

    backgroundColor: colors.surfaceElevated,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.24,

    shadowRadius: 14,

    elevation: 6,
  },

  image: {
    position: "absolute",

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(0,0,0,0.03)",
  },

  /* ================================================================ */
  /* FALLBACK                                                          */
  /* ================================================================ */

  fallback: {
    ...StyleSheet.absoluteFillObject,

    alignItems: "center",

    justifyContent: "center",
  },

  fallbackIcon: {
    width: moderateScale(68),

    height: moderateScale(68),

    borderRadius: moderateScale(24),

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(168,85,247,0.10)",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.18)",
  },

  /* ================================================================ */
  /* GRADIENT                                                          */
  /* ================================================================ */

  bottomGradient: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    height: "60%",
  },

  /* ================================================================ */
  /* INDEX                                                             */
  /* ================================================================ */

  indexBadge: {
    position: "absolute",

    top: moderateScale(12),

    left: moderateScale(12),

    minWidth: moderateScale(31),

    height: moderateScale(25),

    paddingHorizontal: moderateScale(8),

    borderRadius: moderateScale(9),

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(8,6,12,0.62)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.12)",
  },

  indexText: {
    fontSize: moderateScale(8),

    fontWeight: "800",

    color: "rgba(255,255,255,0.90)",

    letterSpacing: 0.6,
  },

  /* ================================================================ */
  /* TYPE BADGE                                                        */
  /* ================================================================ */

  typeBadge: {
    position: "absolute",

    left: moderateScale(12),

    bottom: moderateScale(13),

    maxWidth: "50%",

    height: moderateScale(25),

    paddingHorizontal: moderateScale(9),

    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(5),

    borderRadius: moderateScale(9),

    backgroundColor: "rgba(8,6,12,0.64)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.10)",
  },

  typeText: {
    flexShrink: 1,

    fontSize: moderateScale(8),

    fontWeight: "700",

    color: colors.text,

    letterSpacing: 0.2,
  },

  /* ================================================================ */
  /* BUTTON                                                            */
  /* ================================================================ */

  playButton: {
    position: "absolute",

    right: moderateScale(12),

    bottom: moderateScale(12),

    width: moderateScale(40),

    height: moderateScale(40),

    borderRadius: moderateScale(20),

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: colors.primary,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.20)",

    shadowColor: colors.primary,

    shadowOpacity: 0.42,

    shadowRadius: 10,

    elevation: 7,
  },

  /* ================================================================ */
  /* INFO                                                              */
  /* ================================================================ */

  info: {
    width: "100%",

    minWidth: 0,

    paddingTop: moderateScale(12),

    paddingHorizontal: moderateScale(3),

    overflow: "hidden",
  },

  title: {
    width: "100%",

    minWidth: 0,

    flexShrink: 1,

    fontSize: moderateScale(16),

    lineHeight: moderateScale(21),

    fontWeight: "800",

    letterSpacing: -0.3,

    color: colors.text,
  },

  /* ================================================================ */
  /* META                                                              */
  /* ================================================================ */

  metaRow: {
    width: "100%",

    minWidth: 0,

    marginTop: moderateScale(6),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  metaLeft: {
    minWidth: 0,

    flexShrink: 1,

    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(5),
  },

  metaText: {
    flexShrink: 1,

    fontSize: moderateScale(9.5),

    fontWeight: "600",

    color: colors.textMuted,
  },

  /* ================================================================ */
  /* VIEW HINT                                                         */
  /* ================================================================ */

  openHint: {
    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(3),

    marginLeft: moderateScale(10),
  },

  openText: {
    fontSize: moderateScale(8.5),

    fontWeight: "600",

    color: colors.textMuted,
  },
});

export default PlaylistCard;
