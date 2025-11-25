import TooltipInfo from "../TooltipInfo";

const TwoLevelCircleCard = ({
  title = "",
  outerData = 0, // e.g. replies
  innerData = 0, // e.g. meetings booked
  tooltipText = "",
}) => {
  const radius = 50;
  const stroke = 6;
  const thinStroke = 2;

  const normalizedRadius = radius - stroke / 2;
  const innerRadius = normalizedRadius - 12;
  const circumference = 2 * Math.PI * normalizedRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const bothZero = outerData === 0 && innerData === 0;

  // Avoid division by zero
  const conversionPercent =
    outerData > 0 ? Math.min((innerData / outerData) * 100, 100) : 0;

  // Scale the outer/inner fill by relative count weight
  const maxData = Math.max(outerData, innerData, 1); // avoid 0/0
  const outerPercent = (outerData / maxData) * 100;
  const innerPercent = (innerData / maxData) * 100;

  const getStrokeDashoffset = (percent, circ) => circ - (percent / 100) * circ;

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[12px] py-[12px] rounded-[8px] h-full flex flex-col justify-between relative">
      {/* Title */}
      <div className="text-[16px] text-[#1E1D1D] font-normal mb-2">
        {title}
      </div>

      {/* Circular Graph */}
      <div className="flex justify-center items-center h-[120px]">
        {bothZero ? (
          // Show NA when both values are zero
          <div className="relative w-[100px] h-[100px] self-center">
            <svg height={radius * 2} width={radius * 2}>
              <circle
                stroke="#CCCCCC"
                fill="transparent"
                strokeWidth={thinStroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[24px] font-urbanist font-medium text-[#1E1D1D]">
                NA
              </div>
              <div className="text-[12px] text-[#7E7E7E]">0 / 0</div>
            </div>
          </div>
        ) : (
          <svg height={radius * 2} width={radius * 2}>
            {/* Outer thin gray background */}
            <circle
              stroke="#CCCCCC"
              fill="transparent"
              strokeWidth={thinStroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />

            {/* Outer (Replies) Progress */}
            {outerPercent > 0 && (
              <circle
                stroke="#003087"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={getStrokeDashoffset(
                  outerPercent,
                  circumference,
                )}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                transform={`rotate(-90 ${radius} ${radius})`}
              />
            )}

            {/* Inner thin gray background */}
            <circle
              stroke="#CCCCCC"
              fill="transparent"
              strokeWidth={thinStroke}
              r={innerRadius}
              cx={radius}
              cy={radius}
            />

            {/* Inner (Meetings) Progress */}
            {innerPercent > 0 && (
              <circle
                stroke="#00B7CE"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={innerCircumference}
                strokeDashoffset={getStrokeDashoffset(
                  innerPercent,
                  innerCircumference,
                )}
                r={innerRadius}
                cx={radius}
                cy={radius}
                transform={`rotate(-90 ${radius} ${radius})`}
              />
            )}

            {/* Middle Conversion Text */}
            <text
              x={radius}
              y={radius - 4}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[18px] font-semibold fill-[#1E1D1D]"
            >
              {conversionPercent.toFixed(0)}%
            </text>

            {/* Count ratio below */}
            <text
              x={radius}
              y={radius + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[12px] fill-[#7E7E7E]"
            >
              {innerData} / {outerData}
            </text>
          </svg>
        )}
      </div>

      <TooltipInfo text={tooltipText} className="justify-end" />
    </div>
  );
};

export default TwoLevelCircleCard;
