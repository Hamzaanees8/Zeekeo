import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePreviousStore = create(
  persist(
    set => ({
      previousView: null,

      setPreviousView: view => set({ previousView: view }),

      clearPreviousView: () => set({ previousView: null }),
    }),
    {
      name: "previous-view-storage",
      getStorage: () => localStorage,
    },
  ),
);

export default usePreviousStore;
