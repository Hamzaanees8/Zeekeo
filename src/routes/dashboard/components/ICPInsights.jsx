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

export default function ICPInsights() {
  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // format YYYY-MM-DD

  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [icpInsights, setIcpInsights] = useState([]);

  console.log("stats..", icpInsights);

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const toggleFilters = () => setShowFilters(!showFilters);
  const formattedDateRange = `${dateFrom} - ${dateTo}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mt-12">
        <h2 className="text-[28px] font-urbanist text-grey-medium font-medium ">
          ICP INSIGHTS
        </h2>
        {/* Filter Controls */}
        <div className="flex  gap-3 mt-4 sm:mt-0 relative">
          {/* Date Range Display */}
          <div className="relative">
            <button
              onClick={toggleDatePicker}
              className="flex w-[267px] justify-between items-center rounded-[4px] border border-grey  px-3 py-2 bg-white"
            >
              <CalenderIcon className="w-4 h-4 mr-2" />
              <span className="text-grey-light text-[12px]">
                {formattedDateRange}
              </span>
              <DropArrowIcon className="w-3 h-3 ml-2" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 shadow-md p-4 z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">From:</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <label className="text-sm text-gray-600 mt-2">To:</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="mt-3 text-sm text-blues hover:underline self-end"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Download Button */}
          <button className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white">
            <DownloadIcon className="w-4 h-4" />
          </button>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={toggleFilters}
              className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white"
            >
              <FilterIcon className="w-4 h-4" />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10 p-3">
                <p className="text-sm text-gray-700 mb-2">
                  Filters coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graph Cards Section */}
      <div className="grid grid-cols-[1fr_1fr_2fr] gap-6 mt-6">
        {/* Column 1 - Title Distribution */}
        <div className="border border-[#7E7E7E] rounded-[8px] shadow-md">
          <HorizontalBarsFilledCard
            title="Title Distributions"
            tooltipText="This shows the percentage distribution across titles."
            data={[
              { label: "Founder & CEO", value: 30, color: "#04479C" },
              { label: "Co-Founder", value: 25 },
              { label: "Others", value: 45 },
            ]}
          />
        </div>

        {/* Column 2 - Stacked (Company Size + Industry) */}
        <div className="flex flex-col gap-6">
          <div className="border border-[#7E7E7E] rounded-[8px] shadow-md">
            <PieChartCard
              title="Company Size Distribution"
              percentList={[30, 25, 20, 15, 10]}
            />
          </div>
          <div className="border border-[#7E7E7E] rounded-[8px] shadow-md">
            <PieChartCard
              title="Industry Distribution"
              percentList={[40, 30, 20, 10]}
            />
          </div>
        </div>

        {/* Column 3 - Location (50% width) */}
        <div className="border border-[#7E7E7E] rounded-[8px] shadow-md">
          <LocationDistribution />
        </div>
      </div>
    </>
  );
}
