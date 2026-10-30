import React, { memo, useMemo, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useResponsive } from "react-native-fluid-styles";
import { useTheme } from "@/themes/theme.context";

const MOODS = [
  { id: "romantic", label: "Romantic", icon: "heart-outline" as const },
  { id: "chill", label: "Chill", icon: "cloud-outline" as const },
  { id: "sad", label: "Sad", icon: "rainy-outline" as const },
  { id: "old", label: "Old Hits", icon: "disc-outline" as const },
  { id: "new", label: "New", icon: "sparkles-outline" as const },
  { id: "party", label: "Party", icon: "flash-outline" as const },
];

type RifflyHeroProps = {
  onMoodSelect?: (mood: string) => void;
  onGlobalRadioPress?: () => void;
};

function RifflyHero({ onMoodSelect, onGlobalRadioPress }: RifflyHeroProps) {
  const { Theme } = useTheme();
  const r = useResponsive();
  const [selectedMood, setSelectedMood] = useState("chill");
  const styles = useStyles();
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    onMoodSelect?.(mood);
  };

  return (
    <View style={styles.container}>
      {/* Hero heading */}
      <View style={styles.headingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>YOUR MUSIC SPACE</Text>

          <Text style={styles.heading}>
            Feel every{"\n"}
            <Text style={styles.headingAccent}>beat.</Text>
          </Text>

          <Text style={styles.description}>
            Music for your mood, every moment.
          </Text>
        </View>

        <View style={styles.musicIcon}>
          <Ionicons
            name="musical-notes"
            size={r.ms(24)}
            color={Theme.colors.primary}
          />
        </View>
      </View>

      {/* Mood selector */}
      <View style={styles.moodHeadingRow}>
        <Text style={styles.moodHeading}>What's your mood?</Text>
        <Text style={styles.moodHint}>PICK YOUR VIBE</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodList}
      >
        {MOODS.map((mood) => {
          const selected = selectedMood === mood.id;

          return (
            <Pressable
              key={mood.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => handleMoodSelect(mood.id)}
              style={({ pressed }) => [
                styles.moodButton,
                selected && styles.moodButtonActive,
                pressed && { opacity: 0.75 },
              ]}
            >
              <Ionicons
                name={mood.icon}
                size={r.ms(14)}
                color={selected ? Theme.colors.background : Theme.colors.text}
              />

              <Text
                style={[styles.moodText, selected && styles.moodTextActive]}
              >
                {mood.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Global Radio section */}
      <View style={styles.radioHeadingRow}>
        <Text style={styles.radioHeading}>Made for music lovers</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onGlobalRadioPress}
          style={styles.radioSeeAll}
        >
          <Text style={styles.radioSeeAllText}>Listen</Text>
          <Ionicons
            name="arrow-forward"
            size={r.ms(13)}
            color={Theme.colors.primary}
          />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Play Global Radio"
        onPress={onGlobalRadioPress}
        style={({ pressed }) => [
          styles.radioCard,
          pressed && {
            opacity: 0.94,
            transform: [{ scale: 0.99 }],
          },
        ]}
      >
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&q=85",
          }}
          resizeMode="cover"
          style={styles.radioImage}
        >
          <View style={styles.imageOverlay} />

          <View style={styles.radioContent}>
            <View style={styles.radioTopRow}>
              <View style={styles.radioTag}>
                <Ionicons
                  name="radio-outline"
                  size={r.ms(13)}
                  color="#FFFFFF"
                />
                <Text style={styles.radioTagText}>RIFFLY RADIO</Text>
              </View>

              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE VIBES</Text>
              </View>
            </View>

            <View>
              <Text style={styles.radioTitle}>Global Radio</Text>

              <Text style={styles.radioSubtitle}>One world. Every beat.</Text>

              <View style={styles.radioBottomRow}>
                <View style={styles.listenerRow}>
                  <Ionicons
                    name="headset-outline"
                    size={r.ms(15)}
                    color="#FFFFFF"
                  />
                  <Text style={styles.listenerText}>
                    Discover your next favorite sound
                  </Text>
                </View>

                <View style={styles.playButton}>
                  <Ionicons
                    name="play"
                    size={r.ms(19)}
                    color="#171326"
                    style={{ marginLeft: r.ms(3) }}
                  />
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();
  return useMemo(() => {
    return StyleSheet.create({
      container: {
        paddingTop: r.ms(8),
        paddingBottom: r.ms(12),
        paddingHorizontal: r.ms(16),
      },

      headingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: r.ms(5),
      },

      eyebrow: {
        color: Theme.colors.primary,
        fontSize: r.ms(26),
        fontWeight: "800",
        letterSpacing: 1.8,
        textTransform: "uppercase",
        marginBottom: r.ms(5),
      },

      heading: {
        color: Theme.colors.text,
        fontSize: r.ms(27),
        lineHeight: r.ms(32),
        fontWeight: "800",
        letterSpacing: -0.9,
      },

      headingAccent: {
        color: Theme.colors.primary,
      },

      description: {
        color: Theme.colors.text,
        opacity: 0.65,
        fontSize: r.ms(12),
        lineHeight: r.ms(18),
        marginTop: r.ms(5),
      },

      musicIcon: {
        width: r.ms(44),
        height: r.ms(44),
        borderRadius: r.ms(15),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Theme.styles.Card.backgroundColor,
        borderWidth: 1,
        borderColor: Theme.styles.Card.borderColor,
      },

      moodHeadingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: r.ms(22),
        marginBottom: r.ms(11),
      },

      moodHeading: {
        color: Theme.colors.text,
        fontSize: r.ms(18),
        fontWeight: "800",
        letterSpacing: -0.3,
      },

      moodHint: {
        color: Theme.colors.text,
        opacity: 0.5,
        fontSize: r.ms(10),
        fontWeight: "500",
      },

      moodList: {
        paddingRight: r.ms(16),
        gap: r.ms(8),
      },

      moodButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: r.ms(6),
        height: r.ms(40),
        paddingHorizontal: r.ms(12),
        borderRadius: r.ms(20),
        borderWidth: 1,
        borderColor: Theme.styles.Card.borderColor,
        backgroundColor: Theme.styles.Card.backgroundColor,
      },

      moodButtonActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
      },

      moodText: {
        color: Theme.colors.text,
        fontSize: r.ms(11),
        fontWeight: "600",
      },

      moodTextActive: {
        color: Theme.colors.background,
      },

      radioHeadingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: r.ms(23),
        marginBottom: r.ms(11),
      },

      radioHeading: {
        color: Theme.colors.text,
        fontSize: r.ms(17),
        fontWeight: "800",
        letterSpacing: -0.4,
      },

      radioSeeAll: {
        flexDirection: "row",
        alignItems: "center",
        gap: r.ms(3),
      },

      radioSeeAllText: {
        color: Theme.colors.primary,
        fontSize: r.ms(11),
        fontWeight: "700",
      },

      radioCard: {
        height: r.ms(178),
        borderRadius: r.ms(22),
        overflow: "hidden",
        backgroundColor: "#211833",
      },

      radioImage: {
        flex: 1,
        justifyContent: "space-between",
      },

      imageOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(12, 8, 27, 0.48)",
      },

      radioContent: {
        flex: 1,
        padding: r.ms(15),
        justifyContent: "space-between",
      },

      radioTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },

      radioTag: {
        flexDirection: "row",
        alignItems: "center",
        gap: r.ms(5),
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        borderRadius: r.ms(20),
        paddingHorizontal: r.ms(9),
        paddingVertical: r.ms(6),
      },

      radioTagText: {
        color: "#FFFFFF",
        fontSize: r.ms(9),
        fontWeight: "800",
        letterSpacing: 0.7,
      },

      liveBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: r.ms(5),
        paddingHorizontal: r.ms(8),
        paddingVertical: r.ms(5),
        borderRadius: r.ms(20),
        backgroundColor: "rgba(0,0,0,0.28)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
      },

      liveDot: {
        width: r.ms(6),
        height: r.ms(6),
        borderRadius: r.ms(3),
        backgroundColor: "#62E6A6",
      },

      liveText: {
        color: "#FFFFFF",
        fontSize: r.ms(9),
        fontWeight: "800",
        letterSpacing: 0.8,
      },

      radioTitle: {
        color: "#FFFFFF",
        fontSize: r.ms(27),
        lineHeight: r.ms(32),
        fontWeight: "900",
        letterSpacing: -0.8,
      },

      radioSubtitle: {
        color: "#FFFFFF",
        opacity: 0.86,
        fontSize: r.ms(11),
        lineHeight: r.ms(16),
        marginTop: r.ms(3),
      },

      radioBottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: r.ms(10),
      },

      listenerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: r.ms(6),
        flexShrink: 1,
        marginRight: r.ms(8),
      },

      listenerText: {
        color: "#FFFFFF",
        fontSize: r.ms(10),
        fontWeight: "600",
        opacity: 0.9,
        flexShrink: 1,
      },

      playButton: {
        width: r.ms(42),
        height: r.ms(42),
        borderRadius: r.ms(21),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
      },
    });
  }, [Theme, r]);
};

export const MemoizedRifflyHero = memo(RifflyHero);

export default MemoizedRifflyHero;
