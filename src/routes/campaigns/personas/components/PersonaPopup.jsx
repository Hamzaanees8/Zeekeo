import React from "react";

const PersonaPopup = ({ onClose, onConfirm, message  }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white w-[450px] max-h-[90vh] overflow-auto shadow-lg p-5 relative border border-[#7E7E7E]">
        {/* Close Button */}
        <button
          className="absolute top-2 right-3 text-[25px] text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-[#04479C] text-lg font-semibold mb-4">Delete Message</h2>

        {/* Message */}
        <div className="px-6 pb-6 text-[#6D6D6D] text-sm">
          {message}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between gap-3 mt-6">
          <button
            className="px-6 py-1 bg-[#7E7E7E] text-white text-sm cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-1 bg-[#FF4D4F] text-white text-sm cursor-pointer"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonaPopup;
