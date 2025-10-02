import TooltipInfo from "../TooltipInfo";

// Utility for formatting percent nicely
function formatPercent(value, total) {
  if (total === 0) return "N/A"; // or "0%" if you prefer
  if (isNaN(value) || !isFinite(value)) return "0%";

  // If it's a whole number, no decimals
  if (Number.isInteger(value)) return value + "%";

  // Otherwise, keep up to 2 decimals, but trim .00
  return value.toFixed(2).replace(/\.00$/, "") + "%";
}

const CircleCard = ({ title, fill = 0, total = 0, tooltipText }) => {
  const safeFill = Number(fill) || 0;
  const safeTotal = Number(total) || 0;

  const rawPercent = safeTotal > 0 ? (safeFill / safeTotal) * 100 : 0;
  const percentText = formatPercent(rawPercent, safeTotal);

  const radius = 50;
  const stroke = 7;
  const thinStroke = 2;

  const circleRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * circleRadius;
  const dashOffset =
    safeTotal > 0
      ? circumference - (rawPercent / 100) * circumference
      : circumference;

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[12px] py-[12px] rounded-[8px] w-full flex flex-col justify-between relative h-full">
      <div className="text-[16px] text-[#1E1D1D] font-medium mb-4">
        {title}
      </div>

      <div className="relative w-[100px] h-[100px] self-center">
        <svg height={radius * 2} width={radius * 2}>
          {/* Background ring */}
          <circle
            stroke="#CCCCCC"
            fill="transparent"
            strokeWidth={thinStroke}
            r={circleRadius}
            cx={radius}
            cy={radius}
          />
          {/* Active ring */}
          <circle
            stroke="#28F0E6"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            r={circleRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[24px] font-urbanist font-medium text-[#1E1D1D]">
            {percentText}
          </div>
          <div className="text-[12px] text-[#7E7E7E]">
            {safeFill}/{safeTotal}
          </div>
        </div>
      </div>

      <TooltipInfo text={tooltipText} className="justify-end" />
    </div>
  );
};

export default CircleCard;
