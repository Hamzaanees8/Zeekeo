import {
  StepMessages,
  PlusIcon,
  MailIcon,
  SendIcon,
  EndorseIcon,
  ThumbIcon,
  UserIcon,
  EyeIcon,
  UserIcon2,
  LockIcons,
} from "../components/Icons";

export const getProfileLocation = profile => {
  if (
    profile.profile_instances &&
    profile.profile_instances.length > 0
  ) {
    const instance = profile.profile_instances[0];
    if (instance.location) {
      return instance.location;
    }
  }
  return null; // fallback if no location found
};

export const getProfileLinkedInUrl = profile => {
  if (!profile.profile_instances || profile.profile_instances.length === 0)
    return null;

  const instance = profile.profile_instances[0];

  if (instance.classic_profile_url) {
    return instance.classic_profile_url;
  }

  if (instance.public_identifier) {
    return `https://www.linkedin.com/in/${instance.public_identifier}`;
  }

  if (instance.classic_id) {
    return `https://www.linkedin.com/in/${instance.classic_id}`;
  }

  return null;
};

export const buildProfileTimeline = (selectedConversation, campaigns) => {
  if (!selectedConversation?.profile_instances) return [];

  const actions = selectedConversation.profile_instances.flatMap(instance => {
    const campaignName =
      campaigns.find(c => c.campaign_id === instance.campaign_id)?.name ||
      "Unknown Campaign";

    // One-time joined event
    const joinedEvent = {
      id: `${instance.campaign_id}-joined`,
      type: "campaign_join",
      timestamp: instance.created_at,
      campaignId: instance.campaign_id,
      campaignName,
    };

    // All actions from this campaign
    const campaignActions = Object.entries(instance.actions || {}).map(
      ([id, action]) => ({
        id,
        ...action,
        campaignId: instance.campaign_id,
        campaignName,
      }),
    );

    return [joinedEvent, ...campaignActions];
  });

  // Sort everything by timestamp (latest first)
  return actions.sort((a, b) => b.timestamp - a.timestamp);
};

export const networkText = distance => {
  if (distance === 1) return "1st degree";
  if (distance === 2) return "2nd degree";
  if (distance === 3) return "3rd degree";
  return `${distance} degree`;
};

export const profileTimelineActions = {
  linkedin_view: {
    icon: EyeIcon,
    label: "Profile Viewed in Campaign",
  },
  linkedin_invite: {
    icon: UserIcon,
    label: "Profile Invited in Campaign",
  },
  linkedin_inmail: {
    icon: SendIcon,
    label: "Profile InMailed in Campaign",
  },
  linkedin_like_post: {
    icon: ThumbIcon,
    label: "Liked Post in Campaign",
  },
  linkedin_message: {
    icon: StepMessages,
    label: "Message Sent in Campaign",
  },
  linkedin_endorse: {
    icon: EndorseIcon,
    label: "Endorsed in Campaign",
  },
  linkedin_follow: {
    icon: PlusIcon,
    label: "Profile Followed in Campaign",
  },
  email_message: {
    icon: MailIcon,
    label: "Email Sent in Campaign",
  },
  // campaign-level events
  campaign_join: {
    icon: UserIcon2,
    label: "Profile Joined Campaign",
  },
  campaign_lock: {
    icon: LockIcons,
    label: "Profile Locked to Campaign",
  },
};