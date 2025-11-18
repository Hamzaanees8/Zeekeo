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
        localStorage.clear();
      },

      setLoginAsToken: (token, user = null) => {
        const { sessionToken, refreshToken, currentUser } = get();

        const targetUser = user || currentUser;

        set({
          originalSessionToken: sessionToken,
          originalRefreshToken: refreshToken,
          originalUser: currentUser,
          loginAsSessionToken: token,
          sessionToken: token,
          currentUser: targetUser,
          refreshToken: refreshToken,
        });

        console.log("🔀 Login-as session activated:", {
          originalUser: currentUser?.email,
          newUser: targetUser?.email,
          hasToken: !!token,
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

        console.log("🔁 Restored original session:", originalUser?.email);
      },

      getActiveToken: () => {
        const { loginAsSessionToken, sessionToken } = get();
        return loginAsSessionToken || sessionToken;
      },

      isLoginAsMode: () => {
        return !!get().loginAsSessionToken;
      },

      initializeLoginAs: () => {
        const state = get();
        if (
          state.loginAsSessionToken &&
          state.sessionToken !== state.loginAsSessionToken
        ) {
          console.log("🔄 Reactivating login-as session from storage");
          set({
            sessionToken: state.loginAsSessionToken,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    },
  ),
);
