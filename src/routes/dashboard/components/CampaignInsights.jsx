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
import ICPInsights from "./ICPInsights";
import ProfileInsights from "./ProfileInsights";
import StatsCampaignsFilter from "../../../components/dashboard/StatsCampaignsFilter";

export default function CampaignInsights({ campaigns }) {
  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // format YYYY-MM-DD

  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split("T")[0];

  // real applied dates
  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);

  // temp dates for UI inputs
  const [tempDateFrom, setTempDateFrom] = useState(lastMonthStr);
  const [tempDateTo, setTempDateTo] = useState(todayStr);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEmailStats, setShowEmailStats] = useState(false);

  const [showCampaigns, setShowCampaigns] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const [campaignInsights, setCampaignInsights] = useState([]);

  useEffect(() => {
    const fetchCampaignInsights = async params => {
      const insights = await getInsights(params);
      setCampaignInsights(insights);
    };
    const params = {
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["insights", "latestMessages", "last24Actions"],
    };

    // If campaigns selected, add campaignIds param
    if (selectedCampaigns.length > 0) {
      params.campaignIds = selectedCampaigns.join(",");
    }

    console.log("fetching...");
    fetchCampaignInsights(params);
  }, [dateFrom, dateTo, selectedCampaigns]);

  console.log("stats..", campaignInsights);

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const toggleFilters = () => setShowFilters(!showFilters);
  const formattedDateRange = `${dateFrom} - ${dateTo}`;

  return (
    <>
      <div className="flex gap-3 mt-12 justify-end ">
        <div className="flex items-center bg-[#F1F1F1] border-[1px] border-[#0387FF] rounded-[4px]">
        <button
          onClick={() => {
            setShowEmailStats(false);
          }}
          className={`px-5 py-2 text-[12px] font-semibold cursor-pointer ${
            showEmailStats
              ? "text-[#0387FF] hover:bg-gray-100"
              : "bg-[#0387FF] text-white"
          }`}
        >
          LinkedIn Stats
        </button>
        <button
          onClick={() => {
            setShowEmailStats(true);
          }}
          className={`px-5 py-2 text-[12px] font-semibold cursor-pointer ${
            showEmailStats
              ? "bg-[#0387FF] text-white"
              : "text-[#0387FF] hover:bg-gray-100"
          }`}
        >
          Email Stats
        </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between mt-3">
        <h2 className="text-[28px] font-urbanist text-grey-medium font-medium ">
          CAMPAIGN INSIGHTS
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
                    value={tempDateFrom}
                    onChange={e => setTempDateFrom(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <label className="text-sm text-gray-600 mt-2">To:</label>
                  <input
                    type="date"
                    value={tempDateTo}
                    onChange={e => setTempDateTo(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      setDateFrom(tempDateFrom);
                      setDateTo(tempDateTo);
                      setShowDatePicker(false);
                    }}
                    className="mt-3 text-sm text-blues hover:underline self-end"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Campaign Dropdown */}
          <StatsCampaignsFilter
            campaigns={campaigns}
            selectedCampaigns={selectedCampaigns}
            setSelectedCampaigns={setSelectedCampaigns}
          />

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
      <div className="">
        {showEmailStats ? (
          <EmailStats />
        ) : (
          <LinkedInStats
            messages={campaignInsights?.latestMessages || []}
            insights={campaignInsights?.insights || []}
            last24Actions={campaignInsights?.last24Actions || []}
            selectedCampaigns={selectedCampaigns}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        )}
      </div>
    </>
  );
}
