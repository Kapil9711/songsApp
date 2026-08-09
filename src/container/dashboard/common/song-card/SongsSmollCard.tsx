import React, { useMemo } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";

import { Text } from "@/src/providers/CustomText";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { getValueInAsync } from "@/src/utilities/helpers";
import { colors } from "@/src/constants/theme";

const showAlert = (deleteFile: any, fileName: string) => {
  Alert.alert(
    "Delete File",
    "Are you sure you want to delete this file?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const user: any = await getValueInAsync("user");

            const userId = JSON.parse(user || "{}")?._id;

            deleteFile(`${fileName}_${userId}`);
          } catch (error) {
            console.error("Failed to delete file:", error);
          }
        },
      },
    ],
    {
      cancelable: true,
    },
  );
};

type SongsSmollCardProps = {
  image: string;
  title: string;
  isActive: boolean;
  number: number;
  song?: any;
  isShowButton?: boolean;
  onPress?: () => void;
};

const SongsSmollCard = ({
  image,
  title,
  isActive,
  number,
  song,
  isShowButton = true,
  onPress,
}: SongsSmollCardProps) => {
  const { deleteFile, handleFavorite, handleDownload, favorite } =
    useGlobalContext();

  const isFav = useMemo(() => {
    return favorite.some((item: any) => song?.id === item.id);
  }, [favorite, song]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isActive && styles.activeContainer,
        pressed && styles.pressed,
      ]}
    >
      {/* ========================================================== */}
      {/* ACTIVE BACKGROUND                                           */}
      {/* ========================================================== */}

      {isActive && (
        <>
          <LinearGradient
            pointerEvents="none"
            colors={[
              "rgba(168,85,247,0.20)",
              "rgba(168,85,247,0.07)",
              "rgba(168,85,247,0)",
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={styles.activeGradient}
          />

          <View style={styles.activeLine} />
        </>
      )}

      {/* ========================================================== */}
      {/* HORIZONTAL CONTENT                                          */}
      {/* ========================================================== */}

      <View style={styles.row}>
        {/* ======================================================== */}
        {/* NUMBER                                                    */}
        {/* ======================================================== */}

        <View style={styles.numberContainer}>
          {isActive ? (
            <View style={styles.equalizer}>
              <View style={[styles.equalizerBar, styles.barOne]} />

              <View style={[styles.equalizerBar, styles.barTwo]} />

              <View style={[styles.equalizerBar, styles.barThree]} />
            </View>
          ) : (
            <Text style={styles.number}>{String(number).padStart(2, "0")}</Text>
          )}
        </View>

        {/* ======================================================== */}
        {/* ARTWORK                                                   */}
        {/* ======================================================== */}

        <View style={[styles.artwork, isActive && styles.activeArtwork]}>
          {image ? (
            <Image
              source={{
                uri: image,
              }}
              accessibilityLabel={title}
              resizeMode="cover"
              style={styles.artworkImage}
            />
          ) : (
            <View style={styles.artworkFallback}>
              <Ionicons
                name="musical-note"
                size={moderateScale(22)}
                color={colors.textMuted}
              />
            </View>
          )}

          {isActive && (
            <View style={styles.artworkOverlay}>
              <View style={styles.playCircle}>
                <Ionicons
                  name="volume-high"
                  size={moderateScale(11)}
                  color={colors.text}
                />
              </View>
            </View>
          )}
        </View>

        {/* ======================================================== */}
        {/* SONG INFO                                                  */}
        {/* ======================================================== */}

        <View style={styles.info}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.title, isActive && styles.activeTitle]}
          >
            {title}
          </Text>

          <View style={styles.meta}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.artist}>
              {song?.artist || song?.artists?.[0]?.name || "Unknown Artist"}
            </Text>

            {isActive && (
              <>
                <View style={styles.metaDot} />

                <Text style={styles.playingText}>Playing</Text>
              </>
            )}
          </View>
        </View>

        {/* ======================================================== */}
        {/* ACTIONS                                                    */}
        {/* ======================================================== */}

        {isShowButton ? (
          <View style={styles.actions}>
            {/* ---------------------------------------------------- */}
            {/* FAVORITE                                              */}
            {/* ---------------------------------------------------- */}

            <Pressable
              onPress={(event) => {
                event.stopPropagation();

                handleFavorite(song);
              }}
              hitSlop={6}
              style={({ pressed }) => [
                styles.actionButton,
                isFav && styles.favoriteButton,
                pressed && styles.actionPressed,
              ]}
            >
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={moderateScale(19)}
                color={isFav ? colors.primary : colors.textMuted}
              />
            </Pressable>

            {/* ---------------------------------------------------- */}
            {/* DOWNLOAD                                               */}
            {/* ---------------------------------------------------- */}

            <Pressable
              onPress={(event) => {
                event.stopPropagation();

                handleDownload(
                  song?.downloadUrl?.[4]?.url,
                  song?.image?.[2]?.url,
                  song?.name,
                );
              }}
              hitSlop={6}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionPressed,
              ]}
            >
              <Ionicons
                name="download-outline"
                size={moderateScale(19)}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
        ) : (
          /* -------------------------------------------------------- */
          /* DELETE                                                   */
          /* -------------------------------------------------------- */

          <Pressable
            onPress={(event) => {
              event.stopPropagation();

              showAlert(deleteFile, title);
            }}
            hitSlop={6}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.actionPressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={moderateScale(19)}
              color={colors.error}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  /* ================================================================ */
  /* CARD                                                             */
  /* ================================================================ */

  container: {
    width: "100%",

    minHeight: moderateScale(82),

    marginVertical: moderateScale(4),

    paddingHorizontal: moderateScale(8),

    borderRadius: moderateScale(18),

    backgroundColor: "rgba(255,255,255,0.018)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.055)",

    position: "relative",

    overflow: "hidden",
  },

  activeContainer: {
    backgroundColor: "rgba(168,85,247,0.055)",

    borderColor: "rgba(168,85,247,0.22)",

    shadowColor: colors.primary,

    shadowOpacity: 0.1,

    shadowRadius: 12,

    elevation: 3,
  },

  pressed: {
    opacity: 0.78,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  /* ================================================================ */
  /* ROW                                                              */
  /* ================================================================ */

  row: {
    width: "100%",

    minHeight: moderateScale(63),

    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  /* ================================================================ */
  /* ACTIVE                                                           */
  /* ================================================================ */

  activeGradient: {
    position: "absolute",

    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  activeLine: {
    position: "absolute",

    left: 0,

    top: moderateScale(18),

    bottom: moderateScale(18),

    width: moderateScale(3),

    borderRadius: moderateScale(3),

    backgroundColor: colors.primary,

    shadowColor: colors.primary,

    shadowOpacity: 0.8,

    shadowRadius: 8,

    elevation: 5,
  },

  /* ================================================================ */
  /* NUMBER                                                           */
  /* ================================================================ */

  numberContainer: {
    width: moderateScale(32),

    height: "100%",

    alignItems: "center",

    justifyContent: "center",

    flexShrink: 0,
  },

  number: {
    fontSize: moderateScale(10),

    fontWeight: "600",

    color: colors.textMuted,

    letterSpacing: 0.4,
  },

  /* ================================================================ */
  /* EQUALIZER                                                        */
  /* ================================================================ */

  equalizer: {
    height: moderateScale(24),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: moderateScale(2),
  },

  equalizerBar: {
    width: moderateScale(3),

    borderRadius: moderateScale(2),

    backgroundColor: colors.primary,
  },

  barOne: {
    height: moderateScale(9),
  },

  barTwo: {
    height: moderateScale(18),
  },

  barThree: {
    height: moderateScale(13),
  },

  /* ================================================================ */
  /* ARTWORK                                                          */
  /* ================================================================ */

  artwork: {
    width: moderateScale(50),

    height: moderateScale(50),

    flexShrink: 0,

    position: "relative",

    overflow: "hidden",

    borderRadius: moderateScale(8),

    backgroundColor: colors.surfaceElevated,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.08)",
  },

  artworkImage: {
    position: "absolute",

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    width: "100%",
    height: "100%",

    resizeMode: "cover",
  },

  artworkFallback: {
    position: "absolute",

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: colors.surfaceElevated,
  },

  activeArtwork: {
    borderColor: "rgba(168,85,247,0.42)",

    shadowColor: colors.primary,

    shadowOpacity: 0.28,

    shadowRadius: 9,

    elevation: 5,
  },

  artworkOverlay: {
    position: "absolute",

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(168,85,247,0.40)",
  },

  playCircle: {
    width: moderateScale(28),

    height: moderateScale(28),

    borderRadius: moderateScale(14),

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(15,12,20,0.92)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.20)",
  },

  /* ================================================================ */
  /* SONG INFO                                                        */
  /* ================================================================ */

  info: {
    flex: 1,

    minWidth: 0,

    marginLeft: moderateScale(14),

    marginRight: moderateScale(10),

    justifyContent: "center",
  },

  title: {
    fontSize: moderateScale(15),

    lineHeight: moderateScale(19),

    fontWeight: "700",

    color: colors.text,

    letterSpacing: -0.25,
  },

  activeTitle: {
    fontWeight: "800",

    color: colors.text,
  },

  meta: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    marginTop: moderateScale(6),

    minWidth: 0,
  },

  artist: {
    flexShrink: 1,

    fontSize: moderateScale(10.5),

    lineHeight: moderateScale(13),

    color: colors.textMuted,
  },

  metaDot: {
    width: moderateScale(3),

    height: moderateScale(3),

    borderRadius: moderateScale(2),

    marginHorizontal: moderateScale(6),

    backgroundColor: colors.primary,
  },

  playingText: {
    fontSize: moderateScale(9),

    fontWeight: "600",

    color: colors.primary,
  },

  /* ================================================================ */
  /* ACTIONS                                                          */
  /* ================================================================ */

  actions: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    flexShrink: 0,

    gap: moderateScale(6),

    paddingRight: moderateScale(2),
  },

  actionButton: {
    width: moderateScale(38),

    height: moderateScale(38),

    borderRadius: moderateScale(12),

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.035)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.055)",
  },

  favoriteButton: {
    backgroundColor: "rgba(168,85,247,0.13)",

    borderColor: "rgba(168,85,247,0.25)",
  },

  deleteButton: {
    backgroundColor: "rgba(239,68,68,0.08)",

    borderColor: "rgba(239,68,68,0.20)",
  },

  actionPressed: {
    opacity: 0.55,

    transform: [
      {
        scale: 0.9,
      },
    ],
  },
});

export default SongsSmollCard;
