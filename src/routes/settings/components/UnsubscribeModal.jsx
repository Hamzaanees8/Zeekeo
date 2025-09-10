import React from "react";
import { Cross } from "../../../components/Icons";

const UnsubscribeModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[550px] p-8 relative  rounded-[8px] shadow-md">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Edit Unsubscribe Option
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            <Cross />
          </button>
        </div>

        <label className="flex items-center mb-5 cursor-pointer space-x-3">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 accent-[#0387FF]"
          />
          <span className="text-[16px] text-[#6D6D6D]">Enabled</span>
        </label>

        <div className="mb-4">
          <label className="block text-[16px] font-urbanist text-[#7E7E7E] mb-1">
            Text to display as the Unsubscribe link
          </label>
          <input
            type="text"
            defaultValue=""
            placeholder="Click here to unsubscribe"
            className="w-full border border-[#7E7E7E]  px-3 py-2 text-sm text-[#7E7E7E] bg-white rounded-[6px]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[16px] font-urbanist text-[#7E7E7E] mb-1">
            Unsubscribe link position
          </label>
          <select
            defaultValue="After Signature"
            className="w-full border border-[#7E7E7E]  px-3 py-2 text-sm text-[#7E7E7E] bg-white  rounded-[6px]"
          >
            <option>Before Signature</option>
            <option>After Signature</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0387FF] text-white  px-4 py-1 rounded-[4px]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribeModal;
