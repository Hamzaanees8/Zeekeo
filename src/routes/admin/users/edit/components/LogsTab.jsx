import { useCallback, useEffect, useRef, useState } from "react";
import Table from "../../../components/Table";
import { DropArrowIcon } from "../../../../../components/Icons";
import { getUserLogs } from "../../../../../services/admin";
import { useParams } from "react-router";
import { useEditContext } from "../context/EditContext";

const headers = ["Date", "Action", "By", "New Value", "Old Value", "Info"];
const LogsTab = () => {
  const [dockerFilter, setDockerFilter] = useState("All");
  const { id } = useParams();
  const loadingRef = useRef(false);
  const [data, setData] = useState([]);
  const [next, setNext] = useState(null);

  const { dateTo, dateFrom } = useEditContext();

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
      Action: formatAction(log.log_type),
      By: capitalizeFirst(log.target_type) || "-",
      "New Value": log.metadata?.new_value || "-",
      "Old Value": log.metadata?.old_value || "-",
      Info: log.message,
    }));
  const startDate = dateFrom ? new Date(dateFrom).getTime() : null;
  const endDate = dateTo ? new Date(dateTo).getTime() : null;
  const fetchLogs = useCallback(
    async (cursor = null) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        const response = await getUserLogs({
          userEmail: id,
          startDate: startDate, //dateFrom ? new Date(dateFrom).getTime() : null,
          endDate: endDate, //dateTo ? new Date(dateTo).getTime() : null,
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
  console.log("date from", dateFrom);
  console.log("date to", dateTo);
  console.log(startDate, endDate);
  console.log(new Date(startDate).toString()); // Mon Jan 01 2024 ...
  console.log(new Date(endDate).toString()); // Mon Dec 14 2026 ...
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative w-[300px]">
          <select
            className="w-full appearance-none p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E]"
            value={dockerFilter}
            onChange={e => setDockerFilter(e.target.value)}
          >
            <option value="All">Display All</option>
            <option value="Main">Display 1</option>
            <option value="Dev">Display 2</option>
          </select>
          <DropArrowIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
        </div>
      </div>
      <Table headers={headers} data={data} />
    </div>
  );
};

export default LogsTab;
