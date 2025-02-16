import { View, Text } from "react-native";
import * as fileSystem from "expo-file-system";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  downloadSong,
  getDownloadedSongs,
  getValueInAsync,
} from "@/utilities/helpers";
import { debounce, rangeRight } from "lodash";
import Toast from "react-native-toast-message";

const GlobalContext = createContext(null as any);

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [songListToRender, setSongListToRender] = useState([]);
  const [searchedSongList, setSearchedSongList] = useState([]);
  const [albumListToRender, setAlbumListToRender] = useState([]);
  const [playListToRender, setPlaListToRender] = useState([]);
  const [localFiles, setLocalFiles] = useState([]);
  const [localFilesAfterSearch, setLocalFilesAfterSearch] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("arijit singh");
  const [isLoading, setIsLoading] = useState(false);

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

        try {
          setIsLoadingSongListToRender(true);
          const songPromise = axios.get(
            "https://saavn.dev/api/search/songs?query=" + text
          );

          const albumPromise = axios.get(
            "https://saavn.dev/api/search/albums?limit=20&&query=" + text
          );
          const playlistPromise = axios.get(
            "https://saavn.dev/api/search/playlists?limit=20&&query=" + text
          );

          const [songsData, albumData, playlistData] = await Promise.allSettled(
            [songPromise, albumPromise, playlistPromise]
          );
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
    }, 150),
    []
  );
  useEffect(() => {
    (async () => {
      // let songs = await AsyncStorage.getItem("song");
      // console.log(songs);
      // if (songs) {
      //   setSongListToRender(JSON.parse(songs));
      // } else {\
      try {
        const s: any = await getDownloadedSongs();
        setLocalFiles(s);
        setLocalFilesAfterSearch(s);
      } catch (error) {
        console.log(error, "localFilesError");
      }

      try {
        setIsLoadingSongListToRender(true);
        const songPromise = axios.get(
          "https://saavn.dev/api/search/songs?query=" + "arijit"
        );

        const albumPromise = axios.get(
          "https://saavn.dev/api/search/albums?limit=20&&query=" + "arijit"
        );
        const playlistPromise = axios.get(
          "https://saavn.dev/api/search/playlists?limit=20&&query=" + "arijit"
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
        setIsLoading(true);
        let url = "";
        if (type === "album") {
          url = "https://saavn.dev/api/albums?limit=50&&id=" + id;
        }
        if (type === "playlist") {
          url = "https://saavn.dev/api/playlists?limit=50&&id=" + id;
        }
        const { data } = await axios.get(url);
        if (data.success === true) {
          setSongListToRender(data?.data?.songs);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    },
    []
  );

  const handleLocalSearch = useCallback((text: string) => {
    const regex = new RegExp(text, "i");

    const filtered = localFiles?.filter((item: any) => regex.test(item?.name));
    setLocalFilesAfterSearch(filtered);
  }, []);

  const deleteFile = useCallback(async (fileName: string) => {
    try {
      const songUri = fileSystem.documentDirectory + fileName + ".m4a";
      const imageUri = fileSystem.documentDirectory + fileName + ".jpg";
      const songInfo = await fileSystem.getInfoAsync(songUri);
      const imageInfo = await fileSystem.getInfoAsync(imageUri);
      if (songInfo.exists) {
        await fileSystem.deleteAsync(songUri);
      }
      if (imageInfo.exists) {
        await fileSystem.deleteAsync(imageUri);
      }

      Toast.show({
        type: "success", // success | error | info
        text1: "Deleted",
        text2: "File is Deleted Successfully",
        visibilityTime: 1500,
        autoHide: true,
      });

      try {
        const s: any = await getDownloadedSongs();
        setLocalFiles(s);
        setLocalFilesAfterSearch(s);
      } catch (error) {
        console.log(error, "localFilesError");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (page >= 4) return;
    if (isLoadingSongListToRender) return;
    setIsLoadingSongListToRender(true);
    try {
      const { data }: any = await axios.get(
        `https://saavn.dev/api/search/songs?query=${searchQuery}&&page=${
          page + 1
        }`
      );
      setPage(page + 1);
      if (data?.data?.results) {
        const r: any = data.data.results;
        // console.log(r, "data");
        // songListToRender.concat(r);
        // console.log(songListToRender, "list");
        setSongListToRender((prev: any) => [...prev, ...r] as any);
        setIsLoadingSongListToRender(false);
      }
    } catch (error) {
      setIsLoadingSongListToRender(false);
      setPage(8);
    }
  }, [page, isLoadingSongListToRender, searchQuery]);

  const handleDownload = useCallback(
    async (url: string, image: string, fileName: string) => {
      try {
        Toast.show({
          type: "success", // success | error | info
          text1: "Starting Download",
          text2: "File Will Download in Backgroun",
          visibilityTime: 2500,
          autoHide: true,
        });
        const uri = await downloadSong(url, image, fileName);
        try {
          const s: any = await getDownloadedSongs();
          setLocalFiles(s);
          setLocalFilesAfterSearch(s);
        } catch (error) {
          console.log(error, "localFilesError");
        }

        // await saveToDevice(uri, fileName);
        Toast.show({
          type: "success", // success | error | info
          text1: "Downloaded Successfully",
          text2: "Your file has been saved!",
          visibilityTime: 2500,
          autoHide: true,
        });
      } catch (error) {
        console.log(error);
        Toast.show({
          type: "error", // success | error | info
          text1: "Song not downloaded!",
          text2: "Some Error has Occured ",
          visibilityTime: 2500,
          autoHide: true,
        });
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
      handleLocalSearch,
      localFilesAfterSearch,
      deleteFile,
      handleDownload,
      fetchData,
      searchQuery,
      setSearchQuery,
      setPage,
      isLoading,
    };
  }, [
    songListToRender,
    albumListToRender,
    playListToRender,
    searchedSongList,
    isLoadingSongListToRender,
    localFilesAfterSearch,
    searchQuery,
    page,
    isLoading,
  ]);
  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalProvider;
