import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import TooltipInfo from "../TooltipInfo";

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
      name: item.pillar.replace("_", " "),
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

const PeopleSSICard = ({ title, data, rank }) => {
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

  // Prepare bar chart data
  const bars = data.sub_scores.map((item, index) => ({
    label: item.pillar.replace("_", " "),
    value: item.value ?? item.score,
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  const maxValue = Math.max(...bars.map(bar => bar.value), 1);

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[16px] py-[16px] border border-[#7E7E7E] rounded-[8px] w-full flex flex-col gap-4">
      {/* Title */}
      <div className="text-[16px] text-[#1E1D1D] font-normal">{title}</div>

      {/* Content row */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6">
        {/* Left: Pie chart */}
        <div className="flex flex-col items-center justify-center">
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
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Middle: Overall score */}
        <div className="flex flex-col items-center justify-center text-center w-[80px] ">
          <div className="flex flex-col items-center mb-2">
            <h4 className="text-2xl">{data.overall.toFixed(1)}</h4>
            <div className="text-sm text-gray-500">out of 100</div>
          </div>
        </div>

        {/* Right: Text / rank info */}
        <div className="flex flex-col items-start justify-center text-left text-[13px] text-[#1E1D1D] leading-5">
          <div
                  className="text-[12px] text-[#1E1D1D] mb-1">
            People in your network have an average SSI of{" "}
            <b>{data.overall.toFixed(1)}</b>.
          </div>
          <div
                  className="text-[12px] text-[#1E1D1D] mb-1">You rank in the top {rank}%</div>
          {/* <div
                  className="text-[12px] text-[#1E1D1D] mb-1">
            
            since last week
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default PeopleSSICard;
