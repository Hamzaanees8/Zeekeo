import React from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const HorizontalBarChart = ({ data }) => {
  const colors = ["#26A69A", "#1E88E5", "#00E5FF", "#cd0b0b"];
  const safeData = Array.isArray(data) ? data : [];

  // Dynamically extract campaign names (all keys except "name")
  const campaignNames =
    safeData.length > 0
      ? Object.keys(safeData[0]).filter(key => key !== "name")
      : [];

  if (safeData.length === 0) {
    return (
      <div className="text-center text-base font-normal text-[#6D6D6D] mt-10">
        No data available
      </div>
    );
  }

  // Function to determine if a bar segment is the last visible one for a specific data point
  const isLastVisibleSegment = (dataPoint, currentKey) => {
    const keys = campaignNames;
    let currentIndex = keys.indexOf(currentKey);

    // Check all subsequent keys to see if they have values
    for (let i = currentIndex + 1; i < keys.length; i++) {
      if (dataPoint[keys[i]] && dataPoint[keys[i]] > 0) {
        return false; // There's a subsequent bar with value
      }
    }
    return true; // This is the last bar with value
  };

  const barHeight = 22;
  const gap = 16;
  const chartHeight = data.length * (barHeight + gap) + 60;

  return (
    <div>
      {/* Custom legend */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {campaignNames.map((label, i) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-xs font-normal text-[#454545]">{label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={data}
          barSize={barHeight}
          barCategoryGap={`${gap}px`}
          margin={{ top: 0, right: 20, left: -30, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            width={170}
            tick={({ x, y, payload }) => (
              <text
                x={0}
                y={y}
                textAnchor="start"
                dominantBaseline="middle"
                fill="#454545"
                fontSize={13}
              >
                {payload.value}
              </text>
            )}
          />

          <Tooltip />

          {campaignNames.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={colors[i % colors.length]}
            >
              {safeData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[i % colors.length]}
                  radius={isLastVisibleSegment(entry, key) ? [0, 4, 4, 0] : 0}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HorizontalBarChart;
