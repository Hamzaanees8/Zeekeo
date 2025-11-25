import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const METRICS = [
  { key: "linkedin_view", label: "Views", color: "#4F46E5" },
  { key: "linkedin_invite", label: "Invites", color: "#0F80AA" },
  {
    key: "linkedin_invite_accepted",
    label: "Invites Accepted",
    color: "#1A5B92",
  },
  { key: "linkedin_inmail", label: "InMails", color: "#20BAC5" },
  { key: "linkedin_message", label: "LinkedIn Messages", color: "#290a24ff" },
  { key: "linkedin_invite_reply", label: "Replies", color: "#b115eeff" },
  { key: "linkedin_like_post", label: "Post Likes", color: "#FF9800" },
  { key: "email_message", label: "Email Messages", color: "#FF5722" },
  { key: "linkedin_endorse", label: "Endorsements", color: "#DED300" },
  { key: "linkedin_follow", label: "Follows", color: "#10B981" },
];

// Compute max value dynamically
const getMaxValue = (data, metrics) => {
  let max = 0;
  data.forEach(item => {
    metrics.forEach(({ key }) => {
      if (item[key] > max) {
        max = item[key];
      }
    });
  });
  return max;
};

// Build a dynamic Y-axis
const buildYAxis = maxValue => {
  if (maxValue === 0) return { domain: [0, 10], ticks: [0, 2, 4, 6, 8, 10] };

  // Add 10-20% padding instead of doubling the range
  const padding = Math.max(1, Math.ceil(maxValue * 0.1)); // At least 1 unit padding
  const upperBound = Math.ceil((maxValue + padding) / 10) * 10;

  const step = Math.ceil(upperBound / 5);
  const ticks = [];
  for (let i = 0; i <= upperBound; i += step) {
    ticks.push(i);
  }
  return { domain: [0, upperBound], ticks };
};

const MultiMetricChart = ({ data = [] }) => {
  const [visibleMetrics, setVisibleMetrics] = useState(
    METRICS.map(m => m.key),
  );
  const [highlightedMetric, setHighlightedMetric] = useState(null);

  const maxValue = useMemo(() => getMaxValue(data, METRICS), [data]);
  const { domain, ticks } = useMemo(() => buildYAxis(maxValue), [maxValue]);

  const toggleMetric = key => {
    setVisibleMetrics(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key],
    );
  };

  const isDimmed = key => !visibleMetrics.includes(key);

  const allDates = data.map(d => d.date);
  const firstDate = allDates[0];
  const lastDate = allDates[allDates.length - 1];
  const tickCount = Math.min(10, allDates.length);
  const interval = Math.floor(allDates.length / tickCount);
  const regularTicks = allDates.filter((_, i) => i % interval === 0);
  const xTicks = Array.from(new Set([firstDate, ...regularTicks, lastDate]));

  return (
    <div className="shadow-md p-4 w-full h-full relative rounded-[8px] bg-[#FFFFFF] border border-[#7E7E7E]">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: -30, bottom: 10 }}
          onClick={() => setHighlightedMetric(null)}
        >
          {/* Define Gradients */}
          <defs>
            {METRICS.map(({ key, color }) => (
              <linearGradient
                key={key}
                id={`gradient-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="90%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid vertical={false} horizontal={true} stroke="#BDBDBD" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666"
            ticks={xTicks}
          />
          <YAxis
            domain={domain}
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666"
          />
          <Tooltip
            wrapperStyle={{ top: -20 }}
            formatter={(value, name) => {
              const metric = METRICS.find(m => m.key === name);
              return [value, metric?.label || name];
            }}
          />

          {/* Chart Lines */}
          {METRICS.map(({ key, color }) => {
            const isVisible = visibleMetrics.includes(key);
            const isHighlighted =
              highlightedMetric === null || highlightedMetric === key;
            const shouldShow = isVisible && isHighlighted;

            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                fill={`url(#gradient-${key})`}
                strokeWidth={2}
                dot={{
                  r: 2,
                  onClick: () => setHighlightedMetric(key),
                  cursor: "pointer",
                }}
                activeDot={{ r: 4 }}
                hide={!shouldShow}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-2 text-[12px] text-[#454545] justify-center">
        {METRICS.map(({ key, label, color }) => (
          <div
            key={key}
            onClick={() => toggleMetric(key)}
            className={`flex items-center cursor-pointer transition-opacity duration-200 text-[12px] text-[#454545] ${
              isDimmed(key) ? "opacity-40" : "opacity-100"
            }`}
          >
            <span
              className="w-4 h-4 border-[3px] rounded-full mr-2"
              style={{ borderColor: color }}
            ></span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiMetricChart;
