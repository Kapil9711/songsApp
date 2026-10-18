import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import api, { setAuthHeader } from "../network/api";
import { useAuthStore } from "./authStore";

const FAVORITE_FILE = (userId: string) => `favorite_${userId}.json`;

const getFavoriteFileUri = (userId: string) =>
  `${FileSystem.documentDirectory}${FAVORITE_FILE(userId)}`;

export interface Favorite {
  name: string;
  id: string;
  downloadUrl: string;
  image: string;
  [key: string]: unknown;
}

export interface FavoriteUser {
  _id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

interface FavoriteState {
  favorite: Favorite[];
  favFilter: Favorite[];
  friends: unknown[];
  isLoading: boolean;
  setFavFilter: (favorites: Favorite[]) => void;
  setFavorite: (favorites: Favorite[]) => void;
  readJsonFile: (filename: string) => Promise<any | null>;
  saveJsonToFile: (
    filename: string,
    jsonData: unknown,
  ) => Promise<string | null>;

  getFavorite: (isLocal?: boolean, userId?: string) => Promise<void>;

  loadFavorites: (userId?: string) => Promise<void>;
  loadFriends: () => Promise<void>;
  handleFavorite: (song: Favorite) => Promise<void>;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorite: [],
  favFilter: [],
  friends: [],
  isLoading: false,

  setFavFilter: (favFilter) => set({ favFilter }),

  setFavorite: (favorite) =>
    set({
      favorite,
      favFilter: favorite,
    }),

  readJsonFile: async (filename) => {
    if (!FileSystem.documentDirectory) return null;

    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) return null;

      const content = await FileSystem.readAsStringAsync(fileUri);

      return JSON.parse(content);
    } catch (error) {
      console.error("[FAVORITES] Failed to read file:", error);
      return null;
    }
  },

  saveJsonToFile: async (filename, jsonData) => {
    if (!FileSystem.documentDirectory) return null;

    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(jsonData), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      return fileUri;
    } catch (error) {
      console.error("[FAVORITES] Failed to save file:", error);
      return null;
    }
  },

  getFavorite: async (isLocal = true, userId) => {
    try {
      let currentUserId = userId;
      const storedUser = useAuthStore.getState()?.user;

      if (!storedUser?._id) {
        if (storedUser) {
          currentUserId = storedUser._id;
        }
      }

      // Prefer the local cache when requested.
      if (isLocal && currentUserId) {
        const cachedFavorites = await get().readJsonFile(
          FAVORITE_FILE(currentUserId),
        );

        if (Array.isArray(cachedFavorites)) {
          get().setFavorite(cachedFavorites);
          return;
        }
      }

      // Fall back to the backend if there is no usable cache.
      await setAuthHeader();

      const { data } = await api.get("/favorite");

      if (!data?.success || !Array.isArray(data.favorite)) {
        return;
      }

      get().setFavorite(data.favorite);

      if (currentUserId) {
        await get().saveJsonToFile(FAVORITE_FILE(currentUserId), data.favorite);
      }
    } catch (error) {
      console.error("[FAVORITES] Failed to load favorites:", error);
    }
  },

  loadFavorites: async (userId) => {
    set({ isLoading: true });

    try {
      let currentUserId = userId;
      const storedUser = useAuthStore.getState()?.user;
      if (!currentUserId) {
        currentUserId = storedUser?._id;
      }
      await get().getFavorite(true, currentUserId);
    } finally {
      set({ isLoading: false });
    }
  },

  loadFriends: async () => {
    try {
      await setAuthHeader();
      const { data } = await api.get("/friend");
      if (data?.success && Array.isArray(data.friends)) {
        set({ friends: data.friends });
      }
    } catch (error) {
      console.error("[FAVORITES] Failed to load friends:", error);
    }
  },

  handleFavorite: async (song) => {
    try {
      Toast.show({
        type: "info",
        text1: "Adding to favorites...",
        visibilityTime: 1500,
      });

      await setAuthHeader();

      const { data } = await api.post("/favorite", {
        name: song.name,
        id: song.id,
        downloadUrl: song.downloadUrl,
        image: song.image,
      });

      if (data?.success === false) {
        throw new Error("The server could not add this favorite");
      }

      // Refresh from the backend after the mutation completes.
      await get().getFavorite(false);

      Toast.show({
        type: "success",
        text1: "Successfully added to favorites",
        visibilityTime: 1500,
      });
    } catch (error) {
      console.error("[FAVORITES] Failed to add favorite:", error);

      Toast.show({
        type: "error",
        text1: "Failed to add favorite",
        visibilityTime: 1500,
      });
    }
  },

  clearFavorites: () =>
    set({
      favorite: [],
      favFilter: [],
    }),
}));
