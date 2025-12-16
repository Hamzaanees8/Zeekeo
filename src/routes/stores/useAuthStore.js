import { create } from "zustand";
import { persist } from "zustand/middleware";
import useAgencyStore from "./useAgencyStore";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Current active session
      sessionToken: null,
      refreshToken: null,
      currentUser: null,

      // Impersonation chain stack
      impersonationChain: [], // Array of {sessionToken, refreshToken, user, userType, timestamp}

      // Original credentials (when first impersonating)
      originalSessionToken: null,
      originalRefreshToken: null,
      originalUser: null,

      // Helper functions
      setTokens: (sessionToken, refreshToken) => {
        set({ sessionToken, refreshToken });
      },

      setUser: user => {
        set({ currentUser: user });
      },

      login: (sessionToken, refreshToken, user) => {
        set({
          sessionToken,
          refreshToken,
          currentUser: user,
          originalSessionToken: sessionToken,
          originalRefreshToken: refreshToken,
          originalUser: user,
          impersonationChain: [], // Reset chain on new login
        });
      },

      // Enter impersonation mode (add to chain) - FIXED
      enterImpersonation: (sessionToken, refreshToken, user, userType) => {
        const state = get();
        const newImpersonation = {
          sessionToken,
          refreshToken, // Add refreshToken
          user,
          userType, // 'agency', 'user', etc.
          timestamp: Date.now(),
        };

        // Store original credentials if this is the first impersonation
        const shouldStoreOriginal = state.impersonationChain.length === 0;

        set({
          sessionToken,
          refreshToken, // Don't forget to set refreshToken
          currentUser: user,
          impersonationChain: [...state.impersonationChain, newImpersonation],
          // Store original credentials if first time impersonating
          ...(shouldStoreOriginal && {
            originalSessionToken: state.sessionToken,
            originalRefreshToken: state.refreshToken,
            originalUser: state.currentUser,
          }),
        });
      },

      // Exit impersonation (go back one level) - FIXED
      exitImpersonation: () => {
        const state = get();
        const chain = [...state.impersonationChain];

        if (chain.length === 0) return;

        // Remove current level
        chain.pop();

        if (chain.length === 0) {
          // Back to original user
          set({
            sessionToken: state.originalSessionToken,
            refreshToken: state.originalRefreshToken,
            currentUser: state.originalUser,
            impersonationChain: [],
          });
        } else {
          // Back to previous level in chain
          const prevLevel = chain[chain.length - 1];
          set({
            sessionToken: prevLevel.sessionToken,
            refreshToken: prevLevel.refreshToken, // Restore refreshToken too
            currentUser: prevLevel.user,
            impersonationChain: chain,
          });
        }
      },

      // Switch between users at same level (e.g., User A → User B) - FIXED
      switchUser: (sessionToken, refreshToken, user) => {
        const state = get();
        const chain = [...state.impersonationChain];

        if (chain.length === 0) {
          // Not in impersonation - just update current
          set({ sessionToken, refreshToken, currentUser: user });
        } else {
          // Replace current level in chain
          chain[chain.length - 1] = {
            ...chain[chain.length - 1],
            sessionToken,
            refreshToken,
            user,
            timestamp: Date.now(),
          };

          set({
            sessionToken,
            refreshToken,
            currentUser: user,
            impersonationChain: chain,
          });
        }
      },

      // Get current impersonation level info
      getCurrentImpersonationLevel: () => {
        const { impersonationChain } = get();
        return impersonationChain.length;
      },

      // Get user type at current level - FIXED
      getCurrentUserType: () => {
        const state = get();
        if (state.impersonationChain.length === 0) {
          // Not impersonating - determine type from current user
          if (state.currentUser?.admin === 1) return "admin";
          if (state.currentUser?.agency_admin) return "agency";
          return "user";
        }
        const lastEntry =
          state.impersonationChain[state.impersonationChain.length - 1];

        // Handle case where userType might not be set properly
        if (lastEntry.userType && typeof lastEntry.userType === "string") {
          return lastEntry.userType;
        }

        // Fallback: determine from user object
        if (lastEntry.user?.admin === 1) return "admin";
        if (lastEntry.user?.agency_admin) return "agency";
        return "user";
      },

      // Check if we're impersonating
      isImpersonating: () => {
        return get().impersonationChain.length > 0;
      },

      // Fix corrupted chain data
      fixCorruptedChain: () => {
        const state = get();
        const fixedChain = state.impersonationChain.map(entry => {
          // Fix userType if it's an object
          if (entry.userType && typeof entry.userType === "object") {
            if (entry.userType.admin === 1) {
              return { ...entry, userType: "admin" };
            } else if (entry.userType.agency_admin) {
              return { ...entry, userType: "agency" };
            } else {
              return { ...entry, userType: "user" };
            }
          }
          return entry;
        });

        if (
          JSON.stringify(fixedChain) !==
          JSON.stringify(state.impersonationChain)
        ) {
          set({ impersonationChain: fixedChain });
        }
      },

      // Update user data when fetched after impersonation
      updateImpersonatedUser: userData => {
        const state = get();

        if (state.impersonationChain.length > 0) {
          // Update user in the current chain entry
          const chain = [...state.impersonationChain];
          const lastIndex = chain.length - 1;
          chain[lastIndex] = {
            ...chain[lastIndex],
            user: userData,
          };

          set({
            currentUser: userData,
            impersonationChain: chain,
          });
        } else {
          // Not impersonating, update normally
          set({ currentUser: userData });
        }
      },

      logout: () => {
        useAgencyStore.getState().clearAgencyEmail();

        set({
          sessionToken: null,
          refreshToken: null,
          currentUser: null,
          originalSessionToken: null,
          originalRefreshToken: null,
          originalUser: null,
          impersonationChain: [],
        });
      },

      // Helper to get active token for API calls
      getActiveToken: () => {
        return get().sessionToken;
      },

      // Clear all impersonation and return to original
      clearAllImpersonation: () => {
        const state = get();
        set({
          sessionToken: state.originalSessionToken || state.sessionToken,
          refreshToken: state.originalRefreshToken || state.refreshToken,
          currentUser: state.originalUser || state.currentUser,
          impersonationChain: [],
        });
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    },
  ),
);
