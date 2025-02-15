import { View, Text } from "react-native";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const GlobalContext = createContext(null as any);

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [songListToRender, setSongListToRender] = useState([]);
  const [albumListToRender, setAlbumListToRender] = useState([]);
  const [playListToRender, setPlaListToRender] = useState([]);
  useEffect(() => {
    (async () => {
      let songs = await AsyncStorage.getItem("song");
      console.log(songs);
      if (songs) {
        setSongListToRender(JSON.parse(songs));
      } else {
        const { data }: any = await axios.get(
          "https://saavn.dev/api/search/songs?query=Arijit singh"
        );

        if (data) {
          await AsyncStorage.setItem("song", JSON.stringify(data.data.results));
          setSongListToRender(data?.data?.results);
        }
      }
    })();
  }, []);

  const value = useMemo(() => {
    return {
      songListToRender,
      setSongListToRender,
      albumListToRender,
      setAlbumListToRender,
      playListToRender,
      setPlaListToRender,
    };
  }, [songListToRender, albumListToRender, playListToRender]);
  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalProvider;
