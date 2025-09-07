import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import TooltipInfo from "../TooltipInfo";

// Segment labels + colors
const staticSegments = [
  { label: "Software Development", color: "#03045E" },
  { label: "Others", color: "#04479C" },
  { label: "Technology, Information, & Internet", color: "#0077B6" },
  { label: "Marketing Services", color: "#0096C7" },
  { label: "Advertising Services", color: "#00B4D8" },
  { label: "Computer Games", color: "#28F0E6" },
  { label: "Computer Games", color: "#12D7A8" },
  { label: "Computer Games", color: "#25C396" },
  { label: "Computer Games", color: "#16A37B" },
  { label: "Computer Games", color: "#038D65" },
];

// Add gaps between segments
const generateChartData = percentList => {
  const gapValue = 0.5;
  const data = [];

  percentList.forEach((value, i) => {
    data.push({
      name: staticSegments[i]?.label || `Segment ${i + 1}`,
      value,
      color: staticSegments[i]?.color || "#999",
    });
    data.push({
      name: `gap-${i}`,
      value: gapValue,
      color: "transparent",
    });
  });

  return data;
};

// Tooltip on hover
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.[0] && !payload[0].payload.name?.startsWith("gap-")) {
    const { name, value, color } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-[10px] shadow">
        <div className="text-[12px] font-normal mb-1">Industry</div>
        <div className="text-[20px] font-semibold flex justify-center items-center gap-2">
          <span style={{ color }}>{value.toFixed(1)}%</span>
          <span className="text-[#636D79] text-[12px] font-normal">
            {name}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const IndustryDistribution = ({ percentList = [] }) => {
  const chartData = generateChartData(percentList);

  return (
    <div className="bg-[#F4F4F4] shadow-md px-[12px] py-[12px] w-full relative h-full rounded-[8px]">
      <div className="flex gap-20">
        {/* Left: Title + Donut */}
        <div className="flex flex-col items-start justify-between">
          <div className="text-[16px] text-[#1E1D1D] mb-0">
            Industry Distribution
          </div>

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
                  cornerRadius={2}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      cursor={
                        entry.name.startsWith("gap-") ? "default" : "pointer"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Labels */}
        <div className="flex flex-col gap-[10px] ml-4 text-[10px]">
          {staticSegments.slice(0, 6).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[#454545]">
              <span
                className="w-[9px] h-[9px] rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <TooltipInfo
        text="This shows the percentage of responses received via different outreach types."
        className="justify-end absolute right-2 bottom-2"
      />
    </div>
  );
};

export default IndustryDistribution;
