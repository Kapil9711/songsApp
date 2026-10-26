import { create } from "zustand";

interface PlayerProgressState {
  position: number;
  duration: number;
  buffered: number;
  cached: number;

  setProgress: (progress: {
    position: number;
    duration: number;
    buffered: number;
    cached: number;
  }) => void;

  reset: () => void;
}

const initialProgress = {
  position: 0,
  duration: 0,
  buffered: 0,
  cached: 0,
};

export const usePlayerProgressStore = create<PlayerProgressState>((set) => ({
  ...initialProgress,

  setProgress: (progress) => set(progress),

  reset: () => set(initialProgress),
}));
