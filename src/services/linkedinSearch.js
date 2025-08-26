import { api } from "./api";

export const searchFilterFields = async ({ accountId, type, keywords }) => {
  try {
    const res = await api.get("/users/campaigns/filter-fields", {
      params: {
        accountId,
        type,
        keywords,
      },
    });

    if (!Array.isArray(res?.items)) {
      console.warn("Unexpected API response format:", res);
      return [];
    }

    return res.items.map(item => ({
      label: item.title,
      value: item.id,
    }));
  } catch (err) {
    console.error("Error fetching filter field suggestions:", err);
    return [];
  }
};
