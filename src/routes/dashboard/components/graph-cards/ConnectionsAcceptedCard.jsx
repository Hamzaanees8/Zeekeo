import TooltipInfo from "../TooltipInfo";

const ConnectionsAcceptedCard = ({ outerPercent = 80, innerPercent = 60 }) => {
  const radius = 50;
  const stroke = 6; // for colored bars
  const thinStroke = 2; // for background circles
  const normalizedRadius = radius - stroke / 2;
  const innerRadius = normalizedRadius - 12;
  const circumference = 2 * Math.PI * normalizedRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const getStrokeDashoffset = (percent, circ) => circ - (percent / 100) * circ;

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[12px] py-[12px] rounded-[8px] h-full flex flex-col justify-between relative">
      {/* Title */}
      <div className="text-[16px] text-[#1E1D1D] font-normal ">
        <div>Connections Accepted</div>
      </div>

      {/* Circular Graph */}
      <div className="flex justify-center items-center">
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
          {/* Outer thick progress */}
          <circle
            stroke="#003087"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={getStrokeDashoffset(outerPercent, circumference)}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />

          {/* Inner thin gray background */}
          <circle
            stroke="#CCCCCC"
            fill="transparent"
            strokeWidth={thinStroke}
            r={innerRadius}
            cx={radius}
            cy={radius}
          />
          {/* Inner thick progress */}
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
        </svg>
      </div>
      <TooltipInfo
        text="This shows the percentage of responses received via different outreach types."
        className="justify-end"
      />
    </div>
  );
};

export default ConnectionsAcceptedCard;
