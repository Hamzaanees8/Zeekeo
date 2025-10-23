import { api } from "./api";

export const connectHubSpot = async code => {
  return api.get("/users/integrations/hubspot/connect", {
    params: { code },
  });
}

export const disconnectHubSpot = async () => {
  return api.post("/users/integrations/hubspot/disconnect");
}