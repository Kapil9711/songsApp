import { useDownloadStore } from "@/store/donwload.store";
import { useSettingsStore } from "@/store/settings.store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";
import { getIndexFromSoundQuality } from "./convertSongListToPlayerList";

const DOWNLOADS_DIRECTORY = new Directory(Paths.document, "downloads");

const DOWNLOADS_METADATA_KEY = "@riffly/downloaded-songs";

export type DownloadableSong = {
  id: string | number;
  name: string;
  downloadUrl: any;
  image?: any;
  artist?: any;
  [key: string]: unknown;
};

export type DownloadedSong = DownloadableSong & {
  localUri: string;
  downloadedAt: number;
  fileSize?: number;
};

type DownloadOptions = {
  onProgress?: (progress: number) => void;
};

class DownloadService {
  private initialized = false;

  /**
   * Create the persistent downloads directory.
   */
  async initialize(): Promise<void> {
    if (this.initialized && DOWNLOADS_DIRECTORY.exists) {
      return;
    }

    if (!DOWNLOADS_DIRECTORY.exists) {
      DOWNLOADS_DIRECTORY.create({
        idempotent: true,
        intermediates: true,
      });
    }

    this.initialized = true;
  }

  /**
   * Read downloaded song metadata.
   */
  private async readMetadata(): Promise<DownloadedSong[]> {
    const raw = await AsyncStorage.getItem(DOWNLOADS_METADATA_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      return Array.isArray(parsed) ? (parsed as DownloadedSong[]) : [];
    } catch {
      return [];
    }
  }

  /**
   * Persist downloaded song metadata.
   */
  private async saveMetadata(songs: DownloadedSong[]): Promise<void> {
    await AsyncStorage.setItem(DOWNLOADS_METADATA_KEY, JSON.stringify(songs));
  }

  /**
   * Convert a song ID into a safe filename.
   */
  private getFileName(id: string | number): string {
    const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, "_");

    return `${safeId}.audio`;
  }

  /**
   * Download a song into persistent app storage.
   */
  async downloadSong(
    song: DownloadableSong,
    options?: DownloadOptions,
  ): Promise<DownloadedSong> {
    if (!song.downloadUrl) {
      throw new Error("Song download URL is missing.");
    }

    await this.initialize();

    const existing = await this.getDownloadedSong(song.id);

    if (existing) {
      return existing;
    }

    const file = new File(DOWNLOADS_DIRECTORY, this.getFileName(song.id));

    const quality = useSettingsStore?.getState().downloadSongQuality;
    const index = getIndexFromSoundQuality(quality);

    const downloadUrl = song?.downloadUrl?.[index]?.url;

    try {
      const downloadedFile = await File.downloadFileAsync(downloadUrl, file, {
        idempotent: true,

        onProgress: ({ bytesWritten, totalBytes }) => {
          if (totalBytes > 0) {
            options?.onProgress?.(
              Math.min(100, (bytesWritten / totalBytes) * 100),
            );
          }
        },
      });

      if (!downloadedFile.exists) {
        throw new Error("Downloaded audio file was not created.");
      }

      const downloadedSong: DownloadedSong = {
        ...song,
        localUri: downloadedFile.uri,
        downloadedAt: Date.now(),
        fileSize: downloadedFile.size ?? undefined,
      };

      const songs = await this.readMetadata();

      await this.saveMetadata([
        ...songs.filter((item) => String(item.id) !== String(song.id)),
        downloadedSong,
      ]);

      options?.onProgress?.(100);
      useDownloadStore.getState().addDownloadedSong(downloadedSong);

      return downloadedSong;
    } catch (error) {
      // Do not leave a partial file behind after a failed download.
      if (file.exists) {
        file.delete();
      }

      throw error;
    }
  }

  /**
   * Retrieve all downloaded songs.
   * Missing files are removed from the returned list and metadata.
   */
  async getDownloadedSongs(): Promise<DownloadedSong[]> {
    await this.initialize();

    const songs = await this.readMetadata();
    const validSongs: DownloadedSong[] = [];

    for (const song of songs) {
      const file = new File(song.localUri);

      if (file.exists) {
        validSongs.push({
          ...song,
          localUri: file.uri,
          fileSize: file.size ?? song.fileSize,
        });
      }
    }

    if (validSongs.length !== songs.length) {
      await this.saveMetadata(validSongs);
    }

    return validSongs;
  }

  /**
   * Retrieve a single downloaded song by ID.
   */
  async getDownloadedSong(id: string | number): Promise<DownloadedSong | null> {
    const songs = await this.readMetadata();

    const song = songs.find((item) => String(item.id) === String(id));

    if (!song) {
      return null;
    }

    const file = new File(song.localUri);

    if (!file.exists) {
      await this.saveMetadata(
        songs.filter((item) => String(item.id) !== String(id)),
      );

      return null;
    }

    return {
      ...song,
      localUri: file.uri,
      fileSize: file.size ?? song.fileSize,
    };
  }

  /**
   * Check whether a song is downloaded and its file exists.
   */
  async isDownloaded(id: string | number): Promise<boolean> {
    return (await this.getDownloadedSong(id)) !== null;
  }

  /**
   * Return a player-ready song using its local file URI.
   */
  async getPlayableSong(
    id: string | number,
  ): Promise<(DownloadedSong & { url: string }) | null> {
    const song = await this.getDownloadedSong(id);

    if (!song) {
      return null;
    }

    return {
      ...song,
      url: song.localUri,
    };
  }

  /**
   * Delete a downloaded song and its metadata.
   */
  async deleteSong(id: string | number): Promise<void> {
    const songs = await this.readMetadata();

    const song = songs.find((item) => String(item.id) === String(id));

    if (song) {
      const file = new File(song.localUri);

      if (file.exists) {
        file.delete();
        useDownloadStore.getState().removeDownloadedSong(String(id));
      }
    } else {
      // Also check the expected path if metadata is missing.
      await this.initialize();

      const file = new File(DOWNLOADS_DIRECTORY, this.getFileName(id));

      if (file.exists) {
        file.delete();
      }
    }

    await this.saveMetadata(
      songs.filter((item) => String(item.id) !== String(id)),
    );
  }

  /**
   * Remove all downloaded songs.
   */
  async clearDownloads(): Promise<void> {
    await this.initialize();

    if (DOWNLOADS_DIRECTORY.exists) {
      DOWNLOADS_DIRECTORY.delete();

      DOWNLOADS_DIRECTORY.create({
        idempotent: true,
        intermediates: true,
      });
    }

    await this.saveMetadata([]);
  }

  /**
   * Get remaining device storage in bytes.
   */
  getStorageInfo(): {
    availableBytes: number;
  } {
    return {
      availableBytes: Paths.availableDiskSpace,
    };
  }
}

export const downloadService = new DownloadService();
