import { useState } from "react";
import toast from "react-hot-toast";
import { DropArrowIcon } from "../../../../components/Icons";

const ActionPopup = ({
  title = "Perform Action",
  showSelect = false,
  folders = [],
  onClose,
  onSave,
  confirmMessage = "",
  checkCondition = () => false,
  isDelete = false, // ✅ NEW PROP
}) => {
  const [selectedValue, setSelectedValue] = useState("");
  const [showError, setShowError] = useState(false);

  const handleSave = () => {
    if (checkCondition(selectedValue)) {
      toast.error(confirmMessage);
    } else {
      onSave(selectedValue);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white w-[450px] max-h-[90vh] overflow-auto shadow-lg p-5 relative border border-[#7E7E7E] rounded-[8px]">
        <h2 className="text-[#0387FF] text-lg font-semibold mb-4">{title}</h2>
        <button
          className="absolute top-2 right-3 text-[25px] text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        {showSelect && (
          <div className="mb-4">
            <label className="block text-sm text-[#0387FF] mb-1">
              Select Folder
            </label>
            <div className="relative">
              <select
                className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] pr-10 appearance-none"
                value={selectedValue}
                onChange={e => {
                  setSelectedValue(e.target.value);
                  setShowError(false);
                }}
              >
                <option value="">Select a folder</option>
                {folders.map(folder => (
                  <option key={folder} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>
              <DropArrowIcon className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none fill-[#6D6D6D]" />
            </div>
          </div>
        )}

        {confirmMessage && (
          <p
            className={`text-sm mb-2 ${
              showError ? "text-red-500" : "text-[#6D6D6D]"
            }`}
          >
            {confirmMessage}
          </p>
        )}

        <div className="flex justify-between gap-2 mt-4">
          <button
            className="px-6 py-1 bg-[#7E7E7E] text-white text-sm cursor-pointer rounded-[4px]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-1 text-white text-sm cursor-pointer rounded-[4px] ${
              isDelete ? "bg-[#FF4D4F]" : "bg-[#0387FF]"
            }`}
            onClick={handleSave}
            disabled={showSelect && !selectedValue}
          >
            {isDelete ? "Delete" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPopup;
