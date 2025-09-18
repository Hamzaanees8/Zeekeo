import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TooltipInfo from "../TooltipInfo";

const data = [
  { date: "2025-03-23", thisPeriod: 0, lastPeriod: 60 },
  { date: "2025-03-24", thisPeriod: 60, lastPeriod: 30 },
  { date: "2025-03-25", thisPeriod: 20, lastPeriod: 60 },
  { date: "2025-03-26", thisPeriod: 50, lastPeriod: 70 },
  { date: "2025-03-27", thisPeriod: 60, lastPeriod: 20 },
  { date: "2025-03-28", thisPeriod: 35, lastPeriod: 60 },
  { date: "2025-03-29", thisPeriod: 60, lastPeriod: 35 },
  { date: "2025-03-30", thisPeriod: 50, lastPeriod: 60 },
  { date: "2025-03-31", thisPeriod: 50, lastPeriod: 25 },
];

const COLORS = {
  thisPeriod: "#04479C",
  lastPeriod: "#0096C7",
};

const ProfileViews = () => {
  return (
    <div className="bg-[#FFFFFF] shadow-md p-4 w-full relative rounded-[8px]">
      <div className="flex mb-2 justify-between items-center">
        <div className="text-[16px] text-[#1E1D1D] ">Profile Views</div>
        <div className="flex flex-col items-center text-[12px] text-grey">
          <div className="flex items-center">
            <span
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: COLORS.thisPeriod }}
            ></span>
            This Period
          </div>
          <div className="flex items-center">
            <span
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: COLORS.lastPeriod }}
            ></span>
            Last Period
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#E5E5E5" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666"
            domain={[0, 60]}
            ticks={[0, 20, 40, 60, 80]}
          />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="lastPeriod"
            stroke={COLORS.lastPeriod}
            fill={COLORS.lastPeriod}
            fillOpacity={0.3}
            strokeWidth={0}
            dot={{ r: 0 }}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="thisPeriod"
            stroke={COLORS.thisPeriod}
            fill={COLORS.thisPeriod}
            fillOpacity={0.5}
            strokeWidth={0}
            dot={{ r: 0 }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <TooltipInfo
        text="This shows the percentage of responses received via different outreach types."
        className="absolute right-2 bottom-2"
      />
    </div>
  );
};

export default ProfileViews;
