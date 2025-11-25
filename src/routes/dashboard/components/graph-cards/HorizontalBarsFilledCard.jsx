import { useMemo } from "react";
import { Tooltip, BarChart, Bar, Cell, ResponsiveContainer } from "recharts";
import { clusterTitles } from "../../../../utils/stats-helper.js";
import TooltipInfo from "../TooltipInfo.jsx";

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

// ------------------ CUSTOM TOOLTIP ------------------
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="bg-[#FFFFFF] border border-[#CCCCCC] rounded px-3 py-2 text-[10px] shadow">
      <div className="text-[12px] font-normal mb-1">{item.label}</div>
      <div className="text-[20px] font-semibold flex justify-center items-center gap-2">
        <span style={{ color: item.color }}>{item.value}</span>
        <span className="text-[#636D79] text-[12px] font-normal flex">
          ({item.percentage}%)
        </span>
      </div>
    </div>
  );
};

export default function HorizontalBarsFilledCard({
  title,
  data = [],
  tooltipText = "",
  lastUpdated = null,
}) {
  const bars = useMemo(() => {
    const clustered = clusterTitles(data, 0.6);
    const total = clustered.reduce(
      (sum, item) => sum + (Number(item.count) || 0),
      0,
    );

    return clustered.map((item, index) => {
      const value = Number(item.count) || 0;
      const percentage =
        total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0;

      return {
        label: item.title || `Item ${index + 1}`,
        value,
        percentage,
        color: item?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      };
    });
  }, [data]);

  // Needed for the transparent overlay chart
  const chartData = bars.map((b, i) => ({
    ...b,
    index: i,
    barWidth: b.percentage,
  }));

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[12px] py-[12px] flex flex-col relative h-full rounded-[8px]">
      <div className="text-[16px] text-[#1E1D1D] font-normal">{title}</div>

      <div className="flex-1 mt-3 max-h-95 overflow-y-auto pr-1 custom-scroll">
        {bars.length === 0 && (
          <div className="text-[12px] text-[#6D6D6D] py-4">
            No data available
          </div>
        )}

        {bars.length > 0 &&
          bars.map((bar, index) => (
            <div key={index} className="mb-[10px] relative">
              {/* Label + % */}
              <div className="flex justify-between items-center text-[12px] text-[#1E1D1D] mb-1">
                <span>{bar.label}</span>
                <span className="text-[#7E7E7E]">{bar.percentage}%</span>
              </div>

              {/* Grey background track */}
              <div className="h-[10px] bg-[#DBDBDB] rounded-full w-full relative overflow-hidden">
                {/* Colored fill bar */}
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${bar.percentage}%`,
                    backgroundColor: bar.color,
                  }}
                />
              </div>

              {/* Tooltip overlay */}
              <div className="absolute inset-0 pointer-events-auto  z-50">
                <ResponsiveContainer width="100%" height={30}>
                  <BarChart
                    data={[chartData[index]]}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar
                      dataKey="barWidth"
                      isAnimationActive={false}
                      background={false}
                      radius={[5, 5, 5, 5]}
                      fill="transparent"
                    >
                      <Cell fill="transparent" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
      </div>

      <div className="flex items-center gap-2 text-[#7E7E7E] mt-auto self-end pt-4">
        {lastUpdated && (
          <span className="italic text-[11px] text-[#7E7E7E]">
            Last updated {lastUpdated}
          </span>
        )}
        {tooltipText && <TooltipInfo text={tooltipText} />}
      </div>
    </div>
  );
}
