import { useAuthStore } from "../routes/stores/useAuthStore";
import { getUserLabels } from "../utils/user-helpers";
import { api } from "./api";

const updateUserStore = user => {
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
