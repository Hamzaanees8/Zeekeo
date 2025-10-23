import { useState } from "react";
import {
  DownloadIcon,
  DropDownCheckIcon,
  FilterIcon,
} from "../../../components/Icons.jsx"; // adjust path as needed
import Button from "../../../components/Button"; // global button component

const PeriodHeaderActions = ({
  activeTab,
  setActiveTab,
  selectedFilters,
  setSelectedFilters,
  onDownload,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const filters = ["Paused", "Running", "Fetching", "Failed", "Archived"];
  const toggleFilters = () => setShowFilters(prev => !prev);
  const handleFilterToggle = filter => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter],
    );
  };

  return (
    <div className="flex items-center justify-end flex-wrap gap-4 py-4 px-2">
      {/* Toggle Buttons */}
      <div className="flex items-center bg-[#F1F1F1] border-[1px] border-[#0387FF] rounded-[4px]">
        <Button
          className={`px-5 py-2 text-[12px] font-semibold cursor-pointer rounded-[4px]  ${
            activeTab === "24h"
              ? "bg-[#0387FF] text-white"
              : "text-[#0387FF] hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("24h")}
        >
          24 Hours
        </Button>
        <Button
          className={`px-5 py-2 text-[12px] font-semibold cursor-pointer rounded-[4px] ${
            activeTab === "total"
              ? "bg-[#0387FF] text-white"
              : "text-[#0387FF] hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("total")}
        >
          Total
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 relative">
        <Button
          title="Download CSV"
          onClick={onDownload}
          className="w-8 h-8 border rounded-full flex items-center justify-center bg-white !p-0 cursor-pointer"
        >
          <DownloadIcon className="w-4 h-4 text-[#4D4D4D]" />
        </Button>

        {/* Filter with dropdown */}
        <div className="relative">
          <button
            onClick={toggleFilters}
            className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center bg-white cursor-pointer"
          >
            <FilterIcon className="w-4 h-4" />
          </button>

          {showFilters && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10 p-2">
              {filters.map(filter => {
                const isSelected = selectedFilters.includes(filter);
                return (
                  <button
                    key={filter}
                    onClick={() => handleFilterToggle(filter)}
                    className={`flex items-center justify-between w-full px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer ${
                      isSelected ? "bg-gray-100" : ""
                    }`}
                  >
                    <span>{filter}</span>
                    {isSelected && <DropDownCheckIcon className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeriodHeaderActions;
