import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import TooltipInfo from "../TooltipInfo";

const Invites = ({ data = [], max = 100 }) => {
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

  const getBarFill = entry => (entry.date === todayStr ? "#12D7A8" : "#04479C");

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

  return (
    <div className="bg-[#FFFFFF] p-4 w-full relative h-full rounded-[8px] shadow-md">
      <div className="text-[16px] text-[#1E1D1D] font-normal mb-2">Invites</div>

      <div className="flex justify-between">
        <div className="text-center mb-3 self-end w-[20%]">
          <div className="text-[12px] text-[#7E7E7E] leading-[150%]">Today</div>
          <div className="text-[36px] font-urbanist font-medium text-[#1E1D1D] leading-[130%]">
            {todayValue}
          </div>
          <div className="text-[12px] text-[#7E7E7E] leading-[150%]">Max: {max}</div>
        </div>

        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={last7Days} barSize={28}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#333", fontSize: 12 }}
            />
            <YAxis hide domain={[0, max || 1]} />
            <Tooltip cursor={{ fill: "transparent" }} content={<CustomTooltip />} />
            <Bar dataKey="messages" radius={[3, 3, 3, 3]}>
              {last7Days.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarFill(entry)} />
              ))}
            </Bar>
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
