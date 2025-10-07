import React, { useState, useEffect } from "react";
import {
  CalenderIcon,
  DropArrowIcon,
  DownloadIcon,
  FilterIcon,
} from "../../../components/Icons";
import EmailStats from "./EmailStats";
import LinkedInStats from "./LinkedInStats";
import { getInsights } from "../../../services/insights";
import HorizontalBarsFilledCard from "./graph-cards/HorizontalBarsFilledCard";
import PieChartCard from "./graph-cards/PieChartCard";
import LocationDistribution from "./graph-cards/LocationDistribution";
import ComparisonChart from "./graph-cards/ComparisonChart";
import RecentProfileViewCard from "./graph-cards/RecentProfileViewCard";
import ProfileViews from "./graph-cards/ProfileViews";
import InsightsDataTable from "./InsightsDataTable";
import SSIDataChartCard from "./graph-cards/SSIDataChartCard";
import { getPreviousPeriod } from "../../../utils/stats-helper";
import PeopleSSICard from "./graph-cards/PeopleSSICard";

function buildPeriodProfileInsights(data) {
  if (!data || data.length === 0) {
    return { insights: {}, viewsTrend: [], recentProfiles: [] };
  }

  // ---- 1. Sort by date to get the latest ----
  const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest = sorted[sorted.length - 1].profile_insights;

   const latestDate = new Date(sorted[sorted.length - 1].date);

  // ---- 2. Find previous week entry ----
  const prevWeekDate = new Date(latestDate);
  prevWeekDate.setDate(latestDate.getDate() - 7);

  // find the nearest previous entry (before or equal to prevWeekDate)
  const prevWeekEntry =
    [...sorted].reverse().find(row => new Date(row.date) <= prevWeekDate)
      ?.profile_insights ?? sorted[0].profile_insights;


  // ---- 3. Compute change ----
  const computeChange = (latestScore, prevScore) =>
    prevScore ? ((latestScore - prevScore) / prevScore) * 100 : 0;

  const latestNetwork = latest.people_in_your_network.overall_score;
  const prevNetwork = prevWeekEntry.people_in_your_network.overall_score;
  const networkChange = computeChange(latestNetwork, prevNetwork);

  const latestIndustry = latest.people_in_your_industry.overall_score;
  const prevIndustry = prevWeekEntry.people_in_your_industry.overall_score;
  const industryChange = computeChange(latestIndustry, prevIndustry);


  // ---- 2. Extract SSI only from latest ----
  const insights = {
    current_ssi: {
      overall: latest.current_social_selling_index.overall_score,
      sub_scores: latest.current_social_selling_index.sub_scores,
    },
    people_in_network: {
      overall: latest.people_in_your_network.overall_score,
      sub_scores: latest.people_in_your_network.sub_scores,
      change: networkChange,
    },
    people_in_industry: {
      overall: latest.people_in_your_industry.overall_score,
      sub_scores: latest.people_in_your_industry.sub_scores,
      change: industryChange,
    },
    industry_ssi_rank: latest.industry_ssi_rank,
    network_ssi_rank: latest.network_ssi_rank,
  };

  // ---- 3. Views trend: accumulate all rows ----
  const viewsTrend = sorted.map(row => ({
    date: row.date,
    views: row.profile_insights.profile_views,
  }));

  // ---- 4. Collect all recent profiles from all rows ----
  const allProfiles = sorted.flatMap(
    row => row.profile_insights.recent_profile_views || [],
  );

  // ---- 5. Pick top 10 recent by viewed_at ----
  const recentProfiles = allProfiles
    .sort((a, b) => b.viewed_at - a.viewed_at)
    .slice(0, 10)
    .map(p => ({
      name: p.name?.trim(),
      headline: p.headline,
      network_distance: p.network_distance,
      profile_url: p.profile_url,
      profile_picture: p.profile_picture,
      viewed_at: new Date(p.viewed_at).toISOString(),
    }));

  return {
    insights,
    viewsTrend,
    recentProfiles,
    total_views: viewsTrend.reduce((sum, v) => sum + v.views, 0),
  };
}

export default function ProfileInsights() {
  // Get today's date
  const today = new Date();

  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const dateFrom = lastMonth.toISOString().split("T")[0];
  const dateTo = today.toISOString().split("T")[0]; // format YYYY-MM-DD

  const [insights, setInsights] = useState([]);
  
  useEffect(() => {
    const fetchProfileInsights = async params => {
      const insightsData = await getInsights(params);
      setInsights(insightsData?.insights);
    };
    const params = {
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["insights"],
    };

    console.log("fetching...");
    fetchProfileInsights(params);
  }, [dateFrom, dateTo]);

  console.log('insights...', insights)
  const currentInsights = buildPeriodProfileInsights(insights);

  console.log("profile insights", currentInsights);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mt-12">
        <h2 className="text-[28px] font-urbanist text-grey-medium font-medium ">
          PROFILE INSIGHTS
        </h2>
      </div>

      {/* Graph Cards Section */}
      <div className="grid grid-cols-6  gap-5 mt-6 ">
        {/* Column 1 - Title Distribution */}
        <div className="col-span-6  border border-[#7E7E7E] rounded-[8px] shadow-md">
          <ProfileViews
            views={currentInsights.viewsTrend}
            dateFrom={dateFrom}
            dateTo={dateTo}
            tooltipText="This shows the number of times your profile was viewed over time. It helps you understand how much visibility your outreach and activity are generating."
          />
        </div>
        <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
          <RecentProfileViewCard profiles={currentInsights?.recentProfiles} />
        </div>
        <div className="col-span-5  border border-[#7E7E7E] rounded-[8px] shadow-md">
          <InsightsDataTable data={currentInsights?.recentProfiles} />
        </div>
      </div>

      {/* SSI Section */}
      <div className="grid grid-cols-3 gap-6 mt-6">
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
                {currentInsights.insights.industry_ssi_rank}
                <span className="text-lg">%</span>
              </h1>
            </div>
            <div className="border border-[#7E7E7E] rounded-[8px] shadow-md p-8 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="text-sm text-gray-500">Top</h4>
                <p className="text-sm text-gray-700">Network SSI Rank</p>
              </div>
              <h1 className="text-2xl">
                {currentInsights.insights.network_ssi_rank}
                <span className="text-lg">%</span>
              </h1>
            </div>
          </div>

          {/* Row 2 - Main SSI chart */}
          <div className="bg-white border border-[#7E7E7E] rounded-[8px] shadow-md">
            <SSIDataChartCard
              title="Current Social Selling Index"
              data={currentInsights.insights.current_ssi}
            />
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="col-span-1 flex flex-col gap-6">
          <PeopleSSICard
            title="People in your network"
            data={currentInsights.insights.people_in_network}
            rank={currentInsights.insights.network_ssi_rank}
          />
          <PeopleSSICard
            title="People in your industry"
            data={currentInsights.insights.people_in_industry}
            rank={currentInsights.insights.industry_ssi_rank}
          />
        </div>
      </div>
    </>
  );
}
