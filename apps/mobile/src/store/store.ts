import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { appSlice, AppState } from "./app.slice";

export type StoreState = AppState;

export const useStore = create<StoreState>()(
  subscribeWithSelector(
    persist(
      immer((...args) => ({
        ...appSlice(...args),
      })),
      {
        name: "riffly-app-settings",
        storage: createJSONStorage(() => AsyncStorage),

        // Persist only settings, not transient app state or actions.
        partialize: (state) =>
          ({
            app: {
              system: state.app.system,
            },
          }) as StoreState,

        // Preserve actions and default values while restoring saved settings.
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<StoreState> | undefined;

          return {
            ...currentState,
            app: {
              ...currentState.app,
              system: {
                ...currentState.app.system,
                ...persisted?.app?.system,
              },
            },
          };
        },
      },
    ),
  ),
);

export default useStore;
