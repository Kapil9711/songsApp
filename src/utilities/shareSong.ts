import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export async function shareAudio(audioUrl: string, songName: string) {
  try {
    if (!audioUrl) {
      throw new Error("Audio URL is required");
    }

    const canShare = await Sharing.isAvailableAsync();

    if (!canShare) {
      throw new Error("Sharing is not available on this device");
    }

    const directory = FileSystem.cacheDirectory;

    if (!directory) {
      throw new Error("Cache directory is unavailable");
    }

    // Remove characters that are invalid or unsafe in filenames.
    const safeName =
      songName
        .trim()
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
        .replace(/[. ]+$/g, "") || "Untitled Song";

    const localUri = `${directory}${safeName}.mp3`;

    const download = await FileSystem.downloadAsync(audioUrl, localUri);

    if (download.status < 200 || download.status >= 300) {
      throw new Error(`Audio download failed: ${download.status}`);
    }

    await Sharing.shareAsync(download.uri, {
      mimeType: "audio/mpeg",
      dialogTitle: `Share ${safeName}`,
      UTI: "public.mp3",
    });
  } catch (error) {
    console.error("Failed to share audio:", error);
    throw error;
  }
}
