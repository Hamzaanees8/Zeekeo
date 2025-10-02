import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      sessionToken: null,
      refreshToken: null,
      currentUser: null,

      setTokens: (sessionToken, refreshToken) => {
        set({ sessionToken, refreshToken });
      },

      setUser: (user) => {
        set({ currentUser: user });
      },

      login: (sessionToken, refreshToken, user) => {
        set({ sessionToken, refreshToken, currentUser: user });
      },

      logout: () => {
        set({ sessionToken: null, refreshToken: null, currentUser: null });
      },
    }),
    {
      name: "auth-storage", // key in localStorage
      getStorage: () => localStorage,
    }
  )
);
