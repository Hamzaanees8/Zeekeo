import { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import { GetBlackList, updateBlackList } from "../../services/settings";
import toast from "react-hot-toast";
import GlobalBlocklist from "../settings/components/GlobalBlocklist";

function Blacklists() {
  const [blocklist, setBlocklist] = useState([]);
  const [removedBlocklist, setRemovedBlocklist] = useState([]);
  const [selectedCard, setSelectedCard] = useState("Visa");

  useEffect(() => {
    const fetchBlackList = async () => {
      const blackList = await GetBlackList();
      const blacklistArray = blackList?.blacklist
        .split("\n")
        .map(item => item.trim())
        .filter(item => item !== "");

      setBlocklist(blacklistArray);
    };

    fetchBlackList();
  }, []);

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
    <div className="flex bg-[#EFEFEF] min-h-screen">
      <SideBar />

      <div className="w-full flex flex-col gap-y-8 py-[50px] px-[30px] font-urbanist">
        <h1 className="font-medium text-[#6D6D6D] text-[48px]">Blacklists</h1>
        <div className="h-[calc(100vh-190px)] min-h-[550px] max-h-[900px]">
          <GlobalBlocklist
            blocklist={blocklist}
            setBlocklist={setBlocklist}
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
