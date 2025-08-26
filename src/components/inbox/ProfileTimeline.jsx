import React from "react";
import { Cross, InvitesIcon, LinkedIn1, LockIcons } from "../Icons";
import { formatDate } from "../../utils/inbox-helper";

const campaignTimeline = [
  {
    type: "locked",
    label: "Profile Locked to Campaign",
    campaign: "Campaign Name",
    date: "2025-07-08",
    icon: <LockIcons className="w-3 h-3" />,
    iconBg: "#0077B6",
    iconColor: "#0077B6",
  },
  {
    type: "step",
    step: 1,
    label: "Profile Sequence #1 In Campaign",
    campaign: "Campaign Name",
    date: "2025-07-08",
    iconText: "1",
    iconBg: "#0077B6",
    iconColor: "#fff",
  },
  {
    type: "joined",
    label: "Profile Joined Campaign",
    campaign: "Campaign Name",
    date: "2025-07-08",
    iconText: "+",
    iconBg: "#0077B6",
    iconColor: "#fff",
  },
  {
    type: "email",
    step: 1,
    label: "Profile Email Sequence #1 in Campaign",
    campaign: "Campaign Name",
    date: "2025-07-08",
    iconText: "1",
    iconBg: "#0077B6",
    iconColor: "#fff",
  },
];

const ProfileTimeline = ({
  selectedConversation,
  setShowSidebar,
}) => {
  if (!selectedConversation) return null;

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
        <LinkedIn1 className="w-4 h-4" />
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
          src={
            selectedConversation.profile?.profile_picture_url ||
            "/default-avatar.png"
          }
          alt={selectedConversation.profile?.first_name || "Profile"}
          className="w-20 h-20 rounded-full bg-[#D9D9D9]"
        />
      </div>

      {/* Basic Info */}
      <div className="flex flex-col justify-center items-center gap-1">
        <div className="text-[#16A37B] text-[10px]">
          {selectedConversation.degree}
        </div>
        <div className="text-[#454545] text-[14px] font-semibold font-urbanist">
          {selectedConversation.name}
        </div>
        <div className="text-[#7E7E7E] text-[12px]">
          {selectedConversation.title}
        </div>
        <div className="flex items-center gap-2">
          <InvitesIcon className="w-4 h-4 fill-[#7E7E7E]" />
          <div className="text-[#03045E] text-[12px]">
            {selectedConversation.email}
          </div>
        </div>
      </div>

      {/* Extra Info */}
      <div className="flex flex-col gap-1">
        <div className="text-[#7E7E7E] text-[12px]">
          <span className="font-bold text-[#454545]">Industry: </span>
          {selectedConversation.industry}
        </div>
        <div className="text-[#7E7E7E] text-[12px]">
          <span className="font-bold text-[#454545]">Title: </span>
          {selectedConversation.title}
        </div>
        <div className="text-[#7E7E7E] text-[12px]">
          <span className="font-bold text-[#454545]">Location: </span>
          {selectedConversation.location}
        </div>
      </div>

      {/* Campaign Timeline */}
      <div className="relative mt-4 border-l border-[#BDBDBD]">
        {campaignTimeline.map((item, index) => (
          <div key={index} className="mb-6 pl-4 relative">
            <div
              className="absolute -left-[11px] top-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold"
              style={{
                backgroundColor: item.iconBg,
                color: item.iconColor,
              }}
            >
              {item.icon || item.iconText}
            </div>

            <div className="text-[#454545] text-[12px] font-semibold leading-4">
              {item.label}
            </div>
            <div className="text-[#7E7E7E] text-[10px]">{item.campaign}</div>
            <div className="text-[#00B4D8] text-[10px]">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileTimeline;
