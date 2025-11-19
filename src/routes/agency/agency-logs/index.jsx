import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  DownloadIcon,
  DropArrowIcon,
  FilterIcon,
  StepReview,
} from "../../../components/Icons";
import Table from "../components/Table";
import { getAgencyLog } from "../../../services/agency";
import { useAuthStore } from "../../stores/useAuthStore";
import ProgressModal from "../../../components/ProgressModal";
import toast from "react-hot-toast";

const headers = ["Date", "Action", "By", "New Value", "Old Value", "Info"];

// Constants
const ROWS_PER_PAGE_OPTIONS = [
  { value: "all", label: "Show All" },
  { value: 100, label: "100" },
  { value: 250, label: "250" },
];

const DEFAULT_START_DATE = "2025-01-01T00:00:00Z";
const TRUNCATE_LENGTH = 120;

// Utility functions
const truncateText = (text, maxLength = TRUNCATE_LENGTH) => {
  if (typeof text !== "string") return "-";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const formatTimestamp = timestamp => {
  if (!timestamp) return "-";
  try {
    return new Date(Number(timestamp)).toLocaleString();
  } catch {
    return "-";
  }
};

const extractAction = log => {
  return (
    log.log_type ||
    (typeof log.log_type_timestamp === "string"
      ? log.log_type_timestamp.split("#")[0]
      : "-")
  );
};

const extractActor = (payload, log, user) => {
  return (
    payload.user_email ||
    payload.user ||
    payload.actor ||
    payload.owner ||
    log.target_id ||
    user?.username ||
    "-"
  );
};

// Special handling for login events
const extractLoginInfo = payload => {
  if (!payload) return { newValue: "-", info: "-" };

  const loginData = {
    userAgent: payload.userAgent,
    success: payload.success,
    ip: payload.ip,
  };

  const newValue = loginData.userAgent
    ? truncateText(loginData.userAgent)
    : "-";
  const info = loginData.ip || "-";

  return { newValue, info };
};

// Special handling for template/workflow events
const extractTemplateWorkflowInfo = payload => {
  if (!payload) return { newValue: "-", oldValue: "-", info: "-" };

  let newValue = "-";
  let oldValue = "-";
  let info = "-";

  // Handle updates (for template_updated, workflow_updated)
  if (payload.updates) {
    newValue = truncateText(JSON.stringify(payload.updates));

    // Extract old value from updates
    const { previous, old, before } = payload.updates || {};
    const oldData = previous || old || before;
    oldValue = oldData ? truncateText(JSON.stringify(oldData)) : "-";
  } else {
    // For created events, show the main data
    const relevantData = {
      name: payload.name,
      template_id: payload.template_id,
      workflow_id: payload.workflow_id,
      type: payload.type,
    };

    const hasData = Object.values(relevantData).some(val => val != null);
    newValue = hasData ? truncateText(JSON.stringify(relevantData)) : "-";
  }

  info = payload.type || payload.body || payload.message || "-";

  return { newValue, oldValue, info };
};

const extractValues = (log, payload) => {
  const action = extractAction(log);

  // Special handling for login events
  if (action === "login") {
    return extractLoginInfo(payload);
  }

  // Handle template and workflow events
  if (action.includes("template") || action.includes("workflow")) {
    return extractTemplateWorkflowInfo(payload);
  }

  // Default handling for other event types
  return extractTemplateWorkflowInfo(payload);
};

export const convertLogsToCSV = data => {
  if (!data || data.length === 0) return "";

  const columns = ["Date", "Action", "By", "New Value", "Old Value", "Info"];

  const headers = columns.join(",");

  const rows = data.map(log => {
    const rowData = [
      `"${log.Date || "-"}"`,
      `"${log.Action || "-"}"`,
      `"${log.By || "-"}"`,
      `"${log["New Value"] || "-"}"`,
      `"${log["Old Value"] || "-"}"`,
      `"${log.Info || "-"}"`,
    ];

    return rowData.join(",");
  });

  return [headers, ...rows].join("\n");
};

export const downloadCSV = (csvContent, filename = "logs.csv") => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const AgencyLogs = () => {
  const moreOptionsRef = useRef(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState("all");
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { currentUser: user } = useAuthStore();

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

  // Format log data
  const formatLogData = useCallback(
    log => {
      const payload = log.payload || {};

      const action = extractAction(log);
      const by = extractActor(payload, log, user);
      const { newValue, oldValue, info } = extractValues(log, payload);
      const date = formatTimestamp(log.timestamp);

      return {
        Date: date,
        Action: action,
        By: by,
        "New Value": newValue,
        "Old Value": oldValue,
        Info: truncateText(String(info)),
        _original: {
          action,
          by,
          newValue,
          oldValue,
          info,
          date,
          rawData: log,
          timestamp: log.timestamp, // Keep original timestamp for sorting
        },
      };
    },
    [user],
  );

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date(DEFAULT_START_DATE).getTime().toString();
      const endDate = Date.now().toString();

      const response = await getAgencyLog(startDate, endDate, user?.username);

      const logsArray = Array.isArray(response?.logs)
        ? response.logs
        : Array.isArray(response)
        ? response
        : [];

      const formattedData = logsArray.map(formatLogData);
      setLogs(formattedData);
    } catch (err) {
      console.error("Error fetching agency logs:", err);
      setError("Failed to load logs. Please try again.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user?.username, formatLogData]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Sort logs by timestamp (newest first)
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const timestampA = a._original?.rawData?.timestamp;
      const timestampB = b._original?.rawData?.timestamp;

      // Handle missing timestamps
      if (!timestampA && !timestampB) return 0;
      if (!timestampA) return 1; // Put items without timestamp at the end
      if (!timestampB) return -1; // Put items without timestamp at the end

      // Sort in descending order (newest first)
      return Number(timestampB) - Number(timestampA);
    });
  }, [logs]);

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
        log._original?.action,
        log._original?.by,
        log._original?.info,
      ];

      return searchableFields.some(field => {
        // Handle undefined/null fields safely
        if (field == null) return false;

        // Convert to string and then lowercase for safe comparison
        const fieldString = String(field).toLowerCase();
        return fieldString.includes(searchLower);
      });
    });
  }, [searchTerm, sortedLogs]);

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

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
  const handleDownload = async () => {
    setShowDownloadModal(true);
    setDownloadProgress(0);

    try {
      const logsToDownload = filteredLogs.length > 0 ? filteredLogs : data;

      if (logsToDownload.length === 0) {
        toast.error("No data to download");
        setShowDownloadModal(false);
        return;
      }

      const total = logsToDownload.length;
      const chunkSize = 200;
      let processed = 0;
      let csvRows = [];

      for (let i = 0; i < total; i += chunkSize) {
        const chunk = logsToDownload.slice(i, i + chunkSize);
        const chunkCsv = convertLogsToCSV(chunk).split("\n").slice(1);
        csvRows.push(...chunkCsv);
        processed += chunk.length;

        setDownloadProgress(Math.floor((processed / total) * 90));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      const header = convertLogsToCSV([logsToDownload[0]]).split("\n")[0];
      const finalCsv = [header, ...csvRows].join("\n");
      const { currentUser: user } = useAuthStore.getState();
      const Name = user?.username?.replace(/\s+/g, "_") || "Agency";
      const date = new Date().toISOString().split("T")[0];
      const filename = `${Name}_logs_export_${date}.csv`;
      downloadCSV(finalCsv, filename);
      setDownloadProgress(100);
      setTimeout(() => {
        setShowDownloadModal(false);
        setDownloadProgress(0);
        toast.success(
          `Downloaded ${logsToDownload.length} users successfully`,
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
    <div className="flex flex-col gap-y-[18px] bg-[#EFEFEF] px-[26px] pt-[45px] pb-[200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[#6D6D6D] text-[44px] font-[300]">Logs</h1>
        <div className="flex items-center gap-x-2">
          {/* Search Input */}
          <div className="relative w-[225px] h-[40px]">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
            </span>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border border-[#7E7E7E] text-sm rounded-[6px] h-[40px] text-[#7E7E7E] font-normal pl-8 pr-3 bg-white focus:outline-none focus:ring-1 focus:ring-[#7E7E7E]"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7E7E7E] hover:text-[#4D4D4D] text-lg font-bold"
              >
                ×
              </button>
            )}
          </div>

          <button
            onClick={handleDownload}
            title="Download as CSV"
            className="w-10 h-10 border rounded-full flex items-center justify-center bg-white !p-0 cursor-pointer hover:bg-gray-50"
          >
            <DownloadIcon className="w-5 h-5 text-[#4D4D4D]" />
          </button>
          <button className="w-10 h-10 border border-grey-400 rounded-full flex items-center cursor-pointer justify-center bg-white hover:bg-gray-50">
            <FilterIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Rows per page selector */}
      <div className="flex items-center justify-start mt-[17px]">
        <div className="relative h-[40px]" ref={moreOptionsRef}>
          <div
            className="cursor-pointer h-[40px] w-[330px] rounded-[6px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2 hover:border-[#4D4D4D]"
            onClick={() => setShowMoreOptions(prev => !prev)}
          >
            <span className="text-sm font-normal">
              {currentRowsPerPageLabel}
            </span>
            <DropArrowIcon className="h-[16px] w-[14px]" />
          </div>
          {showMoreOptions && (
            <div className="absolute top-[45px] rounded-[6px] overflow-hidden left-0 w-[330px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm">
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
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-gray-500 text-center mt-10">Loading...</div>
      )}

      {/* Table */}
      {!loading && !error && (
        <Table
          headers={headers}
          data={filteredLogs}
          rowsPerPage={rowsPerPage}
        />
      )}
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

export default AgencyLogs;
