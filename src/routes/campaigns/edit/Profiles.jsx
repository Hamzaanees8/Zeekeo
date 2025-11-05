import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import Table from "./Components/Table";
import {
  DownloadIcon,
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
import Button from "../../../components/Button";
import ProgressModal from "../../../components/ProgressModal";
import { getCurrentUser } from "../../../utils/user-helpers";

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
  const user = getCurrentUser();
  const filterRef = useRef(null);
  const toolsRef = useRef(null);
  const { filters, setFilters } = useProfilesStore();
  const { editId, campaignName, setLoadingProfiles, loadingProfiles } = useEditContext();
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
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const topRef = useRef(null);
  const [downloadInterval, setDownloadInterval] = useState(null);
  useEffect(() => {
    setProfiles([]);
    setNextCursor(null);
    setCurrentPage(1);

    const loadAllProfiles = async () => {
      if (!editId) return;

      setLoadingProfiles(true); // Start loading

      let allProfiles = [];
      let cursor = null;
      let hasMore = true;

      // Keep fetching until there's no more pages
      while (hasMore) {
        const { profiles: batch, next } = await streamCampaignProfiles(
          editId,
          cursor,
        );

        // Append new profiles and update state immediately to show progress
        allProfiles = [...allProfiles, ...batch];
        setProfiles(allProfiles);

        // Check if there's a next page
        if (next) {
          cursor = next;
        } else {
          hasMore = false;
        }
      }

      setValue(50);
      setNextCursor(null); // No more pages to load
      setLoadingProfiles(false); // Finished loading
    };

    loadAllProfiles();
  }, [editId, setLoadingProfiles]);

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
  const hasAction = (actions, type) => {
    if (!actions) return false;
    return Object.values(actions).some(a => a.type === type && a.success);
  };
  const formatTenure = tenure => {
    if (!tenure) return "";
    const { years = 0, months = 0 } = tenure;
    let parts = [];
    if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
    if (months) parts.push(`${months} mo${months > 1 ? "s" : ""}`);
    return parts.join(" ");
  };

  const getJobStartDate = tenure => {
    if (!tenure) return "";
    return dayjs()
      .subtract(tenure.years || 0, "year")
      .subtract(tenure.months || 0, "month")
      .format("MMM YYYY");
  };
  const exportToCSV = (data, filename = "profiles.csv") => {
    if (!data || !data.length) {
      alert("No data available");
      return;
    }

    // Define your CSV headers
    const headers = [
      "Profile ID",
      "Profile URL",
      "First Name",
      "Last Name",
      "Email",
      "Title",
      "Company",
      "Relationship",
      "Mutuals",
      "Website",
      "Industry",
      "Location",
      "Tenure at Role",
      "Job Start Date",
      "Blacklisted",
      "Skipped",
      "Invited",
      "InMailed",
      "LinkedIn Messaged",
      "Email Messaged",
      "Followed",
      "Liked Post",
      "Replied",
      "Replied At",
      "Campaign ID",
      "Campaign Name",
    ];

    const csvRows = [];
    csvRows.push(headers.join(","));
    data.forEach(profile => {
      const values = [
        profile.profile_id || "",
        profile.classic_profile_url || profile.sales_profile_url || "",
        profile.first_name || "",
        profile.last_name || "",
        profile.email_address || "",
        profile.work_experience?.[0]?.position ||
          profile.current_positions?.[0]?.role ||
          profile.headline ||
          "",
        profile.work_experience?.[0]?.company ||
          profile.current_positions?.[0]?.company ||
          "",
        profile.network_distance || "",
        profile.shared_connections_count || 0,
        profile.websites?.[0] || "",
        profile.current_positions?.[0]?.industry || "",
        profile.location || profile.current_positions?.[0]?.location || "",
        formatTenure(profile.tenure_at_role) || "",
        getJobStartDate(profile.tenure_at_role) || "",
        profile.blacklisted === true ? "Yes" : "No",
        profile.skip === true ? "Yes" : "No",
        hasAction(profile.actions, "linkedin_invite") ? "Yes" : "No",
        hasAction(profile.actions, "linkedin_inmail") ? "Yes" : "No",
        hasAction(profile.actions, "linkedin_message") ? "Yes" : "No",
        hasAction(profile.actions, "email_message") ? "Yes" : "No",
        hasAction(profile.actions, "linkedin_follow") ? "Yes" : "No",
        hasAction(profile.actions, "linkedin_like_post") ? "Yes" : "No",
        profile.replied_at ? "Yes" : "No",
        profile.replied_at || "",
        profile.campaign_id || "",
        campaignName || "",
      ];

      const escaped = values.map(val => {
        if (typeof val === "object") val = JSON.stringify(val);
        if (val === null || val === undefined) val = "";
        return `"${val}"`;
      });

      csvRows.push(escaped.join(","));
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    setShowProgress(true);
    setProgress(0);

    const chunkSize = Math.ceil(filteredProfiles.length / 5);
    let index = 0;
    let processed = [];
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours(),
    ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(
      now.getSeconds(),
    ).padStart(2, "0")}`;

    const fileName =
      `${user.first_name}_${user.last_name}_${campaignName}_${timestamp}.csv`.replace(
        /\s+/g,
        "_",
      );

    const interval = setInterval(() => {
      const chunk = filteredProfiles.slice(index, index + chunkSize);
      processed = [...processed, ...chunk];
      index += chunkSize;

      const percentage = Math.min(
        (processed.length / filteredProfiles.length) * 100,
        100,
      );
      setProgress(Math.round(percentage));

      if (index >= filteredProfiles.length) {
        clearInterval(interval);
        exportToCSV(processed, fileName);
        setTimeout(() => setShowProgress(false), 600);
      }
    }, 400);

    setDownloadInterval(interval);
  };
  const handleAbort = () => {
    if (downloadInterval) {
      clearInterval(downloadInterval);
      setDownloadInterval(null);
    }
    setShowProgress(false);
  };
  return (
    <div ref={topRef} className="flex flex-col pt-[80px] gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-[8px]">
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
              className="cursor-pointer h-[35px] rounded-[6px] lg:w-[180px] xl:w-[230px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
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
              className="cursor-pointer lg:w-[180px] h-[35px] rounded-[6px] xl:w-[230px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
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
        <div className="flex items-center gap-x-2">
          <div className="flex justify-center items-center gap-x-3">
            <div className="relative xl:w-[240px] h-[35px] lg:w-[200px]">
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
          <Button
            title="Download CSV"
            onClick={handleDownload}
            className="w-8 h-8 border rounded-full flex items-center justify-center bg-white !p-0 cursor-pointer"
          >
            <DownloadIcon className="w-4 h-4 text-[#4D4D4D]" />
          </Button>
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

      <div className="flex justify-end items-center gap-2">
        {loadingProfiles && (
          <div className="flex items-center gap-x-2 text-[#0387FF] text-sm font-medium">
            <svg
              className="animate-spin h-5 w-5"
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
            <span>Loading profiles...</span>
          </div>
        )}
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
          className="px-4 py-1 text-white bg-gray-500 border border-gray-500 w-[100px] rounded-[4px]
            cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed disabled:border-gray-300 transition-colors"
        >
          Prev
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {(() => {
            const maxPagesToShow = 7;
            const pages = [];

            if (totalPages <= maxPagesToShow) {
              // Show all pages if total is less than max
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              // Always show first page
              pages.push(1);

              if (currentPage > 3) {
                pages.push("...");
              }

              // Show pages around current page
              const start = Math.max(2, currentPage - 1);
              const end = Math.min(totalPages - 1, currentPage + 1);

              for (let i = start; i <= end; i++) {
                pages.push(i);
              }

              if (currentPage < totalPages - 2) {
                pages.push("...");
              }

              // Always show last page
              pages.push(totalPages);
            }

            return pages.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-1 text-gray-500"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[40px] px-3 py-1 rounded-[4px] transition-colors ${
                    currentPage === page
                      ? "bg-[#0387FF] text-white border border-[#0387FF] font-semibold"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              );
            });
          })()}
        </div>

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
      {showProgress && (
        <ProgressModal
          onClose={handleAbort}
          title="Exporting CSV..."
          action="Abort Process"
          progress={progress}
        />
      )}
    </div>
  );
};

export default Profiles;
