import { create } from "zustand";

const defaultExistingCampaignFilters = {
  first_degree_connections_only: false,
  exclude_first_degree_connections: false,
  first_degree_no_message: false,
  invited_profiles_not_accepted: false,
  exclude_invited_profiles: false,
  inmailed_profiles: false,
  exclude_inmailed_profiles: false,
  skipped_profiles_only: false,
  exclude_skipped_profiles: false,
  open_profiles_only: false,
  non_open_profiles_only: false,
};

const useCampaignStore = create(set => ({
  campaignName: "",
  campaignType: "",
  searchUrl: "",
  profileUrls: [],
  customFields: [],
  filterApi: "",
  filterOptions: {},
  filterFields: {},
  settings: {
    include_first_degree_connections_only: false,
    exclude_first_degree_connections: true,
    exclude_past_campaigns_targets: true,
    exclude_replied_profiles: false,
    split_open: false,
    import_open_only: false,
  },
  existingCampaignOptions: { ...defaultExistingCampaignFilters },
  existingCampaign: null,
  csvData: null,
  workflow: {},

  setCampaignName: name => set({ campaignName: name }),
  setCampaignType: type =>
    set(state => ({
      campaignType: type,
      filterFields: {}, // reset filter fields
      filterOptions: {}, // optional: reset filter options if needed
    })),
  setSearchUrl: url => set({ searchUrl: url }),
  setProfileUrls: urls => set({ profileUrls: urls }),
  setCustomFields: fields => set({ customFields: fields }),
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

  setExistingCampaign: campaign => set({ existingCampaign: campaign }),
  setExistingCampaignOptions: options =>
    set(state => ({
      existingCampaignOptions: {
        ...state.existingCampaignOptions,
        ...options,
      },
    })),
  resetExistingCampaign: () =>
    set({
      existingCampaign: null,
      existingCampaignOptions: { ...defaultExistingCampaignFilters },
    }),

  // Clear/reset
  resetCampaign: () =>
    set({
      campaignName: "",
      campaignType: "",
      searchUrl: "",
      profileUrls: [],
      customFields: [],
      filterApi: "",
      filterFields: {},
      filterOptions: {},
      settings: {
        include_first_degree_connections_only: false,
        exclude_first_degree_connections: true,
        exclude_past_campaigns_targets: true,
        exclude_replied_profiles: false,
        split_open: false,
        import_open_only: false,
      },
      csvData: null,
      workflow: {},
      existingCampaign: null,
      existingCampaignOptions: { ...defaultExistingCampaignFilters },
    }),
}));

export default useCampaignStore;
