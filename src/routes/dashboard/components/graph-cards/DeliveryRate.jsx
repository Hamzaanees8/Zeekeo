import TooltipInfo from "../TooltipInfo";

const DeliveryRate = ({
  accepted = 186,
  total = 1238,
  title,
  textcolor,
  circlecolor,
  type,
}) => {
  const percent = ((accepted / total) * 100).toFixed(2);
  const radius = 50;
  const stroke = 7;
  const thinStroke = 2;

  // Use same radius for both circles
  const circleRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * circleRadius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`${
        type === "agency-dashboard" ? "border border-[#7E7E7E]" : ""
      }  px-[12px] py-[12px] w-full flex flex-col justify-between shadow-md bg-[#FFFFFF] rounded-[8px] relative h-full`}
    >
      <div
        className={`text-[16px]  ${
          textcolor ? `text-[${textcolor}]` : "text-[#1E1D1D]"
        } font-medium mb-4`}
      >
        {title ? title : "Acceptance Rate"}
      </div>

      <div className="relative w-[100px] h-[100px] self-center">
        <svg height={radius * 2} width={radius * 2}>
          {/* Background ring (thin) */}
          <circle
            stroke="#CCCCCC"
            fill="transparent"
            strokeWidth={thinStroke}
            r={circleRadius}
            cx={radius}
            cy={radius}
          />
          {/* Active ring (thick) */}
          <circle
            stroke={circlecolor ? circlecolor : "#12D7A8"}
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
            {percent}%
          </div>
          <div className="text-[12px] text-[#7E7E7E]">
            {accepted}/{total}
          </div>
        </div>
      </div>

      <TooltipInfo
        text="This shows the percentage of responses received via different outreach types."
        className="justify-end"
      />
    </div>
  );
};

export default DeliveryRate;
