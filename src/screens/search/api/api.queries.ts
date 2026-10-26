import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getAblumSongById,
  getAlbums,
  getHomePagePlaylist,
  getPlaylists,
  getPlaylistSongById,
  getSongs,
} from "./api";

const SearchQueryKey = {
  all: ["search"] as const,

  songs: (limit: number, query: string) =>
    [...SearchQueryKey.all, "songs", limit, query] as const,

  albums: (limit: number, query: string) =>
    [...SearchQueryKey.all, "albums", limit, query] as const,

  playlists: (limit: number, query: string) =>
    [...SearchQueryKey.all, "playlists", limit, query] as const,
};

type SearchResult = {
  id: string;
  [key: string]: any;
};

const getResults = (response: SearchResult[] | undefined): SearchResult[] =>
  Array.isArray(response) ? response : [];

const getNextPage = (
  lastPage: SearchResult[],
  allPages: SearchResult[][],
  limit: number,
) => {
  // Stop if the API returned fewer results than requested.
  if (lastPage.length < limit) {
    return undefined;
  }

  return allPages.length + 1;
};

export const useSongsSearchQuery = (params: { limit: number; query: string }) =>
  useInfiniteQuery({
    queryKey: SearchQueryKey.songs(params.limit, params.query),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getSongs({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) =>
      getNextPage(lastPage, allPages, params.limit),
    enabled: params.query.trim().length > 0,
  });

export const useAlbumsSearchQuery = (params: {
  limit: number;
  query: string;
}) =>
  useInfiniteQuery({
    queryKey: SearchQueryKey.albums(params.limit, params.query),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getAlbums({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) =>
      getNextPage(lastPage, allPages, params.limit),
    enabled: params.query.trim().length > 0,
  });

export const usePlaylistsSearchQuery = (params: {
  limit: number;
  query: string;
}) =>
  useInfiniteQuery({
    queryKey: SearchQueryKey.playlists(params.limit, params.query),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getPlaylists({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) =>
      getNextPage(lastPage, allPages, params.limit),
    enabled: params.query.trim().length > 0,
  });

export const useHomePagePlaylistQuery = (query: string) => {
  return useQuery({
    queryKey: ["home", "playlist", query],
    queryFn: () => getHomePagePlaylist(query),
    // staleTime: 0,
  });
};

export const useGetAlbumPlaylistSongQuery = (id: string, isAlbum: boolean) => {
  return useQuery({
    queryKey: ["search", isAlbum ? "singleAlbum" : "singlePlaylist", id],
    queryFn: () => (isAlbum ? getAblumSongById(id) : getPlaylistSongById(id)),
  });
};

// export const useGetAlbumSongQuery = (id: string) => {
//   return useQuery({
//     queryKey: ["search", "singleAlbum"],
//     queryFn: () => getAblumSongById(id),
//   });
// };
