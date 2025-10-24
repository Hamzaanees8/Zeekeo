import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateHubspotSettings } from "../../services/integrations";
import { updateUserStore } from "../../services/users";
import { getCurrentUser } from "../../utils/user-helpers";

const HubspotSettings = () => {
  const [settings, setSettings] = useState({
    send_when_invite_sent: false,
    send_when_connected: false,
    send_when_reply_received: false,
    send_only_with_emails: false,
  });

  const user = getCurrentUser();

  useEffect(() => {
    if (user?.integrations?.hubspot?.settings) {
      setSettings(user.integrations.hubspot.settings);
    }
  }, [user]);

  const toggleSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateHubspotSettings({ settings });
      toast.success("HubSpot settings updated!");

      const user = getCurrentUser();
      const provider = "hubspot";
      const newData = {
        settings,
      };
      user.integrations[provider] = {
        ...user.integrations[provider],
        ...newData,
      };
      updateUserStore(user);
    } catch (err) {
      console.error("Error updating settings:", err);
      toast.error("Failed to update HubSpot settings.");
    }
  };

  const renderToggle = (label, key) => {
    const active = settings[key];

    return (
      <div key={key} className="flex items-center justify-between py-2">
        <div className="flex">
          <button
            type="button"
            className={`px-5 py-[4px] text-[14px] font-medium rounded-l-[6px] border border-[#DADADA] cursor-pointer
              ${
                active
                  ? "bg-[#16A37B] text-white border-[#16A37B]"
                  : "bg-[#F5F5F5] text-[#6D6D6D] hover:bg-[#EAEAEA]"
              }`}
            onClick={() => toggleSetting(key, true)}
          >
            Yes
          </button>
          <button
            type="button"
            className={`px-5 py-[4px] text-[14px] font-medium rounded-r-[6px] border border-l-0 border-[#DADADA] cursor-pointer
              ${
                active === false
                  ? "bg-[#6D6D6D] text-white border-[#6D6D6D]"
                  : "bg-[#F5F5F5] text-[#6D6D6D] hover:bg-[#EAEAEA]"
              }`}
            onClick={() => toggleSetting(key, false)}
          >
            No
          </button>
        </div>
        <div className="w-[70%] text-[14px] text-[#4B4B4B] ml-3">{label}</div>
      </div>
    );
  };

  const options = [
    {
      key: "send_when_invite_sent",
      label: "Automatically send prospects when invite is sent",
    },
    {
      key: "send_when_connected",
      label: "Automatically send prospects when they connect",
    },
    {
      key: "send_when_reply_received",
      label: "Automatically send prospects when they reply",
    },
    {
      key: "send_only_with_emails",
      label: "Only send profiles having emails",
    },
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px] border border-[#D6D6D6] rounded-[8px] shadow-sm">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Export to HubSpot settings
          </h2>
        </div>

        <div className="space-y-4">
          {options.map(({ key, label }) => renderToggle(label, key))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#16A37B] text-white rounded-md hover:bg-[#129366] cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default HubspotSettings;
