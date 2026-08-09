import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getValueInAsync } from "@/src/utilities/helpers";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { useAudioContext } from "@/src/providers/AudioProvider";
import { useSocket } from "@/src/providers/socketProvider";

import SongsSmollCard from "@/src/container/dashboard/common/song-card/SongsSmollCard";
import { colors } from "@/src/constants/theme";

const Favorite = () => {
  const { setCurrentSong, setCurrentSongList, currentSong } = useAudioContext();

  const { favorite, friends } = useGlobalContext();

  const { socket } = useSocket();

  const insets = useSafeAreaInsets();

  const [page, setPage] = useState(1);
  const [active, setActive] = useState("my");

  let finaleData: any[] = [];

  if (active === "my") {
    finaleData = favorite ?? [];
  } else {
    const item = friends.find((item: any) => item?.user?.name === active);

    finaleData = item?.user?.favorite ?? [];
  }

  const handleSongPress = async (item: any) => {
    setCurrentSong(item);

    const user: any = await getValueInAsync("user");

    const userId = JSON.parse(user)?._id;

    socket?.emit("songPlaying", {
      senderId: userId,
      song: item,
    });

    setCurrentSongList(finaleData);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Favorites<Text style={styles.dot}>.</Text>
          </Text>

          <Text style={styles.subtitle}>Songs you never want to lose</Text>
        </View>

        <View style={styles.countContainer}>
          <Text style={styles.count}>{finaleData.length}</Text>

          <Text style={styles.countLabel}>songs</Text>
        </View>
      </View>

      {/* User Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>FAVORITES FROM</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {/* My Favorites */}
          <Pressable
            onPress={() => setActive("my")}
            style={[
              styles.filterButton,
              active === "my" && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                active === "my" && styles.filterTextActive,
              ]}
            >
              My Favorites
            </Text>
          </Pressable>

          {/* Friends */}
          {friends.map((item: any) => {
            const name = item?.user?.name;

            return (
              <Pressable
                key={item._id}
                onPress={() => setActive(name)}
                style={[
                  styles.filterButton,
                  active === name && styles.filterButtonActive,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.filterText,
                    active === name && styles.filterTextActive,
                  ]}
                >
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Songs */}
      <FlatList
        data={finaleData}
        keyExtractor={(item: any, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          finaleData.length === 0 && styles.emptyListContent,
        ]}
        renderItem={({ item, index }) => {
          return (
            <Pressable
              onPress={() => handleSongPress(item)}
              style={({ pressed }) => [
                styles.songItem,
                pressed && styles.songItemPressed,
              ]}
            >
              <SongsSmollCard
                isActive={currentSong?.id === item.id}
                title={item.name}
                image={item?.image?.[2]?.url}
                number={index + 1}
                song={item}
              />
            </Pressable>
          );
        }}
        onEndReached={() => {
          setPage((prev) => prev + 1);
        }}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={<EmptyFavorites />}
      />
    </View>
  );
};

const EmptyFavorites = () => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>♡</Text>
      </View>

      <Text style={styles.emptyTitle}>No favorites yet</Text>

      <Text style={styles.emptyDescription}>
        Songs you add to your favorites will appear here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.6,
  },

  dot: {
    color: colors.primary,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  countContainer: {
    minWidth: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  count: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  countLabel: {
    marginTop: 1,
    fontSize: 10,
    color: colors.textMuted,
  },

  filterSection: {
    marginBottom: 8,
  },

  filterTitle: {
    paddingHorizontal: 20,
    marginBottom: 10,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textMuted,
  },

  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },

  filterButton: {
    minHeight: 38,
    paddingHorizontal: 15,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  filterTextActive: {
    color: colors.text,
  },

  listContent: {
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 180,
  },

  songItem: {
    marginTop: 5,
    borderRadius: 14,
  },

  songItemPressed: {
    opacity: 0.7,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    minHeight: 350,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyIconText: {
    fontSize: 32,
    color: colors.primary,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  emptyDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: colors.textMuted,
  },
});

export default Favorite;
