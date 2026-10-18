import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PlayerState {
  sound: any | null;
  currentSong: any | null;
  currentSongList: any[];

  setSound: (sound: any | null) => void;

  setCurrentSong: (
    updater: any | null | ((prev: any | null) => any | null),
  ) => void;

  setCurrentSongList: (songs: any[]) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      sound: null,
      currentSong: null,
      currentSongList: [],

      setSound: (sound) => set({ sound }),

      setCurrentSong: (updater) =>
        set((state) => ({
          currentSong:
            typeof updater === "function"
              ? updater(state.currentSong)
              : updater,
        })),

      setCurrentSongList: (currentSongList) => set({ currentSongList }),
    }),
    {
      name: "player-storage",
      storage: createJSONStorage(() => AsyncStorage),

      // Persist only serializable state.
      partialize: (state) => ({
        currentSong: state.currentSong,
        currentSongList: state.currentSongList,
      }),
    },
  ),
);
