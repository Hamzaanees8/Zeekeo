import { useState, useRef, useEffect } from "react";
import { DropArrowIcon } from "../Icons";

const MoreOptionsDropdown = ({ onExportCSV }) => {
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative h-[35px]" ref={dropdownRef}>
      {/* Trigger */}
      <div
        className="cursor-pointer h-[35px] w-[210px] justify-between border border-[#7E7E7E] px-3.5 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
        onClick={() => setShowMenu((prev) => !prev)}
      >
        <span>More Options</span>
        <DropArrowIcon className="h-[14px] w-[12px]" />
      </div>

      {/* Dropdown */}
      {showMenu && (
        <div className="absolute top-[40px] left-0 w-[210px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
          <div
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setShowMenu(false);
              onExportCSV?.(); // call parent callback
            }}
          >
            Export as CSV
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreOptionsDropdown;
