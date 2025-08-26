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
