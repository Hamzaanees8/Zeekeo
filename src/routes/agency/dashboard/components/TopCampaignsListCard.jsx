import { Link } from "react-router-dom";
import { RightTriangleIcon } from "../../../../components/Icons";
import TooltipInfo from "../../../dashboard/components/TooltipInfo";

const TopCampaignsListCard = ({
  title,
  data = [],
  campaignsList = [],
  tooltipText = "",
  viewAllLink = "#",
  lastUpdated = null,
  userData = [], // Add userData prop
}) => {
  // Filter campaigns that exist in campaignsList
  const filteredData = data.filter(campaign =>
    campaignsList.some(c => c.campaign_id === campaign.id),
  );

  const getCampaignName = campaignId => {
    const match = campaignsList.find(c => c.campaign_id === campaignId);
    return match ? match.name : "Unnamed Campaign";
  };

  const getUserLabel = userEmail => {
    const user = userData.find(u => u.value === userEmail);
    return user ? user.label : userEmail;
  };

  return (
    <div className="bg-[#ffffff] px-2 py-4 w-full shadow-md min-h-full relative flex flex-col rounded-[8px]">
      {/* Title */}
      <div className="text-[16px] text-[#1E1D1D] mb-2">{title}</div>

      {/* Campaigns List */}
      <div className="flex flex-col gap-3 flex-1 max-h-95 overflow-auto pr-1 custom-scroll">
        {filteredData.map((campaign, index) => {
          const campaignName = getCampaignName(campaign.id);
          const userName = getUserLabel(campaign.userEmail);

          return (
            <div
              key={campaign.id || index}
              className="border-t border-[#484848] pt-2"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="text-[20px] font-medium text-[#1E1D1D] font-urbanist">
                    {campaign.value || "0%"}
                  </div>
                  <div className="text-[12px] text-[#454545] hover:underline">
                    <p className="flex items-center gap-[18px] text-[12px] text-[#1E1D1D] font-normal cursor-pointer">
                      {campaignName}
                    </p>
                  </div>
                </div>
              </div>
              {/* User info */}
              <div className="text-[10px] text-[#7E7E7E] ml-2">
                by {userName}
              </div>
            </div>
          );
        })}

        {filteredData.length === 0 && (
          <div className="text-[12px] text-gray-500 py-4">
            No campaigns available
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between mt-4">
        {/* Last Updated + Tooltip */}
        <div className="flex items-center gap-2 text-[#7E7E7E]">
          {filteredData.length > 0 && lastUpdated && (
            <span className="italic text-[11px] text-gray-500">
              Last updated {lastUpdated}
            </span>
          )}
          {tooltipText && <TooltipInfo text={tooltipText} />}
        </div>
      </div>
    </div>
  );
};

export default TopCampaignsListCard;
