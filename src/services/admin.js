import { agencyApi } from "./agencySpecialApi";
import { api } from "./api";

export const loginAsUser = async (username, type) => {
  const response = await api.post("/admin/login-as", { username, type });
  return response;
};

export const getAdminAgencies = async ({ next = null } = {}) => {
  const params = {};
  if (next) params.next = next;

  const response = await api.get("/admin/agencies", { params });
  return response;
};
export const getAdminUsers = async ({ next = null } = {}) => {
  const params = {};
  if (next) params.next = next;

  const response = await api.get("/admin/users", { params });
  return response;
};
export const getUser = async email => {
  try {
    const response = await api.get(`/admin/users?email=${email}`);
    return response.user;
  } catch (error) {
    console.error("Failed to fetch agency:", error?.response?.data || error);
    throw error;
  }
};
export const getGlobalStats = async () => {
  try {
    const response = await api.get("/admin/stats");
    return response;
  } catch (error) {
    console.error(
      "Failed to fetch global stats:",
      error?.response?.data || error,
    );
    throw error;
  }
};
export const getGlobalStatsByAction = async (action, startDate, endDate) => {
  try {
    const params = { action, startDate, endDate };
    const response = await api.get("/admin/stats", { params });
    return response;
  } catch (error) {
    console.error(
      "Failed to fetch global stats by action:",
      error?.response?.data || error,
    );
    throw error;
  }
};
export const getGlobalStatsByDateRange = async (startDate, endDate) => {
  try {
    const params = { startDate, endDate };
    const response = await api.get("/admin/stats", { params });
    return response;
  } catch (error) {
    console.error(
      "Failed to fetch global stats for date range:",
      error?.response?.data || error,
    );
    throw error;
  }
};
export const createUser = async user => {
  try {
    const payload = { user };
    const response = await api.post("/admin/users", payload);
    return response.user;
  } catch (error) {
    console.error("Failed to create user:", error?.response?.data || error);
    throw error;
  }
};
export const updateUser = async (email, updates) => {
  try {
    const payload = { email, updates };
    const response = await api.put("/admin/users", payload);
    return response.user;
  } catch (error) {
    console.error("Failed to update user:", error?.response?.data || error);
    throw error;
  }
};
export const getUserStats = async userEmail => {
  try {
    const params = { userEmail };
    const response = await api.get("/admin/users/stats", { params });
    return response;
  } catch (error) {
    console.error(
      "Failed to fetch user stats:",
      error?.response?.data || error,
    );
    throw error;
  }
};
export const getUserStatsByAction = async (
  userEmail,
  action,
  startDate,
  endDate,
) => {
  try {
    const params = { userEmail, action, startDate, endDate };
    const response = await api.get("/admin/users/stats", { params });
    return response;
  } catch (error) {
    console.error(
      "Failed to fetch user stats by action:",
      error?.response?.data || error,
    );
    throw error;
  }
};
export const getUserCampaignStats = async (userEmail, campaignId, action) => {
  try {
    const params = { userEmail, campaignId, action };
    const response = await api.get("/admin/users/stats", { params });
    return response;
  } catch (error) {
    console.error(
      "Failed to fetch user campaign stats:",
      error?.response?.data || error,
    );
    throw error;
  }
};
export const getUserLogs = async ({
  userEmail,
  startDate,
  endDate,
  next = null,
}) => {
  try {
    const params = { userEmail, startDate, endDate };
    if (next) params.next = next;

    const response = await api.get("/admin/users/logs", { params });
    return response;
  } catch (error) {
    console.error(
      "Failed to fetch user logs:",
      error?.response?.data || error,
    );
    throw error;
  }
};
export const createAgency = async agency => {
  try {
    const payload = { agency };
    const response = await api.post("/admin/agencies", payload);
    return response.agency;
  } catch (error) {
    console.error("Failed to create agency:", error?.response?.data || error);
    throw error;
  }
};
export const updateAgency = async (username, updates) => {
  try {
    const payload = { username, updates };
    const response = await api.put("/admin/agencies", payload);
    return response.agency;
  } catch (error) {
    console.error("Failed to update agency:", error?.response?.data || error);
    throw error;
  }
};
export const getAgency = async username => {
  try {
    const response = await api.get(`/admin/agencies?username=${username}`);
    return response.agency;
  } catch (error) {
    console.error("Failed to fetch agency:", error?.response?.data || error);
    throw error;
  }
};
export const getAgencyLogs = async ({
  agencyUsername,
  startDate,
  endDate,
  next = null,
}) => {
  const params = { agencyUsername, startDate, endDate };
  if (next) params.next = next;

  const response = await api.get("/admin/agencies/logs", { params });
  return response;
};

export const getUserWorkerLogs = async userEmail => {
  try {
    const response = await api.get("/admin/users/worker-logs", {
      params: userEmail,
    });

    return response?.logFiles || [];
  } catch (error) {
    console.error(
      "Failed to fetch worker logs:",
      error?.response?.data || error,
    );
    throw error;
  }
};

export const getUserWorkerLogFile = async ({ userEmail, logFileKey }) => {
  try {
    const response = await api.get("/admin/users/worker-logs", {
      params: { userEmail: userEmail, logFile: logFileKey },
    });

    return response;
  } catch (error) {
    console.error(
      "Failed to fetch worker logs:",
      error?.response?.data || error,
    );
    throw error;
  }
};

export const getAgencyUsers = async ({ agencyEmail, next = null } = {}) => {
  const params = {};
  if (agencyEmail) params.agencyEmail = agencyEmail;
  if (next) params.next = next;

  const response = await api.get("/admin/agencies/users", { params });
  return response;
};
export const getAgencyUsersFromAdmin = async (
  agencyEmail,
  { next = null, all = false } = {},
) => {
  const params = {};
  if (agencyEmail) params.agencyEmail = agencyEmail;
  if (next) params.next = next;
  if (all) params.all = "true";

  const response = await agencyApi.get("/admin/agencies/users", { params });
  return response;
};
export const loginAsUserFromAdmin = async (username, type) => {
  const response = await agencyApi.post("/admin/login-as", { username, type });
  return response;
};
