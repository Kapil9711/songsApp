import { SoundQuality, useSettingsStore } from "@/store/settings.store";

export const convertSongListToPlayerList = (data: any[]) => {
  const soundQuality = useSettingsStore.getState()?.soundQuality;

  return data?.map((item: any, index: number) => {
    return {
      mediaId: item.id || item._id || index,
      url: item.downloadUrl?.[getIndexFromSoundQuality(soundQuality)]?.url,
      title: item.name,
      artist:
        typeof item?.artists == "string"
          ? item?.artists
          : item?.artists && Array.isArray(item?.artists?.primary)
            ? item.artists?.primary
                ?.map((artist: any) => artist.name)
                .join(", ")
            : "unknown",
      artworkUrl: item.image?.[2]?.url,
    };
  });
};

export const convertPlayerListToNormalSongList = (songs: any) => {
  return songs?.map((item: any) => {
    return {
      id: item.mediaId,
      name: item.title,
      downloadUrl: [
        { url: item?.url, quality: "320kbps" },
        { url: item?.url, quality: "320kbps" },
        { url: item?.url, quality: "320kbps" },
        { url: item?.url, quality: "320kbps" },
        { url: item?.url, quality: "320kbps" },
      ],
      artists: item.artist,
      image: [
        { url: item?.artworkUrl, quality: "high" },
        { url: item?.artworkUrl, quality: "high" },
        { url: item?.artworkUrl, quality: "high" },
      ],
    };
  });
};

export const getIndexFromSoundQuality = (soundQuality: SoundQuality) => {
  switch (soundQuality) {
    case "low":
      return 1;
    case "mid":
      return 2;
    case "high":
      return 3;
    case "hd":
      return 4;
    default:
      return 4;
  }
};
