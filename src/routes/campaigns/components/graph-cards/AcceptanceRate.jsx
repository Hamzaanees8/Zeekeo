import { useState } from "react";
import TooltipInfo from "../TooltipInfo.jsx";

const AcceptanceRate = ({ value = "0,0,0,0,0,0,0", max = 100 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const values = value.split(",").map(Number);
  const todayIndex = new Date().getDay();
  const todayValue = values[todayIndex] || 0;
  const todayPercentage = Math.min((todayValue / max) * 100, 100).toFixed(0);

  const barColors = [
    "bg-[#03045E]",
    "bg-[#03045E]",
    "bg-[#03045E]",
    "bg-[#03045E]",
    "bg-[#03045E]",
    "bg-[#03045E]",
    "bg-[#03045E]",
  ];

  // Calculate start of week (Sunday)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - todayIndex); // Move to Sunday

  const bars = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ].map((label, index) => {
    const dateObj = new Date(startOfWeek);
    dateObj.setDate(startOfWeek.getDate() + index);

    let color = barColors[index];
    if (index === 5) color = "friday-gradient";
    if (index === todayIndex) color = "bg-[#00B4D8]";

    return {
      label,
      value: values[index] || 0,
      color,
      date: dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  });

  return (
    <div className="bg-[#FFFFFF] px-[12px] py-[12px] h-full flex flex-col justify-between relative rounded-[8px] shadow-md">
      <div className="text-[16px] text-[#1E1D1D] font-normal">
        Acceptance Rate
      </div>

      <div className="text-center mt-2">
        <div className="text-[12px] text-[#7E7E7E] leading-[150%]">Today</div>
        <div className="text-[36px] font-urbanist font-medium text-[#1E1D1D] leading-[130%]">
          {todayPercentage}%
        </div>
        <div className="text-[12px] text-[#7E7E7E] leading-[150%]">
          Max {max}
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-3 w-[85%] relative z-10">
        {bars.map((bar, index) => {
          const percentage = Math.min((bar.value / max) * 100, 100).toFixed(0);

          return (
            <div key={index} className="relative group">
              {/* Tooltip */}
              {hoveredIndex === index && (
                <div className="absolute -top-[60px] left-0 z-50 bg-white px-4 rounded-[6px] py-3 shadow min-w-[150px] border border-gray-200">
                  <div className="text-[#333] text-[10px] font-medium">
                    Acceptance Rate
                  </div>
                  <div className="flex justify-between items-center text-[10px] mt-1">
                    <div
                      className="text-[18px] font-semibold"
                      style={{
                        color:
                          bar.color === "bg-[#00B4D8]"
                            ? "#00B4D8"
                            : bar.color === "bg-[#03045E]"
                            ? "#03045E"
                            : "#03045E",
                      }}
                    >
                      {percentage}%
                    </div>
                    <div className="text-right">
                      <div className="text-[#636D79] text-[10px]">
                        {bar.label}
                      </div>
                      <div className="text-[#636D79] text-[10px]">
                        {bar.date}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Day label */}
              <div className="text-[12px] text-[#1E1D1D] mb-1">
                {bar.label}
              </div>

              {/* Bar container */}
              <div className="h-[10px] bg-[#DBDBDB] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    bar.color === "friday-gradient" ? "" : bar.color
                  }`}
                  style={{
                    width: `${percentage}%`,
                    backgroundImage:
                      bar.color === "friday-gradient"
                        ? `repeating-linear-gradient(
                            125deg,
                            #03045E,
                            #03045E 8px,
                            #04479C 8px,
                            #04479C 15px
                          )`
                        : undefined,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <TooltipInfo
        text="This shows the percentage of responses received via different outreach types."
        className="justify-end"
      />
    </div>
  );
};

export default AcceptanceRate;
