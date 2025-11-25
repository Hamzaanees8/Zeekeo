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

/**
 * Generate chart data with optional gaps between slices.
 * If there is only one data entry, no gap slices are added.
 */
const generateChartData = (data, visibleKeys, colors = []) => {
  const gapValue = 0.5;
  const entries = Object.entries(data).filter(([label]) =>
    visibleKeys.includes(label),
  );

  const chartData = [];

  // If there is only one data entry → no gaps
  if (entries.length === 1) {
    const [label, value] = entries[0];
    chartData.push({
      name: label,
      value,
      color: colors[0] || DEFAULT_COLORS[0],
    });
    return chartData;
  }

  // Multiple entries → add gaps for visual separation
  entries.forEach(([label, value], i) => {
    chartData.push({
      name: label,
      value,
      color: colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    });
    chartData.push({
      name: `gap-${i}`,
      value: gapValue,
      color: "transparent",
    });
  });

  return chartData;
};

/**
 * Custom tooltip renderer
 */
const CustomTooltip = ({ active, payload, total }) => {
  if (active && payload?.[0] && !payload[0].payload.name?.startsWith("gap-")) {
    const { name, value, color } = payload[0].payload;
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-[10px] shadow">
        <div className="text-[12px] font-normal mb-1">{name}</div>
        <div className="text-[20px] font-semibold flex justify-center items-center gap-2">
          <span style={{ color }}>{value}</span>
          <span className="text-[#636D79] text-[12px] font-normal flex">
            ({percent}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const PieChartCard = ({
  title,
  data = {},
  colors = [],
  tooltipText,
  lastUpdated = null,
}) => {
  const dataKeys = Object.keys(data || {});
  const [visibleKeys, setVisibleKeys] = useState(dataKeys);

  // Keep visible keys in sync with data changes
  useEffect(() => {
    setVisibleKeys(Object.keys(data || {}));
  }, [data]);

  // Compute total for visible keys only
  const total = useMemo(
    () =>
      Object.entries(data)
        .filter(([key]) => visibleKeys.includes(key))
        .reduce((sum, [, val]) => sum + (val || 0), 0),
    [visibleKeys, data],
  );

  const chartData = useMemo(
    () => generateChartData(data, visibleKeys, colors),
    [data, visibleKeys, colors],
  );

  const toggleKey = key => {
    setVisibleKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );
  };

  // No data fallback
  const hasData = total > 0 && Object.keys(data).length > 0;

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[12px] py-[12px] rounded-[8px] w-full relative h-full">
      <div className="text-[16px] text-[#1E1D1D] mb-5">{title}</div>

      {hasData ? (
        <div className="flex gap-5">
          {/* Left side: Donut chart */}
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
          <div className="flex flex-col gap-[10px] ml-4 text-[10px] max-h-45 overflow-y-auto pr-1 custom-scroll">
            {Object.keys(data).map((label, i) => {
              const isVisible = visibleKeys.includes(label);
              const value = data[label];
              const percent =
                total > 0 ? ((value / total) * 100).toFixed(1) : 0;

              return (
                <div
                  key={label}
                  onClick={() => toggleKey(label)}
                  className={`flex items-center gap-2 text-[#454545] text-[12px] cursor-pointer transition-opacity duration-200 ${
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
                  {label} - {value} ({percent}%)
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[140px] text-[#7E7E7E] text-sm">
          No data available
        </div>
      )}

      {/* Last Updated + Tooltip */}
      <div className="flex items-center justify-end relative right-2 bottom-2 gap-2 text-[#7E7E7E]">
        {lastUpdated && (
          <span className="italic text-[11px] text-[#7E7E7E]">
            Last updated {lastUpdated}
          </span>
        )}
        {tooltipText && <TooltipInfo text={tooltipText} />}
      </div>
    </div>
  );
};

export default PieChartCard;
