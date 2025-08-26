import { useEffect, useRef, useState } from "react";
import {
  DownloadIcon,
  DropArrowIcon,
  StepReview,
} from "../../../components/Icons";
import Table from "./components/Table";

const AdminCancellations = () => {
  const moreOptionsRef = useRef(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        moreOptionsRef.current &&
        !moreOptionsRef.current.contains(event.target)
      ) {
        setShowMoreOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="flex flex-col gap-y-[18px] bg-[#EFEFEF] px-[26px] py-[45px]">
      <div className="flex items-center justify-between">
        <p className="text-[#6D6D6D] text-[44px] font-[300]">Cancellations</p>
        <div className="flex items-center gap-x-2">
          <div className="relative w-[225px] h-[40px]">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full border border-[#7E7E7E] text-base h-[40px] text-[#7E7E7E] font-medium pl-8 pr-3 bg-white focus:outline-none"
            />
          </div>
          <button className="w-10 h-10 border rounded-full flex items-center justify-center bg-white !p-0 cursor-pointer">
            <DownloadIcon className="w-5 h-5 text-[#4D4D4D]" />
          </button>
        </div>
      </div>
      <div className="mt-[17px]">
        <div className="relative h-[35px]" ref={moreOptionsRef}>
          <div
            className="cursor-pointer h-[40px] w-[140px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
            onClick={() => setShowMoreOptions(prev => !prev)}
          >
            <span className="text-sm font-normal">Show All</span>
            <DropArrowIcon className="h-[16px] w-[14px]" />
          </div>
          {showMoreOptions && (
            <div className="absolute top-[40px] left-0 w-[140px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setShowMoreOptions(false);
                }}
              >
                Option
              </div>
            </div>
          )}
        </div>
      </div>
      <Table />
    </div>
  );
};

export default AdminCancellations;
