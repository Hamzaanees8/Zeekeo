import { useEffect, useRef, useState } from "react";
import {
  DropArrowIcon,
  DropDownCheckIcon,
  FilterIcon,
} from "../../../components/Icons";
import General from "./components/General";
import Internal from "./components/Internal";
import Errors from "./components/Errors";
const AdminDashboard = () => {
  const [showFilters, setShowFilters] = useState(false);
  const toggleFilters = () => setShowFilters(!showFilters);
  const [activeTab, setActiveTab] = useState("General");
  const tabs = ["General", "Internal", "Errors"];
  const filters = ["30 Days", "24 Hours"];
  const dropdownRef = useRef(null);
  const [selected, setSelected] = useState("24 Hours");
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <>
      <div className="p-6 w-full relative">
        <div className="flex flex-wrap items-center justify-between">
          {/* Heading */}
          <h1 className="text-[48px] font-urbanist text-grey-medium font-medium ">
            Dashboard
          </h1>
          {/* Filter Controls */}
          <div className="flex items-center gap-3 mt-4 sm:mt-0 relative">
            {/* Campaign Dropdown */}
            <div className="relative">
              <button
                onClick=""
                className="flex w-[223px] justify-between items-center border border-grey px-3 py-2 bg-white rounded-[6px]"
              >
                <span className="text-grey-light text-[12px]">asd</span>
                <DropArrowIcon className="w-3 h-3 ml-2" />
              </button>
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={toggleFilters}
                className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white cursor-pointer"
              >
                <FilterIcon className="w-4 h-4" />
              </button>

              {showFilters && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-[6px] shadow-md z-10 p-2"
                >
                  {filters.map(col => (
                    <div
                      key={col}
                      className="flex items-center justify-between px-2 py-2 cursor-pointer text-xs font-normal text-[#7E7E7E]"
                      onClick={() => setSelected(col)}
                    >
                      {col}
                      {selected === col && (
                        <DropDownCheckIcon className="w-4 h-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-x-[16px] pt-[50px] justify-center">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(tab)}
              className={`px-[20px] py-[6px] w-[133px] leading-[22px] cursor-pointer h-[34px] text-center text-base font-urbanist font-medium border border-[#7E7E7E] rounded-[4px] ${
                activeTab === tab
                  ? "bg-[#7E7E7E] text-white"
                  : "bg-white text-[#7E7E7E]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "General" && <General selected={selected} />}
        {activeTab === "Internal" && <Internal selected={selected} />}
        {activeTab === "Errors" && <Errors selected={selected} />}
      </div>
    </>
  );
};

export default AdminDashboard;
