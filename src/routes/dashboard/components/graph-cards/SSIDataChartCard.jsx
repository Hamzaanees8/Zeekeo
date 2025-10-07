import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import TooltipInfo from "../TooltipInfo";
import { SSI_PILLAR_LABELS } from "../../../../utils/stats-helper";

// Default colors for pillars
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

const GAP_VALUE = 0.5;

// Generate chart data with gaps
const generateChartData = subScores => {
  const data = [];
  subScores.forEach((item, i) => {
    data.push({
      name: SSI_PILLAR_LABELS[item.pillar] || item.pillar.replace("_", " "),
      value: item.value ?? item.score,
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      index: i,
    });
    data.push({
      name: `gap-${i}`,
      value: GAP_VALUE,
      color: "transparent",
    });
  });
  return data;
};

// Custom tooltip for pie chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.[0] && !payload[0].payload.name?.startsWith("gap-")) {
    const { name, value, color } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-[10px] shadow">
        <div className="text-[12px] font-normal mb-1">Pillar</div>
        <div className="text-[20px] font-semibold flex justify-center items-center gap-2">
          <span style={{ color }}>{value.toFixed(1)}</span>
          <span className="text-[#636D79] text-[12px] font-normal flex">
            {name}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const SSIDataChartCard = ({ title, data }) => {
  if (!data || !data.sub_scores?.length) return null;

  const [visibleSegments, setVisibleSegments] = useState(
    data.sub_scores.map((_, i) => i),
  );

  const chartData = generateChartData(
    data.sub_scores.filter((_, i) => visibleSegments.includes(i)),
  );

  const toggleSegment = index => {
    setVisibleSegments(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index],
    );
  };

  // Build bars with custom label
  const bars = data.sub_scores.map((item, index) => ({
    label: SSI_PILLAR_LABELS[item.pillar] || item.pillar.replace("_", " "),
    value: item.value ?? item.score,
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  const maxValue = Math.max(...bars.map(bar => bar.value), 1);

  return (
    <div className="bg-[#FFFFFF] shadow-md p-4 rounded-[8px] w-full">
      {/* Title at top */}
      <div className="text-[16px] text-[#1E1D1D] font-normal mb-4">
        {title}
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-[1.2fr_0.8fr_2fr] items-center gap-6">
        {/* Left: Pie chart */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-[235px] h-[235px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={100}
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
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Middle: Overall score */}
        <div className="flex flex-col items-center justify-center text-center w-[140px]">
          <div className="flex flex-col items-center mb-2">
            <h4 className="text-2xl">{data.overall.toFixed(1)}</h4>
            <div className="text-sm text-gray-500">out of 100</div>
          </div>
        </div>

        {/* Right: Bar chart */}
        <div className="flex flex-col justify-center text-[10px]">
          <div className="flex flex-col gap-[10px] w-[85%]">
            {bars.map((bar, index) => (
              <div key={index}>
                <div
                  className="text-[12px] text-[#1E1D1D] mb-1 cursor-pointer"
                  onClick={() => toggleSegment(index)}
                >
                  {bar.value} | {bar.label}
                </div>
                <div className="h-[10px] bg-[#DBDBDB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(bar.value / maxValue) * 100}%`,
                      backgroundColor: bar.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSIDataChartCard;
