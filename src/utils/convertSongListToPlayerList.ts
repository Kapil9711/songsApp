import { SoundQuality, useSettingsStore } from "@/store/settings.store";

export const convertSongListToPlayerList = (data: any[]) => {
  const soundQuality = useSettingsStore.getState()?.soundQuality;

  return data?.map((item: any, index: number) => {
    return {
      mediaId: item.id || item._id || index,
      url: item.downloadUrl?.[getIndexFromSoundQuality(soundQuality)]?.url,
      title: item.name,
      artist:
        item?.artists && Array.isArray(item?.artists?.primary)
          ? item.artists?.primary?.map((artist: any) => artist.name).join(", ")
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
        { url: item?.url },
        { url: item?.url },
        { url: item?.url },
        { url: item?.url },
      ],
      artist: item.artist,
      image: [
        { url: item?.artworkUrl },
        { url: item?.artworkUrl },
        { url: item?.artworkUrl },
      ],
    };
  });
};

export const getIndexFromSoundQuality = (soundQuality: SoundQuality) => {
  switch (soundQuality) {
    case "low":
      return 0;
    case "mid":
      return 1;
    case "high":
      return 2;
    case "hd":
      return 3;
    default:
      return 3;
  }
};
