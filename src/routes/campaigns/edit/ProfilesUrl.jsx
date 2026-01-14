import { useEffect, useState, useRef } from "react";
import {
  DeleteIcon,
  Profile,
  StepReview,
  PauseIcon,
  PlayIcon,
} from "../../../components/Icons";
import DeleteModal from "./Components/DeleteModal";
import AddProfileModal from "./Components/AddProfileModal";
import { useParams } from "react-router";
import {
  getProfilesUrl,
  deleteProfilesUrl,
  updateCampaign,
} from "../../../services/campaigns";
import { useEditContext } from "./Context/EditContext";
import toast from "react-hot-toast";

const ProfilesUrl = () => {
  const { profiles, setProfiles, profileUrlsPauseFetch, setProfileUrlsPauseFetch } =
    useEditContext();
  const { id } = useParams();
  const [togglingPauseFetch, setTogglingPauseFetch] = useState(false);
  const filterRef = useRef(null);
  const toolsRef = useRef(null);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [value, setValue] = useState(50);
  const [campaignId, setCampaignId] = useState(null);
  // const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const topRef = useRef(null);
  const [downloadInterval, setDownloadInterval] = useState(null);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // Individual delete button click handler
  const handleDeleteClick = index => {
    setProfileToDelete(index);
    setShowDeleteModal(true);
  };

  // Multi delete button click handler
  const handleMultiDeleteClick = () => {
    if (selectedProfiles.length === 0) {
      toast.error("Please select at least one profile to delete");
      return;
    }

    setShowDeleteModal(true);
  };

  // Close modal handler
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProfileToDelete(null);
  };

  // Reusable function to fetch profiles
  const fetchProfiles = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getProfilesUrl(id);
      if (response?.profile_urls) {
        setProfiles(response.profile_urls);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setCampaignId(id);
      fetchProfiles();
    }
  }, [id]);

  const deleteProfiles = async () => {
    try {
      const urlsToDelete =
        profileToDelete !== null
          ? [profiles[profileToDelete].profile_url]
          : selectedProfiles.map(index => profiles[index].profile_url);

      const response = await deleteProfilesUrl(campaignId, urlsToDelete);

      if (response.deleted) {
        // Close modal
        setShowDeleteModal(false);
        setProfileToDelete(null);
        setSelectedProfiles([]);
        toast.success("Profiles deleted successfully");
        // Refetch profiles from backend
        await fetchProfiles();
      } else {
        toast.error("Failed to delete profiles. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting profiles:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShow(false);
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

  const handleSort = key => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Handle individual checkbox selection
  const handleCheckboxChange = index => {
    setSelectedProfiles(prev => {
      if (prev.includes(index)) {
        return prev.filter(id => id !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = e => {
    if (e.target.checked) {
      const allIndices = paginatedProfiles.map((_, index) =>
        profiles.findIndex(p => p.profile_url === _.profile_url),
      );
      setSelectedProfiles(allIndices);
    } else {
      setSelectedProfiles([]);
    }
  };

  // Check if all items on current page are selected
  const isAllSelected = () => {
    if (paginatedProfiles.length === 0) return false;
    return paginatedProfiles.every((profile, i) => {
      const originalIndex = profiles.findIndex(
        p => p.profile_url === profile.profile_url,
      );
      return selectedProfiles.includes(originalIndex);
    });
  };

  const exportToCSV = (data, filename = "profiles.csv") => {
    if (!data || !data.length) {
      toast.error("No data available");
      return;
    }

    // Define CSV headers based on your requirements
    const headers = [
      "Profile URL",
      "Custom Field 1",
      "Custom Field 2",
      "Custom Field 3",
    ];

    const csvRows = [];
    csvRows.push(headers.join(","));

    data.forEach(profile => {
      const values = [
        profile.profile_url || "",
        profile.custom_fields?.["1"] || "",
        profile.custom_fields?.["2"] || "",
        profile.custom_fields?.["3"] || "",
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

    // Simulate download progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          exportToCSV(filteredProfiles, "profiles.csv");
          setTimeout(() => setShowProgress(false), 600);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    setDownloadInterval(interval);
  };

  const handleAbort = () => {
    if (downloadInterval) {
      clearInterval(downloadInterval);
      setDownloadInterval(null);
    }
    setShowProgress(false);
  };

  // Handle Add Profile click - opens the modal
  const handleAddProfileClick = () => {
    setShowAddProfileModal(true);
  };

  // Handle adding profiles from CSV modal
  const handleAddProfilesFromCSV = async () => {
    // Refetch profiles from backend to get the complete data
    await fetchProfiles();
  };

  // Handle Pause/Resume Fetch toggle
  const handleTogglePauseFetch = async () => {
    if (!id) return;

    setTogglingPauseFetch(true);
    try {
      const newValue = !profileUrlsPauseFetch;
      await updateCampaign(id, { profile_urls_pause_fetch: newValue });
      setProfileUrlsPauseFetch(newValue);
      toast.success(newValue ? "Fetch paused" : "Fetch resumed");
    } catch (error) {
      console.error("Error toggling pause fetch:", error);
      toast.error("Failed to update fetch status");
    } finally {
      setTogglingPauseFetch(false);
    }
  };

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      profile.profile_url?.toLowerCase().includes(searchLower) ||
      (profile.custom_fields?.["1"] &&
        profile.custom_fields["1"].toLowerCase().includes(searchLower)) ||
      (profile.custom_fields?.["2"] &&
        profile.custom_fields["2"].toLowerCase().includes(searchLower)) ||
      (profile.custom_fields?.["3"] &&
        profile.custom_fields["3"].toLowerCase().includes(searchLower))
    );
  });

  // Sort profiles based on sortConfig
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valA, valB;

    if (sortConfig.key.startsWith("custom_field_")) {
      const fieldIndex = sortConfig.key.split("_")[2];
      valA = a.custom_fields?.[fieldIndex] || "";
      valB = b.custom_fields?.[fieldIndex] || "";
    } else {
      valA = a[sortConfig.key] || "";
      valB = b[sortConfig.key] || "";
    }

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const pageSize = value === "all" ? sortedProfiles.length : value;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProfiles =
    value === "all"
      ? sortedProfiles
      : sortedProfiles.slice(startIndex, endIndex);

  const totalPages = Math.ceil(sortedProfiles.length / pageSize) || 1;

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
        </div>
        <div className="flex items-center gap-x-2">
          {/* Pause/Resume Fetch button */}
          <button
            onClick={handleTogglePauseFetch}
            disabled={togglingPauseFetch}
            className={`px-3 py-1 h-[35px] text-[14px] border transition-all duration-150 cursor-pointer rounded-[4px] flex items-center gap-2 ${
              profileUrlsPauseFetch
                ? "bg-[#25C396] text-white border-[#25C396] hover:bg-[#1ea37d]"
                : "bg-gray-500 text-white border-gray-500 hover:bg-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {profileUrlsPauseFetch ? (
              <>
                <PauseIcon className="w-4 h-4 fill-white" />
                Resume Fetch
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4 fill-white" />
                Pause Fetch
              </>
            )}
          </button>

          <div className="flex justify-center items-center gap-x-3">
            <div className="relative xl:w-[240px] h-[35px] lg:w-[200px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full border border-[#7E7E7E] text-sm h-[35px] text-[#7E7E7E] font-normal pl-8 pr-3 bg-white focus:outline-none rounded-[6px]"
              />
            </div>
          </div>

          {/* Delete URL button - only show when profiles are selected */}
          {selectedProfiles.length > 0 && (
            <button
              onClick={handleMultiDeleteClick}
              className="px-4 py-1 h-[35px] text-[14px] bg-[#D80039] text-white border border-[#D80039] transition-all duration-150 cursor-pointer rounded-[4px] flex items-center gap-2"
            >
              Delete URL ({selectedProfiles.length})
            </button>
          )}

          <button
            onClick={handleAddProfileClick}
            className="px-4 py-1 h-[35px] text-[14px] bg-[#0387FF] text-white border border-[#0387FF] transition-all duration-150 cursor-pointer rounded-[4px]"
          >
            Add Profile
          </button>
        </div>
      </div>

      {/* Static Table */}
      <div className="pl-3.5 pr-3.5 pt-3 border border-[#7E7E7E] bg-white shadow-md min-h-[480px] max-h-full rounded-[8px] min-w-auto overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-x-[17px] text-[#6D6D6D]">
            <Profile />
            <p className="font-normal text-xs">{profiles?.length} Profiles</p>
            {selectedProfiles.length > 0 && (
              <span className="text-xs text-[#0387FF]">
                {selectedProfiles.length} selected
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        {profiles && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="text-left font-poppins border-b border-[#7E7E7E]">
                <tr className="!text-[14px] text-[#7E7E7E]">
                  <th className="px-3 py-[16px] !font-[600] w-12">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected()}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-[#0387FF] accent-[#0387FF] bg-gray-100 border-gray-300 rounded focus:ring-none"
                      />
                    </div>
                  </th>
                  <th className="px-3 py-[16px] !font-[600] w-12">#</th>
                  <th
                    className="px-3 py-[16px] !font-[600]"
                    onClick={() => handleSort("profile_url")}
                  >
                    <div className="flex items-center gap-1 cursor-pointer">
                      Profile URL
                      {sortConfig.key === "profile_url" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-3 py-[16px] !font-[600]"
                    onClick={() => handleSort("custom_field_0")}
                  >
                    <div className="flex items-center gap-1 cursor-pointer">
                      Custom Field 1
                      {sortConfig.key === "custom_field_0" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-3 py-[16px] !font-[600]"
                    onClick={() => handleSort("custom_field_1")}
                  >
                    <div className="flex items-center gap-1 cursor-pointer">
                      Custom Field 2
                      {sortConfig.key === "custom_field_1" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-3 py-[16px] !font-[600]"
                    onClick={() => handleSort("custom_field_2")}
                  >
                    <div className="flex items-center gap-1 cursor-pointer">
                      Custom Field 3
                      {sortConfig.key === "custom_field_2" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-[16px] !font-[600]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProfiles.map((profile, index) => {
                  const originalIndex = profiles.findIndex(
                    p => p.profile_url === profile.profile_url,
                  );
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={`${profile.profile_url}-${index}`}
                      className="text-[#6D6D6D] !text-sm border-b border-[#7E7E7E]"
                    >
                      <td className="px-3 py-[18px] !font-[400] !text-[13px]">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProfiles.includes(originalIndex)}
                            onChange={() =>
                              handleCheckboxChange(originalIndex)
                            }
                            className="w-4 h-4 text-[#0387FF] accent-[#0387FF] bg-gray-100 border-gray-300 rounded focus:ring-none"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-[18px] !font-[400] !text-[13px]">
                        {rowNumber}
                      </td>
                      <td className="px-3 py-[18px] !font-[400] !text-[13px] cursor-pointer ">
                        <a
                          href={profile.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {profile.profile_url}
                        </a>
                      </td>
                      <td className="px-3 py-[18px] !font-[400] !text-[13px]  ">
                        {profile.custom_fields?.["1"] || ""}
                      </td>
                      <td className="px-3 py-[18px] !font-[400] !text-[13px]  ">
                        {profile.custom_fields?.["2"] || ""}
                      </td>
                      <td className="px-3 py-[18px] !font-[400] !text-[13px]  ">
                        {profile.custom_fields?.["3"] || ""}
                      </td>
                      <td className="px-3 py-[18px] !font-[400] !text-[13px]  ">
                        <button
                          onClick={() => handleDeleteClick(originalIndex)}
                          className="rounded-full bg-white cursor-pointer p-[2px] border border-[#D80039] hover:bg-red-50 transition-colors"
                          title="Delete Profile"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {paginatedProfiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No profiles url found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2">
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

      {showDeleteModal && (
        <DeleteModal
          onClose={handleCloseDeleteModal}
          onClick={deleteProfiles}
          selectedProfiles={
            profileToDelete !== null ? [profileToDelete] : selectedProfiles
          }
          deleteType="profile" // Add this prop
        />
      )}

      {showAddProfileModal && (
        <AddProfileModal
          onClose={() => setShowAddProfileModal(false)}
          onAddProfiles={handleAddProfilesFromCSV}
          campaignId={campaignId} // Pass the campaignId
          existingProfiles={profiles}
        />
      )}
    </div>
  );
};

export default ProfilesUrl;
