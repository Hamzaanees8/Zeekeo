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
      setValue(firstBatch.length);
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
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num >= 0) {
      setValue(num);
    } else if (e.target.value === "") {
      setValue("");
    }
  };
  const filteredProfiles =
    value === "" ? profiles : profiles.slice(0, parseInt(value));

  return (
    <div className="flex flex-col pt-[80px] gap-y-4">
      <div className="flex items-center gap-x-[9px]">
        <p className="font-medium font-urbanist text-base text-[#7E7E7E]">
          Show
        </p>
        <div className="py-[6px] px-[10px] bg-white border border-[#7E7E7E] w-[57px] h-[34px] text-center font-medium font-urbanist text-base text-[#7E7E7E]">
          <input
            type="number"
            min="0"
            value={value}
            onChange={handleChange}
            className="focus:outline-none w-[25px] !p-0 !border-none rounded-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          />
        </div>
        <p className="font-medium font-urbanist text-base text-[#7E7E7E]">
          Entries
        </p>
      </div>
      <div className="pl-6 pr-3.5 pt-3 border border-[#7E7E7E] min-h-[480px] max-h-full">
        <div className="flex items-center gap-x-[17px] text-[#6D6D6D]">
          <Profile />
          <p className="font-normal text-xs">{profiles?.length} Profiles</p>
        </div>
        <Table profiles={filteredProfiles} setProfiles={setProfiles} />
      </div>
      <div className="flex justify-end">
        <button
          onClick={loadMore}
          disabled={!nextCursor}
          className={`
    px-4 py-1 text-white bg-[#0387FF] cursor-pointer border border-[#0387FF] w-[134px]
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
