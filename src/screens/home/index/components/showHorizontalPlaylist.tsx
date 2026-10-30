import ShowData from "@/components/songs/bigHorizontalCard";
import { useGetPlaylistQuery } from "@/shared/api/api.queries";
import { useTheme } from "@/themes/theme.context";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, useResponsive } from "react-native-fluid-styles";

export const ShowHorizontalPlaylist = ({
  query,
  title,
  subTitle,
}: {
  query: string;
  title: string;
  subTitle: string;
}) => {
  const styles = useStyles();
  const { data } = useGetPlaylistQuery(query);
  return (
    <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>{title}</Text>
        <Text style={styles.subtitle}>{subTitle}</Text>
      </View>
      <ShowData
        isTrending
        data={data?.all}
        renderData={data?.all}
        type="playlist"
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

export const MemoizedShowHorizontalPlaylist = memo(ShowHorizontalPlaylist);
