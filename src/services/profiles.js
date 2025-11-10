import { api } from "./api";

export const getProfiles = async (profileId = null) => {
  const response = await api.get(
    profileId ? `/users/profiles?profileId=${profileId}` : `/users/profiles`
  );
  return profileId ? response.profiles[0] : response.profiles;
};

export const updateProfile = async (profileId, updates) => {
  const response = await api.put("/users/profiles", {
    profileId,
    updates,
  });
  return response.profile;
};

export const blacklistProfile = async (profileId) => {
  const response = await api.post("/users/blacklist/profile", {
    profileId,
  });
  return response;
};

export const unblacklistProfile = async (profileId) => {
  const response = await api.delete("/users/blacklist/profile", {
    data: { profileId },
  });
  return response;
};
