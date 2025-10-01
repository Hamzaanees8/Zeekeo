import React, { useState, useEffect } from "react";
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
import { getCampaigns } from "../../../services/campaigns.js";

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

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);

  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const campaignOptions = [
    "All Campaigns",
    "Campaign A",
    "Campaign B",
    "Campaign C",
  ];

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getCampaigns();

        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
        if (err?.response?.status !== 401) {
          toast.error("Failed to fetch campaigns");
        }
      }
    };

    fetchCampaigns();
  }, []);

  const handleCampaignSelect = option => {
    setSelectedCampaigns(option);
    setShowCampaigns(false);
  };

  const toggleCampaigns = () => setShowCampaigns(!showCampaigns);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const formattedDateRange = `${dateFrom} - ${dateTo}`;
  const user = getCurrentUser();
  const linkedin = user?.accounts?.linkedin || {};
  const email = user?.accounts?.email;
  const VALID_ACCOUNT_STATUSES = [
    "OK",
    "SYNC_SUCCESS",
    "RECONNECTED",
    "CREATION_SUCCESS",
  ];
  
  const platforms = [
    {
      name: "LinkedIn",
      color:
        VALID_ACCOUNT_STATUSES.includes(linkedin.status)
          ? "bg-approve"
          : "bg-[#f61d00]",
      tooltip:
        VALID_ACCOUNT_STATUSES.includes(linkedin.status)
          ? "You have LinkedIn Connected"
          : "You don't have LinkedIn Connected",
    },
    {
      name: "Sales Navigator",
      color:
        VALID_ACCOUNT_STATUSES.includes(linkedin.status) &&
        linkedin?.data?.sales_navigator?.contract_id
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
              <div
                className={`absolute top-full opacity-0 group-hover:opacity-100 transition 
                ${platform.color} text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10`}
              >
                {platform.tooltip}
              </div>
            </div>
          ))}
        </div>
        <DashboardStats campaigns={campaigns} />
        <CampaignInsights campaigns={campaigns} />
      </div>
    </>
  );
};
