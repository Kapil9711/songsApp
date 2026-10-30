import type { MediaItem } from "@rntp/player";
import { create } from "zustand";

export type PlayerStatus = "idle" | "loading" | "ready" | "error";

export type RepeatMode = "off" | "track" | "queue";

interface PlayerState {
  status: PlayerStatus;
  error: string | null;

  queue: MediaItem[];
  activeTrack: MediaItem | null;
  activeIndex: number;

  isPlaying: boolean;
  playbackState: string;

  isShuffled: boolean;
  repeatMode: RepeatMode;

  setStatus: (status: PlayerStatus) => void;
  setError: (error: string | null) => void;

  setQueue: (queue: MediaItem[]) => void;
  setActiveTrack: (track: MediaItem | null, index: number) => void;

  setPlayback: (playing: boolean, state?: string) => void;

  setShuffled: (isShuffled: boolean) => void;
  setRepeatMode: (repeatMode: RepeatMode) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  status: "idle",
  error: null,

  queue: [],
  activeTrack: null,
  activeIndex: -1,

  isPlaying: false,
  playbackState: "unknown",

  // Native player settings
  isShuffled: false,
  repeatMode: "off",

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

  setShuffled: (isShuffled) => set({ isShuffled }),

  setRepeatMode: (repeatMode) => set({ repeatMode }),
}));
