import { useState } from "react";

const FindReplaceModal = ({ onConfirm, onClose }) => {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const handleConfirm = () => {
    if (!findText.trim()) return;
    onConfirm(findText, replaceText);
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[470px] px-7 pt-[15px] pb-[28px] rounded-[8px] shadow-md">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Find and Replace
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        <div>
          <label className="block mb-2 text-sm text-[#7E7E7E]">Find</label>
          <input
            type="text"
            value={findText}
            onChange={e => setFindText(e.target.value)}
            className="w-full border border-[#7E7E7E] rounded p-2 mb-4 focus:outline-none text-[#7E7E7E]"
            placeholder="Text to find"
          />

          <label className="block mb-2 text-sm text-[#7E7E7E]">
            Replace with
          </label>
          <input
            type="text"
            value={replaceText}
            onChange={e => setReplaceText(e.target.value)}
            className="w-full border border-[#7E7E7E] rounded p-2 mb-4 focus:outline-none text-[#7E7E7E]"
            placeholder="Replacement text"
          />
        </div>
        <div className="flex justify-between gap-4 font-medium text-base font-urbanist mt-[20px]">
          <button
            onClick={onClose}
            className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1 text-white border border-[#04479C] bg-[#04479C] cursor-pointer rounded-[4px]"
          >
            Replace
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindReplaceModal;
