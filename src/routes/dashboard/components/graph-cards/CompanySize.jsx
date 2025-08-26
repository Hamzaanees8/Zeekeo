import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import TooltipInfo from "../TooltipInfo";

// Static labels/colors
const staticSegments = [
  { label: "1 - 10", color: "#28F0E6" },
  { label: "11 - 50", color: "#00B4D8" },
  { label: "51 - 200", color: "#0096C7" },
  { label: "Others", color: "#0077B6" },
  { label: "201-500", color: "#04479C" },
  { label: "500+", color: "#03045E" },
];

// Create Recharts-compatible data with gaps
const generateChartData = (percentList, visibleSegments) => {
  const gapValue = 0.5; // small gap value
  const data = [];

  percentList.forEach((value, i) => {
    if (visibleSegments.includes(i)) {
      data.push({
        name: staticSegments[i].label,
        value: value,
        color: staticSegments[i].color,
        index: i,
      });
      data.push({
        name: `gap-${i}`,
        value: gapValue,
        color: "transparent",
      });
    }
  });

  return data;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.[0] && !payload[0].payload.name?.startsWith("gap-")) {
    const { name, value, color } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-[10px] shadow">
        <div className="text-[12px] font-normal mb-1">Company Size</div>
        <div className="text-[20px] font-semibold flex justify-center items-center gap-2">
          <span style={{ color }}>{value.toFixed(1)}%</span>
          <span className="text-[#636D79] text-[12px] font-normal flex">
            {name}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CompanySize = ({ percentList = [] }) => {
  const [visibleSegments, setVisibleSegments] = useState(
    staticSegments.map((_, i) => i),
  );

  const chartData = generateChartData(percentList, visibleSegments);

  const toggleSegment = index => {
    setVisibleSegments(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index],
    );
  };

  return (
    <div className="bg-[#F4F4F4] shadow-sm px-[12px] py-[12px] w-full relative h-full">
      <div className="flex gap-20">
        {/* Left side: title + donut */}
        <div className="flex flex-col items-start justify-between">
          <div className="text-[16px] text-[#1E1D1D] mb-0">Company Size</div>

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

        {/* Right side: labels */}
        <div className="flex flex-col gap-[10px] ml-4 text-[10px]">
          {[...staticSegments.map((item, idx) => ({ ...item, idx }))]
            .sort((a, b) => {
              const aVisible = visibleSegments.includes(a.idx);
              const bVisible = visibleSegments.includes(b.idx);
              return aVisible === bVisible ? 0 : aVisible ? -1 : 1;
            })
            .map(item => {
              const isVisible = visibleSegments.includes(item.idx);
              return (
                <div
                  key={item.idx}
                  onClick={() => toggleSegment(item.idx)}
                  className={`flex items-center gap-2 text-[#454545] cursor-pointer transition-opacity duration-200 ${
                    isVisible ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <span
                    className="w-[9px] h-[9px] rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </div>
              );
            })}
        </div>
      </div>

      <TooltipInfo
        text="Click on label to hide/show specific company size from chart."
        className="justify-end absolute right-2 bottom-2"
      />
    </div>
  );
};

export default CompanySize;
