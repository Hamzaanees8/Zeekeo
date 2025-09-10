import React from "react";
import { useNavigate } from "react-router";
import { Cross, InvitesIcon, LinkedIn1, LockIcons } from "../Icons";
import { formatDate } from "../../utils/inbox-helper";
import {
  profileTimelineActions,
  buildProfileTimeline,
  networkText,
  getProfileLinkedInUrl,
  getProfileLocation,
} from "../../utils/profile-helpers";

const ProfileTimeline = ({
  selectedConversation,
  setShowSidebar,
  campaigns = [],
}) => {
  if (!selectedConversation) return null;

  const navigate = useNavigate();

  const profile = selectedConversation.profile;
  const industry =
    selectedConversation.profile_instances?.[0]?.current_positions?.[0]
      ?.industry ||
    selectedConversation.profile_instances?.[0]?.industry ||
    "";
  
    const title =  selectedConversation.profile_instances?.[0]?.work_experience?.[0]
      ?.position || profile.headline

  const email =
    selectedConversation.profile_instances?.[0]?.email_address || "";

  const networkDistance =
    selectedConversation.profile_instances?.[0]?.network_distance;

  const timeline = buildProfileTimeline(selectedConversation, campaigns);

  const linkedInUrl = getProfileLinkedInUrl(selectedConversation);

  const location = getProfileLocation(selectedConversation);

  return (
    <div className="bg-white px-6 py-4 shadow-inner fixed top-[5%] right-0 h-[90vh] w-[252px] flex flex-col gap-4 overflow-y-scroll">
      {/* Last message timestamp */}
      {selectedConversation?.messages?.length > 0 && (
        <div className="text-[#0096C7] text-[10px] py-1">
          {formatDate(
            selectedConversation.messages[
              selectedConversation.messages.length - 1
            ].timestamp,
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {linkedInUrl && (
          <a href={linkedInUrl} target="_new">
            <LinkedIn1 className="w-4 h-4" />
          </a>
        )}
        <span
          className="text-[20px] cursor-pointer"
          onClick={() => setShowSidebar(false)}
        >
          <Cross className="w-5 h-5 fill-[#7E7E7E]" />
        </span>
      </div>

      {/* Profile Image */}
      <div className="flex flex-col justify-center items-center gap-2">
        <img
          src={profile?.profile_picture_url || "/default-avatar.png"}
          alt={profile?.first_name || "Profile"}
          className="w-20 h-20 rounded-full bg-[#D9D9D9]"
        />
      </div>

      {/* Basic Info */}
      <div className="flex flex-col justify-center items-center gap-1">
        {networkDistance && (
          <div className="text-[#16A37B] text-[10px]">
            {networkText(networkDistance)}
          </div>
        )}
        <div className="text-[#454545] text-[14px] font-semibold font-urbanist">
          {profile?.first_name} {profile?.last_name}
        </div>
        <div className="text-[#7E7E7E] text-[12px]">{profile?.headline}</div>
        {email && (
          <div className="flex items-center gap-2">
            <InvitesIcon className="w-4 h-4 fill-[#7E7E7E]" />
            <div className="text-[#03045E] text-[12px]">{email}</div>
          </div>
        )}
      </div>

      {/* Extra Info */}
      <div className="flex flex-col gap-1">
        {industry && (
          <div className="text-[#7E7E7E] text-[12px]">
            <span className="font-bold text-[#454545]">Industry: </span>
            {profile?.industry}
          </div>
        )}
        <div className="text-[#7E7E7E] text-[12px]">
          <span className="font-bold text-[#454545]">Title: </span>
          {title}
        </div>
        <div className="text-[#7E7E7E] text-[12px]">
          <span className="font-bold text-[#454545]">Location: </span>
          {location}
        </div>
      </div>

      {/* Campaign Timeline */}
      <div className="relative mt-4 border-l ml-2 border-[#BDBDBD]">
        {timeline.map((event, index) => {
          const action = profileTimelineActions[event.type];

          return (
            <div key={index} className="mb-6 pl-5 relative">
              <div
                className="absolute -left-[13px] top-0 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold"
                style={{
                  backgroundColor: "#0077B6",
                  color: "#0077B6",
                }}
              >
                {action?.icon && (
                  <action.icon className="w-3 h-3 fill-[#ffffff]" />
                )}
              </div>

              <div className="text-[#454545] text-[12px] font-semibold leading-4">
                {action?.label}
              </div>
              <div
                className="text-[#7E7E7E] text-[10px] cursor-pointer"
                onClick={() => navigate(`/campaigns/edit/${event.campaignId}`)}
              >
                {event.campaignName}
              </div>
              <div className="text-[#00B4D8] text-[10px]">
                {formatDate(event.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTimeline;
