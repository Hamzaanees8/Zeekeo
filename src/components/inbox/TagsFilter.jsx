import { useState, useRef, useEffect } from "react";
import useInboxStore from "../../routes/stores/useInboxStore";
import { DropArrowIcon } from "../Icons";

export default function TagsFilter({ tagOptions, setShowAddTagPopup }) {
  const { filters, setFilters } = useInboxStore();
  const [showTags, setShowTags] = useState(false);
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
        <div className="absolute top-[40px] left-0 w-[204px] bg-white border border-[#7E7E7E] z-50 shadow-md text-sm text-[#7E7E7E]">
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
            return (
              <div
                key={idx}
                className={`px-3 py-2 cursor-pointer font-medium ${
                  (filters.label === opt.value && filters.read !== false) ||
                  (filters.read === false && opt.type === "read")
                    ? "bg-gray-200 text-[#0096C7]"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  if (opt.type === "read") {
                    setFilters({ read: false, label: null });
                  } else {
                    setFilters({ read: null, label: opt.value });
                  }
                  setShowTags(false);
                }}
              >
                {opt.label}
                <div className="font-normal font-poppins text-[10px] mt-1">
                  {opt.count} Conversations
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
