import { Link } from "react-router-dom";
import { RightTriangleIcon } from "../../../../components/Icons";
import TooltipInfo from "../../../dashboard/components/TooltipInfo";

const statusColorMap = {
  critical: "bg-[#FF3B30]", // Red
  warning: "bg-[#FFCC00]", // Yellow
  okay: "bg-[#34C759]", // Green
};

const NotificationsCard = ({ notifications = [], tooltipText }) => {
  return (
    <div className="bg-[#FFFFFF] px-4 py-4 w-full shadow-md min-h-full relative flex flex-col rounded-[8px] border border-[#7E7E7E]">
      {/* Title */}
      <div className="text-base text-[#6D6D6D] font-medium mb-2">
        Latest Notifications
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center flex-1 py-8">
        <span className="text-[#6D6D6D] text-sm font-medium">Coming Soon</span>
      </div>

      {/* Notifications */}
      {/* <div className="flex flex-col gap-3 flex-1">
        {notifications.map((item, index) => (
          <div key={index} className="border-t border-t-[#CCCCCC] pt-2">
            <div className="flex items-start gap-[13px]">
              <div className="relative flex-shrink-0">
                <div
                  className={`w-2 h-2 mt-2 rounded-full absolute top-[2px] left-0 ${
                    statusColorMap[item.status]
                  }`}
                />
              </div>
              <div className="min-w-0 ml-1">
                <div className="text-[13px] font-semibold text-[#6D6D6D] font-urbanist">
                  {item.username}
                </div>
                <div className="text-[12px] text-[#6D6D6D] line-clamp-2 overflow-hidden text-ellipsis">
                  {item.message}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Bottom CTA */}
      {/* <div className="flex items-center justify-between mt-4">
        <div className="text-[12px] text-[#1E1D1D] font-normal flex items-center gap-[18px] cursor-pointer">
          <Link to="/notifications">View All</Link>{" "}
          <RightTriangleIcon className="fill-[#1E1D1D]" size={8} />
        </div>
        <TooltipInfo text={tooltipText} className="" />
      </div> */}
    </div>
  );
};

export default NotificationsCard;
