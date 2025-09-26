import React, { useState } from "react";
import {
  CalenderIcon,
  DropArrowIcon,
  DownloadIcon,
  FilterIcon,
  ViewIcon,
  AcceptIcon,
  RepliesIcon,
  InvitesIcon,
  SequencesIcon,
  FollowsIcon,
  InMailsIcon,
} from "../../../components/Icons.jsx";
import PeriodCard from "./PeriodCard.jsx";
import TooltipInfo from "./TooltipInfo.jsx";
import MultiMetricChart from "./graph-cards/MultiMetricChart.jsx";
import LinkedInStats from "./LinkedInStats.jsx";
import EmailStats from "./EmailStats.jsx";
import { getCurrentUser } from "../../../utils/user-helpers.jsx";
import Button from "../../../components/Button.jsx";
import DashboardStats from "./DashboardStats.jsx";
import CampaignInsights from "./CampaignInsights.jsx";
import ICPInsights from "./ICPInsights.jsx";
import ProfileInsights from "./ProfileInsights.jsx";

export const DashboardContent = () => {
  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // format YYYY-MM-DD

  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEmailStats, setShowEmailStats] = useState(false);

  const [campaign, setCampaign] = useState("All Campaigns");
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const campaignOptions = [
    "All Campaigns",
    "Campaign A",
    "Campaign B",
    "Campaign C",
  ];

  const handleCampaignSelect = option => {
    setCampaign(option);
    setShowCampaigns(false);
  };

  const toggleCampaigns = () => setShowCampaigns(!showCampaigns);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const formattedDateRange = `${dateFrom} - ${dateTo}`;
  const user = getCurrentUser();
  const linkedin = user?.accounts?.linkedin || {};
  const email = user?.accounts?.email;
  const platforms = [
    {
      name: "LinkedIn Premium",
   color: linkedin?.data?.premium === true ? "bg-approve" : "bg-[#f61d00]",
      tooltip:
        linkedin?.data?.premium === true
          ? "You have LinkedIn Premium"
          : "You don't have LinkedIn Premium",
    },
    {
      name: "Sales Navigator",
      color: linkedin?.data?.sales_navigator?.contract_id
        ? "bg-approve"
    : "bg-[#f61d00]",
      tooltip: linkedin?.data?.sales_navigator?.contract_id
        ? "Sales Navigator is active"
        : "No Sales Navigator seat",
    },
    {
      name: "LinkedIn Recruiter",
   color: linkedin?.data?.recruiter ? "bg-approve" : "bg-[#f61d00]",
      tooltip: linkedin?.data?.recruiter
        ? "Recruiter license connected"
        : "Recruiter not available",
    },
    {
      name: "Email Connected",
   color: email?.id ? "bg-approve" : "bg-[#f61d00]",
      tooltip: email?.id ? "Email is connected" : "Email is not connected",
    },
  ];

  return (
    <>
      <div className="p-6 border-b w-full relative">
        <div className="flex items-center gap-[40px] mb-6">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="relative flex items-center text-[10px] text-grey-light group"
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${platform.color}`}
              ></span>
              {platform.name}
              <div className={`absolute top-full opacity-0 group-hover:opacity-100 transition 
                ${platform.color} text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10`}>
                {platform.tooltip}
              </div>
            </div>
          ))}
        </div>
        <DashboardStats />
        <CampaignInsights />
        <ICPInsights />  
        <ProfileInsights />      
      </div>
    </>
  );
};
