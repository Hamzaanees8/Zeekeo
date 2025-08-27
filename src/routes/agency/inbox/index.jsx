import { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import useInboxStore from "../../stores/useInboxStore";
import { getConversations } from "../../../services/inbox";
import { createLabel } from "../../../services/users";
import { Cross, FilterIcon, StepReview } from "../../../components/Icons";
import TagsFilter from "../../../components/inbox/TagsFilter";
import SentimentFilter from "../../../components/inbox/SentimentFilter";
import MoreOptionsDropdown from "../../../components/inbox/MoreOptionsDropdown";
import ArchiveToggleButton from "../../../components/inbox/ArchiveToggleButton";
import ConversationsList from "../../../components/inbox/conversationsList";
import ConversationDetails from "../../../components/inbox/ConversationDetails";
import Inbox from "../../inbox";

const campaignOptions = ["Campaign 1", "Campaign 2"];
const typeOptions = ["LinkedIn", "Email"];

const AgencyInbox = () => {
  const {
    conversations,
    setConversations,
    filteredConversations,
    setFilteredConversations,
    filters,
    setFilters,
    resetFilters,
    selectedConversation,
    setSelectedConversation,
    predefinedLabels,
    customLabels,
    setCustomLabels,
  } = useInboxStore();

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

  // Fetch conversations with pagination
  const fetchConversations = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await getConversations({ next });
      console.log(data.conversations);
      setConversations(
        next ? [...conversations, ...data.conversations] : data.conversations,
      );

      if (!selectedConversation && data?.conversations?.length > 0) {
        setSelectedConversation(data.conversations[0]);
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
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200 && // near bottom
        next &&
        !loading
      ) {
        console.log("scrolling... for next...");
        fetchConversations(next);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Apply filters in-memory
  useEffect(() => {
    let result = [...conversations];
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
      result = result.filter(conv => conv?.read === filters.read);
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

    setFilteredConversations(result);
  }, [filters, conversations]);

  useEffect(() => {
    const stillExists =
      selectedConversation &&
      filteredConversations.some(
        conv => conv.profile_id === selectedConversation.profile_id,
      );

    if (!stillExists) {
      setSelectedConversation(null);
      if (filteredConversations.length > 0) {
        setSelectedConversation(filteredConversations[0]);
      }
    }
  }, [filteredConversations, selectedConversation]);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildTagOptions = () => {
    let result = [...conversations];
    console.log(filters);
    // archived filter
    if (filters.archived === false) {
      result = result.filter(
        conv => conv?.archived === false || conv?.archived == null,
      );
    } else if (filters.archived === true) {
      result = result.filter(conv => conv?.archived === true);
    }

    const totalConversations = result.length;
    const unreadCount = result.filter(c => !c.read).length;

    // Count conversations per label
    const countByLabel = {};
    result.forEach(c => {
      if (Array.isArray(c.labels)) {
        c.labels.forEach(label => {
          countByLabel[label] = (countByLabel[label] || 0) + 1;
        });
      }
    });

    // Start with static actions
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

    // Add predefined labels
    predefinedLabels.forEach(label => {
      tagOptions.push({
        type: "option",
        label: label.name,
        count: countByLabel[label.name] || 0,
        value: label.name,
      });
    });

    // Add custom labels
    customLabels.forEach(label => {
      tagOptions.push({
        type: "option",
        label: label.name,
        count: countByLabel[label.name] || 0,
        value: label.name,
      });
    });

    return tagOptions;
  };

  useEffect(() => {
    const options = buildTagOptions();
    setTagOptions(options);
  }, [conversations, filters?.archived]);

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
    }
  };

  return (
    <div>
      <Inbox type="agency" />
    </div>
  );
};

export default AgencyInbox;
