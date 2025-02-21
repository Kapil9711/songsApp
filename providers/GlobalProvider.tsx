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
import axiosInstance, { setAuthHeader } from "@/network/api";
import {
  downloadSong,
  getDownloadedSongs,
  getValueInAsync,
} from "@/utilities/helpers";
import { debounce, rangeRight } from "lodash";
import Toast from "react-native-toast-message";
import { usePathname } from "expo-router";

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
  const {
    user,
    handleFavorite,
    favorite,
    saveJsonToFile,
    readJsonFile,
    favFilter,
    setFavFilter,
    friends,
    setFriends,
  } = useFavorite();
  const [hindi, setHindi] = useState([]);
  const [punjabi, setPunjabi] = useState([]);
  const [haryanvi, setHaryanvi] = useState([]);
  const [active, setActive] = useState("search");
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
    setIsLoadingSongListToRender(true);
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
      } catch (error) {}

      try {
        // const haryani = await readJsonFile("haryani.json");
        // const hindi = await readJsonFile("hindi.json");
        // const punjabi = await readJsonFile("punjabi.json");
        if (false) {
          // setHaryanvi(haryani);
          // setHindi(hindi);
          // setPunjabi(punjabi);
        } else {
          const { data } = await axiosInstance.get("/song/home-page");
          if (data.success) {
            setHaryanvi(data.haryanvi);
            setHindi(data.hindi);
            setPunjabi(data.punjabi);
            // await saveJsonToFile("haryani.json", JSON.stringify(data.haryani));
            // await saveJsonToFile("hindi.json", JSON.stringify(data.hindi));
            // await saveJsonToFile("punjabi.json", JSON.stringify(data.punjabi));
          }
        }
      } catch (error) {}

      try {
        try {
          const song = await readJsonFile("initialSong.json");
          const album = await readJsonFile("initialAlbum.json");
          const playlist = await readJsonFile("initialPlaylist.json");

          if (song && album && playlist) {
            setAlbumListToRender(album);
            setSongListToRender(song);
            setSearchedSongList(song);
            setPlaListToRender(playlist);
            setIsLoadingSongListToRender(false);
            return;
          }
        } catch (error) {}

        const songPromise = axios.get(
          "https://saavn.dev/api/search/songs?query=" + "arijit"
        );

        const albumPromise = axios.get(
          "https://saavn.dev/api/search/albums?limit=6&&query=" + "arijit"
        );
        const playlistPromise = axios.get(
          "https://saavn.dev/api/search/playlists?limit=6&&query=" + "arijit"
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
            try {
              await saveJsonToFile("initialSong.json", song?.data?.results);
            } catch (error) {}
          }
        }
        if (albumData.status === "fulfilled") {
          const { data: album } = albumData.value;
          if (album) {
            setAlbumListToRender(album?.data?.results);
            try {
              await saveJsonToFile("initialAlbum.json", album?.data?.results);
            } catch (error) {}
          }
        }

        if (playlistData.status === "fulfilled") {
          const { data: playlist } = playlistData.value;
          if (playlist) {
            setPlaListToRender(playlist?.data?.results);
            try {
              await saveJsonToFile(
                "initialPlaylist.json",
                playlist?.data?.results
              );
            } catch (error) {}
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
  const currentPath = usePathname();

  useEffect(() => {
    if (currentPath.includes("file")) {
      setLocalFilesAfterSearch(localFiles);
    }
  }, [currentPath]);

  const handleLocalSearch = useCallback(
    (text: string, type = "home") => {
      const regex = new RegExp(text, "i");

      if (type === "home") {
        const filtered = localFiles?.filter((item: any) =>
          regex.test(item?.name)
        );
        setLocalFilesAfterSearch(filtered);
      }
      if (type == "favorites") {
        const filtered = favorite?.filter((item: any) =>
          regex.test(item?.name)
        );
        setFavFilter(filtered);
      }
    },
    [searchQuery]
  );

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
      } catch (error) {}
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

        const uri = await downloadSong(url, image, fileName + "_" + user._id);
        try {
          const s: any = await getDownloadedSongs();
          setLocalFiles(s);
          setLocalFilesAfterSearch(s);
        } catch (error) {}

        // await saveToDevice(uri, fileName);
        Toast.show({
          type: "success", // success | error | info
          text1: "Downloaded Successfully",
          text2: "Your file has been saved!",
          visibilityTime: 2500,
          autoHide: true,
        });
      } catch (error) {
        Toast.show({
          type: "error", // success | error | info
          text1: "Song not downloaded!",
          text2: "Some Error has Occured ",
          visibilityTime: 2500,
          autoHide: true,
        });
      }
    },
    [user]
  );

  const value = useMemo(() => {
    return {
      favorite,
      handleFavorite,
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
      user,
      favFilter,
      friends,
      setFriends,
      hindi,
      haryanvi,
      punjabi,
      active,
      setActive,
    };
  }, [
    hindi,
    haryanvi,
    punjabi,
    active,
    friends,
    favFilter,
    user,
    songListToRender,
    albumListToRender,
    playListToRender,
    searchedSongList,
    isLoadingSongListToRender,
    localFilesAfterSearch,
    searchQuery,
    page,
    isLoading,
    favorite,
  ]);
  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

const useFavorite = () => {
  const [favorite, setFavorite] = useState([]);
  const [favFilter, setFavFilter] = useState([]);
  const [user, setUser] = useState({} as any);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        await setAuthHeader();
        const { data } = await axiosInstance.get("/friend");

        if (data.success) {
          setFriends(data.friends);
        }
      } catch (error) {}
    })();
  }, []);

  const getFavorite = async (islocal = true, userId?: any) => {
    try {
      if (islocal) {
        const data = await readJsonFile(`favorite_${userId}.json`);
        if (data) {
          setFavorite(data);
          setFavFilter(data);
          return;
        } else {
          await setAuthHeader();
          const { data } = await axiosInstance.get("/favorite");
          if (data?.success) {
            setFavorite(data?.favorite);
            try {
              console.log(user, "users");
              await saveJsonToFile(`favorite_${user._id}.json`, data?.favorite);
            } catch (error) {}
          }
        }
      }
    } catch (error) {}
    await setAuthHeader();
    const { data } = await axiosInstance.get("/favorite");
    if (data?.success) {
      setFavorite(data?.favorite);
      try {
        console.log(user, "users");
        await saveJsonToFile(`favorite_${user._id}.json`, data?.favorite);
      } catch (error) {}
    }
  };

  const readJsonFile = useCallback(async (filename: string) => {
    const fileUri = `${fileSystem.documentDirectory}${filename}`;

    try {
      // Check if file exists
      const fileInfo = await fileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        return null;
      }

      // Read file content
      const fileContent = await fileSystem.readAsStringAsync(fileUri);
      const jsonData = JSON.parse(fileContent); // Convert string to JSON

      return jsonData;
    } catch (error) {
      console.error("Error reading file:", error);
    }
  }, []);

  const saveJsonToFile = useCallback(
    async (filename: string, jsonData: any) => {
      try {
        // Convert JSON data to string
        const jsonString = JSON.stringify(jsonData, null, 2);

        // Define file path (documents directory)
        const fileUri = `${fileSystem.documentDirectory}${filename}`;

        // Write file
        await fileSystem.writeAsStringAsync(fileUri, jsonString, {
          encoding: fileSystem.EncodingType.UTF8,
        });

        return fileUri; // Return file path if needed
      } catch (error) {
        console.error("Error saving file:", error);
      }
    },
    []
  );

  const handleFavorite = useCallback(async (data: any) => {
    const { name, id, downloadUrl, image } = data;
    try {
      Toast.show({
        type: "success", // success | error | info
        text1: "Please Wait...",
        text2: "Adding To Favorite",
        visibilityTime: 3500,
        autoHide: true,
      });
      await setAuthHeader();
      const { data } = await axiosInstance.post("/favorite", {
        name,
        id,
        downloadUrl,
        image,
      });
      setTimeout(async () => {
        await getFavorite(false);
      }, 100);
      Toast.show({
        type: "success", // success | error | info
        text1: "Successfully  done",
        // text2: "AddinFavoriteg To ",
        visibilityTime: 1500,
        autoHide: true,
      });
    } catch (error) {
      Toast.show({
        type: "error", // success | error | info
        text1: "Failed",
        // text2: "AddinFavoriteg To ",
        visibilityTime: 1500,
        autoHide: true,
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        setUser(JSON.parse(user));
        getFavorite(true, JSON.parse(user)?._id);
      }
    })();
  }, []);

  return {
    handleFavorite,
    favorite,
    readJsonFile,
    saveJsonToFile,
    user,
    favFilter,
    setFavFilter,
    friends,
    setFriends,
  };
};

export default GlobalProvider;
