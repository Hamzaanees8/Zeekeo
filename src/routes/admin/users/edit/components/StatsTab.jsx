import { useEffect, useState } from "react";
import ChartCard from "../../../components/ChartCard";
import { getUserStats } from "../../../../../services/admin";
import { useParams } from "react-router";
const statsData = [
  { label: "Last login", value: "2025-08-01 14:53" },
  { label: "Last Disconnected", value: "2024-12-11 23:34" },
  { label: "Login challenge", value: "-" },
  { label: "Bant last fetch", value: "2024-07-19 10:20" },
  { label: "User last fetch", value: "2023-11-06 13:19" },
  { label: "Next cron at", value: "2025-08-03 08:41" },
  { label: "Docker zpotto sleep until", value: "2025-08-03 05:14" },
  { label: "Invites ban until", value: "2025-06-28 01:15" },
  { label: "Inmails ban until", value: "-" },
  { label: "Bulk Invites ban until", value: "2023-10-03 13:09" },
  { label: "Logins", value: `[{"p":true,"sh":true}]` },
  { label: "zmain_docker_wish", value: "false" },
  {
    label: "zmain_docker_wish_until",
    value: "2025-08-01 16:35 (-2225.3 min)",
  },
];

const StatsTab = () => {
  const [data, setData] = useState({});
  const { id } = useParams();
  const formatTitle = key => {
    return key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
  };
  useEffect(() => {
    if (!id) return;

    const fetchStats = async () => {
      try {
        const response = await getUserStats(id);
        setData(response);
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    };

    fetchStats();
  }, [id]);
  const to24Bars = (hourlyBreakdown = {}) => {
    const arr = Array.from({ length: 24 }, (_, h) => ({ x: h, value: 0 }));
    Object.entries(hourlyBreakdown).forEach(([k, v]) => {
      const hour = parseInt(k.split("-").pop(), 10);
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        arr[hour].value += Number(v) || 0;
      }
    });
    return arr;
  };
  console.log("data", data);
  return (
    <div>
      <div className="border border-[#7E7E7E]  bg-white text-[15px] text-[#7E7E7E]">
        <h2 className="border-b p-5 border-b-[#CCCCCC] pb-2 ">
          General Stats
        </h2>
        <div className="space-y-1 p-5">
          {statsData.map((item, index) => (
            <p key={index}>
              <span className="">{item.label}:</span> <span>{item.value}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="py-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {Object.entries(data).map(([key, value]) => (
          <ChartCard
            key={key}
            title={formatTitle(key)}
            color="#25C396"
            hourlyBreakdown={to24Bars(value.hourly)}
            text={`This is the number of ${formatTitle(key)}.`}
          />
        ))}
      </div>
    </div>
  );
};

export default StatsTab;
