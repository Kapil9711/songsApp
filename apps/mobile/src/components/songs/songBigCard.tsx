import { useTheme } from "@/themes/theme.context";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { useResponsive } from "react-native-fluid-styles";

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

  const showPlaying = type === "song" && isPlaying;

  return (
    <View style={[styles.card, showPlaying && styles.playingCard]}>
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

        {type !== "song" && (
          <View style={styles.typeBadge}>
            <Ionicons
              name={type === "album" ? "disc-outline" : "musical-notes-outline"}
              size={r.ms(12)}
              color={Theme.colors.background}
            />
          </View>
        )}

        {showPlaying && (
          <View style={styles.playingBadge}>
            <View style={styles.playingIndicator}>
              <View style={styles.playingDot} />
            </View>

            {[7, 13, 9, 15].map((height, index) => (
              <View
                key={index}
                style={[styles.equalizerBar, { height: r.ms(height) }]}
              />
            ))}

            <Text style={styles.playingLabel}>PLAYING</Text>
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

        {showPlaying && (
          <View style={styles.playingCaption}>
            <View style={styles.captionLine} />
            <Text style={styles.playingCaptionText}>Now playing</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  const primary = Theme.colors.primary;
  const background = Theme.colors.background;
  const text = Theme.colors.text;
  const border = Theme.styles.Card.borderColor;
  const cardBackground = Theme.styles.Card.backgroundColor;

  // Derive translucent accent colors from the active theme.
  const accentSurface = `${primary}18`;
  const accentBorder = `${primary}55`;
  const accentGlow = `${primary}25`;

  return StyleSheet.create({
    card: {
      flexShrink: 0,
      height: r.ms(230),
      borderRadius: r.ms(16),
      overflow: "hidden",
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },

    playingCard: {
      borderColor: primary,
      borderWidth: r.ms(1.5),
      backgroundColor: cardBackground,
      shadowColor: primary,
      shadowOffset: { width: 0, height: r.ms(2) },
      shadowOpacity: 0.2,
      shadowRadius: r.ms(8),
      elevation: 4,
    },

    imageContainer: {
      width: "100%",
      height: r.vs(154),
      position: "relative",
      overflow: "hidden",
      backgroundColor: cardBackground,
    },

    image: {
      width: "100%",
      height: "100%",
    },

    imagePlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: cardBackground,
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
      backgroundColor: `${background}DD`,
      borderWidth: 1,
      borderColor: border,
    },

    playingBadge: {
      position: "absolute",
      right: r.ms(9),
      bottom: r.ms(9),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(4),
      paddingHorizontal: r.ms(9),
      height: r.ms(31),
      borderRadius: r.ms(10),
      backgroundColor: `${background}F2`,
      borderWidth: 1,
      borderColor: accentBorder,
      shadowColor: primary,
      shadowOffset: { width: 0, height: r.ms(1) },
      shadowOpacity: 0.16,
      shadowRadius: r.ms(5),
      elevation: 3,
    },

    playingIndicator: {
      width: r.ms(7),
      height: r.ms(7),
      borderRadius: r.ms(4),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: accentSurface,
      marginRight: r.ms(2),
    },

    playingDot: {
      width: r.ms(4),
      height: r.ms(4),
      borderRadius: r.ms(2),
      backgroundColor: primary,
    },

    equalizerBar: {
      width: r.ms(3),
      borderRadius: r.ms(2),
      backgroundColor: primary,
    },

    playingLabel: {
      marginLeft: r.ms(3),
      fontSize: r.ms(8),
      fontWeight: "800",
      letterSpacing: 0.6,
      color: text,
    },

    infoContainer: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: r.ms(12),
      paddingVertical: r.ms(8),
      backgroundColor: cardBackground,
    },

    title: {
      fontSize: r.ms(14),
      lineHeight: r.ms(18),
      fontWeight: "700",
      color: text,
      letterSpacing: -0.2,
    },

    subtitle: {
      marginTop: r.ms(3),
      fontSize: r.ms(11.5),
      lineHeight: r.ms(15),
      fontWeight: "500",
      color: text,
      opacity: 0.7,
    },

    playingCaption: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(5),
      marginTop: r.ms(5),
    },

    captionLine: {
      width: r.ms(14),
      height: r.ms(2),
      borderRadius: r.ms(2),
      backgroundColor: primary,
      shadowColor: primary,
      shadowOpacity: 0.3,
      shadowRadius: r.ms(3),
      shadowOffset: { width: 0, height: 0 },
    },

    playingCaptionText: {
      fontSize: r.ms(9),
      fontWeight: "600",
      color: primary,
    },
  });
};

export default SongBigCard;
