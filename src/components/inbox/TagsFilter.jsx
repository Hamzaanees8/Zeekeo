import { useState, useRef, useEffect } from "react";
import useInboxStore from "../../routes/stores/useInboxStore";
import { DeleteIcon, DropArrowIcon, Cross } from "../Icons";
import toast from "react-hot-toast";
import { deleteAllLabels, deleteLabel } from "../../services/users";

export default function TagsFilter({
  tagOptions,
  setShowAddTagPopup,
  setCustomLabels,
  onLabelsChange,
}) {
  const { filters, setFilters, customLabels } = useInboxStore();
  const [showTags, setShowTags] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState(null);
  const dropdownRef = useRef(null);

  // close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTags(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let selectedOption = null;
  if (filters.label) {
    selectedOption = tagOptions.find(opt => opt.value === filters.label);
  } else if (filters.read === false) {
    selectedOption = tagOptions.find(opt => opt.type === "read");
  }
  const selectedTag = selectedOption ? selectedOption.label : "Tags";

  return (
    <div className="relative h-[35px]" ref={dropdownRef}>
      {/* Dropdown button */}
      <div
        className="cursor-pointer h-[35px] w-[210px] justify-between border border-[#7E7E7E] px-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2 rounded-[6px]"
        onClick={() => setShowTags(prev => !prev)}
      >
        <span>{selectedTag}</span>
        <DropArrowIcon className="h-[14px] w-[12px]" />
      </div>

      {/* Dropdown list */}
      {showTags && (
        <div className="absolute max-h-[650px] overflow-y-auto custom-scroll1 left-0 w-[204px] bg-white border border-[#7E7E7E] z-50 shadow-md text-sm text-[#7E7E7E] rounded-[6px] overflow-hidden">
          {tagOptions.map((opt, idx) => {
            if (opt.type === "action") {
              return (
                <div
                  key={idx}
                  className="flex justify-between py-2 px-3 cursor-pointer hover:bg-gray-100 font-semibold text-blue-500"
                  onClick={() => {
                    setShowAddTagPopup(true);
                    setShowTags(false);
                  }}
                >
                  <span>{opt.label}</span>
                </div>
              );
            }
            // Determine if this option corresponds to a user-created custom label
            const isCustomLabel = customLabels.some(
              l =>
                l.name &&
                l.name.trim().toLowerCase() ===
                String(opt.label).trim().toLowerCase(),
            );

            return (
              <div
                key={idx}
                className={`px-3 py-2 cursor-pointer font-medium ${(filters.label === opt.value && filters.read !== false) ||
                  (filters.read === false && opt.type === "read")
                  ? "bg-gray-200 text-[#0096C7]"
                  : "hover:bg-gray-100"
                  } flex items-center justify-between`}
                onClick={() => {
                  if (opt.type === "read") {
                    setFilters({ read: false, label: null });
                  } else {
                    setFilters({ read: null, label: opt.value });
                  }
                  setShowTags(false);
                }}
              >
                <div>
                  {opt.label}
                  <div className="font-normal font-poppins text-[10px] mt-1">
                    {opt.count} Conversations
                  </div>
                </div>
                {isCustomLabel && (
                  <button
                    title={`Delete label ${opt.label}`}
                    onClick={e => {
                      e.stopPropagation();
                      setLabelToDelete(opt.label);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 hover:text-red-700 ml-3 cursor-pointer p-1 rounded-full border border-[#E63946]"
                    aria-label={`Delete label ${opt.label}`}
                  >
                    <DeleteIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
          <div className="border-t border-t-[#D7D7D7] py-2 px-3 hover:bg-red-100 font-medium text-red-500 text-sm cursor-pointer">
            <button
              onClick={() => {
                // clear labelToDelete so modal will delete ALL
                setLabelToDelete(null);
                setShowDeleteModal(true);
              }}
              className="w-full text-left flex items-center gap-x-2.5 cursor-pointer"
            >
              <DeleteIcon className="inline-block w-4 h-4" /> Delete All Custom
              Tags
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
        >
          <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px] rounded-[8px]">
            <div className="flex justify-between items-start mb-[21px]">
              <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
                Delete Custom Tags
              </h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer"
              >
                <Cross className="w-5 h-5 fill-[#7E7E7E]" />
              </button>
            </div>
            <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
              {labelToDelete
                ? `Are you sure you want to permanently delete the tag "${labelToDelete}"? This action cannot be undone.`
                : "Are you sure you want to permanently delete all custom tags? This action cannot be undone."}
            </p>
            <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (labelToDelete) {
                      const updatedUser = await deleteLabel(labelToDelete);
                      setCustomLabels(updatedUser.labels || []);
                    } else {
                      const updatedUser = await deleteAllLabels();
                      setCustomLabels(updatedUser.labels || []);
                    }
                    if (onLabelsChange) {
                      await onLabelsChange();
                    }
                    toast.success(
                      labelToDelete
                        ? `Tag "${labelToDelete}" deleted successfully!`
                        : "All Custom Tags deleted successfully!",
                    );
                    setShowTags(false);
                    setShowDeleteModal(false);
                    setLabelToDelete(null);
                  } catch (err) {
                    console.error("Failed to delete custom tags:", err);
                    if (err?.response?.status !== 401) {
                      toast.error("Failed to delete custom tags");
                    }
                  }
                }}
                className="px-4 py-1 text-white bg-red-600 cursor-pointer border border-red-600 rounded-[4px] hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
