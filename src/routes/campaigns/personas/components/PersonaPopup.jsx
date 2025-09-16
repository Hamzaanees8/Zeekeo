import React from "react";

const PersonaPopup = ({ onClose, onConfirm, message, title, confirmText }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-[450px] max-h-[90vh] overflow-auto shadow-lg p-5 relative border border-[#7E7E7E] rounded-[6px]">
        {/* Close Button */}
        <button
          className="absolute top-2 right-3 text-[25px] text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-[#04479C] text-lg font-semibold mb-4">{title}</h2>

        {/* Message */}
        <div className="pb-6 text-[#6D6D6D] text-sm">{message}</div>
        <hr className="border-[#6D6D6D]" />

        {/* Footer Buttons */}
        <div className="flex justify-between gap-3 mt-6">
          <button
            className="px-6 py-1 bg-[#7E7E7E] text-white text-sm cursor-pointer rounded-[4px]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-1  text-sm cursor-pointer rounded-[4px] ${
              confirmText === "Delete"
                ? "text-[#FF4D4F] border border-[#FF4D4F] "
                : confirmText === "Clone"
                ? "bg-[#0387FF] text-white"
                : "text-white"
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonaPopup;
