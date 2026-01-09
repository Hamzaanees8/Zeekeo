import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ProfileImage from "../../../../components/ProfileImage";
import {
  updateAgencyUserConversation,
  getConversationsCount,
} from "../../../../services/agency";

import {
  LinkedIn,
  ThreeDots,
  TagIcon,
  EyeIcon,
} from "../../../../components/Icons";
import { formatDate, sentimentInfo } from "../../../../utils/inbox-helper";
import useInboxStore from "../../../stores/useInboxStore";

const ConversationsList = ({
  selectedItems,
  setSelectedItems,
  filteredConversations,
  loading,
  email,
  isConversationFound,
  setConversationCounts,
}) => {
  const {
    //filteredConversations,
    conversations,
    selectedConversation,
    setSelectedConversation,
    updateConversationInStore,
    predefinedLabels,
    customLabels,
    //loading,
  } = useInboxStore();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef();
  const [visibleCount, setVisibleCount] = useState(100);
  const [dropdownPosition, setDropdownPosition] = useState({});
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConversationClick = async conv => {
    setSelectedConversation(conv);
    // If unread, mark as read
    if (!conv.read) {
      try {
        if (!email) {
          return;
        }
        await updateAgencyUserConversation(
          conv.profile_id,
          { read: true },
          email,
        );
        updateConversationInStore(conv.profile_id, { read: true });
        try {
          const counts = await getConversationsCount(email);
          if (counts) {
            setConversationCounts(counts);
          }
        } catch (err) {
        }
      } catch (err) {
        console.error("Failed to update conversation:", err);
      }
    }
  };

  const getDropdownItems = conv => {
    // Get the latest conversation data from the store to ensure we have the most up-to-date read status
    const latestConv = conversations.find(c => c.profile_id === conv.profile_id) || conv;
    const items = [];

    if (latestConv.read) {
      items.push("Mark Unread");
    } else {
      items.push("Mark Read");
    }

    items.push("Archive");

    items.push({
      type: "labelHeader",
      label: "Label As",
    });

    [...predefinedLabels, ...customLabels].forEach(label => {
      items.push({
        type: "label",
        category: label.type,
        label: label.name,
        active: latestConv.labels?.includes(label.name),
      });
    });

    return items;
  };

  const handleDropdownAction = async (conv, action) => {
    try {
      if (action === "Mark Read" || action === "Mark Unread") {
        const read = action === "Mark Read";
        await updateAgencyUserConversation(
          conv.profile_id,
          {
            read,
          },
          email,
        );
        updateConversationInStore(conv.profile_id, { read });
        toast.success(
          `Conversation marked as ${read ? "read" : "unread"} successfully! `,
        );
        try {
          const counts = await getConversationsCount(email);
          if (counts) {
            setConversationCounts(counts);
          }
        } catch (err) {
          console.error("Failed to refresh conversation counts:", err);
        }
      }
      if (action === "Archive") {
        await updateAgencyUserConversation(
          conv.profile_id,
          {
            archived: true,
          },
          email,
        );
        updateConversationInStore(conv.profile_id, { archived: true });
      }

      // Labels can be handled separately
      if (
        predefinedLabels.some(l => l.name === action) ||
        customLabels.some(l => l.name === action)
      ) {
        const currentLabels = conv.labels || [];
        let newLabels;

        const alreadyExists = currentLabels.some(l => l === action);
        console.log(alreadyExists);
        if (alreadyExists) {
          // remove by name
          newLabels = currentLabels.filter(l => l !== action);
        } else {
          // add new label object
          newLabels = [...currentLabels, action];
        }

        await updateAgencyUserConversation(
          conv.profile_id,
          {
            labels: newLabels,
          },
          email,
        );
        updateConversationInStore(conv.profile_id, { labels: newLabels });
        toast.success(`Conversation tags saved successfully! `);
        try {
          const counts = await getConversationsCount(email);
          if (counts) setConversationCounts(counts);
        } catch (err) {
          console.error("Failed to refresh conversation counts:", err);
        }
      }
    } catch (err) {
      console.error("Failed to update conversation:", err);
    } finally {
      setActiveDropdown(null);
    }
  };
  useEffect(() => {
    setVisibleCount(100);
  }, [filteredConversations]);

  const toggleSelectItem = id => {
    const newSelected = selectedItems.includes(id)
      ? selectedItems.filter(item => item !== id)
      : [...selectedItems, id];
    setSelectedItems(newSelected);
  };

  if (!isConversationFound) {
    return (
      <div className="w-[350px] text-[#7E7E7E] p-4">
        <p>Conversations not found...</p>
      </div>
    );
  }

  const visibleConversations = (filteredConversations || []).slice(0, visibleCount);

  if (conversations?.length === 0) {
    return (
      <div className="w-[350px] text-[#7E7E7E] p-4">
        <p>Loading conversations...</p>
      </div>
    );
  }
  return (
    <div>
      <div className="min-w-[350px] text-white overflow-y-auto max-h-[90vh] custom-scroll1 mr-[5px]">
        {!filteredConversations || filteredConversations?.length === 0 ? (
          <div className="empty-message text-gray-500 p-4">
            No conversations found matching your filters.
          </div>
        ) : (
          visibleConversations.map(conv => (
            <div
              key={conv.profile_id}
              className={`cursor-pointer border-[2px]  pr-2 mr-2 py-2 px-1.5 my-2 rounded-[6px] 
              ${
                selectedConversation?.profile_id === conv.profile_id
                  ? "bg-[#D2EEEF] border-[#D7D7D7]"
                  : !conv.read
                  ? "bg-white border-[#007EBB]"
                  : "bg-transparent border-[#D7D7D7]"
              }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-1">
                  {/* Checkbox */}
                  <div
                    className="w-[14px] h-[14px] border-2 border-[#6D6D6D] cursor-pointer flex items-center justify-center rounded-[2px]"
                    onClick={() => toggleSelectItem(conv.profile_id)}
                  >
                    {selectedItems.includes(conv.profile_id) && (
                      <div className="w-[8px] h-[8px] bg-[#0387FF] rounded-[2px]" />
                    )}
                  </div>

                  {/* Platform icon */}
                  <LinkedIn className="w-7 h-7 fill-[#007EBB]" />

                  {/* Profile info */}
                  <div
                    className="flex gap-2 w-[180px]"
                    onClick={() => handleConversationClick(conv)}
                  >
                    <ProfileImage
                      profile={{ ...conv.profile, profile_id: conv.profile_id }}
                      size="w-11 h-11"
                      className="shadow-[0_0_6px_rgba(0,0,0,0.3)]"
                    />

                    <div className="flex flex-col">
                      <span
                        className={`font-bold text-sm ${
                          selectedConversation?.profile_id === conv.profile_id
                            ? "text-[#0096C7]"
                            : "text-[#7E7E7E]"
                        }`}
                      >
                        {conv.profile?.first_name || conv.profile?.last_name
                          ? `${conv.profile?.first_name || ""}${
                              conv.profile?.last_name
                                ? " " + conv.profile.last_name
                                : ""
                            }`
                          : "Unknown"}
                      </span>
                      <span className="text-[#7E7E7E] font-medium text-[13px] line-clamp-1">
                        {conv.profile?.headline || ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date + Actions */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[#0096C7] text-[12px]">
                    {formatDate(conv.last_message_timestamp)}
                  </span>
                  <div className="flex gap-1.5">
                    {conv.labels?.map((label, idx) => (
                      <span key={idx} title={label}>
                        {" "}
                        <TagIcon className="h-[18px] w-[18px] text-[#7E7E7E] cursor-pointer" />
                      </span>
                    ))}

                    {conv.read && (
                      <EyeIcon className="h-[18px] w-[18px] fill-[#7E7E7E]" />
                    )}

                    {sentimentInfo(conv?.sentiment)}

                    {/* Dropdown */}
                    <div
                      className="relative"
                      onClick={e => {
                        const target = e.currentTarget;
                        const rect = target.getBoundingClientRect();
                        const viewportHeight = window.innerHeight;
                        const spaceBelow = viewportHeight - rect.bottom;
                        const spaceAbove = rect.top; // max-height of dropdown

                        // Determine if dropdown should open upward
                        // Open upward if there's not enough space below AND there's more space above
                        const shouldOpenUpward =
                          spaceBelow < 600 && spaceAbove > spaceBelow;

                        setDropdownPosition({
                          [conv.profile_id]: shouldOpenUpward ? "up" : "down",
                        });

                        setActiveDropdown(prev =>
                          prev === conv.profile_id ? null : conv.profile_id,
                        );
                      }}
                    >
                      <ThreeDots className="h-4 w-4 fill-[#7E7E7E] cursor-pointer" />
                      {activeDropdown && activeDropdown == conv.profile_id && (
                        <div
                          ref={dropdownRef}
                          className={`absolute right-0 w-40 bg-white shadow-lg border border-gray-200 rounded z-50 max-h-[300px] overflow-y-auto ${
                            dropdownPosition[conv.profile_id] === "up"
                              ? "bottom-4"
                              : "top-4"
                          }`}
                        >
                          <ul className="text-sm text-[#454545]">
                            {getDropdownItems(conv).map((item, idx) => {
                              if (typeof item === "string") {
                                // Normal clickable item
                                return (
                                  <li
                                    key={idx}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() =>
                                      handleDropdownAction(conv, item)
                                    }
                                  >
                                    {item}
                                  </li>
                                );
                              }

                              if (item.type === "labelHeader") {
                                // Non-clickable header
                                return (
                                  <li
                                    key={idx}
                                    className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase"
                                  >
                                    {item.label}
                                  </li>
                                );
                              }

                              if (item.type === "label") {
                                // Label options
                                return (
                                  <li
                                    key={idx}
                                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer pl-6 ${
                                      item.active
                                        ? "font-semibold text-[#0096C7]"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleDropdownAction(conv, item.label)
                                    }
                                  >
                                    {item.label}
                                  </li>
                                );
                              }

                              return null;
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {visibleCount < filteredConversations.length && (
        <div className="flex justify-center w-full my-4 z-100">
          <button
            className="px-6 z-100 py-2 bg-[#0387FF] text-white rounded-md hover:bg-[#0075e0] transition w-[150px] cursor-pointer"
            onClick={() =>
              setVisibleCount(prev =>
                Math.min(prev + 100, filteredConversations.length),
              )
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationsList;
