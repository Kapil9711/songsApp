import { useTheme } from "@/themes/theme.context";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View, useWindowDimensions } from "react-native";
import { useResponsive, useResponsiveStyles } from "react-native-fluid-styles";

type SongBigCardProps = {
  image?: string;
  title?: string;
  subtitle?: string;
  type?: string;
  isPlaying?: boolean;
};

const SongBigCard = ({
  image,
  title = "Unknown",
  subtitle = "",
  type = "song",
  isPlaying = false,
}: SongBigCardProps) => {
  const styles = useStyles();
  const r = useResponsive();
  const { Theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const maxTextLength = Math.max(title.length, subtitle.length);
  const cardWidth = Math.min(
    screenWidth * 0.72,
    Math.max(r.ms(145), maxTextLength * r.ms(7.5) + r.ms(28)),
  );

  const showPlaying = type === "song" && isPlaying;

  return (
    <View
      style={[
        styles.card,
        { width: cardWidth },
        showPlaying && styles.playingCard,
      ]}
    >
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

        <View style={styles.imageOverlay} />

        {type !== "song" && (
          <View style={styles.typeBadge}>
            <Ionicons
              name={type === "album" ? "disc-outline" : "musical-notes-outline"}
              size={r.ms(12)}
              color="#FFFFFF"
            />
          </View>
        )}

        {showPlaying && (
          <View style={styles.playingBadge}>
            {[0, 1, 2, 3].map((bar, index) => (
              <View
                key={bar}
                style={[
                  styles.equalizerBar,
                  {
                    height: r.ms([7, 13, 9, 15][index]),
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>

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

  return useResponsiveStyles((r) => ({
    card: {
      // Width is calculated from the title and subtitle.
      flexShrink: 0,
      height: r.ms(210),
      borderRadius: r.ms(16),
      overflow: "hidden",
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: Theme.colors.primary,
    },

    playingCard: {
      borderColor: "#C5FF4A",
      borderWidth: 1.5,
    },

    imageContainer: {
      width: "100%",
      height: r.ms(164),
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

    playingBadge: {
      position: "absolute",
      right: r.ms(10),
      bottom: r.ms(10),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(3),
      paddingHorizontal: r.ms(9),
      height: r.ms(30),
      borderRadius: r.ms(10),
      backgroundColor: "rgba(10,15,20,0.82)",
      borderWidth: 1,
      borderColor: "rgba(197,255,74,0.4)",
    },

    equalizerBar: {
      width: r.ms(3),
      borderRadius: r.ms(2),
      backgroundColor: "#C5FF4A",
    },

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
  }));
};

export default SongBigCard;
