import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SoundQuality = "low" | "mid" | "high" | "hd";
export type SongLanguage = "hindi" | "english" | "punjabi" | "haryanvi";
export type LanguageFilterMode = "include" | "exclude";

interface SettingsState {
  soundQuality: SoundQuality;
  downloadSongQuality: SoundQuality;
  selectedLanguages: SongLanguage[];
  languageFilterMode: LanguageFilterMode;
  likedSongIds: string[];

  setSoundQuality: (quality: SoundQuality) => void;
  setDownloadSongQuality: (quality: SoundQuality) => void;

  toggleLanguage: (language: SongLanguage) => void;
  setLanguages: (languages: SongLanguage[]) => void;
  setLanguageFilterMode: (mode: LanguageFilterMode) => void;

  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  clearLikes: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      soundQuality: "hd",
      downloadSongQuality: "hd",
      selectedLanguages: [],
      languageFilterMode: "include",
      likedSongIds: [],

      setSoundQuality: (soundQuality) => set({ soundQuality }),

      setDownloadSongQuality: (downloadSongQuality) =>
        set({ downloadSongQuality }),

      toggleLanguage: (language) =>
        set((state) => ({
          selectedLanguages: state.selectedLanguages.includes(language)
            ? state.selectedLanguages.filter((item) => item !== language)
            : [...state.selectedLanguages, language],
        })),

      setLanguages: (selectedLanguages) => set({ selectedLanguages }),

      setLanguageFilterMode: (languageFilterMode) =>
        set({ languageFilterMode }),

      toggleLike: (songId) =>
        set((state) => ({
          likedSongIds: state.likedSongIds.includes(songId)
            ? state.likedSongIds.filter((id) => id !== songId)
            : [...state.likedSongIds, songId],
        })),

      isLiked: (songId) => get().likedSongIds.includes(songId),

      clearLikes: () => set({ likedSongIds: [] }),
    }),
    {
      name: "riffly-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        soundQuality: state.soundQuality,
        downloadSongQuality: state.downloadSongQuality,
        selectedLanguages: state.selectedLanguages,
        languageFilterMode: state.languageFilterMode,
        likedSongIds: state.likedSongIds,
      }),
    },
  ),
);
