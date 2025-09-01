import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", value: 50, prevDay: 45 },
  { day: "Tue", value: 55, prevDay: 50 },
  { day: "Wed", value: 60, prevDay: 52 },
  { day: "Thu", value: 65, prevDay: 58 },
  { day: "Fri", value: 62, prevDay: 60 },
  { day: "Sat", value: 68, prevDay: 64 },
  { day: "Sun", value: 70, prevDay: 66 },
];

const WeeklyLineChart = () => {
  return (
    <div className="w-full h-[250px] bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
        >
          {/* Only horizontal lines */}
          <CartesianGrid horizontal={true} vertical={false} stroke="#E0E0E0" />

          <XAxis
            dataKey="day"
            tickLine={false}
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={y + 20}
                textAnchor="middle"
                fill="#454545"
                fontWeight={400}
                fontSize={11}
              >
                {payload.value}
              </text>
            )}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={({ x, y, payload }) => (
              <text
                x={x - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#454545"
                fontWeight={400}
                fontSize={11}
              >
                {payload.value}
              </text>
            )}
            label={{
              value: "Replies",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: "#454545",
              fontWeight: 400,
              fontSize: 12,
            }}
          />

          <Tooltip />

          {/* Comparison line (previous day) */}
          <Line
            type="monotone"
            dataKey="prevDay"
            stroke="#CCCCCC"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />

          {/* Main line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#12d7a8"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyLineChart;
