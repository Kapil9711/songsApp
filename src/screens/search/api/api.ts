import { jioApi } from "@/config/network/api.config";
import { endpoints } from "@/config/network/endpoints";

export type SongsParams = {
  limit: number;
  query: string;
  page: number;
};

export const getSongs = async (params: SongsParams) => {
  const { data } = await jioApi.get(endpoints.jioApi.songs, { params });
  //   return data?.data?.results?.filter((item: any) => item.language == "hindi");
  return data?.data?.results;
};

export const getAlbums = async (params: SongsParams) => {
  const { data } = await jioApi.get(endpoints.jioApi.albums, { params });
  return data?.data?.results;
};

export const getPlaylists = async (params: SongsParams) => {
  const { data } = await jioApi.get(endpoints.jioApi.playlist, { params });
  return data?.data?.results;
};
