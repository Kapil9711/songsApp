import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import HorizontalList from "./HorizontalList";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { colors } from "@/src/constants/theme";
import { moderateScale } from "react-native-size-matters";

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
      {/* ---------------------------------------------------------------- */}
      {/* Section Header                                                   */}
      {/* ---------------------------------------------------------------- */}

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleIndicator} />

          <Text numberOfLines={1} style={styles.heading}>
            {heading}
          </Text>
        </View>

        {length > 0 && (
          <Pressable
            onPress={handleSeeMore}
            hitSlop={10}
            style={({ pressed }) => [
              styles.seeMoreButton,
              pressed && styles.seeMorePressed,
            ]}
          >
            <Text style={styles.seeMoreText}>See all</Text>

            <Ionicons
              name="chevron-forward"
              size={moderateScale(17)}
              color={colors.primary}
            />
          </Pressable>
        )}
      </View>

      {/* ---------------------------------------------------------------- */}
      {/* Content                                                          */}
      {/* ---------------------------------------------------------------- */}

      {length > 0 ? (
        <HorizontalList data={data} type={type} />
      ) : (
        <EmptyState heading={heading} />
      )}
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyState = ({ heading }: { heading: string }) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="musical-notes-outline"
          size={moderateScale(22)}
          color={colors.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>Nothing here yet</Text>

      <Text style={styles.emptyDescription}>
        We couldn't find any {heading.toLowerCase()}.
      </Text>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  /* Header */

  header: {
    paddingHorizontal: moderateScale(16),

    marginBottom: moderateScale(13),

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",

    flex: 1,
  },

  titleIndicator: {
    width: moderateScale(4),
    height: moderateScale(25),

    borderRadius: moderateScale(4),

    backgroundColor: colors.primary,

    marginRight: moderateScale(10),
  },

  heading: {
    fontSize: moderateScale(20),

    fontWeight: "800",

    letterSpacing: -0.4,

    color: colors.text,
  },

  /* See All */

  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: moderateScale(5),
    paddingLeft: moderateScale(8),

    gap: moderateScale(2),
  },

  seeMorePressed: {
    opacity: 0.5,
  },

  seeMoreText: {
    fontSize: moderateScale(13),

    fontWeight: "700",

    color: colors.primary,
  },

  /* Empty */

  emptyContainer: {
    height: moderateScale(150),

    marginHorizontal: moderateScale(16),

    borderRadius: moderateScale(18),

    borderWidth: 1,
    borderColor: colors.border,

    backgroundColor: colors.surface,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: moderateScale(20),
  },

  emptyIcon: {
    width: moderateScale(46),
    height: moderateScale(46),

    borderRadius: moderateScale(15),

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surfaceElevated,

    marginBottom: moderateScale(10),
  },

  emptyTitle: {
    fontSize: moderateScale(14),

    fontWeight: "700",

    color: colors.text,
  },

  emptyDescription: {
    marginTop: moderateScale(4),

    fontSize: moderateScale(12),

    color: colors.textMuted,

    textAlign: "center",
  },
});

export default ShowData;
