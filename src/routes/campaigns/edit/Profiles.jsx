import { useEffect, useState } from "react";
import Table from "./Components/Table";
import { Profile } from "../../../components/Icons";
import { useEditContext } from "./Context/EditContext";
import {
  getCampaignProfile,
  streamCampaignProfiles,
} from "../../../services/campaigns";
const Profiles = () => {
  const { editId } = useEditContext();
  const [value, setValue] = useState(50);
  const [nextCursor, setNextCursor] = useState(null);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    setProfiles([]);
    setNextCursor(null);

    const loadFirstPage = async () => {
      if (!editId) return;

      const { profiles: firstBatch, next } = await streamCampaignProfiles(
        editId,
        null,
      );
      setProfiles(firstBatch);
      setValue(50);
      setNextCursor(next);
    };

    loadFirstPage();
  }, [editId]);

  const loadMore = async () => {
    if (!nextCursor) return;

    const { profiles: nextBatch, next } = await streamCampaignProfiles(
      editId,
      nextCursor,
    );
    setProfiles(prev => [...prev, ...nextBatch]);
    setNextCursor(next);
  };

  const handleChange = e => {
    const val =
      e.target.value === "all" ? "all" : parseInt(e.target.value, 10);
    setValue(val);
  };

  const filteredProfiles =
    value === "all" ? profiles : profiles.slice(0, value);

  return (
    <div className="flex flex-col pt-[80px] gap-y-4">
      <div className="flex items-center gap-x-[9px]">
        <p className="font-medium font-urbanist text-base text-[#7E7E7E]">
          Show
        </p>
        <div className="py-[6px] px-[10px] bg-white border border-[#7E7E7E] rounded-[6px]">
          <select
            value={value}
            onChange={handleChange}
            className="focus:outline-none bg-transparent font-medium font-urbanist text-base text-[#7E7E7E]"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value="all">All</option>
          </select>
        </div>
        <p className="font-medium font-urbanist text-base text-[#7E7E7E]">
          Entries
        </p>
      </div>
      <div className="pl-6 pr-3.5 pt-3 border border-[#7E7E7E] min-h-[480px] max-h-full rounded-[8px] min-w-auto overflow-x-auto overflow-hidden">
        <div className="flex items-center gap-x-[17px] text-[#6D6D6D]">
          <Profile />
          <p className="font-normal text-xs">{profiles?.length} Profiles</p>
        </div>
        <div className="w-[120%] xl:w-full">
          <Table profiles={filteredProfiles} setProfiles={setProfiles} />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={loadMore}
          disabled={!nextCursor}
          className={`
    px-4 py-1 text-white bg-[#0387FF] cursor-pointer border border-[#0387FF] w-[134px] rounded-[4px]
    disabled:bg-blue-300 disabled:cursor-not-allowed disabled:border-blue-300
    transition-colors
  `}
        >
          Load More
        </button>
      </div>
    </div>
  );
};

export default Profiles;
