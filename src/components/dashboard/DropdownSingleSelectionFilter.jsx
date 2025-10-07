import { useState, useRef, useEffect } from "react";
import { DropArrowIcon } from "../Icons";

export default function DropdownSingleSelectionFilter({
  options = [],
  selectedValue,
  setSelected,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedName, setSelectedName] = useState("All");
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Set initial name if selectedValue changes externally
    if (selectedValue) {
      const found = options.find(opt => opt.value === selectedValue);
      setSelectedName(found ? found.name : "All");
    } else {
      setSelectedName("All");
    }
  }, [selectedValue, options]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value, name) => {
    setSelected(value);
    setSelectedName(name);
    setShowOptions(false);
  };

  return (
    <div className="relative w-[333px]" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div
        onClick={() => setShowOptions(prev => !prev)}
        className="w-full h-[35px] flex justify-between items-center px-5 text-base font-medium text-[#7E7E7E] border border-[#7E7E7E] rounded-[6px] bg-white cursor-pointer"
      >
        <span className="truncate">{selectedName}</span>
        <DropArrowIcon className={`h-[14px] w-[12px] transition-transform duration-200 ${showOptions ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown Options */}
      {showOptions && (
        <ul className="absolute mt-1 w-full bg-white border border-[#7E7E7E] z-50 shadow-md text-sm text-[#7E7E7E] rounded-[6px] overflow-hidden max-h-64 overflow-y-auto">
          <li
            className={`px-3 py-2 cursor-pointer font-medium ${
              selectedValue === null || selectedValue === "all"
                ? "bg-gray-200 text-[#0096C7]"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleSelect("all", "All")}
          >
            All
          </li>

          {options.map((option, index) => (
            <li
              key={index}
              className={`px-3 py-2 cursor-pointer font-medium ${
                selectedValue === option.value
                  ? "bg-gray-200 text-[#0096C7]"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleSelect(option.value, option.name)}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
