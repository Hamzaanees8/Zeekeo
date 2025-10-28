import { api } from "./api";

export const connectHubSpot = async code => {
  return api.get("/users/integrations/hubspot/connect", {
    params: { code },
  });
}

export const disconnectHubSpot = async () => {
  return api.post("/users/integrations/hubspot/disconnect");
}

export const getHubSpotFields = async () => {
  const response = await api.get("/users/integrations/hubspot/fields");
  return response.fields;
};

export const createHubSpotField = async (payload) => {
  const response = await api.post("/users/integrations/hubspot/fields", payload);
  return response;
};

export const updateHubSpotSettings = async (settings) => {
  const response = await api.post("/users/integrations/hubspot/settings", settings);
  return response;
};

export const getHubSpotContacts = async () => {
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

export const getSalesforceFields = async () => {
  const response = await api.get("/users/integrations/salesforce/fields");
  return response.fields;
};

export const createSalesforceField = async (payload) => {
  const response = await api.post("/users/integrations/salesforce/fields", payload);
  return response;
};

export const updateSalesforceSettings = async (settings) => {
  const response = await api.post("/users/integrations/salesforce/settings", settings);
  return response;
};

export const getSalesforceContacts = async () => {
  const response = await api.get("/users/integrations/salesforce/contacts");
  return response;
};
