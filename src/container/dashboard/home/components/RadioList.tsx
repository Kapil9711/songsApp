import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import fifties from "@/50s.json";
import sixites from "@/60s.json";
import seventy from "@/70s.json";
import eighty from "@/80s.json";
import ninty from "@/90s.json";
import twoThousand from "@/2000s.json";
import twoThousand10 from "@/2010s.json";
import twoThousand20 from "@/2020s.json";

import hindiTreding1 from "@/trending1.json";
import hindiTreding2 from "@/trending2.json";
import hindiTreding3 from "@/trending3.json";

import { colors } from "@/src/constants/theme";

import { useAudioContext } from "@/src/providers/AudioProvider";
const RADIO_CATEGORIES = [
  { id: "50s", title: "50s", icon: "musical-notes-outline" },
  { id: "60s", title: "60s", icon: "musical-notes-outline" },
  { id: "70s", title: "70s", icon: "musical-notes-outline" },
  { id: "80s", title: "80s", icon: "musical-notes-outline" },
  { id: "90s", title: "90s", icon: "musical-notes-outline" },
  { id: "2000s", title: "2000s", icon: "musical-notes-outline" },
  { id: "2010s", title: "2010s", icon: "musical-notes-outline" },
  { id: "2020s", title: "2020s", icon: "musical-notes-outline" },

  //   { id: "new", title: "New", icon: "sparkles-outline" },
  { id: "handpicked", title: "Handpicked", icon: "heart-outline" },
  { id: "trending", title: "Trending", icon: "trending-up-outline" },
  //   { id: "chill", title: "Chill", icon: "moon-outline" },
  //   { id: "party", title: "Party", icon: "musical-notes-outline" },

  //   { id: "workout", title: "Workout", icon: "fitness-outline" },
  //   { id: "love", title: "Love", icon: "heart-outline" },
  //   { id: "indie", title: "Indie", icon: "disc-outline" },
  //   { id: "rock", title: "Rock", icon: "flash-outline" },
  //   { id: "hiphop", title: "Hip-Hop", icon: "mic-outline" },
  //   { id: "devotional", title: "Devotional", icon: "flower-outline" },
];

type RadioCategory = (typeof RADIO_CATEGORIES)[number];

interface RadioProps {
  onCategoryPress?: (category: RadioCategory) => void;
}

const Radio = ({ onCategoryPress }: RadioProps) => {
  const [selected, setSelected] = useState("trending");

  // Convert categories into columns of 2
  const columns = useMemo(() => {
    const result: RadioCategory[][] = [];

    for (let i = 0; i < RADIO_CATEGORIES.length; i += 2) {
      result.push(RADIO_CATEGORIES.slice(i, i + 2));
    }

    return result;
  }, []);

  const { currentSong, setCurrentSong, setCurrentSongList } = useAudioContext();

  const handleSongPress = async (list: any) => {
    const item = list?.[0];
    setCurrentSong(item);
    setCurrentSongList(list);
    // if (item.type || item.downloadUrl?.[0]?.url) {
    //   try {
    //     const user: any = await getValueInAsync("user");

    //     const userId = JSON.parse(user || "{}")?._id;

    //     socket?.emit("songPlaying", {
    //       senderId: userId,
    //       song: item,
    //     });
    //   } catch (error) {
    //     console.log("Unable to play song:", error);
    //   }
    // }
  };

  const handlePress = (category: RadioCategory) => {
    setSelected(category.id);
    onCategoryPress?.(category);
    switch (category.id) {
      case "50s":
        handleSongPress(shuffleArray(fifties?.data));
        break;
      case "60s":
        handleSongPress(shuffleArray(sixites?.data));
        break;
      case "70s":
        handleSongPress(shuffleArray(seventy?.data));
        break;
      case "80s":
        handleSongPress(shuffleArray(eighty?.data));
        break;
      case "90s":
        handleSongPress(shuffleArray(ninty?.data));
        break;
      case "2000s":
        handleSongPress(shuffleArray(twoThousand?.data));
        break;
      case "2010s":
        handleSongPress(shuffleArray(twoThousand10?.data));
        break;
      case "2020s":
        handleSongPress(shuffleArray(twoThousand20?.data));
        break;
      case "trending":
        handleSongPress(
          shuffleArray([
            ...hindiTreding1?.data,
            ...hindiTreding2?.data,
            ...hindiTreding3?.data,
          ]),
        );
        break;
      case "handpicked":
        handleSongPress(
          shuffleArray([
            ...hindiTreding1?.data,
            ...hindiTreding2?.data,
            ...hindiTreding3?.data,
            ...twoThousand?.data,
            ...ninty?.data,
            ...eighty?.data,
            ...seventy?.data,
          ]),
        );
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.title}>Radio</Text>

        <Pressable style={styles.moreButton}>
          <Ionicons
            name="chevron-forward"
            size={moderateScale(16)}
            color={colors.textSecondary}
          />
        </Pressable>
      </View> */}

      {/* 2 Row Horizontal List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {columns.map((column, columnIndex) => (
          <View key={columnIndex} style={styles.column}>
            {column.map((category) => {
              const isSelected = selected === category.id;

              return (
                <Pressable
                  key={category.id}
                  onPress={() => handlePress(category)}
                  style={({ pressed }) => [
                    styles.category,
                    isSelected && styles.categorySelected,
                    pressed && styles.categoryPressed,
                  ]}
                >
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: moderateScale(8),
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: moderateScale(20),
                      paddingVertical: moderateScale(2),
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={moderateScale(13)}
                      color={isSelected ? colors.text : colors.textSecondary}
                    />

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.categoryText,
                        isSelected && styles.categoryTextSelected,
                      ]}
                    >
                      {category.title}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Radio;

const styles = StyleSheet.create({
  container: {
    marginTop: moderateScale(0),
  },

  header: {
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(10),

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: colors.text,
    fontSize: moderateScale(21),
    fontWeight: "700",
  },

  moreButton: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  scrollContent: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(8),
  },

  column: {
    gap: moderateScale(6),
  },

  category: {
    height: moderateScale(30),
    paddingHorizontal: moderateScale(10),

    borderRadius: moderateScale(15),

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: moderateScale(4),

    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
  },

  categorySelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  categoryText: {
    color: colors.textSecondary,
    fontSize: moderateScale(11),
    fontWeight: "600",
  },

  categoryTextSelected: {
    color: colors.text,
  },
});

export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]; // don't modify original array

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};
