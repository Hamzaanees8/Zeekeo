import { useEffect, useState } from "react";
import GlobalBlocklist from "../../../settings/components/GlobalBlocklist";
import toast from "react-hot-toast";
import { GetAgencyBlackList, updateAgencyBlackList } from "../../../../services/agency";

const Blacklist = () => {
  const [blocklist, setBlocklist] = useState([]);
  const [removedBlocklist, setRemovedBlocklist] = useState([]);

  useEffect(() => {
    const fetchBlackList = async () => {
      const blackList = await GetAgencyBlackList();
      const blacklistArray = blackList?.blacklist
        .split("\n")
        .map(item => item.trim())
        .filter(item => item !== "");

      console.log("blacklistArray", blacklistArray);

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

      await updateAgencyBlackList(dataToSend);
      toast.success("Blacklist saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings.");
    }
  };
  return (
    <div>
      <GlobalBlocklist
        blocklist={blocklist}
        setBlocklist={setBlocklist}
        removedBlocklist={removedBlocklist}
        setRemovedBlocklist={setRemovedBlocklist}
        handleSaveBlackList={handleSaveBlackList}
      />
    </div>
  );
};

export default Blacklist;
