import PeriodCard from "../../dashboard/components/PeriodCard.jsx";
import MultiMetricChart from "../../../dashboard/components/graph-cards/MultiMetricChart.jsx";

const stats = [
  {
    label: "Messages Sent",
    value: 7016,
  },
  {
    label: "Sequences",
    value: 3662,
  },
];

const SplitedDashboard = ({ background, textColor }) => {
  return (
    <>
      <div
        className="px-[26px] border-b relative w-full h-full py-[20px]"
        style={{
          backgroundColor: background || "transparent",
        }}
      >
        <div className="flex flex-wrap items-center justify-between">
          <h1
            className="text-[44px] font-[300]"
            style={{ color: textColor || "#6D6D6D" }}
          >
            Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6">
          <PeriodCard title="Campaigns" value={32} change="+2%" />
        </div>

        <div className="mt-[48px] w-full overflow-hidden">
          <MultiMetricChart />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          {stats.map((stat, index) => (
            <PeriodCard
              key={index}
              title={stat.label}
              value={stat.value}
              percentage={stat.percentage}
              type="linkedin"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default SplitedDashboard;
