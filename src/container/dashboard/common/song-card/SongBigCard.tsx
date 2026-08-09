import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

import { colors } from "@/src/constants/theme";

type SongBigCardProps = {
  image?: string;
  title?: string;
  subtitle?: string;
  type?: string;
};

const SongBigCard = ({
  image,
  title = "Unknown",
  subtitle = "",
  type = "song",
}: SongBigCardProps) => {
  return (
    <View style={styles.card}>
      {/* ---------------------------------------------------------------- */}
      {/* Artwork                                                          */}
      {/* ---------------------------------------------------------------- */}

      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="musical-notes"
              size={moderateScale(34)}
              color={colors.textMuted}
            />
          </View>
        )}

        {/* Image gradient/dark overlay */}
        <View style={styles.imageOverlay} />

        {/* Type badge */}
        {type !== "song" && (
          <View style={styles.typeBadge}>
            <Ionicons
              name={type === "album" ? "disc-outline" : "musical-notes-outline"}
              size={moderateScale(12)}
              color={colors.text}
            />
          </View>
        )}

        {/* Play button */}
        <Pressable
          hitSlop={8}
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.playButtonPressed,
          ]}
        >
          <Ionicons
            name="play"
            size={moderateScale(17)}
            color="#111111"
            style={styles.playIcon}
          />
        </Pressable>
      </View>

      {/* ---------------------------------------------------------------- */}
      {/* Information                                                      */}
      {/* ---------------------------------------------------------------- */}

      <View style={styles.infoContainer}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>

        {!!subtitle && (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* -------------------------------------------------------------------- */
  /* Card                                                                 */
  /* -------------------------------------------------------------------- */

  card: {
    width: "100%",

    height: moderateScale(250),

    borderRadius: moderateScale(16),

    overflow: "hidden",

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,
  },

  /* -------------------------------------------------------------------- */
  /* Image                                                                */
  /* -------------------------------------------------------------------- */

  imageContainer: {
    width: "100%",

    height: moderateScale(184),

    position: "relative",

    overflow: "hidden",

    backgroundColor: colors.surfaceElevated,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surfaceElevated,
  },

  imageOverlay: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    height: moderateScale(55),

    backgroundColor: "rgba(0,0,0,0.18)",
  },

  /* -------------------------------------------------------------------- */
  /* Type Badge                                                           */
  /* -------------------------------------------------------------------- */

  typeBadge: {
    position: "absolute",

    top: moderateScale(9),
    left: moderateScale(9),

    width: moderateScale(28),
    height: moderateScale(28),

    borderRadius: moderateScale(9),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(0,0,0,0.58)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  /* -------------------------------------------------------------------- */
  /* Play Button                                                          */
  /* -------------------------------------------------------------------- */

  playButton: {
    position: "absolute",

    right: moderateScale(10),
    bottom: moderateScale(10),

    width: moderateScale(40),
    height: moderateScale(40),

    borderRadius: moderateScale(20),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.text,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,

    elevation: 5,
  },

  playButtonPressed: {
    transform: [
      {
        scale: 0.9,
      },
    ],

    opacity: 0.8,
  },

  playIcon: {
    marginLeft: moderateScale(2),
  },

  /* -------------------------------------------------------------------- */
  /* Information                                                          */
  /* -------------------------------------------------------------------- */

  infoContainer: {
    flex: 1,

    justifyContent: "center",

    paddingHorizontal: moderateScale(12),

    paddingVertical: moderateScale(8),

    backgroundColor: colors.surface,
  },

  title: {
    fontSize: moderateScale(14),

    lineHeight: moderateScale(18),

    fontWeight: "700",

    color: colors.text,

    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: moderateScale(3),

    fontSize: moderateScale(11.5),

    lineHeight: moderateScale(15),

    fontWeight: "500",

    color: colors.textSecondary,
  },
});

export default SongBigCard;
