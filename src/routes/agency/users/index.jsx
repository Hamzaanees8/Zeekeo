import { useEffect, useRef, useState } from "react";
import {
  DownloadIcon,
  DropArrowIcon,
  DropDownCheckIcon,
  StepReview,
} from "../../../components/Icons";
import Table from "./components/Table";
import {
  getAgencyUsers,
  getUsersWithCampaignsAndStats,
} from "../../../services/agency";
const allColumns = [
  "User Email",
  "Name",
  "Type",
  "Accept %",
  "Reply %",
  "Invites",
  "Inmail",
  "Badges",
  "Enabled",
  "Action",
];
const AgencyUsers = () => {
  const moreOptionsRef = useRef(null);
  const columnsRef = useRef(null);
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  // const lastMonth = new Date();
  // lastMonth.setMonth(lastMonth.getMonth() - 12);
  // const lastMonthStr = lastMonth.toISOString().split("T")[0];
  // Use a static start date of January 1, 2020
  const lastMonthStr = "2020-01-01";

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [columnOptions, setColumnOptions] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState(allColumns);
  const [userIds, setUserIds] = useState([]);
  const [campaignsStats, setCampaignsStats] = useState([]);
  const [filteredCampaignsStats, setFilteredCampaignsStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const fetchAgencyUsers = async () => {
      try {
        const res = await getAgencyUsers();
        const users = res?.users || [];
        const ids = users.map(u => u.email);
        setUserIds(ids);
      } catch (err) {
        console.error("Error fetching agency users:", err);
      }
    };

    fetchAgencyUsers();
  }, []);

  useEffect(() => {
    if (!userIds.length) return; // Do nothing until userIds are available

    const fetchDashboardStats = async params => {
      const insights = await getUsersWithCampaignsAndStats(params);
      setCampaignsStats(insights);
    };

    const params = {
      userIds: userIds,
      fromDate: lastMonthStr,
      toDate: todayStr,
      types: ["campaignsRunning", "unreadPositiveConversations", "actions"],
    };

    fetchDashboardStats(params);
  }, [lastMonthStr, todayStr, userIds]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCampaignsStats(campaignsStats);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = campaignsStats.filter(user => {
      return (
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.first_name &&
          user.first_name.toLowerCase().includes(searchLower)) ||
        (user.last_name &&
          user.last_name.toLowerCase().includes(searchLower)) ||
        (user.pro && "pro".includes(searchLower)) ||
        (user.enabled !== undefined &&
          (user.enabled === 1 ? "enabled" : "disabled").includes(searchLower))
      );
    });

    setFilteredCampaignsStats(filtered);
  }, [searchTerm, campaignsStats]);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };
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
          {/* <div className="relative h-[40px]" ref={userOptionsRef}>
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
          </div> */}
          <div className="flex items-center border border-[#323232] bg-white px-3 py-2 relative rounded-[6px] min-w-[200px]">
            <input
              type="text"
              placeholder="Search users..."
              className="outline-none text-sm text-[#7E7E7E] w-full"
              value={searchTerm}
              onChange={handleSearch}
            />
            <StepReview className="w-3 h-3 absolute right-2 z-10 fill-[#323232]" />
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
      <Table
        rowsPerPage={rowsPerPage}
        visibleColumns={visibleColumns}
        campaignsStats={filteredCampaignsStats}
      />
    </div>
  );
};

export default AgencyUsers;
