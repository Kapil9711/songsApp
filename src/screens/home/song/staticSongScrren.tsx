import VerticalSongList from "@/components/songs/verticalSongList";
import { useLocalSearchParams } from "expo-router";

const StaticSongScreen = () => {
  const { heading, list } = useLocalSearchParams<{
    heading: string;
    list: any[];
  }>();
  return <VerticalSongList listToRender={list} heading={heading} />;
};
export default StaticSongScreen;
