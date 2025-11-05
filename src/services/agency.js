import { useAuthStore } from "../routes/stores/useAuthStore";
import { api } from "./api";

export const updateAgencyStore = agency => {
  useAuthStore.getState().setUser(agency);
};
export const loginAsAgencyUser = async email => {
  const response = await api.post("/agency/login-as", { email });
  return response;
};

export const getAgencyUsers = async (params = {}) => {
  const response = await api.get("/agency/users", { params });
  return response;
};

export const updateAgencyUser = async (email, updates) => {
  const response = await api.put("/agency/users", { email, updates });
  return response;
};

export const getAgencyLogs = async (startDate, endDate, agencyUsername) => {
  const response = await api.get("/admin/agencies/logs", {
    params: { startDate, endDate, agencyUsername },
  });
  return response;
};
export const getAgencyLog = async (
  startDate,
  endDate,
  agencyUsername,
  logType = "action",
) => {
  const response = await api.get("/agency/logs", {
    params: { startDate, endDate, agencyUsername, logType },
  });
  return response;
};

export const getSubAgencies = async (params = {}) => {
  const response = await api.get("/agency/sub-agencies", { params });
  return response;
};

export const createSubAgency = async sub_agency => {
  const response = await api.post("/agency/sub-agencies", { sub_agency });
  return response;
};
export const updateSubAgency = async (username, updates) => {
  const response = await api.put("/agency/sub-agencies", {
    username,
    updates,
  });
  return response;
};

export const GetAgencyBlackList = async () => {
  const response = await api.get(`/agency/blacklist`);
  return response || null;
};

export const updateAgencyBlackList = async data => {
  const { removed, added } = data;
  const response = await api.put("/agency/blacklist", {
    added: added,
    removed: removed,
  });
  return response.user;
};

export const updateAgencySettings = async data => {
  const response = await api.put("/agency", data);
  return response.data;
};

export const getAgencySettings = async () => {
  const response = await api.get("/agency");
  return response;
};

export const createAgencyFolder = async data => {
  const response = await api.put("/agency", {
    updates: {
      ...data,
    },
  });

  updateAgencyStore(response.agency);
  return response.agency;
};

export const updateAgencyFolders = async folders => {
  const response = await api.put("/agency", {
    updates: {
      template_folders: folders,
    },
  });

  updateAgencyStore(response.agency);
  return response.agency;
};

export const getInsights = async ({
  userIds = [],
  types,
  fromDate,
  toDate,
  campaignIds,
} = {}) => {
  const params = {
    userIds: userIds.join(","),
    types: Array.isArray(types) ? types.join(",") : types,
    fromDate,
    toDate,
  };
  if (campaignIds && campaignIds.length) {
    params.campaignIds = Array.isArray(campaignIds)
      ? campaignIds.join(",")
      : campaignIds;
  }
  return api.get("/agency/insights", { params });
};

export const getCampaigns = async userEmails => {
  const params = {
    userEmails: userEmails.join(","),
  };

  const response = await api.get("/agency/campaigns", { params });
  return response;
};

export const getUsersWithCampaignsAndStats = async ({
  userIds = [],
  types,
  fromDate,
  toDate,
  campaignIds,
} = {}) => {
  const params = {
    userIds: userIds.join(","),
    types: Array.isArray(types) ? types.join(",") : types,
    fromDate,
    toDate,
  };

  if (campaignIds && campaignIds.length) {
    params.campaignIds = Array.isArray(campaignIds)
      ? campaignIds.join(",")
      : campaignIds;
  }

  return api.get("/agency/insights/campaigns", { params });
};
