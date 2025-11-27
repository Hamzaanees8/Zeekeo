// components/Card.jsx
import {
  TopRateIcon,
  LowRateIcon,
  PlayIcon,
} from "../../../components/Icons.jsx";

const PeriodCard = ({
  title,
  Topvalue,
  Lowvalue,
  max = 300,
  low = 500,
  change,
  bg = "bg-[#F4F4F4]",
  icon: Icon,
  type,
  pausedBadge = false,
}) => {
  const topNum = Number(Topvalue);
  const lowNum = Number(Lowvalue);

  const ThisPeriod = Math.min((topNum / max) * 100, 100).toFixed(1);
  const LowPeriod = Math.min((lowNum / low) * 100, 100).toFixed(1);
  return (
    <div className="px-[10px] py-[15px] rounded-[8px] min-h-[166px] shadow-none bg-[#FFFFFF]">
      <div className="flex items-center  mb-[10px] gap-[12px]">
        <span className="w-[28px] flex">
          {Icon && <Icon className="!w-[28px] !h-[28px] text-[#6D6D6D]" />}
        </span>
        <h2 className="text-[16px] text-grey font-normal leading-4">
          {title}
        </h2>
        {pausedBadge && (
          <div className="relative inline-block ml-2 group">
            <button className="rounded-full p-[2px] bg-[#FFFFFF] border border-[#7E7E7E] cursor-pointer">
              <PlayIcon className="w-4 h-4 fill-[#7E7E7E]" />
            </button>
            <div className="absolute -right-[90px] transform -translate-x-1/2 -top-8 w-max bg-[#000000] text-[#FFFFFF] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {title} are paused by LinkedIn
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center mb-2 gap-[12px]">
        <span className="text-[12px] text-grey ">This Period</span>
        <span
          className={`flex items-center text-[10px] gap-[6px]  ${
            change?.includes("+") ? "text-[#34C759]" : "text-[#DE4B32]"
          }`}
        >
          {change?.includes("+") ? (
            <TopRateIcon className="w-4 h-4" />
          ) : (
            <LowRateIcon className="w-4 h-4" />
          )}
          {change}
        </span>
      </div>
      {/* bar */}
      <div className="w-full h-5 overflow-hidden mb-2">
        <div
          className="h-full rounded-[3px] bg-highlight text-[#FFFFFF] text-xs font-semibold text-right pr-2 flex items-center justify-end"
          style={{ width: `${Math.max(ThisPeriod, 25)}%` }}
        >
          {Topvalue}
        </div>
      </div>
      <div className="flex items-center mb-2 gap-[12px]">
        <span className="text-[12px] text-grey ">Last Period</span>
      </div>
      {/* bar */}
      <div className="w-full h-5 overflow-hidden mb-2">
        <div
          className="h-full rounded-[3px] bg-[#9C9C9C] text-[#FFFFFF] text-xs font-semibold text-right pr-2 flex items-center justify-end"
          style={{ width: `${Math.max(LowPeriod, 25)}%` }}
        >
          {Lowvalue}
        </div>
      </div>
    </div>
  );
};

export default PeriodCard;
