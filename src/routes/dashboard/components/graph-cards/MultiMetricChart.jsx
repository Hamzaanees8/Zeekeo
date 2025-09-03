import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const METRICS = {
  linkedin_view: "#1D4E89",
  linkedin_invite: "#0F80AA",
  linkedin_invite_accepted: "#1A5B92",
  //  fetch_profiles: "#04A6C2",
  inmails_sent: "#20BAC5",
  linkedin_message: "#6D2160",
  replies: "#9C27B0",
  //twitter_likes: "#FF9800",
  post_likes: "#604CFF",
  endorsement: "#DED300",
  email_messages: "#FF5722",
};

const getMaxValue = (data, metrics) => {
  let max = 0;
  data.forEach(item => {
    Object.keys(metrics).forEach(metric => {
      if (item[metric] > max) {
        max = item[metric];
      }
    });
  });
  return max;
};

const buildYAxis = maxValue => {
  if (maxValue === 0) return { domain: [0, 10], ticks: [0, 2, 4, 6, 8, 10] };

  // round max to nearest “nice” number
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  let upperBound = Math.ceil(maxValue / magnitude) * magnitude;

  // safety buffer (if maxValue close to upperBound)
  if (upperBound <= maxValue) {
    upperBound += magnitude;
  }

  // if small numbers, keep nice ranges (like 20, 50)
  if (upperBound <= 20) {
    upperBound = 20;
  }

  // build tick steps → up to 6 ticks max
  const step = Math.ceil(upperBound / 5); // 5 steps = 6 ticks
  const ticks = [];
  for (let i = 0; i <= upperBound; i += step) {
    ticks.push(i);
  }

  return { domain: [0, upperBound], ticks };
};

const MultiMetricChart = ({ type, data = [] }) => {
  console.log("data..", data);
  const [visibleMetrics, setVisibleMetrics] = useState(Object.keys(METRICS));
  const [highlightedMetric, setHighlightedMetric] = useState(null);

  const maxValue = getMaxValue(data, METRICS);
  const { domain, ticks } = buildYAxis(maxValue);

  const toggleMetric = metric => {
    setVisibleMetrics(prev =>
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric],
    );
  };

  const isDimmed = metric => !visibleMetrics.includes(metric);
  const formatMetricName = name => {
    return name
      .replace(/_/g, " ") // replace underscores with spaces
      .replace(/\b\w/g, char => char.toUpperCase()); // capitalize first letter of each word
  };
  return (
    <div
      className={`${
        type === "campaigns" ? "bg-[#FFFFFF]" : "bg-[#F4F4F4]"
      } shadow-sm p-4 w-full h-full relative`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -30, bottom: 10 }}
          onClick={() => setHighlightedMetric(null)}
        >
          <defs>
            {Object.entries(METRICS).map(([key, color]) => (
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
            formatter={(value, name) => [
              value,
              name
                .replace(/_/g, " ")
                .replace(/\b\w/g, char => char.toUpperCase()),
            ]}
          />

          {Object.keys(METRICS).map(
            key =>
              (highlightedMetric === null || highlightedMetric === key) &&
              visibleMetrics.includes(key) && (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={METRICS[key]}
                  fill={`url(#gradient-${key})`}
                  strokeWidth={2}
                  dot={{
                    r: 2,
                    onClick: () => setHighlightedMetric(key),
                    cursor: "pointer",
                  }}
                  activeDot={{ r: 4 }}
                />
              ),
          )}
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap items-center gap-4 mt-2 text-[12px] text-gray-600 justify-center">
        {Object.entries(METRICS).map(([label, color]) => (
          <div
            key={label}
            onClick={() => toggleMetric(label)}
            className={`flex items-center cursor-pointer transition-opacity duration-200 text-[12px] text-[#454545] ${
              isDimmed(label) ? "opacity-40" : "opacity-100"
            }`}
          >
            <span
              className="w-4 h-4 border-[3px] rounded-full mr-2"
              style={{ borderColor: color }}
            ></span>
            {formatMetricName(label)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiMetricChart;
