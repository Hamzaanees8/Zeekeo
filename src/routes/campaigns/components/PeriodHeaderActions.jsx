import { useState, useEffect, useRef } from "react";
import {
  DownloadIcon,
  DropArrowIcon,
  DropDownCheckIcon,
  DropDownIcon,
  FilterIcon,
  DeleteIcon,
} from "../../../components/Icons.jsx";
import Button from "../../../components/Button";
import { deleteCampaignTag } from "../../../services/campaigns.js";
import toast from "react-hot-toast";

import { useAuthStore } from "../../stores/useAuthStore.js";

// Source filter options
const SOURCE_OPTIONS = [
  { key: "filter_url", label: "LinkedIn Search URL" },
  { key: "profile_urls", label: "Profile URLs (CSV)" },
  { key: "filter_api", label: "Built-in Filter" },
  { key: "existing_campaign", label: "Existing Campaign" },
];

const PeriodHeaderActions = ({
  activeTab,
  setActiveTab,
  selectedFilters,
  setSelectedFilters,
  selectedTags,
  setSelectedTags,
  selectedSources,
  setSelectedSources,
  onDownload,
  isLoading,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [showSourcesDropdown, setShowSourcesDropdown] = useState(false);
  
  const user = useAuthStore(state => state.currentUser);
  const userTags = user?.campaign_tags || [];
  
  const filterRef = useRef(null);
  const tagsRef = useRef(null);
  const sourcesRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
      if (tagsRef.current && !tagsRef.current.contains(event.target)) {
        setShowTagsDropdown(false);
      }
      if (sourcesRef.current && !sourcesRef.current.contains(event.target)) {
        setShowSourcesDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filters = ["Paused", "Running", "Fetching", "Failed", "Archived"];
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
    setShowTagsDropdown(false);
    setShowSourcesDropdown(false);
  };

  const toggleTagsDropdown = () => {
    setShowTagsDropdown(prev => !prev);
    setShowFilters(false);
    setShowSourcesDropdown(false);
  };

  const toggleSourcesDropdown = () => {
    setShowSourcesDropdown(prev => !prev);
    setShowFilters(false);
    setShowTagsDropdown(false);
  };
  
  const handleFilterToggle = filter => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter],
    );
  };

  const handleTagToggle = tag => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag],
    );
  };

  const handleSourceToggle = sourceKey => {
    setSelectedSources(prev =>
      prev.includes(sourceKey)
        ? prev.filter(s => s !== sourceKey)
        : [...prev, sourceKey],
    );
  };

  const [deletingTag, setDeletingTag] = useState(null);

  const handleDeleteTag = async (e, tag) => {
    e.stopPropagation(); // Prevent triggering the tag toggle
    
    if (deletingTag) return; // Prevent multiple deletes at once
    
    setDeletingTag(tag);
    try {
      await deleteCampaignTag(tag);
      // If the deleted tag was selected, remove it from selected tags
      if (selectedTags.includes(tag)) {
        setSelectedTags(prev => prev.filter(t => t !== tag));
      }
      toast.success(`Tag "${tag}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag");
    } finally {
      setDeletingTag(null);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Tags with dropdown */}
        <div className="relative" ref={tagsRef}>
          <button
            onClick={toggleTagsDropdown}
            title="Filter by Tags"
            className="px-2 w-[160px] text-sm text-[#6D6D6D] h-8 border border-gray-400 rounded-[4px] flex items-center justify-between bg-white cursor-pointer"
          >
            Filter by Tags <DropArrowIcon className="w-3 h-3" />
          </button>

          {showTagsDropdown && (
            <div className="absolute left-0 mt-2 w-[200px] bg-white border border-[#7E7E7E] rounded-[4px] shadow-md z-10 p-2 max-h-[200px] overflow-y-auto custom-scroll1">
              <div className="px-2 py-1 text-[10px] font-bold text-[#7E7E7E] uppercase tracking-wider">
                Campaign Tags
              </div>
              {userTags.length > 0 ? (
                userTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  const isDeleting = deletingTag === tag;
                  return (
                    <div
                      key={tag}
                      className={`flex items-center justify-between w-full px-2 py-1.5 text-sm text-[#6D6D6D] hover:bg-gray-100 rounded cursor-pointer ${
                        isSelected ? "bg-gray-50" : ""
                      }`}
                    >
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="flex items-center flex-1 min-w-0"
                      >
                        <div className="w-4.5">{isSelected && <DropDownCheckIcon className="w-3 h-3 flex-shrink-0" />}</div>
                        <span className="truncate mr-2 text-xs">{tag}</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteTag(e, tag)}
                        disabled={isDeleting}
                        title="Delete tag"
                        className="ml-2 p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0 cursor-pointer"
                      >
                        {isDeleting ? (
                          <svg
                            className="animate-spin h-3 w-3 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <DeleteIcon className="w-3 h-3 text-red-500 hover:text-red-700" />
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="px-2 py-2 text-xs text-gray-400">No tags found</div>
              )}
            </div>
          )}
        </div>

        {/* Source with dropdown */}
        <div className="relative" ref={sourcesRef}>
          <button
            onClick={toggleSourcesDropdown}
            title="Filter by Source"
            className="px-2 w-[160px] text-sm text-[#6D6D6D] h-8 border border-gray-400 rounded-[4px] flex items-center justify-between bg-white cursor-pointer"
          >
            Filter by Type <DropArrowIcon className="w-3 h-3" />
          </button>

          {showSourcesDropdown && (
            <div className="absolute left-0 mt-2 w-[220px] bg-white border border-[#7E7E7E] rounded-[4px] shadow-md z-10 p-2 max-h-[200px] overflow-y-auto custom-scroll1">
              <div className="px-2 py-1 text-[10px] font-bold text-[#7E7E7E] uppercase tracking-wider">
                Campaign Type
              </div>
              {SOURCE_OPTIONS.map(source => {
                const isSelected = selectedSources.includes(source.key);
                return (
                  <button
                    key={source.key}
                    onClick={() => handleSourceToggle(source.key)}
                    className={`flex items-center justify-between w-full px-2 py-1.5 text-sm text-[#6D6D6D] hover:bg-gray-100 rounded cursor-pointer ${
                      isSelected ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="truncate text-xs">{source.label}</span>
                      {isSelected && <DropDownCheckIcon className="w-3 h-3 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end flex-wrap gap-4 py-4 px-2">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-[12px] text-[#0387FF]">
            <svg
              className="animate-spin h-4 w-4 text-[#0387FF]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading campaigns...</span>
          </div>
        )}

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
          <div className="relative" ref={filterRef}>
            <button
              onClick={toggleFilters}
              title="Filter by Status"
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
    </div>
  );
};

export default PeriodHeaderActions;
