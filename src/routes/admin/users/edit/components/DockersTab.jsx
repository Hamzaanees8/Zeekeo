import React, { useState } from "react";
import {
  CircleIcon,
  DropArrowIcon,
  ResetIcon,
  ViewinAirIcon,
} from "../../../../../components/Icons";
import Table from "../../../components/Table";
import { getUserWorkerLogs } from "../../../../../services/admin";
import { useParams } from "react-router";
import { useEffect } from "react";
import { getUserWorkerLogFile } from "../../../../../services/admin";
const dockerHeaders = [
  "Created",
  "Ping",
  "User",
  "Type",
  "Cluster",
  "CPU",
  "MEM",
  "Time",
  "Price",
  "Status",
  "View",
  "Actions",
];

const dockerData = [
  {
    Created: "2025-22:31:22 15:38",
    Ping: "(46588.51 sec)",
    User: "b.leitch@zopto.com",
    Type: "Fast_fetch false/ br",
    Cluster: "chronz",
    CPU: "1024",
    MEM: "2048",
    Time: "152 min",
    Price: "1.9784",
    Status: "Stopped",
    View: "-",
    Actions: "Delete / Edit",
  },
  {
    Created: "2025-22:31:22 15:38",
    Ping: "(46588.51 sec)",
    User: "b.leitch@zopto.com",
    Type: "Logged in as ['IP']",
    Cluster: "-",
    CPU: "2048",
    MEM: "4048",
    Time: "5 min",
    Price: "0.0125",
    Status: "Stopped",
    View: "-",
    Actions: "Disconnected",
  },
];

// const logsHeaders = ["Date", "Type", "S3 JSON Log", "Size", "CloudWatch Log"];
const logsHeaders = ["Date", "S3 JSON Log", "Size", "Action"];

const DockersTab = () => {
  const { id } = useParams();
  const [logsData, setLogsData] = useState([]);

  const handleViewLog = async file => {
    try {
      const res = await getUserWorkerLogFile({
        userEmail: id,
        logFileKey: file.key,
      });

      console.log("Fetched log file response:", res.url);
      if (res?.url) {
        // just redirect user to the signed S3 link in a new tab
        window.open(res.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("❌ Failed to fetch log file:", err);
    }
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        console.log("🔄 Fetching logs for user:", id);

        const res = await getUserWorkerLogs({ userEmail: id });
        console.log(" API response:", res);

        const files = Array.isArray(res) ? res : res?.logFiles || [];
        console.log("📂 Extracted log files:", files);

        if (files.length === 0) {
          console.warn("⚠️ No log files found for this user");
          setLogsData([]);
          return;
        }
        const mapped = files.map(file => ({
          Date: new Date(file.lastModified).toLocaleString(),
          "S3 JSON Log": file.key,
          Size: (file.size / 1024).toFixed(2) + " KB",
          Action: (
            <button
              onClick={() => handleViewLog(file)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              View
            </button>
          ),
        }));

        console.log("📊 Mapped table data:", mapped);
        setLogsData(mapped);
      } catch (err) {
        console.error("❌ Failed to fetch logs:", err);
        setLogsData([]);
      }
    };

    fetchLogs();
  }, [id]);

  const [dockerFilter, setDockerFilter] = useState("All");
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex gap-2 mb-6 justify-end items-center">
        <button className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white">
          <CircleIcon className="w-4 h-4 text-[#7E7E7E]" />
        </button>
        <button className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white">
          <ViewinAirIcon className="w-4 h-4 text-[#7E7E7E]" />
        </button>
        <button className="bg-[#DE4B32] text-white border border-[#6D6D6D] px-4 py-2 cursor-pointer rounded-[6px]">
          Delete LinkedIn Data
        </button>
        <button className="bg-[#16A37B] text-white border border-[#6D6D6D] px-4 py-2 cursor-pointer rounded-[6px]">
          LinkedIn Reconnect
        </button>
        <button className="bg-[#00B4D8] text-white border border-[#6D6D6D] px-4 py-2 cursor-pointer rounded-[6px]">
          Start Fast Fetch
        </button>
        <button className="bg-[#00B4D8] text-white border border-[#6D6D6D] px-4 py-2 cursor-pointer rounded-[6px]">
          Start Browser
        </button>
        <button className="bg-[#00B4D8] text-white border border-[#6D6D6D] px-4 py-2 cursor-pointer rounded-[6px]">
          Start z_main
        </button>
        <button className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white">
          <ResetIcon className="w-4 h-4 text-[#7E7E7E]" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Docker Table */}
        <div>
          <Table headers={dockerHeaders} data={dockerData} />
        </div>

        {/* Custom Dropdown */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative w-40">
            {/* Selected value */}
            <div
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px] rounded-br-[6px] cursor-pointer flex justify-between items-center"
              onClick={() => setOpen(prev => !prev)}
            >
              <span>
                {dockerFilter === "All" && "Docker: All"}
                {dockerFilter === "Main" && "Docker: z_main"}
                {dockerFilter === "Dev" && "Docker: Dev"}
              </span>
              <DropArrowIcon
                className={`w-3 h-3 text-[#6D6D6D] transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Options */}
            {open && (
              <div className="absolute mt-1 w-full bg-white border border-[#6D6D6D] rounded-[6px] overflow-hidden shadow-md z-10">
                <div
                  className={`p-2 cursor-pointer hover:bg-gray-100 text-[#6D6D6D] ${
                    dockerFilter === "All" ? "bg-gray-200" : ""
                  }`}
                  onClick={() => {
                    setDockerFilter("All");
                    setOpen(false);
                  }}
                >
                  Docker: All
                </div>
                <div
                  className={`p-2 cursor-pointer hover:bg-gray-100 text-[#6D6D6D] ${
                    dockerFilter === "Main" ? "bg-gray-200" : ""
                  }`}
                  onClick={() => {
                    setDockerFilter("Main");
                    setOpen(false);
                  }}
                >
                  Docker: z_main
                </div>
                <div
                  className={`p-2 cursor-pointer hover:bg-gray-100 text-[#6D6D6D] ${
                    dockerFilter === "Dev" ? "bg-gray-200" : ""
                  }`}
                  onClick={() => {
                    setDockerFilter("Dev");
                    setOpen(false);
                  }}
                >
                  Docker: Dev
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="mt-5">
          <Table headers={logsHeaders} data={logsData} />
        </div>
      </div>
    </div>
  );
};

export default DockersTab;
