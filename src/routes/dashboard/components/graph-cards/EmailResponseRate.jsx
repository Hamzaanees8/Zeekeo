import { useState } from "react";
import TooltipInfo from "../TooltipInfo.jsx";

const BAR_CONFIG = [
  {
    key: "openCount",
    label: "Open Rate",
    color: "#03045E",
    bgClass: "bg-[#03045E]",
  },
  {
    key: "replyCount",
    label: "Reply Rate",
    color: "#0077B6",
    bgClass: "bg-[#0077B6]",
  },
  {
    key: "bounceCount",
    label: "Bounce Rate",
    color: "#0096C7",
    bgClass: "bg-[#0096C7]",
  },
];

const CustomTooltip = ({ active, item }) => {
  if (!active || !item) return null;

  return (
    <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#FFFFFF] border border-[#CCCCCC] rounded px-3 py-2 text-[10px] shadow pointer-events-none whitespace-nowrap">
      <div className="text-[12px] font-normal mb-1">{item.label}</div>
      <div className="text-[20px] font-semibold flex justify-center items-center gap-2">
        <span style={{ color: item.color }}>
          {item.value} / {item.total}
        </span>
        <span className="text-[#636D79] text-[12px] font-normal flex">
          ({item.percentage}%)
        </span>
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-[#CCCCCC] rotate-45"></div>
    </div>
  );
};

const EmailResponseRate = ({
  data = { openCount: 0, replyCount: 0, bounceCount: 0 },
  total = 0,
}) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Helper to calculate percentage with decimals
  const getPercentage = (count) => {
    if (!total || total === 0) return "0";
    const percent = (count / total) * 100;

    return percent % 1 === 0 ? percent.toString() : percent.toFixed(2);
  };

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[12px] py-[12px] rounded-[8px] h-full flex flex-col justify-between relative">
      <div className="text-[16px] text-[#1E1D1D] font-normal">
        <div>Email Response Rate</div>
      </div>

      <div className="flex flex-col gap-[10px] mt-3 w-[85%]">
        {BAR_CONFIG.map((bar) => {
          const count = data[bar.key] || 0;
          const percentage = getPercentage(count);

          return (
            <div
              key={bar.key}
              className="relative group"
              onMouseEnter={() => setHoveredBar(bar.key)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <CustomTooltip
                active={hoveredBar === bar.key}
                item={{
                  label: bar.label,
                  value: count,
                  total: total,
                  percentage: percentage,
                  color: bar.color,
                }}
              />

              <div className="flex justify-between items-center mb-1">
                <span className="text-[12px] text-[#1E1D1D] font-medium">
                  {bar.label}
                </span>
                <span className="text-[10px] font-bold text-[#1E1D1D]">
                  {percentage}%
                </span>
              </div>

              <div className="h-[10px] bg-[#DBDBDB] rounded-full overflow-hidden cursor-pointer">
                <div
                  className={`h-full rounded-full ${bar.bgClass} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <TooltipInfo
        text="This shows the percentage of responses calculated based on total emails sent."
        className="justify-end"
      />
    </div>
  );
};

export default EmailResponseRate;