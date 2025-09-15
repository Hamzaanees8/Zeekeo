import { useEffect, useState, useRef } from "react";
import Table from "./Components/Table";
import { FilterIcon, Profile, StepReview } from "../../../components/Icons";
import { useEditContext } from "./Context/EditContext";
import {
  getCampaignProfile,
  streamCampaignProfiles,
} from "../../../services/campaigns";
import Modal from "./Components/Modal";
const Profiles = () => {
  const { editId } = useEditContext();
  const [value, setValue] = useState(50);
  const [nextCursor, setNextCursor] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false);

  const topRef = useRef(null);

  useEffect(() => {
    setProfiles([]);
    setNextCursor(null);
    setCurrentPage(1);

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
    setCurrentPage(1);
  };

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  const totalProfiles = profiles.length;
  const pageSize = value === "all" ? totalProfiles : value;
  const totalPages = value === "all" ? 1 : Math.ceil(totalProfiles / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const filteredProfiles =
    value === "all" ? profiles : profiles.slice(startIndex, endIndex);

  return (
    <div ref={topRef} className="flex flex-col pt-[80px] gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-[9px]">
          <p className="font-medium font-urbanist text-base text-[#7E7E7E]">
            Show
          </p>
          <div className="py-[6px] px-[10px] bg-white border border-[#7E7E7E] rounded-[6px] h-[35px]">
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
        <div className="flex items-center gap-x-2.5">
          <div className="flex justify-center items-center gap-x-3 pr-3">
            <div className="relative w-[390px] h-[35px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <input
                type="text"
                placeholder="Search"
                className="w-full border border-[#7E7E7E] text-base h-[35px] text-[#7E7E7E] font-medium pl-8 pr-3 bg-white focus:outline-none rounded-[6px]"
              />
            </div>
          </div>
          <button
            onClick={() => setShow(true)}
            className="flex items-center gap-x-2.5 px-2 py-1 h-[35px] text-[16px] border border-[#7E7E7E] transition-all duration-150 cursor-pointer rounded-[4px] bg-[#FFFFFF] text-[#7E7E7E] "
          >
            <FilterIcon />
            Advanced Filters
          </button>
        </div>
      </div>
      <div className="pl-6 pr-3.5 pt-3 border border-[#7E7E7E] bg-white shadow-md min-h-[480px] max-h-full rounded-[8px] min-w-auto overflow-x-auto overflow-hidden">
        <div className="flex items-center gap-x-[17px] text-[#6D6D6D]">
          <Profile />
          <p className="font-normal text-xs">{profiles?.length} Profiles</p>
        </div>
        <div className="w-[120%] xl:w-full">
          <Table
            profiles={filteredProfiles}
            setProfiles={setProfiles}
            currentPage={currentPage}
            pageSize={pageSize}
          />
        </div>
      </div>

      {/* Prev / Next / Load More */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
          className="px-4 py-1 text-white bg-gray-500 border border-gray-500 w-[100px] rounded-[4px]
            cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed disabled:border-gray-300 transition-colors"
        >
          Prev
        </button>

        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-1 text-white bg-[#0387FF] border border-[#0387FF] w-[100px] rounded-[4px]
            cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed disabled:border-blue-300 transition-colors"
        >
          Next
        </button>

        {/* <button
          onClick={loadMore}
          disabled={!nextCursor}
          className={`
    px-4 py-1 text-white bg-[#0387FF] cursor-pointer border border-[#0387FF] w-[134px] rounded-[4px]
    disabled:bg-blue-300 disabled:cursor-not-allowed disabled:border-blue-300
    transition-colors
  `}
        >
          Load More
        </button> */}
      </div>
      {show && <Modal onClose={() => setShow(false)} />}
    </div>
  );
};

export default Profiles;
