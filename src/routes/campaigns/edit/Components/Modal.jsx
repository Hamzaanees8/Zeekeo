import { useEffect, useRef, useState } from "react";
import {
  Cross,
  DropArrowIcon,
  FilterIcon,
} from "../../../../components/Icons";
import useProfilesStore from "../../../stores/useProfilesStore";

export default function Modal({
  onClose,
  locations = [],
  titles = [],
  industries = [],
  show,
}) {
  const { filters, setFilters, resetFilters } = useProfilesStore();
  const dropdownRefLocation = useRef(null);
  const dropdownRefTitle = useRef(null);
  const dropdownRefIndustry = useRef(null);
  const [showLocation, setShowLocation] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showIndustry, setShowIndustry] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedTitle, setSelectedTitle] = useState("All Titles");
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        dropdownRefLocation.current &&
        !dropdownRefLocation.current.contains(event.target)
      ) {
        setShowLocation(false);
      }
      if (
        dropdownRefTitle.current &&
        !dropdownRefTitle.current.contains(event.target)
      ) {
        setShowTitle(false);
      }
      if (
        dropdownRefIndustry.current &&
        !dropdownRefIndustry.current.contains(event.target)
      ) {
        setShowIndustry(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (!show) return;
    setSelectedLocation(filters.location || "All Locations");
    setSelectedTitle(filters.title || "All Titles");
    setSelectedIndustry(filters.industry || "All Industries");
  }, [filters, show]);
  const handleSelect = value => {
    if (value === "") {
      setSelectedLocation("All Locations");
    } else {
      setSelectedLocation(value);
    }
    setShowLocation(false);
  };
  const handleSelectTitle = value => {
    if (value === "") {
      setSelectedTitle("All Titles");
    } else {
      setSelectedTitle(value);
    }
    setShowTitle(false);
  };
  const handleSelectIndustry = value => {
    if (value === "") {
      setSelectedIndustry("All Industries");
    } else {
      setSelectedIndustry(value);
    }
    setShowIndustry(false);
  };
  const handleApply = () => {
    setFilters(
      "location",
      selectedLocation === "All Locations" ? "" : selectedLocation,
    );
    setFilters("title", selectedTitle === "All Titles" ? "" : selectedTitle);
    setFilters(
      "industry",
      selectedIndustry === "All Industries" ? "" : selectedIndustry,
    );
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center "
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[600px] px-6 py-4 font-urbanist text-[#7E7E7E] font-normal rounded-[8px] shadow-md">
        <div className="flex items-center justify-between border-b border-b-[#6D6D6D] pb-2">
          <h2 className="text-[20px] font-semibold text-[#04479C] flex items-center gap-2">
            <FilterIcon className="w-4.5 h-4.5" /> Filters
          </h2>
          <button onClick={onClose}>
            <Cross className="w-6 h-6 text-[#04479C] fill-[#04479C] cursor-pointer" />
          </button>
        </div>
        <div className="flex flex-col gap-y-3 py-3 border-b border-b-[#6D6D6D]">
          <div className="flex flex-col gap-y-1">
            <label className="text-[18px] font-bold">Locations</label>
            <div
              className="relative w-[350px] cursor-pointer"
              ref={dropdownRefLocation}
            >
              <div
                onClick={() => setShowLocation(prev => !prev)}
                className="w-full h-[35px] flex justify-between cursor-pointer font-urbanist items-center px-5 text-base font-medium text-[#7E7E7E] border border-[#7E7E7E] rounded-[6px] bg-white"
              >
                <span className="truncate">{selectedLocation}</span>
                <DropArrowIcon className="h-[14px] w-[12px]" />
              </div>
              {showLocation && (
                <ul className="absolute mt-1 w-full bg-white border border-[#7E7E7E] z-50 shadow-md text-sm text-[#7E7E7E] rounded-[6px] overflow-hidden max-h-64 overflow-y-auto">
                  <li
                    className="px-3 py-2 cursor-pointer font-medium hover:bg-gray-100"
                    onClick={() => handleSelect("", "All Locations")}
                  >
                    {" "}
                    <span>All Locations</span>
                  </li>

                  {locations.map((location, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 cursor-pointer font-medium hover:bg-gray-100"
                      onClick={() => handleSelect(location, location)}
                    >
                      <span>{location}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-y-1">
            <label className="text-[18px] font-bold">Titles</label>
            <div
              className="relative w-[350px] cursor-pointer"
              ref={dropdownRefTitle}
            >
              <div
                onClick={() => setShowTitle(prev => !prev)}
                className="w-full h-[35px] flex justify-between cursor-pointer font-urbanist items-center px-5 text-base font-medium text-[#7E7E7E] border border-[#7E7E7E] rounded-[6px] bg-white"
              >
                <span className="truncate">{selectedTitle}</span>
                <DropArrowIcon className="h-[14px] w-[12px]" />
              </div>
              {showTitle && (
                <ul className="absolute mt-1 w-full bg-white border border-[#7E7E7E] z-50 shadow-md text-sm text-[#7E7E7E] rounded-[6px] overflow-hidden max-h-64 overflow-y-auto">
                  <li
                    className="px-3 py-2 cursor-pointer font-medium hover:bg-gray-100"
                    onClick={() => handleSelectTitle("", "All Titles")}
                  >
                    {" "}
                    <span>All Titles</span>
                  </li>

                  {titles.map((title, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 cursor-pointer font-medium hover:bg-gray-100"
                      onClick={() => handleSelectTitle(title, title)}
                    >
                      <span>{title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-y-1">
            <label className="text-[18px] font-bold">Industries</label>
            <div
              className="relative w-[350px] cursor-pointer"
              ref={dropdownRefIndustry}
            >
              <div
                onClick={() => setShowIndustry(prev => !prev)}
                className="w-full h-[35px] flex justify-between cursor-pointer font-urbanist items-center px-5 text-base font-medium text-[#7E7E7E] border border-[#7E7E7E] rounded-[6px] bg-white"
              >
                <span className="truncate">{selectedIndustry}</span>
                <DropArrowIcon className="h-[14px] w-[12px]" />
              </div>
              {showIndustry && (
                <ul className="absolute mt-1 w-full bg-white border border-[#7E7E7E] z-50 shadow-md text-sm text-[#7E7E7E] rounded-[6px] overflow-hidden max-h-64 overflow-y-auto">
                  <li
                    className="px-3 py-2 cursor-pointer font-medium hover:bg-gray-100"
                    onClick={() => handleSelectIndustry("", "All Industries")}
                  >
                    {" "}
                    <span>All Industries</span>
                  </li>

                  {industries.map((industry, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 cursor-pointer font-medium hover:bg-gray-100"
                      onClick={() => handleSelectIndustry(industry, industry)}
                    >
                      <span>{industry}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between font-medium text-base font-urbanist pt-3">
          <button
            onClick={onClose}
            className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] rounded-[4px]"
          >
            Cancel
          </button>
          <div className="flex items-center gap-x-2.5">
            {" "}
            <button
              onClick={() => {
                resetFilters();
                setSelectedLocation("All Locations");
                setSelectedTitle("All Titles");
                setSelectedIndustry("All Industries");
              }}
              className="px-4 py-1 text-[#04479C] border border-[#04479C] bg-white cursor-pointer flex items-center gap-x-2.5 rounded-[4px]"
            >
              Clear Filters
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1 text-[#04479C] border border-[#04479C] bg-white cursor-pointer flex items-center gap-x-2.5 rounded-[4px]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
