import { getCurrentUser } from "../utils/user-helpers";
import { api } from "./api";

export const connectHubSpot = async (code) => {
  return api.get("/users/integrations/hubspot/connect", {
    params: { code },
  });
};

export const disconnectHubSpot = async () => {
  return api.post("/users/integrations/hubspot/disconnect");
};

export const getHubSpotFields = async () => {
  const response = await api.get("/users/integrations/hubspot/fields");
  return response.fields;
};

export const createHubSpotField = async (payload) => {
  const response = await api.post(
    "/users/integrations/hubspot/fields",
    payload,
  );
  return response;
};

export const updateHubSpotSettings = async (settings) => {
  const response = await api.post(
    "/users/integrations/hubspot/settings",
    settings,
  );
  return response;
};

export const getHubSpotContacts = async (params) => {
  const response = await api.get("/users/integrations/hubspot/contacts", {
    params,
  });
  return response;
};

export const connectSalesforce = async (code) => {
  return api.get("/users/integrations/salesforce/connect", {
    params: { code },
  });
};

export const disconnectSalesforce = async () => {
  return api.post("/users/integrations/salesforce/disconnect");
};

export const getSalesforceFields = async () => {
  const response = await api.get("/users/integrations/salesforce/fields");
  return response.fields;
};

export const createSalesforceField = async (payload) => {
  const response = await api.post(
    "/users/integrations/salesforce/fields",
    payload,
  );
  return response;
};

export const updateSalesforceSettings = async (settings) => {
  const response = await api.post(
    "/users/integrations/salesforce/settings",
    settings,
  );
  return response;
};

export const getSalesforceContacts = async (params) => {
  const response = await api.get("/users/integrations/salesforce/contacts", {
    params,
  });
  return response;
};

export const getWebhooks = async () => {
  const user = getCurrentUser();
  if (!user || typeof user !== "object") {
    return {};
  }
  return user?.webhooks || {};
};

export const saveWebhooks = async (webhooks) => {
  const response = await api.put("/users", {
    updates: {
      webhooks,
    },
  });
  updateUserStore(response.user);
  return response.user;
};

export const testWebhook = async (eventId, url) => {
  const response = await api.post("/users/integrations/webhooks/send-test", {
    event_type: eventId,
    url,
  });
  return response;
};
