import { useEffect, useRef, useState } from "react";
import {
  DownloadIcon,
  DropArrowIcon,
  DropDownCheckIcon,
} from "../../../components/Icons";
import Table from "./components/Table";
const allColumns = [
  "User Email",
  "Name",
  "Type",
  "LinkedIn",
  "Accept %",
  "Reply %",
  "Invites",
  "Inmail",
  "Enabled",
  "Action",
];
const users = ["User"];
const AgencyUsers = () => {
  const moreOptionsRef = useRef(null);
  const columnsRef = useRef(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [columnOptions, setColumnOptions] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState(allColumns);
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [currentUser, setCurrentUser] = useState("Select User");
  const userOptionsRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        moreOptionsRef.current &&
        !moreOptionsRef.current.contains(event.target)
      ) {
        setShowMoreOptions(false);
      }
      if (columnsRef.current && !columnsRef.current.contains(event.target)) {
        setColumnOptions(false);
      }
      if (
        userOptionsRef.current &&
        !userOptionsRef.current.contains(event.target)
      ) {
        setShowUserOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="flex flex-col gap-y-[18px] bg-[#EFEFEF] px-[30px] pt-[45px] pb-[200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[#6D6D6D] text-[44px] font-[300]">Users</h1>
        <div className="flex items-center gap-x-2">
          <button className="w-10 h-10 border rounded-full flex items-center justify-center bg-white !p-0 cursor-pointer">
            <DownloadIcon className="w-5 h-5 text-[#4D4D4D]" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-[17px]">
        <div className="relative h-[40px]" ref={moreOptionsRef}>
          <div
            className="cursor-pointer h-[40px] w-[140px] rounded-[6px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
            onClick={() => setShowMoreOptions(prev => !prev)}
          >
            <span className="text-sm font-normal">
              {rowsPerPage === "all" ? "Show All" : `Show ${rowsPerPage}`}
            </span>
            <DropArrowIcon className="h-[16px] w-[14px]" />
          </div>
          {showMoreOptions && (
            <div className="absolute top-[45px] rounded-[6px] overflow-hidden left-0 w-[140px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
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
        <div className="flex items-center gap-x-[9px]">
          <div className="relative h-[40px]" ref={userOptionsRef}>
            <div
              className="cursor-pointer h-[40px] rounded-[6px] w-[160px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
              onClick={() => setShowUserOptions(prev => !prev)}
            >
              <span className="text-sm font-normal">{currentUser}</span>
              <DropArrowIcon className="h-[16px] w-[14px]" />
            </div>

            {showUserOptions && (
              <div className="absolute top-[45px] rounded-[6px] overflow-hidden left-0 w-[160px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
                {users.map(user => (
                  <div
                    key={user}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCurrentUser(user);
                      setShowUserOptions(false);
                    }}
                  >
                    {user}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative h-[40px]" ref={columnsRef}>
            <div
              className="cursor-pointer h-[40px] w-[140px] rounded-[6px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2"
              onClick={() => setColumnOptions(prev => !prev)}
            >
              <span className="text-sm font-normal">Columns</span>
              <DropArrowIcon className="h-[16px] w-[14px]" />
            </div>
            {columnOptions && (
              <div className="absolute top-[50px] right-0 w-[180px] rounded-[6px] overflow-hidden bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
                {allColumns.map(col => (
                  <div
                    key={col}
                    className="flex items-center justify-between px-2 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      if (visibleColumns.includes(col)) {
                        setVisibleColumns(
                          visibleColumns.filter(c => c !== col),
                        );
                      } else {
                        setVisibleColumns([...visibleColumns, col]);
                      }
                    }}
                  >
                    {col}
                    <div className="">
                      {visibleColumns.includes(col) && (
                        <DropDownCheckIcon className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Table rowsPerPage={rowsPerPage} visibleColumns={visibleColumns} />
    </div>
  );
};

export default AgencyUsers;
