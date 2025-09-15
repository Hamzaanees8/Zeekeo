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
  const { setEditId, campaignName } = useEditContext();

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
            className={`px-[20px] py-[6px] w-[133px] cursor-pointer h-[34px] rounded-[6px] text-center text-base font-urbanist font-medium border border-[#7E7E7E] ${
              activeTab === tab
                ? "bg-[#7E7E7E] text-white"
                : "bg-white text-[#7E7E7E]"
            }`}
          >
            {tab}
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
