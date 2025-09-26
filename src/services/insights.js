import { api } from "./api";

export const getInsights = async ({ types, fromDate, toDate, campaignIds } = {}) => {
  const params = {
    types: Array.isArray(types) ? types.join(",") : types,
    fromDate,
    toDate,
  };
  if (campaignIds && campaignIds.length) {
    params.campaignIds = Array.isArray(campaignIds)
      ? campaignIds.join(",")
      : campaignIds;
  }
  return api.get("/users/insights", { params });
};
