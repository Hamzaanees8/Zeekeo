import { useState } from "react";
import Invite from "./components/Invite";
import Sequence from "./components/Sequence";
import Email from "./components/Email";
import Inmail from "./components/Inmail";
import Responses from "./components/Responses";

const AgencyTemplates = () => {
  const tabs = ["Invite", "Sequence", "Email Sequence", "Inmail", "Responses"];
  const [activeTab, setActiveTab] = useState("Invite");
  const renderTabContent = () => {
    switch (activeTab) {
      case "Invite":
        return <Invite />;
      case "Sequence":
        return <Sequence />;
      case "Email Sequence":
        return <Email />;
      case "Inmail":
        return <Inmail />;
      case "Responses":
        return <Responses />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-y-[56px] bg-[#EFEFEF] px-[26px] pt-[45px] pb-[200px]">
      <h1 className="text-[#6D6D6D] text-[44px] font-[300]">Templates</h1>
      <div className="flex items-center justify-center gap-x-4">
        {tabs.map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer px-3 py-1.5 text-[18px] font-normal border rounded-[6px] ${
              activeTab === tab
                ? "bg-[#969696] border-[#969696] text-white"
                : "bg-white border-[#969696] text-[#6D6D6D]"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default AgencyTemplates;
