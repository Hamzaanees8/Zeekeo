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

const ProfileViews = ({ data = [], max = 0 }) => {
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

  const todayStr = data.length > 0 ? data[data.length - 1].date : "";

  const last7Days = data.slice(-7).map(item => {
    const d = new Date(item.date + "T00:00:00Z");
    const dayIdx = d.getUTCDay();
    return {
      index: dayIdx,
      day: shortDays[dayIdx],
      messages: item.count,
      fullDay: fullDays[dayIdx],
      date: item.date,
    };
  });

  const todayValue = data.length > 0 ? data[data.length - 1].count : 0;
  const totalViews = data.reduce((sum, item) => sum + item.count, 0);

  const getBarFill = entry => {
    return entry.date === todayStr ? "#12D7A8" : "#03045E";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { messages, fullDay, date } = payload[0].payload;
      const color = date === todayStr ? "#12D7A8" : "#03045E";
      return (
        <div className="bg-white px-4 rounded-[6px] py-3 shadow min-w-[130px]">
          <div className="text-[#333] text-[10px] font-medium">
            Profile Views
          </div>
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
      <div className="text-[16px] text-[#1E1D1D] font-normal mb-2">
        Profile Views
      </div>

      <div className="flex justify-between">
        <div className="text-center mb-3 self-end w-[20%]">
          <div className="text-[12px] text-[#7E7E7E] leading-[150%]">Total</div>
          <div className="text-[36px] font-urbanist font-medium text-[#1E1D1D] leading-[130%]">
            {totalViews}
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
            <YAxis hide domain={[0, max]} allowDataOverflow={true} />
            <Tooltip cursor={{ fill: "transparent" }} content={<CustomTooltip />} />

            <Bar
              dataKey="messages"
              radius={[3, 3, 3, 3]}
              background={{ fill: "#EBEBEB", radius: [3, 3, 3, 3] }}
            >
              {last7Days.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarFill(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>



      </div>

      <TooltipInfo
        text="Shows number of profile views received each day."
        className="absolute right-2 bottom-2 justify-end"
      />
    </div>
  );
};

export default ProfileViews;
