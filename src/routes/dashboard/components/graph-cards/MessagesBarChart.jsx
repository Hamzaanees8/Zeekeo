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

const data = [
  { day: "Sun", messages: 20 },
  { day: "Mon", messages: 49 },
  { day: "Tues", messages: 40 },
  { day: "Wed", messages: 45 },
  { day: "Thurs", messages: 38 },
  { day: "Frid", messages: 55 },
  { day: "Sat", messages: 22 },
];

// ✅ Custom Tooltip Component (your desired style)
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.[0]) {
    const { day, messages } = payload[0].payload;
    const color = messages > 49 ? "#20BAC5" : "#1A5B92";
    return (
      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-[10px] shadow">
        <div className="text-[20px] font-semibold flex justify-center items-center gap-2">
          <span style={{ color }}>{messages}</span>
          <span className="text-[#636D79] text-[12px] font-normal">
            Messages
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const MessagesBarChart = () => {
  return (
    <div className="bg-[#F4F4F4] p-4 w-full relative shadow-md h-full rounded-[8px]">
      <div className="text-[16px] text-[#1E1D1D] mb-0">Messages Sent</div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={28}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#333", fontSize: 12 }}
          />
          <YAxis hide domain={[0, 60]} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={<CustomTooltip />}
          />
          <Bar dataKey="messages" radius={[3, 3, 3, 3]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.messages > 49 ? "#20BAC5" : "#1A5B92"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <TooltipInfo
        text="Shows number of messages sent each day."
        className="absolute right-2 bottom-2 justify-end"
      />
    </div>
  );
};

export default MessagesBarChart;
