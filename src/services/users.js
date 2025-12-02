import { useAuthStore } from "../routes/stores/useAuthStore";
import { getUserLabels } from "../utils/user-helpers";
import { api } from "./api";

export const updateUserStore = user => {
  useAuthStore.getState().setUser(user);
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
export const loginAsAgency = async agencyUsername => {
  const response = await api.post("/users/login-as", {
    username: agencyUsername,
  });
  return response;
};
