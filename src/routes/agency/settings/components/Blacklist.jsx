import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAgencyBlacklists,
  createAgencyBlacklist,
  updateAgencyBlacklist,
  deleteAgencyBlacklist,
  getAgencyBlacklist,
} from "../../../../services/agency";
import GlobalBlocklist from "./GlobalBlocklist";
import { DeleteIcon, PencilIcon } from "../../../../components/Icons";
import DeleteModal from "./DeleteModal";

const Blacklist = () => {
  const [blacklists, setBlacklists] = useState([]);
  const [selectedBlacklist, setSelectedBlacklist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [blocklist, setBlocklist] = useState([]);
  const [removedBlocklist, setRemovedBlocklist] = useState([]);
  const [show, setShow] = useState(false);
  const [blacklistToDelete, setBlacklistToDelete] = useState(null);

  // Fetch all blacklists
  useEffect(() => {
    fetchBlacklists();
  }, []);

  const fetchBlacklists = async () => {
    try {
      const response = await getAgencyBlacklists();
      setBlacklists(response || []);
    } catch (error) {
      console.error("Error fetching blacklists:", error);
    }
  };

  // Load blacklist data when editing
  useEffect(() => {
    if (selectedBlacklist && isEditing) {
      fetchBlacklistData(selectedBlacklist.name);
    }
  }, [selectedBlacklist, isEditing]);

  const fetchBlacklistData = async blacklistName => {
    try {
      const blackListData = await getAgencyBlacklist(blacklistName);
      const blacklistArray =
        blackListData
          ?.split("\n")
          .map(item => item.trim())
          .filter(item => item !== "") || [];

      setBlocklist(blacklistArray);
      setRemovedBlocklist([]);
    } catch (error) {
      console.error("Error fetching blacklist data:", error);
    }
  };

  const handleCreateNew = () => {
    setSelectedBlacklist(null);
    setIsEditing(false);
    setBlocklist([]);
    setRemovedBlocklist([]);
    setShowForm(true);
  };

  const handleEdit = blacklist => {
    setSelectedBlacklist(blacklist);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async blacklistName => {
    try {
      await deleteAgencyBlacklist(blacklistName);
      toast.success("Blacklist deleted successfully!");
      fetchBlacklists();
      setShow(false);
    } catch (error) {
      console.error("Error deleting blacklist:", error);
      toast.error("Failed to delete blacklist");
    }
  };

  const handleSaveBlackList = async (
    blacklistName,
    updatedBlocklist = blocklist,
    updatedRemoved = removedBlocklist,
  ) => {
    try {
      if (!/^[a-zA-Z0-9-_]+$/.test(blacklistName)) {
        toast.error(
          "Please remove special characters and spaces from the blacklist name. Only letters, numbers, hyphens, and underscores are allowed.",
        );
        return;
      }
      if (isEditing && selectedBlacklist) {
        // Update existing blacklist
        const dataToSend = {
          added: updatedBlocklist,
          ...(updatedRemoved.length > 0 && { removed: updatedRemoved }),
        };
        await updateAgencyBlacklist(selectedBlacklist.name, dataToSend);
        toast.success("Blacklist updated successfully!");
      } else {
        // Create new blacklist
        await createAgencyBlacklist(blacklistName, updatedBlocklist);
        toast.success("Blacklist created successfully!");
      }

      setShowForm(false);
      fetchBlacklists(); // Refresh the list
    } catch (error) {
      console.error("Error saving blacklist:", error);
      toast.error("Failed to save blacklist.");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedBlacklist(null);
    setIsEditing(false);
    setBlocklist([]);
    setRemovedBlocklist([]);
  };

  if (showForm) {
    return (
      <GlobalBlocklist
        blacklistName={selectedBlacklist?.name}
        isEditing={isEditing}
        blocklist={blocklist}
        setBlocklist={setBlocklist}
        removedBlocklist={removedBlocklist}
        setRemovedBlocklist={setRemovedBlocklist}
        handleSaveBlackList={handleSaveBlackList}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="p-6 rounded-[8px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[24px] font-medium text-[#6D6D6D]">Blacklists</h1>
        <button
          onClick={handleCreateNew}
          className="bg-[#0387FF] text-white px-4 py-2 rounded-[6px] flex items-center gap-2 cursor-pointer hover:bg-blue-600 transition-colors"
        >
          + Create New Blacklist
        </button>
      </div>

      {blacklists.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-[#6D6D6D] mb-2">
            No blacklists yet
          </h3>
        </div>
      ) : (
        <div className="grid border border-[#7E7E7E] rounded-[8px] overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto custom-scroll1">
            {blacklists.map(blacklist => (
              <div
                key={blacklist.name}
                className="border-b border-[#CCCCCC] bg-[white] p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-[#6D6D6D] mb-1">
                      {blacklist.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-[#6D6D6D]">
                      <span>{blacklist.entryCount} entries</span>
                      <span>•</span>
                      <span>
                        Last modified:{" "}
                        {new Date(blacklist.lastModified).toLocaleDateString()}
                      </span>
                      {/* <span>•</span>
                    <span>Size: {(blacklist.size / 1024).toFixed(2)} KB</span> */}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button title="Edit" onClick={() => handleEdit(blacklist)}>
                      <PencilIcon className="w-5 h-5 p-[2px] border border-[#12D7A8] fill-[#12D7A8] cursor-pointer rounded-full" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => {
                        setBlacklistToDelete(blacklist);
                        setShow(true);
                      }}
                    >
                      <DeleteIcon className="w-5 h-5 p-[2px] border border-[#D80039] cursor-pointer rounded-full" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {show && blacklistToDelete && (
        <DeleteModal
          onClose={() => {
            setShow(false);
            setBlacklistToDelete(null);
          }}
          onClick={() => handleDelete(blacklistToDelete.name)}
        />
      )}
    </div>
  );
};

export default Blacklist;
