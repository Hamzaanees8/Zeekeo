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


const PERIOD_COLORS = {
  thisPeriod: "#1D4E89", // dark blue
  lastPeriod: "#0F80AA", // lighter blue
};

const ComparisonChart = ({ data }) => {
  const [visibleMetrics, setVisibleMetrics] = useState(Object.keys(PERIOD_COLORS));
  const [highlightedMetric, setHighlightedMetric] = useState(null);

  const toggleMetric = metric => {
    setVisibleMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric],
    );
  };

  const isDimmed = metric => !visibleMetrics.includes(metric);
  const formatMetricName = name =>
    name === "thisPeriod" ? "This Period" : "Last Period";

  return (
    <div className="shadow-md p-4 w-full h-full relative rounded-[8px] bg-white">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -30, bottom: 10 }}
          onClick={() => setHighlightedMetric(null)}
        >
          <defs>
            {Object.entries(PERIOD_COLORS).map(([key, color]) => (
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

          <CartesianGrid vertical={false} horizontal stroke="#BDBDBD" />
          <XAxis
            dataKey="metric"
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
          />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === "thisPeriod" ? "This Period" : "Last Period",
            ]}
          />

          {Object.keys(PERIOD_COLORS).map(
            key =>
              (highlightedMetric === null || highlightedMetric === key) &&
              visibleMetrics.includes(key) && (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={PERIOD_COLORS[key]}
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

      {/* Legend with toggle */}
      <div className="flex flex-wrap items-center gap-4 mt-2 text-[12px] text-gray-600 justify-center">
        {Object.entries(PERIOD_COLORS).map(([label, color]) => (
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

export default ComparisonChart;
