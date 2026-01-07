import { api } from "./api";

export const getConversations = async ({ next = null, campaignIds = null } = {}) => {
  const params = {};
  if (next) params.next = next;
  if (campaignIds && campaignIds.length > 0) {
    params.campaign_ids = campaignIds.join(",");
  }

  const response = await api.get("/users/inbox/conversations", { params });
  return response;
};

export const getAgencyUserConversations = async ({
  next = null,
  email,
  campaignIds = null,
} = {}) => {
  const params = {};
  if (next) params.next = next;
  if (email) params.email = email;
  if (campaignIds && campaignIds.length > 0) {
    params.campaign_ids = campaignIds.join(",");
  }

  const response = await api.get("/agency/inbox/conversations", { params });
  return response;
};

export const getProfileInstances = async ({ profileId }) => {
  const params = { profile_id: profileId };
  const response = await api.get("/users/inbox/profile-instances", { params });
  return response.profile_instances;
};

export const getAgencyUserProfileInstances = async ({ profileId, email }) => {
  const params = { profile_id: profileId };
  if (email) params.email = email;
  const response = await api.get("/agency/inbox/profile-instances", { params });
  return response.profile_instances;
};

export const getConversationsCount = async () => {
  const response = await api.get("/users/inbox/conversations/counts");
  return response.counts;
};

export const getMessages = async ({ profileId, next = null }) => {
  try {
    const params = { profileId };
    if (next) params.next = next;

    return await api.get("/users/inbox/messages", { params });
  } catch (error) {
    console.error("Error fetching messages:", error);
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

export const updateConversation = async (profileId, updates) => {
  const response = await api.put("/users/inbox/conversations", {
    profileId,
    updates,
  });
  return response.conversation;
};

export const updateAgencyUserConversation = async (profileId, updates, email) => {
  const response = await api.put("/agency/inbox/conversations", {
    profileId,
    updates,
    email
  });
  return response.conversation;
};

export const sendMessage = async ({ profileId, body, type = "linkedin" }) => {
  try {
    const response = await api.post("/users/inbox/messages", {
      type,
      profileId,
      body,
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

export const sendAgencyUserMessage = async ({ profileId, body, type = "linkedin", email }) => {
  try {
    const response = await api.post("/agency/inbox/messages", {
      type,
      profileId,
      body,
      email
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