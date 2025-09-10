import { useEffect, useRef, useState } from "react";
import {
  DownloadIcon,
  DropArrowIcon,
  FilterIcon,
  StepReview,
} from "../../../components/Icons";
import Table from "../components/Table";

const headers = ["Date", "Action", "By", "New Value", "Old Value", "Info"];
const data = [
  {
    Date: "Thu Jul 31 2025 22:31:22 GMT+0100",
    Action: "Campaign Status",
    By: "jamesjordan@email.com",
    "New Value": "Admin",
    "Old Value": "Run",
    Info: "Pause",
  },
  {
    Date: "Thu Jul 31 2025 22:31:22 GMT+0100",
    Action: "Campaign Status",
    By: "jamesjordan@email.com",
    "New Value": "Admin",
    "Old Value": "Run",
    Info: "Pause",
  },
  {
    Date: "Thu Jul 31 2025 22:31:22 GMT+0100",
    Action: "Campaign Status",
    By: "jamesjordan@email.com",
    "New Value": "Admin",
    "Old Value": "Run",
    Info: "Pause",
  },
  {
    Date: "Thu Jul 31 2025 22:31:22 GMT+0100",
    Action: "Campaign Status",
    By: "jamesjordan@email.com",
    "New Value": "Admin",
    "Old Value": "Run",
    Info: "Pause",
  },
  {
    Date: "Thu Jul 31 2025 22:31:22 GMT+0100",
    Action: "Campaign Status",
    By: "jamesjordan@email.com",
    "New Value": "Admin",
    "Old Value": "Run",
    Info: "Pause",
  },
  {
    Date: "Thu Jul 31 2025 22:31:22 GMT+0100",
    Action: "Campaign Status",
    By: "jamesjordan@email.com",
    "New Value": "Admin",
    "Old Value": "Run",
    Info: "Pause",
  },
  {
    Date: "Thu Jul 31 2025 22:31:22 GMT+0100",
    Action: "Campaign Status",
    By: "jamesjordan@email.com",
    "New Value": "Admin",
    "Old Value": "Run",
    Info: "Pause",
  },
  {
    Date: "Thu Jul 31 2025 22:31:22 GMT+0100",
    Action: "Campaign Status",
    By: "jamesjordan@email.com",
    "New Value": "Admin",
    "Old Value": "Run",
    Info: "Pause",
  },
  {
    Date: "Thu Jul 31 2025 22:31:22 GMT+0100",
    Action: "Campaign Status",
    By: "jamesjordan@email.com",
    "New Value": "Admin",
    "Old Value": "Run",
    Info: "Pause",
  },
];
const AgencyLogs = () => {
  const moreOptionsRef = useRef(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState("all");
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
    <div className="flex flex-col gap-y-[18px] bg-[#EFEFEF] px-[26px] pt-[45px] pb-[200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[#6D6D6D] text-[44px] font-[300]">Logs</h1>
        <div className="flex items-center gap-x-2">
          <div className="relative w-[225px] h-[40px]">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full border border-[#7E7E7E] text-base rounded-[6px] h-[40px] text-[#7E7E7E] font-medium pl-8 pr-3 bg-white focus:outline-none"
            />
          </div>
          <button className="w-10 h-10 border rounded-full flex items-center justify-center bg-white !p-0 cursor-pointer">
            <DownloadIcon className="w-5 h-5 text-[#4D4D4D]" />
          </button>
          <button className="w-10 h-10 border border-grey-400 rounded-full flex items-center cursor-pointer justify-center bg-white">
            <FilterIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-start mt-[17px]">
        <div className="relative h-[40px]" ref={moreOptionsRef}>
          <div
            className="cursor-pointer h-[40px] w-[330px] rounded-[6px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
            onClick={() => setShowMoreOptions(prev => !prev)}
          >
            <span className="text-sm font-normal">
              {rowsPerPage === "all" ? "Show All" : `Show ${rowsPerPage}`}
            </span>
            <DropArrowIcon className="h-[16px] w-[14px]" />
          </div>
          {showMoreOptions && (
            <div className="absolute top-[45px] rounded-[6px] overflow-hidden left-0 w-[330px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
              {["all", 100, 250].map(val => (
                <div
                  key={val}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setRowsPerPage(val);
                    setShowMoreOptions(false);
                  }}
                >
                  {val === "all" ? "Show All" : val}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Table headers={headers} data={data} rowsPerPage={rowsPerPage} />
    </div>
  );
};

export default AgencyLogs;
