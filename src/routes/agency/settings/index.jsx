import { useState, useMemo } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import Advanced from "./components/Advanced";
import { useAgencySettingsStore } from "../../stores/useAgencySettingsStore";
import { isWhitelabelDomain } from "../../../utils/whitelabel-helper";

const AgencySettings = () => {
  // Only show "Login Page" tab on whitelabel domains
  const tabs = useMemo(() => {
    const allTabs = ["Login Page", "Dashboard", "Advanced"];
    if (!isWhitelabelDomain()) {
      return allTabs.filter(tab => tab !== "Login Page");
    }
    return allTabs;
  }, []);

  const [activeTab, setActiveTab] = useState(isWhitelabelDomain() ? "Login Page" : "Dashboard");
  const renderTabContent = () => {
    switch (activeTab) {
      case "Login Page":
        return <LoginPage />;
      case "Dashboard":
        return <Dashboard />;
      case "Advanced":
        return <Advanced />;
      // case "Blacklist":
      //   return <Blacklist />;
      default:
        return null;
    }
  };
  const { background, textColor } = useAgencySettingsStore();
  return (
    <div className="flex flex-col gap-y-[56px] bg-[#EFEFEF] px-[26px] pt-[45px] pb-[200px]" style={{ backgroundColor: background || "#EFEFEF" }}>
      <h1 className="text-[#6D6D6D] text-[44px] font-[300]" style={{ color: textColor || "#6D6D6D" }}>Settings</h1>
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
