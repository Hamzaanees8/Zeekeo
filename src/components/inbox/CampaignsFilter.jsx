import { useState, useRef, useEffect } from "react";
import useInboxStore from "../../routes/stores/useInboxStore";
import { DropArrowIcon } from "../Icons";

export default function CampaignsFilter({ campaigns }) {
  const { filters, setFilters } = useInboxStore();
  const [showCampaigns, setShowCampaigns] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCampaignsText =
    filters.campaigns.length > 0
      ? `${filters.campaigns.length} ${
          filters.campaigns.length === 1
            ? " campaign selected"
            : " campaigns selected"
        }`
      : "All Campaigns";

  // close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCampaigns(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (campaignId, label) => {
    const current = filters.campaigns || [];
    let updated;
    if (!campaignId) {
      // "All Campaigns"
      updated = [];
    } else if (current.includes(campaignId)) {
      // already selected -> remove
      updated = current.filter(id => id !== campaignId);
    } else {
      // add
      updated = [...current, campaignId];
    }
    setFilters("campaigns", updated);
    setShowCampaigns(false);
  };

  return (
    <div className="relative w-[333px] cursor-pointer" ref={dropdownRef}>
      <div
        onClick={() => setShowCampaigns(prev => !prev)}
        className="w-full h-[35px] flex justify-between cursor-pointer font-urbanist items-center px-5 text-base font-medium text-[#7E7E7E] border border-[#7E7E7E] rounded-[6px] bg-white"
      >
        <span>{selectedCampaignsText}</span>
        <DropArrowIcon className="h-[14px] w-[12px]" />
      </div>

      {/* Dropdown Menu */}
      {showCampaigns && (
        <ul className="absolute mt-1 w-full bg-white border border-[#7E7E7E] z-50 shadow-md text-sm text-[#7E7E7E] rounded-[6px] overflow-hidden max-h-64 overflow-y-auto">
          <li
            className={`px-3 py-2 cursor-pointer font-medium ${
                filters.campaigns?.length == 0
                  ? "bg-gray-200 text-[#0096C7]"
                  : "hover:bg-gray-100"
              }`}
            onClick={() => handleSelect("", "All Campaigns")}
          >
            {" "}
            <span>All Campaigns</span>
          </li>

          {campaigns.map(campaign => (
            <li
              key={campaign.campaign_id}
              className={`px-3 py-2 cursor-pointer font-medium ${
                filters.campaigns?.includes(campaign.campaign_id)
                  ? "bg-gray-200 text-[#0096C7]"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleSelect(campaign.campaign_id, campaign.name)}
            >
              <span>{campaign.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
