import { useAuthStore } from "../routes/stores/useAuthStore";

export const getCurrentUser = () => {
  return useAuthStore.getState().currentUser || null;
};

export const getUserFolders = () => {
  const user = getCurrentUser();
  if (!user || typeof user !== "object") {
    return [];
  }

  return Array.isArray(user.template_folders) ? user.template_folders : [];
};

export const getUserLabels = () => {
  const user = getCurrentUser();
  if (!user || typeof user !== "object") {
    return [];
  }

  return Array.isArray(user.labels) ? user.labels : [];
};
