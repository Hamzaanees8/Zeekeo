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

  return (
    <>
      <div className="p-6 border-b w-full relative">
        {/* Bottom Row - Heading + Filters */}
        <div className="flex flex-wrap items-center justify-between">
          {/* Heading */}
          <h1 className="text-[48px] font-urbanist text-grey-medium font-medium ">
            Campaigns
          </h1>

          {/* Filter Controls */}
          <div className="flex items-center gap-3 mt-4 sm:mt-0 relative">
            {/* Date Range Display */}
            <div className="relative">
              <button
                onClick={toggleDatePicker}
                className="flex w-[267px] justify-between items-center border border-grey  px-3 py-2 bg-white"
              >
                <CalenderIcon className="w-4 h-4 mr-2" />
                <span className="text-grey-light text-[12px]">
                  {formattedDateRange}
                </span>
                <DropArrowIcon className="w-3 h-3 ml-2" />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 rounded shadow-md p-4 z-10">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600">From:</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <label className="text-sm text-gray-600 mt-2">To:</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="mt-3 text-sm text-blues hover:underline self-end"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

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

        <div className="flex flex-wrap items-center justify-end mt-5">
          <Link
            to="/campaigns/create"
            className="flex items-center gap-2 border border-grey  px-3 py-2 leading-[130%] bg-white text-grey-light text-[16px] font-urbanist"
          >
            <span className="text-[25px]">+</span> Create Campaign
          </Link>
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
          <CampaignsTable activeTab={activeTab} dateFrom={dateFrom} dateTo={dateTo} />
        </div>
      </div>
    </>
  );
};
