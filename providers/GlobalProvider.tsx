import { View, Text } from "react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { getValueInAsync } from "@/utilities/helpers";
import { debounce } from "lodash";

const GlobalContext = createContext(null as any);

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [songListToRender, setSongListToRender] = useState([]);
  const [searchedSongList, setSearchedSongList] = useState([]);
  const [albumListToRender, setAlbumListToRender] = useState([]);
  const [playListToRender, setPlaListToRender] = useState([]);

  const [isLoadingSongListToRender, setIsLoadingSongListToRender] =
    useState(false);

  const handleSearch = useCallback(
    debounce((text) => {
      (async () => {
        // let songs = await AsyncStorage.getItem("song");
        // console.log(songs);
        // if (songs) {
        //   setSongListToRender(JSON.parse(songs));
        // } else {
        const songPromise = axios.get(
          "https://saavn.dev/api/search/songs?query=" + text
        );

        const albumPromise = axios.get(
          "https://saavn.dev/api/search/albums?query=" + text
        );
        const playlistPromise = axios.get(
          "https://saavn.dev/api/search/playlists?query=" + text
        );

        const [songsData, albumData, playlistData] = await Promise.allSettled([
          songPromise,
          albumPromise,
          playlistPromise,
        ]);
        if (songsData.status === "fulfilled") {
          const { data: song } = songsData.value;
          if (song) {
            setSongListToRender(song?.data?.results);
            setSearchedSongList(song?.data?.results);
          }
        }
        if (albumData.status === "fulfilled") {
          const { data: album } = albumData.value;
          if (album) {
            setAlbumListToRender(album?.data?.results);
          }
        }

        if (playlistData.status === "fulfilled") {
          const { data: playlist } = playlistData.value;
          if (playlist) {
            setPlaListToRender(playlist?.data?.results);
          }
        }
        // const { data: song }: any = await axios.get(
        //   "https://saavn.dev/api/search/songs?query=" + text
        // );
        // const { data: album } = await axios.get(
        //   "https://saavn.dev/api/search/albums?query=" + text
        // );
        // const { data: playlist } = await axios.get(
        //   "https://saavn.dev/api/search/playlists?query=" + text
        // );

        // if (song) {
        //   setSongListToRender(song?.data?.results);
        //   setSearchedSongList(song?.data?.results);
        // }
        // if (album) {
        //   setAlbumListToRender(album?.data?.results);
        // }
        // if (playlist) {
        //   setPlaListToRender(playlist?.data?.results);
        // }
        // }
      })();
    }, 250),
    []
  );
  useEffect(() => {
    (async () => {
      // let songs = await AsyncStorage.getItem("song");
      // console.log(songs);
      // if (songs) {
      //   setSongListToRender(JSON.parse(songs));
      // } else {

      try {
        setIsLoadingSongListToRender(true);
        const songPromise = axios.get(
          "https://saavn.dev/api/search/songs?query=" + "arijit"
        );

        const albumPromise = axios.get(
          "https://saavn.dev/api/search/albums?query=" + "arijit"
        );
        const playlistPromise = axios.get(
          "https://saavn.dev/api/search/playlists?query=" + "arijit"
        );

        const [songsData, albumData, playlistData] = await Promise.allSettled([
          songPromise,
          albumPromise,
          playlistPromise,
        ]);
        if (songsData.status === "fulfilled") {
          const { data: song } = songsData.value;
          if (song) {
            setSongListToRender(song?.data?.results);
            setSearchedSongList(song?.data?.results);
          }
        }
        if (albumData.status === "fulfilled") {
          const { data: album } = albumData.value;
          if (album) {
            setAlbumListToRender(album?.data?.results);
          }
        }

        if (playlistData.status === "fulfilled") {
          const { data: playlist } = playlistData.value;
          if (playlist) {
            setPlaListToRender(playlist?.data?.results);
          }
        }

        setIsLoadingSongListToRender(false);
      } catch (error) {
        setIsLoadingSongListToRender(false);
      }

      // const { data: song }: any = await axios.get(
      //   "https://saavn.dev/api/search/songs?query=" + text
      // );
      // const { data: album } = await axios.get(
      //   "https://saavn.dev/api/search/albums?query=" + text
      // );
      // const { data: playlist } = await axios.get(
      //   "https://saavn.dev/api/search/playlists?query=" + text
      // );

      // if (song) {
      //   setSongListToRender(song?.data?.results);
      //   setSearchedSongList(song?.data?.results);
      // }
      // if (album) {
      //   setAlbumListToRender(album?.data?.results);
      // }
      // if (playlist) {
      //   setPlaListToRender(playlist?.data?.results);
      // }
      // }
    })();
  }, []);
  const handleSingleAlbumOrPlalist = useCallback(
    async (id: string, type: string) => {
      try {
        setIsLoadingSongListToRender(true);
        let url = "";
        if (type === "album") {
          url = "https://saavn.dev/api/albums?id=" + id;
        }
        if (type === "playlist") {
          url = "https://saavn.dev/api/playlists?id=" + id;
        }
        const { data } = await axios.get(url);
        if (data.success === true) {
          setSongListToRender(data?.data?.songs);
        }
        setIsLoadingSongListToRender(false);
      } catch (error) {
        setIsLoadingSongListToRender(false);
      }
    },
    []
  );

  const value = useMemo(() => {
    return {
      songListToRender,
      setSongListToRender,
      albumListToRender,
      setAlbumListToRender,
      playListToRender,
      setPlaListToRender,
      handleSingleAlbumOrPlalist,
      searchedSongList,
      isLoadingSongListToRender,
      setIsLoadingSongListToRender,
      handleSearch,
    };
  }, [
    songListToRender,
    albumListToRender,
    playListToRender,
    searchedSongList,
    isLoadingSongListToRender,
  ]);
  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalProvider;
