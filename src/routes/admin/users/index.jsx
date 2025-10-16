import { useCallback, useEffect, useRef, useState } from "react";
import {
  CreditCard,
  DownloadIcon,
  DropArrowIcon,
  DropDownCheckIcon,
  EmailIcon1,
  FilterIcon,
  LinkedInIcon2,
  LoginIcon,
  RunIcon,
  StepReview,
} from "../../../components/Icons";
import { useNavigate } from "react-router";
import { getAdminUsers, loginAsUser } from "../../../services/admin";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/useAuthStore";
import ProgressModal from "../../../components/ProgressModal";
import { convertToCSV, downloadCSV } from "../../../utils/admin-user-helper";

const allColumns = [
  "V",
  "User Email",
  "Agency",
  "Name",
  "Badges",
  "Paid Until",
  "Action",
];

const VALID_ACCOUNT_STATUSES = [
  "OK",
  "SYNC_SUCCESS",
  "RECONNECTED",
  "CREATION_SUCCESS",
];
const filterOptions = [
  { key: "basic", label: "Basic Account" },
  { key: "premium", label: "Premium Account" },
  { key: "linkedin", label: "LinkedIn Connected" },
  { key: "email", label: "Email Connected" },
];

const Index = () => {
  const dropdownRef = useRef(null);
  const [visibleColumns, setVisibleColumns] = useState(allColumns);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const columnsRef = useRef(null);
  const moreOptionsRef = useRef(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [columnOptions, setColumnOptions] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState("all");
  const loadingRef = useRef(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [next, setNext] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dropdown, setDropdown] = useState({
    showAll: false,
    currentUsers: false,
    columns: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const getConnectionBadgeColor = (user, provider) => {
    const account = user.accounts?.[provider];
    if (!account) {
      return "#9CA3AF";
    }
    if (VALID_ACCOUNT_STATUSES.includes(account.status)) {
      return "#038D65";
    }
    return "#DE4B32";
  };

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // store selected values
  const [selected, setSelected] = useState({
    showAll: "Show All",
    currentUsers: "Current Users",
    columns: "Columns",
  });

  const fetchUsers = useCallback(async (cursor = null) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const response = await getAdminUsers({ next: cursor });
      console.log("Fetched users:", response);

      setData(prev => {
        const newUsers = response.users.filter(
          a => !prev.some(p => p.id === a.id),
        );
        return cursor ? [...prev, ...newUsers] : newUsers;
      });

      setNext(response.next || null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    let filtered = [...data];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => {
        const fullName = `${user.first_name || ""} ${
          user.last_name || ""
        }`.toLowerCase();
        const email = user.email?.toLowerCase() || "";
        const agency = user.agency?.toLowerCase() || "";
        const paidUntil = user.paid_until?.toLowerCase() || "";
        const version = user.version?.toString().toLowerCase() || "";

        const isPremium = user.accounts?.linkedin?.data?.premium;
        const premiumStatus = isPremium ? "#premium" : "#basic";

        return (
          email.includes(term) ||
          fullName.includes(term) ||
          agency.includes(term) ||
          paidUntil.includes(term) ||
          version.includes(term) ||
          premiumStatus.includes(term) ||
          premiumStatus.replace("#", "").includes(term) ||
          `${version},${premiumStatus}`.includes(term)
        );
      });
    }
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(user => {
        return selectedFilters.every(filter => {
          switch (filter) {
            case "basic":
              return (
                user.accounts?.linkedin?.data?.premium === false ||
                !user.accounts?.linkedin?.data?.premium
              );
            case "premium":
              return user.accounts?.linkedin?.data?.premium === true;
            case "linkedin":
              return (
                user.accounts?.linkedin &&
                VALID_ACCOUNT_STATUSES.includes(user.accounts.linkedin.status)
              );
            case "email":
              return (
                user.accounts?.email &&
                VALID_ACCOUNT_STATUSES.includes(user.accounts.email.status)
              );
            default:
              return true;
          }
        });
      });
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedFilters, data]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200 &&
        next &&
        !loadingRef.current
      ) {
        console.log("Scrolling... fetching next users page...");
        fetchUsers(next);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [next, fetchUsers]);

  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleFilterSelection = key => {
    setSelectedFilters(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key],
    );
  };
  const toggleDropdown = key => {
    setDropdown(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (dropdownKey, value) => {
    setSelected(prev => ({ ...prev, [dropdownKey]: value }));
    setDropdown(prev => ({ ...prev, [dropdownKey]: false })); // close dropdown after select
  };

  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };

  const visibleData =
    rowsPerPage === "all" ? filteredData : filteredData.slice(0, rowsPerPage);

  const handleLoginAs = async email => {
    try {
      const adminToken = useAuthStore.getState().sessionToken;
      const res = await loginAsUser(email, adminToken);

      if (res?.sessionToken) {
        useAuthStore.getState().setLoginAsToken(res.sessionToken);
        toast.success(`Logged in as ${email}`);
        navigate("/dashboard");
      } else {
        toast.error("Failed to login as user");
        console.error("Login as user error:", res);
      }
    } catch (err) {
      console.error("Login as user failed:", err);
      toast.error("Something went wrong");
    }
  };
  const handleDownload = async () => {
    setShowDownloadModal(true);
    setDownloadProgress(0);

    try {
      const usersToDownload = filteredData.length > 0 ? filteredData : data;

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
      const firstName = user?.first_name?.replace(/\s+/g, "_") || "User";
      const lastName = user?.last_name?.replace(/\s+/g, "_") || "Unknown";
      const date = new Date().toISOString().split("T")[0];
      const filename = `${firstName}_${lastName}_users_export_${date}.csv`;
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

  return (
    <div className="p-6 w-full relative bg-[#f5f5f5] min-h-screen">
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-[48px] font-urbanist text-grey-medium font-medium ">
          Users
        </h1>

        <div className="flex items-center gap-3 mt-4 sm:mt-0">
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

          <button
            onClick={handleDownload}
            title="Download as CSV"
            className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white cursor-pointer"
          >
            <DownloadIcon className="w-4 h-4" />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleFilters}
              className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white cursor-pointer"
            >
              <FilterIcon className="w-4 h-4 text-[#7E7E7E]" />
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-md z-10 p-2 rounded-[8px] border border-[#7E7E7E] overflow-hidden">
                <ul className="space-y-1">
                  {filterOptions.map(option => (
                    <li
                      key={option.key}
                      onClick={() => toggleFilterSelection(option.key)}
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded"
                    >
                      <span className="text-sm text-[#7E7E7E]">
                        {option.label}
                      </span>
                      {selectedFilters.includes(option.key) && (
                        <DropDownCheckIcon className="w-4 h-4 text-green-600" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-3 mt-5">
        <div className="relative h-[40px]" ref={moreOptionsRef}>
          <div
            className="cursor-pointer h-[40px] w-[140px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2 rounded-[6px]"
            onClick={() => setShowMoreOptions(prev => !prev)}
          >
            <span className="text-sm font-normal">
              {rowsPerPage === "all" ? "Show All" : `Show ${rowsPerPage}`}
            </span>
            <DropArrowIcon className="h-[16px] w-[14px]" />
          </div>
          {showMoreOptions && (
            <div className="absolute top-[44px] left-0 w-[140px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm rounded-[6px] overflow-hidden">
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

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => toggleDropdown("currentUsers")}
              className="flex justify-between items-center border border-[#323232] px-3 py-2 bg-white text-sm text-[#7E7E7E] w-44 rounded-[6px]"
            >
              {selected.currentUsers}
              <DropArrowIcon className="w-3 h-3 ml-2" />
            </button>
            {dropdown.currentUsers && (
              <div className="absolute mt-1 w-44 bg-white border border-[#7E7E7E]  rounded-[6px] shadow-md z-10 overflow-hidden">
                <ul className="text-sm text-gray-700">
                  {["User A", "User B", "User C"].map(user => (
                    <li
                      key={user}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelect("currentUsers", user)}
                    >
                      {user}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative h-[40px]" ref={columnsRef}>
            <div
              className="cursor-pointer h-[40px] w-[140px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2 rounded-[6px]"
              onClick={() => setColumnOptions(prev => !prev)}
            >
              <span className="text-sm font-normal">Columns</span>
              <DropArrowIcon className="h-[16px] w-[14px]" />
            </div>
            {columnOptions && (
              <div className="absolute top-[50px] right-0 w-[180px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm rounded-[6px] overflow-hidden">
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

      <div className="mt-5 border border-[#7E7E7E] bg-white overflow-hidden rounded-[6px]">
        <table className="w-full text-left text-sm text-[#6D6D6D] bg-white overflow-x-auto">
          <thead className="border-b border-[#7e7e7e40]">
            <tr>
              {visibleColumns.includes("V") && (
                <th className="px-3 py-5 font-medium">V</th>
              )}
              {visibleColumns.includes("User Email") && (
                <th className="px-3 py-5 font-medium">User Email</th>
              )}
              {visibleColumns.includes("Agency") && (
                <th className="px-3 py-5 font-medium">Agency</th>
              )}
              {visibleColumns.includes("Name") && (
                <th className="px-3 py-5 font-medium">Name</th>
              )}
              {visibleColumns.includes("Badges") && (
                <th className="px-3 py-5 font-medium">Badges</th>
              )}
              {visibleColumns.includes("Paid Until") && (
                <th className="px-3 py-5 font-medium">Paid Until</th>
              )}
              {visibleColumns.includes("Action") && (
                <th className="px-3 py-5 font-medium">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleData.length > 0 ? (
              visibleData.map((u, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#7e7e7e40] last:border-0"
                >
                  {visibleColumns.includes("V") && (
                    <td className="px-3 py-5">
                      {u.version},
                      {u.accounts?.linkedin?.data?.premium === true
                        ? "#premium"
                        : "#basic"}
                    </td>
                  )}
                  {visibleColumns.includes("User Email") && (
                    <td
                      className="px-3 py-5 text-[#0387FF] cursor-pointer"
                      onClick={() => navigate(`/admin/users/edit/${u.email}`)}
                    >
                      {u.email}
                    </td>
                  )}
                  {visibleColumns.includes("Agency") && (
                    <td className="px-3 py-5 text-[#0387FF]">
                      {u.agency_username ? (
                        <p>{u.agency_username}</p>
                      ) : (
                        <p>-</p>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes("Name") && (
                    <td className="px-3 py-5">
                      {u.first_name} {u.last_name}
                    </td>
                  )}
                  {visibleColumns.includes("Badges") && (
                    <td className="px-3 py-5 flex gap-2 items-center">
                      <div
                        title={
                          !u.accounts?.linkedin
                            ? "LinkedIn account not connected"
                            : VALID_ACCOUNT_STATUSES.includes(
                                u.accounts.linkedin.status,
                              )
                            ? "LinkedIn account connected"
                            : "LinkedIn account disconnected"
                        }
                      >
                        <LinkedInIcon2
                          className="w-5 h-5"
                          fill={getConnectionBadgeColor(u, "linkedin")}
                        />
                      </div>
                      <div
                        className="rounded-full border-2 flex items-center justify-center w-4.5 h-4.5"
                        style={{
                          borderColor: getConnectionBadgeColor(u, "email"),
                        }}
                        title={
                          !u.accounts?.email
                            ? "Email account not connected"
                            : VALID_ACCOUNT_STATUSES.includes(
                                u.accounts.email.status,
                              )
                            ? "Email account connected"
                            : "Email account disconnected"
                        }
                      >
                        <EmailIcon1
                          className="w-3.5 h-3"
                          fill={getConnectionBadgeColor(u, "email")}
                        />
                      </div>

                      <RunIcon className="w-5 h-5" />
                      <RunIcon className="w-5 h-5 " />
                    </td>
                  )}
                  {visibleColumns.includes("Paid Until") && (
                    <td
                      className={`px-3 py-5 ${
                        new Date(u.paid_until) < new Date()
                          ? "text-[#DE4B32]"
                          : "text-[#038D65]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {u.paid_until}
                        <CreditCard className="inline-block w-4 h-4" />
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes("Action") && (
                    <td
                      onClick={() => handleLoginAs(u.email)}
                      title="Login as this user"
                      className="px-3 py-5  flex cursor-pointer"
                    >
                      <LoginIcon />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-3 py-8 text-center text-[#7E7E7E]"
                >
                  {searchTerm
                    ? `No users found matching "${searchTerm}"`
                    : "No users found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
    </div>
  );
};

export default Index;
