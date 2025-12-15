import React, { useState, useRef, useEffect } from "react";
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
import StatsCampaignsFilter from "../../../components/dashboard/StatsCampaignsFilter";
import { makeLocalDate } from "../../../utils/stats-helper";

const metricConfig = [
  { key: "linkedin_view", label: "Views", color: "#4F46E5" },
  { key: "linkedin_invite", label: "Invites", color: "#0F80AA" },
  { key: "linkedin_invite_accepted", label: "Accepted", color: "#1A5B92" },
  { key: "linkedin_inmail", label: "InMails", color: "#20BAC5" },
  { key: "linkedin_message", label: "LinkedIn Messages", color: "#6D2160" },
  { key: "linkedin_reply", label: "Replies", color: "#9C27B0" },
  { key: "linkedin_like_post", label: "Post Likes", color: "#FF9800" },
  { key: "email_message", label: "Email Messages", color: "#FF5722" },
  { key: "linkedin_endorse", label: "Endorsements", color: "#DED300" },
  { key: "linkedin_follow", label: "Follows", color: "#10B981" },
];

export default function DashboardStats({
  campaigns,
  isInmailPausedRecently,
  isInvitesPausedRecently,
  invitesPausedUntil,
  inmailPausedUntil,
}) {
  const dropdownRef = useRef(null);
  // Get today's date
  const today = new Date();
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // console.log("todayStr:", todayStr);

  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = [
    lastMonth.getFullYear(),
    String(lastMonth.getMonth() + 1).padStart(2, "0"),
    String(lastMonth.getDate()).padStart(2, "0"),
  ].join("-");

  // console.log("lastMonthStr:", lastMonthStr);
  // Applied dates
  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);

  // Temp dates (only for UI picker)
  const [tempDateFrom, setTempDateFrom] = useState(lastMonthStr);
  const [tempDateTo, setTempDateTo] = useState(todayStr);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCampaigns(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    // If campaigns selected, add campaignIds param
    if (selectedCampaigns.length > 0) {
      params.campaignIds = selectedCampaigns.join(",");
    }

    fetchDashboardStats(params);
  }, [dateFrom, dateTo, selectedCampaigns]);

  useEffect(() => {
    if (dashboardStats?.actions) {
      buildChartData();
    }
  }, [dashboardStats]);

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

    const startDate = makeLocalDate(start);
    const endDate = makeLocalDate(end);

    // console.log("building chart data...", start, end);

    const { lastPeriod, thisPeriod } = dashboardStats?.actions;
    const data = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-");
      //  console.log("processing date:", dateStr);
      const row = { date: dateStr };

      metricConfig.forEach(({ key }) => {
        row[key] = getDailyStatValue(thisPeriod?.[key], dateStr);
      });

      data.push(row);
    }

    //  console.log("chart data:", data);

    setChartData(data);
  }

  const changePercentage = (current, prev) => {
    const diffPercent =
      prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;

    return diffPercent >= 0 ? `+${diffPercent}%` : `${diffPercent}%`;
  };

  const formatPauseTimestamp = timestamp => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Get timezone abbreviation
    const timezone = date
      .toLocaleTimeString("en-us", { timeZoneName: "short" })
      .split(" ")[2];

    return `${day}/${month}/${year} at ${hours}:${minutes} ${timezone}`;
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
                    value={tempDateFrom}
                    onChange={e => setTempDateFrom(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <label className="text-sm text-gray-600 mt-2">To:</label>
                  <input
                    type="date"
                    value={tempDateTo}
                    onChange={e => setTempDateTo(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      setDateFrom(tempDateFrom);
                      setDateTo(tempDateTo);
                      setShowDatePicker(false);
                    }}
                    className="mt-3 text-sm text-blues hover:underline self-end"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Campaign Dropdown */}
          <StatsCampaignsFilter
            campaigns={campaigns}
            selectedCampaigns={selectedCampaigns}
            setSelectedCampaigns={setSelectedCampaigns}
          />

          {/* Download Button */}
          {/* <button className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white">
            <DownloadIcon className="w-4 h-4" />
          </button> */}

          {/* Filter Button */}
          {/* <div className="relative">
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
          </div> */}
        </div>
      </div>
      <div className="">
        <div className="grid grid-cols-6 grid-rows-2 gap-5 mt-6">
          {/* Top Row Cards */}
          <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#FFFFFF] rounded-[8px] border border-[#7E7E7E]">
            <div className="px-[12px] py-[15px] min-h-[166px] bg-white rounded-[8px]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[12px] text-grey-medium whitespace-nowrap">
                    Campaigns Running
                  </span>
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-full  flex items-center justify-center bg-[#FFFFFF] border-3 ${
                      (dashboardStats?.campaignsRunning || 0) === 0
                        ? "border-red-500"
                        : "border-[#00b4d8]"
                    }`}
                  >
                    <span className="text-[#7E7E7E] text-[12px] font-medium">
                      {dashboardStats?.campaignsRunning || 0}
                    </span>
                  </div>
                </div>
                <hr className="text-grey-medium" />
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[12px] text-grey-medium whitespace-nowrap">
                    Unread Positive Replies
                  </span>
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-full  flex items-center justify-center bg-[#FFFFFF] border-3 ${
                      (dashboardStats?.unreadPositiveConversations || 0) === 0
                        ? "border-red-500"
                        : "border-[#00b4d8]"
                    }`}
                  >
                    <span className="text-[#7E7E7E] text-[12px] font-medium">
                      {dashboardStats?.unreadPositiveConversations || 0}
                    </span>
                  </div>
                </div>
              </div>
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
              text="This shows the number of times your profile was viewed during the selected period, compared with the previous period. It helps measure how much attention your outreach and activity are generating over time."
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
              text="This shows how many of your connection invites were accepted during the selected period, compared with the previous period. It helps track how effective your outreach is at converting invites into new connections."
              className="absolute bottom-2 right-2"
            />
          </div>
          <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
            <PeriodCard
              title="Replies"
              Topvalue={
                dashboardStats?.actions?.thisPeriod?.linkedin_reply?.total
              }
              Lowvalue={
                dashboardStats?.actions?.lastPeriod?.linkedin_reply?.total
              }
              change={changePercentage(
                dashboardStats?.actions?.thisPeriod?.linkedin_reply?.total,
                dashboardStats?.actions?.lastPeriod?.linkedin_reply?.total,
              )}
              icon={RepliesIcon}
            />
            <TooltipInfo
              text="This shows how many replies you received during the selected period, compared with the previous period. It helps you measure engagement and see whether your messaging strategy is improving."
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
              pausedBadge={isInvitesPausedRecently}
              pausedTimestamp={invitesPausedUntil}
            />
            <TooltipInfo
              text="This shows the number of connection invites sent during the selected period, compared with the previous period. It helps you track outreach activity and consistency."
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
              text="This shows the number of LinkedIn messages sent during the selected period, compared with the previous period. It helps you monitor communication levels within your campaigns."
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
              text="This shows how many new people followed your profile during the selected period, compared with the previous period. It helps you understand changes in visibility and audience growth."
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
              pausedBadge={isInmailPausedRecently}
              pausedTimestamp={inmailPausedUntil}
            />
            <TooltipInfo
              text="This shows the number of InMails sent during the selected period, compared with the previous period. It helps track direct outreach activity and identify trends in communication efforts."
              className="absolute bottom-2 right-2"
            />
          </div>
        </div>
      </div>
    </>
  );
}
