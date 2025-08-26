import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import EditTab from './EditTab';
import LogsTab from './LogsTab';
import StatsTab from './StatsTab';
import DockersTab from './DockersTab';
// import BackButton from './BackButton'; 

const UserEdits = () => {
  const navigate = useNavigate();
  const tabs = ["Edit", "Logs", "Stats", "Dockers"];
  const [activeTab, setActiveTab] = useState("Edit");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Edit":
        return <EditTab />;
      case "Logs":
        return <LogsTab />;
      case "Stats":
        return <StatsTab />;
      case "Dockers":
        return <DockersTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-y-[56px] bg-[#EFEFEF] px-[26px] pt-[45px] pb-[200px]">
      <div className="flex items-center gap-x-4">
        <div
          className="cursor-pointer"
          onClick={() => navigate("/admin/users")}
        >
          {/* <BackButton /> */}
        </div>
        <h1 className="text-[#6D6D6D] text-[44px] font-[300]">
          Dashboard.zopto.com
        </h1>
      </div>

      <div>
        <div className="flex items-center justify-center gap-x-4 mt-8">
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
        <div className="mt-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default UserEdits;
