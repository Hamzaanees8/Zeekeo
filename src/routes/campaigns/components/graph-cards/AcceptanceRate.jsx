import { useState } from "react";
import TooltipInfo from "../TooltipInfo.jsx";

const AcceptanceRate = ({
  data = [], // array of { date, invites, accepted }
  max = 100,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Derive today from last item
  const todayIndex = data.length - 1;
  const today = data[todayIndex];
  const todayPercentage = today
    ? Math.min((today.accepted / (today.invites || 1)) * 100, 100).toFixed(0)
    : 0;

  const barColors = Array(7).fill("bg-[#03045E]");
  const dayLabels = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

   const sortedData = [...data]
    .filter((item) => item?.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date)) ;

  const last7Days = sortedData.map((item, index) => {
    const d = new Date(item.date);
    const dayIndex = d.getDay();

    let color = barColors[dayIndex];
    if (dayIndex === 5) color = "friday-gradient";

    const percentage = Math.min(
      (item.accepted / (item.invites || 1)) * 100,
      100,
    );

    return {
      label: dayLabels[dayIndex],
      percentage,
      color,
      isToday: index === todayIndex,
      dateFormatted: d.toLocaleDateString("en-US", {
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
        {last7Days.map((bar, index) => (
          <div key={index} className="relative group">
            {hoveredIndex === index && (
              <div className="absolute -top-[60px] left-0 z-50 bg-white px-4 rounded-[6px] py-3 shadow min-w-[150px] border border-gray-200">
                <div className="text-[#333] text-[10px] font-medium">
                  Acceptance Rate
                </div>
                <div className="flex justify-between items-center text-[10px] mt-1">
                  <div
                    className="text-[18px] font-semibold"
                    style={{
                      color: bar.isToday
                        ? "#00B4D8"
                        : bar.color === "bg-[#03045E]"
                        ? "#03045E"
                        : "#03045E",
                    }}
                  >
                    {bar.percentage.toFixed(0)}%
                  </div>
                  <div className="text-right">
                    <div className="text-[#636D79] text-[10px]">{bar.label}</div>
                    <div className="text-[#636D79] text-[10px]">
                      {bar.dateFormatted}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-[12px] text-[#1E1D1D] mb-1">{bar.label}</div>

            <div className="h-[10px] bg-[#DBDBDB] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  bar.color === "friday-gradient" || bar.isToday
                    ? ""
                    : bar.color
                }`}
                style={{
                  width: `${bar.percentage}%`,
                  backgroundImage:
                    bar.isToday || bar.color === "friday-gradient"
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
        ))}
      </div>

      <TooltipInfo
        text="Shows daily acceptance rate percentage."
        className="justify-end"
      />
    </div>
  );
};

export default AcceptanceRate;
