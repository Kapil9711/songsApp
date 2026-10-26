import { useTheme } from "@/themes/theme.context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useResponsive } from "react-native-fluid-styles";
import HorizontalList from "./horizontalList";

type ShowDataProps = {
  data: any;
  heading?: string;
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
  const length = data?.length ?? 0;
  const { Theme } = useTheme();
  const r = useResponsive();
  const styles = useStyles();

  const handleSeeMore = () => {
    if (type === "song") {
      router.push({
        pathname: "/(drawer)/(tabs)/home/song",
        params: { heading: heading?.toLocaleLowerCase?.(), list: renderData },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {heading ? (
          <>
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
                  size={r.ms(17)}
                  color={Theme.colors.primary}
                />
              </Pressable>
            )}
          </>
        ) : null}
      </View>

      {length > 0 ? (
        <HorizontalList data={data} type={type} renderData={renderData} />
      ) : (
        <EmptyState heading={heading || ""} />
      )}
    </View>
  );
};

/* Empty State */

const EmptyState = ({ heading }: { heading: string }) => {
  const r = useResponsive();
  const { Theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="musical-notes-outline"
          size={r.ms(22)}
          color={Theme.colors.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>Nothing here yet</Text>

      <Text style={styles.emptyDescription}>
        We couldn't find any {heading.toLowerCase()}.
      </Text>
    </View>
  );
};

/* Styles */

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  return StyleSheet.create({
    container: {
      width: "100%",
    },

    /* Header */

    header: {
      paddingHorizontal: r.ms(16),
      marginBottom: r.ms(13),
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
      width: r.ms(4),
      height: r.ms(25),
      borderRadius: r.ms(4),
      backgroundColor: Theme.colors.primary,
      marginRight: r.ms(10),
    },

    heading: {
      fontSize: r.ms(20),
      fontWeight: "800",
      letterSpacing: -0.4,
      color: Theme.colors.text,
    },

    /* See All */

    seeMoreButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: r.ms(5),
      paddingLeft: r.ms(8),
      gap: r.ms(2),
    },

    seeMorePressed: {
      opacity: 0.5,
    },

    seeMoreText: {
      fontSize: r.ms(13),
      fontWeight: "700",
      color: Theme.colors.primary,
    },

    /* Empty State */

    emptyContainer: {
      height: r.ms(150),
      marginHorizontal: r.ms(16),
      borderRadius: r.ms(18),
      borderWidth: 1,
      borderColor: Theme.colors.text,
      backgroundColor: Theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: r.ms(20),
    },

    emptyIcon: {
      width: r.ms(46),
      height: r.ms(46),
      borderRadius: r.ms(15),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Theme.colors.background,
      marginBottom: r.ms(10),
    },

    emptyTitle: {
      fontSize: r.ms(14),
      fontWeight: "700",
      color: Theme.colors.text,
    },

    emptyDescription: {
      marginTop: r.ms(4),
      fontSize: r.ms(12),
      color: Theme.colors.text,
      textAlign: "center",
    },
  });
};

export default ShowData;
