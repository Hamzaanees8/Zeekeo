import React, { useState, useEffect } from "react";
import PeriodCard from "./PeriodCard";
import TooltipInfo from "./TooltipInfo";
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
} from "../../../components/Icons";
import MultiMetricChart from "./graph-cards/MultiMetricChart";
import { getInsights } from "../../../services/insights";
import { metricConfig } from "../../../utils/stats-helper";
import ComparisonChart from "./graph-cards/ComparisonChart";

export default function DashboardStats() {
  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // format YYYY-MM-DD

  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split("T")[0];

  const [campaign, setCampaign] = useState("All Campaigns");
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const campaignOptions = [
    "All Campaigns",
    "Campaign A",
    "Campaign B",
    "Campaign C",
  ];

  useEffect(() => {
    const fetchDashboardStats = async params => {
      const insights = await getInsights(params);
      setDashboardStats(insights);
    };
    const params = {
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["campaignsRunning", "unreadPositiveConversations", "actions"],
    };
    fetchDashboardStats(params);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (dashboardStats?.actions) {
      buildChartData();
    }
  }, [dashboardStats]);

  const handleCampaignSelect = option => {
    setCampaign(option);
    setShowCampaigns(false);
  };
  const toggleCampaigns = () => setShowCampaigns(!showCampaigns);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const formattedDateRange = `${dateFrom} - ${dateTo}`;

  function getDailyStatValue(metricData, dateStr) {
    if (!metricData || !metricData.daily) return 0;
    return metricData.daily[dateStr] ?? 0;
  }

  function buildChartData() {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    const { lastPeriod, thisPeriod } = dashboardStats?.actions;
    const data = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const row = { date: dateStr };

      metricConfig.forEach(({ key }) => {
        row[key] = getDailyStatValue(thisPeriod?.[key], dateStr);
      });

      data.push(row);
    }

    setChartData(data);
  }

  const changePercentage = (current, prev) => {
    const diffPercent =
      prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;

    return diffPercent >= 0 ? `+${diffPercent}%` : `${diffPercent}%`;
  };

  return (
    <>
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
              className="flex w-[267px] justify-between items-center border border-grey  px-3 py-2 bg-white rounded-[6px]"
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
              className="flex w-[223px] justify-between items-center border border-grey px-3 py-2 bg-white rounded-[6px]"
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
      <div className="">
        <div className="grid grid-cols-6 grid-rows-2 gap-5 mt-6">
          {/* Top Row Cards */}
          <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#FFFFFF] rounded-[8px] border border-[#7E7E7E]">
            <div className="px-[12px] py-[15px] min-h-[166px] bg-white rounded-[8px]">
              <div className="flex items-center  mb-[10px] gap-[12px] ">
                <span className="text-[12px] w-[60%] text-grey-medium">
                  Campaigns Running
                </span>
                <span className="text-[13px] text-[#3A3A3A]">
                  {dashboardStats?.campaignsRunning}
                </span>
              </div>
              <div className="flex items-center  mb-[10px] gap-[12px] mt-[12px]">
                <span className="text-[12px] w-[60%] text-grey-medium">
                  New Positive Replies
                </span>
                <span className="text-[13px] text-[#3A3A3A]">
                  {dashboardStats?.unreadPositiveConversations}
                </span>
              </div>
              {/* <div className="flex items-center  mb-[10px] gap-[12px] mt-[12px]">
                <span className="text-[12px] w-[60%] text-grey-medium">
                  Profile Views (30 Days)
                </span>
                <span className="text-[13px] text-[#3A3A3A]">221</span>
              </div> */}
            </div>
          </div>
          <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
            <PeriodCard
              title="Views"
              Topvalue={
                dashboardStats?.actions?.thisPeriod?.linkedin_view?.total
              }
              Lowvalue={
                dashboardStats?.actions?.lastPeriod?.linkedin_view?.total
              }
              change={changePercentage(
                dashboardStats?.actions?.thisPeriod?.linkedin_view?.total,
                dashboardStats?.actions?.lastPeriod?.linkedin_view?.total,
              )}
              icon={ViewIcon}
            />
            <TooltipInfo
              text="This is the number of connection requests that have been accepted."
              className="absolute bottom-2 right-2"
            />
          </div>
          <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
            <PeriodCard
              title="Accepted"
              Topvalue={
                dashboardStats?.actions?.thisPeriod?.linkedin_invite_accepted
                  ?.total
              }
              Lowvalue={
                dashboardStats?.actions?.lastPeriod?.linkedin_invite_accepted
                  ?.total
              }
              change={changePercentage(
                dashboardStats?.actions?.thisPeriod?.linkedin_invite_accepted
                  ?.total,
                dashboardStats?.actions?.lastPeriod?.linkedin_invite_accepted
                  ?.total,
              )}
              icon={AcceptIcon}
            />
            <TooltipInfo
              text="This is the number of connection requests that have been accepted."
              className="absolute bottom-2 right-2"
            />
          </div>
          <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
            <PeriodCard
              title="Replies"
              Topvalue={
                dashboardStats?.actions?.thisPeriod?.linkedin_invite_reply
                  ?.total
              }
              Lowvalue={
                dashboardStats?.actions?.lastPeriod?.linkedin_invite_reply
                  ?.total
              }
              change={changePercentage(
                dashboardStats?.actions?.thisPeriod?.linkedin_invite_reply
                  ?.total,
                dashboardStats?.actions?.lastPeriod?.linkedin_invite_reply
                  ?.total,
              )}
              icon={RepliesIcon}
            />
            <TooltipInfo
              text="This is the number of connection requests that have been accepted."
              className="absolute bottom-2 right-2"
            />
          </div>
          <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
            <PeriodCard
              title="Invites"
              Topvalue={
                dashboardStats?.actions?.thisPeriod?.linkedin_invite?.total
              }
              Lowvalue={
                dashboardStats?.actions?.lastPeriod?.linkedin_invite?.total
              }
              change={changePercentage(
                dashboardStats?.actions?.thisPeriod?.linkedin_invite?.total,
                dashboardStats?.actions?.lastPeriod?.linkedin_invite?.total,
              )}
              icon={InvitesIcon}
              bg="bg-[#ffffff]"
            />
            <TooltipInfo
              text="This is the number of connection requests that have been accepted."
              className="absolute bottom-2 right-2"
            />
          </div>
          <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
            <PeriodCard
              title="LinkedIn Messages"
              Topvalue={
                dashboardStats?.actions?.thisPeriod?.linkedin_message?.total
              }
              Lowvalue={
                dashboardStats?.actions?.lastPeriod?.linkedin_message?.total
              }
              change={changePercentage(
                dashboardStats?.actions?.thisPeriod?.linkedin_message?.total,
                dashboardStats?.actions?.lastPeriod?.linkedin_message?.total,
              )}
              icon={SequencesIcon}
            />
            <TooltipInfo
              text="This is the number of connection requests that have been accepted."
              className="absolute bottom-2 right-2"
            />
          </div>

          {/* Chart Box */}
          <div className="col-span-5 row-span-2 bg-white rounded-[8px]">
            <MultiMetricChart data={chartData} />
          </div>

          {/* Right Side Vertical Cards */}
          <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
            <PeriodCard
              title="Follows"
              Topvalue={
                dashboardStats?.actions?.thisPeriod?.linkedin_follow?.total
              }
              Lowvalue={
                dashboardStats?.actions?.lastPeriod?.linkedin_follow?.total
              }
              change={changePercentage(
                dashboardStats?.actions?.thisPeriod?.linkedin_follow?.total,
                dashboardStats?.actions?.lastPeriod?.linkedin_follow?.total,
              )}
              icon={FollowsIcon}
            />
            <TooltipInfo
              text="This is the number of connection requests that have been accepted."
              className="absolute bottom-2 right-2"
            />
          </div>
          <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
            <PeriodCard
              title="InMails"
              Topvalue={
                dashboardStats?.actions?.thisPeriod?.linkedin_inmail?.total
              }
              Lowvalue={
                dashboardStats?.actions?.lastPeriod?.linkedin_inmail?.total
              }
              change={changePercentage(
                dashboardStats?.actions?.thisPeriod?.linkedin_inmail?.total,
                dashboardStats?.actions?.lastPeriod?.linkedin_inmail?.total,
              )}
              icon={InMailsIcon}
            />
            <TooltipInfo
              text="This is the number of connection requests that have been accepted."
              className="absolute bottom-2 right-2"
            />
          </div>
        </div>
      </div>
    </>
  );
}
