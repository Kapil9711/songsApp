import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: true,

      setSession: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),

      clearSession: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),

      setInitializing: (value) => set({ isInitializing: value }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => {
        // Fallback if hydration never finishes.
        const timeout = setTimeout(() => {
          console.warn("Auth hydration timed out");
          useAuthStore.setState({ isInitializing: false });
        }, 5000);

        return (_state, error) => {
          clearTimeout(timeout);

          if (error) {
            console.error("Auth hydration failed:", error);
          }
          useAuthStore.setState({ isInitializing: false });
        };
      },
    },
  ),
);
