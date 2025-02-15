import { View, Text } from "react-native";
import React, {
  Children,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const AudioContext = createContext(null as any);
export const useAudioContext = () => useContext(AudioContext);

const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [sound, setSound] = useState(null as any);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongList, setCurrentSongList] = useState([]);
  const value = useMemo(() => {
    return {
      sound,
      setSound,
      currentSong,
      setCurrentSong,
      currentSongList,
      setCurrentSongList,
    };
  }, [sound, currentSong, currentSongList]);
  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export default AudioProvider;
