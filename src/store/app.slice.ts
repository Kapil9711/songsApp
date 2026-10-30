import { DEFAULT_THEME } from "@/constants";
import { produce } from "immer";
import { StateCreator } from "zustand";
import { StoreState } from "./store";

const sliceKey = "app" as const;

export type ColorScheme = "light" | "dark";

export interface AppStateData {
  isReady: boolean;

  connectivity: {
    isConnected: boolean | null;
    isOnline: boolean | null;
  };

  system: {
    theme: string;
    colorScheme: ColorScheme | null;
  };
}

export interface AppStateActions {
  setTheme: (theme: string) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setAppReadyStatus: (isReady: boolean) => void;
  set: (updater: (state: AppState) => void) => void;
}

export interface AppState {
  [sliceKey]: AppStateData & AppStateActions;
}

export const appSlice: StateCreator<StoreState, [], [], AppState> = (set) => ({
  [sliceKey]: {
    isReady: false,

    connectivity: {
      isConnected: null,
      isOnline: null,
    },

    system: {
      theme: DEFAULT_THEME,
      colorScheme: null,
    },

    setTheme: (theme) =>
      set(
        produce((state: StoreState) => {
          state.app.system.theme = theme;
        }),
      ),

    setColorScheme: (colorScheme) =>
      set(
        produce((state: StoreState) => {
          state.app.system.colorScheme = colorScheme;
        }),
      ),

    setAppReadyStatus: (isReady) =>
      set((state) => ({
        ...state,
        [sliceKey]: {
          ...state[sliceKey],
          isReady,
        },
      })),

    set: (updater) => set(produce(updater)),
  },
});
