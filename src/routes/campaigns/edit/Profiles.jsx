import { useEffect, useState, useRef } from "react";
import Table from "./Components/Table";
import {
  DropArrowIcon,
  DropDownCheckIcon,
  FilterIcon,
  Profile,
  StepReview,
} from "../../../components/Icons";
import { useEditContext } from "./Context/EditContext";
import {
  deleteCampaignProfile,
  streamCampaignProfiles,
  updateCampaignProfile,
} from "../../../services/campaigns";
import Modal from "./Components/Modal";
import useProfilesStore from "../../stores/useProfilesStore";
import toast from "react-hot-toast";
import { updateProfile } from "../../../services/profiles";
import FindReplaceModal from "./Components/FindReplaceModal";
import DeleteModal from "./Components/DeleteModal";

const filterOptions = [
  "All Profiles",
  "Open Link Profiles",
  "With Email",
  "Viewed",
  "LinkedIn Message Sent",
  "LinkedIn Message Failed",
  "Email Message Sent",
  "Email Message Failed",
  "Invited",
  "Invite Failed",
  "InMailed",
  "InMail Failed",
  "Profile Followed",
  "Profile Follows Fail",
  "Profile Like Post",
];
const toolOptions = [
  "Skip Profiles",
  "Reinclude Skipped Profile",
  "Remove Profiles",
  "Blacklist Profiles",
  "Remove from Blacklist",
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
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [value, setValue] = useState(50);
  const [nextCursor, setNextCursor] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showToolOptions, setShowToolOptions] = useState(false);
  const [selectedToolOption, setSelectedToolOption] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    const roleOrHeadlineMatch = profile.current_positions?.[0]?.role
      ? profile.current_positions?.[0]?.role.toLowerCase().includes(kw)
      : profile.work_experience?.[0]?.position
      ? profile.work_experience?.[0]?.position.toLowerCase().includes(kw)
      : profile.headline?.toLowerCase().includes(kw);

    const matchesKeyword =
      !filters.keyword ||
      profile.first_name?.toLowerCase().includes(kw) ||
      profile.last_name?.toLowerCase().includes(kw) ||
      profile.email_address?.toLowerCase().includes(kw) ||
      (profile.work_experience?.[0]?.company &&
        profile.work_experience[0].company.toLowerCase().includes(kw)) ||
      (profile.current_positions?.[0]?.company &&
        profile.current_positions[0].company.toLowerCase().includes(kw)) ||
      roleOrHeadlineMatch;

    const matchesLocation =
      !filters.location ||
      profile.location === filters.location ||
      profile.current_positions?.[0]?.location === filters.location;

    const matchesTitle =
      !filters.title ||
      profile.work_experience?.[0]?.position === filters.title ||
      profile.current_positions?.[0]?.role === filters.title ||
      profile.headline === filters.title;

    const matchesIndustry =
      !filters.industry ||
      profile.current_positions?.[0]?.industry?.includes(filters.industry);

    const matchesActions = (() => {
      if (
        selectedOptions.length === 0 ||
        selectedOptions.includes("All Profiles")
      ) {
        return true;
      }

      const actions = Object.values(profile.actions || {});

      return selectedOptions.every(option => {
        switch (option) {
          case "Open Link Profiles":
            return profile.is_open === true;
          case "Viewed":
            return actions.some(a => a.type === "linkedin_view" && a.success);
          case "Invited":
            return actions.some(
              a => a.type === "linkedin_invite" && a.success,
            );
          case "Invite Failed":
            return actions.some(
              a => a.type === "linkedin_invite" && !a.success,
            );
          case "InMailed":
            return actions.some(
              a => a.type === "linkedin_inmail" && a.success,
            );
          case "InMail Failed":
            return actions.some(
              a => a.type === "linkedin_inmail" && !a.success,
            );
          case "LinkedIn Message Sent":
            return actions.some(
              a => a.type === "linkedin_message" && a.success,
            );
          case "LinkedIn Message Failed":
            return actions.some(
              a => a.type === "linkedin_message" && !a.success,
            );
          case "Email Message Sent":
            return actions.some(a => a.type === "email_message" && a.success);
          case "Email Message Failed":
            return actions.some(a => a.type === "email_message" && !a.success);
          case "Profile Followed":
            return actions.some(
              a => a.type === "linkedin_follow" && a.success,
            );
          case "Profile Follows Fail":
            return actions.some(
              a => a.type === "linkedin_follow" && !a.success,
            );
          case "Profile Like Post":
            return actions.some(
              a => a.type === "linkedin_like_post" && a.success,
            );
          case "With Email":
            return Boolean(profile.email_address);
          default:
            return false;
        }
      });
    })();

    return (
      matchesKeyword &&
      matchesLocation &&
      matchesTitle &&
      matchesIndustry &&
      matchesActions
    );
  });

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const keys =
      sortConfig.key === "title"
        ? [
            "work_experience[0].position",
            "current_positions[0].role",
            "headline",
          ]
        : sortConfig.key === "company"
        ? ["work_experience[0].company", "current_positions[0].company"]
        : [sortConfig.key];

    const getFirstAvailableValue = (profile, keys) => {
      for (const key of keys) {
        const val = getValue(profile, key);
        if (val !== null && val !== undefined && val !== "") {
          return val;
        }
      }
      return null;
    };

    let valA = getFirstAvailableValue(a, keys);
    let valB = getFirstAvailableValue(b, keys);

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

  async function processInBatches(items, batchSize, processFn) {
    const updatedProfiles = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const promises = batch.map(async item => {
        try {
          const res = await processFn(item);
          return res?.data || res;
        } catch (error) {
          console.error("Batch process error:", error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      updatedProfiles.push(...results.filter(Boolean));
    }

    return updatedProfiles;
  }

  const handleOptionClick = filterOption => {
    if (filterOption === "All Profiles") {
      setSelectedOptions([]);
      return;
    }

    setSelectedOptions(prev => {
      if (prev.includes(filterOption)) {
        return prev.filter(option => option !== filterOption);
      } else {
        return [...prev, filterOption];
      }
    });
  };
  const isSelected = option => {
    if (option === "All Profiles") {
      return selectedOptions.length === 0;
    }
    return selectedOptions.includes(option);
  };
  const handleConfirmDelete = async () => {
    try {
      await processInBatches(selectedProfiles, 100, id =>
        deleteCampaignProfile(editId, id),
      );

      setProfiles(prev =>
        prev.filter(p => !selectedProfiles.includes(p.profile_id)),
      );

      toast.success("Selected profiles are removed successfully");
      setShowDeleteModal(false);
      setSelectedProfiles([]);
      setSelectedToolOption(null);
    } catch (err) {
      console.error("Error deleting profiles:", err);
      toast.error("Failed to remove profiles");
    }
  };

  const handleDropdownAction = async action => {
    try {
      if (selectedProfiles.length === 0 && action !== "Find and Replace") {
        toast.error("No profiles selected");
        return;
      }
      let updatedProfiles = [];
      switch (action) {
        case "Skip Profiles":
          updatedProfiles = await processInBatches(selectedProfiles, 100, id =>
            updateCampaignProfile(editId, id, { skip: true }),
          );
          toast.success("Selected profiles are skipped successfully");
          break;

        case "Reinclude Skipped Profile":
          updatedProfiles = await processInBatches(selectedProfiles, 100, id =>
            updateCampaignProfile(editId, id, { skip: false }),
          );
          toast.success("Selected Profiles are re-included successfully");
          break;

        case "Remove Profiles":
          setShowDeleteModal(true);
          return;

        case "Blacklist Profiles":
          updatedProfiles = await processInBatches(selectedProfiles, 100, id =>
            updateProfile(id, { blacklisted: true }),
          );
          toast.success("Selected Profiles are blacklisted successfully");
          break;

        case "Remove from Blacklist":
          updatedProfiles = await processInBatches(selectedProfiles, 100, id =>
            updateProfile(id, { blacklisted: false }),
          );
          toast.success(
            "Selected Profiles are removed from blacklist successfully",
          );
          break;

        case "Find and Replace":
          setShowFindReplace(true);
          break;

        default:
          break;
      }
      if (updatedProfiles.length > 0) {
        setProfiles(prev =>
          prev.map(p => {
            const updated = updatedProfiles.find(
              up => up.profile_id === p.profile_id,
            );
            return updated ? { ...p, ...updated } : p;
          }),
        );
      }
      setSelectedProfiles([]);
      setSelectedToolOption(null);
    } catch (error) {
      console.error("Error handling action:", error);
      toast.error("Something went wrong");
    }
  };
  const handleFindReplace = async (findText, replaceText) => {
    try {
      const allProfileIds = profiles.map(p => p.profile_id);

      const updatedProfiles = await processInBatches(
        allProfileIds,
        100,
        async id => {
          const profile = profiles.find(p => p.profile_id === id);
          if (!profile) return null;

          let updateData = {};
          let updated = false;
          if (
            typeof profile.first_name === "string" &&
            profile.first_name.includes(findText)
          ) {
            updateData.first_name = profile.first_name.replaceAll(
              findText,
              replaceText,
            );
            updated = true;
          }
          if (
            typeof profile.last_name === "string" &&
            profile.last_name.includes(findText)
          ) {
            updateData.last_name = profile.last_name.replaceAll(
              findText,
              replaceText,
            );
            updated = true;
          }
          if (
            typeof profile.headline === "string" &&
            profile.headline.includes(findText)
          ) {
            updateData.headline = profile.headline.replaceAll(
              findText,
              replaceText,
            );
            updated = true;
          }
          if (profile.work_experience?.length > 0) {
            let work = { ...profile.work_experience[0] };
            if (
              typeof work.position === "string" &&
              work.position.includes(findText)
            ) {
              work.position = work.position.replaceAll(findText, replaceText);
              updated = true;
            }
            if (
              typeof work.company === "string" &&
              work.company.includes(findText)
            ) {
              work.company = work.company.replaceAll(findText, replaceText);
              updated = true;
            }
            if (updated) updateData.work_experience = [work];
          }
          if (profile.current_positions?.length > 0) {
            let pos = { ...profile.current_positions[0] };
            if (typeof pos.role === "string" && pos.role.includes(findText)) {
              pos.role = pos.role.replaceAll(findText, replaceText);
              updated = true;
            }
            if (
              typeof pos.company === "string" &&
              pos.company.includes(findText)
            ) {
              pos.company = pos.company.replaceAll(findText, replaceText);
              updated = true;
            }
            if (updated) updateData.current_positions = [pos];
          }

          if (!updated) return null;
          const updatedProfile = await updateProfile(id, updateData);
          return updatedProfile;
        },
      );
      setProfiles(prev =>
        prev.map(p => {
          const updated = updatedProfiles.find(
            up => up?.profile_id === p.profile_id,
          );
          return updated ? { ...p, ...updated } : p;
        }),
      );

      toast.success("Find & Replace applied to all profiles");
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply Find & Replace");
    }
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
              className="cursor-pointer h-[35px] rounded-[6px] lg:w-[200px] xl:w-[250px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
              onClick={() => setShowOptions(prev => !prev)}
            >
              <span className="text-sm font-normal">Profile Filters</span>
              <DropArrowIcon className="h-[14px] w-[14px]" />
            </div>

            {showOptions && (
              <div className="absolute top-[40px] rounded-[6px] overflow-hidden left-0 lg:w-[200px] xl:w-[250px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
                {filterOptions.map(filterOption => (
                  <div
                    key={filterOption}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    onClick={() => handleOptionClick(filterOption)}
                  >
                    <span>{filterOption}</span>
                    {isSelected(filterOption) && (
                      <DropDownCheckIcon className="w-4 h-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative h-[35px]" ref={toolsRef}>
            <div
              className="cursor-pointer lg:w-[200px] h-[35px] rounded-[6px] xl:w-[250px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
              onClick={() => setShowToolOptions(prev => !prev)}
            >
              <span className="text-sm font-normal">
                {selectedToolOption ? selectedToolOption : "Tools"}
              </span>
              <DropArrowIcon className="h-[14px] w-[14px]" />
            </div>

            {showToolOptions && (
              <div className="absolute top-[40px] rounded-[6px] overflow-hidden left-0 lg:w-[200px] xl:w-[250px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
                {toolOptions.map(toolOption => (
                  <div
                    key={toolOption}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedToolOption(toolOption);
                      setShowToolOptions(false);
                      handleDropdownAction(toolOption);
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
            <div className="relative xl:w-[250px] h-[35px] lg:w-[200px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <input
                type="text"
                placeholder="Search"
                value={filters.keyword}
                onChange={e => setFilters("keyword", e.target.value)}
                className="w-full border border-[#7E7E7E] text-sm h-[35px] text-[#7E7E7E] font-normal pl-8 pr-3 bg-white focus:outline-none rounded-[6px]"
              />
            </div>
          </div>
          <button
            onClick={() => setShow(true)}
            className="xl:w-[190px] lg:[130px] flex items-center lg:gap-x-1 xl:gap-x-2.5 xl:px-2 lg:px-1 py-1 h-[35px] text-[14px] border border-[#7E7E7E] transition-all duration-150 cursor-pointer rounded-[4px] bg-[#FFFFFF] text-[#7E7E7E] "
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
            setSelectedProfiles={setSelectedProfiles}
            selectedProfiles={selectedProfiles}
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
      </div>
      {show && (
        <Modal
          show={show}
          onClose={() => setShow(false)}
          locations={[
            ...new Set(
              profiles
                .map(p => p.location || p.current_positions?.[0]?.location)
                .filter(Boolean),
            ),
          ]}
          titles={[
            ...new Set(
              profiles
                .map(
                  p =>
                    p.work_experience?.[0]?.position ||
                    p.current_positions?.[0]?.role ||
                    p.headline,
                )
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
      {showFindReplace && (
        <FindReplaceModal
          onClose={() => setShowFindReplace(false)}
          onConfirm={handleFindReplace}
        />
      )}
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onClick={handleConfirmDelete}
          selectedProfiles={selectedProfiles}
        />
      )}
    </div>
  );
};

export default Profiles;
