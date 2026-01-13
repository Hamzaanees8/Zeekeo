import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import SideBar from "../../components/SideBar";
import {
  StepReview,
  FilterIcon,
  Cross,
  DropArrowIcon,
} from "../../components/Icons";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import { Helmet } from "react-helmet";
import ConversationsList from "../../components/inbox/ConversationsList";
import ConversationDetails from "../../components/inbox/ConversationDetails";
import toast from "react-hot-toast";
import { createLabel } from "../../services/users";
import {
  getAgencyUserConversations,
  getAgencyUserProfileInstances,
  getConversations,
  getConversationsCount,
  getProfileInstances,
} from "../../services/inbox";
import { getCurrentUser, getUserLabels } from "../../utils/user-helpers";
import useInboxStore from "../stores/useInboxStore";
import SentimentFilter from "../../components/inbox/SentimentFilter";
import TagsFilter from "../../components/inbox/TagsFilter";
import MoreOptionsDropdown from "../../components/inbox/MoreOptionsDropdown";
import ArchiveToggleButton from "../../components/inbox/ArchiveToggleButton";
import "./index.css";
import { getCampaigns } from "../../services/campaigns";
import CampaignsFilter from "../../components/inbox/CampaignsFilter";
import ProgressModal from "../../components/ProgressModal";
import { getAgencyuserCampaigns, getAgencyUsers } from "../../services/agency";
import { isWhitelabelDomain } from "../../utils/whitelabel-helper";
import { useAgencyPageStyles } from "../stores/useAgencySettingsStore";
import { useIsEmbed } from "../../hooks/useIsEmbed";

const Inbox = ({ type }) => {
  const pageStyles = useAgencyPageStyles();

  const isEmbed = useIsEmbed(); // Check if we are in embed mode
  const {
    conversations,
    setConversations,
    //filteredConversations,
    //setFilteredConversations,
    filters,
    setFilters,
    resetFilters,
    selectedConversation,
    setSelectedConversation,
    predefinedLabels,
    customLabels,
    setCustomLabels,
    conversationCounts,
    setConversationCounts,
  } = useInboxStore();
console.log("conversation",conversations);
  const [campaigns, setCampaigns] = useState([]);

  const [isShowDropdown1, setIsShowDropdown1] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [showSentiment, setShowSentiment] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState("Sentiment");
  const [showTags, setShowTags] = useState(false);
  const [selectedTag, setSelectedTag] = useState("Tags");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showAddTagPopup, setShowAddTagPopup] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tagOptions, setTagOptions] = useState([]);
  const [userLabels, setUserLabels] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(false);
  const sentimentRef = useRef(null);
  const createDropdownRef = useRef(null);
  const moreOptionsRef = useRef(null);
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [currentUser, setCurrentUser] = useState("Select User");
  const userOptionsRef = useRef(null);
  const users = ["User"];
  // conversationCounts is now stored in the inbox store
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibleCount, setVisibleCount] = useState(100);
  const [userData, setUserData] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTags, setExportTags] = useState([]);
  const [exportTypes, setExportTypes] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exportDateRange, setExportDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const typeOptions = ["Active", "Archived"];

  useEffect(() => {
    if (showExportModal) {
      // Sync Tags
      const initialTags = [];
      if (filters.label) {
        initialTags.push(filters.label);
      }
      if (filters.read === false) {
        initialTags.push("unread");
      }
      setExportTags(initialTags);

      // Sync Active/Archived Type
      const initialTypes = [];
      if (filters.archived === true) {
        initialTypes.push("Archived");
      } else if (filters.archived === false || filters.archived === null) {
        initialTypes.push("Active");
      }
      setExportTypes(initialTypes);
    }
  }, [showExportModal, filters.label, filters.read, filters.archived]);

  useEffect(() => {
    if (!conversations.length && !loading) {
      fetchConversations(null);
    }

    return () => {
      setConversations([]);
      setSelectedConversation(null);
      setNext(null);
    };
  }, []);
  useEffect(() => {
    const autoLoad = async () => {
      if (!next || loading) return;
      await new Promise(r => setTimeout(r, 100));
      // Pass current campaign filter when paginating
      const campaignIds = filters.campaigns?.length > 0 ? filters.campaigns : null;
      await fetchConversations(next, campaignIds);
    };

    autoLoad();
  }, [next, loading, filters.campaigns]);

  // Fetch conversations with pagination
  // const fetchConversations = useCallback(
  //   async (next = null) => {
  //     if (loading) return;
  //     setLoading(true);
  //     try {
  //       let data;

  //       if (type === 'agency' && currentUser?.email) {
  //         data = await getAgencyUserConversations({
  //           next,
  //           email: currentUser.email
  //         });
  //       } else if (type != 'agency') {
  //         data = await getConversations({ next });
  //       }

  //       setConversations(
  //         next
  //           ? [...conversations, ...data.conversations]
  //           : data.conversations,
  //       );

  //       if (!selectedConversation && data?.conversations?.length > 0) {
  //         setSelectedConversation(data.conversations[0]);
  //       }

  //       if (data?.next) {
  //         setNext(data.next);
  //       } else {
  //         setNext(null);
  //       }

  //       const userLabels = getUserLabels();
  //       setCustomLabels(userLabels);
  //     } catch (err) {
  //       console.error("Failed to fetch conversations:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [loading, next, conversations, currentUser, type, setConversations, setSelectedConversation, setNext, setCustomLabels]
  // );
  const fetchConversations = useCallback(
    async (nextToken = null, campaignIds = null) => {
      if (loading) return;
      setLoading(true);
      try {
        let data;
        if (type === "agency") {
          if (type != "agency" || !currentUser?.email) {
            return;
          }
          data = await getAgencyUserConversations({
            next: nextToken,
            email: currentUser?.email,
            campaignIds,
          });
        } else if (type != "agency") {
          const resData = await getConversations({ next: nextToken, campaignIds });
          data = resData;
        }
        setConversations(
          nextToken
            ? [...conversations, ...data.conversations]
            : data.conversations,
        );

        if (!selectedConversation && data?.conversations?.length > 0) {
          setSelectedConversation(data.conversations[0]);
        }

        if (nextToken != null) {
          setVisibleCount(visibleCount + 100);
        }

        if (data?.next) {
          setNext(data.next);
        } else {
          setNext(null);
        }

        const userLabels = getUserLabels();
        setCustomLabels(userLabels);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      next,
      conversations,
      setConversations,
      selectedConversation,
      setSelectedConversation,
      setNext,
      setCustomLabels,
      currentUser,
    ],
  );
  const handleUserChange = useCallback(user => {
    setConversations([]);
    setSelectedConversation(null);
    setNext(null);
    resetFilters();

    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (type === "agency") {
      fetchConversations();
    }
  }, [currentUser, type]);

  useEffect(() => {
    const fetchConversationsCount = async () => {
      try {
        const res = await getConversationsCount();
        if (res) {
          setConversationCounts(res);
          console.log("✅ Conversations count:", res);
        }
      } catch (err) {
        console.error("Failed to load count:", err);
        toast.error("Could not load conversations count");
      }
    };
    fetchConversationsCount();
  }, [currentUser]);

  // Refetch when campaign filter changes (backend filtering)
  const prevCampaignsRef = useRef(filters.campaigns);
  useEffect(() => {
    const prevCampaigns = prevCampaignsRef.current;
    const currentCampaigns = filters.campaigns;
    prevCampaignsRef.current = currentCampaigns;

    // Skip on initial render
    if (prevCampaigns === currentCampaigns) return;

    setConversations([]);
    setSelectedConversation(null);
    setNext(null);

    if (currentCampaigns && currentCampaigns.length > 0) {
      // Pass all selected campaign IDs for backend filtering
      fetchConversations(null, currentCampaigns);
    } else {
      // Filter cleared, fetch all conversations
      fetchConversations(null, null);
    }
  }, [filters.campaigns]);

  // Initial fetch
  useEffect(() => {
    resetFilters();

    fetchConversations();

    const fetchCampaigns = async () => {
      try {
        if (type == "agency" && currentUser.email) {
          const res = await getAgencyuserCampaigns([currentUser.email]);
          setCampaigns(res?.campaigns || []);
        } else {
          const res = await getCampaigns({ all: true });
          setCampaigns(res?.campaigns || []);
        }
      } catch (err) {
        console.error("Failed to load campaigns:", err);
        toast.error("Could not load campaigns");
      }
    };
    fetchCampaigns();
  }, [currentUser]);

  // Infinite scroll handler
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (
  //       window.innerHeight + window.scrollY >=
  //         document.documentElement.scrollHeight - 200 && // near bottom
  //       next &&
  //       !loading
  //     ) {
  //       console.log("scrolling... for next...");
  //       fetchConversations(next);
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  const visibleConversations = useMemo(
    () => conversations.slice(0, visibleCount),
    [conversations, visibleCount],
  );

  // Apply filters in-memory
  const localFilteredConversations = useMemo(() => {
    let result = [...conversations];

    // archived filter
    if (filters.archived === false) {
      result = result.filter(
        conv => conv?.archived === false || conv?.archived == null,
      );
    } else if (filters.archived === true) {
      result = result.filter(conv => conv?.archived === true);
    }

    if (filters.read !== null && filters.read !== undefined) {
      result = result.filter(conv => {
        const isRead = conv?.read ?? false;
        return isRead === filters.read;
      });
    }

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(conv => {
        const haystack = [
          conv.sentiment,
          ...(conv.labels || []),
          conv.profile?.first_name,
          conv.profile?.last_name,
          conv.profile?.headline,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(kw);
      });
    }

    if (filters.sentiment) {
      result = result.filter(conv => conv.sentiment === filters.sentiment);
    }

    if (filters.label) {
      result = result.filter(conv => conv.labels?.includes(filters.label));
    }

    return result;
  }, [filters, conversations]);

  useEffect(() => {
    const stillExists =
      selectedConversation &&
      localFilteredConversations.some(
        conv => conv.profile_id === selectedConversation.profile_id,
      );

    if (!stillExists) {
      setSelectedConversation(null);
      if (localFilteredConversations.length > 0) {
        setSelectedConversation(localFilteredConversations[0]);
      }
    }
  }, [localFilteredConversations, selectedConversation]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        sentimentRef.current &&
        !sentimentRef.current.contains(event.target)
      ) {
        setShowSentiment(false);
      }

      if (
        createDropdownRef.current &&
        !createDropdownRef.current.contains(event.target)
      ) {
        setShowTags(false);
      }

      if (
        moreOptionsRef.current &&
        !moreOptionsRef.current.contains(event.target)
      ) {
        setShowMoreOptions(false);
      }
      if (
        userOptionsRef.current &&
        !userOptionsRef.current.contains(event.target)
      ) {
        setShowUserOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildTagOptions = () => {
    if (!conversationCounts) return [];

    const totalConversations = conversationCounts?.total || 0;
    const unreadCount = conversationCounts?.unread || 0;
    const apiLabels = conversationCounts?.labels || {};

    // Base options (always visible)
    const tagOptions = [
      { type: "action", label: "+ Add New Tag", value: null },
      {
        type: "option",
        label: "All Conversations",
        count: totalConversations,
        value: null,
      },
      {
        type: "read",
        label: "Unread Messages",
        count: unreadCount,
        value: "unread",
      },
    ];

    // Map to ensure case-insensitive uniqueness
    const labelMap = new Map();

    // Allowed labels: user's labels from session + predefined/custom labels
    const sessionUserLabels = getUserLabels() || [];
    const allowedSet = new Set(
      [
        ...sessionUserLabels,
        ...predefinedLabels.map(l => l.name),
        ...customLabels.map(l => l.name),
      ].map(s => String(s).trim().toLowerCase()),
    );

    // Add API labels first but filter out any API labels that the user doesn't have
    Object.entries(apiLabels).forEach(([label, count]) => {
      const key = label.trim().toLowerCase();
      if (!allowedSet.has(key)) {
        // skip API labels that are not present in user's labels or predefined/custom lists
        return;
      }
      labelMap.set(key, {
        label: label.trim(),
        count,
      });
    });

    // Add predefined/custom labels if missing in API
    [...predefinedLabels, ...customLabels].forEach(l => {
      const key = l.name.trim().toLowerCase();
      if (!labelMap.has(key)) {
        labelMap.set(key, {
          label: l.name.trim(),
          count: 0,
        });
      }
    });

    // Convert to dropdown options
    labelMap.forEach(({ label, count }) => {
      tagOptions.push({
        type: "option",
        label,
        count,
        value: label,
      });
    });

    return tagOptions;
  };

  useEffect(() => {
    const options = buildTagOptions();
    setTagOptions(options);
  }, [conversations, filters?.archived, conversationCounts]);

  const handleAddCustomLabel = async () => {
    if (!newTag) {
      toast.error("Please enter Tag name!");
      return;
    }

    try {
      const updatedUser = await createLabel(newTag);
      setCustomLabels(updatedUser.labels);

      // Refresh conversation counts to update dropdown
      const res = await getConversationsCount();
      if (res) {
        setConversationCounts(res);
      }

      toast.success("Tag created successfully!");
      setShowAddTagPopup(false);
      setNewTag("");
    } catch (err) {
      console.error("Failed to create label:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to create label");
      }
    }
  };
  const handleExportCSV = async (selectedTags = [], selectedTypes = [], isAll = false) => {
    try {
      setShowProgress(true);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 70));
      }, 300);

      // Note: We use conversations instead of localFilteredConversations here 
      // to allow cross-archive exporting if the modal filters allow it.
      // However, we still apply keyword, sentiment, label, and campaign filters.
      let filteredForExport = [...conversations];

      if (!isAll) {
        // Apply date range filter
        if (exportDateRange[0].startDate && exportDateRange[0].endDate) {
          const start = new Date(exportDateRange[0].startDate);
          const end = new Date(exportDateRange[0].endDate);
          end.setHours(23, 59, 59, 999); // Include the entire end day

          filteredForExport = filteredForExport.filter(conv => {
            if (!conv.last_message_timestamp) return false;
            const convDate = new Date(conv.last_message_timestamp);
            return convDate >= start && convDate <= end;
          });
        }

        // Re-apply same logic as local filtering but use modal's archive selection
        if (selectedTypes.length > 0) {
          filteredForExport = filteredForExport.filter(conv => {
            const isActive = conv?.archived === false || conv?.archived == null;
            const isArchived = conv?.archived === true;
            
            if (selectedTypes.includes("Active") && selectedTypes.includes("Archived")) return true;
            if (selectedTypes.includes("Active")) return isActive;
            if (selectedTypes.includes("Archived")) return isArchived;
            return false;
          });
        } else {
          // If nothing selected in modal, respect global archive filter
          if (filters.archived === false) {
            filteredForExport = filteredForExport.filter(conv => conv?.archived === false || conv?.archived == null);
          } else if (filters.archived === true) {
            filteredForExport = filteredForExport.filter(conv => conv?.archived === true);
          }
        }

        // Apply other global filters (keyword and sentiment)
        if (filters.keyword) {
          const kw = filters.keyword.toLowerCase();
          filteredForExport = filteredForExport.filter(conv => {
            const haystack = [
              conv.sentiment,
              ...(conv.labels || []),
              conv.profile?.first_name,
              conv.profile?.last_name,
              conv.profile?.headline,
            ].filter(Boolean).join(" ").toLowerCase();
            return haystack.includes(kw);
          });
        }

        if (filters.sentiment) {
          filteredForExport = filteredForExport.filter(conv => conv.sentiment === filters.sentiment);
        }

        // Apply selected tags/unread logic
        if (selectedTags.length > 0) {
          filteredForExport = filteredForExport.filter(conv => 
            selectedTags.some(tag => {
              if (tag === "unread") return conv.read === false;
              return conv.labels?.includes(tag);
            })
          );
        } else if (filters.label) {
          // If no tags selected in modal, respect global label filter
          filteredForExport = filteredForExport.filter(conv => conv.labels?.includes(filters.label));
        }
      }

      // Fetch profile instances for all selected conversations before export
      const conversationsWithInstances = await Promise.all(
        filteredForExport.map(async conv => {
          try {
            let instances;
            if (type === "agency" && currentUser?.email) {
              instances = await getAgencyUserProfileInstances({
                profileId: conv.profile_id,
                email: currentUser.email,
              });
            } else {
              instances = await getProfileInstances({
                profileId: conv.profile_id,
              });
            }
            return { ...conv, profile_instances: instances };
          } catch (err) {
            console.error(`Failed to fetch profile instances for ${conv.profile_id}:`, err);
            return { ...conv, profile_instances: [] };
          }
        }),
      );

      setProgress(80);

      const user = getCurrentUser();
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(
        now.getHours(),
      ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;

      const fileName =
        `${user.first_name}_${user.last_name}_${timestamp}.csv`.replace(
          /\s+/g,
          "_",
        );
      const headers = [
        "Profile ID",
        "First Name",
        "Last Name",
        "Headline",
        "Email",
        "Sentiment",
        "Read",
        "Campaign ID(s)",
        "Replied At",
        "Connected At",
        "Company",
        "Industry",
        "Location",
        "Role",
        "Phone",
        "LinkedIn URL",
        "Network Distance",
        "Premium",
        "Influencer",
        "Open To Work",
        "Last Message Timestamp",
      ];

      const rows = conversationsWithInstances.map(conv => {
        const instance = conv.profile_instances?.[0] || {};
        const position = instance.current_positions?.[0] || {};
        const phone = instance.contact_info?.phone || "";

        return [
          conv.profile_id || "",
          conv.profile?.first_name || "",
          conv.profile?.last_name || "",
          conv.profile?.headline || "",
          conv.user_email || "",
          conv.sentiment || "",
          conv.read ? "Yes" : "No",
          instance.campaign_id || "",
          instance.replied_at
            ? new Date(instance.replied_at).toLocaleString()
            : "",
          instance.connected_at
            ? new Date(instance.connected_at).toLocaleString()
            : "",
          position.company || "",
          position.industry || "",
          position.location || "",
          position.role || "",
          phone,
          instance.sales_profile_url || "",
          instance.network_distance ?? "",
          instance.is_premium ? "Yes" : "No",
          instance.is_influencer ? "Yes" : "No",
          instance.is_open_to_work ? "Yes" : "No",
          conv.last_message_timestamp
            ? new Date(conv.last_message_timestamp).toLocaleString()
            : "",
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map(r =>
          r
            .map(v => {
              const safeValue = String(v || "")
                .replace(/"/g, '""') // escape internal quotes
                .replace(/\r?\n|\r/g, " "); // remove newlines
              return `"${safeValue}"`;
            })
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
        toast.success("Conversations exported successfully!");
      }, 800);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export conversations.");
      setShowProgress(false);
    }
  };
  const handleAbort = () => {
    setShowProgress(false);
    setProgress(0);
    toast("Export cancelled");
  };

  const fetchAgencyUsers = useCallback(async (cursor = null) => {
    try {
      if (type !== "agency") {
        return;
      }
      const response = await getAgencyUsers();
      console.log("Fetched agency users:", response);

      setUserData(response?.users);
      setCurrentUser(response?.users[0]);
    } catch (err) {
      console.error("Failed to fetch agency users:", err);
    }
  }, []);

  useEffect(() => {
    fetchAgencyUsers();
  }, []);

  console.log("campaigns", campaigns);
  console.log("tag options", tagOptions);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {isWhitelabelDomain() ? "Inbox" : "Zeekeo Launchpad - Inbox"}
        </title>
      </Helmet>
      <div className={isEmbed ? "embed-container" : "flex"} style={pageStyles}>
        {type !== "agency" && !isEmbed && <SideBar />}
        <div
          className={`w-full flex flex-col gap-y-[45px] px-[30px] font-urbanist ${
            type === "agency" ? "py-[45px] " : "py-[67px]"
          }`}
        >
          <h1
            className={`text-[48px] ${
              type === "agency" ? "font-[300]" : "font-medium"
            }`}
            style={{ color: "var(--page-text-color, #6D6D6D)" }}
          >
            Inbox
          </h1>
          {type === "agency" && (
            <div className="relative h-[35px]" ref={userOptionsRef}>
              {/* Dropdown toggle */}
              <div
                className="cursor-pointer h-[35px] w-[390px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2 rounded-[6px]"
                onClick={() => setShowUserOptions(prev => !prev)}
              >
                <span className="text-base font-medium">
                  {currentUser?.first_name
                    ? `${currentUser.first_name} ${
                        currentUser.last_name || ""
                      }`
                    : "Select User"}
                </span>
                <DropArrowIcon className="h-[14px] w-[12px]" />
              </div>

              {showUserOptions && (
                <div className="absolute top-[40px] left-0 w-[390px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-base font-medium rounded-[6px] overflow-hidden">
                  {userData?.map(user => {
                    const profileUrl =
                      user?.accounts?.linkedin?.data?.profile_picture_url ||
                      "/default-avatar.png";

                    return (
                      <div
                        key={user.email}
                        className="flex items-center gap-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          handleUserChange(user);
                          setShowUserOptions(false);
                        }}
                      >
                        <img
                          className="w-[40px] h-[40px] rounded-full object-cover"
                          src={profileUrl}
                          alt={`${user.first_name} ${user.last_name}`}
                        />
                        <span>
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* 🔍 Top row */}
          <div className="flex justify-between items-start w-full">
            <div className="flex justify-center items-center gap-x-3 pr-3">
              <div className="relative w-[390px] h-[35px]">
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

            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <FilterIcon className="w-5 h-5 cursor-pointer" />
              <CampaignsFilter campaigns={campaigns ?? []} />

              {/* Type Dropdown */}
              {/*  <div className="relative h-[35px]">
                <select className="appearance-none cursor-pointer h-[35px] w-[140px] border border-[#7E7E7E] px-5 text-base font-medium bg-white text-[#7E7E7E] focus:outline-none pr-10 leading-6">
                  <option value="">Type</option>
                  {typeOptions.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
                  <DropArrowIcon className="h-[14px] w-[12px]" />
                </div>
              </div> */}

              <TagsFilter
                tagOptions={tagOptions}
                setShowAddTagPopup={setShowAddTagPopup}
                setCustomLabels={setCustomLabels}
                onLabelsChange={async () => {
                  // Refresh conversation counts after label changes
                  try {
                    const res = await getConversationsCount();
                    if (res) {
                      setConversationCounts(res);
                    }
                  } catch (err) {
                    console.error(
                      "Failed to refresh conversation counts:",
                      err,
                    );
                  }
                }}
              />

              <SentimentFilter />

              <MoreOptionsDropdown
                onExportCSV={() => {
                  setShowExportModal(true);
                }}
              />

              {/* Archive Button */}
              <ArchiveToggleButton />
            </div>
          </div>

          {/* 📩 Messages Section */}
          <div className="flex flex-col">
            <div className="flex items-center gap-x-5 mb-2 text-[#6D6D6D] font-medium text-base">
              <div
                className="w-[16px] h-[16px] border-2 border-[#6D6D6D] cursor-pointer flex items-center justify-center rounded-[3px]"
                onClick={() => {
                  const checked = !allSelected;
                  setAllSelected(checked);
                  setSelectedItems(
                    checked
                      ? localFilteredConversations.map(c => c.profile_id)
                      : [],
                  );
                }}
              >
                {allSelected && (
                  <div className="w-[8px] h-[8px] bg-[#0387FF] rounded-[1px]" />
                )}
              </div>
              <label className="text-[16px] font-urbanist">
                Select All Messages
              </label>
            </div>

            <div className="flex w-full border-t border-t-[#D7D7D7] myInboxDiv">
              <ConversationsList
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                allSelected={allSelected}
                setAllSelected={setAllSelected}
                loading={false}
                filteredConversations={localFilteredConversations || []}
              />
              <ConversationDetails
                campaigns={campaigns}
                type={type}
                email={currentUser.email}
              />
            </div>
            {/* {visibleCount < conversations.length && (
              <div className="flex justify-center w-full my-4">
                <button
                  className="px-6 py-2 bg-[#0387FF] text-white rounded-md hover:bg-[#0075e0] transition w-[150px] cursor-pointer"
                  onClick={() => {
                    const newVisibleCount = Math.min(visibleCount + 100, conversations.length);
                    setVisibleCount(newVisibleCount);

                    // If we're near the end and there's more data to fetch, fetch it
                    if (newVisibleCount >= conversations.length - 20 && next && !loading) {
                      const campaignIds = filters.campaigns?.length > 0 ? filters.campaigns : null;
                      fetchConversations(next, campaignIds);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Next"}
                </button>
              </div>
            )} */}
          </div>
        </div>
        {showAddTagPopup && (
          <div className="fixed inset-0  flex items-center justify-center z-50">
            <div className="bg-white w-[450px] max-h-[90vh] rounded-[6px] overflow-auto p-5 relative border border-[#7E7E7E] shadow-lg">
              <span
                className="text-[20px] cursor-pointer absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddTagPopup(false)}
              >
                <Cross className="w-5 h-5 fill-[#7E7E7E]" />
              </span>
              <h2 className="text-[20px] font-semibold font-urbanist text-[#04479C] mb-4">
                Add New Tag
              </h2>
              <input
                type="text"
                placeholder="Your Label Name"
                onChange={e => setNewTag(e.target.value)}
                value={newTag}
                className="w-full border border-[#7E7E7E] rounded-[6px] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-6 py-1 text-white text-sm bg-[#0387FF] cursor-pointer rounded-[4px]"
                  onClick={() => handleAddCustomLabel()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {showExportModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
            <div className="bg-white w-[500px] max-h-[90vh] rounded-[8px] overflow-hidden flex flex-col relative border border-[#7E7E7E] shadow-lg">
              <div className="px-6 py-4 border-b border-[#D7D7D7] flex justify-between items-center">
                <h2 className="text-[20px] font-semibold font-urbanist text-[#04479C]">
                  Export Conversations
                </h2>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowExportModal(false)}
                >
                  <Cross className="w-5 h-5 fill-[#7E7E7E]" />
                </span>
              </div>

              <div className="p-6 overflow-y-auto custom-scroll1 flex-1">
                {/* Filter by Date section */}
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-[#7E7E7E] mb-3">Filter by Date</h3>
                  <div className="relative">
                    <div
                      className="w-full border border-[#D7D7D7] rounded-[4px] px-3 py-2 flex justify-between items-center cursor-pointer text-sm text-[#6D6D6D]"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                      <span>
                        {exportDateRange[0].startDate && exportDateRange[0].endDate
                          ? `${format(exportDateRange[0].startDate, "MMM dd, yyyy")} - ${format(exportDateRange[0].endDate, "MMM dd, yyyy")}`
                          : "Select Date Range"}
                      </span>
                      <DropArrowIcon className={`w-3 h-3 transition-transform ${showDatePicker ? "rotate-180" : ""}`} />
                    </div>
                    {showDatePicker && (
                      <div className="absolute top-full left-0 z-[60] bg-white shadow-xl border border-[#D7D7D7] mt-1 rounded-[8px] overflow-hidden">
                        <DateRange
                          editableDateInputs={false}
                          onChange={(item) => setExportDateRange([item.selection])}
                          moveRangeOnFirstSelection={false}
                          ranges={exportDateRange[0].startDate ? exportDateRange : [{ startDate: new Date(), endDate: new Date(), key: "selection" }]}
                          direction="horizontal"
                          rangeColors={["#0387FF"]}
                        />
                        <div className="p-2 border-t border-[#D7D7D7] flex justify-end gap-2 bg-gray-50">
                          <button
                            className="text-xs text-[#7E7E7E] hover:underline px-2 py-1"
                            onClick={() => {
                              setExportDateRange([{ startDate: null, endDate: null, key: "selection" }]);
                              setShowDatePicker(false);
                            }}
                          >
                            Clear
                          </button>
                          <button
                            className="text-xs bg-[#0387FF] text-white px-3 py-1 rounded-[4px]"
                            onClick={() => setShowDatePicker(false)}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-base font-semibold text-[#7E7E7E] mb-3">Filter by Label/Tags</h3>
                  <div className="grid grid-cols-2 gap-y-3">
                    {tagOptions
                      .filter(opt => (opt.type === "option" || opt.type === "read") && opt.value !== null)
                      .map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-x-2">
                          <input
                            type="checkbox"
                            id={`tag-${idx}`}
                            className="w-4 h-4 cursor-pointer"
                            style={{ accentColor: "#0387FF" }}
                            checked={exportTags.includes(opt.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExportTags([...exportTags, opt.value]);
                              } else {
                                setExportTags(exportTags.filter(t => t !== opt.value));
                              }
                            }}
                          />
                          <label htmlFor={`tag-${idx}`} className="text-sm text-[#6D6D6D] cursor-pointer truncate" title={opt.label}>
                            {opt.label}
                          </label>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#7E7E7E] mb-3">Filter by Type</h3>
                  <div className="grid grid-cols-2 gap-y-3">
                    {typeOptions.map((typeOpt, idx) => (
                      <div key={idx} className="flex items-center gap-x-2">
                        <input
                          type="checkbox"
                          id={`type-${idx}`}
                          className="w-4 h-4 cursor-pointer"
                          style={{ accentColor: "#0387FF" }}
                          checked={exportTypes.includes(typeOpt)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExportTypes([...exportTypes, typeOpt]);
                            } else {
                              setExportTypes(exportTypes.filter(t => t !== typeOpt));
                            }
                          }}
                        />
                        <label htmlFor={`type-${idx}`} className="text-sm text-[#6D6D6D] cursor-pointer">
                          {typeOpt}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#D7D7D7] flex justify-end gap-x-3">
                <button
                  className="px-6 py-2 text-[#7E7E7E] border border-[#7E7E7E] rounded-[4px] font-medium transition hover:bg-gray-50 cursor-pointer text-sm"
                  onClick={() => setShowExportModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 text-[#0387FF] border border-[#0387FF] rounded-[4px] font-medium transition hover:bg-blue-50 cursor-pointer text-sm"
                  onClick={() => {
                    handleExportCSV(exportTags, exportTypes);
                    setShowExportModal(false);
                  }}
                >
                  Export Selected
                </button>
                <button
                  className="px-6 py-2 text-white bg-[#0387FF] rounded-[4px] font-medium transition hover:bg-[#0075e0] cursor-pointer text-sm"
                  onClick={() => {
                    handleExportCSV([], [], true);
                    setShowExportModal(false);
                  }}
                >
                  Export All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showProgress && (
        <ProgressModal
          onClose={handleAbort}
          title="Exporting CSV..."
          action="Abort Process"
          progress={progress}
        />
      )}
    </>
  );
};

export default Inbox;
