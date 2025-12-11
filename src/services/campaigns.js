import { api } from "./api";

export const createCampaign = async campaignData => {
  //  console.log('creating campaign with data...', campaignData);
  // return;
  const response = await api.post("/users/campaigns", campaignData);
  return response.campaign;
};

export const getCampaigns = async ({ limit, next, all, includeArchived, archivedOnly } = {}) => {
  const params = {};
  if (limit) params.limit = limit;
  if (next) params.next = next;
  if (all) params.all = true;
  if (includeArchived) params.includeArchived = true;
  if (archivedOnly) params.archivedOnly = true;

  const response = await api.get("/users/campaigns", { params });
  return { campaigns: response.campaigns, next: response.next };
};

export const getCampaign = async campaignId => {
  const response = await api.get(`/users/campaigns`, {
    params: { campaignId },
  });
  return response.campaigns?.[0] || null;
};

export const getCampaignStats = async ({
  campaignId,
  startDate = null,
  endDate = null,
}) => {
  try {
    const response = await api.get("/users/campaigns/stats", {
      params: {
        campaignId,
        includeHourlyBreakdown: true,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching campaign stats:", error);
    return null;
  }
};

export const getCampaignProfiles = async campaignId => {
  try {
    const response = await api.get(
      `/users/campaigns/profiles?campaignId=${campaignId}&all=true`,
    );
    return response.profiles;
  } catch (error) {
    console.error("Error fetching campaign profiles:", error);
    return null;
  }
};

export const streamCampaignProfiles = async (
  campaignId,
  nextCursor = null,
) => {
  try {
    let endpoint = `/users/campaigns/profiles?campaignId=${campaignId}&all=false`;
    if (nextCursor) {
      endpoint += `&next=${encodeURIComponent(nextCursor)}`;
    }
    const response = await api.get(endpoint);

    const { profiles, next } = response;

    return { profiles: profiles || [], next: next || null };
  } catch (error) {
    console.error("Error fetching campaign profiles:", error);
    return { profiles: [], next: null };
  }
};
export const getCampaignProfile = async campaignId => {
  try {
    const endpoint = `/users/campaigns/profiles?campaignId=${campaignId}&all=false`;
    const response = await api.get(endpoint);
    return response.profiles || [];
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
};

export const deleteCampaignProfile = async (campaignId, profileId) => {
  const response = await api.delete(`/users/campaigns/profiles`, {
    data: { campaignId, profileId },
  });
  return response;
};

export const updateCampaignProfile = async (
  campaignId,
  profileId,
  updates,
) => {
  const response = await api.put(`/users/campaigns/profiles`, {
    campaignId,
    profileId,
    updates,
  });
  return response.profile;
};

export const updateCampaign = async (campaignId, updates) => {
  const response = await api.put("/users/campaigns", {
    campaignId,
    updates,
  });

  return response.campaign;
};

export const deleteCampaign = async campaignId => {
  const response = await api.delete("/users/campaigns", {
    data: {
      campaignId,
    },
  });

  return response;
};

export const updateProfile = async (profileId, updates) => {
  const response = await api.put(`/users/profiles`, {
    profileId,
    updates,
  });
  return response.profile;
};

export const getCampaignsStats = async ({ dateFrom, dateTo }) => {
  const response = await api.get("/users/insights", {
    params: {
      types: "actions",
      fromDate: dateFrom,
      toDate: dateTo,
    },
  });
  return response;
};

export const getLinkedinProfiles = async ({
  accountId,
  filterApi,
  filters = {},
  limit = 25,
}) => {
  const filter_fields = JSON.stringify(filters);

  console.log("filters", filters);

  const response = await api.get("/users/campaigns/filter-fields/preview", {
    params: {
      account_id: accountId,
      api: filterApi,
      filter_fields,
      limit,
    },
  });

  return response;
};
