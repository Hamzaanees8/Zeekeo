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
import { generateDateRange } from "../../../../utils/stats-helper";

const COLORS = {
  views: "#04479C",
};

// Normalize API data → always include all dates
function normalizeViewsData(views = [], fromDate, toDate) {
  const dateRange = generateDateRange(fromDate, toDate);
  const viewsMap = views.reduce((acc, item) => {
    acc[item.date] = item.views;
    return acc;
  }, {});
  return dateRange.map(date => ({
    date,
    views: viewsMap[date] || 0,
  }));
}

// Compute dynamic Y axis domain and ticks
function buildYAxis(data) {
  const maxValue = Math.max(...data.map(d => d.views), 0);
  if (maxValue === 0) return { domain: [0, 10], ticks: [0, 2, 4, 6, 8, 10] };

  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  let upperBound = Math.ceil(maxValue / magnitude) * magnitude;

  if (upperBound <= maxValue) {
    upperBound += magnitude;
  }
  if (upperBound <= 20) {
    upperBound = 20;
  }

  const step = Math.ceil(upperBound / 5);
  const ticks = [];
  for (let i = 0; i <= upperBound; i += step) {
    ticks.push(i);
  }

  return { domain: [0, upperBound], ticks };
}

const ProfileViews = ({ views, dateFrom, dateTo, tooltipText }) => {
  const chartData = normalizeViewsData(views, dateFrom, dateTo);
  const { domain, ticks } = buildYAxis(chartData);

  return (
    <div className="bg-[#FFFFFF] shadow-md p-4 w-full relative rounded-[8px]">
      <div className="flex mb-2 justify-between items-center">
        <div className="text-[16px] text-[#1E1D1D]">Profile Views</div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 0, left: -30, bottom: 10 }}
        >
          {/* ✅ Only horizontal grid lines, no vertical */}
          <CartesianGrid vertical={false} horizontal={true} stroke="#BDBDBD" />

          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666"
          />
          <YAxis
            domain={domain}
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666"
          />
          <Tooltip />

          <defs>
            <linearGradient id="gradient-views" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.views} stopOpacity={0.4} />
              <stop offset="90%" stopColor={COLORS.views} stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="views"
            stroke={COLORS.views}
            fill="url(#gradient-views)"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <TooltipInfo text={tooltipText} className="absolute right-2 bottom-2" />
    </div>
  );
};

export default ProfileViews;
