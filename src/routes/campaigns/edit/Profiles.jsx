import { useEffect, useState, useRef } from "react";
import Table from "./Components/Table";
import {
  DropArrowIcon,
  FilterIcon,
  Profile,
  StepReview,
} from "../../../components/Icons";
import { useEditContext } from "./Context/EditContext";
import {
  getCampaignProfile,
  streamCampaignProfiles,
} from "../../../services/campaigns";
import Modal from "./Components/Modal";
import useProfilesStore from "../../stores/useProfilesStore";

const filterOptions = [
  "Viewed",
  "Twitter Liked",
  "LinkedIn Sequence Started",
  "LinkedIn Sequence Fail",
  "Email Sequence Started",
  "Email Sequence Fail",
];
const toolOptions = [
  "Skip Profiles",
  "Reinclude Skipped Profile",
  "Remove Profiles",
  "Unblock Profiles",
  "Find and Replace",
];
const Profiles = () => {
  const filterRef = useRef(null);
  const toolsRef = useRef(null);
  const { filters, setFilters } = useProfilesStore();
  const { editId } = useEditContext();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [value, setValue] = useState(50);
  const [nextCursor, setNextCursor] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [showToolOptions, setShowToolOptions] = useState(false);
  const [selectedToolOption, setSelectedToolOption] = useState("");
  const topRef = useRef(null);

  useEffect(() => {
    setProfiles([]);
    setNextCursor(null);
    setCurrentPage(1);

    const loadFirstPage = async () => {
      if (!editId) return;

      const { profiles: firstBatch, next } = await streamCampaignProfiles(
        editId,
        null,
      );
      setProfiles(firstBatch);
      setValue(50);
      setNextCursor(next);
    };

    loadFirstPage();
  }, [editId]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowOptions(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target)) {
        setShowToolOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = e => {
    const val =
      e.target.value === "all" ? "all" : parseInt(e.target.value, 10);
    setValue(val);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);
  const normalize = str =>
    str
      .toLowerCase()
      .replace(/[-\s]+/g, " ")
      .trim();

  const getValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => {
      if (part.endsWith("]")) {
        const [arr, index] = part.replace("]", "").split("[");
        return acc?.[arr]?.[parseInt(index, 10)];
      }
      return acc?.[part];
    }, obj);
  };

  const filteredProfiles = profiles.filter(profile => {
    const kw = (filters.keyword || "").toLowerCase();

    const matchesKeyword =
      !filters.keyword ||
      profile.first_name?.toLowerCase().includes(kw) ||
      profile.last_name?.toLowerCase().includes(kw) ||
      profile.email_address?.toLowerCase().includes(kw) ||
      profile.current_positions?.[0]?.role?.toLowerCase().includes(kw) ||
      profile.current_positions?.[0]?.company?.toLowerCase().includes(kw);

    const matchesLocation =
      !filters.location ||
      profile.current_positions?.[0]?.location === filters.location;

    const matchesTitle =
      !filters.title || profile.current_positions?.[0]?.role === filters.title;

    const matchesIndustry =
      !filters.industry ||
      profile.current_positions?.[0]?.industry?.includes(filters.industry);

    return (
      matchesKeyword && matchesLocation && matchesTitle && matchesIndustry
    );
  });

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valA = getValue(a, sortConfig.key);
    let valB = getValue(b, sortConfig.key);

    if (sortConfig.key === "shared_connections_count") {
      valA = valA ?? 0;
      valB = valB ?? 0;
    }
    const isEmptyA =
      valA === null || valA === undefined || valA === "" || Number.isNaN(valA);
    const isEmptyB =
      valB === null || valB === undefined || valB === "" || Number.isNaN(valB);

    if (isEmptyA && !isEmptyB) return 1;
    if (!isEmptyA && isEmptyB) return -1;
    if (isEmptyA && isEmptyB) return 0;

    if (typeof valA === "number" && typeof valB === "number") {
      return sortConfig.direction === "asc" ? valA - valB : valB - valA;
    }

    const strA = normalize(valA?.toString() || "");
    const strB = normalize(valB?.toString() || "");

    if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
    if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const pageSize = value === "all" ? sortedProfiles.length : value;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProfiles =
    value === "all"
      ? sortedProfiles
      : sortedProfiles.slice(startIndex, endIndex);

  const totalPages = Math.ceil(sortedProfiles.length / pageSize) || 1;

  const handleSort = key => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };
  const handleResetSort = () => {
    setSortConfig({ key: null, direction: null });
  };
  return (
    <div ref={topRef} className="flex flex-col pt-[80px] gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-[10px]">
          <div className="flex items-center gap-x-[9px]">
            <p className="font-medium font-urbanist text-base text-[#7E7E7E]">
              Show
            </p>
            <div className="py-[6px] px-[10px] bg-white border border-[#7E7E7E] rounded-[6px] h-[35px]">
              <select
                value={value}
                onChange={handleChange}
                className="focus:outline-none bg-transparent font-medium font-urbanist text-base text-[#7E7E7E]"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value="all">All</option>
              </select>
            </div>
            <p className="font-medium font-urbanist text-base text-[#7E7E7E]">
              Entries
            </p>
          </div>
          <div className="relative h-[35px]" ref={filterRef}>
            <div
              className="cursor-pointer h-[35px] rounded-[6px] w-[250px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
              onClick={() => setShowOptions(prev => !prev)}
            >
              <span className="text-sm font-normal">
                {selectedOption ? selectedOption : "Profile Filter"}
              </span>
              <DropArrowIcon className="h-[14px] w-[14px]" />
            </div>

            {showOptions && (
              <div className="absolute top-[40px] rounded-[6px] overflow-hidden left-0 w-[250px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
                {filterOptions.map(filterOption => (
                  <div
                    key={filterOption}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedOption(filterOption);
                      setShowOptions(false);
                    }}
                  >
                    {filterOption}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative h-[35px]" ref={toolsRef}>
            <div
              className="cursor-pointer h-[35px] rounded-[6px] w-[250px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
              onClick={() => setShowToolOptions(prev => !prev)}
            >
              <span className="text-sm font-normal">
                {selectedToolOption ? selectedToolOption : "Tools"}
              </span>
              <DropArrowIcon className="h-[14px] w-[14px]" />
            </div>

            {showToolOptions && (
              <div className="absolute top-[40px] rounded-[6px] overflow-hidden left-0 w-[250px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
                {toolOptions.map(toolOption => (
                  <div
                    key={toolOption}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedToolOption(toolOption);
                      setShowToolOptions(false);
                    }}
                  >
                    {toolOption}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-x-2.5">
          <div className="flex justify-center items-center gap-x-3 pr-3">
            <div className="relative w-[250px] h-[35px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <input
                type="text"
                placeholder="Search"
                value={filters.keyword}
                onChange={e => setFilters("keyword", e.target.value)}
                className="w-full border border-[#7E7E7E] text-base h-[35px] text-[#7E7E7E] font-medium pl-8 pr-3 bg-white focus:outline-none rounded-[6px]"
              />
            </div>
          </div>
          <button
            onClick={() => setShow(true)}
            className="w-[190px] flex items-center gap-x-2.5 px-2 py-1 h-[35px] text-[16px] border border-[#7E7E7E] transition-all duration-150 cursor-pointer rounded-[4px] bg-[#FFFFFF] text-[#7E7E7E] "
          >
            <FilterIcon />
            Advanced Filters
          </button>
        </div>
      </div>
      <div className="pl-6 pr-3.5 pt-3 border border-[#7E7E7E] bg-white shadow-md min-h-[480px] max-h-full rounded-[8px] min-w-auto overflow-x-auto overflow-hidden">
        <div className="flex items-center gap-x-[17px] text-[#6D6D6D]">
          <Profile />
          <p className="font-normal text-xs">{profiles?.length} Profiles</p>
        </div>
        <div className="w-[120%] xl:w-full">
          <Table
            profiles={paginatedProfiles}
            setProfiles={setProfiles}
            currentPage={currentPage}
            pageSize={pageSize}
            onSort={handleSort}
            resetSort={handleResetSort}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
          className="px-4 py-1 text-white bg-gray-500 border border-gray-500 w-[100px] rounded-[4px]
            cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed disabled:border-gray-300 transition-colors"
        >
          Prev
        </button>

        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-1 text-white bg-[#0387FF] border border-[#0387FF] w-[100px] rounded-[4px]
            cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed disabled:border-blue-300 transition-colors"
        >
          Next
        </button>

        {/* <button
          onClick={loadMore}
          disabled={!nextCursor}
          className={`
    px-4 py-1 text-white bg-[#0387FF] cursor-pointer border border-[#0387FF] w-[134px] rounded-[4px]
    disabled:bg-blue-300 disabled:cursor-not-allowed disabled:border-blue-300
    transition-colors
  `}
        >
          Load More
        </button> */}
      </div>
      {show && (
        <Modal
          show={show}
          onClose={() => setShow(false)}
          locations={[
            ...new Set(
              profiles
                .map(p => p.current_positions?.[0]?.location)
                .filter(Boolean),
            ),
          ]}
          titles={[
            ...new Set(
              profiles
                .map(p => p.current_positions?.[0]?.role)
                .filter(Boolean),
            ),
          ]}
          industries={[
            ...new Set(
              profiles.flatMap(p => p.current_positions?.[0]?.industry || []),
            ),
          ]}
        />
      )}
    </div>
  );
};

export default Profiles;
