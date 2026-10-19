import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { appSlice, AppState } from "./app.slice";

export type StoreState = AppState;
export const useStore = create<StoreState>()(
  subscribeWithSelector(
    immer((...a) => ({
      ...appSlice(...a),
    })),
  ),
);

export default useStore;
