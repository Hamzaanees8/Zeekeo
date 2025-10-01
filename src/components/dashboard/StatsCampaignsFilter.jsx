import { useState, useRef, useEffect } from "react";
import { DropArrowIcon } from "../Icons";

export default function StatsCampaignsFilter({
  campaigns,
  selectedCampaigns,
  setSelectedCampaigns,
}) {
  const [showCampaigns, setShowCampaigns] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCampaignsText =
    selectedCampaigns.length > 0
      ? `${selectedCampaigns.length} ${
          selectedCampaigns.length === 1
            ? " campaign selected"
            : " campaigns selected"
        }`
      : "All Campaigns";

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCampaigns(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (campaignId, label) => {
    let updated;
    if (!campaignId) {
      // reset to All Campaigns
      updated = [];
    } else if (selectedCampaigns.includes(campaignId)) {
      updated = selectedCampaigns.filter(id => id !== campaignId);
    } else {
      updated = [...selectedCampaigns, campaignId];
    }
    setSelectedCampaigns(updated);
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

      {showCampaigns && (
        <ul className="absolute mt-1 w-full bg-white border border-[#7E7E7E] z-50 shadow-md text-sm text-[#7E7E7E] rounded-[6px] overflow-hidden max-h-64 overflow-y-auto">
          <li
            className={`px-3 py-2 cursor-pointer font-medium ${
              selectedCampaigns.length === 0
                ? "bg-gray-200 text-[#0096C7]"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleSelect("", "All Campaigns")}
          >
            All Campaigns
          </li>

          {campaigns.map(campaign => (
            <li
              key={campaign.campaign_id}
              className={`px-3 py-2 cursor-pointer font-medium ${
                selectedCampaigns.includes(campaign.campaign_id)
                  ? "bg-gray-200 text-[#0096C7]"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleSelect(campaign.campaign_id, campaign.name)}
            >
              {campaign.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}