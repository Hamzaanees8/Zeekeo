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

export default function ProfileInsights() {
  const [profileInsights, setProfileInsights] = useState([]);

  console.log("stats..", profileInsights);
  const chartData = [];
  const sampleInsights = [
    {
      name: "John Doe",
      heading: "Senior Software Engineer",
      networkDistance: "2nd",
      profileImage: "https://via.placeholder.com/100",
    },
    {
      name: "Jane Smith",
      heading: "Marketing Specialist",
      networkDistance: "3rd",
      profileImage: "https://via.placeholder.com/100",
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mt-12">
        <h2 className="text-[28px] font-urbanist text-grey-medium font-medium ">
          PROFILE INSIGHTS
        </h2>
      </div>

      {/* Graph Cards Section */}
      <div className="grid grid-cols-6  gap-5 mt-6">
        {/* Column 1 - Title Distribution */}
        <div className="col-span-6  border border-[#7E7E7E] rounded-[8px] shadow-md">
          <ProfileViews data={chartData} />
        </div>
        <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
          <RecentProfileViewCard />
        </div>
        <div className="col-span-5  border border-[#7E7E7E] rounded-[8px] shadow-md">
          <InsightsDataTable data={sampleInsights} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Left Column (2fr) */}
        <div className="flex flex-col gap-6">
          {/* Row 1 - 2 small SSI rank cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-[#7E7E7E] rounded-[8px] shadow-md p-4 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="text-sm text-gray-500">Top</h4>
                <p className="text-sm text-gray-700">Industry SSI Rank</p>
              </div>
              <h1 className="text-2xl ">
                23
                <span className="text-lg">%</span>
              </h1>
            </div>
            <div className="border border-[#7E7E7E] rounded-[8px] shadow-md p-4 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="text-sm text-gray-500">Top</h4>
                <p className="text-sm text-gray-700">Network SSI Rank</p>
              </div>
              <h1 className="text-2xl ">
                2<span className="text-lg">%</span>
              </h1>
            </div>
          </div>

          {/* Row 2 - 2 charts adjacent */}
          <div className="grid grid-cols-2 gap-6 bg-white rounded-[8px] shadow-md">
            <SSIDataChartCard title="Current Social Selling Index" />
          </div>
        </div>

        {/* Right Column (1fr) */}
        <div className="flex flex-col gap-6">
          <div className="border border-[#7E7E7E] rounded-[8px] shadow-md bg-white">
            <PieChartCard
              title="Network Distant Distribution"
              percentList={[30, 15, 18, 15, 12, 10]}
            />
          </div>
          <div className="border border-[#7E7E7E] rounded-[8px] shadow-md bg-white">
            <PieChartCard
              title="Network Distant Distribution"
              percentList={[30, 15, 18, 15, 12, 10]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
