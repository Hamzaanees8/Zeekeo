import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CreditCard,
  DownloadIcon,
  DropArrowIcon,
  DropDownCheckIcon,
  FilterIcon,
  LoginIcon,
  RunIcon,
  StepReview,
} from "../../../components/Icons";
import { useNavigate } from "react-router";
import { getAdminUsers, loginAsUser } from "../../../services/admin";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/useAuthStore";

const allColumns = [
  "V",
  "User Email",
  "Agency",
  "Name",
  "Badges",
  "Paid Until",
  "Action",
];

const Index = () => {
  const [visibleColumns, setVisibleColumns] = useState(allColumns);
  const columnsRef = useRef(null);
  const moreOptionsRef = useRef(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [columnOptions, setColumnOptions] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState("all");
  const loadingRef = useRef(false);
  const [data, setData] = useState([]);
  const [next, setNext] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dropdown, setDropdown] = useState({
    showAll: false,
    currentUsers: false,
    columns: false,
  });
  const navigate = useNavigate();

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
  const toggleDropdown = key => {
    setDropdown(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (dropdownKey, value) => {
    setSelected(prev => ({ ...prev, [dropdownKey]: value }));
    setDropdown(prev => ({ ...prev, [dropdownKey]: false })); // close dropdown after select
  };

  const visibleData =
    rowsPerPage === "all" ? data : data.slice(0, rowsPerPage);

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

  return (
    <div className="p-6 w-full relative bg-[#f5f5f5] min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-[48px] font-urbanist text-grey-medium font-medium ">
          User
        </h1>

        {/* Search + actions */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {/* Search box */}
          <div className="flex items-center border border-[#323232] bg-white px-3 py-2 relative rounded-[6px]">
            <input
              type="text"
              placeholder="Search"
              className="outline-none text-sm text-[#7E7E7E]"
            />
            <StepReview className="w-3 h-3 absolute right-2 z-10 fill-[#323232]" />
          </div>

          {/* Download */}
          <button className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white">
            <DownloadIcon className="w-4 h-4" />
          </button>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={toggleFilters}
              className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white"
            >
              <FilterIcon className="w-4 h-4 text-[#7E7E7E]" />
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10 p-3">
                <p className="text-sm text-gray-700 mb-2">
                  Filters coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown row */}
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
            <div className="absolute top-[44px] left-0 w-[140px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm rounded-[6px]">
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
          {/* Current Users */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("currentUsers")}
              className="flex justify-between items-center border border-[#323232] px-3 py-2 bg-white text-sm text-[#7E7E7E] w-44 rounded-[6px]"
            >
              {selected.currentUsers}
              <DropArrowIcon className="w-3 h-3 ml-2" />
            </button>
            {dropdown.currentUsers && (
              <div className="absolute mt-1 w-44 bg-white border border-[#7E7E7E]  rounded-[6px] shadow-md z-10">
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

          {/* Columns */}
          <div className="relative h-[40px]" ref={columnsRef}>
            <div
              className="cursor-pointer h-[40px] w-[140px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2 rounded-[6px]"
              onClick={() => setColumnOptions(prev => !prev)}
            >
              <span className="text-sm font-normal">Columns</span>
              <DropArrowIcon className="h-[16px] w-[14px]" />
            </div>
            {columnOptions && (
              <div className="absolute top-[50px] right-0 w-[180px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm rounded-[6px]">
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

      {/* Table */}
      <div className="mt-5 border border-[#7E7E7E] bg-white overflow-hidden rounded-[6px]">
        <table className="w-full text-left text-sm text-[#6D6D6D] bg-white">
          <thead className="border-b border-[#7e7e7e40]">
            <tr>
              {visibleColumns.includes("V") && (
                <th className="px-6 py-5 font-medium">V</th>
              )}
              {visibleColumns.includes("User Email") && (
                <th className="px-6 py-5 font-medium">User Email</th>
              )}
              {visibleColumns.includes("Agency") && (
                <th className="px-6 py-5 font-medium">Agency</th>
              )}
              {visibleColumns.includes("Name") && (
                <th className="px-6 py-5 font-medium">Name</th>
              )}
              {visibleColumns.includes("Badges") && (
                <th className="px-6 py-5 font-medium">Badges</th>
              )}
              {visibleColumns.includes("Paid Until") && (
                <th className="px-6 py-5 font-medium">Paid Until</th>
              )}
              {visibleColumns.includes("Action") && (
                <th className="px-6 py-5 font-medium">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleData?.map((u, idx) => (
              <tr
                key={idx}
                className="border-b border-[#7e7e7e40] last:border-0"
              >
                {visibleColumns.includes("V") && (
                  <td className="px-6 py-5">
                    {u.version},
                    {u.accounts?.linkedin?.data?.premium === true
                      ? "#basic"
                      : "#premium"}
                  </td>
                )}
                {visibleColumns.includes("User Email") && (
                  <td
                    className="px-6 py-5 text-[#0387FF] cursor-pointer"
                    onClick={() => navigate(`/admin/users/edit/${u.email}`)}
                  >
                    {u.email}
                  </td>
                )}
                {visibleColumns.includes("Agency") && (
                  <td className="px-6 py-5 text-[#0387FF]">
                    {u.agency ? <p>{u.agency}</p> : <p>-</p>}
                  </td>
                )}
                {visibleColumns.includes("Name") && (
                  <td className="px-6 py-5">
                    {u.first_name} {u.last_name}
                  </td>
                )}
                {visibleColumns.includes("Badges") && (
                  <td className="px-6 py-5 flex gap-3">
                    <RunIcon className="w-4 h-4" />
                    <RunIcon className="w-4 h-4 " />
                  </td>
                )}
                {visibleColumns.includes("Paid Until") && (
                  <td
                    className={`px-6 py-5 ${
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
                    className="px-6 py-5  flex cursor-pointer"
                  >
                    <LoginIcon />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Index;
