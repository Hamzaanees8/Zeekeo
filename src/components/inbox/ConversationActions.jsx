import React, { useState, useRef, useEffect, useMemo } from "react";
import { Reply, MarkMail, InboxArchive, TagIcon } from "../Icons";
import { getConversations, updateConversation } from "../../services/inbox";
import useInboxStore from "../../routes/stores/useInboxStore";
import toast from "react-hot-toast";
import { getProfiles, updateProfile } from "../../services/profiles";

const ConversationActions = ({ conversation }) => {
  const {
    conversations,
    setConversations,
    selectedConversation,
    updateConversationInStore,
    predefinedLabels,
    customLabels,
    setCustomLabels,
  } = useInboxStore();

  const [forceContinue, setForceContinue] = useState(false); // <-- profile value
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef();

  const latestConversation = useMemo(
    () =>
      conversations.find(c => c.profile_id === conversation?.profile_id) ||
      conversation,
    [conversations, conversation],
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('fetching profile...')
        if (!conversation?.profile_id) return;
        const profile = await getProfiles(conversation.profile_id);
        setForceContinue(!!profile?.force_continue_messages);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, [conversation?.profile_id]);

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

  const getDropdownItems = conv => {
    const items = [];

    items.push({
      type: "labelHeader",
      label: "Label As",
    });

    [...predefinedLabels, ...customLabels].forEach(label => {
      items.push({
        type: "label",
        category: label.type,
        label: label.name,
        active: conv.labels?.includes(label.name),
      });
    });

    return items;
  };

  const handleCheckboxToggle = async () => {
    const newValue = !forceContinue;
    setForceContinue(newValue);

    try {
      await updateProfile(conversation.profile_id, {
        force_continue_messages: newValue,
      });

      toast.success(
        `Force Continue Messaging ${newValue ? "enabled" : "disabled"}`,
      );
    } catch (err) {
      console.error("Failed to update force_continue_messaging:", err);
      toast.error("Failed to update Force Continue Messaging");
    }
  };

  const handleDropdownAction = async (conv, action) => {
    try {
      if (action === "reply") {
        const writeSection = document.getElementById("writeMessageSection");
        writeSection?.scrollIntoView({ behavior: "smooth" });
      }
      if (action === "Mark Read" || action === "Mark Unread") {
        const read = action === "Mark Read";
        await updateConversation(conv.profile_id, {
          read,
        });
        updateConversationInStore(conv.profile_id, { read });
        toast.success(
          `Conversation marked as ${read ? "read" : "unread"} successfully! `,
        );
      }
      if (action === "Archive") {
        const archived = !conv?.archived;
        await updateConversation(conv.profile_id, { archived });
        updateConversationInStore(conv.profile_id, { archived });
        toast.success(
          `Conversation ${
            archived ? "Archived" : "Unarchived"
          } successfully! `,
        );
      }

      // Labels can be handled separately
      if (
        predefinedLabels.some(l => l.name === action) ||
        customLabels.some(l => l.name === action)
      ) {
        const currentLabels = conv.labels || [];
        let newLabels;

        const alreadyExists = currentLabels.some(l => l === action);
        if (alreadyExists) {
          // remove by name
          newLabels = currentLabels.filter(l => l !== action);
        } else {
          // add new label object
          newLabels = [...currentLabels, action];
        }

        await updateConversation(conv.profile_id, { labels: newLabels });
        updateConversationInStore(conv.profile_id, { labels: newLabels });
        toast.success(`Conversation tags saved successfully! `);
      }
    } catch (err) {
      console.error("Failed to update conversation:", err);
    } finally {
      setActiveDropdown(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-y-2">
      <div className="flex gap-4 place-self-end">
        <span
          className="cursor-pointer"
          onClick={() => handleDropdownAction(latestConversation, "reply")}
        >
          <Reply className="w-4 h-4 fill-[#7E7E7E]" />
        </span>
        <span
          className="cursor-pointer"
          onClick={() =>
            handleDropdownAction(latestConversation, "Mark Unread")
          }
        >
          <MarkMail className="w-4 h-4 fill-[#7E7E7E]" />
        </span>
        <span
          className="cursor-pointer"
          onClick={() => handleDropdownAction(latestConversation, "Archive")}
        >
          <InboxArchive className="w-4 h-4 fill-[#7E7E7E]" />
        </span>
        <div
          className="relative cursor-pointer"
          onClick={() => {
            // console.log(conv.profile_id)
            setActiveDropdown(prev =>
              prev === conversation.profile_id
                ? null
                : conversation.profile_id,
            );
          }}
        >
          <TagIcon className="w-4 h-4 fill-[#7E7E7E]" />
          {activeDropdown &&
            activeDropdown == latestConversation.profile_id && (
              <div
                ref={dropdownRef}
                className="absolute right-0 top-4 w-40 bg-white shadow-lg border border-gray-200 rounded z-50"
              >
                <ul className="text-sm text-[#454545]">
                  {getDropdownItems(latestConversation).map((item, idx) => {
                    if (typeof item === "string") {
                      // Normal clickable item
                      return (
                        <li
                          key={idx}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() =>
                            handleDropdownAction(latestConversation, item)
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
                            item.active ? "font-semibold text-[#0096C7]" : ""
                          }`}
                          onClick={() =>
                            handleDropdownAction(
                              latestConversation,
                              item.label,
                            )
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
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={handleCheckboxToggle}
      >
        <div className="w-[18px] h-[18px] border-2 border-[#6D6D6D] flex items-center justify-center">
          {forceContinue && <div className="w-[10px] h-[10px] bg-[#0387FF]" />}
        </div>
        <span className="text-[14px] text-[#7E7E7E] font-semibold font-urbanist">
          Force Continue Messaging
        </span>
      </div>
    </div>
  );
};

export default ConversationActions;
