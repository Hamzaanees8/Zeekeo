import React, { useEffect, useRef, useState } from "react";
import { getCurrentUser } from "../../../../utils/user-helpers";
import {
  AcceptIcon,
  CalenderIcon,
  DownloadIcon,
  DropArrowIcon,
  FilterIcon,
  FollowsIcon,
  InMailsIcon,
  InvitesIcon,
  RepliesIcon,
  SequencesIcon,
  ViewIcon,
} from "../../../../components/Icons";
import StatsCampaignsFilter from "../../../../components/dashboard/StatsCampaignsFilter";
import PeriodCard from "../../../dashboard/components/PeriodCard";
import TooltipInfo from "../../../dashboard/components/TooltipInfo";
import MultiMetricChart from "../../../dashboard/components/graph-cards/MultiMetricChart";
import { metricConfig } from "../../../../utils/stats-helper";
import UserEmailStats from "./UserEmailStats";
import UserLinkedInStats from "./UserLinkedInStats";
import ICPInsights from "./ICPInsights";
import ProfileInsights from "./ProfileInsights";
import { getInsights } from "../../../../services/agency";

const UserDashboard = ({ campaigns, selectedUsers }) => {
  const dropdownRef = useRef(null);
  // Date initialization
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split("T")[0];
  // Applied dates
  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);

  // Add this function
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  // Add this variable
  const formattedDateRange = `${dateFrom} - ${dateTo}`;

  // Temp dates (for UI picker)
  const [tempDateFrom, setTempDateFrom] = useState(lastMonthStr);
  const [tempDateTo, setTempDateTo] = useState(todayStr);

  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Data states
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);

  const toggleFilters = () => setShowFilters(!showFilters);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Function to calculate percentage change
  const changePercentage = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

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
      userIds: selectedUsers,
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["campaignsRunning", "unreadPositiveConversations", "actions"],
    };

    // If campaigns selected, add campaignIds param
    if (selectedCampaigns.length > 0) {
      params.campaignIds = selectedCampaigns.join(",");
    }

    fetchDashboardStats(params);
  }, [dateFrom, dateTo, selectedCampaigns, selectedUsers]);
  console.log("Selected User Emails before render:", selectedUsers);
  useEffect(() => {
    if (dashboardStats?.actions) {
      buildChartData();
    }
  }, [dashboardStats]);

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

  const [showEmailStats, setShowEmailStats] = useState(false);

  const [campaignInsights, setCampaignInsights] = useState([]);

  useEffect(() => {
    const fetchCampaignInsights = async params => {
      const insights = await getInsights(params);
      setCampaignInsights(insights);
    };
    const params = {
      userIds: selectedUsers,
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["actions", "insights", "latestMessages", "last24Actions"],
    };

    // If campaigns selected, add campaignIds param
    if (selectedCampaigns.length > 0) {
      params.campaignIds = selectedCampaigns.join(",");
    }

    console.log("fetching...");
    fetchCampaignInsights(params);
  }, [dateFrom, dateTo, selectedCampaigns, selectedUsers]);

  console.log("stats..", campaignInsights);

  // === ADD PLATFORM CODE HERE ===
  const userData = getCurrentUser();
  const linkedin = userData?.accounts?.linkedin || {};
  const email = userData?.accounts?.email;
  const VALID_ACCOUNT_STATUSES = [
    "OK",
    "SYNC_SUCCESS",
    "RECONNECTED",
    "CREATION_SUCCESS",
  ];

  const platforms = [
    {
      name: "LinkedIn",
      color: VALID_ACCOUNT_STATUSES.includes(linkedin?.status)
        ? "bg-approve"
        : "bg-[#f61d00]",
      tooltip: linkedin?.status
        ? VALID_ACCOUNT_STATUSES.includes(linkedin?.status)
          ? "You have LinkedIn Connected"
          : "LinkedIn account disconnected"
        : "You don't have LinkedIn Connected",
    },
    {
      name: "Sales Navigator",
      color:
        VALID_ACCOUNT_STATUSES.includes(linkedin?.status) &&
        linkedin?.data?.sales_navigator?.contract_id
          ? "bg-approve"
          : "bg-[#f61d00]",
      tooltip: linkedin?.data?.sales_navigator?.contract_id
        ? VALID_ACCOUNT_STATUSES.includes(linkedin?.status)
          ? "Sales Navigator is active"
          : "Sales Navigator account disconnected"
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
  // === END PLATFORM CODE ===
  return (
    <>
      <div className="p-6 w-full relative">
        {/* <div className="flex items-center gap-[40px] mb-6">
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
        </div> */}
        <div className="flex flex-wrap items-center justify-between">
          {/* Heading */}
          <h1 className="text-[48px] font-urbanist text-grey-medium font-medium ">
            Dashboard
          </h1>
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
                change="+235%"
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
                change="+164%"
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
                  dashboardStats?.actions?.thisPeriod?.linkedin_invite_reply
                    ?.total
                }
                Lowvalue={
                  dashboardStats?.actions?.lastPeriod?.linkedin_invite_reply
                    ?.total
                }
                change="-50%"
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
                change="+97%"
                icon={InvitesIcon}
                bg="bg-[#ffffff]"
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
                Lowvalue="3"
                change="+267%"
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
                change="+565%"
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
                change="+0%"
                icon={InMailsIcon}
              />
              <TooltipInfo
                text="This shows the number of InMails sent during the selected period, compared with the previous period. It helps track direct outreach activity and identify trends in communication efforts."
                className="absolute bottom-2 right-2"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-12 justify-end ">
          <div className="flex items-center bg-[#F1F1F1] border-[1px] border-[#0387FF] rounded-[4px]">
            <button
              onClick={() => {
                setShowEmailStats(false);
              }}
              className={`px-5 py-2 text-[12px] font-semibold cursor-pointer ${
                showEmailStats
                  ? "text-[#0387FF] hover:bg-gray-100"
                  : "bg-[#0387FF] text-white"
              }`}
            >
              LinkedIn Stats
            </button>
            <button
              onClick={() => {
                setShowEmailStats(true);
              }}
              className={`px-5 py-2 text-[12px] font-semibold cursor-pointer ${
                showEmailStats
                  ? "bg-[#0387FF] text-white"
                  : "text-[#0387FF] hover:bg-gray-100"
              }`}
            >
              Email Stats
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between mt-3">
          <h2 className="text-[28px] font-urbanist text-grey-medium font-medium ">
            CAMPAIGN INSIGHTS
          </h2>
          {/* Filter Controls */}
          <div className="flex  gap-3 mt-4 sm:mt-0 relative">
            {/* Date Range Display */}
            <div className="relative">
              <button
                onClick={toggleDatePicker}
                className="flex w-[267px] justify-between items-center rounded-[4px] border border-grey  px-3 py-2 bg-white"
              >
                <CalenderIcon className="w-4 h-4 mr-2" />
                <span className="text-grey-light text-[12px]">
                  {formattedDateRange}
                </span>
                <DropArrowIcon className="w-3 h-3 ml-2" />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 shadow-md p-4 z-10">
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
          {showEmailStats ? (
            <UserEmailStats />
          ) : (
            <UserLinkedInStats
              messages={campaignInsights?.latestMessages || []}
              actions={campaignInsights?.actions || []}
              insights={campaignInsights?.insights || []}
              last24Actions={campaignInsights?.last24Actions || []}
              selectedCampaigns={selectedCampaigns}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          )}
        </div>
        <ICPInsights selectedUsers={selectedUsers} />
        <ProfileInsights selectedUsers={selectedUsers} />
      </div>
    </>
  );
};

export default UserDashboard;
