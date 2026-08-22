import React from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import { colors } from "@/src/constants/theme";
import { useAudioContext } from "@/src/providers/AudioProvider";
import { shuffleArray } from "./RadioList";
import oldies from "@/oldies.json";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_WIDTH = SCREEN_WIDTH - moderateScale(32);
const CARD_HEIGHT = moderateScale(190);

type EraCard = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

const ERA_CARDS: EraCard[] = [
  {
    id: "oldies",
    title: "Oldies For You",
    subtitle: "Timeless classics that never get old.",
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "90s",
    title: "90s For You",
    subtitle: "The soundtrack of a golden generation.",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "modern",
    title: "Modern For You",
    subtitle: "Today's hits. Tomorrow's classics.",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85",
  },
];

type Props = {
  onPress?: (item: EraCard) => void;
};

export default function HandpickedEraSection({ onPress }: Props) {
  const { currentSong, setCurrentSong, setCurrentSongList } = useAudioContext();

  const handleSongPress = async (list: any) => {
    const item = list?.[0];
    setCurrentSong(item);
    setCurrentSongList(list);
  };

  const handlePress = (id: any) => {
    switch (id) {
      case "oldies":
        handleSongPress(shuffleArray(oldies?.data));
        break;
      case "90s":
        handleSongPress(shuffleArray(oldies?.data));
        break;
      case "modern":
        handleSongPress(shuffleArray(oldies?.data));
        break;
    }
  };
  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Handpicked For You</Text>
          <Text style={styles.description}>Music picked for your mood</Text>
        </View>
      </View> */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + moderateScale(12)}
        decelerationRate="fast"
      >
        {ERA_CARDS.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => handlePress?.(item.id)}
          >
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.background}
              imageStyle={styles.image}
            >
              {/* Dark gradient-like overlays */}
              <View style={styles.fullOverlay} />
              <View style={styles.leftOverlay} />

              <View style={styles.content}>
                <Text style={styles.label}>HANDPICKED</Text>

                <Text style={styles.title}>{item.title}</Text>

                <Text style={styles.subtitle}>{item.subtitle}</Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.playButton,
                    pressed && styles.playButtonPressed,
                  ]}
                  onPress={() => onPress?.(item)}
                >
                  <View style={styles.playIcon} />

                  <Text style={styles.playText}>Play Now</Text>
                </Pressable>
              </View>

              {/* Decorative dots */}
              <View style={styles.dots}>
                {ERA_CARDS.map((dot) => (
                  <View
                    key={dot.id}
                    style={[styles.dot, dot.id === item.id && styles.activeDot]}
                  />
                ))}
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: moderateScale(12),
  },

  header: {
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(12),
  },

  heading: {
    color: colors.text,
    fontSize: moderateScale(20),
    fontWeight: "700",
  },

  description: {
    color: colors.textSecondary,
    fontSize: moderateScale(12),
    marginTop: moderateScale(3),
  },

  scrollContent: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(12),
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: moderateScale(20),
    overflow: "hidden",
    backgroundColor: colors.surface,
  },

  background: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },

  image: {
    resizeMode: "cover",
  },

  /*
   * Overall dark overlay.
   * This makes white/purple text readable.
   */
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },

  /*
   * Stronger black on the left side
   * where the text is displayed.
   */
  leftOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: "75%",
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },

  content: {
    paddingLeft: moderateScale(18),
    paddingRight: moderateScale(20),
    zIndex: 2,
  },

  label: {
    color: colors.primary,
    fontSize: moderateScale(11),
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: moderateScale(6),
  },

  title: {
    color: colors.text,
    fontSize: moderateScale(26),
    fontWeight: "800",
    lineHeight: moderateScale(31),
    maxWidth: "65%",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(17),
    marginTop: moderateScale(5),
    maxWidth: "52%",
  },

  playButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: moderateScale(14),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    marginTop: moderateScale(12),
  },

  playButtonPressed: {
    backgroundColor: colors.primaryPressed,
    transform: [{ scale: 0.97 }],
  },

  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: moderateScale(6),
    borderBottomWidth: moderateScale(6),
    borderLeftWidth: moderateScale(9),
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: colors.text,
    marginRight: moderateScale(7),
  },

  playText: {
    color: colors.text,
    fontSize: moderateScale(12),
    fontWeight: "700",
  },

  dots: {
    position: "absolute",
    bottom: moderateScale(10),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: moderateScale(6),
  },

  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "rgba(255,255,255,0.45)",
  },

  activeDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: colors.primary,
  },
});
