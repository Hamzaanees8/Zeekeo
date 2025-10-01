import { clusterTitles } from "../../../../utils/stats-helper.js";
import TooltipInfo from "../TooltipInfo.jsx";

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

const HorizontalBarsFilledCard = ({ title, data = [], tooltipText = "" }) => {

  data = clusterTitles(data, 0.6);
  const total = data.reduce((sum, item) => sum + (Number(item.count) || 0), 0);

  const bars = data.map((item, index) => {
    const value = Number(item.count) || 0;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return {
      label: item.title || `Item ${index + 1}`,
      value,
      percentage,
      color: item?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    };
  });

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[12px] py-[12px] flex flex-col relative h-full rounded-[8px]">
      {/* Title */}
      <div className="text-[16px] text-[#1E1D1D] font-normal">{title}</div>

      <div className="flex flex-col gap-[10px] mt-3 w-[85%]">
        {bars.map((bar, index) => (
          <div key={index} className="mb-0">
            <div className="flex justify-between items-center text-[12px] text-[#1E1D1D] mb-1">
              <span>{bar.label}</span>
              <span className="text-gray-600">{bar.percentage}%</span>
            </div>
            <div className="h-[10px] bg-[#DBDBDB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${bar.percentage}%`,
                  backgroundColor: bar.color,
                }}
              />
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-[12px] text-gray-500 py-4">
            No data available
          </div>
        )}
      </div>

      {/* Tooltip pinned at bottom */}
      {tooltipText && (
        <div className="mt-auto self-end pt-2">
          <TooltipInfo text={tooltipText} className="justify-end" />
        </div>
      )}
    </div>
  );
};

export default HorizontalBarsFilledCard;
