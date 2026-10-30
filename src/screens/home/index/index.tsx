import { Container } from "@/components/container";
import NowPlayingBackground from "@/components/nowPlayingBackground";
import { FadeTop } from "@/components/topFade";
import { SafeSide } from "@/hooks/useInsetStyle";
import { useTheme } from "@/themes/theme.context";
import { ScrollView, StyleSheet, View } from "react-native";
import { useResponsive } from "react-native-fluid-styles";
import { MemoizedShowHorizontalPlaylist } from "./components/showHorizontalPlaylist";
import { useMemo } from "react";
import { useTrendingSongsQuery } from "@/shared/api/api.queries";
import Loading from "@/components/loading";
import { MemoizedShowTrendingSongs } from "./components/showTrendingSong";

export default function HomeScreen() {
  const styles = useStyles();
  const { isLoading } = useTrendingSongsQuery();
  const insetSyles = useMemo(() => {
    return { ...SafeSide, left: false, right: false };
  }, [SafeSide]);

  return (
    <View style={[styles.container]}>
      <FadeTop />
      <NowPlayingBackground />
      <Loading loading={isLoading} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Container style={styles.maxContainer} insetStyle={insetSyles}>
          {/* <MemoizedRifflyHero
            onMoodSelect={(mood) => {
              console.log("Selected mood:", mood);
            }}
            onGlobalRadioPress={() => {
              console.log("Global Radio pressed");
            }}
          /> */}

          <MemoizedShowTrendingSongs />

          {/* charts */}

          <MemoizedShowHorizontalPlaylist
            query="chart"
            title="Chartbusters"
            subTitle="Chartbusters of the year"
          />

          {/* romance */}
          <MemoizedShowHorizontalPlaylist
            query="romance"
            title="Romance"
            subTitle="Romantic Songs"
          />

          {/* party */}
          <MemoizedShowHorizontalPlaylist
            query="party"
            title="Party"
            subTitle="Party Songs"
          />

          {/* chill */}
          <MemoizedShowHorizontalPlaylist
            query="chill"
            title="Chill"
            subTitle="Chill Songs"
          />

          {/* sad */}
          <MemoizedShowHorizontalPlaylist
            query="sad"
            title="Sad"
            subTitle="Sad Songs"
          />

          {/* 1960s */}
          <MemoizedShowHorizontalPlaylist
            query="1960s"
            title="1960s"
            subTitle="Oldies"
          />

          {/* 1970s */}
          <MemoizedShowHorizontalPlaylist
            query="1970s"
            title="1970s"
            subTitle="Oldies"
          />

          {/* 1980s */}
          <MemoizedShowHorizontalPlaylist
            query="1980s"
            title="1980s"
            subTitle="Oldies"
          />

          {/* 1990s */}
          <MemoizedShowHorizontalPlaylist
            query="1990s"
            title="1990s"
            subTitle="Oldies"
          />

          {/* 2000s */}
          <MemoizedShowHorizontalPlaylist
            query="2000s"
            title="2000s"
            subTitle="Oldies"
          />
        </Container>
      </ScrollView>
    </View>
  );
}

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  return StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
      backgroundColor: Theme.colors.background,
    },

    maxContainer: {
      maxWidth: "100%",
    },

    scrollContent: {},
  });
};
