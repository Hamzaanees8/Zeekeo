import { create } from "zustand";
import { getUserLabels } from "../../utils/user-helpers";

const defaultFilters = {
  keyword: "",
  read: null,
  label: null,
  sentiment: null, // "positive" | "neutral" | "negative" | "meeting_booked" | "deal_closed"
  archived: false, // true | false | null
  campaigns: [],
};

const useInboxStore = create((set, get) => ({
  conversations: [],
  filteredConversations: [],
  selectedConversation: null,
  loading: false,
  filters: {
    ...defaultFilters,
  },

  // --- Actions ---
  setConversations: conversations => set({ conversations }),
  setFilteredConversations: filteredConversations =>
    set({ filteredConversations }),

  // Set filters
  setFilters: (keyOrObj, value) =>
    set(state => {
      if (typeof keyOrObj === "string") {
        // single key
        return { filters: { ...state.filters, [keyOrObj]: value } };
      }
      // object of filters
      return { filters: { ...state.filters, ...keyOrObj } };
    }),

  resetFilters: () =>
    set(() => ({
      filters: { ...defaultFilters },
    })),

  addConversation: conversation =>
    set(state => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversationInStore: (id, updatedData) =>
    set(state => ({
      conversations: state.conversations.map(conv =>
        conv.profile_id === id ? { ...conv, ...updatedData } : conv,
      ),
    })),

  setSelectedConversation: conversation =>
    set({ selectedConversation: conversation }),

  markAsRead: id =>
    set(state => ({
      conversations: state.conversations.map(conv =>
        conv.profile_id === id ? { ...conv, unread: false } : conv,
      ),
    })),

  setLoading: loading => set({ loading }),

  // --- Labels ---
  predefinedLabels: [
    // you can initialize with predefined labels
    { name: "Interested", type: "system" },
    { name: "Not Interested", type: "system" },
    { name: "Follow Up Later", type: "system" },
  ],

  customLabels: [],

  setCustomLabels: labels =>
    set({
      customLabels: labels.map(label => ({
        name: label,
        type: "custom",
      })),
    }),

  conversationCounts: null,
  setConversationCounts: counts => set({ conversationCounts: counts }),

  addCustomLabel: labelName =>
    set(state => ({
      customLabels: [
        ...state.customLabels,
        {
          name: labelName,
          type: "custom",
        },
      ],
    })),

  setLabels: labels => set({ labels }),

  removecustomLabel: label =>
    set(state => ({
      labels: state.customLabels.filter(l => l.name !== label),
    })),
}));

export default useInboxStore;
