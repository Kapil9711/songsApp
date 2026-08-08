import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import HorizontalList from "./HorizontalList";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { colors } from "@/src/constants/theme";

type ShowDataProps = {
  data: any;
  heading: string;
  type?: string;
  isTrending?: boolean;
  renderData?: any;
};

const ShowData = ({
  data,
  heading,
  type = "song",
  isTrending,
  renderData,
}: ShowDataProps) => {
  const router = useRouter();

  const { searchedSongList, setSongListToRender, setPage } = useGlobalContext();

  const length = data?.length ?? 0;

  const handleSeeMore = () => {
    if (type === "song") {
      if (isTrending) {
        setSongListToRender(renderData);
        setPage(999);
      } else {
        setSongListToRender(searchedSongList);
        setPage(1);
      }

      router.push("/(dashboard)/home/songs");
      return;
    }

    if (type === "album") {
      router.push("/(dashboard)/home/album");
      return;
    }

    if (type === "playlist") {
      router.push("/(dashboard)/home/playlist");
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleIndicator} />

          <Text style={styles.heading}>{heading}</Text>
        </View>

        {length > 0 && (
          <Pressable
            onPress={handleSeeMore}
            hitSlop={8}
            style={({ pressed }) => [
              styles.seeMoreButton,
              pressed && styles.seeMorePressed,
            ]}
          >
            <Text style={styles.seeMoreText}>See all</Text>

            <Text style={styles.arrow}>→</Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      {length > 0 ? (
        <HorizontalList data={data} type={type} />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>♪</Text>
          </View>

          <Text style={styles.emptyTitle}>Nothing here yet</Text>

          <Text style={styles.emptyDescription}>
            We couldn't find any {heading.toLowerCase()}.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
  },

  header: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  titleIndicator: {
    width: 4,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 9,
  },

  heading: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.2,
  },

  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingLeft: 8,
  },

  seeMorePressed: {
    opacity: 0.6,
  },

  seeMoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  arrow: {
    fontSize: 17,
    color: colors.primary,
    marginTop: -1,
  },

  emptyContainer: {
    height: 150,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
    marginBottom: 10,
  },

  emptyIconText: {
    fontSize: 22,
    color: colors.primary,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  emptyDescription: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
});

export default ShowData;
