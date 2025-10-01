import { div } from "framer-motion/client";
import React, { useEffect, useState } from "react";
import useCampaignStore from "../../../stores/useCampaignStore";
import {
  campaignSettingsToggleOptions,
  proOnlyKeys,
} from "../../../../utils/campaign-helper";
import { GetActiveSubscription } from "../../../../services/billings";

const CampaignSetting = ({
  showUrl = true,
  url,
  onUrlChange,
  onToggle,
  type,
}) => {
  const [subscribedPlanId, setSubscribedPlanId] = useState("");
  const { campaignType, searchUrl, setSearchUrl, settings, setSettings } =
    useCampaignStore();

  const restrictedPlans = [
    "price_individual_pro_monthly",
    "price_individual_pro_quarterly",
    "price_agency_pro_monthly",
    "price_agency_pro_quarterly",
  ];

  useEffect(() => {
    const updated = { ...settings };
    proOnlyKeys.forEach(({ key }) => {
      if (updated[key] === undefined) {
        updated[key] = false; // default to No
      }
    });
    setSettings(updated);
  }, []);

  useEffect(() => {
    if (campaignType === "existing-connections") {
      setSettings({
        ...settings,
        include_first_degree_connections_only: true,
      });
    }
  }, [campaignType]);

  useEffect(() => {
    const fetchSubscription = async () => {
      const data = await GetActiveSubscription();
      setSubscribedPlanId(data?.items?.data[0]?.price?.lookup_key);
    };

    fetchSubscription();
  }, []);

  return (
    <div className="p-5 border-1 border-[#7E7E7E] bg-white rounded-[8px] shadow-md">
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
            className="w-full border border-[#7E7E7E] text-[#6D6D6D] placeholder:text-[#6D6D6D] bg-[#EFEFEF] rounded-[4px] px-3 py-2 mb-2 text-sm focus:outline-none focus:ring-0"
          />
          <p className="text-[#6D6D6D] text-[12px] mb-3">
            Paste the search URL from LinkedIn or Sales Navigator to use those
            leads in your campaign.
          </p>
        </>
      )}

      <div className="space-y-4">
        {/* 🔹 Normal options */}
        {campaignSettingsToggleOptions
          .filter(option => option.show?.includes(campaignType))
          .map(({ key, label, readOnly }) => (
            <div
              key={key}
              className="flex items-center justify-between text-[#6D6D6D] gap-7"
            >
              <div className="flex gap-0 border-1 border-[#6D6D6D] rounded-[4px]">
                <button
                  type="button"
                  className={`px-5 py-[2px] text-[14px] rounded-[4px] ${
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
                  className={`px-5 py-[2px] text-[14px] rounded-[4px] ${
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

        {/* 🔹 Pro only options (show only if subscribed to restricted plans) */}
        {restrictedPlans.includes(subscribedPlanId) &&
          proOnlyKeys.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between text-[#6D6D6D] gap-7"
            >
              <div className="flex gap-0 border-1 border-[#6D6D6D] rounded-[4px]">
                <button
                  type="button"
                  className={`px-5 py-[2px] text-[14px] rounded-[4px] cursor-pointer ${
                    settings[key]
                      ? "bg-[#16A37B] text-white"
                      : "bg-[#EFEFEF] text-[#6D6D6D]"
                  }`}
                  onClick={() => setSettings({ ...settings, [key]: true })}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`px-5 py-[2px] text-[14px] rounded-[4px] cursor-pointer ${
                    settings[key] === false
                      ? "bg-[#6D6D6D] text-white"
                      : "bg-[#EFEFEF] text-[#6D6D6D]"
                  }`}
                  onClick={() => setSettings({ ...settings, [key]: false })}
                >
                  No
                </button>
              </div>

              <div className="text-left w-[80%]">
                <span className="text-[16px] text-[#6D6D6D] ">{label}</span>
                {/* PRO badge only for autopilot + sentiment_analysis */}
                {[
                  "enable_inbox_autopilot",
                  "enable_sentiment_analysis",
                ].includes(key) && (
                  <span className="bg-[#12D7A8] ml-2 text-white text-[12px] px-2 py-[2px] rounded-[4px] font-semibold">
                    PRO
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CampaignSetting;
