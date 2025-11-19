import { useEffect, useState } from "react";
import { formatTimeAgo } from "../../../utils/stats-helper";
import PieChartCard from "./graph-cards/PieChartCard";
import { getInsights } from "../../../services/insights";

export function aggregateNetworkDistanceDistribution(data) {
  const stats = data || [];
  const totals = { "1st": 0, "2nd": 0, "3rd": 0 };

  for (const campaign of stats) {
    const profiles = campaign?.profiles || [];
    for (const p of profiles) {
      if (p.network_distance === 1) totals["1st"]++;
      else if (p.network_distance === 2) totals["2nd"]++;
      else if (p.network_distance === 3) totals["3rd"]++;
    }
  }

  return totals;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const NetworkDistributionStats = ({
  dateFrom,
  dateTo,
  selectedCampaigns,
  campaignsList,
}) => {
  const [networkDistributionStats, setNetworkDistributionStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Helper to build unique cache key (string)
  const getCacheKey = () => {
    const campaignKey =
      selectedCampaigns && selectedCampaigns.length > 0
        ? selectedCampaigns.join(",")
        : "all";
    return `networkDistributionStats_${dateFrom}_${dateTo}_${campaignKey}`;
  };

  useEffect(() => {
    const fetchNetworkDistributionStats = async params => {
      try {
        const cacheKey = getCacheKey();
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const now = Date.now();

          // use cache if valid
          if (now - parsed.timestamp < CACHE_TTL) {
            setNetworkDistributionStats(parsed.data);
            setLastUpdated(parsed.timestamp);
            setIsLoading(false);
            return;
          }
        }

        const insights = await getInsights(params);
        const data = insights?.networkDistributionStats || [];
        const timestamp = Date.now();

        setNetworkDistributionStats(data);
        setLastUpdated(timestamp);
        setIsLoading(false);

        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp }));
      } catch (err) {
        console.error("Error fetching network distribution stats:", err);
        setIsLoading(false);
      }
    };

    // Build params for API
    const params = {
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["networkDistributionStats"],
    };

    if (selectedCampaigns) {
      params.campaignIds = selectedCampaigns;
    }

    setIsLoading(true);
    fetchNetworkDistributionStats(params);
  }, [dateFrom, dateTo, selectedCampaigns.join(",")]);

  const totals = aggregateNetworkDistanceDistribution(
    networkDistributionStats,
  );
  const relativeLastUpdated = lastUpdated ? formatTimeAgo(lastUpdated) : null;

  // Loading State
  if (isLoading) {
    return (
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <div className="text-[16px] text-[#1E1D1D] p-4">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700 inline"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading... Please wait.
        </div>
      </div>
    );
  }

  // Render Pie Chart with Correct Totals
  return (
    <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
      <PieChartCard
        title="Network Distance Distribution"
        data={totals}
        colors={["#28F0E6", "#00B4D8", "#0096C7"]}
        tooltipText="This shows the distribution of your network connections across all created campaigns. It is divided into 1st, 2nd, and 3rd degree connections, so you can see how closely your outreach is connected to your network."
        lastUpdated={relativeLastUpdated}
      />
    </div>
  );
};

export default NetworkDistributionStats;
