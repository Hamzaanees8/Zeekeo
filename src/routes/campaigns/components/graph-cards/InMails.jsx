import { PlayIcon } from "../../../../components/Icons";
import TooltipInfo from "../TooltipInfo";

const InMails = ({ total = 0, maxFollows = 0, pausedBadge = false }) => {
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
      <div className="flex items-start justify-between">
        <div className="text-[16px] text-[#1E1D1D] font-normal mb-4">
          InMails
        </div>
        {pausedBadge && (
          <div className="relative inline-block ml-2 group">
            <button className="rounded-full p-[2px] bg-[#FFFFFF] border border-[#7E7E7E] cursor-pointer">
              <PlayIcon className="w-4 h-4 fill-[#f61d00]" />
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 w-max bg-[#f61d00] text-[#FFFFFF] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              InMails are paused by LinkedIn
            </div>
          </div>
        )}
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
            stroke="#0077B6"
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
        text="Shows the number of InMails received daily and weekly."
        className="justify-end"
      />
    </div>
  );
};

export default InMails;
