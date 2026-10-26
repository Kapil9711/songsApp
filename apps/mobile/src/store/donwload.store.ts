import type { DownloadedSong } from "@/utils/download.service";
import { create } from "zustand";

interface DownloadStore {
  downloadedSongs: DownloadedSong[];
  isLoading: boolean;
  downloadSongIdMap: any;
  setDownloadSongIdMap: (idMap: any) => void;

  setDownloadedSongs: (songs: DownloadedSong[]) => void;
  addDownloadedSong: (song: DownloadedSong) => void;
  removeDownloadedSong: (songId: string) => void;
  clearDownloadedSongs: () => void;
  setLoading: (loading: boolean) => void;
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  downloadedSongs: [],
  isLoading: false,
  downloadSongIdMap: {},
  setDownloadSongIdMap: (idMap) => set({ downloadSongIdMap: idMap }),

  setDownloadedSongs: (songs) => {
    const idMap: any = {};
    songs?.forEach((item) => {
      idMap[item?.id] = true;
    });
    set({ downloadedSongs: songs, downloadSongIdMap: idMap });
  },

  addDownloadedSong: (song) =>
    set((state) => {
      const exists = state.downloadedSongs.some(
        (item) => String(item.id) === String(song.id),
      );

      if (exists) {
        return {
          downloadedSongs: state.downloadedSongs.map((item) =>
            String(item.id) === String(song.id) ? song : item,
          ),
        };
      }

      return {
        downloadSongIdMap: { ...state.downloadSongIdMap, [song.id]: true },
        downloadedSongs: [song, ...state.downloadedSongs],
      };
    }),

  removeDownloadedSong: (songId) =>
    set((state) => ({
      downloadedSongs: state.downloadedSongs.filter(
        (song) => String(song.id) !== String(songId),
      ),
      downloadSongIdMap: { ...state.downloadSongIdMap, [songId]: false },
    })),

  clearDownloadedSongs: () =>
    set({ downloadedSongs: [], downloadSongIdMap: {} }),

  setLoading: (isLoading) => set({ isLoading }),
}));
