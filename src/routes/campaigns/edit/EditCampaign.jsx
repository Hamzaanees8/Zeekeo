import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Profiles from "./Profiles";
import ProfilesUrl from "./ProfilesUrl";
import Settings from "./Settings";
import Schedule from "./Schedule";
import Stats from "./Stats";
import { Workflow } from "./Workflow";
import { EditProvider, useEditContext } from "./Context/EditContext";
const EditCampaignInner = () => {
  const tabs = [
    "Profiles",
    "Profiles Url ",
    "Settings",
    "Schedule",
    "Workflows",
    "Stats",
  ];
  const [activeTab, setActiveTab] = useState("Profiles");
  // Track which tabs have been visited (for lazy loading)
  const [visitedTabs, setVisitedTabs] = useState(new Set(["Profiles"]));
  const { id } = useParams();
  const { setEditId, campaignName, loadingProfiles } = useEditContext();

  // Mark tab as visited when switched to
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setVisitedTabs(prev => {
      if (prev.has(tab)) return prev;
      const newSet = new Set(prev);
      newSet.add(tab);
      return newSet;
    });
  };

  useEffect(() => {
    if (id) {
      setEditId(id);
    }
  }, [id, setEditId]);

  return (
    <div className="px-[30px] py-[70px] w-full" style={{ backgroundColor: 'var(--page-bg-color, #EFEFEF)' }}>
      <h2 className="font-medium text-[48px] font-urbanist" style={{ color: 'var(--page-text-color, #6D6D6D)' }}>
        {campaignName}
      </h2>
      <div className="flex items-center justify-center gap-x-[23px] pt-[50px]">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(tab)}
            className={`px-[20px] w-[133px] cursor-pointer h-[34px] rounded-[6px] text-center text-base font-urbanist font-medium border border-[#0387FF] ${activeTab === tab
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
      {/* Lazy load tabs: only mount when first visited, then keep mounted */}
      {visitedTabs.has("Profiles") && (
        <div style={{ display: activeTab === "Profiles" ? "block" : "none" }}>
          <Profiles />
        </div>
      )}
      {visitedTabs.has("Profiles Url ") && (
        <div style={{ display: activeTab === "Profiles Url " ? "block" : "none" }}>
          <ProfilesUrl />
        </div>
      )}
      {visitedTabs.has("Settings") && (
        <div style={{ display: activeTab === "Settings" ? "block" : "none" }}>
          <Settings />
        </div>
      )}
      {visitedTabs.has("Schedule") && (
        <div style={{ display: activeTab === "Schedule" ? "block" : "none" }}>
          <Schedule />
        </div>
      )}
      {visitedTabs.has("Workflows") && (
        <div style={{ display: activeTab === "Workflows" ? "block" : "none" }}>
          <Workflow />
        </div>
      )}
      {visitedTabs.has("Stats") && (
        <div style={{ display: activeTab === "Stats" ? "block" : "none" }}>
          <Stats />
        </div>
      )}
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
