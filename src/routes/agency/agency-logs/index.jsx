import { useEffect, useRef, useState } from "react";
import {
  DownloadIcon,
  DropArrowIcon,
  FilterIcon,
  StepReview,
} from "../../../components/Icons";
import Table from "../components/Table";
import { getAgencyLog } from "../../../services/agency";
import { useAuthStore } from "../../stores/useAuthStore";

const headers = ["Date", "Action", "By", "New Value", "Old Value", "Info"];

const AgencyLogs = () => {
  const moreOptionsRef = useRef(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState("all");
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser: user } = useAuthStore();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const startDate = new Date("2025-01-01T00:00:00Z")
          .getTime()
          .toString();
        const endDate = Date.now().toString();
        const response = await getAgencyLog(
          startDate,
          endDate,
          user?.username,
        );

        const logsArray = Array.isArray(response?.logs)
          ? response.logs
          : Array.isArray(response)
          ? response
          : [];

        const truncate = (s, n = 120) =>
          typeof s === "string" && s.length > n ? s.slice(0, n) + "..." : s;

        const formattedData = logsArray.map(log => {
          const p = log.payload || {};
          const updates = p.updates || null;

          const action =
            log.log_type ||
            (typeof log.log_type_timestamp === "string"
              ? log.log_type_timestamp.split("#")[0]
              : "-");

          const by =
            p.user_email ||
            p.user ||
            p.actor ||
            p.owner ||
            log.target_id ||
            user?.username ||
            "-";

          let newValue = "-";
          let oldValue = "-";

          if (updates) {
            newValue = truncate(JSON.stringify(updates));
          } else if (p.name || p.template_id || p.workflow_id || p.type) {
            newValue = truncate(
              JSON.stringify({
                name: p.name,
                template_id: p.template_id,
                workflow_id: p.workflow_id,
                type: p.type,
              }),
            );
          }

          if (updates && (updates.previous || updates.old || updates.before)) {
            oldValue = truncate(
              JSON.stringify(
                updates.previous || updates.old || updates.before,
              ),
            );
          }

          const info = p.type || p.body || p.message || "-";

          const date = log.timestamp
            ? new Date(Number(log.timestamp)).toLocaleString()
            : "-";

          return {
            Date: date,
            Action: action,
            By: by,
            "New Value": newValue,
            "Old Value": oldValue,
            Info: truncate(String(info)),
            _original: {
              action,
              by,
              newValue,
              oldValue,
              info,
              date,
              rawData: log,
            },
          };
        });

        setLogs(formattedData);
        setFilteredLogs(formattedData);
      } catch (error) {
        console.error("Error fetching agency logs:", error);
        setLogs([]);
        setFilteredLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user?.username]);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    const filtered = logs.filter(log => {
      // Search across all visible columns
      return (
        log.Date.toLowerCase().includes(searchLower) ||
        log.Action.toLowerCase().includes(searchLower) ||
        log.By.toLowerCase().includes(searchLower) ||
        log["New Value"].toLowerCase().includes(searchLower) ||
        log["Old Value"].toLowerCase().includes(searchLower) ||
        log.Info.toLowerCase().includes(searchLower) ||
        log._original.action.toLowerCase().includes(searchLower) ||
        log._original.by.toLowerCase().includes(searchLower) ||
        log._original.info.toLowerCase().includes(searchLower)
      );
    });

    setFilteredLogs(filtered);
  }, [searchTerm, logs]);

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

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
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border border-[#7E7E7E] text-sm rounded-[6px] h-[40px] text-[#7E7E7E] font-normal pl-8 pr-3 bg-white focus:outline-none"
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
      {loading ? (
        <div className="text-gray-500 text-center mt-10">Loading...</div>
      ) : (
        <Table
          headers={headers}
          data={filteredLogs}
          rowsPerPage={rowsPerPage}
        />
      )}
    </div>
  );
};

export default AgencyLogs;
