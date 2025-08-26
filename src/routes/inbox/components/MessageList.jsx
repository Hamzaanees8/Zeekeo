import { useEffect, useRef, useState } from "react";
import {
  FaceIcon,
  FilterProfile,
  FaceIcon3,
  LinkedIn,
  ThreeDots,
  TagIcon,
  InvitesIcon,
} from "../../../components/Icons";

const MessageList = ({
  messages,
  selectedMessage,
  onSelect,
  selectedItems,
  setSelectedItems,
  allSelected,
  setAllSelected,
}) => {
  const toggleSelectAll = () => {
    const newSelected = allSelected ? [] : messages.map(msg => msg.id);
    setSelectedItems(newSelected);
    setAllSelected(!allSelected);
  };

  const toggleSelectItem = id => {
    const newSelected = selectedItems.includes(id)
      ? selectedItems.filter(item => item !== id)
      : [...selectedItems, id];
    setSelectedItems(newSelected);
  };

  const [activeDropdown, setActiveDropdown] = useState(null);

  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-[350px] text-white overflow-y-auto">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`cursor-pointer border-b border-[#7E7E7E] pr-2 mr-2 py-3 ${
            selectedMessage?.id === msg.id ? "" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <div
                className="w-[16px] h-[16px] border-2 border-[#6D6D6D]  cursor-pointer flex items-center justify-center "
                onClick={() => toggleSelectItem(msg.id)}
              >
                {selectedItems.includes(msg.id) && (
                  <div className="w-[8px] h-[8px] bg-[#0387FF]" />
                )}
              </div>
              {msg.compaigntype === "linkedin" ? (
                <LinkedIn className="w-6 h-6 fill-[#007EBB]" />
              ) : (
                <InvitesIcon className="w-5 h-5 fill-[#007EBB]" />
              )}
              <div className="flex gap-2" onClick={() => onSelect(msg)}>
                <div className="w-9 h-9 rounded-full bg-[#D9D9D9]" />
                <div className="flex flex-col">
                  <span
                    className={`font-medium text-sm ${
                      selectedMessage?.id === msg.id
                        ? "text-[#0096C7]"
                        : "text-[#7E7E7E]"
                    }`}
                  >
                    {msg.name}
                  </span>
                  <span className="text-[#7E7E7E] text-xs">
                    {msg.description}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[#0096C7] text-[10px]">
                {msg.messages[msg.messages.length - 1]?.date}
              </span>
              <div className="flex gap-2">
                <span>
                  <TagIcon className="w-4 h-4 fill-[#7E7E7E] cursor-pointer" />
                </span>
                {msg.statusIcons.includes("positive") && (
                  <FaceIcon className="w-4 h-4 fill-[#1FB33F]" />
                )}
                <div className="relative">
                  <span
                    onClick={() =>
                      setActiveDropdown(prev =>
                        prev === msg.id ? null : msg.id,
                      )
                    }
                  >
                    <ThreeDots className="w-4 h-4 fill-[#7E7E7E] cursor-pointer" />
                  </span>
                  {activeDropdown === msg.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 top-4 w-40 bg-white shadow-lg border border-gray-200 rounded z-50"
                    >
                      <ul className="text-sm text-[#454545]">
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"onClick={() => {setActiveDropdown(null)}}>
                          Mark Unread
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"onClick={() => {setActiveDropdown(null)}}>
                          Archive
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"onClick={() => {setActiveDropdown(null)}}>
                          Label As
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"onClick={() => {setActiveDropdown(null)}}>
                          Interested
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"onClick={() => {setActiveDropdown(null)}}>
                          Not Interested
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"onClick={() => {setActiveDropdown(null)}}>
                          Follow Up
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"onClick={() => {setActiveDropdown(null)}}>
                          Custom Tag 1
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"onClick={() => {setActiveDropdown(null)}}>
                          Custom Tag 2
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"onClick={() => {setActiveDropdown(null)}}>
                          Custom Tag 3
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
