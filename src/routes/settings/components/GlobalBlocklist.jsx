import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  Cross,
  DeleteIcon,
  MinusIcon,
  PlusIcon,
  StepReview,
} from "../../../components/Icons";

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
  blocklist,
  setBlocklist,
  agencyBlacklist = [],
  setRemovedBlocklist,
  removedBlocklist,
  handleSaveBlackList,
}) {
  const [activeTab, setActiveTab] = useState("All");
  const [inputValue, setInputValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [bulkUrls, setBulkUrls] = useState([]);
  const [popupMode, setPopupMode] = useState("add");
  const [deleteSelection, setDeleteSelection] = useState([]);

  const getFilteredBlocklist = () => {
    // Combine user and agency blacklists with metadata
    let combinedList = [
      ...blocklist.map(item => ({ value: item, isAgency: false })),
      ...agencyBlacklist.map(item => ({ value: item, isAgency: true }))
    ];

    // Filter by search value
    if (searchValue.trim() !== "") {
      combinedList = combinedList.filter(item =>
        item.value.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    // Filter by tab
    switch (activeTab) {
      case "Email":
        return combinedList.filter(item => isEmail(item.value));
      case "URL":
        return combinedList.filter(item => isURL(item.value));
      case "Domain":
        return combinedList.filter(item => isDomain(item.value));
      case "Company":
        return combinedList.filter(item => isCompany(item.value));
      default:
        return combinedList;
    }
  };

  const handleAdd = () => {
    if (inputValue.trim() !== "") {
      const updatedList = [...blocklist, inputValue.trim()];
      setBlocklist(updatedList);
      setInputValue("");

      handleSaveBlackList(updatedList);
    }
  };

  const handleRemove = index => {
    const filteredList = getFilteredBlocklist();
    const itemToRemove = filteredList[index];

    // Only allow removal of user's blacklist items (not agency items)
    if (itemToRemove.isAgency) {
      toast.error("Cannot remove agency blacklist entries. Contact your agency admin.");
      return;
    }

    const removedItem = itemToRemove.value;
    const updatedList = blocklist.filter(item => item !== removedItem);
    const updatedRemoved = [...removedBlocklist, removedItem];

    setBlocklist(updatedList);
    setRemovedBlocklist(updatedRemoved);

    handleSaveBlackList(updatedList, updatedRemoved);
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

  const handleDone = () => {
    if (popupMode === "add") {
      const updatedList = [...new Set([...blocklist, ...bulkUrls])];
      setBlocklist(updatedList);
      setBulkUrls([]);
      handleSaveBlackList(updatedList, removedBlocklist);
    } else if (popupMode === "delete") {
      const removedItems = blocklist.filter(
        item => !deleteSelection.includes(item),
      );
      const updatedList = deleteSelection;
      const updatedRemoved = [...removedBlocklist, ...removedItems];

      setBlocklist(updatedList);
      setRemovedBlocklist(updatedRemoved);
      handleSaveBlackList(updatedList, updatedRemoved);
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

  return (
    <div className="fle flex-col p-6 bg-[#ffffff] h-full border border-[#CCCCCC] rounded-[8px]">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1 border text-[16px] cursor-pointer rounded-[6px] ${
              activeTab === tab
                ? "bg-[#0387FF] text-white"
                : "bg-white text-[#0387FF]"
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
            onChange={e => {
              setSearchValue(e.target.value);
            }}
            className="w-full border border-[#7E7E7E] text-base h-[35px] rounded-[6px] text-[#7E7E7E] font-medium pl-8 pr-3 bg-white focus:outline-none"
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
              placeholder="url name"
              className="border border-[#7E7E7E] px-3 py-1 text-sm w-[435px] bg-white rounded-[4px]"
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
            className="border border-[#7E7E7E] text-[#7E7E7E] px-4 py-1 rounded-[4px] bg-white text-sm h-fit flex gap-2 items-center cursor-pointer"
          >
            <PlusIcon className="fill-[#7E7E7E] w-3 h-3" /> Add to Blacklist
          </button>
        </div>
        <button
          onClick={() => {
            setShowPopup(true);
            setPopupMode("add");
          }}
          className="border border-[#7E7E7E] text-[#7E7E7E] px-4 py-1 bg-white text-sm flex gap-2 items-center cursor-pointer rounded-[4px]"
        >
          <PlusIcon className="fill-[#7E7E7E] w-3 h-3" /> Add Multiple URLs to
          Blacklist
        </button>
      </div>

      <div className="  min-h-[40%] flex flex-col justify-between">
        <div className="relative w-[500px] flex-1 max-h-[500px] pr-2 py-3 bg-white border border-[#7E7E7E] rounded-[8px] shadow-md">
          <div className=" px-3 pr-0 w-full max-h-[300px] overflow-y-auto custom-scroll1">
            <div className="pr-3">
              {" "}
              {getFilteredBlocklist()?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2.5 text-sm border-b border-[#CCCCCC]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#6D6D6D]">{item.value}</span>
                    {item.isAgency && (
                      <span className="text-xs text-[#04479C] bg-[#E6F0FF] px-2 py-0.5 rounded">
                        Agency
                      </span>
                    )}
                  </div>
                  {!item.isAgency && (
                    <button
                      onClick={() => handleRemove(index)}
                      className="text-[#D62828] hover:scale-101 transition border border-[#D62828] p-[2px] cursor-pointer rounded-[4px]"
                    >
                      <DeleteIcon className="w-3 h-3" />
                    </button>
                  )}
                  {item.isAgency && (
                    <div className="text-[#7E7E7E] text-xs italic">
                      Managed by agency
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleOpenDeletePopup}
            className="border border-[#7E7E7E] text-[#7E7E7E] px-4 py-1 bg-white text-sm flex gap-2 items-center cursor-pointer rounded-[4px]"
          >
            <MinusIcon className="fill-[#7E7E7E] w-3 h-3" /> Delete Multiple
            URLs on Blacklist
          </button>
        </div>
      </div>

      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
        >
          <div className="bg-white w-[550px] p-6 shadow-lg relative rounded-[8px]">
            {popupMode == "delete" && (
              <div className="flex flex-col items-start mb-[10px]">
                <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
                  Delete Items to Blacklist
                </h2>
              </div>
            )}
            {popupMode == "add" && (
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
                  className="text-[#D62828] text-lg font-bold cursor-pointer absolute right-5 top-5"
                >
                  <Cross className="w-5 h-5" />
                </button>
                <div className="flex gap-[20px] max-w-full mt-[10px]">
                  <textarea
                    value={bulkInput}
                    onChange={e => setBulkInput(e.target.value)}
                    placeholder="Add multiple url name"
                    className="border border-[#7E7E7E] px-3 py-1 text-sm w-[435px] h-[270px] bg-white resize-none rounded-[6px]"
                    rows={4}
                  />
                  <button
                    onClick={handleAddBulk}
                    className="w-[200px] h-[33px] border border-[#7E7E7E] rounded-[6px] text-[#7E7E7E] px-4 py-1 bg-white text-sm flex gap-2 items-center cursor-pointer"
                  >
                    <PlusIcon className="fill-[#7E7E7E] w-3 h-3" /> Add to
                    Blacklist
                  </button>
                </div>
              </div>
            )}
            <div
              className={`relative w-[500px] ${
                popupMode == "add" ? "h-[130px]" : "h-[330px]"
              } h-[130px] pr-2 py-3 bg-white border border-[#7E7E7E]  rounded-[6px]`}
            >
              <div className="scrollable-div px-3 pr-0 w-full h-full overflow-y-scroll">
                <div className="pr-3">
                  {popupMode === "add"
                    ? bulkUrls.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 text-sm"
                        >
                          <span className="text-[#6D6D6D]">{item}</span>
                          <button
                            onClick={() => handleRemoveBulk(index)}
                            className="text-[#D62828] hover:scale-101 transition border border-[#D62828] p-[2px] cursor-pointer"
                          >
                            <DeleteIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    : deleteSelection.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 text-sm"
                        >
                          <span className="text-[#6D6D6D]">{item}</span>
                          <button
                            onClick={() =>
                              handleRemoveFromDeleteSelection(index)
                            }
                            className="text-[#D62828] hover:scale-101 transition border border-[#D62828] p-[2px] cursor-pointer"
                          >
                            <DeleteIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-[10px]">
              <button
                onClick={handleCancel}
                className="bg-[#7E7E7E] text-white px-6 py-1 cursor-pointer rounded-[4px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDone}
                className="bg-[#0387FF] text-white px-6 py-1 cursor-pointer rounded-[4px]"
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
