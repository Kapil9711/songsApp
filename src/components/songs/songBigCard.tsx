import { useTheme } from "@/themes/theme.context";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import { useResponsive, useResponsiveStyles } from "react-native-fluid-styles";

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
  const styles = useStyles();
  const r = useResponsive();
  const { Theme } = useTheme();
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
              size={r.ms(34)}
              color={Theme.colors.text}
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
              size={r.ms(12)}
              color={Theme.colors.text}
            />
          </View>
        )}

        {/* Play button */}
        {/* <Pressable
          hitSlop={8}
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.playButtonPressed,
          ]}
        >
          <Ionicons
            name="play"
            size={r.ms(17)}
            color="#111111"
            style={styles.playIcon}
          />
        </Pressable> */}
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

const useStyles = () => {
  const { Theme } = useTheme();
  return useResponsiveStyles((r) => {
    return {
      card: {
        width: "100%",
        height: r.ms(250),
        borderRadius: r.ms(16),
        overflow: "hidden",
        backgroundColor: Theme.colors.background,
        borderWidth: 1,
        borderColor: Theme.colors.text,
      },

      /* -------------------------------------------------------------------- */
      /* Image                                                                */
      /* -------------------------------------------------------------------- */

      imageContainer: {
        width: "100%",

        height: r.ms(184),

        position: "relative",

        overflow: "hidden",

        backgroundColor: Theme.colors.background,
      },

      image: {
        width: "100%",
        height: "100%",
      },

      imagePlaceholder: {
        flex: 1,

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: Theme.colors.background,
      },

      imageOverlay: {
        position: "absolute",

        left: 0,
        right: 0,
        bottom: 0,

        height: r.ms(55),

        backgroundColor: "rgba(0,0,0,0.18)",
      },

      /* -------------------------------------------------------------------- */
      /* Type Badge                                                           */
      /* -------------------------------------------------------------------- */

      typeBadge: {
        position: "absolute",

        top: r.ms(9),
        left: r.ms(9),

        width: r.ms(28),
        height: r.ms(28),

        borderRadius: r.ms(9),

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

        right: r.ms(10),
        bottom: r.ms(10),

        width: r.ms(40),
        height: r.ms(40),

        borderRadius: r.ms(20),

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: Theme.colors.text,

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
        marginLeft: r.ms(2),
      },

      /* -------------------------------------------------------------------- */
      /* Information                                                          */
      /* -------------------------------------------------------------------- */

      infoContainer: {
        flex: 1,

        justifyContent: "center",

        paddingHorizontal: r.ms(12),

        paddingVertical: r.ms(8),

        backgroundColor: Theme.colors.background,
      },

      title: {
        fontSize: r.ms(14),

        lineHeight: r.ms(18),

        fontWeight: "700",

        color: Theme.colors.text,

        letterSpacing: -0.2,
      },

      subtitle: {
        marginTop: r.ms(3),

        fontSize: r.ms(11.5),

        lineHeight: r.ms(15),

        fontWeight: "500",

        color: Theme.colors.text,
      },
    };
  });
};

export default SongBigCard;
