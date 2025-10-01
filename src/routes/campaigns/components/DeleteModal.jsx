import React from "react";

const DeleteModal = ({ onClose, onClick, onArchive, status, onUnarchive }) => {
  console.log("Status in DeleteModal:", status);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px] rounded-[8px]">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Campaign Actions
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
          Are you sure you want to permanently delete this campaign? This
          action cannot be undone. If you only want to hide it, you can archive
          the campaign instead.
        </p>
        <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
          <button
            onClick={onClose}
            className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
          >
            Cancel
          </button>
          <div className="flex items-center gap-x-5">
            {status === "archived" ? (
              <button
                onClick={onUnarchive}
                className="px-4 py-1 text-[#0387FF] bg-white cursor-pointer border border-[#0387FF] rounded-[4px]"
              >
                Unarchive Campaign
              </button>
            ) : (
              <button
                onClick={onArchive}
                className="px-4 py-1 text-[#0387FF] bg-white cursor-pointer border border-[#0387FF] rounded-[4px]"
              >
                Archive Campaign
              </button>
            )}

            <button
              onClick={onClick}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] rounded-[4px]"
            >
              Delete Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
