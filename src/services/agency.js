import { useAuthStore } from "../routes/stores/useAuthStore";
import { agencyApi } from "./agencySpecialApi";
import { api } from "./api";

// S3 bucket URL for agency UI assets
export const AGENCY_ASSETS_BUCKET_URL =
  "https://zl-agency-ui-assets.s3.us-east-1.amazonaws.com";

// Helper to construct full URL from agency username and filename
export const getAssetUrl = (agencyUsername, filename) => {
  if (!agencyUsername || !filename) return null;
  return `${AGENCY_ASSETS_BUCKET_URL}/${agencyUsername}/${filename}`;
};

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

export const createAgencyUser = async user => {
  const response = await api.post("/agency/users", { user });
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
  logType = "agency",
) => {
  const response = await api.get("/agency/logs", {
    params: { startDate, endDate, agencyUsername },
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

export const getAssetUploadUrl = async (filename, contentType) => {
  const response = await api.get("/agency/assets", {
    params: { filename, content_type: contentType },
  });
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

export const getAgencyuserCampaigns = async userEmails => {
  const params = {
    userEmails: userEmails.join(","),
  };

  const response = await api.get("/agency/campaigns", { params });
  return response;
};
export const getTemplates = async () => {
  const response = await api.get("/agency/templates");
  return response.templates;
};

export const createTemplate = async data => {
  const response = await api.post("/agency/templates", {
    template: {
      ...data,
    },
  });
  return response.template;
};

export const updateTemplate = async (templateId, data) => {
  const response = await api.put(`/agency/templates`, {
    templateId: templateId,
    updates: {
      name: data.name,
      subject: data.subject,
      body: data.body,
      folder: data.folder,
      attachments: data.attachments,
    },
  });
  return response.template;
};

export const updateTemplates = async (templateIds, updates) => {
  try {
    await Promise.all(
      templateIds.map(templateId =>
        api.put("/agency/templates", {
          templateId,
          updates,
        }),
      ),
    );
  } catch (error) {
    console.error("Failed to update templates:", error);
    throw error;
  }
};

export const deleteTemplate = async templateId => {
  const response = await api.delete("/agency/templates", {
    data: {
      templateId,
    },
  });

  return response;
};

export const deleteTemplates = async templateIds => {
  try {
    await Promise.all(
      templateIds.map(templateId =>
        api.delete("/agency/templates", {
          data: {
            templateId,
          },
        }),
      ),
    );
  } catch (error) {
    console.error("Failed to delete templates:", error);
  }
};

export const getAttachmentLinks = async (templateId, files) => {
  const response = await api.post(`/agency/templates/attachments`, {
    templateId,
    files: files.map(f => f.name),
  });
  return response.signedUrls;
};

export const uploadFileToSignedUrl = async (file, signedUrl) => {
  const res = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload ${file.name}, status: ${res.status}`);
  }

  return res;
};

export const createWorkflow = async data => {
  const response = await api.post("/agency/workflows", {
    workflow: {
      name: data.name,
      workflow: data.workflow,
    },
  });

  return response.workflow;
};

export const fetchGlobalWorkflows = async () => {
  const response = await api.get("/agency/workflows/global");
  return response.workflows;
};

export const fetchWorkflows = async () => {
  const response = await api.get("/agency/workflows");
  return response.workflows;
};

export const updateWorkflow = async (data, workflowId) => {
  const response = await api.put("/agency/workflows", {
    workflowId,
    updates: {
      name: data.name,
      workflow: data.workflow,
    },
  });

  return response.workflow;
};

export const deleteWorkflow = async workflowId => {
  const response = await api.delete("/agency/workflows", {
    data: {
      workflowId,
    },
  });

  return response;
};

export const getAgencyUserConversations = async ({
  next = null,
  email,
} = {}) => {
  const params = {};
  if (next) params.next = next;
  if (email) params.email = email;

  const response = await api.get("/agency/inbox/conversations", { params });
  return response;
};

export const getConversationsCount = async email => {
  try {
    const response = await api.get("/agency/inbox/conversations/counts", {
      params: { email },
    });
    return response.counts;
  } catch (error) {
    console.error("Failed to fetch conversation counts:", error);
    throw error;
  }
};

export const getAgencyUserMessages = async ({ profileId, email }) => {
  try {
    const params = { profileId };
    if (email) params.email = email;

    return await api.get("/agency/inbox/messages", { params });
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const updateAgencyUserConversation = async (
  profileId,
  updates,
  email,
) => {
  const response = await api.put("/agency/inbox/conversations", {
    profileId,
    updates,
    email,
  });
  return response.conversation;
};

export const sendAgencyUserMessage = async ({
  profileId,
  body,
  type = "linkedin",
  email,
}) => {
  try {
    const response = await api.post("/agency/inbox/messages", {
      type,
      profileId,
      body,
      email,
    });

    const { success, messageId, chatId, providerId } = response;

    if (!success) throw new Error("Message send failed");

    // Normalize into a message-like object
    return {
      id: messageId,
      chatId,
      providerId,
      profileId,
      body,
      type,
      direction: "outgoing",
      timestamp: new Date().toISOString(),
      status: "sent",
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get all blacklists for an agency
export const getAgencyBlacklists = async () => {
  const response = await api.get("/agency/blacklists");
  return response.blacklists;
};

// Get specific blacklist
export const getAgencyBlacklist = async blacklistName => {
  const response = await api.get("/agency/blacklists/blacklist", {
    params: { blacklistName },
  });
  return response.blacklist;
};

// Create new blacklist
export const createAgencyBlacklist = async (
  blacklistName,
  initialEntries = [],
  usersEmail,
) => {
  const response = await api.post("/agency/blacklists", {
    blacklistName,
    initialEntries,
    usersEmail,
  });
  return response.message;
};

// Update blacklist entries
export const updateAgencyBlacklist = async (
  blacklistName,
  updates,
  usersEmail = [],
) => {
  const response = await api.put("/agency/blacklists/blacklist", {
    blacklistName,
    ...updates,
    usersEmail,
  });
  return response.message;
};

// Delete one or more agency users. `email` can be a single email string or
// a comma-separated list of emails.
export const deleteAgencyUser = async email => {
  const response = await api.delete("/agency/users", {
    params: { email },
  });
  return response.message;
};

// Delete blacklist
export const deleteAgencyBlacklist = async blacklistName => {
  const response = await api.delete("/agency/blacklists/blacklist", {
    data: { blacklistName },
  });
  return response.message;
};

// Add profile to blacklist
export const addProfileToAgencyBlacklist = async (
  blacklistName,
  profileId,
) => {
  const response = await api.post(
    `/agency/blacklists/profiles/${blacklistName}`,
    {
      profileId,
    },
  );
  return response.result;
};

// Remove profile from blacklist
export const removeProfileFromAgencyBlacklist = async (
  blacklistName,
  profileId,
) => {
  const response = await api.delete(
    `/agency/blacklists/profiles/${blacklistName}`,
    {
      profileId,
    },
  );
  return response.result;
};

export const loginAsSubAgency = async subAgencyUsername => {
  const response = await api.post("/agency/sub-agency-login-as", {
    subAgencyUsername,
  });
  return response;
};

// Groups API
export const getGroups = async (groupId = null) => {
  const params = groupId ? { group_id: groupId } : {};
  const response = await api.get("/agency/groups", { params });
  return response;
};

export const createGroup = async name => {
  const response = await api.post("/agency/groups", { name });
  return response.group;
};

export const updateGroup = async (groupId, name) => {
  const response = await api.put("/agency/groups", {
    group_id: groupId,
    name,
  });
  return response.group;
};

export const deleteGroup = async groupId => {
  const response = await api.delete("/agency/groups", {
    data: { group_id: groupId },
  });
  return response;
};

export const addGroupMember = async (groupId, userEmail) => {
  const response = await api.post("/agency/groups/members", {
    group_id: groupId,
    user_email: userEmail,
  });
  return response.group;
};

export const removeGroupMember = async (groupId, userEmail) => {
  const response = await api.delete("/agency/groups/members", {
    data: {
      group_id: groupId,
      user_email: userEmail,
    },
  });
  return response.group;
};

export const getAgencyUsersFromAgency = async (params = {}) => {
  const response = await agencyApi.get("/agency/users", { params });
  return response;
};
export const loginAsAgencyUserFromAgency = async email => {
  const response = await agencyApi.post("/agency/login-as", { email });
  return response;
};

// Fetch the user's agency (for users who belong to an agency)
export const getUserAgency = async () => {
  const response = await api.get("/users/agency");
  return response;
};
