import { useState } from "react";
import Invoice from "./components/Invoice";
import Subscription from "./components/Subscription";
import Cards from "./components/Cards";

const AgencyBilling = () => {
  const tabs = ["Invoice", "Subscription", "Cards"];
  const [activeTab, setActiveTab] = useState("Invoice");
  const renderTabContent = () => {
    switch (activeTab) {
      case "Invoice":
        return <Invoice />;
      case "Subscription":
        return <Subscription />;
      case "Cards":
        return <Cards />;
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
            className={`cursor-pointer px-3 py-1.5 text-[18px] font-normal border ${
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

export default AgencyBilling;
