import VerticalSongList from "@/components/songs/verticalSongList";
import { useTrendingSongsQuery } from "@/shared/api/api.queries";
import { useLocalSearchParams } from "expo-router";

const StaticSongScreen = () => {
  const { heading } = useLocalSearchParams<{
    heading: string;
  }>();
  const { data } = useTrendingSongsQuery();
  let listToRender: any = [];
  switch (heading) {
    case "hindi":
      listToRender = data?.hindi;
      break;
    case "haryanvi":
      listToRender = data?.haryanvi;
      break;
    case "punjabi":
      listToRender = data?.punjabi;
      break;
  }
  return <VerticalSongList listToRender={listToRender} heading={heading} />;
};
export default StaticSongScreen;
