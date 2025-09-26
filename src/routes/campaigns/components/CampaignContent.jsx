import { useState } from "react";
import {
  CalenderIcon,
  DropArrowIcon,
  DownloadIcon,
  FilterIcon,
} from "../../../components/Icons.jsx";
import Follows from "./graph-cards/Follows.jsx";
import LinkedInSequences from "./graph-cards/LinkedInSequences.jsx";
import Endorsements from "./graph-cards/Endorsements.jsx";
import InMails from "./graph-cards/InMails.jsx";
import AcceptanceRate from "./graph-cards/AcceptanceRate.jsx";
import ProfileViews from "./graph-cards/ProfileViews.jsx";
import Invites from "./graph-cards/Invites.jsx";
import PeriodHeaderActions from "./PeriodHeaderActions.jsx";
import CampaignsTable from "./CampaignsTable.jsx";
import { Link } from "react-router";
import LinkedInMessages from "./graph-cards/LinkedInMessages.jsx";
import { getCurrentUser } from "../../../utils/user-helpers.jsx";
import toast from "react-hot-toast";
import Button from "../../../components/Button.jsx";

export const CampaignContent = () => {
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
  const [activeTab, setActiveTab] = useState("total");
  const [campaign, setCampaign] = useState("All Campaigns");
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTabDays, setActiveTabDays] = useState("7days");

  const handleCampaignSelect = option => {
    setCampaign(option);
    setShowCampaigns(false);
  };

  const toggleCampaigns = () => setShowCampaigns(!showCampaigns);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const formattedDateRange = `${dateFrom} - ${dateTo}`;
  const user = getCurrentUser();
  const linkedin = user?.accounts?.linkedin;
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
      <div className="px-[30px] py-[40px] border-b w-full relative">
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
        <div className="flex flex-wrap items-center justify-between">
          {/* Heading */}
          <h1 className="text-[48px] font-urbanist text-grey-medium font-medium ">
            Campaigns
          </h1>
          <div className="flex flex-wrap items-center justify-end mt-5 gap-2">
            {linkedin ? (
              <Link
                to="/campaigns/create"
                className="flex items-center gap-2 border rounded-[6px] border-grey px-3 py-2 bg-white text-grey-light text-[16px] font-urbanist leading-[130%]"
              >
                <span className="text-[25px]">+</span> Create Campaign
              </Link>
            ) : (
              <button
                onClick={() =>
                  toast.error(
                    "Please connect your LinkedIn and email accounts to create a campaign",
                  )
                }
                className="flex items-center gap-2 border-[2px] rounded-[6px] border-[#f61d00] px-3 py-2 bg-white text-grey cursor-pointer text-[16px] font-urbanist leading-[130%]"
              >
                <span className="text-[25px]">+</span> Create Campaign
              </button>
            )}

            <div className="flex justify-end">
              <div className="flex items-center bg-[#F1F1F1] border-[1px] border-[#0387FF] rounded-[4px]">
                <Button
                  className={`px-5 py-2 text-[12px] font-semibold cursor-pointer rounded-[4px] ${
                    activeTabDays === "7days"
                      ? "bg-[#0387FF] text-white"
                      : "text-[#0387FF] hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTabDays("7days")}
                >
                  7 Days
                </Button>
                <Button
                  className={`px-5 py-2 text-[12px] font-semibold cursor-pointer rounded-[4px] ${
                    activeTabDays === "today"
                      ? "bg-[#0387FF] text-white"
                      : "text-[#0387FF] hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTabDays("today")}
                >
                  Today
                </Button>
              </div>
            </div>
            <button className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white">
              <DownloadIcon className="w-4 h-4" />
            </button>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={toggleFilters}
                className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white"
              >
                <FilterIcon className="w-4 h-4" />
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10 p-3">
                  <p className="text-sm text-gray-700 mb-2">
                    Filters coming soon...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* cards */}
        <div className="">
          <div className="grid grid-cols-5 gap-6 mt-6">
            <div className="col-span-1 row-span-2 border border-[#7E7E7E] rounded-[8px] shadow-md">
              <AcceptanceRate value="10,20,22,30,30,10,0" max={40} />
            </div>
            <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
              <LinkedInMessages total={13} max={126} />
            </div>
            <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
              <InMails total={27} maxFollows={40} />
            </div>
            <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
              <ProfileViews value="20,80,42,45,38,55,30" max={81} />
            </div>
            <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
              <Invites value="20,58,42,45,38,55,30" max={81} />
            </div>
            <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
              <Follows total={4} maxFollows={5} />
            </div>
            <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
              <Endorsements total={0} maxFollows={40} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <PeriodHeaderActions
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="">
          <CampaignsTable
            activeTab={activeTab}
            dateFrom={dateFrom}
            dateTo={dateTo}
            linkedin={linkedin}
            email={email}
          />
        </div>
      </div>
    </>
  );
};
