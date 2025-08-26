import { div } from "framer-motion/client";
import React, { useEffect } from "react";
import useCampaignStore from "../../../stores/useCampaignStore";
import { campaignSettingsToggleOptions } from "../../../../utils/campaign-helper";

const CampaignSetting = ({
  showUrl = true,
  url,
  onUrlChange,
  onToggle,
  type,
}) => {
  const { campaignType, searchUrl, setSearchUrl, settings, setSettings } =
    useCampaignStore();
  console.log("settings...", settings);

  useEffect(() => {
    if (campaignType === "existing-connections") {
      setSettings({
        ...settings,
        include_first_degree_connections_only: true,
      });
    }
  }, []);

  return (
    <div className="p-5 border-1 border-[#7E7E7E] bg-white">
      {campaignType === "sales-navigator" && (
        <>
          <h2 className="text-[#7E7E7E] text-[16px] font-semibold mb-2">
            Add Search URL
          </h2>
          <input
            type="text"
            placeholder="Search URL"
            value={searchUrl}
            onChange={e => setSearchUrl(e.target.value)}
            className="w-full border border-[#7E7E7E] text-[#6D6D6D] placeholder:text-[#6D6D6D] bg-[#EFEFEF] px-3 py-2 mb-2 text-sm focus:outline-none focus:ring-0"
          />
          <p className="text-[#6D6D6D] text-[12px] mb-3">
            Paste the search URL from LinkedIn or Sales Navigator to use those
            leads in your campaign.
          </p>
        </>
      )}

      <div className="space-y-4">
        {campaignSettingsToggleOptions
          .filter(option => option.show.includes(campaignType))
          .map(({ key, label, readOnly }) => (
            <div
              key={key}
              className="flex items-center justify-between text-[#6D6D6D] gap-7"
            >
              <div className="flex gap-0 border-1 border-[#6D6D6D]">
                <button
                  type="button"
                  className={`px-5 py-[2px] text-[14px] ${
                    readOnly
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  } ${
                    settings[key]
                      ? "bg-[#16A37B] text-white"
                      : "bg-[#EFEFEF] text-[#6D6D6D]"
                  }`}
                  disabled={readOnly}
                  onClick={
                    readOnly
                      ? undefined
                      : () => setSettings({ ...settings, [key]: true })
                  }
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`px-5 py-[2px] text-[14px] ${
                    readOnly
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  } ${
                    settings[key] === false
                      ? "bg-[#6D6D6D] text-white"
                      : "bg-[#EFEFEF] text-[#6D6D6D]"
                  }`}
                  disabled={readOnly}
                  onClick={
                    readOnly
                      ? undefined
                      : () => setSettings({ ...settings, [key]: false })
                  }
                >
                  No
                </button>
              </div>
              <div className="text-left w-[80%]">
                <span className="text-[16px] text-[#6D6D6D] ">{label}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CampaignSetting;
