import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Profiles from "./Profiles";
import Settings from "./Settings";
import Schedule from "./Schedule";
import Stats from "./Stats";
import { Workflow } from "./Workflow";
import { EditProvider, useEditContext } from "./Context/EditContext";
const EditCampaignInner = () => {
  const tabs = ["Profiles", "Settings", "Schedule", "Workflows", "Stats"];
  const [activeTab, setActiveTab] = useState("Profiles");
  const { id } = useParams();
  const { setEditId, campaignName, loadingProfiles } = useEditContext();

  useEffect(() => {
    if (id) {
      setEditId(id);
    }
  }, [id, setEditId]);

  return (
    <div className="bg-[#EFEFEF] px-[30px] py-[70px] w-full">
      <h2 className="text-[#6D6D6D] font-medium text-[48px] font-urbanist">
        {campaignName}
      </h2>
      <div className="flex items-center justify-center gap-x-[23px] pt-[50px]">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(tab)}
            className={`px-[20px] w-[133px] cursor-pointer h-[34px] rounded-[6px] text-center text-base font-urbanist font-medium border border-[#0387FF] ${
              activeTab === tab
                ? "bg-[#0387FF] text-white"
                : "bg-white text-[#0387FF]"
            }`}
          >
            {tab === "Profiles" && loadingProfiles ? (
              <span className="flex items-center justify-center gap-x-1">
                {tab}
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            ) : (
              tab
            )}
          </button>
        ))}
      </div>
      {activeTab === "Profiles" && <Profiles />}
      {activeTab === "Settings" && <Settings />}
      {activeTab === "Schedule" && <Schedule />}
      {activeTab === "Workflows" && <Workflow />}
      {activeTab === "Stats" && <Stats />}
    </div>
  );
};

const EditCampaign = () => {
  return (
    <EditProvider>
      <EditCampaignInner />
    </EditProvider>
  );
};

export default EditCampaign;
