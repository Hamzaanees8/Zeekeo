import { api } from "./api";

export const getInboxResponse = async ({ profileId, messages }) => {
  try {
    const response = await api.post("/users/ai/inbox-response", {
      messages,
      profileId,
    });
    return response.response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
