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
  max = 300, // no longer needed
  low = 500, // no longer needed
  change,
  bg = "bg-[#F4F4F4]",
  icon: Icon,
  type,
  pausedBadge = false,
  pausedTimestamp = null,
}) => {
  const topNum = Number(Topvalue);
  const lowNum = Number(Lowvalue);

  const maxPeriodValue = Math.max(topNum, lowNum);

  const scaleFactor = maxPeriodValue > 0 ? maxPeriodValue : 100;

  const ThisPeriod = Math.min((topNum / scaleFactor) * 100, 100).toFixed(1);
  const LowPeriod = Math.min((lowNum / scaleFactor) * 100, 100).toFixed(1);

  const formatPauseTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Get timezone abbreviation
    const timezone = date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];

    return `${day}/${month}/${year} at ${hours}:${minutes} ${timezone}`;
  };

  const getPauseTooltipText = () => {
    const formattedDate = formatPauseTimestamp(pausedTimestamp);
    const isInvites = title.toLowerCase().includes('invite');

    if (isInvites) {
      return (
        <span>
          Paused on {formattedDate}. <br /> <br />
          Your invites have been paused by LinkedIn at the date and time shown. Launchpad will retry sending invites 2 hours after the pause. This indicates that a pause has occurred, even if you do not see any change in your activity.
        </span>
      );
    } else {
      return (
        <span>
          Paused on {formattedDate}. <br /> <br />
          This pause indicates that LinkedIn has temporarily stopped your InMail sending at the time shown. InMail limits vary by profile, so pauses can occur when a limit is reached. Launchpad will automatically retry sending your InMail within 2 hours.
        </span>
      );
    };
  };
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
              <PlayIcon className="w-4 h-4 fill-[#f61d00]" />
            </button>
            <div className="absolute -right-[90px] transform -translate-x-1/2 -top-8 w-[300px] bg-[#f61d00] text-[#FFFFFF] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {pausedTimestamp ? getPauseTooltipText() : `${title} are paused by LinkedIn`}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center mb-2 gap-[12px]">
        <span className="text-[12px] text-grey ">This Period</span>
        <span
          className={`flex items-center text-[10px] gap-[6px]  ${change?.includes("+") ? "text-[#34C759]" : "text-[#DE4B32]"
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
          style={{ width: `${Math.max(ThisPeriod, 10)}%` }}
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
          style={{ width: `${Math.max(LowPeriod, 10)}%` }}
        >
          {Lowvalue}
        </div>
      </div>
    </div>
  );
};

export default PeriodCard;
