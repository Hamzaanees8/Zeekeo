import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  StepReview,
  Cross,
  DeleteIcon,
  MinusIcon,
  PlusIcon,
} from "../../../../components/Icons";
import AgencyUsersModal from "../../blacklist/components/AgencyUsersModal";
import { getAgencyUsers } from "../../../../services/agency";

const tabs = ["All", "Company", "Domain", "URL", "Email"];

const isEmail = item => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item);
const isLinkedInURL = item =>
  /^((https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+)/i.test(item);
const isDomain = item =>
  /^((?!https?:\/\/)(?!www\.)[a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/.test(item);
const isURL = item =>
  /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(item) || isLinkedInURL(item);
const isCompany = item => !isEmail(item) && !isURL(item) && !isDomain(item);

export default function GlobalBlocklist({
  blacklistName = "",
  isEditing = false,
  blocklist,
  setBlocklist,
  setRemovedBlocklist,
  removedBlocklist,
  handleSaveBlackList,
  onClose,
  selectedUsers,
  setSelectedUsers
}) {
  const [activeTab, setActiveTab] = useState("All");
  const [inputValue, setInputValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [bulkUrls, setBulkUrls] = useState([]);
  const [popupMode, setPopupMode] = useState("add");
  const [deleteSelection, setDeleteSelection] = useState([]);
  const [newBlacklistName, setNewBlacklistName] = useState(blacklistName);
  const [agencyUsers, setAgencyUsers] = useState([]);

  useEffect(() => {
    setNewBlacklistName(blacklistName);
  }, [blacklistName]);

  const getFilteredBlocklist = () => {
    let filtered = blocklist;

    if (searchValue.trim() !== "") {
      filtered = filtered.filter(item =>
        item.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    switch (activeTab) {
      case "Email":
        return filtered.filter(isEmail);
      case "URL":
        return filtered.filter(isURL);
      case "Domain":
        return filtered.filter(isDomain);
      case "Company":
        return filtered.filter(isCompany);
      default:
        return filtered;
    }
  };

  const handleAdd = () => {
    if (inputValue.trim() !== "") {
      const updatedList = [...blocklist, inputValue.trim()];
      setBlocklist(updatedList);
      setInputValue("");
    }
  };

  const handleRemove = index => {
    const removedItem = blocklist[index];
    const updatedList = blocklist.filter((_, i) => i !== index);
    const updatedRemoved = [...removedBlocklist, removedItem];

    setBlocklist(updatedList);
    setRemovedBlocklist(updatedRemoved);
  };

  const handleAddBulk = () => {
    if (!bulkInput.trim()) return;

    const newItems = bulkInput
      .split("\n")
      .map(item => item.trim())
      .filter(item => item !== "");

    setBulkUrls(prev => [...new Set([...prev, ...newItems])]);
    setBulkInput("");
  };

  const handleRemoveBulk = index => {
    setBulkUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!isEditing && !newBlacklistName.trim()) {
      toast.error("Please enter a blacklist name");
      return;
    }

    let updatedList = blocklist;
    let updatedRemoved = removedBlocklist;

    if (popupMode === "add" && bulkUrls.length > 0) {
      updatedList = [...new Set([...blocklist, ...bulkUrls])];
    } else if (popupMode === "delete") {
      updatedList = blocklist.filter(item => !deleteSelection.includes(item));
      updatedRemoved = [...removedBlocklist, ...deleteSelection];
    }

    handleSaveBlackList(newBlacklistName, updatedList, updatedRemoved);
  };

  const handleDone = () => {
    if (popupMode === "add") {
      const updatedList = [...new Set([...blocklist, ...bulkUrls])];
      setBlocklist(updatedList);
      setBulkUrls([]);
    } else if (popupMode === "delete") {
      const updatedList = blocklist.filter(
        item => !deleteSelection.includes(item),
      );
      const updatedRemoved = [...removedBlocklist, ...deleteSelection];
      setBlocklist(updatedList);
      setRemovedBlocklist(updatedRemoved);
    }

    setShowPopup(false);
  };

  const handleCancel = () => {
    setBulkUrls([]);
    setDeleteSelection([]);
    setShowPopup(false);
  };

  const handleRemoveFromDeleteSelection = index => {
    setDeleteSelection(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenDeletePopup = () => {
    setPopupMode("delete");
    setDeleteSelection(blocklist);
    setShowPopup(true);
  };

  const handleKeyPress = e => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  useEffect(() => {
    const fetchAgencyUsers = async () => {
      try {
        const res = await getAgencyUsers();
        setAgencyUsers(res?.users || []);
      } catch (err) {
        console.error("Error fetching agency users:", err);
      }
    };
    fetchAgencyUsers();
  }, []);

  return (
    <div className="fle flex-col p-6 bg-[#ffffff] h-full border border-[#CCCCCC] rounded-[8px]">
      {/* Header with Blacklist Name Input and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {isEditing ? (
            <h1 className="text-2xl font-medium text-[#6D6D6D]">
              {blacklistName}
            </h1>
          ) : (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#6D6D6D] mb-1">
                Blacklist Name
              </label>
              <input
                type="text"
                value={newBlacklistName}
                onChange={e => setNewBlacklistName(e.target.value)}
                placeholder="Enter blacklist name"
                className="border border-[#7E7E7E] px-3 py-2 rounded-[4px] w-64 focus:outline-none"
              />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="border border-[#7E7E7E] text-[#7E7E7E] px-4 py-2 rounded-[4px] cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#0387FF] text-white px-4 py-2 rounded-[4px] cursor-pointer hover:bg-blue-600 transition-colors"
          >
            {isEditing ? "Update Blacklist" : "Create Blacklist"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1 border text-[16px] cursor-pointer rounded-[6px] transition-colors ${activeTab === tab
              ? "bg-[#0387FF] text-white border-[#0387FF]"
              : "bg-white text-[#0387FF] border-[#7E7E7E] hover:bg-gray-50"
              }`}
          >
            {tab}
          </button>
        ))}
        <div className="relative w-[390px] h-[35px]">
          <span className="absolute left-2 top-1/2 -translate-y-1/2">
            <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
          </span>
          <input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="w-full border border-[#7E7E7E] text-base h-[35px] rounded-[6px] text-[#7E7E7E] font-medium pl-8 pr-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0387FF] focus:border-transparent"
          />
        </div>
      </div>

      {/* Add to Blacklist */}
      <div className="flex items-start gap-4 justify-between mb-4">
        <div className="flex gap-2">
          <div className="flex flex-col">
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="url name"
              className="border border-[#7E7E7E] px-3 py-1 text-sm w-[435px] bg-white rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0387FF] focus:border-transparent"
            />
            <p className="text-xs text-[#7E7E7E] mt-1">
              Company Name (exact match only)
              <br />
              Domain (without https:// or www)
              <br />
              LinkedIn Profile URL
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="border border-[#7E7E7E] text-[#7E7E7E] px-4 py-1 rounded-[4px] bg-white text-sm h-fit flex gap-2 items-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="fill-[#7E7E7E] w-3 h-3" /> Add to Blacklist
          </button>
        </div>
        <button
          onClick={() => {
            setShowPopup(true);
            setPopupMode("add");
          }}
          className="border border-[#7E7E7E] text-[#7E7E7E] px-4 py-1 bg-white text-sm flex gap-2 items-center cursor-pointer rounded-[4px] hover:bg-gray-50 transition-colors"
        >
          <PlusIcon className="fill-[#7E7E7E] w-3 h-3" /> Add Multiple URLs to
          Blacklist
        </button>
      </div>

      {/* Blocklist Items */}
      <div className=" min-h-[70%] flex flex-col justify-between pb-4">
        <div className="flex justify-between items-start gap-10">
          <div className="relative  w-[500px] flex-1 h-[400px] max-h-[500px] pr-2 py-3 bg-white border border-[#7E7E7E] rounded-[8px] shadow-md">
            <div className="scrollable-div px-3 pr-0 w-full h-full overflow-y-scroll">
              <div className="pr-3">
                {getFilteredBlocklist().length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#7E7E7E] text-sm">
                      {searchValue ? "No items found" : "No items in blacklist"}
                    </p>
                  </div>
                ) : (
                  getFilteredBlocklist().map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2.5 text-sm border-b border-[#CCCCCC] last:border-b-0"
                    >
                      <span className="text-[#6D6D6D] break-all pr-2">{item}</span>
                      <button
                        onClick={() => handleRemove(index)}
                        className="text-[#D62828] hover:scale-105 transition border border-[#D62828] p-[2px] cursor-pointer rounded-[4px] hover:bg-red-50 flex-shrink-0"
                      >
                        <DeleteIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="h-[400px]  border border-[#7E7E7E] rounded-[8px] shadow-md w-[40%]">
            <AgencyUsersModal
              agencyUsers={agencyUsers}
              blacklistName={blacklistName}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers} />
          </div>
        </div>
        {/* Delete Multiple Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleOpenDeletePopup}
            className="border border-[#7E7E7E] text-[#7E7E7E] px-4 py-1 bg-white text-sm flex gap-2 items-center cursor-pointer rounded-[4px] hover:bg-gray-50 transition-colors"
          >
            <MinusIcon className="fill-[#7E7E7E] w-3 h-3" /> Delete Multiple URLs
            on Blacklist
          </button>
        </div>
      </div>


      {/* Popup for Add/Delete Multiple */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
        >
          <div className="bg-white w-[550px] p-6 shadow-lg relative rounded-[8px]">
            {popupMode === "delete" && (
              <div className="flex flex-col items-start mb-[10px]">
                <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
                  Delete Items from Blacklist
                </h2>
                <p className="text-xs text-[#7E7E7E] mt-1">
                  Select items to remove from the blacklist
                </p>
              </div>
            )}
            {popupMode === "add" && (
              <div className="flex flex-col items-start mb-[10px]">
                <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
                  Add Items to Blacklist
                </h2>
                <p className="text-xs text-[#7E7E7E] mt-1">
                  Add one item per row
                  <br />
                  Company Name (exact match only)
                  <br />
                  Domain (without https:// or www)
                  <br />
                  LinkedIn Profile URL
                </p>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-[#D62828] text-lg font-bold cursor-pointer absolute right-5 top-5 hover:scale-110 transition-transform"
                >
                  <Cross className="w-5 h-5" />
                </button>
                <div className="flex gap-[20px] max-w-full mt-[10px]">
                  <textarea
                    value={bulkInput}
                    onChange={e => setBulkInput(e.target.value)}
                    placeholder="Add multiple url name"
                    className="border border-[#7E7E7E] px-3 py-1 text-sm w-[435px] h-[270px] bg-white resize-none rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0387FF] focus:border-transparent"
                    rows={4}
                  />
                  <button
                    onClick={handleAddBulk}
                    className="w-[200px] h-[33px] border border-[#7E7E7E] rounded-[6px] text-[#7E7E7E] px-2 py-1 bg-white text-sm flex gap-2 items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <PlusIcon className="fill-[#7E7E7E] w-3 h-3" /> Add to
                    Blacklist
                  </button>
                </div>
              </div>
            )}

            {/* Items List in Popup */}
            <div
              className={`relative w-[500px] ${popupMode === "add" ? "h-[130px]" : "h-[330px]"
                } pr-2 py-3 bg-white border border-[#7E7E7E] rounded-[6px] mt-4`}
            >
              <div className="scrollable-div px-3 pr-0 w-full h-full overflow-y-scroll">
                <div className="pr-3">
                  {popupMode === "add" && bulkUrls.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-[#7E7E7E] text-sm">
                        No items added yet
                      </p>
                    </div>
                  ) : popupMode === "delete" &&
                    deleteSelection.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-[#7E7E7E] text-sm">
                        No items selected for deletion
                      </p>
                    </div>
                  ) : (
                    <>
                      {popupMode === "add"
                        ? bulkUrls.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 text-sm border-b border-[#CCCCCC] last:border-b-0"
                          >
                            <span className="text-[#6D6D6D] break-all pr-2">
                              {item}
                            </span>
                            <button
                              onClick={() => handleRemoveBulk(index)}
                              className="text-[#D62828] hover:scale-105 transition border border-[#D62828] p-[2px] cursor-pointer rounded-[4px] hover:bg-red-50 flex-shrink-0"
                            >
                              <DeleteIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                        : deleteSelection.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 text-sm border-b border-[#CCCCCC] last:border-b-0"
                          >
                            <span className="text-[#6D6D6D] break-all pr-2">
                              {item}
                            </span>
                            <button
                              onClick={() =>
                                handleRemoveFromDeleteSelection(index)
                              }
                              className="text-[#D62828] hover:scale-105 transition border border-[#D62828] p-[2px] cursor-pointer rounded-[4px] hover:bg-red-50 flex-shrink-0"
                            >
                              <DeleteIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Popup Actions */}
            <div className="flex justify-between items-center mt-[10px]">
              <button
                onClick={handleCancel}
                className="bg-[#7E7E7E] text-white px-6 py-1 cursor-pointer rounded-[4px] hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDone}
                className="bg-[#0387FF] text-white px-6 py-1 cursor-pointer rounded-[4px] hover:bg-blue-600 transition-colors"
                disabled={
                  (popupMode === "add" && bulkUrls.length === 0) ||
                  (popupMode === "delete" && deleteSelection.length === 0)
                }
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
