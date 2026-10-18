import { create } from "zustand";

interface UIState {
  songsListToRender: any[];
  renderType: string;
  setSongsLIstToRender: (list: any[], isAdd?: boolean) => void;
  setRenderType: (str: string) => void;
}

export const useSongList = create<UIState>((set) => ({
  songsListToRender: [],
  renderType: "",
  setSongsLIstToRender: (list, isAdd = false) =>
    set((state) => ({
      songsListToRender: isAdd ? [...state.songsListToRender, ...list] : list,
    })),
  setRenderType: (type: string) => {
    set({ renderType: type });
  },
}));
