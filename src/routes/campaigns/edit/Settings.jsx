import { useEditContext } from "./Context/EditContext";
import toast from "react-hot-toast";
import { updateCampaign } from "../../../services/campaigns";
import { useNavigate } from "react-router-dom";
export const campaignSettings = [
  {
    key: "exclude_first_degree_connections",
    label: "Exclude 1st-Degree Connections",
  },
  {
    key: "exclude_past_campaigns_targets",
    label: "Exclude Past Campaign Targets",
  },
  {
    key: "exclude_replied_profiles",
    label: "Exclude Prospects Who Have Replied to you in the Past",
  },
  {
    key: "split_open",
    label: "Split list into Premium (Open) and Non Premium Profiles",
  },
  {
    key: "import_open_only",
    label: "Import only Premium (Open) profiles",
  },
  {
    key: "autopilot",
    label: "Enable inbox autopilot",
  },
  {
    key: "sentiment_analysis",
    label: "Enable sentiment analysis",
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const {
    campaignName,
    setCampaignName,
    source,
    setSource,
    editId,
    profileUrls,
    setProfileUrls,
    settings,
    setSettings,
    subscribedPlanId,
  } = useEditContext();

  const handleSave = async () => {
    const payload = {
      name: campaignName,
      settings: settings,
      // source: {
      //   type: source,
      //   profile_urls: profileUrls,
      // },
    };
    try {
      await updateCampaign(editId, payload);
      toast.success("Settings updated successfully");
    } catch (err) {
      console.log("error", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to update settings:", err);
      }
    }
  };
  return (
    <div className="pt-[45px] items-center flex flex-col gap-y-[30px] text-[16px] text-[#7E7E7E] font-medium font-urbanist">
      <div>
        <p>Campaign Name</p>
        <input
          type="text"
          value={campaignName}
          onChange={e => setCampaignName(e.target.value)}
          className="h-[34px] border border-[#7E7E7E] bg-white w-[535px] mt-2 focus:outline-none px-3 py-[6px] rounded-[6px]"
        />
      </div>
      <div>
        <p>Source:</p>
        <input
          type="text"
          value={source}
          readOnly
          className="h-[34px] border border-[#7E7E7E] bg-white w-[535px] mt-2 focus:outline-none px-3 py-[6px] rounded-[6px]"
        />
      </div>
      {/* <div>
        <p>Profile URLs:</p>
        <textarea
          value={profileUrls.join("\n")}
          onChange={e =>
            setProfileUrls(
              e.target.value
                .split("\n")
                .map(url => url.trim())
                .filter(url => url),
            )
          }
          className="h-[105px] border border-[#7E7E7E] bg-white w-[535px] mt-2 focus:outline-none px-3 py-[6px]"
        />
      </div> */}

      <div className="w-[535px]">
        <div className="p-5 border-1 border-[#7E7E7E] bg-white rounded-[8px]">
          <div className="space-y-4">
            {campaignSettings
              .filter(({ key }) => {
                const restrictedPlans = [
                  "price_individual_pro_monthly",
                  "price_individual_pro_quarterly",
                  "price_agency_pro_monthly",
                  "price_agency_pro_quarterly",
                ];

                const alwaysVisible = [
                  "exclude_first_degree_connections",
                  "exclude_past_campaigns_targets",
                  "exclude_replied_profiles",
                  "split_open",
                  "import_open_only",
                ];

                if (alwaysVisible.includes(key)) {
                  return true;
                }

                if (restrictedPlans.includes(subscribedPlanId)) {
                  return ["autopilot", "sentiment_analysis"].includes(key);
                }
                return !["autopilot", "sentiment_analysis"].includes(key);
              })
              .map(({ key, label }) => {
              const isDisabled =
                key === "exclude_first_degree_connections" ||
                key === "exclude_past_campaigns_targets" ||
                key === "exclude_replied_profiles" ||
                key === "split_open" ||
                key === "import_open_only";

              return (
                <div
                  key={key}
                  className="flex items-center justify-between text-[#6D6D6D] gap-7"
                >
                  <div className="flex gap-0 border-1 border-[#6D6D6D] rounded-[4px]">
                    <button
                      type="button"
                      disabled={isDisabled}
                      className={`px-5 py-[2px] text-[14px] rounded-[4px] ${
                        settings[key]
                          ? "bg-[#16A37B] text-white"
                          : "bg-[#EFEFEF] text-[#6D6D6D]"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={() =>
                        !isDisabled && setSettings({ ...settings, [key]: true })
                      }
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      disabled={isDisabled}
                      className={`px-5 py-[2px] text-[14px] rounded-[4px] ${
                        settings[key] === false
                          ? "bg-[#6D6D6D] text-white"
                          : "bg-[#EFEFEF] text-[#6D6D6D]"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={() =>
                        !isDisabled && setSettings({ ...settings, [key]: false })
                      }
                    >
                      No
                    </button>
                  </div>
                  <div className="text-left w-[80%]">
                    <span className="text-[16px] text-[#6D6D6D] ">{label}</span>
                    {["autopilot", "sentiment_analysis"].includes(key) && (
                      <span className="bg-[#12D7A8] ml-2 text-[#fff] text-[12px] px-2 py-[2px] rounded-[4px] font-semibold">
                        PRO
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>
      <div className="flex justify-between font-medium text-[20px] font-urbanist w-[535px] mt-[30px]">
        <button
          onClick={() => navigate("/campaigns")}
          className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer w-[110px] rounded-[6px]"
        >
          Cancel
        </button>
        <button
          className="px-4 py-1 text-white bg-[#0387FF] cursor-pointer border border-[#0387FF] w-[134px] rounded-[6px] disabled:opacity-[.7] disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={true}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Settings;
