import React, { useEffect, useRef, useState } from "react";
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
import VerticalBarChart from "./components/VerticalBarChart.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import { api } from "../../../services/api.js";
import { useAuthStore } from "../../stores/useAuthStore.js";
import { getAgencyUsers } from "../../../services/agency.js";
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
  const EMPTY_DATA = [];
  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split("T")[0];
  const dropdownRef = useRef(null);
  const dropdownRefUser = useRef(null);
  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEmailStats, setShowEmailStats] = useState(false);

  const [users, setUsers] = useState("All Users");
  const [showUsers, setShowUsers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleUserSelect = option => {
    setUsers(option);
    setShowUsers(false);
  };

  const toggleUsers = () => setShowUsers(!showUsers);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/agency");
        console.log(response);
        setUser(response.agency);
        console.log("[Dashboard] User data refreshed on page load");
      } catch (error) {
        console.error("[Dashboard] Failed to refresh user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const formattedDateRange = `${dateFrom} - ${dateTo}`;
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      if (
        dropdownRefUser.current &&
        !dropdownRefUser.current.contains(event.target)
      ) {
        setShowUsers(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowDatePicker, setShowUsers]);

  // ✅ Multi-select user dropdown with full "All Users" logic
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [appliedUserIds, setAppliedUserIds] = useState([]);

  const handleMultiUserSelect = value => {
    if (value === "all") {
      const allUserEmails = userOptions
        .filter(opt => opt.value !== "all")
        .map(opt => opt.value);

      if (selectedUsers.length === allUserEmails.length) {
        setSelectedUsers([]); // Unselect all
      } else {
        setSelectedUsers(allUserEmails); // Select all
      }
    } else {
      setSelectedUsers(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value],
      );
    }
  };

  const applyUserSelection = () => {
    setAppliedUserIds(selectedUsers); // Pass selected user emails (IDs)
    setShowUsers(false); // Close dropdown
  };

  useEffect(() => {
    const fetchAgencyUsers = async () => {
      try {
        const res = await getAgencyUsers();
        const users = res?.users || [];

        const options = [
          { label: "All Users", value: "all" },
          ...users.map(u => ({
            label: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
            value: u.email,
          })),
        ];

        setUserOptions(options);
      } catch (err) {
        console.error("Error fetching agency users:", err);
      }
    };

    fetchAgencyUsers();
  }, []);
  console.log("Selected User IDs before render:", appliedUserIds);
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
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDatePicker}
              className="flex w-[267px] justify-between items-center border border-grey  px-3 py-2 bg-white rounded-[6px] cursor-pointer"
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
            <LocationDistribution data={EMPTY_DATA} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* <div className="w-[540px] bg-[#FFFFFF] p-5 border border-[#7E7E7E] rounded-[8px] shadow-md">
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
          <div className="w-[540px] bg-[#FFFFFF] p-5 border border-[#7E7E7E] rounded-[8px] shadow-md">
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
          </div> */}
          <div className="w-[540px] bg-[#FFFFFF] p-5 border border-[#7E7E7E] rounded-[8px] shadow-md">
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
          <div className="w-[540px] bg-[#FFFFFF] p-5 border border-[#7E7E7E] rounded-[8px] shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base text-[#6D6D6D] font-medium">
                Campaign Activity
              </h2>
              <div className="flex items-center justify-between gap-x-2">
                <LeftNavigate className="text-[#0387FF]" />
                <p className="text-[#0387FF] text-xs font-normal">Users 1-5</p>
                <RightNavigate className="text-[#0387FF]" />
              </div>
            </div>
            <VerticalBarChart />
          </div>
        </div>

        <div className="flex items-center justify-end mt-[48px]">
          <div className="relative" ref={dropdownRefUser}>
            <button
              onClick={toggleUsers}
              className="flex w-[223px] justify-between items-center border border-[#7E7E7E] px-3 py-2 bg-white rounded-[6px] cursor-pointer"
            >
              <div className="flex items-center gap-x-3">
                <AdminUsersIcon />
                <span className="text-[#7E7E7E] text-[14px] truncate">
                  {selectedUsers.length === 0 ? (
                    "Select Users"
                  ) : selectedUsers.includes("All Users") ? (
                    "All Users"
                  ) : selectedUsers.length === 1 ? (
                    selectedUsers[0]
                  ) : (
                    <span>Multi Select</span>
                  )}
                </span>
              </div>
              <DropArrowIcon className="w-3 h-3 ml-2" />
            </button>
            {showUsers && (
              <div className="absolute right-0 mt-1 w-[223px] bg-white border border-[#7E7E7E] rounded-[6px] shadow-md z-10">
                <div className="max-h-[200px] overflow-y-auto">
                  {userOptions.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        checked={
                          option.value === "all"
                            ? selectedUsers.length ===
                              userOptions.filter(u => u.value !== "all").length
                            : selectedUsers.includes(option.value)
                        }
                        onChange={() => handleMultiUserSelect(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <div className="flex justify-end border-t border-gray-200 px-3 py-2">
                  <button
                    onClick={applyUserSelection}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <UserDashboard selectedUserIds={appliedUserIds} />
      </div>
    </>
  );
};
export default AgencyDashboard;
