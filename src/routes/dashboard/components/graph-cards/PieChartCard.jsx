import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import TooltipInfo from "../TooltipInfo";

const DEFAULT_COLORS = [
  "#03045E",
  "#04479C",
  "#0077B6",
  "#0096C7",
  "#00B4D8",
  "#28F0E6",
  "#12D7A8",
  "#25C396",
];

const generateChartData = (data, visibleKeys, colors = []) => {
  const gapValue = 0.5;
  const entries = Object.entries(data);
  const chartData = [];

  entries.forEach(([label, value], i) => {
    if (visibleKeys.includes(label)) {
      chartData.push({
        name: label,
        value,
        color: colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length], // fallback to default
      });
      chartData.push({
        name: `gap-${i}`,
        value: gapValue,
        color: "transparent",
      });
    }
  });

  return chartData;
};

const CustomTooltip = ({ active, payload, total }) => {
  if (active && payload?.[0] && !payload[0].payload.name?.startsWith("gap-")) {
    const { name, value, color } = payload[0].payload;
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-[10px] shadow">
        <div className="text-[12px] font-normal mb-1">Network Distance</div>
        <div className="text-[20px] font-semibold flex justify-center items-center gap-2">
          <span style={{ color }}>{value}</span>
          <span className="text-[#636D79] text-[12px] font-normal flex">
            {name} ({percent}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const PieChartCard = ({ title, data = {}, colors = [] }) => {
  const [visibleKeys, setVisibleKeys] = useState(Object.keys(data));

  // keep visibleKeys in sync with data
/*   useEffect(() => {
    setVisibleKeys(Object.keys(data || {}));
  }, [data]); */

  // Compute total only for visible keys
  const total = useMemo(
    () => visibleKeys.reduce((sum, key) => sum + (data[key] || 0), 0),
    [visibleKeys, data],
  );

  const chartData = generateChartData(data, visibleKeys, colors);

  const toggleKey = key => {
    setVisibleKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );
  };

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[12px] py-[12px] rounded-[8px] w-full relative h-full">
      <div className="text-[16px] text-[#1E1D1D] mb-5">{title}</div>
      <div className="flex gap-5">
        {/* Left side: donut chart */}
        <div className="flex flex-col items-start justify-between">
          <div className="w-[140px] h-[140px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={false}
                  cornerRadius={3}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      cursor={
                        entry.name.startsWith("gap-") ? "default" : "pointer"
                      }
                      opacity={entry.color === "transparent" ? 0 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right side: labels */}
        <div className="flex flex-col gap-[10px] ml-4 text-[10px]">
          {Object.keys(data).map((label, i) => {
            const isVisible = visibleKeys.includes(label);
            const value = data[label];
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

            return (
              <div
                key={label}
                onClick={() => toggleKey(label)}
                className={`flex items-center gap-2 text-[#454545] cursor-pointer transition-opacity duration-200 ${
                  isVisible ? "opacity-100" : "opacity-40"
                }`}
              >
                <span
                  className="w-[9px] h-[9px] rounded-full"
                  style={{
                    backgroundColor:
                      colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                  }}
                />
                {label} – {value} ({percent}%)
              </div>
            );
          })}
        </div>
      </div>

      <TooltipInfo
        text="Click on label to hide/show specific category from chart."
        className="justify-end absolute right-2 bottom-2"
      />
    </div>
  );
};

export default PieChartCard;
