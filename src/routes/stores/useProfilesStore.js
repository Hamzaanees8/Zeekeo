import { create } from "zustand";

const useProfilesStore = create(set => ({
  filters: {
    keyword: "",
    location: "",
    title: "",
    industry: "",
    action: "",
  },
  setFilters: (key, value) =>
    set(state => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  resetFilters: () =>
    set({
      filters: {
        location: "",
        title: "",
        industry: "",
      },
    }),
}));

export default useProfilesStore;
