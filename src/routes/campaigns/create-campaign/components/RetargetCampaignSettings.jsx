import { useState, useEffect, useRef } from "react";
import { DropArrowIcon } from "../../../../components/Icons";
import useCampaignStore from "../../../stores/useCampaignStore";
import { proOnlyKeys } from "../../../../utils/campaign-helper";
import { getCurrentUser } from "../../../../utils/user-helpers";

// Labels for existing campaign filters
const FILTER_LABELS = {
  first_degree_connections_only: "1st degree connections only",
  exclude_first_degree_connections: "Exclude 1st degree connections",
  first_degree_no_message: "1st degree who never received a message",
  invited_profiles_not_accepted: "Invited profiles (never accepted)",
  exclude_invited_profiles: "Exclude invited profiles",
  inmailed_profiles: "InMailed profiles only",
  exclude_inmailed_profiles: "Exclude InMailed profiles",
  skipped_profiles_only: "Skipped profiles only",
  exclude_skipped_profiles: "Exclude skipped profiles",
  open_profiles_only: "Open profiles only",
  non_open_profiles_only: "Non-open profiles only",
};

// Mutual exclusions
const MUTUAL_EXCLUSIONS = {
  first_degree_connections_only: ["exclude_first_degree_connections"],
  exclude_first_degree_connections: [
    "first_degree_connections_only",
    "first_degree_no_message",
  ],
  first_degree_no_message: ["exclude_first_degree_connections"],
  invited_profiles_not_accepted: [
    "exclude_invited_profiles",
    "first_degree_connections_only",
  ],
  exclude_invited_profiles: ["invited_profiles_not_accepted"],
  inmailed_profiles: ["exclude_inmailed_profiles"],
  exclude_inmailed_profiles: ["inmailed_profiles"],
  skipped_profiles_only: ["exclude_skipped_profiles"],
  exclude_skipped_profiles: ["skipped_profiles_only"],
  open_profiles_only: ["non_open_profiles_only"],
  non_open_profiles_only: ["open_profiles_only"],
};

const RetargetingCampaignSettings = ({
  campaigns = [],
  onChange,
  readOnly = false,
}) => {
  const [showCampaigns, setShowCampaigns] = useState(false);
  const dropdownRef = useRef(null);
  const [isProUser, setIsProUser] = useState(false);

  const {
    existingCampaignOptions,
    setExistingCampaignOptions,
    existingCampaign,
    setExistingCampaign,
    settings,
    setSettings,
  } = useCampaignStore();

  useEffect(() => {
    const user = getCurrentUser();
    setIsProUser(user?.pro || false);
  }, []);

  useEffect(() => {
    const updated = { ...settings };
    proOnlyKeys.forEach(({ key }) => {
      if (updated[key] === undefined) {
        updated[key] = false;
      }
    });
    setSettings(updated);
  }, []);

  // Handle toggling filters with mutual exclusion rules
  const toggleFilter = (key, value) => {
    console.log("Toggling filter:", key, "to", value, "readOnly:", readOnly);
    if (readOnly) return;

    const updated = { [key]: value };

    // Apply mutual exclusions
    if (MUTUAL_EXCLUSIONS[key] && value) {
      MUTUAL_EXCLUSIONS[key].forEach(excludeKey => {
        updated[excludeKey] = false;
      });
    }

    console.log("Updated campaign options to set:", updated);

    setExistingCampaignOptions(updated);
  };

  // Check if a filter should be disabled based on current selections
  const isFilterDisabled = key => {
    if (readOnly) return true;

    // Disable if mutual exclusion is active
    return MUTUAL_EXCLUSIONS[key]?.some(
      excludeKey => existingCampaignOptions[excludeKey],
    );
  };

  const renderToggle = (label, key) => {
    const active = existingCampaignOptions[key];
    const disabled = isFilterDisabled(key);

    return (
      <div
        key={key}
        className={`flex items-center justify-between py-2 ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center">
          <button
            type="button"
            className={`px-5 py-[4px] text-[14px] font-medium rounded-l-[6px] border border-[#DADADA]
              ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
              ${
                active
                  ? "bg-[#16A37B] text-white border-[#16A37B]"
                  : "bg-[#F5F5F5] text-[#6D6D6D] hover:bg-[#EAEAEA]"
              }`}
            onClick={() => !disabled && toggleFilter(key, true)}
            disabled={disabled}
          >
            Yes
          </button>
          <button
            type="button"
            className={`px-5 py-[4px] text-[14px] font-medium rounded-r-[6px] border border-l-0 border-[#DADADA]
              ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
              ${
                active === false
                  ? "bg-[#6D6D6D] text-white border-[#6D6D6D]"
                  : "bg-[#F5F5F5] text-[#6D6D6D] hover:bg-[#EAEAEA]"
              }`}
            onClick={() => !disabled && toggleFilter(key, false)}
            disabled={disabled}
          >
            No
          </button>
        </div>
        <div className="w-[70%] text-[15px] text-[#4B4B4B]">{label}</div>
      </div>
    );
  };

  // Handle campaign selection
  const handleSelectCampaign = campaign => {
    if (!campaign) setExistingCampaign(null);
    else setExistingCampaign(campaign);
    setShowCampaigns(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCampaigns(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Notify parent on change
  useEffect(() => {
    if (onChange) {
      onChange({
        campaign: existingCampaign,
        filters: existingCampaignOptions,
      });
    }
  }, [existingCampaignOptions, existingCampaign]);

  return (
    <div className="p-5 border border-[#D6D6D6] bg-white rounded-[8px] shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-[#3B3B3B]">
        Retargeting Filters
      </h2>

      {/* --- Campaign Dropdown --- */}
      <h3 className="text-md font-medium text-[#3B3B3B] mt-4 mb-1">
        Select Campaign to Retarget
      </h3>
      <div className="relative w-full cursor-pointer" ref={dropdownRef}>
        <div
          onClick={() => setShowCampaigns(prev => !prev)}
          className="w-full h-[35px] flex justify-between cursor-pointer font-urbanist items-center px-5 text-base font-medium text-[#7E7E7E] border border-[#7E7E7E] rounded-[6px] bg-white"
        >
          <span>
            {existingCampaign ? existingCampaign.name : "Select Campaign"}
          </span>
          <DropArrowIcon className="h-[14px] w-[12px]" />
        </div>

        {showCampaigns && (
          <ul className="absolute mt-1 w-full bg-white border border-[#7E7E7E] z-50 shadow-md text-sm text-[#7E7E7E] rounded-[6px] overflow-hidden max-h-64 overflow-y-auto">
            <li
              className={`px-3 py-2 cursor-pointer font-medium ${
                existingCampaign === null
                  ? "bg-gray-200 text-[#0096C7]"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleSelectCampaign(null)}
            >
              Select Campaign
            </li>
            {campaigns.map(c => (
              <li
                key={c.campaign_id}
                className={`px-3 py-2 cursor-pointer font-medium ${
                  existingCampaign?.id === c.campaign_id
                    ? "bg-gray-200 text-[#0096C7]"
                    : "hover:bg-gray-100"
                }`}
                onClick={() =>
                  handleSelectCampaign({ id: c.campaign_id, name: c.name })
                }
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- Existing Campaign Filters --- */}
      <h3 className="text-md font-medium text-[#3B3B3B] mt-4 mb-1">
        Base Audience & Engagement
      </h3>
      {Object.keys(existingCampaignOptions).map(key =>
        renderToggle(FILTER_LABELS[key], key),
      )}

      {/* --- Pro-only toggles --- */}
      {proOnlyKeys.map(({ key, label }) => {
        const isDisabled = !isProUser;
        const isActive = settings[key] || false;

        const togglePro = value => {
          if (readOnly || isDisabled) return;
          setSettings({ ...settings, [key]: value });
        };

        return (
          <div
            key={key}
            className="flex items-center justify-between text-[#6D6D6D] gap-7 mt-3"
          >
            <div className="flex gap-0">
              <button
                type="button"
                className={`px-5 py-[4px] text-[14px] font-medium rounded-l-[6px] border border-[#DADADA]
              ${
                isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
              }
              ${
                isActive
                  ? "bg-[#16A37B] text-white border-[#16A37B]"
                  : "bg-[#F5F5F5] text-[#6D6D6D] hover:bg-[#EAEAEA]"
              }`}
                disabled={isDisabled}
                onClick={() => togglePro(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`px-5 py-[4px] text-[14px] font-medium rounded-r-[6px] border border-l-0 border-[#DADADA]
              ${
                isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
              }
              ${
                isActive === false
                  ? "bg-[#6D6D6D] text-white border-[#6D6D6D]"
                  : "bg-[#F5F5F5] text-[#6D6D6D] hover:bg-[#EAEAEA]"
              }`}
                disabled={isDisabled}
                onClick={() => togglePro(false)}
              >
                No
              </button>
            </div>
            <div className="text-left w-[80%]">
              <span className="text-[16px] text-[#6D6D6D]">{label}</span>
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
        );
      })}
    </div>
  );
};

export default RetargetingCampaignSettings;
