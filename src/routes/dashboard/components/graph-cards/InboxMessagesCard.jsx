import TooltipInfo from "../TooltipInfo";
import { RightTriangleIcon } from "../../../../components/Icons.jsx";
import { Link } from "react-router-dom";

const InboxMessagesCard = ({ messages = [], tooltipText }) => {
  return (
    <div className="bg-[#FFFFFF] px-4 py-4 w-full shadow-md min-h-full relative flex flex-col justify-between rounded-[8px]">
      {/* Title */}
      <div className="text-[16px] text-[#1E1D1D] mb-0">
        Latest Inbox Messages
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3">
        {messages.map(msg => (
          <div key={msg.id} className="border-t border-[#484848]  pt-2">
            <div className="flex items-start gap-[13px]">
              <div className="w-2 h-2 mt-2 rounded-full bg-[#0387FF]" />
              <div>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-normal text-[#1E1D1D] hover:underline font-urbanist"
                >
                  {msg.profile_name}
                </a>
                <div
                  className="text-[10px] text-[#454545] line-clamp-2 overflow-hidden text-ellipsis"
                  dangerouslySetInnerHTML={{ __html: msg.message_body }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between mt-4 ">
        <div className="text-[10px] text-[#1E1D1D]  font-normal flex items-center gap-[18px] cursor-pointer">
          <Link to="/inbox">View All</Link>{" "}
          <RightTriangleIcon className="fill-[#1E1D1D]" size={8} />
        </div>
        <TooltipInfo text={tooltipText} className="" />
      </div>
    </div>
  );
};

export default InboxMessagesCard;
