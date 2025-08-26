import { useState } from "react";
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
    key: "fetch_profiles",
    title: "Follows",
    icon: FollowsIcon,
    tooltip: "Number of profiles followed.",
  },
  {
    key: "inmails_sent",
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
    key: "replies",
    title: "Replies",
    icon: RepliesIcon,
    tooltip: "Replies received.",
  },
  {
    key: "twitter_likes",
    title: "Twitter Likes",
    icon: Thumb,
    tooltip: "Likes on Twitter posts.",
  },
  {
    key: "post_likes",
    title: "Post Likes",
    icon: Like,
    tooltip: "Likes on posts.",
  },
  {
    key: "endorsement",
    title: "Endorsement",
    icon: Star,
    tooltip: "Received endorsements.",
  },
  {
    key: "email_messages",
    title: "Email Messages",
    icon: EmailIcon2,
    tooltip: "Messages sent via email.",
  },
];

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

  const { stats } = useEditContext();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState("Total");
  const [showFilters, setShowFilters] = useState(false);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const formattedDateRange = `${dateFrom} - ${dateTo}`;
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
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const row = { date: dateStr };

      metricConfig.forEach(({ key }) => {
        let dayValue = 0;
        const hourly = stats?.[key]?.hourly || {};
        for (const hour in hourly) {
          if (hour.startsWith(dateStr)) {
            dayValue += hourly[hour];
          }
        }
        row[key] = dayValue;
      });

      days.push(row);
    }

    return days;
  }
  const chartData = buildChartData(stats, metricConfig, dateFrom, dateTo);

  return (
    <div className="px-[30px] pt-[14px] pb-[155px]">
      <div className="flex flex-wrap items-center justify-end">
        <div className="flex items-center gap-2 mt-4 sm:mt-0 relative">
          <div className="relative">
            <button
              onClick={toggleDatePicker}
              className="flex w-[267px] h-[40px] justify-between items-center border border-grey  px-3 py-2 bg-white"
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
        {metricConfig?.map(({ key, title, icon, tooltip }) => {
          const metric = stats?.[key] ?? {};

          const hourlyData = metric?.hourly || {};
          const startCurrent = new Date(dateFrom);
          const endCurrent = new Date(dateTo);
          const diffTime = endCurrent - startCurrent;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const endPrev = new Date(startCurrent);
          endPrev.setDate(endPrev.getDate() - 1);
          const startPrev = new Date(endPrev);
          startPrev.setDate(startPrev.getDate() - diffDays + 1);

          const topValue = sumHourlyInRange(hourlyData, dateFrom, dateTo);
          const lowValue = sumHourlyInRange(
            hourlyData,
            startPrev.toISOString().slice(0, 10),
            endPrev.toISOString().slice(0, 10),
          );

          const diffPercent =
            lowValue > 0
              ? Math.round(((topValue - lowValue) / lowValue) * 100)
              : 0;

          const change =
            diffPercent > -1 ? `+${diffPercent}%` : `${diffPercent}%`;
          return (
            <div
              key={key}
              className="border border-[#7E7E7E] relative min-h-[166px] bg-[#ffffff]"
            >
              <PeriodCard
                title={title}
                Topvalue={topValue}
                Lowvalue={lowValue}
                change={change}
                icon={icon}
                bg="bg-[#ffffff]"
                type="campaigns"
              />
              <TooltipInfo
                text={tooltip}
                className="absolute bottom-2 right-2"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-[25px]">
        <MultiMetricChart type="campaigns" data={chartData} />
      </div>
      <div className="flex items-start justify-between mt-[50px]">
        <NodeTable />
        <div className="flex bg-[#FFFFFF] p-1 w-[174px] h-[31px] border border-[#7E7E7E]">
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
            className={`px-6 text-sm font-normal transition-colors duration-200 ease-in-out cursor-pointer
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
      </div>
    </div>
  );
};

export default Stats;
