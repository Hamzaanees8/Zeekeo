import TooltipInfo from "../TooltipInfo";

const Endorsements = ({ total = 0, maxFollows = 0 }) => {
  const clampedTotal = Math.min(Number(total), maxFollows);
  const percent = (clampedTotal / maxFollows) * 100;
  const totalFollows = total;

  const radius = 50;
  const stroke = 7;
  const thinStroke = 2;

  const circleRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * circleRadius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-[#FFFFFF] rounded-[8px] shadow-md px-[12px] py-[12px] w-full flex flex-col justify-between relative h-full">
      <div className="text-[16px] text-[#1E1D1D] font-normal mb-4">
        Endorsements
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
            stroke="#04479C"
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
          <div className="text-[36px] font-urbanist font-medium text-[#1E1D1D] leading-[130%]">
            {totalFollows}
          </div>
          <div className="text-[12px] text-[#7E7E7E] leading-[150%]">
            Max {maxFollows}
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

export default Endorsements;
