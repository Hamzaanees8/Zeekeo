import React, { useState, useEffect } from "react";
import { APIKeys, CopyIcon, DeleteIcon } from "../../components/Icons";
import toast, { CheckmarkIcon } from "react-hot-toast";
import {
  createApiKey,
  getApiKey,
  revokeApiKey,
} from "../../services/integrations";
import ActionPopup from "../../routes/agency/templates/components/ActionPopup";

const ApiKeyIntegrationPanel = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState(null);
  const [isNewKey, setIsNewKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchKey();
  }, []);

  const fetchKey = async () => {
    try {
      setLoading(true);
      const response = await getApiKey();
      console.log("Fetched API key:", response);

      if (response?.api_key) {
        setApiKey(response.api_key);
        setIsNewKey(false);
      }
    } catch (error) {
      console.error("Error fetching API key", error);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    try {
      setLoading(true);

      const response = await createApiKey();

      setApiKey(response.api_key);
      setIsNewKey(true); // Mark as new so we show it fully
      toast.success("API Key created successfully");
    } catch (error) {
      toast.error("Failed to create API key");
    } finally {
      setLoading(false);
    }
  };

  const revokeKey = async () => {
    try {
      setLoading(true);
      setDeleteTarget(null);

      await revokeApiKey();

      setApiKey(null);
      setIsNewKey(false);
      toast.success("API Key revoked");
    } catch (error) {
      toast.error("Failed to revoke key");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md w-full min-h-[600px]">
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-[#7E7E7E] font-[500] font-urbanist text-[20px] font-semibold ">
          API Keys
        </h2>
        <button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="cursor-pointer text-[#7E7E7E] font-[500]"
        >
          X
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="p-2 bg-green-100 rounded-lg">
            <APIKeys className="w-6 h-6 text-[#16A37B]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              API Key Management
            </h3>
            <p className="text-sm text-gray-500">
              Manage API keys to access your data programmatically.
            </p>
          </div>
        </div>
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : (
          <div>
            {!apiKey ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">
                  You don't have an active API key yet.
                </p>
                <button
                  onClick={createKey}
                  className="bg-[#16A37B] hover:bg-[#128a68] text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto cursor-pointer"
                  disabled={loading}
                >
                  Create New API Key
                </button>
              </div>
            ) : (
              <div className="space-y-4 w-[750px]">
                <label className="block text-sm  text-gray-800 font-semibold mb-2">
                  Your API Key
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={apiKey}
                      className={`w-full bg-white border  border-gray-300 text-gray-500 rounded px-3 py-2 font-mono text-sm focus:outline-none`}
                    />
                  </div>
                  {isNewKey && (
                    <button
                      onClick={handleCopy}
                      className="p-2 text-gray-500 hover:text-[#16A37B] border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
                      title="Copy Key"
                    >
                      {copied ? (
                        <CheckmarkIcon className="w-5 h-5" />
                      ) : (
                        <CopyIcon className="w-5 h-5 p-[2px] border border-[#00B4D8] fill-[#00B4D8] cursor-pointer rounded-full" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setDeleteTarget({ type: "api-key", data: {} })
                    }
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors border border-gray-300 bg-white"
                    title="Revoke Key"
                    disabled={loading}
                  >
                    <DeleteIcon className="w-5 h-5 cursor-pointer" />
                  </button>
                </div>

                {isNewKey ? (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    Please copy this key now. For security reasons, it will not
                    be shown again.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">
                    This key is masked for security. If you lost it, you must
                    revoke it and generate a new one.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {deleteTarget?.type === "api-key" && (
        <ActionPopup
          title="Revoke API Key"
          confirmMessage="Are you sure you would like to revoke this API Key? It cannot be undone"
          onClose={() => setDeleteTarget(null)}
          onSave={revokeKey}
          isDelete={true}
        />
      )}
    </div>
  );
};

export default ApiKeyIntegrationPanel;
