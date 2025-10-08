import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      sessionToken: null,
      refreshToken: null,
      currentUser: null,
      loginAsSessionToken: null,
      originalSessionToken: null,
      originalRefreshToken: null,
      originalUser: null,

      setTokens: (sessionToken, refreshToken) => {
        set({ sessionToken, refreshToken });
      },

      setUser: user => {
        set({ currentUser: user });
      },

      login: (sessionToken, refreshToken, user) => {
        set({ sessionToken, refreshToken, currentUser: user });
      },

      logout: () => {
        set({
          sessionToken: null,
          refreshToken: null,
          currentUser: null,
          loginAsSessionToken: null,
          originalSessionToken: null,
          originalRefreshToken: null,
          originalUser: null,
        });
      },
      setLoginAsToken: (token, user) => {
        const { sessionToken, refreshToken, currentUser } = get();
        set({
          originalSessionToken: sessionToken,
          originalRefreshToken: refreshToken,
          originalUser: currentUser,
          loginAsSessionToken: token,
        });
      },
      clearLoginAsToken: () => {
        const { originalSessionToken, originalRefreshToken, originalUser } =
          get();

        set({
          sessionToken: originalSessionToken,
          refreshToken: originalRefreshToken,
          currentUser: originalUser,
          loginAsSessionToken: null,
          originalSessionToken: null,
          originalRefreshToken: null,
          originalUser: null,
        });
      },

      getActiveToken: () => {
        const { loginAsSessionToken, sessionToken } = get();
        return loginAsSessionToken || sessionToken;
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    },
  ),
);
