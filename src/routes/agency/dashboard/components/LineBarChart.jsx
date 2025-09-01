import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", value: 50 },
  { month: "Feb", value: 30 }, // minimum value
  { month: "Mar", value: 70 },
  { month: "Apr", value: 20 },
  { month: "May", value: 60 },
  { month: "Jun", value: 40 },
  { month: "Jul", value: 55 },
  { month: "Aug", value: 65 },
  { month: "Sep", value: 35 },
  { month: "Oct", value: 45 },
  { month: "Nov", value: 50 },
  { month: "Dec", value: 60 },
];

const LineBarChart = () => {
  const minValue = Math.min(...data.map(d => d.value));

  return (
    <div className="w-full h-[250px] bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          barGap={6} // spacing between bars
        >
          <CartesianGrid horizontal={true} vertical={false} stroke="#E0E0E0" />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            interval={0} // ensures all labels are shown
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={y + 15}
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
              value: "Events",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: "#454545",
              fontWeight: 400,
              fontSize: 12,
            }}
          />

          <Tooltip />

          <Bar dataKey="value" barSize={18}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value === minValue ? "#DE4B32" : "#0096C7"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineBarChart;
