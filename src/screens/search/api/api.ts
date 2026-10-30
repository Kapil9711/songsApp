import { jioApi } from "@/config/network/api.config";
import { endpoints } from "@/config/network/endpoints";
import { useSettingsStore } from "@/store/settings.store";

export type SongsParams = {
  limit: number;
  query: string;
  page: number;
};

export const getSongs = async (params: SongsParams) => {
  const { data } = await jioApi.get(endpoints.jioApi.songs, { params });
  const selectedLanguages = useSettingsStore.getState()?.selectedLanguages;
  const languageFilterMode = useSettingsStore.getState()?.languageFilterMode;
  // console.log(
  //   data?.data?.results[0]?.language,
  //   selectedLanguages,
  //   languageFilterMode,
  //   "songs",
  // );
  const isLanguageFilterNeeded = selectedLanguages?.length;
  if (isLanguageFilterNeeded) {
    return data?.data?.results?.filter((item: any) => {
      const isIncluded = checkSongIncludeLanguage(item, selectedLanguages);
      switch (languageFilterMode) {
        case "include":
          if (isIncluded) return true;
          else return false;
        case "exclude":
          if (isIncluded) return false;
          else return true;
      }
    });
  }
  return data?.data?.results;
};
export const getAlbums = async (params: SongsParams) => {
  const { data } = await jioApi.get(endpoints.jioApi.albums, { params });
  const selectedLanguages = useSettingsStore.getState()?.selectedLanguages;
  const languageFilterMode = useSettingsStore.getState()?.languageFilterMode;
  // console.log(
  //   data?.data?.results[0]?.language,
  //   selectedLanguages,
  //   languageFilterMode,
  //   "album",
  // );
  const isLanguageFilterNeeded = selectedLanguages?.length;
  // console.log(data?.data?.results?.[0]);
  if (isLanguageFilterNeeded) {
    return data?.data?.results?.filter((item: any) => {
      const isIncluded = checkSongIncludeLanguage(item, selectedLanguages);
      switch (languageFilterMode) {
        case "include":
          if (isIncluded) return true;
          else return false;
        case "exclude":
          if (isIncluded) return false;
          else return true;
      }
    });
  }
  return data?.data?.results;
};

export const getPlaylists = async (params: SongsParams) => {
  const { data } = await jioApi.get(endpoints.jioApi.playlist, { params });
  const selectedLanguages = useSettingsStore.getState()?.selectedLanguages;
  const languageFilterMode = useSettingsStore.getState()?.languageFilterMode;
  // console.log(
  //   data?.data?.results[0]?.language,
  //   selectedLanguages,
  //   languageFilterMode,
  //   "playlist",
  // );
  const isLanguageFilterNeeded = selectedLanguages?.length;
  // console.log(data?.data?.results?.[0]);

  if (isLanguageFilterNeeded) {
    return data?.data?.results?.filter((item: any) => {
      const isIncluded = checkSongIncludeLanguage(item, selectedLanguages);
      switch (languageFilterMode) {
        case "include":
          if (isIncluded) return true;
          else return false;
        case "exclude":
          if (isIncluded) return false;
          else return true;
      }
    });
  }
  return data?.data?.results;
};

export const getHomePagePlaylist = async (query: string) => {
  const { data } = await jioApi.get(endpoints.jioApi.playlist, {
    params: { query, limmit: 50 },
  });

  const hindi: any = [];
  const english: any = [];
  const punjabi: any = [];
  const haryanvi: any = [];

  data?.data?.results.forEach((item: any) => {
    if (item?.language == "hindi") hindi.push(item);
    if (item?.language == "english") english.push(item);
    if (item?.language == "punjabi") punjabi.push(item);
    if (item?.language == "haryanvi") haryanvi.push(item);
  });

  return {
    hindi,
    english,
    haryanvi,
    punjabi,
    all: [...hindi, ...haryanvi, ...punjabi, ...english],
  };
};

const checkSongIncludeLanguage = (song: any, languages: any[]) => {
  const songLanguage = song?.language;
  return languages.includes(songLanguage);
};
