import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { DropArrowIcon } from "../../../../../components/Icons";
import Table from "../../../components/Table";
import { getAgencyLogs } from "../../../../../services/admin";
import { useEditContext } from "../context/EditContext";
import { useParams } from "react-router";

const headers = ["Date", "Action", "By", "New Value", "Old Value", "Info"];

// Constants
const ROWS_PER_PAGE_OPTIONS = [
  { value: "all", label: "Show All" },
  { value: 100, label: "100" },
  { value: 250, label: "250" },
];

const TRUNCATE_LENGTH = 120;

// Utility functions
const truncateText = (text, maxLength = TRUNCATE_LENGTH) => {
  if (typeof text !== "string") return "-";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const formatDate = timestamp => {
  if (!timestamp) return "-";
  try {
    return new Date(Number(timestamp)).toLocaleString();
  } catch {
    return "-";
  }
};

const formatAction = text => {
  if (!text) return "-";
  return text
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const capitalizeFirst = str => {
  if (!str) return "-";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Extract values based on your actual data structure
const extractValues = log => {
  const payload = log.payload || {};

  // Special handling for login events
  if (log.log_type === "login") {
    const loginData = {
      userAgent: payload.userAgent,
      success: payload.success,
      ip: payload.ip,
      agencyCreation: payload.agencyCreation,
    };

    const newValue = loginData.userAgent
      ? truncateText(loginData.userAgent)
      : "-";
    const info = loginData.ip || "-";
    const oldValue = "-"; // Login events don't have old values

    return { newValue, oldValue, info };
  }

  // Default handling for other event types
  let newValue = "-";
  let oldValue = "-";
  let info = "-";

  // You can add more specific handling for other log types here
  if (payload) {
    newValue = truncateText(JSON.stringify(payload));
  }

  info = log.target_type || log.log_type || "-";

  return { newValue, oldValue, info };
};

const LogsTab = () => {
  const { dateTo, dateFrom } = useEditContext();
  const { id } = useParams();
  const moreOptionsRef = useRef(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState("all");
  const loadingRef = useRef(false);
  const [data, setData] = useState([]);
  const [next, setNext] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Format log data based on your actual API response structure
  const formatLogs = useCallback(logs => {
    return logs.map(log => {
      const { newValue, oldValue, info } = extractValues(log);

      return {
        id: log.log_type_timestamp || log.timestamp, // Use timestamp as ID if no unique ID
        Date: formatDate(log.timestamp),
        Action: formatAction(log.log_type),
        By: capitalizeFirst(log.target_id) || "-",
        "New Value": newValue,
        "Old Value": oldValue,
        Info: info,
        _original: {
          action: log.log_type,
          by: log.target_id,
          newValue: log.payload,
          oldValue: null, // Your data doesn't seem to have old values
          info: log.target_type,
          date: log.timestamp,
          rawData: log,
          timestamp: log.timestamp,
        },
      };
    });
  }, []);

  // Close dropdown when clicking outside
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

  // Fetch logs
  const fetchLogs = useCallback(
    async (cursor = null) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        const response = await getAgencyLogs({
          agencyUsername: id,
          startDate: dateFrom ? new Date(dateFrom).getTime() : null,
          endDate: dateTo ? new Date(dateTo).getTime() : null,
          next: cursor,
        });

        // Handle different response structures
        const logsArray = Array.isArray(response?.logs)
          ? response.logs
          : Array.isArray(response)
          ? response
          : [];

        const formatted = formatLogs(logsArray);

        setData(prev => {
          if (!cursor) {
            return formatted; // Replace all data for initial load
          }
          // For pagination, filter out duplicates
          const newLogs = formatted.filter(
            newLog => !prev.some(existingLog => existingLog.id === newLog.id),
          );
          return [...prev, ...newLogs];
        });

        setNext(response.next || null);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        loadingRef.current = false;
      }
    },
    [dateFrom, dateTo, id, formatLogs],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200 &&
        next &&
        !loadingRef.current
      ) {
        console.log("Scrolling... fetching next logs page...");
        fetchLogs(next);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [next, fetchLogs]);

  // Sort logs by timestamp (newest first)
  const sortedLogs = useMemo(() => {
    return [...data].sort((a, b) => {
      const timestampA = a._original?.timestamp;
      const timestampB = b._original?.timestamp;

      // Handle missing timestamps
      if (!timestampA && !timestampB) return 0;
      if (!timestampA) return 1;
      if (!timestampB) return -1;

      // Sort in descending order (newest first)
      return Number(timestampB) - Number(timestampA);
    });
  }, [data]);

  // Filter logs based on search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return sortedLogs;

    const searchLower = searchTerm.toLowerCase().trim();

    return sortedLogs.filter(log => {
      if (!log) return false;

      const searchableFields = [
        log.Date,
        log.Action,
        log.By,
        log["New Value"],
        log["Old Value"],
        log.Info,
      ];

      return searchableFields.some(field => {
        if (field == null) return false;
        const fieldString = String(field).toLowerCase();
        return fieldString.includes(searchLower);
      });
    });
  }, [searchTerm, sortedLogs]);

  // Search handlers
  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  // Rows per page handlers
  const handleRowsPerPageChange = value => {
    setRowsPerPage(value);
    setShowMoreOptions(false);
  };

  const currentRowsPerPageLabel = useMemo(() => {
    const option = ROWS_PER_PAGE_OPTIONS.find(
      opt => opt.value === rowsPerPage,
    );
    return option ? option.label : "Show All";
  }, [rowsPerPage]);

  return (
    <div className="flex flex-col gap-y-6">
      {/* Rows per page selector */}
      <div className="flex items-center justify-between">
        <div className="relative h-[40px]" ref={moreOptionsRef}>
          <div
            className="cursor-pointer h-[40px] w-[330px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2 rounded-[6px] hover:border-[#4D4D4D]"
            onClick={() => setShowMoreOptions(prev => !prev)}
          >
            <span className="text-sm font-normal">
              {currentRowsPerPageLabel}
            </span>
            <DropArrowIcon className="h-[16px] w-[14px]" />
          </div>
          {showMoreOptions && (
            <div className="absolute top-[44px] left-0 w-[330px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm rounded-[6px] overflow-hidden">
              {ROWS_PER_PAGE_OPTIONS.map(option => (
                <div
                  key={option.value}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleRowsPerPageChange(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Search Input */}
        <div className="flex items-center justify-between">
          <div className="relative w-[225px] h-[40px]">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border border-[#7E7E7E] text-sm rounded-[6px] h-[40px] text-[#7E7E7E] font-normal pl-3 pr-8 bg-white focus:outline-none focus:ring-1 focus:ring-[#7E7E7E]"
            />
          </div>
        </div>
      </div>

      {/* Debug info */}
      {data.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No logs found. Check the console for details.
        </div>
      )}

      {/* Table */}
      {data.length > 0 && (
        <Table
          headers={headers}
          data={filteredLogs}
          rowsPerPage={rowsPerPage}
        />
      )}
    </div>
  );
};

export default LogsTab;
