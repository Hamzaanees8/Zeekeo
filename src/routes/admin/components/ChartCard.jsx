import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TooltipInfoIcon } from "../../../components/Icons";
import { useState } from "react";

function computeTicks(data) {
  const maxVal = Math.max(...data.map(d => d.value), 0);
  if (maxVal === 0) return { domainMax: 10, ticks: [0, 2.5, 5, 7.5, 10] };

  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const stepBase = magnitude / 2;
  const domainMax = Math.ceil(maxVal / stepBase) * stepBase;
  const ticks = [0, domainMax * 0.333, domainMax * 0.666, domainMax].map(
    Math.round,
  );
  return { domainMax, ticks };
}

function kFormatter(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}

export default function ChartCard({
  title,
  color = "#22c55e",
  hourlyBreakdown = [],
  emptyMessage = "No data available",
  text = "Info",
}) {
  const data = hourlyBreakdown;
  const allZero = data.every(d => d.value === 0);
  const { domainMax, ticks } = computeTicks(data);
  const [visible, setVisible] = useState(false);

  return (
    <div className="bg-white border border-[#7E7E7E] shadow-sm p-3 md:p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative">
        <h3 className="text-[13px] md:text-sm font-semibold text-gray-700">
          {title}
        </h3>
        <div className="inline-flex items-center cursor-pointer absolute bottom-2 right-1">
          <div
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
          >
            <TooltipInfoIcon />
          </div>
          {visible && (
            <div className="absolute w-[200px] flex bottom-6 right-0 bg-black text-white text-xs px-2 py-1 rounded shadow z-10">
              {text}
            </div>
          )}
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1">
        {allZero ? (
          <div className="h-[120px] md:h-[140px] grid place-items-center text-gray-400 text-sm">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={data}
              margin={{ top: 0, right: 6, left: 0, bottom: 0 }}
              barCategoryGap="15%"
            >
              <XAxis dataKey="x" hide />
              <YAxis
                width={30}
                ticks={ticks}
                domain={[0, domainMax]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickFormatter={kFormatter}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                formatter={v => [v, "Count"]}
                labelFormatter={label => `${label}`}
              />
              <Bar dataKey="value" fill={color} radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
