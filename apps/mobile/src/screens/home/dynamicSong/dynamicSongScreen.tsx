import Loading from "@/components/loading";
import VerticalSongList from "@/components/songs/verticalSongList";
import { useGetAlbumPlaylistSongQuery } from "@/shared/api/api.queries";
import { useLocalSearchParams } from "expo-router";

const DynamicSongScreen = () => {
  const { isAlbum, id }: any = useLocalSearchParams();
  const { data, isLoading } = useGetAlbumPlaylistSongQuery(
    id,
    isAlbum == 1 ? true : false,
  );

  return (
    <>
      <Loading loading={isLoading} />
      <VerticalSongList listToRender={data} heading="" />
    </>
  );
};

export default DynamicSongScreen;
