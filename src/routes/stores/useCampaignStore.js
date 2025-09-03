import { create } from "zustand";

const useCampaignStore = create(set => ({
  campaignName: "",
  campaignType: "",
  searchUrl: "",
  profileUrls: [],
  filterApi: "",
  filterOptions: {},
  filterFields: {},
  settings: {
    include_first_degree_connections_only: false,
    exclude_first_degree_connections: true,
    exclude_past_campaigns_targets: true,
    exclude_replied_profiles: false,
    split_premium: false,
    import_premium_only: false,
  },
  csvData: null,
  workflow: {},

  setCampaignName: name => set({ campaignName: name }),
  setCampaignType: type => set({ campaignType: type }),
  setSearchUrl: url => set({ searchUrl: url }),
  setProfileUrls: urls => set({ profileUrls: urls }),
  setFilterApi: api => set({ filterApi: api }),
  setFilterFields: fields =>
    set(state => {
      const updated = { ...state.filterFields };

      Object.entries(fields).forEach(([key, value]) => {
        if (value === undefined) {
          // remove undefined fields
          delete updated[key];
        } else if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          // clean object values by removing empty strings, null, undefined
          const cleaned = Object.fromEntries(
            Object.entries(value).filter(
              ([, v]) => v !== "" && v !== null && v !== undefined,
            ),
          );

          // only set if not empty object, else remove
          if (Object.keys(cleaned).length > 0) {
            updated[key] = cleaned;
          } else {
            delete updated[key];
          }
        } else {
          // for primitives/arrays, just assign
          updated[key] = value;
        }
      });

      return { filterFields: updated };
    }),

  setFilterOptions: options =>
    set(state => ({
      filterOptions: { ...state.filterOptions, ...options },
    })),
  updateFilterOptions: (key, options) =>
    set(state => ({
      filterOptions: { ...state.filterOptions, [key]: options },
    })),

  setSettings: settings => set({ settings }),
  setCsvData: data => set({ csvData: data }),
  setWorkflow: workflow => set({ workflow }),

  // Clear/reset
  resetCampaign: () =>
    set({
      campaignName: "",
      campaignType: "",
      searchUrl: "",
      profileUrls: [],
      filterApi: "",
      filterFields: {},
      filterOptions: {},
      settings: {
        include_first_degree_connections_only: false,
        exclude_first_degree_connections: true,
        exclude_past_campaigns_targets: true,
        exclude_replied_profiles: false,
        split_premium: false,
        import_premium_only: false,
      },
      csvData: null,
      workflow: {},
    }),
}));

export default useCampaignStore;
