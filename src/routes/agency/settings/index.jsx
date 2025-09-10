import { useState } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import Advanced from "./components/Advanced";
import Blacklist from "./components/Blacklist";

const AgencySettings = () => {
  const tabs = ["Login Page", "Dashboard", "Advanced", "Blacklist"];
  const [activeTab, setActiveTab] = useState("Login Page");
  const renderTabContent = () => {
    switch (activeTab) {
      case "Login Page":
        return <LoginPage />;
      case "Dashboard":
        return <Dashboard />;
      case "Advanced":
        return <Advanced />;
      case "Blacklist":
        return <Blacklist />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-y-[56px] bg-[#EFEFEF] px-[26px] pt-[45px] pb-[200px]">
      <h1 className="text-[#6D6D6D] text-[44px] font-[300]">Settings</h1>
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

export default AgencySettings;
