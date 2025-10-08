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
import { Helmet } from "react-helmet";
import ConversationsList from "../../components/inbox/conversationsList";
import ConversationDetails from "../../components/inbox/ConversationDetails";
import toast from "react-hot-toast";
import { createLabel } from "../../services/users";
import { getConversations, getConversationsCount } from "../../services/inbox";
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

const Inbox = ({ type }) => {
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
  } = useInboxStore();

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
  const [conversationCounts, setConversationCounts] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibleCount, setVisibleCount] = useState(100);
  const [localFilteredConversations, setLocalFilteredConversations] = useState(
    [],
  );
  useEffect(() => {
    if (!conversations.length && !loading) {
      fetchConversations(null);
    }
  }, []);
  useEffect(() => {
    const autoLoad = async () => {
      if (!next || loading) return;
      await new Promise(r => setTimeout(r, 100));
      await fetchConversations(next);
    };

    autoLoad();
  }, [next, loading]);

  // Fetch conversations with pagination
  const fetchConversations = useCallback(
    async (next = null) => {
      if (loading) return;
      setLoading(true);
      try {
        const data = await getConversations({ next });
        setConversations(
          next
            ? [...conversations, ...data.conversations]
            : data.conversations,
        );

        if (!selectedConversation && data?.conversations?.length > 0) {
          setSelectedConversation(data.conversations[0]);
        }

        if (next != null) {
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
    ],
  );

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
  }, []);

  // Initial fetch
  useEffect(() => {
    resetFilters();

    fetchConversations();

    const fetchCampaigns = async () => {
      try {
        const res = await getCampaigns();
        setCampaigns(res || []);
      } catch (err) {
        console.error("Failed to load campaigns:", err);
        toast.error("Could not load campaigns");
      }
    };
    fetchCampaigns();
  }, []);

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
  useEffect(() => {
    let result = [...visibleConversations];
    console.log(filters);
    // archived filter
    if (filters.archived === false) {
      result = result.filter(
        conv => conv?.archived === false || conv?.archived == null,
      );
    } else if (filters.archived === true) {
      result = result.filter(conv => conv?.archived === true);
    }
    console.log("archived", result);

    if (filters.read !== null && filters.read !== undefined) {
      result = result.filter(conv => {
        const isRead = conv?.read ?? false; // default to false if undefined
        return isRead === filters.read;
      });
    }
    console.log("read", result);

    // keyword filter (search in title or message text)
    if (filters.keyword) {
      console.log("keyword....");
      const kw = filters.keyword.toLowerCase();
      result = result.filter(conv => {
        const haystack = [
          conv.sentiment,
          ...(conv.labels || []),
          conv.profile?.first_name,
          conv.profile?.last_name,
          conv.profile?.headline,
        ]
          .filter(Boolean) // remove undefined/null
          .join(" ") // make one string
          .toLowerCase();

        return haystack.includes(kw);
      });
    }
    console.log("keyword", result);

    // sentiment filter
    if (filters.sentiment) {
      result = result.filter(conv => conv.sentiment === filters.sentiment);
    }
    console.log("sentiment", result);
    // labels filter
    if (filters.label) {
      result = result.filter(conv => conv.labels?.includes(filters.label));
    }

    console.log("label", result);

    if (filters.campaigns && filters.campaigns.length > 0) {
      result = result.filter(conv =>
        conv.profile_instances?.some(pi =>
          filters.campaigns.includes(pi.campaign_id),
        ),
      );
    }
    console.log("campaigns", result);

    //setFilteredConversations(result);
    setLocalFilteredConversations(result); // Use local state
  }, [filters, visibleConversations]);

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

    // Add API labels first (since they’re authoritative)
    Object.entries(apiLabels).forEach(([label, count]) => {
      const key = label.trim().toLowerCase();
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
      toast.success("Tag created successfully!");
      setShowAddTagPopup(false);
    } catch (err) {
      console.error("Failed to create label:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to create label");
      }
    }
  };
  const handleExportCSV = async () => {
    try {
      setShowProgress(true);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);
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

      const rows = conversations.map(conv => {
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

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Zeekeo Launchpad - Inbox</title>
      </Helmet>
      <div className="flex bg-[#EFEFEF]">
        {type !== "agency" && <SideBar />}
        <div
          className={`w-full flex flex-col gap-y-[45px] px-[30px] font-urbanist ${
            type === "agency" ? "py-[45px] " : "py-[67px]"
          }`}
        >
          <h1
            className={`text-[#6D6D6D] text-[48px] ${
              type === "agency" ? "font-[300]" : "font-medium"
            }`}
          >
            Inbox
          </h1>

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
              <CampaignsFilter campaigns={campaigns} />

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
              />

              <SentimentFilter />

              <MoreOptionsDropdown
                onExportCSV={() => {
                  handleExportCSV();
                }}
              />

              {/* Archive Button */}
              <ArchiveToggleButton />
              {type === "agency" && (
                <div className="relative h-[35px]" ref={userOptionsRef}>
                  <div
                    className="cursor-pointer h-[35px] w-[160px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2 rounded-[6px]"
                    onClick={() => setShowUserOptions(prev => !prev)}
                  >
                    <span className=" text-base font-medium">
                      {currentUser}
                    </span>
                    <DropArrowIcon className="h-[14px] w-[12px]" />
                  </div>

                  {showUserOptions && (
                    <div className="absolute top-[40px] left-0 w-[160px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E]  text-base font-medium rounded-[6px] overflow-hidden">
                      {users.map(user => (
                        <div
                          key={user}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setCurrentUser(user);
                            setShowUserOptions(false);
                          }}
                        >
                          {user}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                filteredConversations={localFilteredConversations || []} // <-- pass local filtered conversations
              />
              <ConversationDetails campaigns={campaigns} />
            </div>
            {/* {visibleCount < localFilteredConversations.length && (
              <div className="flex justify-center w-[350px] my-4">
                <button
                  className="px-6 py-2 bg-[#0387FF] text-white rounded"
                  onClick={() =>
                    setVisibleCount(prev =>
                      Math.min(prev + 100, localFilteredConversations.length),
                    )
                  }
                >
                  Next
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
