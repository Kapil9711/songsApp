import { api, jioApi } from "@/config/network/api.config";
import { endpoints } from "@/config/network/endpoints";
import axios from "axios";

export const getAblumSongById = async (id: string) => {
  const { data } = await jioApi.get(endpoints.jioApi.albumsSongs, {
    params: { id, limit: 100 },
  });

  if (data.success === true) {
    // console.log(data?.data?.songs?.[0], "singleAlbumSong");
    return data?.data?.songs;
  }
  return [];
};

export const getPlaylistSongById = async (id: string) => {
  const { data } = await jioApi.get(endpoints.jioApi.playlistSongs, {
    params: { id, limit: 100 },
  });

  if (data.success === true) {
    // console.log(data?.data?.songs?.[0], "singlePlaylistSong");
    return data?.data?.songs;
  }
  return [];
};

export const getTrendingSongs = async () => {
  const { data } = await axios.get(
    "https://song-backend-two.vercel.app" + endpoints.api.homePage,
  );
  if (data.success) {
    return {
      haryanvi: data.haryanvi,
      hindi: data.hindi,
      punjabi: data.punjabi,
    };
  }

  return { haryanvi: [], hindi: [], punjabi: [] };
};

export const getPlaylists = async (query: string) => {
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

export interface ExploreUser {
  id: string;
  name: string;
  image: string | null;
}

export interface UsersPage {
  users: ExploreUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    nextPage: number | null;
  };
}

interface GetUsersResponse {
  success: boolean;
  data: UsersPage;
}

export async function getUsers(params: {
  page: number;
  limit?: number;
}): Promise<UsersPage> {
  const response = await api.get<GetUsersResponse>(endpoints.api.users.list, {
    params: {
      page: params.page,
      limit: params.limit ?? 20,
    },
  });

  // Assumes `api` returns the normal Axios response.
  return response.data.data;
}
