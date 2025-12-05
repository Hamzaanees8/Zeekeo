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
  createAgencyUser,
  getUsersWithCampaignsAndStats,
} from "../../../services/agency";
import ProgressModal from "../../../components/ProgressModal";
import { useAgencySettingsStore } from "../../stores/useAgencySettingsStore";
import { useAuthStore } from "../../stores/useAuthStore";
import toast from "react-hot-toast";
import { convertToCSV, downloadCSV } from "../../../utils/agency-user-helper";
import CreateUserModal from "./components/CreateUserModal";
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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const lastMonthStr = "2020-01-01";
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [columnOptions, setColumnOptions] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState(allColumns);
  const [userIds, setUserIds] = useState([]);
  const [campaignsStats, setCampaignsStats] = useState([]);
  const [filteredCampaignsStats, setFilteredCampaignsStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDisabledUsers, setShowDisabledUsers] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const { currentUser } = useAuthStore();
  useEffect(() => {
    const fetchAgencyUsers = async () => {
      try {
        const res = await getAgencyUsers();
        const users = res?.users || [];
        setAllUsers(users);
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
    let filtered = campaignsStats;

    // Filter by enabled/disabled status
    if (showDisabledUsers) {
      filtered = filtered.filter(user => user.enabled === 0);
    } else {
      filtered = filtered.filter(user => user.enabled === 1);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => {
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
    }

    setFilteredCampaignsStats(filtered);
  }, [searchTerm, campaignsStats, showDisabledUsers]);

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

  const handleUserStatusChanged = async () => {
    // Refresh the data when user status changes
    try {
      const res = await getAgencyUsers();
      const users = res?.users || [];
      setAllUsers(users);
      const ids = users.map(u => u.email);
      setUserIds(ids);
    } catch (err) {
      console.error("Error refreshing agency users:", err);
    }
  };
  const handleDownload = async () => {
    setShowDownloadModal(true);
    setDownloadProgress(0);

    try {
      const usersToDownload =
        filteredCampaignsStats.length > 0 ? filteredCampaignsStats : data;

      if (usersToDownload.length === 0) {
        toast.error("No data to download");
        setShowDownloadModal(false);
        return;
      }

      const total = usersToDownload.length;
      const chunkSize = 200;
      let processed = 0;
      let csvRows = [];

      for (let i = 0; i < total; i += chunkSize) {
        const chunk = usersToDownload.slice(i, i + chunkSize);
        const chunkCsv = convertToCSV(chunk).split("\n").slice(1);
        csvRows.push(...chunkCsv);
        processed += chunk.length;

        setDownloadProgress(Math.floor((processed / total) * 90));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      const header = convertToCSV([usersToDownload[0]]).split("\n")[0];
      const finalCsv = [header, ...csvRows].join("\n");
      const { currentUser: user } = useAuthStore.getState();
      const Name = user?.username?.replace(/\s+/g, "_") || "Agency";
      const date = new Date().toISOString().split("T")[0];
      const filename = `${Name}_users_export_${date}.csv`;
      downloadCSV(finalCsv, filename);
      setDownloadProgress(100);
      setTimeout(() => {
        setShowDownloadModal(false);
        setDownloadProgress(0);
        toast.success(
          `Downloaded ${usersToDownload.length} users successfully`,
        );
      }, 800);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed");
      setShowDownloadModal(false);
      setDownloadProgress(0);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      // Prepare user data matching the API schema
      const user = {
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        company: userData.companyName,
        password: userData.password,
        enabled: userData.enabled ? 1 : 0,
        agency_permissions: userData.agency_permissions,
      };

      // Call the API
      const response = await createAgencyUser(user);

      // Refresh the user list
      await handleUserStatusChanged();

      toast.success("User created successfully");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating user:", error);
      
      // Handle specific error cases
      if (error.response?.data?.error === "seats_limit_reached") {
        toast.error("Cannot create user: seat limit reached");
      } else if (error.response?.data?.error === "user_already_exists") {
        toast.error("A user with this email already exists");
      } else if (error.response?.data?.error?.includes("missing_fields")) {
        toast.error("Please fill in all required fields");
      } else if (error.response?.data?.error?.includes("invalid_fields")) {
        toast.error("Invalid field data provided");
      } else {
        toast.error("Failed to create user. Please try again.");
      }
    }
  };
  const { background, textColor } = useAgencySettingsStore();

  return (
    <div
      className="flex flex-col gap-y-[18px] px-[30px] pt-[45px] pb-[200px]"
      style={{ backgroundColor: background || "#EFEFEF" }}
    >
      <div className="flex items-center justify-between">
        <h1
          className="text-[44px] font-[300]"
          style={{ color: textColor || "#6D6D6D" }}
        >
          Users
        </h1>
        <div className="flex items-center gap-x-2">
          <button
            onClick={handleDownload}
            title="Download as CSV"
            className="w-10 h-10 border rounded-full flex items-center justify-center bg-white !p-0 cursor-pointer"
          >
            <DownloadIcon className="w-5 h-5 text-[#4D4D4D]" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-[17px]">
        <div className="flex items-center gap-x-[9px]">
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
        </div>
       
        <div className="flex items-center gap-x-[9px]">
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 rounded-[6px] bg-[#0387FF] cursor-pointer text-white flex items-center gap-2 font-medium text-sm hover:bg-[#0265BF] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add User
          </button>
          <button
            onClick={() => setShowDisabledUsers(prev => !prev)}
            className={`px-4 py-2 rounded-[6px] cursor-pointer border text-sm font-medium transition-colors ${showDisabledUsers
              ? "bg-[#D62828] border-[#D62828] text-white"
              : "bg-white border-[#7E7E7E] text-[#7E7E7E]"
              }`}
            title={showDisabledUsers ? "Showing disabled users" : "Showing enabled users"}
          >
            Disabled Users
          </button>
          

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
        onUserStatusChanged={handleUserStatusChanged}
      />
      {showDownloadModal && (
        <ProgressModal
          onClose={() => {
            setShowDownloadModal(false);
            setDownloadProgress(0);
          }}
          title="Export to CSV"
          action="Abort Process"
          progress={downloadProgress}
        />
      )}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateUser}
          enabledUsersCount={allUsers.filter(u => u.enabled).length}
          totalSeats={(currentUser?.seats?.billed || 0) + (currentUser?.seats?.free || 0)}
        />
      )}
    </div>
  );
};

export default AgencyUsers;
