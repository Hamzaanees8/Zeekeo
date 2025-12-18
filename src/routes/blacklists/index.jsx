import { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import { GetBlackList, updateBlackList } from "../../services/settings";
import { getAgencyBlacklist } from "../../services/agency";
import { getCurrentUser } from "../../utils/user-helpers";
import toast from "react-hot-toast";
import GlobalBlocklist from "../settings/components/GlobalBlocklist";
import { useAgencyPageStyles } from "../stores/useAgencySettingsStore";

function Blacklists() {
  const pageStyles = useAgencyPageStyles();

  const [blocklist, setBlocklist] = useState([]);
  const [agencyBlacklist, setAgencyBlacklist] = useState([]);
  const [removedBlocklist, setRemovedBlocklist] = useState([]);
  const [selectedCard, setSelectedCard] = useState("Visa");
  const user = getCurrentUser();

  useEffect(() => {
    const fetchBlackLists = async () => {
      // Load user's personal blacklist
      const blackList = await GetBlackList();
      const blacklistArray = blackList?.blacklist
        .split("\n")
        .map(item => item.trim())
        .filter(item => item !== "");

      setBlocklist(blacklistArray || []);

      // Load agency blacklists if user is part of an agency and has blacklists assigned
      const agencyEntries = [];
      if (user?.agency_username && user?.blacklists && Array.isArray(user.blacklists) && user.blacklists.length > 0) {
        for (const blacklistName of user.blacklists) {
          try {
            const agencyBlacklist = await getAgencyBlacklist(blacklistName);
            if (agencyBlacklist) {
              const entries = agencyBlacklist
                .split("\n")
                .map(item => item.trim())
                .filter(item => item !== "");
              agencyEntries.push(...entries);
            }
          } catch (error) {
            console.error(`Failed to fetch agency blacklist ${blacklistName}:`, error);
          }
        }
      }

      // Deduplicate agency entries
      setAgencyBlacklist([...new Set(agencyEntries)]);
    };

    fetchBlackLists();
  }, [user?.blacklists]);

  const handleSaveBlackList = async (
    updatedBlocklist = blocklist,
    updatedRemoved = removedBlocklist,
  ) => {
    try {
      const dataToSend = {
        added: updatedBlocklist,
        ...(updatedRemoved.length > 0 && { removed: updatedRemoved }),
      };

      await updateBlackList(dataToSend);
      toast.success("Blacklist saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings.");
    }
  };
  const handleCardSelect = card => {
    setSelectedCard(card);
  };
  return (
    <div className="flex min-h-screen" style={pageStyles}>
      <SideBar />

      <div className="w-full flex flex-col gap-y-8 py-[50px] px-[30px] font-urbanist">
        <h1 className="font-medium text-[48px]" style={{ color: 'var(--page-text-color, #6D6D6D)' }}>Blacklists</h1>
        <div className="h-[calc(100vh-190px)] min-h-[550px] max-h-[900px]">
          <GlobalBlocklist
            blocklist={blocklist}
            setBlocklist={setBlocklist}
            agencyBlacklist={agencyBlacklist}
            removedBlocklist={removedBlocklist}
            setRemovedBlocklist={setRemovedBlocklist}
            handleSaveBlackList={handleSaveBlackList}
            selectedCard={selectedCard}
            onCardSelect={handleCardSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default Blacklists;
