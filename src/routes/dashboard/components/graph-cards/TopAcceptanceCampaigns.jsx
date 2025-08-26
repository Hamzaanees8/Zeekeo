import TooltipInfo from "../TooltipInfo";
import { RightTriangleIcon } from "../../../../components/Icons.jsx";

const messages = [
  {
    id: 1,
    percent: "85%",
    message: "UX Connections Campaign",
  },
  {
    id: 2,
    percent: "75%",
    message: "Custom Campaign",
  },
  {
    id: 3,
    percent: "65%",
    message: "Campaign 1",
  },
  {
    id: 4,
    percent: "55%",
    message: "Campaign 2",
  },
  {
    id: 5,
    percent: "45%",
    message: "Campaign 3",
  },
];

const TopAcceptanceCampaigns = () => {
  return (
    <div className="bg-[#ffffff] px-4 py-4 w-full shadow-sm min-h-full relative flex flex-col justify-between gap-2">
      {/* Title */}
      <div className="text-[16px] text-[#1E1D1D] mb-0">
        Top Acceptance Campaigns
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3">
        {messages.map(msg => (
          <div key={msg.id} className="border-t border-[#484848]  pt-2">
            <div className="flex items-start gap-[13px]">
              <div className="flex gap-1.5 items-center">
                <div className="text-[20px] font-medium text-[#1E1D1D] font-urbanist">
                  {msg.percent}
                </div>
                <div className="text-[12px] text-[#454545] hover:underline">
                  <a href="#" target="_blank" rel="">
                    {msg.message}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between mt-4 ">
        <div className="text-[10px] text-[#1E1D1D]  font-normal flex items-center gap-[18px] cursor-pointer">
          View All <RightTriangleIcon className="fill-[#1E1D1D]" size={8} />
        </div>
        <TooltipInfo
          text="This shows the percentage of responses received via different outreach types."
          className=""
        />
      </div>
    </div>
  );
};

export default TopAcceptanceCampaigns;
