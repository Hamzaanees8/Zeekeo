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
  const platforms = [
    {
      name: "LinkedIn Premium",
      color: linkedin?.data?.premium === true ? "bg-approve" : "bg-grey",
      tooltip: linkedin?.premium
        ? "You have LinkedIn Premium"
        : "You don't have LinkedIn Premium",
    },
    {
      name: "Sales Navigator",
      color: linkedin?.data?.sales_navigator?.contract_id
        ? "bg-approve"
        : "bg-grey",
      tooltip: linkedin?.sales_navigator
        ? "Sales Navigator is active"
        : "No Sales Navigator seat",
    },
    {
      name: "LinkedIn Recruiter",
      color: linkedin?.data?.recruiter ? "bg-approve" : "bg-grey",
      tooltip: linkedin?.recruiter
        ? "Recruiter license connected"
        : "Recruiter not available",
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
              <div className="absolute top-full opacity-0 group-hover:opacity-100 transition bg-black text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10">
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
                    "Please connect your LinkedIn account to create a campaign",
                  )
                }
                className="flex items-center gap-2 border rounded-[6px] border-grey px-3 py-2 bg-white text-grey cursor-pointer text-[16px] font-urbanist leading-[130%]"
              >
                <span className="text-[25px]">+</span> Create Campaign
              </button>
            )}

            {/* Download Button */}
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
            <div className="col-span-1 row-span-2 ">
              <AcceptanceRate value="10,20,22,30,30,10,0" max={40} />
            </div>
            <div className="col-span-1 row-span-1 ">
              <LinkedInMessages total={13} max={126} />
            </div>
            <div className="col-span-1 row-span-1 ">
              <InMails total={27} maxFollows={40} />
            </div>
            <div className="col-span-2 row-span-1 ">
              <ProfileViews value="20,80,42,45,38,55,30" max={81} />
            </div>
            <div className="col-span-2 row-span-1 ">
              <Invites value="20,58,42,45,38,55,30" max={81} />
            </div>
            <div className="col-span-1 row-span-1 ">
              <Follows total={4} maxFollows={5} />
            </div>
            <div className="col-span-1 row-span-1 ">
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
          />
        </div>
      </div>
    </>
  );
};
