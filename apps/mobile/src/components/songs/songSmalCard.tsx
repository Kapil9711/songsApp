import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { useTheme } from "@/themes/theme.context";
import { useResponsive, useResponsiveStyles } from "react-native-fluid-styles";

// const showAlert = (deleteFile: any, fileName: string) => {
//   Alert.alert(
//     "Delete File",
//     "Are you sure you want to delete this file?",
//     [
//       {
//         text: "Cancel",
//         style: "cancel",
//       },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             const user: any = await getValueInAsync("user");

//             const userId = JSON.parse(user || "{}")?._id;

//             deleteFile(`${fileName}_${userId}`);
//           } catch (error) {
//             console.error("Failed to delete file:", error);
//           }
//         },
//       },
//     ],
//     {
//       cancelable: true,
//     },
//   );
// };

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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
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
                size={r.ms(22)}
                color={Theme.colors.text}
              />
            </View>
          )}

          {isActive && (
            <View style={styles.artworkOverlay}>
              <View style={styles.playCircle}>
                <Ionicons
                  name="volume-high"
                  size={r.ms(11)}
                  color={Theme.colors.text}
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

                // handleFavorite(song);
              }}
              hitSlop={6}
              style={({ pressed }) => [
                styles.actionButton,
                // isFav && styles.favoriteButton,
                pressed && styles.actionPressed,
              ]}
            >
              <Ionicons
                // name={isFav ? "heart" : "heart-outline"}
                name={"heart-outline"}
                size={r.ms(19)}
                // color={isFav ? Theme.colors.primary : Theme.colors.text}
                color={Theme.colors.text}
              />
            </Pressable>

            {/* ---------------------------------------------------- */}
            {/* DOWNLOAD                                               */}
            {/* ---------------------------------------------------- */}

            <Pressable
              //   onPress={(event) => {
              //     event.stopPropagation();

              //     handleDownload(
              //       song?.downloadUrl?.[4]?.url,
              //       song?.image?.[2]?.url,
              //       song?.name,
              //     );
              //   }}
              hitSlop={6}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionPressed,
              ]}
            >
              <Ionicons
                name="download-outline"
                size={r.ms(19)}
                color={Theme.colors.textMuted}
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
              color={Theme.colors.error}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

const useStyles = () => {
  const { Theme } = useTheme();
  return useResponsiveStyles((r) => {
    return {
      /* ================================================================ */
      /* CARD                                                             */
      /* ================================================================ */

      container: {
        width: "100%",

        minHeight: r.ms(65),

        marginVertical: r.ms(4),

        paddingHorizontal: r.ms(8),

        borderRadius: r.ms(18),

        backgroundColor: "rgba(255,255,255,0.018)",

        borderWidth: 1,

        borderColor: "rgba(255,255,255,0.055)",

        position: "relative",

        overflow: "hidden",
      },

      activeContainer: {
        backgroundColor: "rgba(168,85,247,0.055)",

        borderColor: "rgba(168,85,247,0.22)",

        shadowColor: Theme.colors.primary,

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

        minHeight: r.ms(63),

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

        top: r.ms(18),

        bottom: r.ms(18),

        width: r.ms(3),

        borderRadius: r.ms(3),

        backgroundColor: Theme.colors.primary,

        shadowColor: Theme.colors.primary,

        shadowOpacity: 0.8,

        shadowRadius: 8,

        elevation: 5,
      },

      /* ================================================================ */
      /* NUMBER                                                           */
      /* ================================================================ */

      numberContainer: {
        width: r.ms(32),

        height: "100%",

        alignItems: "center",

        justifyContent: "center",

        flexShrink: 0,
      },

      number: {
        fontSize: r.ms(10),

        fontWeight: "600",

        color: Theme.colors.text,

        letterSpacing: 0.4,
      },

      /* ================================================================ */
      /* EQUALIZER                                                        */
      /* ================================================================ */

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

        backgroundColor: Theme.colors.primary,
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

      /* ================================================================ */
      /* ARTWORK                                                          */
      /* ================================================================ */

      artwork: {
        width: r.ms(50),

        height: r.ms(50),

        flexShrink: 0,

        position: "relative",

        overflow: "hidden",

        borderRadius: r.ms(8),

        backgroundColor: Theme.colors.background,

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

        backgroundColor: Theme.colors.background,
      },

      activeArtwork: {
        borderColor: "rgba(168,85,247,0.42)",

        shadowColor: Theme.colors.primary,

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
        width: r.ms(28),

        height: r.ms(28),

        borderRadius: r.ms(14),

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

        marginLeft: r.ms(14),

        marginRight: r.ms(10),

        justifyContent: "center",
      },

      title: {
        fontSize: r.ms(15),

        lineHeight: r.ms(19),

        fontWeight: "700",

        color: Theme.colors.text,

        letterSpacing: -0.25,
      },

      activeTitle: {
        fontWeight: "800",

        color: Theme.colors.text,
      },

      meta: {
        width: "100%",

        flexDirection: "row",

        alignItems: "center",

        marginTop: r.ms(6),

        minWidth: 0,
      },

      artist: {
        flexShrink: 1,

        fontSize: r.ms(10.5),

        lineHeight: r.ms(13),

        color: Theme.colors.text,
      },

      metaDot: {
        width: r.ms(3),

        height: r.ms(3),

        borderRadius: r.ms(2),

        marginHorizontal: r.ms(6),

        backgroundColor: Theme.colors.primary,
      },

      playingText: {
        fontSize: r.ms(9),

        fontWeight: "600",

        color: Theme.colors.primary,
      },

      /* ================================================================ */
      /* ACTIONS                                                          */
      /* ================================================================ */

      actions: {
        flexDirection: "row",

        alignItems: "center",

        justifyContent: "center",

        flexShrink: 0,

        gap: r.ms(6),

        paddingRight: r.ms(2),
      },

      actionButton: {
        width: r.ms(38),

        height: r.ms(38),

        borderRadius: r.ms(12),

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
    };
  });
};

export const SongSmallCard = memo(SongsSmollCard);
