import React, { useState } from "react";
import {
  CalenderIcon,
  DropArrowIcon,
  DownloadIcon,
  FilterIcon,
  LeftNavigate,
  RightNavigate,
  AdminUsersIcon,
} from "../../../components/Icons.jsx";
import MultiMetricChart from "../../dashboard/components/graph-cards/MultiMetricChart.jsx";
import PeriodCard from "./components/PeriodCard.jsx";
import Table from "../components/Table.jsx";
import LocationDistribution from "../../dashboard/components/graph-cards/LocationDistribution.jsx";
import EmailStats from "./components/EmailStats.jsx";
import HorizontalBarChart from "./components/HorizontalBarChart.jsx";
import WeeklyLineChart from "./components/WeeklyLineChart.jsx";
import LineBarChart from "./components/LineBarChart.jsx";
import LinkedInStats from "./components/LinkedInStats.jsx";
const headers = ["User", "Campaigns", "Msgs.sent", "Accept %", "Reply %"];
const data = [
  {
    User: "Bradley",
    Campaigns: 5,
    "Msgs.sent": 450,
    Invites: 56,
    "Accept %": "32.8%",
    "Reply %": "4.56%",
  },
  {
    User: "Stefan",
    Campaigns: 6,
    "Msgs.sent": 480,
    Invites: 67,
    "Accept %": "32.8%",
    "Reply %": "4.56%",
  },
  {
    User: "Emily",
    Campaigns: 7,
    "Msgs.sent": 398,
    Invites: 32,
    "Accept %": "32.8%",
    "Reply %": "4.56%",
  },
  {
    User: "Jordan",
    Campaigns: 11,
    "Msgs.sent": 600,
    Invites: 77,
    "Accept %": "32.8%",
    "Reply %": "4.56%",
  },
  {
    User: "Fredrick",
    Campaigns: 2,
    "Msgs.sent": 11,
    Invites: 2,
    "Accept %": "0.8%",
    "Reply %": "1.56%",
  },
];
const statsdata = [
  {
    name: "Campaign 1",
    Acceptance: 40,
    Reply: 30,
    Meeting: 20,
  },
  {
    name: "Campaign 2",
    Acceptance: 20,
    Reply: 40,
    Meeting: 30,
  },
  {
    name: "Campaign 3",
    Acceptance: 10,
    Reply: 30,
    Meeting: 40,
  },
  {
    name: "Campaign 4",
    Acceptance: 50,
    Reply: 30,
    Meeting: 40,
  },
];
const campaigndata = [
  {
    name: "Bradley",
    "Campaign 1": 40,
    "Campaign 2": 30,
    "Campaign 3": 20,
    "Campaign 4": 10,
  },
  {
    name: "Stefan",
    "Campaign 1": 20,
    "Campaign 2": 40,
    "Campaign 3": 30,
    "Campaign 4": 10,
  },
  {
    name: "Emily",
    "Campaign 1": 10,
    "Campaign 2": 30,
    "Campaign 3": 40,
    "Campaign 4": 20,
  },
  {
    name: "Jordan",
    "Campaign 1": 50,
    "Campaign 2": 30,
    "Campaign 3": 40,
    "Campaign 4": 10,
  },
];
const AgencyDashboard = () => {
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

  const [user, setUser] = useState("All Users");
  const [showUsers, setShowUsers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const userOptions = ["All Users", "User A", "User B", "User C"];

  const handleUserSelect = option => {
    setUser(option);
    setShowUsers(false);
  };

  const toggleUsers = () => setShowUsers(!showUsers);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const formattedDateRange = `${dateFrom} - ${dateTo}`;

  return (
    <>
      <div className="px-[26px] pt-[45px] pb-[100px] border-b w-full relative">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-[#6D6D6D] text-[44px] font-[300] ">Dashboard</h1>
          <div className="flex items-center gap-3 mt-4 sm:mt-0 relative">
            <button className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white">
              <DownloadIcon className="w-4 h-4" />
            </button>
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
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-x-2">
            <p className="font-normal text-[28px] text-[#6D6D6D]">
              Agency Stats
            </p>
            <p className="font-normal text-[14px] text-[#6D6D6D]">
              (Team-Wide Aggregated Metrics)
            </p>
          </div>
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
        </div>

        {/* Period Cards Section */}
        <div className="">
          <div className="grid grid-cols-6 gap-5 mt-6">
            <PeriodCard title="Campaigns" value={32} change="+2%" />
            <PeriodCard title="Messages Sent" value={1958} change="+2%" />
            <PeriodCard title="Reply Rate (avg)" change="+24%" value={32} />
            <PeriodCard title="Invites" value={1958} change="+2" />
            <PeriodCard
              title="Invite Accepts (avg)"
              value={32}
              change="-12%"
            />
            <PeriodCard title="Meetings" value={1958} change="-12%" />
          </div>
        </div>
        <div className="mt-[48px]">
          <MultiMetricChart />
        </div>
        <div className="mt-[48px] grid grid-cols-5 gap-3">
          <div className="col-span-3 flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <p className="font-normal text-[28px] text-[#6D6D6D]">
                  User Stats
                </p>
                <p className="font-normal text-[14px] text-[#6D6D6D]">
                  (User-Level Breakdown)
                </p>
              </div>
              <div className="flex items-center gap-x-2.5">
                <div className="cursor-pointer">
                  <LeftNavigate className="text-[#6D6D6D]" />
                </div>

                <p className="text-lg text-[#6D6D6D] font-normal">
                  Displaying 5 of 24 Users
                </p>
                <div className="cursor-pointer">
                  <RightNavigate className="text-[#6D6D6D]" />
                </div>
              </div>
            </div>
            <Table headers={headers} data={data} rowsPerPage="all" />
          </div>
          <div className="col-span-2">
            <LocationDistribution />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="w-[540px] bg-[#FFFFFF] p-5 border border-[#7E7E7E]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm text-[#6D6D6D] font-medium">
                Inactivity Tracking
              </h2>
              <div className="flex items-center justify-between gap-x-2">
                <LeftNavigate className="text-[#0387FF]" />
                <p className="text-[#0387FF] text-xs font-normal">Events</p>
                <RightNavigate className="text-[#0387FF]" />
              </div>
            </div>
            <LineBarChart />
          </div>
          <div className="w-[540px] bg-[#FFFFFF] p-5 border border-[#7E7E7E]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm text-[#6D6D6D] font-medium">
                Target Tracking (Current week vs last week)
              </h2>
              <div className="flex items-center justify-between gap-x-2">
                <LeftNavigate className="text-[#0387FF]" />
                <p className="text-[#0387FF] text-xs font-normal">Replies</p>
                <RightNavigate className="text-[#0387FF]" />
              </div>
            </div>
            <WeeklyLineChart />
          </div>
          <div className="w-[540px] bg-[#FFFFFF] p-5 border border-[#7E7E7E]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base text-[#6D6D6D] font-medium">
                Campaign Across Users
              </h2>
              <div className="flex items-center justify-between gap-x-2">
                <LeftNavigate className="text-[#0387FF]" />
                <p className="text-[#0387FF] text-xs font-normal">
                  Users 5-10
                </p>
                <RightNavigate className="text-[#0387FF]" />
              </div>
            </div>
            <HorizontalBarChart data={campaigndata} />
          </div>
          <div className="w-[540px] bg-[#FFFFFF] p-5 border border-[#7E7E7E]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base text-[#6D6D6D] font-medium">
                Campaign Activity
              </h2>
              <div className="flex items-center justify-between gap-x-2">
                <LeftNavigate className="text-[#0387FF]" />
                <p className="text-[#0387FF] text-xs font-normal">
                  Campaigns 5-10
                </p>
                <RightNavigate className="text-[#0387FF]" />
              </div>
            </div>
            <HorizontalBarChart data={statsdata} />
          </div>
        </div>
        <div className="flex gap-3 mt-[48px] items-center justify-center">
          <button
            onClick={() => {
              setShowEmailStats(false);
            }}
            className={`font-urbanist px-3 py-1 text-[20px] font-medium cursor-pointer ${
              showEmailStats
                ? "text-[#6D6D6D] border border-[#6D6D6D] bg-transparent"
                : "text-[#FFFFFF] bg-[#6D6D6D]"
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
                ? "text-[#FFFFFF] bg-[#6D6D6D]"
                : "text-[#6D6D6D] border border-[#6D6D6D] bg-transparent"
            }`}
          >
            Email Stats
          </button>
        </div>
        <div className="flex items-center justify-between mt-[48px]">
          <p className="font-medium text-[28px] text-[#6D6D6D] font-urbanist">
            {showEmailStats ? "Email Stats" : "LinkedIn Stats"}
          </p>
          <div className="relative">
            <button
              onClick={toggleUsers}
              className="flex w-[223px] justify-between items-center border border-grey px-3 py-2 bg-white"
            >
              <div className="flex items-center gap-x-3">
                <AdminUsersIcon />
                <span className="text-[#7E7E7E] text-[12px]">{user}</span>
              </div>
              <DropArrowIcon className="w-3 h-3 ml-2" />
            </button>

            {showUsers && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-md z-10">
                {userOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                    onClick={() => handleUserSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
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
export default AgencyDashboard;
