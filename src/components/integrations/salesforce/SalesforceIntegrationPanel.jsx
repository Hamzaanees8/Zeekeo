import { useState } from "react";
import SalesforceSettings from "./SalesforceSettings";
import SalesforceExistingContacts from "./SalesforceExistingContacts";
//import SalesforceCustomField from "./SalesforceCustomField";

const SalesforceIntegrationPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("contacts");

  const tabs = [
  //  { key: "custom-field-settings", label: "Custom Field Settings" },
    { key: "contacts", label: "Existing Contacts" },
    { key: "settings", label: "Export to Salesforce Settings" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md w-full min-h-[600px]">
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-[#7E7E7E] font-[500] font-urbanist text-[20px] font-semibold ">
          Salesforce Configuration
        </h2>
        <button variant="outline" size="sm" onClick={onClose} className="cursor-pointer text-[#7E7E7E] font-[500] ">
          X
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
              activeTab === tab.key
                ? "bg-[#0387FF] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "custom-field-settings" && <SalesforceCustomField />}
        {activeTab === "contacts" && <SalesforceExistingContacts />}
        {activeTab === "settings" && <SalesforceSettings />}
      </div>
    </div>
  );
};

export default SalesforceIntegrationPanel;
