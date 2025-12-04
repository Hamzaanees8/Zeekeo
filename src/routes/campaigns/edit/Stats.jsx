import { useState, useEffect } from "react";
import {
  AcceptIcon,
  CalenderIcon,
  DownloadIcon,
  DropArrowIcon,
  EmailIcon2,
  FilterIcon,
  FollowsIcon,
  InMailsIcon,
  InvitesIcon,
  Like,
  MessageIcon,
  RepliesIcon,
  Star,
  Thumb,
  ViewIcon,
} from "../../../components/Icons";
import TooltipInfo from "../../../components/TooltipInfo";
import NodeTable from "./Components/NodeTable";
import PeriodCard from "../../dashboard/components/PeriodCard";
import MultiMetricChart from "../../dashboard/components/graph-cards/MultiMetricChart";
import { useEditContext } from "./Context/EditContext";
import { getCampaignStats } from "../../../services/campaigns";

const metricConfig = [
  {
    key: "linkedin_view",
    title: "Views",
    icon: ViewIcon,
    tooltip: "This is the number of LinkedIn views.",
  },
  {
    key: "linkedin_invite",
    title: "Invites",
    icon: InvitesIcon,
    tooltip: "Number of invites sent.",
  },
  {
    key: "linkedin_invite_accepted",
    title: "Accepted",
    icon: AcceptIcon,
    tooltip: "Invites that were accepted.",
  },
  {
    key: "linkedin_follow",
    title: "Follows",
    icon: FollowsIcon,
    tooltip: "Number of profiles followed.",
  },
  {
    key: "linkedin_inmail",
    title: "InMails",
    icon: InMailsIcon,
    tooltip: "Number of InMails sent.",
  },
  {
    key: "linkedin_message",
    title: "LinkedIn Messages",
    icon: MessageIcon,
    tooltip: "Messages sent via LinkedIn.",
  },
  {
    key: "linkedin_reply",
    title: "Replies",
    icon: RepliesIcon,
    tooltip: "Replies received.",
  },
  {
    key: "linkedin_like_post",
    title: "Post Likes",
    icon: Like,
    tooltip: "Likes on posts.",
  },
  {
    key: "linkedin_endorse",
    title: "Endorsement",
    icon: Star,
    tooltip: "Received endorsements.",
  },
  {
    key: "email_message",
    title: "Email Messages",
    icon: EmailIcon2,
    tooltip: "Messages sent via email.",
  },
];

function getPreviousPeriod(dateFrom, dateTo) {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);

  // number of days in current range
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // previous period ends 1 day before current start
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  // previous period start = prevEnd - (diffDays - 1)
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - diffDays + 1);

  return {
    prevFrom: prevStart.toISOString().slice(0, 10),
    prevTo: prevEnd.toISOString().slice(0, 10),
  };
}

// Utility to get value depending on tab
const getStatValue = (statObj, mode = "Total") => {
  if (!statObj) return 0;

  if (mode === "Total") {
    return statObj.total ?? 0;
  }

  if (mode === "24h") {
    const now = new Date();
    const cutoff = now.getTime() - 24 * 60 * 60 * 1000;

    return Object.entries(statObj.hourly || {}).reduce(
      (sum, [dateHour, val]) => {
        const [year, month, day, hour] = dateHour.split("-").map(Number);
        const statDate = new Date(year, month - 1, day, hour).getTime();
        console.log("log datetime..", statDate);
        return statDate >= cutoff ? sum + val : sum;
      },
      0,
    );
  }

  return 0;
};

const getDailyStatValue = (statObj, statDate) => {
  if (!statObj) return 0;
  // console.log(statDate, statObj);
  return Object.entries(statObj.hourly || {}).reduce(
    (sum, [dateHour, val]) => {
      console.log(dateHour, statDate, val);
      if (dateHour.startsWith(statDate)) {
        return sum + val;
      }
      return sum;
    },
    0,
  );
};

// Build array of normalized stats
const buildPeriodStats = (stats, activeTab) => {
  if (!stats?.current) return [];

  return metricConfig.map(({ key, title, icon, tooltip }) => {
    const currentStat = stats.current?.[key];
    const prevStat = stats.previous?.[key];

    const currentValue = getStatValue(currentStat, activeTab);
    const prevValue = getStatValue(prevStat, activeTab);

    const diffPercent =
      prevValue > 0
        ? Math.round(((currentValue - prevValue) / prevValue) * 100)
        : 0;

    const change = diffPercent >= 0 ? `+${diffPercent}%` : `${diffPercent}%`;

    return {
      title,
      value: currentValue,
      tooltip,
      icon,
      lowValue: prevValue,
      change,
    };
  });
};

const Stats = () => {
  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // format YYYY-MM-DD

  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const { editId } = useEditContext();
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState("Total");
  const [showFilters, setShowFilters] = useState(false);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const formattedDateRange = `${dateFrom} - ${dateTo}`;

  useEffect(() => {
    if (editId) {
      const fetchCampaignStats = async () => {
        const currentStats = await getCampaignStats({
          campaignId: editId,
          startDate: dateFrom,
          endDate: dateTo,
        });

        const { prevFrom, prevTo } = getPreviousPeriod(dateFrom, dateTo);

        const prevStats = await getCampaignStats({
          campaignId: editId,
          startDate: prevFrom,
          endDate: prevTo,
        });

        setStats({ current: currentStats, previous: prevStats });

        const dailyStatData = buildChartData(
          currentStats,
          metricConfig,
          dateFrom,
          dateTo,
        );
        setChartData(dailyStatData);
      };

      fetchCampaignStats();
    }
  }, [dateFrom, dateTo]);

  function sumHourlyInRange(hourlyData, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let sum = 0;
    for (const key in hourlyData) {
      const dateStr = key.substring(0, 10);
      const date = new Date(dateStr);

      if (date >= start && date <= end) {
        sum += hourlyData[key];
      }
    }
    return sum;
  }

  function buildChartData(stats, metricConfig, dateFrom, dateTo) {
    //console.log(stats);

    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const row = { date: dateStr };
      //console.log(dateStr);

      metricConfig.forEach(({ key }) => {
        row[key] = getDailyStatValue(stats?.[key], dateStr);
      });
      console.log(row);
      days.push(row);
    }

    return days;
  }

  return (
    <div className="px-[30px] pt-[14px] pb-[155px]">
      <div className="flex flex-wrap items-center justify-end">
        <div className="flex items-center gap-2 mt-4 sm:mt-0 relative">
          <div className="relative">
            <button
              onClick={toggleDatePicker}
              className="flex w-[267px] h-[40px] justify-between items-center border border-grey  px-3 py-2 bg-white rounded-[4px]"
            >
              <CalenderIcon className="w-5 h-5 mr-2" />
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
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className="w-[40px] h-[40px] border border-grey-400 rounded-full flex items-center justify-center bg-white cursor-pointer">
            <DownloadIcon className="w-5 h-[18px]" />
          </button>
          <div className="relative">
            <button
              onClick={toggleFilters}
              className="w-[40px] h-[40px] border border-grey-400 rounded-full flex items-center justify-center bg-white cursor-pointer"
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
      <div className="mt-5 grid grid-cols-6 gap-5">
        {buildPeriodStats(stats, activeTab).map((stat, idx) => (
          <div
            key={`${editId}-${stat.title}`}
            className="border border-[#7E7E7E] relative min-h-[166px] bg-[#ffffff] rounded-[8px] shadow-md"
          >
            <PeriodCard
              title={stat.title}
              Topvalue={stat.value}
              Lowvalue={stat.lowValue}
              change={stat.change}
              icon={stat.icon}
              bg="bg-[#ffffff]"
              type="campaigns"
            />
            <TooltipInfo
              text={stat.tooltip}
              className="absolute bottom-2 right-2"
            />
          </div>
        ))}
      </div>

      <div className="mt-[25px]">
        <MultiMetricChart type="campaigns" data={chartData} />
      </div>
      {/* <div className="flex items-start justify-between mt-[50px]">
        <NodeTable
          activeTab={activeTab}
          getStats={getStatValue}
          stats={stats?.current}
        />
        <div className="flex bg-[#FFFFFF] p-1 w-[auto] h-[31px] border border-[#7E7E7E] rounded-[4px]">
          {" "}
          <button
            className={`px-6 text-sm font-normal transition-colors duration-200 ease-in-out cursor-pointer
          ${
            activeTab === "Daily"
              ? "bg-[#0387ff] text-white"
              : "bg-transparent text-[#7E7E7E] hover:text-gray-600"
          }
        `}
            onClick={() => setActiveTab("Daily")}
          >
            Daily
          </button>
          <button
            className={`px-6 text-sm font-normal transition-colors duration-200 ease-in-out cursor-pointer rounded-[4px]
          ${
            activeTab === "Total"
              ? "bg-[#0387ff] text-white"
              : "bg-transparent text-[#7E7E7E]"
          }
        `}
            onClick={() => setActiveTab("Total")}
          >
            Total
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default Stats;
