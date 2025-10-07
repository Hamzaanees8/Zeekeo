import TooltipInfo from "../TooltipInfo.jsx";
import { RightTriangleIcon } from "../../../../components/Icons.jsx";
import { Link } from "react-router-dom";

const TopCampaignsListCard = ({
  title,
  campaigns = [],
  tooltipText = "",
  viewAllLink = "#",
}) => {

  console.log(campaigns)
  return (
    <div className="bg-[#ffffff] px-4 py-4 w-full shadow-md min-h-full relative flex flex-col rounded-[8px]">
      {/* Title */}
      <div className="text-[16px] text-[#1E1D1D] mb-2">{title}</div>

      {/* Campaigns List */}
      <div className="flex flex-col gap-3 flex-1">
        {campaigns.map((campaign, index) => (
          <div
            key={campaign.id || index}
            className="border-t border-[#484848] pt-2 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="text-[20px] font-medium text-[#1E1D1D] font-urbanist">
                {campaign.value || "0%"}
              </div>
              <div className="text-[12px] text-[#454545] hover:underline">
                <Link
                  to={`/campaigns/edit/${campaign.id}`}
                  className="flex items-center gap-[18px] text-[10px] text-[#1E1D1D] font-normal cursor-pointer"
                >
                  {campaign.name || "Unnamed Campaign"}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {campaigns.length === 0 && (
          <div className="text-[12px] text-gray-500 py-4">
            No campaigns available
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between mt-4">
        <Link
          to="/campaigns"
          className="flex items-center gap-[18px] text-[10px] text-[#1E1D1D] font-normal cursor-pointer"
        >
          View All
          <RightTriangleIcon className="fill-[#1E1D1D]" size={8} />
        </Link>

        {tooltipText && <TooltipInfo text={tooltipText} />}
      </div>
    </div>
  );
};

export default TopCampaignsListCard;
