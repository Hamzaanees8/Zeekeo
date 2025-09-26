import TooltipInfo from "../TooltipInfo.jsx";

// Default colors to use when not provided in data
const DEFAULT_COLORS = ["#03045E", "#0096C7", "#00B4D8", "#6D2160", "#9C27B0", "#604CFF", "#DED300", "#FF5722"];

const HorizontalBarChartCard = ({
  title,
  data = [], // [{ label, value, color? }]
  tooltipText = "",
}) => {
  return (
    <div className="bg-white shadow-md px-[12px] rounded-[8px] py-[12px] h-full flex flex-col justify-between relative">
      {/* Title */}
      <div className="text-[16px] text-[#1E1D1D] font-normal">{title}</div>

      {/* Bars */}
      <div className="flex flex-col gap-[10px] mt-3 w-[85%]">
        {data.map((bar, index) => {
          const color = bar.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
          return (
            <div key={index} className="mb-0">
              <div className="text-[12px] text-[#1E1D1D] mb-1">{bar.label}</div>
              <div className="h-[10px] bg-[#DBDBDB] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${bar.value}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltipText && (
        <TooltipInfo text={tooltipText} className="justify-end" />
      )}
    </div>
  );
};

export default HorizontalBarChartCard;
