import React from "react";

const DeleteModal = ({ onClose, onClick, selectedProfiles }) => {
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
          {selectedProfiles?.length > 0
            ? `You are about to remove ${
                selectedProfiles.length
              } selected profile${
                selectedProfiles.length > 1 ? "s" : ""
              } from this campaign. This action cannot be undone.`
            : "Are you sure you want to delete this campaign? This action cannot be undone."}
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
            className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] rounded-[4px]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
