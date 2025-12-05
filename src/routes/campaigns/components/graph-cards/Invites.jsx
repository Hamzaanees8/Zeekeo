import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import TooltipInfo from "../TooltipInfo";
import { PlayIcon } from "../../../../components/Icons";

const Invites = ({ data = [], max = 100, pausedBadge = false, pausedTimestamp = null }) => {
  const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  console.log("invitedata", data);

  const formatPauseTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    // Get timezone abbreviation
    const timezone = date.toLocaleTimeString('en-us', {timeZoneName:'short'}).split(' ')[2];
    
    return `${day}/${month}/${year} at ${hours}:${minutes} ${timezone}`;
  };

  const getPauseTooltipText = () => {
    const formattedDate = formatPauseTimestamp(pausedTimestamp);
    return `Paused on ${formattedDate}. Your invites have been paused by LinkedIn at the date and time shown. Launchpad will retry sending invites 2 hours after the pause. This indicates that a pause has occurred, even if you do not see any change in your activity.`;
  };

  // last 7 days from data
  const last7Days = data.slice(-7).map(item => {
    const d = new Date(item.date + "T00:00:00Z");
    const dayIdx = d.getUTCDay();
    return {
      day: shortDays[dayIdx],
      fullDay: fullDays[dayIdx],
      messages: item.count,
      date: item.date,
    };
  });

  const todayStr = data.length > 0 ? data[data.length - 1].date : "";
  const todayValue = data.length > 0 ? data[data.length - 1].count : 0;
  const totalInvites = data.reduce((sum, item) => sum + item.count, 0);

  const getBarFill = entry =>
    entry.date === todayStr ? "#12D7A8" : "#04479C";

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { messages, fullDay, date } = payload[0].payload;
      const color = date === todayStr ? "#12D7A8" : "#04479C";
      return (
        <div className="bg-white px-4 rounded-[6px] py-3 shadow min-w-[130px]">
          <div className="text-[#333] text-[10px] font-medium">Invites</div>
          <div className="flex justify-between items-center text-[10px] mt-1">
            <div className="text-[18px] font-semibold" style={{ color }}>
              {messages}
            </div>
            <div className="text-right">
              <div className="text-[#636D79] text-[10px]">{fullDay}</div>
              <div className="text-[#636D79] text-[10px]">
                {new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  const maxValue = Math.max(...last7Days.map(d => d.messages), max);
  const adjustedMax = maxValue > max ? maxValue : max;
  const maxLineValue = maxValue > max ? max * (adjustedMax / maxValue) : max;

  return (
    <div className="bg-[#FFFFFF] p-4 w-full relative h-full rounded-[8px] shadow-md">
      <div className="flex items-start justify-between">
        <div className="text-[16px] text-[#1E1D1D] font-normal mb-4">
          Invites
        </div>
        {pausedBadge && (
          <div className="relative inline-block ml-2 group">
            <button className="rounded-full p-[2px] bg-[#FFFFFF] border border-[#7E7E7E] cursor-pointer">
              <PlayIcon className="w-4 h-4 fill-[#f61d00]" />
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 w-[300px] bg-[#f61d00] text-[#FFFFFF] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {pausedTimestamp ? getPauseTooltipText() : "Invites are paused by LinkedIn"}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <div className="text-center mb-3 self-end w-[20%]">
          <div className="text-[12px] text-[#7E7E7E] leading-[150%]">
            Total
          </div>
          <div className="text-[36px] font-urbanist font-medium text-[#1E1D1D] leading-[130%]">
            {totalInvites}
          </div>
          <div className="text-[12px] text-[#7E7E7E] leading-[150%]">
            Max: {max}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={last7Days} barSize={28}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#333", fontSize: 12 }}
            />
            {/* <YAxis hide domain={[0, max]} allowDataOverflow={true} /> */}
            <YAxis hide domain={[0, adjustedMax]} />

            <Tooltip
              cursor={{ fill: "transparent" }}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="messages"
              background={{ fill: "#EBEBEB", radius: [3, 3, 3, 3] }}
              radius={[3, 3, 3, 3]}
            >
              {last7Days.map((entry, index) => (
                <Cell key={index} fill={getBarFill(entry)} />
              ))}
            </Bar>

            <ReferenceLine
              y={maxLineValue}
              stroke="#FF4D4D"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <TooltipInfo
        text="Shows number of invites sent each day."
        className="absolute right-2 bottom-2 justify-end"
      />
    </div>
  );
};

export default Invites;
