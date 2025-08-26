import { getUserLabels } from "../utils/user-helpers";
import { api } from "./api";

export const createFolder = async data => {
  const response = await api.put("/users", {
    updates: {
      ...data,
    },
  });
  localStorage.setItem("userInfo", JSON.stringify(response.user));
  return response.user;
};

export const updateFolders = async folders => {
  const response = await api.put("/users", {
    updates: {
      template_folders: folders,
    },
  });
  localStorage.setItem("userInfo", JSON.stringify(response.user));
  return response.user;
};

export const createLabel = async (label) => {
  const existingLabels = getUserLabels()
  const response = await api.put("/users", {
    updates: {
      labels: [...new Set([...existingLabels, label])],
    },
  });
  localStorage.setItem("userInfo", JSON.stringify(response.user));
  return response.user;
};
