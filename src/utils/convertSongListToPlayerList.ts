export const convertSongListToPlayerList = (data: any[]) => {
  return data?.map((item: any, index: number) => {
    return {
      mediaId: item.id || item._id || index,
      url: item.downloadUrl?.[3]?.url,
      title: item.name,
      artist:
        item?.artists && Array.isArray(item?.artists?.primary)
          ? item.artists?.primary?.map((artist: any) => artist.name).join(", ")
          : "unknown",
      artworkUrl: item.image?.[2]?.url,
    };
  });
};
