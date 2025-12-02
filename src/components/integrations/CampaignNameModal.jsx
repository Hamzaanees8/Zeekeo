import React, { useState } from "react";

const CampaignNameModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [campaignName, setCampaignName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (campaignName.trim()) {
      onSubmit(campaignName.trim());
      setCampaignName("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-lg font-bold mb-4 text-[#04479C]">
          Create New Campaign
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="campaignName"
              className="block text-sm font-medium text-gray-700"
            >
              Campaign Name
            </label>
            <input
              type="text"
              id="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter campaign name"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!campaignName.trim() || isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                !campaignName.trim() || isLoading
                  ? "bg-[#0387FF] cursor-not-allowed"
                  : "bg-[#0387FF] cursor-pointer"
              }`}
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : null}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignNameModal;
