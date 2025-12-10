import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePreviousStore = create(
  persist(
    set => ({
      previousView: null,
      parentView: null,

      // Set both views
      setBothViews: (previousView, parentView) =>
        set({ previousView, parentView }),

      // Set only previous view
      setPreviousView: previousView => set({ previousView }),

      // Set only parent view
      setParentView: parentView => set({ parentView }),

      // Clear both views
      clearBothViews: () => set({ previousView: null, parentView: null }),

      // Clear only previous view
      clearPreviousView: () => set({ previousView: null }),

      // Clear only parent view
      clearParentView: () => set({ parentView: null }),
    }),
    {
      name: "previous-view-storage",
      getStorage: () => localStorage,
    },
  ),
);

export default usePreviousStore;
