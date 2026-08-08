import React, { useMemo } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

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

const SongsSmollCard = ({
  image,
  title,
  isActive,
  number,
  song,
  isShowButton = true,
}: {
  image: string;
  title: string;
  isActive: boolean;
  number: number;
  song?: any;
  isShowButton?: boolean;
}) => {
  const { deleteFile, handleDownload, handleFavorite, favorite } =
    useGlobalContext();

  const isFav = useMemo(() => {
    return favorite.some((item: any) => song?.id === item.id);
  }, [favorite, song]);

  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      {/* Active indicator */}
      {isActive && <View style={styles.activeIndicator} />}

      {/* Song number */}
      <View style={styles.numberContainer}>
        {isActive ? (
          <Ionicons name="musical-notes" size={17} color={colors.primary} />
        ) : (
          <Text style={styles.number}>{String(number).padStart(2, "0")}</Text>
        )}
      </View>

      {/* Artwork */}
      <View style={styles.imageContainer}>
        <Avatar circular size="$4">
          <Avatar.Image src={image} accessibilityLabel={title} />

          <Avatar.Fallback backgroundColor={colors.surfaceElevated}>
            <Ionicons name="musical-note" size={22} color={colors.textMuted} />
          </Avatar.Fallback>
        </Avatar>

        {isActive && (
          <View style={styles.playingOverlay}>
            <Ionicons name="volume-high" size={17} color={colors.text} />
          </View>
        )}
      </View>

      {/* Song information */}
      <View style={styles.songInfo}>
        <Text
          numberOfLines={1}
          style={[styles.title, isActive && styles.activeTitle]}
        >
          {title}
        </Text>

        <Text numberOfLines={1} style={styles.subtitle}>
          {song?.artist || "Unknown Artist"}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!isShowButton ? (
          <Pressable
            onPress={() => showAlert(deleteFile, title)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </Pressable>
        ) : (
          <>
            {/* Favorite */}
            <Pressable
              onPress={() => handleFavorite(song)}
              style={({ pressed }) => [
                styles.actionButton,
                isFav && styles.favoriteButton,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={22}
                color={isFav ? colors.primary : colors.textSecondary}
              />
            </Pressable>

            {/* Download */}
            <Pressable
              onPress={() =>
                handleDownload(
                  song?.downloadUrl?.[4]?.url,
                  song?.image?.[2]?.url,
                  song?.name,
                )
              }
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <Ionicons
                name="download-outline"
                size={22}
                color={colors.textSecondary}
              />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 76,

    marginHorizontal: 8,
    marginVertical: 3,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: colors.surface,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: colors.border,

    overflow: "hidden",
  },

  activeContainer: {
    backgroundColor: colors.surfaceElevated,
    borderColor: "rgba(168, 85, 247, 0.4)",
  },

  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,

    width: 4,

    borderRadius: 4,

    backgroundColor: colors.primary,
  },

  numberContainer: {
    width: 42,

    alignItems: "center",
    justifyContent: "center",
  },

  number: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },

  imageContainer: {
    width: 52,
    height: 52,

    borderRadius: 13,

    overflow: "hidden",

    position: "relative",
  },

  playingOverlay: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(168, 85, 247, 0.72)",
  },

  songInfo: {
    flex: 1,

    minWidth: 0,

    marginLeft: 12,
    marginRight: 6,
  },

  title: {
    fontSize: 14,

    fontWeight: "600",

    color: colors.text,
  },

  activeTitle: {
    color: colors.primary,
  },

  subtitle: {
    marginTop: 4,

    fontSize: 11,

    color: colors.textMuted,
  },

  actions: {
    flexDirection: "row",

    alignItems: "center",

    gap: 6,

    paddingRight: 8,
  },

  actionButton: {
    width: 42,
    height: 42,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surfaceElevated,

    borderWidth: 1,
    borderColor: colors.border,
  },

  favoriteButton: {
    backgroundColor: "rgba(168, 85, 247, 0.14)",

    borderColor: "rgba(168, 85, 247, 0.35)",
  },

  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.10)",

    borderColor: "rgba(239, 68, 68, 0.25)",
  },

  actionButtonPressed: {
    opacity: 0.65,

    transform: [
      {
        scale: 0.92,
      },
    ],
  },
});

export default SongsSmollCard;
