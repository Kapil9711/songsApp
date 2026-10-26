import { useQuery } from "@tanstack/react-query";
import {
  getAblumSongById,
  getPlaylists,
  getPlaylistSongById,
  getTrendingSongs,
} from "./api";

const QueryKeys = {
  trending: ["trending"],
  playlist: (query: string) => ["playlist", query],
};

export const useGetAlbumPlaylistSongQuery = (id: string, isAlbum: boolean) => {
  return useQuery({
    queryKey: [isAlbum ? "singleAlbum" : "singlePlaylist", id],
    queryFn: () => (isAlbum ? getAblumSongById(id) : getPlaylistSongById(id)),
  });
};

export const useTrendingSongsQuery = () => {
  return useQuery({
    queryKey: QueryKeys.trending,
    queryFn: getTrendingSongs,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useGetPlaylistQuery = (query: string) => {
  return useQuery({
    queryKey: QueryKeys.playlist(query),
    queryFn: () => getPlaylists(query),
    staleTime: 1000 * 60 * 60 * 24,
  });
};
