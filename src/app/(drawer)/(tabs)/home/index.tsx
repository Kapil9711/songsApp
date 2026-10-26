import { Container } from "@/components/container";
import Loading from "@/components/loading";
import NowPlayingBackground from "@/components/nowPlayingBackground";
import ShowData from "@/components/songs/bigHorizontalCard";
import { FadeTop } from "@/components/topFade";
import { api } from "@/config/network/api.config";
import { endpoints } from "@/config/network/endpoints";
import { SafeSide } from "@/hooks/useInsetStyle";
import { useHomePagePlaylistQuery } from "@/screens/search/api/api.queries";
import { useTheme } from "@/themes/theme.context";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { moderateScale, useResponsive } from "react-native-fluid-styles";

export default function HomeScreen() {
  const styles = useStyles();
  const { data, isLoading } = useHomePageQuery();

  const homePageData = useMemo(() => {
    return {
      hindi: data?.hindi?.slice(0, 10),
      haryanvi: data?.haryanvi?.slice(0, 10),
      punjabi: data?.punjabi?.slice(0, 10),
    };
  }, [data?.haryanvi, data?.hindi, data?.punjabi]);
  const { data: charts } = useHomePagePlaylistQuery("chart");
  const { data: fiftys } = useHomePagePlaylistQuery("1950s");
  const { data: sixts } = useHomePagePlaylistQuery("1960s");
  const { data: seventys } = useHomePagePlaylistQuery("1970s");
  const { data: eights } = useHomePagePlaylistQuery("1980s");
  const { data: nineties } = useHomePagePlaylistQuery("1990s");
  const { data: TwoThousands } = useHomePagePlaylistQuery("2000s");
  const { data: romance } = useHomePagePlaylistQuery("romance");
  const { data: chill } = useHomePagePlaylistQuery("chill");
  const { data: sad } = useHomePagePlaylistQuery("sad");
  const { data: party } = useHomePagePlaylistQuery("party");

  // console.log(charts);

  return (
    <View style={[styles.container]}>
      <FadeTop />
      <NowPlayingBackground />
      <Loading loading={isLoading} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Container
          style={{ maxWidth: "100%" }}
          insetStyle={{ ...SafeSide, left: false, right: false }}
        >
          <View style={{ flex: 1, gap: 10 }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Trending Songs</Text>
              <Text style={styles.subtitle}>Currently Trending Songs</Text>
            </View>

            <ShowData
              isTrending
              data={homePageData?.hindi}
              renderData={data?.hindi}
              heading="Hindi"
              type="song"
            />

            <ShowData
              isTrending
              data={homePageData?.haryanvi}
              renderData={data?.haryanvi}
              heading="Haryanvi"
              type="song"
            />

            <ShowData
              isTrending
              data={homePageData?.punjabi}
              renderData={data?.punjabi}
              heading="Punjabi"
              type="song"
            />
          </View>

          {/* charts */}
          <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Chartbusters</Text>
              <Text style={styles.subtitle}>Chartbusters of the year</Text>
            </View>
            <ShowData
              isTrending
              data={charts?.all}
              renderData={charts?.all}
              type="playlist"
            />
          </View>

          {/* romance */}
          <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Romance</Text>
              <Text style={styles.subtitle}>Romantic Songs</Text>
            </View>
            <ShowData
              isTrending
              data={romance?.all}
              renderData={romance?.all}
              type="playlist"
            />
          </View>

          {/* party */}
          <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Party</Text>
              <Text style={styles.subtitle}>Party Songs</Text>
            </View>
            <ShowData
              isTrending
              data={party?.all}
              renderData={party?.all}
              type="playlist"
            />
          </View>

          {/* chill */}
          <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Chill</Text>
              <Text style={styles.subtitle}>Chill Songs</Text>
            </View>
            <ShowData
              isTrending
              data={chill?.all}
              renderData={chill?.all}
              type="playlist"
            />
          </View>

          {/* sad */}
          <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Sad</Text>
              <Text style={styles.subtitle}>Sad Songs</Text>
            </View>
            <ShowData
              isTrending
              data={sad?.all}
              renderData={sad?.all}
              type="playlist"
            />
          </View>

          {/* 1960s */}
          <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>1960s</Text>
              <Text style={styles.subtitle}>Oldies</Text>
            </View>
            <ShowData
              isTrending
              data={sixts?.all}
              renderData={sixts?.all}
              type="playlist"
            />
          </View>
          {/* 1970s */}
          <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>1970s</Text>
              <Text style={styles.subtitle}>Oldies</Text>
            </View>
            <ShowData
              isTrending
              data={seventys?.all}
              renderData={seventys?.all}
              type="playlist"
            />
          </View>
          {/* 1980s */}
          <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>1980s</Text>
              <Text style={styles.subtitle}>Oldies</Text>
            </View>
            <ShowData
              isTrending
              data={eights?.all}
              renderData={eights?.all}
              type="playlist"
            />
          </View>
          {/* 1990s */}
          <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>1990s</Text>
              <Text style={styles.subtitle}>Oldies</Text>
            </View>
            <ShowData
              isTrending
              data={nineties?.all}
              renderData={nineties?.all}
              type="playlist"
            />
          </View>
          {/* 2000s */}
          <View style={{ flex: 1, gap: 10, marginTop: moderateScale(10) }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>2000s</Text>
              <Text style={styles.subtitle}>Milenial</Text>
            </View>
            <ShowData
              isTrending
              data={TwoThousands?.all}
              renderData={TwoThousands?.all}
              type="playlist"
            />
          </View>
        </Container>
      </ScrollView>
    </View>
  );
}

export const useHomePageQuery = () => {
  return useQuery({
    queryKey: ["homepage"],
    queryFn: async () => {
      const { data } = await api.get(endpoints.api.homePage);
      if (data.success) {
        return {
          haryanvi: data.haryanvi,
          hindi: data.hindi,
          punjabi: data.punjabi,
        };
      }
      return { haryanvi: [], hindi: [], punjabi: [] };
    },
    // staleTime: 0,
  });
};

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  return StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
      backgroundColor: Theme.colors.background,
    },

    scrollContent: {},

    /* Header */
    header: {},

    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(10),
    },

    profileContainer: {
      position: "relative",
    },

    avatar: {
      width: r.ms(48),
      height: r.ms(48),
      borderRadius: r.ms(24),
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: Theme.colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    avatarText: {
      fontSize: r.ms(18),
      fontWeight: "800",
      color: Theme.colors.primary,
    },

    onlineDot: {
      position: "absolute",
      right: 0,
      bottom: 1,
      width: r.ms(12),
      height: r.ms(12),
      borderRadius: r.ms(6),
      backgroundColor: "#48D597",
      borderWidth: 2,
      borderColor: Theme.colors.background,
    },

    searchContainer: {
      flex: 1,
      height: r.ms(48),
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: r.ms(14),
      borderRadius: r.ms(24),
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: Theme.colors.text,
    },

    searchInput: {
      flex: 1,
      marginLeft: r.ms(8),
      paddingVertical: 0,
      fontSize: r.ms(14),
      color: Theme.colors.text,
    },

    menuButton: {
      width: r.ms(36),
      height: r.ms(44),
      alignItems: "center",
      justifyContent: "center",
    },

    pressed: {
      opacity: 0.55,
    },

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

    /* Segment */
    segmentWrapper: {
      paddingHorizontal: r.ms(16),
      marginTop: r.ms(-12),
    },

    segmentControl: {
      height: r.ms(42),
      borderRadius: r.ms(22),
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: Theme.colors.text,
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    },

    activeIndicator: {
      position: "absolute",
      left: r.ms(3),
      top: r.ms(3),
      bottom: r.ms(3),
      width: "50%",
      borderRadius: r.ms(20),
      backgroundColor: Theme.colors.primary,
    },

    activeIndicatorRight: {
      left: "50%",
    },

    segmentButton: {
      flex: 1,
      height: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(6),
      zIndex: 1,
    },

    segmentText: {
      fontSize: r.ms(13),
      fontWeight: "600",
      color: Theme.colors.text,
    },

    activeSegmentText: {
      color: Theme.colors.text,
    },

    /* Loading */
    loadingContainer: {
      minHeight: r.ms(420),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: r.ms(30),
    },

    loadingCircle: {
      width: r.ms(64),
      height: r.ms(64),
      borderRadius: r.ms(32),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: Theme.colors.text,
    },

    loadingTitle: {
      marginTop: r.ms(18),
      fontSize: r.ms(15),
      fontWeight: "700",
      color: Theme.colors.text,
    },

    loadingText: {
      marginTop: r.ms(5),
      fontSize: r.ms(12),
      color: Theme.colors.text,
      textAlign: "center",
    },
  });
};
