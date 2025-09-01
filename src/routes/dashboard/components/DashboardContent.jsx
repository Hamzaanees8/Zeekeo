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

  const platforms = [
    { name: "LinkedIn Premium", color: "bg-approve" },
    { name: "Sales Navigator", color: "bg-approve" },
    { name: "LinkedIn Recruiter", color: "bg-grey" },
    { name: "Twitter", color: "bg-approve" },
  ];

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
        {/* Top Row - Platforms */}
        <div className="flex items-center gap-[40px] mb-6">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="flex items-center text-[10px] text-grey-light"
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${platform.color}`}
              ></span>
              {platform.name}
            </div>
          ))}
        </div>

        {/* Bottom Row - Heading + Filters */}
        <div className="flex flex-wrap items-center justify-between">
          {/* Heading */}
          <h1 className="text-[48px] font-urbanist text-grey-medium font-medium ">
            Dashboard
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

            {/* Campaign Dropdown */}
            <div className="relative">
              <button
                onClick={toggleCampaigns}
                className="flex w-[223px] justify-between items-center border border-grey px-3 py-2 bg-white"
              >
                <span className="text-grey-light text-[12px]">{campaign}</span>
                <DropArrowIcon className="w-3 h-3 ml-2" />
              </button>

              {showCampaigns && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-md z-10">
                  {campaignOptions.map((option, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                      onClick={() => handleCampaignSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
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

        {/* Period Cards Section */}
        <div className="">
          <div className="grid grid-cols-6 grid-rows-2 gap-5 mt-6">
            {/* Top Row Cards */}
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#FFFFFF]">
              <div className="px-[12px] py-[15px] min-h-[166px] bg-white">
                <div className="flex items-center  mb-[10px] gap-[12px]">
                  <span className="text-[12px] w-[60%] text-grey-medium">
                    Campaigns Running
                  </span>
                  <span className="text-[13px] text-[#3A3A3A]">8</span>
                </div>
                <div className="flex items-center  mb-[10px] gap-[12px] mt-[12px]">
                  <span className="text-[12px] w-[60%] text-grey-medium">
                    Industry SSI Rank
                  </span>
                  <span className="text-[13px] text-[#3A3A3A]">Top 4%</span>
                </div>
                <div className="flex items-center  mb-[10px] gap-[12px] mt-[12px]">
                  <span className="text-[12px] w-[60%] text-grey-medium">
                    Profile Views (30 Days)
                  </span>
                  <span className="text-[13px] text-[#3A3A3A]">221</span>
                </div>
              </div>
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#F4F4F4]">
              <PeriodCard
                title="Views"
                Topvalue="160"
                Lowvalue="100"
                change="+23%"
                icon={ViewIcon}
              />
              <TooltipInfo
                text="This is the number of connection requests that have been accepted."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#F4F4F4]">
              <PeriodCard
                title="Accepted"
                Topvalue="236"
                Lowvalue="400"
                change="-23%"
                icon={AcceptIcon}
              />
              <TooltipInfo
                text="This is the number of connection requests that have been accepted."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#F4F4F4]">
              <PeriodCard
                title="Replies"
                Topvalue="200"
                Lowvalue="236"
                change="+23%"
                icon={RepliesIcon}
              />
              <TooltipInfo
                text="This is the number of connection requests that have been accepted."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#FFFFFF]">
              <PeriodCard
                title="Invites"
                Topvalue="180"
                Lowvalue="180"
                change="+23%"
                icon={InvitesIcon}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This is the number of connection requests that have been accepted."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#F4F4F4]">
              <PeriodCard
                title="Sequences"
                Topvalue="236"
                Lowvalue="100"
                change="+23%"
                icon={SequencesIcon}
              />
              <TooltipInfo
                text="This is the number of connection requests that have been accepted."
                className="absolute bottom-2 right-2"
              />
            </div>

            {/* Chart Box */}
            <div className="col-span-5 row-span-2 bg-white">
              <MultiMetricChart />
            </div>

            {/* Right Side Vertical Cards */}
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#F4F4F4]">
              <PeriodCard
                title="Follows"
                Topvalue="250"
                Lowvalue="100"
                change="-23%"
                icon={FollowsIcon}
              />
              <TooltipInfo
                text="This is the number of connection requests that have been accepted."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#F4F4F4]">
              <PeriodCard
                title="InMails"
                Topvalue="236"
                Lowvalue="100"
                change="+23%"
                icon={InMailsIcon}
              />
              <TooltipInfo
                text="This is the number of connection requests that have been accepted."
                className="absolute bottom-2 right-2"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => {
              setShowEmailStats(false);
            }}
            className={`font-urbanist px-3 py-1 text-[20px] font-medium cursor-pointer ${
              showEmailStats
                ? "text-[#969696] border border-[#969696] bg-transparent"
                : "text-[#FFFFFF] bg-[#969696]"
            }`}
          >
            LinkedIn Stats
          </button>
          <button
            onClick={() => {
              setShowEmailStats(true);
            }}
            className={`font-urbanist px-3 py-1 text-[20px] font-medium cursor-pointer ${
              showEmailStats
                ? "text-[#FFFFFF] bg-[#969696]"
                : "text-[#969696] border border-[#969696] bg-transparent"
            }`}
          >
            Email Stats
          </button>
        </div>

        {/* Bottom Row - Heading + Filters */}
        <div className="flex flex-wrap items-center justify-between mt-3">
          {/* Filter Controls */}
          <div className="flex  gap-3 mt-4 sm:mt-0 relative">
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

            {/* Campaign Dropdown */}
            <div className="relative">
              <button
                onClick={toggleCampaigns}
                className="flex w-[223px] justify-between items-center border border-grey px-3 py-2 bg-white"
              >
                <span className="text-grey-light text-[12px]">{campaign}</span>
                <DropArrowIcon className="w-3 h-3 ml-2" />
              </button>

              {showCampaigns && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-md z-10">
                  {campaignOptions.map((option, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                      onClick={() => handleCampaignSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
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

        {/* Graph Cards Section */}
        <div className="">
          {showEmailStats ? <EmailStats /> : <LinkedInStats />}
        </div>
      </div>
    </>
  );
};
