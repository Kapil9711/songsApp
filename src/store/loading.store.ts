import { create } from "zustand";

interface LoadingState {
  loading: boolean;
  title: string;
  updateLoading: (loading: boolean, title?: string) => void;
}

export const useLoading = create<LoadingState>((set) => ({
  loading: false,
  title: "",

  updateLoading: (loading, title = "") =>
    set({
      loading,
      title,
    }),
}));
