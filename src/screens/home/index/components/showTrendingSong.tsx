import ShowData from "@/components/songs/bigHorizontalCard";
import { StyleSheet, Text, View } from "react-native";

import { memo, useMemo } from "react";
import { useTheme } from "@/themes/theme.context";
import { useResponsive } from "react-native-fluid-styles";
import { useTrendingSongsQuery } from "@/shared/api/api.queries";

const ShowTrendingSongs = () => {
  const { data } = useTrendingSongsQuery();
  const styles = useStyles();
  return (
    <View style={{ flex: 1, gap: 10 }}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Trending Songs</Text>
        <Text style={styles.subtitle}>Currently Trending Songs</Text>
      </View>

      <ShowData
        isTrending
        data={data?.hindi?.slice(0, 10)}
        renderData={data?.hindi}
        heading="Hindi"
        type="song"
      />

      <ShowData
        isTrending
        data={data?.haryanvi?.slice(0, 10)}
        renderData={data?.haryanvi}
        heading="Haryanvi"
        type="song"
      />

      <ShowData
        isTrending
        data={data?.punjabi?.slice(0, 10)}
        renderData={data?.punjabi}
        heading="Punjabi"
        type="song"
      />
    </View>
  );
};

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  return useMemo(() => {
    return StyleSheet.create({
      greetingContainer: {
        paddingHorizontal: r.ms(16),
      },

      greeting: {
        fontSize: r.ms(25),
        fontWeight: "800",
        letterSpacing: -0.6,
        color: Theme.colors.text,
      },

      subtitle: {
        marginTop: r.ms(3),
        fontSize: r.ms(12),
        color: Theme.colors.text,
      },
    });
  }, [Theme, r]);
};

export const MemoizedShowTrendingSongs = memo(ShowTrendingSongs);
