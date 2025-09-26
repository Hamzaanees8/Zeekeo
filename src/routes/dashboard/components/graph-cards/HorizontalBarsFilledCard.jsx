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
  // Ensure each item has value and color
  const bars = data.map((item, index) => ({
    label: item.label || `Item ${index + 1}`,
    value: Number(item.value) || 0,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  // Find maximum value for scaling if needed
  const maxValue = Math.max(...bars.map(bar => bar.value), 1);

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[12px] py-[12px] flex flex-col justify-between relative h-full rounded-[8px]">
      <div className="text-[16px] text-[#1E1D1D] font-normal">{title}</div>
      <div className="flex flex-col gap-[10px] mt-3 w-[85%]">
        {bars.map((bar, index) => (
          <div key={index} className="mb-0">
            <div className="text-[12px] text-[#1E1D1D] mb-1">{bar.label}</div>
            <div className="h-[10px] bg-[#DBDBDB] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full`}
                style={{
                  width: `${(bar.value / maxValue) * 100}%`,
                  backgroundColor: bar.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {tooltipText && <TooltipInfo text={tooltipText} className="justify-end" />}
    </div>
  );
};

export default HorizontalBarsFilledCard;