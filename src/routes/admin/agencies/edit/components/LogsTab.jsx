import { useCallback, useEffect, useRef, useState } from "react";
import { DropArrowIcon } from "../../../../../components/Icons";
import Table from "../../../components/Table";
import { getAgencyLogs } from "../../../../../services/admin";
import { useEditContext } from "../context/EditContext";
import { useParams } from "react-router";
const headers = [
  "Date",
  "Action",
  "User",
  "By",
  "New Value",
  "Old Value",
  "Info",
];
const logsResponse = {
  logs: [
    {
      id: "log123",
      timestamp: 1703123456789,
      type: "action",
      message: "Agency performed action X",
      metadata: {
        action: "campaign_created",
        campaign_id: "campaign123",
      },
    },
    {
      id: "log124",
      timestamp: 1703123556789,
      type: "action",
      message: "Agency performed action Y",
      metadata: {
        action: "user_added",
        user_email: "user@example.com",
      },
    },
  ],
  next: '{"timestamp":1703123556789,"id":"log124"}',
};

const LogsTab = () => {
  const { dateTo, dateFrom } = useEditContext();
  const { id } = useParams();
  const moreOptionsRef = useRef(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const loadingRef = useRef(false);
  const [data, setData] = useState([]);
  const [next, setNext] = useState(null);

  const formatAction = text => {
    if (!text) return "-";
    return text
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const formatDate = timestamp => {
    const fullDate = new Date(timestamp).toString();
    return fullDate.split(" (")[0];
  };
  const capitalizeFirst = str => {
    if (!str) return "-";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const formatLogs = logs =>
    logs.map(log => ({
      id: log.id,
      Date: formatDate(log.timestamp),
      Action: formatAction(log.metadata?.action),
      User: log.metadata?.user_email || "-",
      By: capitalizeFirst(log.metadata?.by) || "-",
      "New Value": log.metadata?.new_value || "-",
      "Old Value": log.metadata?.old_value || "-",
      Info: log.message,
    }));

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

        console.log("Fetched logs:", response);

        const formatted = formatLogs(response.logs || []);

        setData(prev => {
          const newLogs = formatted.filter(
            a => !prev.some(p => p.id === a.id),
          );
          return cursor ? [...prev, ...newLogs] : newLogs;
        });

        setNext(response.next || null);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        loadingRef.current = false;
      }
    },
    [dateFrom, dateTo],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200 &&
        next &&
        !loadingRef.current
      ) {
        console.log("Scrolling... fetching next users page...");
        fetchLogs(next);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [next, fetchLogs]);
  return (
    <div className="flex flex-col gap-y-6">
      <div className="relative h-[35px]" ref={moreOptionsRef}>
        <div
          className="cursor-pointer h-[40px] w-[330px] justify-between border border-[#7E7E7E] px-4 py-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2 rounded-[6px]"
          onClick={() => setShowMoreOptions(prev => !prev)}
        >
          <span className="text-sm font-normal">Display All</span>
          <DropArrowIcon className="h-[16px] w-[14px]" />
        </div>
        {showMoreOptions && (
          <div className="absolute top-[44px] left-0 w-[330px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm  rounded-[6px]">
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
      <Table headers={headers} data={data} />
    </div>
  );
};

export default LogsTab;
