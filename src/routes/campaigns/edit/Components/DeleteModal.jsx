import React from "react";

const DeleteModal = ({ onClose, onClick, selectedProfiles, deleteType = "campaign", message }) => {
  // Messages based on deleteType
  const getMessage = () => {
    if (deleteType === "profile") {
      if (selectedProfiles?.length > 0) {
        return `You are about to delete ${selectedProfiles.length} selected profile URL${
          selectedProfiles.length > 1 ? "s" : ""
        }. This action cannot be undone.`;
      } else {
        return "Are you sure you want to delete this profile URL? This action cannot be undone.";
      }
    } else {
      // Default campaign message
      if (selectedProfiles?.length > 0) {
        return `You are about to remove ${
          selectedProfiles.length
        } selected profile${
          selectedProfiles.length > 1 ? "s" : ""
        } from this campaign. This action cannot be undone.`;
      } else {
        return "Are you sure you want to delete this campaign? This action cannot be undone.";
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px] rounded-[8px]">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Confirmation Modal
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
          {message || getMessage()}
        </p>
        <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
          <button
            onClick={onClose}
            className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
          >
            Cancel
          </button>
          <button
            onClick={onClick}
            className="px-4 py-1 text-[#ffffff] bg-[#D80039] cursor-pointer border border-[#D80039] rounded-[4px]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;