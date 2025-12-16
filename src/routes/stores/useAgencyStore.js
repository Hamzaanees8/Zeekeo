import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAgencyStore = create(
  persist(
    (set) => ({
      agencyEmail: null,
      setAgencyEmail: (email) => set({ agencyEmail: email }),
      clearAgencyEmail: () => set({ agencyEmail: null }),
    }),
    {
      name: 'agency-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAgencyStore;
