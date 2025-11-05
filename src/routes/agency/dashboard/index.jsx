import { useEffect, useRef, useState } from "react";
import {
  CalenderIcon,
  DropArrowIcon,
  DownloadIcon,
  FilterIcon,
  LeftNavigate,
  RightNavigate,
  AdminUsersIcon,
  InvitesIcon,
  SequencesIcon,
  AcceptIcon,
  RepliesIcon,
  MeetingIcon,
  CampaignsIcon,
  CampaignsIcon1,
} from "../../../components/Icons.jsx";
import MultiMetricChart from "../../dashboard/components/graph-cards/MultiMetricChart.jsx";
import Table from "../components/Table.jsx";
import HorizontalBarChart from "./components/HorizontalBarChart.jsx";
import VerticalBarChart from "./components/VerticalBarChart.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import { api } from "../../../services/api.js";
import { useAuthStore } from "../../stores/useAuthStore.js";
import {
  getAgencyUsers,
  getCampaigns,
  getInsights,
} from "../../../services/agency.js";
import { metricConfig } from "../../../utils/stats-helper.js";
import NotificationsCard from "./components/NotificationCard.jsx";
import TwoLevelCircleCard from "../../dashboard/components/graph-cards/TwoLevelCircleCard.jsx";
import PeriodCard from "../../dashboard/components/PeriodCard.jsx";
import TooltipInfo from "../../dashboard/components/TooltipInfo.jsx";
const headers = ["User", "Campaigns", "Msgs.sent", "Accept %", "Reply %"];
const data = [
  {
    User: "Richard Lloyd",
    Campaigns: 5,
    "Msgs.sent": 450,
    Invites: 56,
    "Accept %": "32.8%",
    "Reply %": "4.56%",
  },
  {
    User: "Suresh",
    Campaigns: 6,
    "Msgs.sent": 480,
    Invites: 67,
    "Accept %": "32.8%",
    "Reply %": "4.56%",
  },
  {
    User: "Ahmed",
    Campaigns: 7,
    "Msgs.sent": 398,
    Invites: 32,
    "Accept %": "32.8%",
    "Reply %": "4.56%",
  },
];
const dummyNotifications = [
  {
    username: "Richard",
    message: "Server CPU usage is high.",
    status: "critical",
  },
  {
    username: "Ahmed",
    message: "New user signup: emma@example.com",
    status: "okay",
  },
  {
    username: "Suresh",
    message: "Memory usage is nearing capacity.",
    status: "warning",
  },
  {
    username: "Ahmed",
    message: "Security patch applied successfully.",
    status: "okay",
  },
  {
    username: "Suresh",
    message: "Database connection timeout detected.",
    status: "critical",
  },
];

const campaigndata = [
  {
    name: "Richard",
    Running: 3,
    Paused: 2,
    Fetching: 0,
    Failed: 0,
  },
  {
    name: "Ahmed",
    Running: 1,
    Paused: 7,
    Fetching: 1,
    Failed: 0,
  },
  {
    name: "Suresh",
    Running: 0,
    Paused: 12,
    Fetching: 0,
    Failed: 2,
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
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dateTo, setDateTo] = useState(todayStr);
  const [campaigns, setCampaigns] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEmailStats, setShowEmailStats] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const toggleUsers = () => setShowUsers(!showUsers);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const [campaignsData, setCampaignsData] = useState([]);

  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/agency");
        setUser(response.agency);
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

  const applyUserSelection = async () => {
    setAppliedUserIds(selectedUsers);
    setShowUsers(false);
    const response = await getCampaigns(selectedUsers);
    setCampaigns(response?.campaigns || []);
    console.log("Fetched campaigns:", response);
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
        const ids = users.map(u => u.email);
        setUserOptions(options);
        setUserIds(ids);
      } catch (err) {
        console.error("Error fetching agency users:", err);
      }
    };

    fetchAgencyUsers();
  }, []);

  useEffect(() => {
    if (!userIds.length) return; // Do nothing until userIds are available

    const fetchUserData = async () => {
      try {
        const response = await getCampaigns(userIds);
        setCampaignsData(response.campaigns || []);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      }
    };

    fetchUserData();
  }, [userIds]);

  console.log("campaigns data...", campaignsData);
  useEffect(() => {
    const fetchDashboardStats = async params => {
      const insights = await getInsights(params);
      setDashboardStats(insights);
    };

    const params = {
      userIds: userIds,
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["campaignsRunning", "unreadPositiveConversations", "actions"],
    };

    fetchDashboardStats(params);
  }, [dateFrom, dateTo, userIds]);
  useEffect(() => {
    if (dashboardStats?.actions) {
      buildChartData();
    }
  }, [dashboardStats]);
  console.log("date from", dateFrom);
  console.log("date to", dateTo);
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
  const parsedDateFrom = new Date(dateFrom);
  const parsedDateTo = new Date(dateTo);

  const campaignsThisPeriod = campaignsData.filter(campaign => {
    const createdAt = new Date(campaign.created_at);
    return createdAt >= parsedDateFrom && createdAt <= parsedDateTo;
  });
  const periodDuration = parsedDateTo.getTime() - parsedDateFrom.getTime();
  const prevDateFrom = new Date(parsedDateFrom.getTime() - periodDuration);
  const prevDateTo = new Date(parsedDateFrom.getTime() - 1);

  const campaignsLastPeriod = campaignsData.filter(campaign => {
    const createdAt = new Date(campaign.created_at);
    return createdAt >= prevDateFrom && createdAt <= prevDateTo;
  });
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
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Campaigns"
                Topvalue={campaignsThisPeriod.length}
                Lowvalue={campaignsLastPeriod.length}
                change={changePercentage(
                  campaignsThisPeriod.length,
                  campaignsLastPeriod.length,
                )}
                icon={CampaignsIcon1}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the number of Campaigns during the selected period, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Message Sent"
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
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the number of Message Sent during the selected period, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Reply Rate (avg)"
                Topvalue={Math.ceil(
                  dashboardStats?.actions?.thisPeriod?.linkedin_message_reply
                    ?.total / (userIds?.length || 1),
                )}
                Lowvalue={Math.ceil(
                  dashboardStats?.actions?.lastPeriod?.linkedin_message_reply
                    ?.total / (userIds?.length || 1),
                )}
                change={changePercentage(
                  Math.ceil(
                    dashboardStats?.actions?.thisPeriod?.linkedin_message_reply
                      ?.total / (userIds?.length || 1),
                  ),
                  Math.ceil(
                    dashboardStats?.actions?.lastPeriod?.linkedin_message_reply
                      ?.total / (userIds?.length || 1),
                  ),
                )}
                icon={RepliesIcon}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the average number of Replies during the selected period during, compared with the previous period. It helps you track outreach activity and consistency."
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
                text="This shows the average number of Invites sent during the selected period during, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Invites Accept (avg)"
                Topvalue={Math.ceil(
                  dashboardStats?.actions?.thisPeriod?.linkedin_invite_accepted
                    ?.total / (userIds?.length || 1),
                )}
                Lowvalue={Math.ceil(
                  dashboardStats?.actions?.lastPeriod?.linkedin_invite_accepted
                    ?.total / (userIds?.length || 1),
                )}
                change={changePercentage(
                  Math.ceil(
                    dashboardStats?.actions?.thisPeriod
                      ?.linkedin_invite_accepted?.total /
                      (userIds?.length || 1),
                  ),
                  Math.ceil(
                    dashboardStats?.actions?.lastPeriod
                      ?.linkedin_invite_accepted?.total /
                      (userIds?.length || 1),
                  ),
                )}
                icon={AcceptIcon}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the average number of Invites sent during the selected period during, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-white rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Meetings"
                Topvalue={
                  dashboardStats?.actions?.thisPeriod
                    ?.conversation_sentiment_meeting_booked?.total
                }
                Lowvalue={
                  dashboardStats?.actions?.lastPeriod
                    ?.conversation_sentiment_meeting_booked?.total
                }
                change={changePercentage(
                  dashboardStats?.actions?.thisPeriod
                    ?.conversation_sentiment_meeting_booked?.total,
                  dashboardStats?.actions?.lastPeriod
                    ?.conversation_sentiment_meeting_booked?.total,
                )}
                icon={MeetingIcon}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the number of Meetings Booked during the selected period, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
          </div>
        </div>
        <div className="mt-[48px]">
          <MultiMetricChart data={chartData} />
        </div>
        <div className="mt-[48px] grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <NotificationsCard notifications={dummyNotifications} />
          </div>
          <div className="col-span-3 flex flex-col gap-y-4 bg-white border border-[#7E7E7E] rounded-[8px] shadow-md p-4">
            <div className="flex items-center justify-between px-2">
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
                  Displaying 3 of 3 Users
                </p>
                <div className="cursor-pointer">
                  <RightNavigate className="text-[#6D6D6D]" />
                </div>
              </div>
            </div>
            <Table headers={headers} data={data} rowsPerPage="all" />
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
          <div className="w-full bg-[#FFFFFF] p-5 border border-[#7E7E7E] rounded-[8px] shadow-md">
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
          <div className="w-full bg-[#FFFFFF] p-5 border border-[#7E7E7E] rounded-[8px] shadow-md">
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

        <div className="flex items-center justify-between my-[48px]">
          <h1 className="text-[48px] font-urbanist text-grey-medium font-medium ">
            User Insights
          </h1>
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
              <div className="absolute right-0 mt-1 w-[223px] bg-white border border-[#7E7E7E] rounded-[6px] shadow-md z-10 overflow-hidden">
                <div className="max-h-[200px] overflow-y-auto">
                  {userOptions.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 px-4 py-[6px] hover:bg-gray-100 cursor-pointer text-sm text-[#7E7E7E]"
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
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {appliedUserIds.length > 0 ? (
          <UserDashboard
            campaigns={campaigns}
            selectedUsers={appliedUserIds}
          />
        ) : (
          <p className="text-gray-500 text-center text-[20px]">
            No users selected
          </p>
        )}
      </div>
    </>
  );
};
export default AgencyDashboard;
