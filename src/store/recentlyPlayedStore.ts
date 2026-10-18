import { create } from "zustand";
import * as fileSystem from "expo-file-system";

const RECENTLY_PLAYED_DIR = `${fileSystem.documentDirectory}recently-played/`;

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface Song {
  name: string;
  playedAt: number;
  userId?: string;
  [key: string]: any;
}

interface RecentlyPlayedState {
  recentlyPlayed: Song[];
  isLoading: boolean;

  saveRecentlyPlayedSong: (userId: string, songData: Song) => Promise<void>;

  getRecentlyPlayedSongs: (userId: string) => Promise<Song[]>;
  deleteOldSongs: () => Promise<void>;
  loadRecentlyPlayed: (userId: string) => Promise<void>;
}

const ensureDirectoryExists = async () => {
  const info = await fileSystem.getInfoAsync(RECENTLY_PLAYED_DIR);

  if (!info.exists) {
    await fileSystem.makeDirectoryAsync(RECENTLY_PLAYED_DIR, {
      intermediates: true,
    });
  }
};

export const useRecentlyPlayedStore = create<RecentlyPlayedState>(
  (set, get) => ({
    recentlyPlayed: [],
    isLoading: false,

    getRecentlyPlayedSongs: async (userId) => {
      try {
        await ensureDirectoryExists();

        const files = await fileSystem.readDirectoryAsync(RECENTLY_PLAYED_DIR);

        const songs: Song[] = [];

        for (const file of files) {
          if (!file.endsWith(".json")) continue;

          const filePath = `${RECENTLY_PLAYED_DIR}${file}`;

          try {
            const content = await fileSystem.readAsStringAsync(filePath);
            const song = JSON.parse(content) as Song;

            // Support both existing files and newly saved files.
            const parts = file.slice(0, -5).split("_");
            const filenameUserId = parts[parts.length - 2];

            if (
              song.userId === userId ||
              (!song.userId && filenameUserId === userId)
            ) {
              songs.push(song);
            }
          } catch (error) {
            console.warn("[RECENTLY PLAYED] Could not read file:", file, error);
          }
        }

        return songs.sort((a, b) => b.playedAt - a.playedAt);
      } catch (error) {
        console.error("Error retrieving recently played songs:", error);

        return [];
      }
    },

    saveRecentlyPlayedSong: async (userId, songData) => {
      try {
        await ensureDirectoryExists();

        const files = await fileSystem.readDirectoryAsync(RECENTLY_PLAYED_DIR);

        let existingFile: string | undefined;

        for (const file of files) {
          if (!file.endsWith(".json")) continue;

          const filePath = `${RECENTLY_PLAYED_DIR}${file}`;

          try {
            const content = await fileSystem.readAsStringAsync(filePath);
            const existingSong = JSON.parse(content) as Song;

            const parts = file.slice(0, -5).split("_");
            const filenameUserId = parts[parts.length - 2];

            const sameUser =
              existingSong.userId === userId ||
              (!existingSong.userId && filenameUserId === userId);

            if (sameUser && existingSong.name === songData.name) {
              existingFile = file;
              break;
            }
          } catch {
            // Skip invalid files.
          }
        }

        const updatedSong: Song = {
          ...songData,
          userId,
          playedAt: Date.now(),
        };

        if (existingFile) {
          const filePath = `${RECENTLY_PLAYED_DIR}${existingFile}`;

          await fileSystem.writeAsStringAsync(
            filePath,
            JSON.stringify(updatedSong),
          );
        } else {
          const fileName = `${songData.name}_${userId}_${updatedSong.playedAt}.json`;

          const filePath = `${RECENTLY_PLAYED_DIR}${fileName}`;

          await fileSystem.writeAsStringAsync(
            filePath,
            JSON.stringify(updatedSong),
          );
        }

        const songs = await get().getRecentlyPlayedSongs(userId);

        set({ recentlyPlayed: songs });
      } catch (error) {
        console.error("Error saving/updating song:", error);
      }
    },

    deleteOldSongs: async () => {
      try {
        await ensureDirectoryExists();

        const files = await fileSystem.readDirectoryAsync(RECENTLY_PLAYED_DIR);

        const oneWeekAgo = Date.now() - ONE_WEEK_MS;

        for (const file of files) {
          if (!file.endsWith(".json")) continue;

          const filePath = `${RECENTLY_PLAYED_DIR}${file}`;

          try {
            const content = await fileSystem.readAsStringAsync(filePath);
            const song = JSON.parse(content) as Song;

            if (
              typeof song.playedAt === "number" &&
              song.playedAt < oneWeekAgo
            ) {
              await fileSystem.deleteAsync(filePath, {
                idempotent: true,
              });
            }
          } catch (error) {
            console.warn("[RECENTLY PLAYED] Cleanup failed:", file, error);
          }
        }
      } catch (error) {
        console.error("Error deleting old songs:", error);
      }
    },

    loadRecentlyPlayed: async (userId) => {
      set({ isLoading: true });

      try {
        await ensureDirectoryExists();
        await get().deleteOldSongs();

        const songs = await get().getRecentlyPlayedSongs(userId);

        set({ recentlyPlayed: songs });
      } catch (error) {
        console.error("Error loading recently played songs:", error);
      } finally {
        set({ isLoading: false });
      }
    },
  }),
);
