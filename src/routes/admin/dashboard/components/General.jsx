import React, { useEffect, useState } from "react";
import ChartCard from "../../components/ChartCard";
import { getGlobalStats } from "../../../../services/admin";

const General = ({ selected }) => {
  const [data, setData] = useState({});
  const [chartData, setChartData] = useState({});
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getGlobalStats();
        setData(response);
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    };

    fetchStats();
  }, []);
  useEffect(() => {
    if (!data) return;

    const processed = {};

    Object.entries(data).forEach(([key, value]) => {
      const entries = Object.entries(value.hourly)
        .map(([k, v]) => ({ datetime: k, value: Number(v) }))
        .sort(
          (a, b) =>
            new Date(a.datetime.replace(/-/g, "/")) -
            new Date(b.datetime.replace(/-/g, "/")),
        );

      if (selected === "24 Hours") {
        const last24 = entries.slice(-24);
        const chartArray = last24.map(({ datetime, value }) => ({
          x: datetime.split("-").pop(),
          value,
        }));
        processed[key] = chartArray;
      } else if (selected === "30 Days") {
        const dayMap = {};
        entries.forEach(({ datetime, value }) => {
          const day = datetime.split("-").slice(0, 3).join("-");
          dayMap[day] = (dayMap[day] || 0) + value;
        });

        const today = new Date();
        const chartArray = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dayStr = d.toISOString().split("T")[0];
          chartArray.push({ x: dayStr, value: dayMap[dayStr] || 0 });
        }
        processed[key] = chartArray;
      }
    });

    setChartData(processed);
  }, [data, selected]);
  const formatTitle = key => {
    return key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
  };
  console.log("Data", data);
  return (
    <div>
      <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {Object.entries(chartData).map(([key, value]) => (
          <ChartCard
            key={key}
            title={formatTitle(key)}
            color="#25C396"
            hourlyBreakdown={value}
            text={`This is the number of ${formatTitle(key)}.`}
          />
        ))}
      </div>
    </div>
  );
};

export default General;
