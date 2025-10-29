import { api } from "./api";

export const GetUser = async () => {
  const response = await api.get(`/users`);
  return response.user || null;
};

export const GetBlackList = async () => {
  const response = await api.get(`/users/blacklist`);
  return response || null;
};

export const updateBlackList = async data => {
  const { removed, added } = data;
  const response = await api.put("/users/blacklist", {
    added: added,
    removed: removed,
  });
  return response.user;
};

export const updateUsers = async data => {
  const {
    auto_scale,
    time_zone,
    auto_adjust,
    schedule,
    limits,
    first_name,
    last_name,
    company,
    email,
    phone_number,
    password,
  } = data;

  // Transform limits to schema format
  const transformedLimits = limits
    ? {
        auto_scale: {
          enabled: auto_scale || false,
          limit: 100, // Default limit value
          last_updated_timestamp: Date.now(),
        },
        // Map UI limits to schema format, keeping only the ones that exist in schema
        linkedin_view:
          limits.find(l => l.label === "Profile Views")?.value || 100,
        linkedin_invite: limits.find(l => l.label === "Invites")?.value || 100,
        linkedin_inmail: limits.find(l => l.label === "InMails")?.value || 100,
        linkedin_message:
          limits.find(l => l.label === "Sequence Messages")?.value || 100,
        linkedin_follow: limits.find(l => l.label === "Follows")?.value || 100,
        linkedin_like_post:
          limits.find(l => l.label === "Post Likes")?.value || 100,
        linkedin_endorse:
          limits.find(l => l.label === "Endorsements")?.value || 100,
        email_message:
          limits.find(l => l.label === "Email Sequence Messages")?.value ||
          100,
        withdraw_unaccepted_sent_invitations:
          limits.find(l => l.label === "Withdraw Unaccepted Sent Invitations")
            ?.value || 50,
      }
    : undefined;

  const response = await api.put("/users", {
    updates: {
      // timezone: time_zone,
      first_name,
      last_name,
      // phone_number,
      // company,
      password,
      settings: {
        schedule: schedule, // Use schedule directly in schema format (includes dst)
        limits: transformedLimits,
      },
    },
  });
  return response.user;
};

export const createIntegration = async data => {
  const response = await api.post("/users/accounts/connect", { ...data });
  return response;
};

export const DeleteAccount = async accountId => {
 const response = await api.delete("/users/accounts/connect", {
  data: { id: accountId },
 });
 return response;
};
