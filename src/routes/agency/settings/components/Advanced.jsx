import React, { useEffect, useState } from "react";
import toast, { CheckmarkIcon } from "react-hot-toast";
import {
  updateAgencySettings,
  getAgencySettings,
} from "../../../../services/agency";

import {
  createApiKey,
  getApiKey,
  revokeApiKey,
} from "../../../../services/integrations";
import { CopyIcon, DeleteIcon } from "../../../../components/Icons";
import ActionPopup from "../../templates/components/ActionPopup";

const Advanced = () => {
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [enableReplies, setEnableReplies] = useState(false);
  const [enableAcceptInvite, setEnableAcceptInvite] = useState(false);
  const [javascriptCode, setJavascriptCode] = useState("");
  const [whiteLabelRequest, setWhiteLabelRequest] = useState("");
  const [remainingTabsdata, setRemainingTabsdata] = useState({});

  // API Key Specific States
  const [apiKey, setApiKey] = useState(null);
  const [isNewKey, setIsNewKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingKey, setLoadingKey] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAgencySettings();
        const advanced = data?.agency.settings?.advanced || {};
        if (advanced) {
          setJavascriptCode(advanced?.javascriptCode || "");
          setWhiteLabelRequest(advanced?.whiteLabelRequest || "");
          setEnableNotifications(advanced?.enableNotifications || false);
          setEnableReplies(advanced?.enableReplies || false);
          setEnableAcceptInvite(advanced?.enableAcceptInvite || false);
        }
        const Settings = data?.agency?.settings || {};
        if (Settings) {
          setRemainingTabsdata(Settings);
        }

        // Fetch API Key on load
        fetchKey();
      } catch (error) {
        console.error("Error fetching agency settings:", error);
        toast.error("Error fetching agency settings.");
      }
    };
    fetchData();
  }, []);

  const fetchKey = async () => {
    try {
      setLoadingKey(true);
      const response = await getApiKey();
      if (response?.api_key) {
        setApiKey(response.api_key);
        setIsNewKey(false);
      }
    } catch (error) {
      console.error("Error fetching API key", error);
    } finally {
      setLoadingKey(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      setLoadingKey(true);
      const response = await createApiKey();
      setApiKey(response.api_key);
      setIsNewKey(true);
      toast.success("API Key created successfully");
    } catch (error) {
      toast.error("Failed to create API key");
    } finally {
      setLoadingKey(false);
    }
  };

  const handleRevokeKey = async () => {
    try {
      setLoadingKey(true);
      await revokeApiKey();
      setApiKey(null);
      setIsNewKey(false);
      setShowRevokeModal(false);
      toast.success("API Key revoked");
    } catch (error) {
      toast.error("Failed to revoke key");
    } finally {
      setLoadingKey(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      updates: {
        settings: {
          advanced: {
            javascriptCode,
            whiteLabelRequest,
            enableNotifications,
            enableReplies,
            enableAcceptInvite,
          },
          login_page: remainingTabsdata?.login_page,
          dashboard: remainingTabsdata?.dashboard,
        },
      },
    };
    try {
      updateAgencySettings(payload);
      toast.success("Advanced settings updated successfully!");
    } catch (error) {
      toast.error("Error updating advanced settings.");
    }
  };

  return (
    <div>
      <div className="flex justify-between gap-x-3 text-[#6D6D6D]">
        {/* Javascript Code Section */}
        <div className="flex-1 flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-urbanist bg-[#FFFFFF] w-[415px] rounded-[8px] shadow-md">
          <p className="text-[20px] font-medium">Javascript Code</p>
          <p className="text-[14px] font-medium">
            Allows you to offer custom support through a third party software
            like Intercom, Drift, Botfuse, etc...
          </p>
          <div>
            <p className="font-poppins font-normal text-base">Code</p>
            <textarea
              value={javascriptCode}
              onChange={(e) => setJavascriptCode(e.target.value)}
              className="w-full border border-[#7E7E7E] min-h-[400px] p-3 text-[14px] font-normal focus:outline-none rounded-[6px]"
            ></textarea>
          </div>
        </div>

        {/* Right Section: White Label & Notifications & API */}
        <div className="flex-1 border border-[#7E7E7E] p-6 w-[670px] bg-[#FFFFFF] flex flex-col gap-y-6 rounded-[8px] shadow-md">
          <p className="text-[14px] font-medium">
            Agencies must have 5 active accounts to qualify for ‘White label
            Features.’
          </p>
          <label>
            <span className="text-base font-normal">White label Request</span>
            <div className="flex h-[40px]">
              <input
                value={whiteLabelRequest}
                onChange={(e) => setWhiteLabelRequest(e.target.value)}
                className="flex-1 border p-2 border-[#6D6D6D] bg-white text-[#7E7E7E] focus:outline-none rounded-l-[6px]"
              />
              <button className="bg-[#6D6D6D] text-white px-4 cursor-pointer rounded-r-[6px]">
                Request
              </button>
            </div>
          </label>
          <hr className="border-[#6D6D6D] border" />

          <div className="flex flex-col gap-y-[18px]">
            {/* Notification Toggles (Kept your existing UI) */}
            <div className="flex items-center gap-x-6">
              <div className="flex flex-col text-[#7E7E7E] text-[14px] w-[460px]">
                <p className="font-bold">Notifications</p>
                <p className="font-medium">
                  Auto send email notification when disconnected.
                </p>
              </div>
              <button
                onClick={() => setEnableNotifications(!enableNotifications)}
                className={`px-3 py-2 text-center w-[130px] h-9 cursor-pointer rounded-[6px] ${
                  enableNotifications
                    ? "bg-[#16A37B] text-white"
                    : "bg-[#7E7E7E] text-white"
                }`}
              >
                {enableNotifications ? "Enabled" : "Disabled"}
              </button>
            </div>

            {/* API Key Management Section */}
            <div className="mt-3 flex justify-between items-start border-t pt-6">
              <div className="flex flex-col text-[#7E7E7E] text-[14px] w-[440px]">
                <p className="font-bold">API Key</p>
                <p className="font-medium">
                  A programmatic method to access reporting data in Dashboard.
                </p>

                {/* Dynamically show the Key or status if it exists */}
                {apiKey && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={apiKey}
                        className="flex-1 bg-gray-50 border border-gray-300 text-gray-500 rounded px-3 py-1 font-mono text-xs focus:outline-none"
                      />
                      {isNewKey && (
                        <button
                          onClick={handleCopy}
                          className="p-1 border rounded hover:bg-gray-100 cursor-pointer"
                        >
                          {copied ? (
                            <CheckmarkIcon className="w-4 h-4" />
                          ) : (
                            <CopyIcon className="w-4 h-4 fill-[#00B4D8]" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setShowRevokeModal(true)}
                        className="p-1 border rounded border-red-200 text-red-500 hover:bg-red-50 cursor-pointer"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                    {isNewKey ? (
                      <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">
                        Copy now - hidden after refresh!
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Key is masked for security.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-y-[10px] w-[180px]">
                <span className="bg-[#FFFFFF] border-2 border-[#0096c7] text-[#0096c7] px-3 py-2 text-center cursor-pointer rounded-[20px] text-[14px] font-medium">
                  How API works
                </span>
                <a
                  href="https://docs.zeekeo.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#FFFFFF] border-2 border-[#0096c7] text-[#0096c7] px-3 py-1.5 text-center cursor-pointer rounded-[20px] text-[12px] font-medium"
                >
                  API Docs
                </a>

                {/* Primary Action Button */}
                {!apiKey ? (
                  <button
                    onClick={handleCreateKey}
                    disabled={loadingKey}
                    className="bg-[#0387FF] border-2 border-[#0387FF] text-[#FFFFFF] px-3 py-1.5 text-center cursor-pointer rounded-[20px] text-[12px] font-medium disabled:opacity-50"
                  >
                    {loadingKey ? "Generating..." : "Create API Key"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-100 border-2 border-gray-300 text-gray-400 px-3 py-1.5 text-center rounded-[20px] text-[12px] font-medium"
                  >
                    Key Active
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-end">
        <button
          className="mt-4 px-4 py-1 w-[130px] text-white bg-[#0387FF] border border-[#0387FF] cursor-pointer rounded-[4px]"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && (
        <ActionPopup
          title="Revoke Agency API Key"
          confirmMessage="Are you sure? Any integrations using this key will stop working immediately."
          onClose={() => setShowRevokeModal(false)}
          onSave={handleRevokeKey}
          isDelete={true}
        />
      )}
    </div>
  );
};

export default Advanced;
