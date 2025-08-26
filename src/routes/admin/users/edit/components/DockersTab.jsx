import React, { useState } from 'react'
import { CircleIcon, DropArrowIcon, ResetIcon, ViewinAirIcon } from '../../../../../components/Icons'
import Table from '../../../components/Table';

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

const logsHeaders = ["Date", "Type", "S3 JSON Log", "Size", "CloudWatch Log"];

const logsData = [
  {
    Date: "2025 22:31:22 15:38",
    Type: "z_main",
    "S3 JSON Log":
      "b.leitch@zopto.com/z_main/Z_chrome$jdfodsfhthaoikjksjalfksjlkjfewjfewf ew",
    Size: "207.954",
    "CloudWatch Log": "Log",
  },
  {
    Date: "2025 22:31:22 15:38",
    Type: "z_main",
    "S3 JSON Log":
      "b.leitch@zopto.com/z_main/Z_chrome$jdfodsfhthaoikjksjalfksjlkjfewjfewf ew",
    Size: "207.954",
    "CloudWatch Log": "Log",
  },
  {
    Date: "2025 22:31:22 15:38",
    Type: "z_main",
    "S3 JSON Log":
      "b.leitch@zopto.com/z_main/Z_chrome$jdfodsfhthaoikjksjalfksjlkjfewjfewf ew",
    Size: "207.954",
    "CloudWatch Log": "Log",
  },
];

const DockersTab = () => {
  const [dockerFilter, setDockerFilter] = useState("All");
  return (
    <div>
      <div className="flex gap-2 mb-6 justify-end items-center">
        <button
          className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white"
        >
          <CircleIcon className="w-4 h-4 text-[#7E7E7E]" />
        </button>
        <button
          className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white"
        >
          <ViewinAirIcon className="w-4 h-4 text-[#7E7E7E]" />
        </button>
        <button className="bg-[#DE4B32] text-white border border-[#6D6D6D] px-4 py-2 cursor-pointer">Delete LinkedIn Data</button>
        <button className="bg-[#16A37B] text-white border border-[#6D6D6D] px-4 py-2 cursor-pointer">LinkedIn Reconnect</button>
        <button className="bg-[#00B4D8] text-white border border-[#6D6D6D] px-4 py-2 cursor-pointer">Start Fast Fetch</button>
        <button className="bg-[#00B4D8] text-white border border-[#6D6D6D] px-4 py-2 cursor-pointer">Start Browser</button>
        <button className="bg-[#00B4D8] text-white border border-[#6D6D6D] px-4 py-2 cursor-pointer">Start z_main</button>
        <button
          className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white"
        >
          <ResetIcon className="w-4 h-4 text-[#7E7E7E]" />
        </button>
      </div>

      <div className="space-y-6">
      {/* Docker Table */}
      <div>
        
        <Table headers={dockerHeaders} data={dockerData} />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative w-40">
          <select
            className="w-full appearance-none p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E]"
            value={dockerFilter}
            onChange={(e) => setDockerFilter(e.target.value)}
          >
            <option value="All">Docker: All</option>
            <option value="Main">Docker: z_main</option>
            <option value="Dev">Docker: Dev</option>
          </select>
          <DropArrowIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
        </div>
      </div>

      {/* Logs Table */}
      <div className='mt-5'>
        <Table headers={logsHeaders} data={logsData} />
      </div>
    </div>

    </div>
  )
}

export default DockersTab