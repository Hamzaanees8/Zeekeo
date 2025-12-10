import { useAuthStore } from "../routes/stores/useAuthStore";
import { getUserLabels } from "../utils/user-helpers";
import { api } from "./api";

export const updateUserStore = user => {
  useAuthStore.getState().setUser(user);
};

export const updateUser = async updates => {
  const response = await api.put("/users", {
    updates,
  });
  updateUserStore(response.user);
  return response.user;
};

export const createFolder = async data => {
  const response = await api.put("/users", {
    updates: {
      ...data,
    },
  });
  updateUserStore(response.user);
  return response.user;
};

export const updateFolders = async folders => {
  const response = await api.put("/users", {
    updates: {
      template_folders: folders,
    },
  });
  updateUserStore(response.user);
  return response.user;
};

export const createLabel = async label => {
  const existingLabels = getUserLabels();
  const response = await api.put("/users", {
    updates: {
      labels: [...new Set([...existingLabels, label])],
    },
  });
  updateUserStore(response.user);
  return response.user;
};

export const deleteAllLabels = async () => {
  const response = await api.put("/users", {
    updates: {
      labels: [],
    },
  });
  updateUserStore(response.user);
  return response.user;
};

export const deleteLabel = async label => {
  const existingLabels = getUserLabels();
  const updated = existingLabels.filter(
    l => String(l).trim() !== String(label).trim(),
  );
  const response = await api.put("/users", {
    updates: {
      labels: updated,
    },
  });
  updateUserStore(response.user);
  return response.user;
};
export const loginAsAgency = async username => {
  const response = await api.post("/users/login-as", {
    username,
  });
  return response;
};

export const getAgencyUsers = async (all = false, next = null) => {
  const queryParams = new URLSearchParams();
  if (all) queryParams.append("all", "true");
  if (next) queryParams.append("next", JSON.stringify(next));

  const queryString = queryParams.toString();
  const url = `/users/agency-users${queryString ? `?${queryString}` : ""}`;

  // Use original admin session if we are currently impersonating
  // const { originalSessionToken } = useAuthStore.getState();
  // const config = {};
  // if (originalSessionToken) {
  //   config.headers = { "z-api-key": originalSessionToken };
  // }

  const response = await api.get(url);
  return response;
};

export const loginAsUser = async username => {
  const response = await api.post("/users/login-as-user", {
    username,
  });
  return response;
};
