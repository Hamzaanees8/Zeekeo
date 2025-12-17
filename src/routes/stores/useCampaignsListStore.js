import { create } from "zustand";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

const useCampaignsListStore = create((set, get) => ({
  campaigns: [],
  lastFetched: null,
  isLoading: false,
  error: null,
  currentUserId: null, // Track which user this data belongs to

  // Check if cache is valid (not expired AND belongs to current user)
  isCacheValid: (userId) => {
    const { lastFetched, currentUserId } = get();
    if (!lastFetched || !currentUserId) return false;
    
    // Invalidate cache if user changed
    if (userId && userId !== currentUserId) {
      return false;
    }
    
    return Date.now() - lastFetched < CACHE_DURATION;
  },

  // Set campaigns data (supports both direct value and function pattern)
  // Only update lastFetched when setting a new array (initial fetch), not when updating via function (stats updates)
  setCampaigns: (campaignsOrFn, userId = null) =>
    set(state => {
      const isFunction = typeof campaignsOrFn === "function";
      const newCampaigns = isFunction
        ? campaignsOrFn(state.campaigns)
        : campaignsOrFn;
      return {
        campaigns: newCampaigns,
        // Only reset lastFetched on initial array set, not on functional updates (stats)
        lastFetched: isFunction ? state.lastFetched : Date.now(),
        currentUserId: userId !== null ? userId : state.currentUserId,
        isLoading: false,
        error: null,
      };
    }),

  // Set loading state
  setLoading: isLoading => set({ isLoading }),

  // Set error state
  setError: error => set({ error, isLoading: false }),

  // Update a single campaign in the list
  updateCampaign: (campaignId, updates) =>
    set(state => ({
      campaigns: state.campaigns.map(c =>
        c.campaign_id === campaignId ? { ...c, ...updates } : c,
      ),
    })),

  // Add a new campaign to the list
  addCampaign: campaign =>
    set(state => ({
      campaigns: [campaign, ...state.campaigns],
    })),

  // Remove a campaign from the list
  removeCampaign: campaignId =>
    set(state => ({
      campaigns: state.campaigns.filter(c => c.campaign_id !== campaignId),
    })),

  // Force invalidate cache (e.g., after creating/deleting a campaign)
  invalidateCache: () => set({ lastFetched: null }),

  // Clear all data
  reset: () =>
    set({
      campaigns: [],
      lastFetched: null,
      currentUserId: null,
      isLoading: false,
      error: null,
    }),
}));

export default useCampaignsListStore;
