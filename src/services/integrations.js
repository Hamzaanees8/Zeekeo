import { api } from "./api";

export const connectHubSpot = async code => {
  return api.get("/users/integrations/hubspot/connect", {
    params: { code },
  });
}

export const disconnectHubSpot = async () => {
  return api.post("/users/integrations/hubspot/disconnect");
}

export const getHubspotFields = async () => {
  const response = await api.get("/users/integrations/hubspot/fields");
  return response.fields;
};

export const createHubspotField = async (payload) => {
  const response = await api.post("/users/integrations/hubspot/fields", payload);
  return response;
};

export const updateHubspotSettings = async (settings) => {
  const response = await api.post("/users/integrations/hubspot/settings", settings);
  return response;
};

export const getHubspotContacts = async () => {
  const response = await api.get("/users/integrations/hubspot/contacts");
  return response;
};


export const connectSalesforce = async code => {
  return api.get("/users/integrations/salesforce/connect", {
    params: { code },
  });
}

export const disconnectSalesforce = async () => {
  return api.post("/users/integrations/salesforce/disconnect");
}