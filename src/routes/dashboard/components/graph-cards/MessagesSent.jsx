import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TooltipInfo from "../TooltipInfo";

const data = [
  { day: "Sun", Sequences: 10, InMail: 55, Connections: 25 },
  { day: "Mon", Sequences: 20, InMail: 20, Connections: 30 },
  { day: "Tues", Sequences: 10, InMail: 30, Connections: 20 },
  { day: "Wed", Sequences: 70, InMail: 40, Connections: 10 },
  { day: "Thur", Sequences: 35, InMail: 30, Connections: 15 },
  { day: "Fri", Sequences: 20, InMail: 25, Connections: 35 },
  { day: "Sat", Sequences: 10, InMail: 40, Connections: 50 },
];

const COLORS = {
  Sequences: "#389D80",
  InMail: "#1D4E89",
  Connections: "#2AF1FF",
};

const MessagesSent = () => {
  return (
    <div className="bg-[#F4F4F4] shadow-md p-4 w-full relative h-full rounded-[8px]">
      <div className="text-[16px] text-[#1E1D1D] mb-2">Messages Sent</div>

      <ResponsiveContainer width="100%" height={130}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#ccc"
          />
          <XAxis
            dataKey="day"
            fontSize={10}
            stroke="#666"
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis hide domain={[0, 60]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />

          {Object.entries(COLORS).map(([key, color]) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] text-grey">
        {Object.entries(COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center">
            <span
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: color }}
            ></span>
            {label}
          </div>
        ))}
        <TooltipInfo
          text="This shows the percentage of responses received via different outreach types."
          className="absolute right-2 bottom-2 justify-end"
        />
      </div>
    </div>
  );
};

export default MessagesSent;
