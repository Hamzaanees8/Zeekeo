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
    set(state => ({
      filterFields: { ...state.filterFields, ...fields },
    })),

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
