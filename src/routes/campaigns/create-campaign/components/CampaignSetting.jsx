import { useEffect, useState } from "react";
import useCampaignStore from "../../../stores/useCampaignStore";
import {
  campaignSettingsToggleOptions,
  proOnlyKeys,
} from "../../../../utils/campaign-helper";
import { getCurrentUser } from "../../../../utils/user-helpers";

const CampaignSetting = ({
  showUrl = true,
  url,
  onUrlChange,
  onToggle,
  type,
}) => {
  const { campaignType, searchUrl, setSearchUrl, settings, setSettings, workflow, setWorkflow } =
    useCampaignStore();
  const [isProUser, setIsProUser] = useState(false);

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

  useEffect(() => {
    if (campaignType === "existing-connections") {
      const newSettings = { ...settings };
      if ("exclude_first_degree_connections" in newSettings) {
        delete newSettings.exclude_first_degree_connections;
      }
      newSettings.include_first_degree_connections_only = true;
      proOnlyKeys.forEach(({ key }) => {
        newSettings[key] = false;
      });

      setSettings(newSettings);
    }
  }, [campaignType, isProUser]);

  const handleProSettingChange = (key, value) => {
    if (!isProUser) return;

    setSettings({ ...settings, [key]: value });
  };

  const clearTemplateAssignments = () => {
    if (!workflow?.workflow?.nodes) return;

    const updatedNodes = workflow.workflow.nodes.map(node => {
      if (node.properties) {
        const { template_id, template_id_a, template_id_b, ...restProperties } = node.properties;
        return { ...node, properties: restProperties };
      }
      return node;
    });

    setWorkflow({
      ...workflow,
      workflow: {
        ...workflow.workflow,
        nodes: updatedNodes,
      },
    });
  };

  const handleABTestingToggle = (value) => {
    clearTemplateAssignments();
    setSettings({ ...settings, enable_ab_testing: value });
  };

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
        {campaignSettingsToggleOptions
          .filter(option => option.show?.includes(campaignType))
          .map(({ key, label, readOnly }) => {
            const handleToggle = (value) => {
              if (key === "enable_ab_testing") {
                handleABTestingToggle(value);
              } else {
                setSettings({ ...settings, [key]: value });
              }
            };

            return (
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
                        : () => handleToggle(true)
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
                        : () => handleToggle(false)
                    }
                  >
                    No
                  </button>
                </div>
                <div className="text-left w-[80%]">
                  <span className="text-[16px] text-[#6D6D6D] ">{label}</span>
                </div>
              </div>
            );
          })}

        {/* Separator before PRO settings */}
        <hr className="border-t border-[#C7C7C7] my-5" />

        {proOnlyKeys.map(({ key, label }) => {
          const isDisabled =
            !isProUser || campaignType === "existing-connections";
          const isActive = settings[key] || false;

          return (
            <div
              key={key}
              className="flex items-center justify-between text-[#6D6D6D] gap-7"
            >
              <div className="flex gap-0 border-1 border-[#6D6D6D] rounded-[4px]">
                <button
                  type="button"
                  className={`px-5 py-[2px] text-[14px] rounded-[4px] ${
                    isDisabled
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  } ${
                    isActive
                      ? "bg-[#16A37B] text-white"
                      : "bg-[#EFEFEF] text-[#6D6D6D]"
                  }`}
                  disabled={isDisabled}
                  onClick={
                    isDisabled
                      ? undefined
                      : () => handleProSettingChange(key, true)
                  }
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`px-5 py-[2px] text-[14px] rounded-[4px] ${
                    isDisabled
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  } ${
                    !isActive
                      ? "bg-[#6D6D6D] text-white"
                      : "bg-[#EFEFEF] text-[#6D6D6D]"
                  }`}
                  disabled={isDisabled}
                  onClick={
                    isDisabled
                      ? undefined
                      : () => handleProSettingChange(key, false)
                  }
                >
                  No
                </button>
              </div>

              <div className="text-left w-[80%]">
                <span className="text-[16px] text-[#6D6D6D] ">{label}</span>
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
    </div>
  );
};

export default CampaignSetting;
