import { useState } from "react";
import { DownloadIcon, FilterIcon } from "../../../components/Icons.jsx"; // adjust path as needed
import Button from "../../../components/Button"; // global button component

const PeriodHeaderActions = ({ activeTab, setActiveTab }) => {
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilters = () => setShowFilters(!showFilters);

  return (
    <div className="flex items-center justify-end flex-wrap gap-4 py-4 px-2">
      {/* Toggle Buttons */}
      <div className="flex items-center bg-[#F1F1F1] border-[1px] border-[#6D6D6D] rounded-[4px]">
        <Button
          className={`px-5 py-2 text-[12px] font-semibold cursor-pointer rounded-[4px]  ${
            activeTab === "24h"
              ? "bg-[#6D6D6D] text-white"
              : "text-[#6D6D6D] hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("24h")}
        >
          24 Hours
        </Button>
        <Button
          className={`px-5 py-2 text-[12px] font-semibold cursor-pointer rounded-[4px] ${
            activeTab === "total"
              ? "bg-[#6D6D6D] text-white"
              : "text-[#6D6D6D] hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("total")}
        >
          Total
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 relative">
        {/* Download */}
        <Button className="w-8 h-8 border rounded-full flex items-center justify-center bg-white !p-0">
          <DownloadIcon className="w-4 h-4 text-[#4D4D4D]" />
        </Button>

        {/* Filter with dropdown */}
        <div className="relative">
          <Button
            onClick={toggleFilters}
            className="w-8 h-8 border rounded-full flex items-center justify-center bg-white !p-0"
          >
            <FilterIcon className="w-4 h-4 text-[#4D4D4D]" />
          </Button>

          {showFilters && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10 p-3">
              <p className="text-sm text-gray-700 mb-2">
                Filters coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeriodHeaderActions;
