import React, { useEffect, useState } from "react";
import {
  ThreeDashIcon,
  PauseIcon,
  PlayIcon,
  GraphIcon,
  PencilIcon,
  DeleteIcon,
  FaceIcon,
  LinkedIn,
  CopyIcon,
  Person2,
  DropArrowIcon,
  Unarchive,
  TagIcon,
  DropDownCheckIcon,
  TagIcon2,
} from "../../../components/Icons.jsx";
import PeriodCard from "./PeriodCard.jsx";
import TooltipInfo from "../../../components/TooltipInfo.jsx";
import Tooltip from "../../../components/Tooltip.jsx";
import { useNavigate } from "react-router";
import {
  createCampaignTag,
  deleteCampaign,
  getCampaigns,
  getCampaignStats,
  updateCampaign,
} from "../../../services/campaigns.js";
import toast from "react-hot-toast";
import DeleteModal from "./DeleteModal.jsx";
import StartCampaignModal from "./StartCampaignModal.jsx";
import { useRef, useLayoutEffect } from "react";
import useCampaignsListStore from "../../stores/useCampaignsListStore.js";
import { useAuthStore } from "../../stores/useAuthStore.js";

const TagDropdown = ({
  campaign,
  allTags,
  onClose,
  onToggleTag,
  onAddGlobalTag,
}) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleAddSubmit = async e => {
    e.preventDefault();
    if (newTagName.trim()) {
      await onAddGlobalTag(campaign.campaign_id, newTagName.trim());
      setNewTagName("");
      setIsAddingTag(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-[#7E7E7E] rounded-[4px] shadow-lg z-[100] p-2 max-h-[150px] overflow-y-auto custom-scroll1"
    >
      <div className="px-2 py-1 text-[10px] font-bold text-[#7E7E7E] uppercase tracking-wider text-left">
        Campaign Tags
      </div>
      <div className="">
        {allTags.map(tag => {
          const isSelected = campaign.campaign_tags?.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onToggleTag(campaign.campaign_id, tag)}
              className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-[#6D6D6D] hover:bg-gray-100 rounded cursor-pointer"
            >
              <span className="truncate mr-2 text-xs">{tag}</span>
              {isSelected && <DropDownCheckIcon className="w-4 h-4 text-blue-500" />}
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-100 my-1"></div>

      {isAddingTag ? (
        <div className="px-2 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col gap-2">
            <input
              autoFocus
              type="text"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="Tag name..."
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-500 outline-none transition-all"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsAddingTag(false);
                  setNewTagName("");
                }}
                className="px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-100 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!newTagName.trim()}
                onClick={handleAddSubmit}
                className="px-3 py-1 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 cursor-pointer font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingTag(true)}
          className="flex items-center gap-2 w-full px-2 py-2 text-xs text-blue-500 hover:bg-blue-50 rounded cursor-pointer font-medium transition-colors"
        >
          Create a new Tag
        </button>
      )}
    </div>
  );
};

function useSmoothReorder(list) {
  const positions = useRef(new Map());

  useLayoutEffect(() => {
    const newPositions = new Map();
    positions.current.forEach((prevBox, key) => {
      const domNode = document.querySelector(`[data-row-id="${key}"]`);
      if (!domNode) return;
      const newBox = domNode.getBoundingClientRect();
      const dx = prevBox.left - newBox.left;
      const dy = prevBox.top - newBox.top;

      if (dx || dy) {
        requestAnimationFrame(() => {
          domNode.style.transform = `translate(${dx}px, ${dy}px)`;
          domNode.style.transition = "transform 0s";
          requestAnimationFrame(() => {
            domNode.style.transform = "";
            domNode.style.transition = "transform 300ms ease";
          });
        });
      }
      newPositions.set(key, newBox);
    });

    // save latest positions
    document
      .querySelectorAll("[data-row-id]")
      .forEach(node =>
        newPositions.set(node.dataset.rowId, node.getBoundingClientRect()),
      );

    positions.current = newPositions;
  }, [list]);
}

// Utility to get value depending on tab
const getStatValue = (statObj, mode = "total") => {
  if (!statObj) return 0;

  if (mode === "total") {
    return statObj.total ?? 0;
  }

  if (mode === "24h") {
    const now = new Date();
    const cutoff = now.getTime() - 24 * 60 * 60 * 1000;

    return Object.entries(statObj.hourly || {}).reduce(
      (sum, [dateHour, val]) => {
        const [year, month, day, hour] = dateHour.split("-").map(Number);
        const statDate = new Date(year, month - 1, day, hour).getTime();
        return statDate >= cutoff ? sum + val : sum;
      },
      0,
    );
  }

  return 0;
};

// Map of source types to friendly display names
const SOURCE_FRIENDLY_NAMES = {
  profile_urls: "Profile URLs",
  filter_url: "LinkedIn Filter URL",
  filter_fields: "LinkedIn Filter Fields",
  existing_campaign: "Existing Campaign",
};

const getSourceFriendlyName = source => {
  if (source?.profile_urls) return SOURCE_FRIENDLY_NAMES.profile_urls;
  if (source?.filter_url) return SOURCE_FRIENDLY_NAMES.filter_url;
  if (source?.filter_fields) return SOURCE_FRIENDLY_NAMES.filter_fields;
  if (source?.filter_api) return SOURCE_FRIENDLY_NAMES.filter_api;
  if (source?.existing_campaign)
    return SOURCE_FRIENDLY_NAMES.existing_campaign;
  return "Unknown";
};

const renderSourceIcon = source => {
  const friendlyName = getSourceFriendlyName(source);

  if (source?.profile_urls) {
    return (
      <Tooltip content={friendlyName}>
        <Person2 className="w-5 h-5 text-[#7E7E7E]" />
      </Tooltip>
    );
  }
  if (source?.filter_url) {
    return (
      <Tooltip content={friendlyName}>
        <a
          href={source.filter_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1"
        >
          <LinkedIn className="w-5.5 h-5.5" />
        </a>
      </Tooltip>
    );
  }
  if (source?.filter_fields) {
    return (
      <Tooltip content={friendlyName}>
        <CopyIcon className="w-4.5 h-4.5 p-[2px] rounded-full border border-[#00B4D8] fill-[#00B4D8]" />
      </Tooltip>
    );
  }
  if (source?.existing_campaign) {
    return (
      <Tooltip content={friendlyName}>
        <CopyIcon className="w-4.5 h-4.5 p-[2px] rounded-full border border-[#00B4D8] fill-[#00B4D8]" />
      </Tooltip>
    );
  }
  return (
    <Tooltip content={friendlyName}>
      <CopyIcon className="w-4.5 h-4.5 p-[2px] rounded-full border border-[#00B4D8] fill-[#00B4D8]" />
    </Tooltip>
  );
};

const STAT_LABELS = {
  linkedin_view: "Views",
  linkedin_invite: "Invites",
  linkedin_invite_accepted: "Accepted",
  linkedin_message: "Messages Sent",
  linkedin_inmail: "InMails",
  linkedin_reply: "Replies",
  linkedin_like_post: "Post Likes",
  linkedin_follow: "Follows",
  linkedin_endorse: "Endorsements",
  email_message: "Emails Sent",
};

// Build array of normalized stats
const buildPeriodStats = (stats, activeTab) => {
  return Object.entries(STAT_LABELS).map(([key, label]) => {
    const statObj = stats[key];
    const value = getStatValue(statObj, activeTab);

    return {
      title: label,
      value,
      info: `These are stats for ${label}`,
    };
  });
};

const CampaignsTable = ({
  activeTab,
  dateFrom = null,
  dateTo = null,
  linkedin,
  selectedFilters,
  selectedTags,
  selectedSources,
  onLoadingChange,
}) => {
  const [openRow, setOpenRow] = useState(null);
  const [draggedRowIndex, setDraggedRowIndex] = useState(null);
  const [hoverRowIndex, setHoverRowIndex] = useState(null);
  const [deleteCampaignId, setDeleteCampignId] = useState(null);
  const [startCampaignId, setStartCampaignId] = useState(null);
  const [status, setStatus] = useState("");
  const [recentlyMovedRow, setRecentlyMovedRow] = useState(null);
  const [loadingStats, setLoadingStats] = useState(new Set()); // Track which campaigns are loading stats
  const [archivedFetched, setArchivedFetched] = useState(false); // Track if archived campaigns have been fetched
  const [loadingCampaigns, setLoadingCampaigns] = useState(true); // Track if campaigns are being loaded
  const [loadingArchived, setLoadingArchived] = useState(false); // Track if archived campaigns are being loaded
  const [openTagDropdownId, setOpenTagDropdownId] = useState(null);
  const navigate = useNavigate();

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(loadingCampaigns || loadingArchived);
  }, [loadingCampaigns, loadingArchived, onLoadingChange]);
  const tableContainerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);
  const dragCloneRef = useRef(null);
  const isDraggingRef = useRef(false);
  const draggedRowIndexRef = useRef(null);
  const hoverRowIndexRef = useRef(null);
  const selectedFiltersRef = useRef(selectedFilters);
  const selectedTagsRef = useRef(selectedTags);
  const selectedSourcesRef = useRef(selectedSources);

  // Use campaigns list store for caching
  const {
    campaigns,
    setCampaigns,
    setLoading,
    reset,
    isCacheValid,
    updateCampaign: updateCampaignInStore,
  } = useCampaignsListStore();

  // Keep selectedFiltersRef in sync with prop to avoid stale closures in drag handlers
  useEffect(() => {
    selectedFiltersRef.current = selectedFilters;
    selectedTagsRef.current = selectedTags;
    selectedSourcesRef.current = selectedSources;
  }, [selectedFilters, selectedTags, selectedSources]);

  // Check subscription status
  const user = useAuthStore(state => state.currentUser);
  const paidUntil = user?.paid_until;
  const paidUntilDate = paidUntil ? new Date(paidUntil + "T00:00:00Z") : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isExpired = paidUntilDate && paidUntilDate < today;
  const isAgencyUser = !!user?.agency_username;

  // Clear cache if user has changed
  useEffect(() => {
    const userId = user?.email || user?.username;
    if (userId && !isCacheValid(userId)) {
      // Cache is invalid for this user - clear it
      reset();
    }
  }, [user?.email, user?.username, isCacheValid, reset]);

  const handleAddGlobalTag = async (campaignId, tagName) => {
    try {
      // 1. Create global tag (updates user object in store)
      await createCampaignTag(tagName);

      // 2. Assign to current campaign
      const campaign = campaigns.find(c => c.campaign_id === campaignId);
      if (campaign) {
        const currentCampaignTags = campaign.campaign_tags || [];
        if (!currentCampaignTags.includes(tagName)) {
          const newCampaignTags = [...currentCampaignTags, tagName];
          updateCampaignInStore(campaignId, { campaign_tags: newCampaignTags });
          await updateCampaign(campaignId, { campaign_tags: newCampaignTags });
        }
      }
      toast.success("Tag created and assigned successfully");
    } catch (error) {
      console.error("Failed to create tag:", error);
      toast.error("Failed to create tag");
    }
  };

  const handleToggleCampaignTag = async (campaignId, tag) => {
    const campaign = campaigns.find(c => c.campaign_id === campaignId);
    if (!campaign) return;

    const currentCampaignTags = campaign.campaign_tags || [];
    const newCampaignTags = currentCampaignTags.includes(tag)
      ? currentCampaignTags.filter(t => t !== tag)
      : [...currentCampaignTags, tag];

    try {
      // Optimistic update in store
      updateCampaignInStore(campaignId, { campaign_tags: newCampaignTags });

      // Update in backend
      await updateCampaign(campaignId, { campaign_tags: newCampaignTags });
      toast.success("Tags Assigned SuccessFully");
    } catch (error) {
      console.error("Failed to update campaign tags:", error);
      toast.error("Failed to update tags");
      // Rollback on error
      updateCampaignInStore(campaignId, { campaign_tags: currentCampaignTags });
    }
  };

  // Auto-scroll functionality during drag
  const startAutoScroll = direction => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    autoScrollIntervalRef.current = setInterval(() => {
      if (tableContainerRef.current) {
        const scrollAmount = direction === "up" ? -30 : 30;
        tableContainerRef.current.scrollTop += scrollAmount;
      }
    }, 50);
  };

  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  };

  // Custom mouse-based drag handlers
  const handleMouseDown = (index, e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    draggedRowIndexRef.current = index;
    hoverRowIndexRef.current = index;
    setDraggedRowIndex(index);
    setHoverRowIndex(index);

    // Get the row element
    const rowElement = e.target.closest("tr");
    if (!rowElement) return;

    // Create a clone of the row
    const clone = rowElement.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "9999";
    clone.style.width = `${rowElement.offsetWidth}px`;
    clone.style.backgroundColor = "#EBF5FF";
    clone.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    clone.style.opacity = "0.95";
    clone.style.borderRadius = "4px";
    clone.style.left = `${rowElement.getBoundingClientRect().left}px`;
    clone.style.top = `${e.clientY - 20}px`;
    clone.style.transform = "scale(1.02)";
    clone.style.transition = "none";

    document.body.appendChild(clone);
    dragCloneRef.current = clone;

    // Add document-level listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = e => {
    if (!isDraggingRef.current || !dragCloneRef.current) return;

    // Move the clone with the cursor
    dragCloneRef.current.style.top = `${e.clientY - 20}px`;

    // Auto-scroll when near container edges
    if (tableContainerRef.current) {
      const container = tableContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const scrollThreshold = 80;

      if (e.clientY - containerRect.top < scrollThreshold) {
        startAutoScroll("up");
      } else if (containerRect.bottom - e.clientY < scrollThreshold) {
        startAutoScroll("down");
      } else {
        stopAutoScroll();
      }
    }

    // Determine which row we're hovering over (scoped to table container)
    const rows =
      tableContainerRef.current?.querySelectorAll("[data-row-id]") || [];
    let newHoverIndex = null;

    rows.forEach((row, idx) => {
      const rect = row.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        newHoverIndex = idx;
      }
    });

    // Clamp to valid range (0 to rows.length - 1)
    if (newHoverIndex !== null && rows.length > 0) {
      newHoverIndex = Math.min(newHoverIndex, rows.length - 1);
    }

    if (newHoverIndex !== null && newHoverIndex !== hoverRowIndexRef.current) {
      hoverRowIndexRef.current = newHoverIndex;
      setHoverRowIndex(newHoverIndex);
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;

    // Clean up
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    stopAutoScroll();

    // Remove the clone
    if (dragCloneRef.current) {
      dragCloneRef.current.remove();
      dragCloneRef.current = null;
    }

    const dragIdx = draggedRowIndexRef.current;
    const hoverIdx = hoverRowIndexRef.current;

    isDraggingRef.current = false;
    draggedRowIndexRef.current = null;
    hoverRowIndexRef.current = null;

    // Perform the drop if we have valid indices
    if (dragIdx !== null && hoverIdx !== null && dragIdx !== hoverIdx) {
      performDrop(dragIdx, hoverIdx);
    } else {
      setDraggedRowIndex(null);
      setHoverRowIndex(null);
    }
  };

  const performDrop = async (sourceIndex, targetFilteredIndex) => {
    stopAutoScroll();

    if (sourceIndex === null || sourceIndex === targetFilteredIndex) {
      setDraggedRowIndex(null);
      setHoverRowIndex(null);
      return;
    }

    // Get fresh data from store and ref to avoid stale closure issues
    const currentCampaigns = useCampaignsListStore.getState().campaigns;
    const currentFilters = selectedFiltersRef.current;
    const currentTags = selectedTagsRef.current;
    const currentSources = selectedSourcesRef.current;

    // Compute filtered campaigns fresh (same logic as below)
    const currentFilteredCampaigns = currentCampaigns.filter(c => {
      if (!currentFilters || currentFilters.length === 0) return false;
      const hasArchivedFilter = currentFilters.includes("Archived");
      
      const matchesStatus = c.archived === true ? hasArchivedFilter : currentFilters.some(f => {
        switch (f) {
          case "Paused":
            return (
              c.status === "paused" &&
              c.fetch_status !== "failed" &&
              c.status !== "failed"
            );
          case "Running":
            return (
              c.status === "running" &&
              c.fetch_status !== "pending" &&
              c.fetch_status !== "fetching" &&
              c.fetch_status !== "failed" &&
              c.status !== "failed"
            );
          case "Fetching":
            return (
              (c.fetch_status === "pending" || c.fetch_status === "fetching") &&
              c.status === "running"
            );
          case "Failed":
            return c.fetch_status === "failed" || c.status === "failed";
          case "Archived":
            return false;
          default:
            return true;
        }
      });

      if (!matchesStatus) return false;

      // Filter by tags if any tags are selected
      if (currentTags && currentTags.length > 0) {
        if (!c.campaign_tags || !Array.isArray(c.campaign_tags)) return false;
        const matchesTags = currentTags.some(tag => c.campaign_tags.includes(tag));
        if (!matchesTags) return false;
      }

      // Filter by source if any sources are selected
      if (currentSources && currentSources.length > 0) {
        const source = c.source;
        if (!source) return false;
        
        const matchesSource = currentSources.some(sourceKey => {
          switch (sourceKey) {
            case "filter_url":
              return !!source.filter_url;
            case "profile_urls":
              return !!source.profile_urls;
            case "filter_api":
              return !!source.filter_api || !!source.filter_fields;
            case "existing_campaign":
              return !!source.existing_campaign;
            default:
              return false;
          }
        });
        
        if (!matchesSource) return false;
      }

      return true;
    });

    // Validate indices are within bounds
    const maxIndex = currentFilteredCampaigns.length - 1;
    const validSourceIndex = Math.max(0, Math.min(sourceIndex, maxIndex));
    const validTargetIndex = Math.max(
      0,
      Math.min(targetFilteredIndex, maxIndex),
    );

    console.log(
      "Drag from filtered index:",
      validSourceIndex,
      "to:",
      validTargetIndex,
      "(original:",
      sourceIndex,
      "->",
      targetFilteredIndex,
      ")",
    );

    // Get the campaigns involved in the drag operation from filtered list
    const movedCampaign = currentFilteredCampaigns[validSourceIndex];
    const targetCampaign = currentFilteredCampaigns[validTargetIndex];

    if (!movedCampaign || !targetCampaign) {
      console.error("Could not find campaigns for drop", {
        validSourceIndex,
        validTargetIndex,
        filteredLength: currentFilteredCampaigns.length,
      });
      setDraggedRowIndex(null);
      setHoverRowIndex(null);
      return;
    }

    // Skip if same position after validation
    if (validSourceIndex === validTargetIndex) {
      setDraggedRowIndex(null);
      setHoverRowIndex(null);
      return;
    }

    // Find their positions in the original campaigns array
    const movedOriginalIndex = currentCampaigns.findIndex(
      c => c.campaign_id === movedCampaign.campaign_id,
    );
    const targetOriginalIndex = currentCampaigns.findIndex(
      c => c.campaign_id === targetCampaign.campaign_id,
    );

    console.log(
      "Moving in original array from:",
      movedOriginalIndex,
      "to:",
      targetOriginalIndex,
    );

    // Reorder the original campaigns array
    const updated = [...currentCampaigns];
    const [movedItem] = updated.splice(movedOriginalIndex, 1);
    updated.splice(targetOriginalIndex, 0, movedItem);

    // Only update priorities for campaigns that actually changed
    // (those between the source and target positions, inclusive)
    const minIdx = Math.min(movedOriginalIndex, targetOriginalIndex);
    const maxIdx = Math.max(movedOriginalIndex, targetOriginalIndex);

    const campaignsWithNewPriorities = updated.map((campaign, index) => ({
      ...campaign,
      priority: index + 1,
    }));

    // Get only the campaigns whose priorities changed
    const campaignsToUpdate = campaignsWithNewPriorities.slice(
      minIdx,
      maxIdx + 1,
    );

    setCampaigns(campaignsWithNewPriorities);
    setDraggedRowIndex(null);
    setHoverRowIndex(null);

    // Highlight the moved row
    setRecentlyMovedRow(movedCampaign.campaign_id);
    setTimeout(() => {
      setRecentlyMovedRow(null);
    }, 4000);

    try {
      // Only update campaigns whose priorities actually changed
      const results = await Promise.allSettled(
        campaignsToUpdate.map(c =>
          updateCampaign(c.campaign_id, { priority: c.priority }),
        ),
      );

      // Check for failures
      const failures = results.filter(r => r.status === "rejected");
      if (failures.length > 0) {
        console.warn(
          `${failures.length} campaign(s) failed to update priority:`,
          failures.map(f => f.reason),
        );
        // Still show success if at least some updates worked
        if (failures.length < campaignsToUpdate.length) {
          toast.success("Campaign priority updated");
        } else {
          toast.error("Failed to update campaign priority");
          setCampaigns(currentCampaigns);
        }
      } else {
        toast.success("Campaign priority updated");
      }
    } catch (err) {
      console.error("Failed to update campaign priority", err);
      toast.error("Failed to update campaign priority");
      setCampaigns(currentCampaigns);
    }
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      // Helper to fetch stats for a batch of campaigns (runs in parallel)
      const fetchStatsForPage = async campaignsForStats => {
        if (campaignsForStats.length === 0) return;

        const campaignIds = campaignsForStats.map(c => c.campaign_id);

        // Mark these campaigns as loading stats
        setLoadingStats(prev => {
          const next = new Set(prev);
          campaignIds.forEach(id => next.add(id));
          return next;
        });

        // Fetch stats for all campaigns in this page (only for current activeTab)
        const allTimeStartDate = "2020-01-01";
        const todayDate = new Date().toISOString().split("T")[0];
        const cacheKey = activeTab === "total" ? "totalStats" : "periodStats";
        const statsResults = await Promise.all(
          campaignsForStats.map(async c => {
            try {
              const stats = await getCampaignStats({
                campaignId: c.campaign_id,
                startDate: activeTab === "total" ? allTimeStartDate : dateFrom,
                endDate: activeTab === "total" ? todayDate : dateTo,
              });
              return {
                campaignId: c.campaign_id,
                stats: { [cacheKey]: stats || {} },
              };
            } catch (err) {
              console.error(
                "Failed to fetch stats for campaign",
                c.campaign_id,
                err,
              );
              return { campaignId: c.campaign_id, stats: {} };
            }
          }),
        );

        // Create a map for quick lookup
        const statsMap = new Map(
          statsResults.map(r => [r.campaignId, r.stats]),
        );

        // Update campaigns with stats
        setCampaigns(prev =>
          prev.map(c => {
            if (statsMap.has(c.campaign_id)) {
              return { ...c, campaignStats: statsMap.get(c.campaign_id) };
            }
            return c;
          }),
        );

        // Remove loaded campaigns from loading set
        setLoadingStats(prev => {
          const nextSet = new Set(prev);
          campaignIds.forEach(id => nextSet.delete(id));
          return nextSet;
        });
      };

      try {
        const userId = user?.email || user?.username;
        let nextCursor = null;
        let isFirstPage = true;

        // Fetch all campaign pages continuously
        do {
          const { campaigns: pageCampaigns, next } = await getCampaigns({
            next: nextCursor,
          });

          // Add campaigns from this page using functional update to avoid race conditions
          setCampaigns(
            prev => {
              // Get existing campaign IDs to avoid duplicates
              const existingIds = new Set(prev.map(c => c.campaign_id));

              // Filter out any campaigns that already exist and add null stats to new ones
              const newCampaigns = pageCampaigns
                .filter(c => !existingIds.has(c.campaign_id))
                .map(c => ({ ...c, campaignStats: null }));

              if (newCampaigns.length === 0) return prev;

              // Merge and sort
              const merged = [...prev, ...newCampaigns];
              return merged.sort((a, b) => {
                if (a.priority == null && b.priority == null) return 0;
                if (a.priority == null) return 1;
                if (b.priority == null) return -1;
                return a.priority - b.priority;
              });
            },
            isFirstPage ? userId : null,
          ); // Set userId on first page

          isFirstPage = false;

          // Fetch stats for non-archived campaigns in parallel (don't await)
          const campaignsForStats = pageCampaigns.filter(c => !c.archived);
          fetchStatsForPage(campaignsForStats);

          nextCursor = next;
        } while (nextCursor);

        setLoadingCampaigns(false);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
        setLoadingCampaigns(false);
        if (err?.response?.status !== 401) {
          toast.error("Failed to fetch campaigns");
        }
        setLoading(false);
      }
    };

    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch stats when activeTab changes (only if not already cached)
  useEffect(() => {
    const fetchStatsForTab = async () => {
      // Determine the cache key based on activeTab
      const cacheKey = activeTab === "total" ? "totalStats" : "periodStats";

      // Get campaigns that need stats for this tab (not yet cached)
      const campaignsToFetch = campaigns.filter(
        c => !c.archived && c.campaignStats && !c.campaignStats[cacheKey],
      );
      if (campaignsToFetch.length === 0) return;

      const campaignIds = campaignsToFetch.map(c => c.campaign_id);

      // Mark as loading
      setLoadingStats(prev => {
        const next = new Set(prev);
        campaignIds.forEach(id => next.add(id));
        return next;
      });

      // Fetch stats with appropriate date range
      const allTimeStartDate = "2020-01-01";
      const todayDate = new Date().toISOString().split("T")[0];
      const statsResults = await Promise.all(
        campaignsToFetch.map(async c => {
          try {
            const stats = await getCampaignStats({
              campaignId: c.campaign_id,
              startDate: activeTab === "total" ? allTimeStartDate : dateFrom,
              endDate: activeTab === "total" ? todayDate : dateTo,
            });
            return { campaignId: c.campaign_id, stats: stats || {} };
          } catch (err) {
            console.error(
              "Failed to fetch stats for campaign",
              c.campaign_id,
              err,
            );
            return { campaignId: c.campaign_id, stats: {} };
          }
        }),
      );

      const statsMap = new Map(statsResults.map(r => [r.campaignId, r.stats]));

      setCampaigns(prev =>
        prev.map(c => {
          if (statsMap.has(c.campaign_id)) {
            return {
              ...c,
              campaignStats: {
                ...c.campaignStats,
                [cacheKey]: statsMap.get(c.campaign_id),
              },
            };
          }
          return c;
        }),
      );

      // Remove from loading set
      setLoadingStats(prev => {
        const nextSet = new Set(prev);
        campaignIds.forEach(id => nextSet.delete(id));
        return nextSet;
      });
    };

    fetchStatsForTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Fetch archived campaigns when "Archived" filter is selected
  useEffect(() => {
    const fetchArchivedCampaigns = async () => {
      // Only proceed if "Archived" filter is selected and we haven't fetched yet
      if (!selectedFilters?.includes("Archived") || archivedFetched) return;

      setArchivedFetched(true);
      setLoadingArchived(true);

      // Helper to fetch stats for archived campaigns
      const fetchStatsForArchivedPage = async campaignsForStats => {
        if (campaignsForStats.length === 0) return;

        const campaignIds = campaignsForStats.map(c => c.campaign_id);

        setLoadingStats(prev => {
          const next = new Set(prev);
          campaignIds.forEach(id => next.add(id));
          return next;
        });

        const allTimeStartDate = "2020-01-01";
        const todayDate = new Date().toISOString().split("T")[0];
        const cacheKey = activeTab === "total" ? "totalStats" : "periodStats";
        const statsResults = await Promise.all(
          campaignsForStats.map(async c => {
            try {
              const stats = await getCampaignStats({
                campaignId: c.campaign_id,
                startDate: activeTab === "total" ? allTimeStartDate : dateFrom,
                endDate: activeTab === "total" ? todayDate : dateTo,
              });
              return {
                campaignId: c.campaign_id,
                stats: { [cacheKey]: stats || {} },
              };
            } catch (err) {
              console.error(
                "Failed to fetch stats for archived campaign",
                c.campaign_id,
                err,
              );
              return { campaignId: c.campaign_id, stats: {} };
            }
          }),
        );

        const statsMap = new Map(
          statsResults.map(r => [r.campaignId, r.stats]),
        );

        setCampaigns(prev =>
          prev.map(c => {
            if (statsMap.has(c.campaign_id)) {
              return { ...c, campaignStats: statsMap.get(c.campaign_id) };
            }
            return c;
          }),
        );

        setLoadingStats(prev => {
          const nextSet = new Set(prev);
          campaignIds.forEach(id => nextSet.delete(id));
          return nextSet;
        });
      };

      try {
        let nextCursor = null;

        // Fetch archived campaigns page by page
        do {
          const { campaigns: archivedPage, next } = await getCampaigns({
            archivedOnly: true,
            next: nextCursor,
          });

          if (archivedPage.length > 0) {
            // Add archived campaigns using functional update to avoid race conditions
            setCampaigns(prev => {
              const existingIds = new Set(prev.map(c => c.campaign_id));

              const newCampaigns = archivedPage
                .filter(c => !existingIds.has(c.campaign_id))
                .map(c => ({ ...c, campaignStats: null }));

              if (newCampaigns.length === 0) return prev;

              const merged = [...prev, ...newCampaigns];
              return merged.sort((a, b) => {
                if (a.priority == null && b.priority == null) return 0;
                if (a.priority == null) return 1;
                if (b.priority == null) return -1;
                return a.priority - b.priority;
              });
            });

            // Fetch stats for archived campaigns in parallel
            fetchStatsForArchivedPage(archivedPage);
          }

          nextCursor = next;
        } while (nextCursor);

        setLoadingArchived(false);
      } catch (err) {
        console.error("Failed to fetch archived campaigns", err);
        setLoadingArchived(false);
      }
    };

    fetchArchivedCampaigns();
  }, [selectedFilters]); // Re-run when filters change

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      // Clean up drag clone if component unmounts during drag
      if (dragCloneRef.current) {
        dragCloneRef.current.remove();
        dragCloneRef.current = null;
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch stats for a single campaign when row toggles
  const toggleRow = async campaignId => {
    if (openRow === campaignId) {
      setOpenRow(null);
      return;
    }

    // Check if we need to fetch stats for the current tab
    const campaign = campaigns.find(c => c.campaign_id === campaignId);
    const cacheKey = activeTab === "total" ? "totalStats" : "periodStats";
    const needsFetch = !campaign?.campaignStats?.[cacheKey];

    if (needsFetch) {
      try {
        const allTimeStartDate = "2020-01-01";
        const todayDate = new Date().toISOString().split("T")[0];
        // Fetch only current tab's stats
        const stats = await getCampaignStats({
          campaignId,
          startDate: activeTab === "total" ? allTimeStartDate : dateFrom,
          endDate: activeTab === "total" ? todayDate : dateTo,
        });
        setCampaigns(prev =>
          prev.map(c =>
            c.campaign_id === campaignId
              ? {
                  ...c,
                  campaignStats: {
                    ...c.campaignStats,
                    [cacheKey]: stats || {},
                  },
                }
              : c,
          ),
        );
      } catch (err) {
        console.error(err);
        if (err?.response?.status !== 401) {
          toast.error("Failed to fetch campaign stats");
        }
      }
    }

    setOpenRow(campaignId);
  };

  // Update status handler
  const toggleStatus = async campaignId => {
    const current = campaigns.find(c => c.campaign_id === campaignId);
    const newStatus = current?.status === "running" ? "paused" : "running";

    // If starting a campaign for the first time, show confirmation dialog
    if (newStatus === "running" && current?.started !== true) {
      setStartCampaignId(campaignId);
      return;
    }

    // Otherwise, update status directly
    await performStatusUpdate(campaignId, newStatus);
  };

  // Perform the actual status update
  const performStatusUpdate = async (campaignId, newStatus) => {
    try {
      await updateCampaign(campaignId, { status: newStatus });

      setCampaigns(prev =>
        prev.map(c =>
          c.campaign_id === campaignId
            ? { ...c, status: newStatus, started: newStatus === "running" ? true : c.started }
            : c,
        ),
      );

      toast.success("Status updated");
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to update campaign status");
      }
    }
  };

  // Handle confirmed campaign start
  const handleConfirmStart = async () => {
    if (!startCampaignId) return;
    await performStatusUpdate(startCampaignId, "running");
    setStartCampaignId(null);
  };

  const handleArchiveCampaign = async campaignId => {
    try {
      await updateCampaign(campaignId, { archived: true });

      setCampaigns(prev =>
        prev.map(c =>
          c.campaign_id === campaignId ? { ...c, archived: true } : c,
        ),
      );

      toast.success("Campaign archived Successfully");
      setDeleteCampignId(null);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to archive campaign");
      }
      console.error(err);
    }
  };

  const handleUnarchive = async campaignId => {
    try {
      await updateCampaign(campaignId, { archived: false, status: "paused" });

      setCampaigns(prev =>
        prev.map(c =>
          c.campaign_id === campaignId
            ? { ...c, archived: false, status: "paused" }
            : c,
        ),
      );

      toast.success("Campaign unarchived Successfully");
      setDeleteCampignId(null);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to unarchive campaign");
      }
    }
  };

  // Delete handler
  const handleDeleteCampaign = async () => {
    if (!deleteCampaignId) return;
    try {
      await deleteCampaign(deleteCampaignId);
      toast.success("Campaign deleted successfully");
      setCampaigns(prev =>
        prev.filter(c => c.campaign_id !== deleteCampaignId),
      );
      setDeleteCampignId(null);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to delete campaign");
      }
      console.error(err);
    }
  };

  useSmoothReorder(campaigns);

  // Debug: Time when filtering starts
  const filterStart = performance.now();
  const filteredCampaigns = campaigns.filter(c => {
    if (!selectedFilters || selectedFilters.length === 0) return false;

    const hasArchivedFilter = selectedFilters.includes("Archived");

    const matchesStatus = c.archived === true ? hasArchivedFilter : selectedFilters.some(f => {
      switch (f) {
        case "Paused":
          return (
            c.status === "paused" &&
            c.fetch_status !== "failed" &&
            c.status !== "failed"
          );

        case "Running":
          return (
            c.status === "running" &&
            c.fetch_status !== "pending" &&
            c.fetch_status !== "fetching" &&
            c.fetch_status !== "failed" &&
            c.status !== "failed"
          );

        case "Fetching":
          return (
            (c.fetch_status === "pending" || c.fetch_status === "fetching") &&
            c.status === "running"
          );

        case "Failed":
          return c.fetch_status === "failed" || c.status === "failed";

        case "Archived":
          return false;

        default:
          return true;
      }
    });

    if (!matchesStatus) return false;

    // Filter by tags if any tags are selected
    if (selectedTags && selectedTags.length > 0) {
      if (!c.campaign_tags || !Array.isArray(c.campaign_tags)) return false;
      const matchesTags = selectedTags.some(tag => c.campaign_tags.includes(tag));
      if (!matchesTags) return false;
    }

    // Filter by source if any sources are selected
    if (selectedSources && selectedSources.length > 0) {
      const source = c.source;
      if (!source) return false;
      
      const matchesSource = selectedSources.some(sourceKey => {
        switch (sourceKey) {
          case "filter_url":
            return !!source.filter_url;
          case "profile_urls":
            return !!source.profile_urls;
          case "filter_api":
            return !!source.filter_api || !!source.filter_fields;
          case "existing_campaign":
            return !!source.existing_campaign;
          default:
            return false;
        }
      });
      
      if (!matchesSource) return false;
    }

    return true;
  });

  // Debug: Log filtered results and timing
  console.log(
    "Filtered campaigns:",
    filteredCampaigns.length,
    "in",
    (performance.now() - filterStart).toFixed(2),
    "ms",
  );

  return (
    <div
      ref={tableContainerRef}
      className="border border-[#7E7E7E] rounded-[8px] shadow-md max-h-[650px] overflow-auto max-w-full custom-scroll"
    >
      <table className="w-full bg-white">
        <thead className="text-left font-poppins mb-[16px] bg-white">
          <tr className="text-[16px] text-[#6D6D6D] border-b border-b-[#00000020]">
            <th className="px-3 pt-[10px] !font-[400] pb-[10px]"></th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px]"></th>
            <th className="px-2 pt-[10px] !font-[400] pb-[10px] text-center">
              #
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px]">Campaign</th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Sources
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Tags
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Profiles
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Invites
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Acceptance Rate %
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Response Rate %
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              <div className="flex items-center justify-center gap-x-2.5">
                <FaceIcon className="fill-[#1FB33F]" />
                <p>Responses</p>
              </div>
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Status
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredCampaigns?.map((row, index) => {
            // Use cached stats based on activeTab
            const statsKey = activeTab === "total" ? "totalStats" : "periodStats";
            const stats = row.campaignStats?.[statsKey] || {};
            const isDragged = draggedRowIndex === index;
            const isRecentlyMoved = recentlyMovedRow === row.campaign_id;
            const isStatsLoading =
              loadingStats.has(row.campaign_id) ||
              row.campaignStats === null ||
              !row.campaignStats?.[statsKey];
            const isDropTarget =
              hoverRowIndex === index &&
              draggedRowIndex !== null &&
              draggedRowIndex !== index;

            return (
              <React.Fragment key={row.campaign_id}>
                <tr
                  data-row-id={row.campaign_id}
                  className={`font-normal text-[12px] text-[#454545] transition-[background-color] duration-150 ${
                    openRow === row.campaign_id
                      ? "border-b-0"
                      : "border-b border-[#00000020]"
                  } ${
                    isDragged
                      ? "bg-blue-100 opacity-50"
                      : isDropTarget
                      ? "bg-blue-50 border-t-2 border-t-[#0387FF]"
                      : isRecentlyMoved
                      ? "bg-[#12D7A8] border-l-4 border-l-[#03045E]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td
                    className="px-4 py-2 cursor-grab select-none"
                    onMouseDown={e => handleMouseDown(index, e)}
                  >
                    <div className="flex justify-center items-center">
                      <ThreeDashIcon
                        className={`w-5 h-5 ${
                          isDragged ? "text-blue-500" : "text-gray-600"
                        }`}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => toggleRow(row.campaign_id)}
                      className="cursor-pointer"
                    >
                      <DropArrowIcon className="w-3 h-3 text-gray-600" />
                    </button>
                  </td>
                  <td className="px-2 py-2 text-center">{index + 1}</td>
                  <td className="px-4 py-2 max-w-[200px]">
                    <button
                      onClick={() =>
                        navigate(`/campaigns/edit/${row.campaign_id}`)
                      }
                      title={row.name}
                      className="text-left hover:underline hover:text-[#12D7A8] transition-colors cursor-pointer truncate w-full block"
                    >
                      {row.name}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center">
                      {renderSourceIcon(row.source)}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center relative">
                      {(() => {
                        const userTags = user?.campaign_tags || [];
                        const commonTags = (row.campaign_tags || []).filter(tag =>
                          userTags.includes(tag),
                        );
                        const hasTags = commonTags.length > 0;

                        return (
                          <Tooltip
                            content={
                              hasTags ? commonTags.join(", ") : "No Tags Assigned"
                            }
                          >
                            <div
                              className="cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors"
                              onClick={() =>
                                setOpenTagDropdownId(
                                  openTagDropdownId === row.campaign_id
                                    ? null
                                    : row.campaign_id,
                                )
                              }
                            >
                              <TagIcon2
                                className="w-5 h-5 text-[#6D6D6D]"
                                filled={hasTags}
                              />
                            </div>
                          </Tooltip>
                        );
                      })()}
                      {openTagDropdownId === row.campaign_id && (
                        <TagDropdown
                          campaign={row}
                          allTags={user?.campaign_tags || []}
                          onClose={() => setOpenTagDropdownId(null)}
                          onToggleTag={handleToggleCampaignTag}
                          onAddGlobalTag={handleAddGlobalTag}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {row.source?.profile_urls ? (
                      <Tooltip
                        content={
                          <div className="text-left">
                            <div>{row.profiles_count} profiles added</div>
                            {row.profile_urls_pending_count > 0 && (
                              <div>
                                {row.profile_urls_pending_count} URLs pending
                              </div>
                            )}
                          </div>
                        }
                      >
                        <span>
                          {row.profiles_count}
                          {row.profile_urls_pending_count > 0 && (
                            <span className="text-gray-400">
                              {" "}
                              / {row.profile_urls_pending_count}
                            </span>
                          )}
                        </span>
                      </Tooltip>
                    ) : (
                      row.profiles_count
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {isStatsLoading ? (
                      <span className="inline-block w-8 h-4 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      getStatValue(stats?.linkedin_invite, activeTab)
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {isStatsLoading ? (
                      <span className="inline-block w-10 h-4 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <Tooltip
                        content={
                          <div className="text-left">
                            <div className="font-semibold text-[11px] mb-1 flex items-center">
                              Acceptance:&nbsp;
                              {(() => {
                                const invites = getStatValue(
                                  stats?.linkedin_invite,
                                );
                                const accepted = getStatValue(
                                  stats?.linkedin_invite_accepted,
                                );
                                if (invites === 0) return "0%";
                                return (
                                  ((accepted / invites) * 100).toFixed(1) + "%"
                                );
                              })()}
                            </div>
                            <div>
                              {getStatValue(stats?.linkedin_invite)} Invited
                            </div>
                            <div>
                              {getStatValue(stats?.linkedin_invite_accepted)}{" "}
                              Accepted
                            </div>
                          </div>
                        }
                      >
                        <span>
                          {(() => {
                            const invites = getStatValue(
                              stats?.linkedin_invite,
                            );
                            const accepted = getStatValue(
                              stats?.linkedin_invite_accepted,
                            );
                            if (invites === 0) return "0%";
                            return (
                              ((accepted / invites) * 100).toFixed(1) + "%"
                            );
                          })()}
                        </span>
                      </Tooltip>
                    )}
                  </td>

                  <td className="px-4 py-2 text-center">
                    {isStatsLoading ? (
                      <span className="inline-block w-10 h-4 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <Tooltip
                        content={
                          <div className="text-left">
                            <div className="mb-2">
                              <div className="font-semibold text-[12px] mb-1">
                                LinkedIn (
                                {(() => {
                                  const msgs = getStatValue(
                                    stats?.linkedin_message,
                                  );
                                  const replies = getStatValue(
                                    stats?.linkedin_reply,
                                  );
                                  if (msgs === 0) return "0%";
                                  return (
                                    ((replies / msgs) * 100).toFixed(1) + "%"
                                  );
                                })()}
                                )
                              </div>
                              <div>
                                {getStatValue(stats?.linkedin_message)}{" "}
                                Contacted
                              </div>
                              <div>
                                {getStatValue(stats?.linkedin_reply)} Responded
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-[12px] mb-1">
                                Email (
                                {(() => {
                                  const msgs = getStatValue(
                                    stats?.email_message,
                                  );
                                  const replies = getStatValue(
                                    stats?.email_reply,
                                  );
                                  if (msgs === 0) return "0%";
                                  return (
                                    ((replies / msgs) * 100).toFixed(1) + "%"
                                  );
                                })()}
                                )
                              </div>
                              <div>
                                {getStatValue(stats?.email_message)} Emails
                              </div>
                              <div>
                                {getStatValue(stats?.email_reply)} Replied
                              </div>
                            </div>
                          </div>
                        }
                      >
                        <span>
                          {(() => {
                            const linkedinMessages = getStatValue(
                              stats?.linkedin_message,
                            );
                            const linkedinReplies = getStatValue(
                              stats?.linkedin_reply,
                            );
                            const emailMessages = getStatValue(
                              stats?.email_message,
                            );
                            const emailReplies = getStatValue(
                              stats?.email_reply,
                            );

                            const totalMessages =
                              linkedinMessages + emailMessages;
                            const totalReplies =
                              linkedinReplies + emailReplies;

                            if (totalMessages === 0) return "0%";
                            return (
                              ((totalReplies / totalMessages) * 100).toFixed(
                                1,
                              ) + "%"
                            );
                          })()}
                        </span>
                      </Tooltip>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {isStatsLoading ? (
                      <span className="inline-block w-10 h-4 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <Tooltip
                        content={(() => {
                          const positive = getStatValue(
                            stats?.conversation_sentiment_positive,
                          );
                          const neutral = getStatValue(
                            stats?.conversation_sentiment_neutral,
                          );
                          const negative = getStatValue(
                            stats?.conversation_sentiment_negative,
                          );
                          const total = positive + neutral + negative;

                          if (total === 0) return "0 Positives (0%)";

                          return `${positive} Positives  (${(
                            (positive / total) *
                            100
                          ).toFixed(1)}%)`;
                        })()}
                      >
                        <span>
                          {(() => {
                            const positive = getStatValue(
                              stats?.conversation_sentiment_positive,
                            );
                            const neutral = getStatValue(
                              stats?.conversation_sentiment_neutral,
                            );
                            const negative = getStatValue(
                              stats?.conversation_sentiment_negative,
                            );

                            const total = positive + neutral + negative;
                            if (total === 0) return "0%";

                            return ((positive / total) * 100).toFixed(1) + "%";
                          })()}
                        </span>
                      </Tooltip>
                    )}
                  </td>

                  <td className="px-4 py-2 text-center">
                    {linkedin ? (
                      (row.fetch_status === "pending" ||
                        row.fetch_status === "fetching") &&
                      !row.source?.profile_urls ? (
                        <Tooltip
                          content={
                            row.fetch_total_count > 0
                              ? `${row.profiles_count} / ${row.fetch_total_count}`
                              : row.profiles_count
                          }
                        >
                          <div className="inline-block w-[80px] h-[24px] bg-[#0387FF] rounded-[10px] overflow-hidden relative">
                            {row.fetch_total_count > 0 ? (
                              <>
                                <div
                                  className="h-full bg-[#0256b3] transition-all duration-300"
                                  style={{
                                    width: `${
                                      (row.profiles_count /
                                        row.fetch_total_count) *
                                      100
                                    }%`,
                                  }}
                                />
                                <div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-[shimmer_1.5s_infinite]"
                                  style={{
                                    backgroundSize: "200% 100%",
                                  }}
                                />
                              </>
                            ) : (
                              <div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-[shimmer_1.5s_infinite]"
                                style={{
                                  backgroundSize: "200% 100%",
                                }}
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                              Fetching
                            </div>
                          </div>
                        </Tooltip>
                      ) : row.fetch_status === "failed" ||
                        row.status === "failed" ? (
                        <button className="text-xs px-3 w-[80px] py-1 text-white rounded-[10px] bg-[#f61d00]">
                          Failed
                        </button>
                      ) : row.source?.profile_urls &&
                        row.status === "paused" &&
                        row.profile_urls_pending_count > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <button className="text-xs px-3 w-[80px] py-1 text-white rounded-[10px] bg-gray-400">
                            Paused
                          </button>
                          <Tooltip content="Profile URLs will not be fetched while the campaign is paused">
                            <svg
                              className="w-5 h-5 cursor-help"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M12 3L2 21h20L12 3z"
                                stroke="#EAB308"
                                strokeWidth="2"
                                strokeLinejoin="round"
                                fill="none"
                              />
                              <path
                                d="M12 9v4M12 17v0.5"
                                stroke="#EAB308"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Tooltip>
                        </div>
                      ) : row.source?.profile_urls &&
                        row.status === "running" &&
                        row.profile_urls_pending_count > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <button className="text-xs px-3 w-[80px] py-1 text-white rounded-[10px] bg-[#25C396]">
                            Running
                          </button>
                          <Tooltip content="Profile URLs will be fetched and processed at the same time while the campaign is running">
                            <svg
                              className="w-5 h-5 cursor-help"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="#0387FF"
                                strokeWidth="2"
                                fill="none"
                              />
                              <path
                                d="M12 8v0.5M12 11v5"
                                stroke="#0387FF"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Tooltip>
                        </div>
                      ) : (
                        <button
                          className={`text-xs px-3 w-[80px] py-1 text-white rounded-[10px] ${
                            row.archived === true
                              ? "bg-gray-600"
                              : row.status === "running"
                              ? "bg-[#25C396]"
                              : row.status === "paused"
                              ? "bg-gray-400"
                              : "bg-gray-400"
                          }`}
                        >
                          {row.archived === true
                            ? "Archived"
                            : row.status === "running"
                            ? "Running"
                            : row.status === "paused"
                            ? "Paused"
                            : "Unknown"}
                        </button>
                      )
                    ) : (
                      <button className="text-xs px-3 w-[120px] py-1 text-white rounded-[10px] bg-[#f61d00]">
                        Disconnected
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      {linkedin &&
                        (row.source?.profile_urls ||
                          (row.fetch_status !== "pending" &&
                            row.fetch_status !== "fetching")) &&
                        !row.archived && (
                          <Tooltip
                            content={
                              isExpired && row.status === "paused"
                                ? isAgencyUser
                                  ? "Subscription expired."
                                  : "Subscription expired. Please renew to start campaigns."
                                : row.status === "running"
                                ? "Pause Campaign"
                                : "Run Campaign"
                            }
                          >
                            <button
                              className={`rounded-full p-[2px] bg-white border ${
                                isExpired && row.status === "paused"
                                  ? "border-gray-300 cursor-not-allowed opacity-50"
                                  : row.status === "running"
                                  ? "border-[#16A37B] cursor-pointer"
                                  : "border-[#03045E] cursor-pointer"
                              }`}
                              onClick={() => {
                                if (isExpired && row.status === "paused")
                                  return;
                                toggleStatus(row.campaign_id);
                              }}
                              disabled={isExpired && row.status === "paused"}
                            >
                              {row.status === "running" ? (
                                <PlayIcon className="w-4 h-4 fill-[#16A37B]" />
                              ) : (
                                <PauseIcon className="w-4 h-4 fill-[#03045E]" />
                              )}
                            </button>
                          </Tooltip>
                        )}

                      <Tooltip content="Graph Stats">
                        <button
                          onClick={() => toggleRow(row.campaign_id)}
                          className="rounded-full bg-white cursor-pointer p-[2px] border border-[#0077B6]"
                        >
                          <GraphIcon className="w-4 h-4 fill-[#0077B6]" />
                        </button>
                      </Tooltip>

                      <Tooltip content="Edit Campaign">
                        <button
                          onClick={() =>
                            navigate(`/campaigns/edit/${row.campaign_id}`)
                          }
                          className="rounded-full bg-white cursor-pointer p-[2px] border border-[#12D7A8]"
                        >
                          <PencilIcon className="w-4 h-4 fill-[#12D7A8]" />
                        </button>
                      </Tooltip>
                      {row.archived && (
                        <Tooltip content="Unarchive">
                          <button
                            onClick={() => handleUnarchive(row.campaign_id)}
                            className="rounded-full bg-white cursor-pointer p-[2px] border border-[#03045E]"
                          >
                            <Unarchive className="w-4 h-4 fill-[#03045E]" />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip content="Delete Campaign">
                        <button
                          onClick={() => {
                            setDeleteCampignId(row.campaign_id);
                            setStatus(row.archived ? "archived" : row.status);
                          }}
                          className="rounded-full bg-white cursor-pointer p-[2px] border border-[#D80039]"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                {openRow === row.campaign_id && (
                  <tr className="border-b border-[#00000020]">
                    <td colSpan="12" className="px-4 py-3">
                      <div className="grid grid-cols-10 grid-rows-1 gap-3 mt-3">
                        {buildPeriodStats(stats, activeTab).map(
                          (stat, idx) => (
                            <div
                              key={`${row.campaign_id}-${stat.title}`}
                              className="bg-[#EFEFEF] p-2 relative shadow border border-[#00000020] rounded-[4px]"
                            >
                              <PeriodCard
                                title={stat.title}
                                value={stat.value}
                              />
                              <TooltipInfo
                                text={stat.info}
                                className="absolute bottom-2 right-2"
                                isLast={idx === stats.length - 1}
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {deleteCampaignId && (
        <DeleteModal
          onClose={() => setDeleteCampignId(null)}
          onClick={handleDeleteCampaign}
          onArchive={() => handleArchiveCampaign(deleteCampaignId)}
          onUnarchive={() => handleUnarchive(deleteCampaignId)}
          status={status}
        />
      )}
      {startCampaignId && (
        <StartCampaignModal
          onClose={() => setStartCampaignId(null)}
          onConfirm={handleConfirmStart}
        />
      )}
    </div>
  );
};

export default CampaignsTable;
