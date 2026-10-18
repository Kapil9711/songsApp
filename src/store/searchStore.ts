import { create } from "zustand";
interface SearchStore {
  search: string;
  setSearchString: (str: string) => void;
}
export const useSearchStore = create<SearchStore>((set) => ({
  search: "",
  setSearchString(str) {
    set({ search: str });
  },
}));
