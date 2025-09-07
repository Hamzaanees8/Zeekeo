import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import TooltipInfo from "../TooltipInfo";

// Static colors for 4 segments
const staticSegments = [
  { color: "#03045E" },
  { color: "#0077B6" },
  { color: "#00B4D8" },
  { color: "#12D7A8" },
];

const generateChartData = percentList => {
  const gapValue = 0.5; // small fixed gap
  const data = [];

  percentList.slice(0, 4).forEach((value, i) => {
    data.push({
      name: `Segment ${i + 1}`,
      value: value,
      color: staticSegments[i].color,
    });

    data.push({
      name: `gap-${i}`,
      value: gapValue,
      color: "transparent",
    });
  });

  return data;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.[0] && !payload[0].payload.name.startsWith("gap-")) {
    const { name, value, color } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-[10px] shadow">
        <div className="text-[12px] font-normal mb-1">Segment</div>
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

const SSIgraphCard = ({ percentList = [] }) => {
  const chartData = generateChartData(percentList);
  const totalPercent = percentList.slice(0, 4).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-[#F4F4F4] shadow-md px-[12px] rounded-[8px] py-[12px] w-full relative h-full">
      <div className="flex gap-20">
        <div className="flex flex-col items-start justify-between w-full">
          <div className="text-[16px] text-[#1E1D1D] mb-0">
            SSI: People in Your Industry
          </div>

          <div className="relative self-center w-[140px] h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                  startAngle={110}
                  endAngle={-200}
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

            {/* Center Text */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-[#1E1D1D]">
              <div className="text-[20px] font-urbanist font-medium">
                {totalPercent}
              </div>
              <div className="text-[10px] text-grey-light">out of 100</div>
            </div>
          </div>
        </div>
      </div>

      <TooltipInfo
        text="This shows the percentage of responses received via different outreach types."
        className="justify-end absolute right-2 bottom-2"
      />
    </div>
  );
};

export default SSIgraphCard;
