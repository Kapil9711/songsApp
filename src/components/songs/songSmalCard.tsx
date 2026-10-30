import {
  useAddFavoriteMutation,
  useFavoriteQuery,
} from "@/app/(drawer)/(tabs)/favorite";
import { useDownloadStore } from "@/store/donwload.store";
import { useTheme } from "@/themes/theme.context";
import { downloadService } from "@/utils/download.service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useResponsive } from "react-native-fluid-styles";

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
  const { Theme } = useTheme();
  const r = useResponsive();
  const styles = useStyles();
  const { data: favoriteData } = useFavoriteQuery();
  const { mutate } = useAddFavoriteMutation();
  const isFavorite = favoriteData?.favoriteIdMap?.[song?.id];
  const downloadSongIdMap = useDownloadStore(
    (state) => state.downloadSongIdMap,
  );
  const isDownloaded = downloadSongIdMap[song?.id];

  const handleAddFavorite = (song: any) => {
    const payload = {
      name: song?.name,
      id: song?.id,
      downloadUrl: song?.downloadUrl,
      image: song?.image,
    };
    mutate(payload);
  };

  const handleDownload = async (song: any) => {
    try {
      // const payload = {
      //   id: song.id,
      //   name: song.name,
      //   downloadUrl: song.downloadUrl,
      //   image: song?.image,
      //   artists: song?.artists,
      // };
      const downloadedSong = await downloadService.downloadSong(song, {
        onProgress: (progress) => {
          console.log(`Download progress: ${progress.toFixed(0)}%`);
        },
      });

      console.log("Downloaded to:", downloadedSong.localUri);
    } catch (error) {
      console.error("Song download failed:", error);
    }
  };

  const handleDeleteSong = () => {
    downloadService.deleteSong(song?.id);
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Play ${title}`}
      style={({ pressed }) => [
        Theme.styles.px2,
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      {isActive && (
        <>
          <LinearGradient
            pointerEvents="none"
            colors={[
              `${Theme.colors.primary}30`,
              `${Theme.colors.primary}12`,
              `${Theme.colors.primary}00`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeGradient}
          />
          <View style={styles.activeLine} />
        </>
      )}

      <View style={styles.row}>
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

        <View style={[styles.artwork, isActive && styles.activeArtwork]}>
          {image ? (
            <Image
              source={{ uri: image }}
              accessibilityLabel={title}
              resizeMode="cover"
              style={styles.artworkImage}
            />
          ) : (
            <View style={styles.artworkFallback}>
              <Ionicons
                name="musical-note"
                size={r.ms(22)}
                color={Theme.colors.primary}
              />
            </View>
          )}

          {isActive && (
            <View style={styles.artworkOverlay}>
              <Ionicons
                name="volume-high"
                size={r.ms(20)}
                color={Theme.colors.background}
              />
            </View>
          )}
        </View>

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
              {song?.artists && Array.isArray(song?.artists?.primary)
                ? song.artists?.primary
                    ?.map((artist: any) => artist.name)
                    .join(", ")
                : "unknown"}
            </Text>

            {isActive && (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.playingText}>Playing</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Favorite song"
            onPress={(event) => {
              event.stopPropagation();
              handleAddFavorite(song);
            }}
            hitSlop={6}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionPressed,
            ]}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={r.ms(19)}
              color={isFavorite ? Theme.colors.primary : Theme.colors.text}
            />
          </Pressable>

          {!isDownloaded ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Download song"
              onPress={(event) => {
                event.stopPropagation();
                handleDownload(song);
              }}
              hitSlop={6}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionPressed,
              ]}
            >
              <Ionicons
                name="download-outline"
                size={r.ms(19)}
                color={Theme.colors.neutral400}
              />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete song"
              onPress={(event) => {
                event.stopPropagation();
                handleDeleteSong();
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
                size={r.ms(19)}
                color={Theme.colors.danger}
              />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  const primary = Theme.colors.primary;
  const background = Theme.colors.background;
  const text = Theme.colors.text;
  const surface = `${primary}15`;
  const border = Theme.colors.neutral200;

  return StyleSheet.create({
    container: {
      width: "100%",
      minHeight: r.ms(66),
      marginVertical: r.ms(3),
      paddingVertical: r.ms(7),
      borderRadius: r.ms(14),
      position: "relative",
      overflow: "hidden",
    },

    activeContainer: {
      backgroundColor: `${primary}12`,
      borderColor: `${primary}50`,
      shadowColor: primary,
      shadowOpacity: 0.12,
      shadowRadius: r.ms(8),
      elevation: 2,
    },

    pressed: {
      opacity: 0.78,
      transform: [{ scale: 0.985 }],
    },

    row: {
      width: "100%",
      minHeight: r.ms(50),
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

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
      top: r.ms(15),
      bottom: r.ms(15),
      width: r.ms(3),
      borderRadius: r.ms(2),
      backgroundColor: primary,
    },

    numberContainer: {
      width: r.ms(32),
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    number: {
      ...Theme.styles.Text,
      fontSize: r.ms(10),
      fontWeight: "600",
      color: Theme.colors.neutral400,
      letterSpacing: 0.4,
    },

    equalizer: {
      height: r.ms(24),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(2),
    },

    equalizerBar: {
      width: r.ms(3),
      borderRadius: r.ms(2),
      backgroundColor: primary,
    },

    barOne: {
      height: r.ms(9),
    },

    barTwo: {
      height: r.ms(18),
    },

    barThree: {
      height: r.ms(13),
    },

    artwork: {
      width: r.ms(50),
      height: r.ms(50),
      flexShrink: 0,
      position: "relative",
      overflow: "hidden",
      borderRadius: r.ms(9),
      backgroundColor: surface,
    },

    artworkImage: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },

    artworkFallback: {
      ...Theme.styles.Bg,
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surface,
    },

    activeArtwork: {
      borderColor: primary,
      shadowColor: primary,
      shadowOpacity: 0.2,
      shadowRadius: r.ms(5),
      elevation: 3,
    },

    artworkOverlay: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}65`,
    },

    info: {
      flex: 1,
      minWidth: 0,
      marginLeft: r.ms(10),
      marginRight: r.ms(7),
      justifyContent: "center",
    },

    title: {
      ...Theme.styles.Text,
      fontSize: r.ms(13),
      lineHeight: r.ms(18),
      fontWeight: "700",
      color: text,
      letterSpacing: -0.2,
    },

    activeTitle: {
      fontWeight: "800",
      color: text,
    },

    meta: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      marginTop: r.ms(4),
      minWidth: 0,
    },

    artist: {
      ...Theme.styles.Text,
      flexShrink: 1,
      fontSize: r.ms(10),
      lineHeight: r.ms(13),
      color: Theme.colors.neutral400,
    },

    metaDot: {
      width: r.ms(3),
      height: r.ms(3),
      borderRadius: r.ms(2),
      marginHorizontal: r.ms(6),
      backgroundColor: primary,
    },

    playingText: {
      fontSize: r.ms(9),
      fontWeight: "600",
      color: primary,
    },

    actions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      gap: r.ms(4),
    },

    actionButton: {
      width: r.ms(32),
      height: r.ms(36),
      borderRadius: r.ms(10),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surface,
    },

    deleteButton: {
      backgroundColor: `${Theme.colors.danger}12`,
      borderColor: `${Theme.colors.danger}35`,
    },

    actionPressed: {
      opacity: 0.55,
      transform: [{ scale: 0.94 }],
    },
  });
};

export const SongSmallCard = memo(SongsSmollCard);
