import { create } from "zustand";
import type { MediaItem } from "@rntp/player";

export type PlayerStatus = "idle" | "loading" | "ready" | "error";

interface PlayerState {
  status: PlayerStatus;
  error: string | null;

  queue: MediaItem[];
  activeTrack: MediaItem | null;
  activeIndex: number;

  isPlaying: boolean;
  playbackState: string;

  setStatus: (status: PlayerStatus) => void;
  setError: (error: string | null) => void;
  setQueue: (queue: MediaItem[]) => void;
  setActiveTrack: (track: MediaItem | null, index: number) => void;
  setPlayback: (playing: boolean, state?: string) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  status: "idle",
  error: null,

  queue: [],
  activeTrack: null,
  activeIndex: -1,

  isPlaying: false,
  playbackState: "unknown",

  setStatus: (status) => set({ status }),

  setError: (error) => set({ error }),

  setQueue: (queue) => set({ queue }),

  setActiveTrack: (activeTrack, activeIndex) =>
    set({ activeTrack, activeIndex }),

  setPlayback: (isPlaying, playbackState) =>
    set((state) => ({
      isPlaying,
      playbackState: playbackState ?? state.playbackState,
    })),
}));
