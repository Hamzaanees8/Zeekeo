import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import SSIDataChartCard from "./graph-cards/SSIDataChartCard";
import PeopleSSICard from "./graph-cards/PeopleSSICard";
import { getInsights } from "../../../services/insights";

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function buildSsiScoreStats(data) {
  // console.log("SSI Data:", data);
  if (!data || Object.keys(data).length === 0) {
    return {
      current_ssi: { overall: 0, sub_scores: [] },
      people_in_network: { overall: 0, sub_scores: [] },
      people_in_industry: { overall: 0, sub_scores: [] },
      industry_ssi_rank: 0,
      network_ssi_rank: 0,
    };
  }

  // console.log("Building SSI stats from data:", data);

  // Extract industry and network group scores
  const industryGroup = data.groupScore?.find(g => g.groupType === "INDUSTRY");
  const networkGroup = data.groupScore?.find(g => g.groupType === "NETWORK");

  const stats = {
    current_ssi: {
      overall: data.memberScore?.overall,
      sub_scores: data.memberScore?.subScores,
    },
    people_in_network: {
      overall: networkGroup?.score?.overall || 0,
      sub_scores: networkGroup?.score?.subScores || [],
    },
    people_in_industry: {
      overall: industryGroup?.score?.overall || 0,
      sub_scores: industryGroup?.score?.subScores || [],
    },
    industry_ssi_rank: industryGroup?.rank || 0,
    network_ssi_rank: networkGroup?.rank || 0,
  };

  // console.log("Built SSI stats:", stats);
  return stats;
}

export default function SocialSellingIndexStats() {
  const { ref, inView } = useInView({
    // Use the ref on the DOM element you want to observe
    triggerOnce: true, // Only trigger the fetch once when it enters the viewport
    threshold: 0.1, // Trigger when 10% of the element is visible
  });

  // Get today's date
  const today = new Date();

  // Get one week back
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const dateFrom = lastWeek.toISOString().split("T")[0];
  const dateTo = today.toISOString().split("T")[0]; // format YYYY-MM-DD

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [ssiScores, setSsiScores] = useState([]);

  useEffect(() => {
    if (!inView) {
      console.log("Component not yet in viewport. Skipping fetch.");
      return; // Skip the fetch if not in view
    }

    setIsLoading(true);
    
    const fetchSsiScores = async params => {
      try {
        const cacheKey = "ssiScores";
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const now = Date.now();

          // use cache if valid
          if (now - parsed.timestamp < CACHE_TTL) {
            setSsiScores(parsed.data);
            setLastUpdated(parsed.timestamp);
            setIsLoading(false);
            return;
          }
        }

        const insights = await getInsights(params);
        const data = insights?.ssiScores || [];
        const timestamp = Date.now();

        setSsiScores(data);
        setLastUpdated(timestamp);
        setIsLoading(false);

        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp }));
      } catch (err) {
        console.error("Error fetching ssi scores:", err);
        setIsLoading(false);
      }
    };

    // Build params for API
    const params = {
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["ssiScores"],
    };

    setIsLoading(true);
    fetchSsiScores(params);
  }, [inView]);

  const stats = buildSsiScoreStats(ssiScores);

  // Loading / Empty State
  if (isLoading) {
    return (
      <div className="col-span-5 row-span-1 h-48 flex items-center justify-center shadow-md">
        <div className="text-[16px] text-[#1E1D1D]">
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

  return (
    <>
      {/* SSI Section */}
      <div ref={ref} className="grid grid-cols-3 gap-6 mt-6">
        {/* Left Column - 2/3 width */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Row 1 - 2 small SSI rank cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-[#7E7E7E] rounded-[8px] shadow-md p-8 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="text-sm text-gray-500">Top</h4>
                <p className="text-sm text-gray-700">Industry SSI Rank</p>
              </div>
              <h1 className="text-2xl">
                {stats.industry_ssi_rank}
                <span className="text-lg">%</span>
              </h1>
            </div>
            <div className="border border-[#7E7E7E] rounded-[8px] shadow-md p-8 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="text-sm text-gray-500">Top</h4>
                <p className="text-sm text-gray-700">Network SSI Rank</p>
              </div>
              <h1 className="text-2xl">
                {stats.network_ssi_rank}
                <span className="text-lg">%</span>
              </h1>
            </div>
          </div>

          {/* Row 2 - Main SSI chart */}
          <div className="bg-white border border-[#7E7E7E] rounded-[8px] shadow-md">
            <SSIDataChartCard
              title="Current Social Selling Index"
              data={stats.current_ssi}
            />
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="col-span-1 flex flex-col gap-6">
          <PeopleSSICard
            title="People in your network"
            data={stats.people_in_network}
            rank={stats.network_ssi_rank}
          />
          <PeopleSSICard
            title="People in your industry"
            data={stats.people_in_industry}
            rank={stats.industry_ssi_rank}
          />
        </div>
      </div>
    </>
  );
}
