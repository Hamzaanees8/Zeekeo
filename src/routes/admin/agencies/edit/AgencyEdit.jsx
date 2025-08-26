import { useNavigate, useParams } from "react-router";
import {
  BackButton,
  CalenderIcon,
  DropArrowIcon,
} from "../../../../components/Icons";
import { useState } from "react";
import EditTab from "./components/EditTab";
import UsersTab from "./components/UsersTab";
import LogsTab from "./components/LogsTab";
import StatsTab from "./components/StatsTab";
import APIKeysTab from "./components/APIKeysTab";
import { EditProvider, useEditContext } from "./context/EditContext";

const AgencyEditContent = () => {
  const { dateTo, dateFrom, setDateTo, setDateFrom } = useEditContext();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const navigate = useNavigate();
  const { id } = useParams();
  const tabs = ["Edit", "Users", "Logs", "Stats", "API Keys"];
  const [activeTab, setActiveTab] = useState("Edit");
  const formattedDateRange = `${dateFrom} - ${dateTo}`;
  const renderTabContent = () => {
    switch (activeTab) {
      case "Edit":
        return <EditTab />;
      case "Users":
        return <UsersTab />;
      case "Logs":
        return <LogsTab />;
      case "Stats":
        return <StatsTab />;
      case "API Keys":
        return <APIKeysTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-y-[56px] bg-[#EFEFEF] px-[26px] pt-[45px] pb-[200px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div
            className="cursor-pointer"
            onClick={() => navigate("/admin/agencies")}
          >
            <BackButton />
          </div>
          <h1 className="text-[#6D6D6D] text-[44px] font-[300]">{id}</h1>
        </div>
        {activeTab === "Logs" && (
          <div className="relative">
            <button
              onClick={toggleDatePicker}
              className="flex w-[267px] justify-between items-center border border-grey px-3 py-2 bg-white"
            >
              <CalenderIcon className="w-4 h-4 mr-2" />
              <span className="text-grey-light text-[12px]">
                {formattedDateRange}
              </span>
              <DropArrowIcon className="w-3 h-3 ml-2" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 rounded shadow-md p-4 z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">From:</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <label className="text-sm text-gray-600 mt-2">To:</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="mt-3 text-sm text-blues hover:underline self-end"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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

const AgencyEdit = () => (
  <EditProvider>
    <AgencyEditContent />
  </EditProvider>
);

export default AgencyEdit;
