import { useState } from "react";
import TooltipInfo from "../TooltipInfo.jsx";

const AcceptanceRate = ({ data = [], max = 100 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const sortedData = [...data]
    .filter(item => item?.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const todayIndex = sortedData.length - 1;
  const today = sortedData[todayIndex];
  const todayAccepted = today?.accepted || 0;

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

  const last7Days = sortedData.map((item, index) => {
    const d = new Date(item.date);
    const dayIndex = d.getDay();

    let color = barColors[dayIndex];

    const accepted = item.accepted || 0;

    return {
      label: dayLabels[dayIndex],
      accepted,
      color,
      isToday: index === todayIndex,
      dateFormatted: d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      invites: item.invites,
      acceptedCount: item.accepted,
    };
  });

  const maxAccepted = Math.max(...last7Days.map(bar => bar.accepted), 1);

  return (
    <div className="bg-[#FFFFFF] px-[12px] py-[12px] h-full flex flex-col justify-between relative rounded-[8px] shadow-md">
      <div className="text-[16px] text-[#1E1D1D] font-normal">
        Accepted Invites
      </div>

      <div className="text-center mt-2">
        <div className="text-[12px] text-[#7E7E7E] leading-[150%]">Today</div>
        <div className="text-[36px] font-urbanist font-medium text-[#1E1D1D] leading-[130%]">
          {todayAccepted}
        </div>
        <div className="text-[12px] text-[#7E7E7E] leading-[150%]">
          Max {maxAccepted}
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-3 w-[85%] relative z-10">
        {last7Days.map((bar, index) => (
          <div key={index} className="relative group">
            {hoveredIndex === index && (
              <div className="absolute -top-[80px] left-0 z-50 bg-white px-4 rounded-[6px] py-3 shadow min-w-[150px] border border-gray-200">
                <div className="text-[#333] text-[10px] font-medium">
                  Accepted Invites
                </div>
                <div className="flex justify-between items-center text-[10px] mt-1">
                  <div
                    className="text-[18px] font-semibold"
                    style={{
                      color: bar.isToday
                        ? "#00B4D8"
                        : bar.color === "friday-gradient"
                        ? "#03045E"
                        : "#03045E",
                    }}
                  >
                    {bar.accepted}
                  </div>
                  <div className="text-right">
                    <div className="text-[#636D79] text-[10px]">
                      {bar.label}
                    </div>
                    <div className="text-[#636D79] text-[10px]">
                      {bar.dateFormatted}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {/* <div className="text-[#333] text-[10px] mt-1">
                    Invited:{" "}
                    <span className="font-medium text-[#1E1D1D]">
                      {bar.invites}
                    </span>
                  </div> */}
                  <div className="text-[#333] text-[10px]">
                    Accepted:{" "}
                    <span className="font-medium text-[#1E1D1D]">
                      {bar.accepted}
                    </span>
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
                  width: `${(bar.accepted / maxAccepted) * 100}%`,
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
        text="Shows daily accepted invites count."
        className="justify-end"
      />
    </div>
  );
};

export default AcceptanceRate;
