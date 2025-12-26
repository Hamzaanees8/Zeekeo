import React from "react";

const StartCampaignModal = ({ onClose, onConfirm }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px] rounded-[8px]">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Start Campaign
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
          Are you sure you want to start this campaign? You will not be able to
          make any further changes to the workflow nodes once it has started.
        </p>
        <div className="flex justify-end gap-4 font-medium text-base font-urbanist">
          <button
            onClick={onClose}
            className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1 text-white bg-[#0387FF] cursor-pointer border border-[#0387FF] rounded-[4px]"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartCampaignModal;
